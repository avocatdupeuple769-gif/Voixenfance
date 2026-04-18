import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface Report {
  id: string;
  trackingCode: string;
  reporterName: string;
  reporterAge: string;
  victimAge: string;
  abuseType: "sexual" | "violence" | "both";
  description: string;
  location: string;
  mediaUri?: string;
  mediaType?: "photo" | "video";
  submittedAt: string;
  status: "pending" | "reviewed" | "closed";
  adminNote?: string;
}

interface AppContextType {
  reports: Report[];
  addReport: (report: Omit<Report, "id" | "submittedAt" | "status" | "trackingCode">) => Promise<string>;
  updateReportStatus: (id: string, status: Report["status"], adminNote?: string) => Promise<void>;
  getReportByCode: (code: string) => Report | undefined;
  fetchReportByCode: (code: string) => Promise<Report | null>;
  isAdmin: boolean;
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  refreshReports: () => Promise<void>;
  sendAlarm: (message?: string) => Promise<{ sent: number; total: number }>;
  deviceCount: number;
}

const AppContext = createContext<AppContextType | null>(null);

const ADMIN_PASSWORD = "VoixEnfance2024!";
const TAP_UNLOCK_TOKEN = "__tap_unlock__";
const STORAGE_KEY = "@voixenfance_reports";
const EXPO_PROJECT_ID = "b6e193a6-f274-48a3-b936-fb6777afdfd6";

const API_BASE = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");

function generateTrackingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) code += "-";
  }
  return code;
}

async function apiPost(path: string, body: object, adminKey?: string): Promise<Response | null> {
  if (!API_BASE) return null;
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (adminKey) headers["x-admin-key"] = adminKey;
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    return res;
  } catch {
    return null;
  }
}

async function apiPatch(path: string, body: object): Promise<boolean> {
  if (!API_BASE) return false;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": ADMIN_PASSWORD,
      },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function apiFetch(path: string, adminKey?: string): Promise<Response | null> {
  if (!API_BASE) return null;
  try {
    const headers: Record<string, string> = {};
    if (adminKey) headers["x-admin-key"] = adminKey;
    const res = await fetch(`${API_BASE}${path}`, { headers });
    return res;
  } catch {
    return null;
  }
}

async function registerPushToken(): Promise<string | null> {
  if (Platform.OS === "web") return null;
  if (!Device.isDevice) return null;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return null;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("alarme", {
        name: "Alarmes VoixEnfance",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        sound: "default",
        enableVibrate: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
      });
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: EXPO_PROJECT_ID,
    });

    return token.data;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deviceCount, setDeviceCount] = useState(0);
  const notifListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    loadReports();
    setupNotifications();

    return () => {
      notifListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const setupNotifications = async () => {
    const token = await registerPushToken();
    if (token && API_BASE) {
      await apiPost("/push-tokens", { token });
    }

    notifListener.current = Notifications.addNotificationReceivedListener((notif) => {
      const data = notif.request.content.data as { type?: string };
      if (data?.type === "alarm") {
        Alert.alert(
          "🚨 ALERTE URGENCE",
          notif.request.content.body || "Un enfant a besoin d'aide. Contactez les autorités.",
          [{ text: "Compris", style: "destructive" }]
        );
      }
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {});
  };

  const loadReports = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setReports(JSON.parse(stored));
      }
    } catch {}
  };

  const saveLocal = async (newReports: Report[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newReports));
    } catch {}
  };

  const refreshReports = useCallback(async () => {
    if (!API_BASE) return;
    try {
      const res = await apiFetch("/reports", ADMIN_PASSWORD);
      if (res && res.ok) {
        const data = await res.json();
        const normalised: Report[] = data.map((r: any) => ({
          id: r.id,
          trackingCode: r.trackingCode || r.tracking_code,
          reporterName: r.reporterName || r.reporter_name,
          reporterAge: r.reporterAge || r.reporter_age || "",
          victimAge: r.victimAge || r.victim_age || "",
          abuseType: (r.abuseType || r.abuse_type || "sexual") as Report["abuseType"],
          description: r.description,
          location: r.location || "",
          mediaUri: r.mediaUri || r.media_uri,
          mediaType: (r.mediaType || r.media_type) as Report["mediaType"],
          submittedAt: typeof r.submittedAt === "string" ? r.submittedAt : new Date(r.submittedAt).toISOString(),
          status: (r.status || "pending") as Report["status"],
          adminNote: r.adminNote || r.admin_note,
        }));
        setReports(normalised);
        saveLocal(normalised);
      }

      const devRes = await apiFetch("/alarm/devices", ADMIN_PASSWORD);
      if (devRes && devRes.ok) {
        const devData = await devRes.json();
        setDeviceCount(devData.count || 0);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isAdmin) {
      refreshReports();
    }
  }, [isAdmin, refreshReports]);

  const addReport = async (
    reportData: Omit<Report, "id" | "submittedAt" | "status" | "trackingCode">
  ): Promise<string> => {
    const trackingCode = generateTrackingCode();
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const submittedAt = new Date().toISOString();

    const newReport: Report = {
      ...reportData,
      id,
      trackingCode,
      submittedAt,
      status: "pending",
    };

    const updated = [newReport, ...reports];
    setReports(updated);
    saveLocal(updated);

    await apiPost("/reports", {
      id,
      trackingCode,
      reporterName: reportData.reporterName,
      reporterAge: reportData.reporterAge,
      victimAge: reportData.victimAge,
      abuseType: reportData.abuseType,
      description: reportData.description,
      location: reportData.location,
      mediaUri: reportData.mediaUri,
      mediaType: reportData.mediaType,
      submittedAt,
    });

    return trackingCode;
  };

  const updateReportStatus = async (
    id: string,
    status: Report["status"],
    adminNote?: string
  ) => {
    const updated = reports.map((r) =>
      r.id === id ? { ...r, status, ...(adminNote !== undefined ? { adminNote } : {}) } : r
    );
    setReports(updated);
    saveLocal(updated);
    await apiPatch(`/reports/${id}/status`, { status, adminNote });
  };

  const getReportByCode = (code: string): Report | undefined => {
    return reports.find((r) => r.trackingCode.toLowerCase() === code.toLowerCase());
  };

  const fetchReportByCode = async (code: string): Promise<Report | null> => {
    const normalised = code.toUpperCase();
    const local = reports.find((r) => r.trackingCode.toLowerCase() === normalised.toLowerCase());
    if (local) return local;

    if (!API_BASE) return null;
    try {
      const res = await apiFetch(`/reports/code/${encodeURIComponent(normalised)}`);
      if (res && res.ok) {
        const data = await res.json();
        return {
          id: data.id,
          trackingCode: data.trackingCode,
          reporterName: "",
          reporterAge: "",
          victimAge: "",
          abuseType: data.abuseType as Report["abuseType"],
          description: "",
          location: "",
          submittedAt: data.submittedAt,
          status: data.status as Report["status"],
          adminNote: data.adminNote,
        };
      }
      return null;
    } catch {
      return null;
    }
  };

  const sendAlarm = async (message?: string): Promise<{ sent: number; total: number }> => {
    if (!API_BASE) return { sent: 0, total: 0 };
    try {
      const res = await apiPost("/alarm", { message }, ADMIN_PASSWORD);
      if (res && res.ok) {
        const data = await res.json();
        return { sent: data.sent || 0, total: data.total || 0 };
      }
    } catch {}
    return { sent: 0, total: 0 };
  };

  const adminLogin = (password: string): boolean => {
    if (password === ADMIN_PASSWORD || password === TAP_UNLOCK_TOKEN) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdmin(false);
  };

  return (
    <AppContext.Provider
      value={{
        reports,
        addReport,
        updateReportStatus,
        getReportByCode,
        fetchReportByCode,
        isAdmin,
        adminLogin,
        adminLogout,
        refreshReports,
        sendAlarm,
        deviceCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

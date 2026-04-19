import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

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
  refreshReports: () => Promise<{ newCount: number }>;
}

const AppContext = createContext<AppContextType | null>(null);

const ADMIN_PASSWORD = "VoixEnfance2024!";
const TAP_UNLOCK_TOKEN = "__tap_unlock__";
const STORAGE_KEY = "@voixenfance_reports";
const SEEN_IDS_KEY = "@voixenfance_seen_ids";

const HARDCODED_API = "https://8f21e1a5-ad38-45c5-a6a0-72627d76e9b8-00-wcwvkfi8xl4x.picard.replit.dev/api";
const API_BASE = (process.env.EXPO_PUBLIC_API_URL || HARDCODED_API).replace(/\/$/, "");

function generateTrackingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) code += "-";
  }
  return code;
}

async function apiPost(path: string, body: object): Promise<boolean> {
  if (!API_BASE) return false;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setReports(JSON.parse(stored));
    } catch {}
  };

  const saveLocal = async (newReports: Report[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newReports));
    } catch {}
  };

  const refreshReports = useCallback(async (): Promise<{ newCount: number }> => {
    if (!API_BASE) return { newCount: 0 };
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

        const seenRaw = await AsyncStorage.getItem(SEEN_IDS_KEY);
        const seenIds: string[] = seenRaw ? JSON.parse(seenRaw) : [];
        const newOnes = normalised.filter((r) => !seenIds.includes(r.id));
        const allIds = normalised.map((r) => r.id);
        await AsyncStorage.setItem(SEEN_IDS_KEY, JSON.stringify(allIds));

        setReports(normalised);
        saveLocal(normalised);
        return { newCount: newOnes.length };
      }
    } catch {}
    return { newCount: 0 };
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

  const adminLogin = (password: string): boolean => {
    if (password === ADMIN_PASSWORD || password === TAP_UNLOCK_TOKEN) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const adminLogout = () => setIsAdmin(false);

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

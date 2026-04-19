import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { MEDIA_BUCKET, REPORTS_BUCKET, SUPABASE_PUBLIC_URL, supabase } from "@/lib/supabase";

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
  addReport: (
    report: Omit<Report, "id" | "submittedAt" | "status" | "trackingCode">,
    mediaBase64?: string,
    mediaMimeType?: string
  ) => Promise<string>;
  updateReportStatus: (id: string, status: Report["status"], adminNote?: string) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
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
const LOCAL_CACHE_KEY = "@voixenfance_reports_v2";
const SEEN_IDS_KEY = "@voixenfance_seen_ids";

function generateTrackingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) code += "-";
  }
  return code;
}

async function uploadMedia(id: string, mediaBase64: string, mediaMimeType: string): Promise<string | null> {
  try {
    const ext = mediaMimeType.split("/")[1]?.split(";")[0] || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "mp4", "mov", "webm", "gif"].includes(ext) ? ext : "bin";
    const filename = `${id}.${safeExt}`;

    const dataUri = `data:${mediaMimeType};base64,${mediaBase64}`;
    const fetchRes = await fetch(dataUri);
    const blob = await fetchRes.blob();

    const { error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(filename, blob, { contentType: mediaMimeType, upsert: true });

    if (error) {
      console.warn("Erreur upload média:", error.message);
      return null;
    }

    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(filename);
    return data.publicUrl;
  } catch (e) {
    console.warn("Upload média échoué:", e);
    return null;
  }
}

async function saveReportToCloud(report: Report): Promise<boolean> {
  try {
    const json = JSON.stringify(report);
    // Use TextEncoder for proper UTF-8 (supports accents/French chars)
    const bytes = new TextEncoder().encode(json);
    const { error } = await supabase.storage
      .from(REPORTS_BUCKET)
      .upload(`${report.id}.json`, bytes, { contentType: "application/json", upsert: true });
    if (error) {
      console.warn("Erreur sauvegarde signalement:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("saveReportToCloud error:", e);
    return false;
  }
}

async function fetchAllReportsFromCloud(): Promise<Report[]> {
  try {
    const { data: files, error } = await supabase.storage
      .from(REPORTS_BUCKET)
      .list("", { limit: 1000, sortBy: { column: "created_at", order: "desc" } });

    if (error || !files) return [];

    const jsonFiles = files.filter((f) => f.name.endsWith(".json"));

    const results = await Promise.allSettled(
      jsonFiles.map(async (file) => {
        const { data, error: dlErr } = await supabase.storage
          .from(REPORTS_BUCKET)
          .download(file.name);
        if (dlErr || !data) return null;
        const text = await data.text();
        return JSON.parse(text) as Report;
      })
    );

    const reports: Report[] = [];
    for (const r of results) {
      if (r.status === "fulfilled" && r.value) reports.push(r.value);
    }

    return reports.sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  } catch (e) {
    console.warn("fetchAllReportsFromCloud error:", e);
    return [];
  }
}

async function deleteReportFromCloud(id: string): Promise<void> {
  try {
    await supabase.storage.from(REPORTS_BUCKET).remove([`${id}.json`]);
  } catch (e) {
    console.warn("deleteReportFromCloud error:", e);
  }
}

async function deleteMediaFromCloud(mediaUri: string): Promise<void> {
  try {
    if (!mediaUri.includes(SUPABASE_PUBLIC_URL)) return;
    const parts = mediaUri.split(`/${MEDIA_BUCKET}/`);
    if (parts.length > 1) {
      const filename = parts[1].split("?")[0];
      await supabase.storage.from(MEDIA_BUCKET).remove([filename]);
    }
  } catch {}
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadLocalCache();
  }, []);

  const loadLocalCache = async () => {
    try {
      const stored = await AsyncStorage.getItem(LOCAL_CACHE_KEY);
      if (stored) setReports(JSON.parse(stored));
    } catch {}
  };

  const saveLocalCache = async (newReports: Report[]) => {
    try {
      await AsyncStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(newReports));
    } catch {}
  };

  const refreshReports = useCallback(async (): Promise<{ newCount: number }> => {
    try {
      const cloudReports = await fetchAllReportsFromCloud();
      if (cloudReports.length === 0) return { newCount: 0 };

      const seenRaw = await AsyncStorage.getItem(SEEN_IDS_KEY);
      const seenIds: string[] = seenRaw ? JSON.parse(seenRaw) : [];
      const newOnes = cloudReports.filter((r) => !seenIds.includes(r.id));
      const allIds = cloudReports.map((r) => r.id);
      await AsyncStorage.setItem(SEEN_IDS_KEY, JSON.stringify(allIds));

      setReports(cloudReports);
      saveLocalCache(cloudReports);
      return { newCount: newOnes.length };
    } catch (e) {
      console.warn("refreshReports error:", e);
      return { newCount: 0 };
    }
  }, []);

  useEffect(() => {
    if (isAdmin) refreshReports();
  }, [isAdmin, refreshReports]);

  const addReport = async (
    reportData: Omit<Report, "id" | "submittedAt" | "status" | "trackingCode">,
    mediaBase64?: string,
    mediaMimeType?: string
  ): Promise<string> => {
    const trackingCode = generateTrackingCode();
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const submittedAt = new Date().toISOString();

    let mediaUri: string | undefined;
    let mediaType: "photo" | "video" | undefined;

    if (mediaBase64 && mediaMimeType) {
      const url = await uploadMedia(id, mediaBase64, mediaMimeType);
      if (url) {
        mediaUri = url;
        mediaType = mediaMimeType.startsWith("video") ? "video" : "photo";
      }
    }

    const newReport: Report = {
      ...reportData,
      id,
      trackingCode,
      submittedAt,
      status: "pending",
      mediaUri,
      mediaType,
    };

    const updated = [newReport, ...reports];
    setReports(updated);
    saveLocalCache(updated);

    // Await cloud save — if it fails, throw so the form can show an error
    const saved = await saveReportToCloud(newReport);
    if (!saved) {
      throw new Error("Impossible d'envoyer le signalement. Vérifiez votre connexion Internet.");
    }

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
    saveLocalCache(updated);

    const report = updated.find((r) => r.id === id);
    if (report) {
      await saveReportToCloud(report);
    }
  };

  const deleteReport = async (id: string) => {
    const report = reports.find((r) => r.id === id);
    const updated = reports.filter((r) => r.id !== id);
    setReports(updated);
    saveLocalCache(updated);

    await deleteReportFromCloud(id);
    if (report?.mediaUri) {
      await deleteMediaFromCloud(report.mediaUri);
    }
  };

  const getReportByCode = (code: string): Report | undefined =>
    reports.find((r) => r.trackingCode.toLowerCase() === code.toLowerCase());

  const fetchReportByCode = async (code: string): Promise<Report | null> => {
    return reports.find((r) => r.trackingCode.toLowerCase() === code.toLowerCase()) ?? null;
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
        deleteReport,
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

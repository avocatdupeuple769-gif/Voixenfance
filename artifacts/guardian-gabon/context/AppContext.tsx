import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  MEDIA_BUCKET,
  REPORTS_BUCKET,
  SUPABASE_SERVICE_KEY,
  SUPABASE_URL,
} from "@/lib/supabase";

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
const LOCAL_CACHE_KEY = "@voixenfance_reports_v3";
const SEEN_IDS_KEY = "@voixenfance_seen_ids_v3";

// ─── Supabase direct fetch helpers (bypass SDK, more reliable on Android) ───

function authHeaders() {
  return {
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    apikey: SUPABASE_SERVICE_KEY,
  };
}

/** Upload a JSON report file to Supabase Storage */
async function cloudUploadReport(report: Report): Promise<boolean> {
  try {
    const json = JSON.stringify(report);
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${REPORTS_BUCKET}/${report.id}.json`,
      {
        method: "POST",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
          "x-upsert": "true",
        },
        body: json,
      }
    );
    if (!res.ok) {
      // Try PUT if POST failed (upsert fallback)
      const res2 = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${REPORTS_BUCKET}/${report.id}.json`,
        {
          method: "PUT",
          headers: {
            ...authHeaders(),
            "Content-Type": "application/json",
            "x-upsert": "true",
          },
          body: json,
        }
      );
      if (!res2.ok) {
        const txt = await res2.text();
        console.warn("cloudUploadReport PUT failed:", res2.status, txt);
        return false;
      }
    }
    return true;
  } catch (e) {
    console.warn("cloudUploadReport error:", e);
    return false;
  }
}

/** List all report file names in the bucket */
async function cloudListReports(): Promise<string[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/list/${REPORTS_BUCKET}`,
      {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ prefix: "", limit: 1000 }),
      }
    );
    if (!res.ok) {
      console.warn("cloudListReports failed:", res.status, await res.text());
      return [];
    }
    const files: { name: string }[] = await res.json();
    return files.filter((f) => f.name.endsWith(".json")).map((f) => f.name);
  } catch (e) {
    console.warn("cloudListReports error:", e);
    return [];
  }
}

/** Download a single report via public URL (no auth needed for public buckets) */
async function cloudDownloadReport(filename: string): Promise<Report | null> {
  try {
    // Use public URL — works without authentication on public buckets
    const url = `${SUPABASE_URL}/storage/v1/object/public/${REPORTS_BUCKET}/${filename}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn("cloudDownloadReport failed:", res.status, filename);
      return null;
    }
    const text = await res.text();
    return JSON.parse(text) as Report;
  } catch (e) {
    console.warn("cloudDownloadReport error:", filename, e);
    return null;
  }
}

/** Delete report file from cloud */
async function cloudDeleteReport(id: string): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/storage/v1/object/${REPORTS_BUCKET}`, {
      method: "DELETE",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ prefixes: [`${id}.json`] }),
    });
  } catch (e) {
    console.warn("cloudDeleteReport error:", e);
  }
}

/** Upload media (base64) to Supabase Storage */
async function cloudUploadMedia(
  id: string,
  mediaBase64: string,
  mediaMimeType: string
): Promise<string | null> {
  try {
    const ext = mediaMimeType.split("/")[1]?.split(";")[0] || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "mp4", "mov", "webm", "gif"].includes(ext) ? ext : "bin";
    const filename = `${id}.${safeExt}`;

    // Convert base64 → binary
    const binaryStr = atob(mediaBase64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${MEDIA_BUCKET}/${filename}`,
      {
        method: "POST",
        headers: {
          ...authHeaders(),
          "Content-Type": mediaMimeType,
          "x-upsert": "true",
        },
        body: bytes,
      }
    );
    if (!res.ok) {
      console.warn("cloudUploadMedia failed:", res.status, await res.text());
      return null;
    }
    return `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${filename}`;
  } catch (e) {
    console.warn("cloudUploadMedia error:", e);
    return null;
  }
}

/** Delete media from cloud */
async function cloudDeleteMedia(mediaUri: string): Promise<void> {
  try {
    if (!mediaUri.includes(SUPABASE_URL)) return;
    const parts = mediaUri.split(`/${MEDIA_BUCKET}/`);
    if (parts.length < 2) return;
    const filename = parts[1].split("?")[0];
    await fetch(`${SUPABASE_URL}/storage/v1/object/${MEDIA_BUCKET}`, {
      method: "DELETE",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ prefixes: [filename] }),
    });
  } catch {}
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function generateTrackingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) code += "-";
  }
  return code;
}

// ─── Provider ────────────────────────────────────────────────────────────────

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
      // Step 1: get list of files
      const filenames = await cloudListReports();
      console.log(`[refresh] Fichiers trouvés dans Supabase: ${filenames.length}`);
      if (filenames.length === 0) return { newCount: 0 };

      // Step 2: download each file in parallel (via public URL)
      const settled = await Promise.allSettled(
        filenames.map((name) => cloudDownloadReport(name))
      );

      const cloudReports: Report[] = [];
      for (const r of settled) {
        if (r.status === "fulfilled" && r.value) cloudReports.push(r.value);
      }
      console.log(`[refresh] Signalements valides: ${cloudReports.length}/${filenames.length}`);

      if (cloudReports.length === 0) return { newCount: 0 };

      cloudReports.sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );

      // Count new
      const seenRaw = await AsyncStorage.getItem(SEEN_IDS_KEY);
      const seenIds: string[] = seenRaw ? JSON.parse(seenRaw) : [];
      const newOnes = cloudReports.filter((r) => !seenIds.includes(r.id));
      await AsyncStorage.setItem(SEEN_IDS_KEY, JSON.stringify(cloudReports.map((r) => r.id)));

      setReports(cloudReports);
      saveLocalCache(cloudReports);
      return { newCount: newOnes.length };
    } catch (e) {
      console.warn("[refresh] Erreur:", e);
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
    const id = `${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    const submittedAt = new Date().toISOString();

    let mediaUri: string | undefined;
    let mediaType: "photo" | "video" | undefined;

    if (mediaBase64 && mediaMimeType) {
      const url = await cloudUploadMedia(id, mediaBase64, mediaMimeType);
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

    // Save to cloud first — throw if it fails so the user sees the error
    const saved = await cloudUploadReport(newReport);
    if (!saved) {
      throw new Error(
        "Impossible d'envoyer le signalement. Vérifiez votre connexion Internet et réessayez."
      );
    }

    // Update local state after successful cloud save
    const updated = [newReport, ...reports];
    setReports(updated);
    saveLocalCache(updated);

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
    if (report) await cloudUploadReport(report);
  };

  const deleteReport = async (id: string) => {
    const report = reports.find((r) => r.id === id);
    const updated = reports.filter((r) => r.id !== id);
    setReports(updated);
    saveLocalCache(updated);

    await cloudDeleteReport(id);
    if (report?.mediaUri) await cloudDeleteMedia(report.mediaUri);
  };

  const getReportByCode = (code: string): Report | undefined =>
    reports.find((r) => r.trackingCode.toLowerCase() === code.toLowerCase());

  const fetchReportByCode = async (code: string): Promise<Report | null> =>
    reports.find((r) => r.trackingCode.toLowerCase() === code.toLowerCase()) ?? null;

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

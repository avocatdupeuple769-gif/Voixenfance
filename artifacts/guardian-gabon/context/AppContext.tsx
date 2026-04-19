import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
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
    report: Omit<Report, "id" | "submittedAt" | "status" | "trackingCode" | "mediaUri" | "mediaType">,
    localMediaUri?: string,
    mediaMimeType?: string,
    mediaType?: "photo" | "video"
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
const LOCAL_CACHE_KEY = "@voixenfance_reports_v4";
const SEEN_IDS_KEY = "@voixenfance_seen_ids_v4";

// ─── Supabase direct fetch helpers ───────────────────────────────────────────

function authHeaders() {
  return {
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    apikey: SUPABASE_SERVICE_KEY,
  };
}

/** Upload report JSON using direct fetch (POST with text body) */
async function cloudUploadReport(report: Report): Promise<boolean> {
  try {
    const json = JSON.stringify(report);
    const url = `${SUPABASE_URL}/storage/v1/object/${REPORTS_BUCKET}/${report.id}.json`;

    const res = await fetch(url, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json", "x-upsert": "true" },
      body: json,
    });

    if (!res.ok) {
      // Retry with PUT
      const res2 = await fetch(url, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json", "x-upsert": "true" },
        body: json,
      });
      if (!res2.ok) {
        console.warn("cloudUploadReport failed:", res2.status, await res2.text());
        return false;
      }
    }
    return true;
  } catch (e) {
    console.warn("cloudUploadReport error:", e);
    return false;
  }
}

/**
 * Upload media using multiple fallback methods for maximum Android compatibility.
 * Method 1: FileSystem.readAsStringAsync (base64) + fetch binary body
 * Method 2: FileSystem.uploadAsync (BINARY_CONTENT)
 * Method 3: fetch(localUri) blob fallback
 */
async function cloudUploadMedia(
  id: string,
  localUri: string,
  mimeType: string
): Promise<string | null> {
  const ext = (() => {
    const raw = mimeType.split("/")[1]?.split(";")[0]?.toLowerCase() || "jpg";
    if (["jpg", "jpeg", "png", "mp4", "mov", "webm", "gif", "heic", "heif"].includes(raw)) return raw;
    return mimeType.startsWith("video") ? "mp4" : "jpg";
  })();
  const filename = `${id}.${ext}`;
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${MEDIA_BUCKET}/${filename}`;
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${filename}`;
  const hdrs = { ...authHeaders(), "Content-Type": mimeType, "x-upsert": "true" };

  // ── Method 1: base64 read → decode → fetch binary ────────────────────────
  try {
    console.log("[media] Method 1: readAsStringAsync base64...");
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    // Decode base64 in chunks to avoid stack overflow on large files
    const byteCount = Math.floor((base64.length * 3) / 4);
    const bytes = new Uint8Array(byteCount);
    let byteIdx = 0;
    const CHUNK = 1024;
    for (let i = 0; i < base64.length; i += CHUNK) {
      const chunk = base64.slice(i, i + CHUNK);
      const decoded = atob(chunk);
      for (let j = 0; j < decoded.length; j++) {
        if (byteIdx < byteCount) bytes[byteIdx++] = decoded.charCodeAt(j);
      }
    }
    const res = await fetch(uploadUrl, { method: "POST", headers: hdrs, body: bytes });
    if (res.ok) { console.log("[media] Method 1 success"); return publicUrl; }
    const errText = await res.text();
    console.warn("[media] Method 1 POST failed:", res.status, errText);
    // Try PUT (upsert)
    const res2 = await fetch(uploadUrl, { method: "PUT", headers: hdrs, body: bytes });
    if (res2.ok) { console.log("[media] Method 1 PUT success"); return publicUrl; }
    console.warn("[media] Method 1 PUT failed:", res2.status, await res2.text());
  } catch (e) {
    console.warn("[media] Method 1 error:", e);
  }

  // ── Method 2: FileSystem.uploadAsync ─────────────────────────────────────
  try {
    console.log("[media] Method 2: FileSystem.uploadAsync...");
    const r = await FileSystem.uploadAsync(uploadUrl, localUri, {
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      httpMethod: "POST",
      headers: hdrs,
    });
    if (r.status >= 200 && r.status < 300) { console.log("[media] Method 2 success"); return publicUrl; }
    console.warn("[media] Method 2 failed:", r.status, r.body?.substring(0, 100));
  } catch (e) {
    console.warn("[media] Method 2 error:", e);
  }

  // ── Method 3: fetch blob ──────────────────────────────────────────────────
  try {
    console.log("[media] Method 3: fetch blob...");
    const fileRes = await fetch(localUri);
    const blob = await fileRes.blob();
    const res = await fetch(uploadUrl, { method: "POST", headers: hdrs, body: blob });
    if (res.ok) { console.log("[media] Method 3 success"); return publicUrl; }
    console.warn("[media] Method 3 failed:", res.status, await res.text());
  } catch (e) {
    console.warn("[media] Method 3 error:", e);
  }

  console.warn("[media] All methods failed for:", localUri);
  return null;
}

/** List all report filenames from cloud */
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
    const names = files.filter((f) => f.name.endsWith(".json")).map((f) => f.name);
    console.log(`[list] Found ${names.length} reports in cloud`);
    return names;
  } catch (e) {
    console.warn("cloudListReports error:", e);
    return [];
  }
}

/** Download a single report via public URL (no auth needed) */
async function cloudDownloadReport(filename: string): Promise<Report | null> {
  try {
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
      const filenames = await cloudListReports();
      if (filenames.length === 0) return { newCount: 0 };

      const settled = await Promise.allSettled(
        filenames.map((name) => cloudDownloadReport(name))
      );

      const cloudReports: Report[] = [];
      for (const r of settled) {
        if (r.status === "fulfilled" && r.value) cloudReports.push(r.value);
      }
      console.log(`[refresh] ${cloudReports.length}/${filenames.length} reports loaded`);

      if (cloudReports.length === 0) return { newCount: 0 };

      cloudReports.sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );

      const seenRaw = await AsyncStorage.getItem(SEEN_IDS_KEY);
      const seenIds: string[] = seenRaw ? JSON.parse(seenRaw) : [];
      const newOnes = cloudReports.filter((r) => !seenIds.includes(r.id));
      await AsyncStorage.setItem(SEEN_IDS_KEY, JSON.stringify(cloudReports.map((r) => r.id)));

      setReports(cloudReports);
      saveLocalCache(cloudReports);
      return { newCount: newOnes.length };
    } catch (e) {
      console.warn("[refresh] Error:", e);
      return { newCount: 0 };
    }
  }, []);

  useEffect(() => {
    if (isAdmin) refreshReports();
  }, [isAdmin, refreshReports]);

  const addReport = async (
    reportData: Omit<Report, "id" | "submittedAt" | "status" | "trackingCode" | "mediaUri" | "mediaType">,
    localMediaUri?: string,
    mediaMimeType?: string,
    mediaType?: "photo" | "video"
  ): Promise<string> => {
    const trackingCode = generateTrackingCode();
    const id = `${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    const submittedAt = new Date().toISOString();

    // Upload media first if provided
    let cloudMediaUri: string | undefined;
    let finalMediaType: "photo" | "video" | undefined = mediaType;

    if (localMediaUri && mediaMimeType) {
      console.log("[addReport] Uploading media...", localMediaUri, mediaMimeType);
      const url = await cloudUploadMedia(id, localMediaUri, mediaMimeType);
      if (url) {
        cloudMediaUri = url;
        console.log("[addReport] Media uploaded:", cloudMediaUri);
      } else {
        console.warn("[addReport] Media upload failed — continuing without media");
        // Don't block the report submission for media failure
      }
    }

    const newReport: Report = {
      ...reportData,
      id,
      trackingCode,
      submittedAt,
      status: "pending",
      mediaUri: cloudMediaUri,
      mediaType: cloudMediaUri ? finalMediaType : undefined,
    };

    // Upload report JSON — throw if it fails
    const saved = await cloudUploadReport(newReport);
    if (!saved) {
      throw new Error(
        "Impossible d'envoyer le signalement. Vérifiez votre connexion Internet et réessayez."
      );
    }

    // Update local state
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

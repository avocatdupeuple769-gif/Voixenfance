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
  abuseType: "sexual" | "violence" | "both" | "inceste" | "attouchements" | "disparition";
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
const LOCAL_CACHE_KEY = "@ailesdebridge_reports_v1";
const SEEN_IDS_KEY = "@ailesdebridge_seen_ids_v1";

function generateTrackingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "ADB-";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function uploadMedia(
  localUri: string,
  mimeType: string,
  fileName: string
): Promise<string | null> {
  const ext = localUri.split(".").pop()?.toLowerCase() ?? "bin";
  const detectedMime =
    mimeType ||
    (ext === "jpg" || ext === "jpeg"
      ? "image/jpeg"
      : ext === "png"
        ? "image/png"
        : ext === "mp4"
          ? "video/mp4"
          : ext === "mov"
            ? "video/quicktime"
            : ext === "gif"
              ? "image/gif"
              : ext === "webp"
                ? "image/webp"
                : "application/octet-stream");

  const storagePath = `${fileName}`;

  try {
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: detectedMime });

    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${MEDIA_BUCKET}/${storagePath}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          "Content-Type": detectedMime,
          "x-upsert": "true",
        },
        body: blob,
      }
    );

    if (res.ok) {
      return `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${storagePath}`;
    }
  } catch {
  }

  try {
    const uploadResult = await FileSystem.uploadAsync(
      `${SUPABASE_URL}/storage/v1/object/${MEDIA_BUCKET}/${storagePath}`,
      localUri,
      {
        httpMethod: "POST",
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          "Content-Type": detectedMime,
          "x-upsert": "true",
        },
      }
    );
    if (uploadResult.status >= 200 && uploadResult.status < 300) {
      return `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${storagePath}`;
    }
  } catch {
  }

  try {
    const fetchRes = await fetch(localUri);
    const blob = await fetchRes.blob();
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${MEDIA_BUCKET}/${storagePath}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          "Content-Type": detectedMime,
          "x-upsert": "true",
        },
        body: blob,
      }
    );
    if (res.ok) {
      return `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${storagePath}`;
    }
  } catch {
  }

  return null;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadFromCache = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(LOCAL_CACHE_KEY);
      if (raw) setReports(JSON.parse(raw));
    } catch {}
  }, []);

  const saveToCache = useCallback(async (data: Report[]) => {
    try {
      await AsyncStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(data));
    } catch {}
  }, []);

  useEffect(() => {
    loadFromCache();
  }, [loadFromCache]);

  const refreshReports = useCallback(async (): Promise<{ newCount: number }> => {
    try {
      const listRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/list/${REPORTS_BUCKET}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ limit: 1000, offset: 0, prefix: "" }),
        }
      );
      if (!listRes.ok) return { newCount: 0 };
      const files: Array<{ name: string }> = await listRes.json();
      if (!Array.isArray(files)) return { newCount: 0 };

      const seenRaw = await AsyncStorage.getItem(SEEN_IDS_KEY);
      const seenIds: string[] = seenRaw ? JSON.parse(seenRaw) : [];

      const fetched: Report[] = [];
      await Promise.all(
        files
          .filter((f) => f.name.endsWith(".json"))
          .map(async (f) => {
            try {
              const r = await fetch(
                `${SUPABASE_URL}/storage/v1/object/${REPORTS_BUCKET}/${f.name}`,
                {
                  headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` },
                }
              );
              if (r.ok) {
                const data: Report = await r.json();
                fetched.push(data);
              }
            } catch {}
          })
      );

      fetched.sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );

      const newIds = fetched
        .filter((r) => !seenIds.includes(r.id))
        .map((r) => r.id);
      const newCount = newIds.length;

      const allSeen = Array.from(new Set([...seenIds, ...newIds]));
      await AsyncStorage.setItem(SEEN_IDS_KEY, JSON.stringify(allSeen));

      setReports(fetched);
      await saveToCache(fetched);
      return { newCount };
    } catch {
      return { newCount: 0 };
    }
  }, [saveToCache]);

  const addReport = useCallback(
    async (
      reportData: Omit<
        Report,
        "id" | "submittedAt" | "status" | "trackingCode" | "mediaUri" | "mediaType"
      >,
      localMediaUri?: string,
      mediaMimeType?: string,
      mediaType?: "photo" | "video"
    ): Promise<string> => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const trackingCode = generateTrackingCode();

      let remoteMediaUrl: string | undefined;
      if (localMediaUri && mediaMimeType) {
        const ext = localMediaUri.split(".").pop() ?? "bin";
        const fileName = `${id}.${ext}`;
        const url = await uploadMedia(localMediaUri, mediaMimeType, fileName);
        if (url) remoteMediaUrl = url;
      }

      const report: Report = {
        ...reportData,
        id,
        trackingCode,
        submittedAt: new Date().toISOString(),
        status: "pending",
        ...(remoteMediaUrl ? { mediaUri: remoteMediaUrl, mediaType } : {}),
      };

      const res = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${REPORTS_BUCKET}/${id}.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            "Content-Type": "application/json",
            "x-upsert": "true",
          },
          body: JSON.stringify(report),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Erreur serveur: ${err}`);
      }

      const updated = [report, ...reports];
      setReports(updated);
      await saveToCache(updated);
      return trackingCode;
    },
    [reports, saveToCache]
  );

  const updateReportStatus = useCallback(
    async (id: string, status: Report["status"], adminNote?: string) => {
      const existing = reports.find((r) => r.id === id);
      if (!existing) return;

      const updated: Report = { ...existing, status, ...(adminNote !== undefined ? { adminNote } : {}) };

      const res = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${REPORTS_BUCKET}/${id}.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            "Content-Type": "application/json",
            "x-upsert": "true",
          },
          body: JSON.stringify(updated),
        }
      );

      if (!res.ok) throw new Error("Impossible de mettre à jour le statut");

      const newReports = reports.map((r) => (r.id === id ? updated : r));
      setReports(newReports);
      await saveToCache(newReports);
    },
    [reports, saveToCache]
  );

  const deleteReport = useCallback(
    async (id: string) => {
      const res = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${REPORTS_BUCKET}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prefixes: [`${id}.json`] }),
        }
      );

      if (!res.ok) throw new Error("Impossible de supprimer le signalement");

      const newReports = reports.filter((r) => r.id !== id);
      setReports(newReports);
      await saveToCache(newReports);
    },
    [reports, saveToCache]
  );

  const getReportByCode = useCallback(
    (code: string) => reports.find((r) => r.trackingCode === code),
    [reports]
  );

  const fetchReportByCode = useCallback(async (code: string): Promise<Report | null> => {
    const local = reports.find((r) => r.trackingCode === code);
    if (local) return local;
    try {
      const { newCount } = await refreshReports();
      void newCount;
      const fresh = reports.find((r) => r.trackingCode === code);
      return fresh ?? null;
    } catch {
      return null;
    }
  }, [reports, refreshReports]);

  const adminLogin = useCallback((password: string): boolean => {
    if (password === ADMIN_PASSWORD || password === TAP_UNLOCK_TOKEN) {
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => setIsAdmin(false), []);

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

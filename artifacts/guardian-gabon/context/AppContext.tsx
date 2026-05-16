import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  FIREBASE_API_KEY,
  FIREBASE_STORAGE_BUCKET,
  dbDelete,
  dbGet,
  dbPatch,
  dbSet,
  storagePublicUrl,
  storageUploadUrl,
} from "@/lib/firebase";

export interface Report {
  id: string;
  trackingCode: string;
  reporterName: string;
  reporterAge: string;
  victimAge: string;
  abuseType:
    | "sexual"
    | "violence"
    | "both"
    | "inceste"
    | "attouchements"
    | "disparition";
  description: string;
  location: string;
  mediaUri?: string;
  mediaType?: "photo" | "video";
  submittedAt: string;
  status: "pending" | "reviewed" | "closed";
  adminNote?: string;
  _localOnly?: boolean;
}

interface AppContextType {
  reports: Report[];
  addReport: (
    report: Omit<
      Report,
      | "id"
      | "submittedAt"
      | "status"
      | "trackingCode"
      | "mediaUri"
      | "mediaType"
      | "_localOnly"
    >,
    localMediaUri?: string,
    mediaMimeType?: string,
    mediaType?: "photo" | "video"
  ) => Promise<string>;
  updateReportStatus: (
    id: string,
    status: Report["status"],
    adminNote?: string
  ) => Promise<void>;
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
const PENDING_KEY = "@ailesdebridge_pending_v1";

function generateTrackingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "ADB-";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function getMimeFromUri(uri: string, fallback: string): string {
  const ext = uri.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    heic: "image/heic",
    heif: "image/heic",
    gif: "image/gif",
    webp: "image/webp",
    mp4: "video/mp4",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    mkv: "video/x-matroska",
  };
  return map[ext] || fallback || "application/octet-stream";
}

/**
 * Upload media to Firebase Storage.
 * Uses FileSystem.uploadAsync (binary stream) first — no base64 OOM risk.
 * Falls back to blob fetch, then skips silently if all fail.
 */
async function uploadMedia(
  localUri: string,
  mimeType: string,
  fileName: string
): Promise<string | null> {
  const detectedMime = getMimeFromUri(localUri, mimeType);
  const storagePath = `media/${fileName}`;
  const uploadUrl = storageUploadUrl(storagePath);

  // Method 1 — binary stream (most efficient, no memory spike)
  try {
    const result = await FileSystem.uploadAsync(uploadUrl, localUri, {
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: { "Content-Type": detectedMime },
    });
    if (result.status >= 200 && result.status < 300) {
      return storagePublicUrl(storagePath);
    }
  } catch {
    /* fall through */
  }

  // Method 2 — blob fetch (works when localUri is network-accessible)
  try {
    const blobRes = await fetch(localUri);
    const blob = await blobRes.blob();
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": detectedMime },
      body: blob,
    });
    if (res.ok) return storagePublicUrl(storagePath);
  } catch {
    /* fall through */
  }

  // Method 3 — base64 (last resort, may fail on large files)
  try {
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: detectedMime });
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": detectedMime },
      body: blob,
    });
    if (res.ok) return storagePublicUrl(storagePath);
  } catch {
    /* give up */
  }

  return null;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const saveToCache = useCallback(async (data: Report[]) => {
    try {
      await AsyncStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(data));
    } catch {}
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(LOCAL_CACHE_KEY);
        if (raw) setReports(JSON.parse(raw));
      } catch {}
      retryPending();
    })();
  }, []);

  /** Re-upload reports that failed when there was no internet */
  const retryPending = async () => {
    try {
      const raw = await AsyncStorage.getItem(PENDING_KEY);
      if (!raw) return;
      const pending: Report[] = JSON.parse(raw);
      if (!pending.length) return;

      const stillPending: Report[] = [];
      for (const report of pending) {
        const ok = await dbSet(`reports/${report.id}`, report);
        if (!ok) stillPending.push(report);
      }
      await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(stillPending));
    } catch {}
  };

  const refreshReports = useCallback(async (): Promise<{ newCount: number }> => {
    try {
      const data = await dbGet<Record<string, Report>>("reports");
      if (!data || typeof data !== "object") return { newCount: 0 };

      const fetched = Object.values(data).sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );

      const seenRaw = await AsyncStorage.getItem(SEEN_IDS_KEY);
      const seenIds: string[] = seenRaw ? JSON.parse(seenRaw) : [];
      const newIds = fetched
        .filter((r) => !seenIds.includes(r.id))
        .map((r) => r.id);

      await AsyncStorage.setItem(
        SEEN_IDS_KEY,
        JSON.stringify([...seenIds, ...newIds])
      );
      setReports(fetched);
      await saveToCache(fetched);
      return { newCount: newIds.length };
    } catch {
      return { newCount: 0 };
    }
  }, [saveToCache]);

  const addReport = useCallback(
    async (
      reportData: Omit<
        Report,
        | "id"
        | "submittedAt"
        | "status"
        | "trackingCode"
        | "mediaUri"
        | "mediaType"
        | "_localOnly"
      >,
      localMediaUri?: string,
      mediaMimeType?: string,
      mediaType?: "photo" | "video"
    ): Promise<string> => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const trackingCode = generateTrackingCode();

      // Upload media first (non-blocking — failure does NOT abort the report)
      let remoteMediaUrl: string | undefined;
      if (localMediaUri) {
        const mime = getMimeFromUri(
          localMediaUri,
          mediaMimeType ?? "application/octet-stream"
        );
        const ext =
          localMediaUri.split("?")[0].split(".").pop() ?? "bin";
        const url = await uploadMedia(localMediaUri, mime, `${id}.${ext}`);
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

      // Save to Firebase Realtime Database
      const uploaded = await dbSet(`reports/${id}`, report);

      if (!uploaded) {
        // Save locally and retry next launch
        try {
          const raw = await AsyncStorage.getItem(PENDING_KEY);
          const pending: Report[] = raw ? JSON.parse(raw) : [];
          pending.push({ ...report, _localOnly: true });
          await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending));
        } catch {}

        const updated = [{ ...report, _localOnly: true }, ...reports];
        setReports(updated);
        await saveToCache(updated);

        throw new Error(
          "Connexion au serveur impossible.\n\nVotre signalement a été sauvegardé sur votre téléphone et sera envoyé automatiquement dès que la connexion sera rétablie."
        );
      }

      const updated = [report, ...reports];
      setReports(updated);
      await saveToCache(updated);
      return trackingCode;
    },
    [reports, saveToCache]
  );

  const updateReportStatus = useCallback(
    async (
      id: string,
      status: Report["status"],
      adminNote?: string
    ) => {
      const patch: Partial<Report> = {
        status,
        ...(adminNote !== undefined ? { adminNote } : {}),
      };
      const ok = await dbPatch(`reports/${id}`, patch);
      if (!ok) throw new Error("Impossible de mettre à jour le statut");

      const newReports = reports.map((r) =>
        r.id === id ? { ...r, ...patch } : r
      );
      setReports(newReports);
      await saveToCache(newReports);
    },
    [reports, saveToCache]
  );

  const deleteReport = useCallback(
    async (id: string) => {
      const ok = await dbDelete(`reports/${id}`);
      if (!ok) throw new Error("Impossible de supprimer le signalement");

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

  const fetchReportByCode = useCallback(
    async (code: string): Promise<Report | null> => {
      const local = reports.find((r) => r.trackingCode === code);
      if (local) return local;
      await refreshReports();
      return reports.find((r) => r.trackingCode === code) ?? null;
    },
    [reports, refreshReports]
  );

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

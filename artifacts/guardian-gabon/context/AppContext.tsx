import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { MEDIA_BUCKET, SUPABASE_PUBLIC_URL, supabase } from "@/lib/supabase";

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
const STORAGE_KEY = "@voixenfance_reports";
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

function mapRow(r: any): Report {
  return {
    id: r.id,
    trackingCode: r.tracking_code || "",
    reporterName: r.reporter_name || "",
    reporterAge: r.reporter_age || "",
    victimAge: r.victim_age || "",
    abuseType: (r.abuse_type || "sexual") as Report["abuseType"],
    description: r.description || "",
    location: r.location || "",
    mediaUri: r.media_url || undefined,
    mediaType: (r.media_type || undefined) as Report["mediaType"],
    submittedAt: r.submitted_at || new Date().toISOString(),
    status: (r.status || "pending") as Report["status"],
    adminNote: r.admin_note || undefined,
  };
}

async function uploadMedia(
  id: string,
  mediaBase64: string,
  mediaMimeType: string
): Promise<string | null> {
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadLocalReports();
  }, []);

  const loadLocalReports = async () => {
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
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (error) {
        console.warn("Erreur chargement signalements:", error.message);
        return { newCount: 0 };
      }

      const normalised: Report[] = (data || []).map(mapRow);

      const seenRaw = await AsyncStorage.getItem(SEEN_IDS_KEY);
      const seenIds: string[] = seenRaw ? JSON.parse(seenRaw) : [];
      const newOnes = normalised.filter((r) => !seenIds.includes(r.id));
      const allIds = normalised.map((r) => r.id);
      await AsyncStorage.setItem(SEEN_IDS_KEY, JSON.stringify(allIds));

      setReports(normalised);
      saveLocal(normalised);
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

    let mediaUrl: string | null = null;
    let mediaType: string | null = null;

    if (mediaBase64 && mediaMimeType) {
      mediaUrl = await uploadMedia(id, mediaBase64, mediaMimeType);
      if (mediaUrl) {
        mediaType = mediaMimeType.startsWith("video") ? "video" : "photo";
      }
    }

    const newReport: Report = {
      ...reportData,
      id,
      trackingCode,
      submittedAt,
      status: "pending",
      mediaUri: mediaUrl || undefined,
      mediaType: (mediaType || undefined) as Report["mediaType"],
    };

    const updated = [newReport, ...reports];
    setReports(updated);
    saveLocal(updated);

    const { error } = await supabase.from("reports").insert({
      id,
      tracking_code: trackingCode,
      reporter_name: reportData.reporterName,
      reporter_age: reportData.reporterAge || "",
      victim_age: reportData.victimAge || "",
      abuse_type: reportData.abuseType || "sexual",
      description: reportData.description,
      location: reportData.location || "",
      media_url: mediaUrl,
      media_type: mediaType,
      status: "pending",
      submitted_at: submittedAt,
      updated_at: submittedAt,
    });

    if (error) {
      console.warn("Erreur insertion signalement:", error.message);
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
    saveLocal(updated);

    const { error } = await supabase
      .from("reports")
      .update({
        status,
        admin_note: adminNote ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) console.warn("Erreur mise à jour statut:", error.message);
  };

  const deleteReport = async (id: string) => {
    const report = reports.find((r) => r.id === id);

    const updated = reports.filter((r) => r.id !== id);
    setReports(updated);
    saveLocal(updated);

    if (report?.mediaUri && report.mediaUri.includes(SUPABASE_PUBLIC_URL)) {
      try {
        const parts = report.mediaUri.split(`/${MEDIA_BUCKET}/`);
        if (parts.length > 1) {
          const filename = parts[1].split("?")[0];
          await supabase.storage.from(MEDIA_BUCKET).remove([filename]);
        }
      } catch {}
    }

    const { error } = await supabase.from("reports").delete().eq("id", id);
    if (error) console.warn("Erreur suppression:", error.message);
  };

  const getReportByCode = (code: string): Report | undefined =>
    reports.find((r) => r.trackingCode.toLowerCase() === code.toLowerCase());

  const fetchReportByCode = async (code: string): Promise<Report | null> => {
    const upper = code.toUpperCase();
    const local = reports.find((r) => r.trackingCode.toLowerCase() === upper.toLowerCase());
    if (local) return local;

    try {
      const { data, error } = await supabase
        .from("reports")
        .select("id, tracking_code, abuse_type, status, admin_note, submitted_at")
        .eq("tracking_code", upper)
        .single();

      if (error || !data) return null;
      return mapRow(data);
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

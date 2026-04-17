import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

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
  addReport: (report: Omit<Report, "id" | "submittedAt" | "status" | "trackingCode">) => string;
  updateReportStatus: (id: string, status: Report["status"], adminNote?: string) => void;
  getReportByCode: (code: string) => Report | undefined;
  isAdmin: boolean;
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const ADMIN_PASSWORD = "VoixEnfance2024!";
const STORAGE_KEY = "@voixenfance_reports";

function generateTrackingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) code += "-";
  }
  return code;
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
      if (stored) {
        setReports(JSON.parse(stored));
      }
    } catch {}
  };

  const saveReports = async (newReports: Report[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newReports));
    } catch {}
  };

  const addReport = (reportData: Omit<Report, "id" | "submittedAt" | "status" | "trackingCode">): string => {
    const trackingCode = generateTrackingCode();
    const newReport: Report = {
      ...reportData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      trackingCode,
      submittedAt: new Date().toISOString(),
      status: "pending",
    };
    const updated = [newReport, ...reports];
    setReports(updated);
    saveReports(updated);
    return trackingCode;
  };

  const updateReportStatus = (id: string, status: Report["status"], adminNote?: string) => {
    const updated = reports.map((r) =>
      r.id === id ? { ...r, status, ...(adminNote ? { adminNote } : {}) } : r
    );
    setReports(updated);
    saveReports(updated);
  };

  const getReportByCode = (code: string): Report | undefined => {
    return reports.find((r) => r.trackingCode.toLowerCase() === code.toLowerCase());
  };

  const adminLogin = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
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
      value={{ reports, addReport, updateReportStatus, getReportByCode, isAdmin, adminLogin, adminLogout }}
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

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Report {
  id: string;
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
}

interface AppContextType {
  reports: Report[];
  addReport: (report: Omit<Report, "id" | "submittedAt" | "status">) => void;
  updateReportStatus: (id: string, status: Report["status"]) => void;
  isAdmin: boolean;
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const ADMIN_PASSWORD = "Guardian2024!";
const STORAGE_KEY = "@guardian_gabon_reports";

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

  const addReport = (reportData: Omit<Report, "id" | "submittedAt" | "status">) => {
    const newReport: Report = {
      ...reportData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      submittedAt: new Date().toISOString(),
      status: "pending",
    };
    const updated = [newReport, ...reports];
    setReports(updated);
    saveReports(updated);
  };

  const updateReportStatus = (id: string, status: Report["status"]) => {
    const updated = reports.map((r) => (r.id === id ? { ...r, status } : r));
    setReports(updated);
    saveReports(updated);
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
      value={{ reports, addReport, updateReportStatus, isAdmin, adminLogin, adminLogout }}
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

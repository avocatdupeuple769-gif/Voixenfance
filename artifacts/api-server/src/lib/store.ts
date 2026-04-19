import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const REPORTS_FILE = path.join(DATA_DIR, "reports.json");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

export interface StoredReport {
  id: string;
  trackingCode: string;
  reporterName: string;
  reporterAge: string;
  victimAge: string;
  abuseType: string;
  description: string;
  location: string;
  mediaUri?: string | null;
  mediaType?: string | null;
  status: string;
  adminNote?: string | null;
  submittedAt: string;
  updatedAt: string;
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function readAll(): StoredReport[] {
  ensureDir();
  if (!fs.existsSync(REPORTS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(REPORTS_FILE, "utf8")) as StoredReport[];
  } catch {
    return [];
  }
}

function writeAll(reports: StoredReport[]): void {
  ensureDir();
  fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2), "utf8");
}

export const store = {
  getAll(): StoredReport[] {
    return readAll();
  },

  getByCode(code: string): StoredReport | undefined {
    return readAll().find((r) => r.trackingCode.toUpperCase() === code.toUpperCase());
  },

  getById(id: string): StoredReport | undefined {
    return readAll().find((r) => r.id === id);
  },

  insert(report: StoredReport): void {
    const all = readAll();
    if (!all.find((r) => r.id === report.id)) {
      all.unshift(report);
      writeAll(all);
    }
  },

  updateStatus(id: string, status: string, adminNote?: string): void {
    const all = readAll().map((r) => {
      if (r.id !== id) return r;
      return {
        ...r,
        status,
        adminNote: adminNote !== undefined ? adminNote : r.adminNote,
        updatedAt: new Date().toISOString(),
      };
    });
    writeAll(all);
  },

  deleteById(id: string): StoredReport | undefined {
    const all = readAll();
    const target = all.find((r) => r.id === id);
    if (target) {
      writeAll(all.filter((r) => r.id !== id));
    }
    return target;
  },
};

import { Router, type IRouter } from "express";
import fs from "fs";
import path from "path";
import { store, UPLOADS_DIR } from "../lib/store";

const router: IRouter = Router();
const ADMIN_KEY = process.env.ADMIN_SECRET || "VoixEnfance2024!";

function isAdmin(req: any): boolean {
  return req.headers["x-admin-key"] === ADMIN_KEY;
}

/* ──────────── Media serving ──────────── */
router.get("/media/:filename", (req, res) => {
  const filename = path.basename(req.params.filename);
  const filepath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filepath)) {
    res.status(404).json({ error: "Fichier introuvable" });
    return;
  }
  res.sendFile(filepath);
});

/* ──────────── Create report ──────────── */
router.post("/reports", (req, res) => {
  try {
    const {
      id,
      trackingCode,
      reporterName,
      reporterAge,
      victimAge,
      abuseType,
      description,
      location,
      mediaBase64,
      mediaMimeType,
      submittedAt,
    } = req.body;

    if (!id || !trackingCode || !reporterName || !description) {
      res.status(400).json({ error: "Champs obligatoires manquants" });
      return;
    }

    let mediaUri: string | null = null;
    let mediaType: string | null = null;

    if (mediaBase64 && mediaMimeType) {
      try {
        const ext = mediaMimeType.split("/")[1]?.split(";")[0] || "jpg";
        const safeExt = ["jpg", "jpeg", "png", "mp4", "mov", "webm", "gif"].includes(ext)
          ? ext
          : "bin";
        const filename = `${id}.${safeExt}`;
        const filepath = path.join(UPLOADS_DIR, filename);
        fs.writeFileSync(filepath, Buffer.from(mediaBase64, "base64"));
        mediaUri = `/media/${filename}`;
        mediaType = mediaMimeType.startsWith("video") ? "video" : "photo";
      } catch (e) {
        console.error("Erreur sauvegarde média:", e);
      }
    }

    store.insert({
      id,
      trackingCode: trackingCode.toUpperCase(),
      reporterName,
      reporterAge: reporterAge || "",
      victimAge: victimAge || "",
      abuseType: abuseType || "sexual",
      description,
      location: location || "",
      mediaUri,
      mediaType,
      status: "pending",
      adminNote: null,
      submittedAt: submittedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, trackingCode });
  } catch (err) {
    console.error("Erreur création signalement:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ──────────── Get all reports (admin) ──────────── */
router.get("/reports", (req, res) => {
  try {
    if (!isAdmin(req)) {
      res.status(403).json({ error: "Non autorisé" });
      return;
    }
    res.json(store.getAll());
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ──────────── Get by tracking code ──────────── */
router.get("/reports/code/:code", (req, res) => {
  try {
    const { code } = req.params;
    const report = store.getByCode(code.toUpperCase());
    if (!report) {
      res.status(404).json({ error: "Code introuvable" });
      return;
    }
    res.json({
      id: report.id,
      trackingCode: report.trackingCode,
      abuseType: report.abuseType,
      status: report.status,
      adminNote: report.adminNote,
      submittedAt: report.submittedAt,
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ──────────── Update status (admin) ──────────── */
router.patch("/reports/:id/status", (req, res) => {
  try {
    if (!isAdmin(req)) {
      res.status(403).json({ error: "Non autorisé" });
      return;
    }
    const { id } = req.params;
    const { status, adminNote } = req.body;
    store.updateStatus(id, status, adminNote);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ──────────── Delete report (admin) ──────────── */
router.delete("/reports/:id", (req, res) => {
  try {
    if (!isAdmin(req)) {
      res.status(403).json({ error: "Non autorisé" });
      return;
    }
    const { id } = req.params;
    const deleted = store.deleteById(id);
    if (!deleted) {
      res.status(404).json({ error: "Signalement introuvable" });
      return;
    }
    if (deleted.mediaUri?.startsWith("/media/")) {
      const filename = path.basename(deleted.mediaUri);
      const filepath = path.join(UPLOADS_DIR, filename);
      try {
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      } catch {}
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;

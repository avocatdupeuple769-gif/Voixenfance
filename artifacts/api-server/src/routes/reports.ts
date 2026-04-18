import { Router, type IRouter } from "express";
import { store } from "../lib/store";

const router: IRouter = Router();

const ADMIN_KEY = process.env.ADMIN_SECRET || "VoixEnfance2024!";

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
      mediaUri,
      mediaType,
      submittedAt,
    } = req.body;

    if (!id || !trackingCode || !reporterName || !description) {
      res.status(400).json({ error: "Champs obligatoires manquants" });
      return;
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
      mediaUri: mediaUri || null,
      mediaType: mediaType || null,
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

router.get("/reports", (req, res) => {
  try {
    const adminKey = req.headers["x-admin-key"];
    if (adminKey !== ADMIN_KEY) {
      res.status(403).json({ error: "Non autorisé" });
      return;
    }

    res.json(store.getAll());
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/reports/:id/status", (req, res) => {
  try {
    const adminKey = req.headers["x-admin-key"];
    if (adminKey !== ADMIN_KEY) {
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

export default router;

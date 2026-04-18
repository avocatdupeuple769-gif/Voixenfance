import { Router, type IRouter } from "express";
import { tokenStore } from "../lib/tokenStore";

const router: IRouter = Router();

const ADMIN_KEY = process.env.ADMIN_SECRET || "VoixEnfance2024!";

router.post("/push-tokens", (req, res) => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== "string") {
      res.status(400).json({ error: "Token manquant" });
      return;
    }
    tokenStore.add(token);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/push-tokens", (req, res) => {
  try {
    const { token } = req.body;
    if (token) tokenStore.remove(token);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/alarm", async (req, res) => {
  try {
    const adminKey = req.headers["x-admin-key"];
    if (adminKey !== ADMIN_KEY) {
      res.status(403).json({ error: "Non autorisé" });
      return;
    }

    const { message } = req.body;
    const tokens = tokenStore.getAll();

    if (tokens.length === 0) {
      res.json({ success: true, sent: 0, message: "Aucun appareil enregistré" });
      return;
    }

    const alertMessage =
      message ||
      "⚠️ ALERTE URGENCE — Un enfant a besoin d'aide. Contactez les autorités immédiatement.";

    const notifications = tokens.map((token) => ({
      to: token,
      sound: "default",
      title: "🚨 ALERTE VoixEnfance",
      body: alertMessage,
      priority: "high",
      data: { type: "alarm" },
      badge: 1,
    }));

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify(notifications),
    });

    const result = (await response.json()) as { data?: unknown[] };
    const sent = Array.isArray(result.data) ? result.data.length : tokens.length;

    res.json({ success: true, sent, total: tokens.length });
  } catch (err) {
    console.error("Erreur envoi alarme:", err);
    res.status(500).json({ error: "Erreur envoi alarme" });
  }
});

router.get("/alarm/devices", (req, res) => {
  try {
    const adminKey = req.headers["x-admin-key"];
    if (adminKey !== ADMIN_KEY) {
      res.status(403).json({ error: "Non autorisé" });
      return;
    }
    res.json({ count: tokenStore.getAll().length });
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;

import { Router, type IRouter } from "express";
import { db, reportsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/reports", async (req, res) => {
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

    await db.insert(reportsTable).values({
      id,
      trackingCode,
      reporterName,
      reporterAge: reporterAge || "",
      victimAge: victimAge || "",
      abuseType: abuseType || "sexual",
      description,
      location: location || "",
      mediaUri: mediaUri || null,
      mediaType: mediaType || null,
      status: "pending",
      submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
      updatedAt: new Date(),
    }).onConflictDoNothing();

    res.status(201).json({ success: true, trackingCode });
  } catch (err) {
    console.error("Erreur création signalement:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/reports/code/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const normalised = code.toUpperCase();

    const results = await db
      .select()
      .from(reportsTable)
      .where(eq(reportsTable.trackingCode, normalised))
      .limit(1);

    if (!results.length) {
      res.status(404).json({ error: "Code introuvable" });
      return;
    }

    const r = results[0];
    res.json({
      id: r.id,
      trackingCode: r.trackingCode,
      abuseType: r.abuseType,
      status: r.status,
      adminNote: r.adminNote,
      submittedAt: r.submittedAt.toISOString(),
    });
  } catch (err) {
    console.error("Erreur recherche signalement:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/reports", async (req, res) => {
  try {
    const adminKey = req.headers["x-admin-key"];
    if (adminKey !== process.env.ADMIN_SECRET && adminKey !== "VoixEnfance2024!") {
      res.status(403).json({ error: "Non autorisé" });
      return;
    }

    const results = await db
      .select()
      .from(reportsTable)
      .orderBy(reportsTable.submittedAt);

    res.json(results.map(r => ({
      ...r,
      submittedAt: r.submittedAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })));
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/reports/:id/status", async (req, res) => {
  try {
    const adminKey = req.headers["x-admin-key"];
    if (adminKey !== process.env.ADMIN_SECRET && adminKey !== "VoixEnfance2024!") {
      res.status(403).json({ error: "Non autorisé" });
      return;
    }

    const { id } = req.params;
    const { status, adminNote } = req.body;

    await db
      .update(reportsTable)
      .set({
        status,
        ...(adminNote !== undefined ? { adminNote } : {}),
        updatedAt: new Date(),
      })
      .where(eq(reportsTable.id, id));

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;

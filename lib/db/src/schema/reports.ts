import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reportsTable = pgTable("voix_reports", {
  id: text("id").primaryKey(),
  trackingCode: text("tracking_code").notNull().unique(),
  reporterName: text("reporter_name").notNull(),
  reporterAge: text("reporter_age").notNull(),
  victimAge: text("victim_age").notNull(),
  abuseType: text("abuse_type").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  mediaUri: text("media_uri"),
  mediaType: text("media_type"),
  status: text("status").notNull().default("pending"),
  adminNote: text("admin_note"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({
  submittedAt: true,
  updatedAt: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type DBReport = typeof reportsTable.$inferSelect;

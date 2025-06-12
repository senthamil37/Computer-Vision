import { pgTable, text, serial, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const analysisJobs = pgTable("analysis_jobs", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalPath: text("original_path").notNull(),
  processedPath: text("processed_path"),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  processingOptions: jsonb("processing_options").notNull(),
  results: jsonb("results"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  fileSize: integer("file_size").notNull(),
  dimensions: jsonb("dimensions"), // {width: number, height: number}
  processingTimeMs: integer("processing_time_ms"),
});

export const detectionResults = pgTable("detection_results", {
  id: serial("id").primaryKey(),
  analysisJobId: integer("analysis_job_id").notNull(),
  objectClass: text("object_class").notNull(),
  confidence: integer("confidence").notNull(), // 0-100
  boundingBox: jsonb("bounding_box").notNull(), // {x, y, width, height}
  color: text("color").notNull(), // hex color for bounding box
});

export const insertAnalysisJobSchema = createInsertSchema(analysisJobs).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertDetectionResultSchema = createInsertSchema(detectionResults).omit({
  id: true,
});

export type InsertAnalysisJob = z.infer<typeof insertAnalysisJobSchema>;
export type AnalysisJob = typeof analysisJobs.$inferSelect;
export type InsertDetectionResult = z.infer<typeof insertDetectionResultSchema>;
export type DetectionResult = typeof detectionResults.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

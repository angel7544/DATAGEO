import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const gpsPoints = pgTable("gps_points", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  apName: text("ap_name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  priority: integer("priority").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminLogs = pgTable("admin_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  targetUserId: integer("target_user_id").references(() => users.id),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGpsPointSchema = createInsertSchema(gpsPoints)
  .omit({ id: true, userId: true, createdAt: true })
  .extend({
    imageFile: z.any().optional(),
  });

export const insertTaskSchema = createInsertSchema(tasks)
  .omit({ id: true, userId: true, createdAt: true, completed: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GpsPoint = typeof gpsPoints.$inferSelect;
export type InsertGpsPoint = z.infer<typeof insertGpsPointSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type AdminLog = typeof adminLogs.$inferSelect;
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const gpsPoints = pgTable("gps_points", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  apName: text("ap_name").notNull(),
  description: text("description"),
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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGpsPointSchema = createInsertSchema(gpsPoints)
  .omit({ id: true, userId: true, createdAt: true });

export const insertTaskSchema = createInsertSchema(tasks)
  .omit({ id: true, userId: true, createdAt: true, completed: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GpsPoint = typeof gpsPoints.$inferSelect;
export type InsertGpsPoint = z.infer<typeof insertGpsPointSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

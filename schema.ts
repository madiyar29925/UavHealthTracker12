import { pgTable, text, serial, integer, boolean, timestamp, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Drone data model
export const uavs = pgTable("uavs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull(), // 'active', 'warning', 'critical', 'offline'
  batteryLevel: integer("battery_level").notNull(), // percentage
  signalStrength: integer("signal_strength").notNull(), // percentage
  speed: real("speed").notNull(), // m/s
  altitude: real("altitude").notNull(), // meters
  lastUpdated: timestamp("last_updated").notNull(),
});

export const insertUavSchema = createInsertSchema(uavs).omit({
  id: true,
});

// Drone telemetry data
export const telemetry = pgTable("telemetry", {
  id: serial("id").primaryKey(),
  uavId: integer("uav_id").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  batteryLevel: integer("battery_level").notNull(),
  signalStrength: integer("signal_strength").notNull(),
  speed: real("speed").notNull(),
  altitude: real("altitude").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  temperature: real("temperature"),
});

export const insertTelemetrySchema = createInsertSchema(telemetry).omit({
  id: true,
});

// Drone component status
export const components = pgTable("components", {
  id: serial("id").primaryKey(),
  uavId: integer("uav_id").notNull(),
  type: text("type").notNull(), // 'motor', 'camera', 'gps', 'battery', 'gyroscope', 'radio'
  status: text("status").notNull(), // 'normal', 'warning', 'critical'
  details: text("details"),
  value: integer("value"), // percentage for metrics like temperature, storage, etc.
  lastUpdated: timestamp("last_updated").notNull(),
});

export const insertComponentSchema = createInsertSchema(components).omit({
  id: true,
});

// Alerts
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  uavId: integer("uav_id").notNull(),
  severity: text("severity").notNull(), // 'info', 'warning', 'critical'
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  acknowledged: boolean("acknowledged").notNull().default(false),
  dismissed: boolean("dismissed").notNull().default(false),
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
});

// Maintenance schedule
export const maintenance = pgTable("maintenance", {
  id: serial("id").primaryKey(),
  uavId: integer("uav_id").notNull(),
  scheduledDate: date("scheduled_date").notNull(),
  description: text("description").notNull(),
  completed: boolean("completed").notNull().default(false),
  maintenanceType: text("maintenance_type").notNull(), // 'routine', 'emergency', 'upgrade'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertMaintenanceSchema = createInsertSchema(maintenance).omit({
  id: true,
  completedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Uav = typeof uavs.$inferSelect;
export type InsertUav = z.infer<typeof insertUavSchema>;

export type Telemetry = typeof telemetry.$inferSelect;
export type InsertTelemetry = z.infer<typeof insertTelemetrySchema>;

export type Component = typeof components.$inferSelect;
export type InsertComponent = z.infer<typeof insertComponentSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type Maintenance = typeof maintenance.$inferSelect;
export type InsertMaintenance = z.infer<typeof insertMaintenanceSchema>;

// Dashboard Stats
export interface DashboardStats {
  // Note: Property names retained for backend compatibility
  // These refer to active and offline drones
  activeUavs: number;
  offlineUavs: number;
  activeAlerts: number;
  avgBattery: number;
}

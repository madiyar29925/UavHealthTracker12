var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  alerts: () => alerts,
  components: () => components,
  insertAlertSchema: () => insertAlertSchema,
  insertComponentSchema: () => insertComponentSchema,
  insertMaintenanceSchema: () => insertMaintenanceSchema,
  insertTelemetrySchema: () => insertTelemetrySchema,
  insertUavSchema: () => insertUavSchema,
  insertUserSchema: () => insertUserSchema,
  maintenance: () => maintenance,
  telemetry: () => telemetry,
  uavs: () => uavs,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, timestamp, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var uavs = pgTable("uavs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull(),
  // 'active', 'warning', 'critical', 'offline'
  batteryLevel: integer("battery_level").notNull(),
  // percentage
  signalStrength: integer("signal_strength").notNull(),
  // percentage
  speed: real("speed").notNull(),
  // m/s
  altitude: real("altitude").notNull(),
  // meters
  lastUpdated: timestamp("last_updated").notNull()
});
var insertUavSchema = createInsertSchema(uavs).omit({
  id: true
});
var telemetry = pgTable("telemetry", {
  id: serial("id").primaryKey(),
  uavId: integer("uav_id").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  batteryLevel: integer("battery_level").notNull(),
  signalStrength: integer("signal_strength").notNull(),
  speed: real("speed").notNull(),
  altitude: real("altitude").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  temperature: real("temperature")
});
var insertTelemetrySchema = createInsertSchema(telemetry).omit({
  id: true
});
var components = pgTable("components", {
  id: serial("id").primaryKey(),
  uavId: integer("uav_id").notNull(),
  type: text("type").notNull(),
  // 'motor', 'camera', 'gps', 'battery', 'gyroscope', 'radio'
  status: text("status").notNull(),
  // 'normal', 'warning', 'critical'
  details: text("details"),
  value: integer("value"),
  // percentage for metrics like temperature, storage, etc.
  lastUpdated: timestamp("last_updated").notNull()
});
var insertComponentSchema = createInsertSchema(components).omit({
  id: true
});
var alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  uavId: integer("uav_id").notNull(),
  severity: text("severity").notNull(),
  // 'info', 'warning', 'critical'
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  acknowledged: boolean("acknowledged").notNull().default(false),
  dismissed: boolean("dismissed").notNull().default(false)
});
var insertAlertSchema = createInsertSchema(alerts).omit({
  id: true
});
var maintenance = pgTable("maintenance", {
  id: serial("id").primaryKey(),
  uavId: integer("uav_id").notNull(),
  scheduledDate: date("scheduled_date").notNull(),
  description: text("description").notNull(),
  completed: boolean("completed").notNull().default(false),
  maintenanceType: text("maintenance_type").notNull(),
  // 'routine', 'emergency', 'upgrade'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at")
});
var insertMaintenanceSchema = createInsertSchema(maintenance).omit({
  id: true,
  completedAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, and, or, avg, count, sql } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";
var MemoryStore = createMemoryStore(session);
var DatabaseStorage = class {
  sessionStore;
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 864e5
      // Session cleanup every 24 hours
    });
  }
  // Maintenance methods
  async getAllMaintenance(limit) {
    const query = db.select().from(maintenance).orderBy(maintenance.scheduledDate);
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
  }
  async getMaintenanceByUavId(uavId) {
    return await db.select().from(maintenance).where(eq(maintenance.uavId, uavId)).orderBy(maintenance.scheduledDate);
  }
  async getUpcomingMaintenance(days) {
    const startDate = /* @__PURE__ */ new Date();
    const endDate = /* @__PURE__ */ new Date();
    endDate.setDate(endDate.getDate() + days);
    return await db.select().from(maintenance).where(
      and(
        // Not completed
        eq(maintenance.completed, false),
        // Scheduled in the next X days
        sql`${maintenance.scheduledDate} BETWEEN ${startDate.toISOString().split("T")[0]} AND ${endDate.toISOString().split("T")[0]}`
      )
    ).orderBy(maintenance.scheduledDate);
  }
  async createMaintenance(insertMaintenance) {
    const [maintenanceData] = await db.insert(maintenance).values(insertMaintenance).returning();
    return maintenanceData;
  }
  async updateMaintenance(id, maintenanceData) {
    const [updatedMaintenance] = await db.update(maintenance).set(maintenanceData).where(eq(maintenance.id, id)).returning();
    return updatedMaintenance;
  }
  async completeMaintenance(id) {
    const [completedMaintenance] = await db.update(maintenance).set({
      completed: true,
      completedAt: /* @__PURE__ */ new Date()
    }).where(eq(maintenance.id, id)).returning();
    return completedMaintenance;
  }
  async deleteMaintenance(id) {
    try {
      await db.delete(maintenance).where(eq(maintenance.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting maintenance record:", error);
      return false;
    }
  }
  // User methods
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  // UAV methods
  async getAllUavs() {
    return await db.select().from(uavs);
  }
  async getUav(id) {
    const [uav] = await db.select().from(uavs).where(eq(uavs.id, id));
    return uav;
  }
  async createUav(insertUav) {
    const [uav] = await db.insert(uavs).values(insertUav).returning();
    return uav;
  }
  async updateUav(id, uavData) {
    const [updatedUav] = await db.update(uavs).set(uavData).where(eq(uavs.id, id)).returning();
    return updatedUav;
  }
  async deleteUav(id) {
    try {
      await db.delete(telemetry).where(eq(telemetry.uavId, id));
      await db.delete(components).where(eq(components.uavId, id));
      await db.delete(alerts).where(eq(alerts.uavId, id));
      await db.delete(maintenance).where(eq(maintenance.uavId, id));
      await db.delete(uavs).where(eq(uavs.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting UAV:", error);
      return false;
    }
  }
  // Telemetry methods
  async getTelemetryByUavId(uavId, limit) {
    const query = db.select().from(telemetry).where(eq(telemetry.uavId, uavId)).orderBy(desc(telemetry.timestamp));
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
  }
  async createTelemetry(insertTelemetry) {
    const [telemetryData] = await db.insert(telemetry).values(insertTelemetry).returning();
    await db.update(uavs).set({
      batteryLevel: insertTelemetry.batteryLevel,
      signalStrength: insertTelemetry.signalStrength,
      speed: insertTelemetry.speed,
      altitude: insertTelemetry.altitude,
      lastUpdated: insertTelemetry.timestamp
    }).where(eq(uavs.id, insertTelemetry.uavId));
    return telemetryData;
  }
  // Component methods
  async getComponentsByUavId(uavId) {
    return await db.select().from(components).where(eq(components.uavId, uavId));
  }
  async createComponent(insertComponent) {
    const [component] = await db.insert(components).values(insertComponent).returning();
    return component;
  }
  async updateComponent(id, componentData) {
    const [updatedComponent] = await db.update(components).set(componentData).where(eq(components.id, id)).returning();
    return updatedComponent;
  }
  // Alert methods
  async getAllAlerts(limit) {
    const query = db.select().from(alerts).orderBy(desc(alerts.timestamp));
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
  }
  async getAlertsByUavId(uavId) {
    return await db.select().from(alerts).where(eq(alerts.uavId, uavId)).orderBy(desc(alerts.timestamp));
  }
  async createAlert(insertAlert) {
    const [alert] = await db.insert(alerts).values({
      ...insertAlert,
      acknowledged: false,
      dismissed: false
    }).returning();
    return alert;
  }
  async updateAlert(id, alertData) {
    const [updatedAlert] = await db.update(alerts).set(alertData).where(eq(alerts.id, id)).returning();
    return updatedAlert;
  }
  // Dashboard stats
  async getDashboardStats() {
    const [activeUavsResult] = await db.select({ count: count() }).from(uavs).where(
      or(
        eq(uavs.status, "active"),
        eq(uavs.status, "warning"),
        eq(uavs.status, "critical")
      )
    );
    const [offlineUavsResult] = await db.select({ count: count() }).from(uavs).where(eq(uavs.status, "offline"));
    const [activeAlertsResult] = await db.select({ count: count() }).from(alerts).where(and(eq(alerts.acknowledged, false), eq(alerts.dismissed, false)));
    const [avgBatteryResult] = await db.select({ average: avg(uavs.batteryLevel) }).from(uavs).where(
      or(
        eq(uavs.status, "active"),
        eq(uavs.status, "warning"),
        eq(uavs.status, "critical")
      )
    );
    return {
      activeUavs: activeUavsResult.count,
      offlineUavs: offlineUavsResult.count,
      activeAlerts: activeAlertsResult.count,
      avgBattery: Math.round(Number(avgBatteryResult.average || 0))
    };
  }
  // Initialize database with demo data if empty
  async initializeDemoData() {
    const existingUavs = await db.select().from(uavs);
    if (existingUavs.length > 0) {
      return;
    }
    console.log("Initializing database with demo data...");
    const uavData = [
      {
        name: "UAV-Alpha01",
        status: "active",
        batteryLevel: 92,
        signalStrength: 98,
        speed: 12,
        altitude: 120,
        lastUpdated: /* @__PURE__ */ new Date()
      },
      {
        name: "UAV-Bravo02",
        status: "warning",
        batteryLevel: 31,
        signalStrength: 85,
        speed: 8,
        altitude: 85,
        lastUpdated: /* @__PURE__ */ new Date()
      },
      {
        name: "UAV-Charlie03",
        status: "critical",
        batteryLevel: 54,
        signalStrength: 15,
        speed: 15,
        altitude: 210,
        lastUpdated: /* @__PURE__ */ new Date()
      },
      {
        name: "UAV-Delta04",
        status: "active",
        batteryLevel: 87,
        signalStrength: 92,
        speed: 9,
        altitude: 75,
        lastUpdated: /* @__PURE__ */ new Date()
      },
      {
        name: "UAV-Echo05",
        status: "offline",
        batteryLevel: 0,
        signalStrength: 0,
        speed: 0,
        altitude: 0,
        lastUpdated: new Date(Date.now() - 864e5)
        // 1 day ago
      },
      {
        name: "UAV-Foxtrot06",
        status: "offline",
        batteryLevel: 0,
        signalStrength: 0,
        speed: 0,
        altitude: 0,
        lastUpdated: new Date(Date.now() - 1728e5)
        // 2 days ago
      }
    ];
    const insertedUavs = await db.insert(uavs).values(uavData).returning();
    for (const uav of insertedUavs) {
      if (uav.status === "offline") continue;
      const componentData = [
        // Motors
        {
          uavId: uav.id,
          type: "motor",
          status: "normal",
          details: "All motors functioning normally",
          value: 35,
          lastUpdated: /* @__PURE__ */ new Date()
        },
        // Camera
        {
          uavId: uav.id,
          type: "camera",
          status: "normal",
          details: "4K camera operational",
          value: 42,
          lastUpdated: /* @__PURE__ */ new Date()
        },
        // GPS
        {
          uavId: uav.id,
          type: "gps",
          status: "normal",
          details: "12 satellites connected",
          value: 85,
          lastUpdated: /* @__PURE__ */ new Date()
        },
        // Battery
        {
          uavId: uav.id,
          type: "battery",
          status: "normal",
          details: "5200mAh LiPo battery",
          value: uav.batteryLevel,
          lastUpdated: /* @__PURE__ */ new Date()
        },
        // Gyroscope - UAV-Bravo02 has a warning
        {
          uavId: uav.id,
          type: "gyroscope",
          status: uav.name === "UAV-Bravo02" ? "warning" : "normal",
          details: uav.name === "UAV-Bravo02" ? "Minor calibration needed" : "Calibrated and operational",
          value: uav.name === "UAV-Bravo02" ? 68 : 95,
          lastUpdated: /* @__PURE__ */ new Date()
        },
        // Radio Control - UAV-Charlie03 has a critical issue
        {
          uavId: uav.id,
          type: "radio",
          status: uav.name === "UAV-Charlie03" ? "critical" : "normal",
          details: uav.name === "UAV-Charlie03" ? "Signal interference detected" : "2.4GHz connection stable",
          value: uav.name === "UAV-Charlie03" ? 15 : 95,
          lastUpdated: /* @__PURE__ */ new Date()
        }
      ];
      await db.insert(components).values(componentData);
      const now = /* @__PURE__ */ new Date();
      const telemetryEntries = [];
      for (let i = 0; i < 30; i++) {
        const timestamp2 = new Date(now.getTime() - i * 6e4);
        const variation = Math.random() * 10 - 5;
        telemetryEntries.push({
          uavId: uav.id,
          timestamp: timestamp2,
          batteryLevel: Math.round(
            Math.max(0, Math.min(100, uav.batteryLevel - i * 0.15))
          ),
          signalStrength: Math.round(
            Math.max(0, Math.min(100, uav.signalStrength + variation / 2))
          ),
          speed: Number(Math.max(0, uav.speed + variation / 3).toFixed(2)),
          altitude: Math.round(Math.max(0, uav.altitude + variation)),
          latitude: Number((37.7749 + variation / 1e3).toFixed(6)),
          longitude: Number((-122.4194 + variation / 1e3).toFixed(6)),
          temperature: Number((25 + variation / 5).toFixed(2))
        });
      }
      if (telemetryEntries.length > 0) {
        await db.insert(telemetry).values(telemetryEntries);
      }
    }
    const alertsData = [
      {
        uavId: 3,
        // UAV-Charlie03
        severity: "critical",
        message: "Signal Loss Detected: UAV-Charlie03 has weak signal strength (15%).",
        timestamp: new Date(Date.now() - 10 * 6e4),
        // 10 minutes ago
        acknowledged: false,
        dismissed: false
      },
      {
        uavId: 2,
        // UAV-Bravo02
        severity: "warning",
        message: "Low Battery Warning: UAV-Bravo02 battery level below 35%.",
        timestamp: new Date(Date.now() - 25 * 6e4),
        // 25 minutes ago
        acknowledged: false,
        dismissed: false
      },
      {
        uavId: 1,
        // UAV-Alpha01
        severity: "info",
        message: "Maintenance Due: UAV-Alpha01 scheduled maintenance due in 3 days.",
        timestamp: new Date(Date.now() - 2 * 36e5),
        // 2 hours ago
        acknowledged: false,
        dismissed: false
      }
    ];
    await db.insert(alerts).values(alertsData);
    const alphaUav = insertedUavs.find((uav) => uav.name === "UAV-Alpha01");
    if (alphaUav) {
      const maintenanceDate = /* @__PURE__ */ new Date();
      maintenanceDate.setDate(maintenanceDate.getDate() + 3);
      await db.insert(maintenance).values({
        uavId: alphaUav.id,
        scheduledDate: maintenanceDate.toISOString().split("T")[0],
        description: "Scheduled routine maintenance for UAV-Alpha01",
        maintenanceType: "routine",
        completed: false
      });
    }
    console.log("Demo data initialization complete.");
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { WebSocketServer, WebSocket } from "ws";
import { z } from "zod";

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "uav-monitoring-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1e3
      // Хранить сессии 7 дней
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0441 \u0442\u0430\u043A\u0438\u043C \u0438\u043C\u0435\u043D\u0435\u043C \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442" });
      }
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password)
      });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F" });
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: "\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0438\u043C\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u0438\u043B\u0438 \u043F\u0430\u0440\u043E\u043B\u044C" });
      }
      req.login(user, (err2) => {
        if (err2) return next(err2);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    res.json(req.user);
  });
}

// server/routes.ts
async function registerRoutes(app2) {
  setupAuth(app2);
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const clients = /* @__PURE__ */ new Set();
  wss.on("connection", (ws2) => {
    console.log("Client connected to WebSocket");
    clients.add(ws2);
    sendAllUavData(ws2);
    ws2.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "ping") {
          if (ws2.readyState === WebSocket.OPEN) {
            ws2.send(JSON.stringify({ type: "pong" }));
          }
          return;
        }
        console.log("Received message:", data);
        if (data.type === "telemetry" && data.payload) {
          const validatedData = insertTelemetrySchema.parse(data.payload);
          const telemetry2 = await storage.createTelemetry(validatedData);
          broadcastUavUpdate(telemetry2.uavId);
        } else if (data.type === "alert" && data.payload) {
          const validatedData = insertAlertSchema.parse(data.payload);
          const alert = await storage.createAlert(validatedData);
          broadcastAlert(alert);
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    ws2.on("close", () => {
      console.log("Client disconnected from WebSocket");
      clients.delete(ws2);
    });
  });
  async function broadcastUavUpdate(uavId) {
    const uav = await storage.getUav(uavId);
    if (!uav) return;
    const message = JSON.stringify({
      type: "uav_update",
      payload: uav
    });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
  function broadcastAlert(alert) {
    const message = JSON.stringify({
      type: "new_alert",
      payload: alert
    });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
  async function sendAllUavData(ws2) {
    try {
      const uavs2 = await storage.getAllUavs();
      const dashboardStats = await storage.getDashboardStats();
      const alerts2 = await storage.getAllAlerts(10);
      if (ws2.readyState === WebSocket.OPEN) {
        ws2.send(JSON.stringify({
          type: "initial_data",
          payload: {
            uavs: uavs2,
            stats: dashboardStats,
            alerts: alerts2
          }
        }));
      }
    } catch (error) {
      console.error("Error sending initial data:", error);
    }
  }
  app2.get("/api/uavs", async (req, res) => {
    try {
      const uavs2 = await storage.getAllUavs();
      res.json(uavs2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching UAVs data" });
    }
  });
  app2.get("/api/uavs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const uav = await storage.getUav(id);
      if (!uav) {
        return res.status(404).json({ message: "UAV not found" });
      }
      res.json(uav);
    } catch (error) {
      res.status(500).json({ message: "Error fetching UAV data" });
    }
  });
  app2.delete("/api/uavs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const uav = await storage.getUav(id);
      if (!uav) {
        return res.status(404).json({ message: "UAV not found" });
      }
      const maintenanceRecords = await storage.getMaintenanceByUavId(id);
      const maintenanceCount = maintenanceRecords.length;
      const success = await storage.deleteUav(id);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete UAV" });
      }
      let message = `UAV ${uav.name} has been successfully deleted`;
      if (maintenanceCount > 0) {
        message += `, along with ${maintenanceCount} maintenance record${maintenanceCount !== 1 ? "s" : ""}`;
      }
      res.status(200).json({ success: true, message });
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "uav_deleted",
            payload: { id, name: uav.name }
          }));
        }
      });
    } catch (error) {
      console.error("Error deleting UAV:", error);
      res.status(500).json({ message: "Error deleting UAV" });
    }
  });
  app2.get("/api/uavs/:id/telemetry", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      const telemetry2 = await storage.getTelemetryByUavId(id, limit);
      res.json(telemetry2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching telemetry data" });
    }
  });
  app2.get("/api/uavs/:id/components", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const components2 = await storage.getComponentsByUavId(id);
      res.json(components2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching component data" });
    }
  });
  app2.get("/api/uavs/:id/alerts", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const alerts2 = await storage.getAlertsByUavId(id);
      res.json(alerts2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching alerts data" });
    }
  });
  app2.get("/api/alerts", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      const alerts2 = await storage.getAllAlerts(limit);
      res.json(alerts2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching alerts data" });
    }
  });
  app2.patch("/api/alerts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { acknowledged, dismissed } = req.body;
      const updateSchema = z.object({
        acknowledged: z.boolean().optional(),
        dismissed: z.boolean().optional()
      });
      const validatedData = updateSchema.parse(req.body);
      const updatedAlert = await storage.updateAlert(id, validatedData);
      if (!updatedAlert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json(updatedAlert);
      broadcastAlert(updatedAlert);
    } catch (error) {
      res.status(500).json({ message: "Error updating alert" });
    }
  });
  app2.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard stats" });
    }
  });
  app2.post("/api/simulate/telemetry", async (req, res) => {
    try {
      const data = insertTelemetrySchema.parse(req.body);
      const telemetry2 = await storage.createTelemetry(data);
      broadcastUavUpdate(telemetry2.uavId);
      res.json(telemetry2);
    } catch (error) {
      res.status(500).json({ message: "Error creating telemetry data" });
    }
  });
  app2.post("/api/simulate/alert", async (req, res) => {
    try {
      const data = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(data);
      broadcastAlert(alert);
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Error creating alert" });
    }
  });
  app2.get("/api/maintenance", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      const maintenanceRecords = await storage.getAllMaintenance(limit);
      res.json(maintenanceRecords);
    } catch (error) {
      res.status(500).json({ message: "Error fetching maintenance records" });
    }
  });
  app2.get("/api/uavs/:id/maintenance", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const maintenanceRecords = await storage.getMaintenanceByUavId(id);
      res.json(maintenanceRecords);
    } catch (error) {
      res.status(500).json({ message: "Error fetching maintenance records for this drone" });
    }
  });
  app2.get("/api/maintenance/upcoming", async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days) : 7;
      const upcomingMaintenance = await storage.getUpcomingMaintenance(days);
      res.json(upcomingMaintenance);
    } catch (error) {
      res.status(500).json({ message: "Error fetching upcoming maintenance records" });
    }
  });
  app2.post("/api/maintenance", async (req, res) => {
    try {
      const data = insertMaintenanceSchema.parse(req.body);
      const maintenance2 = await storage.createMaintenance(data);
      res.status(201).json(maintenance2);
      const uav = await storage.getUav(maintenance2.uavId);
      if (uav) {
        const scheduledDate = new Date(maintenance2.scheduledDate);
        const today = /* @__PURE__ */ new Date();
        const daysUntilMaintenance = Math.ceil((scheduledDate.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
        const alert = await storage.createAlert({
          uavId: maintenance2.uavId,
          severity: "info",
          message: `Maintenance Due: ${uav.name} scheduled maintenance due in ${daysUntilMaintenance} days.`,
          timestamp: /* @__PURE__ */ new Date(),
          acknowledged: false,
          dismissed: false
        });
        broadcastAlert(alert);
      }
    } catch (error) {
      res.status(500).json({ message: "Error creating maintenance record" });
    }
  });
  app2.patch("/api/maintenance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = z.object({
        scheduledDate: z.string().optional(),
        description: z.string().optional(),
        completed: z.boolean().optional(),
        maintenanceType: z.string().optional()
      });
      const validatedData = updateSchema.parse(req.body);
      const updatedMaintenance = await storage.updateMaintenance(id, validatedData);
      if (!updatedMaintenance) {
        return res.status(404).json({ message: "Maintenance record not found" });
      }
      res.json(updatedMaintenance);
    } catch (error) {
      res.status(500).json({ message: "Error updating maintenance record" });
    }
  });
  app2.post("/api/maintenance/:id/complete", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const completedMaintenance = await storage.completeMaintenance(id);
      if (!completedMaintenance) {
        return res.status(404).json({ message: "Maintenance record not found" });
      }
      res.json(completedMaintenance);
      const uav = await storage.getUav(completedMaintenance.uavId);
      if (uav) {
        const alert = await storage.createAlert({
          uavId: completedMaintenance.uavId,
          severity: "info",
          message: `Maintenance Completed: ${uav.name} scheduled maintenance has been completed.`,
          timestamp: /* @__PURE__ */ new Date(),
          acknowledged: false,
          dismissed: false
        });
        broadcastAlert(alert);
      }
    } catch (error) {
      res.status(500).json({ message: "Error completing maintenance record" });
    }
  });
  app2.delete("/api/maintenance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const maintenanceRecord = await storage.updateMaintenance(id, {});
      if (!maintenanceRecord) {
        return res.status(404).json({ message: "Maintenance record not found" });
      }
      const uavId = maintenanceRecord.uavId;
      const uav = await storage.getUav(uavId);
      const success = await storage.deleteMaintenance(id);
      if (!success) {
        return res.status(404).json({ message: "Failed to delete maintenance record" });
      }
      res.status(200).json({ success: true });
      if (uav) {
        const alert = await storage.createAlert({
          uavId,
          severity: "info",
          message: `Maintenance Cancelled: Scheduled maintenance for ${uav.name} has been deleted.`,
          timestamp: /* @__PURE__ */ new Date(),
          acknowledged: false,
          dismissed: false
        });
        broadcastAlert(alert);
      }
    } catch (error) {
      console.error("Error deleting maintenance record:", error);
      res.status(500).json({ message: "Error deleting maintenance record" });
    }
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  if ("initializeDemoData" in storage) {
    try {
      await storage.initializeDemoData();
    } catch (error) {
      log(`Error initializing demo data: ${error}`, "error");
    }
  }
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from "ws";
import { z } from "zod";
import { insertTelemetrySchema, insertAlertSchema } from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients
  const clients: Set<WebSocket> = new Set();
  
  // WebSocket connection handler
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    clients.add(ws);
    
    // Send initial UAV data
    sendAllUavData(ws);
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle ping message with pong response
        if (data.type === 'ping') {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'pong' }));
          }
          return;
        }
        
        console.log('Received message:', data);
        
        // Handle different message types
        if (data.type === 'telemetry' && data.payload) {
          // Process new telemetry data
          const validatedData = insertTelemetrySchema.parse(data.payload);
          const telemetry = await storage.createTelemetry(validatedData);
          
          // Update all clients with new data
          broadcastUavUpdate(telemetry.uavId);
        } else if (data.type === 'alert' && data.payload) {
          // Process new alert
          const validatedData = insertAlertSchema.parse(data.payload);
          const alert = await storage.createAlert(validatedData);
          
          // Broadcast alert to all clients
          broadcastAlert(alert);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      clients.delete(ws);
    });
  });
  
  // Broadcast UAV update to all connected clients
  async function broadcastUavUpdate(uavId: number) {
    const uav = await storage.getUav(uavId);
    if (!uav) return;
    
    const message = JSON.stringify({
      type: 'uav_update',
      payload: uav
    });
    
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
  
  // Broadcast alert to all connected clients
  function broadcastAlert(alert: any) {
    const message = JSON.stringify({
      type: 'new_alert',
      payload: alert
    });
    
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
  
  // Send all UAV data to a specific client
  async function sendAllUavData(ws: WebSocket) {
    try {
      // Get all UAVs
      const uavs = await storage.getAllUavs();
      const dashboardStats = await storage.getDashboardStats();
      const alerts = await storage.getAllAlerts(10); // Get 10 most recent alerts
      
      // Send dashboard data
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'initial_data',
          payload: {
            uavs,
            stats: dashboardStats,
            alerts
          }
        }));
      }
    } catch (error) {
      console.error('Error sending initial data:', error);
    }
  }
  
  // Setup API routes
  
  // Get all UAVs
  app.get('/api/uavs', async (req: Request, res: Response) => {
    try {
      const uavs = await storage.getAllUavs();
      res.json(uavs);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching UAVs data' });
    }
  });
  
  // Get single UAV by ID
  app.get('/api/uavs/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const uav = await storage.getUav(id);
      
      if (!uav) {
        return res.status(404).json({ message: 'UAV not found' });
      }
      
      res.json(uav);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching UAV data' });
    }
  });
  
  // Delete a UAV and all its related data
  app.delete('/api/uavs/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the UAV data before deletion
      const uav = await storage.getUav(id);
      if (!uav) {
        return res.status(404).json({ message: 'UAV not found' });
      }
      
      // Delete the UAV and all related data
      const success = await storage.deleteUav(id);
      
      if (!success) {
        return res.status(500).json({ message: 'Failed to delete UAV' });
      }
      
      const message = `UAV ${uav.name} has been successfully deleted`;
      
      res.status(200).json({ success: true, message });
      
      // Broadcast to all clients that the UAV has been deleted
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'uav_deleted',
            payload: { id, name: uav.name }
          }));
        }
      });
      
    } catch (error) {
      console.error('Error deleting UAV:', error);
      res.status(500).json({ message: 'Error deleting UAV' });
    }
  });
  
  // Get UAV telemetry data
  app.get('/api/uavs/:id/telemetry', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const telemetry = await storage.getTelemetryByUavId(id, limit);
      res.json(telemetry);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching telemetry data' });
    }
  });
  
  // Get UAV component status
  app.get('/api/uavs/:id/components', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const components = await storage.getComponentsByUavId(id);
      res.json(components);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching component data' });
    }
  });
  
  // Get alerts for a UAV
  app.get('/api/uavs/:id/alerts', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const alerts = await storage.getAlertsByUavId(id);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching alerts data' });
    }
  });
  
  // Get all alerts
  app.get('/api/alerts', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const alerts = await storage.getAllAlerts(limit);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching alerts data' });
    }
  });
  
  // Update alert status (acknowledge or dismiss)
  app.patch('/api/alerts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { acknowledged, dismissed } = req.body;
      
      const updateSchema = z.object({
        acknowledged: z.boolean().optional(),
        dismissed: z.boolean().optional(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      const updatedAlert = await storage.updateAlert(id, validatedData);
      
      if (!updatedAlert) {
        return res.status(404).json({ message: 'Alert not found' });
      }
      
      res.json(updatedAlert);
      
      // Broadcast the updated alert
      broadcastAlert(updatedAlert);
    } catch (error) {
      res.status(500).json({ message: 'Error updating alert' });
    }
  });
  
  // Get dashboard stats
  app.get('/api/dashboard/stats', async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
  });
  
  // Simulate a telemetry update (for testing)
  app.post('/api/simulate/telemetry', async (req: Request, res: Response) => {
    try {
      const data = insertTelemetrySchema.parse(req.body);
      const telemetry = await storage.createTelemetry(data);
      
      // Broadcast the update to all clients
      broadcastUavUpdate(telemetry.uavId);
      
      res.json(telemetry);
    } catch (error) {
      res.status(500).json({ message: 'Error creating telemetry data' });
    }
  });
  
  // Simulate creating an alert (for testing)
  app.post('/api/simulate/alert', async (req: Request, res: Response) => {
    try {
      const data = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(data);
      
      // Broadcast the alert to all clients
      broadcastAlert(alert);
      
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: 'Error creating alert' });
    }
  });

  return httpServer;
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { textConfigSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get text positioning configuration
  app.get("/api/text-config/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const config = await storage.getTextPositionConfig(name);
      
      if (!config) {
        return res.status(404).json({ error: "Configuration not found" });
      }
      
      res.json(config);
    } catch (error) {
      console.error("Error fetching text config:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Save text positioning configuration
  app.post("/api/text-config/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const validation = textConfigSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid configuration format",
          details: validation.error.issues 
        });
      }
      
      const savedConfig = await storage.saveTextPositionConfig(name, validation.data);
      res.json(savedConfig);
    } catch (error) {
      console.error("Error saving text config:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // List all text positioning configurations
  app.get("/api/text-configs", async (req, res) => {
    try {
      const configs = await storage.listTextPositionConfigs();
      res.json(configs);
    } catch (error) {
      console.error("Error listing text configs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

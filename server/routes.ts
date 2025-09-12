import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  pathRequestSchema, 
  chatRequestSchema 
} from "@shared/schema";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // File path endpoint - handles folder path submissions
  app.post("/api/path", async (req, res) => {
    console.log('POST /api/path endpoint called');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    try {
      // Validate request body using Zod schema
      const validationResult = pathRequestSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        console.log('Validation failed:', validationResult.error);
        return res.status(400).json({ 
          success: false, 
          error: "Invalid request: " + validationResult.error.issues.map(i => i.message).join(", ")
        });
      }
      
      const { path: folderPath } = validationResult.data;
      console.log('Validated folder path:', folderPath);

      // Validate that path exists and is a directory
      try {
        const stats = await fs.stat(folderPath);
        if (!stats.isDirectory()) {
          return res.status(400).json({ 
            success: false, 
            error: "Path is not a directory" 
          });
        }
      } catch (error) {
        return res.status(400).json({ 
          success: false, 
          error: "Directory does not exist or cannot be accessed" 
        });
      }

      // Store the folder path
      await storage.storeFolderPath(folderPath);

      // Scan for XML files
      const xmlFiles = await storage.scanXMLFiles(folderPath);

      res.json({ 
        success: true, 
        message: `Folder path accepted. Found ${xmlFiles.length} XML files.`,
        folderPath,
        xmlFilesCount: xmlFiles.length
      });
    } catch (error) {
      console.error("Error processing folder path:", error);
      res.status(500).json({ 
        success: false, 
        error: "Internal server error" 
      });
    }
  });

  // Chat endpoint - handles chat messages
  app.post("/api/chat", async (req, res) => {
    try {
      // Validate request body using Zod schema
      const validationResult = chatRequestSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid request: " + validationResult.error.issues.map(i => i.message).join(", ")
        });
      }
      
      const { message } = validationResult.data;

      // Store user message
      const userMessage = await storage.storeMessage({
        text: message,
        isUser: true,
        timestamp: new Date().toISOString()
      });

      // For now, return a basic response
      // This will be enhanced with AI integration later
      const botResponse = await storage.storeMessage({
        text: `I received your message: "${message}". I would analyze this with your financial data once you upload XML files through the browser option.`,
        isUser: false,
        timestamp: new Date().toISOString()
      });

      res.json({ 
        success: true,
        userMessage,
        botResponse
      });
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ 
        success: false, 
        error: "Internal server error" 
      });
    }
  });

  // Get chat history endpoint
  app.get("/api/chat/history", async (req, res) => {
    try {
      const messages = await storage.getAllMessages();
      res.json({ 
        success: true, 
        messages 
      });
    } catch (error) {
      console.error("Error retrieving chat history:", error);
      res.status(500).json({ 
        success: false, 
        error: "Internal server error" 
      });
    }
  });

  // Get current folder info endpoint
  app.get("/api/folder", async (req, res) => {
    try {
      const folderInfo = await storage.getCurrentFolder();
      res.json({ 
        success: true, 
        folderInfo 
      });
    } catch (error) {
      console.error("Error retrieving folder info:", error);
      res.status(500).json({ 
        success: false, 
        error: "Internal server error" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHabitSchema, insertUserSessionSchema, type Habit } from "@shared/schema";
import { z } from "zod";

// Simple user session middleware 
function getUserId(req: any): string {
  // Get user ID from header or generate a new one
  let userId = req.headers['x-user-id'] as string;
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  return userId;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all habits for user
  app.get("/api/habits", async (req, res) => {
    try {
      const userId = getUserId(req);
      const habits = await storage.getAllHabits(userId);
      res.setHeader('x-user-id', userId); // Send user ID back to client
      res.json(habits);
    } catch (error) {
      console.error("Error fetching habits:", error);
      res.status(500).json({ error: "Failed to fetch habits" });
    }
  });

  // Create a new habit
  app.post("/api/habits", async (req, res) => {
    try {
      const userId = getUserId(req);
      const validatedData = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit(validatedData, userId);
      res.setHeader('x-user-id', userId);
      res.status(201).json(habit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid habit data", details: error.errors });
      } else {
        console.error("Error creating habit:", error);
        res.status(500).json({ error: "Failed to create habit" });
      }
    }
  });

  // Update a habit
  app.patch("/api/habits/:id", async (req, res) => {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const updates = req.body;
      
      // Convert ISO string dates back to Date objects for database
      if (updates.lastTrackedDate) {
        updates.lastTrackedDate = new Date(updates.lastTrackedDate);
      }
      
      const habit = await storage.updateHabit(id, userId, updates);
      if (!habit) {
        return res.status(404).json({ error: "Habit not found" });
      }
      
      res.setHeader('x-user-id', userId);
      res.json(habit);
    } catch (error) {
      console.error("Error updating habit:", error);
      res.status(500).json({ error: "Failed to update habit" });
    }
  });

  // Delete a habit
  app.delete("/api/habits/:id", async (req, res) => {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const success = await storage.deleteHabit(id, userId);
      if (!success) {
        return res.status(404).json({ error: "Habit not found" });
      }
      res.setHeader('x-user-id', userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting habit:", error);
      res.status(500).json({ error: "Failed to delete habit" });
    }
  });

  // Session management routes

  // Get a specific session
  app.get("/api/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getUserSession(sessionId);
      
      if (!session) {
        res.status(404).json({ error: "Session not found" });
        return;
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  // Get all sessions (for management interface)
  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllUserSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // Create/save a session with name
  app.post("/api/sessions", async (req, res) => {
    try {
      const validatedData = insertUserSessionSchema.parse(req.body);
      const session = await storage.createUserSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid session data", details: error.errors });
      } else {
        console.error("Error creating session:", error);
        res.status(500).json({ error: "Failed to create session" });
      }
    }
  });

  // Update session (e.g., change name)
  app.patch("/api/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const updates = req.body;
      
      const session = await storage.updateUserSession(sessionId, updates);
      
      if (!session) {
        res.status(404).json({ error: "Session not found" });
        return;
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  // Delete a saved session
  app.delete("/api/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const deleted = await storage.deleteUserSession(sessionId);
      
      if (!deleted) {
        res.status(404).json({ error: "Session not found" });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting session:", error);
      res.status(500).json({ error: "Failed to delete session" });
    }
  });

  // Update session last used timestamp
  app.post("/api/sessions/:sessionId/touch", async (req, res) => {
    try {
      const { sessionId } = req.params;
      await storage.updateSessionLastUsed(sessionId);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error updating session last used:", error);
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

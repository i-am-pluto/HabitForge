import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHabitSchema, type Habit } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all habits
  app.get("/api/habits", async (req, res) => {
    try {
      const habits = await storage.getAllHabits();
      res.json(habits);
    } catch (error) {
      console.error("Error fetching habits:", error);
      res.status(500).json({ error: "Failed to fetch habits" });
    }
  });

  // Create a new habit
  app.post("/api/habits", async (req, res) => {
    try {
      const validatedData = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit(validatedData);
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
      const { id } = req.params;
      const updates = req.body;
      
      // Convert ISO string dates back to Date objects for database
      if (updates.lastTrackedDate) {
        updates.lastTrackedDate = new Date(updates.lastTrackedDate);
      }
      
      const habit = await storage.updateHabit(id, updates);
      if (!habit) {
        return res.status(404).json({ error: "Habit not found" });
      }
      
      res.json(habit);
    } catch (error) {
      console.error("Error updating habit:", error);
      res.status(500).json({ error: "Failed to update habit" });
    }
  });

  // Delete a habit
  app.delete("/api/habits/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteHabit(id);
      if (!success) {
        return res.status(404).json({ error: "Habit not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting habit:", error);
      res.status(500).json({ error: "Failed to delete habit" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

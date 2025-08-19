import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Zod schemas for validation
export const habitSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1, "Habit name is required"),
  category: z.enum([
    "Health & Fitness",
    "Learning", 
    "Productivity",
    "Mindfulness",
    "Creative",
    "Social"
  ]),
  x1: z.number().min(0),
  x2: z.number().min(0),
  createdAt: z.string(),
  lastTrackedDate: z.string().optional(),
  completedDates: z.array(z.string()),
  missedDates: z.array(z.string())
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  createdAt: true,
  lastTrackedDate: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  createdAt: true,
  lastUsed: true,
});

// TypeScript types
export type Habit = z.infer<typeof habitSchema>;
export type InsertHabit = z.infer<typeof insertHabitSchema>;

// PostgreSQL Tables
export const habits = pgTable("habits", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  x1: integer("x1").default(0).notNull(),
  x2: integer("x2").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedDates: jsonb("completed_dates").$type<string[]>().default([]).notNull(),
  missedDates: jsonb("missed_dates").$type<string[]>().default([]).notNull(),
  lastTrackedDate: timestamp("last_tracked_date"),
});

export const userSessions = pgTable("user_sessions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsed: timestamp("last_used").defaultNow().notNull(),
});

// Relations
export const userSessionsRelations = relations(userSessions, ({ many }) => ({
  habits: many(habits),
}));

export const habitsRelations = relations(habits, ({ one }) => ({
  userSession: one(userSessions, {
    fields: [habits.userId],
    references: [userSessions.id],
  }),
}));

// Export types
export type DBHabit = typeof habits.$inferSelect;
export type InsertDBHabit = typeof habits.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;

export interface HabitProgress {
  currentValue: number; // Current y-value from formula
  progress: number; // Percentage progress towards habit formation
  status: 'struggling' | 'building' | 'formed';
  daysToHabit: number; // Estimated days until habit formation
  successRate: number; // Percentage of successful days
}

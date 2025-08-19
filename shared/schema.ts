import { z } from "zod";
import { pgTable, text, integer, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// Drizzle table definition
export const habits = pgTable('habits', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  x1: integer('x1').notNull().default(0), // Success counter
  x2: integer('x2').notNull().default(0), // Missed counter
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastTrackedDate: timestamp('last_tracked_date', { withTimezone: true }),
  completedDates: text('completed_dates').array().notNull().default([]), // Array of ISO date strings
  missedDates: text('missed_dates').array().notNull().default([]) // Array of ISO date strings
});

// Zod schemas derived from Drizzle table
export const insertHabitSchema = createInsertSchema(habits, {
  name: z.string().min(1, "Habit name is required"),
  category: z.enum([
    "Health & Fitness",
    "Learning", 
    "Productivity",
    "Mindfulness",
    "Creative",
    "Social"
  ])
}).omit({
  id: true,
  x1: true,
  x2: true,
  createdAt: true,
  completedDates: true,
  missedDates: true,
  lastTrackedDate: true
});

export const selectHabitSchema = createSelectSchema(habits);

// TypeScript types
export type Habit = typeof habits.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;

// Legacy Zod schema for compatibility (convert timestamps to ISO strings)
export const habitSchema = z.object({
  id: z.string(),
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

// Helper function to convert database habit to frontend format
export function habitToFrontend(habit: Habit): z.infer<typeof habitSchema> {
  return {
    ...habit,
    category: habit.category as "Health & Fitness" | "Learning" | "Productivity" | "Mindfulness" | "Creative" | "Social",
    createdAt: habit.createdAt.toISOString(),
    lastTrackedDate: habit.lastTrackedDate?.toISOString(),
  };
}

export interface HabitProgress {
  currentValue: number; // Current y-value from formula
  progress: number; // Percentage progress towards habit formation
  status: 'struggling' | 'building' | 'formed';
  daysToHabit: number; // Estimated days until habit formation
  successRate: number; // Percentage of successful days
}

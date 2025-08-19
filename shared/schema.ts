import { z } from "zod";

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
  x1: z.number().min(0), // Success counter
  x2: z.number().min(0), // Missed counter
  createdAt: z.string(), // ISO date string
  lastTrackedDate: z.string().optional(), // ISO date string
  completedDates: z.array(z.string()), // Array of ISO date strings
  missedDates: z.array(z.string()) // Array of ISO date strings
});

export const insertHabitSchema = habitSchema.omit({ 
  id: true, 
  x1: true, 
  x2: true, 
  createdAt: true,
  completedDates: true,
  missedDates: true
});

export type Habit = z.infer<typeof habitSchema>;
export type InsertHabit = z.infer<typeof insertHabitSchema>;

export interface HabitProgress {
  currentValue: number; // Current y-value from formula
  progress: number; // Percentage progress towards habit formation
  status: 'struggling' | 'building' | 'formed';
  daysToHabit: number; // Estimated days until habit formation
  successRate: number; // Percentage of successful days
}

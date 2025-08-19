import { z } from "zod";
import mongoose, { Schema, Document } from "mongoose";

// Zod schemas for validation
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

export const insertHabitSchema = habitSchema.omit({
  id: true,
  x1: true,
  x2: true,
  createdAt: true,
  completedDates: true,
  missedDates: true,
  lastTrackedDate: true
});

// TypeScript types
export type Habit = z.infer<typeof habitSchema>;
export type InsertHabit = z.infer<typeof insertHabitSchema>;

// MongoDB Schema
export interface IHabit extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: "Health & Fitness" | "Learning" | "Productivity" | "Mindfulness" | "Creative" | "Social";
  x1: number;
  x2: number;
  createdAt: Date;
  lastTrackedDate?: Date;
  completedDates: string[];
  missedDates: string[];
}

const habitMongoSchema = new Schema<IHabit>({
  name: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ["Health & Fitness", "Learning", "Productivity", "Mindfulness", "Creative", "Social"]
  },
  x1: { type: Number, required: true, default: 0 },
  x2: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, required: true, default: Date.now },
  lastTrackedDate: { type: Date },
  completedDates: { type: [String], required: true, default: [] },
  missedDates: { type: [String], required: true, default: [] }
});

export const HabitModel = mongoose.model<IHabit>('Habit', habitMongoSchema);

// Helper function to convert MongoDB document to frontend format
export function habitToFrontend(habit: IHabit): Habit {
  return {
    id: habit._id.toString(),
    name: habit.name,
    category: habit.category,
    x1: habit.x1,
    x2: habit.x2,
    createdAt: habit.createdAt.toISOString(),
    lastTrackedDate: habit.lastTrackedDate?.toISOString(),
    completedDates: habit.completedDates,
    missedDates: habit.missedDates
  };
}

export interface HabitProgress {
  currentValue: number; // Current y-value from formula
  progress: number; // Percentage progress towards habit formation
  status: 'struggling' | 'building' | 'formed';
  daysToHabit: number; // Estimated days until habit formation
  successRate: number; // Percentage of successful days
}

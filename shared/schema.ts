import { z } from "zod";
import mongoose, { Schema, Document } from "mongoose";

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

export const insertHabitSchema = habitSchema.omit({
  id: true,
  userId: true,
  x1: true,
  x2: true,
  createdAt: true,
  completedDates: true,
  missedDates: true,
  lastTrackedDate: true
});

// User session schema for validation
export const userSessionSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  lastUsed: z.string(),
});

export const insertUserSessionSchema = userSessionSchema.omit({
  createdAt: true,
  lastUsed: true,
});

// TypeScript types
export type Habit = z.infer<typeof habitSchema>;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type UserSession = z.infer<typeof userSessionSchema>;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;

// MongoDB Schema for Habits
export interface IHabit extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
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
  userId: { type: String, required: true, index: true },
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

// MongoDB Schema for User Sessions
export interface IUserSession extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  name: string;
  createdAt: Date;
  lastUsed: Date;
}

const userSessionMongoSchema = new Schema<IUserSession>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  lastUsed: { type: Date, required: true, default: Date.now }
});

export const UserSessionModel = mongoose.model<IUserSession>('UserSession', userSessionMongoSchema);

// Helper function to convert MongoDB document to frontend format
export function habitToFrontend(habit: IHabit): Habit {
  return {
    id: habit._id.toString(),
    userId: habit.userId,
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

// Helper function to convert MongoDB user session to frontend format
export function userSessionToFrontend(session: IUserSession): UserSession {
  return {
    id: session.id,
    name: session.name,
    createdAt: session.createdAt.toISOString(),
    lastUsed: session.lastUsed.toISOString()
  };
}

export interface HabitProgress {
  currentValue: number; // Current y-value from formula
  progress: number; // Percentage progress towards habit formation
  status: 'struggling' | 'building' | 'formed';
  daysToHabit: number; // Estimated days until habit formation
  successRate: number; // Percentage of successful days
}

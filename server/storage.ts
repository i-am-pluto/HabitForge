import { type Habit, type InsertHabit } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getHabit(id: string): Promise<Habit | undefined>;
  getAllHabits(): Promise<Habit[]>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: string, habit: Partial<Habit>): Promise<Habit | undefined>;
  deleteHabit(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private habits: Map<string, Habit>;

  constructor() {
    this.habits = new Map();
  }

  async getHabit(id: string): Promise<Habit | undefined> {
    return this.habits.get(id);
  }

  async getAllHabits(): Promise<Habit[]> {
    return Array.from(this.habits.values());
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const id = randomUUID();
    const habit: Habit = { 
      ...insertHabit, 
      id,
      x1: 0,
      x2: 0,
      createdAt: new Date().toISOString(),
      completedDates: [],
      missedDates: []
    };
    this.habits.set(id, habit);
    return habit;
  }

  async updateHabit(id: string, updates: Partial<Habit>): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit) return undefined;
    
    const updatedHabit = { ...habit, ...updates };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }

  async deleteHabit(id: string): Promise<boolean> {
    return this.habits.delete(id);
  }
}

export const storage = new MemStorage();

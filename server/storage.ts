import { HabitModel, type Habit, type InsertHabit, type IHabit, habitToFrontend } from "@shared/schema";
import connectToDatabase from "./db";
import mongoose from "mongoose";

export interface IStorage {
  getHabit(id: string): Promise<Habit | undefined>;
  getAllHabits(): Promise<Habit[]>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: string, updates: Partial<Omit<Habit, 'id'>>): Promise<Habit | undefined>;
  deleteHabit(id: string): Promise<boolean>;
}

// In-memory storage fallback for when MongoDB is not available
export class MemStorage implements IStorage {
  private habits: Map<string, Habit> = new Map();
  private idCounter = 1;

  private generateId(): string {
    return `habit_${this.idCounter++}_${Date.now()}`;
  }

  async getHabit(id: string): Promise<Habit | undefined> {
    return this.habits.get(id);
  }

  async getAllHabits(): Promise<Habit[]> {
    return Array.from(this.habits.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const habit: Habit = {
      id: this.generateId(),
      ...insertHabit,
      x1: 0,
      x2: 0,
      createdAt: new Date().toISOString(),
      completedDates: [],
      missedDates: []
    };
    
    this.habits.set(habit.id, habit);
    return habit;
  }

  async updateHabit(id: string, updates: Partial<Omit<Habit, 'id'>>): Promise<Habit | undefined> {
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

export class DatabaseStorage implements IStorage {
  private fallback = new MemStorage();
  private mongoConnected = false;

  private async ensureConnection() {
    try {
      await connectToDatabase();
      this.mongoConnected = true;
    } catch (error) {
      console.warn('MongoDB connection failed, using in-memory storage:', error instanceof Error ? error.message : 'Unknown error');
      this.mongoConnected = false;
    }
  }

  async getHabit(id: string): Promise<Habit | undefined> {
    await this.ensureConnection();
    
    if (!this.mongoConnected) {
      return this.fallback.getHabit(id);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return undefined;
    }

    const habit = await HabitModel.findById(id);
    return habit ? habitToFrontend(habit) : undefined;
  }

  async getAllHabits(): Promise<Habit[]> {
    await this.ensureConnection();
    
    if (!this.mongoConnected) {
      return this.fallback.getAllHabits();
    }

    const habits = await HabitModel.find().sort({ createdAt: -1 });
    return habits.map(habitToFrontend);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    await this.ensureConnection();
    
    if (!this.mongoConnected) {
      return this.fallback.createHabit(insertHabit);
    }

    const habit = new HabitModel({
      ...insertHabit,
      x1: 0,
      x2: 0,
      completedDates: [],
      missedDates: [],
      createdAt: new Date()
    });
    
    await habit.save();
    return habitToFrontend(habit);
  }

  async updateHabit(id: string, updates: Partial<Omit<Habit, 'id'>>): Promise<Habit | undefined> {
    await this.ensureConnection();
    
    if (!this.mongoConnected) {
      return this.fallback.updateHabit(id, updates);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return undefined;
    }

    // Convert string dates back to Date objects for MongoDB
    const mongoUpdates: any = { ...updates };
    if (mongoUpdates.createdAt) {
      mongoUpdates.createdAt = new Date(mongoUpdates.createdAt);
    }
    if (mongoUpdates.lastTrackedDate) {
      mongoUpdates.lastTrackedDate = new Date(mongoUpdates.lastTrackedDate);
    }

    const habit = await HabitModel.findByIdAndUpdate(
      id, 
      mongoUpdates, 
      { new: true, runValidators: true }
    );
    
    return habit ? habitToFrontend(habit) : undefined;
  }

  async deleteHabit(id: string): Promise<boolean> {
    await this.ensureConnection();
    
    if (!this.mongoConnected) {
      return this.fallback.deleteHabit(id);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }

    const result = await HabitModel.findByIdAndDelete(id);
    return result !== null;
  }
}

export const storage = new DatabaseStorage();

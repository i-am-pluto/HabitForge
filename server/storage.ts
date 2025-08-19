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

export class DatabaseStorage implements IStorage {
  private async ensureConnection() {
    await connectToDatabase();
  }

  async getHabit(id: string): Promise<Habit | undefined> {
    await this.ensureConnection();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return undefined;
    }

    const habit = await HabitModel.findById(id);
    return habit ? habitToFrontend(habit) : undefined;
  }

  async getAllHabits(): Promise<Habit[]> {
    await this.ensureConnection();
    
    const habits = await HabitModel.find().sort({ createdAt: -1 });
    return habits.map(habitToFrontend);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    await this.ensureConnection();
    
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
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }

    const result = await HabitModel.findByIdAndDelete(id);
    return result !== null;
  }
}

export const storage = new DatabaseStorage();

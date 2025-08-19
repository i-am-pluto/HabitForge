import { habits, type Habit, type InsertHabit } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getHabit(id: string): Promise<Habit | undefined>;
  getAllHabits(): Promise<Habit[]>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: string, updates: Partial<Habit>): Promise<Habit | undefined>;
  deleteHabit(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getHabit(id: string): Promise<Habit | undefined> {
    const [habit] = await db.select().from(habits).where(eq(habits.id, id));
    return habit || undefined;
  }

  async getAllHabits(): Promise<Habit[]> {
    return await db.select().from(habits);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const [habit] = await db
      .insert(habits)
      .values(insertHabit)
      .returning();
    return habit;
  }

  async updateHabit(id: string, updates: Partial<Habit>): Promise<Habit | undefined> {
    const [habit] = await db
      .update(habits)
      .set(updates)
      .where(eq(habits.id, id))
      .returning();
    return habit || undefined;
  }

  async deleteHabit(id: string): Promise<boolean> {
    const result = await db.delete(habits).where(eq(habits.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();

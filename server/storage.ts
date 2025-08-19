import {
  HabitModel,
  UserSessionModel,
  type Habit,
  type InsertHabit,
  type IHabit,
  type UserSession,
  type InsertUserSession,
  type IUserSession,
  habitToFrontend,
  userSessionToFrontend,
} from "@shared/schema";
import connectToDatabase from "./db";
import mongoose from "mongoose";

export interface IStorage {
  getHabit(id: string, userId: string): Promise<Habit | undefined>;
  getAllHabits(userId: string): Promise<Habit[]>;
  createHabit(habit: InsertHabit, userId: string): Promise<Habit>;
  updateHabit(
    id: string,
    userId: string,
    updates: Partial<Omit<Habit, "id" | "userId">>,
  ): Promise<Habit | undefined>;
  deleteHabit(id: string, userId: string): Promise<boolean>;
  
  // Session management methods
  getUserSession(sessionId: string): Promise<UserSession | undefined>;
  getAllUserSessions(): Promise<UserSession[]>;
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  updateUserSession(sessionId: string, updates: Partial<InsertUserSession>): Promise<UserSession | undefined>;
  deleteUserSession(sessionId: string): Promise<boolean>;
  updateSessionLastUsed(sessionId: string): Promise<void>;
}

// In-memory storage fallback for when MongoDB is not available
export class MemStorage implements IStorage {
  private habits: Map<string, Habit> = new Map();
  private sessions: Map<string, UserSession> = new Map();
  private idCounter = 1;

  private generateId(): string {
    return `habit_${this.idCounter++}_${Date.now()}`;
  }

  async getHabit(id: string, userId: string): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    return habit && habit.userId === userId ? habit : undefined;
  }

  async getAllHabits(userId: string): Promise<Habit[]> {
    return Array.from(this.habits.values())
      .filter(habit => habit.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  async createHabit(insertHabit: InsertHabit, userId: string): Promise<Habit> {
    const habit: Habit = {
      id: this.generateId(),
      userId,
      ...insertHabit,
      x1: 0,
      x2: 0,
      createdAt: new Date().toISOString(),
      completedDates: [],
      missedDates: [],
    };

    this.habits.set(habit.id, habit);
    return habit;
  }

  async updateHabit(
    id: string,
    userId: string,
    updates: Partial<Omit<Habit, "id" | "userId">>,
  ): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit || habit.userId !== userId) return undefined;

    const updatedHabit = { ...habit, ...updates };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }

  async deleteHabit(id: string, userId: string): Promise<boolean> {
    const habit = this.habits.get(id);
    if (!habit || habit.userId !== userId) return false;
    return this.habits.delete(id);
  }

  // Session management methods for MemStorage
  async getUserSession(sessionId: string): Promise<UserSession | undefined> {
    return this.sessions.get(sessionId);
  }

  async getAllUserSessions(): Promise<UserSession[]> {
    return Array.from(this.sessions.values());
  }

  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const newSession: UserSession = {
      ...session,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    };
    this.sessions.set(session.id, newSession);
    return newSession;
  }

  async updateUserSession(sessionId: string, updates: Partial<InsertUserSession>): Promise<UserSession | undefined> {
    const session = this.sessions.get(sessionId);
    if (session) {
      const updatedSession = { ...session, ...updates };
      this.sessions.set(sessionId, updatedSession);
      return updatedSession;
    }
    return undefined;
  }

  async deleteUserSession(sessionId: string): Promise<boolean> {
    return this.sessions.delete(sessionId);
  }

  async updateSessionLastUsed(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastUsed = new Date().toISOString();
      this.sessions.set(sessionId, session);
    }
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
      console.error("MongoDB connection error:", error);
      console.log(
        "MongoDB connection failed, using in-memory storage as fallback",
      );
      this.mongoConnected = false;
    }
  }

  async getHabit(id: string, userId: string): Promise<Habit | undefined> {
    await this.ensureConnection();

    if (!this.mongoConnected) {
      return this.fallback.getHabit(id, userId);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return undefined;
    }

    try {
      const habit = await HabitModel.findOne({ _id: id, userId });
      return habit ? habitToFrontend(habit) : undefined;
    } catch (error) {
      console.warn(
        "MongoDB read failed, falling back to memory storage:",
        error instanceof Error ? error.message : "Unknown error",
      );
      this.mongoConnected = false;
      return this.fallback.getHabit(id, userId);
    }
  }

  async getAllHabits(userId: string): Promise<Habit[]> {
    await this.ensureConnection();

    if (!this.mongoConnected) {
      return this.fallback.getAllHabits(userId);
    }

    try {
      const habits = await HabitModel.find({ userId }).sort({ createdAt: -1 });
      return habits.map(habitToFrontend);
    } catch (error) {
      console.warn(
        "MongoDB read failed, falling back to memory storage:",
        error instanceof Error ? error.message : "Unknown error",
      );
      this.mongoConnected = false;
      return this.fallback.getAllHabits(userId);
    }
  }

  async createHabit(insertHabit: InsertHabit, userId: string): Promise<Habit> {
    await this.ensureConnection();

    if (!this.mongoConnected) {
      return this.fallback.createHabit(insertHabit, userId);
    }

    try {
      const habit = new HabitModel({
        userId,
        ...insertHabit,
        x1: 0,
        x2: 0,
        completedDates: [],
        missedDates: [],
        createdAt: new Date(),
      });

      await habit.save();
      return habitToFrontend(habit);
    } catch (error) {
      console.warn(
        "MongoDB write failed, falling back to memory storage:",
        error instanceof Error ? error.message : "Unknown error",
      );
      this.mongoConnected = false;
      return this.fallback.createHabit(insertHabit, userId);
    }
  }

  async updateHabit(
    id: string,
    userId: string,
    updates: Partial<Omit<Habit, "id" | "userId">>,
  ): Promise<Habit | undefined> {
    await this.ensureConnection();

    if (!this.mongoConnected) {
      return this.fallback.updateHabit(id, userId, updates);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return undefined;
    }

    try {
      // Convert string dates back to Date objects for MongoDB
      const mongoUpdates: any = { ...updates };
      if (mongoUpdates.createdAt) {
        mongoUpdates.createdAt = new Date(mongoUpdates.createdAt);
      }
      if (mongoUpdates.lastTrackedDate) {
        mongoUpdates.lastTrackedDate = new Date(mongoUpdates.lastTrackedDate);
      }

      const habit = await HabitModel.findOneAndUpdate(
        { _id: id, userId },
        mongoUpdates,
        {
          new: true,
          runValidators: true,
        }
      );

      return habit ? habitToFrontend(habit) : undefined;
    } catch (error) {
      console.warn(
        "MongoDB update failed, falling back to memory storage:",
        error instanceof Error ? error.message : "Unknown error",
      );
      this.mongoConnected = false;
      return this.fallback.updateHabit(id, userId, updates);
    }
  }

  async deleteHabit(id: string, userId: string): Promise<boolean> {
    await this.ensureConnection();

    if (!this.mongoConnected) {
      return this.fallback.deleteHabit(id, userId);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }

    const result = await HabitModel.findOneAndDelete({ _id: id, userId });
    return result !== null;
  }

  // Session management methods for DatabaseStorage
  async getUserSession(sessionId: string): Promise<UserSession | undefined> {
    await this.ensureConnection();

    if (!this.mongoConnected) {
      return this.fallback.getUserSession(sessionId);
    }

    try {
      const session = await UserSessionModel.findOne({ id: sessionId });
      return session ? userSessionToFrontend(session) : undefined;
    } catch (error) {
      console.warn("MongoDB session read failed, falling back to memory storage:", error);
      this.mongoConnected = false;
      return this.fallback.getUserSession(sessionId);
    }
  }

  async getAllUserSessions(): Promise<UserSession[]> {
    await this.ensureConnection();

    if (!this.mongoConnected) {
      return this.fallback.getAllUserSessions();
    }

    try {
      const sessions = await UserSessionModel.find({}).sort({ lastUsed: -1 }).limit(10);
      return sessions.map(userSessionToFrontend);
    } catch (error) {
      console.warn("MongoDB session read failed, falling back to memory storage:", error);
      this.mongoConnected = false;
      return this.fallback.getAllUserSessions();
    }
  }

  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    await this.ensureConnection();

    if (!this.mongoConnected) {
      return this.fallback.createUserSession(session);
    }

    try {
      const newSession = new UserSessionModel(session);
      const savedSession = await newSession.save();
      return userSessionToFrontend(savedSession);
    } catch (error) {
      console.warn("MongoDB session create failed, falling back to memory storage:", error);
      this.mongoConnected = false;
      return this.fallback.createUserSession(session);
    }
  }

  async updateUserSession(sessionId: string, updates: Partial<InsertUserSession>): Promise<UserSession | undefined> {
    await this.ensureConnection();

    if (!this.mongoConnected) {
      return this.fallback.updateUserSession(sessionId, updates);
    }

    try {
      const session = await UserSessionModel.findOneAndUpdate(
        { id: sessionId },
        updates,
        { new: true }
      );
      return session ? userSessionToFrontend(session) : undefined;
    } catch (error) {
      console.warn("MongoDB session update failed, falling back to memory storage:", error);
      this.mongoConnected = false;
      return this.fallback.updateUserSession(sessionId, updates);
    }
  }

  async deleteUserSession(sessionId: string): Promise<boolean> {
    await this.ensureConnection();

    if (!this.mongoConnected) {
      return this.fallback.deleteUserSession(sessionId);
    }

    try {
      const result = await UserSessionModel.deleteOne({ id: sessionId });
      return result.deletedCount > 0;
    } catch (error) {
      console.warn("MongoDB session delete failed, falling back to memory storage:", error);
      this.mongoConnected = false;
      return this.fallback.deleteUserSession(sessionId);
    }
  }

  async updateSessionLastUsed(sessionId: string): Promise<void> {
    await this.ensureConnection();

    if (!this.mongoConnected) {
      return this.fallback.updateSessionLastUsed(sessionId);
    }

    try {
      await UserSessionModel.findOneAndUpdate(
        { id: sessionId },
        { lastUsed: new Date() },
        { upsert: false }
      );
    } catch (error) {
      console.warn("MongoDB session lastUsed update failed, falling back to memory storage:", error);
      this.mongoConnected = false;
      return this.fallback.updateSessionLastUsed(sessionId);
    }
  }
}

export const storage = new DatabaseStorage();

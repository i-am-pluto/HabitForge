import { habitSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "./queryClient";

// Use the legacy schema type that has string dates for frontend compatibility
type FrontendHabit = z.infer<typeof habitSchema>;

// API functions for habit management
export async function loadHabits(): Promise<FrontendHabit[]> {
  try {
    const response = await fetch('/api/habits');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const habits = await response.json();
    return habits;
  } catch (error) {
    console.error("Error loading habits from database:", error);
    return [];
  }
}

export async function saveHabit(habit: FrontendHabit): Promise<FrontendHabit> {
  try {
    const response = await fetch(`/api/habits/${habit.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(habit)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error saving habit to database:", error);
    throw error;
  }
}

export async function createHabit(habit: { name: string; category: string }): Promise<FrontendHabit> {
  try {
    const response = await fetch('/api/habits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(habit)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error creating habit in database:", error);
    throw error;
  }
}

export async function checkMissedDays(habits: FrontendHabit[]): Promise<FrontendHabit[]> {
  const today = new Date().toISOString().split('T')[0];
  
  console.log(`[Habit Tracker] Checking for missed days since last app session (today: ${today})`);
  
  const updatedHabits = [];
  
  for (const habit of habits) {
    const lastTracked = habit.lastTrackedDate?.split('T')[0];
    const createdDate = habit.createdAt.split('T')[0];
    
    // If habit was created today or already tracked today, no missed days
    if (createdDate === today || lastTracked === today) {
      updatedHabits.push(habit);
      continue;
    }
    
    // Determine starting point for missed day calculation
    let startDate: string;
    if (lastTracked) {
      // Start from day after last tracked
      const lastTrackedDate = new Date(lastTracked);
      lastTrackedDate.setDate(lastTrackedDate.getDate() + 1);
      startDate = lastTrackedDate.toISOString().split('T')[0];
    } else {
      // If never tracked, start from day after creation
      const createdDateObj = new Date(createdDate);
      createdDateObj.setDate(createdDateObj.getDate() + 1);
      startDate = createdDateObj.toISOString().split('T')[0];
    }
    
    // Calculate missed days from start date to today (excluding today)
    const missedDays = [];
    const current = new Date(startDate);
    const todayDate = new Date(today);
    
    while (current < todayDate) {
      const dateStr = current.toISOString().split('T')[0];
      // Only count as missed if it's not already tracked as completed or missed
      if (!habit.missedDates.includes(dateStr) && !habit.completedDates.includes(dateStr)) {
        missedDays.push(dateStr);
      }
      current.setDate(current.getDate() + 1);
    }
    
    if (missedDays.length > 0) {
      console.log(`[Habit Tracker] Habit "${habit.name}": Adding ${missedDays.length} missed days since ${startDate}`);
      const updatedHabit = {
        ...habit,
        x2: habit.x2 + missedDays.length,
        missedDates: [...habit.missedDates, ...missedDays]
      };
      
      try {
        const savedHabit = await saveHabit(updatedHabit);
        updatedHabits.push(savedHabit);
      } catch (error) {
        console.error(`Failed to save missed days for habit "${habit.name}":`, error);
        updatedHabits.push(habit);
      }
    } else {
      updatedHabits.push(habit);
    }
  }
  
  console.log(`[Habit Tracker] Finished checking missed days`);
  return updatedHabits;
}

// Function to record that the app was accessed (no longer needed with database)
export function recordAppAccess(): void {
  // No-op since we're using database now
}

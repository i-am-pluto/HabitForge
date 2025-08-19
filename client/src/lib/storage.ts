import { Habit } from "@shared/schema";

const STORAGE_KEY = "habit_tracker_data";

export interface StorageData {
  habits: Habit[];
  lastUpdated: string;
}

export function loadHabits(): Habit[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed: StorageData = JSON.parse(data);
    return parsed.habits || [];
  } catch (error) {
    console.error("Error loading habits from localStorage:", error);
    return [];
  }
}

export function saveHabits(habits: Habit[]): void {
  try {
    const data: StorageData = {
      habits,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving habits to localStorage:", error);
  }
}

export function checkMissedDays(): void {
  const habits = loadHabits();
  const today = new Date().toISOString().split('T')[0];
  let hasChanges = false;
  
  const updatedHabits = habits.map(habit => {
    const lastTracked = habit.lastTrackedDate?.split('T')[0];
    const createdDate = new Date(habit.createdAt).toISOString().split('T')[0];
    
    if (!lastTracked || lastTracked === today) {
      return habit;
    }
    
    // Calculate missed days between last tracked and today
    const missedDays = [];
    const current = new Date(lastTracked);
    const todayDate = new Date(today);
    
    current.setDate(current.getDate() + 1); // Start from day after last tracked
    
    while (current < todayDate) {
      const dateStr = current.toISOString().split('T')[0];
      if (!habit.missedDates.includes(dateStr) && !habit.completedDates.includes(dateStr)) {
        missedDays.push(dateStr);
      }
      current.setDate(current.getDate() + 1);
    }
    
    if (missedDays.length > 0) {
      hasChanges = true;
      return {
        ...habit,
        x2: habit.x2 + missedDays.length,
        missedDates: [...habit.missedDates, ...missedDays]
      };
    }
    
    return habit;
  });
  
  if (hasChanges) {
    saveHabits(updatedHabits);
  }
}

// Auto-check for missed days when the app loads
checkMissedDays();

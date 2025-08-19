import { Habit } from "@shared/schema";

const STORAGE_KEY = "habit_tracker_data";

export interface StorageData {
  habits: Habit[];
  lastUpdated: string;
  lastAppAccess: string; // Track when the app was last opened
}

export function loadHabits(): Habit[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed: StorageData = JSON.parse(data);
    
    // Log info about last access for debugging
    if (parsed.lastAppAccess) {
      const lastAccess = new Date(parsed.lastAppAccess);
      const now = new Date();
      const daysSinceAccess = Math.floor((now.getTime() - lastAccess.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceAccess > 0) {
        console.log(`[Habit Tracker] App was last accessed ${daysSinceAccess} day(s) ago`);
      }
    }
    
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
      lastUpdated: new Date().toISOString(),
      lastAppAccess: new Date().toISOString()
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
  
  console.log(`[Habit Tracker] Checking for missed days since last app session (today: ${today})`);
  
  const updatedHabits = habits.map(habit => {
    const lastTracked = habit.lastTrackedDate?.split('T')[0];
    const createdDate = new Date(habit.createdAt).toISOString().split('T')[0];
    
    // If habit was created today or already tracked today, no missed days
    if (createdDate === today || lastTracked === today) {
      return habit;
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
      hasChanges = true;
      console.log(`[Habit Tracker] Habit "${habit.name}": Adding ${missedDays.length} missed days since ${startDate}`);
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
    console.log(`[Habit Tracker] Updated habits with missed days and saved to localStorage`);
  } else {
    console.log(`[Habit Tracker] No missed days to update`);
  }
}

// Function to record that the app was accessed
export function recordAppAccess(): void {
  const habits = loadHabits();
  saveHabits(habits); // This will update the lastAppAccess timestamp
}

// Auto-check for missed days when the app loads
// This ensures that when the server restarts after being shut down,
// all missed days are properly calculated and x2 values are updated
checkMissedDays();
recordAppAccess();

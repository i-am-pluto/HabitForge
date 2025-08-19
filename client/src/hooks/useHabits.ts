import { useState, useEffect } from "react";
import { Habit, InsertHabit, HabitProgress } from "@shared/schema";
import { loadHabits, saveHabits, checkMissedDays, recordAppAccess } from "@/lib/storage";
import { 
  calculateHabitValue, 
  calculateProgress, 
  getHabitStatus, 
  calculateSuccessRate,
  estimateDaysToHabit
} from "@/lib/habitMath";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  useEffect(() => {
    // Check for missed days on load
    checkMissedDays();
    const loadedHabits = loadHabits();
    setHabits(loadedHabits);
    
    if (loadedHabits.length > 0 && !selectedHabitId) {
      setSelectedHabitId(loadedHabits[0].id);
    }
  }, [selectedHabitId]);

  const selectedHabit = habits.find(h => h.id === selectedHabitId);

  const addHabit = (insertHabit: InsertHabit) => {
    const newHabit: Habit = {
      ...insertHabit,
      id: crypto.randomUUID(),
      x1: 0,
      x2: 0,
      createdAt: new Date().toISOString(),
      completedDates: [],
      missedDates: []
    };
    
    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    saveHabits(updatedHabits);
    recordAppAccess(); // Record that user is actively using the app
    setSelectedHabitId(newHabit.id);
  };

  const trackHabit = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    const updatedHabits = habits.map(habit => {
      if (habit.id !== habitId) return habit;
      
      // Check if already tracked today
      if (habit.completedDates.includes(today)) {
        return habit;
      }
      
      return {
        ...habit,
        x1: habit.x1 + 1,
        lastTrackedDate: new Date().toISOString(),
        completedDates: [...habit.completedDates, today]
      };
    });
    
    setHabits(updatedHabits);
    saveHabits(updatedHabits);
    recordAppAccess(); // Record that user is actively using the app
  };

  const getHabitProgress = (habit: Habit): HabitProgress => {
    const daysSinceStart = Math.floor(
      (Date.now() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    
    const currentValue = calculateHabitValue(habit.x1, habit.x2);
    const progress = calculateProgress(habit.x1, habit.x2, daysSinceStart);
    const status = getHabitStatus(progress);
    const successRate = calculateSuccessRate(habit.completedDates, habit.missedDates);
    const daysToHabit = estimateDaysToHabit(habit.x1, habit.x2, daysSinceStart);
    
    return {
      currentValue,
      progress,
      status,
      daysToHabit,
      successRate
    };
  };

  const getCurrentStreak = (): number => {
    if (habits.length === 0) return 0;
    
    // Calculate overall streak based on any habit completion
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasAnyCompletion = habits.some(habit => 
        habit.completedDates.includes(dateStr)
      );
      
      if (hasAnyCompletion) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  return {
    habits,
    selectedHabit,
    selectedHabitId,
    setSelectedHabitId,
    addHabit,
    trackHabit,
    getHabitProgress,
    getCurrentStreak
  };
}

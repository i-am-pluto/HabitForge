import { useState, useEffect } from "react";
import { habitSchema, InsertHabit, HabitProgress } from "@shared/schema";
import { z } from "zod";
import { loadHabits, saveHabit, checkMissedDays, createHabit } from "@/lib/storage";

// Use the frontend-compatible habit type with string dates
type FrontendHabit = z.infer<typeof habitSchema>;
import { 
  calculateHabitValue, 
  calculateProgress, 
  getHabitStatus, 
  calculateSuccessRate,
  estimateDaysToHabit,
  getSuccessfulDaysLast60,
  getMissedDaysLast60,
  isHabitFormed
} from "@/lib/habitMath";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useHabits() {
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Load habits from database
  const { data: habits = [], isLoading, error } = useQuery({
    queryKey: ['/api/habits'],
    queryFn: async () => {
      const habits = await loadHabits();
      // Check for missed days after loading
      return await checkMissedDays(habits);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true
  });

  useEffect(() => {
    if (habits.length > 0 && !selectedHabitId) {
      setSelectedHabitId(habits[0].id);
    }
  }, [habits, selectedHabitId]);

  const selectedHabit = habits.find(h => h.id === selectedHabitId);

  // Create habit mutation
  const addHabitMutation = useMutation({
    mutationFn: createHabit,
    onSuccess: (newHabit) => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      setSelectedHabitId(newHabit.id);
    }
  });

  const addHabit = (insertHabit: InsertHabit) => {
    addHabitMutation.mutate(insertHabit);
  };

  // Track habit mutation
  const trackHabitMutation = useMutation({
    mutationFn: async (habitId: string) => {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) throw new Error('Habit not found');
      
      const today = new Date().toISOString().split('T')[0];
      
      // Check if already tracked today
      if (habit.completedDates.includes(today)) {
        return habit;
      }
      
      const updatedHabit = {
        ...habit,
        x1: habit.x1 + 1,
        lastTrackedDate: new Date().toISOString(),
        completedDates: [...habit.completedDates, today]
      };
      
      return await saveHabit(updatedHabit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
    }
  });

  const trackHabit = (habitId: string) => {
    trackHabitMutation.mutate(habitId);
  };

  // Delete habit mutation
  const deleteHabitMutation = useMutation({
    mutationFn: async (habitId: string) => {
      const response = await apiRequest('DELETE', `/api/habits/${habitId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      // If deleted habit was selected, clear selection or select first habit
      if (selectedHabitId && habits.length > 1) {
        const remainingHabits = habits.filter(h => h.id !== selectedHabitId);
        if (remainingHabits.length > 0) {
          setSelectedHabitId(remainingHabits[0].id);
        } else {
          setSelectedHabitId(null);
        }
      } else if (habits.length === 1) {
        setSelectedHabitId(null);
      }
    }
  });

  const deleteHabit = (habitId: string) => {
    deleteHabitMutation.mutate(habitId);
  };

  const getHabitProgress = (habit: FrontendHabit): HabitProgress => {
    const successfulDays = getSuccessfulDaysLast60(habit.completedDates);
    
    const currentValue = calculateHabitValue(successfulDays);
    const progress = calculateProgress(successfulDays);
    const status = getHabitStatus(currentValue);
    const successRate = calculateSuccessRate(habit.completedDates, habit.missedDates);
    const daysToHabit = estimateDaysToHabit(successfulDays);
    
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
    deleteHabit,
    getHabitProgress,
    getCurrentStreak,
    isLoading,
    error,
    isAddingHabit: addHabitMutation.isPending,
    isTrackingHabit: trackHabitMutation.isPending,
    isDeletingHabit: deleteHabitMutation.isPending
  };
}

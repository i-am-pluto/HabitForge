export function calculateHabitValue(x1: number, x2: number): number {
  // Weighted exponential formula: y = 0.5 * e^(0.18*(x1-x2))
  // This ensures it takes ~20+ days to form a habit with consistent practice
  return 0.5 * Math.exp(0.18 * (x1 - x2));
}

export function isHabitFormed(x1: number, x2: number, daysSinceStart: number): boolean {
  const yValue = calculateHabitValue(x1, x2);
  return yValue >= daysSinceStart;
}

export function estimateDaysToHabit(x1: number, x2: number, daysSinceStart: number): number {
  if (isHabitFormed(x1, x2, daysSinceStart)) {
    return 0;
  }
  
  // Estimate how many more successful days needed
  // Solve for x1 when y = daysSinceStart
  // daysSinceStart = 0.5 * e^(0.18*(x1_needed - x2))
  // ln(daysSinceStart / 0.5) = 0.18 * (x1_needed - x2)
  // x1_needed = (ln(daysSinceStart / 0.5) / 0.18) + x2
  
  const targetX1 = Math.max(x1, (Math.log(daysSinceStart / 0.5) / 0.18) + x2);
  return Math.ceil(targetX1 - x1);
}

export function calculateProgress(x1: number, x2: number, daysSinceStart: number): number {
  const currentValue = calculateHabitValue(x1, x2);
  const targetValue = daysSinceStart;
  
  if (currentValue >= targetValue) {
    return 100;
  }
  
  // Progress based on how close we are to the target
  return Math.min(95, (currentValue / targetValue) * 100);
}

export function getHabitStatus(progress: number): 'struggling' | 'building' | 'formed' {
  if (progress >= 100) return 'formed';
  if (progress >= 50) return 'building';
  return 'struggling';
}

export function calculateSuccessRate(completedDates: string[], missedDates: string[]): number {
  const totalDays = completedDates.length + missedDates.length;
  if (totalDays === 0) return 0;
  return (completedDates.length / totalDays) * 100;
}

export function generateGraphData(x1: number, x2: number, maxDays: number = 50, createdAt?: string) {
  const habitData = [];
  const thresholdData = [];
  
  // Calculate current day number based on habit creation date
  const currentDayNumber = createdAt ? getCurrentDayNumber(createdAt) : 1;
  
  for (let day = 1; day <= maxDays; day++) {
    let yValue: number;
    
    if (day <= currentDayNumber) {
      // For past/current days, use actual progress
      const actualX1 = Math.min(x1, day); // Can't have more successes than days passed
      yValue = calculateHabitValue(actualX1, x2);
    } else {
      // For future days, project assuming continued success
      const projectedX1 = x1 + (day - currentDayNumber);
      yValue = calculateHabitValue(projectedX1, x2);
    }
    
    habitData.push({ x: day, y: yValue });
    thresholdData.push({ x: day, y: day });
  }
  
  return { habitData, thresholdData };
}

function getCurrentDayNumber(createdAt: string): number {
  const created = new Date(createdAt);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

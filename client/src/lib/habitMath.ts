export function calculateHabitValue(x1: number, x2: number): number {
  // Weighted exponential formula: y = 0.5 * e^(0.05*(x1-x2))
  // This ensures it takes ~20+ days to form a habit with consistent practice
  return 0.5 * Math.exp(0.05 * (x1 - x2));
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
  // daysSinceStart = 0.5 * e^(0.05*(x1_needed - x2))
  // ln(daysSinceStart / 0.5) = 0.05 * (x1_needed - x2)
  // x1_needed = (ln(daysSinceStart / 0.5) / 0.05) + x2
  
  const targetX1 = Math.max(x1, (Math.log(daysSinceStart / 0.5) / 0.05) + x2);
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

export function generateGraphData(x1: number, x2: number, maxDays: number = 40) {
  const habitData = [];
  const thresholdData = [];
  
  for (let day = 1; day <= maxDays; day++) {
    // Project habit curve assuming consistent future success
    const projectedX1 = x1 + Math.max(0, day - getCurrentDayNumber());
    const yValue = calculateHabitValue(projectedX1, x2);
    
    habitData.push({ x: day, y: yValue });
    thresholdData.push({ x: day, y: day });
  }
  
  return { habitData, thresholdData };
}

function getCurrentDayNumber(): number {
  // This would be calculated based on habit start date
  // For now, return a placeholder
  return 18;
}

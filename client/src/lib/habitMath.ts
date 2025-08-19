// New sigmoid formula for habit formation
// H(d) = 1 / (1 + e^{-k(d - d₀)})
// Where:
// - d is the number of successful days in last 30 days
// - k = 0.2 (steepness factor)
// - d₀ = 0.19 (inflection point where habit strength = 0.5)
// - 0.5 output represents tipping point where habit formation begins
export function calculateHabitValue(successfulDays: number): number {
  const k = 0.2;
  const d0 = 0.19;
  const d = successfulDays;
  
  const exponent = -k * (d - d0);
  const result = 1 / (1 + Math.exp(exponent));
  
  return result;
}

export function isHabitFormed(successfulDays: number): boolean {
  const habitStrength = calculateHabitValue(successfulDays);
  return habitStrength >= 0.5; // Tipping point threshold
}

export function estimateDaysToHabit(currentSuccessfulDays: number): number {
  if (isHabitFormed(currentSuccessfulDays)) {
    return 0;
  }
  
  // Solve for d when H(d) = 0.5 (tipping point)
  // 0.5 = 1 / (1 + e^{-k(d - d₀)})
  // Solving: d = d₀ + ln(1) / k = d₀ = 0.19
  // So we need approximately 1 successful day to reach tipping point
  const k = 0.2;
  const d0 = 0.19;
  
  // For habit strength of 0.8 (strong habit), solve:
  // 0.8 = 1 / (1 + e^{-k(d - d₀)})
  // d = d₀ - ln((1/0.8) - 1) / k
  const targetStrength = 0.8;
  const targetDays = d0 - Math.log((1/targetStrength) - 1) / k;
  
  return Math.max(0, Math.ceil(targetDays - currentSuccessfulDays));
}

export function calculateProgress(successfulDays: number): number {
  const habitStrength = calculateHabitValue(successfulDays);
  
  // Progress is based on habit strength from 0 to 1
  // 0.5 = 50% (tipping point), 1.0 = 100% (fully formed)
  return Math.min(100, habitStrength * 100);
}

export function getHabitStatus(habitStrength: number): 'struggling' | 'building' | 'formed' {
  if (habitStrength >= 0.8) return 'formed';      // Strong habit (80%+)
  if (habitStrength >= 0.5) return 'building';    // Past tipping point (50%+)
  return 'struggling';                             // Below tipping point (<50%)
}

export function calculateSuccessRate(completedDates: string[], missedDates: string[]): number {
  const totalDays = completedDates.length + missedDates.length;
  if (totalDays === 0) return 0;
  return (completedDates.length / totalDays) * 100;
}

export function generateGraphData(successfulDaysLast30: number, maxDays: number = 30) {
  const habitData = [];
  const thresholdData = [];
  
  for (let day = 0; day <= maxDays; day++) {
    const habitStrength = calculateHabitValue(day);
    
    habitData.push({ x: day, y: habitStrength });
    thresholdData.push({ x: day, y: 0.5 }); // Tipping point threshold line
  }
  
  return { habitData, thresholdData, currentPoint: { x: successfulDaysLast30, y: calculateHabitValue(successfulDaysLast30) } };
}

// Helper function to filter dates to last 30 days
export function filterLast30Days(dates: string[]): string[] {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  return dates.filter(dateStr => {
    const date = new Date(dateStr);
    return date >= thirtyDaysAgo && date <= today;
  });
}

// Calculate successful days in last 30 days
export function getSuccessfulDaysLast30(completedDates: string[]): number {
  return filterLast30Days(completedDates).length;
}

// Calculate missed days in last 30 days
export function getMissedDaysLast30(missedDates: string[]): number {
  return filterLast30Days(missedDates).length;
}

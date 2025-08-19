import { Habit } from "@shared/schema";

interface HabitCalendarProps {
  habit: Habit;
}

export function HabitCalendar({ habit }: HabitCalendarProps) {
  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get first day of month and calculate starting point
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split('T')[0];
      const isCurrentMonth = current.getMonth() === currentMonth;
      const isToday = dateStr === today.toISOString().split('T')[0];
      const isCompleted = habit.completedDates.includes(dateStr);
      const isMissed = habit.missedDates.includes(dateStr);
      const isFuture = current > today;
      const isBeforeHabit = current < new Date(habit.createdAt);
      
      days.push({
        date: new Date(current),
        dateStr,
        day: current.getDate(),
        isCurrentMonth,
        isToday,
        isCompleted,
        isMissed,
        isFuture,
        isBeforeHabit
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const days = generateCalendarDays();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDayClassName = (day: any) => {
    let baseClass = "h-10 w-10 rounded-lg flex items-center justify-center text-sm";
    
    if (!day.isCurrentMonth || day.isBeforeHabit) {
      return `${baseClass} bg-gray-100 text-gray-400`;
    }
    
    if (day.isFuture) {
      return `${baseClass} bg-gray-200 text-gray-500`;
    }
    
    if (day.isToday) {
      return `${baseClass} bg-primary ring-2 ring-primary ring-offset-2 text-white font-bold`;
    }
    
    if (day.isCompleted) {
      return `${baseClass} bg-success text-white font-medium`;
    }
    
    if (day.isMissed) {
      return `${baseClass} bg-warning text-white font-medium`;
    }
    
    return `${baseClass} bg-gray-200 text-gray-500`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" data-testid="habit-calendar">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">30-Day Tracking History</h3>
          <p className="text-muted">Visual progress over the last month</p>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-sm"></div>
            <span className="text-muted">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-warning rounded-sm"></div>
            <span className="text-muted">Missed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
            <span className="text-muted">Future</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayNames.map(name => (
          <div key={name} className="text-center text-sm font-medium text-muted py-2">
            {name}
          </div>
        ))}
        
        {days.map((day, index) => (
          <div
            key={index}
            className={getDayClassName(day)}
            data-testid={`calendar-day-${day.dateStr}`}
          >
            {day.day}
          </div>
        ))}
      </div>
    </div>
  );
}

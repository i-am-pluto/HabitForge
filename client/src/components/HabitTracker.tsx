import { useState } from "react";
import { useHabits } from "@/hooks/useHabits";
import { HabitGraph } from "./HabitGraph";
import { HabitCalendar } from "./HabitCalendar";
import { AddHabitModal } from "./AddHabitModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HabitTracker() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { 
    habits, 
    selectedHabit, 
    selectedHabitId,
    setSelectedHabitId, 
    addHabit, 
    trackHabit, 
    getHabitProgress, 
    getCurrentStreak 
  } = useHabits();

  const currentStreak = getCurrentStreak();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'formed': return 'bg-success/10 text-success';
      case 'building': return 'bg-primary/10 text-primary';
      case 'struggling': return 'bg-warning/10 text-warning';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'formed': return 'fas fa-check-circle';
      case 'building': return 'fas fa-clock';
      case 'struggling': return 'fas fa-exclamation-triangle';
      default: return 'fas fa-circle';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'formed': return 'Habit Formed!';
      case 'building': return 'Building';
      case 'struggling': return 'Struggling';
      default: return 'Starting';
    }
  };

  const isTrackedToday = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return false;
    const today = new Date().toISOString().split('T')[0];
    return habit.completedDates.includes(today);
  };

  const getDaysSinceStart = (createdAt: string) => {
    return Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <i className="fas fa-chart-line text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Habit Tracker</h1>
              <p className="text-sm text-muted">Mathematical habit formation</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-secondary/10 px-3 py-1.5 rounded-full">
              <i className="fas fa-fire text-secondary text-sm"></i>
              <span className="text-sm font-medium text-secondary" data-testid="current-streak">
                {currentStreak} day streak
              </span>
            </div>
            
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="fas fa-user text-muted text-sm"></i>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Habits List */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Your Habits</CardTitle>
                <p className="text-sm text-muted">Track your daily progress</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {habits.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-plus-circle text-4xl text-gray-300 mb-4"></i>
                    <p className="text-muted mb-4">No habits yet. Start your journey!</p>
                  </div>
                ) : (
                  habits.map(habit => {
                    const progress = getHabitProgress(habit);
                    const isSelected = habit.id === selectedHabitId;
                    const tracked = isTrackedToday(habit.id);
                    
                    return (
                      <div
                        key={habit.id}
                        className={`habit-item p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected 
                            ? 'ring-2 ring-primary bg-primary/5 border-primary/20' 
                            : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedHabitId(habit.id)}
                        data-testid={`habit-item-${habit.id}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-gray-900">{habit.name}</h3>
                          <div className="relative w-8 h-8">
                            <svg className="habit-progress-ring w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                              <path 
                                className="text-gray-200" 
                                stroke="currentColor" 
                                strokeWidth="3" 
                                fill="none" 
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path 
                                className="text-primary" 
                                stroke="currentColor" 
                                strokeWidth="3" 
                                fill="none" 
                                strokeDasharray={`${progress.progress}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-700">
                                {Math.round(progress.progress)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <p className="text-sm font-medium text-secondary">{habit.x1}</p>
                              <p className="text-xs text-muted">Success (x1)</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-warning">{habit.x2}</p>
                              <p className="text-xs text-muted">Missed (x2)</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {progress.currentValue.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted">Current y-value</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(progress.status)}>
                            <i className={`${getStatusIcon(progress.status)} mr-1`}></i>
                            {getStatusText(progress.status)}
                          </Badge>
                          
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              trackHabit(habit.id);
                            }}
                            disabled={tracked}
                            data-testid={`button-track-${habit.id}`}
                          >
                            <i className="fas fa-check mr-1"></i>
                            {tracked ? 'Done!' : 'Done Today'}
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
                
                <Button
                  className="w-full py-3 bg-primary/10 text-primary hover:bg-primary/20"
                  variant="ghost"
                  onClick={() => setIsAddModalOpen(true)}
                  data-testid="button-add-habit"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add New Habit
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Habit Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedHabit ? (
              <>
                {/* Habit Header */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">{selectedHabit.name}</h2>
                      <p className="text-muted">Mathematical habit formation progress</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">
                          {getDaysSinceStart(selectedHabit.createdAt)}
                        </p>
                        <p className="text-sm text-muted">Days</p>
                      </div>
                      
                      <div className="w-px h-12 bg-gray-200"></div>
                      
                      <div className="text-center">
                        <p className="text-2xl font-bold text-secondary">
                          {Math.round(getHabitProgress(selectedHabit).successRate)}%
                        </p>
                        <p className="text-sm text-muted">Success Rate</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Formula Display */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted mb-1">Current Formula</p>
                        <p className="font-mono text-lg text-gray-900">y = 0.5 × e^(0.05×(x1-x2))</p>
                        <p className="text-sm text-muted mt-1">
                          y = 0.5 × e^(0.05×({selectedHabit.x1}-{selectedHabit.x2})) = {' '}
                          <span className="font-semibold text-primary">
                            {getHabitProgress(selectedHabit).currentValue.toFixed(2)}
                          </span>
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-muted">Habit forms when</p>
                        <p className="text-lg font-semibold text-gray-900">y ≥ x</p>
                        <p className="text-sm text-muted">
                          Current: {getHabitProgress(selectedHabit).currentValue.toFixed(2)} ≥ {getDaysSinceStart(selectedHabit.createdAt)}? {' '}
                          <span className={`font-semibold ${getHabitProgress(selectedHabit).status === 'formed' ? 'text-success' : 'text-warning'}`}>
                            {getHabitProgress(selectedHabit).status === 'formed' ? 'Yes' : 'No'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Indicators */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-secondary/10 rounded-xl">
                      <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-2">
                        <i className="fas fa-trophy text-white"></i>
                      </div>
                      <p className="text-lg font-semibold text-secondary">{selectedHabit.x1}</p>
                      <p className="text-sm text-muted">Successful days (x1)</p>
                    </div>
                    
                    <div className="text-center p-4 bg-warning/10 rounded-xl">
                      <div className="w-12 h-12 bg-warning rounded-xl flex items-center justify-center mx-auto mb-2">
                        <i className="fas fa-times text-white"></i>
                      </div>
                      <p className="text-lg font-semibold text-warning">{selectedHabit.x2}</p>
                      <p className="text-sm text-muted">Missed days (x2)</p>
                    </div>
                    
                    <div className="text-center p-4 bg-primary/10 rounded-xl">
                      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-2">
                        <i className="fas fa-chart-line text-white"></i>
                      </div>
                      <p className="text-lg font-semibold text-primary">
                        {getHabitProgress(selectedHabit).daysToHabit === 0 ? '✓' : `~${getHabitProgress(selectedHabit).daysToHabit}`}
                      </p>
                      <p className="text-sm text-muted">Days to habit</p>
                    </div>
                  </div>
                </Card>
                
                {/* Mathematical Visualization */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Habit Formation Graph</h3>
                      <p className="text-muted">Exponential growth vs. linear threshold</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="text-sm text-muted">Habit Curve (y = 0.5×e^(0.1×(x1-x2)))</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="text-sm text-muted">Threshold (y = x)</span>
                      </div>
                    </div>
                  </div>
                  
                  <HabitGraph x1={selectedHabit.x1} x2={selectedHabit.x2} />
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                        <i className="fas fa-info text-primary text-xs"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">How it works</p>
                        <p className="text-sm text-muted mt-1">
                          Your habit strength grows exponentially with consistent practice. The curve crosses the diagonal line when your habit is mathematically "formed" - typically after 20+ consistent days with minimal misses.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
                
                {/* Calendar */}
                <HabitCalendar habit={selectedHabit} />
              </>
            ) : (
              <Card className="p-12 text-center">
                <i className="fas fa-chart-line text-6xl text-gray-200 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Habit Selected</h3>
                <p className="text-muted mb-6">Add a habit to start tracking your mathematical progress</p>
                <Button onClick={() => setIsAddModalOpen(true)} data-testid="button-add-first-habit">
                  <i className="fas fa-plus mr-2"></i>
                  Add Your First Habit
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addHabit}
      />
    </div>
  );
}

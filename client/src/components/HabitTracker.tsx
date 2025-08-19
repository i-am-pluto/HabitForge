import { useState } from "react";
import { useHabits } from "@/hooks/useHabits";
import { HabitGraph } from "./HabitGraph";
import { HabitCalendar } from "./HabitCalendar";
import { AddHabitModal } from "./AddHabitModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { userSession } from "@/lib/userSession";
import { SessionManager } from "./SessionManager";
import { getCurrentStreak as getHabitStreak } from "@/lib/habitMath";


export function HabitTracker() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(userSession.getUserId());
  const [sessionKey, setSessionKey] = useState(0); // Force re-render on session changes
  const { 
    habits, 
    selectedHabit, 
    selectedHabitId,
    setSelectedHabitId, 
    addHabit, 
    trackHabit, 
    deleteHabit,
    getHabitProgress, 
    getCurrentStreak,
    isDeletingHabit
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

  const handleNewSession = () => {
    if (confirm('Create a new session? This will start fresh with no habits. Your current session will remain accessible with its unique ID.')) {
      const newUserId = userSession.createNewSession();
      setCurrentUserId(newUserId);
      window.location.reload(); // Reload to clear the cache and start fresh
    }
  };

  const copySessionId = () => {
    navigator.clipboard.writeText(currentUserId);
    alert('Session ID copied to clipboard! Share this ID with others to give them access to this habit tracker.');
  };

  const handleSessionChange = () => {
    setCurrentUserId(userSession.getUserId());
    setSessionKey(prev => prev + 1); // Force re-render
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
            
            {/* Session Management */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={copySessionId}
                className="text-xs"
                data-testid="button-share-session"
              >
                <i className="fas fa-share mr-1"></i>
                Share
              </Button>
              
              <SessionManager onSessionChange={handleSessionChange} />
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
                  (() => {
                    // Group habits by category
                    const habitsByCategory = habits.reduce((acc, habit) => {
                      if (!acc[habit.category]) {
                        acc[habit.category] = [];
                      }
                      acc[habit.category].push(habit);
                      return acc;
                    }, {} as Record<string, typeof habits>);

                    // Define category icons
                    const categoryIcons: Record<string, string> = {
                      "Health & Fitness": "fas fa-heartbeat",
                      "Learning": "fas fa-book",
                      "Productivity": "fas fa-tasks",
                      "Mindfulness": "fas fa-leaf",
                      "Creative": "fas fa-palette",
                      "Social": "fas fa-users"
                    };

                    return Object.entries(habitsByCategory).map(([category, categoryHabits]) => (
                      <div key={category} className="space-y-3">
                        {/* Category Header */}
                        <div className="flex items-center space-x-2 px-2">
                          <i className={`${categoryIcons[category]} text-primary text-sm`}></i>
                          <h4 className="font-medium text-gray-900 text-sm">{category}</h4>
                          <div className="flex-1 h-px bg-gray-200"></div>
                          <span className="text-xs text-muted">{categoryHabits.length}</span>
                        </div>

                        {/* Habits in this category */}
                        <div className="space-y-2">
                          {categoryHabits.map(habit => {
                            const progress = getHabitProgress(habit);
                            const isSelected = habit.id === selectedHabitId;
                            const tracked = isTrackedToday(habit.id);
                            
                            return (
                              <div
                                key={habit.id}
                                className={`habit-item p-3 rounded-xl border transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'ring-2 ring-primary bg-primary/5 border-primary/20' 
                                    : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                                }`}
                                onClick={() => setSelectedHabitId(habit.id)}
                                data-testid={`habit-item-${habit.id}`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-medium text-gray-900 text-sm">{habit.name}</h3>
                                  <div className="relative w-6 h-6">
                                    <svg className="habit-progress-ring w-6 h-6 transform -rotate-90" viewBox="0 0 36 36">
                                      <path 
                                        className="text-gray-200" 
                                        stroke="currentColor" 
                                        strokeWidth="4" 
                                        fill="none" 
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                      />
                                      <path 
                                        className="text-primary" 
                                        stroke="currentColor" 
                                        strokeWidth="4" 
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
                                
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-3">
                                    <div className="text-center">
                                      <p className="text-xs font-medium text-secondary">{getHabitStreak(habit.completedDates)}</p>
                                      <p className="text-xs text-muted">Streak</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs font-medium text-gray-900">
                                        {(progress.currentValue * 100).toFixed(0)}%
                                      </p>
                                      <p className="text-xs text-muted">Strength</p>
                                    </div>
                                  </div>
                                  
                                  <Badge className={`${getStatusColor(progress.status)} text-xs`}>
                                    {getStatusText(progress.status)}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      trackHabit(habit.id);
                                    }}
                                    disabled={tracked}
                                    data-testid={`button-track-${habit.id}`}
                                    className="flex-1 h-8 text-xs"
                                  >
                                    <i className="fas fa-check mr-1"></i>
                                    {tracked ? 'Done!' : 'Done Today'}
                                  </Button>
                                  
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm(`Are you sure you want to delete "${habit.name}"? This action cannot be undone.`)) {
                                        deleteHabit(habit.id);
                                      }
                                    }}
                                    disabled={isDeletingHabit}
                                    data-testid={`button-delete-${habit.id}`}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                  >
                                    <i className="fas fa-trash text-xs"></i>
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()
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
                        <p className="font-mono text-lg text-gray-900">H(d) = 1 / (1 + e^(-0.19(d - 25)))</p>
                        <p className="text-sm text-muted mt-1">
                          H({selectedHabit ? getHabitStreak(selectedHabit.completedDates) : 0}) = {' '}
                          <span className="font-semibold text-primary">
                            {getHabitProgress(selectedHabit).currentValue.toFixed(3)}
                          </span>
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-muted">Tipping point when</p>
                        <p className="text-lg font-semibold text-gray-900">H(d) ≥ 0.5</p>
                        <p className="text-sm text-muted">
                          Current: {getHabitProgress(selectedHabit).currentValue.toFixed(3)} ≥ 0.5? {' '}
                          <span className={`font-semibold ${getHabitProgress(selectedHabit).status !== 'struggling' ? 'text-success' : 'text-warning'}`}>
                            {getHabitProgress(selectedHabit).status !== 'struggling' ? 'Yes' : 'No'}
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
                      <p className="text-lg font-semibold text-secondary">{selectedHabit ? getHabitStreak(selectedHabit.completedDates) : 0}</p>
                      <p className="text-sm text-muted">Current streak (d)</p>
                    </div>
                    
                    <div className="text-center p-4 bg-warning/10 rounded-xl">
                      <div className="w-12 h-12 bg-warning rounded-xl flex items-center justify-center mx-auto mb-2">
                        <i className="fas fa-bullseye text-white"></i>
                      </div>
                      <p className="text-lg font-semibold text-warning">{(getHabitProgress(selectedHabit).currentValue * 100).toFixed(1)}%</p>
                      <p className="text-sm text-muted">Habit strength</p>
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
                
                {/* Mathematical Formula Display */}
                <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Mathematical Formula</h3>
                    <div className="bg-white p-4 rounded-lg border border-blue-200 mb-4">
                      <p className="text-2xl font-mono text-blue-800 font-semibold">
                        H(d) = 1 / (1 + e^(-0.19(d - 25)))
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-left">
                        <p><span className="font-semibold">H(d):</span> Habit strength (0-1)</p>
                        <p><span className="font-semibold">d:</span> Current streak day</p>
                      </div>
                      <div className="text-left">
                        <p><span className="font-semibold">k = 0.19:</span> Steepness factor</p>
                        <p><span className="font-semibold">d₀ = 25:</span> Inflection point</p>
                      </div>
                    </div>
                    <p className="text-sm text-blue-700 mt-3 font-medium">
                      Tipping Point: When H(d) = 0.5, habit formation begins accelerating
                    </p>
                  </div>
                </Card>

                {/* Mathematical Visualization */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Habit Formation Graph</h3>
                      <p className="text-muted">Sigmoid curve showing habit strength (0.5 = tipping point)</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="text-sm text-muted">Habit Strength (H(d) = 1/(1+e^(-0.19(d-25))))</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="text-sm text-muted">Tipping Point (y = 0.5)</span>
                      </div>
                    </div>
                  </div>
                  
                  <HabitGraph 
                    habit={selectedHabit} 
                  />
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                        <i className="fas fa-info text-primary text-xs"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">How it works</p>
                        <p className="text-sm text-muted mt-1">
                          Your habit strength follows the sigmoid formula H(d) = 1/(1+e^(-0.19(d-25))) where d is your current streak day. When you reach 0.5 (50%), you've hit the tipping point where habit formation begins accelerating.
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

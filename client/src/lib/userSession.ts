// Simple user session management without login
interface SavedSession {
  id: string;
  name: string;
  createdAt: string;
  lastUsed: string;
}

class UserSessionManager {
  private userId: string | null = null;

  constructor() {
    // Try to get user ID from localStorage
    this.userId = localStorage.getItem('habit-tracker-user-id');
  }

  getUserId(): string {
    if (!this.userId) {
      // Generate a new user ID if none exists
      this.userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('habit-tracker-user-id', this.userId);
    }
    this.updateLastUsed();
    return this.userId;
  }

  setUserId(userId: string): void {
    this.userId = userId;
    localStorage.setItem('habit-tracker-user-id', userId);
    this.updateLastUsed();
  }

  clearSession(): void {
    this.userId = null;
    localStorage.removeItem('habit-tracker-user-id');
  }

  // Create a new session (for sharing with others)
  createNewSession(): string {
    this.clearSession();
    return this.getUserId();
  }

  // Save current session with a name
  saveCurrentSession(name: string): void {
    const currentId = this.getUserId();
    const savedSessions = this.getSavedSessions();
    
    const session: SavedSession = {
      id: currentId,
      name: name.trim(),
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };

    // Remove existing session with same ID if it exists
    const filteredSessions = savedSessions.filter(s => s.id !== currentId);
    filteredSessions.push(session);

    // Keep only the last 10 sessions
    const sortedSessions = filteredSessions
      .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
      .slice(0, 10);

    localStorage.setItem('habit-tracker-saved-sessions', JSON.stringify(sortedSessions));
  }

  // Get all saved sessions
  getSavedSessions(): SavedSession[] {
    try {
      const saved = localStorage.getItem('habit-tracker-saved-sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  // Switch to a saved session
  switchToSession(sessionId: string): void {
    this.setUserId(sessionId);
  }

  // Update last used timestamp for current session
  private updateLastUsed(): void {
    const savedSessions = this.getSavedSessions();
    const currentId = this.userId;
    
    const updated = savedSessions.map(session => 
      session.id === currentId 
        ? { ...session, lastUsed: new Date().toISOString() }
        : session
    );

    if (updated.length > 0) {
      localStorage.setItem('habit-tracker-saved-sessions', JSON.stringify(updated));
    }
  }

  // Get current session name
  getCurrentSessionName(): string | null {
    const currentId = this.getUserId();
    const savedSessions = this.getSavedSessions();
    const current = savedSessions.find(s => s.id === currentId);
    return current?.name || null;
  }

  // Delete a saved session
  deleteSavedSession(sessionId: string): void {
    const savedSessions = this.getSavedSessions();
    const filtered = savedSessions.filter(s => s.id !== sessionId);
    localStorage.setItem('habit-tracker-saved-sessions', JSON.stringify(filtered));
  }
}

export const userSession = new UserSessionManager();
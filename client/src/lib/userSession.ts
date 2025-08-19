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
  async saveCurrentSession(name: string): Promise<void> {
    const currentId = this.getUserId();
    
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: currentId,
          name: name.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save session: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving session:', error);
      // Fallback to localStorage if API fails
      const savedSessions = this.getSavedSessions();
      
      const session: SavedSession = {
        id: currentId,
        name: name.trim(),
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      };

      const filteredSessions = savedSessions.filter(s => s.id !== currentId);
      filteredSessions.push(session);

      const sortedSessions = filteredSessions
        .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
        .slice(0, 10);

      localStorage.setItem('habit-tracker-saved-sessions', JSON.stringify(sortedSessions));
    }
  }

  // Get all saved sessions
  async getSavedSessions(): Promise<SavedSession[]> {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Failed to fetch sessions from API, using localStorage fallback:', error);
    }

    // Fallback to localStorage
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
  private async updateLastUsed(): Promise<void> {
    const currentId = this.userId;
    if (!currentId) return;
    
    try {
      await fetch(`/api/sessions/${currentId}/touch`, {
        method: 'POST'
      });
    } catch (error) {
      console.warn('Failed to update session last used timestamp:', error);
      // Fallback to localStorage
      const savedSessions = await this.getSavedSessions();
      const updated = savedSessions.map(session => 
        session.id === currentId 
          ? { ...session, lastUsed: new Date().toISOString() }
          : session
      );

      if (updated.length > 0) {
        localStorage.setItem('habit-tracker-saved-sessions', JSON.stringify(updated));
      }
    }
  }

  // Get current session name
  async getCurrentSessionName(): Promise<string | null> {
    const currentId = this.getUserId();
    
    try {
      const response = await fetch(`/api/sessions/${currentId}`);
      if (response.ok) {
        const session = await response.json();
        return session.name;
      }
    } catch (error) {
      console.warn('Failed to fetch current session from API, using localStorage fallback:', error);
    }

    // Fallback to localStorage
    const savedSessions = await this.getSavedSessions();
    const current = savedSessions.find(s => s.id === currentId);
    return current?.name || null;
  }

  // Delete a saved session
  async deleteSavedSession(sessionId: string): Promise<void> {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete session: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      // Fallback to localStorage if API fails
      const savedSessions = await this.getSavedSessions();
      const filtered = savedSessions.filter(s => s.id !== sessionId);
      localStorage.setItem('habit-tracker-saved-sessions', JSON.stringify(filtered));
    }
  }
}

export const userSession = new UserSessionManager();
// Simple user session management without login
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
    return this.userId;
  }

  setUserId(userId: string): void {
    this.userId = userId;
    localStorage.setItem('habit-tracker-user-id', userId);
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
}

export const userSession = new UserSessionManager();
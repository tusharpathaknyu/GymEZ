import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser, LoginCredentials, SignupCredentials } from './AuthService';

const USERS_KEY = '@gymez_users';
const CURRENT_USER_KEY = '@gymez_current_user';
const SESSION_KEY = '@gymez_session';

export class LocalAuthService {
  // Get all stored users
  private static async getStoredUsers(): Promise<AuthUser[]> {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Failed to get stored users:', error);
      return [];
    }
  }

  // Save users to storage
  private static async saveUsers(users: AuthUser[]): Promise<void> {
    try {
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Failed to save users:', error);
      throw new Error('Failed to save user data');
    }
  }

  // Set current user session
  private static async setCurrentUser(user: AuthUser): Promise<void> {
    try {
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      await AsyncStorage.setItem(SESSION_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Failed to set current user:', error);
      throw new Error('Failed to save user session');
    }
  }

  // Clear current user session
  private static async clearCurrentUser(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([CURRENT_USER_KEY, SESSION_KEY]);
    } catch (error) {
      console.error('Failed to clear current user:', error);
    }
  }

  // Validate email format
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  private static isValidPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  // Generate unique user ID
  private static generateUserId(): string {
    return 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
  }

  // Sign up new user with local storage
  static async signUp(credentials: SignupCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      // Validate input
      if (!this.isValidEmail(credentials.email)) {
        return { user: null, error: 'Please enter a valid email address' };
      }

      if (!this.isValidPassword(credentials.password)) {
        return { user: null, error: 'Password must be at least 8 characters with uppercase, lowercase, and number' };
      }

      if (!credentials.fullName.trim()) {
        return { user: null, error: 'Full name is required' };
      }

      // Check if user already exists
      const existingUsers = await this.getStoredUsers();
      const existingUser = existingUsers.find(user => user.email.toLowerCase() === credentials.email.toLowerCase());
      
      if (existingUser) {
        return { user: null, error: 'An account with this email already exists' };
      }

      // Create new user
      const newUser: AuthUser = {
        id: this.generateUserId(),
        email: credentials.email.toLowerCase(),
        full_name: credentials.fullName,
        user_type: credentials.userType,
        is_private: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Save user to storage
      const updatedUsers = [...existingUsers, newUser];
      await this.saveUsers(updatedUsers);
      
      // Set as current user
      await this.setCurrentUser(newUser);

      return { user: newUser, error: null };
    } catch (error) {
      console.error('Signup failed:', error);
      return { user: null, error: 'Account creation failed. Please try again.' };
    }
  }

  // Sign in existing user
  static async signIn(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      if (!this.isValidEmail(credentials.email)) {
        return { user: null, error: 'Please enter a valid email address' };
      }

      if (!credentials.password) {
        return { user: null, error: 'Password is required' };
      }

      // Find user in storage
      const existingUsers = await this.getStoredUsers();
      const user = existingUsers.find(u => 
        u.email.toLowerCase() === credentials.email.toLowerCase()
      );

      if (!user) {
        return { user: null, error: 'No account found with this email address' };
      }

      // In a real app, you'd verify the password hash
      // For this demo, we'll assume any password works if user exists
      // You can enhance this by storing password hashes

      // Update last login
      const updatedUser = {
        ...user,
        updated_at: new Date().toISOString(),
      };

      // Update user in storage
      const updatedUsers = existingUsers.map(u => u.id === user.id ? updatedUser : u);
      await this.saveUsers(updatedUsers);
      
      // Set as current user
      await this.setCurrentUser(updatedUser);

      return { user: updatedUser, error: null };
    } catch (error) {
      console.error('Login failed:', error);
      return { user: null, error: 'Login failed. Please try again.' };
    }
  }

  // Sign out current user
  static async signOut(): Promise<{ error: string | null }> {
    try {
      await this.clearCurrentUser();
      return { error: null };
    } catch (error) {
      console.error('Logout failed:', error);
      return { error: 'Logout failed. Please try again.' };
    }
  }

  // Get current user from storage
  static async getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      const sessionJson = await AsyncStorage.getItem(SESSION_KEY);
      
      if (!userJson || !sessionJson) {
        return { user: null, error: null };
      }

      const user = JSON.parse(userJson) as AuthUser;
      const sessionDate = new Date(sessionJson);
      const now = new Date();
      
      // Check if session is older than 30 days (optional)
      const sessionAgeMs = now.getTime() - sessionDate.getTime();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      
      if (sessionAgeMs > thirtyDaysMs) {
        await this.clearCurrentUser();
        return { user: null, error: 'Session expired' };
      }

      return { user, error: null };
    } catch (error) {
      console.error('Failed to get current user:', error);
      return { user: null, error: 'Failed to load user session' };
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    const { user } = await this.getCurrentUser();
    return !!user;
  }

  // Update user profile
  static async updateProfile(updates: Partial<AuthUser>): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { user: currentUser } = await this.getCurrentUser();
      
      if (!currentUser) {
        return { user: null, error: 'Not authenticated' };
      }

      const updatedUser = {
        ...currentUser,
        ...updates,
        id: currentUser.id, // Don't allow ID changes
        email: currentUser.email, // Don't allow email changes in this demo
        updated_at: new Date().toISOString(),
      };

      // Update user in storage
      const existingUsers = await this.getStoredUsers();
      const updatedUsers = existingUsers.map(u => u.id === currentUser.id ? updatedUser : u);
      await this.saveUsers(updatedUsers);
      
      // Update current user session
      await this.setCurrentUser(updatedUser);

      return { user: updatedUser, error: null };
    } catch (error) {
      console.error('Profile update failed:', error);
      return { user: null, error: 'Failed to update profile. Please try again.' };
    }
  }

  // Reset password (mock implementation)
  static async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      if (!this.isValidEmail(email)) {
        return { error: 'Please enter a valid email address' };
      }

      const existingUsers = await this.getStoredUsers();
      const user = existingUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return { error: 'No account found with this email address' };
      }

      // In a real app, you'd send a reset email
      // For this demo, we'll just return success
      return { error: null };
    } catch (error) {
      console.error('Password reset failed:', error);
      return { error: 'Password reset failed. Please try again.' };
    }
  }

  // Get all users (for debugging/admin purposes)
  static async getAllUsers(): Promise<AuthUser[]> {
    return await this.getStoredUsers();
  }

  // Clear all user data (for testing/reset purposes)
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([USERS_KEY, CURRENT_USER_KEY, SESSION_KEY]);
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }

  // Demo/Development helpers
  static async createDemoUsers(): Promise<void> {
    const demoUsers: AuthUser[] = [
      {
        id: 'demo_member_1',
        email: 'member@demo.com',
        full_name: 'Demo Member',
        user_type: 'gym_member',
        is_private: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'demo_owner_1',
        email: 'owner@demo.com',
        full_name: 'Demo Owner',
        user_type: 'gym_owner',
        is_private: false,
        gym_id: 'demo_gym_1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];

    await this.saveUsers(demoUsers);
  }
}
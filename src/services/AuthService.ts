import { supabase } from './supabase';
import { User, UserType } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  fullName: string;
  userType: UserType;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  user_type: UserType;
  username?: string;
  bio?: string;
  profile_picture?: string;
  gym_id?: string;
  gym_start_date?: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export class AuthService {
  // Sign up new user
  static async signUp(credentials: SignupCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      // Step 1: Create auth user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName,
            user_type: credentials.userType,
          }
        }
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Failed to create user account' };
      }

      // Step 2: Create user profile in our users table
      const userProfile = {
        id: authData.user.id,
        email: credentials.email,
        full_name: credentials.fullName,
        user_type: credentials.userType,
        is_private: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert([userProfile])
        .select()
        .single();

      if (profileError) {
        // Clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        return { user: null, error: 'Failed to create user profile' };
      }

      return { user: profileData as AuthUser, error: null };
    } catch (error) {
      return { user: null, error: 'Signup failed. Please try again.' };
    }
  }

  // Sign in existing user
  static async signIn(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Login failed' };
      }

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profileData) {
        return { user: null, error: 'Failed to load user profile' };
      }

      return { user: profileData as AuthUser, error: null };
    } catch (error) {
      return { user: null, error: 'Login failed. Please try again.' };
    }
  }

  // Sign out user
  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? error.message : null };
    } catch (error) {
      return { error: 'Logout failed. Please try again.' };
    }
  }

  // Get current user session
  static async getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session?.user) {
        return { user: null, error: null };
      }

      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single();

      if (profileError || !profileData) {
        return { user: null, error: 'Failed to load user profile' };
      }

      return { user: profileData as AuthUser, error: null };
    } catch (error) {
      return { user: null, error: 'Failed to get current user' };
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'gymez://reset-password',
      });

      return { error: error ? error.message : null };
    } catch (error) {
      return { error: 'Password reset failed. Please try again.' };
    }
  }

  // Update user profile
  static async updateProfile(updates: Partial<AuthUser>): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session?.user) {
        return { user: null, error: 'Not authenticated' };
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', sessionData.session.user.id)
        .select()
        .single();

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: data as AuthUser, error: null };
    } catch (error) {
      return { user: null, error: 'Failed to update profile' };
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data } = await supabase.auth.getSession();
      return !!data.session?.user;
    } catch {
      return false;
    }
  }

  // Listen for auth state changes
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { user } = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  // Mock authentication for development/demo
  static async mockSignIn(email: string): Promise<{ user: AuthUser; error: null }> {
    const mockUser: AuthUser = {
      id: 'mock_user_' + Date.now(),
      email: email,
      full_name: 'Demo User',
      user_type: 'gym_member',
      is_private: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return { user: mockUser, error: null };
  }

  static async mockSignUp(credentials: SignupCredentials): Promise<{ user: AuthUser; error: null }> {
    const mockUser: AuthUser = {
      id: 'mock_user_' + Date.now(),
      email: credentials.email,
      full_name: credentials.fullName,
      user_type: credentials.userType,
      is_private: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return { user: mockUser, error: null };
  }
}
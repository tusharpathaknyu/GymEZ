import React, {createContext, useContext, useEffect, useState} from 'react';
import {supabase} from './supabase';
import {User, UserType, AuthContextType} from '../types';
// import {GoogleSignin, GoogleSigninButton, statusCodes} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LocalAuthService} from './LocalAuthService';
import {AuthService} from './AuthService';
import GoogleAuthService from './GoogleAuthService';

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // Try to get current user from local storage
        const {user: localUser} = await LocalAuthService.getCurrentUser();
        if (localUser) {
          setUser(localUser as User);
        }
      } catch (error) {
        console.warn('Failed to load user session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Try to set up Supabase auth listener
    try {
      const {data: {subscription}} = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          } else {
            // Check local auth when Supabase session is null
            const {user: localUser} = await LocalAuthService.getCurrentUser();
            if (localUser) {
              setUser(localUser as User);
            } else {
              setUser(null);
            }
          }
          setLoading(false);
        }
      );

      return () => subscription.unsubscribe();
    } catch (error) {
      console.warn('Supabase auth listener not available, using local auth only');
    }
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const {data: profile, error} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setUser(profile as User);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Try Supabase first, fall back to local auth
      const {error} = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Fall back to local auth
        const {user, error: localError} = await LocalAuthService.signIn({email, password});
        if (localError) throw new Error(localError);
        if (user) {
          setUser(user as User);
        }
        return;
      }
    } catch (error) {
      // Use local auth as primary method
      const {user, error: localError} = await LocalAuthService.signIn({email, password});
      if (localError) throw new Error(localError);
      if (user) {
        setUser(user as User);
      }
    }
  };

  const signUp = async (email: string, password: string, fullName: string, userType: UserType, gymId?: string) => {
    try {
      // Try Supabase first, fall back to local auth
      const {data: authData, error: authError} = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        // Fall back to local auth
        const {user: localUser, error: localError} = await LocalAuthService.signUp({
          email,
          password,
          fullName,
          userType,
        });
        if (localError) throw new Error(localError);
        if (localUser) {
          setUser(localUser as User);
        }
        return;
      }

      if (authData.user) {
        // Create user profile in Supabase
        const {error: profileError} = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email,
            full_name: fullName,
            user_type: userType,
            gym_id: gymId,
          });

        if (profileError) throw profileError;
      }
    } catch (error) {
      // Use local auth as primary method
      const {user: localUser, error: localError} = await LocalAuthService.signUp({
        email,
        password,
        fullName,
        userType,
      });
      if (localError) throw new Error(localError);
      if (localUser) {
        setUser(localUser as User);
      }
    }
  };

  const signOut = async () => {
    try {
      // Try Supabase logout
      const {error} = await supabase.auth.signOut();
      if (error) {
        console.warn('Supabase logout failed, using local logout');
      }
    } catch (error) {
      console.warn('Supabase not available, using local logout');
    }
    
    // Always do local logout
    await LocalAuthService.signOut();
    setUser(null);
  };

  const signInWithGoogle = async () => {
    try {
      // Use the GoogleAuthService to handle Google Sign-In
      const googleAuth = GoogleAuthService.getInstance();
      const result = await googleAuth.signIn();
      
      if (result.user) {
        // Create a local user record for Google sign-in
        const googleUser = {
          id: 'google_' + result.user.id,
          email: result.user.email,
          full_name: result.user.name,
          user_type: 'gym_member' as UserType,
          profile_picture: result.user.photo,
          is_private: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        // Save to local storage
        await LocalAuthService.signUp({
          email: googleUser.email,
          password: 'google_oauth', // Placeholder password for Google users
          fullName: googleUser.full_name,
          userType: googleUser.user_type,
        });
        
        setUser(googleUser as User);
      } else if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    const {error} = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'gymez://reset-password',
    });
    
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const {error} = await supabase.auth.updateUser({
      password: password,
    });
    
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
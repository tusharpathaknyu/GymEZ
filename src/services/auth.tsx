import React, {createContext, useContext, useEffect, useState} from 'react';
import {supabase} from './supabase';
import {User, UserType, AuthContextType} from '../types';
// import {GoogleSignin, GoogleSigninButton, statusCodes} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    // Skip Google Sign-In configuration for now
    // GoogleSignin.configure({
    //   webClientId: 'YOUR_WEB_CLIENT_ID',
    //   offlineAccess: true,
    // });

    // Skip Supabase session check for now - set loading to false
    setLoading(false);

    // Skip auth state listener for now
    // const {data: {subscription}} = supabase.auth.onAuthStateChange(
    //   async (event, session) => {
    //     if (session?.user) {
    //       await fetchUserProfile(session.user.id);
    //     } else {
    //       setUser(null);
    //       setLoading(false);
    //     }
    //   }
    // );

    // return () => subscription.unsubscribe();
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
    const {error} = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string, userType: UserType, gymId?: string) => {
    const {data: authData, error: authError} = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      // Create user profile
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
  };

  const signOut = async () => {
    const {error} = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    // Google Sign-In temporarily disabled - requires proper OAuth setup
    throw new Error('Google Sign-In will be configured with your Google OAuth credentials');
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
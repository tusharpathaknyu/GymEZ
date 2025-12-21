import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { Alert } from 'react-native';
import { supabase } from './supabase';
import { User, UserType, AuthContextType } from '../types';
import { LocalAuthService } from './LocalAuthService';
import {
  GoogleSignin,
  statusCodes,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin';

// Development flag - set to true for demo mode (skip real Google auth)
const USE_DEMO_GOOGLE_SIGNIN = true;

// Configure Google Sign-In lazily (not at module load)
let googleSignInConfigured = false;
const configureGoogleSignIn = () => {
  if (!googleSignInConfigured && !USE_DEMO_GOOGLE_SIGNIN) {
    try {
      GoogleSignin.configure({
        webClientId:
          '86467948830-mso681ekb171rqnmqoqm8bpk80ahbv2l.apps.googleusercontent.com',
      });
      googleSignInConfigured = true;
    } catch (e) {
      console.warn('Google Sign-In config failed:', e);
    }
  }
};

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = React.useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const initializeAuth = async () => {
      setLoading(true);
      try {
        // Try to get current user from local auth
        const { user: localUser } = await LocalAuthService.getCurrentUser();
        if (
          localUser &&
          localUser.full_name &&
          localUser.email &&
          localUser.user_type
        ) {
          // Create validated user object with all required fields as strings
          const validatedUser: User = {
            id: String(localUser.id || ''),
            email: String(localUser.email || ''),
            full_name: String(localUser.full_name || ''),
            user_type: localUser.user_type as UserType,
            is_private: Boolean(localUser.is_private),
            gym_id: localUser.gym_id ? String(localUser.gym_id) : undefined,
            username: localUser.username
              ? String(localUser.username)
              : undefined,
            bio: localUser.bio ? String(localUser.bio) : undefined,
            profile_picture: localUser.profile_picture
              ? String(localUser.profile_picture)
              : undefined,
            gym_start_date: localUser.gym_start_date
              ? String(localUser.gym_start_date)
              : undefined,
          };
          // Set both user and loading in React batch
          if (isMountedRef.current) {
            React.startTransition(() => {
              setUser(validatedUser);
              setLoading(false);
            });
          }
        } else {
          // No user found - set both in React batch
          if (isMountedRef.current) {
            React.startTransition(() => {
              setUser(null);
              setLoading(false);
            });
          }
        }
      } catch (error) {
        console.warn('Failed to load user session:', error);
        // On error, ensure user is null and loading is false
        if (isMountedRef.current) {
          React.startTransition(() => {
            setUser(null);
            setLoading(false);
          });
        }
      }
    };

    initializeAuth();

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  useEffect(() => {
    // Try to set up Supabase auth listener
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          // Check local auth when Supabase session is null
          const { user: localUser } = await LocalAuthService.getCurrentUser();
          if (
            localUser &&
            localUser.full_name &&
            localUser.email &&
            localUser.user_type
          ) {
            // Set user directly, then update loading
            const validatedUser: User = {
              id: String(localUser.id || ''),
              email: String(localUser.email || ''),
              full_name: String(localUser.full_name || ''),
              user_type: localUser.user_type as UserType,
              is_private: Boolean(localUser.is_private),
            };
            if (isMountedRef.current) {
              setUser(validatedUser);
            }
          } else {
            if (isMountedRef.current) {
              setUser(null);
            }
          }
        }
        // Use React.startTransition to batch state updates
        React.startTransition(() => {
          if (isMountedRef.current) {
            setLoading(false);
          }
        });
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      console.warn(
        'Supabase auth listener not available, using local auth only',
      );
    }
  }, []);

  // Cleanup mounted ref on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      // Validate profile has required fields before setting
      if (
        profile &&
        profile.full_name &&
        profile.email &&
        profile.user_type &&
        isMountedRef.current
      ) {
        const validUser: User = {
          id: String(profile.id || ''),
          email: String(profile.email || ''),
          full_name: String(profile.full_name || ''),
          user_type: profile.user_type as UserType,
          is_private: Boolean(profile.is_private),
          gym_id: profile.gym_id ? String(profile.gym_id) : undefined,
          username: profile.username ? String(profile.username) : undefined,
          bio: profile.bio ? String(profile.bio) : undefined,
          profile_picture: profile.profile_picture
            ? String(profile.profile_picture)
            : undefined,
          gym_start_date: profile.gym_start_date
            ? String(profile.gym_start_date)
            : undefined,
        };
        setUser(validUser);
      } else {
        console.error('Invalid profile data:', profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', String(error));
    } finally {
      // Use React.startTransition to batch state updates
      React.startTransition(() => {
        if (isMountedRef.current) {
          setLoading(false);
        }
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Try Supabase first, fall back to local auth
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Fall back to local auth
        const { user, error: localError } = await LocalAuthService.signIn({
          email,
          password,
        });
        if (localError) {
          throw new Error(localError);
        }
        if (user) {
          // Set user directly when valid
          if (
            user &&
            user.full_name &&
            user.email &&
            user.user_type &&
            isMountedRef.current
          ) {
            const validatedUser: User = {
              id: String(user.id || ''),
              email: String(user.email || ''),
              full_name: String(user.full_name || ''),
              user_type: user.user_type as UserType,
              is_private: Boolean(user.is_private),
            };
            setUser(validatedUser);
          }
        }
        return;
      }
    } catch (error) {
      // Use local auth as primary method
      const { user, error: localError } = await LocalAuthService.signIn({
        email,
        password,
      });
      if (localError) {
        throw new Error(localError);
      }
      if (user) {
        // Use requestAnimationFrame to ensure state update happens after render
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (isMountedRef.current) {
              setUser(user as User);
            }
          });
        });
      }
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    userType: UserType,
    gymId?: string,
  ) => {
    try {
      // Try Supabase first, fall back to local auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        // Fall back to local auth
        const { user: localUser, error: localError } =
          await LocalAuthService.signUp({
            email,
            password,
            fullName,
            userType,
          });
        if (localError) {
          throw new Error(localError);
        }
        if (localUser) {
          // Use setTimeout - standard React Native pattern for async state updates
          setTimeout(() => {
            if (
              isMountedRef.current &&
              localUser &&
              localUser.full_name &&
              localUser.email &&
              localUser.user_type
            ) {
              const validatedUser: User = {
                id: String(localUser.id || ''),
                email: String(localUser.email || ''),
                full_name: String(localUser.full_name || ''),
                user_type: localUser.user_type as UserType,
                is_private: Boolean(localUser.is_private),
              };
              setUser(validatedUser);
            }
          }, 0);
        }
        return;
      }

      if (authData.user) {
        // Create user profile in Supabase
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          user_type: userType,
          gym_id: gymId,
        });

        if (profileError) {
          throw profileError;
        }
      }
    } catch (error) {
      // Use local auth as primary method
      const { user: localUser, error: localError } =
        await LocalAuthService.signUp({
          email,
          password,
          fullName,
          userType,
        });
      if (localError) {
        throw new Error(localError);
      }
      if (localUser) {
        // Use requestAnimationFrame to ensure state update happens after render
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (isMountedRef.current) {
              setUser(localUser as User);
            }
          });
        });
      }
    }
  };

  const signOut = async () => {
    try {
      // Sign out of Google first
      await GoogleSignin.signOut();
      // Try Supabase logout
      const { error } = await supabase.auth.signOut();
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

  // Demo/Development Google Sign-In
  const signInWithGoogle = useCallback(async (): Promise<void> => {
    try {
      if (USE_DEMO_GOOGLE_SIGNIN) {
        // Demo mode - simulate successful sign-in
        // Use requestAnimationFrame to ensure we're outside render cycle
        return new Promise((resolve, reject) => {
          Alert.alert(
            'Demo Google Sign-In',
            'This is a demo mode. Sign in as demo user?',
            [
              {
                text: 'Cancel',
                onPress: () => {
                  console.log('Demo Google Sign-In cancelled');
                  resolve();
                },
                style: 'cancel',
              },
              {
                text: 'Sign In',
                onPress: () => {
                  // Create demo user and sign in locally - using safe state update pattern
                  const demoUser: User = {
                    id: 'demo_user_123',
                    email: 'demo@gymez.app',
                    full_name: 'Demo User',
                    user_type: 'gym_member' as UserType,
                    is_private: false,
                  };

                  // Batch state update to next tick
                  Promise.resolve().then(() => {
                    if (isMountedRef.current) {
                      try {
                        setUser(demoUser);
                        setLoading(false);
                        console.log('Demo Google Sign-In successful');
                      } catch (err) {
                        console.error('Error setting user state:', err);
                        reject(err);
                        return;
                      }
                      resolve();
                    }
                  });
                },
              },
            ],
          );
        });
      }

      // Real Google Sign-In (when USE_DEMO_GOOGLE_SIGNIN is false)
      console.log('Starting Google Sign-In flow...');

      // Check for Play Services
      try {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
        console.log('Google Play Services available');
      } catch (playServicesError) {
        console.error('Google Play Services error:', playServicesError);
        throw new Error(
          'Google Play Services is not available. Please update or install Google Play Services.',
        );
      }

      // Perform sign-in
      const result = await GoogleSignin.signIn();
      console.log('Google Sign-In result:', result.type);

      if (result.type === 'success') {
        const { data: googleUser } = result;
        console.log('Google Sign-In successful:', googleUser.user.name);
        console.log('User email:', googleUser.user.email);

        if (googleUser.idToken) {
          console.log('Got ID token, authenticating with Supabase...');
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: googleUser.idToken,
          });

          if (error) {
            console.error('Supabase authentication error:', String(error));
            throw error;
          }

          if (data?.user) {
            console.log(
              'Supabase authentication successful, fetching profile...',
            );
            // Fetch user profile after successful authentication
            await fetchUserProfile(data.user.id);
          } else {
            console.warn('No user data returned from Supabase');
          }
          console.log('Successfully authenticated with Supabase');
        } else {
          console.error('No ID token received from Google');
          throw new Error('No ID token received from Google');
        }
      } else {
        console.log('Google Sign-In cancelled by user');
      }
    } catch (error: any) {
      if (isErrorWithCode(error)) {
        console.log('Google Sign-In error:', String(error.message || error));
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log('User cancelled Google Sign-In');
            return; // Don't throw for cancellation
          case statusCodes.IN_PROGRESS:
            console.log('Google Sign-In operation already in progress');
            return; // Don't throw for in-progress
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log('Play services not available or outdated');
            break;
          default:
            console.error(
              'Unknown Google Sign-In error:',
              String(error.message || error),
            );
        }
      } else {
        console.error(
          'Non-Google Sign-In error:',
          String(error.message || error || 'Unknown error'),
        );
      }

      // Use setTimeout to safely handle errors without disrupting render cycle
      setTimeout(() => {
        if (isMountedRef.current) {
          Alert.alert(
            'Sign-In Error',
            String(
              error.message ||
                error ||
                'Google Sign-In is not available. Please use email/password or try again later.',
            ),
            [{ text: 'OK' }],
          );
        }
      }, 0);
    }
  }, []);

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'gymez://reset-password',
    });

    if (error) {
      throw error;
    }
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      throw error;
    }
  };

  // Create context value - ensure user is only set when fully validated
  const value = {
    user: user && user.full_name && user.email && user.user_type ? user : null,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

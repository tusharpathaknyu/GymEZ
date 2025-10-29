import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthService, AuthUser } from '../services/AuthService';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: AuthUser }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: AuthUser };

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string, userType: 'gym_member' | 'gym_owner') => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    
    case 'AUTH_LOGOUT':
      return {
        ...initialState,
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
    
    // Listen for auth state changes
    const { data: authListener } = AuthService.onAuthStateChange((user) => {
      if (user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      const { user, error } = await AuthService.getCurrentUser();
      
      if (error) {
        dispatch({ type: 'AUTH_ERROR', payload: error });
        return;
      }

      if (user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: 'Failed to check authentication status' });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // For demo purposes, use mock authentication
      const { user, error } = await AuthService.mockSignIn(email);
      
      if (error) {
        dispatch({ type: 'AUTH_ERROR', payload: error });
        return;
      }

      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: 'Login failed. Please try again.' });
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    fullName: string, 
    userType: 'gym_member' | 'gym_owner'
  ) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // For demo purposes, use mock authentication
      const { user, error } = await AuthService.mockSignUp({
        email,
        password,
        fullName,
        userType,
      });
      
      if (error) {
        dispatch({ type: 'AUTH_ERROR', payload: error });
        return;
      }

      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: 'Signup failed. Please try again.' });
    }
  };

  const logout = async () => {
    try {
      await AuthService.signOut();
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      // Even if logout fails, clear local state
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const updateUser = async (updates: Partial<AuthUser>) => {
    try {
      if (!state.user) return;

      const updatedUser = { ...state.user, ...updates };
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      
      // In a real app, you'd also update the backend
      // const { user, error } = await AuthService.updateProfile(updates);
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: 'Failed to update profile' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    state,
    login,
    signup,
    logout,
    updateUser,
    clearError,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
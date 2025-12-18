import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  id: string;
  name: string;
  icon: string;
  colors: ThemeColors;
  isPremium?: boolean;
}

export interface ThemeColors {
  // Core colors
  primary: string;
  secondary: string;
  accent: string;
  
  // Backgrounds
  background: string;
  surface: string;
  card: string;
  modal: string;
  
  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  
  // UI Elements
  border: string;
  divider: string;
  shadow: string;
  
  // Status
  success: string;
  error: string;
  warning: string;
  info: string;
  
  // Tab Bar
  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;
  
  // Gradient
  gradientStart: string;
  gradientEnd: string;
}

// Default Themes
export const THEMES: Theme[] = [
  {
    id: 'light',
    name: 'Light',
    icon: '☀️',
    colors: {
      primary: '#10b981',
      secondary: '#6366f1',
      accent: '#f59e0b',
      background: '#f9fafb',
      surface: '#ffffff',
      card: '#ffffff',
      modal: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      textMuted: '#9ca3af',
      textInverse: '#ffffff',
      border: '#e5e7eb',
      divider: '#f3f4f6',
      shadow: '#000000',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      tabBar: '#ffffff',
      tabBarActive: '#10b981',
      tabBarInactive: '#9ca3af',
      gradientStart: '#10b981',
      gradientEnd: '#059669',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    icon: '🌙',
    colors: {
      primary: '#10b981',
      secondary: '#818cf8',
      accent: '#fbbf24',
      background: '#111827',
      surface: '#1f2937',
      card: '#1f2937',
      modal: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      textMuted: '#9ca3af',
      textInverse: '#1f2937',
      border: '#374151',
      divider: '#374151',
      shadow: '#000000',
      success: '#34d399',
      error: '#f87171',
      warning: '#fbbf24',
      info: '#60a5fa',
      tabBar: '#1f2937',
      tabBarActive: '#10b981',
      tabBarInactive: '#6b7280',
      gradientStart: '#10b981',
      gradientEnd: '#059669',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    icon: '🌃',
    colors: {
      primary: '#818cf8',
      secondary: '#c084fc',
      accent: '#f472b6',
      background: '#0f0f23',
      surface: '#1a1a2e',
      card: '#16213e',
      modal: '#1a1a2e',
      text: '#eef2ff',
      textSecondary: '#c7d2fe',
      textMuted: '#a5b4fc',
      textInverse: '#0f0f23',
      border: '#312e81',
      divider: '#1e1b4b',
      shadow: '#000000',
      success: '#a3e635',
      error: '#fb7185',
      warning: '#fbbf24',
      info: '#38bdf8',
      tabBar: '#1a1a2e',
      tabBarActive: '#818cf8',
      tabBarInactive: '#6366f1',
      gradientStart: '#818cf8',
      gradientEnd: '#6366f1',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    icon: '🌲',
    colors: {
      primary: '#22c55e',
      secondary: '#84cc16',
      accent: '#facc15',
      background: '#0f1f11',
      surface: '#1a2e1c',
      card: '#15231a',
      modal: '#1a2e1c',
      text: '#ecfdf5',
      textSecondary: '#bbf7d0',
      textMuted: '#86efac',
      textInverse: '#0f1f11',
      border: '#166534',
      divider: '#14532d',
      shadow: '#000000',
      success: '#4ade80',
      error: '#f87171',
      warning: '#fbbf24',
      info: '#38bdf8',
      tabBar: '#1a2e1c',
      tabBarActive: '#22c55e',
      tabBarInactive: '#16a34a',
      gradientStart: '#22c55e',
      gradientEnd: '#16a34a',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    icon: '🌅',
    isPremium: true,
    colors: {
      primary: '#f97316',
      secondary: '#fb923c',
      accent: '#facc15',
      background: '#1c1003',
      surface: '#2e1a07',
      card: '#3d2409',
      modal: '#2e1a07',
      text: '#fff7ed',
      textSecondary: '#fed7aa',
      textMuted: '#fdba74',
      textInverse: '#1c1003',
      border: '#9a3412',
      divider: '#7c2d12',
      shadow: '#000000',
      success: '#4ade80',
      error: '#f87171',
      warning: '#fbbf24',
      info: '#38bdf8',
      tabBar: '#2e1a07',
      tabBarActive: '#f97316',
      tabBarInactive: '#ea580c',
      gradientStart: '#f97316',
      gradientEnd: '#ea580c',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    icon: '🌊',
    isPremium: true,
    colors: {
      primary: '#0ea5e9',
      secondary: '#38bdf8',
      accent: '#22d3ee',
      background: '#0c1929',
      surface: '#0f2942',
      card: '#0f3552',
      modal: '#0f2942',
      text: '#f0f9ff',
      textSecondary: '#bae6fd',
      textMuted: '#7dd3fc',
      textInverse: '#0c1929',
      border: '#0369a1',
      divider: '#075985',
      shadow: '#000000',
      success: '#4ade80',
      error: '#f87171',
      warning: '#fbbf24',
      info: '#38bdf8',
      tabBar: '#0f2942',
      tabBarActive: '#0ea5e9',
      tabBarInactive: '#0284c7',
      gradientStart: '#0ea5e9',
      gradientEnd: '#0284c7',
    },
  },
  {
    id: 'cherry',
    name: 'Cherry',
    icon: '🍒',
    isPremium: true,
    colors: {
      primary: '#e11d48',
      secondary: '#f43f5e',
      accent: '#fb7185',
      background: '#1c0810',
      surface: '#2e0f1c',
      card: '#3d1325',
      modal: '#2e0f1c',
      text: '#fff1f2',
      textSecondary: '#fecdd3',
      textMuted: '#fda4af',
      textInverse: '#1c0810',
      border: '#9f1239',
      divider: '#881337',
      shadow: '#000000',
      success: '#4ade80',
      error: '#f87171',
      warning: '#fbbf24',
      info: '#38bdf8',
      tabBar: '#2e0f1c',
      tabBarActive: '#e11d48',
      tabBarInactive: '#be123c',
      gradientStart: '#e11d48',
      gradientEnd: '#be123c',
    },
  },
];

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  setTheme: (themeId: string) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@gymez_theme';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(THEMES[0]);

  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedThemeId = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedThemeId) {
        const savedTheme = THEMES.find(t => t.id === savedThemeId);
        if (savedTheme) {
          setThemeState(savedTheme);
        }
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const setTheme = async (themeId: string) => {
    const newTheme = THEMES.find(t => t.id === themeId);
    if (newTheme) {
      setThemeState(newTheme);
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, themeId);
      } catch (error) {
        console.log('Error saving theme:', error);
      }
    }
  };

  const toggleDarkMode = () => {
    const newThemeId = theme.id === 'light' ? 'dark' : 'light';
    setTheme(newThemeId);
  };

  const isDark = theme.id !== 'light';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: theme.colors,
        setTheme,
        isDark,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;

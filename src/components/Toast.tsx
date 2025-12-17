import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
  icon?: string;
}

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast) {
      setVisible(true);
      
      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      const timeout = setTimeout(() => {
        hideToast();
      }, toast.duration || 3000);

      return () => clearTimeout(timeout);
    }
  }, [toast, translateY, opacity]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setToast(null);
    });
  };

  const showToast = (config: ToastConfig) => {
    // If a toast is already showing, hide it first
    if (visible) {
      hideToast();
      setTimeout(() => setToast(config), 250);
    } else {
      setToast(config);
    }
  };

  const getToastStyle = (type: ToastType = 'info') => {
    const styles: Record<ToastType, { backgroundColor: string; borderColor: string }> = {
      success: { backgroundColor: '#f0fdf4', borderColor: '#10b981' },
      error: { backgroundColor: '#fef2f2', borderColor: '#ef4444' },
      warning: { backgroundColor: '#fffbeb', borderColor: '#f59e0b' },
      info: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
    };
    return styles[type];
  };

  const getDefaultIcon = (type: ToastType = 'info') => {
    const icons: Record<ToastType, string> = {
      success: '✓',
      error: '✕',
      warning: '⚠️',
      info: 'ℹ️',
    };
    return icons[type];
  };

  const getTextColor = (type: ToastType = 'info') => {
    const colors: Record<ToastType, string> = {
      success: '#166534',
      error: '#991b1b',
      warning: '#92400e',
      info: '#1e40af',
    };
    return colors[type];
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && toast && (
        <Animated.View
          style={[
            styles.container,
            getToastStyle(toast.type),
            {
              transform: [{ translateY }],
              opacity,
            },
          ]}
        >
          <View style={[styles.iconContainer, { borderColor: getToastStyle(toast.type).borderColor }]}>
            <Text style={[styles.icon, { color: getToastStyle(toast.type).borderColor }]}>
              {toast.icon || getDefaultIcon(toast.type)}
            </Text>
          </View>
          <Text style={[styles.message, { color: getTextColor(toast.type) }]}>
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

// Standalone Toast component for simple usage
interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  icon?: string;
  onHide?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  icon,
  onHide,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => onHide?.());
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [visible, translateY, opacity, onHide]);

  const getToastStyle = (t: ToastType) => {
    const s: Record<ToastType, { backgroundColor: string; borderColor: string }> = {
      success: { backgroundColor: '#f0fdf4', borderColor: '#10b981' },
      error: { backgroundColor: '#fef2f2', borderColor: '#ef4444' },
      warning: { backgroundColor: '#fffbeb', borderColor: '#f59e0b' },
      info: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
    };
    return s[t];
  };

  const getDefaultIcon = (t: ToastType) => {
    const icons: Record<ToastType, string> = {
      success: '✓',
      error: '✕',
      warning: '⚠️',
      info: 'ℹ️',
    };
    return icons[t];
  };

  const getTextColor = (t: ToastType) => {
    const colors: Record<ToastType, string> = {
      success: '#166534',
      error: '#991b1b',
      warning: '#92400e',
      info: '#1e40af',
    };
    return colors[t];
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        getToastStyle(type),
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={[styles.iconContainer, { borderColor: getToastStyle(type).borderColor }]}>
        <Text style={[styles.icon, { color: getToastStyle(type).borderColor }]}>
          {icon || getDefaultIcon(type)}
        </Text>
      </View>
      <Text style={[styles.message, { color: getTextColor(type) }]}>
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
});

export default Toast;

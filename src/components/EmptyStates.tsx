import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { buttonPress } from '../utils/haptics';

const { width } = Dimensions.get('window');

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  type?: 'default' | 'workout' | 'social' | 'search' | 'error' | 'offline';
}

const EMPTY_STATE_CONFIGS = {
  default: {
    icon: '📭',
    gradient: ['#f3f4f6', '#e5e7eb'],
  },
  workout: {
    icon: '🏋️',
    gradient: ['#d1fae5', '#a7f3d0'],
  },
  social: {
    icon: '👥',
    gradient: ['#dbeafe', '#bfdbfe'],
  },
  search: {
    icon: '🔍',
    gradient: ['#fef3c7', '#fde68a'],
  },
  error: {
    icon: '⚠️',
    gradient: ['#fee2e2', '#fecaca'],
  },
  offline: {
    icon: '📡',
    gradient: ['#e5e7eb', '#d1d5db'],
  },
};

/**
 * Beautiful animated empty state component
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  type = 'default',
}) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const config = EMPTY_STATE_CONFIGS[type];
  const displayIcon = icon || config.icon;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 12,
        stiffness: 150,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle bounce animation for the icon
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    bounce.start();

    return () => bounce.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          {
            backgroundColor: config.gradient[0],
            transform: [{ translateY: bounceAnim }],
          },
        ]}
      >
        <Text style={styles.icon}>{displayIcon}</Text>
      </Animated.View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            buttonPress();
            onAction();
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

/**
 * Compact empty state for lists
 */
export const CompactEmptyState: React.FC<{
  icon?: string;
  message: string;
}> = ({ icon = '📭', message }) => {
  return (
    <View style={styles.compactContainer}>
      <Text style={styles.compactIcon}>{icon}</Text>
      <Text style={styles.compactMessage}>{message}</Text>
    </View>
  );
};

/**
 * No results state for search
 */
export const NoResultsState: React.FC<{
  searchQuery: string;
  onClear?: () => void;
}> = ({ searchQuery, onClear }) => {
  return (
    <EmptyState
      type="search"
      icon="🔍"
      title="No results found"
      message={`We couldn't find anything matching "${searchQuery}"`}
      actionLabel={onClear ? "Clear search" : undefined}
      onAction={onClear}
    />
  );
};

/**
 * Offline state
 */
export const OfflineState: React.FC<{
  onRetry?: () => void;
}> = ({ onRetry }) => {
  return (
    <EmptyState
      type="offline"
      icon="📡"
      title="You're offline"
      message="Check your internet connection and try again"
      actionLabel={onRetry ? "Retry" : undefined}
      onAction={onRetry}
    />
  );
};

/**
 * Error state
 */
export const ErrorState: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
}> = ({ 
  title = "Something went wrong", 
  message = "We're having trouble loading this content",
  onRetry 
}) => {
  return (
    <EmptyState
      type="error"
      icon="⚠️"
      title={title}
      message={message}
      actionLabel={onRetry ? "Try again" : undefined}
      onAction={onRetry}
    />
  );
};

/**
 * Empty workout state
 */
export const EmptyWorkoutState: React.FC<{
  onStartWorkout?: () => void;
}> = ({ onStartWorkout }) => {
  return (
    <EmptyState
      type="workout"
      icon="🏋️"
      title="No workouts yet"
      message="Start your fitness journey by logging your first workout"
      actionLabel={onStartWorkout ? "Start Workout" : undefined}
      onAction={onStartWorkout}
    />
  );
};

/**
 * Empty social feed state
 */
export const EmptySocialState: React.FC<{
  onFindFriends?: () => void;
}> = ({ onFindFriends }) => {
  return (
    <EmptyState
      type="social"
      icon="👥"
      title="Your feed is empty"
      message="Follow friends to see their workout updates and achievements"
      actionLabel={onFindFriends ? "Find Friends" : undefined}
      onAction={onFindFriends}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    paddingVertical: 48,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: width * 0.75,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  compactContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  compactIcon: {
    fontSize: 36,
    marginBottom: 12,
    opacity: 0.7,
  },
  compactMessage: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default {
  EmptyState,
  CompactEmptyState,
  NoResultsState,
  OfflineState,
  ErrorState,
  EmptyWorkoutState,
  EmptySocialState,
};

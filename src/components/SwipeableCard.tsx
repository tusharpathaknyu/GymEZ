import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { buttonPress, successHaptic, errorHaptic } from '../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 250;

interface SwipeAction {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  enabled?: boolean;
}

/**
 * Swipeable card with reveal actions (like iOS Mail)
 */
export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  onSwipeLeft,
  onSwipeRight,
  enabled = true,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const actionsWidth = useRef(0);

  const resetPosition = useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
    }).start();
  }, []);

  const swipeOut = useCallback((direction: 'left' | 'right') => {
    const toValue = direction === 'left' ? -SCREEN_WIDTH : SCREEN_WIDTH;
    
    Animated.timing(translateX, {
      toValue,
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true,
    }).start(() => {
      if (direction === 'left' && onSwipeLeft) {
        successHaptic();
        onSwipeLeft();
      } else if (direction === 'right' && onSwipeRight) {
        successHaptic();
        onSwipeRight();
      }
    });
  }, [onSwipeLeft, onSwipeRight]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return enabled && Math.abs(gesture.dx) > 10 && Math.abs(gesture.dy) < 10;
      },
      onPanResponderGrant: () => {
        buttonPress();
      },
      onPanResponderMove: (_, gesture) => {
        // Limit swipe based on available actions
        let dx = gesture.dx;
        if (dx > 0 && leftActions.length === 0) dx = 0;
        if (dx < 0 && rightActions.length === 0) dx = 0;
        
        translateX.setValue(dx);
      },
      onPanResponderRelease: (_, gesture) => {
        const { dx, vx } = gesture;

        // Full swipe out
        if (dx > SWIPE_THRESHOLD * 2 && onSwipeRight) {
          swipeOut('right');
          return;
        }
        if (dx < -SWIPE_THRESHOLD * 2 && onSwipeLeft) {
          swipeOut('left');
          return;
        }

        // Show actions or reset
        if (dx > SWIPE_THRESHOLD && leftActions.length > 0) {
          buttonPress();
          Animated.spring(translateX, {
            toValue: leftActions.length * 80,
            useNativeDriver: true,
            damping: 20,
            stiffness: 200,
          }).start();
          actionsWidth.current = leftActions.length * 80;
        } else if (dx < -SWIPE_THRESHOLD && rightActions.length > 0) {
          buttonPress();
          Animated.spring(translateX, {
            toValue: -rightActions.length * 80,
            useNativeDriver: true,
            damping: 20,
            stiffness: 200,
          }).start();
          actionsWidth.current = rightActions.length * 80;
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const handleActionPress = (action: SwipeAction) => {
    buttonPress();
    resetPosition();
    setTimeout(() => action.onPress(), 200);
  };

  return (
    <View style={styles.container}>
      {/* Left Actions */}
      <View style={styles.actionsContainer}>
        {leftActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.action, { backgroundColor: action.color }]}
            onPress={() => handleActionPress(action)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>{action.icon}</Text>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Right Actions */}
      <View style={[styles.actionsContainer, styles.rightActions]}>
        {rightActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.action, { backgroundColor: action.color }]}
            onPress={() => handleActionPress(action)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>{action.icon}</Text>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Card Content */}
      <Animated.View
        style={[
          styles.card,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity activeOpacity={1} onPress={resetPosition}>
          {children}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

/**
 * Simple swipeable row for lists
 */
interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
  onShare?: () => void;
  enabled?: boolean;
}

export const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  onDelete,
  onEdit,
  onShare,
  enabled = true,
}) => {
  const rightActions: SwipeAction[] = [];
  const leftActions: SwipeAction[] = [];

  if (onShare) {
    leftActions.push({
      icon: '📤',
      label: 'Share',
      color: '#3b82f6',
      onPress: onShare,
    });
  }

  if (onEdit) {
    rightActions.push({
      icon: '✏️',
      label: 'Edit',
      color: '#f59e0b',
      onPress: onEdit,
    });
  }

  if (onDelete) {
    rightActions.push({
      icon: '🗑️',
      label: 'Delete',
      color: '#ef4444',
      onPress: onDelete,
    });
  }

  return (
    <SwipeableCard
      leftActions={leftActions}
      rightActions={rightActions}
      onSwipeLeft={onDelete}
      enabled={enabled}
    >
      {children}
    </SwipeableCard>
  );
};

/**
 * Pull-down refresh header with custom animation
 */
interface PullToRefreshProps {
  refreshing: boolean;
  progress: number; // 0 to 1
}

export const PullToRefreshIndicator: React.FC<PullToRefreshProps> = ({
  refreshing,
  progress,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (refreshing) {
      const spin = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spin.start();
      return () => spin.stop();
    } else {
      rotateAnim.setValue(0);
    }
  }, [refreshing]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const scale = Math.min(progress, 1);

  return (
    <View style={styles.refreshContainer}>
      <Animated.View
        style={[
          styles.refreshIndicator,
          {
            transform: [
              { scale },
              { rotate: refreshing ? rotate : `${progress * 180}deg` },
            ],
            opacity: Math.min(progress * 2, 1),
          },
        ]}
      >
        <Text style={styles.refreshIcon}>
          {refreshing ? '🔄' : '⬇️'}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 8,
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
  },
  rightActions: {
    left: undefined,
    right: 0,
  },
  action: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
  },
  refreshContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    fontSize: 20,
  },
});

export default {
  SwipeableCard,
  SwipeableRow,
  PullToRefreshIndicator,
};

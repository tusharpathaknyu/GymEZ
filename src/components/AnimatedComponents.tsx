import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  ViewStyle,
  TouchableOpacityProps,
} from 'react-native';
import { buttonPress } from '../utils/haptics';

interface AnimatedButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  scaleOnPress?: number;
  enableHaptic?: boolean;
  animationType?: 'scale' | 'bounce' | 'pulse';
}

/**
 * Animated button with haptic feedback and scale animation
 */
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  style,
  onPress,
  scaleOnPress = 0.95,
  enableHaptic = true,
  animationType = 'scale',
  disabled,
  ...props
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    
    Animated.spring(scaleValue, {
      toValue: scaleOnPress,
      useNativeDriver: true,
      friction: 5,
      tension: 100,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
      tension: 40,
    }).start();
  };

  const handlePress = () => {
    if (disabled) return;
    
    if (enableHaptic) {
      buttonPress();
    }
    onPress?.();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={1}
        disabled={disabled}
        style={style}
        {...props}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

interface FadeInViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  duration?: number;
  delay?: number;
}

/**
 * View that fades in its children
 */
export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  style,
  duration = 300,
  delay = 0,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, duration, delay]);

  return (
    <Animated.View style={[{ opacity: fadeAnim }, style]}>
      {children}
    </Animated.View>
  );
};

interface SlideInViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  delay?: number;
  distance?: number;
}

/**
 * View that slides in from a direction
 */
export const SlideInView: React.FC<SlideInViewProps> = ({
  children,
  style,
  direction = 'up',
  duration = 400,
  delay = 0,
  distance = 50,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim, duration, delay]);

  const getTransform = () => {
    switch (direction) {
      case 'left':
        return {
          translateX: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-distance, 0],
          }),
        };
      case 'right':
        return {
          translateX: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [distance, 0],
          }),
        };
      case 'up':
        return {
          translateY: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [distance, 0],
          }),
        };
      case 'down':
        return {
          translateY: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-distance, 0],
          }),
        };
    }
  };

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [getTransform()],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface PulseViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  pulseScale?: number;
  duration?: number;
  active?: boolean;
}

/**
 * View that pulses continuously
 */
export const PulseView: React.FC<PulseViewProps> = ({
  children,
  style,
  pulseScale = 1.05,
  duration = 1000,
  active = true,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) {
      pulseAnim.setValue(1);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: pulseScale,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim, pulseScale, duration, active]);

  return (
    <Animated.View style={[{ transform: [{ scale: pulseAnim }] }, style]}>
      {children}
    </Animated.View>
  );
};

interface StaggeredListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  duration?: number;
}

/**
 * Container that staggers the animation of its children
 */
export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  staggerDelay = 100,
  duration = 300,
}) => {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <SlideInView
          key={index}
          delay={index * staggerDelay}
          duration={duration}
          direction="up"
          distance={30}
        >
          {child}
        </SlideInView>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  // Placeholder for any shared styles
});

export default {
  AnimatedButton,
  FadeInView,
  SlideInView,
  PulseView,
  StaggeredList,
};

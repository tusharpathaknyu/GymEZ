import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface TransitionConfig {
  type: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown' | 'zoom' | 'flip';
  duration?: number;
  delay?: number;
}

interface ScreenTransitionProps {
  children: React.ReactNode;
  visible: boolean;
  config?: TransitionConfig;
  onTransitionEnd?: () => void;
}

// Individual transition animations
const fadeConfig = (anim: Animated.Value) => ({
  opacity: anim,
});

const slideConfig = (anim: Animated.Value) => ({
  opacity: anim,
  transform: [
    {
      translateX: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [width, 0],
      }),
    },
  ],
});

const slideUpConfig = (anim: Animated.Value) => ({
  opacity: anim,
  transform: [
    {
      translateY: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [height * 0.1, 0],
      }),
    },
  ],
});

const slideDownConfig = (anim: Animated.Value) => ({
  transform: [
    {
      translateY: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [-50, 0],
      }),
    },
  ],
});

const scaleConfig = (anim: Animated.Value) => ({
  opacity: anim,
  transform: [
    {
      scale: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.9, 1],
      }),
    },
  ],
});

const zoomConfig = (anim: Animated.Value) => ({
  opacity: anim,
  transform: [
    {
      scale: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 1],
      }),
    },
  ],
});

const flipConfig = (anim: Animated.Value) => ({
  opacity: anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  }),
  transform: [
    {
      rotateY: anim.interpolate({
        inputRange: [0, 1],
        outputRange: ['90deg', '0deg'],
      }),
    },
  ],
});

const getTransitionStyle = (type: string, anim: Animated.Value) => {
  switch (type) {
    case 'fade':
      return fadeConfig(anim);
    case 'slide':
      return slideConfig(anim);
    case 'slideUp':
      return slideUpConfig(anim);
    case 'slideDown':
      return slideDownConfig(anim);
    case 'scale':
      return scaleConfig(anim);
    case 'zoom':
      return zoomConfig(anim);
    case 'flip':
      return flipConfig(anim);
    default:
      return fadeConfig(anim);
  }
};

// Main Screen Transition Component
export const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  children,
  visible,
  config = { type: 'fade', duration: 300 },
  onTransitionEnd,
}) => {
  const anim = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: config.duration || 300,
      delay: config.delay || 0,
      useNativeDriver: true,
    }).start(() => {
      onTransitionEnd?.();
    });
  }, [visible]);

  const animatedStyle = getTransitionStyle(config.type, anim);

  return (
    <Animated.View style={[styles.transitionContainer, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

// Staggered List Animation - for list items appearing one after another
interface StaggeredListProps {
  children: React.ReactNode[];
  delay?: number;
  staggerDelay?: number;
  animation?: 'fadeUp' | 'fadeLeft' | 'scale' | 'fade';
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  delay = 0,
  staggerDelay = 100,
  animation = 'fadeUp',
}) => {
  const anims = useRef(children.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = anims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: delay + index * staggerDelay,
        useNativeDriver: true,
      })
    );

    Animated.stagger(staggerDelay, animations).start();
  }, []);

  const getItemStyle = (anim: Animated.Value) => {
    switch (animation) {
      case 'fadeUp':
        return {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        };
      case 'fadeLeft':
        return {
          opacity: anim,
          transform: [
            {
              translateX: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        };
      case 'scale':
        return {
          opacity: anim,
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        };
      default:
        return { opacity: anim };
    }
  };

  return (
    <>
      {React.Children.map(children, (child, index) => (
        <Animated.View key={index} style={getItemStyle(anims[index])}>
          {child}
        </Animated.View>
      ))}
    </>
  );
};

// Hero Animation - for featured content with dramatic entrance
interface HeroAnimationProps {
  children: React.ReactNode;
  delay?: number;
}

export const HeroAnimation: React.FC<HeroAnimationProps> = ({ children, delay = 0 }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
};

// Pulse Animation - for drawing attention to elements
interface PulseAnimationProps {
  children: React.ReactNode;
  active?: boolean;
  intensity?: number;
}

export const PulseAnimation: React.FC<PulseAnimationProps> = ({
  children,
  active = true,
  intensity = 0.05,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1 + intensity,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [active]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      {children}
    </Animated.View>
  );
};

// Shake Animation - for errors or attention
interface ShakeAnimationProps {
  children: React.ReactNode;
  trigger?: boolean;
  onAnimationEnd?: () => void;
}

export const ShakeAnimation: React.FC<ShakeAnimationProps> = ({
  children,
  trigger = false,
  onAnimationEnd,
}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start(() => onAnimationEnd?.());
    }
  }, [trigger]);

  return (
    <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
      {children}
    </Animated.View>
  );
};

// Bounce In Animation - for success states
interface BounceInProps {
  children: React.ReactNode;
  delay?: number;
}

export const BounceIn: React.FC<BounceInProps> = ({ children, delay = 0 }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(bounceAnim, {
      toValue: 1,
      velocity: 3,
      tension: 100,
      friction: 5,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  const animatedStyle = {
    opacity: bounceAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1, 1],
    }),
    transform: [
      {
        scale: bounceAnim.interpolate({
          inputRange: [0, 0.5, 0.8, 1],
          outputRange: [0.3, 1.1, 0.9, 1],
        }),
      },
    ],
  };

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

// Floating Animation - for badges, notifications
interface FloatingProps {
  children: React.ReactNode;
  distance?: number;
  duration?: number;
}

export const Floating: React.FC<FloatingProps> = ({
  children,
  distance = 5,
  duration = 2000,
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [
          {
            translateY: floatAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -distance],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
};

// Progress Ring Animation - for circular progress indicators
interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 100,
  strokeWidth = 8,
  color = '#10b981',
  backgroundColor = '#e5e7eb',
  children,
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // This is a simplified version - for actual implementation
  // you'd want to use react-native-svg for proper circular progress
  return (
    <View style={[styles.progressRingContainer, { width: size, height: size }]}>
      <View
        style={[
          styles.progressRingBackground,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: backgroundColor,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.progressRingForeground,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            transform: [
              {
                rotate: animatedProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      />
      {children && <View style={styles.progressRingContent}>{children}</View>}
    </View>
  );
};

// Count Up Animation - for numbers
interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: any;
}

export const CountUp: React.FC<CountUpProps> = ({
  end,
  start = 0,
  duration = 1500,
  prefix = '',
  suffix = '',
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(start)).current;
  const [displayValue, setDisplayValue] = React.useState(start);

  useEffect(() => {
    const listener = animatedValue.addListener(({ value }) => {
      setDisplayValue(Math.floor(value));
    });

    Animated.timing(animatedValue, {
      toValue: end,
      duration,
      useNativeDriver: false,
    }).start();

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [end]);

  return (
    <Text style={style}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </Text>
  );
};

const styles = StyleSheet.create({
  transitionContainer: {
    flex: 1,
  },
  progressRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingBackground: {
    position: 'absolute',
  },
  progressRingForeground: {
    position: 'absolute',
  },
  progressRingContent: {
    position: 'absolute',
  },
});

export default ScreenTransition;

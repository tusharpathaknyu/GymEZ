import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  type?: 'default' | 'saving' | 'loading' | 'syncing';
}

const LOADING_CONFIGS = {
  default: { icon: '⏳', message: 'Loading...' },
  saving: { icon: '💾', message: 'Saving...' },
  loading: { icon: '🔄', message: 'Loading...' },
  syncing: { icon: '☁️', message: 'Syncing...' },
};

/**
 * Full-screen loading overlay with animation
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
  type = 'default',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const config = LOADING_CONFIGS[type];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 15,
          stiffness: 200,
        }),
      ]).start();

      // Rotation animation
      const rotate = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );
      rotate.start();

      return () => rotate.stop();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.Text style={[styles.icon, { transform: [{ rotate }] }]}>
            {config.icon}
          </Animated.Text>
          <ActivityIndicator size="large" color="#10b981" style={styles.spinner} />
          <Text style={styles.message}>{message || config.message}</Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

/**
 * Inline loading indicator
 */
export const InlineLoader: React.FC<{
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
}> = ({ size = 'medium', color = '#10b981', message }) => {
  const sizes = { small: 20, medium: 32, large: 48 };

  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator size={sizes[size]} color={color} />
      {message && <Text style={styles.inlineMessage}>{message}</Text>}
    </View>
  );
};

/**
 * Button loading state
 */
export const ButtonLoader: React.FC<{
  color?: string;
}> = ({ color = '#fff' }) => {
  const dotAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const animations = dotAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      )
    );

    animations.forEach((a) => a.start());

    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.buttonLoaderContainer}>
      {dotAnims.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: color,
              opacity: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
              transform: [
                {
                  scale: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

/**
 * Progress bar with animation
 */
export const ProgressBar: React.FC<{
  progress: number; // 0 to 1
  color?: string;
  height?: number;
  showPercentage?: boolean;
  animated?: boolean;
}> = ({
  progress,
  color = '#10b981',
  height = 8,
  showPercentage = false,
  animated = true,
}) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.spring(widthAnim, {
        toValue: progress,
        useNativeDriver: false,
        damping: 15,
        stiffness: 100,
      }).start();
    } else {
      widthAnim.setValue(progress);
    }
  }, [progress, animated]);

  return (
    <View style={styles.progressContainer}>
      <View style={[styles.progressTrack, { height }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: color,
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
      )}
    </View>
  );
};

/**
 * Circular progress indicator
 */
export const CircularProgress: React.FC<{
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showValue?: boolean;
}> = ({
  progress,
  size = 60,
  strokeWidth = 6,
  color = '#10b981',
  showValue = true,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.circularContainer, { width: size, height: size }]}>
      <View
        style={[
          styles.circularTrack,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.circularProgress,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            transform: [{ rotate: rotation }],
          },
        ]}
      />
      {showValue && (
        <Text style={styles.circularValue}>{Math.round(progress * 100)}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  icon: {
    fontSize: 40,
    marginBottom: 16,
  },
  spinner: {
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '500',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  inlineMessage: {
    marginLeft: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  buttonLoaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    minWidth: 45,
    textAlign: 'right',
  },
  circularContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circularTrack: {
    position: 'absolute',
    borderColor: '#e5e7eb',
  },
  circularProgress: {
    position: 'absolute',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  circularValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
});

export default {
  LoadingOverlay,
  InlineLoader,
  ButtonLoader,
  ProgressBar,
  CircularProgress,
};

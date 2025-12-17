import { Platform, Vibration } from 'react-native';

// Haptic feedback types
type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection' | 'impact' | 'notification';

// Vibration patterns for Android (duration in ms)
const VIBRATION_PATTERNS: Record<HapticType, number[]> = {
  light: [0, 10],
  medium: [0, 20],
  heavy: [0, 30],
  success: [0, 10, 50, 10],
  warning: [0, 20, 50, 20],
  error: [0, 30, 50, 30, 50, 30],
  selection: [0, 5],
  impact: [0, 15],
  notification: [0, 10, 30, 10, 30, 10],
};

/**
 * Trigger haptic feedback
 * Uses native haptics on iOS, vibration patterns on Android
 */
export const hapticFeedback = (type: HapticType = 'light'): void => {
  try {
    if (Platform.OS === 'ios') {
      // iOS uses Taptic Engine - for now use basic vibration
      // In production, you'd use react-native-haptic-feedback
      const pattern = VIBRATION_PATTERNS[type];
      Vibration.vibrate(pattern[1] || 10);
    } else {
      // Android vibration
      const pattern = VIBRATION_PATTERNS[type];
      Vibration.vibrate(pattern);
    }
  } catch (error) {
    // Silently fail if haptics not available
    console.log('Haptic feedback not available');
  }
};

/**
 * Quick haptic for button presses
 */
export const buttonPress = (): void => {
  hapticFeedback('light');
};

/**
 * Haptic for successful actions
 */
export const successHaptic = (): void => {
  hapticFeedback('success');
};

/**
 * Haptic for errors
 */
export const errorHaptic = (): void => {
  hapticFeedback('error');
};

/**
 * Haptic for selection changes (like toggles, pickers)
 */
export const selectionHaptic = (): void => {
  hapticFeedback('selection');
};

/**
 * Haptic for impact (collisions, snaps)
 */
export const impactHaptic = (intensity: 'light' | 'medium' | 'heavy' = 'medium'): void => {
  hapticFeedback(intensity);
};

/**
 * Haptic for notifications
 */
export const notificationHaptic = (): void => {
  hapticFeedback('notification');
};

/**
 * Haptic for tab changes
 */
export const tabChangeHaptic = (): void => {
  hapticFeedback('selection');
};

/**
 * Haptic for completing a set/exercise
 */
export const setCompleteHaptic = (): void => {
  hapticFeedback('success');
};

/**
 * Haptic for PR achievement
 */
export const prAchievementHaptic = (): void => {
  // Double success pattern
  hapticFeedback('success');
  setTimeout(() => hapticFeedback('success'), 200);
};

/**
 * Haptic for workout complete
 */
export const workoutCompleteHaptic = (): void => {
  // Triple celebration pattern
  hapticFeedback('success');
  setTimeout(() => hapticFeedback('medium'), 150);
  setTimeout(() => hapticFeedback('success'), 300);
};

/**
 * Haptic for countdown tick
 */
export const countdownTickHaptic = (): void => {
  hapticFeedback('light');
};

/**
 * Haptic for timer end
 */
export const timerEndHaptic = (): void => {
  hapticFeedback('notification');
};

/**
 * Haptic for swipe actions
 */
export const swipeHaptic = (): void => {
  hapticFeedback('impact');
};

/**
 * Haptic for pull-to-refresh threshold
 */
export const refreshThresholdHaptic = (): void => {
  hapticFeedback('medium');
};

export default {
  hapticFeedback,
  buttonPress,
  successHaptic,
  errorHaptic,
  selectionHaptic,
  impactHaptic,
  notificationHaptic,
  tabChangeHaptic,
  setCompleteHaptic,
  prAchievementHaptic,
  workoutCompleteHaptic,
  countdownTickHaptic,
  timerEndHaptic,
  swipeHaptic,
  refreshThresholdHaptic,
};

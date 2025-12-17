import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  PanResponder,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { buttonPress } from '../utils/haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[];
  initialSnap?: number;
  enablePanDownToClose?: boolean;
  showHandle?: boolean;
  backgroundColor?: string;
}

/**
 * Smooth bottom sheet with gesture support
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  title,
  snapPoints = [0.5, 0.9],
  initialSnap = 0,
  enablePanDownToClose = true,
  showHandle = true,
  backgroundColor = '#fff',
}) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const currentSnapIndex = useRef(initialSnap);
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const getSnapPointY = useCallback((index: number) => {
    return SCREEN_HEIGHT * (1 - snapPoints[index]);
  }, [snapPoints]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: getSnapPointY(initialSnap),
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SCREEN_HEIGHT,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, initialSnap, getSnapPointY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        const currentY = getSnapPointY(currentSnapIndex.current);
        const newY = Math.max(0, currentY + gestureState.dy);
        translateY.setValue(newY);
      },
      onPanResponderRelease: (_, gestureState) => {
        const velocity = gestureState.vy;
        const currentY = getSnapPointY(currentSnapIndex.current);
        const finalY = currentY + gestureState.dy;

        // Close if dragged down fast or far enough
        if (enablePanDownToClose && (velocity > 1 || finalY > SCREEN_HEIGHT * 0.7)) {
          buttonPress();
          onClose();
          return;
        }

        // Find nearest snap point
        let nearestSnap = 0;
        let minDistance = Infinity;
        
        snapPoints.forEach((_, index) => {
          const snapY = getSnapPointY(index);
          const distance = Math.abs(finalY - snapY);
          if (distance < minDistance) {
            minDistance = distance;
            nearestSnap = index;
          }
        });

        // Consider velocity for snapping
        if (velocity < -0.5 && nearestSnap < snapPoints.length - 1) {
          nearestSnap++;
        } else if (velocity > 0.5 && nearestSnap > 0) {
          nearestSnap--;
        }

        currentSnapIndex.current = nearestSnap;
        buttonPress();

        Animated.spring(translateY, {
          toValue: getSnapPointY(nearestSnap),
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }).start();
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalContainer}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View 
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                }),
              },
            ]} 
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor,
              transform: [{ translateY }],
              maxHeight: SCREEN_HEIGHT * snapPoints[snapPoints.length - 1],
            },
          ]}
        >
          <View {...panResponder.panHandlers} style={styles.handleContainer}>
            {showHandle && <View style={styles.handle} />}
            {title && <Text style={styles.title}>{title}</Text>}
          </View>
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

interface ActionSheetOption {
  label: string;
  icon?: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  options: ActionSheetOption[];
  cancelLabel?: string;
}

/**
 * iOS-style action sheet with animations
 */
export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  onClose,
  title,
  message,
  options,
  cancelLabel = 'Cancel',
}) => {
  const translateY = useRef(new Animated.Value(300)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleOptionPress = (option: ActionSheetOption) => {
    if (option.disabled) return;
    buttonPress();
    onClose();
    setTimeout(() => option.onPress(), 200);
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <View style={styles.actionSheetContainer}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View 
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                }),
              },
            ]} 
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.actionSheetContent,
            { transform: [{ translateY }] },
          ]}
        >
          <View style={styles.optionsContainer}>
            {(title || message) && (
              <View style={styles.headerSection}>
                {title && <Text style={styles.actionTitle}>{title}</Text>}
                {message && <Text style={styles.actionMessage}>{message}</Text>}
              </View>
            )}
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  index === 0 && !title && !message && styles.firstOption,
                  index === options.length - 1 && styles.lastOption,
                  option.disabled && styles.disabledOption,
                ]}
                onPress={() => handleOptionPress(option)}
                activeOpacity={0.7}
                disabled={option.disabled}
              >
                {option.icon && (
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                )}
                <Text
                  style={[
                    styles.optionLabel,
                    option.destructive && styles.destructiveLabel,
                    option.disabled && styles.disabledLabel,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              buttonPress();
              onClose();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelLabel}>{cancelLabel}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

/**
 * Quick confirmation bottom sheet
 */
interface ConfirmSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

export const ConfirmSheet: React.FC<ConfirmSheetProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
}) => {
  return (
    <ActionSheet
      visible={visible}
      onClose={onClose}
      title={title}
      message={message}
      options={[
        {
          label: confirmLabel,
          onPress: onConfirm,
          destructive,
        },
      ]}
      cancelLabel={cancelLabel}
    />
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  handleContainer: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    marginBottom: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 34,
  },
  actionSheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 34,
  },
  actionSheetContent: {
    gap: 8,
  },
  optionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 14,
    overflow: 'hidden',
  },
  headerSection: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  actionMessage: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  firstOption: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  disabledOption: {
    opacity: 0.4,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  optionLabel: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '400',
  },
  destructiveLabel: {
    color: '#ef4444',
  },
  disabledLabel: {
    color: '#9ca3af',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  cancelLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default {
  BottomSheet,
  ActionSheet,
  ConfirmSheet,
};

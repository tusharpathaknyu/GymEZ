import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  Vibration,
} from 'react-native';
import { buttonPress, successHaptic, errorHaptic } from '../utils/haptics';

const { width } = Dimensions.get('window');

interface RestTimerProps {
  visible: boolean;
  onClose: () => void;
  defaultDuration?: number;
  onTimerComplete?: () => void;
}

const PRESET_TIMES = [
  { label: '30s', seconds: 30, color: '#10b981' },
  { label: '60s', seconds: 60, color: '#3b82f6' },
  { label: '90s', seconds: 90, color: '#8b5cf6' },
  { label: '2min', seconds: 120, color: '#f59e0b' },
  { label: '3min', seconds: 180, color: '#ef4444' },
  { label: '5min', seconds: 300, color: '#ec4899' },
];

const RestTimer: React.FC<RestTimerProps> = ({
  visible,
  onClose,
  defaultDuration = 90,
  onTimerComplete,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(defaultDuration);
  const [totalTime, setTotalTime] = useState(defaultDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start countdown
  const startTimer = useCallback((duration: number) => {
    buttonPress();
    setTotalTime(duration);
    setTimeRemaining(duration);
    setIsRunning(true);
    setIsPaused(false);
    
    // Reset and start progress animation
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration * 1000,
      useNativeDriver: false,
    }).start();
  }, [progressAnim]);

  // Pause/Resume timer
  const togglePause = useCallback(() => {
    buttonPress();
    if (isPaused) {
      setIsPaused(false);
      // Resume progress animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: timeRemaining * 1000,
        useNativeDriver: false,
      }).start();
    } else {
      setIsPaused(true);
      progressAnim.stopAnimation();
    }
  }, [isPaused, timeRemaining, progressAnim]);

  // Stop timer
  const stopTimer = useCallback(() => {
    buttonPress();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(totalTime);
    progressAnim.setValue(0);
    progressAnim.stopAnimation();
  }, [totalTime, progressAnim]);

  // Add time
  const addTime = useCallback((seconds: number) => {
    buttonPress();
    setTimeRemaining(prev => prev + seconds);
    setTotalTime(prev => prev + seconds);
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Timer complete
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            
            // Haptic feedback pattern for completion
            successHaptic();
            Vibration.vibrate([0, 200, 100, 200, 100, 200]);
            
            // Pulse animation
            Animated.sequence([
              Animated.timing(pulseAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
              Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
              Animated.timing(pulseAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
              Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();
            
            onTimerComplete?.();
            return 0;
          }
          
          // Haptic feedback at certain intervals
          if (prev === 11 || prev === 6 || prev <= 3) {
            buttonPress();
          }
          
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isRunning, isPaused, timeRemaining, pulseAnim, onTimerComplete]);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!visible) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsRunning(false);
      setIsPaused(false);
    }
  }, [visible]);

  // Progress percentage for circular indicator
  const progress = ((totalTime - timeRemaining) / totalTime) * 100;
  
  // Get color based on time remaining
  const getTimerColor = (): string => {
    if (timeRemaining <= 3) return '#ef4444';
    if (timeRemaining <= 10) return '#f59e0b';
    return '#10b981';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>⏱️ Rest Timer</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Timer Display */}
          <Animated.View 
            style={[
              styles.timerContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <View style={styles.timerRing}>
              {/* Progress Ring Background */}
              <View style={styles.ringBackground} />
              
              {/* Progress Ring */}
              <View 
                style={[
                  styles.ringProgress,
                  {
                    backgroundColor: isRunning ? getTimerColor() : '#e5e7eb',
                    transform: [{ rotate: `${(progress / 100) * 360}deg` }],
                  }
                ]}
              />
              
              {/* Timer Text */}
              <View style={styles.timerTextContainer}>
                <Text style={[styles.timerText, { color: isRunning ? getTimerColor() : '#374151' }]}>
                  {formatTime(timeRemaining)}
                </Text>
                <Text style={styles.timerStatus}>
                  {isRunning 
                    ? (isPaused ? 'PAUSED' : 'RESTING') 
                    : (timeRemaining === 0 ? 'COMPLETE!' : 'READY')
                  }
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Quick Add Buttons */}
          {isRunning && (
            <View style={styles.quickAddContainer}>
              <TouchableOpacity
                style={styles.quickAddButton}
                onPress={() => addTime(15)}
              >
                <Text style={styles.quickAddText}>+15s</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAddButton}
                onPress={() => addTime(30)}
              >
                <Text style={styles.quickAddText}>+30s</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAddButton}
                onPress={() => addTime(60)}
              >
                <Text style={styles.quickAddText}>+1min</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Preset Times */}
          {!isRunning && (
            <View style={styles.presetsContainer}>
              <Text style={styles.presetsTitle}>Quick Start</Text>
              <View style={styles.presetsGrid}>
                {PRESET_TIMES.map((preset) => (
                  <TouchableOpacity
                    key={preset.seconds}
                    style={[styles.presetButton, { backgroundColor: preset.color + '15' }]}
                    onPress={() => startTimer(preset.seconds)}
                  >
                    <Text style={[styles.presetText, { color: preset.color }]}>
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Control Buttons */}
          <View style={styles.controlsContainer}>
            {isRunning ? (
              <>
                <TouchableOpacity
                  style={[styles.controlButton, styles.stopButton]}
                  onPress={stopTimer}
                >
                  <Text style={styles.stopIcon}>■</Text>
                  <Text style={styles.controlText}>Stop</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.controlButton, styles.pauseButton]}
                  onPress={togglePause}
                >
                  <Text style={styles.pauseIcon}>{isPaused ? '▶' : '⏸'}</Text>
                  <Text style={styles.controlText}>{isPaused ? 'Resume' : 'Pause'}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.controlButton, styles.startButton]}
                onPress={() => startTimer(totalTime)}
              >
                <Text style={styles.startIcon}>▶</Text>
                <Text style={styles.startText}>Start Timer</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Custom Time Input */}
          {!isRunning && (
            <View style={styles.customContainer}>
              <Text style={styles.customLabel}>Custom Duration</Text>
              <View style={styles.customInputRow}>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => setTotalTime(Math.max(15, totalTime - 15))}
                >
                  <Text style={styles.adjustText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.customTime}>{formatTime(totalTime)}</Text>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => setTotalTime(totalTime + 15)}
                >
                  <Text style={styles.adjustText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Mini Timer Component for embedding in workout screen
export const MiniRestTimer: React.FC<{
  seconds: number;
  onComplete?: () => void;
  onPress?: () => void;
}> = ({ seconds, onComplete, onPress }) => {
  const [timeRemaining, setTimeRemaining] = useState(seconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsActive(false);
            successHaptic();
            onComplete?.();
            return 0;
          }
          if (prev <= 3) buttonPress();
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeRemaining, onComplete]);

  const formatTime = (secs: number): string => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  const handlePress = () => {
    buttonPress();
    if (onPress) {
      onPress();
    } else {
      if (isActive) {
        setIsActive(false);
      } else {
        setTimeRemaining(seconds);
        setIsActive(true);
      }
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.miniContainer,
        isActive && { backgroundColor: '#fef3c7' }
      ]}
      onPress={handlePress}
    >
      <Text style={styles.miniIcon}>⏱️</Text>
      <Text style={[
        styles.miniTime,
        isActive && { color: '#f59e0b' }
      ]}>
        {formatTime(timeRemaining)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: '#6b7280',
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  timerRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ringBackground: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#fff',
  },
  ringProgress: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.2,
  },
  timerTextContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 52,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  timerStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 4,
    letterSpacing: 1,
  },
  quickAddContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  quickAddButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  quickAddText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  presetsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  presetsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetButton: {
    width: (width - 70) / 3,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  presetText: {
    fontSize: 16,
    fontWeight: '700',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  startButton: {
    backgroundColor: '#10b981',
  },
  pauseButton: {
    backgroundColor: '#3b82f6',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  startIcon: {
    color: '#fff',
    fontSize: 20,
  },
  pauseIcon: {
    color: '#fff',
    fontSize: 18,
  },
  stopIcon: {
    color: '#fff',
    fontSize: 16,
  },
  startText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  controlText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  customContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  customLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  adjustButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
  },
  customTime: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    minWidth: 80,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  // Mini Timer styles
  miniContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  miniIcon: {
    fontSize: 14,
  },
  miniTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    fontVariant: ['tabular-nums'],
  },
});

export default RestTimer;

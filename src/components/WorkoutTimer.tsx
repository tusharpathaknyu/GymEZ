import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Vibration,
  AppState,
  AppStateStatus,
} from 'react-native';

interface WorkoutTimerProps {
  onWorkoutComplete?: (duration: number) => void;
  onRestComplete?: () => void;
  initialRestSeconds?: number;
}

export const WorkoutTimer: React.FC<WorkoutTimerProps> = ({
  onWorkoutComplete,
  onRestComplete,
  initialRestSeconds = 60,
}) => {
  const [workoutTime, setWorkoutTime] = useState(0);
  const [restTime, setRestTime] = useState(initialRestSeconds);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isRestActive, setIsRestActive] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [restStartTime, setRestStartTime] = useState<Date | null>(null);

  const workoutIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const restIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const appStateRef = useRef(AppState.currentState);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground, update timers based on elapsed time
        if (isWorkoutActive && workoutStartTime) {
          const elapsed = Math.floor(
            (Date.now() - workoutStartTime.getTime()) / 1000,
          );
          setWorkoutTime(elapsed);
        }
        if (isRestActive && restStartTime) {
          const elapsed = Math.floor(
            (Date.now() - restStartTime.getTime()) / 1000,
          );
          const remaining = Math.max(0, initialRestSeconds - elapsed);
          setRestTime(remaining);
          if (remaining === 0 && isRestActive) {
            finishRest();
          }
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription?.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isWorkoutActive,
    isRestActive,
    workoutStartTime,
    restStartTime,
    initialRestSeconds,
  ]);

  useEffect(() => {
    if (isWorkoutActive) {
      workoutIntervalRef.current = setInterval(() => {
        setWorkoutTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(workoutIntervalRef.current);
    }

    return () => clearInterval(workoutIntervalRef.current);
  }, [isWorkoutActive]);

  useEffect(() => {
    if (isRestActive && restTime > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestTime(prev => {
          if (prev <= 1) {
            finishRest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(restIntervalRef.current);
    }

    return () => clearInterval(restIntervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRestActive, restTime]);

  useEffect(() => {
    if (isRestActive) {
      startPulseAnimation();
    } else {
      pulseAnim.setValue(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRestActive]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setWorkoutStartTime(new Date());
    setWorkoutTime(0);
  };

  const pauseWorkout = () => {
    setIsWorkoutActive(false);
  };

  const resumeWorkout = () => {
    setIsWorkoutActive(true);
    setWorkoutStartTime(new Date(Date.now() - workoutTime * 1000));
  };

  const finishWorkout = () => {
    setIsWorkoutActive(false);

    Alert.alert(
      'Workout Complete!',
      `Great job! You worked out for ${formatTime(workoutTime)}.`,
      [
        {
          text: 'OK',
          onPress: () => {
            onWorkoutComplete?.(workoutTime);
            setWorkoutTime(0);
            setWorkoutStartTime(null);
          },
        },
      ],
    );
  };

  const startRest = (customRestTime?: number) => {
    const restDuration = customRestTime || initialRestSeconds;
    setRestTime(restDuration);
    setIsRestActive(true);
    setRestStartTime(new Date());

    // Fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0.7,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const finishRest = () => {
    setIsRestActive(false);
    setRestTime(initialRestSeconds);
    setRestStartTime(null);

    // Vibrate and show alert
    Vibration.vibrate([500, 200, 500]);

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    onRestComplete?.();

    Alert.alert('Rest Complete!', 'Time to get back to work! 💪');
  };

  const skipRest = () => {
    finishRest();
  };

  const addRestTime = (seconds: number) => {
    setRestTime(prev => prev + seconds);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds
        .toString()
        .padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getRestTimeColor = (): string => {
    if (restTime <= 10) {
      return '#FF3B30';
    }
    if (restTime <= 30) {
      return '#FF9500';
    }
    return '#007AFF';
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.timerSection}>
        <Text style={styles.sectionTitle}>Workout Time</Text>
        <Text style={styles.workoutTime}>{formatTime(workoutTime)}</Text>

        <View style={styles.workoutControls}>
          {!isWorkoutActive ? (
            <TouchableOpacity
              style={[styles.button, styles.startButton]}
              onPress={workoutTime > 0 ? resumeWorkout : startWorkout}
            >
              <Text style={styles.buttonText}>
                {workoutTime > 0 ? '▶️ Resume' : '🏃‍♂️ Start Workout'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.pauseButton]}
              onPress={pauseWorkout}
            >
              <Text style={styles.buttonText}>⏸️ Pause</Text>
            </TouchableOpacity>
          )}

          {workoutTime > 0 && (
            <TouchableOpacity
              style={[styles.button, styles.finishButton]}
              onPress={finishWorkout}
            >
              <Text style={styles.buttonText}>✅ Finish</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.timerSection}>
        <Text style={styles.sectionTitle}>Rest Timer</Text>

        {!isRestActive ? (
          <View style={styles.restSetup}>
            <Text style={styles.restTimeDisplay}>
              Ready: {formatTime(restTime)}
            </Text>

            <View style={styles.restControls}>
              <View style={styles.restTimeButtons}>
                {[30, 45, 60, 90, 120].map(seconds => (
                  <TouchableOpacity
                    key={seconds}
                    style={[
                      styles.timeButton,
                      restTime === seconds && styles.selectedTimeButton,
                    ]}
                    onPress={() => setRestTime(seconds)}
                  >
                    <Text
                      style={[
                        styles.timeButtonText,
                        restTime === seconds && styles.selectedTimeButtonText,
                      ]}
                    >
                      {seconds}s
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.button, styles.restButton]}
                onPress={() => startRest()}
                disabled={!isWorkoutActive}
              >
                <Text style={styles.buttonText}>⏱️ Start Rest</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.activeRest}>
            <Animated.View
              style={[
                styles.restTimeContainer,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Text
                style={[styles.restTimeActive, { color: getRestTimeColor() }]}
              >
                {formatTime(restTime)}
              </Text>
            </Animated.View>

            <View style={styles.restActiveControls}>
              <TouchableOpacity
                style={[styles.button, styles.skipButton]}
                onPress={skipRest}
              >
                <Text style={styles.buttonText}>⏭️ Skip</Text>
              </TouchableOpacity>

              <View style={styles.addTimeButtons}>
                <TouchableOpacity
                  style={styles.addTimeButton}
                  onPress={() => addRestTime(15)}
                >
                  <Text style={styles.addTimeButtonText}>+15s</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addTimeButton}
                  onPress={() => addRestTime(30)}
                >
                  <Text style={styles.addTimeButtonText}>+30s</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>

      {isRestActive && (
        <View style={styles.motivationContainer}>
          <Text style={styles.motivationText}>
            {restTime > 30
              ? '💪 Recovery time!'
              : restTime > 10
              ? '🔥 Almost ready!'
              : '⚡ Get ready!'}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timerSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  workoutTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  workoutControls: {
    flexDirection: 'row',
    gap: 15,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    minWidth: 120,
  },
  startButton: {
    backgroundColor: '#34C759',
  },
  pauseButton: {
    backgroundColor: '#FF9500',
  },
  finishButton: {
    backgroundColor: '#007AFF',
  },
  restButton: {
    backgroundColor: '#5856D6',
  },
  skipButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 30,
  },
  restSetup: {
    alignItems: 'center',
    width: '100%',
  },
  restTimeDisplay: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  restControls: {
    width: '100%',
    alignItems: 'center',
  },
  restTimeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  timeButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTimeButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  timeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  selectedTimeButtonText: {
    color: '#fff',
  },
  activeRest: {
    alignItems: 'center',
  },
  restTimeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#F2F2F7',
    marginBottom: 20,
  },
  restTimeActive: {
    fontSize: 40,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  restActiveControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  addTimeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  addTimeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 15,
  },
  addTimeButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  motivationContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  motivationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

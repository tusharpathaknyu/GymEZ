import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Dimensions,
  Alert,
  Vibration,
} from 'react-native';
import { useAuth } from '../services/auth';

const { width, height } = Dimensions.get('window');

interface ExerciseSet {
  setNumber: number;
  weight: string;
  reps: string;
  completed: boolean;
  restTime?: number;
}

interface WorkoutExercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
  notes: string;
}

interface WorkoutState {
  isActive: boolean;
  isPaused: boolean;
  startTime: Date | null;
  pausedTime: number;
  exercises: WorkoutExercise[];
  currentExerciseIndex: number;
  totalVolume: number;
  totalSets: number;
}

const QUICK_EXERCISES = [
  { id: '1', name: 'Bench Press', emoji: '🏋️' },
  { id: '2', name: 'Squat', emoji: '🦵' },
  { id: '3', name: 'Deadlift', emoji: '💪' },
  { id: '4', name: 'Overhead Press', emoji: '🏋️' },
  { id: '5', name: 'Barbell Row', emoji: '🔙' },
  { id: '6', name: 'Pull-ups', emoji: '💪' },
  { id: '7', name: 'Dumbbell Curl', emoji: '💪' },
  { id: '8', name: 'Tricep Dips', emoji: '💪' },
  { id: '9', name: 'Leg Press', emoji: '🦵' },
  { id: '10', name: 'Lat Pulldown', emoji: '🔙' },
];

const LiveWorkoutScreen = ({ navigation }: { navigation: any }) => {
  const { user } = useAuth();
  const [workout, setWorkout] = useState<WorkoutState>({
    isActive: false,
    isPaused: false,
    startTime: null,
    pausedTime: 0,
    exercises: [],
    currentExerciseIndex: 0,
    totalVolume: 0,
    totalSets: 0,
  });
  
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const restInterval = useRef<NodeJS.Timeout | null>(null);

  // Pulse animation for active workout indicator
  useEffect(() => {
    if (workout.isActive && !workout.isPaused) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [workout.isActive, workout.isPaused]);

  // Workout timer
  useEffect(() => {
    if (workout.isActive && !workout.isPaused && workout.startTime) {
      timerInterval.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - workout.startTime!.getTime()) / 1000) - workout.pausedTime;
        setElapsedTime(elapsed);
      }, 1000);
    } else if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }

    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [workout.isActive, workout.isPaused, workout.startTime, workout.pausedTime]);

  // Rest timer
  useEffect(() => {
    if (restTimer !== null && restTimer > 0) {
      restInterval.current = setInterval(() => {
        setRestTimer(prev => {
          if (prev === null || prev <= 1) {
            Vibration.vibrate([0, 200, 100, 200]);
            setShowRestTimer(false);
            return null;
          }
          if (prev === 4) {
            Vibration.vibrate(100);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (restInterval.current) clearInterval(restInterval.current);
    };
  }, [restTimer]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startWorkout = () => {
    setWorkout({
      ...workout,
      isActive: true,
      isPaused: false,
      startTime: new Date(),
      exercises: [],
    });
    Vibration.vibrate(100);
  };

  const pauseWorkout = () => {
    setWorkout(prev => ({
      ...prev,
      isPaused: true,
    }));
  };

  const resumeWorkout = () => {
    if (workout.startTime) {
      const pauseDuration = Math.floor((new Date().getTime() - workout.startTime.getTime()) / 1000) - elapsedTime;
      setWorkout(prev => ({
        ...prev,
        isPaused: false,
        pausedTime: pauseDuration,
      }));
    }
  };

  const finishWorkout = () => {
    Alert.alert(
      'Finish Workout?',
      `You've completed ${workout.totalSets} sets with ${workout.totalVolume.toLocaleString()} lbs total volume.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          style: 'default',
          onPress: () => {
            // Save workout to database
            setWorkout({
              isActive: false,
              isPaused: false,
              startTime: null,
              pausedTime: 0,
              exercises: [],
              currentExerciseIndex: 0,
              totalVolume: 0,
              totalSets: 0,
            });
            setElapsedTime(0);
            Vibration.vibrate([0, 100, 50, 100, 50, 100]);
            Alert.alert('🎉 Great Workout!', 'Your workout has been saved.');
          },
        },
      ]
    );
  };

  const discardWorkout = () => {
    Alert.alert(
      'Discard Workout?',
      'This will delete all progress from this session.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            setWorkout({
              isActive: false,
              isPaused: false,
              startTime: null,
              pausedTime: 0,
              exercises: [],
              currentExerciseIndex: 0,
              totalVolume: 0,
              totalSets: 0,
            });
            setElapsedTime(0);
          },
        },
      ]
    );
  };

  const addExercise = (exerciseName: string) => {
    const newExercise: WorkoutExercise = {
      id: Date.now().toString(),
      name: exerciseName,
      sets: [{ setNumber: 1, weight: '', reps: '', completed: false }],
      notes: '',
    };
    
    setWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
      currentExerciseIndex: prev.exercises.length,
    }));
    setShowExercisePicker(false);
  };

  const addSet = (exerciseIndex: number) => {
    setWorkout(prev => {
      const exercises = [...prev.exercises];
      const lastSet = exercises[exerciseIndex].sets[exercises[exerciseIndex].sets.length - 1];
      exercises[exerciseIndex].sets.push({
        setNumber: exercises[exerciseIndex].sets.length + 1,
        weight: lastSet.weight,
        reps: lastSet.reps,
        completed: false,
      });
      return { ...prev, exercises };
    });
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
    setWorkout(prev => {
      const exercises = [...prev.exercises];
      exercises[exerciseIndex].sets[setIndex][field] = value;
      return { ...prev, exercises };
    });
  };

  const completeSet = (exerciseIndex: number, setIndex: number) => {
    const exercise = workout.exercises[exerciseIndex];
    const set = exercise.sets[setIndex];
    
    if (!set.weight || !set.reps) {
      Alert.alert('Missing Info', 'Please enter weight and reps before completing the set.');
      return;
    }

    const weight = parseFloat(set.weight);
    const reps = parseInt(set.reps);
    const volume = weight * reps;

    setWorkout(prev => {
      const exercises = [...prev.exercises];
      exercises[exerciseIndex].sets[setIndex].completed = true;
      return {
        ...prev,
        exercises,
        totalVolume: prev.totalVolume + volume,
        totalSets: prev.totalSets + 1,
      };
    });

    Vibration.vibrate(50);
    setRestTimer(90); // Default 90 second rest
    setShowRestTimer(true);
  };

  const openExercisePicker = () => {
    setShowExercisePicker(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeExercisePicker = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setShowExercisePicker(false));
  };

  // Pre-workout state
  if (!workout.isActive) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Start Workout</Text>
          <Text style={styles.headerSubtitle}>Track your sets and reps in real-time</Text>
        </View>

        <ScrollView style={styles.preWorkoutContent} showsVerticalScrollIndicator={false}>
          <View style={styles.startCard}>
            <Text style={styles.startEmoji}>🏋️</Text>
            <Text style={styles.startTitle}>Ready to train?</Text>
            <Text style={styles.startDescription}>
              Start an empty workout and add exercises as you go, or choose a template below.
            </Text>
            
            <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
              <Text style={styles.startButtonText}>Start Empty Workout</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Quick Start Templates</Text>
          {[
            { name: 'Push Day', desc: 'Chest, Shoulders, Triceps', icon: '💪' },
            { name: 'Pull Day', desc: 'Back, Biceps', icon: '🔙' },
            { name: 'Leg Day', desc: 'Quads, Hamstrings, Glutes', icon: '🦵' },
            { name: 'Full Body', desc: 'Complete workout', icon: '🏋️' },
          ].map((template, index) => (
            <TouchableOpacity key={index} style={styles.templateCard} onPress={startWorkout}>
              <Text style={styles.templateIcon}>{template.icon}</Text>
              <View style={styles.templateInfo}>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateDesc}>{template.desc}</Text>
              </View>
              <Text style={styles.templateChevron}>›</Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          <View style={styles.emptyRecent}>
            <Text style={styles.emptyRecentText}>Your recent workouts will appear here</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Active workout state
  return (
    <View style={styles.container}>
      {/* Active Workout Header */}
      <Animated.View style={[styles.activeHeader, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.timerContainer}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
          {workout.isPaused && <Text style={styles.pausedText}>PAUSED</Text>}
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{workout.totalSets}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{workout.totalVolume.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Volume (lbs)</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{workout.exercises.length}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
        </View>

        <View style={styles.controlRow}>
          {workout.isPaused ? (
            <TouchableOpacity style={styles.controlButton} onPress={resumeWorkout}>
              <Text style={styles.controlIcon}>▶️</Text>
              <Text style={styles.controlText}>Resume</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.controlButton} onPress={pauseWorkout}>
              <Text style={styles.controlIcon}>⏸️</Text>
              <Text style={styles.controlText}>Pause</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.controlButton, styles.finishButton]} onPress={finishWorkout}>
            <Text style={styles.controlIcon}>✅</Text>
            <Text style={[styles.controlText, styles.finishText]}>Finish</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={discardWorkout}>
            <Text style={styles.controlIcon}>🗑️</Text>
            <Text style={styles.controlText}>Discard</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Rest Timer Overlay */}
      {showRestTimer && restTimer !== null && (
        <View style={styles.restOverlay}>
          <View style={styles.restCard}>
            <Text style={styles.restLabel}>REST TIME</Text>
            <Text style={styles.restTime}>{formatTime(restTimer)}</Text>
            <View style={styles.restButtons}>
              <TouchableOpacity 
                style={styles.restAdjustButton} 
                onPress={() => setRestTimer(prev => Math.max(0, (prev || 0) - 15))}
              >
                <Text style={styles.restAdjustText}>-15s</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.skipRestButton} 
                onPress={() => { setRestTimer(null); setShowRestTimer(false); }}
              >
                <Text style={styles.skipRestText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.restAdjustButton}
                onPress={() => setRestTimer(prev => (prev || 0) + 15)}
              >
                <Text style={styles.restAdjustText}>+15s</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Exercise List */}
      <ScrollView style={styles.exerciseList} showsVerticalScrollIndicator={false}>
        {workout.exercises.map((exercise, exerciseIndex) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <TouchableOpacity style={styles.exerciseMenu}>
                <Text style={styles.exerciseMenuIcon}>⋮</Text>
              </TouchableOpacity>
            </View>

            {/* Sets Table */}
            <View style={styles.setsTable}>
              <View style={styles.setsHeader}>
                <Text style={[styles.setHeaderCell, styles.setCell]}>SET</Text>
                <Text style={[styles.setHeaderCell, styles.weightCell]}>LBS</Text>
                <Text style={[styles.setHeaderCell, styles.repsCell]}>REPS</Text>
                <Text style={[styles.setHeaderCell, styles.checkCell]}>✓</Text>
              </View>

              {exercise.sets.map((set, setIndex) => (
                <View key={setIndex} style={[styles.setRow, set.completed && styles.setRowCompleted]}>
                  <Text style={[styles.setCellText, styles.setCell]}>{set.setNumber}</Text>
                  <TextInput
                    style={[styles.setInput, styles.weightCell, set.completed && styles.setInputCompleted]}
                    value={set.weight}
                    onChangeText={(value) => updateSet(exerciseIndex, setIndex, 'weight', value)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    editable={!set.completed}
                  />
                  <TextInput
                    style={[styles.setInput, styles.repsCell, set.completed && styles.setInputCompleted]}
                    value={set.reps}
                    onChangeText={(value) => updateSet(exerciseIndex, setIndex, 'reps', value)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    editable={!set.completed}
                  />
                  <TouchableOpacity
                    style={[styles.checkButton, set.completed && styles.checkButtonCompleted]}
                    onPress={() => !set.completed && completeSet(exerciseIndex, setIndex)}
                    disabled={set.completed}
                  >
                    <Text style={[styles.checkIcon, set.completed && styles.checkIconCompleted]}>
                      {set.completed ? '✓' : '○'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.addSetButton} 
              onPress={() => addSet(exerciseIndex)}
            >
              <Text style={styles.addSetText}>+ Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Add Exercise Button */}
        <TouchableOpacity style={styles.addExerciseButton} onPress={openExercisePicker}>
          <Text style={styles.addExerciseText}>+ Add Exercise</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={closeExercisePicker} />
          <Animated.View style={[styles.exercisePicker, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Add Exercise</Text>
              <TouchableOpacity onPress={closeExercisePicker}>
                <Text style={styles.pickerClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.pickerContent}>
              {QUICK_EXERCISES.map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  style={styles.pickerItem}
                  onPress={() => addExercise(exercise.name)}
                >
                  <Text style={styles.pickerItemEmoji}>{exercise.emoji}</Text>
                  <Text style={styles.pickerItemName}>{exercise.name}</Text>
                  <Text style={styles.pickerItemAdd}>+</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 4,
  },
  preWorkoutContent: {
    flex: 1,
    padding: 20,
  },
  startCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  startEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  startTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  startDescription: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    marginTop: 8,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  templateIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  templateDesc: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  templateChevron: {
    fontSize: 24,
    color: '#d1d5db',
  },
  emptyRecent: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyRecentText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  // Active Workout Styles
  activeHeader: {
    backgroundColor: '#111827',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ef4444',
    letterSpacing: 1,
  },
  timerText: {
    fontSize: 56,
    fontWeight: '200',
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  pausedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  finishButton: {
    backgroundColor: '#10b981',
  },
  controlIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  controlText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  finishText: {
    color: '#fff',
  },
  // Rest Timer
  restOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  restCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: width - 48,
  },
  restLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 2,
    marginBottom: 8,
  },
  restTime: {
    fontSize: 72,
    fontWeight: '200',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  restButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  restAdjustButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
  },
  restAdjustText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  skipRestButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#10b981',
    borderRadius: 10,
  },
  skipRestText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  // Exercise List
  exerciseList: {
    flex: 1,
    padding: 16,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  exerciseMenu: {
    padding: 4,
  },
  exerciseMenuIcon: {
    fontSize: 20,
    color: '#9ca3af',
  },
  setsTable: {
    marginBottom: 12,
  },
  setsHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 8,
  },
  setHeaderCell: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  setCell: {
    width: 40,
    textAlign: 'center',
  },
  weightCell: {
    flex: 1,
    textAlign: 'center',
  },
  repsCell: {
    flex: 1,
    textAlign: 'center',
  },
  checkCell: {
    width: 50,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  setRowCompleted: {
    backgroundColor: '#f0fdf4',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  setCellText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  setInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginHorizontal: 4,
  },
  setInputCompleted: {
    backgroundColor: 'transparent',
    color: '#10b981',
  },
  checkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkButtonCompleted: {
    backgroundColor: '#10b981',
  },
  checkIcon: {
    fontSize: 18,
    color: '#9ca3af',
  },
  checkIconCompleted: {
    color: '#fff',
    fontWeight: '700',
  },
  addSetButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  addSetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  addExerciseButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  addExerciseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  bottomPadding: {
    height: 100,
  },
  // Exercise Picker Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  exercisePicker: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.7,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  pickerClose: {
    fontSize: 24,
    color: '#6b7280',
  },
  pickerContent: {
    padding: 16,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pickerItemEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  pickerItemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  pickerItemAdd: {
    fontSize: 24,
    color: '#10b981',
    fontWeight: '300',
  },
});

export default LiveWorkoutScreen;

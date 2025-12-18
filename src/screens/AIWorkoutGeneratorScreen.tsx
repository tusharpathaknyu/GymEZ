import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { buttonPress, successHaptic } from '../utils/haptics';

const { width } = Dimensions.get('window');

interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
  muscleGroup: string;
}

interface GeneratedWorkout {
  name: string;
  duration: string;
  difficulty: string;
  focus: string;
  exercises: WorkoutExercise[];
  warmup: string[];
  cooldown: string[];
  tips: string[];
}

const GOALS = [
  { id: 'strength', label: 'Build Strength', icon: '💪', color: '#ef4444' },
  { id: 'muscle', label: 'Build Muscle', icon: '🏋️', color: '#8b5cf6' },
  { id: 'fatloss', label: 'Lose Fat', icon: '🔥', color: '#f59e0b' },
  { id: 'endurance', label: 'Endurance', icon: '🏃', color: '#3b82f6' },
];

const EQUIPMENT = [
  { id: 'full', label: 'Full Gym', icon: '🏢' },
  { id: 'dumbbells', label: 'Dumbbells Only', icon: '🏋️' },
  { id: 'barbell', label: 'Barbell + Rack', icon: '🪨' },
  { id: 'bodyweight', label: 'Bodyweight', icon: '🤸' },
  { id: 'home', label: 'Home Gym', icon: '🏠' },
];

const DURATION = [
  { id: '30', label: '30 min', icon: '⚡' },
  { id: '45', label: '45 min', icon: '⏱️' },
  { id: '60', label: '60 min', icon: '💪' },
  { id: '90', label: '90 min', icon: '🔥' },
];

const FOCUS_AREAS = [
  { id: 'push', label: 'Push (Chest, Shoulders, Triceps)', short: 'Push' },
  { id: 'pull', label: 'Pull (Back, Biceps)', short: 'Pull' },
  { id: 'legs', label: 'Legs (Quads, Hamstrings, Glutes)', short: 'Legs' },
  { id: 'upper', label: 'Upper Body', short: 'Upper' },
  { id: 'lower', label: 'Lower Body', short: 'Lower' },
  { id: 'full', label: 'Full Body', short: 'Full Body' },
  { id: 'arms', label: 'Arms & Shoulders', short: 'Arms' },
  { id: 'core', label: 'Core & Abs', short: 'Core' },
];

// AI Workout Generation Logic
const generateWorkout = (
  goal: string,
  equipment: string,
  duration: string,
  focus: string
): GeneratedWorkout => {
  const exercises: { [key: string]: WorkoutExercise[] } = {
    push_full: [
      { name: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: '2-3 min', muscleGroup: 'Chest', notes: 'Focus on controlled descent' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: '8-10', rest: '90 sec', muscleGroup: 'Upper Chest' },
      { name: 'Overhead Press', sets: 4, reps: '6-8', rest: '2 min', muscleGroup: 'Shoulders' },
      { name: 'Cable Flyes', sets: 3, reps: '12-15', rest: '60 sec', muscleGroup: 'Chest' },
      { name: 'Lateral Raises', sets: 4, reps: '12-15', rest: '60 sec', muscleGroup: 'Side Delts' },
      { name: 'Tricep Pushdowns', sets: 3, reps: '10-12', rest: '60 sec', muscleGroup: 'Triceps' },
      { name: 'Overhead Tricep Extension', sets: 3, reps: '10-12', rest: '60 sec', muscleGroup: 'Triceps' },
    ],
    pull_full: [
      { name: 'Deadlift', sets: 4, reps: '5', rest: '3 min', muscleGroup: 'Back', notes: 'Warm up thoroughly' },
      { name: 'Pull-ups', sets: 4, reps: '6-10', rest: '2 min', muscleGroup: 'Lats', notes: 'Add weight if needed' },
      { name: 'Barbell Rows', sets: 4, reps: '8-10', rest: '90 sec', muscleGroup: 'Back' },
      { name: 'Face Pulls', sets: 4, reps: '15-20', rest: '60 sec', muscleGroup: 'Rear Delts' },
      { name: 'Lat Pulldowns', sets: 3, reps: '10-12', rest: '60 sec', muscleGroup: 'Lats' },
      { name: 'Barbell Curls', sets: 3, reps: '8-10', rest: '60 sec', muscleGroup: 'Biceps' },
      { name: 'Hammer Curls', sets: 3, reps: '10-12', rest: '60 sec', muscleGroup: 'Biceps' },
    ],
    legs_full: [
      { name: 'Barbell Back Squat', sets: 4, reps: '6-8', rest: '3 min', muscleGroup: 'Quads', notes: 'Go to parallel or below' },
      { name: 'Romanian Deadlift', sets: 4, reps: '8-10', rest: '2 min', muscleGroup: 'Hamstrings' },
      { name: 'Leg Press', sets: 3, reps: '10-12', rest: '90 sec', muscleGroup: 'Quads' },
      { name: 'Walking Lunges', sets: 3, reps: '12 each', rest: '90 sec', muscleGroup: 'Quads/Glutes' },
      { name: 'Leg Curls', sets: 3, reps: '10-12', rest: '60 sec', muscleGroup: 'Hamstrings' },
      { name: 'Calf Raises', sets: 4, reps: '12-15', rest: '60 sec', muscleGroup: 'Calves' },
    ],
    upper_full: [
      { name: 'Bench Press', sets: 4, reps: '6-8', rest: '2 min', muscleGroup: 'Chest' },
      { name: 'Barbell Rows', sets: 4, reps: '6-8', rest: '2 min', muscleGroup: 'Back' },
      { name: 'Overhead Press', sets: 3, reps: '8-10', rest: '90 sec', muscleGroup: 'Shoulders' },
      { name: 'Pull-ups', sets: 3, reps: 'AMRAP', rest: '90 sec', muscleGroup: 'Lats' },
      { name: 'Dumbbell Curls', sets: 3, reps: '10-12', rest: '60 sec', muscleGroup: 'Biceps' },
      { name: 'Tricep Dips', sets: 3, reps: '10-12', rest: '60 sec', muscleGroup: 'Triceps' },
    ],
    full_full: [
      { name: 'Barbell Squat', sets: 3, reps: '8', rest: '2 min', muscleGroup: 'Legs' },
      { name: 'Bench Press', sets: 3, reps: '8', rest: '2 min', muscleGroup: 'Chest' },
      { name: 'Barbell Rows', sets: 3, reps: '8', rest: '2 min', muscleGroup: 'Back' },
      { name: 'Overhead Press', sets: 3, reps: '8', rest: '90 sec', muscleGroup: 'Shoulders' },
      { name: 'Romanian Deadlift', sets: 3, reps: '10', rest: '90 sec', muscleGroup: 'Hamstrings' },
      { name: 'Plank', sets: 3, reps: '45 sec', rest: '60 sec', muscleGroup: 'Core' },
    ],
    push_bodyweight: [
      { name: 'Push-ups', sets: 4, reps: '15-20', rest: '60 sec', muscleGroup: 'Chest' },
      { name: 'Diamond Push-ups', sets: 3, reps: '10-12', rest: '60 sec', muscleGroup: 'Triceps' },
      { name: 'Pike Push-ups', sets: 3, reps: '10-12', rest: '60 sec', muscleGroup: 'Shoulders' },
      { name: 'Decline Push-ups', sets: 3, reps: '12-15', rest: '60 sec', muscleGroup: 'Upper Chest' },
      { name: 'Tricep Dips (Chair)', sets: 3, reps: '12-15', rest: '60 sec', muscleGroup: 'Triceps' },
      { name: 'Wide Push-ups', sets: 3, reps: '12-15', rest: '60 sec', muscleGroup: 'Chest' },
    ],
    pull_bodyweight: [
      { name: 'Pull-ups', sets: 4, reps: 'Max', rest: '2 min', muscleGroup: 'Lats' },
      { name: 'Chin-ups', sets: 3, reps: 'Max', rest: '2 min', muscleGroup: 'Biceps' },
      { name: 'Inverted Rows', sets: 4, reps: '12-15', rest: '60 sec', muscleGroup: 'Back' },
      { name: 'Australian Pull-ups', sets: 3, reps: '10-12', rest: '60 sec', muscleGroup: 'Back' },
      { name: 'Doorway Curls', sets: 3, reps: '12-15', rest: '60 sec', muscleGroup: 'Biceps' },
    ],
    legs_bodyweight: [
      { name: 'Bodyweight Squats', sets: 4, reps: '20', rest: '60 sec', muscleGroup: 'Quads' },
      { name: 'Bulgarian Split Squats', sets: 3, reps: '12 each', rest: '60 sec', muscleGroup: 'Quads' },
      { name: 'Glute Bridges', sets: 4, reps: '15', rest: '60 sec', muscleGroup: 'Glutes' },
      { name: 'Jump Squats', sets: 3, reps: '12', rest: '60 sec', muscleGroup: 'Quads' },
      { name: 'Single-leg Deadlift', sets: 3, reps: '10 each', rest: '60 sec', muscleGroup: 'Hamstrings' },
      { name: 'Calf Raises', sets: 4, reps: '20', rest: '45 sec', muscleGroup: 'Calves' },
      { name: 'Wall Sit', sets: 3, reps: '45 sec', rest: '60 sec', muscleGroup: 'Quads' },
    ],
  };

  const getExerciseKey = () => {
    const focusKey = focus || 'full';
    const equipmentKey = equipment === 'bodyweight' ? 'bodyweight' : 'full';
    const key = `${focusKey}_${equipmentKey}`;
    return exercises[key] || exercises['full_full'];
  };

  const selectedExercises = getExerciseKey();
  
  // Adjust based on duration
  const durationMin = parseInt(duration);
  let exerciseCount = 6;
  if (durationMin <= 30) exerciseCount = 4;
  else if (durationMin <= 45) exerciseCount = 5;
  else if (durationMin >= 90) exerciseCount = 7;

  const workoutExercises = selectedExercises.slice(0, exerciseCount);

  // Adjust sets/reps based on goal
  if (goal === 'strength') {
    workoutExercises.forEach(e => {
      e.sets = Math.min(e.sets + 1, 5);
      e.reps = '3-5';
      e.rest = '3 min';
    });
  } else if (goal === 'fatloss') {
    workoutExercises.forEach(e => {
      e.reps = '12-15';
      e.rest = '45 sec';
    });
  } else if (goal === 'endurance') {
    workoutExercises.forEach(e => {
      e.reps = '15-20';
      e.rest = '30 sec';
    });
  }

  const focusLabel = FOCUS_AREAS.find(f => f.id === focus)?.short || 'Full Body';
  const goalLabel = GOALS.find(g => g.id === goal)?.label || 'General';

  return {
    name: `AI ${focusLabel} - ${goalLabel}`,
    duration: `${duration} min`,
    difficulty: goal === 'strength' ? 'Hard' : goal === 'endurance' ? 'Moderate' : 'Challenging',
    focus: focusLabel,
    exercises: workoutExercises,
    warmup: [
      '5 min light cardio (jump rope, jogging)',
      'Arm circles - 20 each direction',
      'Leg swings - 10 each leg',
      'Dynamic stretches - 2 min',
    ],
    cooldown: [
      'Static stretching - 5 min',
      'Foam rolling (if available)',
      'Deep breathing - 1 min',
    ],
    tips: [
      '💡 Focus on proper form over weight',
      '💧 Stay hydrated throughout',
      '📝 Track your weights to progress',
      '😤 Push hard on the last 2 reps',
    ],
  };
};

const AIWorkoutGeneratorScreen = ({ navigation }: { navigation: any }) => {
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('60');
  const [selectedFocus, setSelectedFocus] = useState('');
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(1);

  const handleGenerate = async () => {
    if (!selectedGoal || !selectedEquipment || !selectedFocus) {
      Alert.alert('Missing Info', 'Please select all options');
      return;
    }

    buttonPress();
    setIsGenerating(true);

    // Simulate AI generation time
    await new Promise(resolve => setTimeout(resolve, 1500));

    const workout = generateWorkout(
      selectedGoal,
      selectedEquipment,
      selectedDuration,
      selectedFocus
    );

    setGeneratedWorkout(workout);
    setIsGenerating(false);
    successHaptic();
  };

  const handleStartWorkout = () => {
    buttonPress();
    // Navigate to live workout with generated workout
    Alert.alert(
      '🚀 Start Workout?',
      'Ready to begin your AI-generated workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Let\'s Go!', onPress: () => {
          // Could pass workout to LiveWorkoutScreen
          navigation.navigate('LiveWorkout', { workout: generatedWorkout });
        }},
      ]
    );
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What's your goal?</Text>
      <Text style={styles.stepSubtitle}>This helps customize your workout intensity</Text>
      
      <View style={styles.optionsGrid}>
        {GOALS.map(goal => (
          <TouchableOpacity
            key={goal.id}
            style={[
              styles.goalCard,
              selectedGoal === goal.id && { borderColor: goal.color, borderWidth: 2 },
            ]}
            onPress={() => {
              buttonPress();
              setSelectedGoal(goal.id);
            }}
          >
            <Text style={styles.goalIcon}>{goal.icon}</Text>
            <Text style={styles.goalLabel}>{goal.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.nextButton, !selectedGoal && styles.nextButtonDisabled]}
        onPress={() => {
          buttonPress();
          setStep(2);
        }}
        disabled={!selectedGoal}
      >
        <Text style={styles.nextButtonText}>Next →</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What equipment do you have?</Text>
      <Text style={styles.stepSubtitle}>We'll pick exercises you can actually do</Text>
      
      <View style={styles.equipmentList}>
        {EQUIPMENT.map(eq => (
          <TouchableOpacity
            key={eq.id}
            style={[
              styles.equipmentCard,
              selectedEquipment === eq.id && styles.equipmentCardActive,
            ]}
            onPress={() => {
              buttonPress();
              setSelectedEquipment(eq.id);
            }}
          >
            <Text style={styles.equipmentIcon}>{eq.icon}</Text>
            <Text style={[
              styles.equipmentLabel,
              selectedEquipment === eq.id && styles.equipmentLabelActive,
            ]}>
              {eq.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backStepButton} onPress={() => setStep(1)}>
          <Text style={styles.backStepText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, !selectedEquipment && styles.nextButtonDisabled, { flex: 1 }]}
          onPress={() => {
            buttonPress();
            setStep(3);
          }}
          disabled={!selectedEquipment}
        >
          <Text style={styles.nextButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>How long & what focus?</Text>
      <Text style={styles.stepSubtitle}>Customize your workout duration and target</Text>

      <Text style={styles.sectionLabel}>Duration</Text>
      <View style={styles.durationRow}>
        {DURATION.map(d => (
          <TouchableOpacity
            key={d.id}
            style={[
              styles.durationChip,
              selectedDuration === d.id && styles.durationChipActive,
            ]}
            onPress={() => {
              buttonPress();
              setSelectedDuration(d.id);
            }}
          >
            <Text style={styles.durationIcon}>{d.icon}</Text>
            <Text style={[
              styles.durationText,
              selectedDuration === d.id && styles.durationTextActive,
            ]}>
              {d.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Focus Area</Text>
      <View style={styles.focusList}>
        {FOCUS_AREAS.map(f => (
          <TouchableOpacity
            key={f.id}
            style={[
              styles.focusChip,
              selectedFocus === f.id && styles.focusChipActive,
            ]}
            onPress={() => {
              buttonPress();
              setSelectedFocus(f.id);
            }}
          >
            <Text style={[
              styles.focusText,
              selectedFocus === f.id && styles.focusTextActive,
            ]}>
              {f.short}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backStepButton} onPress={() => setStep(2)}>
          <Text style={styles.backStepText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.generateButton, !selectedFocus && styles.nextButtonDisabled, { flex: 1 }]}
          onPress={handleGenerate}
          disabled={!selectedFocus || isGenerating}
        >
          {isGenerating ? (
            <Text style={styles.generateButtonText}>🤖 Generating...</Text>
          ) : (
            <Text style={styles.generateButtonText}>✨ Generate Workout</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWorkout = () => (
    <ScrollView style={styles.workoutContainer} showsVerticalScrollIndicator={false}>
      {/* Workout Header */}
      <View style={styles.workoutHeader}>
        <Text style={styles.workoutName}>{generatedWorkout?.name}</Text>
        <View style={styles.workoutMeta}>
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>⏱️ {generatedWorkout?.duration}</Text>
          </View>
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>🎯 {generatedWorkout?.focus}</Text>
          </View>
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>💪 {generatedWorkout?.difficulty}</Text>
          </View>
        </View>
      </View>

      {/* Warmup */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Warmup</Text>
        {generatedWorkout?.warmup.map((item, idx) => (
          <Text key={idx} style={styles.warmupItem}>• {item}</Text>
        ))}
      </View>

      {/* Exercises */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💪 Exercises</Text>
        {generatedWorkout?.exercises.map((exercise, idx) => (
          <View key={idx} style={styles.exerciseCard}>
            <View style={styles.exerciseNumber}>
              <Text style={styles.exerciseNumberText}>{idx + 1}</Text>
            </View>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseMuscle}>{exercise.muscleGroup}</Text>
              {exercise.notes && (
                <Text style={styles.exerciseNotes}>💡 {exercise.notes}</Text>
              )}
            </View>
            <View style={styles.exerciseStats}>
              <Text style={styles.exerciseStatsText}>{exercise.sets}×{exercise.reps}</Text>
              <Text style={styles.exerciseRest}>Rest: {exercise.rest}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Cooldown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>❄️ Cooldown</Text>
        {generatedWorkout?.cooldown.map((item, idx) => (
          <Text key={idx} style={styles.warmupItem}>• {item}</Text>
        ))}
      </View>

      {/* Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>Pro Tips</Text>
        {generatedWorkout?.tips.map((tip, idx) => (
          <Text key={idx} style={styles.tipItem}>{tip}</Text>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.regenerateButton}
          onPress={() => {
            setGeneratedWorkout(null);
            setStep(1);
          }}
        >
          <Text style={styles.regenerateText}>🔄 Generate New</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
          <Text style={styles.startButtonText}>🚀 Start Workout</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Workout Generator</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Indicator */}
      {!generatedWorkout && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Step {step} of 3</Text>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {generatedWorkout ? (
          renderWorkout()
        ) : (
          <>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </>
        )}
      </ScrollView>
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
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#374151',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 24,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  goalCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  goalIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  equipmentList: {
    gap: 10,
    marginBottom: 24,
  },
  equipmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  equipmentCardActive: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  equipmentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  equipmentLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  equipmentLabelActive: {
    color: '#10b981',
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginTop: 8,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  durationChip: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  durationChipActive: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  durationIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  durationText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  durationTextActive: {
    color: '#10b981',
    fontWeight: '600',
  },
  focusList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  focusChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  focusChipActive: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  focusText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  focusTextActive: {
    color: '#10b981',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nextButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backStepButton: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  backStepText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  generateButton: {
    backgroundColor: '#8b5cf6',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  workoutContainer: {
    flex: 1,
  },
  workoutHeader: {
    backgroundColor: '#10b981',
    padding: 24,
    paddingTop: 20,
  },
  workoutName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
  },
  workoutMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  metaText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  warmupItem: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  exerciseMuscle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  exerciseNotes: {
    fontSize: 11,
    color: '#f59e0b',
    marginTop: 4,
  },
  exerciseStats: {
    alignItems: 'flex-end',
  },
  exerciseStatsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  exerciseRest: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  tipsCard: {
    margin: 20,
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 14,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 12,
  },
  tipItem: {
    fontSize: 13,
    color: '#92400e',
    marginBottom: 6,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  regenerateButton: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  regenerateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  startButton: {
    flex: 2,
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AIWorkoutGeneratorScreen;

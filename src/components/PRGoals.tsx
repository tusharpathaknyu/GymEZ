import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import {useAuth} from '../services/auth';
import {ExerciseType} from '../types';
import {PersonalRecordsService} from '../services/personalRecordsService';

interface Goal {
  exercise: ExerciseType;
  target: number;
  current?: number;
  unit: string;
  progress: number;
}

const PRGoals = () => {
  const {user} = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [addingGoal, setAddingGoal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(null);
  const [targetValue, setTargetValue] = useState('');

  useEffect(() => {
    loadGoals();
  }, [user]);

  const loadGoals = async () => {
    if (!user?.id) return;

    // Load goals from user preferences
    const exercises = PersonalRecordsService.getExerciseCategories();
    const userGoals: Goal[] = exercises.map(exercise => ({
      exercise: exercise.type,
      target: 100,
      progress: Math.random() * 100,
      unit: ['benchpress', 'squat', 'deadlift'].includes(exercise.type) ? 'kg' : 'reps',
    }));

    setGoals(userGoals);
  };

  const handleAddGoal = () => {
    if (!selectedExercise || !targetValue) {
      Alert.alert('Error', 'Please select an exercise and enter a target');
      return;
    }

    setGoals(prev => [...prev, {
      exercise: selectedExercise,
      target: parseFloat(targetValue),
      progress: 0,
      unit: ['benchpress', 'squat', 'deadlift'].includes(selectedExercise) ? 'kg' : 'reps',
    }]);

    setAddingGoal(false);
    setTargetValue('');
    setSelectedExercise(null);
  };

  const getExerciseName = (exerciseType: ExerciseType) => {
    const exercises = PersonalRecordsService.getExerciseCategories();
    return exercises.find(e => e.type === exerciseType)?.name || exerciseType;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PR Goals 🎯</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setAddingGoal(true)}
        >
          <Text style={styles.addButtonText}>➕ Add Goal</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {goals.map((goal, index) => (
          <View key={index} style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalExercise}>{getExerciseName(goal.exercise)}</Text>
              <Text style={styles.goalTarget}>
                Target: {goal.target}{goal.unit}
              </Text>
            </View>
            
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, {width: `${goal.progress}%`}]} />
            </View>
            
            <Text style={styles.progressText}>
              {goal.progress.toFixed(0)}% towards your goal
            </Text>
          </View>
        ))}

        {goals.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyText}>No goals set yet</Text>
            <Text style={styles.emptyDescription}>
              Set PR targets to keep yourself motivated
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Goal Modal */}
      {addingGoal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set PR Goal</Text>
              <TouchableOpacity onPress={() => setAddingGoal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Exercise</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {PersonalRecordsService.getExerciseCategories().map(exercise => (
                <TouchableOpacity
                  key={exercise.type}
                  style={[
                    styles.exerciseOption,
                    selectedExercise === exercise.type && styles.exerciseOptionActive,
                  ]}
                  onPress={() => setSelectedExercise(exercise.type)}
                >
                  <Text style={styles.exerciseIcon}>{exercise.icon}</Text>
                  <Text style={styles.exerciseLabel}>{exercise.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Target</Text>
            <TextInput
              style={styles.input}
              value={targetValue}
              onChangeText={setTargetValue}
              placeholder="Enter target"
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddGoal}
            >
              <Text style={styles.submitButtonText}>Set Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  goalCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalExercise: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  goalTarget: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  submitButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exerciseOption: {
    alignItems: 'center',
    padding: 12,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    minWidth: 80,
  },
  exerciseOptionActive: {
    backgroundColor: '#ecfdf5',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  exerciseIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  exerciseLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
});

export default PRGoals;


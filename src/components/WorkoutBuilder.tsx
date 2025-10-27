import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal
} from 'react-native';
import { WorkoutPlanService } from '../services/workoutPlanService';
import type { Exercise, WorkoutPlan, CreateWorkoutPlanData, CreateWorkoutSessionData } from '../types';

interface WorkoutBuilderProps {
  onSave?: (plan: WorkoutPlan) => void;
  editingPlan?: WorkoutPlan;
}

export const WorkoutBuilder: React.FC<WorkoutBuilderProps> = ({ onSave, editingPlan }) => {
  const [planName, setPlanName] = useState(editingPlan?.name || '');
  const [description, setDescription] = useState(editingPlan?.description || '');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>(
    editingPlan?.difficulty_level || 'beginner'
  );
  const [goal, setGoal] = useState<'strength' | 'muscle_building' | 'weight_loss' | 'endurance' | 'general_fitness'>(
    editingPlan?.goal || 'general_fitness'
  );
  const [durationWeeks, setDurationWeeks] = useState(editingPlan?.duration_weeks?.toString() || '4');
  const [isPublic, setIsPublic] = useState(editingPlan?.is_public || false);
  const [sessions, setSessions] = useState<Partial<CreateWorkoutSessionData>[]>([]);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const exerciseData = await WorkoutPlanService.getExerciseLibrary();
      setExercises(exerciseData);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const addSession = () => {
    setSessions([...sessions, {
      name: `Day ${sessions.length + 1}`,
      day_number: sessions.length + 1,
      estimated_duration: 60,
      exercises: []
    }]);
  };

  const updateSession = (index: number, updates: Partial<CreateWorkoutSessionData>) => {
    const updatedSessions = [...sessions];
    updatedSessions[index] = { ...updatedSessions[index], ...updates };
    setSessions(updatedSessions);
  };

  const addExerciseToSession = (sessionIndex: number, exercise: Exercise) => {
    const updatedSessions = [...sessions];
    const session = updatedSessions[sessionIndex];
    
    if (!session.exercises) {
      session.exercises = [];
    }
    
    session.exercises.push({
      exercise_library_id: exercise.id,
      exercise_order: session.exercises.length + 1,
      sets: 3,
      reps: '8-12',
      rest_seconds: 60
    });
    
    setSessions(updatedSessions);
    setShowExerciseLibrary(false);
    setSelectedSession(null);
  };

  const savePlan = async () => {
    if (!planName.trim()) {
      Alert.alert('Error', 'Please enter a workout plan name');
      return;
    }

    if (sessions.length === 0) {
      Alert.alert('Error', 'Please add at least one workout session');
      return;
    }

    setLoading(true);
    
    try {
      const planData: CreateWorkoutPlanData = {
        name: planName,
        description: description || undefined,
        difficulty_level: difficulty,
        goal,
        duration_weeks: parseInt(durationWeeks),
        is_public: isPublic
      };

      let savedPlan: WorkoutPlan;
      
      if (editingPlan) {
        savedPlan = await WorkoutPlanService.updateWorkoutPlan(editingPlan.id, planData);
      } else {
        savedPlan = await WorkoutPlanService.createWorkoutPlan(planData);
      }

      // Save sessions
      for (const sessionData of sessions) {
        if (sessionData.name && sessionData.day_number && sessionData.exercises) {
          await WorkoutPlanService.createWorkoutSession({
            workout_plan_id: savedPlan.id,
            name: sessionData.name,
            day_number: sessionData.day_number,
            estimated_duration: sessionData.estimated_duration,
            exercises: sessionData.exercises
          });
        }
      }

      Alert.alert('Success', 'Workout plan saved successfully!');
      onSave?.(savedPlan);
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout plan');
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const ExerciseLibraryModal = () => (
    <Modal
      visible={showExerciseLibrary}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Exercise Library</Text>
          <TouchableOpacity
            onPress={() => setShowExerciseLibrary(false)}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.exerciseList}>
          {exercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              style={styles.exerciseItem}
              onPress={() => selectedSession !== null && addExerciseToSession(selectedSession, exercise)}
            >
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseCategory}>{exercise.category.toUpperCase()}</Text>
              <Text style={styles.exerciseDifficulty}>{exercise.difficulty_level}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>
          {editingPlan ? 'Edit Workout Plan' : 'Create Workout Plan'}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan Details</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Workout Plan Name"
            value={planName}
            onChangeText={setPlanName}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Difficulty</Text>
              <View style={styles.segmentedControl}>
                {['beginner', 'intermediate', 'advanced'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.segment,
                      difficulty === level && styles.selectedSegment
                    ]}
                    onPress={() => setDifficulty(level as any)}
                  >
                    <Text style={[
                      styles.segmentText,
                      difficulty === level && styles.selectedSegmentText
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>Duration (weeks)</Text>
              <TextInput
                style={styles.smallInput}
                placeholder="4"
                value={durationWeeks}
                onChangeText={setDurationWeeks}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.goalContainer}>
            <Text style={styles.label}>Goal</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                { key: 'strength', label: 'Strength' },
                { key: 'muscle_building', label: 'Muscle Building' },
                { key: 'weight_loss', label: 'Weight Loss' },
                { key: 'endurance', label: 'Endurance' },
                { key: 'general_fitness', label: 'General Fitness' }
              ].map((goalOption) => (
                <TouchableOpacity
                  key={goalOption.key}
                  style={[
                    styles.goalChip,
                    goal === goalOption.key && styles.selectedGoalChip
                  ]}
                  onPress={() => setGoal(goalOption.key as any)}
                >
                  <Text style={[
                    styles.goalChipText,
                    goal === goalOption.key && styles.selectedGoalChipText
                  ]}>
                    {goalOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setIsPublic(!isPublic)}
          >
            <Text style={styles.toggleLabel}>Make plan public</Text>
            <View style={[styles.toggle, isPublic && styles.toggleActive]}>
              <View style={[styles.toggleThumb, isPublic && styles.toggleThumbActive]} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Workout Sessions</Text>
            <TouchableOpacity style={styles.addButton} onPress={addSession}>
              <Text style={styles.addButtonText}>+ Add Day</Text>
            </TouchableOpacity>
          </View>

          {sessions.map((session, index) => (
            <View key={index} style={styles.sessionCard}>
              <TextInput
                style={styles.sessionNameInput}
                placeholder={`Day ${index + 1}`}
                value={session.name}
                onChangeText={(name) => updateSession(index, { name })}
              />

              <View style={styles.sessionDetails}>
                <Text style={styles.sessionLabel}>Duration (min):</Text>
                <TextInput
                  style={styles.durationInput}
                  placeholder="60"
                  value={session.estimated_duration?.toString()}
                  onChangeText={(duration) => updateSession(index, { estimated_duration: parseInt(duration) })}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.exercisesList}>
                {session.exercises?.map((exercise, exerciseIndex) => (
                  <View key={exerciseIndex} style={styles.exerciseRow}>
                    <Text style={styles.exerciseOrderNumber}>{exerciseIndex + 1}</Text>
                    <Text style={styles.exerciseDetails}>
                      {exercises.find(e => e.id === exercise.exercise_library_id)?.name}
                    </Text>
                    <Text style={styles.exerciseSetsReps}>
                      {exercise.sets} × {exercise.reps}
                    </Text>
                  </View>
                ))}
                
                <TouchableOpacity
                  style={styles.addExerciseButton}
                  onPress={() => {
                    setSelectedSession(index);
                    setShowExerciseLibrary(true);
                  }}
                >
                  <Text style={styles.addExerciseButtonText}>+ Add Exercise</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={savePlan}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Workout Plan'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ExerciseLibraryModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  column: {
    flex: 0.48,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  selectedSegment: {
    backgroundColor: '#007AFF',
  },
  segmentText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  selectedSegmentText: {
    color: '#fff',
    fontWeight: '600',
  },
  smallInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  goalContainer: {
    marginBottom: 15,
  },
  goalChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedGoalChip: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  goalChipText: {
    fontSize: 14,
    color: '#666',
  },
  selectedGoalChipText: {
    color: '#fff',
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ddd',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#007AFF',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sessionCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  sessionNameInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
    marginBottom: 10,
  },
  sessionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sessionLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  durationInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 6,
    fontSize: 14,
    width: 60,
    textAlign: 'center',
  },
  exercisesList: {
    marginTop: 10,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  exerciseOrderNumber: {
    width: 30,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  exerciseDetails: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  exerciseSetsReps: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  addExerciseButton: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addExerciseButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  exerciseList: {
    flex: 1,
    padding: 20,
  },
  exerciseItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exerciseCategory: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  exerciseDifficulty: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
});
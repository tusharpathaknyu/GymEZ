import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { buttonPress, successHaptic } from '../utils/haptics';

const { width } = Dimensions.get('window');

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  icon: string;
  color: string;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    rest: string;
  }[];
}

const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: '1',
    name: 'Push Day',
    description: 'Chest, shoulders, and triceps',
    duration: '45-60 min',
    difficulty: 'intermediate',
    category: 'Strength',
    icon: '💪',
    color: '#ef4444',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: '8-10', rest: '90s' },
      { name: 'Overhead Press', sets: 3, reps: '8-10', rest: '90s' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '60s' },
      { name: 'Lateral Raises', sets: 3, reps: '12-15', rest: '45s' },
      { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', rest: '45s' },
      { name: 'Overhead Tricep Extension', sets: 3, reps: '10-12', rest: '45s' },
    ],
  },
  {
    id: '2',
    name: 'Pull Day',
    description: 'Back and biceps',
    duration: '45-60 min',
    difficulty: 'intermediate',
    category: 'Strength',
    icon: '🔙',
    color: '#3b82f6',
    exercises: [
      { name: 'Deadlifts', sets: 4, reps: '5-6', rest: '120s' },
      { name: 'Pull-ups', sets: 4, reps: '6-10', rest: '90s' },
      { name: 'Barbell Rows', sets: 3, reps: '8-10', rest: '90s' },
      { name: 'Face Pulls', sets: 3, reps: '15-20', rest: '45s' },
      { name: 'Barbell Curls', sets: 3, reps: '10-12', rest: '45s' },
      { name: 'Hammer Curls', sets: 3, reps: '12-15', rest: '45s' },
    ],
  },
  {
    id: '3',
    name: 'Leg Day',
    description: 'Quads, hamstrings, and glutes',
    duration: '50-65 min',
    difficulty: 'intermediate',
    category: 'Strength',
    icon: '🦵',
    color: '#f59e0b',
    exercises: [
      { name: 'Squats', sets: 4, reps: '6-8', rest: '120s' },
      { name: 'Romanian Deadlifts', sets: 3, reps: '10-12', rest: '90s' },
      { name: 'Leg Press', sets: 3, reps: '12-15', rest: '90s' },
      { name: 'Walking Lunges', sets: 3, reps: '10 each', rest: '60s' },
      { name: 'Leg Curls', sets: 3, reps: '12-15', rest: '45s' },
      { name: 'Calf Raises', sets: 4, reps: '15-20', rest: '30s' },
    ],
  },
  {
    id: '4',
    name: 'Full Body Blast',
    description: 'Complete workout for busy days',
    duration: '35-45 min',
    difficulty: 'beginner',
    category: 'Full Body',
    icon: '⚡',
    color: '#8b5cf6',
    exercises: [
      { name: 'Goblet Squats', sets: 3, reps: '12', rest: '60s' },
      { name: 'Push-ups', sets: 3, reps: '10-15', rest: '45s' },
      { name: 'Dumbbell Rows', sets: 3, reps: '10 each', rest: '45s' },
      { name: 'Lunges', sets: 3, reps: '10 each', rest: '45s' },
      { name: 'Plank', sets: 3, reps: '30-45s', rest: '30s' },
    ],
  },
  {
    id: '5',
    name: 'HIIT Cardio',
    description: 'High intensity fat burning',
    duration: '20-25 min',
    difficulty: 'advanced',
    category: 'Cardio',
    icon: '🔥',
    color: '#ec4899',
    exercises: [
      { name: 'Burpees', sets: 4, reps: '10', rest: '30s' },
      { name: 'Mountain Climbers', sets: 4, reps: '20 each', rest: '30s' },
      { name: 'Jump Squats', sets: 4, reps: '15', rest: '30s' },
      { name: 'High Knees', sets: 4, reps: '30s', rest: '30s' },
      { name: 'Box Jumps', sets: 4, reps: '10', rest: '30s' },
    ],
  },
  {
    id: '6',
    name: 'Core Crusher',
    description: 'Build a strong midsection',
    duration: '15-20 min',
    difficulty: 'beginner',
    category: 'Core',
    icon: '🎯',
    color: '#10b981',
    exercises: [
      { name: 'Plank', sets: 3, reps: '45-60s', rest: '30s' },
      { name: 'Bicycle Crunches', sets: 3, reps: '20 each', rest: '30s' },
      { name: 'Russian Twists', sets: 3, reps: '15 each', rest: '30s' },
      { name: 'Leg Raises', sets: 3, reps: '15', rest: '30s' },
      { name: 'Dead Bug', sets: 3, reps: '10 each', rest: '30s' },
    ],
  },
  {
    id: '7',
    name: 'Upper Body Power',
    description: 'Build strength and size',
    duration: '50-60 min',
    difficulty: 'advanced',
    category: 'Strength',
    icon: '🏋️',
    color: '#6366f1',
    exercises: [
      { name: 'Weighted Pull-ups', sets: 4, reps: '6-8', rest: '120s' },
      { name: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: '120s' },
      { name: 'Barbell Rows', sets: 4, reps: '6-8', rest: '90s' },
      { name: 'Military Press', sets: 4, reps: '6-8', rest: '90s' },
      { name: 'Dips', sets: 3, reps: '8-10', rest: '60s' },
      { name: 'Barbell Curls', sets: 3, reps: '8-10', rest: '60s' },
    ],
  },
  {
    id: '8',
    name: 'Mobility Flow',
    description: 'Improve flexibility and recovery',
    duration: '25-30 min',
    difficulty: 'beginner',
    category: 'Recovery',
    icon: '🧘',
    color: '#14b8a6',
    exercises: [
      { name: 'Cat-Cow Stretch', sets: 1, reps: '10 each', rest: '0s' },
      { name: 'Hip Flexor Stretch', sets: 2, reps: '30s each', rest: '0s' },
      { name: 'Pigeon Pose', sets: 2, reps: '45s each', rest: '0s' },
      { name: 'Thoracic Spine Rotation', sets: 2, reps: '10 each', rest: '0s' },
      { name: 'World\'s Greatest Stretch', sets: 2, reps: '5 each', rest: '0s' },
      { name: 'Deep Squat Hold', sets: 2, reps: '30-45s', rest: '0s' },
    ],
  },
];

interface WorkoutTemplatesProps {
  visible: boolean;
  onClose: () => void;
  onSelectTemplate: (template: WorkoutTemplate) => void;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return '#10b981';
    case 'intermediate': return '#f59e0b';
    case 'advanced': return '#ef4444';
    default: return '#6b7280';
  }
};

const WorkoutTemplates: React.FC<WorkoutTemplatesProps> = ({
  visible,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(WORKOUT_TEMPLATES.map(t => t.category)))];

  const filteredTemplates = filterCategory === 'All' 
    ? WORKOUT_TEMPLATES 
    : WORKOUT_TEMPLATES.filter(t => t.category === filterCategory);

  const handleSelectTemplate = (template: WorkoutTemplate) => {
    buttonPress();
    setSelectedTemplate(template);
  };

  const handleStartWorkout = () => {
    if (selectedTemplate) {
      successHaptic();
      onSelectTemplate(selectedTemplate);
      setSelectedTemplate(null);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Workout Templates</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Category Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFilter}
            contentContainerStyle={styles.categoryFilterContent}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  filterCategory === category && styles.categoryChipActive,
                ]}
                onPress={() => {
                  buttonPress();
                  setFilterCategory(category);
                }}
              >
                <Text style={[
                  styles.categoryChipText,
                  filterCategory === category && styles.categoryChipTextActive,
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Template List */}
          <ScrollView style={styles.templateList} showsVerticalScrollIndicator={false}>
            {filteredTemplates.map(template => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.templateCard,
                  selectedTemplate?.id === template.id && styles.templateCardSelected,
                  { borderLeftColor: template.color },
                ]}
                onPress={() => handleSelectTemplate(template)}
                activeOpacity={0.7}
              >
                <View style={styles.templateHeader}>
                  <View style={[styles.templateIcon, { backgroundColor: template.color + '20' }]}>
                    <Text style={styles.templateIconText}>{template.icon}</Text>
                  </View>
                  <View style={styles.templateInfo}>
                    <Text style={styles.templateName}>{template.name}</Text>
                    <Text style={styles.templateDescription}>{template.description}</Text>
                    <View style={styles.templateMeta}>
                      <Text style={styles.templateDuration}>⏱️ {template.duration}</Text>
                      <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(template.difficulty) + '20' }]}>
                        <Text style={[styles.difficultyText, { color: getDifficultyColor(template.difficulty) }]}>
                          {template.difficulty}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {selectedTemplate?.id === template.id && (
                    <View style={styles.checkMark}>
                      <Text style={styles.checkMarkText}>✓</Text>
                    </View>
                  )}
                </View>

                {selectedTemplate?.id === template.id && (
                  <View style={styles.exercisePreview}>
                    <Text style={styles.exercisePreviewTitle}>Exercises ({template.exercises.length})</Text>
                    {template.exercises.map((exercise, index) => (
                      <View key={index} style={styles.exerciseItem}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <Text style={styles.exerciseDetails}>
                          {exercise.sets} × {exercise.reps}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            ))}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Start Button */}
          {selectedTemplate && (
            <View style={styles.startButtonContainer}>
              <TouchableOpacity
                style={[styles.startWorkoutButton, { backgroundColor: selectedTemplate.color }]}
                onPress={handleStartWorkout}
              >
                <Text style={styles.startWorkoutText}>
                  Start {selectedTemplate.name}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
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
  closeButtonText: {
    fontSize: 18,
    color: '#6b7280',
  },
  categoryFilter: {
    maxHeight: 44,
    marginBottom: 16,
  },
  categoryFilterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#10b981',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  templateList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  templateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  templateCardSelected: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  templateIconText: {
    fontSize: 24,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  templateDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  templateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  templateDuration: {
    fontSize: 12,
    color: '#6b7280',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  checkMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMarkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  exercisePreview: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  exercisePreviewTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  exerciseName: {
    fontSize: 14,
    color: '#4b5563',
  },
  exerciseDetails: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
  startButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  startWorkoutButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  startWorkoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default WorkoutTemplates;

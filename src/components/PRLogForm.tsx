import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../services/auth';
import { PersonalRecordsService } from '../services/personalRecordsService';
import { SocialService } from '../services/socialService';
import { ExerciseType } from '../types';

interface PRLogFormProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PRLogForm: React.FC<PRLogFormProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(
    null,
  );
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [shareToFeed, setShareToFeed] = useState(true);

  const exercises = PersonalRecordsService.getExerciseCategories();

  const handleSubmit = async () => {
    if (!selectedExercise || !weight || !reps || !user?.id) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps);

    if (weightNum <= 0 || repsNum <= 0) {
      Alert.alert('Error', 'Please enter valid numbers');
      return;
    }

    setSubmitting(true);
    try {
      // Create the PR
      const pr = await PersonalRecordsService.createPR(
        user.id,
        selectedExercise,
        weightNum,
        repsNum,
      );

      // Check if it's a new best
      const isNewBest = await PersonalRecordsService.isNewPR(
        user.id,
        selectedExercise,
        weightNum,
        repsNum,
      );

      // Share to feed if enabled
      if (shareToFeed) {
        const exerciseName = exercises.find(
          e => e.type === selectedExercise,
        )?.name;
        const content = isNewBest
          ? `🔥 NEW PR! ${exerciseName}: ${weightNum}kg × ${repsNum} reps 💪`
          : `${exerciseName}: ${weightNum}kg × ${repsNum} reps 💪`;

        await SocialService.createPost(
          user.id,
          content,
          'pr_achievement',
          undefined,
          pr.id,
        );
      }

      Alert.alert(
        isNewBest ? '🏆 NEW PERSONAL BEST!' : '✅ PR Logged',
        isNewBest
          ? 'Congratulations on your new personal best!'
          : 'PR has been logged successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess();
              onClose();
              resetForm();
            },
          },
        ],
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedExercise(null);
    setWeight('');
    setReps('');
    setShareToFeed(true);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Log Personal Record</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.content}>
          {/* Exercise Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Exercise 🏋️</Text>
            <View style={styles.exerciseGrid}>
              {exercises.map(exercise => (
                <TouchableOpacity
                  key={exercise.type}
                  style={[
                    styles.exerciseCard,
                    selectedExercise === exercise.type &&
                      styles.exerciseCardSelected,
                  ]}
                  onPress={() => setSelectedExercise(exercise.type)}
                >
                  <Text style={styles.exerciseIcon}>{exercise.icon}</Text>
                  <Text
                    style={[
                      styles.exerciseName,
                      selectedExercise === exercise.type &&
                        styles.exerciseNameSelected,
                    ]}
                  >
                    {exercise.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Weight Input */}
          {selectedExercise &&
            ['benchpress', 'squat', 'deadlift'].includes(selectedExercise) && (
              <View style={styles.section}>
                <Text style={styles.label}>Weight (kg) 💪</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="Enter weight"
                  keyboardType="numeric"
                  autoFocus
                />
              </View>
            )}

          {/* Reps Input */}
          <View style={styles.section}>
            <Text style={styles.label}>
              {['benchpress', 'squat', 'deadlift'].includes(
                selectedExercise || '',
              )
                ? 'Reps 📊'
                : 'Reps Count 💪'}
            </Text>
            <TextInput
              style={styles.input}
              value={reps}
              onChangeText={setReps}
              placeholder="Enter reps"
              keyboardType="numeric"
            />
            {selectedExercise && (
              <Text style={styles.hint}>
                {['benchpress', 'squat', 'deadlift'].includes(selectedExercise)
                  ? `Your 1RM: ${(
                      parseFloat(weight || '0') *
                      (1 + parseInt(reps || '0') / 30)
                    ).toFixed(1)}kg`
                  : 'Bodyweight exercise'}
              </Text>
            )}
          </View>

          {/* Share Options */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.switchContainer}
              onPress={() => setShareToFeed(!shareToFeed)}
            >
              <View>
                <Text style={styles.switchLabel}>Share to Feed 📱</Text>
                <Text style={styles.switchHint}>
                  Automatically post your PR to your feed
                </Text>
              </View>
              <View style={[styles.switch, shareToFeed && styles.switchActive]}>
                <View style={styles.switchThumb} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? 'Submitting...' : 'Log PR'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exerciseCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  exerciseCardSelected: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  exerciseIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  exerciseNameSelected: {
    color: '#10b981',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#111827',
    fontWeight: '600',
  },
  hint: {
    fontSize: 14,
    color: '#10b981',
    marginTop: 8,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  switchHint: {
    fontSize: 13,
    color: '#6b7280',
  },
  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    padding: 2,
  },
  switchActive: {
    backgroundColor: '#10b981',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PRLogForm;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { PersonalRecord } from '../types';
import { PersonalRecordsService } from '../services/personalRecordsService';

interface PRShareModalProps {
  visible: boolean;
  pr: PersonalRecord | null;
  onClose: () => void;
  onShare: (content: string) => void;
}

const PRShareModal: React.FC<PRShareModalProps> = ({
  visible,
  pr,
  onClose,
  onShare,
}) => {
  const [caption, setCaption] = useState('');
  const [isNewBest, setIsNewBest] = useState(false);

  React.useEffect(() => {
    if (pr) {
      // Set default caption
      const exercise = PersonalRecordsService.getExerciseCategories().find(
        e => e.type === pr.exercise_type,
      );

      if (['benchpress', 'squat', 'deadlift'].includes(pr.exercise_type)) {
        setCaption(
          `Just hit ${pr.weight}kg × ${pr.reps} on ${exercise?.name}! 💪`,
        );
      } else {
        setCaption(`Just did ${pr.reps} reps of ${exercise?.name}! 🔥`);
      }

      setIsNewBest(false); // Would check against previous best
    }
  }, [pr]);

  if (!pr) {
    return null;
  }

  const exercise = PersonalRecordsService.getExerciseCategories().find(
    e => e.type === pr.exercise_type,
  );

  const formatPR = () => {
    if (['pullup', 'pushup', 'dip'].includes(pr!.exercise_type)) {
      return `${pr!.reps} reps`;
    }
    return `${pr!.weight}kg × ${pr!.reps}`;
  };

  const handleShare = () => {
    onShare(caption);
    onClose();
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
          <View style={styles.header}>
            <Text style={styles.title}>Share Your PR</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* PR Preview */}
          <View style={styles.prPreview}>
            <Text style={styles.previewIcon}>{exercise?.icon}</Text>
            <Text style={styles.previewExercise}>{exercise?.name}</Text>
            <Text style={styles.previewValue}>{formatPR()}</Text>
            {isNewBest && (
              <View style={styles.newBestBadge}>
                <Text style={styles.newBestText}>🔥 NEW PR!</Text>
              </View>
            )}
          </View>

          {/* Caption Input */}
          <Text style={styles.label}>Add a caption (optional)</Text>
          <TextInput
            style={styles.input}
            value={caption}
            onChangeText={setCaption}
            placeholder="Share your thoughts..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Share Options */}
          <View style={styles.shareOptions}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => Alert.alert('Instagram', 'Coming soon!')}
            >
              <Text style={styles.shareIcon}>📷</Text>
              <Text style={styles.shareLabel}>Instagram</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => Alert.alert('Facebook', 'Coming soon!')}
            >
              <Text style={styles.shareIcon}>📘</Text>
              <Text style={styles.shareLabel}>Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => Alert.alert('Twitter', 'Coming soon!')}
            >
              <Text style={styles.shareIcon}>🐦</Text>
              <Text style={styles.shareLabel}>Twitter</Text>
            </TouchableOpacity>
          </View>

          {/* Share Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleShare}>
            <Text style={styles.submitButtonText}>Share to GYMEZ Feed</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
  },
  prPreview: {
    backgroundColor: '#f9fafb',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  previewIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  previewExercise: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  previewValue: {
    fontSize: 24,
    color: '#10b981',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  newBestBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newBestText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    fontSize: 16,
    color: '#111827',
    marginBottom: 20,
  },
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  shareButton: {
    alignItems: 'center',
    padding: 12,
  },
  shareIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  shareLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PRShareModal;

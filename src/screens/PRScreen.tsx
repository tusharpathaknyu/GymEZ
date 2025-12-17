import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import {
  PRService,
  PersonalRecord,
  PRAnalytics,
  ExerciseCategory,
} from '../services/PRService';
import { useAuth } from '../context/AuthContext';

interface PRScreenProps {
  onBackToHome: () => void;
}

export const PRScreen: React.FC<PRScreenProps> = ({ onBackToHome }) => {
  const { state } = useAuth();
  const [analytics, setAnalytics] = useState<PRAnalytics | null>(null);
  const [recentPRs, setRecentPRs] = useState<PersonalRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddPR, setShowAddPR] = useState(false);
  const [categories] = useState<ExerciseCategory[]>(
    PRService.getExerciseCategories(),
  );

  const [newPR, setNewPR] = useState({
    exercise_name: '',
    exercise_type: 'strength' as const,
    weight: '',
    reps: '',
    sets: '',
    distance: '',
    duration: '',
    notes: '',
  });

  useEffect(() => {
    loadPRData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPRData = async () => {
    if (!state.user) {
      return;
    }

    try {
      const [analyticsData, prs] = await Promise.all([
        PRService.getPRAnalytics(state.user.id),
        PRService.getUserPRs(state.user.id),
      ]);

      setAnalytics(analyticsData);
      setRecentPRs(prs);
    } catch (error) {
      // Use mock data on error
      setAnalytics(PRService.getMockAnalytics());
      setRecentPRs(PRService.getMockPRs(state.user?.id || 'demo'));
    }
  };

  const handleAddPR = async () => {
    if (!state.user || !newPR.exercise_name) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const prData = {
        user_id: state.user.id,
        exercise_name: newPR.exercise_name,
        exercise_type: newPR.exercise_type,
        weight: newPR.weight ? parseFloat(newPR.weight) : undefined,
        reps: newPR.reps ? parseInt(newPR.reps) : undefined,
        sets: newPR.sets ? parseInt(newPR.sets) : undefined,
        distance: newPR.distance ? parseFloat(newPR.distance) : undefined,
        duration: newPR.duration ? parseInt(newPR.duration) : undefined,
        notes: newPR.notes,
        date_achieved: new Date().toISOString(),
        verified: false,
      };

      const result = await PRService.addPR(prData);

      if (result) {
        Alert.alert('Success!', 'New personal record added! 🎉');
        setShowAddPR(false);
        resetNewPRForm();
        loadPRData(); // Refresh data
      } else {
        Alert.alert('Error', 'Failed to add personal record');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add personal record');
    }
  };

  const resetNewPRForm = () => {
    setNewPR({
      exercise_name: '',
      exercise_type: 'strength',
      weight: '',
      reps: '',
      sets: '',
      distance: '',
      duration: '',
      notes: '',
    });
  };

  const formatPRDisplay = (pr: PersonalRecord): string => {
    const parts = [];

    if (pr.weight) {
      parts.push(`${pr.weight} lbs`);
    }
    if (pr.reps) {
      parts.push(`${pr.reps} reps`);
    }
    if (pr.sets) {
      parts.push(`${pr.sets} sets`);
    }
    if (pr.distance) {
      parts.push(`${pr.distance}m`);
    }
    if (pr.duration) {
      const minutes = Math.floor(pr.duration / 60);
      const seconds = pr.duration % 60;
      parts.push(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }

    return parts.join(' × ');
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    if (diffDays < 30) {
      return `${Math.ceil(diffDays / 7)} weeks ago`;
    }
    return date.toLocaleDateString();
  };

  const filteredPRs =
    selectedCategory === 'all'
      ? recentPRs
      : recentPRs.filter(pr => {
          const category = categories.find(cat =>
            cat.exercises.includes(pr.exercise_name),
          );
          return category?.name === selectedCategory;
        });

  if (!analytics) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Loading your personal records...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Personal Records</Text>
        <Text style={styles.subtitle}>
          Track your strength and achievements
        </Text>
      </View>

      {/* Analytics Cards */}
      <View style={styles.analyticsContainer}>
        <View style={styles.analyticsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{analytics.total_prs}</Text>
            <Text style={styles.statLabel}>Total PRs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{analytics.prs_this_month}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
        </View>

        <View style={styles.analyticsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{analytics.strength_score}</Text>
            <Text style={styles.statLabel}>Strength Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{analytics.consistency_score}</Text>
            <Text style={styles.statLabel}>Consistency</Text>
          </View>
        </View>
      </View>

      {/* Biggest Improvement */}
      <View style={styles.improvementCard}>
        <Text style={styles.improvementTitle}>💪 Biggest Improvement</Text>
        <Text style={styles.improvementExercise}>
          {analytics.biggest_improvement.exercise_name}
        </Text>
        <Text style={styles.improvementText}>
          +{analytics.biggest_improvement.improvement_percentage.toFixed(1)}%
          improvement
        </Text>
        <Text style={styles.improvementSubtext}>
          {analytics.biggest_improvement.days_since_last_pr} days since last PR
        </Text>
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedCategory === 'all' && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === 'all' && styles.filterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {categories.map(category => (
            <TouchableOpacity
              key={category.name}
              style={[
                styles.filterChip,
                selectedCategory === category.name && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(category.name)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedCategory === category.name && styles.filterTextActive,
                ]}
              >
                {category.icon} {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recent PRs List */}
      <View style={styles.prListContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Records</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddPR(true)}
          >
            <Text style={styles.addButtonText}>+ Add PR</Text>
          </TouchableOpacity>
        </View>

        {filteredPRs.map(pr => (
          <View key={pr.id} style={styles.prCard}>
            <View style={styles.prHeader}>
              <Text style={styles.prExercise}>{pr.exercise_name}</Text>
              <Text style={styles.prDate}>{formatDate(pr.date_achieved)}</Text>
            </View>

            <Text style={styles.prDetails}>{formatPRDisplay(pr)}</Text>

            {pr.notes && <Text style={styles.prNotes}>"{pr.notes}"</Text>}

            {pr.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>
        ))}

        {filteredPRs.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No records found</Text>
            <Text style={styles.emptyStateSubtext}>
              Start tracking your personal records!
            </Text>
          </View>
        )}
      </View>

      {/* Add PR Modal */}
      <Modal
        visible={showAddPR}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddPR(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Personal Record</Text>
            <TouchableOpacity onPress={handleAddPR}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Exercise Name *</Text>
              <TextInput
                style={styles.input}
                value={newPR.exercise_name}
                onChangeText={text =>
                  setNewPR({ ...newPR, exercise_name: text })
                }
                placeholder="e.g., Bench Press, Squat, Running"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Weight (lbs)</Text>
                <TextInput
                  style={styles.input}
                  value={newPR.weight}
                  onChangeText={text => setNewPR({ ...newPR, weight: text })}
                  keyboardType="numeric"
                  placeholder="225"
                />
              </View>

              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Reps</Text>
                <TextInput
                  style={styles.input}
                  value={newPR.reps}
                  onChangeText={text => setNewPR({ ...newPR, reps: text })}
                  keyboardType="numeric"
                  placeholder="5"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Distance (m)</Text>
                <TextInput
                  style={styles.input}
                  value={newPR.distance}
                  onChangeText={text => setNewPR({ ...newPR, distance: text })}
                  keyboardType="numeric"
                  placeholder="5000"
                />
              </View>

              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Time (seconds)</Text>
                <TextInput
                  style={styles.input}
                  value={newPR.duration}
                  onChangeText={text => setNewPR({ ...newPR, duration: text })}
                  keyboardType="numeric"
                  placeholder="1380"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={newPR.notes}
                onChangeText={text => setNewPR({ ...newPR, notes: text })}
                placeholder="How did this feel? Any tips for next time?"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={onBackToHome}>
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  analyticsContainer: {
    padding: 20,
  },
  analyticsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10b981',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  improvementCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  improvementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  improvementExercise: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
  },
  improvementText: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
  },
  improvementSubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  filterChipActive: {
    backgroundColor: '#10b981',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTextActive: {
    color: '#fff',
  },
  prListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  addButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  prCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  prHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  prExercise: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
  },
  prDate: {
    fontSize: 12,
    color: '#64748b',
  },
  prDetails: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginBottom: 4,
  },
  prNotes: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 4,
  },
  verifiedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 8,
  },
  verifiedText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalCancel: {
    fontSize: 16,
    color: '#ef4444',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  modalSave: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  inputHalf: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  backButton: {
    backgroundColor: '#fff',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
});

export default PRScreen;

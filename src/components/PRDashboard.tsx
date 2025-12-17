import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { PersonalRecordsService } from '../services/personalRecordsService';
import { PersonalRecord, ExerciseType } from '../types';
import { useAuth } from '../services/auth';

interface PRCardProps {
  exerciseType: ExerciseType;
  bestPR: PersonalRecord | null;
  onPress: () => void;
}

const PRCard: React.FC<PRCardProps> = ({ exerciseType, bestPR, onPress }) => {
  const exercise = PersonalRecordsService.getExerciseCategories().find(
    e => e.type === exerciseType,
  );

  const formatPR = (pr: PersonalRecord) => {
    if (
      exerciseType === 'pullup' ||
      exerciseType === 'pushup' ||
      exerciseType === 'dip'
    ) {
      return `${pr.reps} reps`;
    }
    return `${pr.weight}kg × ${pr.reps}`;
  };

  return (
    <TouchableOpacity style={styles.prCard} onPress={onPress}>
      <Text style={styles.exerciseIcon}>{exercise?.icon}</Text>
      <Text style={styles.exerciseName}>{exercise?.name}</Text>
      <Text style={styles.exerciseDescription}>{exercise?.description}</Text>

      {bestPR ? (
        <>
          <Text style={styles.prValue}>{formatPR(bestPR)}</Text>
          <Text style={styles.prDate}>
            {new Date(bestPR.achieved_at).toLocaleDateString()}
          </Text>
        </>
      ) : (
        <Text style={styles.noPR}>No PR yet</Text>
      )}
    </TouchableOpacity>
  );
};

interface PRHistoryModalProps {
  visible: boolean;
  exerciseType: ExerciseType | null;
  onClose: () => void;
}

const PRHistoryModal: React.FC<PRHistoryModalProps> = ({
  visible,
  exerciseType,
  onClose,
}) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && exerciseType && user) {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, exerciseType, user]);

  const loadHistory = async () => {
    if (!exerciseType || !user?.id) {
      return;
    }

    setLoading(true);
    try {
      const data = await PersonalRecordsService.getPRHistoryForExercise(
        user.id,
        exerciseType,
      );
      setHistory(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load PR history');
    } finally {
      setLoading(false);
    }
  };

  const exercise = exerciseType
    ? PersonalRecordsService.getExerciseCategories().find(
        e => e.type === exerciseType,
      )
    : null;

  if (!visible || !exerciseType) {
    return null;
  }

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{exercise?.name} History</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#059669"
            style={{ marginTop: 20 }}
          />
        ) : history.length === 0 ? (
          <Text style={styles.emptyHistory}>No records yet</Text>
        ) : (
          <ScrollView
            style={styles.historyList}
            showsVerticalScrollIndicator={false}
          >
            {history.map((pr, index) => (
              <View key={pr.id} style={styles.historyItem}>
                <View style={styles.historyRank}>
                  <Text style={styles.rankNumber}>#{index + 1}</Text>
                </View>
                <View style={styles.historyDetails}>
                  <Text style={styles.historyValue}>
                    {exerciseType === 'pullup' ||
                    exerciseType === 'pushup' ||
                    exerciseType === 'dip'
                      ? `${pr.reps} reps`
                      : `${pr.weight}kg × ${pr.reps}`}
                  </Text>
                  <Text style={styles.historyDate}>
                    {new Date(pr.achieved_at).toLocaleDateString()}
                  </Text>
                </View>
                {index === 0 && (
                  <View style={styles.bestBadge}>
                    <Text style={styles.bestBadgeText}>BEST</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const PRDashboard: React.FC = () => {
  const { user } = useAuth();
  const [prs, setPrs] = useState<{ [key in ExerciseType]?: PersonalRecord }>(
    {},
  );
  const [stats, setStats] = useState<{
    totalPRs: number;
    exercisesWithPRs: ExerciseType[];
    recentPRs: PersonalRecord[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(
    null,
  );
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadPRData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadPRData = async () => {
    if (!user?.id) {
      return;
    }

    setLoading(true);
    try {
      const exercises = PersonalRecordsService.getExerciseCategories();
      const [statsData, ...prData] = await Promise.all([
        PersonalRecordsService.getUserPRStats(user.id),
        ...exercises.map(ex =>
          PersonalRecordsService.getBestPRForExercise(user.id, ex.type),
        ),
      ]);

      setStats(statsData);

      const prMap: { [key in ExerciseType]?: PersonalRecord } = {};
      exercises.forEach((exercise, index) => {
        if (prData[index]) {
          prMap[exercise.type] = prData[index] || undefined;
        }
      });
      setPrs(prMap);
    } catch (error) {
      Alert.alert('Error', 'Failed to load PR data');
    } finally {
      setLoading(false);
    }
  };

  const handlePRCardPress = (exerciseType: ExerciseType) => {
    setSelectedExercise(exerciseType);
    setShowHistory(true);
  };

  const getDaysAtGym = () => {
    if (!user?.gym_start_date) {
      return null;
    }
    const startDate = new Date(user.gym_start_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Loading your PRs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Header */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.totalPRs || 0}</Text>
            <Text style={styles.statLabel}>Total PRs</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {stats?.exercisesWithPRs.length || 0}
            </Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>

          {user?.gym_start_date && (
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{getDaysAtGym()}</Text>
              <Text style={styles.statLabel}>Days Training</Text>
            </View>
          )}
        </View>

        {/* PR Cards Grid */}
        <Text style={styles.sectionTitle}>Personal Records</Text>
        <View style={styles.prGrid}>
          {PersonalRecordsService.getExerciseCategories().map(exercise => (
            <PRCard
              key={exercise.type}
              exerciseType={exercise.type}
              bestPR={prs[exercise.type] || null}
              onPress={() => handlePRCardPress(exercise.type)}
            />
          ))}
        </View>

        {/* Recent PRs */}
        {stats?.recentPRs && stats.recentPRs.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            {stats.recentPRs.map(pr => {
              const exercise =
                PersonalRecordsService.getExerciseCategories().find(
                  e => e.type === pr.exercise_type,
                );
              return (
                <View key={pr.id} style={styles.recentItem}>
                  <Text style={styles.recentIcon}>{exercise?.icon}</Text>
                  <View style={styles.recentDetails}>
                    <Text style={styles.recentExercise}>{exercise?.name}</Text>
                    <Text style={styles.recentValue}>
                      {pr.exercise_type === 'pullup' ||
                      pr.exercise_type === 'pushup' ||
                      pr.exercise_type === 'dip'
                        ? `${pr.reps} reps`
                        : `${pr.weight}kg × ${pr.reps}`}
                    </Text>
                  </View>
                  <Text style={styles.recentDate}>
                    {new Date(pr.achieved_at).toLocaleDateString()}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <PRHistoryModal
        visible={showHistory}
        exerciseType={selectedExercise}
        onClose={() => setShowHistory(false)}
      />
    </View>
  );
};

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 2 cards per row with margin

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 30,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  prGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  prCard: {
    width: cardWidth,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  prValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    textAlign: 'center',
  },
  prDate: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  noPR: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  recentSection: {
    margin: 20,
    marginTop: 10,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recentIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  recentDetails: {
    flex: 1,
  },
  recentExercise: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  recentValue: {
    fontSize: 14,
    color: '#059669',
    marginTop: 2,
  },
  recentDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6b7280',
  },
  emptyHistory: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    fontStyle: 'italic',
    padding: 40,
  },
  historyList: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyRank: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  historyDetails: {
    flex: 1,
    marginLeft: 15,
  },
  historyValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  historyDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  bestBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  bestBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default PRDashboard;

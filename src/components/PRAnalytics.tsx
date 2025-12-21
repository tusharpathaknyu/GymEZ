import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../services/auth';
import { PersonalRecordsService } from '../services/personalRecordsService';
import { PersonalRecord, ExerciseType } from '../types';
import { supabase } from '../services/supabase';

const PRAnalytics = () => {
  const { user } = useAuth();
  const [prStats, setPrStats] = useState<any>(null);
  const [recentPRs, setRecentPRs] = useState<PersonalRecord[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadAnalytics = async () => {
    if (!user?.id) {
      return;
    }

    try {
      const stats = await PersonalRecordsService.getUserPRStats(user.id);
      setPrStats(stats);

      // Get recent PRs for the month (use created_at instead of achieved_at)
      const { data } = await supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(new Date().setDate(1)).toISOString())
        .order('created_at', { ascending: false });

      // Map created_at to achieved_at for compatibility
      const mappedData = (data || []).map(pr => ({
        ...pr,
        achieved_at: pr.achieved_at || pr.created_at,
      }));
      setRecentPRs(mappedData as PersonalRecord[]);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const calculateProgressPercentage = () => {
    if (!prStats) {
      return 0;
    }
    return Math.round((prStats.exercisesWithPRs.length / 6) * 100);
  };

  const getExerciseIcon = (exerciseType: ExerciseType) => {
    const exercises = PersonalRecordsService.getExerciseCategories();
    return exercises.find(e => e.type === exerciseType)?.icon || '💪';
  };

  const formatPR = (pr: PersonalRecord) => {
    if (['pullup', 'pushup', 'dip'].includes(pr.exercise_type)) {
      return `${pr.reps} reps`;
    }
    return `${pr.weight}kg × ${pr.reps}`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Overall Progress */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Overall Progress 📊</Text>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${calculateProgressPercentage()}%` },
            ]}
          />
          <Text style={styles.progressText}>
            {calculateProgressPercentage()}%
          </Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{prStats?.totalPRs || 0}</Text>
            <Text style={styles.statLabel}>Total PRs</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {prStats?.exercisesWithPRs?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{recentPRs.length}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
        </View>
      </View>

      {/* Exercise Breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Exercise Breakdown 💪</Text>
        <View style={styles.exerciseList}>
          {PersonalRecordsService.getExerciseCategories().map(exercise => {
            const hasPR = prStats?.exercisesWithPRs?.includes(exercise.type);
            return (
              <View
                key={exercise.type}
                style={[styles.exerciseRow, hasPR && styles.exerciseRowActive]}
              >
                <Text style={styles.exerciseIconRow}>{exercise.icon}</Text>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseNameRow}>{exercise.name}</Text>
                  <Text style={styles.exerciseDesc}>
                    {exercise.description}
                  </Text>
                </View>
                <View style={styles.exerciseStatus}>
                  {hasPR ? (
                    <Text style={styles.statusBadge}>✓</Text>
                  ) : (
                    <Text style={styles.statusBadgeEmpty}>○</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Recent PRs */}
      {recentPRs.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>This Month's PRs 🏆</Text>
          {recentPRs.slice(0, 5).map(pr => (
            <View key={pr.id} style={styles.recentPRRow}>
              <Text style={styles.recentIcon}>
                {getExerciseIcon(pr.exercise_type)}
              </Text>
              <View style={styles.recentInfo}>
                <Text style={styles.recentExercise}>
                  {
                    PersonalRecordsService.getExerciseCategories().find(
                      e => e.type === pr.exercise_type,
                    )?.name
                  }
                </Text>
                <Text style={styles.recentValue}>{formatPR(pr)}</Text>
              </View>
              <Text style={styles.recentDate}>
                {new Date(pr.achieved_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 16,
    marginBottom: 0,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 32,
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    marginBottom: 20,
    position: 'relative',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 16,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  exerciseList: {
    gap: 8,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderLeftWidth: 0,
  },
  exerciseRowActive: {
    backgroundColor: '#ecfdf5',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  exerciseIconRow: {
    fontSize: 24,
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseNameRow: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  exerciseDesc: {
    fontSize: 12,
    color: '#6b7280',
  },
  exerciseStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    fontSize: 24,
    color: '#10b981',
  },
  statusBadgeEmpty: {
    fontSize: 20,
    color: '#d1d5db',
  },
  recentPRRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  recentIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentExercise: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  recentValue: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  recentDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default PRAnalytics;

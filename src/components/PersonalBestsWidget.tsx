import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { buttonPress } from '../utils/haptics';

const { width } = Dimensions.get('window');

interface PersonalBest {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  date: string;
  previousBest?: number;
  icon: string;
}

interface PersonalBestsWidgetProps {
  onViewAll?: () => void;
  onPRPress?: (pr: PersonalBest) => void;
  limit?: number;
}

// Mock PR data (would come from Supabase in production)
const MOCK_PRS: PersonalBest[] = [
  {
    id: '1',
    exercise: 'Bench Press',
    weight: 225,
    reps: 1,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    previousBest: 215,
    icon: '🏋️',
  },
  {
    id: '2',
    exercise: 'Squat',
    weight: 315,
    reps: 1,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    previousBest: 295,
    icon: '🦵',
  },
  {
    id: '3',
    exercise: 'Deadlift',
    weight: 405,
    reps: 1,
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    previousBest: 385,
    icon: '💪',
  },
  {
    id: '4',
    exercise: 'Overhead Press',
    weight: 155,
    reps: 1,
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    previousBest: 145,
    icon: '🙆',
  },
  {
    id: '5',
    exercise: 'Barbell Row',
    weight: 185,
    reps: 5,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    previousBest: 175,
    icon: '🚣',
  },
];

const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

const PersonalBestsWidget: React.FC<PersonalBestsWidgetProps> = ({
  onViewAll,
  onPRPress,
  limit = 3,
}) => {
  const [prs, setPrs] = useState<PersonalBest[]>(MOCK_PRS.slice(0, limit));

  // Big 3 total
  const bigThreeTotal = MOCK_PRS.filter(pr => 
    ['Bench Press', 'Squat', 'Deadlift'].includes(pr.exercise)
  ).reduce((sum, pr) => sum + pr.weight, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Personal Records</Text>
          <Text style={styles.subtitle}>Your best lifts</Text>
        </View>
        {onViewAll && (
          <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Big 3 Total */}
      <View style={styles.bigThreeCard}>
        <Text style={styles.bigThreeLabel}>Big 3 Total</Text>
        <Text style={styles.bigThreeValue}>{bigThreeTotal}</Text>
        <Text style={styles.bigThreeUnit}>lbs</Text>
        <View style={styles.bigThreeBreakdown}>
          <Text style={styles.breakdownText}>
            B: {MOCK_PRS.find(p => p.exercise === 'Bench Press')?.weight || 0} + 
            S: {MOCK_PRS.find(p => p.exercise === 'Squat')?.weight || 0} + 
            D: {MOCK_PRS.find(p => p.exercise === 'Deadlift')?.weight || 0}
          </Text>
        </View>
      </View>

      {/* Recent PRs */}
      <View style={styles.prsList}>
        {prs.map((pr) => (
          <TouchableOpacity
            key={pr.id}
            style={styles.prCard}
            onPress={() => {
              buttonPress();
              onPRPress?.(pr);
            }}
          >
            <View style={styles.prIcon}>
              <Text style={styles.prIconText}>{pr.icon}</Text>
            </View>
            <View style={styles.prInfo}>
              <Text style={styles.prExercise}>{pr.exercise}</Text>
              <Text style={styles.prDate}>{getTimeAgo(pr.date)}</Text>
            </View>
            <View style={styles.prStats}>
              <Text style={styles.prWeight}>{pr.weight} lbs</Text>
              {pr.previousBest && (
                <View style={styles.prImprovement}>
                  <Text style={styles.prImprovementText}>
                    +{pr.weight - pr.previousBest}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Compact version for dashboard
export const PersonalBestsCompact: React.FC<{
  onPress?: () => void;
}> = ({ onPress }) => {
  const topPRs = MOCK_PRS.slice(0, 3);

  return (
    <TouchableOpacity style={styles.compactContainer} onPress={onPress}>
      <View style={styles.compactHeader}>
        <Text style={styles.compactTitle}>🏆 Personal Records</Text>
        <Text style={styles.compactArrow}>→</Text>
      </View>
      <View style={styles.compactPRs}>
        {topPRs.map(pr => (
          <View key={pr.id} style={styles.compactPR}>
            <Text style={styles.compactIcon}>{pr.icon}</Text>
            <Text style={styles.compactWeight}>{pr.weight}</Text>
            <Text style={styles.compactLabel}>{pr.exercise.split(' ')[0]}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

// Full list for dedicated screen
export const PersonalBestsList: React.FC<{
  onPRPress?: (pr: PersonalBest) => void;
}> = ({ onPRPress }) => {
  const [sortBy, setSortBy] = useState<'recent' | 'weight'>('recent');
  
  const sortedPRs = [...MOCK_PRS].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return b.weight - a.weight;
  });

  return (
    <View style={styles.fullListContainer}>
      {/* Sort Options */}
      <View style={styles.sortRow}>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'recent' && styles.sortButtonActive]}
          onPress={() => setSortBy('recent')}
        >
          <Text style={[styles.sortText, sortBy === 'recent' && styles.sortTextActive]}>
            Most Recent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'weight' && styles.sortButtonActive]}
          onPress={() => setSortBy('weight')}
        >
          <Text style={[styles.sortText, sortBy === 'weight' && styles.sortTextActive]}>
            Heaviest
          </Text>
        </TouchableOpacity>
      </View>

      {/* PRs List */}
      {sortedPRs.map((pr) => (
        <TouchableOpacity
          key={pr.id}
          style={styles.fullPrCard}
          onPress={() => {
            buttonPress();
            onPRPress?.(pr);
          }}
        >
          <View style={styles.fullPrLeft}>
            <View style={styles.fullPrIcon}>
              <Text style={styles.fullPrIconText}>{pr.icon}</Text>
            </View>
            <View style={styles.fullPrInfo}>
              <Text style={styles.fullPrExercise}>{pr.exercise}</Text>
              <Text style={styles.fullPrMeta}>
                {pr.reps === 1 ? '1RM' : `${pr.reps} reps`} • {getTimeAgo(pr.date)}
              </Text>
            </View>
          </View>
          <View style={styles.fullPrRight}>
            <Text style={styles.fullPrWeight}>{pr.weight}</Text>
            <Text style={styles.fullPrUnit}>lbs</Text>
            {pr.previousBest && (
              <View style={styles.fullPrGain}>
                <Text style={styles.fullPrGainText}>+{pr.weight - pr.previousBest}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  viewAllButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  bigThreeCard: {
    backgroundColor: '#10b981',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  bigThreeLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  bigThreeValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
  },
  bigThreeUnit: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  bigThreeBreakdown: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  breakdownText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  prsList: {},
  prCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 8,
  },
  prIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  prIconText: {
    fontSize: 22,
  },
  prInfo: {
    flex: 1,
  },
  prExercise: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  prDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  prStats: {
    alignItems: 'flex-end',
  },
  prWeight: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  prImprovement: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  prImprovementText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10b981',
  },
  // Compact styles
  compactContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  compactArrow: {
    fontSize: 16,
    color: '#6b7280',
  },
  compactPRs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  compactPR: {
    alignItems: 'center',
  },
  compactIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  compactWeight: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  compactLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  // Full list styles
  fullListContainer: {
    paddingHorizontal: 16,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: '#111827',
  },
  sortText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  sortTextActive: {
    color: '#fff',
  },
  fullPrCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  fullPrLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullPrIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fullPrIconText: {
    fontSize: 24,
  },
  fullPrInfo: {},
  fullPrExercise: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  fullPrMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  fullPrRight: {
    alignItems: 'flex-end',
  },
  fullPrWeight: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10b981',
  },
  fullPrUnit: {
    fontSize: 12,
    color: '#6b7280',
  },
  fullPrGain: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  fullPrGainText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10b981',
  },
});

export default PersonalBestsWidget;

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useAuth} from '../services/auth';
import {PersonalRecordsService} from '../services/personalRecordsService';
import {supabase} from '../services/supabase';

const AchievementBadges = () => {
  const {user} = useAuth();
  const [badges, setBadges] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      loadBadges();
    }
  }, [user]);

  const loadBadges = async () => {
    if (!user?.id) return;

    try {
      const statsData = await PersonalRecordsService.getUserPRStats(user.id);

      const badgesList = [
        {
          id: 'first_pr',
          icon: '🎯',
          name: 'First PR',
          description: 'Log your first personal record',
          unlocked: statsData.totalPRs > 0,
        },
        {
          id: 'triple_crown',
          icon: '👑',
          name: 'Triple Crown',
          description: 'Achieve PRs in 3 different exercises',
          unlocked: statsData.exercisesWithPRs.length >= 3,
        },
        {
          id: 'five_timer',
          icon: '🔥',
          name: 'Fiver',
          description: 'Log 5 personal records',
          unlocked: statsData.totalPRs >= 5,
        },
        {
          id: 'ten_fire',
          icon: '💪',
          name: 'Lift Master',
          description: 'Achieve 10 personal records',
          unlocked: statsData.totalPRs >= 10,
        },
        {
          id: 'perfect_week',
          icon: '⭐',
          name: 'Perfect Week',
          description: 'Log PRs for 7 days straight',
          unlocked: false,
        },
        {
          id: 'social_butterfly',
          icon: '🦋',
          name: 'Social Butterfly',
          description: 'Make 10 posts on the social feed',
          unlocked: false,
        },
        {
          id: 'bench_bandit',
          icon: '💺',
          name: 'Bench Bandit',
          description: 'Set a PR on bench press over 100kg',
          unlocked: false,
        },
        {
          id: 'squat_king',
          icon: '👑',
          name: 'Squat King',
          description: 'Set a PR on squat over 150kg',
          unlocked: false,
        },
        {
          id: 'deadlift_destroyer',
          icon: '⚡',
          name: 'Deadlift Destroyer',
          description: 'Set a PR on deadlift over 200kg',
          unlocked: false,
        },
        {
          id: 'consistency_champ',
          icon: '📅',
          name: 'Consistency Champ',
          description: 'Log PRs for 30 consecutive days',
          unlocked: false,
        },
      ];

      setBadges(badgesList);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading badges:', error);
    }
  };

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <ScrollView style={styles.container}>
      {/* Progress Header */}
      <View style={styles.progressHeader}>
        <View style={styles.progressRing}>
          <Text style={styles.progressText}>
            {Math.round((unlockedCount / badges.length) * 100)}%
          </Text>
        </View>
        <View style={styles.progressInfo}>
          <Text style={styles.progressTitle}>Achievements</Text>
          <Text style={styles.progressSubtitle}>
            {unlockedCount} of {badges.length} unlocked
          </Text>
        </View>
      </View>

      {/* Badges Grid */}
      <View style={styles.badgesGrid}>
        {badges.map(badge => (
          <View
            key={badge.id}
            style={[
              styles.badgeCard,
              !badge.unlocked && styles.badgeLocked,
            ]}
          >
            <Text style={[styles.badgeIcon, !badge.unlocked && styles.badgeIconLocked]}>
              {badge.icon}
            </Text>
            <Text style={styles.badgeName}>{badge.name}</Text>
            <Text style={styles.badgeDescription}>{badge.description}</Text>
            {!badge.unlocked && (
              <View style={styles.lockedOverlay}>
                <Text style={styles.lockedIcon}>🔒</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    gap: 16,
  },
  progressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#10b981',
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  badgeCard: {
    width: '47%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  badgeLocked: {
    opacity: 0.6,
  },
  badgeIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  badgeIconLocked: {
    opacity: 0.4,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  lockedIcon: {
    fontSize: 16,
  },
});

export default AchievementBadges;


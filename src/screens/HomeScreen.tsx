import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useAuth} from '../services/auth';
import {PersonalRecordsService} from '../services/personalRecordsService';
import {SocialService} from '../services/socialService';
import {PersonalRecord, ExerciseType, Post} from '../types';
import WorkoutStreak from '../components/WorkoutStreak';
import ProgressPhotos from '../components/ProgressPhotos';
import QuickActions from '../components/QuickActions';
import PRLogForm from '../components/PRLogForm';
import PRAnalytics from '../components/PRAnalytics';

const HomeScreen = ({navigation}: any) => {
  const {user} = useAuth();
  const [recentPRs, setRecentPRs] = useState<PersonalRecord[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPRForm, setShowPRForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const [prs, posts, statsData] = await Promise.all([
        PersonalRecordsService.getRecentPRs(user.id),
        SocialService.getFeedPosts(user.id, user.gym_id),
        PersonalRecordsService.getUserPRStats(user.id),
      ]);

      setRecentPRs(prs.slice(0, 3));
      setRecentPosts(posts.slice(0, 5));
      setStats(statsData);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatPR = (pr: PersonalRecord) => {
    const exercises = PersonalRecordsService.getExerciseCategories();
    const exercise = exercises.find(e => e.type === pr.exercise_type);
    
    if (pr.exercise_type === 'pullup' || pr.exercise_type === 'pushup' || pr.exercise_type === 'dip') {
      return `${pr.reps} reps`;
    }
    return `${pr.weight}kg × ${pr.reps}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#10b981" />
        }
      >
      {/* Welcome Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.full_name?.split(' ')[0] || 'Member'}! 👋</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🏆</Text>
          <Text style={styles.statNumber}>{stats?.totalPRs || 0}</Text>
          <Text style={styles.statLabel}>Total PRs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💪</Text>
          <Text style={styles.statNumber}>{stats?.exercisesWithPRs?.length || 0}</Text>
          <Text style={styles.statLabel}>Exercises</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statNumber}>{recentPRs.length}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
      </View>

      {/* Recent PRs Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent PRs 🏅</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PRs')}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>
        {recentPRs.length > 0 ? (
          <View style={styles.listContainer}>
            {recentPRs.map(pr => {
              const exercise = PersonalRecordsService.getExerciseCategories().find(
                e => e.type === pr.exercise_type
              );
              return (
                <View key={pr.id} style={styles.prCard}>
                  <Text style={styles.exerciseIcon}>{exercise?.icon}</Text>
                  <View style={styles.prDetails}>
                    <Text style={styles.prExercise}>{exercise?.name}</Text>
                    <Text style={styles.prValue}>{formatPR(pr)}</Text>
                  </View>
                  <Text style={styles.prDate}>
                    {new Date(pr.achieved_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No PRs yet</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('Workouts')}>
              <Text style={styles.addButtonText}>Record Your First PR</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity 📰</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Social')}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>
        {recentPosts.length > 0 ? (
          <View style={styles.listContainer}>
            {recentPosts.map(post => (
              <View key={post.id} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityUser}>{post.user?.full_name || 'Someone'}</Text>
                  <Text style={styles.activityTime}>
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                <Text style={styles.activityContent} numberOfLines={2}>
                  {post.content}
                </Text>
                {post.post_type === 'pr_achievement' && (
                  <View style={styles.prBadge}>
                    <Text style={styles.prBadgeText}>🎉 New PR!</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No activity yet</Text>
          </View>
        )}
      </View>

      {/* Workout Streak */}
      <WorkoutStreak />

      {/* Progress Photos */}
      <ProgressPhotos />

      {/* Quick Actions */}
      <QuickActions onPress={() => setShowPRForm(true)} />

      {/* PR Analytics */}
      <PRAnalytics />
    </ScrollView>

      {/* PR Log Form Modal */}
      <PRLogForm
        visible={showPRForm}
        onClose={() => setShowPRForm(false)}
        onSuccess={() => {
          loadData();
        }}
      />
    </View>
  );
};

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
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  greeting: {
    fontSize: 16,
    color: '#6b7280',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
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
    color: '#111827',
  },
  seeAll: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  listContainer: {
    gap: 12,
  },
  prCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  exerciseIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  prDetails: {
    flex: 1,
  },
  prExercise: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  prValue: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 2,
  },
  prDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  activityCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  activityContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  prBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  prBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;


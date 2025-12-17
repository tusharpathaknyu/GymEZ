import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../services/auth';
import { PersonalRecordsService } from '../services/personalRecordsService';
import { SocialService } from '../services/socialService';
import { PersonalRecord, Post } from '../types';
import WorkoutStreak from '../components/WorkoutStreak';
import ProgressPhotos from '../components/ProgressPhotos';
import QuickActions from '../components/QuickActions';
import PRLogForm from '../components/PRLogForm';
import PRAnalytics from '../components/PRAnalytics';
import SearchBar from '../components/SearchBar';
import CheckInButton from '../components/CheckInButton';
import { SlideInView, FadeInView } from '../components/AnimatedComponents';

const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [recentPRs, setRecentPRs] = useState<PersonalRecord[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPRForm, setShowPRForm] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadData = async () => {
    if (!user?.id) {
      return;
    }

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
    if (
      pr.exercise_type === 'pullup' ||
      pr.exercise_type === 'pushup' ||
      pr.exercise_type === 'dip'
    ) {
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#10b981"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>
                {user?.full_name?.split(' ')[0] || 'Member'}! 👋
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Text style={styles.notificationIcon}>🔔</Text>
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <SearchBar 
              placeholder="Search exercises, users, gyms..."
              onResultSelect={(result) => {
                console.log('Selected:', result);
                // Navigate based on type
              }}
            />
          </View>
        </View>

        {/* Quick Check-in Card */}
        <FadeInView delay={100}>
          <View style={styles.checkInCard}>
            <CheckInButton onCheckInSuccess={loadData} onCheckOutSuccess={loadData} />
          </View>
        </FadeInView>

        {/* Quick Actions Grid - Industry Features */}
        <SlideInView direction="up" delay={150}>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={[styles.quickActionCard, styles.primaryActionCard]}
              onPress={() => navigation.navigate('LiveWorkout')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>🏋️</Text>
              </View>
              <Text style={[styles.actionTitle, { color: '#fff' }]}>Start Workout</Text>
              <Text style={[styles.actionSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>Track in real-time</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('ExerciseLibrary')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#fef3c7' }]}>
                <Text style={styles.actionIcon}>📚</Text>
              </View>
              <Text style={styles.actionTitle}>Exercises</Text>
              <Text style={styles.actionSubtitle}>Library</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Activity')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#e0e7ff' }]}>
                <Text style={styles.actionIcon}>📊</Text>
              </View>
              <Text style={styles.actionTitle}>Activity</Text>
              <Text style={styles.actionSubtitle}>History</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.getParent()?.navigate('Leaderboard')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#fce7f3' }]}>
                <Text style={styles.actionIcon}>🏆</Text>
              </View>
              <Text style={styles.actionTitle}>Leaderboard</Text>
              <Text style={styles.actionSubtitle}>Rankings</Text>
            </TouchableOpacity>
          </View>
        </SlideInView>

        {/* Quick Stats */}
        <SlideInView direction="up" delay={200}>
          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statCard} activeOpacity={0.7}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={styles.statNumber}>{stats?.totalPRs || 0}</Text>
              <Text style={styles.statLabel}>Total PRs</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCard} activeOpacity={0.7}>
              <Text style={styles.statIcon}>💪</Text>
              <Text style={styles.statNumber}>
                {stats?.exercisesWithPRs?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCard} activeOpacity={0.7}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statNumber}>{recentPRs.length}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </TouchableOpacity>
          </View>
        </SlideInView>

        {/* Recent PRs Section */}
        <SlideInView direction="up" delay={300}>
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
                const exercise =
                  PersonalRecordsService.getExerciseCategories().find(
                    e => e.type === pr.exercise_type,
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
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('Workouts')}
              >
                <Text style={styles.addButtonText}>Record Your First PR</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        </SlideInView>

        {/* Recent Activity */}
        <SlideInView direction="up" delay={400}>
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
                    <Text style={styles.activityUser}>
                      {post.user?.full_name || 'Someone'}
                    </Text>
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
        </SlideInView>

        {/* Workout Streak */}
        <SlideInView direction="up" delay={500}>
          <WorkoutStreak />
        </SlideInView>

        {/* Progress Photos */}
        <SlideInView direction="up" delay={600}>
          <ProgressPhotos />
        </SlideInView>

        {/* Quick Actions */}
        <SlideInView direction="up" delay={700}>
          <QuickActions onPress={() => setShowPRForm(true)} />
        </SlideInView>

        {/* PR Analytics */}
        <SlideInView direction="up" delay={800}>
          <PRAnalytics />
        </SlideInView>

        {/* Bottom padding */}
        <View style={{ height: 100 }} />
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 22,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#fff',
  },
  searchContainer: {
    marginTop: 4,
  },
  checkInCard: {
    marginHorizontal: 20,
    marginTop: 16,
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
    shadowOffset: { width: 0, height: 2 },
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
    shadowOffset: { width: 0, height: 1 },
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
    shadowOffset: { width: 0, height: 1 },
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
    shadowOffset: { width: 0, height: 1 },
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
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  quickActionCard: {
    width: '47%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryActionCard: {
    backgroundColor: '#10b981',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
});

HomeScreen.options = {
  topBar: {
    title: {
      text: 'GymEZ',
    },
  },
};

export default HomeScreen;

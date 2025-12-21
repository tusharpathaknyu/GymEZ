import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
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
import WorkoutTemplates from '../components/WorkoutTemplates';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Motivational quotes for fitness
const MOTIVATIONAL_QUOTES = [
  { quote: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { quote: "Your body can stand almost anything. It's your mind you have to convince.", author: "Unknown" },
  { quote: "Strength does not come from the body. It comes from the will.", author: "Gandhi" },
  { quote: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger" },
  { quote: "Success isn't always about greatness. It's about consistency.", author: "Dwayne Johnson" },
  { quote: "Don't limit your challenges. Challenge your limits.", author: "Unknown" },
  { quote: "The only way to define your limits is by going beyond them.", author: "Arthur C. Clarke" },
  { quote: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { quote: "Your only limit is you.", author: "Unknown" },
  { quote: "Sweat is just fat crying.", author: "Unknown" },
  { quote: "Champions train, losers complain.", author: "Unknown" },
  { quote: "Be stronger than your excuses.", author: "Unknown" },
];

// Quick workout suggestions based on day/time
const QUICK_WORKOUTS = [
  { name: "Push Day Express", duration: "15 min", exercises: ["Push-ups", "Dips", "Shoulder Press"], icon: "💪", color: "#ef4444" },
  { name: "Leg Burner", duration: "20 min", exercises: ["Squats", "Lunges", "Calf Raises"], icon: "🦵", color: "#f59e0b" },
  { name: "Core Crusher", duration: "10 min", exercises: ["Planks", "Crunches", "Russian Twists"], icon: "🔥", color: "#10b981" },
  { name: "Full Body HIIT", duration: "25 min", exercises: ["Burpees", "Mountain Climbers", "Jump Squats"], icon: "⚡", color: "#8b5cf6" },
  { name: "Upper Body Strength", duration: "30 min", exercises: ["Bench Press", "Rows", "Curls"], icon: "🏋️", color: "#3b82f6" },
  { name: "Cardio Blast", duration: "20 min", exercises: ["Jump Rope", "High Knees", "Box Jumps"], icon: "🏃", color: "#ec4899" },
];

const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [recentPRs, setRecentPRs] = useState<PersonalRecord[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPRForm, setShowPRForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Get daily motivational quote (changes each day)
  const dailyQuote = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
  }, []);

  // Get suggested workout based on day of week
  const suggestedWorkout = useMemo(() => {
    const dayOfWeek = new Date().getDay();
    return QUICK_WORKOUTS[dayOfWeek % QUICK_WORKOUTS.length];
  }, []);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

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
              <Text style={styles.greeting}>{getGreeting()},</Text>
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

        {/* 🎮 GAME HERO SECTION - Primary Focus */}
        <FadeInView delay={50}>
          <TouchableOpacity 
            style={styles.gameHeroCard}
            onPress={() => navigation.getParent()?.navigate('GameTab')}
            activeOpacity={0.9}
          >
            <View style={styles.gameHeroGradient}>
              <View style={styles.gameHeroHeader}>
                <View style={styles.gameHeroTitleRow}>
                  <Text style={styles.gameHeroIcon}>⚔️</Text>
                  <View>
                    <Text style={styles.gameHeroTitle}>Fitness Quest</Text>
                    <Text style={styles.gameHeroSubtitle}>Your workout RPG adventure awaits!</Text>
                  </View>
                </View>
                <View style={styles.gameHeroLevelBadge}>
                  <Text style={styles.gameHeroLevelText}>LVL</Text>
                  <Text style={styles.gameHeroLevelNumber}>7</Text>
                </View>
              </View>
              
              <View style={styles.gameHeroStats}>
                <View style={styles.gameHeroStatItem}>
                  <Text style={styles.gameHeroStatValue}>2,450</Text>
                  <Text style={styles.gameHeroStatLabel}>XP</Text>
                </View>
                <View style={styles.gameHeroStatDivider} />
                <View style={styles.gameHeroStatItem}>
                  <Text style={styles.gameHeroStatValue}>5</Text>
                  <Text style={styles.gameHeroStatLabel}>🔥 Streak</Text>
                </View>
                <View style={styles.gameHeroStatDivider} />
                <View style={styles.gameHeroStatItem}>
                  <Text style={styles.gameHeroStatValue}>12</Text>
                  <Text style={styles.gameHeroStatLabel}>Quests</Text>
                </View>
              </View>

              <View style={styles.gameHeroProgress}>
                <View style={styles.gameHeroProgressBar}>
                  <View style={[styles.gameHeroProgressFill, { width: '65%' }]} />
                </View>
                <Text style={styles.gameHeroProgressText}>650/1000 XP to Level 8</Text>
              </View>

              <View style={styles.gameHeroActions}>
                <View style={styles.gameHeroPlayButton}>
                  <Text style={styles.gameHeroPlayText}>🎮 Continue Adventure</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </FadeInView>

        {/* Quick Game Actions */}
        <FadeInView delay={75}>
          <View style={styles.gameQuickActions}>
            <TouchableOpacity 
              style={styles.gameQuickActionCard}
              onPress={() => navigation.navigate('GymCheckin')}
            >
              <View style={[styles.gameQuickIcon, { backgroundColor: '#fef2f2' }]}>
                <Text style={styles.gameQuickEmoji}>📍</Text>
              </View>
              <Text style={styles.gameQuickLabel}>Check In</Text>
              <Text style={styles.gameQuickXP}>+50 XP</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.gameQuickActionCard}
              onPress={() => navigation.navigate('Guild')}
            >
              <View style={[styles.gameQuickIcon, { backgroundColor: '#f0fdf4' }]}>
                <Text style={styles.gameQuickEmoji}>⚔️</Text>
              </View>
              <Text style={styles.gameQuickLabel}>Guild</Text>
              <Text style={styles.gameQuickXP}>Raid Active!</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.gameQuickActionCard}
              onPress={() => navigation.navigate('Tournament')}
            >
              <View style={[styles.gameQuickIcon, { backgroundColor: '#fefce8' }]}>
                <Text style={styles.gameQuickEmoji}>🏆</Text>
              </View>
              <Text style={styles.gameQuickLabel}>Tournament</Text>
              <Text style={styles.gameQuickXP}>Rank #24</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.gameQuickActionCard}
              onPress={() => navigation.navigate('BossRaid')}
            >
              <View style={[styles.gameQuickIcon, { backgroundColor: '#fdf4ff' }]}>
                <Text style={styles.gameQuickEmoji}>👹</Text>
              </View>
              <Text style={styles.gameQuickLabel}>Boss Raid</Text>
              <Text style={styles.gameQuickXP}>NEW</Text>
            </TouchableOpacity>
          </View>
        </FadeInView>

        {/* Daily Motivational Quote - Compact */}
        <FadeInView delay={100}>
          <View style={styles.quoteCardCompact}>
            <Text style={styles.quoteIcon}>💭</Text>
            <View style={styles.quoteContent}>
              <Text style={styles.quoteTextCompact}>"{dailyQuote.quote}"</Text>
              <Text style={styles.quoteAuthorCompact}>— {dailyQuote.author}</Text>
            </View>
          </View>
        </FadeInView>

        {/* Today's Suggested Workout - Moved down */}
        <FadeInView delay={125}>
          <TouchableOpacity 
            style={[styles.suggestedWorkoutCard, { borderLeftColor: suggestedWorkout.color }]}
            onPress={() => navigation.navigate('LiveWorkout')}
            activeOpacity={0.8}
          >
            <View style={styles.suggestedWorkoutHeader}>
              <View style={[styles.suggestedWorkoutIcon, { backgroundColor: suggestedWorkout.color + '20' }]}>
                <Text style={styles.suggestedWorkoutEmoji}>{suggestedWorkout.icon}</Text>
              </View>
              <View style={styles.suggestedWorkoutInfo}>
                <Text style={styles.suggestedWorkoutLabel}>TODAY'S SUGGESTED WORKOUT</Text>
                <Text style={styles.suggestedWorkoutName}>{suggestedWorkout.name}</Text>
                <Text style={styles.suggestedWorkoutDuration}>⏱️ {suggestedWorkout.duration}</Text>
              </View>
              <View style={[styles.startButton, { backgroundColor: suggestedWorkout.color }]}>
                <Text style={styles.startButtonText}>Start</Text>
              </View>
            </View>
            <View style={styles.suggestedWorkoutExercises}>
              {suggestedWorkout.exercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseChip}>
                  <Text style={styles.exerciseChipText}>{exercise}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        </FadeInView>

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

        {/* Workout Templates Banner */}
        <SlideInView direction="up" delay={160}>
          <TouchableOpacity 
            style={styles.templatesBanner}
            onPress={() => setShowTemplates(true)}
            activeOpacity={0.8}
          >
            <View style={styles.templatesIconContainer}>
              <Text style={styles.templatesIcon}>📋</Text>
            </View>
            <View style={styles.templatesBannerContent}>
              <Text style={styles.templatesBannerTitle}>Workout Templates</Text>
              <Text style={styles.templatesBannerSubtitle}>Push, Pull, Leg Day, HIIT & more</Text>
            </View>
            <Text style={styles.templatesBannerArrow}>→</Text>
          </TouchableOpacity>
        </SlideInView>

        {/* AI Features Banner */}
        <SlideInView direction="up" delay={175}>
          <TouchableOpacity 
            style={styles.aiBanner}
            onPress={() => navigation.navigate('AIHub')}
            activeOpacity={0.8}
          >
            <View style={styles.aiIconContainer}>
              <Text style={styles.aiIcon}>🧠</Text>
            </View>
            <View style={styles.aiBannerContent}>
              <Text style={styles.aiBannerTitle}>AI Features</Text>
              <Text style={styles.aiBannerSubtitle}>Coach, Workout Generator, Meal Planner & more</Text>
            </View>
            <Text style={styles.aiBannerArrow}>→</Text>
          </TouchableOpacity>
        </SlideInView>

        {/* Fitness RPG Banner */}
        <SlideInView direction="up" delay={185}>
          <TouchableOpacity 
            style={styles.gamesBanner}
            onPress={() => navigation.navigate('FitnessRPG')}
            activeOpacity={0.8}
          >
            <View style={styles.gamesIconContainer}>
              <Text style={styles.gamesIcon}>⚔️</Text>
            </View>
            <View style={styles.gamesBannerContent}>
              <Text style={styles.gamesBannerTitle}>Fitness RPG</Text>
              <Text style={styles.gamesBannerSubtitle}>Guilds, Boss Raids, Tournaments & more!</Text>
            </View>
            <View style={styles.gamesNewBadge}>
              <Text style={styles.gamesNewBadgeText}>NEW</Text>
            </View>
          </TouchableOpacity>
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

      {/* Workout Templates Modal */}
      <WorkoutTemplates
        visible={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={(template) => {
          console.log('Selected template:', template.name);
          navigation.navigate('LiveWorkout', { template });
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
  // AI Banner Styles
  aiBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  aiIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  aiIcon: {
    fontSize: 26,
  },
  aiBannerContent: {
    flex: 1,
  },
  aiBannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  aiBannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  aiBannerArrow: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '600',
  },
  // Games Banner Styles
  gamesBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e94560',
  },
  gamesIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#e94560',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  gamesIcon: {
    fontSize: 26,
  },
  gamesBannerContent: {
    flex: 1,
  },
  gamesBannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  gamesBannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  gamesNewBadge: {
    backgroundColor: '#e94560',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  gamesNewBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
  },
  // Workout Templates Banner Styles
  templatesBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  templatesIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  templatesIcon: {
    fontSize: 26,
  },
  templatesBannerContent: {
    flex: 1,
  },
  templatesBannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  templatesBannerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  templatesBannerArrow: {
    fontSize: 22,
    color: '#3b82f6',
    fontWeight: '600',
  },
  // Motivational Quote Styles
  quoteCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  quoteIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quoteIcon: {
    fontSize: 20,
  },
  quoteContent: {
    flex: 1,
  },
  quoteText: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  quoteAuthor: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
    fontWeight: '500',
  },
  // Suggested Workout Styles
  suggestedWorkoutCard: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
  },
  suggestedWorkoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestedWorkoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestedWorkoutEmoji: {
    fontSize: 24,
  },
  suggestedWorkoutInfo: {
    flex: 1,
  },
  suggestedWorkoutLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 0.5,
  },
  suggestedWorkoutName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  suggestedWorkoutDuration: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  startButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  suggestedWorkoutExercises: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  exerciseChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  exerciseChipText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  // Game Hero Styles
  gameHeroCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  gameHeroGradient: {
    backgroundColor: '#1e1b4b',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  gameHeroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gameHeroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameHeroIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  gameHeroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  gameHeroSubtitle: {
    fontSize: 13,
    color: '#a5b4fc',
    marginTop: 2,
  },
  gameHeroLevelBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  gameHeroLevelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#78350f',
  },
  gameHeroLevelNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#78350f',
  },
  gameHeroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  gameHeroStatItem: {
    alignItems: 'center',
  },
  gameHeroStatValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  gameHeroStatLabel: {
    fontSize: 12,
    color: '#a5b4fc',
    marginTop: 2,
  },
  gameHeroStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  gameHeroProgress: {
    marginTop: 16,
  },
  gameHeroProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  gameHeroProgressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  gameHeroProgressText: {
    fontSize: 11,
    color: '#a5b4fc',
    marginTop: 6,
    textAlign: 'center',
  },
  gameHeroActions: {
    marginTop: 16,
  },
  gameHeroPlayButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  gameHeroPlayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Game Quick Actions
  gameQuickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 10,
  },
  gameQuickActionCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gameQuickIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameQuickEmoji: {
    fontSize: 22,
  },
  gameQuickLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  gameQuickXP: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10b981',
    marginTop: 2,
  },
  // Compact Quote Styles
  quoteCardCompact: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quoteTextCompact: {
    fontSize: 13,
    color: '#374151',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  quoteAuthorCompact: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
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

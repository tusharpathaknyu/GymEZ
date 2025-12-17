import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../services/auth';
import { SlideInView, FadeInView } from '../components/AnimatedComponents';

const { width } = Dimensions.get('window');

interface Activity {
  id: string;
  type: 'workout' | 'checkin' | 'pr' | 'challenge' | 'achievement';
  title: string;
  description: string;
  timestamp: Date;
  duration?: number;
  calories?: number;
  stats?: { label: string; value: string }[];
  icon: string;
}

interface WeeklyStats {
  workouts: number;
  totalMinutes: number;
  calories: number;
  prs: number;
  streak: number;
}

const ActivityScreen = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    workouts: 0,
    totalMinutes: 0,
    calories: 0,
    prs: 0,
    streak: 0,
  });
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadActivityData();
  }, [user, selectedPeriod]);

  const loadActivityData = async () => {
    // Simulate loading activity data
    // In production, this would fetch from your backend
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'workout',
        title: 'Chest & Triceps',
        description: 'Completed 8 exercises • 24 sets',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        duration: 62,
        calories: 420,
        stats: [
          { label: 'Volume', value: '12,450 lbs' },
          { label: 'Sets', value: '24' },
          { label: 'Max Weight', value: '225 lbs' },
        ],
        icon: '💪',
      },
      {
        id: '2',
        type: 'pr',
        title: 'New Bench Press PR!',
        description: '225 lbs × 5 reps',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        icon: '🏆',
      },
      {
        id: '3',
        type: 'checkin',
        title: 'Gym Check-in',
        description: 'Iron Paradise Fitness',
        timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000),
        duration: 75,
        calories: 520,
        icon: '📍',
      },
      {
        id: '4',
        type: 'workout',
        title: 'Back & Biceps',
        description: 'Completed 7 exercises • 21 sets',
        timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000),
        duration: 58,
        calories: 380,
        icon: '💪',
      },
      {
        id: '5',
        type: 'achievement',
        title: '7-Day Streak 🔥',
        description: 'Worked out 7 days in a row!',
        timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000),
        icon: '🔥',
      },
      {
        id: '6',
        type: 'challenge',
        title: 'Challenge Completed',
        description: '100 Push-ups Challenge',
        timestamp: new Date(Date.now() - 50 * 60 * 60 * 1000),
        icon: '🎯',
      },
    ];

    setActivities(mockActivities);
    setWeeklyStats({
      workouts: 5,
      totalMinutes: 312,
      calories: 2150,
      prs: 2,
      streak: 7,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivityData();
    setRefreshing(false);
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (minutes: number): string => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const getActivityColor = (type: Activity['type']): string => {
    switch (type) {
      case 'workout': return '#10b981';
      case 'pr': return '#f59e0b';
      case 'checkin': return '#3b82f6';
      case 'challenge': return '#8b5cf6';
      case 'achievement': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Activity</Text>
          <Text style={styles.headerSubtitle}>Your fitness journey</Text>
        </View>
        
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive,
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <SlideInView direction="up" delay={100}>
          <View style={styles.statsContainer}>
            <View style={styles.mainStatCard}>
              <Text style={styles.mainStatIcon}>🔥</Text>
              <Text style={styles.mainStatValue}>{weeklyStats.streak}</Text>
              <Text style={styles.mainStatLabel}>Day Streak</Text>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{weeklyStats.workouts}</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{formatDuration(weeklyStats.totalMinutes)}</Text>
                <Text style={styles.statLabel}>Total Time</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{weeklyStats.calories.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{weeklyStats.prs}</Text>
                <Text style={styles.statLabel}>PRs</Text>
              </View>
            </View>
          </View>
        </SlideInView>

        {/* Weekly Progress Bar */}
        <SlideInView direction="up" delay={200}>
          <View style={styles.weeklyProgress}>
            <Text style={styles.sectionTitle}>Weekly Goal</Text>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {weeklyStats.workouts} of 5 workouts
              </Text>
              <Text style={styles.progressPercent}>
                {Math.round((weeklyStats.workouts / 5) * 100)}%
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${Math.min((weeklyStats.workouts / 5) * 100, 100)}%` }
                ]} 
              />
            </View>
            <View style={styles.weekDays}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <View key={index} style={styles.weekDay}>
                  <View style={[
                    styles.weekDayDot,
                    index < weeklyStats.workouts && styles.weekDayDotActive,
                    index === new Date().getDay() - 1 && styles.weekDayDotToday,
                  ]} />
                  <Text style={styles.weekDayText}>{day}</Text>
                </View>
              ))}
            </View>
          </View>
        </SlideInView>

        {/* Activity Feed */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          {activities.map((activity, index) => (
            <SlideInView key={activity.id} direction="right" delay={300 + index * 50}>
              <TouchableOpacity style={styles.activityCard} activeOpacity={0.7}>
                <View style={[
                  styles.activityIconContainer,
                  { backgroundColor: `${getActivityColor(activity.type)}15` }
                ]}>
                  <Text style={styles.activityIcon}>{activity.icon}</Text>
                </View>
                
                <View style={styles.activityContent}>
                  <View style={styles.activityHeader}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityTime}>{formatTimeAgo(activity.timestamp)}</Text>
                  </View>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                  
                  {(activity.duration || activity.calories) && (
                    <View style={styles.activityMeta}>
                      {activity.duration && (
                        <View style={styles.metaItem}>
                          <Text style={styles.metaIcon}>⏱️</Text>
                          <Text style={styles.metaText}>{formatDuration(activity.duration)}</Text>
                        </View>
                      )}
                      {activity.calories && (
                        <View style={styles.metaItem}>
                          <Text style={styles.metaIcon}>🔥</Text>
                          <Text style={styles.metaText}>{activity.calories} cal</Text>
                        </View>
                      )}
                    </View>
                  )}
                  
                  {activity.stats && (
                    <View style={styles.activityStats}>
                      {activity.stats.map((stat, i) => (
                        <View key={i} style={styles.activityStatItem}>
                          <Text style={styles.activityStatValue}>{stat.value}</Text>
                          <Text style={styles.activityStatLabel}>{stat.label}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                
                <View style={[
                  styles.activityAccent,
                  { backgroundColor: getActivityColor(activity.type) }
                ]} />
              </TouchableOpacity>
            </SlideInView>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 4,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  periodButtonTextActive: {
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    padding: 20,
  },
  mainStatCard: {
    backgroundColor: '#10b981',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  mainStatIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  mainStatValue: {
    fontSize: 56,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -2,
  },
  mainStatLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  weeklyProgress: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  weekDay: {
    alignItems: 'center',
  },
  weekDayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginBottom: 6,
  },
  weekDayDotActive: {
    backgroundColor: '#10b981',
  },
  weekDayDotToday: {
    borderWidth: 2,
    borderColor: '#10b981',
  },
  weekDayText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  activitySection: {
    paddingHorizontal: 20,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityIconContainer: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  activityIcon: {
    fontSize: 24,
  },
  activityContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 0,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 8,
  },
  activityDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  activityMeta: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  activityStats: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 16,
  },
  activityStatItem: {
    alignItems: 'center',
  },
  activityStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  activityStatLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  activityAccent: {
    width: 4,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  bottomPadding: {
    height: 100,
  },
});

export default ActivityScreen;

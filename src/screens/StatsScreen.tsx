import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useAuth } from '../services/auth';
import { SlideInView } from '../components/AnimatedComponents';

const { width } = Dimensions.get('window');
const CHART_HEIGHT = 200;

interface StatsData {
  totalWorkouts: number;
  totalVolume: number;
  totalTime: number;
  totalCalories: number;
  avgWorkoutDuration: number;
  bestStreak: number;
  currentStreak: number;
  totalPRs: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
}

interface ChartData {
  label: string;
  value: number;
}

const StatsScreen = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [stats, setStats] = useState<StatsData>({
    totalWorkouts: 0,
    totalVolume: 0,
    totalTime: 0,
    totalCalories: 0,
    avgWorkoutDuration: 0,
    bestStreak: 0,
    currentStreak: 0,
    totalPRs: 0,
    workoutsThisWeek: 0,
    workoutsThisMonth: 0,
  });
  const [weeklyData, setWeeklyData] = useState<ChartData[]>([]);
  const [monthlyData, setMonthlyData] = useState<ChartData[]>([]);
  const barAnimations = useRef<Animated.Value[]>([]).current;

  useEffect(() => {
    loadStatsData();
  }, [user, period]);

  const loadStatsData = async () => {
    // Mock data - replace with actual API calls
    setStats({
      totalWorkouts: 156,
      totalVolume: 892450,
      totalTime: 9840, // minutes
      totalCalories: 124500,
      avgWorkoutDuration: 63,
      bestStreak: 21,
      currentStreak: 7,
      totalPRs: 34,
      workoutsThisWeek: 5,
      workoutsThisMonth: 18,
    });

    const weekly: ChartData[] = [
      { label: 'Mon', value: 75 },
      { label: 'Tue', value: 62 },
      { label: 'Wed', value: 0 },
      { label: 'Thu', value: 80 },
      { label: 'Fri', value: 58 },
      { label: 'Sat', value: 90 },
      { label: 'Sun', value: 0 },
    ];

    const monthly: ChartData[] = [
      { label: 'W1', value: 4 },
      { label: 'W2', value: 5 },
      { label: 'W3', value: 4 },
      { label: 'W4', value: 5 },
    ];

    setWeeklyData(weekly);
    setMonthlyData(monthly);

    // Animate bars
    weekly.forEach((_, index) => {
      if (!barAnimations[index]) {
        barAnimations[index] = new Animated.Value(0);
      }
      Animated.spring(barAnimations[index], {
        toValue: 1,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes % 60}m`;
  };

  const getMaxValue = (data: ChartData[]): number => {
    return Math.max(...data.map(d => d.value), 1);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistics</Text>
        <Text style={styles.headerSubtitle}>Your fitness analytics</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <SlideInView direction="up" delay={100}>
          <View style={styles.periodContainer}>
            {(['week', 'month', 'year', 'all'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.periodBtn, period === p && styles.periodBtnActive]}
                onPress={() => setPeriod(p)}
              >
                <Text style={[styles.periodBtnText, period === p && styles.periodBtnTextActive]}>
                  {p === 'all' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SlideInView>

        {/* Main Stats Grid */}
        <SlideInView direction="up" delay={200}>
          <View style={styles.mainStatsContainer}>
            <View style={styles.bigStatCard}>
              <View style={styles.bigStatHeader}>
                <Text style={styles.bigStatIcon}>🏋️</Text>
                <Text style={styles.bigStatLabel}>Total Workouts</Text>
              </View>
              <Text style={styles.bigStatValue}>{stats.totalWorkouts}</Text>
              <View style={styles.bigStatFooter}>
                <Text style={styles.statTrend}>↑ 12%</Text>
                <Text style={styles.statTrendLabel}>vs last month</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, styles.statCardPrimary]}>
                <Text style={styles.statCardIcon}>🔥</Text>
                <Text style={styles.statCardValue}>{stats.currentStreak}</Text>
                <Text style={styles.statCardLabel}>Day Streak</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statCardIcon}>🏆</Text>
                <Text style={styles.statCardValue}>{stats.totalPRs}</Text>
                <Text style={styles.statCardLabel}>Total PRs</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statCardIcon}>⚡</Text>
                <Text style={styles.statCardValue}>{formatNumber(stats.totalVolume)}</Text>
                <Text style={styles.statCardLabel}>Total Volume (lbs)</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statCardIcon}>⏱️</Text>
                <Text style={styles.statCardValue}>{formatDuration(stats.totalTime)}</Text>
                <Text style={styles.statCardLabel}>Total Time</Text>
              </View>
            </View>
          </View>
        </SlideInView>

        {/* Weekly Chart */}
        <SlideInView direction="up" delay={300}>
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Workout Duration</Text>
              <Text style={styles.chartSubtitle}>This Week</Text>
            </View>
            
            <View style={styles.chartContainer}>
              {weeklyData.map((item, index) => {
                const maxVal = getMaxValue(weeklyData);
                const barHeight = maxVal > 0 ? (item.value / maxVal) * (CHART_HEIGHT - 40) : 0;
                const animValue = barAnimations[index] || new Animated.Value(1);
                
                return (
                  <View key={item.label} style={styles.barContainer}>
                    <Animated.View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: item.value > 0 ? '#10b981' : '#e5e7eb',
                          transform: [{ scaleY: animValue }],
                        },
                      ]}
                    />
                    <Text style={styles.barLabel}>{item.label}</Text>
                    {item.value > 0 && (
                      <Text style={styles.barValue}>{item.value}m</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </SlideInView>

        {/* Monthly Progress */}
        <SlideInView direction="up" delay={400}>
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Monthly Progress</Text>
              <Text style={styles.chartSubtitle}>Workouts per week</Text>
            </View>
            
            <View style={styles.horizontalBarsContainer}>
              {monthlyData.map((item, index) => {
                const maxVal = Math.max(...monthlyData.map(d => d.value), 1);
                const barWidth = (item.value / maxVal) * 100;
                
                return (
                  <View key={item.label} style={styles.horizontalBarRow}>
                    <Text style={styles.horizontalBarLabel}>{item.label}</Text>
                    <View style={styles.horizontalBarBg}>
                      <Animated.View
                        style={[
                          styles.horizontalBarFill,
                          { width: `${barWidth}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.horizontalBarValue}>{item.value}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </SlideInView>

        {/* Achievements Overview */}
        <SlideInView direction="up" delay={500}>
          <View style={styles.achievementsCard}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementsGrid}>
              {[
                { icon: '💪', label: 'Iron Will', desc: '30-day streak', unlocked: true },
                { icon: '🏆', label: 'PR Master', desc: '10 new PRs', unlocked: true },
                { icon: '⚡', label: 'Power Lifter', desc: '100K volume', unlocked: true },
                { icon: '🔥', label: 'Inferno', desc: '50K calories', unlocked: false },
                { icon: '🎯', label: 'Consistency', desc: '100 workouts', unlocked: true },
                { icon: '⭐', label: 'Elite', desc: 'Top 1% gym', unlocked: false },
              ].map((achievement, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.achievementItem,
                    !achievement.unlocked && styles.achievementLocked,
                  ]}
                >
                  <Text style={[
                    styles.achievementIcon,
                    !achievement.unlocked && styles.achievementIconLocked,
                  ]}>
                    {achievement.icon}
                  </Text>
                  <Text style={styles.achievementLabel}>{achievement.label}</Text>
                  <Text style={styles.achievementDesc}>{achievement.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </SlideInView>

        {/* Personal Bests */}
        <SlideInView direction="up" delay={600}>
          <View style={styles.personalBestsCard}>
            <Text style={styles.sectionTitle}>Personal Bests</Text>
            {[
              { exercise: 'Bench Press', value: '225 lbs', date: 'Dec 14' },
              { exercise: 'Squat', value: '315 lbs', date: 'Dec 10' },
              { exercise: 'Deadlift', value: '365 lbs', date: 'Dec 8' },
              { exercise: 'Pull-ups', value: '25 reps', date: 'Dec 12' },
            ].map((pr, index) => (
              <View key={index} style={styles.prRow}>
                <View style={styles.prInfo}>
                  <Text style={styles.prExercise}>{pr.exercise}</Text>
                  <Text style={styles.prDate}>{pr.date}</Text>
                </View>
                <Text style={styles.prValue}>{pr.value}</Text>
              </View>
            ))}
          </View>
        </SlideInView>

        {/* Comparison Card */}
        <SlideInView direction="up" delay={700}>
          <View style={styles.comparisonCard}>
            <Text style={styles.sectionTitle}>You vs Average</Text>
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonLabel}>Workouts/Week</Text>
                <Text style={styles.comparisonYou}>5.2</Text>
                <Text style={styles.comparisonAvg}>vs 3.4 avg</Text>
              </View>
              <View style={styles.comparisonDivider} />
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonLabel}>Avg Duration</Text>
                <Text style={styles.comparisonYou}>63m</Text>
                <Text style={styles.comparisonAvg}>vs 48m avg</Text>
              </View>
              <View style={styles.comparisonDivider} />
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonLabel}>Monthly PRs</Text>
                <Text style={styles.comparisonYou}>4.2</Text>
                <Text style={styles.comparisonAvg}>vs 1.8 avg</Text>
              </View>
            </View>
            <View style={styles.percentileBadge}>
              <Text style={styles.percentileText}>Top 15% of all members 🌟</Text>
            </View>
          </View>
        </SlideInView>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
  scrollView: {
    flex: 1,
  },
  periodContainer: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  periodBtnActive: {
    backgroundColor: '#10b981',
  },
  periodBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  periodBtnTextActive: {
    color: '#fff',
  },
  mainStatsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  bigStatCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  bigStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bigStatIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  bigStatLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  bigStatValue: {
    fontSize: 56,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -2,
  },
  bigStatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statTrend: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
    marginRight: 6,
  },
  statTrendLabel: {
    fontSize: 13,
    color: '#9ca3af',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardPrimary: {
    backgroundColor: '#10b981',
  },
  statCardIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  statCardLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  chartSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
    paddingTop: 20,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 28,
    borderRadius: 8,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    fontWeight: '500',
  },
  barValue: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
    position: 'absolute',
    top: 0,
  },
  horizontalBarsContainer: {
    gap: 12,
  },
  horizontalBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalBarLabel: {
    width: 40,
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  horizontalBarBg: {
    flex: 1,
    height: 24,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  horizontalBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 12,
  },
  horizontalBarValue: {
    width: 30,
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'right',
  },
  achievementsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
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
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementItem: {
    width: (width - 76) / 3,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  achievementIconLocked: {
    opacity: 0.3,
  },
  achievementLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 2,
  },
  personalBestsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  prRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
    color: '#9ca3af',
    marginTop: 2,
  },
  prValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  comparisonCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  comparisonLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 4,
  },
  comparisonYou: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  comparisonAvg: {
    fontSize: 11,
    color: '#10b981',
    marginTop: 2,
  },
  percentileBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 16,
    alignSelf: 'center',
  },
  percentileText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#d97706',
  },
  bottomPadding: {
    height: 100,
  },
});

export default StatsScreen;

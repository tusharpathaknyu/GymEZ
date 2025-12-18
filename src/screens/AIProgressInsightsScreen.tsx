import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { buttonPress } from '../utils/haptics';

const { width } = Dimensions.get('window');

interface InsightData {
  id: string;
  type: 'achievement' | 'warning' | 'suggestion' | 'trend';
  title: string;
  message: string;
  icon: string;
  color: string;
  action?: string;
  priority: number;
}

interface WorkoutTrend {
  metric: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

// Mock user data - in real app, this would come from database
const mockUserData = {
  workoutsThisWeek: 4,
  workoutsLastWeek: 3,
  totalWorkoutsMonth: 14,
  avgWorkoutDuration: 52,
  favoriteExercises: ['Bench Press', 'Squat', 'Deadlift'],
  weakMuscleGroups: ['Shoulders', 'Calves'],
  strongMuscleGroups: ['Chest', 'Back'],
  currentStreak: 5,
  longestStreak: 12,
  lastWorkoutDate: new Date(Date.now() - 86400000), // yesterday
  recentPRs: [
    { exercise: 'Bench Press', weight: 225, date: new Date(Date.now() - 172800000) },
    { exercise: 'Squat', weight: 315, date: new Date(Date.now() - 604800000) },
  ],
  bodyWeight: [
    { weight: 180, date: new Date(Date.now() - 2592000000) },
    { weight: 178, date: new Date(Date.now() - 1728000000) },
    { weight: 177, date: new Date(Date.now() - 864000000) },
    { weight: 176, date: new Date() },
  ],
  sleepAvg: 6.5,
  waterIntakeAvg: 8,
  proteinAvg: 140,
  caloriesAvg: 2200,
  goal: 'muscle',
  experience: 'intermediate',
};

// AI Analysis Engine
const generateInsights = (): InsightData[] => {
  const insights: InsightData[] = [];
  const data = mockUserData;

  // Workout Frequency Analysis
  if (data.workoutsThisWeek > data.workoutsLastWeek) {
    insights.push({
      id: '1',
      type: 'achievement',
      title: '🔥 You\'re on fire!',
      message: `You did ${data.workoutsThisWeek} workouts this week, up from ${data.workoutsLastWeek} last week. Keep this momentum!`,
      icon: '📈',
      color: '#10b981',
      priority: 1,
    });
  } else if (data.workoutsThisWeek < data.workoutsLastWeek) {
    insights.push({
      id: '1',
      type: 'warning',
      title: 'Workout frequency dropped',
      message: `You did ${data.workoutsThisWeek} workouts this week vs ${data.workoutsLastWeek} last week. Let's get back on track!`,
      icon: '⚠️',
      color: '#f59e0b',
      action: 'Schedule a workout',
      priority: 2,
    });
  }

  // Streak Analysis
  if (data.currentStreak >= 5) {
    insights.push({
      id: '2',
      type: 'achievement',
      title: `${data.currentStreak} Day Streak! 🎯`,
      message: `Amazing consistency! You're only ${data.longestStreak - data.currentStreak} days away from your personal record.`,
      icon: '🔥',
      color: '#ef4444',
      priority: 1,
    });
  }

  // Muscle Balance Analysis
  if (data.weakMuscleGroups.length > 0) {
    insights.push({
      id: '3',
      type: 'suggestion',
      title: 'Muscle Imbalance Detected',
      message: `Your ${data.weakMuscleGroups.join(' and ')} could use more attention. Try adding targeted exercises for balanced development.`,
      icon: '⚖️',
      color: '#8b5cf6',
      action: `Train ${data.weakMuscleGroups[0]}`,
      priority: 3,
    });
  }

  // PR Analysis
  if (data.recentPRs.length > 0) {
    const latestPR = data.recentPRs[0];
    const daysSincePR = Math.floor((Date.now() - latestPR.date.getTime()) / 86400000);
    if (daysSincePR < 7) {
      insights.push({
        id: '4',
        type: 'achievement',
        title: 'Recent PR! 🏆',
        message: `You hit ${latestPR.weight}lbs on ${latestPR.exercise} ${daysSincePR} days ago. Your hard work is paying off!`,
        icon: '🏆',
        color: '#f59e0b',
        priority: 1,
      });
    }
  }

  // Weight Trend Analysis
  if (data.bodyWeight.length >= 2) {
    const firstWeight = data.bodyWeight[0].weight;
    const lastWeight = data.bodyWeight[data.bodyWeight.length - 1].weight;
    const change = firstWeight - lastWeight;
    
    if (data.goal === 'fatloss' && change > 0) {
      insights.push({
        id: '5',
        type: 'achievement',
        title: 'Weight Goal Progress! 📉',
        message: `You've lost ${change}lbs in the past month. That's sustainable, healthy progress!`,
        icon: '📉',
        color: '#10b981',
        priority: 1,
      });
    } else if (data.goal === 'muscle' && change < 0) {
      insights.push({
        id: '5',
        type: 'trend',
        title: 'Weight Tracking',
        message: `You're down ${Math.abs(change)}lbs. Make sure you're eating enough to support muscle growth.`,
        icon: '💡',
        color: '#3b82f6',
        priority: 2,
      });
    }
  }

  // Sleep Analysis
  if (data.sleepAvg < 7) {
    insights.push({
      id: '6',
      type: 'warning',
      title: 'Sleep Optimization Needed',
      message: `You're averaging ${data.sleepAvg} hours of sleep. Aim for 7-9 hours for optimal recovery and muscle growth.`,
      icon: '😴',
      color: '#6366f1',
      action: 'Set sleep reminder',
      priority: 2,
    });
  }

  // Protein Analysis
  if (data.goal === 'muscle') {
    const targetProtein = 180; // Assume target
    if (data.proteinAvg < targetProtein * 0.8) {
      insights.push({
        id: '7',
        type: 'suggestion',
        title: 'Protein Intake Low',
        message: `You're averaging ${data.proteinAvg}g protein. Try to hit ${targetProtein}g for optimal muscle growth.`,
        icon: '🥩',
        color: '#ef4444',
        action: 'Log nutrition',
        priority: 2,
      });
    }
  }

  // Rest Day Suggestion
  const daysSinceWorkout = Math.floor((Date.now() - data.lastWorkoutDate.getTime()) / 86400000);
  if (daysSinceWorkout === 0 && data.workoutsThisWeek >= 5) {
    insights.push({
      id: '8',
      type: 'suggestion',
      title: 'Consider a Rest Day',
      message: `You've trained ${data.workoutsThisWeek} times this week. Rest is when muscles grow - consider taking tomorrow off.`,
      icon: '🧘',
      color: '#14b8a6',
      priority: 3,
    });
  }

  // Workout Duration Analysis
  if (data.avgWorkoutDuration > 75) {
    insights.push({
      id: '9',
      type: 'suggestion',
      title: 'Long Workouts Detected',
      message: `Your average workout is ${data.avgWorkoutDuration} min. Consider shortening with supersets for better hormonal response.`,
      icon: '⏱️',
      color: '#8b5cf6',
      priority: 4,
    });
  }

  // Motivation boost
  if (data.totalWorkoutsMonth >= 12) {
    insights.push({
      id: '10',
      type: 'achievement',
      title: 'Consistency Champion! 👑',
      message: `${data.totalWorkoutsMonth} workouts this month! You're in the top 10% of committed athletes.`,
      icon: '👑',
      color: '#f59e0b',
      priority: 1,
    });
  }

  // Sort by priority
  return insights.sort((a, b) => a.priority - b.priority);
};

const generateTrends = (): WorkoutTrend[] => {
  return [
    { metric: 'Workouts/Week', value: '4', change: 33, trend: 'up' },
    { metric: 'Avg Duration', value: '52 min', change: 5, trend: 'up' },
    { metric: 'Body Weight', value: '176 lbs', change: -2.2, trend: 'down' },
    { metric: 'Streak', value: '5 days', change: 0, trend: 'stable' },
    { metric: 'Calories Avg', value: '2,200', change: 8, trend: 'up' },
    { metric: 'Protein Avg', value: '140g', change: -5, trend: 'down' },
  ];
};

const AIProgressInsightsScreen = ({ navigation }: { navigation: any }) => {
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [trends, setTrends] = useState<WorkoutTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'insights' | 'trends'>('insights');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    // Simulate AI analysis time
    await new Promise(resolve => setTimeout(resolve, 1500));
    setInsights(generateInsights());
    setTrends(generateTrends());
    setIsLoading(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement': return '🏆';
      case 'warning': return '⚠️';
      case 'suggestion': return '💡';
      case 'trend': return '📊';
      default: return '📌';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '→';
    }
  };

  const getTrendColor = (trend: string, metric: string) => {
    // For weight, down might be good (if losing fat)
    if (metric.includes('Weight') && mockUserData.goal === 'fatloss') {
      return trend === 'down' ? '#10b981' : '#ef4444';
    }
    // For most metrics, up is good
    if (trend === 'up') return '#10b981';
    if (trend === 'down') return '#ef4444';
    return '#6b7280';
  };

  const renderInsights = () => (
    <View style={styles.insightsList}>
      {insights.map((insight) => (
        <TouchableOpacity
          key={insight.id}
          style={[styles.insightCard, { borderLeftColor: insight.color }]}
          onPress={() => buttonPress()}
          activeOpacity={0.8}
        >
          <View style={styles.insightHeader}>
            <Text style={styles.insightIcon}>{insight.icon}</Text>
            <View style={[styles.typeBadge, { backgroundColor: insight.color + '20' }]}>
              <Text style={[styles.typeBadgeText, { color: insight.color }]}>
                {insight.type.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.insightTitle}>{insight.title}</Text>
          <Text style={styles.insightMessage}>{insight.message}</Text>
          {insight.action && (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: insight.color }]}>
              <Text style={styles.actionButtonText}>{insight.action}</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTrends = () => (
    <View style={styles.trendsContainer}>
      <View style={styles.trendsGrid}>
        {trends.map((trend, index) => (
          <View key={index} style={styles.trendCard}>
            <Text style={styles.trendMetric}>{trend.metric}</Text>
            <Text style={styles.trendValue}>{trend.value}</Text>
            <View style={styles.trendChange}>
              <Text style={[
                styles.trendChangeText,
                { color: getTrendColor(trend.trend, trend.metric) },
              ]}>
                {getTrendIcon(trend.trend)} {Math.abs(trend.change)}%
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>📊 Weekly Summary</Text>
        <Text style={styles.summaryText}>
          Based on your data, you're making solid progress! Your workout consistency 
          is improving, and you're hitting your calorie goals. Focus areas this week: 
          increase protein intake and target shoulder exercises for balanced development.
        </Text>
      </View>

      {/* Predictions Card */}
      <View style={styles.predictionsCard}>
        <Text style={styles.predictionsTitle}>🔮 AI Predictions</Text>
        <View style={styles.predictionItem}>
          <Text style={styles.predictionLabel}>Est. 1RM Bench (30 days)</Text>
          <Text style={styles.predictionValue}>235 lbs (+10 lbs)</Text>
        </View>
        <View style={styles.predictionItem}>
          <Text style={styles.predictionLabel}>Est. Body Weight (30 days)</Text>
          <Text style={styles.predictionValue}>174 lbs (-2 lbs)</Text>
        </View>
        <View style={styles.predictionItem}>
          <Text style={styles.predictionLabel}>Streak Potential</Text>
          <Text style={styles.predictionValue}>15+ days likely</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Progress Insights</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'insights' && styles.tabActive]}
          onPress={() => {
            buttonPress();
            setSelectedTab('insights');
          }}
        >
          <Text style={[styles.tabText, selectedTab === 'insights' && styles.tabTextActive]}>
            💡 Insights
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'trends' && styles.tabActive]}
          onPress={() => {
            buttonPress();
            setSelectedTab('trends');
          }}
        >
          <Text style={[styles.tabText, selectedTab === 'trends' && styles.tabTextActive]}>
            📈 Trends
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>🤖 AI is analyzing your data...</Text>
          <Text style={styles.loadingSubtext}>Finding patterns & insights</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* AI Analysis Header */}
          <View style={styles.analysisHeader}>
            <Text style={styles.analysisEmoji}>🧠</Text>
            <View style={styles.analysisInfo}>
              <Text style={styles.analysisTitle}>Personalized Analysis</Text>
              <Text style={styles.analysisSubtitle}>
                Based on {mockUserData.totalWorkoutsMonth} workouts this month
              </Text>
            </View>
          </View>

          {selectedTab === 'insights' ? renderInsights() : renderTrends()}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#374151',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    fontSize: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#10b981',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  analysisEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  analysisInfo: {
    flex: 1,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  analysisSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  insightsList: {
    padding: 16,
    gap: 12,
  },
  insightCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    borderLeftWidth: 4,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  insightIcon: {
    fontSize: 24,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  insightMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  actionButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  trendsContainer: {
    padding: 16,
  },
  trendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  trendCard: {
    width: (width - 44) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
  },
  trendMetric: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  trendValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  trendChange: {
    marginTop: 8,
  },
  trendChangeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
  predictionsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
  },
  predictionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  predictionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  predictionLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  predictionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
});

export default AIProgressInsightsScreen;

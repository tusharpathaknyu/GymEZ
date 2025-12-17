import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../services/auth';
import { SlideInView, FadeInView } from '../components/AnimatedComponents';

const { width } = Dimensions.get('window');

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  value: number;
  unit: string;
  change?: number;
  isCurrentUser?: boolean;
}

interface LeaderboardCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
}

const CATEGORIES: LeaderboardCategory[] = [
  { id: 'volume', title: 'Total Volume', icon: '⚡', description: 'Most weight lifted this month' },
  { id: 'workouts', title: 'Workouts', icon: '🏋️', description: 'Most workouts completed' },
  { id: 'streak', title: 'Streak', icon: '🔥', description: 'Longest active streak' },
  { id: 'prs', title: 'PRs', icon: '🏆', description: 'Most PRs this month' },
  { id: 'bench', title: 'Bench Press', icon: '💪', description: 'Highest bench press' },
  { id: 'squat', title: 'Squat', icon: '🦵', description: 'Highest squat' },
  { id: 'deadlift', title: 'Deadlift', icon: '🎯', description: 'Highest deadlift' },
];

const LeaderboardScreen = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('volume');
  const [selectedScope, setSelectedScope] = useState<'gym' | 'global'>('gym');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  
  const scaleAnims = useRef<Animated.Value[]>([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    loadLeaderboard();
  }, [selectedCategory, selectedScope]);

  const loadLeaderboard = async () => {
    // Mock data - replace with actual API calls
    const mockLeaderboard: LeaderboardEntry[] = [
      { rank: 1, userId: '1', name: 'Alex Thunder', value: 156420, unit: 'lbs', change: 2 },
      { rank: 2, userId: '2', name: 'Sarah Storm', value: 142890, unit: 'lbs', change: -1 },
      { rank: 3, userId: '3', name: 'Mike Power', value: 138540, unit: 'lbs', change: 1 },
      { rank: 4, userId: '4', name: 'Emily Strong', value: 125680, unit: 'lbs', change: 0 },
      { rank: 5, userId: '5', name: 'Chris Iron', value: 119450, unit: 'lbs', change: 3 },
      { rank: 6, userId: '6', name: 'You', value: 112340, unit: 'lbs', change: -2, isCurrentUser: true },
      { rank: 7, userId: '7', name: 'Jake Lift', value: 108920, unit: 'lbs', change: 1 },
      { rank: 8, userId: '8', name: 'Lisa Flex', value: 102450, unit: 'lbs', change: 0 },
      { rank: 9, userId: '9', name: 'Tom Muscle', value: 98340, unit: 'lbs', change: -1 },
      { rank: 10, userId: '10', name: 'Amy Gains', value: 94560, unit: 'lbs', change: 2 },
    ];

    // Adjust values based on category
    if (selectedCategory === 'workouts') {
      mockLeaderboard.forEach((entry, i) => {
        entry.value = 30 - i * 2;
        entry.unit = 'workouts';
      });
    } else if (selectedCategory === 'streak') {
      mockLeaderboard.forEach((entry, i) => {
        entry.value = 45 - i * 3;
        entry.unit = 'days';
      });
    } else if (selectedCategory === 'prs') {
      mockLeaderboard.forEach((entry, i) => {
        entry.value = 12 - i;
        entry.unit = 'PRs';
      });
    } else if (['bench', 'squat', 'deadlift'].includes(selectedCategory)) {
      const bases = { bench: 315, squat: 405, deadlift: 495 };
      const base = bases[selectedCategory as keyof typeof bases] || 315;
      mockLeaderboard.forEach((entry, i) => {
        entry.value = base - i * 15;
        entry.unit = 'lbs';
      });
    }

    setLeaderboard(mockLeaderboard);
    setUserRank(mockLeaderboard.find(e => e.isCurrentUser) || null);

    // Animate podium
    scaleAnims.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: 1,
        delay: index * 150,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  const formatValue = (value: number, unit: string): string => {
    if (unit === 'lbs' && value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  const getRankChange = (change?: number): { text: string; color: string } => {
    if (!change || change === 0) return { text: '—', color: '#9ca3af' };
    if (change > 0) return { text: `↑${change}`, color: '#10b981' };
    return { text: `↓${Math.abs(change)}`, color: '#ef4444' };
  };

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1: return '#fbbf24';
      case 2: return '#9ca3af';
      case 3: return '#d97706';
      default: return '#6b7280';
    }
  };

  const getRankEmoji = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  const currentCategory = CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSubtitle}>Compete with your gym community</Text>
      </View>

      {/* Scope Toggle */}
      <View style={styles.scopeContainer}>
        <TouchableOpacity
          style={[styles.scopeButton, selectedScope === 'gym' && styles.scopeButtonActive]}
          onPress={() => setSelectedScope('gym')}
        >
          <Text style={[styles.scopeButtonText, selectedScope === 'gym' && styles.scopeButtonTextActive]}>
            🏠 My Gym
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.scopeButton, selectedScope === 'global' && styles.scopeButtonActive]}
          onPress={() => setSelectedScope('global')}
        >
          <Text style={[styles.scopeButtonText, selectedScope === 'global' && styles.scopeButtonTextActive]}>
            🌍 Global
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive,
            ]}>
              {category.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Category Header */}
        <SlideInView direction="up" delay={100}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>
              {currentCategory?.icon} {currentCategory?.title}
            </Text>
            <Text style={styles.categoryDescription}>{currentCategory?.description}</Text>
          </View>
        </SlideInView>

        {/* Podium */}
        <SlideInView direction="up" delay={200}>
          <View style={styles.podiumContainer}>
            {/* Second Place */}
            {leaderboard[1] && (
              <Animated.View 
                style={[
                  styles.podiumItem, 
                  styles.podiumSecond,
                  { transform: [{ scale: scaleAnims[1] }] }
                ]}
              >
                <View style={styles.podiumAvatar}>
                  <Text style={styles.podiumAvatarText}>{leaderboard[1].name[0]}</Text>
                </View>
                <Text style={styles.podiumRank}>🥈</Text>
                <Text style={styles.podiumName} numberOfLines={1}>{leaderboard[1].name}</Text>
                <Text style={styles.podiumValue}>
                  {formatValue(leaderboard[1].value, leaderboard[1].unit)}
                </Text>
                <View style={[styles.podiumBar, styles.podiumBarSecond]} />
              </Animated.View>
            )}
            
            {/* First Place */}
            {leaderboard[0] && (
              <Animated.View 
                style={[
                  styles.podiumItem, 
                  styles.podiumFirst,
                  { transform: [{ scale: scaleAnims[0] }] }
                ]}
              >
                <View style={[styles.podiumCrown]}>
                  <Text style={styles.crownEmoji}>👑</Text>
                </View>
                <View style={[styles.podiumAvatar, styles.podiumAvatarFirst]}>
                  <Text style={styles.podiumAvatarText}>{leaderboard[0].name[0]}</Text>
                </View>
                <Text style={styles.podiumRank}>🥇</Text>
                <Text style={styles.podiumName} numberOfLines={1}>{leaderboard[0].name}</Text>
                <Text style={[styles.podiumValue, styles.podiumValueFirst]}>
                  {formatValue(leaderboard[0].value, leaderboard[0].unit)}
                </Text>
                <View style={[styles.podiumBar, styles.podiumBarFirst]} />
              </Animated.View>
            )}
            
            {/* Third Place */}
            {leaderboard[2] && (
              <Animated.View 
                style={[
                  styles.podiumItem, 
                  styles.podiumThird,
                  { transform: [{ scale: scaleAnims[2] }] }
                ]}
              >
                <View style={styles.podiumAvatar}>
                  <Text style={styles.podiumAvatarText}>{leaderboard[2].name[0]}</Text>
                </View>
                <Text style={styles.podiumRank}>🥉</Text>
                <Text style={styles.podiumName} numberOfLines={1}>{leaderboard[2].name}</Text>
                <Text style={styles.podiumValue}>
                  {formatValue(leaderboard[2].value, leaderboard[2].unit)}
                </Text>
                <View style={[styles.podiumBar, styles.podiumBarThird]} />
              </Animated.View>
            )}
          </View>
        </SlideInView>

        {/* Your Position Card */}
        {userRank && userRank.rank > 3 && (
          <SlideInView direction="up" delay={300}>
            <View style={styles.yourPositionCard}>
              <View style={styles.yourPositionLeft}>
                <View style={styles.yourRankBadge}>
                  <Text style={styles.yourRankText}>#{userRank.rank}</Text>
                </View>
                <View>
                  <Text style={styles.yourPositionLabel}>Your Position</Text>
                  <Text style={styles.yourPositionValue}>
                    {formatValue(userRank.value, userRank.unit)} {userRank.unit}
                  </Text>
                </View>
              </View>
              <View style={styles.yourPositionRight}>
                <Text style={[
                  styles.yourPositionChange,
                  { color: getRankChange(userRank.change).color }
                ]}>
                  {getRankChange(userRank.change).text}
                </Text>
                <Text style={styles.changeLabel}>vs last week</Text>
              </View>
            </View>
          </SlideInView>
        )}

        {/* Full Leaderboard */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Full Rankings</Text>
          
          {leaderboard.slice(3).map((entry, index) => (
            <SlideInView key={entry.userId} direction="right" delay={400 + index * 50}>
              <View style={[
                styles.listItem,
                entry.isCurrentUser && styles.listItemCurrentUser,
              ]}>
                <View style={styles.listRank}>
                  <Text style={[
                    styles.listRankText,
                    entry.isCurrentUser && styles.listRankTextCurrentUser,
                  ]}>
                    {entry.rank}
                  </Text>
                </View>
                
                <View style={styles.listAvatar}>
                  <Text style={styles.listAvatarText}>{entry.name[0]}</Text>
                </View>
                
                <View style={styles.listInfo}>
                  <Text style={[
                    styles.listName,
                    entry.isCurrentUser && styles.listNameCurrentUser,
                  ]}>
                    {entry.name} {entry.isCurrentUser && '(You)'}
                  </Text>
                  <Text style={styles.listValue}>
                    {formatValue(entry.value, entry.unit)} {entry.unit}
                  </Text>
                </View>
                
                <View style={styles.listChange}>
                  <Text style={[styles.listChangeText, { color: getRankChange(entry.change).color }]}>
                    {getRankChange(entry.change).text}
                  </Text>
                </View>
              </View>
            </SlideInView>
          ))}
        </View>

        {/* Motivational Footer */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationEmoji}>💪</Text>
          <Text style={styles.motivationText}>
            {userRank && userRank.rank <= 3 
              ? "You're in the top 3! Keep dominating!" 
              : `${userRank ? leaderboard[userRank.rank - 2]?.value - userRank.value : 0} ${leaderboard[0]?.unit || 'points'} to reach rank ${userRank ? userRank.rank - 1 : 1}!`}
          </Text>
        </View>

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
    backgroundColor: '#111827',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  scopeContainer: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  scopeButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  scopeButtonActive: {
    backgroundColor: '#10b981',
  },
  scopeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  scopeButtonTextActive: {
    color: '#fff',
  },
  categoryScroll: {
    backgroundColor: '#fff',
    maxHeight: 64,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#111827',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  categoryTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  categoryHeader: {
    padding: 20,
    paddingBottom: 0,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  // Podium
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  podiumItem: {
    alignItems: 'center',
    width: (width - 60) / 3,
  },
  podiumFirst: {
    marginBottom: 0,
  },
  podiumSecond: {
    marginBottom: 20,
  },
  podiumThird: {
    marginBottom: 40,
  },
  podiumCrown: {
    position: 'absolute',
    top: -30,
  },
  crownEmoji: {
    fontSize: 28,
  },
  podiumAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  podiumAvatarFirst: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fef3c7',
    borderWidth: 3,
    borderColor: '#fbbf24',
  },
  podiumAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6b7280',
  },
  podiumRank: {
    fontSize: 24,
    marginBottom: 4,
  },
  podiumName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 2,
  },
  podiumValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  podiumValueFirst: {
    fontSize: 16,
    color: '#d97706',
  },
  podiumBar: {
    width: '100%',
    borderRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  podiumBarFirst: {
    height: 80,
    backgroundColor: '#fbbf24',
  },
  podiumBarSecond: {
    height: 60,
    backgroundColor: '#9ca3af',
  },
  podiumBarThird: {
    height: 40,
    backgroundColor: '#d97706',
  },
  // Your Position Card
  yourPositionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#10b981',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  yourPositionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yourRankBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  yourRankText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  yourPositionLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  yourPositionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  yourPositionRight: {
    alignItems: 'flex-end',
  },
  yourPositionChange: {
    fontSize: 18,
    fontWeight: '700',
  },
  changeLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  // List
  listContainer: {
    padding: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  listItemCurrentUser: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  listRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
  },
  listRankTextCurrentUser: {
    color: '#10b981',
  },
  listAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  listNameCurrentUser: {
    color: '#10b981',
  },
  listValue: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  listChange: {
    paddingHorizontal: 8,
  },
  listChangeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Motivation
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
  },
  motivationEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  motivationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#92400e',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
});

export default LeaderboardScreen;

import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  ViewStyle,
  DimensionValue,
} from 'react-native';

const { width } = Dimensions.get('window');

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Animated skeleton loading placeholder
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width: skeletonWidth = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width: skeletonWidth,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

/**
 * Skeleton card for workout/activity items
 */
export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.card, style]}>
    <View style={styles.cardHeader}>
      <Skeleton width={48} height={48} borderRadius={24} />
      <View style={styles.cardHeaderText}>
        <Skeleton width={120} height={16} />
        <Skeleton width={80} height={12} style={{ marginTop: 6 }} />
      </View>
    </View>
    <Skeleton width="100%" height={14} style={{ marginTop: 12 }} />
    <Skeleton width="80%" height={14} style={{ marginTop: 6 }} />
    <View style={styles.cardFooter}>
      <Skeleton width={60} height={24} borderRadius={12} />
      <Skeleton width={60} height={24} borderRadius={12} />
      <Skeleton width={60} height={24} borderRadius={12} />
    </View>
  </View>
);

/**
 * Skeleton for stats cards row
 */
export const SkeletonStatsRow: React.FC = () => (
  <View style={styles.statsRow}>
    {[1, 2, 3].map((i) => (
      <View key={i} style={styles.statCard}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <Skeleton width={50} height={24} style={{ marginTop: 8 }} />
        <Skeleton width={60} height={12} style={{ marginTop: 4 }} />
      </View>
    ))}
  </View>
);

/**
 * Skeleton for exercise list items
 */
export const SkeletonExerciseItem: React.FC = () => (
  <View style={styles.exerciseItem}>
    <Skeleton width={56} height={56} borderRadius={12} />
    <View style={styles.exerciseInfo}>
      <Skeleton width={140} height={16} />
      <Skeleton width={100} height={12} style={{ marginTop: 6 }} />
      <View style={styles.exerciseTags}>
        <Skeleton width={50} height={20} borderRadius={10} />
        <Skeleton width={70} height={20} borderRadius={10} />
      </View>
    </View>
    <Skeleton width={24} height={24} borderRadius={12} />
  </View>
);

/**
 * Skeleton for leaderboard items
 */
export const SkeletonLeaderboardItem: React.FC<{ rank: number }> = ({ rank }) => (
  <View style={styles.leaderboardItem}>
    <View style={[styles.rankBadge, rank <= 3 && styles.topRank]}>
      <Skeleton width={20} height={20} borderRadius={10} />
    </View>
    <Skeleton width={44} height={44} borderRadius={22} />
    <View style={styles.leaderboardInfo}>
      <Skeleton width={120} height={16} />
      <Skeleton width={80} height={12} style={{ marginTop: 4 }} />
    </View>
    <Skeleton width={60} height={20} />
  </View>
);

/**
 * Full screen loading skeleton for different contexts
 */
export const SkeletonScreen: React.FC<{ type: 'feed' | 'stats' | 'exercises' | 'leaderboard' }> = ({ type }) => {
  switch (type) {
    case 'feed':
      return (
        <View style={styles.screen}>
          <SkeletonStatsRow />
          <View style={{ padding: 16, gap: 16 }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        </View>
      );
    case 'stats':
      return (
        <View style={styles.screen}>
          <View style={{ padding: 16 }}>
            <Skeleton width="100%" height={180} borderRadius={16} />
            <View style={{ marginTop: 16, gap: 12 }}>
              <Skeleton width="100%" height={100} borderRadius={12} />
              <Skeleton width="100%" height={100} borderRadius={12} />
            </View>
          </View>
        </View>
      );
    case 'exercises':
      return (
        <View style={styles.screen}>
          <View style={{ padding: 16 }}>
            <Skeleton width="100%" height={48} borderRadius={12} />
            <View style={styles.filterChips}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} width={70} height={32} borderRadius={16} />
              ))}
            </View>
            <View style={{ gap: 12, marginTop: 16 }}>
              <SkeletonExerciseItem />
              <SkeletonExerciseItem />
              <SkeletonExerciseItem />
              <SkeletonExerciseItem />
            </View>
          </View>
        </View>
      );
    case 'leaderboard':
      return (
        <View style={styles.screen}>
          <View style={{ padding: 16 }}>
            <Skeleton width="100%" height={200} borderRadius={16} />
            <View style={{ gap: 8, marginTop: 20 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonLeaderboardItem key={i} rank={i} />
              ))}
            </View>
          </View>
        </View>
      );
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  screen: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
  },
  exerciseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  exerciseTags: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRank: {
    backgroundColor: '#fef3c7',
  },
  leaderboardInfo: {
    flex: 1,
  },
});

export default {
  Skeleton,
  SkeletonCard,
  SkeletonStatsRow,
  SkeletonExerciseItem,
  SkeletonLeaderboardItem,
  SkeletonScreen,
};

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ViewStyle,
  DimensionValue,
} from 'react-native';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width: skeletonWidth = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [shimmerAnimation]);

  const opacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: skeletonWidth as DimensionValue,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Pre-built skeleton layouts

export const CardSkeleton: React.FC = () => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Skeleton width={48} height={48} borderRadius={24} />
      <View style={styles.cardHeaderText}>
        <Skeleton width={120} height={16} />
        <Skeleton width={80} height={12} style={{ marginTop: 6 }} />
      </View>
    </View>
    <Skeleton width="100%" height={100} style={{ marginTop: 12 }} />
    <View style={styles.cardFooter}>
      <Skeleton width={60} height={28} borderRadius={14} />
      <Skeleton width={60} height={28} borderRadius={14} />
      <Skeleton width={60} height={28} borderRadius={14} />
    </View>
  </View>
);

export const ListItemSkeleton: React.FC = () => (
  <View style={styles.listItem}>
    <Skeleton width={44} height={44} borderRadius={22} />
    <View style={styles.listItemContent}>
      <Skeleton width="60%" height={16} />
      <Skeleton width="40%" height={12} style={{ marginTop: 6 }} />
    </View>
  </View>
);

export const StatCardSkeleton: React.FC = () => (
  <View style={styles.statCard}>
    <Skeleton width={32} height={32} borderRadius={16} />
    <Skeleton width={50} height={24} style={{ marginTop: 8 }} />
    <Skeleton width={70} height={12} style={{ marginTop: 4 }} />
  </View>
);

export const ProfileSkeleton: React.FC = () => (
  <View style={styles.profile}>
    <Skeleton width={100} height={100} borderRadius={50} />
    <Skeleton width={150} height={20} style={{ marginTop: 16 }} />
    <Skeleton width={100} height={14} style={{ marginTop: 8 }} />
    <View style={styles.profileStats}>
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </View>
  </View>
);

export const FeedSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <View style={styles.feed}>
    {Array.from({ length: count }).map((_, index) => (
      <CardSkeleton key={index} />
    ))}
  </View>
);

export const WorkoutSkeleton: React.FC = () => (
  <View style={styles.workout}>
    <Skeleton width="100%" height={24} />
    <View style={styles.workoutStats}>
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </View>
    <Skeleton width="100%" height={120} style={{ marginTop: 16 }} />
    <View style={styles.workoutList}>
      <ListItemSkeleton />
      <ListItemSkeleton />
      <ListItemSkeleton />
    </View>
  </View>
);

// Helper component for creating custom skeleton layouts
interface SkeletonGroupProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const SkeletonGroup: React.FC<SkeletonGroupProps> = ({ children, style }) => (
  <View style={[styles.group, style]}>{children}</View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e5e7eb',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  profile: {
    alignItems: 'center',
    padding: 20,
  },
  profileStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  feed: {
    padding: 16,
  },
  workout: {
    padding: 16,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  workoutList: {
    marginTop: 16,
  },
  group: {
    gap: 8,
  },
});

export default Skeleton;

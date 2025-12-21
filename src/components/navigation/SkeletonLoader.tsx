import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'profile' | 'workout' | 'stats';
  count?: number;
}

// Animated shimmer effect component
const ShimmerEffect: React.FC<{ style?: any; children?: React.ReactNode }> = ({ style, children }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={[styles.shimmerContainer, style]}>
      <Animated.View
        style={[
          styles.shimmerOverlay,
          {
            transform: [{ translateX }],
          },
        ]}
      />
      {children}
    </View>
  );
};

// Card Skeleton
const CardSkeleton: React.FC = () => (
  <ShimmerEffect style={styles.cardSkeleton}>
    <View style={styles.cardHeader}>
      <View style={styles.avatarSkeleton} />
      <View style={styles.cardHeaderText}>
        <View style={styles.titleSkeleton} />
        <View style={styles.subtitleSkeleton} />
      </View>
    </View>
    <View style={styles.cardBody}>
      <View style={styles.lineSkeleton} />
      <View style={styles.lineSkeletonShort} />
    </View>
  </ShimmerEffect>
);

// List Item Skeleton
const ListItemSkeleton: React.FC = () => (
  <ShimmerEffect style={styles.listItemSkeleton}>
    <View style={styles.listIconSkeleton} />
    <View style={styles.listContentSkeleton}>
      <View style={styles.listTitleSkeleton} />
      <View style={styles.listSubtitleSkeleton} />
    </View>
    <View style={styles.listActionSkeleton} />
  </ShimmerEffect>
);

// Profile Skeleton
const ProfileSkeleton: React.FC = () => (
  <View style={styles.profileSkeleton}>
    <ShimmerEffect style={styles.profileAvatarSkeleton} />
    <View style={styles.profileInfoSkeleton}>
      <ShimmerEffect style={styles.profileNameSkeleton} />
      <ShimmerEffect style={styles.profileBioSkeleton} />
    </View>
    <View style={styles.profileStatsSkeleton}>
      {[1, 2, 3].map((i) => (
        <ShimmerEffect key={i} style={styles.profileStatSkeleton} />
      ))}
    </View>
  </View>
);

// Workout Card Skeleton
const WorkoutSkeleton: React.FC = () => (
  <ShimmerEffect style={styles.workoutSkeleton}>
    <View style={styles.workoutHeader}>
      <View style={styles.workoutIconSkeleton} />
      <View style={styles.workoutTitleSkeleton} />
    </View>
    <View style={styles.workoutDetails}>
      <View style={styles.workoutDetailSkeleton} />
      <View style={styles.workoutDetailSkeleton} />
      <View style={styles.workoutDetailSkeleton} />
    </View>
    <View style={styles.workoutButtonSkeleton} />
  </ShimmerEffect>
);

// Stats Grid Skeleton
const StatsSkeleton: React.FC = () => (
  <View style={styles.statsGrid}>
    {[1, 2, 3, 4].map((i) => (
      <ShimmerEffect key={i} style={styles.statCardSkeleton}>
        <View style={styles.statIconSkeleton} />
        <View style={styles.statValueSkeleton} />
        <View style={styles.statLabelSkeleton} />
      </ShimmerEffect>
    ))}
  </View>
);

// Main Skeleton Loader Component
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return <CardSkeleton />;
      case 'list':
        return <ListItemSkeleton />;
      case 'profile':
        return <ProfileSkeleton />;
      case 'workout':
        return <WorkoutSkeleton />;
      case 'stats':
        return <StatsSkeleton />;
      default:
        return <CardSkeleton />;
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.skeletonItem}>
          {renderSkeleton()}
        </View>
      ))}
    </View>
  );
};

// Full Screen Loading Component
export const FullScreenLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <View style={styles.fullScreenLoader}>
      <Animated.Text style={[styles.loaderEmoji, { transform: [{ scale }] }]}>
        💪
      </Animated.Text>
      <Text style={styles.loaderTitle}>GymEZ</Text>
      <Text style={styles.loaderMessage}>{message}</Text>
    </View>
  );
};

// Inline Loading Indicator
export const InlineLoader: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ size = 'medium' }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const dotSize = size === 'small' ? 6 : size === 'medium' ? 8 : 10;
  const spacing = size === 'small' ? 4 : size === 'medium' ? 6 : 8;

  return (
    <View style={styles.inlineLoader}>
      {[0, 1, 2].map((i) => {
        const delay = i * 150;
        const translateY = bounceAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, -dotSize, 0],
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                marginHorizontal: spacing / 2,
                transform: [{ translateY }],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  skeletonItem: {
    marginBottom: 16,
  },
  shimmerContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    overflow: 'hidden',
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: '50%',
  },
  // Card Skeleton
  cardSkeleton: {
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarSkeleton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
  },
  cardHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  titleSkeleton: {
    width: '60%',
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    marginBottom: 6,
  },
  subtitleSkeleton: {
    width: '40%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  cardBody: {
    marginTop: 8,
  },
  lineSkeleton: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
  },
  lineSkeletonShort: {
    width: '70%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  // List Item Skeleton
  listItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  listIconSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  listContentSkeleton: {
    flex: 1,
    marginLeft: 12,
  },
  listTitleSkeleton: {
    width: '50%',
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e5e7eb',
    marginBottom: 6,
  },
  listSubtitleSkeleton: {
    width: '30%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  listActionSkeleton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  // Profile Skeleton
  profileSkeleton: {
    alignItems: 'center',
    padding: 24,
  },
  profileAvatarSkeleton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e5e7eb',
    marginBottom: 16,
  },
  profileInfoSkeleton: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  profileNameSkeleton: {
    width: 150,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
  },
  profileBioSkeleton: {
    width: 200,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  profileStatsSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  profileStatSkeleton: {
    width: 80,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  // Workout Skeleton
  workoutSkeleton: {
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  workoutIconSkeleton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
  },
  workoutTitleSkeleton: {
    width: 120,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
    marginLeft: 12,
  },
  workoutDetails: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  workoutDetailSkeleton: {
    width: 80,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    marginRight: 8,
  },
  workoutButtonSkeleton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statCardSkeleton: {
    width: '48%',
    margin: '1%',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  statIconSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
  },
  statValueSkeleton: {
    width: 60,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    marginBottom: 4,
  },
  statLabelSkeleton: {
    width: 80,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e5e7eb',
  },
  // Full Screen Loader
  fullScreenLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loaderEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  loaderTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10b981',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  loaderMessage: {
    fontSize: 14,
    color: '#6b7280',
  },
  // Inline Loader
  inlineLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  dot: {
    backgroundColor: '#10b981',
  },
});

export default SkeletonLoader;

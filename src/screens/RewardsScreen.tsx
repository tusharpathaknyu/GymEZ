import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { checkInService, REWARD_TIERS } from '../services/CheckInService';
import { useAuth } from '../services/auth';
import CheckInButton from '../components/CheckInButton';

const RewardsScreen = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      const [progressData, historyData] = await Promise.all([
        checkInService.getRewardProgress(user.id),
        checkInService.getCheckInHistory(user.id, 10),
      ]);

      setProgress(progressData);
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading rewards data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getMonthName = (month: number): string => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[month - 1];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  };

  const handleRedeem = () => {
    if (!progress?.currentTier) {
      Alert.alert(
        'No Discount',
        'Keep working out to earn your first discount!',
      );
      return;
    }

    Alert.alert(
      'Redeem Discount',
      `Your ${progress.currentTier.discount}% discount code will be sent to your email. Use it at checkout in our protein store!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: () => {
            Alert.alert(
              'Success!',
              'Check your email for the discount code. Valid until end of month.',
            );
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading rewards...</Text>
      </View>
    );
  }

  const maxWorkouts = REWARD_TIERS[REWARD_TIERS.length - 1].workouts;
  const progressPercentage =
    ((progress?.verifiedWorkouts || 0) / maxWorkouts) * 100;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Monthly Rewards</Text>
        <Text style={styles.subtitle}>
          {getMonthName(progress?.currentMonth || 12)}{' '}
          {progress?.currentYear || 2025}
        </Text>
      </View>

      {/* Check-In Button */}
      <CheckInButton onCheckInSuccess={loadData} onCheckOutSuccess={loadData} />

      {/* Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.workoutCount}>
          <Text style={styles.countNumber}>
            {progress?.verifiedWorkouts || 0}
          </Text>
          <Text style={styles.countLabel}>Verified Workouts</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(progressPercentage, 100)}%` },
              ]}
            />
          </View>
          <View style={styles.tiersMarkerRow}>
            {REWARD_TIERS.map(tier => (
              <View
                key={tier.label}
                style={[
                  styles.tierMarker,
                  { left: `${(tier.workouts / maxWorkouts) * 100}%` },
                ]}
              >
                <View
                  style={[
                    styles.tierDot,
                    (progress?.verifiedWorkouts || 0) >= tier.workouts &&
                      styles.tierDotActive,
                  ]}
                />
                <Text style={styles.tierWorkouts}>{tier.workouts}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Current Tier */}
        {progress?.currentTier ? (
          <View style={styles.currentTier}>
            <Text style={styles.tierLabel}>
              {progress.currentTier.label} Tier 🎖️
            </Text>
            <Text style={styles.discountText}>
              {progress.currentTier.discount}% off protein
            </Text>
          </View>
        ) : (
          <View style={styles.currentTier}>
            <Text style={styles.noTierText}>
              {progress?.nextTier
                ? `${progress.workoutsToNextTier} more workouts to unlock ${progress.nextTier.discount}% discount!`
                : 'Start working out to earn rewards!'}
            </Text>
          </View>
        )}

        {/* Next Tier */}
        {progress?.nextTier && progress?.currentTier && (
          <Text style={styles.nextTierText}>
            {progress.workoutsToNextTier} more to reach{' '}
            {progress.nextTier.label} ({progress.nextTier.discount}% off)
          </Text>
        )}
      </View>

      {/* All Tiers */}
      <View style={styles.allTiersCard}>
        <Text style={styles.sectionTitle}>Reward Tiers</Text>
        {REWARD_TIERS.map(tier => (
          <View
            key={tier.label}
            style={[
              styles.tierRow,
              (progress?.verifiedWorkouts || 0) >= tier.workouts &&
                styles.tierRowUnlocked,
            ]}
          >
            <View style={styles.tierInfo}>
              <Text
                style={[
                  styles.tierName,
                  (progress?.verifiedWorkouts || 0) >= tier.workouts &&
                    styles.tierNameUnlocked,
                ]}
              >
                {tier.label}
              </Text>
              <Text style={styles.tierRequirement}>
                {tier.workouts} workouts
              </Text>
            </View>
            <View style={styles.tierDiscount}>
              <Text
                style={[
                  styles.discountValue,
                  (progress?.verifiedWorkouts || 0) >= tier.workouts &&
                    styles.discountValueUnlocked,
                ]}
              >
                {tier.discount}% off
              </Text>
              {(progress?.verifiedWorkouts || 0) >= tier.workouts && (
                <Text style={styles.unlockedBadge}>✓</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Redeem Button */}
      {progress?.currentTier && (
        <TouchableOpacity style={styles.redeemButton} onPress={handleRedeem}>
          <Text style={styles.redeemButtonText}>
            🎁 Redeem {progress.currentTier.discount}% Discount
          </Text>
        </TouchableOpacity>
      )}

      {/* Recent Check-ins */}
      <View style={styles.historyCard}>
        <Text style={styles.sectionTitle}>Recent Check-ins</Text>
        {history.length === 0 ? (
          <Text style={styles.noHistory}>No check-ins yet. Hit the gym!</Text>
        ) : (
          history.map(checkin => (
            <View key={checkin.id} style={styles.historyItem}>
              <View style={styles.historyInfo}>
                <Text style={styles.historyGym}>
                  {checkin.gyms?.name || 'Unknown Gym'}
                </Text>
                <Text style={styles.historyDate}>
                  {formatDate(checkin.check_in_time)}
                </Text>
              </View>
              <View style={styles.historyStats}>
                {checkin.duration_minutes && (
                  <Text style={styles.historyDuration}>
                    {formatDuration(checkin.duration_minutes)}
                  </Text>
                )}
                {checkin.is_verified ? (
                  <Text style={styles.verifiedBadge}>✓ Verified</Text>
                ) : (
                  <Text style={styles.notVerifiedBadge}>
                    {checkin.check_out_time ? 'Too short' : 'In progress'}
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 How it works</Text>
        <Text style={styles.infoText}>
          • Check in when you arrive at your gym{'\n'}• Work out for at least 30
          minutes{'\n'}• Check out when you leave{'\n'}• Earn discounts on
          protein products!{'\n'}• Progress resets monthly - keep grinding!
        </Text>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutCount: {
    alignItems: 'center',
    marginBottom: 20,
  },
  countNumber: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#10b981',
  },
  countLabel: {
    fontSize: 16,
    color: '#666',
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 5,
  },
  tiersMarkerRow: {
    position: 'relative',
    height: 35,
    marginTop: 8,
  },
  tierMarker: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -12 }],
  },
  tierDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E0E0E0',
    borderWidth: 2,
    borderColor: '#fff',
  },
  tierDotActive: {
    backgroundColor: '#10b981',
  },
  tierWorkouts: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  currentTier: {
    alignItems: 'center',
    paddingTop: 10,
  },
  tierLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  discountText: {
    fontSize: 18,
    color: '#10b981',
    marginTop: 4,
    fontWeight: '600',
  },
  noTierText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  nextTierText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  allTiersCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tierRowUnlocked: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  tierInfo: {},
  tierName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999',
  },
  tierNameUnlocked: {
    color: '#2E7D32',
  },
  tierRequirement: {
    fontSize: 12,
    color: '#999',
  },
  tierDiscount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  discountValueUnlocked: {
    color: '#10b981',
  },
  unlockedBadge: {
    fontSize: 18,
    color: '#10b981',
    marginLeft: 8,
  },
  redeemButton: {
    backgroundColor: '#FF9800',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  redeemButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  noHistory: {
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyInfo: {},
  historyGym: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
  },
  historyStats: {
    alignItems: 'flex-end',
  },
  historyDuration: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  verifiedBadge: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  notVerifiedBadge: {
    fontSize: 12,
    color: '#999',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 24,
  },
  bottomPadding: {
    height: 40,
  },
});

export default RewardsScreen;

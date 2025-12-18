import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Linking,
  Dimensions,
  Clipboard,
} from 'react-native';
import { checkInService, REWARD_TIERS } from '../services/CheckInService';
import { useAuth } from '../services/auth';
import CheckInButton from '../components/CheckInButton';
import { buttonPress, successHaptic } from '../utils/haptics';

const { width } = Dimensions.get('window');

// =====================================================
// AFFILIATE PARTNER DEALS
// Sign up at these affiliate programs to get your unique links:
// - MyProtein: myprotein.com/affiliates (8-10% commission)
// - Amazon: affiliate-program.amazon.com (1-4% commission)
// - Bodybuilding.com: bodybuilding.com/affiliates (5-15% commission)
// - iHerb: iherb.com/affiliates (5-10% commission)
// =====================================================
const PARTNER_DEALS = [
  {
    id: 'myprotein',
    brand: 'MyProtein',
    logo: '🥤',
    discount: '35% OFF',
    description: 'Premium protein & supplements',
    code: 'GYMEZ35',
    // Replace with your affiliate link after signing up
    url: 'https://www.myprotein.com',
    color: '#00A0DC',
    featured: true,
    category: 'protein',
  },
  {
    id: 'amazon',
    brand: 'Amazon Fitness',
    logo: '📦',
    discount: 'Up to 40% OFF',
    description: 'Gym equipment & accessories',
    code: null,
    url: 'https://www.amazon.com/fitness',
    color: '#FF9900',
    featured: true,
    category: 'equipment',
  },
  {
    id: 'bodybuilding',
    brand: 'Bodybuilding.com',
    logo: '💪',
    discount: '15% OFF',
    description: 'Supplements & workout plans',
    code: 'GYMEZ15',
    url: 'https://www.bodybuilding.com',
    color: '#E31837',
    featured: false,
    category: 'protein',
  },
  {
    id: 'iherb',
    brand: 'iHerb',
    logo: '🌿',
    discount: '20% OFF',
    description: 'Vitamins & health products',
    code: 'GYMEZ20',
    url: 'https://www.iherb.com',
    color: '#8BC34A',
    featured: false,
    category: 'supplements',
  },
  {
    id: 'ghostlifestyle',
    brand: 'Ghost Lifestyle',
    logo: '👻',
    discount: '10% OFF',
    description: 'Legendary pre-workout & protein',
    code: 'GYMEZ10',
    url: 'https://www.ghostlifestyle.com',
    color: '#1A1A1A',
    featured: true,
    category: 'protein',
  },
  {
    id: 'transparentlabs',
    brand: 'Transparent Labs',
    logo: '🔬',
    discount: '10% OFF',
    description: 'Science-backed supplements',
    code: 'GYMEZ10',
    url: 'https://www.transparentlabs.com',
    color: '#2196F3',
    featured: false,
    category: 'supplements',
  },
  {
    id: 'gymshark',
    brand: 'Gymshark',
    logo: '🦈',
    discount: 'New Arrivals',
    description: 'Premium workout apparel',
    code: null,
    url: 'https://www.gymshark.com',
    color: '#1A1A1A',
    featured: true,
    category: 'apparel',
  },
  {
    id: 'lululemon',
    brand: 'Lululemon',
    logo: '🧘',
    discount: 'Sale Items',
    description: 'Athletic wear & accessories',
    code: null,
    url: 'https://www.lululemon.com',
    color: '#D31334',
    featured: false,
    category: 'apparel',
  },
  {
    id: 'roguefit',
    brand: 'Rogue Fitness',
    logo: '🏋️',
    discount: 'Free Shipping',
    description: 'Pro-grade gym equipment',
    code: null,
    url: 'https://www.roguefitness.com',
    color: '#C41230',
    featured: false,
    category: 'equipment',
  },
  {
    id: 'optimum',
    brand: 'Optimum Nutrition',
    logo: '⚡',
    discount: '25% OFF',
    description: 'Gold Standard Whey & more',
    code: 'GYMEZ25',
    url: 'https://www.optimumnutrition.com',
    color: '#D4AF37',
    featured: false,
    category: 'protein',
  },
];

// Weekly challenges for extra rewards
const WEEKLY_CHALLENGES = [
  {
    id: 'streak5',
    title: '5-Day Streak',
    description: 'Work out 5 days in a row',
    reward: '50 bonus points',
    icon: '🔥',
    progress: 3,
    target: 5,
  },
  {
    id: 'morning3',
    title: 'Early Bird',
    description: 'Complete 3 morning workouts (before 9 AM)',
    reward: 'Exclusive badge',
    icon: '🌅',
    progress: 1,
    target: 3,
  },
  {
    id: 'volume',
    title: 'Volume King',
    description: 'Log 10,000 lbs total volume this week',
    reward: '100 bonus points',
    icon: '👑',
    progress: 6500,
    target: 10000,
  },
];

const RewardsScreen = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [points] = useState(250); // User's reward points - will be dynamic in future
  
  const featuredDeals = PARTNER_DEALS.filter(d => d.featured);

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

  // Handle tapping on a partner deal
  const handleDealPress = async (deal: typeof PARTNER_DEALS[0]) => {
    buttonPress();
    
    if (deal.code) {
      Alert.alert(
        `${deal.brand} Discount`,
        `Use code: ${deal.code}\n\n${deal.discount} on your order!`,
        [
          { 
            text: 'Copy Code', 
            onPress: () => {
              try {
                Clipboard.setString(deal.code!);
                successHaptic();
                Alert.alert('Copied!', `Code "${deal.code}" copied to clipboard`);
              } catch (e) {
                Alert.alert('Code', deal.code!);
              }
            }
          },
          { text: 'Shop Now', onPress: () => Linking.openURL(deal.url) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      Linking.openURL(deal.url);
    }
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
    buttonPress();
    if (!progress?.currentTier) {
      Alert.alert(
        'No Discount',
        'Keep working out to earn your first discount!',
      );
      return;
    }

    successHaptic();
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
        <Text style={styles.loadingText}>Loading rewards...</Text>
      </View>
    );
  }

  const filteredDeals = selectedCategory === 'all' 
    ? PARTNER_DEALS 
    : PARTNER_DEALS.filter(d => d.category === selectedCategory);

  const maxWorkouts = REWARD_TIERS[REWARD_TIERS.length - 1].workouts;
  const progressPercentage =
    ((progress?.verifiedWorkouts || 0) / maxWorkouts) * 100;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Rewards 🎁</Text>
            <Text style={styles.subtitle}>
              {getMonthName(progress?.currentMonth || 12)}{' '}
              {progress?.currentYear || 2025}
            </Text>
          </View>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsIcon}>⭐</Text>
            <Text style={styles.pointsValue}>{points}</Text>
            <Text style={styles.pointsLabel}>pts</Text>
          </View>
        </View>
      </View>

      {/* Check-In Button */}
      <View style={styles.checkInContainer}>
        <CheckInButton onCheckInSuccess={loadData} onCheckOutSuccess={loadData} />
      </View>

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

        {/* Redeem Button Inside Card */}
        {progress?.currentTier && (
          <TouchableOpacity style={styles.redeemButtonInCard} onPress={handleRedeem}>
            <Text style={styles.redeemButtonText}>
              🎁 Redeem {progress.currentTier.discount}% Discount
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Featured Partner Deals - Horizontal Scroll */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 Featured Deals</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredScroll}
          decelerationRate="fast"
          snapToInterval={width * 0.75 + 12}
        >
          {featuredDeals.map((deal) => (
            <TouchableOpacity
              key={deal.id}
              style={[styles.featuredCard, { backgroundColor: deal.color }]}
              onPress={() => handleDealPress(deal)}
              activeOpacity={0.9}
            >
              <View style={styles.featuredContent}>
                <Text style={styles.featuredLogo}>{deal.logo}</Text>
                <View style={styles.featuredInfo}>
                  <Text style={styles.featuredBrand}>{deal.brand}</Text>
                  <Text style={styles.featuredDiscount}>{deal.discount}</Text>
                  <Text style={styles.featuredDesc}>{deal.description}</Text>
                </View>
              </View>
              {deal.code && (
                <View style={styles.codeTag}>
                  <Text style={styles.codeTagText}>Code: {deal.code}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Weekly Challenges */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>🎯 Weekly Challenges</Text>
        <View style={styles.challengesContainer}>
          {WEEKLY_CHALLENGES.map(challenge => (
            <View key={challenge.id} style={styles.challengeCard}>
              <View style={styles.challengeHeader}>
                <Text style={styles.challengeIcon}>{challenge.icon}</Text>
                <View style={styles.challengeInfo}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengeDesc}>{challenge.description}</Text>
                </View>
              </View>
              <View style={styles.challengeProgress}>
                <View style={styles.challengeProgressBar}>
                  <View 
                    style={[
                      styles.challengeProgressFill, 
                      { width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.challengeProgressText}>
                  {challenge.progress >= 1000 
                    ? `${(challenge.progress/1000).toFixed(1)}k/${(challenge.target/1000).toFixed(0)}k`
                    : `${challenge.progress}/${challenge.target}`
                  }
                </Text>
              </View>
              <View style={styles.challengeReward}>
                <Text style={styles.challengeRewardText}>🎁 {challenge.reward}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Category Filter for Partner Offers */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>🛍️ Partner Offers</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoryFilter}
          contentContainerStyle={styles.categoryFilterContent}
        >
          {['all', 'protein', 'supplements', 'apparel', 'equipment'].map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => {
                buttonPress();
                setSelectedCategory(cat);
              }}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* All Deals Grid */}
        <View style={styles.dealsGrid}>
          {filteredDeals.map(deal => (
            <TouchableOpacity
              key={deal.id}
              style={styles.dealCard}
              onPress={() => handleDealPress(deal)}
              activeOpacity={0.8}
            >
              <View style={[styles.dealLogo, { backgroundColor: deal.color + '20' }]}>
                <Text style={styles.dealLogoText}>{deal.logo}</Text>
              </View>
              <Text style={styles.dealBrand}>{deal.brand}</Text>
              <Text style={styles.dealDiscount}>{deal.discount}</Text>
              {deal.code && (
                <View style={styles.dealCodeTag}>
                  <Text style={styles.dealCodeText}>Use: {deal.code}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* All Tiers */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>🏆 Reward Tiers</Text>
        <View style={styles.allTiersCard}>
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
      </View>

      {/* Recent Check-ins */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>📍 Recent Check-ins</Text>
        <View style={styles.historyCard}>
          {history.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyIcon}>🏋️</Text>
              <Text style={styles.emptyText}>No check-ins yet</Text>
              <Text style={styles.emptySubtext}>Hit the gym to start earning!</Text>
            </View>
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
      </View>

      {/* Info */}
      <View style={styles.sectionContainer}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 How Rewards Work</Text>
          <View style={styles.infoSteps}>
            <View style={styles.infoStep}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <Text style={styles.stepText}>Check in at your gym</Text>
            </View>
            <View style={styles.infoStep}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepText}>Work out for 30+ minutes</Text>
            </View>
            <View style={styles.infoStep}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.stepText}>Check out when done</Text>
            </View>
            <View style={styles.infoStep}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
              <Text style={styles.stepText}>Earn discounts & points!</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Partner Info Banner */}
      <View style={styles.sectionContainer}>
        <View style={styles.partnerBanner}>
          <Text style={styles.partnerBannerTitle}>🤝 Become a Partner</Text>
          <Text style={styles.partnerBannerText}>
            Own a supplement brand or fitness business? Partner with GymEZ to reach our fitness community!
          </Text>
          <TouchableOpacity 
            style={styles.partnerButton}
            onPress={() => Linking.openURL('mailto:partnerships@gymez.app?subject=Partnership%20Inquiry')}
          >
            <Text style={styles.partnerButtonText}>Contact Us</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
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
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 2,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pointsIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#d97706',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#d97706',
    marginLeft: 2,
  },
  checkInContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  progressCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
    borderRadius: 16,
    overflow: 'hidden',
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
    color: '#059669',
  },
  tierRequirement: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  tierDiscount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9ca3af',
  },
  discountValueUnlocked: {
    color: '#10b981',
  },
  unlockedBadge: {
    fontSize: 16,
    color: '#10b981',
    marginLeft: 8,
  },
  redeemButton: {
    backgroundColor: '#10b981',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  redeemButtonInCard: {
    backgroundColor: '#10b981',
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  redeemButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyHistory: {
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  noHistory: {
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 20,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyInfo: {},
  historyGym: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  historyDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  historyStats: {
    alignItems: 'flex-end',
  },
  historyDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  verifiedBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    overflow: 'hidden',
  },
  notVerifiedBadge: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    padding: 20,
    borderRadius: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 24,
  },
  infoSteps: {
    gap: 12,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 14,
    color: '#1e40af',
    flex: 1,
  },
  // Section styling
  sectionContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  // Featured deals
  featuredScroll: {
    paddingRight: 16,
  },
  featuredCard: {
    width: width * 0.75,
    padding: 20,
    borderRadius: 20,
    marginRight: 12,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featuredLogo: {
    fontSize: 40,
    marginRight: 16,
  },
  featuredInfo: {
    flex: 1,
  },
  featuredBrand: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  featuredDiscount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginTop: 4,
  },
  featuredDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  codeTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
  },
  codeTagText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  // Challenges
  challengesContainer: {
    gap: 12,
  },
  challengeCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  challengeDesc: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  challengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  challengeProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  challengeProgressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  challengeProgressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    minWidth: 50,
    textAlign: 'right',
  },
  challengeReward: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  challengeRewardText: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600',
  },
  // Category filter
  categoryFilter: {
    marginBottom: 16,
    marginTop: -4,
  },
  categoryFilterContent: {
    paddingRight: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#10b981',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryTextActive: {
    color: '#fff',
  },
  // Deals grid
  dealsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dealCard: {
    width: (width - 44) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dealLogo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  dealLogoText: {
    fontSize: 28,
  },
  dealBrand: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  dealDiscount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
    marginTop: 2,
  },
  dealCodeTag: {
    marginTop: 6,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dealCodeText: {
    fontSize: 11,
    color: '#6b7280',
  },
  // Partner banner
  partnerBanner: {
    backgroundColor: '#111827',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  partnerBannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  partnerBannerText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  partnerButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  partnerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
});

export default RewardsScreen;

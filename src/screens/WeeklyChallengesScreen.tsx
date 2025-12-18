import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import { useAuth } from '../services/auth';
import { buttonPress, successHaptic } from '../utils/haptics';

const { width } = Dimensions.get('window');

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  category: 'strength' | 'cardio' | 'consistency' | 'social' | 'nutrition';
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  xpReward: number;
  coinReward: number;
  progress: number;
  target: number;
  unit: string;
  expiresIn: string;
  joined: boolean;
  completed: boolean;
  participants?: number;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  score: number;
  isCurrentUser?: boolean;
}

const CHALLENGES: Challenge[] = [
  // Daily Challenges
  {
    id: 'd1',
    title: '100 Push-ups',
    description: 'Complete 100 push-ups throughout the day',
    icon: '💪',
    type: 'daily',
    category: 'strength',
    difficulty: 'medium',
    xpReward: 50,
    coinReward: 25,
    progress: 65,
    target: 100,
    unit: 'reps',
    expiresIn: '8h',
    joined: true,
    completed: false,
  },
  {
    id: 'd2',
    title: 'Morning Warrior',
    description: 'Complete a workout before 8 AM',
    icon: '🌅',
    type: 'daily',
    category: 'consistency',
    difficulty: 'easy',
    xpReward: 30,
    coinReward: 15,
    progress: 1,
    target: 1,
    unit: 'workout',
    expiresIn: '2h',
    joined: true,
    completed: true,
  },
  {
    id: 'd3',
    title: '10K Steps',
    description: 'Walk 10,000 steps today',
    icon: '🚶',
    type: 'daily',
    category: 'cardio',
    difficulty: 'easy',
    xpReward: 40,
    coinReward: 20,
    progress: 7500,
    target: 10000,
    unit: 'steps',
    expiresIn: '8h',
    joined: true,
    completed: false,
  },
  
  // Weekly Challenges
  {
    id: 'w1',
    title: 'Iron Week',
    description: 'Complete 5 strength workouts this week',
    icon: '🏋️',
    type: 'weekly',
    category: 'strength',
    difficulty: 'medium',
    xpReward: 200,
    coinReward: 100,
    progress: 3,
    target: 5,
    unit: 'workouts',
    expiresIn: '4d',
    joined: true,
    completed: false,
    participants: 1247,
  },
  {
    id: 'w2',
    title: 'Cardio King',
    description: 'Burn 3,000 calories through cardio',
    icon: '🔥',
    type: 'weekly',
    category: 'cardio',
    difficulty: 'hard',
    xpReward: 300,
    coinReward: 150,
    progress: 1850,
    target: 3000,
    unit: 'cal',
    expiresIn: '4d',
    joined: false,
    completed: false,
    participants: 892,
  },
  {
    id: 'w3',
    title: 'Social Butterfly',
    description: 'Give high-fives to 10 gym members',
    icon: '🙌',
    type: 'weekly',
    category: 'social',
    difficulty: 'easy',
    xpReward: 150,
    coinReward: 75,
    progress: 4,
    target: 10,
    unit: 'high-fives',
    expiresIn: '4d',
    joined: true,
    completed: false,
    participants: 2341,
  },
  {
    id: 'w4',
    title: 'Perfect Nutrition',
    description: 'Log all meals for 7 days',
    icon: '🥗',
    type: 'weekly',
    category: 'nutrition',
    difficulty: 'medium',
    xpReward: 250,
    coinReward: 125,
    progress: 5,
    target: 7,
    unit: 'days',
    expiresIn: '2d',
    joined: true,
    completed: false,
    participants: 1567,
  },
  
  // Monthly Challenge
  {
    id: 'm1',
    title: 'December Destroyer',
    description: 'Complete 20 workouts this month',
    icon: '🎄',
    type: 'monthly',
    category: 'consistency',
    difficulty: 'hard',
    xpReward: 1000,
    coinReward: 500,
    progress: 14,
    target: 20,
    unit: 'workouts',
    expiresIn: '14d',
    joined: true,
    completed: false,
    participants: 5678,
  },
  
  // Special Event
  {
    id: 's1',
    title: 'Holiday Hustle',
    description: 'Special holiday challenge - Don\'t skip legs!',
    icon: '🦵',
    type: 'special',
    category: 'strength',
    difficulty: 'extreme',
    xpReward: 500,
    coinReward: 250,
    progress: 2,
    target: 4,
    unit: 'leg days',
    expiresIn: '10d',
    joined: false,
    completed: false,
    participants: 3456,
  },
];

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: 'FitnessBeast', avatar: '🦁', score: 2450 },
  { rank: 2, username: 'GymShark', avatar: '🦈', score: 2380 },
  { rank: 3, username: 'IronWolf', avatar: '🐺', score: 2290 },
  { rank: 4, username: 'You', avatar: '💪', score: 2150, isCurrentUser: true },
  { rank: 5, username: 'MuscleMan', avatar: '🏋️', score: 2080 },
  { rank: 6, username: 'CardioQueen', avatar: '👑', score: 1950 },
  { rank: 7, username: 'BeastMode', avatar: '🔥', score: 1890 },
  { rank: 8, username: 'FitFam', avatar: '🌟', score: 1820 },
];

const WeeklyChallengesScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'special'>('weekly');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challenges, setChallenges] = useState(CHALLENGES);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const joinChallenge = (challengeId: string) => {
    successHaptic();
    setChallenges(prev => prev.map(c => 
      c.id === challengeId ? { ...c, joined: true } : c
    ));
    setShowChallengeModal(false);
  };

  const getProgressColor = (progress: number, target: number) => {
    const percent = (progress / target) * 100;
    if (percent >= 100) return '#10b981';
    if (percent >= 75) return '#22c55e';
    if (percent >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      case 'extreme': return '#7c3aed';
      default: return '#6b7280';
    }
  };

  const filteredChallenges = challenges.filter(c => c.type === activeTab);

  const renderStatsHeader = () => (
    <Animated.View style={[styles.statsHeader, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>12</Text>
        <Text style={styles.statLabel}>Completed</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statCard}>
        <Text style={styles.statValue}>2,150</Text>
        <Text style={styles.statLabel}>XP Earned</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statCard}>
        <Text style={styles.statValue}>#4</Text>
        <Text style={styles.statLabel}>Rank</Text>
      </View>
    </Animated.View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      {(['daily', 'weekly', 'monthly', 'special'] as const).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.tabActive]}
          onPress={() => { buttonPress(); setActiveTab(tab); }}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
            {tab === 'special' ? '⭐' : ''} {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
          {tab === 'special' && <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderChallengeCard = (challenge: Challenge) => {
    const progressPercent = (challenge.progress / challenge.target) * 100;
    
    return (
      <TouchableOpacity
        key={challenge.id}
        style={[styles.challengeCard, challenge.completed && styles.completedCard]}
        onPress={() => {
          buttonPress();
          setSelectedChallenge(challenge);
          setShowChallengeModal(true);
        }}
        activeOpacity={0.8}
      >
        {challenge.completed && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓ DONE</Text>
          </View>
        )}
        
        <View style={styles.challengeHeader}>
          <View style={styles.challengeIconContainer}>
            <Text style={styles.challengeIcon}>{challenge.icon}</Text>
          </View>
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <Text style={styles.challengeDesc}>{challenge.description}</Text>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {challenge.progress.toLocaleString()} / {challenge.target.toLocaleString()} {challenge.unit}
            </Text>
            <Text style={styles.expiresText}>⏱ {challenge.expiresIn}</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { 
                  width: `${Math.min(progressPercent, 100)}%`,
                  backgroundColor: getProgressColor(challenge.progress, challenge.target),
                },
              ]}
            />
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.challengeFooter}>
          <View style={styles.rewardsContainer}>
            <View style={styles.reward}>
              <Text style={styles.rewardIcon}>⭐</Text>
              <Text style={styles.rewardText}>{challenge.xpReward} XP</Text>
            </View>
            <View style={styles.reward}>
              <Text style={styles.rewardIcon}>🪙</Text>
              <Text style={styles.rewardText}>{challenge.coinReward}</Text>
            </View>
          </View>
          
          <View style={styles.challengeMeta}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(challenge.difficulty) + '20' }]}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor(challenge.difficulty) }]}>
                {challenge.difficulty.toUpperCase()}
              </Text>
            </View>
            {challenge.participants && (
              <Text style={styles.participants}>👥 {challenge.participants.toLocaleString()}</Text>
            )}
          </View>
        </View>
        
        {!challenge.joined && !challenge.completed && (
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={(e) => {
              e.stopPropagation();
              joinChallenge(challenge.id);
            }}
          >
            <Text style={styles.joinButtonText}>Join Challenge</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderLeaderboard = () => (
    <View style={styles.leaderboardSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🏆 Weekly Leaderboard</Text>
        <TouchableOpacity onPress={() => buttonPress()}>
          <Text style={styles.seeAllText}>See All →</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.leaderboardCard}>
        {LEADERBOARD.slice(0, 5).map((entry) => (
          <View 
            key={entry.rank} 
            style={[
              styles.leaderboardRow,
              entry.isCurrentUser && styles.currentUserRow,
            ]}
          >
            <View style={styles.rankContainer}>
              {entry.rank <= 3 ? (
                <Text style={styles.rankMedal}>
                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                </Text>
              ) : (
                <Text style={styles.rankNumber}>#{entry.rank}</Text>
              )}
            </View>
            <Text style={styles.leaderboardAvatar}>{entry.avatar}</Text>
            <Text style={[styles.leaderboardName, entry.isCurrentUser && styles.currentUserName]}>
              {entry.username}
            </Text>
            <Text style={styles.leaderboardScore}>{entry.score.toLocaleString()} pts</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderChallengeModal = () => (
    <Modal visible={showChallengeModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.challengeModal}>
          {selectedChallenge && (
            <>
              <TouchableOpacity 
                style={styles.modalClose}
                onPress={() => setShowChallengeModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
              
              <View style={styles.modalHeader}>
                <Text style={styles.modalIcon}>{selectedChallenge.icon}</Text>
                <Text style={styles.modalTitle}>{selectedChallenge.title}</Text>
                <View style={[styles.typeBadge, { backgroundColor: selectedChallenge.type === 'special' ? '#7c3aed' : '#10b981' }]}>
                  <Text style={styles.typeBadgeText}>{selectedChallenge.type.toUpperCase()}</Text>
                </View>
              </View>
              
              <Text style={styles.modalDesc}>{selectedChallenge.description}</Text>
              
              {/* Progress */}
              <View style={styles.modalProgress}>
                <Text style={styles.modalProgressLabel}>Your Progress</Text>
                <View style={styles.modalProgressBar}>
                  <View 
                    style={[
                      styles.modalProgressFill,
                      { 
                        width: `${(selectedChallenge.progress / selectedChallenge.target) * 100}%`,
                        backgroundColor: getProgressColor(selectedChallenge.progress, selectedChallenge.target),
                      },
                    ]} 
                  />
                </View>
                <Text style={styles.modalProgressText}>
                  {selectedChallenge.progress} / {selectedChallenge.target} {selectedChallenge.unit}
                </Text>
              </View>
              
              {/* Rewards */}
              <View style={styles.modalRewards}>
                <Text style={styles.modalRewardsTitle}>Rewards</Text>
                <View style={styles.modalRewardsList}>
                  <View style={styles.modalRewardItem}>
                    <Text style={styles.modalRewardIcon}>⭐</Text>
                    <Text style={styles.modalRewardValue}>{selectedChallenge.xpReward} XP</Text>
                  </View>
                  <View style={styles.modalRewardItem}>
                    <Text style={styles.modalRewardIcon}>🪙</Text>
                    <Text style={styles.modalRewardValue}>{selectedChallenge.coinReward} Coins</Text>
                  </View>
                  <View style={styles.modalRewardItem}>
                    <Text style={styles.modalRewardIcon}>🏅</Text>
                    <Text style={styles.modalRewardValue}>Badge</Text>
                  </View>
                </View>
              </View>
              
              {/* Info */}
              <View style={styles.modalInfo}>
                <View style={styles.modalInfoItem}>
                  <Text style={styles.modalInfoLabel}>Difficulty</Text>
                  <Text style={[styles.modalInfoValue, { color: getDifficultyColor(selectedChallenge.difficulty) }]}>
                    {selectedChallenge.difficulty.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.modalInfoItem}>
                  <Text style={styles.modalInfoLabel}>Time Left</Text>
                  <Text style={styles.modalInfoValue}>{selectedChallenge.expiresIn}</Text>
                </View>
                {selectedChallenge.participants && (
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Participants</Text>
                    <Text style={styles.modalInfoValue}>{selectedChallenge.participants.toLocaleString()}</Text>
                  </View>
                )}
              </View>
              
              {/* Action Button */}
              {selectedChallenge.completed ? (
                <View style={[styles.actionButton, { backgroundColor: '#10b981' }]}>
                  <Text style={styles.actionButtonText}>✓ Completed!</Text>
                </View>
              ) : selectedChallenge.joined ? (
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
                  onPress={() => {
                    successHaptic();
                    setShowChallengeModal(false);
                    navigation.navigate('LiveWorkout');
                  }}
                >
                  <Text style={styles.actionButtonText}>Start Workout →</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => joinChallenge(selectedChallenge.id)}
                >
                  <Text style={styles.actionButtonText}>Join Challenge</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenges</Text>
        <TouchableOpacity style={styles.historyButton} onPress={() => buttonPress()}>
          <Text style={styles.historyIcon}>📜</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Header */}
        {renderStatsHeader()}
        
        {/* Tabs */}
        {renderTabs()}
        
        {/* Challenges List */}
        <View style={styles.challengesList}>
          {filteredChallenges.map(renderChallengeCard)}
        </View>
        
        {/* Leaderboard */}
        {renderLeaderboard()}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {renderChallengeModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  historyButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  historyIcon: { fontSize: 18 },
  
  // Stats Header
  statsHeader: {
    flexDirection: 'row',
    backgroundColor: '#10b981',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-around',
  },
  statCard: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  tabActive: { backgroundColor: '#1f2937', borderColor: '#1f2937' },
  tabText: { fontSize: 13, fontWeight: '500', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  newBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: '#ef4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  newBadgeText: { fontSize: 8, fontWeight: 'bold', color: '#fff' },
  
  // Challenge Card
  challengesList: { paddingHorizontal: 20 },
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  completedCard: { borderWidth: 2, borderColor: '#10b981', opacity: 0.8 },
  completedBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  completedText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  challengeHeader: { flexDirection: 'row', marginBottom: 12 },
  challengeIconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  challengeIcon: { fontSize: 24 },
  challengeInfo: { flex: 1 },
  challengeTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  challengeDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  
  // Progress
  progressSection: { marginBottom: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  expiresText: { fontSize: 11, color: '#9ca3af' },
  progressBarBg: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  
  // Footer
  challengeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rewardsContainer: { flexDirection: 'row', gap: 12 },
  reward: { flexDirection: 'row', alignItems: 'center' },
  rewardIcon: { fontSize: 12, marginRight: 4 },
  rewardText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  challengeMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  difficultyBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  difficultyText: { fontSize: 10, fontWeight: 'bold' },
  participants: { fontSize: 11, color: '#9ca3af' },
  joinButton: { backgroundColor: '#10b981', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  joinButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  
  // Leaderboard
  leaderboardSection: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  seeAllText: { fontSize: 13, color: '#10b981', fontWeight: '500' },
  leaderboardCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  leaderboardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  currentUserRow: { backgroundColor: '#ecfdf5' },
  rankContainer: { width: 32 },
  rankMedal: { fontSize: 20 },
  rankNumber: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  leaderboardAvatar: { fontSize: 20, marginRight: 12 },
  leaderboardName: { flex: 1, fontSize: 14, color: '#374151' },
  currentUserName: { fontWeight: 'bold', color: '#10b981' },
  leaderboardScore: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  challengeModal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalClose: { position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  modalCloseText: { fontSize: 16, color: '#6b7280' },
  modalHeader: { alignItems: 'center', marginBottom: 16 },
  modalIcon: { fontSize: 48, marginBottom: 8 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  typeBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#fff' },
  modalDesc: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  
  // Modal Progress
  modalProgress: { marginBottom: 20 },
  modalProgressLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  modalProgressBar: { height: 12, backgroundColor: '#f3f4f6', borderRadius: 6, overflow: 'hidden', marginBottom: 8 },
  modalProgressFill: { height: '100%', borderRadius: 6 },
  modalProgressText: { fontSize: 14, fontWeight: '600', color: '#1f2937', textAlign: 'center' },
  
  // Modal Rewards
  modalRewards: { marginBottom: 20 },
  modalRewardsTitle: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 12 },
  modalRewardsList: { flexDirection: 'row', justifyContent: 'space-around' },
  modalRewardItem: { alignItems: 'center' },
  modalRewardIcon: { fontSize: 24, marginBottom: 4 },
  modalRewardValue: { fontSize: 12, fontWeight: '600', color: '#1f2937' },
  
  // Modal Info
  modalInfo: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24, backgroundColor: '#f9fafb', borderRadius: 12, padding: 16 },
  modalInfoItem: { alignItems: 'center' },
  modalInfoLabel: { fontSize: 11, color: '#9ca3af', marginBottom: 4 },
  modalInfoValue: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  
  // Action Button
  actionButton: { backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default WeeklyChallengesScreen;

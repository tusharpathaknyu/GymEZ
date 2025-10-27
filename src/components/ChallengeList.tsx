import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal
} from 'react-native';
import { ChallengeService } from '../services/challengeService';
import type { Challenge, UserChallenge } from '../types';

interface ChallengeListProps {
  onChallengeJoin?: (challenge: Challenge) => void;
}

export const ChallengeList: React.FC<ChallengeListProps> = ({ onChallengeJoin }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'my_challenges'>('available');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadChallenges();
    loadUserChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const challengeData = await ChallengeService.getChallenges({ is_active: true });
      setChallenges(challengeData);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserChallenges = async () => {
    try {
      const userChallengeData = await ChallengeService.getUserChallenges();
      setUserChallenges(userChallengeData);
    } catch (error) {
      console.error('Error loading user challenges:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadChallenges(), loadUserChallenges()]);
    setRefreshing(false);
  };

  const joinChallenge = async (challenge: Challenge) => {
    try {
      await ChallengeService.joinChallenge(challenge.id);
      Alert.alert('Success!', `You've joined the ${challenge.name} challenge!`);
      await loadUserChallenges();
      onChallengeJoin?.(challenge);
    } catch (error) {
      Alert.alert('Error', 'Failed to join challenge. You may already be participating.');
      console.error('Error joining challenge:', error);
    }
  };

  const isUserInChallenge = (challengeId: string): boolean => {
    return userChallenges.some(uc => uc.challenge_id === challengeId);
  };

  const getUserProgress = (challengeId: string): number => {
    const userChallenge = userChallenges.find(uc => uc.challenge_id === challengeId);
    return userChallenge?.current_progress || 0;
  };

  const getChallengeTypeIcon = (type: Challenge['challenge_type']): string => {
    switch (type) {
      case 'pr_based': return '🏆';
      case 'consistency': return '📅';
      case 'total_volume': return '💪';
      case 'specific_exercise': return '🎯';
      case 'duration': return '⏱️';
      default: return '🔥';
    }
  };

  const getChallengeTypeColor = (type: Challenge['challenge_type']): string => {
    switch (type) {
      case 'pr_based': return '#FFD700';
      case 'consistency': return '#32D74B';
      case 'total_volume': return '#FF3B30';
      case 'specific_exercise': return '#007AFF';
      case 'duration': return '#AF52DE';
      default: return '#8E8E93';
    }
  };

  const formatTimeRemaining = (endDate: string): string => {
    const end = new Date(endDate);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (days <= 0) return 'Expired';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  const getProgressPercentage = (current: number, target?: number): number => {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const renderChallengeCard = ({ item }: { item: Challenge }) => {
    const challenge = item;
    const isJoined = isUserInChallenge(challenge.id);
    const progress = getUserProgress(challenge.id);
    const progressPercentage = getProgressPercentage(progress, challenge.target_value);

    return (
      <TouchableOpacity
        style={styles.challengeCard}
        onPress={() => {
          setSelectedChallenge(challenge);
          setShowDetails(true);
        }}
      >
        <View style={styles.challengeHeader}>
          <View style={styles.challengeTypeContainer}>
            <View style={[
              styles.challengeTypeBadge,
              { backgroundColor: getChallengeTypeColor(challenge.challenge_type) }
            ]}>
              <Text style={styles.challengeTypeIcon}>
                {getChallengeTypeIcon(challenge.challenge_type)}
              </Text>
            </View>
            <Text style={styles.challengeType}>
              {challenge.challenge_type.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.rewardContainer}>
            <Text style={styles.rewardPoints}>🪙 {challenge.reward_points}</Text>
          </View>
        </View>

        <Text style={styles.challengeName}>{challenge.name}</Text>
        <Text style={styles.challengeDescription} numberOfLines={2}>
          {challenge.description}
        </Text>

        <View style={styles.challengeDetails}>
          <View style={styles.targetContainer}>
            <Text style={styles.targetLabel}>Target:</Text>
            <Text style={styles.targetValue}>
              {challenge.target_value} {challenge.target_unit}
            </Text>
          </View>
          
          <Text style={styles.timeRemaining}>
            {challenge.end_date && formatTimeRemaining(challenge.end_date)}
          </Text>
        </View>

        {isJoined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Your Progress</Text>
              <Text style={styles.progressText}>
                {progress} / {challenge.target_value} {challenge.target_unit}
              </Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercentage}%` }
                ]}
              />
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.actionButton,
            isJoined ? styles.joinedButton : styles.joinButton
          ]}
          onPress={() => !isJoined && joinChallenge(challenge)}
          disabled={isJoined}
        >
          <Text style={[
            styles.actionButtonText,
            isJoined ? styles.joinedButtonText : styles.joinButtonText
          ]}>
            {isJoined ? '✅ Joined' : '🚀 Join Challenge'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderUserChallenge = ({ item: userChallenge }: { item: UserChallenge }) => {
    const challenge = userChallenge.challenge;
    if (!challenge) return null;

    const progressPercentage = getProgressPercentage(
      userChallenge.current_progress,
      challenge.target_value
    );
    const isCompleted = userChallenge.is_completed;

    return (
      <View style={[
        styles.challengeCard,
        isCompleted && styles.completedChallenge
      ]}>
        <View style={styles.challengeHeader}>
          <View style={styles.challengeTypeContainer}>
            <View style={[
              styles.challengeTypeBadge,
              { backgroundColor: getChallengeTypeColor(challenge.challenge_type) }
            ]}>
              <Text style={styles.challengeTypeIcon}>
                {getChallengeTypeIcon(challenge.challenge_type)}
              </Text>
            </View>
          </View>
          
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>✅ COMPLETED</Text>
            </View>
          )}
        </View>

        <Text style={styles.challengeName}>{challenge.name}</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressText}>
              {userChallenge.current_progress} / {challenge.target_value} {challenge.target_unit}
            </Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill,
                { width: `${progressPercentage}%` },
                isCompleted && styles.completedProgressBar
              ]}
            />
          </View>
          <Text style={styles.progressPercentage}>
            {Math.round(progressPercentage)}% Complete
          </Text>
        </View>

        {userChallenge.rank_position && (
          <View style={styles.rankContainer}>
            <Text style={styles.rankText}>
              🏆 Rank #{userChallenge.rank_position}
            </Text>
          </View>
        )}

        <Text style={styles.timeRemaining}>
          {challenge.end_date && formatTimeRemaining(challenge.end_date)}
        </Text>
      </View>
    );
  };

  const ChallengeDetailsModal = () => {
    if (!selectedChallenge) return null;

    const isJoined = isUserInChallenge(selectedChallenge.id);
    const progress = getUserProgress(selectedChallenge.id);

    return (
      <Modal
        visible={showDetails}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Challenge Details</Text>
            <TouchableOpacity
              onPress={() => setShowDetails(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.challengeTypeContainer}>
              <View style={[
                styles.challengeTypeBadge,
                { backgroundColor: getChallengeTypeColor(selectedChallenge.challenge_type) }
              ]}>
                <Text style={styles.challengeTypeIcon}>
                  {getChallengeTypeIcon(selectedChallenge.challenge_type)}
                </Text>
              </View>
              <Text style={styles.challengeType}>
                {selectedChallenge.challenge_type.replace('_', ' ').toUpperCase()}
              </Text>
            </View>

            <Text style={styles.modalChallengeName}>{selectedChallenge.name}</Text>
            <Text style={styles.modalChallengeDescription}>{selectedChallenge.description}</Text>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Target</Text>
                <Text style={styles.detailValue}>
                  {selectedChallenge.target_value} {selectedChallenge.target_unit}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>
                  {selectedChallenge.duration_days} days
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Reward</Text>
                <Text style={styles.detailValue}>
                  🪙 {selectedChallenge.reward_points} points
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>
                  {selectedChallenge.is_global ? '🌍 Global' : '🏢 Gym Only'}
                </Text>
              </View>
            </View>

            {isJoined && (
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Your Progress</Text>
                  <Text style={styles.progressText}>
                    {progress} / {selectedChallenge.target_value} {selectedChallenge.target_unit}
                  </Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { width: `${getProgressPercentage(progress, selectedChallenge.target_value)}%` }
                    ]}
                  />
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.modalActionButton,
                isJoined ? styles.joinedButton : styles.joinButton
              ]}
              onPress={() => {
                if (!isJoined) {
                  joinChallenge(selectedChallenge);
                  setShowDetails(false);
                }
              }}
              disabled={isJoined}
            >
              <Text style={[
                styles.actionButtonText,
                isJoined ? styles.joinedButtonText : styles.joinButtonText
              ]}>
                {isJoined ? '✅ Already Joined' : '🚀 Join This Challenge'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'available' && styles.activeTab
          ]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'available' && styles.activeTabText
          ]}>
            🔥 Available ({challenges.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'my_challenges' && styles.activeTab
          ]}
          onPress={() => setActiveTab('my_challenges')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'my_challenges' && styles.activeTabText
          ]}>
            💪 My Challenges ({userChallenges.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'available' ? (
        <FlatList<Challenge>
          data={challenges}
          renderItem={renderChallengeCard}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <FlatList<UserChallenge>
          data={userChallenges}
          renderItem={renderUserChallenge}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      <ChallengeDetailsModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  completedChallenge: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#34C759',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  challengeTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeTypeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  challengeTypeIcon: {
    fontSize: 16,
  },
  challengeType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  rewardContainer: {
    backgroundColor: '#FFF3CD',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  rewardPoints: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
  },
  completedBadge: {
    backgroundColor: '#D4EDDA',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  completedBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#155724',
  },
  challengeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 16,
  },
  challengeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  targetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 4,
  },
  targetValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  timeRemaining: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FF3B30',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  completedProgressBar: {
    backgroundColor: '#34C759',
  },
  progressPercentage: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'right',
  },
  rankContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9500',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#007AFF',
  },
  joinedButton: {
    backgroundColor: '#E5E5EA',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  joinButtonText: {
    color: '#fff',
  },
  joinedButtonText: {
    color: '#8E8E93',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  modalContent: {
    padding: 20,
  },
  modalChallengeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  modalChallengeDescription: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
    marginBottom: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  detailItem: {
    width: '50%',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  modalActionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
});
import React, { useState, useEffect, useRef } from 'react';
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
import { buttonPress, successHaptic, errorHaptic } from '../../utils/haptics';

const { width } = Dimensions.get('window');

interface Character {
  name: string;
  class: string;
  level: number;
  xp: number;
  xpToLevel: number;
  stats: {
    strength: number;
    endurance: number;
    agility: number;
    willpower: number;
  };
  equipment: {
    weapon: string;
    armor: string;
    accessory: string;
  };
  avatar: string;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'main' | 'side' | 'daily';
  requirements: string;
  rewards: {
    xp: number;
    gold: number;
    item?: string;
  };
  progress: number;
  total: number;
  unlocked: boolean;
}

interface StoryChapter {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  unlockLevel: number;
}

const STORY_CHAPTERS: StoryChapter[] = [
  { id: 1, title: 'The Awakening', description: 'Begin your fitness journey', completed: true, current: false, unlockLevel: 1 },
  { id: 2, title: 'First Steps', description: 'Learn the basics of training', completed: true, current: false, unlockLevel: 3 },
  { id: 3, title: 'The Iron Temple', description: 'Discover the legendary gym', completed: false, current: true, unlockLevel: 5 },
  { id: 4, title: 'Trial of Strength', description: 'Prove your worth', completed: false, current: false, unlockLevel: 10 },
  { id: 5, title: 'The Dark Plateau', description: 'Overcome your limits', completed: false, current: false, unlockLevel: 15 },
  { id: 6, title: 'Rise of Champions', description: 'Ascend to greatness', completed: false, current: false, unlockLevel: 20 },
];

const QUESTS: Quest[] = [
  {
    id: 'main1',
    title: 'Complete 5 Workouts',
    description: 'Prove your dedication to the Iron Temple',
    type: 'main',
    requirements: 'Complete any 5 workouts',
    rewards: { xp: 500, gold: 100, item: '⚔️ Rusty Dumbbell' },
    progress: 3,
    total: 5,
    unlocked: true,
  },
  {
    id: 'main2',
    title: 'Reach Level 10',
    description: 'Grow stronger and unlock new abilities',
    type: 'main',
    requirements: 'Gain enough XP',
    rewards: { xp: 1000, gold: 250, item: '🛡️ Gym Warrior Armor' },
    progress: 7,
    total: 10,
    unlocked: true,
  },
  {
    id: 'daily1',
    title: 'Morning Training',
    description: 'Complete a workout before noon',
    type: 'daily',
    requirements: 'Workout between 6am-12pm',
    rewards: { xp: 50, gold: 20 },
    progress: 1,
    total: 1,
    unlocked: true,
  },
  {
    id: 'daily2',
    title: 'Burn 300 Calories',
    description: 'Push through the burn',
    type: 'daily',
    requirements: 'Track 300+ calories burned',
    rewards: { xp: 75, gold: 30 },
    progress: 180,
    total: 300,
    unlocked: true,
  },
  {
    id: 'side1',
    title: 'Social Warrior',
    description: 'Challenge a friend to a workout',
    type: 'side',
    requirements: 'Send a battle request',
    rewards: { xp: 100, gold: 50 },
    progress: 0,
    total: 1,
    unlocked: true,
  },
];

const SKILLS = [
  { name: 'Power Strike', icon: '💪', level: 5, description: '+10% strength bonus', unlocked: true },
  { name: 'Iron Will', icon: '🧠', level: 8, description: '+15% willpower bonus', unlocked: false },
  { name: 'Swift Step', icon: '👟', level: 12, description: '+20% agility bonus', unlocked: false },
  { name: 'Titan Form', icon: '🦾', level: 20, description: '+25% all stats', unlocked: false },
];

const FitnessRPGScreen = ({ navigation }: { navigation: any }) => {
  const [character] = useState<Character>({
    name: 'GymHero',
    class: 'Warrior',
    level: 7,
    xp: 2850,
    xpToLevel: 4000,
    stats: {
      strength: 24,
      endurance: 18,
      agility: 12,
      willpower: 15,
    },
    equipment: {
      weapon: '⚔️ Rusty Dumbbell',
      armor: '🛡️ Training Vest',
      accessory: '💍 Focus Ring',
    },
    avatar: '🧙‍♂️',
  });

  const [selectedTab, setSelectedTab] = useState<'story' | 'quests' | 'skills'>('story');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const xpAnimation = useRef(new Animated.Value(0)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // XP bar animation
    Animated.timing(xpAnimation, {
      toValue: character.xp / character.xpToLevel,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    // Glow effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnimation, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const renderStoryTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.storyHeader}>
        <Text style={styles.storyChapterLabel}>CHAPTER 3</Text>
        <Text style={styles.storyTitle}>The Iron Temple</Text>
        <Text style={styles.storyDescription}>
          Deep in the heart of the city lies the legendary Iron Temple - 
          a gym where warriors are forged through sweat and determination. 
          Your journey to become a Fitness Champion continues here...
        </Text>
      </View>

      <View style={styles.chapterList}>
        {STORY_CHAPTERS.map((chapter) => (
          <TouchableOpacity
            key={chapter.id}
            style={[
              styles.chapterItem,
              chapter.completed && styles.chapterCompleted,
              chapter.current && styles.chapterCurrent,
            ]}
            disabled={!chapter.completed && !chapter.current}
          >
            <View style={styles.chapterNumber}>
              <Text style={styles.chapterNumberText}>
                {chapter.completed ? '✓' : chapter.id}
              </Text>
            </View>
            <View style={styles.chapterInfo}>
              <Text style={[
                styles.chapterTitle,
                !chapter.completed && !chapter.current && styles.chapterLocked,
              ]}>
                {chapter.title}
              </Text>
              <Text style={styles.chapterDesc}>
                {character.level >= chapter.unlockLevel 
                  ? chapter.description 
                  : `🔒 Unlocks at Level ${chapter.unlockLevel}`}
              </Text>
            </View>
            {chapter.current && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>PLAY</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={() => buttonPress()}>
        <Text style={styles.continueButtonText}>Continue Story</Text>
        <Text style={styles.continueButtonIcon}>▶</Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuestsTab = () => (
    <View style={styles.tabContent}>
      {/* Main Quests */}
      <View style={styles.questSection}>
        <Text style={styles.questSectionTitle}>📜 Main Quests</Text>
        {QUESTS.filter(q => q.type === 'main').map(quest => (
          <View key={quest.id} style={styles.questCard}>
            <View style={styles.questHeader}>
              <Text style={styles.questTitle}>{quest.title}</Text>
              <View style={styles.questRewards}>
                <Text style={styles.questRewardText}>+{quest.rewards.xp} XP</Text>
                <Text style={styles.questRewardText}>+{quest.rewards.gold} 🪙</Text>
              </View>
            </View>
            <Text style={styles.questDescription}>{quest.description}</Text>
            <View style={styles.questProgressContainer}>
              <View style={styles.questProgressBar}>
                <View 
                  style={[
                    styles.questProgressFill, 
                    { width: `${(quest.progress / quest.total) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.questProgressText}>{quest.progress}/{quest.total}</Text>
            </View>
            {quest.rewards.item && (
              <Text style={styles.questItem}>Reward: {quest.rewards.item}</Text>
            )}
          </View>
        ))}
      </View>

      {/* Daily Quests */}
      <View style={styles.questSection}>
        <Text style={styles.questSectionTitle}>🌅 Daily Quests</Text>
        {QUESTS.filter(q => q.type === 'daily').map(quest => (
          <View key={quest.id} style={styles.questCardSmall}>
            <View style={styles.questInfo}>
              <Text style={styles.questTitleSmall}>{quest.title}</Text>
              <View style={styles.questProgressBar}>
                <View 
                  style={[
                    styles.questProgressFill, 
                    { width: `${(quest.progress / quest.total) * 100}%` }
                  ]} 
                />
              </View>
            </View>
            <View style={styles.questRewardsSmall}>
              <Text style={styles.questRewardSmall}>+{quest.rewards.xp} XP</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderSkillsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.skillsTitle}>🎯 Abilities</Text>
      <Text style={styles.skillsSubtitle}>Unlock powerful bonuses through training</Text>

      <View style={styles.skillsGrid}>
        {SKILLS.map((skill, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.skillCard,
              !skill.unlocked && styles.skillLocked,
            ]}
          >
            <Text style={styles.skillIcon}>{skill.icon}</Text>
            <Text style={[styles.skillName, !skill.unlocked && styles.skillNameLocked]}>
              {skill.name}
            </Text>
            <Text style={styles.skillLevel}>
              {skill.unlocked ? skill.description : `🔒 Lv.${skill.level}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statBoosts}>
        <Text style={styles.statBoostsTitle}>Active Bonuses</Text>
        <View style={styles.statBoostRow}>
          <Text style={styles.statBoostLabel}>💪 Strength</Text>
          <Text style={styles.statBoostValue}>+10%</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with character */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.gameTitle}>⚔️ Fitness Quest</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Character Card */}
        <View style={styles.characterCard}>
          <Animated.View 
            style={[
              styles.avatarGlow,
              { opacity: glowAnimation.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] }) }
            ]}
          />
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{character.avatar}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{character.level}</Text>
            </View>
          </View>

          <View style={styles.characterInfo}>
            <Text style={styles.characterName}>{character.name}</Text>
            <Text style={styles.characterClass}>{character.class}</Text>
            
            {/* XP Bar */}
            <View style={styles.xpContainer}>
              <View style={styles.xpBar}>
                <Animated.View 
                  style={[
                    styles.xpFill,
                    { width: xpAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })}
                  ]} 
                />
              </View>
              <Text style={styles.xpText}>{character.xp} / {character.xpToLevel} XP</Text>
            </View>
          </View>

          {/* Stats Preview */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>💪</Text>
              <Text style={styles.statValue}>{character.stats.strength}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>❤️</Text>
              <Text style={styles.statValue}>{character.stats.endurance}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⚡</Text>
              <Text style={styles.statValue}>{character.stats.agility}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🧠</Text>
              <Text style={styles.statValue}>{character.stats.willpower}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#e9456022' }]}
            onPress={() => {
              buttonPress();
              navigation.navigate('Guild');
            }}
          >
            <Text style={styles.actionIcon}>⚔️</Text>
            <Text style={styles.actionTitle}>Guild</Text>
            <Text style={styles.actionSubtitle}>Team up</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#FF6B6B22' }]}
            onPress={() => {
              buttonPress();
              navigation.navigate('BossRaid');
            }}
          >
            <Text style={styles.actionIcon}>👹</Text>
            <Text style={styles.actionTitle}>Raids</Text>
            <Text style={styles.actionSubtitle}>Boss fights</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#A78BFA22' }]}
            onPress={() => {
              buttonPress();
              navigation.navigate('BossRaid', { type: 'dungeon' });
            }}
          >
            <Text style={styles.actionIcon}>🏰</Text>
            <Text style={styles.actionTitle}>Dungeons</Text>
            <Text style={styles.actionSubtitle}>Solo PvE</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#FFD70022' }]}
            onPress={() => {
              buttonPress();
              navigation.navigate('Tournament');
            }}
          >
            <Text style={styles.actionIcon}>🏆</Text>
            <Text style={styles.actionTitle}>Compete</Text>
            <Text style={styles.actionSubtitle}>PvP Leagues</Text>
          </TouchableOpacity>
        </View>

        {/* Start Training Button */}
        <TouchableOpacity 
          style={styles.workoutButton}
          onPress={() => {
            successHaptic();
            navigation.navigate('Workouts');
          }}
        >
          <Text style={styles.workoutButtonIcon}>🏋️</Text>
          <View style={styles.workoutButtonContent}>
            <Text style={styles.workoutButtonTitle}>Start Training</Text>
            <Text style={styles.workoutButtonSubtitle}>+50-200 XP per workout</Text>
          </View>
          <Text style={styles.workoutButtonArrow}>→</Text>
        </TouchableOpacity>

        {/* Tab Navigation */}
        <View style={styles.tabBar}>
          {(['story', 'quests', 'skills'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.tabActive]}
              onPress={() => {
                buttonPress();
                setSelectedTab(tab);
              }}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                {tab === 'story' ? '📖 Story' : tab === 'quests' ? '📜 Quests' : '⚡ Skills'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {selectedTab === 'story' && renderStoryTab()}
        {selectedTab === 'quests' && renderQuestsTab()}
        {selectedTab === 'skills' && renderSkillsTab()}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Level Up Modal */}
      <Modal visible={showLevelUp} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.levelUpModal}>
            <Text style={styles.levelUpIcon}>🎉</Text>
            <Text style={styles.levelUpTitle}>LEVEL UP!</Text>
            <Text style={styles.levelUpLevel}>Level {character.level + 1}</Text>
            <Text style={styles.levelUpRewards}>+5 to all stats</Text>
            <TouchableOpacity 
              style={styles.levelUpButton}
              onPress={() => setShowLevelUp(false)}
            >
              <Text style={styles.levelUpButtonText}>Awesome!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    backgroundColor: '#16213e',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0f3460',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#fff',
  },
  headerTitle: {
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#e94560',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0f3460',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  characterCard: {
    margin: 16,
    backgroundColor: '#16213e',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e94560',
  },
  avatarGlow: {
    position: 'absolute',
    top: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e94560',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 60,
    textAlign: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#e94560',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#16213e',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
  },
  characterInfo: {
    alignItems: 'center',
    width: '100%',
  },
  characterName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  characterClass: {
    fontSize: 14,
    color: '#e94560',
    fontWeight: '600',
    marginBottom: 12,
  },
  xpContainer: {
    width: '100%',
    alignItems: 'center',
  },
  xpBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#0f3460',
    borderRadius: 6,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#ffd700',
    borderRadius: 6,
  },
  xpText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  actionCard: {
    width: '23%',
    marginHorizontal: '1%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  actionSubtitle: {
    fontSize: 9,
    color: '#888',
    marginTop: 2,
  },
  workoutButton: {
    marginHorizontal: 16,
    backgroundColor: '#e94560',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutButtonIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  workoutButtonContent: {
    flex: 1,
  },
  workoutButtonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  workoutButtonSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  workoutButtonArrow: {
    fontSize: 24,
    color: '#fff',
  },
  tabBar: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#e94560',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  storyHeader: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  storyChapterLabel: {
    fontSize: 11,
    color: '#e94560',
    fontWeight: '700',
    marginBottom: 4,
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  storyDescription: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  chapterList: {
    gap: 10,
  },
  chapterItem: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.5,
  },
  chapterCompleted: {
    opacity: 1,
  },
  chapterCurrent: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#e94560',
  },
  chapterNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0f3460',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chapterNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  chapterLocked: {
    color: '#64748b',
  },
  chapterDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  currentBadge: {
    backgroundColor: '#e94560',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  continueButton: {
    marginTop: 20,
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  continueButtonIcon: {
    fontSize: 14,
    color: '#fff',
  },
  questSection: {
    marginBottom: 20,
  },
  questSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  questCard: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  questTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  questRewards: {
    alignItems: 'flex-end',
  },
  questRewardText: {
    fontSize: 12,
    color: '#ffd700',
    fontWeight: '600',
  },
  questDescription: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 12,
  },
  questProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  questProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#0f3460',
    borderRadius: 4,
    overflow: 'hidden',
  },
  questProgressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  questProgressText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  questItem: {
    fontSize: 12,
    color: '#e94560',
    marginTop: 8,
    fontWeight: '600',
  },
  questCardSmall: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  questInfo: {
    flex: 1,
  },
  questTitleSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  questRewardsSmall: {
    marginLeft: 12,
  },
  questRewardSmall: {
    fontSize: 13,
    color: '#ffd700',
    fontWeight: '700',
  },
  skillsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  skillsSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  skillCard: {
    width: (width - 56) / 2,
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  skillLocked: {
    opacity: 0.5,
  },
  skillIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  skillNameLocked: {
    color: '#64748b',
  },
  skillLevel: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
  },
  statBoosts: {
    marginTop: 20,
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 16,
  },
  statBoostsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  statBoostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBoostLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  statBoostValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelUpModal: {
    backgroundColor: '#16213e',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffd700',
  },
  levelUpIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  levelUpTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffd700',
    marginBottom: 8,
  },
  levelUpLevel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  levelUpRewards: {
    fontSize: 14,
    color: '#10b981',
    marginBottom: 20,
  },
  levelUpButton: {
    backgroundColor: '#e94560',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
  },
  levelUpButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default FitnessRPGScreen;

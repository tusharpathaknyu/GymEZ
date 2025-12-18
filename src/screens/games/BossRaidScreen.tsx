import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buttonPress, successHaptic, errorHaptic } from '../../utils/haptics';

// Types
interface RaidBoss {
  id: string;
  name: string;
  title: string;
  emoji: string;
  level: number;
  maxHP: number;
  currentHP: number;
  attack: number;
  defense: number;
  rewards: {
    xp: number;
    coins: number;
    gems: number;
    items: string[];
  };
  mechanics: string[];
  timeLimit: number; // minutes
  minPlayers: number;
  maxPlayers: number;
  difficulty: 'Normal' | 'Hard' | 'Nightmare' | 'Mythic';
}

interface DungeonFloor {
  id: number;
  name: string;
  enemies: number;
  boss: string | null;
  rewards: { xp: number; coins: number };
  cleared: boolean;
}

interface Dungeon {
  id: string;
  name: string;
  emoji: string;
  floors: DungeonFloor[];
  difficulty: string;
  keyCost: number;
  dailyAttempts: number;
  attemptsUsed: number;
}

interface RaidParticipant {
  id: string;
  name: string;
  avatar: string;
  level: number;
  class: string;
  damage: number;
  isReady: boolean;
}

// Mock Data
const RAID_BOSSES: RaidBoss[] = [
  {
    id: '1',
    name: 'Titan of Strength',
    title: 'The Unbreakable',
    emoji: '👹',
    level: 50,
    maxHP: 1000000,
    currentHP: 750000,
    attack: 150,
    defense: 80,
    rewards: { xp: 50000, coins: 10000, gems: 100, items: ['Titan Gauntlets', 'Strength Rune'] },
    mechanics: ['Enrage at 30% HP', 'Ground Slam every 30s', 'Requires tank rotation'],
    timeLimit: 30,
    minPlayers: 4,
    maxPlayers: 8,
    difficulty: 'Hard',
  },
  {
    id: '2',
    name: 'Cardio Colossus',
    title: 'The Endless Runner',
    emoji: '🏃‍♂️',
    level: 45,
    maxHP: 800000,
    currentHP: 800000,
    attack: 120,
    defense: 60,
    rewards: { xp: 40000, coins: 8000, gems: 75, items: ['Speed Boots', 'Endurance Charm'] },
    mechanics: ['Speed increases over time', 'Must match pace phases', 'DPS check at 50%'],
    timeLimit: 25,
    minPlayers: 3,
    maxPlayers: 6,
    difficulty: 'Normal',
  },
  {
    id: '3',
    name: 'Iron Golem',
    title: 'The Immovable',
    emoji: '🤖',
    level: 60,
    maxHP: 2000000,
    currentHP: 2000000,
    attack: 200,
    defense: 150,
    rewards: { xp: 100000, coins: 25000, gems: 250, items: ['Mythic Armor', 'Iron Will Pendant', 'Legendary Weapon Crate'] },
    mechanics: ['Immune to physical 50% of time', 'Needs coordination', 'Wipe mechanic at 20%'],
    timeLimit: 45,
    minPlayers: 6,
    maxPlayers: 10,
    difficulty: 'Mythic',
  },
];

const DUNGEONS: Dungeon[] = [
  {
    id: '1',
    name: 'Training Grounds',
    emoji: '🏟️',
    difficulty: 'Easy',
    keyCost: 1,
    dailyAttempts: 5,
    attemptsUsed: 2,
    floors: [
      { id: 1, name: 'Warmup Zone', enemies: 3, boss: null, rewards: { xp: 500, coins: 100 }, cleared: true },
      { id: 2, name: 'Cardio Circuit', enemies: 5, boss: null, rewards: { xp: 750, coins: 150 }, cleared: true },
      { id: 3, name: 'Strength Hall', enemies: 4, boss: 'Mini Titan', rewards: { xp: 1500, coins: 300 }, cleared: false },
    ],
  },
  {
    id: '2',
    name: 'Iron Temple',
    emoji: '🏛️',
    difficulty: 'Medium',
    keyCost: 2,
    dailyAttempts: 3,
    attemptsUsed: 0,
    floors: [
      { id: 1, name: 'Entrance Hall', enemies: 5, boss: null, rewards: { xp: 1000, coins: 200 }, cleared: false },
      { id: 2, name: 'Weight Chamber', enemies: 6, boss: null, rewards: { xp: 1500, coins: 300 }, cleared: false },
      { id: 3, name: 'Forge Room', enemies: 5, boss: null, rewards: { xp: 1200, coins: 250 }, cleared: false },
      { id: 4, name: 'Throne Room', enemies: 3, boss: 'Iron Guardian', rewards: { xp: 5000, coins: 1000 }, cleared: false },
    ],
  },
  {
    id: '3',
    name: 'Mythic Gym',
    emoji: '⚡',
    difficulty: 'Hard',
    keyCost: 3,
    dailyAttempts: 1,
    attemptsUsed: 0,
    floors: [
      { id: 1, name: 'Lightning Grounds', enemies: 8, boss: null, rewards: { xp: 2500, coins: 500 }, cleared: false },
      { id: 2, name: 'Storm Chamber', enemies: 7, boss: 'Thunder Beast', rewards: { xp: 4000, coins: 800 }, cleared: false },
      { id: 3, name: 'Divine Arena', enemies: 6, boss: null, rewards: { xp: 3500, coins: 700 }, cleared: false },
      { id: 4, name: 'Olympus Peak', enemies: 4, boss: null, rewards: { xp: 3000, coins: 600 }, cleared: false },
      { id: 5, name: 'Zeus\'s Domain', enemies: 2, boss: 'Zeus, God of Gains', rewards: { xp: 15000, coins: 5000 }, cleared: false },
    ],
  },
];

const MOCK_PARTICIPANTS: RaidParticipant[] = [
  { id: '1', name: 'You', avatar: '😎', level: 35, class: 'Warrior', damage: 0, isReady: true },
  { id: '2', name: 'GymBeast', avatar: '💪', level: 42, class: 'Tank', damage: 0, isReady: true },
  { id: '3', name: 'IronMaiden', avatar: '🔥', level: 40, class: 'DPS', damage: 0, isReady: true },
  { id: '4', name: 'CardioKing', avatar: '🏃', level: 36, class: 'Support', damage: 0, isReady: false },
  { id: '5', name: 'LiftLord', avatar: '🏋️', level: 35, class: 'DPS', damage: 0, isReady: true },
];

const BossRaidScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState<'raids' | 'dungeons'>('raids');
  const [selectedBoss, setSelectedBoss] = useState<RaidBoss | null>(null);
  const [selectedDungeon, setSelectedDungeon] = useState<Dungeon | null>(null);
  const [isInRaid, setIsInRaid] = useState(false);
  const [raidTimer, setRaidTimer] = useState(0);
  const [participants, setParticipants] = useState<RaidParticipant[]>(MOCK_PARTICIPANTS);
  const [bossHP, setBossHP] = useState(0);
  const [showLobby, setShowLobby] = useState(false);
  const [dungeonProgress, setDungeonProgress] = useState(0);
  const [isInDungeon, setIsInDungeon] = useState(false);

  const bossShakeAnim = useRef(new Animated.Value(0)).current;
  const damageFlashAnim = useRef(new Animated.Value(0)).current;

  // Handle route params
  useEffect(() => {
    if (route.params?.type === 'dungeon') {
      setActiveTab('dungeons');
    }
  }, [route.params]);

  const startRaid = (boss: RaidBoss) => {
    buttonPress();
    setSelectedBoss(boss);
    setBossHP(boss.currentHP);
    setShowLobby(true);
  };

  const beginBattle = () => {
    const readyCount = participants.filter(p => p.isReady).length;
    if (readyCount < (selectedBoss?.minPlayers || 3)) {
      errorHaptic();
      Alert.alert('Not Enough Players', `Need at least ${selectedBoss?.minPlayers} ready players to start!`);
      return;
    }
    
    successHaptic();
    setShowLobby(false);
    setIsInRaid(true);
    setRaidTimer(selectedBoss?.timeLimit ? selectedBoss.timeLimit * 60 : 1800);
  };

  // Raid timer
  useEffect(() => {
    if (isInRaid && raidTimer > 0) {
      const timer = setInterval(() => {
        setRaidTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (raidTimer === 0 && isInRaid) {
      // Time's up - raid failed
      errorHaptic();
      Alert.alert('Raid Failed!', 'Time ran out. Better luck next time!');
      setIsInRaid(false);
    }
  }, [isInRaid, raidTimer]);

  const dealDamage = () => {
    if (!isInRaid || !selectedBoss) return;
    
    buttonPress();
    const baseDamage = Math.floor(Math.random() * 5000) + 2000;
    const critChance = Math.random();
    const isCrit = critChance > 0.8;
    const damage = isCrit ? baseDamage * 2 : baseDamage;

    // Animate boss shake
    Animated.sequence([
      Animated.timing(bossShakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(bossShakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(bossShakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
      Animated.timing(bossShakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();

    // Flash damage number
    Animated.sequence([
      Animated.timing(damageFlashAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(damageFlashAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    setBossHP(prev => {
      const newHP = Math.max(0, prev - damage);
      if (newHP === 0) {
        successHaptic();
        setTimeout(() => {
          Alert.alert(
            '🎉 VICTORY!',
            `${selectedBoss.name} has been defeated!\n\n` +
            `Rewards:\n` +
            `+${selectedBoss.rewards.xp.toLocaleString()} XP\n` +
            `+${selectedBoss.rewards.coins.toLocaleString()} Coins\n` +
            `+${selectedBoss.rewards.gems} Gems\n` +
            `Items: ${selectedBoss.rewards.items.join(', ')}`,
            [{ text: 'Claim Rewards', onPress: () => setIsInRaid(false) }]
          );
        }, 500);
      }
      return newHP;
    });

    // Update participant damage
    setParticipants(prev => prev.map((p, i) => 
      i === 0 ? { ...p, damage: p.damage + damage } : {
        ...p,
        damage: p.damage + Math.floor(Math.random() * 3000) + 1000
      }
    ));
  };

  const startDungeon = (dungeon: Dungeon) => {
    if (dungeon.attemptsUsed >= dungeon.dailyAttempts) {
      errorHaptic();
      Alert.alert('No Attempts Left', 'You have used all daily attempts. Come back tomorrow!');
      return;
    }
    buttonPress();
    setSelectedDungeon(dungeon);
    setDungeonProgress(0);
    setIsInDungeon(true);
  };

  const progressDungeon = () => {
    if (!selectedDungeon) return;
    buttonPress();
    
    const currentFloor = selectedDungeon.floors[dungeonProgress];
    if (!currentFloor) return;

    // Simulate combat
    const success = Math.random() > 0.2;
    if (success) {
      successHaptic();
      Alert.alert(
        currentFloor.boss ? `🎉 Boss Defeated: ${currentFloor.boss}!` : '✅ Floor Cleared!',
        `+${currentFloor.rewards.xp} XP\n+${currentFloor.rewards.coins} Coins`,
        [{
          text: dungeonProgress < selectedDungeon.floors.length - 1 ? 'Next Floor' : 'Complete!',
          onPress: () => {
            if (dungeonProgress < selectedDungeon.floors.length - 1) {
              setDungeonProgress(prev => prev + 1);
            } else {
              // Dungeon complete
              Alert.alert('🏆 Dungeon Complete!', 'You have conquered the dungeon!');
              setIsInDungeon(false);
              setSelectedDungeon(null);
            }
          }
        }]
      );
    } else {
      errorHaptic();
      Alert.alert('💀 Defeated!', 'You were knocked out. Try again!');
      setIsInDungeon(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderRaidBattle = () => (
    <View style={styles.battleContainer}>
      {/* Timer */}
      <View style={styles.timerContainer}>
        <Text style={[styles.timerText, raidTimer < 60 && styles.timerDanger]}>
          ⏱️ {formatTime(raidTimer)}
        </Text>
      </View>

      {/* Boss */}
      <Animated.View style={[styles.bossContainer, { transform: [{ translateX: bossShakeAnim }] }]}>
        <Text style={styles.bossEmoji}>{selectedBoss?.emoji}</Text>
        <Text style={styles.bossName}>{selectedBoss?.name}</Text>
        <Text style={styles.bossTitle}>{selectedBoss?.title}</Text>
        
        {/* HP Bar */}
        <View style={styles.bossHPContainer}>
          <View style={styles.bossHPBar}>
            <View 
              style={[
                styles.bossHPFill, 
                { width: `${(bossHP / (selectedBoss?.maxHP || 1)) * 100}%` },
                bossHP < (selectedBoss?.maxHP || 0) * 0.3 && styles.hpEnraged,
              ]} 
            />
          </View>
          <Text style={styles.bossHPText}>
            {bossHP.toLocaleString()} / {selectedBoss?.maxHP.toLocaleString()}
          </Text>
        </View>

        {/* Damage number */}
        <Animated.Text style={[styles.damageNumber, { opacity: damageFlashAnim }]}>
          -{Math.floor(Math.random() * 5000 + 2000)}!
        </Animated.Text>
      </Animated.View>

      {/* Party DPS */}
      <View style={styles.partyDPS}>
        <Text style={styles.dpsSectionTitle}>Party Damage</Text>
        {participants.slice(0, 5).map((p, index) => (
          <View key={p.id} style={styles.dpsRow}>
            <Text style={styles.dpsRank}>#{index + 1}</Text>
            <Text style={styles.dpsAvatar}>{p.avatar}</Text>
            <Text style={styles.dpsName}>{p.name}</Text>
            <Text style={styles.dpsDamage}>{p.damage.toLocaleString()}</Text>
          </View>
        ))}
      </View>

      {/* Attack Button */}
      <TouchableOpacity style={styles.attackButton} onPress={dealDamage}>
        <Text style={styles.attackButtonText}>⚔️ ATTACK!</Text>
        <Text style={styles.attackSubtext}>Complete workouts for bonus damage!</Text>
      </TouchableOpacity>

      {/* Leave Button */}
      <TouchableOpacity 
        style={styles.leaveButton}
        onPress={() => {
          buttonPress();
          Alert.alert('Leave Raid?', 'You will lose your progress.', [
            { text: 'Stay', style: 'cancel' },
            { text: 'Leave', style: 'destructive', onPress: () => setIsInRaid(false) },
          ]);
        }}
      >
        <Text style={styles.leaveText}>Leave Raid</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDungeonBattle = () => {
    const currentFloor = selectedDungeon?.floors[dungeonProgress];
    return (
      <View style={styles.dungeonBattleContainer}>
        <View style={styles.dungeonHeader}>
          <Text style={styles.dungeonTitle}>{selectedDungeon?.emoji} {selectedDungeon?.name}</Text>
          <Text style={styles.dungeonFloorText}>
            Floor {dungeonProgress + 1} / {selectedDungeon?.floors.length}
          </Text>
        </View>

        {/* Floor Info */}
        <View style={styles.floorCard}>
          <Text style={styles.floorName}>{currentFloor?.name}</Text>
          <Text style={styles.floorEnemies}>
            {currentFloor?.boss ? `🔥 BOSS: ${currentFloor.boss}` : `👾 Enemies: ${currentFloor?.enemies}`}
          </Text>
          <Text style={styles.floorRewards}>
            Rewards: {currentFloor?.rewards.xp} XP • {currentFloor?.rewards.coins} Coins
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.dungeonProgressBar}>
          {selectedDungeon?.floors.map((floor, index) => (
            <View 
              key={floor.id} 
              style={[
                styles.progressSegment,
                index < dungeonProgress && styles.progressCleared,
                index === dungeonProgress && styles.progressCurrent,
              ]}
            >
              {floor.boss && <Text style={styles.bossIndicator}>👑</Text>}
            </View>
          ))}
        </View>

        {/* Battle Button */}
        <TouchableOpacity style={styles.battleButton} onPress={progressDungeon}>
          <Text style={styles.battleButtonText}>
            {currentFloor?.boss ? '⚔️ FIGHT BOSS!' : '⚔️ CLEAR FLOOR'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.retreatButton}
          onPress={() => {
            buttonPress();
            setIsInDungeon(false);
            setSelectedDungeon(null);
          }}
        >
          <Text style={styles.retreatText}>Retreat</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRaids = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Active Raid Banner */}
      <View style={styles.activeRaidBanner}>
        <Text style={styles.bannerEmoji}>🔥</Text>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>WORLD BOSS ACTIVE</Text>
          <Text style={styles.bannerSubtitle}>Titan of Strength • 25% HP Remaining</Text>
        </View>
        <TouchableOpacity 
          style={styles.joinNowBtn}
          onPress={() => startRaid(RAID_BOSSES[0])}
        >
          <Text style={styles.joinNowText}>JOIN</Text>
        </TouchableOpacity>
      </View>

      {/* Guild Raids */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👹 Guild Raids</Text>
        {RAID_BOSSES.map((boss) => (
          <TouchableOpacity 
            key={boss.id} 
            style={styles.bossCard}
            onPress={() => startRaid(boss)}
          >
            <View style={styles.bossLeft}>
              <View style={[styles.bossIcon, {
                backgroundColor: boss.difficulty === 'Mythic' ? '#A78BFA22' :
                              boss.difficulty === 'Hard' ? '#FF6B6B22' :
                              boss.difficulty === 'Nightmare' ? '#F59E0B22' : '#4ECDC422'
              }]}>
                <Text style={{ fontSize: 36 }}>{boss.emoji}</Text>
              </View>
              <View style={styles.bossInfo}>
                <Text style={styles.bossCardName}>{boss.name}</Text>
                <Text style={styles.bossCardTitle}>{boss.title}</Text>
                <View style={styles.bossStats}>
                  <Text style={styles.bossStat}>Lvl {boss.level}</Text>
                  <View style={[styles.difficultyBadge, {
                    backgroundColor: boss.difficulty === 'Mythic' ? '#A78BFA' :
                                   boss.difficulty === 'Hard' ? '#FF6B6B' :
                                   boss.difficulty === 'Nightmare' ? '#F59E0B' : '#4ECDC4'
                  }]}>
                    <Text style={styles.difficultyText}>{boss.difficulty}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.bossRight}>
              <Text style={styles.rewardText}>+{boss.rewards.xp.toLocaleString()} XP</Text>
              <Text style={styles.playersText}>{boss.minPlayers}-{boss.maxPlayers} Players</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Upcoming Raids */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Raid Schedule</Text>
        <View style={styles.scheduleCard}>
          <Text style={styles.scheduleDay}>Today</Text>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleTime}>8:00 PM</Text>
            <Text style={styles.scheduleBoss}>👹 Titan of Strength</Text>
            <Text style={styles.scheduleGuild}>Iron Warriors</Text>
          </View>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleTime}>10:00 PM</Text>
            <Text style={styles.scheduleBoss}>🏃‍♂️ Cardio Colossus</Text>
            <Text style={styles.scheduleGuild}>Open Raid</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderDungeons = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Keys */}
      <View style={styles.keysContainer}>
        <Text style={styles.keysTitle}>🔑 Dungeon Keys</Text>
        <Text style={styles.keysCount}>5 / 10</Text>
        <Text style={styles.keysRefresh}>+1 key in 2h 30m</Text>
      </View>

      {/* Dungeons List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏰 Available Dungeons</Text>
        {DUNGEONS.map((dungeon) => (
          <TouchableOpacity 
            key={dungeon.id} 
            style={styles.dungeonCard}
            onPress={() => startDungeon(dungeon)}
          >
            <View style={styles.dungeonLeft}>
              <View style={styles.dungeonIcon}>
                <Text style={{ fontSize: 32 }}>{dungeon.emoji}</Text>
              </View>
              <View style={styles.dungeonInfo}>
                <Text style={styles.dungeonName}>{dungeon.name}</Text>
                <Text style={styles.dungeonDifficulty}>{dungeon.difficulty} • {dungeon.floors.length} Floors</Text>
                <View style={styles.attemptsBadge}>
                  <Text style={styles.attemptsText}>
                    {dungeon.dailyAttempts - dungeon.attemptsUsed}/{dungeon.dailyAttempts} attempts
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.dungeonRight}>
              <Text style={styles.keyCost}>🔑 {dungeon.keyCost}</Text>
              <Text style={styles.enterText}>Enter →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Weekly Dungeon */}
      <View style={styles.weeklyDungeon}>
        <View style={styles.weeklyBadge}>
          <Text style={styles.weeklyBadgeText}>⭐ WEEKLY</Text>
        </View>
        <Text style={styles.weeklyTitle}>The Gauntlet</Text>
        <Text style={styles.weeklyDesc}>10 floors of intense challenges. Massive rewards!</Text>
        <Text style={styles.weeklyResets}>Resets in: 3d 14h</Text>
        <TouchableOpacity style={styles.weeklyButton} onPress={() => buttonPress()}>
          <Text style={styles.weeklyButtonText}>Challenge (5 🔑)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // Raid Lobby Modal
  const renderLobby = () => (
    <Modal visible={showLobby} animationType="slide" transparent>
      <View style={styles.lobbyOverlay}>
        <View style={styles.lobbyContent}>
          <Text style={styles.lobbyTitle}>⚔️ Raid Lobby</Text>
          <Text style={styles.lobbyBoss}>{selectedBoss?.emoji} {selectedBoss?.name}</Text>
          <Text style={styles.lobbyDifficulty}>{selectedBoss?.difficulty} • {selectedBoss?.timeLimit} min</Text>

          {/* Mechanics */}
          <View style={styles.mechanicsBox}>
            <Text style={styles.mechanicsTitle}>⚠️ Boss Mechanics:</Text>
            {selectedBoss?.mechanics.map((m, i) => (
              <Text key={i} style={styles.mechanicItem}>• {m}</Text>
            ))}
          </View>

          {/* Party */}
          <Text style={styles.partyTitle}>
            Party ({participants.filter(p => p.isReady).length}/{selectedBoss?.maxPlayers})
          </Text>
          <FlatList
            data={participants}
            keyExtractor={(item) => item.id}
            style={styles.partyList}
            renderItem={({ item }) => (
              <View style={styles.partyMember}>
                <Text style={styles.partyAvatar}>{item.avatar}</Text>
                <View style={styles.partyInfo}>
                  <Text style={styles.partyName}>{item.name}</Text>
                  <Text style={styles.partyClass}>Lvl {item.level} {item.class}</Text>
                </View>
                <View style={[styles.readyBadge, item.isReady && styles.readyBadgeActive]}>
                  <Text style={styles.readyText}>{item.isReady ? '✓ Ready' : 'Not Ready'}</Text>
                </View>
              </View>
            )}
          />

          <View style={styles.lobbyButtons}>
            <TouchableOpacity 
              style={styles.cancelLobbyBtn}
              onPress={() => setShowLobby(false)}
            >
              <Text style={styles.cancelLobbyText}>Leave</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.startRaidBtn}
              onPress={beginBattle}
            >
              <Text style={styles.startRaidText}>Start Raid!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Main render
  if (isInRaid && selectedBoss) {
    return (
      <SafeAreaView style={styles.container}>
        {renderRaidBattle()}
      </SafeAreaView>
    );
  }

  if (isInDungeon && selectedDungeon) {
    return (
      <SafeAreaView style={styles.container}>
        {renderDungeonBattle()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Raids & Dungeons</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'raids' && styles.activeTab]}
          onPress={() => { buttonPress(); setActiveTab('raids'); }}
        >
          <Text style={[styles.tabText, activeTab === 'raids' && styles.activeTabText]}>
            👹 Raids
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dungeons' && styles.activeTab]}
          onPress={() => { buttonPress(); setActiveTab('dungeons'); }}
        >
          <Text style={[styles.tabText, activeTab === 'dungeons' && styles.activeTabText]}>
            🏰 Dungeons
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'raids' ? renderRaids() : renderDungeons()}
      {renderLobby()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 24,
    color: '#FFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
  },
  activeTabText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  activeRaidBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B22',
    margin: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  bannerEmoji: {
    fontSize: 32,
  },
  bannerContent: {
    flex: 1,
    marginLeft: 12,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#FFF',
    marginTop: 2,
  },
  joinNowBtn: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  joinNowText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  bossCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  bossLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  bossIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bossInfo: {
    marginLeft: 12,
    flex: 1,
  },
  bossCardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  bossCardTitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  bossStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  bossStat: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  bossRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rewardText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  playersText: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  scheduleCard: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 16,
  },
  scheduleDay: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    width: 80,
  },
  scheduleBoss: {
    fontSize: 14,
    color: '#FFF',
    flex: 1,
  },
  scheduleGuild: {
    fontSize: 12,
    color: '#888',
  },
  keysContainer: {
    backgroundColor: '#1A1A1A',
    margin: 12,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  keysTitle: {
    fontSize: 14,
    color: '#888',
  },
  keysCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginVertical: 8,
  },
  keysRefresh: {
    fontSize: 12,
    color: '#666',
  },
  dungeonCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  dungeonLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  dungeonIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dungeonInfo: {
    marginLeft: 12,
    flex: 1,
  },
  dungeonName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  dungeonDifficulty: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  attemptsBadge: {
    backgroundColor: '#4ECDC422',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  attemptsText: {
    fontSize: 10,
    color: '#4ECDC4',
  },
  dungeonRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  keyCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  enterText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  weeklyDungeon: {
    backgroundColor: '#A78BFA22',
    margin: 12,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A78BFA',
    alignItems: 'center',
  },
  weeklyBadge: {
    backgroundColor: '#A78BFA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  weeklyBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  weeklyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  weeklyDesc: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
    textAlign: 'center',
  },
  weeklyResets: {
    fontSize: 12,
    color: '#A78BFA',
    marginTop: 8,
  },
  weeklyButton: {
    backgroundColor: '#A78BFA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  weeklyButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  // Battle styles
  battleContainer: {
    flex: 1,
    padding: 16,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  timerDanger: {
    color: '#FF6B6B',
  },
  bossContainer: {
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
  },
  bossEmoji: {
    fontSize: 80,
  },
  bossName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 12,
  },
  bossTitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  bossHPContainer: {
    width: '100%',
    marginTop: 20,
  },
  bossHPBar: {
    height: 24,
    backgroundColor: '#333',
    borderRadius: 12,
    overflow: 'hidden',
  },
  bossHPFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
  },
  hpEnraged: {
    backgroundColor: '#FF6B6B',
  },
  bossHPText: {
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    marginTop: 8,
  },
  damageNumber: {
    position: 'absolute',
    top: 20,
    right: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  partyDPS: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  dpsSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 12,
  },
  dpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dpsRank: {
    fontSize: 12,
    color: '#666',
    width: 30,
  },
  dpsAvatar: {
    fontSize: 18,
    marginRight: 8,
  },
  dpsName: {
    fontSize: 14,
    color: '#FFF',
    flex: 1,
  },
  dpsDamage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  attackButton: {
    backgroundColor: '#FF6B6B',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  attackButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  attackSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  leaveButton: {
    padding: 12,
    alignItems: 'center',
  },
  leaveText: {
    fontSize: 14,
    color: '#FF6B6B',
  },
  // Dungeon battle styles
  dungeonBattleContainer: {
    flex: 1,
    padding: 16,
  },
  dungeonHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dungeonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  dungeonFloorText: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  floorCard: {
    backgroundColor: '#1A1A1A',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  floorName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  floorEnemies: {
    fontSize: 16,
    color: '#FF6B6B',
    marginTop: 8,
  },
  floorRewards: {
    fontSize: 14,
    color: '#4ECDC4',
    marginTop: 12,
  },
  dungeonProgressBar: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  progressSegment: {
    flex: 1,
    height: 8,
    backgroundColor: '#333',
    marginHorizontal: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCleared: {
    backgroundColor: '#4ECDC4',
  },
  progressCurrent: {
    backgroundColor: '#FFD700',
  },
  bossIndicator: {
    fontSize: 10,
    position: 'absolute',
    top: -14,
  },
  battleButton: {
    backgroundColor: '#FF6B6B',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  battleButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  retreatButton: {
    padding: 12,
    alignItems: 'center',
  },
  retreatText: {
    fontSize: 14,
    color: '#FF6B6B',
  },
  // Lobby styles
  lobbyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    padding: 16,
  },
  lobbyContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  lobbyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  lobbyBoss: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    marginTop: 8,
  },
  lobbyDifficulty: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
  },
  mechanicsBox: {
    backgroundColor: '#FF6B6B11',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FF6B6B33',
  },
  mechanicsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  mechanicItem: {
    fontSize: 12,
    color: '#FFF',
    marginBottom: 4,
  },
  partyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 20,
    marginBottom: 12,
  },
  partyList: {
    maxHeight: 200,
  },
  partyMember: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  partyAvatar: {
    fontSize: 28,
  },
  partyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  partyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  partyClass: {
    fontSize: 12,
    color: '#888',
  },
  readyBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  readyBadgeActive: {
    backgroundColor: '#4ECDC4',
  },
  readyText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
  },
  lobbyButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  cancelLobbyBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#333',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelLobbyText: {
    fontSize: 16,
    color: '#FFF',
  },
  startRaidBtn: {
    flex: 2,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    marginLeft: 8,
    alignItems: 'center',
  },
  startRaidText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default BossRaidScreen;

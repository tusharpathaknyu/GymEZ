import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buttonPress, successHaptic, errorHaptic } from '../../utils/haptics';

// Types
interface Player {
  id: string;
  name: string;
  avatar: string;
  level: number;
  trophies: number;
  rank: number;
  guild?: string;
  wins: number;
  losses: number;
  winStreak: number;
  division: string;
}

interface Match {
  id: string;
  opponent: Player;
  result: 'win' | 'loss' | 'pending';
  trophyChange: number;
  date: string;
  type: 'ranked' | 'tournament' | 'friendly';
}

interface Tournament {
  id: string;
  name: string;
  emoji: string;
  status: 'upcoming' | 'active' | 'completed';
  entryFee: number;
  prizePool: number;
  participants: number;
  maxParticipants: number;
  startTime: string;
  format: string;
  rewards: string[];
  yourPosition?: number;
}

interface Season {
  id: string;
  name: string;
  endDate: string;
  rewards: { division: string; reward: string }[];
}

interface League {
  name: string;
  emoji: string;
  minTrophies: number;
  maxTrophies: number;
  color: string;
}

// Constants
const LEAGUES: League[] = [
  { name: 'Bronze', emoji: '🥉', minTrophies: 0, maxTrophies: 499, color: '#CD7F32' },
  { name: 'Silver', emoji: '🥈', minTrophies: 500, maxTrophies: 999, color: '#C0C0C0' },
  { name: 'Gold', emoji: '🥇', minTrophies: 1000, maxTrophies: 1999, color: '#FFD700' },
  { name: 'Platinum', emoji: '💎', minTrophies: 2000, maxTrophies: 2999, color: '#E5E4E2' },
  { name: 'Diamond', emoji: '💠', minTrophies: 3000, maxTrophies: 3999, color: '#B9F2FF' },
  { name: 'Champion', emoji: '🏆', minTrophies: 4000, maxTrophies: 4999, color: '#FF6B6B' },
  { name: 'Legend', emoji: '👑', minTrophies: 5000, maxTrophies: 99999, color: '#A78BFA' },
];

// Mock Data
const MOCK_PLAYER: Player = {
  id: '1',
  name: 'You',
  avatar: '😎',
  level: 35,
  trophies: 2450,
  rank: 1247,
  guild: 'Iron Warriors',
  wins: 142,
  losses: 58,
  winStreak: 5,
  division: 'Platinum II',
};

const LEADERBOARD: Player[] = [
  { id: '1', name: 'FitLegend', avatar: '👑', level: 75, trophies: 6250, rank: 1, guild: 'Champions', wins: 520, losses: 45, winStreak: 23, division: 'Legend' },
  { id: '2', name: 'IronGod', avatar: '⚡', level: 72, trophies: 5980, rank: 2, guild: 'Champions', wins: 495, losses: 52, winStreak: 15, division: 'Legend' },
  { id: '3', name: 'GainsMaster', avatar: '💪', level: 70, trophies: 5720, rank: 3, guild: 'Elite Force', wins: 478, losses: 60, winStreak: 8, division: 'Legend' },
  { id: '4', name: 'SweatKing', avatar: '🔥', level: 68, trophies: 5450, rank: 4, guild: 'Elite Force', wins: 445, losses: 72, winStreak: 12, division: 'Legend' },
  { id: '5', name: 'BeastMode', avatar: '🦁', level: 65, trophies: 5100, rank: 5, guild: 'Beast Pack', wins: 420, losses: 85, winStreak: 6, division: 'Legend' },
  { id: '6', name: 'ProteinPro', avatar: '🥤', level: 62, trophies: 4850, rank: 6, wins: 398, losses: 92, winStreak: 4, division: 'Champion' },
  { id: '7', name: 'CardioKing', avatar: '🏃', level: 60, trophies: 4600, rank: 7, wins: 375, losses: 98, winStreak: 3, division: 'Champion' },
  { id: '8', name: 'LiftLord', avatar: '🏋️', level: 58, trophies: 4350, rank: 8, wins: 352, losses: 105, winStreak: 7, division: 'Champion' },
];

const MATCH_HISTORY: Match[] = [
  { id: '1', opponent: LEADERBOARD[6], result: 'win', trophyChange: 28, date: '2h ago', type: 'ranked' },
  { id: '2', opponent: LEADERBOARD[5], result: 'win', trophyChange: 32, date: '5h ago', type: 'ranked' },
  { id: '3', opponent: LEADERBOARD[7], result: 'loss', trophyChange: -18, date: '8h ago', type: 'ranked' },
  { id: '4', opponent: LEADERBOARD[4], result: 'win', trophyChange: 45, date: '1d ago', type: 'tournament' },
  { id: '5', opponent: LEADERBOARD[3], result: 'win', trophyChange: 38, date: '1d ago', type: 'ranked' },
];

const TOURNAMENTS: Tournament[] = [
  {
    id: '1',
    name: 'Weekly Warrior Cup',
    emoji: '⚔️',
    status: 'active',
    entryFee: 100,
    prizePool: 50000,
    participants: 128,
    maxParticipants: 128,
    startTime: 'In Progress',
    format: 'Single Elimination',
    rewards: ['50,000 Coins', '500 Gems', 'Champion Title', 'Exclusive Gear'],
    yourPosition: 8,
  },
  {
    id: '2',
    name: 'Strength Showdown',
    emoji: '💪',
    status: 'upcoming',
    entryFee: 50,
    prizePool: 25000,
    participants: 45,
    maxParticipants: 64,
    startTime: 'Starts in 4h 30m',
    format: 'Double Elimination',
    rewards: ['25,000 Coins', '250 Gems', 'Rare Equipment'],
  },
  {
    id: '3',
    name: 'Grand Championship',
    emoji: '👑',
    status: 'upcoming',
    entryFee: 500,
    prizePool: 250000,
    participants: 89,
    maxParticipants: 256,
    startTime: 'Starts in 2d 8h',
    format: 'Swiss + Playoffs',
    rewards: ['250,000 Coins', '2,500 Gems', 'Legendary Title', 'Mythic Gear Set'],
  },
];

const CURRENT_SEASON: Season = {
  id: 's4',
  name: 'Season 4: Rise of Champions',
  endDate: '14 days left',
  rewards: [
    { division: 'Legend', reward: 'Legendary Armor Set + 5,000 Gems' },
    { division: 'Champion', reward: 'Epic Armor Set + 2,500 Gems' },
    { division: 'Diamond', reward: 'Rare Armor Set + 1,000 Gems' },
    { division: 'Platinum', reward: 'Uncommon Armor Set + 500 Gems' },
  ],
};

const TournamentScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'league' | 'tournaments' | 'history'>('league');
  const [player, setPlayer] = useState<Player>(MOCK_PLAYER);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [currentOpponent, setCurrentOpponent] = useState<Player | null>(null);
  const [matchResult, setMatchResult] = useState<'win' | 'loss' | null>(null);

  const searchAnim = new Animated.Value(0);

  // Get current league
  const getCurrentLeague = () => {
    return LEAGUES.find(l => player.trophies >= l.minTrophies && player.trophies <= l.maxTrophies) || LEAGUES[0];
  };

  const getProgressToNextLeague = () => {
    const current = getCurrentLeague();
    const nextIndex = LEAGUES.findIndex(l => l.name === current.name) + 1;
    if (nextIndex >= LEAGUES.length) return 100;
    const next = LEAGUES[nextIndex];
    const progress = ((player.trophies - current.minTrophies) / (next.minTrophies - current.minTrophies)) * 100;
    return Math.min(progress, 100);
  };

  // Search for opponent
  useEffect(() => {
    if (isSearching) {
      const timer = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);

      // Find opponent after 3-5 seconds
      const matchTimer = setTimeout(() => {
        setIsSearching(false);
        setSearchTime(0);
        const opponent = LEADERBOARD[Math.floor(Math.random() * LEADERBOARD.length)];
        setCurrentOpponent(opponent);
        setShowMatchModal(true);
      }, 3000 + Math.random() * 2000);

      return () => {
        clearInterval(timer);
        clearTimeout(matchTimer);
      };
    }
  }, [isSearching]);

  const findMatch = () => {
    buttonPress();
    setIsSearching(true);
  };

  const cancelSearch = () => {
    buttonPress();
    setIsSearching(false);
    setSearchTime(0);
  };

  const startBattle = () => {
    if (!currentOpponent) return;
    buttonPress();
    
    // Simulate battle (random outcome weighted by level difference)
    const levelDiff = player.level - currentOpponent.level;
    const winChance = 0.5 + (levelDiff * 0.02);
    const won = Math.random() < winChance;
    
    if (won) {
      successHaptic();
      setMatchResult('win');
      const trophyGain = Math.floor(25 + Math.random() * 20);
      setPlayer(prev => ({
        ...prev,
        trophies: prev.trophies + trophyGain,
        wins: prev.wins + 1,
        winStreak: prev.winStreak + 1,
      }));
    } else {
      errorHaptic();
      setMatchResult('loss');
      const trophyLoss = Math.floor(15 + Math.random() * 10);
      setPlayer(prev => ({
        ...prev,
        trophies: Math.max(0, prev.trophies - trophyLoss),
        losses: prev.losses + 1,
        winStreak: 0,
      }));
    }
  };

  const closeMatch = () => {
    setShowMatchModal(false);
    setCurrentOpponent(null);
    setMatchResult(null);
  };

  const joinTournament = (tournament: Tournament) => {
    buttonPress();
    if (tournament.status === 'active' && tournament.yourPosition) {
      navigation.navigate('TournamentBracket', { tournament });
    } else {
      Alert.alert(
        'Join Tournament',
        `Entry Fee: ${tournament.entryFee} 💎\n\nPrize Pool: ${tournament.prizePool.toLocaleString()} Coins`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Join', 
            onPress: () => {
              successHaptic();
              Alert.alert('Registered!', `You're in! Tournament starts ${tournament.startTime}`);
            }
          },
        ]
      );
    }
  };

  const renderLeague = () => {
    const currentLeague = getCurrentLeague();
    const progress = getProgressToNextLeague();
    
    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Season Banner */}
        <View style={styles.seasonBanner}>
          <Text style={styles.seasonName}>{CURRENT_SEASON.name}</Text>
          <Text style={styles.seasonEnd}>{CURRENT_SEASON.endDate}</Text>
        </View>

        {/* Player Rank Card */}
        <View style={[styles.rankCard, { borderColor: currentLeague.color }]}>
          <View style={styles.rankHeader}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerAvatar}>{player.avatar}</Text>
              <View>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerGuild}>{player.guild}</Text>
              </View>
            </View>
            <View style={styles.trophyBox}>
              <Text style={styles.trophyCount}>🏆 {player.trophies}</Text>
              <Text style={styles.rankText}>Rank #{player.rank}</Text>
            </View>
          </View>

          {/* League Progress */}
          <View style={styles.leagueProgress}>
            <View style={styles.leagueInfo}>
              <Text style={{ fontSize: 32 }}>{currentLeague.emoji}</Text>
              <Text style={[styles.leagueName, { color: currentLeague.color }]}>
                {currentLeague.name}
              </Text>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: currentLeague.color }]} />
              </View>
              <Text style={styles.progressText}>
                {player.trophies} / {LEAGUES[LEAGUES.findIndex(l => l.name === currentLeague.name) + 1]?.minTrophies || 'MAX'} 🏆
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{player.wins}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{player.losses}</Text>
              <Text style={styles.statLabel}>Losses</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{((player.wins / (player.wins + player.losses)) * 100).toFixed(1)}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, styles.streakValue]}>🔥 {player.winStreak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        </View>

        {/* Find Match Button */}
        {!isSearching ? (
          <TouchableOpacity style={styles.findMatchBtn} onPress={findMatch}>
            <Text style={styles.findMatchText}>⚔️ FIND RANKED MATCH</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.searchingBtn} onPress={cancelSearch}>
            <Text style={styles.searchingText}>🔍 Searching... {searchTime}s</Text>
            <Text style={styles.cancelText}>Tap to cancel</Text>
          </TouchableOpacity>
        )}

        {/* Season Rewards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎁 Season Rewards</Text>
          {CURRENT_SEASON.rewards.map((r, i) => (
            <View key={i} style={styles.rewardRow}>
              <Text style={styles.rewardDivision}>{r.division}</Text>
              <Text style={styles.rewardText}>{r.reward}</Text>
            </View>
          ))}
        </View>

        {/* Leaderboard */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Global Leaderboard</Text>
          {LEADERBOARD.slice(0, 5).map((p, index) => (
            <View key={p.id} style={styles.leaderRow}>
              <Text style={styles.leaderRank}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </Text>
              <Text style={styles.leaderAvatar}>{p.avatar}</Text>
              <View style={styles.leaderInfo}>
                <Text style={styles.leaderName}>{p.name}</Text>
                <Text style={styles.leaderGuild}>{p.guild || 'No Guild'}</Text>
              </View>
              <Text style={styles.leaderTrophies}>🏆 {p.trophies}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.viewAllBtn} onPress={() => buttonPress()}>
            <Text style={styles.viewAllText}>View Full Leaderboard</Text>
          </TouchableOpacity>
        </View>

        {/* League Tiers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 League Tiers</Text>
          <View style={styles.leagueTiers}>
            {LEAGUES.map((league, index) => (
              <View 
                key={league.name} 
                style={[
                  styles.tierItem,
                  player.trophies >= league.minTrophies && 
                  player.trophies <= league.maxTrophies && styles.currentTier
                ]}
              >
                <Text style={{ fontSize: 24 }}>{league.emoji}</Text>
                <Text style={[styles.tierName, { color: league.color }]}>{league.name}</Text>
                <Text style={styles.tierRange}>{league.minTrophies}+</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderTournaments = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Active Tournament */}
      {TOURNAMENTS.filter(t => t.status === 'active').map(tournament => (
        <TouchableOpacity 
          key={tournament.id}
          style={styles.activeTournament}
          onPress={() => joinTournament(tournament)}
        >
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Text style={styles.tournamentEmoji}>{tournament.emoji}</Text>
          <Text style={styles.activeTournamentName}>{tournament.name}</Text>
          <Text style={styles.yourPosition}>Your Position: #{tournament.yourPosition}</Text>
          <Text style={styles.tournamentPrize}>
            Prize Pool: {tournament.prizePool.toLocaleString()} Coins
          </Text>
          <TouchableOpacity style={styles.viewBracketBtn}>
            <Text style={styles.viewBracketText}>View Bracket →</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      {/* Upcoming Tournaments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Upcoming Tournaments</Text>
        {TOURNAMENTS.filter(t => t.status === 'upcoming').map(tournament => (
          <TouchableOpacity 
            key={tournament.id}
            style={styles.tournamentCard}
            onPress={() => joinTournament(tournament)}
          >
            <View style={styles.tournamentHeader}>
              <Text style={{ fontSize: 32 }}>{tournament.emoji}</Text>
              <View style={styles.tournamentInfo}>
                <Text style={styles.tournamentName}>{tournament.name}</Text>
                <Text style={styles.tournamentFormat}>{tournament.format}</Text>
                <Text style={styles.tournamentTime}>{tournament.startTime}</Text>
              </View>
            </View>
            <View style={styles.tournamentFooter}>
              <View style={styles.tournamentStat}>
                <Text style={styles.tournamentStatValue}>
                  {tournament.participants}/{tournament.maxParticipants}
                </Text>
                <Text style={styles.tournamentStatLabel}>Players</Text>
              </View>
              <View style={styles.tournamentStat}>
                <Text style={styles.tournamentStatValue}>{tournament.entryFee} 💎</Text>
                <Text style={styles.tournamentStatLabel}>Entry</Text>
              </View>
              <View style={styles.tournamentStat}>
                <Text style={[styles.tournamentStatValue, { color: '#FFD700' }]}>
                  {tournament.prizePool.toLocaleString()}
                </Text>
                <Text style={styles.tournamentStatLabel}>Prize Pool</Text>
              </View>
            </View>
            <View style={styles.rewardsPreview}>
              <Text style={styles.rewardsTitle}>Rewards:</Text>
              <Text style={styles.rewardsList}>{tournament.rewards.slice(0, 2).join(' • ')}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Create Private Tournament */}
      <TouchableOpacity style={styles.createTournamentBtn} onPress={() => buttonPress()}>
        <Text style={styles.createTournamentText}>+ Create Private Tournament</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderHistory = () => (
    <FlatList
      data={MATCH_HISTORY}
      keyExtractor={(item) => item.id}
      style={styles.content}
      ListHeaderComponent={
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Recent Matches</Text>
          <View style={styles.historyStats}>
            <Text style={styles.historyWins}>W: {MATCH_HISTORY.filter(m => m.result === 'win').length}</Text>
            <Text style={styles.historyLosses}>L: {MATCH_HISTORY.filter(m => m.result === 'loss').length}</Text>
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <View style={[styles.matchCard, item.result === 'win' ? styles.winCard : styles.lossCard]}>
          <View style={styles.matchLeft}>
            <Text style={styles.matchResult}>
              {item.result === 'win' ? '✓ VICTORY' : '✗ DEFEAT'}
            </Text>
            <View style={styles.opponentInfo}>
              <Text style={styles.opponentAvatar}>{item.opponent.avatar}</Text>
              <View>
                <Text style={styles.opponentName}>{item.opponent.name}</Text>
                <Text style={styles.opponentLevel}>Lvl {item.opponent.level}</Text>
              </View>
            </View>
          </View>
          <View style={styles.matchRight}>
            <Text style={[
              styles.trophyChange,
              item.trophyChange > 0 ? styles.trophyGain : styles.trophyLoss
            ]}>
              {item.trophyChange > 0 ? '+' : ''}{item.trophyChange} 🏆
            </Text>
            <Text style={styles.matchDate}>{item.date}</Text>
            <View style={[styles.matchTypeBadge, {
              backgroundColor: item.type === 'tournament' ? '#FFD700' : '#4ECDC4'
            }]}>
              <Text style={styles.matchTypeText}>
                {item.type === 'tournament' ? '🏆' : '⚔️'}
              </Text>
            </View>
          </View>
        </View>
      )}
    />
  );

  // Match Modal
  const renderMatchModal = () => (
    <Modal visible={showMatchModal} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.matchModalContent}>
          {!matchResult ? (
            <>
              <Text style={styles.matchTitle}>⚔️ OPPONENT FOUND!</Text>
              <View style={styles.vsContainer}>
                <View style={styles.matchPlayer}>
                  <Text style={styles.matchPlayerAvatar}>{player.avatar}</Text>
                  <Text style={styles.matchPlayerName}>{player.name}</Text>
                  <Text style={styles.matchPlayerLevel}>Lvl {player.level}</Text>
                  <Text style={styles.matchPlayerTrophies}>🏆 {player.trophies}</Text>
                </View>
                <Text style={styles.vsText}>VS</Text>
                <View style={styles.matchPlayer}>
                  <Text style={styles.matchPlayerAvatar}>{currentOpponent?.avatar}</Text>
                  <Text style={styles.matchPlayerName}>{currentOpponent?.name}</Text>
                  <Text style={styles.matchPlayerLevel}>Lvl {currentOpponent?.level}</Text>
                  <Text style={styles.matchPlayerTrophies}>🏆 {currentOpponent?.trophies}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.battleBtn} onPress={startBattle}>
                <Text style={styles.battleBtnText}>⚔️ BATTLE!</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.fleeBtn} onPress={closeMatch}>
                <Text style={styles.fleeBtnText}>Flee (-10 🏆)</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.resultTitle, matchResult === 'win' ? styles.winText : styles.lossText]}>
                {matchResult === 'win' ? '🎉 VICTORY!' : '💀 DEFEAT'}
              </Text>
              <Text style={styles.resultEmoji}>
                {matchResult === 'win' ? '🏆' : '😢'}
              </Text>
              <Text style={[styles.resultTrophies, matchResult === 'win' ? styles.winText : styles.lossText]}>
                {matchResult === 'win' ? '+28' : '-18'} Trophies
              </Text>
              <TouchableOpacity style={styles.continueBtn} onPress={closeMatch}>
                <Text style={styles.continueBtnText}>Continue</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Competitive</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['league', 'tournaments', 'history'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => { buttonPress(); setActiveTab(tab as any); }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'league' ? '🏆 League' : tab === 'tournaments' ? '⚔️ Tournaments' : '📜 History'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'league' ? renderLeague() :
       activeTab === 'tournaments' ? renderTournaments() :
       renderHistory()}

      {renderMatchModal()}
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
    fontSize: 13,
    color: '#888',
  },
  activeTabText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  seasonBanner: {
    backgroundColor: '#A78BFA22',
    padding: 16,
    margin: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A78BFA',
    alignItems: 'center',
  },
  seasonName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A78BFA',
  },
  seasonEnd: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  rankCard: {
    backgroundColor: '#1A1A1A',
    margin: 12,
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
  },
  rankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerAvatar: {
    fontSize: 40,
    marginRight: 12,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  playerGuild: {
    fontSize: 12,
    color: '#888',
  },
  trophyBox: {
    alignItems: 'flex-end',
  },
  trophyCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  rankText: {
    fontSize: 12,
    color: '#888',
  },
  leagueProgress: {
    marginTop: 20,
  },
  leagueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  leagueName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#333',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  streakValue: {
    color: '#FF6B6B',
  },
  findMatchBtn: {
    backgroundColor: '#FF6B6B',
    margin: 12,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  findMatchText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  searchingBtn: {
    backgroundColor: '#333',
    margin: 12,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  searchingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  cancelText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
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
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  rewardDivision: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  rewardText: {
    fontSize: 12,
    color: '#4ECDC4',
    flex: 1,
    textAlign: 'right',
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  leaderRank: {
    fontSize: 18,
    width: 40,
  },
  leaderAvatar: {
    fontSize: 28,
    marginRight: 12,
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  leaderGuild: {
    fontSize: 11,
    color: '#888',
  },
  leaderTrophies: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  viewAllBtn: {
    padding: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4ECDC4',
  },
  leagueTiers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tierItem: {
    width: '30%',
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  currentTier: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  tierName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  tierRange: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  activeTournament: {
    backgroundColor: '#FF6B6B22',
    margin: 12,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 12,
    right: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
    marginRight: 4,
  },
  liveText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  tournamentEmoji: {
    fontSize: 48,
  },
  activeTournamentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  yourPosition: {
    fontSize: 16,
    color: '#FF6B6B',
    marginTop: 4,
  },
  tournamentPrize: {
    fontSize: 14,
    color: '#FFD700',
    marginTop: 8,
  },
  viewBracketBtn: {
    marginTop: 16,
  },
  viewBracketText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  tournamentCard: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  tournamentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tournamentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tournamentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  tournamentFormat: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  tournamentTime: {
    fontSize: 12,
    color: '#4ECDC4',
    marginTop: 4,
  },
  tournamentFooter: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  tournamentStat: {
    flex: 1,
    alignItems: 'center',
  },
  tournamentStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  tournamentStatLabel: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  rewardsPreview: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#222',
    borderRadius: 8,
  },
  rewardsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
  },
  rewardsList: {
    fontSize: 12,
    color: '#4ECDC4',
    marginTop: 4,
  },
  createTournamentBtn: {
    borderWidth: 2,
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  createTournamentText: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  historyStats: {
    flexDirection: 'row',
  },
  historyWins: {
    fontSize: 14,
    color: '#4ECDC4',
    marginRight: 12,
  },
  historyLosses: {
    fontSize: 14,
    color: '#FF6B6B',
  },
  matchCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  winCard: {
    backgroundColor: '#4ECDC411',
    borderLeftColor: '#4ECDC4',
  },
  lossCard: {
    backgroundColor: '#FF6B6B11',
    borderLeftColor: '#FF6B6B',
  },
  matchLeft: {
    flex: 1,
  },
  matchResult: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  opponentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  opponentAvatar: {
    fontSize: 28,
    marginRight: 8,
  },
  opponentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  opponentLevel: {
    fontSize: 12,
    color: '#888',
  },
  matchRight: {
    alignItems: 'flex-end',
  },
  trophyChange: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trophyGain: {
    color: '#4ECDC4',
  },
  trophyLoss: {
    color: '#FF6B6B',
  },
  matchDate: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  matchTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 8,
  },
  matchTypeText: {
    fontSize: 10,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchModalContent: {
    backgroundColor: '#1A1A1A',
    width: '85%',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  matchTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
  },
  vsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  matchPlayer: {
    alignItems: 'center',
    width: 100,
  },
  matchPlayerAvatar: {
    fontSize: 48,
  },
  matchPlayerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  matchPlayerLevel: {
    fontSize: 12,
    color: '#888',
  },
  matchPlayerTrophies: {
    fontSize: 14,
    color: '#FFD700',
    marginTop: 4,
  },
  vsText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginHorizontal: 20,
  },
  battleBtn: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  battleBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  fleeBtn: {
    padding: 12,
  },
  fleeBtnText: {
    fontSize: 14,
    color: '#888',
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  winText: {
    color: '#4ECDC4',
  },
  lossText: {
    color: '#FF6B6B',
  },
  resultEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  resultTrophies: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  continueBtn: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
  },
  continueBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default TournamentScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buttonPress, successHaptic } from '../../utils/haptics';

// Types
interface GuildMember {
  id: string;
  name: string;
  avatar: string;
  level: number;
  role: 'leader' | 'officer' | 'elite' | 'member';
  weeklyXP: number;
  totalXP: number;
  lastActive: string;
  isOnline: boolean;
}

interface Guild {
  id: string;
  name: string;
  tag: string;
  emblem: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  members: GuildMember[];
  maxMembers: number;
  description: string;
  requirements: {
    minLevel: number;
    weeklyXP: number;
  };
  perks: string[];
  raidBossesDefeated: number;
  weeklyRank: number;
  trophies: number;
  isRecruiting: boolean;
}

interface GuildMessage {
  id: string;
  sender: string;
  senderAvatar: string;
  message: string;
  timestamp: string;
  type: 'chat' | 'system' | 'raid' | 'achievement';
}

// Mock Data
const MOCK_GUILD: Guild = {
  id: '1',
  name: 'Iron Warriors',
  tag: 'IRON',
  emblem: '⚔️',
  level: 15,
  xp: 45000,
  xpToNextLevel: 50000,
  members: [
    { id: '1', name: 'FitKing', avatar: '👑', level: 45, role: 'leader', weeklyXP: 12500, totalXP: 250000, lastActive: 'Now', isOnline: true },
    { id: '2', name: 'GymBeast', avatar: '💪', level: 42, role: 'officer', weeklyXP: 11200, totalXP: 220000, lastActive: '5m ago', isOnline: true },
    { id: '3', name: 'IronMaiden', avatar: '🔥', level: 40, role: 'officer', weeklyXP: 10800, totalXP: 195000, lastActive: '15m ago', isOnline: true },
    { id: '4', name: 'ProteinPro', avatar: '🥤', level: 38, role: 'elite', weeklyXP: 9500, totalXP: 175000, lastActive: '1h ago', isOnline: false },
    { id: '5', name: 'CardioKing', avatar: '🏃', level: 36, role: 'elite', weeklyXP: 8900, totalXP: 160000, lastActive: '2h ago', isOnline: false },
    { id: '6', name: 'LiftLord', avatar: '🏋️', level: 35, role: 'member', weeklyXP: 7200, totalXP: 140000, lastActive: '3h ago', isOnline: false },
    { id: '7', name: 'SweatQueen', avatar: '👸', level: 33, role: 'member', weeklyXP: 6800, totalXP: 125000, lastActive: '5h ago', isOnline: false },
    { id: '8', name: 'BenchBro', avatar: '🎯', level: 30, role: 'member', weeklyXP: 5500, totalXP: 100000, lastActive: '1d ago', isOnline: false },
  ],
  maxMembers: 30,
  description: 'Elite fitness warriors pushing limits together. Weekly raids, friendly competition, and massive gains!',
  requirements: { minLevel: 20, weeklyXP: 5000 },
  perks: ['+15% XP Bonus', '+10% Raid Rewards', 'Exclusive Gear', 'Priority Raid Slots'],
  raidBossesDefeated: 47,
  weeklyRank: 12,
  trophies: 156,
  isRecruiting: true,
};

const MOCK_MESSAGES: GuildMessage[] = [
  { id: '1', sender: 'System', senderAvatar: '🤖', message: '🎉 Guild leveled up to Level 15! New perk unlocked: +15% XP Bonus', timestamp: '2m ago', type: 'system' },
  { id: '2', sender: 'FitKing', senderAvatar: '👑', message: 'Great work everyone on the raid yesterday! Ready for the next one?', timestamp: '10m ago', type: 'chat' },
  { id: '3', sender: 'GymBeast', senderAvatar: '💪', message: 'Count me in! What time?', timestamp: '8m ago', type: 'chat' },
  { id: '4', sender: 'System', senderAvatar: '🤖', message: '⚔️ RAID ALERT: Titan of Strength spawns in 2 hours!', timestamp: '15m ago', type: 'raid' },
  { id: '5', sender: 'IronMaiden', senderAvatar: '🔥', message: 'Just hit a new PR! 225lb bench 💪', timestamp: '20m ago', type: 'chat' },
  { id: '6', sender: 'System', senderAvatar: '🤖', message: '🏆 IronMaiden earned "Strength Milestone" achievement!', timestamp: '20m ago', type: 'achievement' },
  { id: '7', sender: 'ProteinPro', senderAvatar: '🥤', message: 'Nice! Im joining the raid for sure', timestamp: '25m ago', type: 'chat' },
];

const AVAILABLE_GUILDS: Guild[] = [
  { ...MOCK_GUILD, id: '2', name: 'Cardio Crusaders', tag: 'CC', emblem: '🏃', level: 18, members: [], weeklyRank: 5, trophies: 210 },
  { ...MOCK_GUILD, id: '3', name: 'Strength Squad', tag: 'STR', emblem: '🏋️', level: 12, members: [], weeklyRank: 23, trophies: 98 },
  { ...MOCK_GUILD, id: '4', name: 'Flex Force', tag: 'FLEX', emblem: '💪', level: 20, members: [], weeklyRank: 3, trophies: 280 },
  { ...MOCK_GUILD, id: '5', name: 'Beast Mode', tag: 'BEAST', emblem: '🔥', level: 10, members: [], weeklyRank: 45, trophies: 65 },
];

const GuildScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'members' | 'chat' | 'find'>('home');
  const [hasGuild, setHasGuild] = useState(true);
  const [guild, setGuild] = useState<Guild>(MOCK_GUILD);
  const [messages, setMessages] = useState<GuildMessage[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    buttonPress();
    const msg: GuildMessage = {
      id: Date.now().toString(),
      sender: 'You',
      senderAvatar: '😎',
      message: newMessage,
      timestamp: 'Just now',
      type: 'chat',
    };
    setMessages([msg, ...messages]);
    setNewMessage('');
  };

  const joinGuild = (guildToJoin: Guild) => {
    buttonPress();
    Alert.alert(
      'Join Guild',
      `Request to join ${guildToJoin.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Request', 
          onPress: () => {
            successHaptic();
            Alert.alert('Request Sent!', 'The guild leader will review your application.');
          }
        },
      ]
    );
  };

  const renderGuildHome = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Guild Header */}
      <View style={styles.guildHeader}>
        <View style={styles.guildEmblemLarge}>
          <Text style={styles.emblemText}>{guild.emblem}</Text>
        </View>
        <View style={styles.guildInfo}>
          <View style={styles.guildNameRow}>
            <Text style={styles.guildName}>{guild.name}</Text>
            <View style={styles.guildTag}>
              <Text style={styles.guildTagText}>[{guild.tag}]</Text>
            </View>
          </View>
          <Text style={styles.guildLevel}>Level {guild.level} Guild</Text>
          <View style={styles.xpBar}>
            <View style={[styles.xpFill, { width: `${(guild.xp / guild.xpToNextLevel) * 100}%` }]} />
          </View>
          <Text style={styles.xpText}>{guild.xp.toLocaleString()} / {guild.xpToNextLevel.toLocaleString()} XP</Text>
        </View>
      </View>

      {/* Guild Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>#{guild.weeklyRank}</Text>
          <Text style={styles.statLabel}>Weekly Rank</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{guild.members.length}/{guild.maxMembers}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{guild.raidBossesDefeated}</Text>
          <Text style={styles.statLabel}>Raids Won</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>🏆 {guild.trophies}</Text>
          <Text style={styles.statLabel}>Trophies</Text>
        </View>
      </View>

      {/* Active Perks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎁 Active Guild Perks</Text>
        <View style={styles.perksGrid}>
          {guild.perks.map((perk, index) => (
            <View key={index} style={styles.perkBadge}>
              <Text style={styles.perkText}>{perk}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#FF6B6B' }]}
            onPress={() => {
              buttonPress();
              navigation.navigate('BossRaid');
            }}
          >
            <Text style={styles.actionIcon}>👹</Text>
            <Text style={styles.actionText}>Guild Raid</Text>
            <Text style={styles.actionSubtext}>Boss in 2h</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#4ECDC4' }]}
            onPress={() => {
              buttonPress();
              navigation.navigate('Tournament');
            }}
          >
            <Text style={styles.actionIcon}>🏆</Text>
            <Text style={styles.actionText}>Tournament</Text>
            <Text style={styles.actionSubtext}>Season 4</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#A78BFA' }]}
            onPress={() => {
              buttonPress();
              navigation.navigate('BossRaid', { type: 'dungeon' });
            }}
          >
            <Text style={styles.actionIcon}>🏰</Text>
            <Text style={styles.actionText}>Dungeons</Text>
            <Text style={styles.actionSubtext}>3 keys</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
            onPress={() => {
              buttonPress();
              Alert.alert('Guild Shop', 'Spend trophies on exclusive rewards!');
            }}
          >
            <Text style={styles.actionIcon}>🛒</Text>
            <Text style={styles.actionText}>Guild Shop</Text>
            <Text style={styles.actionSubtext}>156 🏆</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekly Leaderboard Preview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 This Week's Top Contributors</Text>
        </View>
        {guild.members.slice(0, 3).map((member, index) => (
          <View key={member.id} style={styles.leaderboardRow}>
            <Text style={styles.rankBadge}>
              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
            </Text>
            <Text style={styles.memberAvatar}>{member.avatar}</Text>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberLevel}>Lvl {member.level}</Text>
            </View>
            <Text style={styles.weeklyXP}>+{member.weeklyXP.toLocaleString()} XP</Text>
          </View>
        ))}
      </View>

      {/* Upcoming Events */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Upcoming Events</Text>
        <View style={styles.eventCard}>
          <View style={styles.eventIcon}>
            <Text style={{ fontSize: 24 }}>👹</Text>
          </View>
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>Titan of Strength Raid</Text>
            <Text style={styles.eventTime}>Starts in 1h 45m</Text>
            <Text style={styles.eventParticipants}>5/8 members ready</Text>
          </View>
          <TouchableOpacity style={styles.joinEventBtn} onPress={() => buttonPress()}>
            <Text style={styles.joinEventText}>Join</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.eventCard}>
          <View style={[styles.eventIcon, { backgroundColor: '#A78BFA22' }]}>
            <Text style={{ fontSize: 24 }}>🏆</Text>
          </View>
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>Weekly Guild War</Text>
            <Text style={styles.eventTime}>Tomorrow 8:00 PM</Text>
            <Text style={styles.eventParticipants}>vs. Cardio Crusaders</Text>
          </View>
          <TouchableOpacity style={[styles.joinEventBtn, { backgroundColor: '#A78BFA' }]} onPress={() => buttonPress()}>
            <Text style={styles.joinEventText}>RSVP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderMembers = () => (
    <FlatList
      data={guild.members}
      keyExtractor={(item) => item.id}
      style={styles.tabContent}
      ListHeaderComponent={
        <View style={styles.membersHeader}>
          <Text style={styles.membersCount}>{guild.members.length} Members</Text>
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>
              {guild.members.filter(m => m.isOnline).length} Online
            </Text>
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.memberCard} onPress={() => buttonPress()}>
          <View style={styles.memberLeft}>
            {item.isOnline && <View style={styles.onlineBadge} />}
            <Text style={styles.memberAvatarLarge}>{item.avatar}</Text>
            <View style={styles.memberDetails}>
              <View style={styles.memberNameRow}>
                <Text style={styles.memberNameLarge}>{item.name}</Text>
                {item.role !== 'member' && (
                  <View style={[styles.roleBadge, {
                    backgroundColor: item.role === 'leader' ? '#FFD700' : 
                                    item.role === 'officer' ? '#A78BFA' : '#4ECDC4'
                  }]}>
                    <Text style={styles.roleText}>
                      {item.role === 'leader' ? '👑' : item.role === 'officer' ? '⭐' : '💎'}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.memberMeta}>Level {item.level} • {item.lastActive}</Text>
            </View>
          </View>
          <View style={styles.memberRight}>
            <Text style={styles.memberXP}>{item.totalXP.toLocaleString()}</Text>
            <Text style={styles.memberXPLabel}>Total XP</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );

  const renderChat = () => (
    <View style={styles.chatContainer}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        inverted
        style={styles.messageList}
        renderItem={({ item }) => (
          <View style={[
            styles.messageRow,
            item.type === 'system' && styles.systemMessage,
            item.type === 'raid' && styles.raidMessage,
            item.type === 'achievement' && styles.achievementMessage,
          ]}>
            <Text style={styles.messageAvatar}>{item.senderAvatar}</Text>
            <View style={styles.messageBubble}>
              <Text style={styles.messageSender}>{item.sender}</Text>
              <Text style={styles.messageText}>{item.message}</Text>
              <Text style={styles.messageTime}>{item.timestamp}</Text>
            </View>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.chatInput}
          placeholder="Type a message..."
          placeholderTextColor="#666"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFindGuild = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search guilds..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <TouchableOpacity 
        style={styles.createGuildBtn}
        onPress={() => {
          buttonPress();
          setShowCreateModal(true);
        }}
      >
        <Text style={styles.createGuildText}>+ Create New Guild</Text>
      </TouchableOpacity>
      <FlatList
        data={AVAILABLE_GUILDS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.guildCard}>
            <View style={styles.guildCardLeft}>
              <View style={styles.guildEmblem}>
                <Text style={{ fontSize: 28 }}>{item.emblem}</Text>
              </View>
              <View style={styles.guildCardInfo}>
                <Text style={styles.guildCardName}>{item.name}</Text>
                <Text style={styles.guildCardTag}>[{item.tag}] • Level {item.level}</Text>
                <Text style={styles.guildCardStats}>
                  #{item.weeklyRank} Rank • {item.trophies} 🏆
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.joinGuildBtn}
              onPress={() => joinGuild(item)}
            >
              <Text style={styles.joinGuildText}>Join</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );

  const renderNoGuild = () => (
    <View style={styles.noGuildContainer}>
      <Text style={styles.noGuildEmoji}>⚔️</Text>
      <Text style={styles.noGuildTitle}>Join a Guild!</Text>
      <Text style={styles.noGuildDesc}>
        Team up with other fitness warriors for raids, tournaments, and exclusive rewards!
      </Text>
      <TouchableOpacity 
        style={styles.findGuildBtn}
        onPress={() => {
          buttonPress();
          setActiveTab('find');
        }}
      >
        <Text style={styles.findGuildText}>Find a Guild</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.createOwnBtn}
        onPress={() => {
          buttonPress();
          setShowCreateModal(true);
        }}
      >
        <Text style={styles.createOwnText}>Create Your Own</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {hasGuild ? guild.name : 'Guilds'}
        </Text>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => buttonPress()}>
          <Text style={{ fontSize: 20 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      {hasGuild && (
        <View style={styles.tabs}>
          {['home', 'members', 'chat', 'find'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => {
                buttonPress();
                setActiveTab(tab as any);
              }}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === 'home' ? '🏠' : tab === 'members' ? '👥' : tab === 'chat' ? '💬' : '🔍'}
              </Text>
              <Text style={[styles.tabLabel, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Content */}
      {!hasGuild ? renderNoGuild() :
        activeTab === 'home' ? renderGuildHome() :
        activeTab === 'members' ? renderMembers() :
        activeTab === 'chat' ? renderChat() :
        renderFindGuild()
      }

      {/* Create Guild Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Guild</Text>
            <TextInput style={styles.modalInput} placeholder="Guild Name" placeholderTextColor="#666" />
            <TextInput style={styles.modalInput} placeholder="Tag (4 letters)" placeholderTextColor="#666" maxLength={4} />
            <TextInput 
              style={[styles.modalInput, { height: 80 }]} 
              placeholder="Description" 
              placeholderTextColor="#666"
              multiline 
            />
            <Text style={styles.costText}>Cost: 1,000 💎 Gems</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelBtn}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmBtn}
                onPress={() => {
                  successHaptic();
                  setShowCreateModal(false);
                  Alert.alert('Guild Created!', 'You are now the leader of your guild!');
                }}
              >
                <Text style={styles.confirmText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  settingsBtn: {
    padding: 8,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  activeTabText: {
    color: '#FF6B6B',
  },
  tabContent: {
    flex: 1,
  },
  guildHeader: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#1A1A1A',
    marginBottom: 12,
  },
  guildEmblemLarge: {
    width: 80,
    height: 80,
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  emblemText: {
    fontSize: 40,
  },
  guildInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  guildNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guildName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  guildTag: {
    marginLeft: 8,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  guildTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  guildLevel: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  xpBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  xpText: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
  },
  section: {
    padding: 16,
    backgroundColor: '#1A1A1A',
    marginBottom: 12,
    marginHorizontal: 12,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  perksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  perkBadge: {
    backgroundColor: '#4ECDC422',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  perkText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  actionSubtext: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  rankBadge: {
    fontSize: 20,
    width: 30,
  },
  memberAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  memberLevel: {
    fontSize: 12,
    color: '#888',
  },
  weeklyXP: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  eventIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#FF6B6B22',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventInfo: {
    flex: 1,
    marginLeft: 12,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  eventTime: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 2,
  },
  eventParticipants: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  joinEventBtn: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinEventText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1A1A1A',
    marginBottom: 8,
  },
  membersCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    color: '#4ECDC4',
  },
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 12,
    height: 12,
    backgroundColor: '#4ECDC4',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    zIndex: 1,
  },
  memberAvatarLarge: {
    fontSize: 32,
    marginRight: 12,
  },
  memberDetails: {
    justifyContent: 'center',
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberNameLarge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  roleBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 10,
  },
  memberMeta: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  memberRight: {
    alignItems: 'flex-end',
  },
  memberXP: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  memberXPLabel: {
    fontSize: 10,
    color: '#888',
  },
  chatContainer: {
    flex: 1,
  },
  messageList: {
    flex: 1,
    padding: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  systemMessage: {
    backgroundColor: '#4ECDC411',
    padding: 8,
    borderRadius: 8,
  },
  raidMessage: {
    backgroundColor: '#FF6B6B11',
    padding: 8,
    borderRadius: 8,
  },
  achievementMessage: {
    backgroundColor: '#FFD70011',
    padding: 8,
    borderRadius: 8,
  },
  messageAvatar: {
    fontSize: 24,
    marginRight: 8,
  },
  messageBubble: {
    flex: 1,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
  },
  messageText: {
    fontSize: 14,
    color: '#FFF',
    marginTop: 2,
  },
  messageTime: {
    fontSize: 10,
    color: '#555',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFF',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: '#FF6B6B',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonText: {
    fontSize: 20,
    color: '#FFF',
  },
  searchContainer: {
    padding: 12,
  },
  searchInput: {
    backgroundColor: '#222',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFF',
    fontSize: 16,
  },
  createGuildBtn: {
    backgroundColor: '#4ECDC4',
    marginHorizontal: 12,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createGuildText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  guildCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 12,
  },
  guildCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guildEmblem: {
    width: 56,
    height: 56,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guildCardInfo: {
    marginLeft: 12,
  },
  guildCardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  guildCardTag: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  guildCardStats: {
    fontSize: 11,
    color: '#4ECDC4',
    marginTop: 4,
  },
  joinGuildBtn: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  joinGuildText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  noGuildContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noGuildEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  noGuildTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  noGuildDesc: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  findGuildBtn: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  findGuildText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  createOwnBtn: {
    borderWidth: 2,
    borderColor: '#4ECDC4',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
  },
  createOwnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    width: '85%',
    padding: 24,
    borderRadius: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#222',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 12,
  },
  costText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginVertical: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#333',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#FFF',
  },
  confirmBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#4ECDC4',
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default GuildScreen;

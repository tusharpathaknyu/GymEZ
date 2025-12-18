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
  Image,
} from 'react-native';
import { useAuth } from '../services/auth';
import { buttonPress, successHaptic } from '../utils/haptics';

const { width } = Dimensions.get('window');

interface GymMember {
  id: string;
  name: string;
  avatar: string;
  status: 'working_out' | 'resting' | 'cardio' | 'leaving_soon';
  checkedInAt: string;
  currentActivity?: string;
  mutualFriends?: number;
  isFriend?: boolean;
}

interface GymActivity {
  area: string;
  icon: string;
  count: number;
  capacity: number;
  status: 'empty' | 'available' | 'busy' | 'packed';
}

interface CheckinHistory {
  date: string;
  duration: string;
  gym: string;
}

const LIVE_MEMBERS: GymMember[] = [
  { id: '1', name: 'Alex Chen', avatar: '💪', status: 'working_out', checkedInAt: '45 min ago', currentActivity: 'Bench Press', isFriend: true },
  { id: '2', name: 'Sarah Miller', avatar: '🏋️', status: 'cardio', checkedInAt: '30 min ago', currentActivity: 'Treadmill', mutualFriends: 3 },
  { id: '3', name: 'Mike Johnson', avatar: '🦁', status: 'working_out', checkedInAt: '1h ago', currentActivity: 'Squats', isFriend: true },
  { id: '4', name: 'Emma Wilson', avatar: '⭐', status: 'resting', checkedInAt: '20 min ago', currentActivity: 'Between sets' },
  { id: '5', name: 'James Brown', avatar: '🔥', status: 'leaving_soon', checkedInAt: '2h ago', currentActivity: 'Cool down' },
  { id: '6', name: 'Lisa Park', avatar: '💫', status: 'cardio', checkedInAt: '15 min ago', currentActivity: 'Stair Master', mutualFriends: 1 },
  { id: '7', name: 'David Kim', avatar: '🏆', status: 'working_out', checkedInAt: '1h 30m ago', currentActivity: 'Deadlifts', isFriend: true },
  { id: '8', name: 'Anna Lee', avatar: '🌟', status: 'working_out', checkedInAt: '40 min ago', currentActivity: 'Lat Pulldown' },
];

const GYM_AREAS: GymActivity[] = [
  { area: 'Free Weights', icon: '🏋️', count: 12, capacity: 20, status: 'available' },
  { area: 'Cardio Zone', icon: '🏃', count: 18, capacity: 25, status: 'busy' },
  { area: 'Machines', icon: '⚙️', count: 8, capacity: 15, status: 'available' },
  { area: 'Squat Racks', icon: '🦵', count: 5, capacity: 6, status: 'packed' },
  { area: 'Stretching', icon: '🧘', count: 3, capacity: 10, status: 'empty' },
  { area: 'Pool', icon: '🏊', count: 6, capacity: 12, status: 'available' },
];

const CHECKIN_HISTORY: CheckinHistory[] = [
  { date: 'Today', duration: '1h 15m', gym: 'GymEZ Downtown' },
  { date: 'Yesterday', duration: '45m', gym: 'GymEZ Downtown' },
  { date: 'Dec 15', duration: '1h 30m', gym: 'GymEZ Downtown' },
  { date: 'Dec 14', duration: '1h', gym: 'GymEZ Midtown' },
  { date: 'Dec 12', duration: '2h', gym: 'GymEZ Downtown' },
];

const GymCheckinScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<GymMember | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'friends'>('all');
  const [elapsedTime, setElapsedTime] = useState('0:00');
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    
    // Pulse animation for live indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Timer for checked in duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCheckedIn && checkInTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - checkInTime.getTime()) / 1000);
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        setElapsedTime(hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}` : `${minutes}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn, checkInTime]);

  const handleCheckin = () => {
    successHaptic();
    if (isCheckedIn) {
      setIsCheckedIn(false);
      setCheckInTime(null);
      setElapsedTime('0:00');
    } else {
      setIsCheckedIn(true);
      setCheckInTime(new Date());
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working_out': return '#10b981';
      case 'cardio': return '#3b82f6';
      case 'resting': return '#f59e0b';
      case 'leaving_soon': return '#9ca3af';
      default: return '#6b7280';
    }
  };

  const getAreaStatusColor = (status: string) => {
    switch (status) {
      case 'empty': return '#10b981';
      case 'available': return '#22c55e';
      case 'busy': return '#f59e0b';
      case 'packed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const filteredMembers = activeFilter === 'friends' 
    ? LIVE_MEMBERS.filter(m => m.isFriend) 
    : LIVE_MEMBERS;

  const renderCheckinButton = () => (
    <Animated.View style={[styles.checkinSection, { opacity: fadeAnim }]}>
      <View style={styles.gymInfo}>
        <Text style={styles.gymName}>📍 GymEZ Downtown</Text>
        <View style={styles.liveIndicator}>
          <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.liveText}>{LIVE_MEMBERS.length} people here now</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.checkinButton, isCheckedIn && styles.checkedInButton]}
        onPress={handleCheckin}
        activeOpacity={0.8}
      >
        {isCheckedIn ? (
          <>
            <Text style={styles.checkinIcon}>✓</Text>
            <View style={styles.checkinTextContainer}>
              <Text style={styles.checkinButtonText}>Checked In</Text>
              <Text style={styles.timerText}>{elapsedTime}</Text>
            </View>
            <Text style={styles.checkoutHint}>Tap to check out</Text>
          </>
        ) : (
          <>
            <Text style={styles.checkinIcon}>📍</Text>
            <Text style={styles.checkinButtonText}>Check In</Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const renderGymCapacity = () => (
    <View style={styles.capacitySection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🏋️ Gym Areas</Text>
        <Text style={styles.lastUpdated}>Updated 2m ago</Text>
      </View>
      
      <View style={styles.areasGrid}>
        {GYM_AREAS.map((area, index) => (
          <View key={index} style={styles.areaCard}>
            <Text style={styles.areaIcon}>{area.icon}</Text>
            <Text style={styles.areaName}>{area.area}</Text>
            <View style={styles.capacityBar}>
              <View 
                style={[
                  styles.capacityFill, 
                  { 
                    width: `${(area.count / area.capacity) * 100}%`,
                    backgroundColor: getAreaStatusColor(area.status),
                  }
                ]} 
              />
            </View>
            <Text style={styles.capacityText}>{area.count}/{area.capacity}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getAreaStatusColor(area.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getAreaStatusColor(area.status) }]}>
                {area.status.toUpperCase()}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderLiveMembers = () => (
    <View style={styles.membersSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>👥 Who's Here</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'all' && styles.filterButtonActive]}
            onPress={() => { buttonPress(); setActiveFilter('all'); }}
          >
            <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'friends' && styles.filterButtonActive]}
            onPress={() => { buttonPress(); setActiveFilter('friends'); }}
          >
            <Text style={[styles.filterText, activeFilter === 'friends' && styles.filterTextActive]}>Friends</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.membersScroll}>
        {filteredMembers.map((member) => (
          <TouchableOpacity
            key={member.id}
            style={styles.memberCard}
            onPress={() => {
              buttonPress();
              setSelectedMember(member);
              setShowMemberModal(true);
            }}
          >
            <View style={styles.memberAvatarContainer}>
              <Text style={styles.memberAvatar}>{member.avatar}</Text>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(member.status) }]} />
            </View>
            <Text style={styles.memberName} numberOfLines={1}>{member.name.split(' ')[0]}</Text>
            <Text style={styles.memberActivity} numberOfLines={1}>{member.currentActivity}</Text>
            {member.isFriend && <View style={styles.friendBadge}><Text style={styles.friendBadgeText}>👋</Text></View>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderActivityFeed = () => (
    <View style={styles.activitySection}>
      <Text style={styles.sectionTitle}>📊 Recent Activity</Text>
      
      <View style={styles.activityCard}>
        <View style={styles.activityItem}>
          <Text style={styles.activityIcon}>🏃</Text>
          <View style={styles.activityInfo}>
            <Text style={styles.activityText}>Peak hours today: 5-7 PM</Text>
            <Text style={styles.activitySubtext}>Usually 45+ people</Text>
          </View>
        </View>
        
        <View style={styles.activityDivider} />
        
        <View style={styles.activityItem}>
          <Text style={styles.activityIcon}>⏰</Text>
          <View style={styles.activityInfo}>
            <Text style={styles.activityText}>Best time to go: 6-8 AM</Text>
            <Text style={styles.activitySubtext}>Usually under 15 people</Text>
          </View>
        </View>
        
        <View style={styles.activityDivider} />
        
        <View style={styles.activityItem}>
          <Text style={styles.activityIcon}>📈</Text>
          <View style={styles.activityInfo}>
            <Text style={styles.activityText}>Your check-ins this week: 4</Text>
            <Text style={styles.activitySubtext}>You're on fire! 🔥</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderCheckinHistory = () => (
    <View style={styles.historySection}>
      <Text style={styles.sectionTitle}>📜 Check-in History</Text>
      
      <View style={styles.historyCard}>
        {CHECKIN_HISTORY.map((item, index) => (
          <View key={index} style={[styles.historyItem, index !== CHECKIN_HISTORY.length - 1 && styles.historyItemBorder]}>
            <View style={styles.historyDate}>
              <Text style={styles.historyDateText}>{item.date}</Text>
            </View>
            <View style={styles.historyDetails}>
              <Text style={styles.historyGym}>{item.gym}</Text>
              <Text style={styles.historyDuration}>{item.duration}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderMemberModal = () => (
    <Modal visible={showMemberModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.memberModal}>
          {selectedMember && (
            <>
              <TouchableOpacity 
                style={styles.modalClose}
                onPress={() => setShowMemberModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
              
              <View style={styles.modalHeader}>
                <View style={styles.modalAvatarContainer}>
                  <Text style={styles.modalAvatar}>{selectedMember.avatar}</Text>
                  <View style={[styles.modalStatusDot, { backgroundColor: getStatusColor(selectedMember.status) }]} />
                </View>
                <Text style={styles.modalName}>{selectedMember.name}</Text>
                <Text style={styles.modalStatus}>
                  {selectedMember.status.replace('_', ' ').charAt(0).toUpperCase() + selectedMember.status.replace('_', ' ').slice(1)}
                </Text>
              </View>
              
              <View style={styles.modalInfo}>
                <View style={styles.modalInfoItem}>
                  <Text style={styles.modalInfoIcon}>⏱</Text>
                  <Text style={styles.modalInfoText}>Checked in {selectedMember.checkedInAt}</Text>
                </View>
                <View style={styles.modalInfoItem}>
                  <Text style={styles.modalInfoIcon}>🏋️</Text>
                  <Text style={styles.modalInfoText}>{selectedMember.currentActivity}</Text>
                </View>
                {selectedMember.mutualFriends && (
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoIcon}>👥</Text>
                    <Text style={styles.modalInfoText}>{selectedMember.mutualFriends} mutual friends</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.modalActions}>
                {selectedMember.isFriend ? (
                  <>
                    <TouchableOpacity style={styles.modalButton} onPress={() => { successHaptic(); setShowMemberModal(false); }}>
                      <Text style={styles.modalButtonIcon}>👋</Text>
                      <Text style={styles.modalButtonText}>Say Hi</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalButton, styles.modalButtonSecondary]} onPress={() => buttonPress()}>
                      <Text style={styles.modalButtonIcon}>💬</Text>
                      <Text style={[styles.modalButtonText, { color: '#6b7280' }]}>Message</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity style={styles.modalButton} onPress={() => { successHaptic(); setShowMemberModal(false); }}>
                      <Text style={styles.modalButtonIcon}>➕</Text>
                      <Text style={styles.modalButtonText}>Add Friend</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalButton, styles.modalButtonSecondary]} onPress={() => buttonPress()}>
                      <Text style={styles.modalButtonIcon}>👋</Text>
                      <Text style={[styles.modalButtonText, { color: '#6b7280' }]}>Wave</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
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
        <Text style={styles.headerTitle}>Gym Check-in</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={() => buttonPress()}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Check-in Button */}
        {renderCheckinButton()}
        
        {/* Gym Capacity */}
        {renderGymCapacity()}
        
        {/* Live Members */}
        {renderLiveMembers()}
        
        {/* Activity Insights */}
        {renderActivityFeed()}
        
        {/* Check-in History */}
        {renderCheckinHistory()}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {renderMemberModal()}
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
  settingsButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  settingsIcon: { fontSize: 18 },
  
  // Check-in Section
  checkinSection: { paddingHorizontal: 20, paddingTop: 16 },
  gymInfo: { marginBottom: 12 },
  gymName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981', marginRight: 6 },
  liveText: { fontSize: 13, color: '#10b981', fontWeight: '500' },
  checkinButton: {
    backgroundColor: '#10b981',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkedInButton: { backgroundColor: '#059669' },
  checkinIcon: { fontSize: 24, marginRight: 12 },
  checkinTextContainer: { alignItems: 'center' },
  checkinButtonText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  timerText: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 4 },
  checkoutHint: { position: 'absolute', right: 20, fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  
  // Capacity Section
  capacitySection: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  lastUpdated: { fontSize: 11, color: '#9ca3af' },
  areasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  areaCard: {
    width: (width - 50) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  areaIcon: { fontSize: 24, marginBottom: 4 },
  areaName: { fontSize: 12, fontWeight: '600', color: '#1f2937', marginBottom: 8 },
  capacityBar: { width: '100%', height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  capacityFill: { height: '100%', borderRadius: 3 },
  capacityText: { fontSize: 11, color: '#6b7280', marginBottom: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 9, fontWeight: 'bold' },
  
  // Members Section
  membersSection: { marginTop: 24 },
  filterButtons: { flexDirection: 'row', gap: 8 },
  filterButton: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, backgroundColor: '#f3f4f6' },
  filterButtonActive: { backgroundColor: '#1f2937' },
  filterText: { fontSize: 12, color: '#6b7280' },
  filterTextActive: { color: '#fff' },
  membersScroll: { paddingLeft: 20, paddingTop: 12 },
  memberCard: {
    width: 80,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  memberAvatarContainer: { position: 'relative', marginBottom: 8 },
  memberAvatar: { fontSize: 32 },
  statusDot: { position: 'absolute', bottom: 0, right: -4, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#fff' },
  memberName: { fontSize: 12, fontWeight: '600', color: '#1f2937' },
  memberActivity: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
  friendBadge: { position: 'absolute', top: 4, right: 4 },
  friendBadgeText: { fontSize: 12 },
  
  // Activity Section
  activitySection: { paddingHorizontal: 20, marginTop: 24 },
  activityCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  activityItem: { flexDirection: 'row', alignItems: 'center' },
  activityIcon: { fontSize: 20, marginRight: 12 },
  activityInfo: { flex: 1 },
  activityText: { fontSize: 14, fontWeight: '500', color: '#1f2937' },
  activitySubtext: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  activityDivider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 12 },
  
  // History Section
  historySection: { paddingHorizontal: 20, marginTop: 24 },
  historyCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  historyItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  historyItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  historyDate: { width: 70 },
  historyDateText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  historyDetails: { flex: 1 },
  historyGym: { fontSize: 14, fontWeight: '500', color: '#1f2937' },
  historyDuration: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  memberModal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalClose: { position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  modalCloseText: { fontSize: 16, color: '#6b7280' },
  modalHeader: { alignItems: 'center', marginBottom: 20 },
  modalAvatarContainer: { position: 'relative', marginBottom: 12 },
  modalAvatar: { fontSize: 56 },
  modalStatusDot: { position: 'absolute', bottom: 0, right: -4, width: 16, height: 16, borderRadius: 8, borderWidth: 3, borderColor: '#fff' },
  modalName: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  modalStatus: { fontSize: 14, color: '#10b981', marginTop: 4 },
  modalInfo: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, marginBottom: 20 },
  modalInfoItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  modalInfoIcon: { fontSize: 16, marginRight: 10 },
  modalInfoText: { fontSize: 14, color: '#374151' },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalButton: { flex: 1, backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  modalButtonSecondary: { backgroundColor: '#f3f4f6' },
  modalButtonIcon: { fontSize: 16, marginRight: 8 },
  modalButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});

export default GymCheckinScreen;

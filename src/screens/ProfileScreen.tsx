import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActionSheetIOS,
  Platform,
  Modal,
} from 'react-native';
import { useAuth } from '../services/auth';
import { PersonalRecordsService } from '../services/personalRecordsService';
import { supabase } from '../services/supabase';
import FindFriends from '../components/FindFriends';
import AchievementBadges from '../components/AchievementBadges';
import GymComparison from '../components/GymComparison';

const ProfileScreen = ({ navigation }: any) => {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [profilePic, setProfilePic] = useState<string | null>(
    user?.profile_picture || null,
  );
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isLinkedToFacebook, setIsLinkedToFacebook] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showGymComparison, setShowGymComparison] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadStats();
      loadSocialStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadStats = async () => {
    if (!user?.id) {
      return;
    }
    try {
      const statsData = await PersonalRecordsService.getUserPRStats(user.id);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadSocialStats = async () => {
    if (!user?.id) {
      return;
    }
    try {
      // Get followers and following counts
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id);

      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id);

      setFollowers(followersCount || 0);
      setFollowing(followingCount || 0);
    } catch (error) {
      console.error('Error loading social stats:', error);
    }
  };

  const showImagePicker = () => {
    const options = [
      'Choose from Gallery',
      'Take Photo',
      'Remove Photo',
      'Cancel',
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 3,
        },
        handleImageOption,
      );
    } else {
      Alert.alert('Change Profile Picture', 'Choose an option', [
        { text: 'Choose from Gallery', onPress: () => console.log('Gallery') },
        { text: 'Take Photo', onPress: () => console.log('Camera') },
        {
          text: 'Remove Photo',
          onPress: handleRemovePhoto,
          style: 'destructive',
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleImageOption = (buttonIndex: number) => {
    if (buttonIndex === 0) {
      console.log('Gallery');
    } else if (buttonIndex === 1) {
      console.log('Camera');
    } else if (buttonIndex === 2) {
      handleRemovePhoto();
    }
  };

  const handleRemovePhoto = async () => {
    if (!user?.id) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ profile_picture: null })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setProfilePic(null);
      Alert.alert('Success', 'Profile picture removed');
    } catch (error) {
      console.error('Error removing photo:', error);
      Alert.alert('Error', 'Failed to remove profile picture');
    }
  };

  const handleLinkFacebook = () => {
    Alert.alert(
      'Link Facebook',
      'Connect your Facebook account to share your achievements and find friends who use GYMEZ.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Connect',
          onPress: () => {
            setIsLinkedToFacebook(true);
            Alert.alert('Success', 'Facebook account linked successfully!');
          },
        },
      ],
    );
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            console.error('Error signing out:', error);
          }
        },
      },
    ]);
  };

  const getDaysAtGym = () => {
    if (!user?.gym_start_date) {
      return 0;
    }
    const startDate = new Date(user.gym_start_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Actions */}
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={styles.headerButtonIcon}>🔔</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.headerButtonIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={showImagePicker}
          activeOpacity={0.8}
        >
          {profilePic ? (
            <Image source={{ uri: profilePic }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.full_name?.charAt(0) || 'U'}
              </Text>
            </View>
          )}
          <View style={styles.editBadge}>
            <Text style={styles.editIcon}>📷</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{user?.full_name || 'User'}</Text>
        {user?.username && (
          <Text style={styles.username}>@{user.username}</Text>
        )}
        {user?.gym_start_date && (
          <View style={styles.memberSince}>
            <Text style={styles.memberSinceText}>
              🏋️ Member for {getDaysAtGym()} days
            </Text>
          </View>
        )}
      </View>

      {/* Social Stats */}
      <View style={styles.socialStats}>
        <View style={styles.socialStat}>
          <Text style={styles.socialNumber}>{followers}</Text>
          <Text style={styles.socialLabel}>Followers</Text>
        </View>
        <View style={styles.socialStat}>
          <Text style={styles.socialNumber}>{stats?.totalPRs || 0}</Text>
          <Text style={styles.socialLabel}>PRs</Text>
        </View>
        <View style={styles.socialStat}>
          <Text style={styles.socialNumber}>{following}</Text>
          <Text style={styles.socialLabel}>Following</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats?.totalPRs || 0}</Text>
          <Text style={styles.statLabel}>Total PRs</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {stats?.exercisesWithPRs?.length || 0}
          </Text>
          <Text style={styles.statLabel}>Exercises</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats?.recentPRs?.length || 0}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Social Connections</Text>
        <TouchableOpacity style={styles.menuItem} onPress={handleLinkFacebook}>
          <Text style={styles.menuIcon}>📘</Text>
          <View style={styles.menuContent}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuText}>
                {isLinkedToFacebook ? 'Linked to Facebook' : 'Link Facebook'}
              </Text>
              {isLinkedToFacebook && (
                <View style={styles.connectedBadge}>
                  <Text style={styles.connectedText}>Connected</Text>
                </View>
              )}
            </View>
            <Text style={styles.menuDescription}>
              Connect with Facebook friends
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setShowFriendsModal(true)}
        >
          <Text style={styles.menuIcon}>👥</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuText}>Find Friends</Text>
            <Text style={styles.menuDescription}>
              Discover people from your gym
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setShowAchievementsModal(true)}
        >
          <Text style={styles.menuIcon}>🏆</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuText}>Achievements</Text>
            <Text style={styles.menuDescription}>
              View your badges and milestones
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setShowGymComparison(true)}
        >
          <Text style={styles.menuIcon}>📊</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuText}>Gym Leaderboard</Text>
            <Text style={styles.menuDescription}>
              Compare your PRs with gym members
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>👤</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuText}>Edit Profile</Text>
            <Text style={styles.menuDescription}>
              Update your personal information
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>🔒</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuText}>Change Password</Text>
            <Text style={styles.menuDescription}>
              Update your account password
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>🎨</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuText}>Appearance</Text>
            <Text style={styles.menuDescription}>
              Dark mode and preferences
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>🔔</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuText}>Notifications</Text>
            <Text style={styles.menuDescription}>
              Manage notification preferences
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuText}>Privacy Settings</Text>
            <Text style={styles.menuDescription}>Control your privacy</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>❓</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuText}>Help & Support</Text>
            <Text style={styles.menuDescription}>Get help with the app</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>📧</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuText}>Send Feedback</Text>
            <Text style={styles.menuDescription}>Share your thoughts</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>🚪 Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>GYMEZ v1.0.0</Text>
        <Text style={styles.footerText}>© 2025 GymEZ</Text>
      </View>

      {/* Find Friends Modal */}
      <Modal
        visible={showFriendsModal}
        animationType="slide"
        onRequestClose={() => setShowFriendsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Find Friends</Text>
            <TouchableOpacity onPress={() => setShowFriendsModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <FindFriends />
        </View>
      </Modal>

      {/* Achievements Modal */}
      <Modal
        visible={showAchievementsModal}
        animationType="slide"
        onRequestClose={() => setShowAchievementsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Achievements</Text>
            <TouchableOpacity onPress={() => setShowAchievementsModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <AchievementBadges />
        </View>
      </Modal>

      {/* Gym Comparison Modal */}
      <Modal
        visible={showGymComparison}
        animationType="slide"
        onRequestClose={() => setShowGymComparison(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Gym Leaderboard</Text>
            <TouchableOpacity onPress={() => setShowGymComparison(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <GymComparison />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerActions: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    gap: 12,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButtonIcon: {
    fontSize: 18,
  },
  profileHeader: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10b981',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  editIcon: {
    fontSize: 18,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  memberSince: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  memberSinceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065f46',
  },
  socialStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  socialStat: {
    alignItems: 'center',
  },
  socialNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  socialLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  connectedBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  connectedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  menuSection: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  menuItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  signOutButton: {
    margin: 20,
    marginTop: 10,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fee2e2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: '300',
  },
});

export default ProfileScreen;

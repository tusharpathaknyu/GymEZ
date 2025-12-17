import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useAuth } from '../services/auth';
import { supabase } from '../services/supabase';
import { User } from '../types';

const FindFriends = () => {
  const { user } = useAuth();
  const [gymUsers, setGymUsers] = useState<User[]>([]);
  const [facebookFriends, setFacebookFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'gym' | 'facebook'>('gym');

  useEffect(() => {
    loadUsers();
    loadFollowing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadUsers = async () => {
    if (!user?.id) {
      return;
    }

    setLoading(true);
    try {
      // Get all users from the same gym
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('gym_id', user.gym_id)
        .neq('id', user.id)
        .limit(50);

      if (error) {
        throw error;
      }
      setGymUsers(data as User[]);

      // Load Facebook friends (simulated for now)
      // In production, this would query Facebook friends who also use the app
      setFacebookFriends([]);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadFollowing = async () => {
    if (!user?.id) {
      return;
    }

    try {
      const { data } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (data) {
        setFollowingIds(new Set(data.map(f => f.following_id)));
      }
    } catch (error) {
      console.error('Error loading following:', error);
    }
  };

  const handleFollow = async (userId: string) => {
    if (!user?.id) {
      return;
    }

    try {
      const isFollowing = followingIds.has(userId);

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (error) {
          throw error;
        }
        setFollowingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: userId });

        if (error) {
          throw error;
        }
        setFollowingIds(prev => new Set(prev).add(userId));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  const filteredGymUsers = gymUsers.filter(
    u =>
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredFacebookFriends = facebookFriends.filter(
    u =>
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const currentUsers =
    activeTab === 'gym' ? filteredGymUsers : filteredFacebookFriends;

  const renderUser = ({ item }: { item: User }) => {
    const isFollowing = followingIds.has(item.id);

    return (
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          {item.profile_picture ? (
            <Image
              source={{ uri: item.profile_picture }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{item.full_name.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.full_name}</Text>
            {item.username && (
              <Text style={styles.userUsername}>@{item.username}</Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={[styles.followButton, isFollowing && styles.unfollowButton]}
          onPress={() => handleFollow(item.id)}
        >
          <Text
            style={[
              styles.followButtonText,
              isFollowing && styles.unfollowButtonText,
            ]}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'gym' && styles.activeTab]}
          onPress={() => setActiveTab('gym')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'gym' && styles.activeTabText,
            ]}
          >
            🏋️ Gym Members ({gymUsers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'facebook' && styles.activeTab]}
          onPress={() => setActiveTab('facebook')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'facebook' && styles.activeTabText,
            ]}
          >
            📘 Facebook Friends ({facebookFriends.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${
            activeTab === 'gym' ? 'gym members' : 'Facebook friends'
          }...`}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* Empty State for Facebook */}
      {activeTab === 'facebook' && facebookFriends.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📘</Text>
          <Text style={styles.emptyTitle}>No Facebook Friends Yet</Text>
          <Text style={styles.emptyDescription}>
            Connect your Facebook account to find friends who use GYMEZ
          </Text>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkButtonText}>Link Facebook</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* User List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#10b981"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={currentUsers}
          renderItem={renderUser}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No users found</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#ecfdf5',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#10b981',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  linkButton: {
    backgroundColor: '#4267B2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  searchIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  userUsername: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  followButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  unfollowButton: {
    backgroundColor: '#e5e7eb',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  unfollowButtonText: {
    color: '#6b7280',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    marginTop: 40,
  },
});

export default FindFriends;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAuth } from '../services/auth';
import { supabase } from '../services/supabase';
import { PersonalRecord, User } from '../types';

interface GymMemberPR {
  user: User;
  prs: PersonalRecord[];
  total_prs: number;
}

const GymComparison = () => {
  const { user } = useAuth();
  const [gymMembers, setGymMembers] = useState<GymMemberPR[]>([]);
  const [loading, setLoading] = useState(false);
  const [_selectedExercise, setSelectedExercise] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (user?.gym_id) {
      loadGymMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadGymMembers = async () => {
    if (!user?.gym_id || !user?.id) {
      return;
    }

    setLoading(true);
    try {
      // Get all members from the same gym
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, profile_picture')
        .eq('gym_id', user.gym_id)
        .eq('user_type', 'gym_member')
        .neq('id', user.id);

      // Get PRs for each member
      const membersWithPRs: GymMemberPR[] = await Promise.all(
        (profiles || []).map(async member => {
          const { data: prs } = await supabase
            .from('personal_records')
            .select('*')
            .eq('user_id', member.id)
            .order('achieved_at', { ascending: false });

          return {
            user: member as User,
            prs: (prs as PersonalRecord[]) || [],
            total_prs: prs?.length || 0,
          };
        }),
      );

      // Sort by total PRs
      const sorted = membersWithPRs.sort((a, b) => b.total_prs - a.total_prs);
      setGymMembers(sorted);
    } catch (error) {
      console.error('Error loading gym members:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRank = (index: number) => {
    if (index === 0) {
      return '🥇';
    }
    if (index === 1) {
      return '🥈';
    }
    if (index === 2) {
      return '🥉';
    }
    return `#${index + 1}`;
  };

  const renderMember = ({
    item,
    index,
  }: {
    item: GymMemberPR;
    index: number;
  }) => (
    <View style={styles.memberCard}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankIcon}>{getRank(index)}</Text>
      </View>

      <View style={styles.avatarContainer}>
        {item.user.profile_picture ? (
          <Image
            source={{ uri: item.user.profile_picture }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {item.user.full_name.charAt(0)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.user.full_name}</Text>
        {item.user.username && (
          <Text style={styles.memberUsername}>@{item.user.username}</Text>
        )}
        <Text style={styles.memberStats}>🏆 {item.total_prs} PRs</Text>
      </View>

      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => setSelectedExercise(null)}
      >
        <Text style={styles.viewButtonText}>View</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gym Leaderboard</Text>
        <Text style={styles.headerSubtitle}>
          Compare your progress with {gymMembers.length} gym members
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top Performers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performers 🏆</Text>
          {gymMembers.slice(0, 3).map((member, index) => (
            <View key={member.user.id} style={styles.topCard}>
              <Text style={styles.rankIcon}>{getRank(index)}</Text>
              <View style={styles.topMemberInfo}>
                {member.user.profile_picture ? (
                  <Image
                    source={{ uri: member.user.profile_picture }}
                    style={styles.topAvatar}
                  />
                ) : (
                  <View style={[styles.avatarPlaceholder, styles.topAvatar]}>
                    <Text style={styles.avatarText}>
                      {member.user.full_name.charAt(0)}
                    </Text>
                  </View>
                )}
                <View style={styles.topMemberDetails}>
                  <Text style={styles.topMemberName}>
                    {member.user.full_name}
                  </Text>
                  <Text style={styles.topMemberStats}>
                    {member.total_prs} Personal Records
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* All Members */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Members</Text>
          <FlatList
            data={gymMembers}
            renderItem={renderMember}
            keyExtractor={item => item.user.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </View>
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
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  topCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankIcon: {
    fontSize: 24,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  memberUsername: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  memberStats: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 4,
  },
  viewButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  topMemberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  topMemberDetails: {
    flex: 1,
  },
  topMemberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  topMemberStats: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 4,
  },
});

export default GymComparison;

import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, FlatList, ActivityIndicator, Modal} from 'react-native';
import {useAuth} from '../services/auth';
import {VideoService} from '../services/videoService';
import VideoRecorder from '../components/VideoRecorder';
import PRDashboard from '../components/PRDashboard';
import SocialFeed from '../components/SocialFeed';
import {WorkoutBuilder} from '../components/WorkoutBuilder';
import {WorkoutTimer} from '../components/WorkoutTimer';
import {ChallengeList} from '../components/ChallengeList';
import {Video} from '../types';

const GymMemberDashboard = () => {
  const {user, signOut} = useAuth();
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [myVideos, setMyVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'workouts' | 'challenges' | 'prs' | 'videos' | 'settings'>('feed');
  const [showWorkoutBuilder, setShowWorkoutBuilder] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadMyVideos();
    }
  }, [user]);

  const loadMyVideos = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const videos = await VideoService.getMemberVideos(user.id);
      setMyVideos(videos);
    } catch (error: any) {
      console.error('Error loading videos:', error);
      Alert.alert('Error', 'Failed to load your videos');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoRecorded = async (
    videoUri: string,
    title: string,
    description: string,
    exerciseType: string,
    duration: number
  ) => {
    if (!user?.id || !user?.gym_id) {
      Alert.alert('Error', 'Unable to upload video. Please try again.');
      return;
    }

    setUploading(true);
    try {
      await VideoService.submitVideoForApproval(
        videoUri,
        user.id,
        user.gym_id,
        title,
        description,
        exerciseType,
        duration
      );

      Alert.alert(
        'Success!',
        'Your workout video has been submitted for approval. You\'ll be notified once it\'s reviewed.',
        [{text: 'OK', onPress: () => loadMyVideos()}]
      );
    } catch (error: any) {
      console.error('Error uploading video:', error);
      Alert.alert('Error', 'Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderVideoItem = ({item}: {item: Video}) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'approved':
          return '#10b981';
        case 'rejected':
          return '#ef4444';
        default:
          return '#f59e0b';
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'approved':
          return 'Approved';
        case 'rejected':
          return 'Rejected';
        default:
          return 'Pending Review';
      }
    };

    return (
      <View style={styles.videoItem}>
        <View style={styles.videoHeader}>
          <Text style={styles.videoTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, {backgroundColor: getStatusColor(item.status)}]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
        
        <Text style={styles.videoExercise}>{item.exercise_type}</Text>
        
        {item.description && (
          <Text style={styles.videoDescription}>{item.description}</Text>
        )}
        
        <View style={styles.videoFooter}>
          <Text style={styles.videoDuration}>
            Duration: {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
          </Text>
          <Text style={styles.videoDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        
        {item.status === 'rejected' && item.rejection_reason && (
          <View style={styles.rejectionContainer}>
            <Text style={styles.rejectionLabel}>Rejection Reason:</Text>
            <Text style={styles.rejectionReason}>{item.rejection_reason}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gym Member Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back, {user?.full_name}!</Text>
      </View>

      {/* Tab Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabScrollView}
        contentContainerStyle={styles.tabContainer}
      >
        <TouchableOpacity
          style={[styles.tab, activeTab === 'feed' && styles.activeTab]}
          onPress={() => setActiveTab('feed')}>
          <Text style={[styles.tabText, activeTab === 'feed' && styles.activeTabText]}>
            📰 Feed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'workouts' && styles.activeTab]}
          onPress={() => setActiveTab('workouts')}>
          <Text style={[styles.tabText, activeTab === 'workouts' && styles.activeTabText]}>
            💪 Workouts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'challenges' && styles.activeTab]}
          onPress={() => setActiveTab('challenges')}>
          <Text style={[styles.tabText, activeTab === 'challenges' && styles.activeTabText]}>
            🏆 Challenges
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'prs' && styles.activeTab]}
          onPress={() => setActiveTab('prs')}>
          <Text style={[styles.tabText, activeTab === 'prs' && styles.activeTabText]}>
            📊 PRs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
          onPress={() => setActiveTab('videos')}>
          <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>
            📹 Videos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}>
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
            ⚙️ Settings
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'feed' && (
          <SocialFeed feedType="home" gymId={user?.gym_id} />
        )}

        {activeTab === 'workouts' && (
          <View style={styles.workoutTab}>
            {activeWorkout ? (
              <WorkoutTimer 
                onWorkoutComplete={(duration) => {
                  console.log('Workout completed in', duration, 'seconds');
                  setActiveWorkout(null);
                }}
              />
            ) : (
              <ScrollView style={styles.scrollContainer}>
                <View style={styles.menuContainer}>
                  <TouchableOpacity 
                    style={[styles.menuItem, styles.recordVideoItem]} 
                    onPress={() => setShowWorkoutBuilder(true)}
                  >
                    <Text style={styles.menuText}>🏗️ Create Workout Plan</Text>
                    <Text style={styles.menuDescription}>
                      Build your custom workout routine
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {/* Navigate to browse workouts */}}
                  >
                    <Text style={styles.menuText}>📋 Browse Workout Plans</Text>
                    <Text style={styles.menuDescription}>
                      Discover popular workout routines
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        )}

        {activeTab === 'challenges' && (
          <ChallengeList 
            onChallengeJoin={(challenge) => {
              console.log('Joined challenge:', challenge.name);
            }}
          />
        )}

        {activeTab === 'prs' && (
          <PRDashboard />
        )}

        {activeTab === 'videos' && (
          <ScrollView style={styles.scrollContainer}>
            <View style={styles.menuContainer}>
              <TouchableOpacity 
                style={[styles.menuItem, styles.recordVideoItem]} 
                onPress={() => setShowVideoRecorder(true)}
                disabled={uploading}
              >
                <Text style={styles.menuText}>📹 Record Workout Video</Text>
                <Text style={styles.menuDescription}>
                  {uploading ? 'Uploading video...' : 'Record and submit your workout set'}
                </Text>
                {uploading && <ActivityIndicator size="small" color="#059669" style={{marginTop: 10}} />}
              </TouchableOpacity>
            </View>

            <View style={styles.videosSection}>
              <Text style={styles.sectionTitle}>My Workout Videos</Text>
              
              {loading ? (
                <ActivityIndicator size="large" color="#059669" style={{marginTop: 20}} />
              ) : myVideos.length === 0 ? (
                <Text style={styles.emptyText}>
                  No videos uploaded yet. Record your first workout video!
                </Text>
              ) : (
                <FlatList
                  data={myVideos}
                  renderItem={renderVideoItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          </ScrollView>
        )}

        {activeTab === 'settings' && (
          <ScrollView style={styles.scrollContainer}>
            <View style={styles.settingsContainer}>
              <Text style={styles.sectionTitle}>Account Settings</Text>
              
              <TouchableOpacity style={styles.settingItem}>
                <Text style={styles.settingText}>👤 Edit Profile</Text>
                <Text style={styles.settingDescription}>Update your personal information</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingItem}>
                <Text style={styles.settingText}>🔒 Change Password</Text>
                <Text style={styles.settingDescription}>Update your account password</Text>
              </TouchableOpacity>
              
              <Text style={styles.sectionTitle}>Preferences</Text>
              
              <TouchableOpacity style={styles.settingItem}>
                <Text style={styles.settingText}>🔔 Notifications</Text>
                <Text style={styles.settingDescription}>Manage your notification preferences</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingItem}>
                <Text style={styles.settingText}>🏋️ Units</Text>
                <Text style={styles.settingDescription}>Choose metric or imperial units</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingItem}>
                <Text style={styles.settingText}>⏱️ Default Rest Time</Text>
                <Text style={styles.settingDescription}>Set your preferred rest period</Text>
              </TouchableOpacity>
              
              <Text style={styles.sectionTitle}>Privacy & Security</Text>
              
              <TouchableOpacity style={styles.settingItem}>
                <Text style={styles.settingText}>🔐 Privacy Settings</Text>
                <Text style={styles.settingDescription}>Control who can see your activity</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingItem}>
                <Text style={styles.settingText}>📊 Data & Analytics</Text>
                <Text style={styles.settingDescription}>Manage your data preferences</Text>
              </TouchableOpacity>
              
              <Text style={styles.sectionTitle}>Support</Text>
              
              <TouchableOpacity style={styles.settingItem}>
                <Text style={styles.settingText}>❓ Help & Support</Text>
                <Text style={styles.settingDescription}>Get help and contact support</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingItem}>
                <Text style={styles.settingText}>📝 Send Feedback</Text>
                <Text style={styles.settingDescription}>Share your thoughts with us</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingItem}>
                <Text style={styles.settingText}>⭐ Rate App</Text>
                <Text style={styles.settingDescription}>Rate GymEZ in the app store</Text>
              </TouchableOpacity>
              
              <Text style={styles.sectionTitle}>About</Text>
              
              <TouchableOpacity style={styles.settingItem}>
                <Text style={styles.settingText}>ℹ️ App Info</Text>
                <Text style={styles.settingDescription}>Version, terms, and policies</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.settingItem, styles.signOutItem]} 
                onPress={handleSignOut}
              >
                <Text style={[styles.settingText, styles.signOutSettingText]}>🚪 Sign Out</Text>
                <Text style={styles.settingDescription}>Log out of your account</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>

      <VideoRecorder
        visible={showVideoRecorder}
        onClose={() => setShowVideoRecorder(false)}
        onVideoRecorded={handleVideoRecorded}
      />

      <Modal
        visible={showWorkoutBuilder}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowWorkoutBuilder(false)}>
              <Text style={styles.modalCloseButton}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Workout Plan</Text>
          </View>
          <WorkoutBuilder
            onSave={(workoutPlan) => {
              setShowWorkoutBuilder(false);
              Alert.alert('Success', 'Workout plan created successfully!');
            }}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#059669',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#a7f3d0',
  },
  scrollContainer: {
    flex: 1,
  },
  menuContainer: {
    padding: 20,
  },
  menuItem: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordVideoItem: {
    borderWidth: 2,
    borderColor: '#059669',
    backgroundColor: '#ecfdf5',
  },
  menuText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  menuDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  videosSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  videoItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  videoExercise: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  videoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoDuration: {
    fontSize: 12,
    color: '#9ca3af',
  },
  videoDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  rejectionContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  rejectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 4,
  },
  rejectionReason: {
    fontSize: 12,
    color: '#b91c1c',
  },
  signOutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabScrollView: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    minWidth: 80,
  },
  activeTab: {
    backgroundColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#fff',
  },
  tabContent: {
    flex: 1,
  },
  workoutTab: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  modalCloseButton: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  settingsContainer: {
    padding: 20,
  },
  settingItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  signOutItem: {
    borderWidth: 1,
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  signOutSettingText: {
    color: '#ef4444',
  },
});

export default GymMemberDashboard;
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {useAuth} from '../services/auth';
import {VideoService} from '../services/videoService';
import {Video} from '../types';
import {WorkoutBuilder} from '../components/WorkoutBuilder';
import {WorkoutTimer} from '../components/WorkoutTimer';
import VideoRecorder from '../components/VideoRecorder';

const WorkoutsScreen = () => {
  const {user} = useAuth();
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [showWorkoutBuilder, setShowWorkoutBuilder] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [myVideos, setMyVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

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
    if (!user?.id || !user?.gym_id) return;

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
      loadMyVideos();
    } catch (error: any) {
      console.error('Error uploading video:', error);
    }
  };

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
        return 'Pending';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Workouts</Text>
          <Text style={styles.headerSubtitle}>Track your training progress</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setShowVideoRecorder(true)}
          >
            <Text style={styles.actionIcon}>📹</Text>
            <Text style={styles.actionTitle}>Record Video</Text>
            <Text style={styles.actionDescription}>Record your workout set</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setShowTimer(true)}
          >
            <Text style={styles.actionIcon}>⏱️</Text>
            <Text style={styles.actionTitle}>Workout Timer</Text>
            <Text style={styles.actionDescription}>Track rest periods</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setShowWorkoutBuilder(true)}
          >
            <Text style={styles.actionIcon}>🏗️</Text>
            <Text style={styles.actionTitle}>Create Plan</Text>
            <Text style={styles.actionDescription}>Build a workout routine</Text>
          </TouchableOpacity>
        </View>

        {/* My Workout Videos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Workout Videos</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#10b981" style={{marginTop: 20}} />
          ) : myVideos.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📹</Text>
              <Text style={styles.emptyText}>No videos yet</Text>
              <Text style={styles.emptyDescription}>
                Record your first workout video to start tracking your progress!
              </Text>
            </View>
          ) : (
            <View style={styles.videoList}>
              {myVideos.slice(0, 5).map(video => (
                <View key={video.id} style={styles.videoCard}>
                  <View style={styles.videoHeader}>
                    <Text style={styles.videoTitle}>{video.title}</Text>
                    <View style={[styles.statusBadge, {backgroundColor: getStatusColor(video.status)}]}>
                      <Text style={styles.statusText}>{getStatusText(video.status)}</Text>
                    </View>
                  </View>
                  <Text style={styles.videoExercise}>{video.exercise_type}</Text>
                  {video.description && (
                    <Text style={styles.videoDescription} numberOfLines={2}>
                      {video.description}
                    </Text>
                  )}
                  <Text style={styles.videoDate}>
                    {new Date(video.created_at).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

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
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowWorkoutBuilder(false)}>
              <Text style={styles.closeButton}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Workout Plan</Text>
          </View>
          <WorkoutBuilder
            onSave={(workoutPlan) => {
              setShowWorkoutBuilder(false);
            }}
          />
        </View>
      </Modal>

      {showTimer && (
        <Modal
          visible={showTimer}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowTimer(false)}>
                <Text style={styles.closeButton}>✕ Close</Text>
              </TouchableOpacity>
            </View>
            <WorkoutTimer
              onWorkoutComplete={(duration) => {
                setShowTimer(false);
              }}
            />
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  videoList: {
    gap: 12,
  },
  videoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  videoExercise: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  videoDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
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
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
});

export default WorkoutsScreen;


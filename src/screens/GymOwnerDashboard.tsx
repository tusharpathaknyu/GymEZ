import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import {useAuth} from '../services/auth';
import {VideoService} from '../services/videoService';
import {Video} from '../types';

interface VideoApprovalModalProps {
  visible: boolean;
  video: Video | null;
  onClose: () => void;
  onApprove: (videoId: string) => void;
  onReject: (videoId: string, reason: string) => void;
}

const VideoApprovalModal: React.FC<VideoApprovalModalProps> = ({
  visible,
  video,
  onClose,
  onApprove,
  onReject,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleApprove = () => {
    if (video) {
      onApprove(video.id);
      onClose();
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }
    
    if (video) {
      onReject(video.id, rejectionReason);
      setRejectionReason('');
      setShowRejectForm(false);
      onClose();
    }
  };

  if (!video) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Review Workout Video</Text>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.videoDetails}>
              <Text style={styles.videoDetailTitle}>{video.title}</Text>
              <Text style={styles.videoDetailExercise}>Exercise: {video.exercise_type}</Text>
              
              {video.description && (
                <Text style={styles.videoDetailDescription}>{video.description}</Text>
              )}
              
              <Text style={styles.videoDetailDuration}>
                Duration: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
              </Text>
              
              <Text style={styles.videoDetailMember}>
                Submitted by: {(video as any).profiles?.full_name || 'Unknown Member'}
              </Text>
              
              <Text style={styles.videoDetailDate}>
                Submitted: {new Date(video.created_at).toLocaleDateString()}
              </Text>
            </View>
            
            {showRejectForm && (
              <View style={styles.rejectForm}>
                <Text style={styles.rejectFormTitle}>Rejection Reason</Text>
                <TextInput
                  style={styles.rejectInput}
                  placeholder="Please provide a reason for rejection..."
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  multiline
                  numberOfLines={4}
                />
              </View>
            )}
          </ScrollView>
          
          <View style={styles.modalActions}>
            {!showRejectForm ? (
              <>
                <TouchableOpacity
                  style={[styles.modalButton, styles.approveButton]}
                  onPress={handleApprove}>
                  <Text style={styles.modalButtonText}>✓ Approve</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.rejectButton]}
                  onPress={() => setShowRejectForm(true)}>
                  <Text style={styles.modalButtonText}>✕ Reject</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowRejectForm(false);
                    setRejectionReason('');
                  }}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmRejectButton]}
                  onPress={handleReject}>
                  <Text style={styles.modalButtonText}>Confirm Reject</Text>
                </TouchableOpacity>
              </>
            )}
            
            <TouchableOpacity
              style={[styles.modalButton, styles.closeButton]}
              onPress={onClose}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const GymOwnerDashboard = () => {
  const {user, signOut} = useAuth();
  const [pendingVideos, setPendingVideos] = useState<Video[]>([]);
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    if (user?.id) {
      loadVideos();
    }
  }, [user]);

  const loadVideos = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // For demo purposes, we'll use user.id as gym_id
      // In production, you'd get the gym_id from the gym owner's profile
      const gymId = user.id;
      
      const [pending, all] = await Promise.all([
        VideoService.getPendingVideos(gymId),
        VideoService.getGymVideos(gymId),
      ]);
      
      setPendingVideos(pending);
      setAllVideos(all);
    } catch (error: any) {
      console.error('Error loading videos:', error);
      Alert.alert('Error', 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoPress = (video: Video) => {
    setSelectedVideo(video);
    setShowApprovalModal(true);
  };

  const handleApproveVideo = async (videoId: string) => {
    if (!user?.id) return;

    try {
      await VideoService.approveVideo(videoId, user.id);
      Alert.alert('Success', 'Video has been approved');
      loadVideos(); // Refresh the lists
    } catch (error: any) {
      console.error('Error approving video:', error);
      Alert.alert('Error', 'Failed to approve video');
    }
  };

  const handleRejectVideo = async (videoId: string, reason: string) => {
    if (!user?.id) return;

    try {
      await VideoService.rejectVideo(videoId, user.id, reason);
      Alert.alert('Success', 'Video has been rejected');
      loadVideos(); // Refresh the lists
    } catch (error: any) {
      console.error('Error rejecting video:', error);
      Alert.alert('Error', 'Failed to reject video');
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
      <TouchableOpacity
        style={styles.videoItem}
        onPress={() => handleVideoPress(item)}>
        <View style={styles.videoHeader}>
          <Text style={styles.videoTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, {backgroundColor: getStatusColor(item.status)}]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
        
        <Text style={styles.videoMember}>
          Member: {(item as any).profiles?.full_name || 'Unknown'}
        </Text>
        <Text style={styles.videoExercise}>{item.exercise_type}</Text>
        
        <View style={styles.videoFooter}>
          <Text style={styles.videoDuration}>
            {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
          </Text>
          <Text style={styles.videoDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gym Owner Dashboard</Text>
        <Text style={styles.subtitle}>Welcome, {user?.full_name}!</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Manage Gym</Text>
            <Text style={styles.menuDescription}>Update gym information and settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Members</Text>
            <Text style={styles.menuDescription}>View and manage gym members</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Revenue</Text>
            <Text style={styles.menuDescription}>Track payments and revenue</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.videosSection}>
          <Text style={styles.sectionTitle}>Member Workout Videos</Text>
          
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
              onPress={() => setActiveTab('pending')}>
              <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
                Pending ({pendingVideos.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'all' && styles.activeTab]}
              onPress={() => setActiveTab('all')}>
              <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                All Videos ({allVideos.length})
              </Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" style={{marginTop: 20}} />
          ) : (
            <FlatList
              data={activeTab === 'pending' ? pendingVideos : allVideos}
              renderItem={renderVideoItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <Text style={styles.emptyText}>
                  {activeTab === 'pending' 
                    ? 'No pending videos to review' 
                    : 'No videos submitted yet'}
                </Text>
              )}
            />
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <VideoApprovalModal
        visible={showApprovalModal}
        video={selectedVideo}
        onClose={() => {
          setShowApprovalModal(false);
          setSelectedVideo(null);
        }}
        onApprove={handleApproveVideo}
        onReject={handleRejectVideo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#2563eb',
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
    color: '#bfdbfe',
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    marginRight: 8,
    borderRadius: 8,
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
  videoMember: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
    marginBottom: 4,
  },
  videoExercise: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalContent: {
    maxHeight: 400,
  },
  videoDetails: {
    marginBottom: 20,
  },
  videoDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  videoDetailExercise: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 6,
  },
  videoDetailDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  videoDetailDuration: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
  },
  videoDetailMember: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
    marginBottom: 6,
  },
  videoDetailDate: {
    fontSize: 14,
    color: '#9ca3af',
  },
  rejectForm: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  rejectFormTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 10,
  },
  rejectInput: {
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    marginBottom: 10,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  confirmRejectButton: {
    backgroundColor: '#dc2626',
  },
  closeButton: {
    backgroundColor: '#374151',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default GymOwnerDashboard;
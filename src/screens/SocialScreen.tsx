import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import {useAuth} from '../services/auth';
import {SocialService} from '../services/socialService';
import {Post, PostComment} from '../types';
import SocialFeed from '../components/SocialFeed';

const SocialScreen = () => {
  const {user} = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'general' | 'workout'>('general');

  const handleCreatePost = async () => {
    if (!postContent.trim() || !user?.id) return;

    try {
      await SocialService.createPost(user.id, postContent, postType, undefined, user.gym_id);
      setShowCreatePost(false);
      setPostContent('');
      Alert.alert('Success', 'Post created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Social Feed</Text>
          <Text style={styles.headerSubtitle}>Connect with your gym community</Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreatePost(true)}
        >
          <Text style={styles.createButtonText}>➕ Create</Text>
        </TouchableOpacity>
      </View>

      <SocialFeed feedType="home" gymId={user?.gym_id} />

      <Modal
        visible={showCreatePost}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreatePost(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Post</Text>
              <TouchableOpacity onPress={() => setShowCreatePost(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.postTypeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  postType === 'general' && styles.typeButtonActive,
                ]}
                onPress={() => setPostType('general')}
              >
                <Text style={[
                  styles.typeButtonText,
                  postType === 'general' && styles.typeButtonTextActive,
                ]}>
                  General
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  postType === 'workout' && styles.typeButtonActive,
                ]}
                onPress={() => setPostType('workout')}
              >
                <Text style={[
                  styles.typeButtonText,
                  postType === 'workout' && styles.typeButtonTextActive,
                ]}>
                  Workout
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.postInput}
              placeholder="What's on your mind?"
              value={postContent}
              onChangeText={setPostContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitButton, !postContent.trim() && styles.submitButtonDisabled]}
              onPress={handleCreatePost}
              disabled={!postContent.trim()}
            >
              <Text style={styles.submitButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  createButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
  },
  postTypeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  typeButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  typeButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  postInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    fontSize: 16,
    color: '#111827',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SocialScreen;


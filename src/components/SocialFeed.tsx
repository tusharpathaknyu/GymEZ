import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import {SocialService} from '../services/socialService';
import {useAuth} from '../services/auth';
import {Post, PostComment} from '../types';

interface SocialFeedProps {
  gymId?: string;
  userId?: string; // If provided, shows user's posts only
  feedType?: 'home' | 'gym' | 'user';
}

const SocialFeed: React.FC<SocialFeedProps> = ({
  gymId,
  userId,
  feedType = 'home'
}) => {
  const {user} = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    loadFeed();
  }, [feedType, gymId, userId]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      let feedPosts: Post[] = [];

      switch (feedType) {
        case 'home':
          feedPosts = await SocialService.getFeedPosts(user!.id, user!.gym_id);
          break;
        case 'gym':
          if (gymId) {
            feedPosts = await SocialService.getGymPosts(gymId);
          }
          break;
        case 'user':
          if (userId) {
            feedPosts = await SocialService.getUserPosts(userId);
          }
          break;
      }

      setPosts(feedPosts);
    } catch (error) {
      console.error('Error loading feed:', error);
      Alert.alert('Error', 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  const handleLike = async (postId: string) => {
    try {
      const isLiked = await SocialService.toggleLike(postId, user!.id);
      
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                is_liked: isLiked,
                likes_count: isLiked ? (post.likes_count || 0) + 1 : Math.max((post.likes_count || 0) - 1, 0),
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const handleComment = async (post: Post) => {
    setSelectedPost(post);
    setShowComments(true);
    try {
      const postComments = await SocialService.getPostComments(post.id);
      setComments(postComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim() || !selectedPost) return;

    try {
      setCommentLoading(true);
      const comment = await SocialService.addComment(
        selectedPost.id,
        user!.id,
        newComment.trim()
      );

      setComments(prev => [...prev, comment]);
      setNewComment('');

      // Update post comments count
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === selectedPost.id
            ? {...post, comments_count: (post.comments_count || 0) + 1}
            : post
        )
      );
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else {
      return `${days}d`;
    }
  };

  const renderPost = ({item: post}: {item: Post}) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          {post.user?.profile_picture && (
            <Image 
              source={{uri: post.user.profile_picture}} 
              style={styles.avatar}
            />
          )}
          <View>
            <Text style={styles.userName}>{post.user?.full_name || 'Unknown User'}</Text>
            {post.user?.username && (
              <Text style={styles.username}>@{post.user.username}</Text>
            )}
          </View>
        </View>
        <Text style={styles.timeAgo}>{formatTime(post.created_at)}</Text>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      {post.post_type === 'pr_achievement' && (
        <View style={styles.prBadge}>
          <Text style={styles.prBadgeText}>🏆 PR Achievement</Text>
        </View>
      )}

      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(post.id)}>
          <Text style={[styles.actionText, post.is_liked && styles.likedText]}>
            {post.is_liked ? '❤️' : '🤍'} {post.likes_count || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleComment(post)}>
          <Text style={styles.actionText}>💬 {post.comments_count || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderComment = ({item: comment}: {item: PostComment}) => (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentUser}>{comment.user?.full_name || 'Unknown User'}</Text>
        <Text style={styles.commentTime}>{formatTime(comment.created_at)}</Text>
      </View>
      <Text style={styles.commentContent}>{comment.content}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.feedContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Comments Modal */}
      <Modal
        visible={showComments}
        animationType="slide"
        onRequestClose={() => setShowComments(false)}>
        <View style={styles.commentsContainer}>
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>Comments</Text>
            <TouchableOpacity onPress={() => setShowComments(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={item => item.id}
            style={styles.commentsList}
          />

          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
              onPress={submitComment}
              disabled={!newComment.trim() || commentLoading}>
              <Text style={styles.sendButtonText}>
                {commentLoading ? '...' : 'Send'}
              </Text>
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
  feedContainer: {
    padding: 15,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#e5e7eb',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  username: {
    fontSize: 14,
    color: '#6b7280',
  },
  timeAgo: {
    fontSize: 12,
    color: '#9ca3af',
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 15,
  },
  prBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  prBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  likedText: {
    color: '#ef4444',
  },
  commentsContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  commentsList: {
    flex: 1,
    padding: 15,
  },
  commentItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  commentTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'flex-end',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default SocialFeed;
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Post } from '../types';
import ReactionButtons from './ReactionButtons';
import MentionSystem from './MentionSystem';

interface EnhancedPostProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (post: Post) => void;
  formatTime: (dateString: string) => string;
}

const EnhancedPost: React.FC<EnhancedPostProps> = ({
  post,
  onLike,
  onComment,
  formatTime,
}) => {
  return (
    <View style={styles.postCard}>
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          {post.user?.profile_picture ? (
            <Image
              source={{ uri: post.user.profile_picture }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {post.user?.full_name?.charAt(0) || 'U'}
              </Text>
            </View>
          )}
          <View style={styles.userInfoText}>
            <Text style={styles.userName}>
              {post.user?.full_name || 'Unknown User'}
            </Text>
            {post.user?.username && (
              <Text style={styles.username}>@{post.user.username}</Text>
            )}
          </View>
        </View>
        <View>
          <Text style={styles.timeAgo}>{formatTime(post.created_at)}</Text>
        </View>
      </View>

      {/* Content */}
      <MentionSystem content={post.content} />

      {/* PR Badge */}
      {post.post_type === 'pr_achievement' && (
        <View style={styles.prBadge}>
          <Text style={styles.prBadgeText}>🏆 PR Achievement</Text>
        </View>
      )}

      {/* Post Image Placeholder */}
      {post.video_id && (
        <View style={styles.mediaPlaceholder}>
          <Text style={styles.mediaText}>🎥 Video Available</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.postActions}>
        <ReactionButtons
          postId={post.id}
          initialLikes={post.likes_count || 0}
          onLike={() => onLike(post.id)}
        />

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onComment(post)}
        >
          <Text style={styles.actionText}>💬 {post.comments_count || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>📤 Share</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      {((post.likes_count || 0) > 0 || (post.comments_count || 0) > 0) && (
        <View style={styles.quickStats}>
          {(post.likes_count || 0) > 0 && (
            <Text style={styles.quickStatText}>
              ❤️ {post.likes_count || 0}{' '}
              {(post.likes_count || 0) === 1 ? 'like' : 'likes'}
            </Text>
          )}
          {(post.comments_count || 0) > 0 && (
            <Text style={styles.quickStatText}>
              💬 {post.comments_count || 0}{' '}
              {(post.comments_count || 0) === 1 ? 'comment' : 'comments'}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfoText: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  username: {
    fontSize: 13,
    color: '#6b7280',
  },
  timeAgo: {
    fontSize: 12,
    color: '#9ca3af',
  },
  prBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  prBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400e',
  },
  mediaPlaceholder: {
    height: 200,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginTop: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    marginTop: 12,
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
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f9fafb',
    marginTop: 8,
  },
  quickStatText: {
    fontSize: 13,
    color: '#6b7280',
  },
});

export default EnhancedPost;

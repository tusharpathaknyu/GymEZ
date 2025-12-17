import { supabase } from './supabase';
import { Post, PostComment } from '../types';

export class SocialService {
  /**
   * Create a new post
   */
  static async createPost(
    userId: string,
    content: string,
    postType: 'general' | 'pr_achievement' | 'workout',
    videoId?: string,
    prId?: string,
    gymId?: string,
  ): Promise<Post> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          content,
          post_type: postType,
          video_id: videoId,
          pr_id: prId,
          gym_id: gymId,
        })
        .select(
          `
          *,
          profiles!posts_user_id_fkey(full_name, username, profile_picture)
        `,
        )
        .single();

      if (error) {
        throw new Error(`Failed to create post: ${error.message}`);
      }

      return {
        ...data,
        user: data.profiles,
        likes_count: 0,
        comments_count: 0,
        is_liked: false,
      } as Post;
    } catch (error) {
      console.error('Create post error:', error);
      throw error;
    }
  }

  /**
   * Get feed posts (following + gym)
   */
  static async getFeedPosts(
    userId: string,
    gymId?: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Post[]> {
    try {
      // Get posts from people the user follows + gym posts
      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          *,
          profiles!posts_user_id_fkey(full_name, username, profile_picture),
          post_likes!left(id),
          post_comments!left(id)
        `,
        )
        .or(
          `user_id.in.(${await this.getFollowingIds(
            userId,
          )}),gym_id.eq.${gymId}`,
        )
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch feed: ${error.message}`);
      }

      return this.formatPosts(data, userId);
    } catch (error) {
      console.error('Get feed posts error:', error);
      // Return empty array instead of throwing
      return [];
    }
  }

  /**
   * Get gym-specific posts
   */
  static async getGymPosts(
    gymId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Post[]> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          *,
          profiles!posts_user_id_fkey(full_name, username, profile_picture),
          post_likes!left(id),
          post_comments!left(id)
        `,
        )
        .eq('gym_id', gymId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch gym posts: ${error.message}`);
      }

      return this.formatPosts(data);
    } catch (error) {
      console.error('Get gym posts error:', error);
      throw error;
    }
  }

  /**
   * Get user's posts
   */
  static async getUserPosts(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Post[]> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          *,
          profiles!posts_user_id_fkey(full_name, username, profile_picture),
          post_likes!left(id),
          post_comments!left(id)
        `,
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch user posts: ${error.message}`);
      }

      return this.formatPosts(data, userId);
    } catch (error) {
      console.error('Get user posts error:', error);
      throw error;
    }
  }

  /**
   * Add reaction to a post (supports 5 reaction types)
   */
  static async addReaction(
    postId: string,
    userId: string,
    reactionType: string = 'like',
  ): Promise<boolean> {
    try {
      // Check if user already reacted
      const { data: existingReaction } = await supabase
        .from('post_likes')
        .select('id, reaction_type')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingReaction) {
        // Update reaction type
        if (existingReaction.reaction_type === reactionType) {
          // Same reaction - remove it
          await supabase
            .from('post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', userId);
          return false;
        } else {
          // Different reaction - update it
          await supabase
            .from('post_likes')
            .update({ reaction_type: reactionType })
            .eq('post_id', postId)
            .eq('user_id', userId);
          return true;
        }
      }

      // Add new reaction
      await supabase.from('post_likes').insert({
        post_id: postId,
        user_id: userId,
        reaction_type: reactionType,
      });

      return true;
    } catch (error) {
      console.error('Add reaction error:', error);
      throw error;
    }
  }

  /**
   * Like/Unlike a post (backward compatibility)
   */
  static async toggleLike(postId: string, userId: string): Promise<boolean> {
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('id', existingLike.id);

        if (error) {
          throw error;
        }
        return false;
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: userId });

        if (error) {
          throw error;
        }
        return true;
      }
    } catch (error) {
      console.error('Toggle like error:', error);
      throw error;
    }
  }

  /**
   * Add comment to post
   */
  static async addComment(
    postId: string,
    userId: string,
    content: string,
  ): Promise<PostComment> {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content,
        })
        .select(
          `
          *,
          profiles!post_comments_user_id_fkey(full_name, username, profile_picture)
        `,
        )
        .single();

      if (error) {
        throw new Error(`Failed to add comment: ${error.message}`);
      }

      return {
        ...data,
        user: data.profiles,
      } as PostComment;
    } catch (error) {
      console.error('Add comment error:', error);
      throw error;
    }
  }

  /**
   * Get post comments
   */
  static async getPostComments(postId: string): Promise<PostComment[]> {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(
          `
          *,
          profiles!post_comments_user_id_fkey(full_name, username, profile_picture)
        `,
        )
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch comments: ${error.message}`);
      }

      return data.map(comment => ({
        ...comment,
        user: comment.profiles,
      })) as PostComment[];
    } catch (error) {
      console.error('Get post comments error:', error);
      throw error;
    }
  }

  /**
   * Follow/Unfollow a user
   */
  static async toggleFollow(
    followerId: string,
    followingId: string,
  ): Promise<boolean> {
    try {
      // Check if already following
      const { data: existingFollow } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();

      if (existingFollow) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('id', existingFollow.id);

        if (error) {
          throw error;
        }
        return false;
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: followerId, following_id: followingId });

        if (error) {
          throw error;
        }
        return true;
      }
    } catch (error) {
      console.error('Toggle follow error:', error);
      throw error;
    }
  }

  /**
   * Get user's followers
   */
  static async getFollowers(
    userId: string,
  ): Promise<{ id: string; full_name: string; username?: string }[]> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(
          `
          profiles!follows_follower_id_fkey(id, full_name, username)
        `,
        )
        .eq('following_id', userId);

      if (error) {
        throw new Error(`Failed to fetch followers: ${error.message}`);
      }

      return (data as any)?.map((f: any) => f.profiles) || [];
    } catch (error) {
      console.error('Get followers error:', error);
      throw error;
    }
  }

  /**
   * Get users that user is following
   */
  static async getFollowing(
    userId: string,
  ): Promise<{ id: string; full_name: string; username?: string }[]> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(
          `
          profiles!follows_following_id_fkey(id, full_name, username)
        `,
        )
        .eq('follower_id', userId);

      if (error) {
        throw new Error(`Failed to fetch following: ${error.message}`);
      }

      return (data as any)?.map((f: any) => f.profiles) || [];
    } catch (error) {
      console.error('Get following error:', error);
      throw error;
    }
  }

  /**
   * Search users
   */
  static async searchUsers(
    query: string,
    gymId?: string,
    limit: number = 20,
  ): Promise<
    { id: string; full_name: string; username?: string; gym_id?: string }[]
  > {
    try {
      let supabaseQuery = supabase
        .from('profiles')
        .select('id, full_name, username, gym_id, profile_picture')
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(limit);

      if (gymId) {
        supabaseQuery = supabaseQuery.eq('gym_id', gymId);
      }

      const { data, error } = await supabaseQuery;

      if (error) {
        throw new Error(`Failed to search users: ${error.message}`);
      }

      return data as {
        id: string;
        full_name: string;
        username?: string;
        gym_id?: string;
      }[];
    } catch (error) {
      console.error('Search users error:', error);
      throw error;
    }
  }

  // Helper methods
  private static async getFollowingIds(userId: string): Promise<string> {
    try {
      const { data } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

      const ids = data?.map(f => f.following_id) || [];
      ids.push(userId); // Include user's own posts
      return ids.join(',');
    } catch (error) {
      return userId; // Fallback to just user's posts
    }
  }

  private static formatPosts(data: any[], currentUserId?: string): Post[] {
    return data.map(post => ({
      ...post,
      user: post.profiles,
      likes_count: post.post_likes?.length || 0,
      comments_count: post.post_comments?.length || 0,
      is_liked: currentUserId
        ? post.post_likes?.some(
            (like: any) => like.user_id === currentUserId,
          ) || false
        : false,
    })) as Post[];
  }
}

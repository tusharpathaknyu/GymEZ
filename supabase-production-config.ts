// 🚀 GYMEZ Production Supabase Configuration
// Replace your src/services/supabase.ts with this after setting up production

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// ============================================
// PRODUCTION SUPABASE CONFIGURATION
// ============================================
// TODO: Replace these with your actual production Supabase credentials
// Get them from: https://supabase.com → Your Project → Settings → API

const supabaseUrl = 'https://[YOUR-PROJECT-ID].supabase.co'; // Replace with your project URL
const supabaseAnonKey = '[YOUR-ANON-KEY]'; // Replace with your anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ============================================
// DATABASE TYPES FOR TYPESCRIPT SUPPORT
// ============================================
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_type: 'gym_owner' | 'gym_member';
          email: string;
          full_name: string;
          username?: string;
          bio?: string;
          profile_picture?: string;
          gym_id?: string;
          gym_start_date?: string;
          is_private: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_type?: 'gym_owner' | 'gym_member';
          email: string;
          full_name: string;
          username?: string;
          bio?: string;
          profile_picture?: string;
          gym_id?: string;
          gym_start_date?: string;
          is_private?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_type?: 'gym_owner' | 'gym_member';
          email?: string;
          full_name?: string;
          username?: string;
          bio?: string;
          profile_picture?: string;
          gym_id?: string;
          gym_start_date?: string;
          is_private?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      gyms: {
        Row: {
          id: string;
          name: string;
          address: string;
          pincode: string;
          latitude?: number;
          longitude?: number;
          phone?: string;
          email?: string;
          description?: string;
          facilities?: string[];
          membership_cost?: number;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          pincode: string;
          latitude?: number;
          longitude?: number;
          phone?: string;
          email?: string;
          description?: string;
          facilities?: string[];
          membership_cost?: number;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          pincode?: string;
          latitude?: number;
          longitude?: number;
          phone?: string;
          email?: string;
          description?: string;
          facilities?: string[];
          membership_cost?: number;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          post_type: string;
          video_id?: string;
          pr_id?: string;
          gym_id?: string;
          likes_count: number;
          comments_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          post_type?: string;
          video_id?: string;
          pr_id?: string;
          gym_id?: string;
          likes_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          post_type?: string;
          video_id?: string;
          pr_id?: string;
          gym_id?: string;
          likes_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      personal_records: {
        Row: {
          id: string;
          user_id: string;
          exercise_type:
            | 'benchpress'
            | 'squat'
            | 'deadlift'
            | 'pullup'
            | 'pushup'
            | 'dip';
          weight?: number;
          reps?: number;
          one_rep_max?: number;
          video_id?: string;
          is_approved: boolean;
          gym_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exercise_type:
            | 'benchpress'
            | 'squat'
            | 'deadlift'
            | 'pullup'
            | 'pushup'
            | 'dip';
          weight?: number;
          reps?: number;
          one_rep_max?: number;
          video_id?: string;
          is_approved?: boolean;
          gym_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exercise_type?:
            | 'benchpress'
            | 'squat'
            | 'deadlift'
            | 'pullup'
            | 'pushup'
            | 'dip';
          weight?: number;
          reps?: number;
          one_rep_max?: number;
          video_id?: string;
          is_approved?: boolean;
          gym_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      videos: {
        Row: {
          id: string;
          user_id: string;
          file_path: string;
          thumbnail_path?: string;
          duration?: number;
          exercise_type?:
            | 'benchpress'
            | 'squat'
            | 'deadlift'
            | 'pullup'
            | 'pushup'
            | 'dip';
          weight?: number;
          reps?: number;
          is_approved: boolean;
          approved_by?: string;
          gym_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_path: string;
          thumbnail_path?: string;
          duration?: number;
          exercise_type?:
            | 'benchpress'
            | 'squat'
            | 'deadlift'
            | 'pullup'
            | 'pushup'
            | 'dip';
          weight?: number;
          reps?: number;
          is_approved?: boolean;
          approved_by?: string;
          gym_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_path?: string;
          thumbnail_path?: string;
          duration?: number;
          exercise_type?:
            | 'benchpress'
            | 'squat'
            | 'deadlift'
            | 'pullup'
            | 'pushup'
            | 'dip';
          weight?: number;
          reps?: number;
          is_approved?: boolean;
          approved_by?: string;
          gym_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_type: 'gym_owner' | 'gym_member';
      exercise_type:
        | 'benchpress'
        | 'squat'
        | 'deadlift'
        | 'pullup'
        | 'pushup'
        | 'dip';
      difficulty_level: 'beginner' | 'intermediate' | 'advanced';
      challenge_type: 'pr_based' | 'consistency' | 'total_volume' | 'duration';
    };
  };
};

// ============================================
// HELPER FUNCTIONS FOR PRODUCTION
// ============================================

// Check if app is connected to production Supabase
export const isProductionMode = () => {
  return (
    supabaseUrl.includes('supabase.co') && !supabaseUrl.includes('localhost')
  );
};

// Get storage URL for files
export const getStorageUrl = (bucket: string, path: string) => {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
};

// Upload file to Supabase Storage
export const uploadFile = async (bucket: string, path: string, file: any) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);

  if (error) {
    throw error;
  }
  return data;
};

// ============================================
// REAL-TIME SUBSCRIPTIONS FOR SOCIAL FEATURES
// ============================================

// Subscribe to new posts in gym feed
export const subscribeToGymFeed = (
  gymId: string,
  callback: (post: any) => void,
) => {
  return supabase
    .channel('gym-feed')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'posts',
        filter: `gym_id=eq.${gymId}`,
      },
      callback,
    )
    .subscribe();
};

// Subscribe to new followers
export const subscribeToFollowers = (
  userId: string,
  callback: (follow: any) => void,
) => {
  return supabase
    .channel('followers')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'follows',
        filter: `following_id=eq.${userId}`,
      },
      callback,
    )
    .subscribe();
};

console.log('🚀 GYMEZ connected to production Supabase!', {
  url: supabaseUrl,
  production: isProductionMode(),
});

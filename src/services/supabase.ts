import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// TODO: Replace these with your actual Supabase project credentials
// Get them from: https://supabase.com → Your Project → Settings → API
const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL'; // e.g., 'https://abcdefghijklmnop.supabase.co'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Your anon/public key from the API settings

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types for TypeScript
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
          id: string;
          user_type: 'gym_owner' | 'gym_member';
          email: string;
          full_name: string;
          username?: string;
          gym_id?: string;
          gym_start_date?: string;
          is_private?: boolean;
        };
        Update: {
          user_type?: 'gym_owner' | 'gym_member';
          email?: string;
          full_name?: string;
          username?: string;
          bio?: string;
          profile_picture?: string;
          gym_id?: string;
          gym_start_date?: string;
          is_private?: boolean;
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
        };
        Update: {
          name?: string;
          address?: string;
          updated_at?: string;
        };
      };
      videos: {
        Row: {
          id: string;
          member_id: string;
          gym_id: string;
          video_url: string;
          title: string;
          description?: string;
          status: 'pending' | 'approved' | 'rejected';
          exercise_type: string;
          duration: number;
          weight?: number;
          reps?: number;
          is_pr?: boolean;
          approved_by?: string;
          approval_date?: string;
          rejection_reason?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          member_id: string;
          gym_id: string;
          video_url: string;
          title: string;
          description?: string;
          exercise_type: string;
          duration: number;
          weight?: number;
          reps?: number;
          is_pr?: boolean;
        };
        Update: {
          status?: 'pending' | 'approved' | 'rejected';
          weight?: number;
          reps?: number;
          is_pr?: boolean;
          approved_by?: string;
          approval_date?: string;
          rejection_reason?: string;
          updated_at?: string;
        };
      };
      personal_records: {
        Row: {
          id: string;
          user_id: string;
          exercise_type: string;
          weight: number;
          reps: number;
          video_id?: string;
          achieved_at: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          exercise_type: string;
          weight: number;
          reps: number;
          video_id?: string;
          achieved_at?: string;
        };
        Update: {
          weight?: number;
          reps?: number;
          video_id?: string;
          achieved_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          video_id?: string;
          pr_id?: string;
          gym_id?: string;
          post_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          content: string;
          video_id?: string;
          pr_id?: string;
          gym_id?: string;
          post_type: string;
        };
        Update: {
          content?: string;
          updated_at?: string;
        };
      };
      post_likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
        };
        Update: {};
      };
      post_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
          content: string;
        };
        Update: {
          content?: string;
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
          follower_id: string;
          following_id: string;
        };
        Update: {};
      };
    };
  };
};
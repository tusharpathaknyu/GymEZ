import {supabase} from './supabase';
import {PersonalRecord, ExerciseType} from '../types';

export class PersonalRecordsService {
  /**
   * Get user's personal records for all exercises
   */
  static async getUserPRs(userId: string): Promise<PersonalRecord[]> {
    try {
      const {data, error} = await supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', userId)
        .order('achieved_at', {ascending: false});

      if (error) {
        throw new Error(`Failed to fetch personal records: ${error.message}`);
      }

      return data as PersonalRecord[];
    } catch (error) {
      console.error('Get user PRs error:', error);
      throw error;
    }
  }

  /**
   * Get user's best PR for a specific exercise
   */
  static async getBestPRForExercise(
    userId: string,
    exerciseType: ExerciseType
  ): Promise<PersonalRecord | null> {
    try {
      const {data, error} = await supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_type', exerciseType)
        .order('weight', {ascending: false})
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to fetch PR for ${exerciseType}: ${error.message}`);
      }

      return data as PersonalRecord || null;
    } catch (error) {
      console.error('Get best PR error:', error);
      throw error;
    }
  }

  /**
   * Get all PRs for a specific exercise (history)
   */
  static async getPRHistoryForExercise(
    userId: string,
    exerciseType: ExerciseType
  ): Promise<PersonalRecord[]> {
    try {
      const {data, error} = await supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_type', exerciseType)
        .order('achieved_at', {ascending: false});

      if (error) {
        throw new Error(`Failed to fetch PR history: ${error.message}`);
      }

      return data as PersonalRecord[];
    } catch (error) {
      console.error('Get PR history error:', error);
      throw error;
    }
  }

  /**
   * Create a new personal record
   */
  static async createPR(
    userId: string,
    exerciseType: ExerciseType,
    weight: number,
    reps: number,
    videoId?: string
  ): Promise<PersonalRecord> {
    try {
      const {data, error} = await supabase
        .from('personal_records')
        .insert({
          user_id: userId,
          exercise_type: exerciseType,
          weight,
          reps,
          video_id: videoId,
          achieved_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create PR: ${error.message}`);
      }

      return data as PersonalRecord;
    } catch (error) {
      console.error('Create PR error:', error);
      throw error;
    }
  }

  /**
   * Check if a weight/reps combination is a new PR for the user
   */
  static async isNewPR(
    userId: string,
    exerciseType: ExerciseType,
    weight: number,
    reps: number
  ): Promise<boolean> {
    try {
      const currentBest = await this.getBestPRForExercise(userId, exerciseType);
      
      if (!currentBest) {
        return true; // First PR for this exercise
      }

      // Calculate one-rep max using Epley formula: 1RM = weight × (1 + reps/30)
      const newOneRepMax = weight * (1 + reps / 30);
      const currentOneRepMax = currentBest.weight * (1 + currentBest.reps / 30);

      return newOneRepMax > currentOneRepMax;
    } catch (error) {
      console.error('Check new PR error:', error);
      return false;
    }
  }

  /**
   * Get PR leaderboard for a specific exercise (gym or global)
   */
  static async getPRLeaderboard(
    exerciseType: ExerciseType,
    gymId?: string,
    limit: number = 10
  ): Promise<(PersonalRecord & {user: {full_name: string; username?: string}})[]> {
    try {
      let query = supabase
        .from('personal_records')
        .select(`
          *,
          profiles!personal_records_user_id_fkey(full_name, username)
        `)
        .eq('exercise_type', exerciseType)
        .order('weight', {ascending: false})
        .limit(limit);

      if (gymId) {
        query = query.eq('profiles.gym_id', gymId);
      }

      const {data, error} = await query;

      if (error) {
        throw new Error(`Failed to fetch leaderboard: ${error.message}`);
      }

      return data.map(record => ({
        ...record,
        user: record.profiles
      })) as (PersonalRecord & {user: {full_name: string; username?: string}})[];
    } catch (error) {
      console.error('Get PR leaderboard error:', error);
      throw error;
    }
  }

  /**
   * Get recent PRs for a user
   */
  static async getRecentPRs(userId: string, limit: number = 10): Promise<PersonalRecord[]> {
    try {
      const {data, error} = await supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', userId)
        .order('achieved_at', {ascending: false})
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch recent PRs: ${error.message}`);
      }

      return data as PersonalRecord[];
    } catch (error) {
      console.error('Get recent PRs error:', error);
      throw error;
    }
  }

  /**
   * Get PR stats for a user
   */
  static async getUserPRStats(userId: string): Promise<{
    totalPRs: number;
    exercisesWithPRs: ExerciseType[];
    recentPRs: PersonalRecord[];
  }> {
    try {
      const allPRs = await this.getUserPRs(userId);
      
      // Get unique exercises
      const exercisesWithPRs = [...new Set(allPRs.map(pr => pr.exercise_type))] as ExerciseType[];
      
      // Get recent PRs (last 5)
      const recentPRs = allPRs.slice(0, 5);

      return {
        totalPRs: allPRs.length,
        exercisesWithPRs,
        recentPRs,
      };
    } catch (error) {
      console.error('Get user PR stats error:', error);
      throw error;
    }
  }

  /**
   * Get exercise categories with icons
   */
  static getExerciseCategories(): {
    type: ExerciseType;
    name: string;
    icon: string;
    description: string;
  }[] {
    return [
      {
        type: 'benchpress',
        name: 'Bench Press',
        icon: '🏋️‍♂️',
        description: 'Upper body strength'
      },
      {
        type: 'squat',
        name: 'Squat',
        icon: '🦵',
        description: 'Lower body power'
      },
      {
        type: 'deadlift',
        name: 'Deadlift',
        icon: '💪',
        description: 'Full body strength'
      },
      {
        type: 'pullup',
        name: 'Pull-ups',
        icon: '🔥',
        description: 'Upper body endurance'
      },
      {
        type: 'pushup',
        name: 'Push-ups',
        icon: '💯',
        description: 'Bodyweight strength'
      },
      {
        type: 'dip',
        name: 'Dips',
        icon: '⚡',
        description: 'Tricep power'
      }
    ];
  }
}
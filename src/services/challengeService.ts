import { supabase } from './supabase';
import type {
  Challenge,
  UserChallenge,
  Badge,
  UserBadge,
  UserPoints,
  LeaderboardEntry,
} from '../types';

export interface CreateChallengeData {
  name: string;
  description: string;
  challenge_type:
    | 'pr_based'
    | 'consistency'
    | 'total_volume'
    | 'specific_exercise'
    | 'duration';
  exercise_type?: string;
  target_value?: number;
  target_unit?: string;
  duration_days?: number;
  start_date?: string;
  end_date?: string;
  is_global?: boolean;
  gym_id?: string;
  reward_points?: number;
}

export class ChallengeService {
  // ============================================
  // CHALLENGES CRUD
  // ============================================

  static async createChallenge(data: CreateChallengeData): Promise<Challenge> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data: challenge, error } = await supabase
      .from('challenges')
      .insert({
        ...data,
        creator_id: user.id,
        reward_points: data.reward_points || 100,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    return challenge;
  }

  static async getChallenges(filters?: {
    is_active?: boolean;
    challenge_type?: string;
    gym_id?: string;
    is_global?: boolean;
  }): Promise<Challenge[]> {
    let query = supabase.from('challenges').select('*');

    if (filters?.is_active) {
      const today = new Date().toISOString().split('T')[0];
      query = query.lte('start_date', today).gte('end_date', today);
    }

    if (filters?.challenge_type) {
      query = query.eq('challenge_type', filters.challenge_type);
    }

    if (filters?.gym_id) {
      query = query.eq('gym_id', filters.gym_id);
    }

    if (filters?.is_global !== undefined) {
      query = query.eq('is_global', filters.is_global);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      throw error;
    }
    return data || [];
  }

  static async joinChallenge(challengeId: string): Promise<UserChallenge> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data: userChallenge, error } = await supabase
      .from('user_challenges')
      .insert({
        user_id: user.id,
        challenge_id: challengeId,
      })
      .select(
        `
        *,
        challenge:challenges(*)
      `,
      )
      .single();

    if (error) {
      throw error;
    }
    return userChallenge;
  }

  static async updateChallengeProgress(
    challengeId: string,
    progress: number,
  ): Promise<UserChallenge> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Check if challenge is completed
    const { data: challenge } = await supabase
      .from('challenges')
      .select('target_value')
      .eq('id', challengeId)
      .single();

    const isCompleted = challenge?.target_value
      ? progress >= challenge.target_value
      : false;

    const updateData: any = {
      current_progress: progress,
    };

    if (isCompleted) {
      updateData.is_completed = true;
      updateData.completed_at = new Date().toISOString();
    }

    const { data: userChallenge, error } = await supabase
      .from('user_challenges')
      .update(updateData)
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .select(
        `
        *,
        challenge:challenges(*)
      `,
      )
      .single();

    if (error) {
      throw error;
    }

    // Award points and badges if completed
    if (isCompleted) {
      await this.awardChallengeCompletion(challengeId, user.id);
    }

    return userChallenge;
  }

  static async getUserChallenges(userId?: string): Promise<UserChallenge[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('user_challenges')
      .select(
        `
        *,
        challenge:challenges(*)
      `,
      )
      .eq('user_id', targetUserId)
      .order('joined_at', { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
  }

  // ============================================
  // PREDEFINED CHALLENGES
  // ============================================

  static async createStandardChallenges(): Promise<Challenge[]> {
    const standardChallenges = [
      // Strength Challenges
      {
        name: 'Bench Press Century',
        description: 'Bench press 100kg (220lbs) for the first time',
        challenge_type: 'pr_based' as const,
        exercise_type: 'benchpress',
        target_value: 100,
        target_unit: 'kg',
        duration_days: 90,
        is_global: true,
        reward_points: 200,
      },
      {
        name: 'Squat Double Bodyweight',
        description: 'Squat 2x your bodyweight',
        challenge_type: 'pr_based' as const,
        exercise_type: 'squat',
        target_value: 2,
        target_unit: 'x bodyweight',
        duration_days: 120,
        is_global: true,
        reward_points: 300,
      },
      {
        name: 'Deadlift Triple Digits',
        description: 'Deadlift over 100kg',
        challenge_type: 'pr_based' as const,
        exercise_type: 'deadlift',
        target_value: 100,
        target_unit: 'kg',
        duration_days: 90,
        is_global: true,
        reward_points: 200,
      },

      // Consistency Challenges
      {
        name: '30-Day Workout Streak',
        description: 'Complete 30 consecutive days of workouts',
        challenge_type: 'consistency' as const,
        target_value: 30,
        target_unit: 'days',
        duration_days: 30,
        is_global: true,
        reward_points: 150,
      },
      {
        name: 'Gym Rat',
        description: 'Work out 5 times per week for 4 weeks',
        challenge_type: 'consistency' as const,
        target_value: 20,
        target_unit: 'workouts',
        duration_days: 28,
        is_global: true,
        reward_points: 180,
      },

      // Volume Challenges
      {
        name: 'Push-up Master',
        description: 'Complete 1000 push-ups in 30 days',
        challenge_type: 'total_volume' as const,
        exercise_type: 'pushup',
        target_value: 1000,
        target_unit: 'reps',
        duration_days: 30,
        is_global: true,
        reward_points: 120,
      },
      {
        name: 'Pull-up Pro',
        description: 'Complete 300 pull-ups in 30 days',
        challenge_type: 'total_volume' as const,
        exercise_type: 'pullup',
        target_value: 300,
        target_unit: 'reps',
        duration_days: 30,
        is_global: true,
        reward_points: 150,
      },

      // Endurance Challenges
      {
        name: 'Iron Endurance',
        description: 'Complete 20 hours of workouts in 30 days',
        challenge_type: 'duration' as const,
        target_value: 1200,
        target_unit: 'minutes',
        duration_days: 30,
        is_global: true,
        reward_points: 200,
      },
    ];

    const createdChallenges: Challenge[] = [];

    for (const challengeData of standardChallenges) {
      try {
        const challenge = await this.createChallenge(challengeData);
        createdChallenges.push(challenge);
      } catch (error) {
        console.error('Error creating challenge:', challengeData.name, error);
      }
    }

    return createdChallenges;
  }

  // ============================================
  // POINTS & BADGES SYSTEM
  // ============================================

  static async getUserPoints(userId?: string): Promise<UserPoints> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId) {
      throw new Error('Not authenticated');
    }

    let { data: userPoints, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    // Create user points record if doesn't exist
    if (error && error.code === 'PGRST116') {
      const { data: newUserPoints, error: createError } = await supabase
        .from('user_points')
        .insert({
          user_id: targetUserId,
          total_points: 0,
          level: 1,
          points_to_next_level: 100,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }
      userPoints = newUserPoints;
    } else if (error) {
      throw error;
    }

    return userPoints!;
  }

  static async addPoints(
    userId: string,
    points: number,
    _source: string,
  ): Promise<UserPoints> {
    const userPoints = await this.getUserPoints(userId);

    const newTotalPoints = userPoints.total_points + points;
    const newLevel = Math.floor(newTotalPoints / 1000) + 1; // Level up every 1000 points
    const pointsToNextLevel = newLevel * 1000 - newTotalPoints;

    const { data: updatedPoints, error } = await supabase
      .from('user_points')
      .update({
        total_points: newTotalPoints,
        level: newLevel,
        points_to_next_level: pointsToNextLevel,
        weekly_points: userPoints.weekly_points + points,
        monthly_points: userPoints.monthly_points + points,
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Check for level-up badges
    if (newLevel > userPoints.level) {
      await this.checkLevelUpBadges(userId, newLevel);
    }

    return updatedPoints;
  }

  static async getBadges(): Promise<Badge[]> {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('badge_type', { ascending: true });

    if (error) {
      throw error;
    }
    return data || [];
  }

  static async getUserBadges(userId?: string): Promise<UserBadge[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('user_badges')
      .select(
        `
        *,
        badge:badges(*)
      `,
      )
      .eq('user_id', targetUserId)
      .order('earned_at', { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
  }

  static async awardBadge(
    userId: string,
    badgeId: string,
    challengeId?: string,
  ): Promise<UserBadge> {
    // Check if user already has this badge
    const { data: existingBadge } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .single();

    if (existingBadge) {
      throw new Error('Badge already earned');
    }

    const { data: userBadge, error } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badgeId,
        challenge_id: challengeId,
      })
      .select(
        `
        *,
        badge:badges(*)
      `,
      )
      .single();

    if (error) {
      throw error;
    }

    // Award points for the badge
    if (userBadge.badge?.points_value) {
      await this.addPoints(
        userId,
        userBadge.badge.points_value,
        'badge_earned',
      );
    }

    return userBadge;
  }

  // ============================================
  // LEADERBOARDS
  // ============================================

  static async getLeaderboard(
    type:
      | 'global_points'
      | 'monthly_points'
      | 'challenge_specific'
      | 'gym_specific',
    referenceId?: string,
    limit: number = 50,
  ): Promise<LeaderboardEntry[]> {
    let query = supabase
      .from('leaderboard_entries')
      .select(
        `
        *,
        user:profiles!user_id(id, full_name, profile_picture)
      `,
      )
      .eq('leaderboard_type', type);

    if (referenceId) {
      query = query.eq('reference_id', referenceId);
    }

    const { data, error } = await query
      .order('rank_position', { ascending: true })
      .limit(limit);

    if (error) {
      throw error;
    }
    return data || [];
  }

  static async updateLeaderboards(): Promise<void> {
    // Update global points leaderboard
    await this.updateGlobalPointsLeaderboard();

    // Update monthly points leaderboard
    await this.updateMonthlyPointsLeaderboard();

    // Update challenge-specific leaderboards
    await this.updateChallengeLeaderboards();
  }

  private static async updateGlobalPointsLeaderboard(): Promise<void> {
    // Get top users by total points
    const { data: topUsers, error } = await supabase
      .from('user_points')
      .select('user_id, total_points')
      .order('total_points', { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    // Clear existing global leaderboard
    await supabase
      .from('leaderboard_entries')
      .delete()
      .eq('leaderboard_type', 'global_points');

    // Insert new leaderboard entries
    const leaderboardEntries =
      topUsers?.map((user, index) => ({
        user_id: user.user_id,
        leaderboard_type: 'global_points' as const,
        score: user.total_points,
        rank_position: index + 1,
      })) || [];

    if (leaderboardEntries.length > 0) {
      const { error: insertError } = await supabase
        .from('leaderboard_entries')
        .insert(leaderboardEntries);

      if (insertError) {
        throw insertError;
      }
    }
  }

  private static async updateMonthlyPointsLeaderboard(): Promise<void> {
    const { data: topUsers, error } = await supabase
      .from('user_points')
      .select('user_id, monthly_points')
      .order('monthly_points', { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Clear existing monthly leaderboard for current month
    await supabase
      .from('leaderboard_entries')
      .delete()
      .eq('leaderboard_type', 'monthly_points')
      .gte('period_start', monthStart.toISOString().split('T')[0])
      .lte('period_end', monthEnd.toISOString().split('T')[0]);

    const leaderboardEntries =
      topUsers?.map((user, index) => ({
        user_id: user.user_id,
        leaderboard_type: 'monthly_points' as const,
        score: user.monthly_points,
        rank_position: index + 1,
        period_start: monthStart.toISOString().split('T')[0],
        period_end: monthEnd.toISOString().split('T')[0],
      })) || [];

    if (leaderboardEntries.length > 0) {
      const { error: insertError } = await supabase
        .from('leaderboard_entries')
        .insert(leaderboardEntries);

      if (insertError) {
        throw insertError;
      }
    }
  }

  private static async updateChallengeLeaderboards(): Promise<void> {
    // Get active challenges
    const { data: activeChallenges } = await supabase
      .from('challenges')
      .select('id')
      .lte('start_date', new Date().toISOString().split('T')[0])
      .gte('end_date', new Date().toISOString().split('T')[0]);

    for (const challenge of activeChallenges || []) {
      const { data: challengeParticipants } = await supabase
        .from('user_challenges')
        .select('user_id, current_progress')
        .eq('challenge_id', challenge.id)
        .order('current_progress', { ascending: false })
        .limit(50);

      // Clear existing challenge leaderboard
      await supabase
        .from('leaderboard_entries')
        .delete()
        .eq('leaderboard_type', 'challenge_specific')
        .eq('reference_id', challenge.id);

      const leaderboardEntries =
        challengeParticipants?.map((participant, index) => ({
          user_id: participant.user_id,
          leaderboard_type: 'challenge_specific' as const,
          reference_id: challenge.id,
          score: participant.current_progress,
          rank_position: index + 1,
        })) || [];

      if (leaderboardEntries.length > 0) {
        await supabase.from('leaderboard_entries').insert(leaderboardEntries);
      }
    }
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private static async awardChallengeCompletion(
    challengeId: string,
    userId: string,
  ): Promise<void> {
    // Get challenge details
    const { data: challenge } = await supabase
      .from('challenges')
      .select('reward_points, reward_badge_id')
      .eq('id', challengeId)
      .single();

    if (!challenge) {
      return;
    }

    // Award points
    if (challenge.reward_points) {
      await this.addPoints(
        userId,
        challenge.reward_points,
        'challenge_completion',
      );
    }

    // Award badge if specified
    if (challenge.reward_badge_id) {
      try {
        await this.awardBadge(userId, challenge.reward_badge_id, challengeId);
      } catch (error) {
        // Badge might already be earned, ignore error
      }
    }
  }

  private static async checkLevelUpBadges(
    userId: string,
    newLevel: number,
  ): Promise<void> {
    // Award level milestone badges
    const levelBadges = [
      { level: 5, badgeId: 'level_5_badge' },
      { level: 10, badgeId: 'level_10_badge' },
      { level: 25, badgeId: 'level_25_badge' },
      { level: 50, badgeId: 'level_50_badge' },
    ];

    for (const levelBadge of levelBadges) {
      if (newLevel >= levelBadge.level) {
        try {
          // Check if badge exists first
          const { data: badge } = await supabase
            .from('badges')
            .select('id')
            .eq('name', `Level ${levelBadge.level}`)
            .single();

          if (badge) {
            await this.awardBadge(userId, badge.id);
          }
        } catch (error) {
          // Badge might not exist or already earned
        }
      }
    }
  }
}

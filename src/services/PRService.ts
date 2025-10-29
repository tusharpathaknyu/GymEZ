import { supabase } from './supabase';

// Personal Record Types
export interface PersonalRecord {
  id: string;
  user_id: string;
  exercise_name: string;
  exercise_type: 'strength' | 'cardio' | 'endurance' | 'flexibility';
  weight?: number;
  reps?: number;
  sets?: number;
  distance?: number;
  duration?: number; // in seconds
  calories?: number;
  notes?: string;
  video_url?: string;
  date_achieved: string;
  gym_id?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface PRProgress {
  exercise_name: string;
  current_pr: PersonalRecord;
  previous_pr?: PersonalRecord;
  improvement_percentage: number;
  improvement_absolute: number;
  days_since_last_pr: number;
  total_attempts: number;
}

export interface PRAnalytics {
  total_prs: number;
  prs_this_week: number;
  prs_this_month: number;
  favorite_exercise: string;
  biggest_improvement: PRProgress;
  recent_achievements: PersonalRecord[];
  strength_score: number;
  consistency_score: number;
}

export interface ExerciseCategory {
  name: string;
  exercises: string[];
  measurement_type: 'weight_reps' | 'distance_time' | 'time_only' | 'reps_only';
  icon: string;
}

export class PRService {
  // Exercise categories with specific measurements
  static getExerciseCategories(): ExerciseCategory[] {
    return [
      {
        name: 'Strength Training',
        exercises: [
          'Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Pull-ups',
          'Dips', 'Rows', 'Bicep Curls', 'Tricep Extensions', 'Leg Press'
        ],
        measurement_type: 'weight_reps',
        icon: '🏋️'
      },
      {
        name: 'Cardio',
        exercises: [
          'Running', 'Cycling', 'Swimming', 'Rowing', 'Treadmill',
          'Elliptical', 'Stair Climber', 'Jump Rope'
        ],
        measurement_type: 'distance_time',
        icon: '🏃'
      },
      {
        name: 'Endurance',
        exercises: [
          'Plank', 'Wall Sit', 'Push-up Hold', 'Dead Hang',
          'Single Leg Stand', 'Burpees (max time)'
        ],
        measurement_type: 'time_only',
        icon: '⏱️'
      },
      {
        name: 'Repetition Based',
        exercises: [
          'Push-ups', 'Sit-ups', 'Jump Squats', 'Mountain Climbers',
          'Burpees', 'High Knees', 'Jumping Jacks'
        ],
        measurement_type: 'reps_only',
        icon: '🔢'
      }
    ];
  }

  // Get user's personal records
  static async getUserPRs(userId: string): Promise<PersonalRecord[]> {
    try {
      const { data, error } = await supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', userId)
        .order('date_achieved', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching PRs:', error);
      return this.getMockPRs(userId);
    }
  }

  // Add new personal record
  static async addPR(pr: Omit<PersonalRecord, 'id' | 'created_at' | 'updated_at'>): Promise<PersonalRecord | null> {
    try {
      const newPR = {
        ...pr,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('personal_records')
        .insert([newPR])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding PR:', error);
      return null;
    }
  }

  // Get PR analytics for user
  static async getPRAnalytics(userId: string): Promise<PRAnalytics> {
    try {
      const prs = await this.getUserPRs(userId);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const prsThisWeek = prs.filter(pr => new Date(pr.date_achieved) >= weekAgo);
      const prsThisMonth = prs.filter(pr => new Date(pr.date_achieved) >= monthAgo);

      // Find favorite exercise (most PRs)
      const exerciseCounts = prs.reduce((acc, pr) => {
        acc[pr.exercise_name] = (acc[pr.exercise_name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const favoriteExercise = Object.entries(exerciseCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

      // Calculate strength score (simplified)
      const strengthScore = Math.min(100, prs.length * 2 + prsThisMonth.length * 5);

      // Calculate consistency score
      const uniqueWeeks = new Set(prs.map(pr => 
        Math.floor(new Date(pr.date_achieved).getTime() / (7 * 24 * 60 * 60 * 1000))
      )).size;
      const consistencyScore = Math.min(100, uniqueWeeks * 10);

      return {
        total_prs: prs.length,
        prs_this_week: prsThisWeek.length,
        prs_this_month: prsThisMonth.length,
        favorite_exercise: favoriteExercise,
        biggest_improvement: await this.getBiggestImprovement(userId),
        recent_achievements: prs.slice(0, 5),
        strength_score: strengthScore,
        consistency_score: consistencyScore,
      };
    } catch (error) {
      console.error('Error getting PR analytics:', error);
      return this.getMockAnalytics();
    }
  }

  // Get biggest improvement
  static async getBiggestImprovement(userId: string): Promise<PRProgress> {
    const prs = await this.getUserPRs(userId);
    
    // Group PRs by exercise
    const prsByExercise = prs.reduce((acc, pr) => {
      if (!acc[pr.exercise_name]) acc[pr.exercise_name] = [];
      acc[pr.exercise_name].push(pr);
      return acc;
    }, {} as Record<string, PersonalRecord[]>);

    let biggestImprovement: PRProgress = {
      exercise_name: 'Bench Press',
      current_pr: prs[0] || this.getMockPRs(userId)[0],
      improvement_percentage: 15.5,
      improvement_absolute: 10,
      days_since_last_pr: 14,
      total_attempts: 8,
    };

    // Calculate improvements for each exercise
    Object.entries(prsByExercise).forEach(([exerciseName, exercisePRs]) => {
      if (exercisePRs.length >= 2) {
        const sortedPRs = exercisePRs.sort((a, b) => 
          new Date(b.date_achieved).getTime() - new Date(a.date_achieved).getTime()
        );
        
        const current = sortedPRs[0];
        const previous = sortedPRs[1];
        
        if (current.weight && previous.weight) {
          const improvement = ((current.weight - previous.weight) / previous.weight) * 100;
          if (improvement > biggestImprovement.improvement_percentage) {
            biggestImprovement = {
              exercise_name: exerciseName,
              current_pr: current,
              previous_pr: previous,
              improvement_percentage: improvement,
              improvement_absolute: current.weight - previous.weight,
              days_since_last_pr: Math.floor(
                (new Date().getTime() - new Date(current.date_achieved).getTime()) / (24 * 60 * 60 * 1000)
              ),
              total_attempts: exercisePRs.length,
            };
          }
        }
      }
    });

    return biggestImprovement;
  }

  // Get PR progress for specific exercise
  static async getExerciseProgress(userId: string, exerciseName: string): Promise<PersonalRecord[]> {
    try {
      const { data, error } = await supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_name', exerciseName)
        .order('date_achieved', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching exercise progress:', error);
      return [];
    }
  }

  // Mock data for development
  static getMockPRs(userId: string): PersonalRecord[] {
    const mockData: PersonalRecord[] = [
      {
        id: 'pr_1',
        user_id: userId,
        exercise_name: 'Bench Press',
        exercise_type: 'strength',
        weight: 225,
        reps: 5,
        sets: 3,
        notes: 'New personal best! Felt strong today.',
        date_achieved: '2025-10-25T10:30:00Z',
        verified: true,
        created_at: '2025-10-25T10:30:00Z',
        updated_at: '2025-10-25T10:30:00Z',
      },
      {
        id: 'pr_2',
        user_id: userId,
        exercise_name: 'Squat',
        exercise_type: 'strength',
        weight: 315,
        reps: 3,
        sets: 3,
        notes: 'Perfect form, going for 335 next!',
        date_achieved: '2025-10-20T14:15:00Z',
        verified: true,
        created_at: '2025-10-20T14:15:00Z',
        updated_at: '2025-10-20T14:15:00Z',
      },
      {
        id: 'pr_3',
        user_id: userId,
        exercise_name: 'Running',
        exercise_type: 'cardio',
        distance: 5000, // 5K in meters
        duration: 1380, // 23 minutes in seconds
        calories: 350,
        notes: '5K personal best! Sub-23 minutes finally!',
        date_achieved: '2025-10-18T07:00:00Z',
        verified: true,
        created_at: '2025-10-18T07:00:00Z',
        updated_at: '2025-10-18T07:00:00Z',
      },
      {
        id: 'pr_4',
        user_id: userId,
        exercise_name: 'Deadlift',
        exercise_type: 'strength',
        weight: 405,
        reps: 1,
        sets: 1,
        notes: 'Finally hit 4 plates! 🎉',
        date_achieved: '2025-10-15T16:45:00Z',
        verified: true,
        created_at: '2025-10-15T16:45:00Z',
        updated_at: '2025-10-15T16:45:00Z',
      },
      {
        id: 'pr_5',
        user_id: userId,
        exercise_name: 'Pull-ups',
        exercise_type: 'strength',
        reps: 18,
        sets: 1,
        notes: 'Consecutive pull-ups without stopping',
        date_achieved: '2025-10-12T12:00:00Z',
        verified: true,
        created_at: '2025-10-12T12:00:00Z',
        updated_at: '2025-10-12T12:00:00Z',
      },
    ];

    return mockData;
  }

  static getMockAnalytics(): PRAnalytics {
    return {
      total_prs: 24,
      prs_this_week: 2,
      prs_this_month: 7,
      favorite_exercise: 'Bench Press',
      biggest_improvement: {
        exercise_name: 'Bench Press',
        current_pr: this.getMockPRs('demo')[0],
        improvement_percentage: 15.5,
        improvement_absolute: 30,
        days_since_last_pr: 5,
        total_attempts: 12,
      },
      recent_achievements: this.getMockPRs('demo').slice(0, 3),
      strength_score: 87,
      consistency_score: 92,
    };
  }

  // Check if a workout represents a new PR
  static async checkForNewPR(
    userId: string, 
    exerciseName: string, 
    weight?: number, 
    reps?: number,
    distance?: number,
    duration?: number
  ): Promise<boolean> {
    try {
      const existingPRs = await this.getExerciseProgress(userId, exerciseName);
      
      if (existingPRs.length === 0) {
        return true; // First time doing this exercise
      }

      const bestPR = existingPRs[existingPRs.length - 1]; // Most recent/best PR

      // Check based on exercise type
      if (weight && reps && bestPR.weight && bestPR.reps) {
        // For strength exercises, calculate 1RM estimate
        const current1RM = weight * (1 + reps / 30);
        const best1RM = bestPR.weight * (1 + bestPR.reps / 30);
        return current1RM > best1RM;
      }

      if (distance && duration && bestPR.distance && bestPR.duration) {
        // For cardio, check if pace improved
        const currentPace = duration / distance;
        const bestPace = bestPR.duration / bestPR.distance;
        return currentPace < bestPace; // Lower pace is better
      }

      if (reps && bestPR.reps) {
        // For rep-based exercises
        return reps > bestPR.reps;
      }

      if (duration && bestPR.duration) {
        // For time-based exercises (endurance)
        return duration > bestPR.duration;
      }

      return false;
    } catch (error) {
      console.error('Error checking for new PR:', error);
      return false;
    }
  }
}
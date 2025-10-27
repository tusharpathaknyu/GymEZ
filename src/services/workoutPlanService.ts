import { supabase } from './supabase';
import type { 
  WorkoutPlan, 
  WorkoutSession, 
  Exercise, 
  UserWorkoutLog,
  ExerciseLog,
  SessionExercise
} from '../types';

export interface CreateWorkoutPlanData {
  name: string;
  description?: string;
  duration_weeks?: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  goal?: 'strength' | 'muscle_building' | 'weight_loss' | 'endurance' | 'general_fitness';
  is_public?: boolean;
  price?: number;
  tags?: string[];
}

export interface CreateWorkoutSessionData {
  workout_plan_id: string;
  name: string;
  day_number: number;
  week_number?: number;
  estimated_duration?: number;
  exercises: CreateSessionExerciseData[];
}

export interface CreateSessionExerciseData {
  exercise_library_id: string;
  exercise_order: number;
  sets?: number;
  reps?: string;
  weight_kg?: number;
  rest_seconds?: number;
  notes?: string;
}

export interface StartWorkoutData {
  workout_plan_id?: string;
  workout_session_id?: string;
  notes?: string;
}

export interface LogExerciseData {
  exercise_library_id: string;
  sets_completed: number;
  reps_completed: number[];
  weights_used: number[];
  rest_time_seconds?: number[];
  notes?: string;
}

export class WorkoutPlanService {
  
  // ============================================
  // WORKOUT PLANS CRUD
  // ============================================
  
  static async createWorkoutPlan(data: CreateWorkoutPlanData): Promise<WorkoutPlan> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data: plan, error } = await supabase
      .from('workout_plans')
      .insert({
        ...data,
        creator_id: user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return plan;
  }
  
  static async getWorkoutPlans(filters?: {
    is_public?: boolean;
    difficulty_level?: string;
    goal?: string;
    creator_id?: string;
    search?: string;
  }): Promise<WorkoutPlan[]> {
    let query = supabase
      .from('workout_plans')
      .select(`
        *,
        creator:profiles!creator_id(id, full_name),
        sessions:workout_sessions(count)
      `);
    
    if (filters?.is_public !== undefined) {
      query = query.eq('is_public', filters.is_public);
    }
    
    if (filters?.difficulty_level) {
      query = query.eq('difficulty_level', filters.difficulty_level);
    }
    
    if (filters?.goal) {
      query = query.eq('goal', filters.goal);
    }
    
    if (filters?.creator_id) {
      query = query.eq('creator_id', filters.creator_id);
    }
    
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
  
  static async getWorkoutPlan(id: string): Promise<WorkoutPlan & { sessions: WorkoutSession[] }> {
    const { data, error } = await supabase
      .from('workout_plans')
      .select(`
        *,
        creator:profiles!creator_id(id, full_name),
        sessions:workout_sessions(
          *,
          exercises:session_exercises(
            *,
            exercise:exercise_library(*)
          )
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
  
  static async updateWorkoutPlan(id: string, updates: Partial<CreateWorkoutPlanData>): Promise<WorkoutPlan> {
    const { data, error } = await supabase
      .from('workout_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  static async deleteWorkoutPlan(id: string): Promise<void> {
    const { error } = await supabase
      .from('workout_plans')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
  
  // ============================================
  // WORKOUT SESSIONS
  // ============================================
  
  static async createWorkoutSession(data: CreateWorkoutSessionData): Promise<WorkoutSession> {
    const { exercises, ...sessionData } = data;
    
    // Create session
    const { data: session, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert(sessionData)
      .select()
      .single();
    
    if (sessionError) throw sessionError;
    
    // Add exercises to session
    if (exercises.length > 0) {
      const exercisesWithSessionId = exercises.map(ex => ({
        ...ex,
        workout_session_id: session.id
      }));
      
      const { error: exercisesError } = await supabase
        .from('session_exercises')
        .insert(exercisesWithSessionId);
      
      if (exercisesError) throw exercisesError;
    }
    
    return session;
  }
  
  static async getWorkoutSession(id: string): Promise<WorkoutSession & { exercises: SessionExercise[] }> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        exercises:session_exercises(
          *,
          exercise:exercise_library(*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
  
  // ============================================
  // EXERCISE LIBRARY
  // ============================================
  
  static async getExerciseLibrary(filters?: {
    category?: string;
    difficulty_level?: string;
    equipment?: string[];
    search?: string;
  }): Promise<Exercise[]> {
    let query = supabase.from('exercise_library').select('*');
    
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters?.difficulty_level) {
      query = query.eq('difficulty_level', filters.difficulty_level);
    }
    
    if (filters?.equipment && filters.equipment.length > 0) {
      query = query.overlaps('equipment', filters.equipment);
    }
    
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) throw error;
    return data || [];
  }
  
  static async createExercise(data: Omit<Exercise, 'id' | 'created_at'>): Promise<Exercise> {
    const { data: exercise, error } = await supabase
      .from('exercise_library')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return exercise;
  }
  
  // ============================================
  // WORKOUT LOGGING
  // ============================================
  
  static async startWorkout(data: StartWorkoutData): Promise<UserWorkoutLog> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data: workoutLog, error } = await supabase
      .from('user_workout_logs')
      .insert({
        ...data,
        user_id: user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return workoutLog;
  }
  
  static async logExercise(workoutLogId: string, exerciseData: LogExerciseData): Promise<ExerciseLog> {
    const { data: exerciseLog, error } = await supabase
      .from('exercise_logs')
      .insert({
        ...exerciseData,
        user_workout_log_id: workoutLogId
      })
      .select()
      .single();
    
    if (error) throw error;
    return exerciseLog;
  }
  
  static async completeWorkout(workoutLogId: string, durationMinutes: number, notes?: string): Promise<UserWorkoutLog> {
    const { data, error } = await supabase
      .from('user_workout_logs')
      .update({ 
        duration_minutes: durationMinutes,
        notes: notes || null,
        completed_at: new Date().toISOString()
      })
      .eq('id', workoutLogId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  static async getUserWorkoutHistory(userId?: string, limit: number = 20): Promise<UserWorkoutLog[]> {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('user_workout_logs')
      .select(`
        *,
        workout_plan:workout_plans(name),
        workout_session:workout_sessions(name),
        exercise_logs(
          *,
          exercise:exercise_library(name, category)
        )
      `)
      .eq('user_id', targetUserId)
      .order('completed_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }
  
  // ============================================
  // PROGRESS TRACKING & ANALYTICS
  // ============================================
  
  static async getProgressStats(userId?: string): Promise<{
    totalWorkouts: number;
    totalDuration: number;
    averageDuration: number;
    favoriteExercises: Array<{ name: string; count: number }>;
    weeklyStats: Array<{ week: string; workouts: number; duration: number }>;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId) throw new Error('Not authenticated');
    
    // Get basic stats
    const { data: workouts, error } = await supabase
      .from('user_workout_logs')
      .select('duration_minutes, completed_at, exercise_logs(exercise_library_id, exercise:exercise_library(name))')
      .eq('user_id', targetUserId)
      .not('completed_at', 'is', null);
    
    if (error) throw error;
    
    const totalWorkouts = workouts?.length || 0;
    const totalDuration = workouts?.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) || 0;
    const averageDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;
    
    // Calculate favorite exercises
    const exerciseCounts: { [key: string]: number } = {};
    workouts?.forEach(workout => {
      workout.exercise_logs?.forEach(log => {
        const exerciseName = (log.exercise as any)?.name;
        if (exerciseName) {
          exerciseCounts[exerciseName] = (exerciseCounts[exerciseName] || 0) + 1;
        }
      });
    });
    
    const favoriteExercises = Object.entries(exerciseCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Calculate weekly stats (last 8 weeks)
    const weeklyStats: Array<{ week: string; workouts: number; duration: number }> = [];
    const now = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekWorkouts = workouts?.filter(w => {
        const workoutDate = new Date(w.completed_at!);
        return workoutDate >= weekStart && workoutDate <= weekEnd;
      }) || [];
      
      weeklyStats.push({
        week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        workouts: weekWorkouts.length,
        duration: weekWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0)
      });
    }
    
    return {
      totalWorkouts,
      totalDuration,
      averageDuration,
      favoriteExercises,
      weeklyStats
    };
  }
  
  static async getExerciseProgress(exerciseId: string, userId?: string): Promise<Array<{
    date: string;
    maxWeight: number;
    totalVolume: number;
    bestSet: { reps: number; weight: number };
  }>> {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('exercise_logs')
      .select(`
        reps_completed,
        weights_used,
        user_workout_log:user_workout_logs!inner(completed_at, user_id)
      `)
      .eq('exercise_library_id', exerciseId)
      .eq('user_workout_log.user_id', targetUserId)
      .not('user_workout_log.completed_at', 'is', null)
      .order('user_workout_log.completed_at', { ascending: false });
    
    if (error) throw error;
    
    const progress = data?.map(log => {
      const maxWeight = Math.max(...(log.weights_used || [0]));
      const totalVolume = (log.reps_completed || []).reduce((sum: number, reps: number, index: number) => {
        const weight = (log.weights_used || [])[index] || 0;
        return sum + (reps * weight);
      }, 0);
      
      const bestSet = (log.reps_completed || []).reduce((best: { reps: number; weight: number }, reps: number, index: number) => {
        const weight = (log.weights_used || [])[index] || 0;
        if (weight > best.weight || (weight === best.weight && reps > best.reps)) {
          return { reps, weight };
        }
        return best;
      }, { reps: 0, weight: 0 });
      
      return {
        date: (log.user_workout_log as any).completed_at!,
        maxWeight,
        totalVolume,
        bestSet
      };
    }) || [];
    
    return progress;
  }
  
  // ============================================
  // AI WORKOUT SUGGESTIONS
  // ============================================
  
  static async generateWorkoutSuggestion(
    goal: 'strength' | 'muscle_building' | 'weight_loss' | 'endurance',
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced',
    availableEquipment: string[],
    durationMinutes: number
  ): Promise<{
    suggestedExercises: Array<{
      exercise: Exercise;
      suggestedSets: number;
      suggestedReps: string;
      suggestedWeight?: number;
    }>;
    workoutStructure: string;
  }> {
    
    // Get exercises matching equipment and difficulty
    const { data: exercises } = await supabase
      .from('exercise_library')
      .select('*')
      .eq('difficulty_level', difficultyLevel)
      .overlaps('equipment', availableEquipment);
    
    if (!exercises || exercises.length === 0) {
      throw new Error('No exercises found for the given criteria');
    }
    
    // Simple AI logic based on goals
    const goalConfig = {
      strength: {
        sets: 3,
        reps: '5-6',
        categories: ['chest', 'back', 'legs', 'shoulders'],
        exercisesPerCategory: 1
      },
      muscle_building: {
        sets: 4,
        reps: '8-12',
        categories: ['chest', 'back', 'legs', 'shoulders', 'arms'],
        exercisesPerCategory: 2
      },
      weight_loss: {
        sets: 3,
        reps: '12-15',
        categories: ['full_body', 'cardio', 'core'],
        exercisesPerCategory: 3
      },
      endurance: {
        sets: 2,
        reps: '15-20',
        categories: ['cardio', 'full_body', 'core'],
        exercisesPerCategory: 2
      }
    };
    
    const config = goalConfig[goal];
    const suggestedExercises: Array<{
      exercise: Exercise;
      suggestedSets: number;
      suggestedReps: string;
      suggestedWeight?: number;
    }> = [];
    
    // Select exercises by category
    config.categories.forEach(category => {
      const categoryExercises = exercises.filter(ex => ex.category === category);
      const selectedExercises = categoryExercises
        .sort(() => 0.5 - Math.random()) // Simple randomization
        .slice(0, config.exercisesPerCategory);
      
      selectedExercises.forEach(exercise => {
        suggestedExercises.push({
          exercise,
          suggestedSets: config.sets,
          suggestedReps: config.reps
        });
      });
    });
    
    const workoutStructure = `
${goal.charAt(0).toUpperCase() + goal.slice(1)} focused workout:
- Warm-up: 5-10 minutes
- Main exercises: ${suggestedExercises.length} exercises, ${config.sets} sets each
- Cool-down: 5-10 minutes
- Estimated duration: ${durationMinutes} minutes
    `.trim();
    
    return {
      suggestedExercises: suggestedExercises.slice(0, Math.floor(durationMinutes / 10)), // Rough exercise count based on time
      workoutStructure
    };
  }
}
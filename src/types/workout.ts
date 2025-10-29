export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'sports';
  muscle_groups: string[];
  equipment?: string[];
  description: string;
  instructions: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes?: number;
  sets?: number;
  reps?: number;
  rest_seconds?: number;
}

export interface WorkoutSet {
  exercise_id: string;
  set_number: number;
  reps: number;
  weight?: number;
  duration_seconds?: number;
  rest_seconds: number;
  completed: boolean;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  sets: WorkoutSet[];
  total_duration_minutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  completed_at?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  category: 'strength' | 'cardio' | 'hiit' | 'yoga' | 'custom';
  exercises: Exercise[];
  estimated_duration_minutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface WorkoutProgress {
  workout_id: string;
  date: string;
  duration_minutes: number;
  exercises_completed: number;
  total_exercises: number;
  calories_burned?: number;
  notes?: string;
}
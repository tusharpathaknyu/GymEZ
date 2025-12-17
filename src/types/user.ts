export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age?: number;
  height_cm?: number;
  weight_kg?: number;
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  preferred_workout_types: string[];
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  total_workouts: number;
  total_duration_minutes: number;
  current_streak_days: number;
  longest_streak_days: number;
  calories_burned_total: number;
  favorite_exercise_category: string;
  avg_workout_duration_minutes: number;
  workouts_this_week: number;
  workouts_this_month: number;
}

export interface ProgressEntry {
  id: string;
  user_id: string;
  date: string;
  weight_kg?: number;
  body_fat_percentage?: number;
  muscle_mass_kg?: number;
  measurements?: {
    chest_cm?: number;
    waist_cm?: number;
    hips_cm?: number;
    bicep_cm?: number;
    thigh_cm?: number;
  };
  energy_level: 1 | 2 | 3 | 4 | 5;
  mood: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface FitnessGoal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  target_date: string;
  category: 'weight' | 'strength' | 'endurance' | 'habits' | 'body_composition';
  completed: boolean;
  created_at: string;
}

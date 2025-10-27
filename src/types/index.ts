export type UserType = 'gym_owner' | 'gym_member';

export interface User {
  id: string;
  email: string;
  full_name: string;
  user_type: UserType;
  gym_id?: string;
  username?: string;
  bio?: string;
  profile_picture?: string;
  gym_start_date?: string;
  is_private: boolean;
}

export interface Gym {
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
  distance?: number; // Added for search results
  created_at: string;
  updated_at: string;
}

export type ExerciseType = 'benchpress' | 'squat' | 'deadlift' | 'pullup' | 'pushup' | 'dip';

export interface Video {
  id: string;
  member_id: string;
  gym_id: string;
  video_url: string;
  title: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  exercise_type: ExerciseType;
  duration: number;
  weight?: number;
  reps?: number;
  is_pr?: boolean;
  approved_by?: string;
  approval_date?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalRecord {
  id: string;
  user_id: string;
  exercise_type: ExerciseType;
  weight: number;
  reps: number;
  video_id?: string;
  achieved_at: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  video_id?: string;
  pr_id?: string;
  gym_id?: string;
  post_type: 'general' | 'pr_achievement' | 'workout';
  created_at: string;
  updated_at: string;
  user?: User;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface UserStats {
  user_id: string;
  gym_start_date?: string;
  total_workouts: number;
  followers_count: number;
  following_count: number;
  prs_count: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, userType: UserType, gymId?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

// ============================================
// EXTENDED FEATURES TYPES
// ============================================

// Workout Plans & Exercises
export interface Exercise {
  id: string;
  name: string;
  category: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio' | 'full_body';
  equipment: string[];
  muscle_groups: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string;
  video_url?: string;
  created_at: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  creator_id: string;
  duration_weeks: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  goal?: 'strength' | 'muscle_building' | 'weight_loss' | 'endurance' | 'general_fitness';
  is_public: boolean;
  price: number;
  tags: string[];
  rating: number;
  total_ratings: number;
  created_at: string;
  creator?: User;
  sessions?: WorkoutSession[];
}

export interface WorkoutSession {
  id: string;
  workout_plan_id: string;
  name: string;
  day_number: number;
  week_number: number;
  estimated_duration?: number;
  created_at: string;
  exercises?: SessionExercise[];
}

export interface SessionExercise {
  id: string;
  workout_session_id: string;
  exercise_library_id: string;
  exercise_order: number;
  sets?: number;
  reps?: string;
  weight_kg?: number;
  rest_seconds: number;
  notes?: string;
  exercise?: Exercise;
}

export interface UserWorkoutLog {
  id: string;
  user_id: string;
  workout_plan_id?: string;
  workout_session_id?: string;
  duration_minutes?: number;
  notes?: string;
  completed_at: string;
  workout_plan?: WorkoutPlan;
  workout_session?: WorkoutSession;
  exercise_logs?: ExerciseLog[];
}

export interface ExerciseLog {
  id: string;
  user_workout_log_id: string;
  exercise_library_id: string;
  sets_completed: number;
  reps_completed: number[];
  weights_used: number[];
  rest_time_seconds?: number[];
  notes?: string;
  exercise?: Exercise;
}

// Challenges & Gamification
export interface Challenge {
  id: string;
  name: string;
  description: string;
  challenge_type: 'pr_based' | 'consistency' | 'total_volume' | 'specific_exercise' | 'duration';
  exercise_type?: string;
  target_value?: number;
  target_unit?: string;
  duration_days: number;
  start_date?: string;
  end_date?: string;
  is_global: boolean;
  gym_id?: string;
  creator_id?: string;
  reward_points: number;
  reward_badge_id?: string;
  created_at: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  joined_at: string;
  completed_at?: string;
  current_progress: number;
  is_completed: boolean;
  rank_position?: number;
  challenge?: Challenge;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  badge_type: 'pr_milestone' | 'consistency' | 'challenge_winner' | 'social' | 'special';
  requirements: Record<string, any>;
  points_value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  challenge_id?: string;
  badge?: Badge;
}

export interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  level: number;
  points_to_next_level: number;
  weekly_points: number;
  monthly_points: number;
  updated_at: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  leaderboard_type: 'global_points' | 'monthly_points' | 'challenge_specific' | 'gym_specific' | 'exercise_pr';
  reference_id?: string;
  score: number;
  rank_position?: number;
  period_start?: string;
  period_end?: string;
  updated_at: string;
  user?: User;
}

// Social Features
export interface WorkoutBuddy {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  gym_id?: string;
  preferred_times: string[];
  workout_types: string[];
  created_at: string;
  requester?: User;
  receiver?: User;
}

export interface Story {
  id: string;
  user_id: string;
  content_type: 'image' | 'video';
  media_url: string;
  caption?: string;
  workout_log_id?: string;
  gym_id?: string;
  expires_at: string;
  created_at: string;
  user?: User;
  views_count?: number;
  is_viewed?: boolean;
}

export interface GymCheckin {
  id: string;
  user_id: string;
  gym_id: string;
  checkin_time: string;
  checkout_time?: string;
  workout_log_id?: string;
  is_verified: boolean;
  created_at: string;
  user?: User;
  gym?: Gym;
}

// Analytics & Tracking
export interface BodyMeasurement {
  id: string;
  user_id: string;
  weight_kg?: number;
  height_cm?: number;
  body_fat_percentage?: number;
  muscle_mass_kg?: number;
  chest_cm?: number;
  waist_cm?: number;
  bicep_cm?: number;
  thigh_cm?: number;
  notes?: string;
  measured_at: string;
}

export interface NutritionLog {
  id: string;
  user_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  quantity?: string;
  photo_url?: string;
  logged_at: string;
}

export interface NutritionGoals {
  id: string;
  user_id: string;
  daily_calories?: number;
  daily_protein_g?: number;
  daily_carbs_g?: number;
  daily_fat_g?: number;
  goal_type: 'weight_loss' | 'muscle_gain' | 'maintenance';
  updated_at: string;
}

// Gym Management
export interface ClassSchedule {
  id: string;
  gym_id: string;
  class_name: string;
  instructor_name?: string;
  description?: string;
  class_type?: string;
  duration_minutes: number;
  max_capacity: number;
  current_bookings: number;
  day_of_week: number;
  start_time: string;
  is_recurring: boolean;
  price: number;
  created_at: string;
  gym?: Gym;
}

export interface ClassBooking {
  id: string;
  user_id: string;
  class_schedule_id: string;
  booking_date: string;
  status: 'booked' | 'attended' | 'no_show' | 'cancelled';
  booked_at: string;
  class_schedule?: ClassSchedule;
}

export interface Equipment {
  id: string;
  gym_id: string;
  name: string;
  equipment_type: string;
  status: 'available' | 'in_use' | 'maintenance' | 'broken';
  location?: string;
  last_maintenance?: string;
  notes?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  subscription_type: 'basic' | 'premium' | 'pro';
  start_date: string;
  end_date?: string;
  is_active: boolean;
  payment_status: 'active' | 'past_due' | 'cancelled';
  monthly_price?: number;
  created_at: string;
}

// ============================================
// SERVICE INTERFACES
// ============================================

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

export interface CreateChallengeData {
  name: string;
  description: string;
  challenge_type: 'pr_based' | 'consistency' | 'total_volume' | 'specific_exercise' | 'duration';
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
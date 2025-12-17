import { UserStats, ProgressEntry, FitnessGoal } from '../types/user';
import { WorkoutProgress } from '../types/workout';

export class ProgressService {
  private static STORAGE_KEY_WORKOUTS = '@gymez_workouts';
  private static STORAGE_KEY_PROGRESS = '@gymez_progress';
  private static STORAGE_KEY_GOALS = '@gymez_goals';

  // Mock data for demonstration
  static getMockUserStats(): UserStats {
    return {
      total_workouts: 47,
      total_duration_minutes: 1420, // ~23.7 hours
      current_streak_days: 5,
      longest_streak_days: 12,
      calories_burned_total: 8540,
      favorite_exercise_category: 'strength',
      avg_workout_duration_minutes: 30,
      workouts_this_week: 4,
      workouts_this_month: 18,
    };
  }

  static getMockProgressEntries(): ProgressEntry[] {
    const now = new Date();
    const entries: ProgressEntry[] = [];

    // Generate last 30 days of progress data
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      entries.push({
        id: `progress_${i}`,
        user_id: 'user_1',
        date: date.toISOString().split('T')[0],
        weight_kg: 75 - i * 0.1, // Gradual weight loss
        body_fat_percentage: 18 + i * 0.05,
        muscle_mass_kg: 32 + i * 0.02,
        measurements: {
          chest_cm: 100,
          waist_cm: 85 - i * 0.05,
          hips_cm: 95,
          bicep_cm: 35 + i * 0.01,
          thigh_cm: 55,
        },
        energy_level: (Math.floor(Math.random() * 2) + 4) as 1 | 2 | 3 | 4 | 5, // 4 or 5
        mood: (Math.floor(Math.random() * 2) + 4) as 1 | 2 | 3 | 4 | 5, // 4 or 5
        notes:
          i % 7 === 0 ? 'Feeling great today! Increased weights.' : undefined,
      });
    }

    return entries.reverse(); // Most recent first
  }

  static getMockFitnessGoals(): FitnessGoal[] {
    return [
      {
        id: 'goal_1',
        user_id: 'user_1',
        title: 'Lose 10 kg',
        description:
          'Reach target weight of 70kg through consistent training and nutrition',
        target_value: 70,
        current_value: 75,
        unit: 'kg',
        target_date: '2025-03-01',
        category: 'weight',
        completed: false,
        created_at: '2025-01-01T00:00:00Z',
      },
      {
        id: 'goal_2',
        user_id: 'user_1',
        title: 'Bench Press 100kg',
        description: 'Increase bench press strength to 100kg for 1 rep max',
        target_value: 100,
        current_value: 85,
        unit: 'kg',
        target_date: '2025-06-01',
        category: 'strength',
        completed: false,
        created_at: '2025-01-01T00:00:00Z',
      },
      {
        id: 'goal_3',
        user_id: 'user_1',
        title: 'Run 5K in under 25 minutes',
        description: 'Improve cardiovascular endurance for faster 5K time',
        target_value: 25,
        current_value: 28,
        unit: 'minutes',
        target_date: '2025-04-15',
        category: 'endurance',
        completed: false,
        created_at: '2025-01-01T00:00:00Z',
      },
      {
        id: 'goal_4',
        user_id: 'user_1',
        title: 'Workout 4x per week',
        description:
          'Maintain consistent workout schedule throughout the month',
        target_value: 16,
        current_value: 14,
        unit: 'workouts',
        target_date: '2025-11-30',
        category: 'habits',
        completed: false,
        created_at: '2025-10-01T00:00:00Z',
      },
      {
        id: 'goal_5',
        user_id: 'user_1',
        title: 'Reduce Body Fat to 15%',
        description:
          'Lower body fat percentage through strength training and cardio',
        target_value: 15,
        current_value: 18,
        unit: '%',
        target_date: '2025-05-01',
        category: 'body_composition',
        completed: false,
        created_at: '2025-01-01T00:00:00Z',
      },
    ];
  }

  static getMockRecentWorkouts(): WorkoutProgress[] {
    const workouts: WorkoutProgress[] = [];

    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i * 2); // Every other day

      workouts.push({
        workout_id: `workout_${i}`,
        date: date.toISOString().split('T')[0],
        duration_minutes: Math.floor(Math.random() * 30) + 20, // 20-50 minutes
        exercises_completed: Math.floor(Math.random() * 3) + 3, // 3-5 exercises
        total_exercises: Math.floor(Math.random() * 2) + 4, // 4-5 total exercises
        calories_burned: Math.floor(Math.random() * 200) + 150, // 150-350 calories
        notes: i % 3 === 0 ? 'Great workout! Felt strong today.' : undefined,
      });
    }

    return workouts;
  }

  static calculateProgressPercentage(goal: FitnessGoal): number {
    const progress = Math.abs(goal.current_value - goal.target_value);
    const total = Math.abs(goal.target_value);
    return Math.min(Math.max((1 - progress / total) * 100, 0), 100);
  }

  static getDaysUntilGoal(targetDate: string): number {
    const target = new Date(targetDate);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static getWeeklyWorkoutData(): { day: string; workouts: number }[] {
    return [
      { day: 'Mon', workouts: 1 },
      { day: 'Tue', workouts: 0 },
      { day: 'Wed', workouts: 1 },
      { day: 'Thu', workouts: 1 },
      { day: 'Fri', workouts: 0 },
      { day: 'Sat', workouts: 1 },
      { day: 'Sun', workouts: 1 },
    ];
  }

  static getMonthlyProgressData(): {
    month: string;
    weight: number;
    bodyFat: number;
  }[] {
    return [
      { month: 'Jul', weight: 78, bodyFat: 20 },
      { month: 'Aug', weight: 77, bodyFat: 19.2 },
      { month: 'Sep', weight: 76, bodyFat: 18.5 },
      { month: 'Oct', weight: 75, bodyFat: 18.0 },
    ];
  }
}

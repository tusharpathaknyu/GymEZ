import { Exercise, WorkoutTemplate, Workout } from '../types/workout';

export const EXERCISES_DATABASE: Exercise[] = [
  // Strength Training - Upper Body
  {
    id: 'push_up',
    name: 'Push-ups',
    category: 'strength',
    muscle_groups: ['chest', 'shoulders', 'triceps', 'core'],
    equipment: [],
    description: 'Classic bodyweight exercise for upper body strength',
    instructions: [
      'Start in plank position with hands slightly wider than shoulders',
      'Lower your body until chest nearly touches the floor',
      'Push back up to starting position',
      'Keep core tight throughout the movement',
    ],
    difficulty: 'beginner',
    sets: 3,
    reps: 12,
    rest_seconds: 60,
  },
  {
    id: 'pull_up',
    name: 'Pull-ups',
    category: 'strength',
    muscle_groups: ['back', 'biceps', 'shoulders'],
    equipment: ['pull-up bar'],
    description: 'Upper body pulling exercise targeting back and arms',
    instructions: [
      'Hang from pull-up bar with overhand grip',
      'Pull your body up until chin clears the bar',
      'Lower back down with control',
      'Avoid swinging or kipping',
    ],
    difficulty: 'intermediate',
    sets: 3,
    reps: 8,
    rest_seconds: 90,
  },
  {
    id: 'bench_press',
    name: 'Bench Press',
    category: 'strength',
    muscle_groups: ['chest', 'shoulders', 'triceps'],
    equipment: ['barbell', 'bench'],
    description: 'Fundamental upper body pressing movement',
    instructions: [
      'Lie on bench with feet flat on floor',
      'Grip bar slightly wider than shoulder width',
      'Lower bar to chest with control',
      'Press bar back up to full arm extension',
    ],
    difficulty: 'intermediate',
    sets: 4,
    reps: 10,
    rest_seconds: 120,
  },

  // Strength Training - Lower Body
  {
    id: 'squat',
    name: 'Bodyweight Squats',
    category: 'strength',
    muscle_groups: ['quadriceps', 'glutes', 'hamstrings', 'calves'],
    equipment: [],
    description: 'Fundamental lower body movement pattern',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower your body as if sitting back into a chair',
      'Keep knees in line with toes',
      'Return to starting position',
    ],
    difficulty: 'beginner',
    sets: 3,
    reps: 15,
    rest_seconds: 60,
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    category: 'strength',
    muscle_groups: ['hamstrings', 'glutes', 'back', 'traps'],
    equipment: ['barbell'],
    description: 'Hip hinge movement targeting posterior chain',
    instructions: [
      'Stand with bar over mid-foot',
      'Bend at hips and knees to grip bar',
      'Keep back straight and chest up',
      'Drive through heels to stand up straight',
    ],
    difficulty: 'intermediate',
    sets: 4,
    reps: 8,
    rest_seconds: 150,
  },

  // Cardio Exercises
  {
    id: 'jumping_jacks',
    name: 'Jumping Jacks',
    category: 'cardio',
    muscle_groups: ['full body'],
    equipment: [],
    description: 'Full body cardiovascular exercise',
    instructions: [
      'Start standing with feet together, arms at sides',
      'Jump feet apart while raising arms overhead',
      'Jump back to starting position',
      'Maintain steady rhythm',
    ],
    difficulty: 'beginner',
    duration_minutes: 2,
    rest_seconds: 30,
  },
  {
    id: 'burpees',
    name: 'Burpees',
    category: 'cardio',
    muscle_groups: ['full body'],
    equipment: [],
    description: 'High-intensity full body exercise',
    instructions: [
      'Start standing, then squat down and place hands on floor',
      'Jump feet back into plank position',
      'Do a push-up (optional)',
      'Jump feet back to squat, then jump up with arms overhead',
    ],
    difficulty: 'advanced',
    sets: 3,
    reps: 10,
    rest_seconds: 90,
  },
  {
    id: 'mountain_climbers',
    name: 'Mountain Climbers',
    category: 'cardio',
    muscle_groups: ['core', 'shoulders', 'legs'],
    equipment: [],
    description: 'Dynamic cardio exercise in plank position',
    instructions: [
      'Start in plank position',
      'Bring right knee toward chest',
      'Switch legs quickly, like running in place',
      'Keep hips level and core engaged',
    ],
    difficulty: 'intermediate',
    duration_minutes: 1,
    rest_seconds: 30,
  },

  // Core/Flexibility
  {
    id: 'plank',
    name: 'Plank',
    category: 'strength',
    muscle_groups: ['core', 'shoulders', 'glutes'],
    equipment: [],
    description: 'Isometric core strengthening exercise',
    instructions: [
      'Start in push-up position',
      'Lower onto forearms',
      'Keep body in straight line from head to heels',
      'Hold position while breathing normally',
    ],
    difficulty: 'beginner',
    duration_minutes: 1,
    rest_seconds: 60,
  },
  {
    id: 'yoga_child_pose',
    name: "Child's Pose",
    category: 'flexibility',
    muscle_groups: ['back', 'hips', 'shoulders'],
    equipment: ['yoga mat'],
    description: 'Relaxing yoga pose for stretching and recovery',
    instructions: [
      'Kneel on floor with big toes touching',
      'Sit back on heels and separate knees',
      'Fold forward, extending arms in front',
      'Rest forehead on mat and breathe deeply',
    ],
    difficulty: 'beginner',
    duration_minutes: 2,
    rest_seconds: 0,
  },
];

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'beginner_full_body',
    name: 'Beginner Full Body',
    description: 'Perfect starter workout hitting all major muscle groups',
    category: 'strength',
    exercises: [
      EXERCISES_DATABASE.find(e => e.id === 'squat')!,
      EXERCISES_DATABASE.find(e => e.id === 'push_up')!,
      EXERCISES_DATABASE.find(e => e.id === 'plank')!,
      EXERCISES_DATABASE.find(e => e.id === 'jumping_jacks')!,
    ],
    estimated_duration_minutes: 25,
    difficulty: 'beginner',
  },
  {
    id: 'upper_body_strength',
    name: 'Upper Body Strength',
    description: 'Focus on building upper body muscle and strength',
    category: 'strength',
    exercises: [
      EXERCISES_DATABASE.find(e => e.id === 'push_up')!,
      EXERCISES_DATABASE.find(e => e.id === 'pull_up')!,
      EXERCISES_DATABASE.find(e => e.id === 'bench_press')!,
      EXERCISES_DATABASE.find(e => e.id === 'plank')!,
    ],
    estimated_duration_minutes: 45,
    difficulty: 'intermediate',
  },
  {
    id: 'cardio_hiit',
    name: 'HIIT Cardio Blast',
    description: 'High-intensity interval training for maximum calorie burn',
    category: 'hiit',
    exercises: [
      EXERCISES_DATABASE.find(e => e.id === 'jumping_jacks')!,
      EXERCISES_DATABASE.find(e => e.id === 'burpees')!,
      EXERCISES_DATABASE.find(e => e.id === 'mountain_climbers')!,
      EXERCISES_DATABASE.find(e => e.id === 'squat')!,
    ],
    estimated_duration_minutes: 20,
    difficulty: 'advanced',
  },
  {
    id: 'lower_body_power',
    name: 'Lower Body Power',
    description: 'Build strong legs and glutes with these exercises',
    category: 'strength',
    exercises: [
      EXERCISES_DATABASE.find(e => e.id === 'squat')!,
      EXERCISES_DATABASE.find(e => e.id === 'deadlift')!,
      EXERCISES_DATABASE.find(e => e.id === 'mountain_climbers')!,
      EXERCISES_DATABASE.find(e => e.id === 'plank')!,
    ],
    estimated_duration_minutes: 40,
    difficulty: 'intermediate',
  },
  {
    id: 'flexibility_recovery',
    name: 'Flexibility & Recovery',
    description: 'Gentle stretching and mobility work for active recovery',
    category: 'yoga',
    exercises: [
      EXERCISES_DATABASE.find(e => e.id === 'yoga_child_pose')!,
      EXERCISES_DATABASE.find(e => e.id === 'plank')!,
    ],
    estimated_duration_minutes: 15,
    difficulty: 'beginner',
  },
];

export class WorkoutService {
  static getAllExercises(): Exercise[] {
    return EXERCISES_DATABASE;
  }

  static getExercisesByCategory(category: string): Exercise[] {
    return EXERCISES_DATABASE.filter(
      exercise => exercise.category === category,
    );
  }

  static getWorkoutTemplates(): WorkoutTemplate[] {
    return WORKOUT_TEMPLATES;
  }

  static getWorkoutTemplatesByDifficulty(
    difficulty: string,
  ): WorkoutTemplate[] {
    return WORKOUT_TEMPLATES.filter(
      template => template.difficulty === difficulty,
    );
  }

  static createCustomWorkout(
    name: string,
    exercises: Exercise[],
  ): WorkoutTemplate {
    return {
      id: `custom_${Date.now()}`,
      name,
      description: 'Custom workout created by user',
      category: 'custom',
      exercises,
      estimated_duration_minutes: exercises.reduce((total, ex) => {
        return (
          total + (ex.duration_minutes || (ex.sets || 1) * (ex.reps || 1) * 0.5)
        );
      }, 0),
      difficulty: 'intermediate',
    };
  }

  static startWorkout(template: WorkoutTemplate): Workout {
    const workout: Workout = {
      id: `workout_${Date.now()}`,
      name: template.name,
      description: template.description,
      exercises: template.exercises,
      sets: [],
      total_duration_minutes: 0,
      difficulty: template.difficulty,
      created_at: new Date().toISOString(),
    };

    // Initialize sets for each exercise
    template.exercises.forEach(exercise => {
      const numSets = exercise.sets || 1;
      for (let i = 1; i <= numSets; i++) {
        workout.sets.push({
          exercise_id: exercise.id,
          set_number: i,
          reps: exercise.reps || 0,
          weight: 0,
          duration_seconds: (exercise.duration_minutes || 0) * 60,
          rest_seconds: exercise.rest_seconds || 60,
          completed: false,
        });
      }
    });

    return workout;
  }
}

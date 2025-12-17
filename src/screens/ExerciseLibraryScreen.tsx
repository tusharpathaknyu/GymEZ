import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { SlideInView, FadeInView } from '../components/AnimatedComponents';

const { width } = Dimensions.get('window');

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'strength' | 'cardio' | 'flexibility' | 'plyometric';
  instructions: string[];
  tips: string[];
  videoUrl?: string;
  imageUrl?: string;
  targetMuscles: string[];
  secondaryMuscles: string[];
}

const MUSCLE_GROUPS = [
  { id: 'all', name: 'All', icon: '💪' },
  { id: 'chest', name: 'Chest', icon: '🫁' },
  { id: 'back', name: 'Back', icon: '🔙' },
  { id: 'shoulders', name: 'Shoulders', icon: '🏋️' },
  { id: 'arms', name: 'Arms', icon: '💪' },
  { id: 'legs', name: 'Legs', icon: '🦵' },
  { id: 'core', name: 'Core', icon: '🎯' },
  { id: 'cardio', name: 'Cardio', icon: '❤️' },
];

const EXERCISES: Exercise[] = [
  {
    id: '1',
    name: 'Barbell Bench Press',
    muscleGroup: 'chest',
    equipment: 'barbell',
    difficulty: 'intermediate',
    type: 'strength',
    instructions: [
      'Lie flat on the bench with your feet firmly on the ground',
      'Grip the bar slightly wider than shoulder-width',
      'Unrack the bar and lower it to your mid-chest',
      'Press the bar back up to the starting position',
      'Keep your back slightly arched and shoulder blades retracted',
    ],
    tips: [
      'Keep your wrists straight throughout the movement',
      'Don\'t bounce the bar off your chest',
      'Breathe out as you press up',
    ],
    targetMuscles: ['Pectoralis Major'],
    secondaryMuscles: ['Triceps', 'Anterior Deltoid'],
  },
  {
    id: '2',
    name: 'Barbell Squat',
    muscleGroup: 'legs',
    equipment: 'barbell',
    difficulty: 'intermediate',
    type: 'strength',
    instructions: [
      'Position the bar on your upper back',
      'Stand with feet shoulder-width apart',
      'Bend at hips and knees to lower your body',
      'Go down until thighs are parallel to floor',
      'Drive through heels to stand back up',
    ],
    tips: [
      'Keep your core tight throughout',
      'Don\'t let knees cave inward',
      'Look straight ahead, not down',
    ],
    targetMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core', 'Lower Back'],
  },
  {
    id: '3',
    name: 'Deadlift',
    muscleGroup: 'back',
    equipment: 'barbell',
    difficulty: 'advanced',
    type: 'strength',
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Bend at hips and knees, grip the bar',
      'Keep back flat, chest up',
      'Drive through heels, extending hips and knees',
      'Stand tall at the top, then reverse the movement',
    ],
    tips: [
      'Keep the bar close to your body',
      'Don\'t round your lower back',
      'Engage your lats before lifting',
    ],
    targetMuscles: ['Erector Spinae', 'Glutes', 'Hamstrings'],
    secondaryMuscles: ['Traps', 'Forearms', 'Core'],
  },
  {
    id: '4',
    name: 'Pull-ups',
    muscleGroup: 'back',
    equipment: 'pull-up bar',
    difficulty: 'intermediate',
    type: 'strength',
    instructions: [
      'Hang from the bar with palms facing away',
      'Engage your lats and pull your chest to the bar',
      'Squeeze at the top',
      'Lower yourself with control',
    ],
    tips: [
      'Avoid swinging or kipping',
      'Focus on pulling with your back, not arms',
      'Full extension at the bottom',
    ],
    targetMuscles: ['Latissimus Dorsi'],
    secondaryMuscles: ['Biceps', 'Rear Deltoids', 'Rhomboids'],
  },
  {
    id: '5',
    name: 'Overhead Press',
    muscleGroup: 'shoulders',
    equipment: 'barbell',
    difficulty: 'intermediate',
    type: 'strength',
    instructions: [
      'Start with bar at shoulder height',
      'Grip slightly wider than shoulder-width',
      'Press the bar overhead until arms are locked',
      'Lower with control to starting position',
    ],
    tips: [
      'Keep core tight to protect lower back',
      'Don\'t lean back excessively',
      'Push your head through at the top',
    ],
    targetMuscles: ['Deltoids'],
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Traps'],
  },
  {
    id: '6',
    name: 'Barbell Row',
    muscleGroup: 'back',
    equipment: 'barbell',
    difficulty: 'intermediate',
    type: 'strength',
    instructions: [
      'Hinge at hips with slight knee bend',
      'Grip bar shoulder-width, arms hanging',
      'Pull bar to lower chest/upper abs',
      'Squeeze shoulder blades together',
      'Lower with control',
    ],
    tips: [
      'Keep back flat throughout',
      'Don\'t use momentum',
      'Pull elbows back, not just up',
    ],
    targetMuscles: ['Latissimus Dorsi', 'Rhomboids'],
    secondaryMuscles: ['Biceps', 'Rear Deltoids', 'Traps'],
  },
  {
    id: '7',
    name: 'Dumbbell Curl',
    muscleGroup: 'arms',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    type: 'strength',
    instructions: [
      'Stand with dumbbells at your sides',
      'Keep elbows close to your body',
      'Curl the weights up while keeping upper arms stationary',
      'Squeeze at the top',
      'Lower with control',
    ],
    tips: [
      'Don\'t swing the weights',
      'Full range of motion',
      'Control the negative',
    ],
    targetMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
  },
  {
    id: '8',
    name: 'Tricep Dips',
    muscleGroup: 'arms',
    equipment: 'dip bars',
    difficulty: 'intermediate',
    type: 'strength',
    instructions: [
      'Grip the bars and lift yourself up',
      'Lean slightly forward',
      'Lower until elbows are at 90 degrees',
      'Push back up to starting position',
    ],
    tips: [
      'Don\'t go too deep if you have shoulder issues',
      'Keep elbows tucked',
      'Control the descent',
    ],
    targetMuscles: ['Triceps'],
    secondaryMuscles: ['Chest', 'Anterior Deltoids'],
  },
  {
    id: '9',
    name: 'Plank',
    muscleGroup: 'core',
    equipment: 'none',
    difficulty: 'beginner',
    type: 'strength',
    instructions: [
      'Start in push-up position on forearms',
      'Keep body in straight line from head to heels',
      'Engage core and squeeze glutes',
      'Hold for desired time',
    ],
    tips: [
      'Don\'t let hips sag or pike up',
      'Breathe normally',
      'Look at the floor to keep neck neutral',
    ],
    targetMuscles: ['Rectus Abdominis', 'Transverse Abdominis'],
    secondaryMuscles: ['Obliques', 'Lower Back', 'Shoulders'],
  },
  {
    id: '10',
    name: 'Lunges',
    muscleGroup: 'legs',
    equipment: 'none',
    difficulty: 'beginner',
    type: 'strength',
    instructions: [
      'Stand with feet hip-width apart',
      'Step forward with one leg',
      'Lower until both knees are at 90 degrees',
      'Push through front heel to return',
      'Alternate legs',
    ],
    tips: [
      'Keep front knee over ankle',
      'Keep torso upright',
      'Don\'t let back knee touch ground hard',
    ],
    targetMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Calves', 'Core'],
  },
  {
    id: '11',
    name: 'Romanian Deadlift',
    muscleGroup: 'legs',
    equipment: 'barbell',
    difficulty: 'intermediate',
    type: 'strength',
    instructions: [
      'Hold bar in front of thighs',
      'Push hips back while keeping legs nearly straight',
      'Lower bar along legs until you feel hamstring stretch',
      'Drive hips forward to return to start',
    ],
    tips: [
      'Keep bar close to body',
      'Don\'t round lower back',
      'Slight knee bend is okay',
    ],
    targetMuscles: ['Hamstrings', 'Glutes'],
    secondaryMuscles: ['Lower Back', 'Core'],
  },
  {
    id: '12',
    name: 'Lateral Raise',
    muscleGroup: 'shoulders',
    equipment: 'dumbbell',
    difficulty: 'beginner',
    type: 'strength',
    instructions: [
      'Stand with dumbbells at sides',
      'Raise arms out to sides until parallel to floor',
      'Keep slight bend in elbows',
      'Lower with control',
    ],
    tips: [
      'Don\'t use momentum',
      'Lead with elbows, not hands',
      'Don\'t shrug shoulders',
    ],
    targetMuscles: ['Lateral Deltoids'],
    secondaryMuscles: ['Traps', 'Supraspinatus'],
  },
];

const ExerciseLibraryScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>(EXERCISES);
  const slideAnim = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    filterExercises();
  }, [searchQuery, selectedMuscle]);

  const filterExercises = () => {
    let filtered = EXERCISES;

    if (selectedMuscle !== 'all') {
      filtered = filtered.filter(e => e.muscleGroup === selectedMuscle);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        e =>
          e.name.toLowerCase().includes(query) ||
          e.muscleGroup.toLowerCase().includes(query) ||
          e.equipment.toLowerCase().includes(query)
      );
    }

    setFilteredExercises(filtered);
  };

  const openExerciseDetail = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeExerciseDetail = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setSelectedExercise(null));
  };

  const getDifficultyColor = (difficulty: Exercise['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
    }
  };

  const renderExerciseCard = ({ item, index }: { item: Exercise; index: number }) => (
    <SlideInView direction="up" delay={index * 50}>
      <TouchableOpacity
        style={styles.exerciseCard}
        onPress={() => openExerciseDetail(item)}
        activeOpacity={0.8}
      >
        <View style={styles.exerciseImagePlaceholder}>
          <Text style={styles.exerciseEmoji}>
            {item.muscleGroup === 'chest' ? '🫁' :
             item.muscleGroup === 'back' ? '🔙' :
             item.muscleGroup === 'legs' ? '🦵' :
             item.muscleGroup === 'arms' ? '💪' :
             item.muscleGroup === 'shoulders' ? '🏋️' :
             item.muscleGroup === 'core' ? '🎯' : '💪'}
          </Text>
        </View>
        
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{item.name}</Text>
          <View style={styles.exerciseMeta}>
            <View style={[styles.difficultyBadge, { backgroundColor: `${getDifficultyColor(item.difficulty)}20` }]}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}>
                {item.difficulty}
              </Text>
            </View>
            <Text style={styles.equipmentText}>🎯 {item.equipment}</Text>
          </View>
          <View style={styles.musclesTags}>
            {item.targetMuscles.slice(0, 2).map((muscle, i) => (
              <View key={i} style={styles.muscleTag}>
                <Text style={styles.muscleTagText}>{muscle}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    </SlideInView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Exercise Library</Text>
        <Text style={styles.headerSubtitle}>{EXERCISES.length} exercises available</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Muscle Group Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {MUSCLE_GROUPS.map((group) => (
          <TouchableOpacity
            key={group.id}
            style={[
              styles.filterChip,
              selectedMuscle === group.id && styles.filterChipActive,
            ]}
            onPress={() => setSelectedMuscle(group.id)}
          >
            <Text style={styles.filterChipIcon}>{group.icon}</Text>
            <Text style={[
              styles.filterChipText,
              selectedMuscle === group.id && styles.filterChipTextActive,
            ]}>
              {group.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredExercises.length} {filteredExercises.length === 1 ? 'exercise' : 'exercises'}
        </Text>
      </View>

      {/* Exercise List */}
      <FlatList
        data={filteredExercises}
        renderItem={renderExerciseCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No exercises found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
          </View>
        }
      />

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <Animated.View
          style={[
            styles.detailModal,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <View style={styles.detailHeader}>
            <TouchableOpacity onPress={closeExerciseDetail} style={styles.backButton}>
              <Text style={styles.backButtonText}>‹ Back</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.detailContent} showsVerticalScrollIndicator={false}>
            <View style={styles.detailImagePlaceholder}>
              <Text style={styles.detailEmoji}>
                {selectedExercise.muscleGroup === 'chest' ? '🫁' :
                 selectedExercise.muscleGroup === 'back' ? '🔙' :
                 selectedExercise.muscleGroup === 'legs' ? '🦵' :
                 selectedExercise.muscleGroup === 'arms' ? '💪' :
                 selectedExercise.muscleGroup === 'shoulders' ? '🏋️' :
                 selectedExercise.muscleGroup === 'core' ? '🎯' : '💪'}
              </Text>
            </View>

            <View style={styles.detailInfo}>
              <Text style={styles.detailName}>{selectedExercise.name}</Text>
              
              <View style={styles.detailMeta}>
                <View style={[styles.difficultyBadge, { backgroundColor: `${getDifficultyColor(selectedExercise.difficulty)}20` }]}>
                  <Text style={[styles.difficultyText, { color: getDifficultyColor(selectedExercise.difficulty) }]}>
                    {selectedExercise.difficulty}
                  </Text>
                </View>
                <Text style={styles.equipmentBadge}>🎯 {selectedExercise.equipment}</Text>
              </View>

              {/* Target Muscles */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Target Muscles</Text>
                <View style={styles.musclesContainer}>
                  {selectedExercise.targetMuscles.map((muscle, i) => (
                    <View key={i} style={styles.primaryMuscle}>
                      <Text style={styles.primaryMuscleText}>{muscle}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Secondary Muscles */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Secondary Muscles</Text>
                <View style={styles.musclesContainer}>
                  {selectedExercise.secondaryMuscles.map((muscle, i) => (
                    <View key={i} style={styles.secondaryMuscle}>
                      <Text style={styles.secondaryMuscleText}>{muscle}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Instructions */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>How to Perform</Text>
                {selectedExercise.instructions.map((instruction, i) => (
                  <View key={i} style={styles.instructionRow}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.instructionText}>{instruction}</Text>
                  </View>
                ))}
              </View>

              {/* Tips */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💡 Pro Tips</Text>
                {selectedExercise.tips.map((tip, i) => (
                  <View key={i} style={styles.tipRow}>
                    <Text style={styles.tipBullet}>•</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>

              {/* Add to Workout Button */}
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>+ Add to Workout</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 4,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  clearIcon: {
    fontSize: 16,
    color: '#9ca3af',
    padding: 4,
  },
  filterScroll: {
    backgroundColor: '#fff',
    maxHeight: 60,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#10b981',
  },
  filterChipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  exerciseImagePlaceholder: {
    width: 64,
    height: 64,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseEmoji: {
    fontSize: 28,
  },
  exerciseInfo: {
    flex: 1,
    marginLeft: 16,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  equipmentText: {
    fontSize: 12,
    color: '#6b7280',
  },
  musclesTags: {
    flexDirection: 'row',
    gap: 6,
  },
  muscleTag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  muscleTagText: {
    fontSize: 11,
    color: '#0369a1',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 24,
    color: '#d1d5db',
    fontWeight: '300',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  // Detail Modal
  detailModal: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#fff',
  },
  detailHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 18,
    color: '#10b981',
    fontWeight: '600',
  },
  detailContent: {
    flex: 1,
  },
  detailImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailEmoji: {
    fontSize: 80,
  },
  detailInfo: {
    padding: 20,
  },
  detailName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  detailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  equipmentBadge: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  musclesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  primaryMuscle: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  primaryMuscleText: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '600',
  },
  secondaryMuscle: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  secondaryMuscleText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    backgroundColor: '#10b981',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: '#f59e0b',
    marginRight: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default ExerciseLibraryScreen;

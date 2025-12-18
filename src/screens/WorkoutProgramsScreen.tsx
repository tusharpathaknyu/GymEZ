import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import { useAuth } from '../services/auth';
import { buttonPress, successHaptic } from '../utils/haptics';

const { width } = Dimensions.get('window');

interface Program {
  id: string;
  name: string;
  description: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  frequency: string;
  icon: string;
  color: string;
  weeks: Week[];
  tags: string[];
}

interface Week {
  weekNumber: number;
  days: WorkoutDay[];
}

interface WorkoutDay {
  day: number;
  name: string;
  exercises: Exercise[];
  isRest?: boolean;
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rpe?: number;
  notes?: string;
}

const PROGRAMS: Program[] = [
  {
    id: 'ppl',
    name: 'Push Pull Legs',
    description: 'Classic 6-day split for muscle building',
    duration: '12 weeks',
    level: 'Intermediate',
    frequency: '6 days/week',
    icon: '💪',
    color: '#10b981',
    tags: ['Hypertrophy', 'Muscle Building'],
    weeks: [
      {
        weekNumber: 1,
        days: [
          { day: 1, name: 'Push A', exercises: [
            { name: 'Bench Press', sets: 4, reps: '8-10', rpe: 8 },
            { name: 'Overhead Press', sets: 3, reps: '8-10', rpe: 8 },
            { name: 'Incline DB Press', sets: 3, reps: '10-12', rpe: 7 },
            { name: 'Lateral Raises', sets: 4, reps: '12-15', rpe: 8 },
            { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', rpe: 8 },
          ]},
          { day: 2, name: 'Pull A', exercises: [
            { name: 'Deadlift', sets: 4, reps: '5-6', rpe: 8 },
            { name: 'Barbell Rows', sets: 4, reps: '8-10', rpe: 8 },
            { name: 'Lat Pulldown', sets: 3, reps: '10-12', rpe: 7 },
            { name: 'Face Pulls', sets: 3, reps: '15-20', rpe: 7 },
            { name: 'Barbell Curls', sets: 3, reps: '10-12', rpe: 8 },
          ]},
          { day: 3, name: 'Legs A', exercises: [
            { name: 'Squat', sets: 4, reps: '6-8', rpe: 8 },
            { name: 'Romanian Deadlift', sets: 3, reps: '8-10', rpe: 8 },
            { name: 'Leg Press', sets: 3, reps: '10-12', rpe: 8 },
            { name: 'Leg Curls', sets: 3, reps: '10-12', rpe: 8 },
            { name: 'Calf Raises', sets: 4, reps: '12-15', rpe: 8 },
          ]},
          { day: 4, name: 'Push B', exercises: [
            { name: 'Overhead Press', sets: 4, reps: '6-8', rpe: 8 },
            { name: 'Incline Bench Press', sets: 3, reps: '8-10', rpe: 8 },
            { name: 'Cable Flyes', sets: 3, reps: '12-15', rpe: 7 },
            { name: 'Lateral Raises', sets: 4, reps: '12-15', rpe: 8 },
            { name: 'Overhead Tricep Ext', sets: 3, reps: '12-15', rpe: 8 },
          ]},
          { day: 5, name: 'Pull B', exercises: [
            { name: 'Barbell Rows', sets: 4, reps: '6-8', rpe: 8 },
            { name: 'Pull-ups', sets: 3, reps: 'AMRAP', rpe: 8 },
            { name: 'Cable Rows', sets: 3, reps: '10-12', rpe: 7 },
            { name: 'Rear Delt Flyes', sets: 3, reps: '15-20', rpe: 7 },
            { name: 'Hammer Curls', sets: 3, reps: '10-12', rpe: 8 },
          ]},
          { day: 6, name: 'Legs B', exercises: [
            { name: 'Front Squat', sets: 4, reps: '6-8', rpe: 8 },
            { name: 'Hip Thrust', sets: 3, reps: '10-12', rpe: 8 },
            { name: 'Leg Extensions', sets: 3, reps: '12-15', rpe: 8 },
            { name: 'Leg Curls', sets: 3, reps: '10-12', rpe: 8 },
            { name: 'Calf Raises', sets: 4, reps: '12-15', rpe: 8 },
          ]},
          { day: 7, name: 'Rest', isRest: true, exercises: [] },
        ],
      },
    ],
  },
  {
    id: '5x5',
    name: 'StrongLifts 5x5',
    description: 'Simple strength program for beginners',
    duration: '12 weeks',
    level: 'Beginner',
    frequency: '3 days/week',
    icon: '🏋️',
    color: '#6366f1',
    tags: ['Strength', 'Beginner Friendly'],
    weeks: [
      {
        weekNumber: 1,
        days: [
          { day: 1, name: 'Workout A', exercises: [
            { name: 'Squat', sets: 5, reps: '5', notes: 'Add 2.5kg each session' },
            { name: 'Bench Press', sets: 5, reps: '5', notes: 'Add 2.5kg each session' },
            { name: 'Barbell Row', sets: 5, reps: '5', notes: 'Add 2.5kg each session' },
          ]},
          { day: 2, name: 'Rest', isRest: true, exercises: [] },
          { day: 3, name: 'Workout B', exercises: [
            { name: 'Squat', sets: 5, reps: '5', notes: 'Add 2.5kg each session' },
            { name: 'Overhead Press', sets: 5, reps: '5', notes: 'Add 2.5kg each session' },
            { name: 'Deadlift', sets: 1, reps: '5', notes: 'Add 5kg each session' },
          ]},
          { day: 4, name: 'Rest', isRest: true, exercises: [] },
          { day: 5, name: 'Workout A', exercises: [
            { name: 'Squat', sets: 5, reps: '5', notes: 'Add 2.5kg each session' },
            { name: 'Bench Press', sets: 5, reps: '5', notes: 'Add 2.5kg each session' },
            { name: 'Barbell Row', sets: 5, reps: '5', notes: 'Add 2.5kg each session' },
          ]},
          { day: 6, name: 'Rest', isRest: true, exercises: [] },
          { day: 7, name: 'Rest', isRest: true, exercises: [] },
        ],
      },
    ],
  },
  {
    id: 'phul',
    name: 'PHUL',
    description: 'Power Hypertrophy Upper Lower split',
    duration: '10 weeks',
    level: 'Intermediate',
    frequency: '4 days/week',
    icon: '⚡',
    color: '#f59e0b',
    tags: ['Strength', 'Hypertrophy', 'Balanced'],
    weeks: [
      {
        weekNumber: 1,
        days: [
          { day: 1, name: 'Upper Power', exercises: [
            { name: 'Bench Press', sets: 4, reps: '3-5', rpe: 9 },
            { name: 'Barbell Row', sets: 4, reps: '3-5', rpe: 9 },
            { name: 'Overhead Press', sets: 3, reps: '5-8', rpe: 8 },
            { name: 'Lat Pulldown', sets: 3, reps: '6-10', rpe: 8 },
            { name: 'Barbell Curl', sets: 2, reps: '6-10', rpe: 8 },
          ]},
          { day: 2, name: 'Lower Power', exercises: [
            { name: 'Squat', sets: 4, reps: '3-5', rpe: 9 },
            { name: 'Deadlift', sets: 3, reps: '3-5', rpe: 9 },
            { name: 'Leg Press', sets: 4, reps: '10-15', rpe: 8 },
            { name: 'Leg Curl', sets: 3, reps: '6-10', rpe: 8 },
            { name: 'Calf Raises', sets: 4, reps: '6-10', rpe: 8 },
          ]},
          { day: 3, name: 'Rest', isRest: true, exercises: [] },
          { day: 4, name: 'Upper Hypertrophy', exercises: [
            { name: 'Incline DB Press', sets: 4, reps: '8-12', rpe: 8 },
            { name: 'Cable Row', sets: 4, reps: '8-12', rpe: 8 },
            { name: 'DB Shoulder Press', sets: 3, reps: '10-15', rpe: 7 },
            { name: 'Lat Pulldown', sets: 3, reps: '10-15', rpe: 7 },
            { name: 'Tricep Extension', sets: 3, reps: '10-15', rpe: 8 },
            { name: 'Hammer Curl', sets: 3, reps: '10-15', rpe: 8 },
          ]},
          { day: 5, name: 'Lower Hypertrophy', exercises: [
            { name: 'Front Squat', sets: 4, reps: '8-12', rpe: 8 },
            { name: 'RDL', sets: 3, reps: '8-12', rpe: 8 },
            { name: 'Leg Press', sets: 4, reps: '12-15', rpe: 8 },
            { name: 'Leg Curl', sets: 3, reps: '12-15', rpe: 8 },
            { name: 'Calf Raises', sets: 4, reps: '12-15', rpe: 8 },
          ]},
          { day: 6, name: 'Rest', isRest: true, exercises: [] },
          { day: 7, name: 'Rest', isRest: true, exercises: [] },
        ],
      },
    ],
  },
  {
    id: 'brosplit',
    name: 'Classic Bro Split',
    description: 'One muscle group per day',
    duration: '8 weeks',
    level: 'Intermediate',
    frequency: '5 days/week',
    icon: '🔥',
    color: '#ef4444',
    tags: ['Bodybuilding', 'Hypertrophy'],
    weeks: [
      {
        weekNumber: 1,
        days: [
          { day: 1, name: 'Chest Day', exercises: [
            { name: 'Bench Press', sets: 4, reps: '8-10', rpe: 8 },
            { name: 'Incline DB Press', sets: 4, reps: '10-12', rpe: 8 },
            { name: 'Cable Flyes', sets: 3, reps: '12-15', rpe: 7 },
            { name: 'Dips', sets: 3, reps: '10-12', rpe: 8 },
          ]},
          { day: 2, name: 'Back Day', exercises: [
            { name: 'Deadlift', sets: 4, reps: '5-6', rpe: 9 },
            { name: 'Pull-ups', sets: 4, reps: 'AMRAP', rpe: 8 },
            { name: 'Barbell Row', sets: 4, reps: '8-10', rpe: 8 },
            { name: 'Lat Pulldown', sets: 3, reps: '10-12', rpe: 7 },
          ]},
          { day: 3, name: 'Shoulders', exercises: [
            { name: 'Overhead Press', sets: 4, reps: '6-8', rpe: 8 },
            { name: 'Lateral Raises', sets: 4, reps: '12-15', rpe: 8 },
            { name: 'Face Pulls', sets: 3, reps: '15-20', rpe: 7 },
            { name: 'Front Raises', sets: 3, reps: '12-15', rpe: 7 },
          ]},
          { day: 4, name: 'Legs', exercises: [
            { name: 'Squat', sets: 4, reps: '6-8', rpe: 9 },
            { name: 'RDL', sets: 3, reps: '8-10', rpe: 8 },
            { name: 'Leg Press', sets: 4, reps: '10-15', rpe: 8 },
            { name: 'Leg Curls', sets: 3, reps: '10-12', rpe: 8 },
            { name: 'Calf Raises', sets: 4, reps: '12-15', rpe: 8 },
          ]},
          { day: 5, name: 'Arms', exercises: [
            { name: 'Barbell Curl', sets: 4, reps: '8-10', rpe: 8 },
            { name: 'Skull Crushers', sets: 4, reps: '8-10', rpe: 8 },
            { name: 'Hammer Curls', sets: 3, reps: '10-12', rpe: 8 },
            { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', rpe: 8 },
          ]},
          { day: 6, name: 'Rest', isRest: true, exercises: [] },
          { day: 7, name: 'Rest', isRest: true, exercises: [] },
        ],
      },
    ],
  },
];

const WorkoutProgramsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [activeWeek, setActiveWeek] = useState(1);
  const [showProgramDetail, setShowProgramDetail] = useState(false);
  const [activeProgram, setActiveProgram] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState(1);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const startProgram = (program: Program) => {
    successHaptic();
    setActiveProgram(program.id);
    setShowProgramDetail(false);
  };

  const renderProgramCard = (program: Program) => (
    <TouchableOpacity
      key={program.id}
      style={[styles.programCard, activeProgram === program.id && styles.activeProgramCard]}
      onPress={() => {
        buttonPress();
        setSelectedProgram(program);
        setShowProgramDetail(true);
      }}
      activeOpacity={0.8}
    >
      {activeProgram === program.id && (
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>ACTIVE</Text>
        </View>
      )}
      <View style={[styles.programIconContainer, { backgroundColor: program.color + '20' }]}>
        <Text style={styles.programIcon}>{program.icon}</Text>
      </View>
      <View style={styles.programInfo}>
        <Text style={styles.programName}>{program.name}</Text>
        <Text style={styles.programDescription}>{program.description}</Text>
        <View style={styles.programMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📅</Text>
            <Text style={styles.metaText}>{program.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>🔄</Text>
            <Text style={styles.metaText}>{program.frequency}</Text>
          </View>
        </View>
        <View style={styles.tagContainer}>
          <View style={[styles.levelBadge, { backgroundColor: 
            program.level === 'Beginner' ? '#10b981' : 
            program.level === 'Intermediate' ? '#f59e0b' : '#ef4444' 
          }]}>
            <Text style={styles.levelText}>{program.level}</Text>
          </View>
          {program.tags.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={styles.arrowIcon}>→</Text>
    </TouchableOpacity>
  );

  const renderWeekSelector = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekSelector}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((week) => (
        <TouchableOpacity
          key={week}
          style={[styles.weekButton, activeWeek === week && styles.weekButtonActive]}
          onPress={() => { buttonPress(); setActiveWeek(week); }}
        >
          <Text style={[styles.weekButtonText, activeWeek === week && styles.weekButtonTextActive]}>
            Week {week}
          </Text>
          {week <= 2 && <View style={styles.completedDot} />}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderDaySchedule = (day: WorkoutDay, dayIndex: number) => (
    <TouchableOpacity
      key={dayIndex}
      style={[
        styles.dayCard,
        day.isRest && styles.restDayCard,
        currentDay === day.day && activeProgram === selectedProgram?.id && styles.currentDayCard,
      ]}
      onPress={() => {
        if (!day.isRest) {
          buttonPress();
          // Navigate to workout
        }
      }}
      disabled={day.isRest}
    >
      <View style={styles.dayHeader}>
        <View style={styles.dayNumberContainer}>
          <Text style={styles.dayNumber}>Day {day.day}</Text>
          {currentDay === day.day && activeProgram === selectedProgram?.id && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayText}>TODAY</Text>
            </View>
          )}
        </View>
        <Text style={[styles.dayName, day.isRest && styles.restDayName]}>{day.name}</Text>
      </View>
      
      {!day.isRest && (
        <View style={styles.exercisePreview}>
          {day.exercises.slice(0, 3).map((exercise, index) => (
            <View key={index} style={styles.exerciseItem}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseSets}>{exercise.sets}×{exercise.reps}</Text>
            </View>
          ))}
          {day.exercises.length > 3 && (
            <Text style={styles.moreExercises}>+{day.exercises.length - 3} more</Text>
          )}
        </View>
      )}
      
      {day.isRest && (
        <View style={styles.restContent}>
          <Text style={styles.restIcon}>😴</Text>
          <Text style={styles.restText}>Recovery Day</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderProgramDetailModal = () => (
    <Modal visible={showProgramDetail} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.programDetailModal}>
          {selectedProgram && (
            <>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowProgramDetail(false)}>
                  <Text style={styles.closeButton}>←</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{selectedProgram.name}</Text>
                <View style={{ width: 40 }} />
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Program Overview */}
                <View style={styles.overviewSection}>
                  <View style={[styles.bigIconContainer, { backgroundColor: selectedProgram.color + '20' }]}>
                    <Text style={styles.bigIcon}>{selectedProgram.icon}</Text>
                  </View>
                  <Text style={styles.overviewDescription}>{selectedProgram.description}</Text>
                  
                  <View style={styles.overviewStats}>
                    <View style={styles.overviewStat}>
                      <Text style={styles.overviewStatValue}>{selectedProgram.duration}</Text>
                      <Text style={styles.overviewStatLabel}>Duration</Text>
                    </View>
                    <View style={styles.overviewStat}>
                      <Text style={styles.overviewStatValue}>{selectedProgram.frequency}</Text>
                      <Text style={styles.overviewStatLabel}>Frequency</Text>
                    </View>
                    <View style={styles.overviewStat}>
                      <Text style={styles.overviewStatValue}>{selectedProgram.level}</Text>
                      <Text style={styles.overviewStatLabel}>Level</Text>
                    </View>
                  </View>
                </View>

                {/* Week Selector */}
                {renderWeekSelector()}

                {/* Day Schedule */}
                <View style={styles.scheduleSection}>
                  <Text style={styles.sectionTitle}>Week {activeWeek} Schedule</Text>
                  {selectedProgram.weeks[0].days.map((day, index) => renderDaySchedule(day, index))}
                </View>

                {/* Auto Progression Info */}
                <View style={styles.progressionSection}>
                  <Text style={styles.sectionTitle}>📈 Auto Progression</Text>
                  <View style={styles.progressionCard}>
                    <Text style={styles.progressionText}>
                      This program uses progressive overload. Weights will automatically increase when you hit all reps:
                    </Text>
                    <View style={styles.progressionRules}>
                      <Text style={styles.progressionRule}>• Upper body: +2.5kg per week</Text>
                      <Text style={styles.progressionRule}>• Lower body: +5kg per week</Text>
                      <Text style={styles.progressionRule}>• Deload every 4th week</Text>
                    </View>
                  </View>
                </View>

                <View style={{ height: 100 }} />
              </ScrollView>

              {/* Start Button */}
              <View style={styles.startButtonContainer}>
                {activeProgram === selectedProgram.id ? (
                  <TouchableOpacity 
                    style={[styles.startButton, { backgroundColor: '#6b7280' }]}
                    onPress={() => { buttonPress(); setActiveProgram(null); }}
                  >
                    <Text style={styles.startButtonText}>End Program</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={[styles.startButton, { backgroundColor: selectedProgram.color }]}
                    onPress={() => startProgram(selectedProgram)}
                  >
                    <Text style={styles.startButtonText}>Start This Program</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Programs</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Active Program Banner */}
        {activeProgram && (
          <Animated.View style={[styles.activeProgramBanner, { opacity: fadeAnim }]}>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerIcon}>
                {PROGRAMS.find(p => p.id === activeProgram)?.icon}
              </Text>
              <View style={styles.bannerInfo}>
                <Text style={styles.bannerTitle}>
                  {PROGRAMS.find(p => p.id === activeProgram)?.name}
                </Text>
                <Text style={styles.bannerSubtitle}>Week 2 • Day {currentDay}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={() => {
                buttonPress();
                const program = PROGRAMS.find(p => p.id === activeProgram);
                if (program) {
                  setSelectedProgram(program);
                  setShowProgramDetail(true);
                }
              }}
            >
              <Text style={styles.continueButtonText}>Continue →</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
          {['All', 'Beginner', 'Intermediate', 'Advanced', 'Strength', 'Hypertrophy'].map((filter) => (
            <TouchableOpacity key={filter} style={styles.filterTab} onPress={() => buttonPress()}>
              <Text style={styles.filterTabText}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Programs List */}
        <View style={styles.programsList}>
          <Text style={styles.sectionHeader}>Popular Programs</Text>
          {PROGRAMS.map(renderProgramCard)}
        </View>

        {/* Custom Program CTA */}
        <TouchableOpacity style={styles.customProgramCard} onPress={() => buttonPress()}>
          <Text style={styles.customIcon}>✏️</Text>
          <View style={styles.customContent}>
            <Text style={styles.customTitle}>Create Custom Program</Text>
            <Text style={styles.customSubtitle}>Build your own workout plan</Text>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {renderProgramDetailModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  filterButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  filterIcon: { fontSize: 18 },
  activeProgramBanner: {
    backgroundColor: '#10b981',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  bannerIcon: { fontSize: 32, marginRight: 12 },
  bannerInfo: { flex: 1 },
  bannerTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  bannerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  continueButton: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  continueButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  filterTabs: { paddingHorizontal: 20, paddingVertical: 16 },
  filterTab: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  filterTabText: { fontSize: 13, fontWeight: '500', color: '#6b7280' },
  programsList: { paddingHorizontal: 20 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
  programCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activeProgramCard: { borderWidth: 2, borderColor: '#10b981' },
  activeBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#10b981', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  activeBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  programIconContainer: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  programIcon: { fontSize: 28 },
  programInfo: { flex: 1 },
  programName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  programDescription: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  programMeta: { flexDirection: 'row', marginTop: 8, gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaIcon: { fontSize: 12, marginRight: 4 },
  metaText: { fontSize: 11, color: '#9ca3af' },
  tagContainer: { flexDirection: 'row', marginTop: 8, gap: 6 },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  levelText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  tag: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  tagText: { fontSize: 10, color: '#6b7280' },
  arrowIcon: { fontSize: 18, color: '#9ca3af' },
  customProgramCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e5e7eb',
  },
  customIcon: { fontSize: 24, marginRight: 12 },
  customContent: { flex: 1 },
  customTitle: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  customSubtitle: { fontSize: 12, color: '#6b7280' },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  programDetailModal: { flex: 1, backgroundColor: '#fff', marginTop: 60, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  closeButton: { fontSize: 24, color: '#1f2937' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  overviewSection: { alignItems: 'center', padding: 24 },
  bigIconContainer: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  bigIcon: { fontSize: 40 },
  overviewDescription: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  overviewStats: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  overviewStat: { alignItems: 'center' },
  overviewStatValue: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  overviewStatLabel: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  weekSelector: { paddingHorizontal: 20, marginBottom: 16 },
  weekButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', marginRight: 8, position: 'relative' },
  weekButtonActive: { backgroundColor: '#10b981' },
  weekButtonText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  weekButtonTextActive: { color: '#fff' },
  completedDot: { position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
  scheduleSection: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
  dayCard: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, marginBottom: 12 },
  restDayCard: { backgroundColor: '#fef3c7' },
  currentDayCard: { borderWidth: 2, borderColor: '#10b981' },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dayNumberContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayNumber: { fontSize: 12, fontWeight: '600', color: '#9ca3af' },
  todayBadge: { backgroundColor: '#10b981', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  todayText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  dayName: { fontSize: 14, fontWeight: 'bold', color: '#1f2937' },
  restDayName: { color: '#f59e0b' },
  exercisePreview: {},
  exerciseItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  exerciseName: { fontSize: 13, color: '#374151' },
  exerciseSets: { fontSize: 13, color: '#6b7280' },
  moreExercises: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  restContent: { alignItems: 'center', paddingVertical: 8 },
  restIcon: { fontSize: 24, marginBottom: 4 },
  restText: { fontSize: 13, color: '#f59e0b', fontWeight: '500' },
  progressionSection: { paddingHorizontal: 20, marginTop: 16 },
  progressionCard: { backgroundColor: '#ecfdf5', borderRadius: 12, padding: 16 },
  progressionText: { fontSize: 13, color: '#065f46', lineHeight: 20 },
  progressionRules: { marginTop: 12 },
  progressionRule: { fontSize: 12, color: '#047857', marginBottom: 4 },
  startButtonContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  startButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  startButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});

export default WorkoutProgramsScreen;

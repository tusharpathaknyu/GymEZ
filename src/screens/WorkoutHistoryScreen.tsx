import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { useAuth } from '../services/auth';
import { buttonPress, successHaptic } from '../utils/haptics';

const { width } = Dimensions.get('window');

interface WorkoutHistoryEntry {
  id: string;
  date: string;
  name: string;
  duration: number; // minutes
  exercises: number;
  sets: number;
  totalVolume: number; // lbs
  muscleGroups: string[];
  type: 'strength' | 'cardio' | 'mixed';
}

// Mock workout data (would come from Supabase in production)
const MOCK_WORKOUTS: WorkoutHistoryEntry[] = [
  {
    id: '1',
    date: new Date().toISOString(),
    name: 'Push Day',
    duration: 65,
    exercises: 6,
    sets: 24,
    totalVolume: 12500,
    muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
    type: 'strength',
  },
  {
    id: '2',
    date: new Date(Date.now() - 86400000).toISOString(),
    name: 'Pull Day',
    duration: 55,
    exercises: 5,
    sets: 20,
    totalVolume: 9800,
    muscleGroups: ['Back', 'Biceps'],
    type: 'strength',
  },
  {
    id: '3',
    date: new Date(Date.now() - 172800000).toISOString(),
    name: 'Leg Day',
    duration: 70,
    exercises: 7,
    sets: 28,
    totalVolume: 18500,
    muscleGroups: ['Quads', 'Hamstrings', 'Glutes'],
    type: 'strength',
  },
  {
    id: '4',
    date: new Date(Date.now() - 259200000).toISOString(),
    name: 'HIIT Cardio',
    duration: 30,
    exercises: 8,
    sets: 16,
    totalVolume: 0,
    muscleGroups: ['Full Body'],
    type: 'cardio',
  },
  {
    id: '5',
    date: new Date(Date.now() - 345600000).toISOString(),
    name: 'Push Day',
    duration: 60,
    exercises: 6,
    sets: 24,
    totalVolume: 11800,
    muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
    type: 'strength',
  },
  {
    id: '6',
    date: new Date(Date.now() - 518400000).toISOString(),
    name: 'Upper Body',
    duration: 50,
    exercises: 5,
    sets: 20,
    totalVolume: 8500,
    muscleGroups: ['Chest', 'Back', 'Arms'],
    type: 'mixed',
  },
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const WorkoutHistoryScreen = ({ navigation }: { navigation: any }) => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutHistoryEntry[]>(MOCK_WORKOUTS);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate calendar data for current month
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: { date: Date | null; hasWorkout: boolean; workoutType?: string }[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push({ date: null, hasWorkout: false });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toDateString();
      const workout = workouts.find(w => new Date(w.date).toDateString() === dateStr);
      days.push({
        date,
        hasWorkout: !!workout,
        workoutType: workout?.type,
      });
    }

    return days;
  }, [currentMonth, workouts]);

  // Get workouts for selected date
  const selectedDateWorkouts = useMemo(() => {
    return workouts.filter(w => 
      new Date(w.date).toDateString() === selectedDate.toDateString()
    );
  }, [selectedDate, workouts]);

  // Stats calculations
  const stats = useMemo(() => {
    const thisMonth = workouts.filter(w => {
      const d = new Date(w.date);
      return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    });

    return {
      totalWorkouts: thisMonth.length,
      totalMinutes: thisMonth.reduce((sum, w) => sum + w.duration, 0),
      totalVolume: thisMonth.reduce((sum, w) => sum + w.totalVolume, 0),
      avgDuration: thisMonth.length > 0 
        ? Math.round(thisMonth.reduce((sum, w) => sum + w.duration, 0) / thisMonth.length)
        : 0,
    };
  }, [workouts, currentMonth]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    buttonPress();
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    return date.toDateString() === new Date().toDateString();
  };

  const isSelected = (date: Date | null): boolean => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const getWorkoutColor = (type?: string): string => {
    switch (type) {
      case 'strength': return '#10b981';
      case 'cardio': return '#f59e0b';
      case 'mixed': return '#8b5cf6';
      default: return '#10b981';
    }
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}k`;
    }
    return volume.toString();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout History</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'calendar' && styles.toggleActive]}
            onPress={() => setViewMode('calendar')}
          >
            <Text style={styles.toggleIcon}>📅</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && styles.toggleActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={styles.toggleIcon}>📋</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Monthly Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalMinutes}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatVolume(stats.totalVolume)}</Text>
              <Text style={styles.statLabel}>Volume (lbs)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.avgDuration}</Text>
              <Text style={styles.statLabel}>Avg Duration</Text>
            </View>
          </View>
        </View>

        {viewMode === 'calendar' ? (
          <>
            {/* Calendar */}
            <View style={styles.calendarContainer}>
              {/* Month Navigation */}
              <View style={styles.monthNav}>
                <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
                  <Text style={styles.navIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.monthText}>
                  {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </Text>
                <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
                  <Text style={styles.navIcon}>→</Text>
                </TouchableOpacity>
              </View>

              {/* Days of Week Header */}
              <View style={styles.daysHeader}>
                {DAYS_OF_WEEK.map(day => (
                  <Text key={day} style={styles.dayHeader}>{day}</Text>
                ))}
              </View>

              {/* Calendar Grid */}
              <View style={styles.calendarGrid}>
                {calendarData.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCell,
                      isToday(day.date) && styles.todayCell,
                      isSelected(day.date) && styles.selectedCell,
                    ]}
                    onPress={() => {
                      if (day.date) {
                        buttonPress();
                        setSelectedDate(day.date);
                      }
                    }}
                    disabled={!day.date}
                  >
                    {day.date && (
                      <>
                        <Text style={[
                          styles.dayText,
                          isToday(day.date) && styles.todayText,
                          isSelected(day.date) && styles.selectedText,
                        ]}>
                          {day.date.getDate()}
                        </Text>
                        {day.hasWorkout && (
                          <View style={[
                            styles.workoutDot,
                            { backgroundColor: getWorkoutColor(day.workoutType) }
                          ]} />
                        )}
                      </>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Legend */}
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                  <Text style={styles.legendText}>Strength</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
                  <Text style={styles.legendText}>Cardio</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#8b5cf6' }]} />
                  <Text style={styles.legendText}>Mixed</Text>
                </View>
              </View>
            </View>

            {/* Selected Day Workouts */}
            <View style={styles.selectedDaySection}>
              <Text style={styles.selectedDateTitle}>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
              {selectedDateWorkouts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>🏋️</Text>
                  <Text style={styles.emptyText}>No workout on this day</Text>
                  <Text style={styles.emptySubtext}>Rest day or not logged</Text>
                </View>
              ) : (
                selectedDateWorkouts.map(workout => (
                  <TouchableOpacity key={workout.id} style={styles.workoutCard}>
                    <View style={styles.workoutHeader}>
                      <View style={[styles.workoutTypeBadge, { backgroundColor: getWorkoutColor(workout.type) + '20' }]}>
                        <Text style={[styles.workoutTypeText, { color: getWorkoutColor(workout.type) }]}>
                          {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
                        </Text>
                      </View>
                      <Text style={styles.workoutTime}>
                        {new Date(workout.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </Text>
                    </View>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <View style={styles.workoutStats}>
                      <View style={styles.workoutStat}>
                        <Text style={styles.workoutStatIcon}>⏱️</Text>
                        <Text style={styles.workoutStatValue}>{workout.duration} min</Text>
                      </View>
                      <View style={styles.workoutStat}>
                        <Text style={styles.workoutStatIcon}>🏋️</Text>
                        <Text style={styles.workoutStatValue}>{workout.exercises} exercises</Text>
                      </View>
                      <View style={styles.workoutStat}>
                        <Text style={styles.workoutStatIcon}>💪</Text>
                        <Text style={styles.workoutStatValue}>{workout.sets} sets</Text>
                      </View>
                    </View>
                    {workout.totalVolume > 0 && (
                      <Text style={styles.volumeText}>
                        Total Volume: {workout.totalVolume.toLocaleString()} lbs
                      </Text>
                    )}
                    <View style={styles.muscleGroups}>
                      {workout.muscleGroups.map(muscle => (
                        <View key={muscle} style={styles.muscleChip}>
                          <Text style={styles.muscleText}>{muscle}</Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </>
        ) : (
          /* List View */
          <View style={styles.listContainer}>
            {workouts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyText}>No workouts yet</Text>
                <Text style={styles.emptySubtext}>Start logging your workouts!</Text>
              </View>
            ) : (
              workouts.map(workout => (
                <TouchableOpacity key={workout.id} style={styles.listCard}>
                  <View style={styles.listDate}>
                    <Text style={styles.listDay}>
                      {new Date(workout.date).getDate()}
                    </Text>
                    <Text style={styles.listMonth}>
                      {MONTHS[new Date(workout.date).getMonth()]}
                    </Text>
                  </View>
                  <View style={styles.listInfo}>
                    <Text style={styles.listName}>{workout.name}</Text>
                    <Text style={styles.listDetails}>
                      {workout.duration} min • {workout.exercises} exercises • {workout.sets} sets
                    </Text>
                    <View style={styles.listMuscles}>
                      {workout.muscleGroups.slice(0, 3).map(muscle => (
                        <Text key={muscle} style={styles.listMuscle}>{muscle}</Text>
                      ))}
                    </View>
                  </View>
                  <View style={[styles.listTypeDot, { backgroundColor: getWorkoutColor(workout.type) }]} />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#374151',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 4,
  },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: '#fff',
  },
  toggleIcon: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: '#10b981',
    margin: 16,
    padding: 20,
    borderRadius: 20,
  },
  statsTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 18,
    color: '#374151',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    width: (width - 64) / 7,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: (width - 64) / 7,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  todayCell: {
    backgroundColor: '#f3f4f6',
  },
  selectedCell: {
    backgroundColor: '#10b981',
  },
  dayText: {
    fontSize: 14,
    color: '#374151',
  },
  todayText: {
    fontWeight: '700',
    color: '#10b981',
  },
  selectedText: {
    fontWeight: '700',
    color: '#fff',
  },
  workoutDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#6b7280',
  },
  selectedDaySection: {
    paddingHorizontal: 16,
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  workoutCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  workoutTypeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  workoutTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workoutStatIcon: {
    fontSize: 12,
  },
  workoutStatValue: {
    fontSize: 13,
    color: '#6b7280',
  },
  volumeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 8,
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  muscleChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  muscleText: {
    fontSize: 11,
    color: '#6b7280',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  listCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listDate: {
    width: 50,
    alignItems: 'center',
    marginRight: 12,
  },
  listDay: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  listMonth: {
    fontSize: 12,
    color: '#6b7280',
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  listDetails: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  listMuscles: {
    flexDirection: 'row',
    gap: 6,
  },
  listMuscle: {
    fontSize: 11,
    color: '#9ca3af',
  },
  listTypeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  bottomPadding: {
    height: 40,
  },
});

export default WorkoutHistoryScreen;

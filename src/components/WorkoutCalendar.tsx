import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

interface CalendarDay {
  date: number;
  hasWorkout: boolean;
  hasPR: boolean;
}

const WorkoutCalendar = () => {
  const [currentMonth] = useState(new Date());
  
  const generateCalendar = (): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: CalendarDay[] = [];
    
    // Add empty slots for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push({date: 0, hasWorkout: false, hasPR: false});
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      // Random data for demo
      const hasWorkout = Math.random() > 0.5;
      const hasPR = Math.random() > 0.8;
      days.push({date: i, hasWorkout, hasPR});
    }
    
    return days;
  };

  const calendar = generateCalendar();

  const renderDay = (day: CalendarDay, index: number) => {
    if (day.date === 0) {
      return <View key={index} style={styles.emptyDay} />;
    }

    return (
      <View key={index} style={styles.dayContainer}>
        {day.hasPR && (
          <View style={styles.prDot}>
            <Text style={styles.prIcon}>🏆</Text>
          </View>
        )}
        {day.hasWorkout && (
          <View style={styles.workoutDot} />
        )}
        <Text style={[styles.dayText, day.hasWorkout && styles.dayActive]}>
          {day.date}
        </Text>
      </View>
    );
  };

  const monthName = currentMonth.toLocaleDateString('en-US', {month: 'long'});
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout Calendar 📅</Text>
        <TouchableOpacity>
          <Text style={styles.monthText}>{monthName}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.daysOfWeek}>
        {daysOfWeek.map(day => (
          <View key={day} style={styles.dayOfWeek}>
            <Text style={styles.dayOfWeekText}>{day}</Text>
          </View>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {calendar.map(renderDay)}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.workoutDot]} />
          <Text style={styles.legendText}>Workout</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.prIcon}>🏆</Text>
          <Text style={styles.legendText}>PR Day</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  daysOfWeek: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayOfWeek: {
    flex: 1,
    alignItems: 'center',
  },
  dayOfWeekText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  dayContainer: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
  },
  dayText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  dayActive: {
    color: '#111827',
    fontWeight: '600',
  },
  workoutDot: {
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  prDot: {
    position: 'absolute',
    top: 0,
  },
  prIcon: {
    fontSize: 12,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default WorkoutCalendar;


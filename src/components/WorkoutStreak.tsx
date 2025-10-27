import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useAuth} from '../services/auth';
import {supabase} from '../services/supabase';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  weeklyProgress: number[];
}

const {width} = Dimensions.get('window');

const WorkoutStreak = () => {
  const {user} = useAuth();
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadStreak();
    }
  }, [user]);

  const loadStreak = async () => {
    if (!user?.id) return;

    try {
      // Calculate current streak (consecutive days with PRs)
      const today = new Date();
      const days = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
      }

      const {data: prs} = await supabase
        .from('personal_records')
        .select('achieved_at')
        .eq('user_id', user.id)
        .in('achieved_at', days.map(d => d.split('T')[0]));

      // Calculate current streak
      let currentStreak = 0;
      let checkDate = new Date(today);
      
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        const hasPR = prs?.some(pr => pr.achieved_at.startsWith(dateStr));
        
        if (hasPR) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      // Get longest streak (simplified)
      const longestStreak = currentStreak;

      // Weekly progress (last 7 days)
      const weeklyProgress = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const hasPR = prs?.some(pr => pr.achieved_at.startsWith(dateStr));
        weeklyProgress.push(hasPR ? 1 : 0);
      }

      setStreak({currentStreak, longestStreak, weeklyProgress});
    } catch (error) {
      console.error('Error loading streak:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStreakMessage = () => {
    if (streak.currentStreak === 0) return 'Start your streak!';
    if (streak.currentStreak < 7) return `Keep it going! 🔥`;
    if (streak.currentStreak < 30) return 'You\'re on fire! 🔥🔥';
    return 'Incredible! Keep burning! 🔥🔥🔥';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔥 Current Streak</Text>
        <Text style={styles.message}>{getStreakMessage()}</Text>
      </View>

      <View style={styles.streakContainer}>
        <View style={styles.fireContainer}>
          <Text style={styles.fireIcon}>🔥</Text>
          <Text style={styles.streakNumber}>{streak.currentStreak}</Text>
          <Text style={styles.streakLabel}>Days</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{streak.longestStreak}</Text>
            <Text style={styles.statLabel}>Longest Streak</Text>
          </View>
        </View>
      </View>

      {/* Weekly Progress */}
      <View style={styles.weeklyContainer}>
        <Text style={styles.weeklyTitle}>This Week</Text>
        <View style={styles.weeklyBars}>
          {streak.weeklyProgress.map((day, index) => (
            <View key={index} style={styles.dayContainer}>
              <View
                style={[
                  styles.dayBar,
                  day === 1 && styles.dayBarActive,
                  {height: day === 1 ? 40 : 20},
                ]}
              />
              <Text style={styles.dayLabel}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}</Text>
            </View>
          ))}
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
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  fireContainer: {
    alignItems: 'center',
  },
  fireIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  streakLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  weeklyContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
  },
  weeklyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  weeklyBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayBar: {
    width: 28,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
  },
  dayBarActive: {
    backgroundColor: '#f59e0b',
  },
  dayLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
});

export default WorkoutStreak;


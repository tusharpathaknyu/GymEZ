import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Switch,
  Animated,
  Modal,
} from 'react-native';
import { useAuth } from '../services/auth';
import { buttonPress, successHaptic } from '../utils/haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  thisWeekWorkouts: number;
  weeklyGoal: number;
  lastWorkoutDate: string;
  streakHistory: boolean[]; // Last 30 days
}

interface NotificationSettings {
  workoutReminders: boolean;
  reminderTime: string;
  streakAlerts: boolean;
  progressUpdates: boolean;
  socialNotifications: boolean;
  restDayReminders: boolean;
  hydrationReminders: boolean;
  motivationalQuotes: boolean;
}

const MOTIVATIONAL_QUOTES = [
  { quote: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { quote: "Strength does not come from the body. It comes from the will.", author: "Gandhi" },
  { quote: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold" },
  { quote: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { quote: "Your body can stand almost anything. It's your mind you have to convince.", author: "Unknown" },
];

const SmartNotificationsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 12,
    longestStreak: 28,
    thisWeekWorkouts: 4,
    weeklyGoal: 5,
    lastWorkoutDate: '2024-12-16',
    streakHistory: [true, true, true, false, true, true, true, false, true, true, true, true, false, true, true, true, true, true, false, false, true, true, true, true, false, true, true, true, true, true],
  });
  
  const [settings, setSettings] = useState<NotificationSettings>({
    workoutReminders: true,
    reminderTime: '07:00',
    streakAlerts: true,
    progressUpdates: true,
    socialNotifications: true,
    restDayReminders: true,
    hydrationReminders: false,
    motivationalQuotes: true,
  });

  const [showTimeModal, setShowTimeModal] = useState(false);
  const [dailyQuote, setDailyQuote] = useState(MOTIVATIONAL_QUOTES[0]);
  
  const flameAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Flame pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(flameAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(flameAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: streakData.thisWeekWorkouts / streakData.weeklyGoal,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    // Random daily quote
    setDailyQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, []);

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    buttonPress();
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderStreakCalendar = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (29 - i));
      return {
        date,
        dayOfWeek: date.getDay(),
        worked: streakData.streakHistory[i],
      };
    });

    return (
      <View style={styles.calendarContainer}>
        {/* Day labels */}
        <View style={styles.dayLabels}>
          {days.map((day, index) => (
            <Text key={index} style={styles.dayLabel}>{day}</Text>
          ))}
        </View>
        
        {/* Calendar grid */}
        <View style={styles.calendarGrid}>
          {last30Days.map((day, index) => (
            <View
              key={index}
              style={[
                styles.calendarDay,
                day.worked && styles.calendarDayWorked,
                index === 29 && styles.calendarDayToday,
              ]}
            >
              {day.worked && <Text style={styles.checkmark}>✓</Text>}
            </View>
          ))}
        </View>
        
        <View style={styles.calendarLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.legendText}>Workout day</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#e5e7eb' }]} />
            <Text style={styles.legendText}>Rest day</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderStreakCard = () => (
    <View style={styles.streakCard}>
      <View style={styles.streakHeader}>
        <Animated.Text style={[styles.flameIcon, { transform: [{ scale: flameAnim }] }]}>
          🔥
        </Animated.Text>
        <View style={styles.streakInfo}>
          <Text style={styles.streakNumber}>{streakData.currentStreak}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>
      </View>
      
      <View style={styles.streakStats}>
        <View style={styles.streakStat}>
          <Text style={styles.statValue}>{streakData.longestStreak}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
        <View style={styles.streakDivider} />
        <View style={styles.streakStat}>
          <Text style={styles.statValue}>{streakData.thisWeekWorkouts}/{streakData.weeklyGoal}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
      </View>
      
      {/* Weekly Progress Bar */}
      <View style={styles.weeklyProgress}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Weekly Goal Progress</Text>
          <Text style={styles.progressPercent}>
            {Math.round((streakData.thisWeekWorkouts / streakData.weeklyGoal) * 100)}%
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
          {/* Goal markers */}
          {[1, 2, 3, 4, 5].map((goal) => (
            <View
              key={goal}
              style={[
                styles.goalMarker,
                { left: `${(goal / streakData.weeklyGoal) * 100}%` },
                goal <= streakData.thisWeekWorkouts && styles.goalMarkerComplete,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );

  const renderAchievements = () => {
    const achievements = [
      { icon: '🔥', title: '7 Day Streak', earned: true, description: 'Work out 7 days in a row' },
      { icon: '💪', title: 'Iron Will', earned: true, description: 'Complete 20 workouts' },
      { icon: '🌟', title: 'Perfect Week', earned: streakData.thisWeekWorkouts >= streakData.weeklyGoal, description: 'Hit weekly goal' },
      { icon: '🏆', title: '30 Day Legend', earned: streakData.longestStreak >= 30, description: '30 day streak' },
      { icon: '⚡', title: 'Early Bird', earned: false, description: 'Morning workouts for a week' },
      { icon: '🦾', title: 'Comeback Kid', earned: false, description: 'Return after 7+ days off' },
    ];

    return (
      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>🏅 Streak Achievements</Text>
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement, index) => (
            <View
              key={index}
              style={[
                styles.achievementCard,
                !achievement.earned && styles.achievementLocked,
              ]}
            >
              <Text style={[styles.achievementIcon, !achievement.earned && styles.achievementIconLocked]}>
                {achievement.icon}
              </Text>
              <Text style={[styles.achievementTitle, !achievement.earned && styles.textLocked]}>
                {achievement.title}
              </Text>
              <Text style={[styles.achievementDesc, !achievement.earned && styles.textLocked]}>
                {achievement.description}
              </Text>
              {achievement.earned && (
                <View style={styles.earnedBadge}>
                  <Text style={styles.earnedText}>✓</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderNotificationSettings = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>🔔 Smart Notifications</Text>
      
      <View style={styles.settingsCard}>
        {/* Workout Reminders */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>⏰</Text>
            <View>
              <Text style={styles.settingTitle}>Workout Reminders</Text>
              <Text style={styles.settingDesc}>Daily reminder at {settings.reminderTime}</Text>
            </View>
          </View>
          <Switch
            value={settings.workoutReminders}
            onValueChange={(value) => updateSetting('workoutReminders', value)}
            trackColor={{ false: '#e5e7eb', true: '#86efac' }}
            thumbColor={settings.workoutReminders ? '#10b981' : '#f4f4f5'}
          />
        </View>
        
        {settings.workoutReminders && (
          <TouchableOpacity 
            style={styles.timeSelector}
            onPress={() => { buttonPress(); setShowTimeModal(true); }}
          >
            <Text style={styles.timeSelectorText}>Change time: {settings.reminderTime}</Text>
            <Text style={styles.timeArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Streak Alerts */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🔥</Text>
            <View>
              <Text style={styles.settingTitle}>Streak Alerts</Text>
              <Text style={styles.settingDesc}>Get warned before losing your streak</Text>
            </View>
          </View>
          <Switch
            value={settings.streakAlerts}
            onValueChange={(value) => updateSetting('streakAlerts', value)}
            trackColor={{ false: '#e5e7eb', true: '#86efac' }}
            thumbColor={settings.streakAlerts ? '#10b981' : '#f4f4f5'}
          />
        </View>

        {/* Progress Updates */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>📈</Text>
            <View>
              <Text style={styles.settingTitle}>Progress Updates</Text>
              <Text style={styles.settingDesc}>Weekly progress summaries</Text>
            </View>
          </View>
          <Switch
            value={settings.progressUpdates}
            onValueChange={(value) => updateSetting('progressUpdates', value)}
            trackColor={{ false: '#e5e7eb', true: '#86efac' }}
            thumbColor={settings.progressUpdates ? '#10b981' : '#f4f4f5'}
          />
        </View>

        {/* Rest Day Reminders */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>😴</Text>
            <View>
              <Text style={styles.settingTitle}>Rest Day Reminders</Text>
              <Text style={styles.settingDesc}>Reminders to take rest days</Text>
            </View>
          </View>
          <Switch
            value={settings.restDayReminders}
            onValueChange={(value) => updateSetting('restDayReminders', value)}
            trackColor={{ false: '#e5e7eb', true: '#86efac' }}
            thumbColor={settings.restDayReminders ? '#10b981' : '#f4f4f5'}
          />
        </View>

        {/* Hydration Reminders */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>💧</Text>
            <View>
              <Text style={styles.settingTitle}>Hydration Reminders</Text>
              <Text style={styles.settingDesc}>Remind to drink water throughout day</Text>
            </View>
          </View>
          <Switch
            value={settings.hydrationReminders}
            onValueChange={(value) => updateSetting('hydrationReminders', value)}
            trackColor={{ false: '#e5e7eb', true: '#86efac' }}
            thumbColor={settings.hydrationReminders ? '#10b981' : '#f4f4f5'}
          />
        </View>

        {/* Motivational Quotes */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>💬</Text>
            <View>
              <Text style={styles.settingTitle}>Motivational Quotes</Text>
              <Text style={styles.settingDesc}>Daily inspiration to keep you going</Text>
            </View>
          </View>
          <Switch
            value={settings.motivationalQuotes}
            onValueChange={(value) => updateSetting('motivationalQuotes', value)}
            trackColor={{ false: '#e5e7eb', true: '#86efac' }}
            thumbColor={settings.motivationalQuotes ? '#10b981' : '#f4f4f5'}
          />
        </View>
      </View>
    </View>
  );

  const renderDailyQuote = () => (
    <View style={styles.quoteCard}>
      <Text style={styles.quoteIcon}>💬</Text>
      <Text style={styles.quoteText}>"{dailyQuote.quote}"</Text>
      <Text style={styles.quoteAuthor}>— {dailyQuote.author}</Text>
    </View>
  );

  const renderTimeModal = () => (
    <Modal visible={showTimeModal} transparent animationType="fade">
      <TouchableOpacity 
        style={styles.modalOverlay} 
        onPress={() => setShowTimeModal(false)}
        activeOpacity={1}
      >
        <View style={styles.timeModalContent}>
          <Text style={styles.timeModalTitle}>Set Reminder Time</Text>
          <ScrollView style={styles.timeList}>
            {['05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '12:00', '17:00', '18:00', '19:00', '20:00'].map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeOption,
                  settings.reminderTime === time && styles.timeOptionSelected,
                ]}
                onPress={() => {
                  successHaptic();
                  setSettings(prev => ({ ...prev, reminderTime: time }));
                  setShowTimeModal(false);
                }}
              >
                <Text style={[
                  styles.timeOptionText,
                  settings.reminderTime === time && styles.timeOptionTextSelected,
                ]}>
                  {time}
                </Text>
                {settings.reminderTime === time && (
                  <Text style={styles.timeCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Streaks & Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Daily Quote */}
        {settings.motivationalQuotes && renderDailyQuote()}
        
        {/* Streak Card */}
        {renderStreakCard()}
        
        {/* Streak Calendar */}
        <View style={styles.calendarSection}>
          <Text style={styles.sectionTitle}>📅 Last 30 Days</Text>
          {renderStreakCalendar()}
        </View>
        
        {/* Achievements */}
        {renderAchievements()}
        
        {/* Notification Settings */}
        {renderNotificationSettings()}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {renderTimeModal()}
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
  
  // Quote Card
  quoteCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  quoteIcon: { fontSize: 24, marginBottom: 8 },
  quoteText: { fontSize: 14, color: '#374151', fontStyle: 'italic', textAlign: 'center', lineHeight: 22 },
  quoteAuthor: { fontSize: 12, color: '#6b7280', marginTop: 8 },
  
  // Streak Card
  streakCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  streakHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  flameIcon: { fontSize: 48, marginRight: 16 },
  streakInfo: {},
  streakNumber: { fontSize: 48, fontWeight: 'bold', color: '#1f2937' },
  streakLabel: { fontSize: 16, color: '#6b7280' },
  streakStats: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  streakStat: { alignItems: 'center', paddingHorizontal: 24 },
  streakDivider: { width: 1, backgroundColor: '#e5e7eb' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  statLabel: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  
  // Weekly Progress
  weeklyProgress: { marginTop: 8 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, color: '#6b7280' },
  progressPercent: { fontSize: 13, fontWeight: '600', color: '#10b981' },
  progressBarBg: { height: 12, backgroundColor: '#f3f4f6', borderRadius: 6, overflow: 'hidden', position: 'relative' },
  progressBarFill: { height: '100%', backgroundColor: '#10b981', borderRadius: 6 },
  goalMarker: { position: 'absolute', top: 0, width: 2, height: '100%', backgroundColor: '#d1d5db' },
  goalMarkerComplete: { backgroundColor: '#065f46' },
  
  // Calendar
  calendarSection: { marginHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
  calendarContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  dayLabels: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  dayLabel: { fontSize: 11, color: '#9ca3af', width: 36, textAlign: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 6 },
  calendarDay: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  calendarDayWorked: { backgroundColor: '#10b981' },
  calendarDayToday: { borderWidth: 2, borderColor: '#1f2937' },
  checkmark: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  calendarLegend: { flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 24 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
  legendText: { fontSize: 12, color: '#6b7280' },
  
  // Achievements
  achievementsSection: { marginHorizontal: 20, marginTop: 24 },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  achievementCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  achievementLocked: { backgroundColor: '#f9fafb', opacity: 0.7 },
  achievementIcon: { fontSize: 32, marginBottom: 8 },
  achievementIconLocked: { opacity: 0.4 },
  achievementTitle: { fontSize: 13, fontWeight: '600', color: '#1f2937', textAlign: 'center' },
  achievementDesc: { fontSize: 11, color: '#6b7280', textAlign: 'center', marginTop: 4 },
  textLocked: { color: '#9ca3af' },
  earnedBadge: { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' },
  earnedText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  
  // Settings
  settingsSection: { marginHorizontal: 20, marginTop: 24 },
  settingsCard: { backgroundColor: '#fff', borderRadius: 16, padding: 8, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  settingInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingIcon: { fontSize: 24, marginRight: 12 },
  settingTitle: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  settingDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  timeSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 48, backgroundColor: '#f9fafb' },
  timeSelectorText: { fontSize: 13, color: '#6b7280' },
  timeArrow: { fontSize: 14, color: '#9ca3af' },
  
  // Time Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  timeModalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: width - 80, maxHeight: 400 },
  timeModalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', textAlign: 'center', marginBottom: 16 },
  timeList: { maxHeight: 300 },
  timeOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 4 },
  timeOptionSelected: { backgroundColor: '#ecfdf5' },
  timeOptionText: { fontSize: 16, color: '#374151' },
  timeOptionTextSelected: { fontWeight: '600', color: '#10b981' },
  timeCheck: { color: '#10b981', fontWeight: 'bold' },
});

export default SmartNotificationsScreen;

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buttonPress, successHaptic, mediumHaptic } from '../../utils/haptics';

const { width, height } = Dimensions.get('window');
const SHEET_MAX_HEIGHT = height * 0.85;
const SHEET_MIN_HEIGHT = height * 0.5;

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  screen: string;
  color: string;
  gradient?: string[];
  badge?: string;
  description?: string;
}

interface ActionCategory {
  title: string;
  emoji: string;
  items: QuickAction[];
}

const ACTION_CATEGORIES: ActionCategory[] = [
  {
    title: 'Quick Start',
    emoji: '⚡',
    items: [
      { 
        id: 'workout', 
        icon: '🏋️', 
        label: 'Start Workout', 
        screen: 'LiveWorkout', 
        color: '#10b981',
        description: 'Begin your session',
      },
      { 
        id: 'checkin', 
        icon: '📍', 
        label: 'Check In', 
        screen: 'GymCheckin', 
        color: '#ef4444', 
        badge: 'LIVE',
        description: 'Log your gym visit',
      },
      { 
        id: 'programs', 
        icon: '📋', 
        label: 'Programs', 
        screen: 'WorkoutPrograms', 
        color: '#6366f1',
        description: 'Structured plans',
      },
      { 
        id: 'exercises', 
        icon: '📚', 
        label: 'Exercises', 
        screen: 'ExerciseLibrary', 
        color: '#f59e0b',
        description: '500+ exercises',
      },
    ],
  },
  {
    title: 'AI Powered',
    emoji: '🤖',
    items: [
      { 
        id: 'ai-coach', 
        icon: '🧠', 
        label: 'AI Coach', 
        screen: 'AICoach', 
        color: '#8b5cf6', 
        badge: 'AI',
        description: 'Personal guidance',
      },
      { 
        id: 'ai-workout', 
        icon: '⚡', 
        label: 'Generate Workout', 
        screen: 'AIWorkoutGenerator', 
        color: '#ec4899', 
        badge: 'AI',
        description: 'Custom routines',
      },
      { 
        id: 'ai-meals', 
        icon: '🍽️', 
        label: 'Meal Planner', 
        screen: 'AIMealPlanner', 
        color: '#14b8a6', 
        badge: 'AI',
        description: 'Nutrition plans',
      },
      { 
        id: 'ai-insights', 
        icon: '📈', 
        label: 'Progress Insights', 
        screen: 'AIProgressInsights', 
        color: '#f97316', 
        badge: 'AI',
        description: 'Smart analytics',
      },
    ],
  },
  {
    title: 'Track & Measure',
    emoji: '📊',
    items: [
      { 
        id: 'progress', 
        icon: '📊', 
        label: 'Progress', 
        screen: 'ProgressDashboard', 
        color: '#3b82f6',
        description: 'Your journey',
      },
      { 
        id: 'measurements', 
        icon: '📏', 
        label: 'Body Stats', 
        screen: 'BodyMeasurements', 
        color: '#ef4444',
        description: 'Track changes',
      },
      { 
        id: 'nutrition', 
        icon: '🥗', 
        label: 'Nutrition', 
        screen: 'Nutrition', 
        color: '#22c55e',
        description: 'Log meals',
      },
      { 
        id: 'history', 
        icon: '📅', 
        label: 'History', 
        screen: 'WorkoutHistory', 
        color: '#64748b',
        description: 'Past workouts',
      },
    ],
  },
  {
    title: 'Goals & Challenges',
    emoji: '🎯',
    items: [
      { 
        id: 'goals', 
        icon: '🎯', 
        label: 'My Goals', 
        screen: 'Goals', 
        color: '#8b5cf6',
        description: 'Set targets',
      },
      { 
        id: 'challenges', 
        icon: '🏅', 
        label: 'Challenges', 
        screen: 'WeeklyChallenges', 
        color: '#f59e0b', 
        badge: 'NEW',
        description: 'Compete & win',
      },
      { 
        id: 'streaks', 
        icon: '🔥', 
        label: 'Streaks', 
        screen: 'SmartNotifications', 
        color: '#ef4444',
        description: 'Stay consistent',
      },
      { 
        id: 'calculator', 
        icon: '🔢', 
        label: '1RM Calculator', 
        screen: 'OneRMCalculator', 
        color: '#0ea5e9',
        description: 'Max strength',
      },
    ],
  },
  {
    title: 'Games & Social',
    emoji: '🎮',
    items: [
      { 
        id: 'rpg', 
        icon: '⚔️', 
        label: 'Fitness RPG', 
        screen: 'FitnessRPG', 
        color: '#a855f7', 
        badge: 'NEW',
        description: 'Level up!',
      },
      { 
        id: 'guild', 
        icon: '🏰', 
        label: 'My Guild', 
        screen: 'Guild', 
        color: '#f43f5e',
        description: 'Team up',
      },
      { 
        id: 'raids', 
        icon: '🐉', 
        label: 'Boss Raids', 
        screen: 'BossRaid', 
        color: '#0ea5e9',
        description: 'Epic battles',
      },
      { 
        id: 'tournament', 
        icon: '🏆', 
        label: 'Tournament', 
        screen: 'Tournament', 
        color: '#eab308',
        description: 'Compete live',
      },
    ],
  },
];

interface QuickActionsSheetProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
  onActionPress?: (actionId: string, screen?: string) => void;
}

const QuickActionsSheet: React.FC<QuickActionsSheetProps> = ({
  visible,
  onClose,
  navigation,
  onActionPress,
}) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef<Animated.Value[]>([]).current;
  const [sheetHeight, setSheetHeight] = useState(SHEET_MAX_HEIGHT);

  // Initialize item animations
  useEffect(() => {
    const totalItems = ACTION_CATEGORIES.reduce((acc, cat) => acc + cat.items.length, 0);
    while (itemAnims.length < totalItems) {
      itemAnims.push(new Animated.Value(0));
    }
  }, []);

  useEffect(() => {
    if (visible) {
      mediumHaptic();
      
      // Slide up animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 10,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Stagger item animations
      let index = 0;
      ACTION_CATEGORIES.forEach((category) => {
        category.items.forEach((_, itemIndex) => {
          const delay = 100 + (index * 40);
          Animated.timing(itemAnims[index], {
            toValue: 1,
            duration: 300,
            delay,
            useNativeDriver: true,
          }).start();
          index++;
        });
      });
    } else {
      // Slide down animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Reset item animations
      itemAnims.forEach(anim => anim.setValue(0));
    }
  }, [visible]);

  const handleItemPress = (item: QuickAction) => {
    buttonPress();
    onClose();
    onActionPress?.(item.id, item.screen);
    setTimeout(() => {
      navigation.navigate(item.screen);
    }, 150);
  };

  const handleClose = () => {
    successHaptic();
    onClose();
  };

  const renderActionItem = (item: QuickAction, animIndex: number) => {
    const itemAnim = itemAnims[animIndex] || new Animated.Value(1);
    
    return (
      <Animated.View
        key={item.id}
        style={[
          styles.actionItemWrapper,
          {
            opacity: itemAnim,
            transform: [
              {
                translateY: itemAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
              {
                scale: itemAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => handleItemPress(item)}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBg, { backgroundColor: item.color + '15' }]}>
            <Text style={styles.actionIcon}>{item.icon}</Text>
            {item.badge && (
              <View style={[styles.badge, { backgroundColor: item.color }]}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.actionLabel} numberOfLines={1}>{item.label}</Text>
          <Text style={styles.actionDesc} numberOfLines={1}>{item.description}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCategory = (category: ActionCategory, categoryIndex: number) => {
    const startIndex = ACTION_CATEGORIES.slice(0, categoryIndex)
      .reduce((acc, cat) => acc + cat.items.length, 0);

    return (
      <View key={category.title} style={styles.category}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryEmoji}>{category.emoji}</Text>
          <Text style={styles.categoryTitle}>{category.title}</Text>
        </View>
        <View style={styles.categoryGrid}>
          {category.items.map((item, itemIndex) => 
            renderActionItem(item, startIndex + itemIndex)
          )}
        </View>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: backdropOpacity },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={handleClose}
            activeOpacity={1}
          />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              maxHeight: SHEET_MAX_HEIGHT,
              paddingBottom: insets.bottom + 20,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Quick Actions</Text>
              <Text style={styles.headerSubtitle}>What would you like to do?</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {ACTION_CATEGORIES.map((category, index) => 
              renderCategory(category, index)
            )}
            
            {/* Bottom spacing */}
            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 30,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  category: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: -0.3,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  actionItemWrapper: {
    width: '25%',
    padding: 6,
  },
  actionItem: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
  },
  actionIconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 26,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default QuickActionsSheet;

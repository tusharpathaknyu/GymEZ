import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { buttonPress, successHaptic } from '../../utils/haptics';

const { width, height } = Dimensions.get('window');

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  screen: string;
  color: string;
  badge?: string;
}

interface FloatingMenuProps {
  navigation: any;
  visible: boolean;
  onClose: () => void;
}

const MENU_ITEMS: MenuItem[] = [
  // Quick Actions
  { id: 'workout', icon: '🏋️', label: 'Start Workout', screen: 'LiveWorkout', color: '#10b981' },
  { id: 'programs', icon: '📋', label: 'Programs', screen: 'WorkoutPrograms', color: '#10b981', badge: 'NEW' },
  { id: 'progress', icon: '📊', label: 'Progress', screen: 'ProgressDashboard', color: '#6366f1' },
  { id: 'exercises', icon: '📚', label: 'Exercise Library', screen: 'ExerciseLibrary', color: '#f59e0b' },
  { id: 'goals', icon: '🎯', label: 'Goals', screen: 'Goals', color: '#8b5cf6' },
  { id: 'challenges', icon: '🏅', label: 'Challenges', screen: 'WeeklyChallenges', color: '#ef4444', badge: 'NEW' },
  
  // AI Features
  { id: 'ai-coach', icon: '🤖', label: 'AI Coach', screen: 'AICoach', color: '#6366f1', badge: 'AI' },
  { id: 'ai-workout', icon: '⚡', label: 'AI Workouts', screen: 'AIWorkoutGenerator', color: '#ec4899', badge: 'AI' },
  { id: 'ai-meals', icon: '🍽️', label: 'Meal Planner', screen: 'AIMealPlanner', color: '#14b8a6', badge: 'AI' },
  { id: 'ai-insights', icon: '📈', label: 'AI Insights', screen: 'AIProgressInsights', color: '#f97316', badge: 'AI' },
  
  // Tracking
  { id: 'streaks', icon: '🔥', label: 'Streaks', screen: 'SmartNotifications', color: '#ef4444', badge: 'NEW' },
  { id: 'history', icon: '📅', label: 'Workout History', screen: 'WorkoutHistory', color: '#3b82f6' },
  { id: 'measurements', icon: '📏', label: 'Body Stats', screen: 'BodyMeasurements', color: '#ef4444' },
  { id: 'nutrition', icon: '🥗', label: 'Nutrition', screen: 'Nutrition', color: '#22c55e' },
  
  // Games
  { id: 'rpg', icon: '⚔️', label: 'Fitness RPG', screen: 'FitnessRPG', color: '#a855f7', badge: 'NEW' },
  { id: 'guild', icon: '🏰', label: 'Guild', screen: 'Guild', color: '#f43f5e' },
  { id: 'raids', icon: '🐉', label: 'Boss Raids', screen: 'BossRaid', color: '#0ea5e9' },
  { id: 'tournament', icon: '🏆', label: 'Tournament', screen: 'Tournament', color: '#eab308' },
  
  // Settings
  { id: 'themes', icon: '🎨', label: 'Themes', screen: 'ThemeSettings', color: '#8b5cf6' },
];

const FloatingMenu: React.FC<FloatingMenuProps> = ({ navigation, visible, onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const itemAnims = useRef(MENU_ITEMS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (visible) {
      // Open animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Stagger item animations
      itemAnims.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 200,
          delay: index * 30,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Close animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      itemAnims.forEach((anim) => {
        anim.setValue(0);
      });
    }
  }, [visible]);

  const handleItemPress = (item: MenuItem) => {
    buttonPress();
    onClose();
    setTimeout(() => {
      navigation.navigate(item.screen);
    }, 100);
  };

  const renderMenuItem = (item: MenuItem, index: number) => {
    const animatedStyle = {
      opacity: itemAnims[index],
      transform: [
        {
          translateY: itemAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          }),
        },
        {
          scale: itemAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          }),
        },
      ],
    };

    return (
      <Animated.View key={item.id} style={[styles.menuItemWrapper, animatedStyle]}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleItemPress(item)}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            {item.badge && (
              <View style={[styles.badge, { backgroundColor: item.color }]}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.menuLabel} numberOfLines={1}>{item.label}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.overlayTouch} onPress={onClose} activeOpacity={1}>
          <Animated.View 
            style={[
              styles.menuContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* Header */}
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Quick Access</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Menu Grid */}
              <ScrollView 
                style={styles.menuScroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.menuGrid}
              >
                {/* Quick Actions Section */}
                <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>
                <View style={styles.gridRow}>
                  {MENU_ITEMS.slice(0, 4).map((item, index) => renderMenuItem(item, index))}
                </View>

                {/* AI Features Section */}
                <Text style={styles.sectionTitle}>🧠 AI Features</Text>
                <View style={styles.gridRow}>
                  {MENU_ITEMS.slice(4, 8).map((item, index) => renderMenuItem(item, index + 4))}
                </View>

                {/* Tracking Section */}
                <Text style={styles.sectionTitle}>📊 Tracking</Text>
                <View style={styles.gridRow}>
                  {MENU_ITEMS.slice(8, 11).map((item, index) => renderMenuItem(item, index + 8))}
                </View>

                {/* Games Section */}
                <Text style={styles.sectionTitle}>🎮 Fitness RPG</Text>
                <View style={styles.gridRow}>
                  {MENU_ITEMS.slice(11, 15).map((item, index) => renderMenuItem(item, index + 11))}
                </View>
              </ScrollView>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouch: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.75,
    paddingBottom: 40,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 16,
    color: '#6b7280',
  },
  menuScroll: {
    maxHeight: height * 0.6,
  },
  menuGrid: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 12,
    marginLeft: 4,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  menuItemWrapper: {
    width: '25%',
    padding: 6,
  },
  menuItem: {
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  menuIcon: {
    fontSize: 26,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
  },
  menuLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
});

export default FloatingMenu;

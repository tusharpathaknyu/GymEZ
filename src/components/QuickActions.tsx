import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface QuickActionProps {
  onPress?: () => void;
}

const QuickActions = ({ onPress }: QuickActionProps) => {
  const navigation = useNavigation<any>();

  const actions = [
    { 
      icon: '🏋️', 
      label: 'Start Workout', 
      color: '#10b981',
      screen: 'LiveWorkout',
      description: 'Track your session',
    },
    { 
      icon: '📍', 
      label: 'Check In', 
      color: '#ef4444',
      screen: 'GymCheckin',
      description: 'Earn XP points',
      badge: 'XP',
    },
    { 
      icon: '📊', 
      label: 'View Progress', 
      color: '#8b5cf6',
      screen: 'ProgressDashboard',
      description: 'See your stats',
    },
    { 
      icon: '🧠', 
      label: 'AI Coach', 
      color: '#3b82f6',
      screen: 'AICoach',
      description: 'Get guidance',
      badge: 'AI',
    },
  ];

  const handleActionPress = (screen: string) => {
    if (onPress) onPress();
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions ⚡</Text>
      <Text style={styles.subtitle}>What would you like to do?</Text>
      <View style={styles.actionsGrid}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.actionCard, { borderLeftColor: action.color }]}
            onPress={() => handleActionPress(action.screen)}
            activeOpacity={0.7}
          >
            {action.badge && (
              <View style={[styles.badge, { backgroundColor: action.color }]}>
                <Text style={styles.badgeText}>{action.badge}</Text>
              </View>
            )}
            <View style={[styles.iconContainer, { backgroundColor: action.color + '20' }]}>
              <Text style={styles.actionIcon}>{action.icon}</Text>
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
            <Text style={styles.actionDescription}>{action.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default QuickActions;

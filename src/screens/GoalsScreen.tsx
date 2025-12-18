import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { useAuth } from '../services/auth';
import { buttonPress, successHaptic, errorHaptic } from '../utils/haptics';

const { width } = Dimensions.get('window');

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'strength' | 'cardio' | 'weight' | 'consistency' | 'custom';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  createdAt: string;
  milestones: Milestone[];
  status: 'active' | 'completed' | 'expired';
}

interface Milestone {
  id: string;
  title: string;
  targetValue: number;
  achieved: boolean;
  achievedAt?: string;
}

// Mock goals data
const MOCK_GOALS: Goal[] = [
  {
    id: '1',
    title: 'Bench Press 225 lbs',
    description: 'Hit 2 plates on bench press',
    category: 'strength',
    targetValue: 225,
    currentValue: 185,
    unit: 'lbs',
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [
      { id: 'm1', title: '135 lbs', targetValue: 135, achieved: true, achievedAt: '2024-01-15' },
      { id: 'm2', title: '155 lbs', targetValue: 155, achieved: true, achievedAt: '2024-02-01' },
      { id: 'm3', title: '185 lbs', targetValue: 185, achieved: true, achievedAt: '2024-02-20' },
      { id: 'm4', title: '205 lbs', targetValue: 205, achieved: false },
      { id: 'm5', title: '225 lbs', targetValue: 225, achieved: false },
    ],
    status: 'active',
  },
  {
    id: '2',
    title: 'Lose 15 lbs',
    description: 'Reach target weight of 175 lbs',
    category: 'weight',
    targetValue: 175,
    currentValue: 182,
    unit: 'lbs',
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [
      { id: 'm1', title: '188 lbs', targetValue: 188, achieved: true },
      { id: 'm2', title: '185 lbs', targetValue: 185, achieved: true },
      { id: 'm3', title: '182 lbs', targetValue: 182, achieved: true },
      { id: 'm4', title: '178 lbs', targetValue: 178, achieved: false },
      { id: 'm5', title: '175 lbs', targetValue: 175, achieved: false },
    ],
    status: 'active',
  },
  {
    id: '3',
    title: '30-Day Workout Streak',
    description: 'Work out every day for 30 days',
    category: 'consistency',
    targetValue: 30,
    currentValue: 18,
    unit: 'days',
    deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [
      { id: 'm1', title: '7 days', targetValue: 7, achieved: true },
      { id: 'm2', title: '14 days', targetValue: 14, achieved: true },
      { id: 'm3', title: '21 days', targetValue: 21, achieved: false },
      { id: 'm4', title: '30 days', targetValue: 30, achieved: false },
    ],
    status: 'active',
  },
  {
    id: '4',
    title: 'Run 5K under 25 minutes',
    description: 'Improve cardio endurance',
    category: 'cardio',
    targetValue: 25,
    currentValue: 28,
    unit: 'minutes',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [
      { id: 'm1', title: '32 min', targetValue: 32, achieved: true },
      { id: 'm2', title: '30 min', targetValue: 30, achieved: true },
      { id: 'm3', title: '28 min', targetValue: 28, achieved: true },
      { id: 'm4', title: '26 min', targetValue: 26, achieved: false },
      { id: 'm5', title: '25 min', targetValue: 25, achieved: false },
    ],
    status: 'active',
  },
];

const GOAL_TEMPLATES = [
  { title: 'Bench Press Goal', category: 'strength', icon: '🏋️', unit: 'lbs' },
  { title: 'Squat Goal', category: 'strength', icon: '🦵', unit: 'lbs' },
  { title: 'Deadlift Goal', category: 'strength', icon: '💪', unit: 'lbs' },
  { title: 'Weight Loss Goal', category: 'weight', icon: '⚖️', unit: 'lbs' },
  { title: 'Workout Streak', category: 'consistency', icon: '🔥', unit: 'days' },
  { title: '5K Run Time', category: 'cardio', icon: '🏃', unit: 'minutes' },
  { title: 'Custom Goal', category: 'custom', icon: '🎯', unit: '' },
];

const CATEGORY_COLORS: { [key: string]: { bg: string; text: string; icon: string } } = {
  strength: { bg: '#fee2e2', text: '#ef4444', icon: '🏋️' },
  cardio: { bg: '#fef3c7', text: '#f59e0b', icon: '🏃' },
  weight: { bg: '#d1fae5', text: '#10b981', icon: '⚖️' },
  consistency: { bg: '#e0e7ff', text: '#6366f1', icon: '🔥' },
  custom: { bg: '#f3e8ff', text: '#a855f7', icon: '🎯' },
};

const GoalsScreen = ({ navigation }: { navigation: any }) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'strength' as Goal['category'],
    targetValue: '',
    unit: 'lbs',
    daysToComplete: '90',
  });

  const filteredGoals = goals.filter(g => {
    if (filter === 'all') return true;
    if (filter === 'active') return g.status === 'active';
    if (filter === 'completed') return g.status === 'completed';
    return true;
  });

  const getProgress = (goal: Goal): number => {
    if (goal.category === 'weight' || goal.category === 'cardio') {
      // For goals where lower is better
      const start = goal.milestones[0]?.targetValue || goal.currentValue + 20;
      const progress = ((start - goal.currentValue) / (start - goal.targetValue)) * 100;
      return Math.min(Math.max(progress, 0), 100);
    }
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  const getDaysRemaining = (deadline: string): number => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 0);
  };

  const handleCreateGoal = () => {
    if (!newGoal.title || !newGoal.targetValue) {
      Alert.alert('Missing Info', 'Please enter a title and target value');
      return;
    }

    buttonPress();
    
    const milestones: Milestone[] = [];
    const target = parseInt(newGoal.targetValue);
    const steps = [25, 50, 75, 100];
    
    steps.forEach((percent, index) => {
      milestones.push({
        id: `m${index + 1}`,
        title: `${Math.round(target * percent / 100)} ${newGoal.unit}`,
        targetValue: Math.round(target * percent / 100),
        achieved: false,
      });
    });

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      targetValue: target,
      currentValue: 0,
      unit: newGoal.unit,
      deadline: new Date(Date.now() + parseInt(newGoal.daysToComplete) * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      milestones,
      status: 'active',
    };

    setGoals(prev => [...prev, goal]);
    setShowAddModal(false);
    setNewGoal({
      title: '',
      description: '',
      category: 'strength',
      targetValue: '',
      unit: 'lbs',
      daysToComplete: '90',
    });
    successHaptic();
    Alert.alert('Goal Created! 🎯', 'Good luck reaching your goal!');
  };

  const handleUpdateProgress = (goalId: string, newValue: number) => {
    buttonPress();
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      
      const updatedMilestones = g.milestones.map(m => ({
        ...m,
        achieved: g.category === 'weight' || g.category === 'cardio'
          ? newValue <= m.targetValue
          : newValue >= m.targetValue,
        achievedAt: m.achieved ? m.achievedAt : (
          (g.category === 'weight' || g.category === 'cardio' ? newValue <= m.targetValue : newValue >= m.targetValue)
            ? new Date().toISOString()
            : undefined
        ),
      }));

      const isCompleted = g.category === 'weight' || g.category === 'cardio'
        ? newValue <= g.targetValue
        : newValue >= g.targetValue;

      if (isCompleted && g.status !== 'completed') {
        successHaptic();
        Alert.alert('🎉 Goal Achieved!', `Congratulations! You've reached your goal: ${g.title}`);
      }

      return {
        ...g,
        currentValue: newValue,
        milestones: updatedMilestones,
        status: isCompleted ? 'completed' : 'active',
      };
    }));
    setSelectedGoal(null);
  };

  const GoalCard = ({ goal }: { goal: Goal }) => {
    const progress = getProgress(goal);
    const daysLeft = getDaysRemaining(goal.deadline);
    const categoryStyle = CATEGORY_COLORS[goal.category];
    const achievedMilestones = goal.milestones.filter(m => m.achieved).length;

    return (
      <TouchableOpacity 
        style={styles.goalCard}
        onPress={() => {
          buttonPress();
          setSelectedGoal(goal);
        }}
      >
        <View style={styles.goalHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryStyle.bg }]}>
            <Text style={styles.categoryIcon}>{categoryStyle.icon}</Text>
            <Text style={[styles.categoryText, { color: categoryStyle.text }]}>
              {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
            </Text>
          </View>
          {goal.status === 'completed' ? (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✓ Complete</Text>
            </View>
          ) : (
            <Text style={[styles.daysLeft, daysLeft < 14 && styles.urgentDays]}>
              {daysLeft} days left
            </Text>
          )}
        </View>

        <Text style={styles.goalTitle}>{goal.title}</Text>
        {goal.description && (
          <Text style={styles.goalDescription}>{goal.description}</Text>
        )}

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${progress}%`,
                  backgroundColor: goal.status === 'completed' ? '#10b981' : categoryStyle.text,
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>

        {/* Current vs Target */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{goal.currentValue}</Text>
            <Text style={styles.statLabel}>Current</Text>
          </View>
          <View style={styles.statArrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{goal.targetValue}</Text>
            <Text style={styles.statLabel}>Target</Text>
          </View>
          <View style={styles.unitBox}>
            <Text style={styles.unitText}>{goal.unit}</Text>
          </View>
        </View>

        {/* Milestones Preview */}
        <View style={styles.milestonesPreview}>
          {goal.milestones.map((m, idx) => (
            <View 
              key={m.id} 
              style={[
                styles.milestoneCircle,
                m.achieved && { backgroundColor: categoryStyle.text },
              ]}
            >
              {m.achieved && <Text style={styles.milestoneCheck}>✓</Text>}
            </View>
          ))}
          <Text style={styles.milestonesText}>
            {achievedMilestones}/{goal.milestones.length} milestones
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goals & Milestones</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            buttonPress();
            setShowAddModal(true);
          }}
        >
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'active', 'completed'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'active' && ` (${goals.filter(g => g.status === 'active').length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Stats */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{goals.length}</Text>
            <Text style={styles.summaryLabel}>Total Goals</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{goals.filter(g => g.status === 'active').length}</Text>
            <Text style={styles.summaryLabel}>In Progress</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{goals.filter(g => g.status === 'completed').length}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
        </View>

        {/* Goals List */}
        {filteredGoals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyText}>No goals yet</Text>
            <Text style={styles.emptySubtext}>Set your first goal to start tracking progress!</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.emptyButtonText}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🎯 New Goal</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Quick Templates */}
              <Text style={styles.templateTitle}>Quick Start</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateRow}>
                {GOAL_TEMPLATES.map((template, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.templateCard,
                      newGoal.category === template.category && styles.templateCardActive,
                    ]}
                    onPress={() => {
                      buttonPress();
                      setNewGoal(prev => ({
                        ...prev,
                        title: template.title === 'Custom Goal' ? '' : template.title,
                        category: template.category as Goal['category'],
                        unit: template.unit || 'units',
                      }));
                    }}
                  >
                    <Text style={styles.templateIcon}>{template.icon}</Text>
                    <Text style={styles.templateText}>{template.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Goal Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Bench Press 225 lbs"
                  value={newGoal.title}
                  onChangeText={text => setNewGoal(prev => ({ ...prev, title: text }))}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Why is this goal important?"
                  value={newGoal.description}
                  onChangeText={text => setNewGoal(prev => ({ ...prev, description: text }))}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Target Value</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="225"
                    keyboardType="numeric"
                    value={newGoal.targetValue}
                    onChangeText={text => setNewGoal(prev => ({ ...prev, targetValue: text }))}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Unit</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="lbs"
                    value={newGoal.unit}
                    onChangeText={text => setNewGoal(prev => ({ ...prev, unit: text }))}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Days to Complete</Text>
                <View style={styles.daysRow}>
                  {['30', '60', '90', '180'].map(days => (
                    <TouchableOpacity
                      key={days}
                      style={[
                        styles.daysChip,
                        newGoal.daysToComplete === days && styles.daysChipActive,
                      ]}
                      onPress={() => setNewGoal(prev => ({ ...prev, daysToComplete: days }))}
                    >
                      <Text style={[
                        styles.daysChipText,
                        newGoal.daysToComplete === days && styles.daysChipTextActive,
                      ]}>
                        {days} days
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.createButton} onPress={handleCreateGoal}>
              <Text style={styles.createButtonText}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Goal Detail Modal */}
      <Modal visible={!!selectedGoal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedGoal && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedGoal.title}</Text>
                  <TouchableOpacity onPress={() => setSelectedGoal(null)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll}>
                  {/* Progress */}
                  <View style={styles.detailProgress}>
                    <Text style={styles.detailProgressValue}>
                      {selectedGoal.currentValue} / {selectedGoal.targetValue}
                    </Text>
                    <Text style={styles.detailProgressUnit}>{selectedGoal.unit}</Text>
                  </View>

                  {/* Update Progress */}
                  <View style={styles.updateSection}>
                    <Text style={styles.updateLabel}>Update Progress</Text>
                    <View style={styles.updateRow}>
                      <TouchableOpacity
                        style={styles.updateButton}
                        onPress={() => handleUpdateProgress(selectedGoal.id, Math.max(0, selectedGoal.currentValue - 5))}
                      >
                        <Text style={styles.updateButtonText}>-5</Text>
                      </TouchableOpacity>
                      <Text style={styles.updateCurrent}>{selectedGoal.currentValue}</Text>
                      <TouchableOpacity
                        style={styles.updateButton}
                        onPress={() => handleUpdateProgress(selectedGoal.id, selectedGoal.currentValue + 5)}
                      >
                        <Text style={styles.updateButtonText}>+5</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Milestones */}
                  <Text style={styles.milestonesTitle}>Milestones</Text>
                  {selectedGoal.milestones.map((milestone, idx) => (
                    <View key={milestone.id} style={styles.milestoneItem}>
                      <View style={[
                        styles.milestoneStatus,
                        milestone.achieved && styles.milestoneStatusAchieved,
                      ]}>
                        {milestone.achieved ? (
                          <Text style={styles.milestoneCheckmark}>✓</Text>
                        ) : (
                          <Text style={styles.milestoneNumber}>{idx + 1}</Text>
                        )}
                      </View>
                      <View style={styles.milestoneInfo}>
                        <Text style={[
                          styles.milestoneTitle,
                          milestone.achieved && styles.milestoneTitleAchieved,
                        ]}>
                          {milestone.title}
                        </Text>
                        {milestone.achieved && milestone.achievedAt && (
                          <Text style={styles.milestoneDate}>
                            Achieved {new Date(milestone.achievedAt).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  filterTabActive: {
    backgroundColor: '#111827',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  goalCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryIcon: {
    fontSize: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  completedBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10b981',
  },
  daysLeft: {
    fontSize: 12,
    color: '#6b7280',
  },
  urgentDays: {
    color: '#ef4444',
    fontWeight: '600',
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 10,
    minWidth: 40,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 10,
    color: '#9ca3af',
  },
  statArrow: {
    paddingHorizontal: 16,
  },
  arrowText: {
    fontSize: 18,
    color: '#9ca3af',
  },
  unitBox: {
    marginLeft: 'auto',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  milestonesPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  milestoneCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneCheck: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  milestonesText: {
    fontSize: 11,
    color: '#9ca3af',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalClose: {
    fontSize: 20,
    color: '#6b7280',
    padding: 4,
  },
  modalScroll: {
    padding: 20,
  },
  templateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  templateRow: {
    marginBottom: 20,
  },
  templateCard: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 90,
  },
  templateCardActive: {
    backgroundColor: '#d1fae5',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  templateIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  templateText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 10,
  },
  daysChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  daysChipActive: {
    backgroundColor: '#10b981',
  },
  daysChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  daysChipTextActive: {
    color: '#fff',
  },
  createButton: {
    backgroundColor: '#10b981',
    margin: 20,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  detailProgress: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  detailProgressValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111827',
  },
  detailProgressUnit: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  updateSection: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  updateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
  },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  updateButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  updateCurrent: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    minWidth: 80,
    textAlign: 'center',
  },
  milestonesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  milestoneStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  milestoneStatusAchieved: {
    backgroundColor: '#10b981',
  },
  milestoneCheckmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  milestoneNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  milestoneTitleAchieved: {
    color: '#10b981',
  },
  milestoneDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  bottomPadding: {
    height: 40,
  },
});

export default GoalsScreen;

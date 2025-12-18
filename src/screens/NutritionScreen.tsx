import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshControl,
} from 'react-native';
import { useAuth } from '../services/auth';
import { buttonPress, successHaptic } from '../utils/haptics';

const { width } = Dimensions.get('window');

interface MacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

const DEFAULT_GOALS: MacroGoals = {
  calories: 2500,
  protein: 180,
  carbs: 250,
  fat: 80,
};

// Quick add foods database
const QUICK_FOODS = [
  { name: 'Chicken Breast (6oz)', calories: 280, protein: 53, carbs: 0, fat: 6, icon: '🍗' },
  { name: 'Brown Rice (1 cup)', calories: 216, protein: 5, carbs: 45, fat: 2, icon: '🍚' },
  { name: 'Eggs (2 large)', calories: 140, protein: 12, carbs: 0, fat: 10, icon: '🥚' },
  { name: 'Protein Shake', calories: 160, protein: 30, carbs: 5, fat: 2, icon: '🥤' },
  { name: 'Greek Yogurt (1 cup)', calories: 130, protein: 17, carbs: 8, fat: 4, icon: '🥛' },
  { name: 'Oatmeal (1 cup)', calories: 300, protein: 10, carbs: 54, fat: 5, icon: '🥣' },
  { name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0, icon: '🍌' },
  { name: 'Almonds (1oz)', calories: 164, protein: 6, carbs: 6, fat: 14, icon: '🥜' },
  { name: 'Salmon (4oz)', calories: 200, protein: 28, carbs: 0, fat: 9, icon: '🐟' },
  { name: 'Broccoli (1 cup)', calories: 55, protein: 4, carbs: 11, fat: 0, icon: '🥦' },
  { name: 'Sweet Potato (medium)', calories: 103, protein: 2, carbs: 24, fat: 0, icon: '🍠' },
  { name: 'Avocado (half)', calories: 160, protein: 2, carbs: 9, fat: 15, icon: '🥑' },
];

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast', icon: '🌅', color: '#f59e0b' },
  { key: 'lunch', label: 'Lunch', icon: '☀️', color: '#10b981' },
  { key: 'dinner', label: 'Dinner', icon: '🌙', color: '#6366f1' },
  { key: 'snack', label: 'Snack', icon: '🍎', color: '#ec4899' },
];

const NutritionScreen = ({ navigation }: { navigation: any }) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<MacroGoals>(DEFAULT_GOALS);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string>('breakfast');
  const [customFood, setCustomFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'quick'>('today');

  // Calculate totals
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const getProgress = (current: number, goal: number): number => {
    return Math.min((current / goal) * 100, 100);
  };

  const getProgressColor = (current: number, goal: number): string => {
    const percent = (current / goal) * 100;
    if (percent < 80) return '#10b981';
    if (percent < 100) return '#f59e0b';
    return '#ef4444';
  };

  const handleQuickAdd = (food: typeof QUICK_FOODS[0]) => {
    buttonPress();
    const newMeal: MealEntry = {
      id: Date.now().toString(),
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      mealType: selectedMealType as any,
    };
    setMeals(prev => [...prev, newMeal]);
    successHaptic();
  };

  const handleCustomAdd = () => {
    if (!customFood.name || !customFood.calories) {
      Alert.alert('Missing Info', 'Please enter at least name and calories');
      return;
    }
    buttonPress();
    
    const newMeal: MealEntry = {
      id: Date.now().toString(),
      name: customFood.name,
      calories: parseInt(customFood.calories) || 0,
      protein: parseInt(customFood.protein) || 0,
      carbs: parseInt(customFood.carbs) || 0,
      fat: parseInt(customFood.fat) || 0,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      mealType: selectedMealType as any,
    };
    
    setMeals(prev => [...prev, newMeal]);
    setCustomFood({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    setShowAddModal(false);
    successHaptic();
  };

  const handleDeleteMeal = (id: string) => {
    buttonPress();
    setMeals(prev => prev.filter(m => m.id !== id));
  };

  const handleSaveGoals = () => {
    buttonPress();
    setShowGoalsModal(false);
    successHaptic();
    Alert.alert('Success! 🎯', 'Your macro goals have been updated');
  };

  const CircularProgress = ({ 
    progress, 
    size = 80, 
    strokeWidth = 8,
    color,
    label,
    value,
    goal,
    unit = 'g'
  }: any) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <View style={styles.circularContainer}>
        <View style={[styles.circularOuter, { width: size, height: size }]}>
          <View style={[styles.circularBg, { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            borderWidth: strokeWidth,
          }]} />
          <View style={[styles.circularProgress, {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderTopColor: 'transparent',
            borderRightColor: progress > 25 ? color : 'transparent',
            borderBottomColor: progress > 50 ? color : 'transparent',
            borderLeftColor: progress > 75 ? color : 'transparent',
            transform: [{ rotate: '-45deg' }],
          }]} />
          <View style={styles.circularInner}>
            <Text style={[styles.circularValue, { color }]}>{value}</Text>
          </View>
        </View>
        <Text style={styles.circularLabel}>{label}</Text>
        <Text style={styles.circularGoal}>{goal}{unit} goal</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nutrition</Text>
          <TouchableOpacity 
            style={styles.goalsButton}
            onPress={() => {
              buttonPress();
              setShowGoalsModal(true);
            }}
          >
            <Text style={styles.goalsIcon}>🎯</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerDate}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Calories Summary Card */}
        <View style={styles.caloriesCard}>
          <View style={styles.caloriesMain}>
            <View style={styles.caloriesInfo}>
              <Text style={styles.caloriesLabel}>Calories</Text>
              <View style={styles.caloriesNumbers}>
                <Text style={styles.caloriesConsumed}>{totals.calories}</Text>
                <Text style={styles.caloriesGoal}>/ {goals.calories}</Text>
              </View>
              <Text style={styles.caloriesRemaining}>
                {goals.calories - totals.calories > 0 
                  ? `${goals.calories - totals.calories} remaining`
                  : `${totals.calories - goals.calories} over goal`
                }
              </Text>
            </View>
            <View style={styles.caloriesRing}>
              <View style={styles.ringOuter}>
                <View style={[
                  styles.ringProgress,
                  { 
                    backgroundColor: getProgressColor(totals.calories, goals.calories),
                    width: `${getProgress(totals.calories, goals.calories)}%`,
                  }
                ]} />
              </View>
            </View>
          </View>
        </View>

        {/* Macro Progress */}
        <View style={styles.macrosCard}>
          <Text style={styles.sectionTitle}>Macros</Text>
          <View style={styles.macrosRow}>
            <CircularProgress 
              progress={getProgress(totals.protein, goals.protein)}
              color="#ef4444"
              label="Protein"
              value={totals.protein}
              goal={goals.protein}
            />
            <CircularProgress 
              progress={getProgress(totals.carbs, goals.carbs)}
              color="#f59e0b"
              label="Carbs"
              value={totals.carbs}
              goal={goals.carbs}
            />
            <CircularProgress 
              progress={getProgress(totals.fat, goals.fat)}
              color="#3b82f6"
              label="Fat"
              value={totals.fat}
              goal={goals.fat}
            />
          </View>
        </View>

        {/* Meal Type Selector */}
        <View style={styles.mealTypeContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {MEAL_TYPES.map(type => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.mealTypeChip,
                  selectedMealType === type.key && { backgroundColor: type.color },
                ]}
                onPress={() => {
                  buttonPress();
                  setSelectedMealType(type.key);
                }}
              >
                <Text style={styles.mealTypeIcon}>{type.icon}</Text>
                <Text style={[
                  styles.mealTypeText,
                  selectedMealType === type.key && styles.mealTypeTextActive,
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'today' && styles.activeTab]}
            onPress={() => setActiveTab('today')}
          >
            <Text style={[styles.tabText, activeTab === 'today' && styles.activeTabText]}>
              Today's Meals
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'quick' && styles.activeTab]}
            onPress={() => setActiveTab('quick')}
          >
            <Text style={[styles.tabText, activeTab === 'quick' && styles.activeTabText]}>
              Quick Add
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'today' ? (
          <View style={styles.mealsContainer}>
            {meals.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🍽️</Text>
                <Text style={styles.emptyText}>No meals logged yet</Text>
                <Text style={styles.emptySubtext}>Tap "Quick Add" to log your food</Text>
              </View>
            ) : (
              meals.map(meal => (
                <TouchableOpacity 
                  key={meal.id} 
                  style={styles.mealCard}
                  onLongPress={() => {
                    Alert.alert(
                      'Delete Meal',
                      `Remove ${meal.name}?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteMeal(meal.id) },
                      ]
                    );
                  }}
                >
                  <View style={styles.mealInfo}>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    <Text style={styles.mealTime}>{meal.time} • {meal.mealType}</Text>
                  </View>
                  <View style={styles.mealMacros}>
                    <Text style={styles.mealCalories}>{meal.calories} cal</Text>
                    <Text style={styles.mealMacroDetail}>
                      P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          <View style={styles.quickAddContainer}>
            <View style={styles.quickAddGrid}>
              {QUICK_FOODS.map((food, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickAddCard}
                  onPress={() => handleQuickAdd(food)}
                >
                  <Text style={styles.quickAddIcon}>{food.icon}</Text>
                  <Text style={styles.quickAddName} numberOfLines={2}>{food.name}</Text>
                  <Text style={styles.quickAddCals}>{food.calories} cal</Text>
                  <Text style={styles.quickAddMacros}>
                    P:{food.protein} C:{food.carbs} F:{food.fat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Custom Food Button */}
            <TouchableOpacity 
              style={styles.customButton}
              onPress={() => {
                buttonPress();
                setShowAddModal(true);
              }}
            >
              <Text style={styles.customButtonText}>+ Add Custom Food</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Add Custom Food Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Custom Food</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Food Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Grilled Chicken Salad"
                  value={customFood.name}
                  onChangeText={text => setCustomFood(prev => ({ ...prev, name: text }))}
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Calories</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    keyboardType="numeric"
                    value={customFood.calories}
                    onChangeText={text => setCustomFood(prev => ({ ...prev, calories: text }))}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Protein (g)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    keyboardType="numeric"
                    value={customFood.protein}
                    onChangeText={text => setCustomFood(prev => ({ ...prev, protein: text }))}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Carbs (g)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    keyboardType="numeric"
                    value={customFood.carbs}
                    onChangeText={text => setCustomFood(prev => ({ ...prev, carbs: text }))}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Fat (g)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    keyboardType="numeric"
                    value={customFood.fat}
                    onChangeText={text => setCustomFood(prev => ({ ...prev, fat: text }))}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.saveButton} onPress={handleCustomAdd}>
              <Text style={styles.saveButtonText}>Add Food</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Goals Modal */}
      <Modal visible={showGoalsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🎯 Set Macro Goals</Text>
              <TouchableOpacity onPress={() => setShowGoalsModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Daily Calories</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2500"
                  keyboardType="numeric"
                  value={goals.calories.toString()}
                  onChangeText={text => setGoals(prev => ({ ...prev, calories: parseInt(text) || 0 }))}
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Protein (g)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="180"
                  keyboardType="numeric"
                  value={goals.protein.toString()}
                  onChangeText={text => setGoals(prev => ({ ...prev, protein: parseInt(text) || 0 }))}
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Carbs (g)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="250"
                  keyboardType="numeric"
                  value={goals.carbs.toString()}
                  onChangeText={text => setGoals(prev => ({ ...prev, carbs: parseInt(text) || 0 }))}
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Fat (g)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="80"
                  keyboardType="numeric"
                  value={goals.fat.toString()}
                  onChangeText={text => setGoals(prev => ({ ...prev, fat: parseInt(text) || 0 }))}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {/* Preset Buttons */}
              <Text style={styles.presetTitle}>Quick Presets</Text>
              <View style={styles.presetRow}>
                <TouchableOpacity 
                  style={styles.presetButton}
                  onPress={() => setGoals({ calories: 2000, protein: 150, carbs: 200, fat: 65 })}
                >
                  <Text style={styles.presetText}>Cut</Text>
                  <Text style={styles.presetCals}>2000 cal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.presetButton}
                  onPress={() => setGoals({ calories: 2500, protein: 180, carbs: 250, fat: 80 })}
                >
                  <Text style={styles.presetText}>Maintain</Text>
                  <Text style={styles.presetCals}>2500 cal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.presetButton}
                  onPress={() => setGoals({ calories: 3000, protein: 200, carbs: 350, fat: 90 })}
                >
                  <Text style={styles.presetText}>Bulk</Text>
                  <Text style={styles.presetCals}>3000 cal</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveGoals}>
              <Text style={styles.saveButtonText}>Save Goals</Text>
            </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  goalsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalsIcon: {
    fontSize: 20,
  },
  headerDate: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  caloriesCard: {
    backgroundColor: '#10b981',
    margin: 16,
    padding: 20,
    borderRadius: 20,
  },
  caloriesMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caloriesInfo: {},
  caloriesLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  caloriesNumbers: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  caloriesConsumed: {
    fontSize: 40,
    fontWeight: '800',
    color: '#fff',
  },
  caloriesGoal: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 4,
  },
  caloriesRemaining: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  caloriesRing: {
    width: 80,
    height: 80,
  },
  ringOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  ringProgress: {
    height: '100%',
    borderRadius: 40,
  },
  macrosCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  circularContainer: {
    alignItems: 'center',
  },
  circularOuter: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularBg: {
    position: 'absolute',
    borderColor: '#e5e7eb',
  },
  circularProgress: {
    position: 'absolute',
  },
  circularInner: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  circularLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  circularGoal: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  mealTypeContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  mealTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  mealTypeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  mealTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  mealTypeTextActive: {
    color: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#111827',
    fontWeight: '600',
  },
  mealsContainer: {
    paddingHorizontal: 16,
  },
  mealCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  mealTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  mealMacros: {
    alignItems: 'flex-end',
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  mealMacroDetail: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
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
  },
  quickAddContainer: {
    paddingHorizontal: 16,
  },
  quickAddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickAddCard: {
    width: (width - 52) / 3,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickAddIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  quickAddName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
    height: 28,
  },
  quickAddCals: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10b981',
  },
  quickAddMacros: {
    fontSize: 9,
    color: '#9ca3af',
    marginTop: 2,
  },
  customButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  customButtonText: {
    color: '#fff',
    fontSize: 16,
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
    maxHeight: '80%',
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
  presetTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
    marginBottom: 12,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 10,
  },
  presetButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  presetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  presetCals: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: '#10b981',
    margin: 20,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 40,
  },
});

export default NutritionScreen;

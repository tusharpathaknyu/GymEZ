import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { buttonPress, successHaptic } from '../utils/haptics';

const { width } = Dimensions.get('window');

interface MealPlan {
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  snacks: MealItem[];
  totals: MacroTotals;
}

interface MealItem {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
  prepTime?: string;
}

interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const DIET_TYPES = [
  { id: 'balanced', label: 'Balanced', icon: '⚖️', desc: 'Equal macros' },
  { id: 'highprotein', label: 'High Protein', icon: '🥩', desc: 'For muscle building' },
  { id: 'lowcarb', label: 'Low Carb', icon: '🥬', desc: 'Keto-friendly' },
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥗', desc: 'No meat' },
  { id: 'vegan', label: 'Vegan', icon: '🌱', desc: 'Plant-based' },
];

const GOALS = [
  { id: 'bulking', label: 'Bulking', icon: '💪', surplus: 300 },
  { id: 'maintain', label: 'Maintain', icon: '⚖️', surplus: 0 },
  { id: 'cutting', label: 'Cutting', icon: '🔥', surplus: -500 },
];

const MEAL_DATABASE: { [key: string]: MealItem[] } = {
  breakfast_highprotein: [
    {
      name: 'Protein Power Breakfast',
      description: 'Eggs with turkey bacon and avocado',
      calories: 520,
      protein: 42,
      carbs: 12,
      fats: 35,
      ingredients: ['4 eggs scrambled', '3 turkey bacon strips', '1/2 avocado', 'Spinach'],
      prepTime: '15 min',
    },
    {
      name: 'Greek Yogurt Parfait',
      description: 'High protein yogurt with berries and nuts',
      calories: 450,
      protein: 35,
      carbs: 40,
      fats: 18,
      ingredients: ['2 cups Greek yogurt', '1 cup mixed berries', '1/4 cup almonds', '1 tbsp honey'],
      prepTime: '5 min',
    },
    {
      name: 'Muscle Omelette',
      description: 'Loaded egg white omelette',
      calories: 380,
      protein: 45,
      carbs: 10,
      fats: 18,
      ingredients: ['6 egg whites', '2 whole eggs', 'Cheese', 'Bell peppers', 'Turkey'],
      prepTime: '12 min',
    },
  ],
  breakfast_balanced: [
    {
      name: 'Classic Oatmeal Bowl',
      description: 'Oatmeal with banana and protein',
      calories: 450,
      protein: 25,
      carbs: 55,
      fats: 15,
      ingredients: ['1 cup oats', '1 scoop protein', '1 banana', 'Almond butter'],
      prepTime: '8 min',
    },
    {
      name: 'Avocado Toast & Eggs',
      description: 'Whole grain toast with toppings',
      calories: 420,
      protein: 22,
      carbs: 35,
      fats: 24,
      ingredients: ['2 slices whole grain bread', '1 avocado', '2 eggs', 'Everything seasoning'],
      prepTime: '10 min',
    },
  ],
  lunch_highprotein: [
    {
      name: 'Grilled Chicken Salad',
      description: 'Large protein-packed salad',
      calories: 550,
      protein: 48,
      carbs: 20,
      fats: 32,
      ingredients: ['8oz grilled chicken', 'Mixed greens', 'Feta cheese', 'Olive oil dressing', 'Nuts'],
      prepTime: '20 min',
    },
    {
      name: 'Tuna Wrap Power Bowl',
      description: 'Tuna with quinoa and veggies',
      calories: 580,
      protein: 52,
      carbs: 45,
      fats: 22,
      ingredients: ['2 cans tuna', '1 cup quinoa', 'Avocado', 'Cucumber', 'Lemon dressing'],
      prepTime: '15 min',
    },
  ],
  lunch_balanced: [
    {
      name: 'Turkey & Veggie Wrap',
      description: 'Whole wheat wrap with lean protein',
      calories: 520,
      protein: 35,
      carbs: 48,
      fats: 22,
      ingredients: ['Whole wheat tortilla', '6oz turkey breast', 'Hummus', 'Veggies', 'Cheese'],
      prepTime: '10 min',
    },
  ],
  dinner_highprotein: [
    {
      name: 'Grilled Salmon & Asparagus',
      description: 'Omega-3 rich dinner',
      calories: 620,
      protein: 50,
      carbs: 15,
      fats: 40,
      ingredients: ['8oz salmon fillet', '1 bunch asparagus', 'Lemon', 'Olive oil', 'Garlic'],
      prepTime: '25 min',
    },
    {
      name: 'Lean Steak & Sweet Potato',
      description: 'Classic bodybuilder meal',
      calories: 680,
      protein: 55,
      carbs: 45,
      fats: 28,
      ingredients: ['8oz sirloin steak', '1 large sweet potato', 'Broccoli', 'Butter'],
      prepTime: '30 min',
    },
    {
      name: 'Chicken Stir-Fry',
      description: 'Asian-inspired protein bowl',
      calories: 580,
      protein: 48,
      carbs: 35,
      fats: 28,
      ingredients: ['8oz chicken breast', 'Mixed vegetables', 'Brown rice', 'Soy sauce', 'Ginger'],
      prepTime: '25 min',
    },
  ],
  dinner_balanced: [
    {
      name: 'Mediterranean Chicken Bowl',
      description: 'Healthy balanced dinner',
      calories: 580,
      protein: 40,
      carbs: 50,
      fats: 25,
      ingredients: ['6oz chicken', 'Brown rice', 'Chickpeas', 'Tomatoes', 'Tzatziki'],
      prepTime: '25 min',
    },
  ],
  snacks_highprotein: [
    {
      name: 'Protein Shake',
      description: 'Post-workout recovery',
      calories: 200,
      protein: 30,
      carbs: 8,
      fats: 4,
      ingredients: ['2 scoops whey protein', 'Water/Almond milk', 'Ice'],
      prepTime: '2 min',
    },
    {
      name: 'Cottage Cheese & Fruit',
      description: 'Casein-rich snack',
      calories: 180,
      protein: 20,
      carbs: 15,
      fats: 5,
      ingredients: ['1 cup cottage cheese', '1/2 cup berries'],
      prepTime: '2 min',
    },
    {
      name: 'Beef Jerky & Almonds',
      description: 'On-the-go protein',
      calories: 220,
      protein: 22,
      carbs: 8,
      fats: 12,
      ingredients: ['2oz beef jerky', '1oz almonds'],
    },
  ],
  snacks_balanced: [
    {
      name: 'Apple & Peanut Butter',
      description: 'Classic combo',
      calories: 250,
      protein: 8,
      carbs: 30,
      fats: 14,
      ingredients: ['1 apple', '2 tbsp peanut butter'],
    },
    {
      name: 'Trail Mix',
      description: 'Energy boost',
      calories: 200,
      protein: 6,
      carbs: 20,
      fats: 12,
      ingredients: ['Mixed nuts', 'Dried fruit', 'Dark chocolate chips'],
    },
  ],
};

const generateMealPlan = (
  dietType: string,
  goal: string,
  targetCalories: number
): MealPlan => {
  const dietKey = dietType === 'highprotein' ? 'highprotein' : 'balanced';
  
  // Select meals based on diet type
  const breakfasts = MEAL_DATABASE[`breakfast_${dietKey}`] || MEAL_DATABASE['breakfast_balanced'];
  const lunches = MEAL_DATABASE[`lunch_${dietKey}`] || MEAL_DATABASE['lunch_balanced'];
  const dinners = MEAL_DATABASE[`dinner_${dietKey}`] || MEAL_DATABASE['dinner_balanced'];
  const snacks = MEAL_DATABASE[`snacks_${dietKey}`] || MEAL_DATABASE['snacks_balanced'];

  // Randomly select meals
  const breakfast = breakfasts[Math.floor(Math.random() * breakfasts.length)];
  const lunch = lunches[Math.floor(Math.random() * lunches.length)];
  const dinner = dinners[Math.floor(Math.random() * dinners.length)];
  const selectedSnacks = snacks.slice(0, 2);

  // Calculate totals
  const totals: MacroTotals = {
    calories: breakfast.calories + lunch.calories + dinner.calories + 
              selectedSnacks.reduce((sum, s) => sum + s.calories, 0),
    protein: breakfast.protein + lunch.protein + dinner.protein +
             selectedSnacks.reduce((sum, s) => sum + s.protein, 0),
    carbs: breakfast.carbs + lunch.carbs + dinner.carbs +
           selectedSnacks.reduce((sum, s) => sum + s.carbs, 0),
    fats: breakfast.fats + lunch.fats + dinner.fats +
          selectedSnacks.reduce((sum, s) => sum + s.fats, 0),
  };

  return {
    breakfast,
    lunch,
    dinner,
    snacks: selectedSnacks,
    totals,
  };
};

const AIMealPlannerScreen = ({ navigation }: { navigation: any }) => {
  const [selectedDiet, setSelectedDiet] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('maintain');
  const [targetCalories, setTargetCalories] = useState('2200');
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!selectedDiet) {
      Alert.alert('Select Diet Type', 'Please choose your preferred diet type');
      return;
    }

    buttonPress();
    setIsGenerating(true);

    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1500));

    const calories = parseInt(targetCalories) || 2200;
    const goalData = GOALS.find(g => g.id === selectedGoal);
    const adjustedCalories = calories + (goalData?.surplus || 0);

    const plan = generateMealPlan(selectedDiet, selectedGoal, adjustedCalories);
    setMealPlan(plan);
    setIsGenerating(false);
    successHaptic();
  };

  const renderMealCard = (meal: MealItem, title: string, emoji: string) => {
    const isExpanded = expandedMeal === title;
    
    return (
      <TouchableOpacity
        style={styles.mealCard}
        onPress={() => {
          buttonPress();
          setExpandedMeal(isExpanded ? null : title);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.mealHeader}>
          <View style={styles.mealTitleRow}>
            <Text style={styles.mealEmoji}>{emoji}</Text>
            <View>
              <Text style={styles.mealTime}>{title}</Text>
              <Text style={styles.mealName}>{meal.name}</Text>
            </View>
          </View>
          <View style={styles.mealMacros}>
            <Text style={styles.mealCalories}>{meal.calories}</Text>
            <Text style={styles.mealCaloriesLabel}>cal</Text>
          </View>
        </View>
        
        <Text style={styles.mealDesc}>{meal.description}</Text>
        
        <View style={styles.macroRow}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{meal.protein}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{meal.carbs}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{meal.fats}g</Text>
            <Text style={styles.macroLabel}>Fats</Text>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {meal.prepTime && (
              <Text style={styles.prepTime}>⏱️ Prep time: {meal.prepTime}</Text>
            )}
            <Text style={styles.ingredientsTitle}>Ingredients:</Text>
            {meal.ingredients.map((ing, idx) => (
              <Text key={idx} style={styles.ingredientItem}>• {ing}</Text>
            ))}
          </View>
        )}

        <Text style={styles.expandHint}>
          {isExpanded ? 'Tap to collapse ▲' : 'Tap for recipe ▼'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSetup = () => (
    <View style={styles.setupContainer}>
      {/* Diet Type Selection */}
      <Text style={styles.sectionTitle}>🍽️ Diet Preference</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.dietScroll}
      >
        {DIET_TYPES.map(diet => (
          <TouchableOpacity
            key={diet.id}
            style={[
              styles.dietCard,
              selectedDiet === diet.id && styles.dietCardActive,
            ]}
            onPress={() => {
              buttonPress();
              setSelectedDiet(diet.id);
            }}
          >
            <Text style={styles.dietIcon}>{diet.icon}</Text>
            <Text style={[
              styles.dietLabel,
              selectedDiet === diet.id && styles.dietLabelActive,
            ]}>
              {diet.label}
            </Text>
            <Text style={styles.dietDesc}>{diet.desc}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Goal Selection */}
      <Text style={styles.sectionTitle}>🎯 Your Goal</Text>
      <View style={styles.goalRow}>
        {GOALS.map(goal => (
          <TouchableOpacity
            key={goal.id}
            style={[
              styles.goalCard,
              selectedGoal === goal.id && styles.goalCardActive,
            ]}
            onPress={() => {
              buttonPress();
              setSelectedGoal(goal.id);
            }}
          >
            <Text style={styles.goalIcon}>{goal.icon}</Text>
            <Text style={[
              styles.goalLabel,
              selectedGoal === goal.id && styles.goalLabelActive,
            ]}>
              {goal.label}
            </Text>
            <Text style={styles.goalSurplus}>
              {goal.surplus > 0 ? `+${goal.surplus}` : goal.surplus} cal
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Calorie Target */}
      <Text style={styles.sectionTitle}>🔥 Daily Calorie Target</Text>
      <View style={styles.calorieInput}>
        <TextInput
          style={styles.calorieField}
          value={targetCalories}
          onChangeText={setTargetCalories}
          keyboardType="numeric"
          placeholder="2200"
        />
        <Text style={styles.calorieLabel}>calories/day</Text>
      </View>
      <Text style={styles.calorieHint}>
        Recommended: {selectedGoal === 'bulking' ? '2500-3000' : 
                      selectedGoal === 'cutting' ? '1800-2200' : '2000-2500'} for your goal
      </Text>

      {/* Generate Button */}
      <TouchableOpacity
        style={[styles.generateButton, !selectedDiet && styles.generateButtonDisabled]}
        onPress={handleGenerate}
        disabled={!selectedDiet || isGenerating}
      >
        {isGenerating ? (
          <View style={styles.generatingRow}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.generateButtonText}>  Generating...</Text>
          </View>
        ) : (
          <Text style={styles.generateButtonText}>✨ Generate Meal Plan</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderMealPlan = () => (
    <ScrollView style={styles.planContainer} showsVerticalScrollIndicator={false}>
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>📊 Daily Totals</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{mealPlan?.totals.calories}</Text>
            <Text style={styles.summaryLabel}>Calories</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: '#ef4444' }]}>
              {mealPlan?.totals.protein}g
            </Text>
            <Text style={styles.summaryLabel}>Protein</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: '#3b82f6' }]}>
              {mealPlan?.totals.carbs}g
            </Text>
            <Text style={styles.summaryLabel}>Carbs</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: '#f59e0b' }]}>
              {mealPlan?.totals.fats}g
            </Text>
            <Text style={styles.summaryLabel}>Fats</Text>
          </View>
        </View>
      </View>

      {/* Meals */}
      {mealPlan && (
        <>
          {renderMealCard(mealPlan.breakfast, 'Breakfast', '🌅')}
          {renderMealCard(mealPlan.lunch, 'Lunch', '☀️')}
          {renderMealCard(mealPlan.dinner, 'Dinner', '🌙')}
          
          {/* Snacks */}
          <Text style={styles.snacksTitle}>🍎 Snacks</Text>
          {mealPlan.snacks.map((snack, idx) => (
            <View key={idx} style={styles.snackCard}>
              <View style={styles.snackInfo}>
                <Text style={styles.snackName}>{snack.name}</Text>
                <Text style={styles.snackDesc}>{snack.description}</Text>
              </View>
              <View style={styles.snackMacros}>
                <Text style={styles.snackCalories}>{snack.calories} cal</Text>
                <Text style={styles.snackProtein}>{snack.protein}g protein</Text>
              </View>
            </View>
          ))}
        </>
      )}

      {/* Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.regenerateButton}
          onPress={() => {
            buttonPress();
            handleGenerate();
          }}
        >
          <Text style={styles.regenerateText}>🔄 New Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            buttonPress();
            Alert.alert('Saved!', 'Meal plan saved to your profile');
          }}
        >
          <Text style={styles.saveButtonText}>💾 Save Plan</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.backToSetupButton}
        onPress={() => setMealPlan(null)}
      >
        <Text style={styles.backToSetupText}>← Back to Settings</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Meal Planner</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {mealPlan ? renderMealPlan() : renderSetup()}
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
  content: {
    flex: 1,
  },
  setupContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    marginTop: 8,
  },
  dietScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dietCard: {
    width: 120,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  dietCardActive: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  dietIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  dietLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  dietLabelActive: {
    color: '#10b981',
  },
  dietDesc: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
  },
  goalRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  goalCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  goalCardActive: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  goalIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  goalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  goalLabelActive: {
    color: '#10b981',
  },
  goalSurplus: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  calorieInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 8,
  },
  calorieField: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
    flex: 1,
  },
  calorieLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  calorieHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 24,
  },
  generateButton: {
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  generatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planContainer: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#10b981',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  summaryLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  mealCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  mealTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  mealName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  mealMacros: {
    alignItems: 'flex-end',
  },
  mealCalories: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10b981',
  },
  mealCaloriesLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  mealDesc: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  macroRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  macroLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  prepTime: {
    fontSize: 13,
    color: '#10b981',
    marginBottom: 8,
  },
  ingredientsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  ingredientItem: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  expandHint: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 10,
  },
  snacksTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 12,
  },
  snackCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  snackInfo: {
    flex: 1,
  },
  snackName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  snackDesc: {
    fontSize: 12,
    color: '#6b7280',
  },
  snackMacros: {
    alignItems: 'flex-end',
  },
  snackCalories: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  snackProtein: {
    fontSize: 11,
    color: '#ef4444',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  regenerateButton: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  regenerateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  backToSetupButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  backToSetupText: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default AIMealPlannerScreen;

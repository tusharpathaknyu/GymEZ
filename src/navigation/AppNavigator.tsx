import React, { useState } from 'react';
import { createStackNavigator, TransitionPresets, CardStyleInterpolators } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from '../screens/LoginScreen';
import GymOwnerDashboard from '../screens/GymOwnerDashboard';
import HomeScreen from '../screens/HomeScreen';
import SocialScreen from '../screens/SocialScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyGymScreen from '../screens/MyGymScreen';
import RewardsScreen from '../screens/RewardsScreen';
import WorkoutsScreen from '../screens/WorkoutsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ActivityScreen from '../screens/ActivityScreen';
import StatsScreen from '../screens/StatsScreen';
import ExerciseLibraryScreen from '../screens/ExerciseLibraryScreen';
import LiveWorkoutScreen from '../screens/LiveWorkoutScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
// New feature screens
import BodyMeasurementsScreen from '../screens/BodyMeasurementsScreen';
import NutritionScreen from '../screens/NutritionScreen';
import WorkoutHistoryScreen from '../screens/WorkoutHistoryScreen';
import GoalsScreen from '../screens/GoalsScreen';
import { OneRMCalculatorScreen } from '../components/OneRMCalculator';
// AI feature screens
import AIHubScreen from '../screens/AIHubScreen';
import AICoachScreen from '../screens/AICoachScreen';
import AIWorkoutGeneratorScreen from '../screens/AIWorkoutGeneratorScreen';
import AIProgressInsightsScreen from '../screens/AIProgressInsightsScreen';
import AIMealPlannerScreen from '../screens/AIMealPlannerScreen';
import WhatsAppIntegrationScreen from '../screens/WhatsAppIntegrationScreen';
import ProgressDashboardScreen from '../screens/ProgressDashboardScreen';
import WorkoutProgramsScreen from '../screens/WorkoutProgramsScreen';
import SmartNotificationsScreen from '../screens/SmartNotificationsScreen';
import ThemeSettingsScreen from '../screens/ThemeSettingsScreen';
import WeeklyChallengesScreen from '../screens/WeeklyChallengesScreen';
// Fitness RPG Game screens
import FitnessRPGScreen from '../screens/games/FitnessRPGScreen';
import GuildScreen from '../screens/games/GuildScreen';
import BossRaidScreen from '../screens/games/BossRaidScreen';
import TournamentScreen from '../screens/games/TournamentScreen';
// Navigation components
import { FloatingMenu, QuickAccessTooltip, useQuickAccessTooltip } from '../components/navigation';
import { useAuth } from '../services/auth';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform, Animated } from 'react-native';
import { tabChangeHaptic, successHaptic } from '../utils/haptics';
import { useNavigation } from '@react-navigation/native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <View style={styles.loadingContent}>
      <Text style={styles.loadingLogo}>💪</Text>
      <Text style={styles.loadingTitle}>GymEZ</Text>
      <ActivityIndicator size="large" color="#10b981" style={styles.spinner} />
      <Text style={styles.loadingText}>Loading your fitness journey...</Text>
    </View>
  </View>
);

// Custom Tab Bar Button with haptic feedback and scale animation
const TabBarButton = ({ children, onPress, accessibilityState }: any) => {
  const focused = accessibilityState?.selected;
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const handlePress = () => {
    tabChangeHaptic();
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        styles.tabBarButton,
        focused && styles.tabBarButtonFocused,
      ]}
      activeOpacity={1}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Smooth screen transitions
const screenOptions = {
  headerShown: false,
  ...TransitionPresets.SlideFromRightIOS,
  gestureEnabled: true,
  gestureResponseDistance: 50,
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
};

// Home Stack Navigator for nested navigation
const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={screenOptions}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    <HomeStack.Screen name="Workouts" component={WorkoutsScreen} />
    <HomeStack.Screen name="LiveWorkout" component={LiveWorkoutScreen} />
    <HomeStack.Screen name="ExerciseLibrary" component={ExerciseLibraryScreen} />
    <HomeStack.Screen name="Activity" component={ActivityScreen} />
    <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
    <HomeStack.Screen name="BodyMeasurements" component={BodyMeasurementsScreen} />
    <HomeStack.Screen name="Nutrition" component={NutritionScreen} />
    <HomeStack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} />
    <HomeStack.Screen name="Goals" component={GoalsScreen} />
    <HomeStack.Screen name="OneRMCalculator" component={OneRMCalculatorScreen} />
    <HomeStack.Screen name="ProgressDashboard" component={ProgressDashboardScreen} />
    <HomeStack.Screen name="WorkoutPrograms" component={WorkoutProgramsScreen} />
    <HomeStack.Screen name="SmartNotifications" component={SmartNotificationsScreen} />
    <HomeStack.Screen name="ThemeSettings" component={ThemeSettingsScreen} />
    <HomeStack.Screen name="WeeklyChallenges" component={WeeklyChallengesScreen} />
    {/* AI Feature Screens */}
    <HomeStack.Screen name="AIHub" component={AIHubScreen} />
    <HomeStack.Screen name="AICoach" component={AICoachScreen} />
    <HomeStack.Screen name="AIWorkoutGenerator" component={AIWorkoutGeneratorScreen} />
    <HomeStack.Screen name="AIProgressInsights" component={AIProgressInsightsScreen} />
    <HomeStack.Screen name="AIMealPlanner" component={AIMealPlannerScreen} />
    <HomeStack.Screen name="WhatsAppIntegration" component={WhatsAppIntegrationScreen} />
    {/* Fitness RPG Game */}
    <HomeStack.Screen name="FitnessRPG" component={FitnessRPGScreen} />
    <HomeStack.Screen name="Guild" component={GuildScreen} />
    <HomeStack.Screen name="BossRaid" component={BossRaidScreen} />
    <HomeStack.Screen name="Tournament" component={TournamentScreen} />
  </HomeStack.Navigator>
);

// Profile Stack Navigator
const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={screenOptions}>
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    <ProfileStack.Screen name="Stats" component={StatsScreen} />
    <ProfileStack.Screen name="Notifications" component={NotificationsScreen} />
  </ProfileStack.Navigator>
);

// Center Quick Action Button Component
const CenterTabButton = ({ onPress }: { onPress: () => void }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const glowAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Subtle glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePress = () => {
    successHaptic();
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  const pulseScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  return (
    <TouchableOpacity
      style={styles.centerButtonContainer}
      onPress={handlePress}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          styles.centerButton,
          {
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseScale) },
            ],
          },
        ]}
      >
        <View style={styles.centerButtonInner}>
          <Text style={styles.centerButtonIcon}>➕</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const MemberTabs = () => {
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const navigation = useNavigation();
  const { showTooltip, dismissTooltip } = useQuickAccessTooltip();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            let iconName = '';
            let iconStyle = focused ? styles.tabIconFocused : styles.tabIcon;

            if (route.name === 'HomeTab') {
              iconName = '🏠';
            } else if (route.name === 'Activity') {
              iconName = '📊';
            } else if (route.name === 'QuickAction') {
              return null; // Custom button handled separately
            } else if (route.name === 'Leaderboard') {
              iconName = '🏆';
            } else if (route.name === 'ProfileTab') {
              iconName = '👤';
            }

            return (
              <View style={styles.tabIconContainer}>
                <Text style={[styles.tabIconText, iconStyle]}>{iconName}</Text>
                {focused && <View style={styles.tabIndicator} />}
              </View>
            );
          },
          tabBarActiveTintColor: '#10b981',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 0,
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 8,
            height: Platform.OS === 'ios' ? 85 : 65,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: -4,
          },
          headerShown: false,
          tabBarButton: (props) => <TabBarButton {...props} />,
        })}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStackNavigator}
          options={{ tabBarLabel: 'Home' }}
        />
        <Tab.Screen
          name="Activity"
          component={ActivityScreen}
          options={{ tabBarLabel: 'Activity' }}
        />
        <Tab.Screen
          name="QuickAction"
          component={View} // Placeholder - never shown
          options={{
            tabBarLabel: '',
            tabBarButton: () => (
              <CenterTabButton onPress={() => setShowQuickMenu(true)} />
            ),
          }}
        />
        <Tab.Screen
          name="Leaderboard"
          component={LeaderboardScreen}
          options={{ tabBarLabel: 'Ranks' }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileStackNavigator}
          options={{ tabBarLabel: 'Profile' }}
        />
      </Tab.Navigator>

      {/* Floating Quick Access Menu */}
      <FloatingMenu
        navigation={navigation}
        visible={showQuickMenu}
        onClose={() => setShowQuickMenu(false)}
      />

      {/* First-time user tooltip */}
      <QuickAccessTooltip
        visible={showTooltip}
        onDismiss={dismissTooltip}
      />
    </View>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        user.user_type === 'gym_owner' ? (
          <Stack.Screen
            name="GymOwnerDashboard"
            component={GymOwnerDashboard}
          />
        ) : (
          <Stack.Screen name="MemberTabs" component={MemberTabs} />
        )
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingLogo: {
    fontSize: 64,
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 24,
  },
  spinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  tabBarButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarButtonFocused: {
    transform: [{ scale: 1.05 }],
  },
  tabIconContainer: {
    alignItems: 'center',
  },
  tabIconText: {
    fontSize: 22,
  },
  tabIcon: {
    opacity: 0.7,
  },
  tabIconFocused: {
    opacity: 1,
  },
  tabIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10b981',
    marginTop: 4,
  },
  // Center Quick Action Button Styles
  centerButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  centerButtonInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  centerButtonIcon: {
    fontSize: 26,
  },
});

export default AppNavigator;

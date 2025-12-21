import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  createStackNavigator,
  TransitionPresets,
} from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// Screens
import LoginScreen from '../screens/LoginScreen';
import GymOwnerDashboard from '../screens/GymOwnerDashboard';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WorkoutsScreen from '../screens/WorkoutsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ActivityScreen from '../screens/ActivityScreen';
import StatsScreen from '../screens/StatsScreen';
import ExerciseLibraryScreen from '../screens/ExerciseLibraryScreen';
import LiveWorkoutScreen from '../screens/LiveWorkoutScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import BodyMeasurementsScreen from '../screens/BodyMeasurementsScreen';
import NutritionScreen from '../screens/NutritionScreen';
import WorkoutHistoryScreen from '../screens/WorkoutHistoryScreen';
import GoalsScreen from '../screens/GoalsScreen';
import { OneRMCalculatorScreen } from '../components/OneRMCalculator';
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
import GymCheckinScreen from '../screens/GymCheckinScreen';
import FitnessRPGScreen from '../screens/games/FitnessRPGScreen';
import GuildScreen from '../screens/games/GuildScreen';
import BossRaidScreen from '../screens/games/BossRaidScreen';
import TournamentScreen from '../screens/games/TournamentScreen';

// Navigation components
import {
  QuickAccessTooltip,
  useQuickAccessTooltip,
  QuickActionsSheet,
} from '../components/navigation';
import { useAuth } from '../services/auth';
import { tabChangeHaptic, successHaptic, mediumHaptic } from '../utils/haptics';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const ProfileStack = createStackNavigator();

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================
const COLORS = {
  primary: '#10b981',
  primaryDark: '#059669',
  primaryLight: '#d1fae5',
  secondary: '#6366f1',
  background: '#f9fafb',
  surface: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  inactive: '#9ca3af',
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#22c55e',
};

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 68;
const CENTER_BUTTON_SIZE = 62;

// ============================================
// LOADING SCREEN
// ============================================
const LoadingScreen = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Subtle rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
      <View style={styles.loadingContent}>
        {/* Animated background rings */}
        <View style={styles.loadingRings}>
          {[1, 2, 3].map((ring) => (
            <Animated.View
              key={ring}
              style={[
                styles.loadingRing,
                {
                  width: 80 + ring * 30,
                  height: 80 + ring * 30,
                  borderRadius: (80 + ring * 30) / 2,
                  opacity: 0.1 / ring,
                  transform: [{ rotate }],
                },
              ]}
            />
          ))}
        </View>

        <Animated.Text 
          style={[
            styles.loadingLogo,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          💪
        </Animated.Text>
        <Text style={styles.loadingTitle}>GymEZ</Text>
        <Text style={styles.loadingSubtitle}>Your Fitness Journey Awaits</Text>
        
        <View style={styles.loadingIndicator}>
          <View style={styles.loadingDots}>
            {[0, 1, 2].map((dot) => (
              <LoadingDot key={dot} delay={dot * 200} />
            ))}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

// Animated loading dot
const LoadingDot = ({ delay }: { delay: number }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.delay(600 - delay),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.loadingDot,
        {
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -8],
              }),
            },
          ],
          opacity: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          }),
        },
      ]}
    />
  );
};

// ============================================
// ENHANCED TAB BAR
// ============================================
interface TabConfig {
  name: string;
  label: string;
  icon: string;
  activeIcon: string;
}

const TAB_CONFIG: TabConfig[] = [
  { name: 'HomeTab', label: 'Home', icon: '🏠', activeIcon: '🏡' },
  { name: 'Activity', label: 'Activity', icon: '📊', activeIcon: '📈' },
  { name: 'QuickAction', label: '', icon: '➕', activeIcon: '➕' },
  { name: 'Leaderboard', label: 'Ranks', icon: '🏆', activeIcon: '👑' },
  { name: 'ProfileTab', label: 'Profile', icon: '👤', activeIcon: '🙂' },
];

// Custom Tab Button with smooth animations
const AnimatedTabButton = ({ 
  focused, 
  icon, 
  activeIcon,
  label, 
  onPress,
  isCenter = false,
}: {
  focused: boolean;
  icon: string;
  activeIcon: string;
  label: string;
  onPress: () => void;
  isCenter?: boolean;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateYAnim, {
        toValue: focused ? -2 : 0,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(indicatorWidth, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [focused]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    tabChangeHaptic();
    onPress();
  };

  if (isCenter) return null;

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={styles.tabButton}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          styles.tabButtonInner,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: translateYAnim },
            ],
          },
        ]}
      >
        <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
          {focused ? activeIcon : icon}
        </Text>
        {label ? (
          <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
            {label}
          </Text>
        ) : null}
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              width: indicatorWidth.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 24],
              }),
              opacity: indicatorWidth,
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

// Center Action Button with enhanced animations
const CenterActionButton = ({ onPress }: { onPress: () => void }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Continuous subtle glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePress = () => {
    successHaptic();
    
    // Bounce and rotate animation
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      rotateAnim.setValue(0);
    });

    onPress();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  return (
    <View style={styles.centerButtonWrapper}>
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.centerButtonGlow,
          {
            transform: [{ scale: glowScale }],
            opacity: glowOpacity,
          },
        ]}
      />
      
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={1}
        style={styles.centerButtonTouchable}
      >
        <Animated.View
          style={[
            styles.centerButton,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Animated.View
            style={[
              styles.centerButtonInner,
              { transform: [{ rotate }] },
            ]}
          >
            <Text style={styles.centerButtonIcon}>➕</Text>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

// Custom Tab Bar Component
const CustomTabBar = ({ 
  state, 
  descriptors, 
  navigation,
  onCenterPress,
}: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBarContent}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const tabConfig = TAB_CONFIG[index];
          const isCenter = route.name === 'QuickAction';

          const onPress = () => {
            if (isCenter) {
              onCenterPress();
              return;
            }

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (isCenter) {
            return <CenterActionButton key={route.key} onPress={onCenterPress} />;
          }

          return (
            <AnimatedTabButton
              key={route.key}
              focused={isFocused}
              icon={tabConfig.icon}
              activeIcon={tabConfig.activeIcon}
              label={tabConfig.label}
              onPress={onPress}
              isCenter={isCenter}
            />
          );
        })}
      </View>
    </View>
  );
};

// ============================================
// SCREEN OPTIONS
// ============================================
const defaultScreenOptions = {
  headerShown: false,
  gestureEnabled: true,
  gestureResponseDistance: 50,
  ...TransitionPresets.SlideFromRightIOS,
};

const modalScreenOptions = {
  headerShown: false,
  gestureEnabled: true,
  ...TransitionPresets.ModalSlideFromBottomIOS,
};

// ============================================
// STACK NAVIGATORS
// ============================================
const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={defaultScreenOptions}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    <HomeStack.Screen name="Workouts" component={WorkoutsScreen} />
    <HomeStack.Screen name="LiveWorkout" component={LiveWorkoutScreen} options={modalScreenOptions} />
    <HomeStack.Screen name="ExerciseLibrary" component={ExerciseLibraryScreen} />
    <HomeStack.Screen name="Activity" component={ActivityScreen} />
    <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
    <HomeStack.Screen name="BodyMeasurements" component={BodyMeasurementsScreen} />
    <HomeStack.Screen name="Nutrition" component={NutritionScreen} />
    <HomeStack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} />
    <HomeStack.Screen name="Goals" component={GoalsScreen} />
    <HomeStack.Screen name="OneRMCalculator" component={OneRMCalculatorScreen} options={modalScreenOptions} />
    <HomeStack.Screen name="ProgressDashboard" component={ProgressDashboardScreen} />
    <HomeStack.Screen name="WorkoutPrograms" component={WorkoutProgramsScreen} />
    <HomeStack.Screen name="SmartNotifications" component={SmartNotificationsScreen} />
    <HomeStack.Screen name="ThemeSettings" component={ThemeSettingsScreen} />
    <HomeStack.Screen name="WeeklyChallenges" component={WeeklyChallengesScreen} />
    <HomeStack.Screen name="GymCheckin" component={GymCheckinScreen} />
    {/* AI Features */}
    <HomeStack.Screen name="AIHub" component={AIHubScreen} />
    <HomeStack.Screen name="AICoach" component={AICoachScreen} />
    <HomeStack.Screen name="AIWorkoutGenerator" component={AIWorkoutGeneratorScreen} />
    <HomeStack.Screen name="AIProgressInsights" component={AIProgressInsightsScreen} />
    <HomeStack.Screen name="AIMealPlanner" component={AIMealPlannerScreen} />
    <HomeStack.Screen name="WhatsAppIntegration" component={WhatsAppIntegrationScreen} />
    {/* Games */}
    <HomeStack.Screen name="FitnessRPG" component={FitnessRPGScreen} />
    <HomeStack.Screen name="Guild" component={GuildScreen} />
    <HomeStack.Screen name="BossRaid" component={BossRaidScreen} />
    <HomeStack.Screen name="Tournament" component={TournamentScreen} />
  </HomeStack.Navigator>
);

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={defaultScreenOptions}>
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    <ProfileStack.Screen name="Stats" component={StatsScreen} />
    <ProfileStack.Screen name="Notifications" component={NotificationsScreen} />
  </ProfileStack.Navigator>
);

// ============================================
// MEMBER TABS
// ============================================
const MemberTabs = () => {
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const navigation = useNavigation();
  const { showTooltip, dismissTooltip } = useQuickAccessTooltip();

  const handleQuickAction = useCallback((action: string, screen?: string) => {
    setShowQuickMenu(false);
    mediumHaptic();
    
    if (screen) {
      // Small delay for smooth modal close animation
      setTimeout(() => {
        (navigation as any).navigate(screen);
      }, 200);
    }
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
        }}
        tabBar={(props) => (
          <CustomTabBar 
            {...props} 
            onCenterPress={() => setShowQuickMenu(true)} 
          />
        )}
      >
        <Tab.Screen name="HomeTab" component={HomeStackNavigator} />
        <Tab.Screen name="Activity" component={ActivityScreen} />
        <Tab.Screen name="QuickAction" component={View} />
        <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} />
      </Tab.Navigator>

      {/* Quick Actions Sheet */}
      <QuickActionsSheet
        visible={showQuickMenu}
        onClose={() => setShowQuickMenu(false)}
        onActionPress={handleQuickAction}
        navigation={navigation}
      />

      {/* First-time user tooltip */}
      <QuickAccessTooltip
        visible={showTooltip}
        onDismiss={dismissTooltip}
      />
    </View>
  );
};

// ============================================
// MAIN NAVIGATOR
// ============================================
const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
      }}
    >
      {user ? (
        user.user_type === 'gym_owner' ? (
          <Stack.Screen 
            name="GymOwnerDashboard" 
            component={GymOwnerDashboard} 
          />
        ) : (
          <Stack.Screen 
            name="MemberTabs" 
            component={MemberTabs}
            options={{
              animationEnabled: false,
            }}
          />
        )
      ) : (
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            cardStyleInterpolator: forFadeWithScale,
          }}
        />
      )}
    </Stack.Navigator>
  );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Loading Screen
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingRings: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  loadingLogo: {
    fontSize: 72,
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -1,
    marginBottom: 4,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
  loadingIndicator: {
    marginTop: 8,
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginHorizontal: 4,
  },

  // Tab Bar
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingHorizontal: 8,
    height: TAB_BAR_HEIGHT - 20,
  },

  // Tab Button
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonInner: {
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.6,
  },
  tabIconFocused: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.inactive,
    marginBottom: 4,
  },
  tabLabelFocused: {
    color: COLORS.primary,
  },
  tabIndicator: {
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.primary,
  },

  // Center Button
  centerButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
    width: CENTER_BUTTON_SIZE + 20,
  },
  centerButtonGlow: {
    position: 'absolute',
    width: CENTER_BUTTON_SIZE + 16,
    height: CENTER_BUTTON_SIZE + 16,
    borderRadius: (CENTER_BUTTON_SIZE + 16) / 2,
    backgroundColor: COLORS.primary,
  },
  centerButtonTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    borderRadius: CENTER_BUTTON_SIZE / 2,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  centerButtonInner: {
    width: CENTER_BUTTON_SIZE - 8,
    height: CENTER_BUTTON_SIZE - 8,
    borderRadius: (CENTER_BUTTON_SIZE - 8) / 2,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  centerButtonIcon: {
    fontSize: 28,
  },
});

export default AppNavigator;

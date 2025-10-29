import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';

import { WorkoutService } from './src/services/WorkoutService';
import { ProgressService } from './src/services/ProgressService';
import { GymService } from './src/services/gymService';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AuthScreen } from './src/screens/AuthScreen';

type ScreenType = 'auth' | 'home' | 'workout' | 'progress' | 'gyms';

// Main app component that handles authentication flow
function MainApp(): React.JSX.Element {
  const { state } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');

  // Show auth screen if not authenticated
  if (!state.isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#10b981" />
        <AuthScreen 
          onLoginSuccess={() => {
            // Auth context will handle the state update
            setCurrentScreen('home');
          }}
          onNavigateToApp={() => {
            // Allow users to skip authentication for demo
            setCurrentScreen('home');
          }}
        />
      </SafeAreaView>
    );
  }

  return <AuthenticatedApp currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />;
}

// Authenticated app component
function AuthenticatedApp({ currentScreen, setCurrentScreen }: {
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
}): React.JSX.Element {
  const { state, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: async () => {
          await logout();
          setCurrentScreen('home');
        }}
      ]
    );
  };

  const handleStartWorkout = () => {
    setCurrentScreen('workout');
  };

  const handleViewProgress = () => {
    setCurrentScreen('progress');
  };

  const handleFindGyms = () => {
    setCurrentScreen('gyms');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
  };

  const renderWorkoutScreen = () => {
    const workoutTemplates = [
      { id: '1', name: 'Beginner Full Body', duration: '25 min', difficulty: 'Beginner' },
      { id: '2', name: 'Upper Body Strength', duration: '45 min', difficulty: 'Intermediate' },
      { id: '3', name: 'HIIT Cardio Blast', duration: '20 min', difficulty: 'Advanced' },
      { id: '4', name: 'Lower Body Power', duration: '40 min', difficulty: 'Intermediate' }
    ];

    return (
      <ScrollView style={styles.screenContainer}>
        <Text style={styles.screenTitle}>Workout Templates</Text>
        <Text style={styles.screenText}>
          Choose from our curated workout programs designed by fitness experts.
        </Text>
        
        {workoutTemplates.map(template => (
          <TouchableOpacity 
            key={template.id} 
            style={styles.workoutCard}
            onPress={() => Alert.alert('Workout Selected', `Starting ${template.name}!\n\nDuration: ${template.duration}\nDifficulty: ${template.difficulty}`)}
          >
            <View style={styles.workoutCardContent}>
              <Text style={styles.workoutName}>{template.name}</Text>
              <Text style={styles.workoutDetails}>{template.duration} • {template.difficulty}</Text>
            </View>
            <Text style={styles.startButton}>START</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.button} onPress={() => Alert.alert('Custom Workout', 'Build your own workout from our exercise library!')}>
          <Text style={styles.buttonText}>Create Custom Workout</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={handleBackToHome}>
          <Text style={[styles.buttonText, styles.backButtonText]}>← Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderProgressScreen = () => {
    const mockStats = {
      totalWorkouts: 47,
      currentStreak: 5,
      caloriesBurned: 8540,
      avgDuration: 30
    };

    const mockGoals = [
      { id: '1', title: 'Lose 10 kg', current: 75, target: 70, unit: 'kg' },
      { id: '2', title: 'Bench Press 100kg', current: 85, target: 100, unit: 'kg' },
      { id: '3', title: 'Run 5K under 25min', current: 28, target: 25, unit: 'min' }
    ];

    return (
      <ScrollView style={styles.screenContainer}>
        <Text style={styles.screenTitle}>Your Progress</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mockStats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mockStats.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mockStats.caloriesBurned}</Text>
            <Text style={styles.statLabel}>Calories Burned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mockStats.avgDuration}m</Text>
            <Text style={styles.statLabel}>Avg Duration</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Fitness Goals</Text>
        {mockGoals.map(goal => {
          const progress = Math.min((goal.current / goal.target) * 100, 100);
          return (
            <View key={goal.id} style={styles.goalCard}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalProgress}>
                {goal.current} / {goal.target} {goal.unit} ({Math.round(progress)}%)
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>
          );
        })}
        
        <TouchableOpacity style={styles.button} onPress={() => Alert.alert('Add Goal', 'Create a new fitness goal to track your progress!')}>
          <Text style={styles.buttonText}>Add New Goal</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={handleBackToHome}>
          <Text style={[styles.buttonText, styles.backButtonText]}>← Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderGymsScreen = () => {
    const gyms = GymService.getMockNearbyGyms();
    
    return (
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.screenContainer}>
          <Text style={styles.screenTitle}>Find Gyms Near You</Text>
          <Text style={styles.screenText}>
            Discover top-rated gyms in NYC and find your perfect workout spot.
          </Text>
          
          {gyms.map((gym: any) => (
            <View key={gym.id} style={styles.gymCard}>
              <Text style={styles.gymName}>{gym.name}</Text>
              <Text style={styles.gymAddress}>{gym.address}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <Text style={styles.gymRating}>⭐ {gym.rating || 4.0}/5.0</Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  {gym.amenities ? gym.amenities.slice(0, 2).join(' • ') : 'Full Service Gym'}
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: '#10b981', marginTop: 4, fontWeight: '600' }}>
                {gym.membership_types ? `From $${gym.membership_types[0]?.price_monthly}/month` : 'Contact for pricing'}
              </Text>
            </View>
          ))}
          
          <TouchableOpacity style={[styles.button, styles.backButton]} onPress={handleBackToHome}>
            <Text style={[styles.buttonText, styles.backButtonText]}>← Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderHomeScreen = () => (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.logo}>GYMEZ</Text>
              <Text style={styles.subtitle}>Your Fitness Journey Starts Here</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
          {state.user && (
            <View style={styles.userWelcome}>
              <Text style={styles.welcomeText}>Welcome back, {state.user.full_name}!</Text>
              <Text style={styles.userTypeText}>
                {state.user.user_type === 'gym_owner' ? '🏋️ Gym Owner' : '💪 Gym Member'}
              </Text>
            </View>
          )}
        </View>      <View style={styles.content}>
        <TouchableOpacity style={styles.button} onPress={handleStartWorkout}>
          <Text style={styles.buttonText}>Start Workout</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleViewProgress}>
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            View Progress
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleFindGyms}>
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Find Gyms
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Ready to transform your fitness journey?
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {currentScreen === 'home' && renderHomeScreen()}
      {currentScreen === 'workout' && renderWorkoutScreen()}
      {currentScreen === 'progress' && renderProgressScreen()}
      {currentScreen === 'gyms' && renderGymsScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#10b981',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  button: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButtonText: {
    color: '#10b981',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  screenContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 16,
    textAlign: 'center',
  },
  screenText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: '#6b7280',
    marginTop: 20,
  },
  backButtonText: {
    color: '#ffffff',
  },
  // Workout Screen Styles
  workoutCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  workoutCardContent: {
    flex: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  workoutDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  startButton: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    overflow: 'hidden',
    textAlign: 'center',
  },
  // Progress Screen Styles
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  goalCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  goalProgress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  // Gym Screen Styles
  gymCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  gymName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  gymAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  gymRating: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  // Authentication styles
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 16,
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  userWelcome: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  welcomeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userTypeText: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.9,
  },
});

// Root App component with AuthProvider
function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;

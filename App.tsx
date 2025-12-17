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
} from 'react-native';
import { GymService } from './src/services/gymService';
import { AuthProvider, useAuth } from './src/services/auth';
import LoginScreen from './src/screens/LoginScreen';
import GoogleAuthService from './src/services/GoogleAuthService';
import PRScreen from './src/screens/PRScreen';
import { User } from './src/types';

type ScreenType = 'auth' | 'home' | 'workout' | 'progress' | 'gyms';

// Helper function to validate user object
const isValidUser = (
  user: any,
): user is { full_name: string; email: string; user_type: string } => {
  return (
    user !== null &&
    typeof user === 'object' &&
    typeof user.full_name === 'string' &&
    user.full_name.trim().length > 0 &&
    typeof user.email === 'string' &&
    typeof user.user_type === 'string'
  );
};

// Main app component that handles authentication flow
function MainApp(): React.JSX.Element {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');

  // Initialize Google Sign-In when app starts
  React.useEffect(() => {
    const initializeGoogleSignIn = async () => {
      try {
        const googleAuth = GoogleAuthService.getInstance();
        await googleAuth.configure();
        console.log('Google Sign-In initialized successfully');
      } catch (error) {
        console.error('Google Sign-In initialization failed:', error);
        // Don't fail silently - log the error for debugging
      }
    };

    initializeGoogleSignIn();
  }, []);

  // Show auth screen if not authenticated
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#10b981" />
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isValidUser(user)) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#10b981" />
        <LoginScreen
          navigation={{ navigate: () => setCurrentScreen('home') }}
        />
      </SafeAreaView>
    );
  }

  return (
    <AuthenticatedApp
      currentScreen={currentScreen}
      setCurrentScreen={setCurrentScreen}
      user={user}
    />
  );
}

// Authenticated app component
function AuthenticatedApp({
  currentScreen,
  setCurrentScreen,
  user,
}: {
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
  user: User | null;
}): React.JSX.Element {
  const { signOut } = useAuth();

  // Early return if user is not valid - prevent rendering with invalid data
  if (!isValidUser(user)) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#10b981" />
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text>Loading user data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await signOut();
          setCurrentScreen('home');
        },
      },
    ]);
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
      {
        id: '1',
        name: 'Beginner Full Body',
        duration: '25 min',
        difficulty: 'Beginner',
      },
      {
        id: '2',
        name: 'Upper Body Strength',
        duration: '45 min',
        difficulty: 'Intermediate',
      },
      {
        id: '3',
        name: 'HIIT Cardio Blast',
        duration: '20 min',
        difficulty: 'Advanced',
      },
      {
        id: '4',
        name: 'Lower Body Power',
        duration: '40 min',
        difficulty: 'Intermediate',
      },
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
            onPress={() =>
              Alert.alert(
                'Workout Selected',
                `Starting ${template.name}!\n\nDuration: ${template.duration}\nDifficulty: ${template.difficulty}`,
              )
            }
          >
            <View style={styles.workoutCardContent}>
              <Text style={styles.workoutName}>{template.name}</Text>
              <Text style={styles.workoutDetails}>
                {template.duration} • {template.difficulty}
              </Text>
            </View>
            <Text style={styles.startButton}>START</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            Alert.alert(
              'Custom Workout',
              'Build your own workout from our exercise library!',
            )
          }
        >
          <Text style={styles.buttonText}>Create Custom Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={handleBackToHome}
        >
          <Text style={[styles.buttonText, styles.backButtonText]}>
            ← Back to Home
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderProgressScreen = () => {
    return <PRScreen onBackToHome={handleBackToHome} />;
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
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 8,
                }}
              >
                <Text style={styles.gymRating}>⭐ {gym.rating || 4.0}/5.0</Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  {gym.amenities
                    ? gym.amenities.slice(0, 2).join(' • ')
                    : 'Full Service Gym'}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: '#10b981',
                  marginTop: 4,
                  fontWeight: '600',
                }}
              >
                {gym.membership_types
                  ? `From $${gym.membership_types[0]?.price_monthly}/month`
                  : 'Contact for pricing'}
              </Text>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={handleBackToHome}
          >
            <Text style={[styles.buttonText, styles.backButtonText]}>
              ← Back to Home
            </Text>
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
            <Text style={styles.subtitle}>
              Your Fitness Journey Starts Here
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
        {user && user.full_name ? (
          <View style={styles.userWelcome}>
            <Text style={styles.welcomeText}>
              Welcome back, {String(user.full_name)}!
            </Text>
            <Text style={styles.userTypeText}>
              {user.user_type === 'gym_owner'
                ? '🏋️ Gym Owner'
                : '💪 Gym Member'}
            </Text>
          </View>
        ) : null}
      </View>{' '}
      <View style={styles.content}>
        <TouchableOpacity style={styles.button} onPress={handleStartWorkout}>
          <Text style={styles.buttonText}>Start Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleViewProgress}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            View Progress
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleFindGyms}
        >
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
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#10b981',
  },
  authSubtitle: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
    opacity: 0.9,
  },
  skipButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
  },
  authButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ffffff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  authButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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

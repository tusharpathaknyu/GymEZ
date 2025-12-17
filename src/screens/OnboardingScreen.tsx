import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

interface OnboardingScreenProps {
  user: any;
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  user,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({
    fitnessLevel: '',
    goals: [] as string[],
    interests: [] as string[],
  });

  const fitnessLevels = [
    { id: 'beginner', name: 'Beginner', desc: 'New to fitness' },
    { id: 'intermediate', name: 'Intermediate', desc: 'Some experience' },
    { id: 'advanced', name: 'Advanced', desc: 'Very experienced' },
  ];

  const fitnessGoals = [
    'Weight Loss',
    'Muscle Gain',
    'Strength Building',
    'Endurance',
    'Flexibility',
    'General Health',
  ];

  const interests = [
    'Weightlifting',
    'Cardio',
    'Yoga',
    'CrossFit',
    'Swimming',
    'Running',
    'Cycling',
    'Sports',
  ];

  const steps = [
    {
      title: `Welcome to GYMEZ, ${user?.full_name}!`,
      subtitle: "Let's personalize your fitness journey",
      content: (
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeEmoji}>🎉</Text>
          <Text style={styles.welcomeText}>
            {user?.user_type === 'gym_owner'
              ? 'Ready to manage your gym and connect with members?'
              : 'Ready to start your fitness journey and connect with gyms?'}
          </Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>✅ Track your workouts</Text>
            <Text style={styles.featureItem}>✅ Monitor your progress</Text>
            <Text style={styles.featureItem}>✅ Find nearby gyms</Text>
            <Text style={styles.featureItem}>✅ Connect with community</Text>
          </View>
        </View>
      ),
    },
    {
      title: "What's your fitness level?",
      subtitle: 'This helps us recommend the right workouts',
      content: (
        <View style={styles.optionsContainer}>
          {fitnessLevels.map(level => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.optionCard,
                preferences.fitnessLevel === level.id && styles.selectedOption,
              ]}
              onPress={() =>
                setPreferences({ ...preferences, fitnessLevel: level.id })
              }
            >
              <Text
                style={[
                  styles.optionTitle,
                  preferences.fitnessLevel === level.id && styles.selectedText,
                ]}
              >
                {level.name}
              </Text>
              <Text
                style={[
                  styles.optionDesc,
                  preferences.fitnessLevel === level.id && styles.selectedText,
                ]}
              >
                {level.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
    },
    {
      title: 'What are your fitness goals?',
      subtitle: 'Select all that apply',
      content: (
        <View style={styles.gridContainer}>
          {fitnessGoals.map(goal => (
            <TouchableOpacity
              key={goal}
              style={[
                styles.gridItem,
                preferences.goals.includes(goal) && styles.selectedOption,
              ]}
              onPress={() => {
                const newGoals = preferences.goals.includes(goal)
                  ? preferences.goals.filter(g => g !== goal)
                  : [...preferences.goals, goal];
                setPreferences({ ...preferences, goals: newGoals });
              }}
            >
              <Text
                style={[
                  styles.gridText,
                  preferences.goals.includes(goal) && styles.selectedText,
                ]}
              >
                {goal}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
    },
    {
      title: 'What interests you most?',
      subtitle: "We'll show you relevant content",
      content: (
        <View style={styles.gridContainer}>
          {interests.map(interest => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.gridItem,
                preferences.interests.includes(interest) &&
                  styles.selectedOption,
              ]}
              onPress={() => {
                const newInterests = preferences.interests.includes(interest)
                  ? preferences.interests.filter(i => i !== interest)
                  : [...preferences.interests, interest];
                setPreferences({ ...preferences, interests: newInterests });
              }}
            >
              <Text
                style={[
                  styles.gridText,
                  preferences.interests.includes(interest) &&
                    styles.selectedText,
                ]}
              >
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep === 1 && !preferences.fitnessLevel) {
      Alert.alert('Selection Required', 'Please select your fitness level');
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    // In a real app, save preferences to backend
    Alert.alert(
      'Setup Complete!',
      "Your preferences have been saved. Let's start your fitness journey!",
      [{ text: 'Continue', onPress: onComplete }],
    );
  };

  const currentStepData = steps[currentStep];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.activeDot,
              ]}
            />
          ))}
        </View>
        <Text style={styles.stepCounter}>
          {currentStep + 1} of {steps.length}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{currentStepData.title}</Text>
        <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>

        {currentStepData.content}
      </View>

      <View style={styles.footer}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextButton, currentStep === 0 && { flex: 1 }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === steps.length - 1 ? 'Get Started!' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#10b981',
  },
  stepCounter: {
    fontSize: 12,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  featureList: {
    alignItems: 'flex-start',
  },
  featureItem: {
    fontSize: 16,
    color: '#10b981',
    marginBottom: 8,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  selectedOption: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  selectedText: {
    color: '#10b981',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    minWidth: '45%',
    alignItems: 'center',
  },
  gridText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

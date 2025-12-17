import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import GymSelection from './GymSelection';
import { Gym } from '../types';

interface OnboardingFlowProps {
  visible: boolean;
  onComplete: (gym: Gym, userType: 'existing' | 'looking') => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  visible,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<'choice' | 'gymSelection'>(
    'choice',
  );
  const [userChoice, setUserChoice] = useState<'existing' | 'looking' | null>(
    null,
  );
  const [showGymSelection, setShowGymSelection] = useState(false);

  const handleUserChoice = (choice: 'existing' | 'looking') => {
    setUserChoice(choice);
    setShowGymSelection(true);
    setCurrentStep('gymSelection');
  };

  const handleGymSelected = (gym: Gym) => {
    if (userChoice) {
      onComplete(gym, userChoice);
    }
    setShowGymSelection(false);
    setCurrentStep('choice');
    setUserChoice(null);
  };

  const handleBackToChoice = () => {
    setShowGymSelection(false);
    setCurrentStep('choice');
    setUserChoice(null);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        {currentStep === 'choice' && (
          <View style={styles.choiceContainer}>
            <View style={styles.header}>
              <Text style={styles.logo}>💪 GYMEZ</Text>
              <Text style={styles.welcomeTitle}>Welcome to the Community!</Text>
              <Text style={styles.welcomeSubtitle}>
                Let's get you connected with the right gym to start your fitness
                journey
              </Text>
            </View>

            <View style={styles.choicesContainer}>
              <TouchableOpacity
                style={styles.choiceCard}
                onPress={() => handleUserChoice('existing')}
              >
                <View style={styles.choiceIcon}>
                  <Text style={styles.choiceEmoji}>🏋️‍♀️</Text>
                </View>
                <Text style={styles.choiceTitle}>I go to a gym</Text>
                <Text style={styles.choiceDescription}>
                  I'm already a member at a gym and want to connect with my gym
                  community
                </Text>
                <View style={styles.choiceButton}>
                  <Text style={styles.choiceButtonText}>Find My Gym</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.choiceCard}
                onPress={() => handleUserChoice('looking')}
              >
                <View style={styles.choiceIcon}>
                  <Text style={styles.choiceEmoji}>🔍</Text>
                </View>
                <Text style={styles.choiceTitle}>I'm looking for a gym</Text>
                <Text style={styles.choiceDescription}>
                  Help me discover gyms in my area and find the perfect fitness
                  community
                </Text>
                <View style={styles.choiceButton}>
                  <Text style={styles.choiceButtonText}>Discover Gyms</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                🌟 Join thousands of fitness enthusiasts tracking PRs and
                sharing their journey
              </Text>
            </View>
          </View>
        )}

        <GymSelection
          visible={showGymSelection}
          onClose={handleBackToChoice}
          onGymSelected={handleGymSelected}
          isLookingForGym={userChoice === 'looking'}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  choiceContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2563eb',
    padding: 30,
    paddingTop: 60,
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
    lineHeight: 24,
  },
  choicesContainer: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    gap: 20,
  },
  choiceCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  choiceIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  choiceEmoji: {
    fontSize: 32,
  },
  choiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  choiceDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  choiceButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  choiceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default OnboardingFlow;

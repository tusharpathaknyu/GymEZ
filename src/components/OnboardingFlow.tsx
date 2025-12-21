import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import GymSelection from './GymSelection';
import { Gym } from '../types';

const { width } = Dimensions.get('window');

interface OnboardingFlowProps {
  visible: boolean;
  onComplete: (gym: Gym, userType: 'existing' | 'looking') => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  visible,
  onComplete,
}) => {
  const [showGymSelection, setShowGymSelection] = useState(false);
  const [userChoice, setUserChoice] = useState<'existing' | 'looking'>('existing');

  const handleUserChoice = (choice: 'existing' | 'looking') => {
    setUserChoice(choice);
    setShowGymSelection(true);
  };

  const handleGymSelected = (gym: Gym) => {
    setShowGymSelection(false);
    // Small delay to ensure modal closes smoothly
    setTimeout(() => {
      onComplete(gym, userChoice);
    }, 100);
  };

  const handleBackToChoice = () => {
    setShowGymSelection(false);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      <SafeAreaView style={styles.container}>
        {!showGymSelection ? (
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.logo}>🏋️ GYMEZ</Text>
              <Text style={styles.title}>Almost There!</Text>
              <Text style={styles.subtitle}>
                Let's connect you with your gym community
              </Text>
            </View>

            {/* Choice Cards */}
            <View style={styles.cardsContainer}>
              <TouchableOpacity
                style={styles.choiceCard}
                onPress={() => handleUserChoice('existing')}
                activeOpacity={0.9}
              >
                <View style={styles.cardIcon}>
                  <Text style={styles.cardEmoji}>🏋️‍♂️</Text>
                </View>
                <Text style={styles.cardTitle}>I Have a Gym</Text>
                <Text style={styles.cardDesc}>
                  Find and join your current gym's community
                </Text>
                <View style={styles.cardButton}>
                  <Text style={styles.cardButtonText}>Find My Gym →</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.choiceCard}
                onPress={() => handleUserChoice('looking')}
                activeOpacity={0.9}
              >
                <View style={[styles.cardIcon, styles.cardIconAlt]}>
                  <Text style={styles.cardEmoji}>🔍</Text>
                </View>
                <Text style={styles.cardTitle}>Looking for a Gym</Text>
                <Text style={styles.cardDesc}>
                  Discover gyms in your area and find the perfect fit
                </Text>
                <View style={[styles.cardButton, styles.cardButtonAlt]}>
                  <Text style={[styles.cardButtonText, styles.cardButtonTextAlt]}>
                    Explore Gyms →
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                🌟 Join 10,000+ fitness enthusiasts tracking PRs
              </Text>
            </View>
          </View>
        ) : (
          <GymSelection
            visible={true}
            onClose={handleBackToChoice}
            onGymSelected={handleGymSelected}
            isLookingForGym={userChoice === 'looking'}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#059669',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  cardsContainer: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 32,
    gap: 16,
  },
  choiceCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardIconAlt: {
    backgroundColor: '#EFF6FF',
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  cardButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  cardButtonAlt: {
    backgroundColor: '#EFF6FF',
  },
  cardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardButtonTextAlt: {
    color: '#2563EB',
  },
  footer: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});

export default OnboardingFlow;

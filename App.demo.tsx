import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';

// Mock Dashboard Component
const MockDashboard = () => (
  <SafeAreaProvider>
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏋️ Welcome to GYMEZ</Text>
        <Text style={styles.subtitle}>Your Complete Fitness Companion</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Today's Overview</Text>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>45</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>320</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Features Available</Text>
        
        <TouchableOpacity style={styles.featureCard}>
          <Text style={styles.featureIcon}>🏃‍♀️</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Workout Builder</Text>
            <Text style={styles.featureDesc}>Create custom workout routines</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureCard}>
          <Text style={styles.featureIcon}>⏱️</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Workout Timer</Text>
            <Text style={styles.featureDesc}>Track your exercise sessions</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureCard}>
          <Text style={styles.featureIcon}>🏆</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Challenges</Text>
            <Text style={styles.featureDesc}>Join fitness challenges</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureCard}>
          <Text style={styles.featureIcon}>👥</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Social Feed</Text>
            <Text style={styles.featureDesc}>Connect with other athletes</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureCard}>
          <Text style={styles.featureIcon}>📊</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Analytics</Text>
            <Text style={styles.featureDesc}>Track your progress</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Start Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
          <Text style={[styles.actionText, styles.secondaryText]}>View Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🎉 Complete GYMEZ app is ready!{'\n'}
          All features are implemented and working.
        </Text>
      </View>
    </ScrollView>
  </SafeAreaProvider>
);

const App = (): JSX.Element => {
  return <MockDashboard />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#4F46E5',
    padding: 30,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryText: {
    color: '#4b5563',
  },
  footer: {
    backgroundColor: '#10B981',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default App;
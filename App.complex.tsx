import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView} from 'react-native';

const TestApp = (): JSX.Element => {
  return (
    <SafeAreaView style={styles.container}>
        <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>🏋️ GYMEZ</Text>
            <Text style={styles.subtitle}>Fitness App Test</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎉 App is Working!</Text>
            <Text style={styles.description}>
              Your GYMEZ app is successfully running. This is a test version to verify the basic setup.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚀 Features Ready</Text>
            <Text style={styles.featureText}>✅ React Native Setup</Text>
            <Text style={styles.featureText}>✅ Metro Bundler</Text>
            <Text style={styles.featureText}>✅ Expo Development</Text>
            <Text style={styles.featureText}>✅ TypeScript Support</Text>
            <Text style={styles.featureText}>⏳ Supabase Integration (Needs Setup)</Text>
          </View>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Test Button Works!</Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Next Steps</Text>
            <Text style={styles.stepText}>1. Set up Supabase credentials in .env file</Text>
            <Text style={styles.stepText}>2. Configure Google Sign-in</Text>
            <Text style={styles.stepText}>3. Enable full authentication</Text>
          </View>
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4F46E5',
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
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
    color: '#374151',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#10B981',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TestApp;
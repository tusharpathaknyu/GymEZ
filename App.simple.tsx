import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const App = (): JSX.Element => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏋️ GYMEZ</Text>
      <Text style={styles.subtitle}>App is Working!</Text>
      <Text style={styles.description}>
        If you can see this, your React Native setup is working correctly.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default App;
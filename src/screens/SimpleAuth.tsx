import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

interface SimpleAuthProps {
  onNavigateToApp: () => void;
}

export const SimpleAuth: React.FC<SimpleAuthProps> = ({ onNavigateToApp }) => {
  const [loading, setLoading] = useState(false);

  const handleTestLogin = () => {
    Alert.alert('Test', 'Login button works!', [
      { text: 'Go to App', onPress: onNavigateToApp },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const handleTestSignup = () => {
    Alert.alert('Test', 'Signup button works!', [
      { text: 'Go to App', onPress: onNavigateToApp },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const handleTestGoogle = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Google Sign-In works! (Mock)', [
        { text: 'Go to App', onPress: onNavigateToApp },
        { text: 'Cancel', style: 'cancel' }
      ]);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GYMEZ</Text>
      <Text style={styles.subtitle}>Test Authentication</Text>

      <TouchableOpacity 
        style={[styles.button, styles.loginButton]} 
        onPress={handleTestLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Test Login</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.signupButton]} 
        onPress={handleTestSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Test Signup</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.googleButton]} 
        onPress={handleTestGoogle}
        disabled={loading}
      >
        <Text style={styles.googleButtonText}>
          {loading ? 'Signing in...' : '🔗 Test Google Sign-In'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.skipButton]} 
        onPress={onNavigateToApp}
      >
        <Text style={styles.skipButtonText}>Skip to App</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#10b981',
  },
  signupButton: {
    backgroundColor: '#3b82f6',
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  skipButton: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SimpleAuth;
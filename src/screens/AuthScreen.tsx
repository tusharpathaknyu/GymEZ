import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import GoogleAuthService from '../services/GoogleAuthService';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';

interface AuthScreenProps {
  onNavigateToApp: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onNavigateToApp }) => {
  const { login, signup, state } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      Alert.alert('Validation Error', 'Email is required');
      return false;
    }

    if (!validateEmail(formData.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }

    if (!formData.password.trim()) {
      Alert.alert('Validation Error', 'Password is required');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert(
        'Validation Error',
        'Password must be at least 6 characters long',
      );
      return false;
    }

    if (!isLogin) {
      if (!formData.fullName.trim()) {
        Alert.alert('Validation Error', 'Full name is required');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Validation Error', 'Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        if (!state.error) {
          Alert.alert('Success!', 'Login successful! Welcome back to GYMEZ.', [
            { text: 'OK', onPress: onNavigateToApp },
          ]);
        }
      } else {
        await signup(
          formData.email,
          formData.password,
          formData.fullName,
          'gym_member',
        );
        if (!state.error) {
          Alert.alert(
            'Success!',
            'Account created successfully! Welcome to GYMEZ.',
            [{ text: 'OK', onPress: onNavigateToApp }],
          );
        }
      }
    } catch (error) {
      Alert.alert(
        'Error',
        state.error || 'Authentication failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      confirmPassword: '',
    });
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const googleAuth = GoogleAuthService.getInstance();
      await googleAuth.configure();
      const { user, error } = await googleAuth.signIn();

      if (error) {
        Alert.alert('Google Sign-In Error', error);
        return;
      }

      if (user) {
        // Create a local user from Google user data
        await signup(
          user.email,
          'google_password_' + user.id,
          user.name,
          'gym_member',
        );
        Alert.alert('Success!', 'Signed in with Google successfully!', [
          { text: 'OK', onPress: onNavigateToApp },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.logo}>GYMEZ</Text>
          <Text style={styles.tagline}>
            {isLogin ? 'Welcome back!' : 'Join the fitness community'}
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </Text>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={text =>
                  setFormData({ ...formData, fullName: text })
                }
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={text => setFormData({ ...formData, email: text })}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={text =>
                setFormData({ ...formData, password: text })
              }
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              autoComplete="password"
            />
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={text =>
                  setFormData({ ...formData, confirmPassword: text })
                }
                placeholder="Confirm your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
              />
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading
                ? 'Please wait...'
                : isLogin
                ? 'Sign In'
                : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Google Sign-In Button */}
          <View style={styles.googleButtonContainer}>
            <GoogleSigninButton
              style={styles.googleSigninButton}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Light}
              onPress={handleGoogleSignIn}
              disabled={loading}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </Text>
            <TouchableOpacity onPress={switchMode}>
              <Text style={styles.switchLink}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>

          {isLogin && (
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.skipButton} onPress={onNavigateToApp}>
          <Text style={styles.skipButtonText}>Skip for now →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10b981',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#1E293B',
  },
  userTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  userTypeOption: {
    flex: 1,
    padding: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  userTypeSelected: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  userTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  userTypeTextSelected: {
    color: '#10b981',
  },
  submitButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  googleButtonContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  googleSigninButton: {
    width: '100%',
    height: 48,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 4,
  },
  switchText: {
    fontSize: 14,
    color: '#6b7280',
  },
  switchLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#6b7280',
    textDecorationLine: 'underline',
  },
  skipButton: {
    alignItems: 'center',
    padding: 16,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});

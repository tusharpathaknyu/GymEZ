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

interface AuthScreenProps {
  onLoginSuccess: (user: any) => void;
  onNavigateToApp: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ 
  onLoginSuccess, 
  onNavigateToApp 
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
    userType: 'gym_member' as 'gym_member' | 'gym_owner',
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
      Alert.alert('Validation Error', 'Password must be at least 6 characters long');
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
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (isLogin) {
        // Mock login success
        const mockUser = {
          id: 'user_123',
          email: formData.email,
          full_name: 'Demo User',
          user_type: 'gym_member',
          is_private: false,
        };
        
        Alert.alert(
          'Success!', 
          'Login successful! Welcome back to GYMEZ.',
          [{ text: 'Continue', onPress: () => onLoginSuccess(mockUser) }]
        );
      } else {
        // Mock signup success
        Alert.alert(
          'Success!', 
          'Account created successfully! Welcome to GYMEZ.',
          [{ text: 'Continue', onPress: () => {
            const mockUser = {
              id: 'user_' + Date.now(),
              email: formData.email,
              full_name: formData.fullName,
              user_type: formData.userType,
              is_private: false,
            };
            onLoginSuccess(mockUser);
          }}]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Authentication failed. Please try again.');
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
      userType: 'gym_member',
    });
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
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
                onChangeText={(text) => setFormData({...formData, fullName: text})}
                placeholder="Enter your full name"
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              placeholder="Enter your email"
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
              onChangeText={(text) => setFormData({...formData, password: text})}
              placeholder="Enter your password"
              secureTextEntry
              autoComplete="password"
            />
          </View>

          {!isLogin && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
                  placeholder="Confirm your password"
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>I am a:</Text>
                <View style={styles.userTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.userTypeOption,
                      formData.userType === 'gym_member' && styles.userTypeSelected
                    ]}
                    onPress={() => setFormData({...formData, userType: 'gym_member'})}
                  >
                    <Text style={[
                      styles.userTypeText,
                      formData.userType === 'gym_member' && styles.userTypeTextSelected
                    ]}>
                      Gym Member
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.userTypeOption,
                      formData.userType === 'gym_owner' && styles.userTypeSelected
                    ]}
                    onPress={() => setFormData({...formData, userType: 'gym_owner'})}
                  >
                    <Text style={[
                      styles.userTypeText,
                      formData.userType === 'gym_owner' && styles.userTypeTextSelected
                    ]}>
                      Gym Owner
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Text>
          </TouchableOpacity>

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

        <TouchableOpacity
          style={styles.skipButton}
          onPress={onNavigateToApp}
        >
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
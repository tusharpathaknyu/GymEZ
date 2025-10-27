import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useAuth} from '../services/auth';
import {UserType, Gym} from '../types';
import OnboardingFlow from '../components/OnboardingFlow';
import {GoogleSigninButton} from '@react-native-google-signin/google-signin';

const LoginScreen = ({navigation}: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState<UserType>('gym_member');
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingUserData, setPendingUserData] = useState<{
    email: string;
    password: string;
    fullName: string;
  } | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const {signIn, signUp, signInWithGoogle, resetPassword} = useAuth();

  const handleOnboardingComplete = async (gym: Gym, userChoice: 'existing' | 'looking') => {
    if (!pendingUserData) return;

    setLoading(true);
    try {
      // Create account with selected gym
      await signUp(
        pendingUserData.email, 
        pendingUserData.password, 
        pendingUserData.fullName, 
        'gym_member',
        gym.id
      );
      
      Alert.alert(
        'Welcome to GYMEZ!', 
        `Successfully joined ${gym.name}. Please check your email for verification.`
      );
      
      // Reset states
      setShowOnboarding(false);
      setPendingUserData(null);
      setEmail('');
      setPassword('');
      setFullName('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (isSignUp) {
      if (!fullName) {
        Alert.alert('Error', 'Please enter your full name');
        return;
      }

      if (!validatePassword(password)) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        if (userType === 'gym_member') {
          // For gym members, show gym selection first
          setPendingUserData({email, password, fullName});
          setShowOnboarding(true);
          setLoading(false);
          return;
        } else {
          // For gym owners, create account directly
          await signUp(email, password, fullName, userType);
          Alert.alert('Success', 'Account created successfully! Please check your email for verification.');
        }
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      Alert.alert('Success', 'Signed in with Google successfully!');
    } catch (error: any) {
      Alert.alert('Google Sign-In Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setResetEmailSent(true);
      Alert.alert(
        'Reset Email Sent',
        'Please check your email for password reset instructions.'
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email to receive reset instructions
            </Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleForgotPassword}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send Reset Email</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => setShowForgotPassword(false)}>
              <Text style={styles.linkText}>← Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>🏋️‍♂️ GYMEZ</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Join the Fitness Community' : 'Welcome Back'}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {isSignUp && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />

              <View style={styles.userTypeContainer}>
                <Text style={styles.label}>I am a:</Text>
                <View style={styles.userTypeButtons}>
                  <TouchableOpacity
                    style={[
                      styles.userTypeButton,
                      userType === 'gym_member' && styles.selectedUserType,
                    ]}
                    onPress={() => setUserType('gym_member')}>
                    <Text
                      style={[
                        styles.userTypeText,
                        userType === 'gym_member' && styles.selectedUserTypeText,
                      ]}>
                      💪 Gym Member
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.userTypeButton,
                      userType === 'gym_owner' && styles.selectedUserType,
                    ]}
                    onPress={() => setUserType('gym_owner')}>
                    <Text
                      style={[
                        styles.userTypeText,
                        userType === 'gym_owner' && styles.selectedUserTypeText,
                      ]}>
                      🏢 Gym Owner
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setPasswordVisible(!passwordVisible)}>
              <Text style={styles.passwordToggleText}>
                {passwordVisible ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>

          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!passwordVisible}
            />
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isSignUp ? '🚀 Create Account' : '🔐 Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          {!isSignUp && (
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => setShowForgotPassword(true)}>
              <Text style={styles.linkText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <GoogleSigninButton
            style={styles.googleButton}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={handleGoogleSignIn}
            disabled={loading}
          />

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              setIsSignUp(!isSignUp);
              setShowForgotPassword(false);
              setResetEmailSent(false);
            }}>
            <Text style={styles.switchText}>
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>

        <OnboardingFlow
          visible={showOnboarding}
          onComplete={handleOnboardingComplete}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#059669',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 10,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  passwordInput: {
    marginBottom: 0,
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  passwordToggleText: {
    fontSize: 20,
  },
  userTypeContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 12,
    color: '#374151',
    fontWeight: '600',
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  selectedUserType: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  userTypeText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  selectedUserTypeText: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#059669',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  googleButton: {
    width: '100%',
    height: 48,
    marginBottom: 16,
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  switchText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LoginScreen;
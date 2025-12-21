import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/services/auth';
import { ToastProvider } from './src/components/Toast';
import AppNavigator from './src/navigation/AppNavigator';
import GoogleAuthService from './src/services/GoogleAuthService';

// Ignore specific harmless warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Sending `onAnimatedValueUpdate` with no listeners registered',
]);

function App(): React.JSX.Element {
  // Initialize Google Sign-In when app starts
  useEffect(() => {
    const initializeGoogleSignIn = async () => {
      try {
        const googleAuth = GoogleAuthService.getInstance();
        await googleAuth.configure();
        console.log('Google Sign-In initialized successfully');
      } catch (error) {
        console.error('Google Sign-In initialization failed:', error);
      }
    };

    initializeGoogleSignIn();
  }, []);

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

export default App;

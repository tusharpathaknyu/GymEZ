import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import GymOwnerDashboard from '../screens/GymOwnerDashboard';
import GymMemberDashboard from '../screens/GymMemberDashboard';
import {useAuth} from '../services/auth';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';

const Stack = createStackNavigator();

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#2563eb" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

const AppNavigator = () => {
  const {user, loading} = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {user ? (
        user.user_type === 'gym_owner' ? (
          <Stack.Screen name="GymOwnerDashboard" component={GymOwnerDashboard} />
        ) : (
          <Stack.Screen name="GymMemberDashboard" component={GymMemberDashboard} />
        )
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
});

export default AppNavigator;
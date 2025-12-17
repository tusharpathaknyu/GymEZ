import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from '../screens/LoginScreen';
import GymOwnerDashboard from '../screens/GymOwnerDashboard';
import HomeScreen from '../screens/HomeScreen';
import SocialScreen from '../screens/SocialScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyGymScreen from '../screens/MyGymScreen';
import RewardsScreen from '../screens/RewardsScreen';
import { useAuth } from '../services/auth';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#10b981" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

const MemberTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color: _color, size: _size }) => {
        let iconName = '';

        if (route.name === 'Home') {
          iconName = focused ? '🏠' : '🏡';
        } else if (route.name === 'Rewards') {
          iconName = focused ? '🏆' : '🎖️';
        } else if (route.name === 'MyGym') {
          iconName = focused ? '🏋️' : '💪';
        } else if (route.name === 'Social') {
          iconName = focused ? '📱' : '📲';
        } else if (route.name === 'Profile') {
          iconName = focused ? '👤' : '🙋';
        }

        return <Text style={{ fontSize: 22 }}>{iconName}</Text>;
      },
      tabBarActiveTintColor: '#10b981',
      tabBarInactiveTintColor: '#9ca3af',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
      },
      headerShown: false,
    })}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{ tabBarLabel: 'Home' }}
    />
    <Tab.Screen
      name="Rewards"
      component={RewardsScreen}
      options={{ tabBarLabel: 'Rewards' }}
    />
    <Tab.Screen
      name="MyGym"
      component={MyGymScreen}
      options={{ tabBarLabel: 'My Gym' }}
    />
    <Tab.Screen
      name="Social"
      component={SocialScreen}
      options={{ tabBarLabel: 'Social' }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ tabBarLabel: 'Profile' }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        user.user_type === 'gym_owner' ? (
          <Stack.Screen
            name="GymOwnerDashboard"
            component={GymOwnerDashboard}
          />
        ) : (
          <Stack.Screen name="MemberTabs" component={MemberTabs} />
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
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
});

export default AppNavigator;

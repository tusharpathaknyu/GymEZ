import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/GymOwner/DashboardScreen';
import MembersScreen from '../screens/GymOwner/MembersScreen';
import FacilitiesScreen from '../screens/GymOwner/FacilitiesScreen';

const Tab = createBottomTabNavigator();

const GymOwnerNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Members"
        component={MembersScreen}
        options={{
          tabBarLabel: 'Members',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>👥</Text>,
        }}
      />
      <Tab.Screen
        name="Facilities"
        component={FacilitiesScreen}
        options={{
          tabBarLabel: 'Facilities',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>🏋️</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

// Import Text component
import {Text} from 'react-native';

export default GymOwnerNavigator;

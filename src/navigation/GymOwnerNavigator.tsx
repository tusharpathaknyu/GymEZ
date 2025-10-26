import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/GymOwner/DashboardScreen';
import MembersScreen from '../screens/GymOwner/MembersScreen';
import FacilitiesScreen from '../screens/GymOwner/FacilitiesScreen';
import {Text} from 'react-native';

const Tab = createBottomTabNavigator();

const iconStyle = {fontSize: 24};

const DashboardIcon = () => <Text style={iconStyle}>📊</Text>;
const MembersIcon = () => <Text style={iconStyle}>👥</Text>;
const FacilitiesIcon = () => <Text style={iconStyle}>🏋️</Text>;

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
          tabBarIcon: DashboardIcon,
        }}
      />
      <Tab.Screen
        name="Members"
        component={MembersScreen}
        options={{
          tabBarLabel: 'Members',
          tabBarIcon: MembersIcon,
        }}
      />
      <Tab.Screen
        name="Facilities"
        component={FacilitiesScreen}
        options={{
          tabBarLabel: 'Facilities',
          tabBarIcon: FacilitiesIcon,
        }}
      />
    </Tab.Navigator>
  );
};

export default GymOwnerNavigator;

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/GymMember/DashboardScreen';
import BrowseGymsScreen from '../screens/GymMember/BrowseGymsScreen';
import MyMembershipsScreen from '../screens/GymMember/MyMembershipsScreen';
import {Text} from 'react-native';

const Tab = createBottomTabNavigator();

const GymMemberNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#50C878',
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
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="BrowseGyms"
        component={BrowseGymsScreen}
        options={{
          tabBarLabel: 'Browse',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>🔍</Text>,
        }}
      />
      <Tab.Screen
        name="MyMemberships"
        component={MyMembershipsScreen}
        options={{
          tabBarLabel: 'Memberships',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>💳</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export default GymMemberNavigator;

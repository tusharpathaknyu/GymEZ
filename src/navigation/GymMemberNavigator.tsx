import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/GymMember/DashboardScreen';
import BrowseGymsScreen from '../screens/GymMember/BrowseGymsScreen';
import MyMembershipsScreen from '../screens/GymMember/MyMembershipsScreen';
import {Text} from 'react-native';

const Tab = createBottomTabNavigator();

const iconStyle = {fontSize: 24};

const DashboardIcon = () => <Text style={iconStyle}>🏠</Text>;
const BrowseIcon = () => <Text style={iconStyle}>🔍</Text>;
const MembershipsIcon = () => <Text style={iconStyle}>💳</Text>;

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
          tabBarIcon: DashboardIcon,
        }}
      />
      <Tab.Screen
        name="BrowseGyms"
        component={BrowseGymsScreen}
        options={{
          tabBarLabel: 'Browse',
          tabBarIcon: BrowseIcon,
        }}
      />
      <Tab.Screen
        name="MyMemberships"
        component={MyMembershipsScreen}
        options={{
          tabBarLabel: 'Memberships',
          tabBarIcon: MembershipsIcon,
        }}
      />
    </Tab.Navigator>
  );
};

export default GymMemberNavigator;

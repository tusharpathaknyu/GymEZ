import React, {useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import RoleSelectionScreen from './screens/RoleSelectionScreen';
import GymOwnerNavigator from './navigation/GymOwnerNavigator';
import GymMemberNavigator from './navigation/GymMemberNavigator';
import {UserRole} from './types';

const Stack = createStackNavigator();

const App = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!userRole ? (
          <Stack.Screen name="RoleSelection">
            {props => (
              <RoleSelectionScreen {...props} onRoleSelect={handleRoleSelect} />
            )}
          </Stack.Screen>
        ) : userRole === 'gym_owner' ? (
          <Stack.Screen name="GymOwner" component={GymOwnerNavigator} />
        ) : (
          <Stack.Screen name="GymMember" component={GymMemberNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

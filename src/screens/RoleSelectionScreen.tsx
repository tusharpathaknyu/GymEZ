import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {UserRole} from '../types';

interface RoleSelectionScreenProps {
  onRoleSelect: (role: UserRole) => void;
}

const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({
  onRoleSelect,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to GymEZ</Text>
        <Text style={styles.subtitle}>Select your role to continue</Text>

        <TouchableOpacity
          style={[styles.roleCard, styles.ownerCard]}
          onPress={() => onRoleSelect('gym_owner')}>
          <Text style={styles.roleIcon}>🏋️</Text>
          <Text style={styles.roleTitle}>Gym Owner</Text>
          <Text style={styles.roleDescription}>
            Manage your gym, members, and facilities
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleCard, styles.memberCard]}
          onPress={() => onRoleSelect('gym_member')}>
          <Text style={styles.roleIcon}>💪</Text>
          <Text style={styles.roleTitle}>Gym Member</Text>
          <Text style={styles.roleDescription}>
            Find gyms, manage memberships, and track progress
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  roleCard: {
    width: '100%',
    padding: 30,
    borderRadius: 15,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ownerCard: {
    backgroundColor: '#4A90E2',
  },
  memberCard: {
    backgroundColor: '#50C878',
  },
  roleIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  roleDescription: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
});

export default RoleSelectionScreen;

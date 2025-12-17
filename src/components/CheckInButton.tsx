import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { checkInService } from '../services/CheckInService';
import { useAuth } from '../services/auth';

interface CheckInButtonProps {
  gymId?: string;
  onCheckInSuccess?: () => void;
  onCheckOutSuccess?: () => void;
}

const CheckInButton: React.FC<CheckInButtonProps> = ({
  gymId,
  onCheckInSuccess,
  onCheckOutSuccess,
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasActiveCheckIn, setHasActiveCheckIn] = useState(false);
  const [activeCheckIn, setActiveCheckIn] = useState<any>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const checkActiveStatus = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    const active = await checkInService.getActiveCheckIn(user.id);
    setHasActiveCheckIn(!!active);
    setActiveCheckIn(active);

    if (active) {
      const checkInTime = new Date(active.check_in_time);
      const elapsed = Math.floor((Date.now() - checkInTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    }
  }, [user?.id]);

  useEffect(() => {
    checkActiveStatus();
  }, [checkActiveStatus]);

  // Update elapsed time every second when checked in
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (hasActiveCheckIn) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [hasActiveCheckIn]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const handleCheckIn = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please log in to check in');
      return;
    }

    setIsLoading(true);
    const result = await checkInService.checkIn(user.id, gymId);
    setIsLoading(false);

    if (result.success) {
      setHasActiveCheckIn(true);
      setElapsedTime(0);
      await checkActiveStatus();
      onCheckInSuccess?.();
      Alert.alert('Success! 💪', result.message);
    } else {
      Alert.alert('Check-in Failed', result.message);
    }
  };

  const handleCheckOut = async () => {
    if (!user?.id) {
      return;
    }

    Alert.alert('Check Out', 'Are you sure you want to check out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Check Out',
        onPress: async () => {
          setIsLoading(true);
          const result = await checkInService.checkOut(user.id);
          setIsLoading(false);

          if (result.success) {
            setHasActiveCheckIn(false);
            setActiveCheckIn(null);
            setElapsedTime(0);
            onCheckOutSuccess?.();

            if (result.isVerified) {
              Alert.alert('Workout Complete! 🎉', result.message);
            } else {
              Alert.alert('Checked Out', result.message);
            }
          } else {
            Alert.alert('Check-out Failed', result.message);
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.button, styles.loadingButton]}>
          <ActivityIndicator color="#fff" />
        </View>
      </View>
    );
  }

  if (hasActiveCheckIn) {
    return (
      <View style={styles.container}>
        <View style={styles.activeSession}>
          <Text style={styles.activeLabel}>🏋️ Workout in Progress</Text>
          {activeCheckIn?.gyms?.name && (
            <Text style={styles.gymName}>{activeCheckIn.gyms.name}</Text>
          )}
          <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
          <Text style={styles.hint}>
            {elapsedTime < 1800
              ? `${Math.ceil(
                  (1800 - elapsedTime) / 60,
                )} min until reward eligible`
              : '✓ Reward eligible!'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.button, styles.checkOutButton]}
          onPress={handleCheckOut}
        >
          <Text style={styles.buttonText}>Check Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.checkInButton]}
        onPress={handleCheckIn}
      >
        <Text style={styles.buttonText}>📍 Check In at Gym</Text>
      </TouchableOpacity>
      <Text style={styles.subtext}>Must be within 100m of your gym</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    minWidth: 200,
    alignItems: 'center',
  },
  checkInButton: {
    backgroundColor: '#4CAF50',
  },
  checkOutButton: {
    backgroundColor: '#f44336',
  },
  loadingButton: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtext: {
    marginTop: 8,
    color: '#666',
    fontSize: 12,
  },
  activeSession: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  activeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  gymName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  timer: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginVertical: 8,
  },
  hint: {
    fontSize: 12,
    color: '#666',
  },
});

export default CheckInButton;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { GymService } from '../services/gymService';
import { Gym } from '../types';
import { useAuth } from '../services/auth';
import nycGyms from '../data/nycGyms';

interface GymSelectionProps {
  visible: boolean;
  onClose: () => void;
  onGymSelected: (gym: Gym) => void;
  isLookingForGym?: boolean; // true if user is looking for gym, false if they already go to one
}

const GymSelection: React.FC<GymSelectionProps> = ({
  visible,
  onClose,
  onGymSelected,
  isLookingForGym = true,
}) => {
  const { user } = useAuth();
  const [pincode, setPincode] = useState('');
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [showNYCGyms, setShowNYCGyms] = useState(true);

  useEffect(() => {
    // Load NYC gyms by default
    if (visible && showNYCGyms) {
      setGyms(nycGyms as any[]);
      setHasSearched(true);
    }
  }, [visible, showNYCGyms]);

  const searchGyms = async () => {
    if (!pincode.trim() && !searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a pincode or search term');
      return;
    }

    setLoading(true);
    try {
      let results: Gym[] = [];

      if (pincode.trim()) {
        results = await GymService.getNearbyGyms(pincode.trim());
      } else if (searchQuery.trim()) {
        results = await GymService.searchGyms(searchQuery.trim());
      }

      // Get member counts for each gym
      const gymsWithCounts = await Promise.all(
        results.map(async gym => {
          const memberCount = await GymService.getGymMemberCount(gym.id);
          return { ...gym, memberCount };
        }),
      );

      setGyms(gymsWithCounts);
      setHasSearched(true);
      setShowNYCGyms(false);
    } catch (error) {
      console.error('Error searching gyms:', error);
      Alert.alert('Error', 'Failed to search gyms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGym = async (gym: Gym) => {
    try {
      if (user?.id) {
        await GymService.joinGym(user.id, gym.id);
      }
      onGymSelected(gym);
    } catch (error) {
      console.error('Error joining gym:', error);
      Alert.alert('Error', 'Failed to join gym. Please try again.');
    }
  };

  const renderGymItem = ({
    item: gym,
  }: {
    item: Gym & { memberCount?: number };
  }) => (
    <TouchableOpacity
      style={styles.gymCard}
      onPress={() => handleSelectGym(gym)}
    >
      <View style={styles.gymHeader}>
        <Text style={styles.gymName}>{gym.name}</Text>
        {gym.distance !== undefined && (
          <Text style={styles.distance}>~{gym.distance} units away</Text>
        )}
      </View>

      <Text style={styles.gymAddress}>{gym.address}</Text>
      <Text style={styles.pincode}>📍 NYC - {gym.pincode}</Text>

      {gym.description && (
        <Text style={styles.description} numberOfLines={2}>
          {gym.description}
        </Text>
      )}

      <View style={styles.gymFooter}>
        <View style={styles.gymInfo}>
          {gym.memberCount !== undefined && (
            <Text style={styles.memberCount}>👥 {gym.memberCount} members</Text>
          )}
          {gym.membership_cost && (
            <Text style={styles.cost}>💰 ${gym.membership_cost}/month</Text>
          )}
        </View>

        {gym.facilities && gym.facilities.length > 0 && (
          <View style={styles.facilities}>
            {gym.facilities.slice(0, 3).map((facility, index) => (
              <Text key={index} style={styles.facility}>
                {facility}
              </Text>
            ))}
            {gym.facilities.length > 3 && (
              <Text style={styles.facility}>
                +{gym.facilities.length - 3} more
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.selectButton}>
        <Text style={styles.selectButtonText}>Select This Gym</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isLookingForGym
              ? 'Find Your Perfect Gym'
              : 'Find Your Current Gym'}
          </Text>
          <Text style={styles.subtitle}>
            {isLookingForGym
              ? 'Discover gyms in your area and join our fitness community'
              : 'Select the gym you currently attend'}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your pincode (e.g., 400001)"
              value={pincode}
              onChangeText={setPincode}
              keyboardType="numeric"
              maxLength={6}
            />
            <Text style={styles.orText}>OR</Text>
            <TextInput
              style={styles.input}
              placeholder="Search gym name or area"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.searchButton,
              loading && styles.searchButtonDisabled,
            ]}
            onPress={searchGyms}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.searchButtonText}>Find Gyms</Text>
            )}
          </TouchableOpacity>
        </View>

        {hasSearched && (
          <View style={styles.resultsSection}>
            {gyms.length === 0 ? (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>
                  No gyms found in this area
                </Text>
                <Text style={styles.noResultsSubtext}>
                  Try a different pincode or search term
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.resultsTitle}>
                  Found {gyms.length} gym{gyms.length !== 1 ? 's' : ''} near you
                </Text>
                <FlatList
                  data={gyms}
                  renderItem={renderGymItem}
                  keyExtractor={item => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.gymsList}
                />
              </>
            )}
          </View>
        )}

        {!hasSearched && (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              🏋️‍♀️ Enter your location to discover gyms in your area
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#2563eb',
    padding: 20,
    paddingTop: 50,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    lineHeight: 22,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    marginBottom: 10,
  },
  orText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
    marginVertical: 5,
  },
  searchButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsSection: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    padding: 20,
    paddingBottom: 10,
  },
  gymsList: {
    padding: 20,
    paddingTop: 0,
  },
  gymCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  gymHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gymName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  distance: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gymAddress: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  pincode: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  gymFooter: {
    marginBottom: 15,
  },
  gymInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  memberCount: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  cost: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
  },
  facilities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  facility: {
    fontSize: 11,
    color: '#4b5563',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noResults: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default GymSelection;

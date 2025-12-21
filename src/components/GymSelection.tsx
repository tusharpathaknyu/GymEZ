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
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { GymService } from '../services/gymService';
import { Gym } from '../types';
import { useAuth } from '../services/auth';
import nycGyms from '../data/nycGyms';

interface GymSelectionProps {
  visible: boolean;
  onClose: () => void;
  onGymSelected: (gym: Gym) => void;
  isLookingForGym?: boolean;
}

const GymSelection: React.FC<GymSelectionProps> = ({
  visible,
  onClose,
  onGymSelected,
  isLookingForGym = true,
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      // Load NYC gyms by default
      const loadedGyms = nycGyms as Gym[];
      setGyms(loadedGyms);
      setFilteredGyms(loadedGyms);
    }
  }, [visible]);

  useEffect(() => {
    // Filter gyms based on search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = gyms.filter(
        gym =>
          gym.name.toLowerCase().includes(query) ||
          gym.address?.toLowerCase().includes(query) ||
          gym.pincode?.includes(query)
      );
      setFilteredGyms(filtered);
    } else {
      setFilteredGyms(gyms);
    }
  }, [searchQuery, gyms]);

  const handleSelectGym = async (gym: Gym) => {
    setSelecting(gym.id);
    try {
      if (user?.id) {
        await GymService.joinGym(user.id, gym.id);
      }
      // Call the callback - this will trigger the signup completion
      onGymSelected(gym);
    } catch (error) {
      console.error('Error joining gym:', error);
      // Still proceed even if join fails - we can handle this later
      onGymSelected(gym);
    } finally {
      setSelecting(null);
    }
  };

  const searchOnlineGyms = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Search', 'Please enter a location or gym name to search');
      return;
    }

    setLoading(true);
    try {
      const results = await GymService.searchGyms(searchQuery.trim());
      if (results.length > 0) {
        setGyms(results);
        setFilteredGyms(results);
      } else {
        Alert.alert('No Results', 'No gyms found. Try a different search term.');
      }
    } catch (error) {
      console.error('Error searching gyms:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderGymItem = ({ item: gym }: { item: Gym }) => (
    <TouchableOpacity
      style={styles.gymCard}
      onPress={() => handleSelectGym(gym)}
      activeOpacity={0.9}
      disabled={selecting !== null}
    >
      <View style={styles.gymInfo}>
        <View style={styles.gymIconBox}>
          <Text style={styles.gymIcon}>🏋️</Text>
        </View>
        <View style={styles.gymDetails}>
          <Text style={styles.gymName} numberOfLines={1}>{gym.name}</Text>
          <Text style={styles.gymAddress} numberOfLines={1}>
            📍 {gym.address || 'NYC'}
          </Text>
          {gym.membership_cost && (
            <Text style={styles.gymPrice}>
              💰 ${gym.membership_cost}/month
            </Text>
          )}
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.selectBtn, selecting === gym.id && styles.selectingBtn]}
        onPress={() => handleSelectGym(gym)}
        disabled={selecting !== null}
      >
        {selecting === gym.id ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.selectBtnText}>Select</Text>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (!visible) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onClose}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isLookingForGym ? 'Find a Gym' : 'Select Your Gym'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {filteredGyms.length} gyms available
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, location, or zip..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={searchOnlineGyms}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      <View style={styles.resultsContainer}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.loadingText}>Searching gyms...</Text>
          </View>
        ) : filteredGyms.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🏋️</Text>
            <Text style={styles.emptyTitle}>No Gyms Found</Text>
            <Text style={styles.emptyText}>
              Try a different search term or browse all gyms
            </Text>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                setSearchQuery('');
                setFilteredGyms(gyms);
              }}
            >
              <Text style={styles.resetBtnText}>Show All Gyms</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredGyms}
            renderItem={renderGymItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#059669',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backBtn: {
    marginBottom: 16,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
  },
  searchContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    paddingVertical: 0,
  },
  clearBtn: {
    fontSize: 16,
    color: '#94A3B8',
    padding: 4,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  separator: {
    height: 12,
  },
  gymCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gymInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  gymIconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  gymIcon: {
    fontSize: 24,
  },
  gymDetails: {
    flex: 1,
  },
  gymName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  gymAddress: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  gymPrice: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
  },
  selectBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  selectingBtn: {
    backgroundColor: '#047857',
  },
  selectBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  resetBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  resetBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GymSelection;

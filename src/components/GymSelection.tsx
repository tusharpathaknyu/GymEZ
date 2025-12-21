import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { GymService } from '../services/gymService';
import { Gym } from '../types';
import { useAuth } from '../services/auth';
import nycGyms, { searchGyms, getGymsByCity, getNearbyGyms } from '../data/nycGyms';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GymSelectionProps {
  visible: boolean;
  onClose: () => void;
  onGymSelected: (gym: Gym) => void;
  isLookingForGym?: boolean;
}

type FilterType = 'all' | 'manhattan' | 'brooklyn' | 'queens' | 'bronx' | 'jersey' | 'budget' | 'premium';
type SortType = 'name' | 'price-low' | 'price-high' | 'rating';

const CITY_FILTERS: { key: FilterType; label: string; emoji: string }[] = [
  { key: 'all', label: 'All', emoji: '🗽' },
  { key: 'manhattan', label: 'Manhattan', emoji: '🏙️' },
  { key: 'brooklyn', label: 'Brooklyn', emoji: '🌉' },
  { key: 'queens', label: 'Queens', emoji: '🏘️' },
  { key: 'bronx', label: 'Bronx', emoji: '🦁' },
  { key: 'jersey', label: 'Jersey', emoji: '🌊' },
  { key: 'budget', label: 'Budget', emoji: '💰' },
  { key: 'premium', label: 'Premium', emoji: '⭐' },
];

const GymSelection: React.FC<GymSelectionProps> = ({
  visible,
  onClose,
  onGymSelected,
  isLookingForGym = true,
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('name');
  const [showSortOptions, setShowSortOptions] = useState(false);

  // Animation for filter chips
  const scrollX = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      // Load NYC gyms by default
      const loadedGyms = nycGyms as Gym[];
      setGyms(loadedGyms);
    }
  }, [visible]);

  // Memoized filtered and sorted gyms
  const filteredGyms = useMemo(() => {
    let result = [...gyms];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        gym =>
          gym.name.toLowerCase().includes(query) ||
          gym.address?.toLowerCase().includes(query) ||
          gym.pincode?.includes(query) ||
          gym.city?.toLowerCase().includes(query) ||
          gym.description?.toLowerCase().includes(query) ||
          gym.facilities?.some(f => f.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    switch (activeFilter) {
      case 'manhattan':
        result = result.filter(g => g.city?.toLowerCase() === 'new york' || g.city?.toLowerCase() === 'manhattan');
        break;
      case 'brooklyn':
        result = result.filter(g => g.city?.toLowerCase() === 'brooklyn');
        break;
      case 'queens':
        result = result.filter(g => g.city?.toLowerCase() === 'queens');
        break;
      case 'bronx':
        result = result.filter(g => g.city?.toLowerCase() === 'bronx');
        break;
      case 'jersey':
        result = result.filter(g => g.city?.toLowerCase() === 'jersey city' || g.city?.toLowerCase() === 'hoboken');
        break;
      case 'budget':
        result = result.filter(g => (g.membership_cost || 0) <= 50);
        break;
      case 'premium':
        result = result.filter(g => (g.membership_cost || 0) >= 150);
        break;
    }
    
    // Apply sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        result.sort((a, b) => (a.membership_cost || 0) - (b.membership_cost || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.membership_cost || 0) - (a.membership_cost || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }
    
    return result;
  }, [gyms, searchQuery, activeFilter, sortBy]);

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
      } else {
        Alert.alert('No Results', 'No gyms found. Try a different search term.');
      }
    } catch (error) {
      console.error('Error searching gyms:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriceTag = (price?: number) => {
    if (!price) return { label: 'N/A', color: '#94A3B8' };
    if (price <= 15) return { label: 'Budget', color: '#22C55E' };
    if (price <= 50) return { label: 'Value', color: '#3B82F6' };
    if (price <= 150) return { label: 'Mid-Range', color: '#F59E0B' };
    return { label: 'Premium', color: '#A855F7' };
  };

  const getRatingStars = (rating?: number) => {
    if (!rating) return '☆☆☆☆☆';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
  };

  const renderFilterChip = ({ key, label, emoji }: { key: FilterType; label: string; emoji: string }) => (
    <TouchableOpacity
      key={key}
      style={[
        styles.filterChip,
        activeFilter === key && styles.filterChipActive
      ]}
      onPress={() => setActiveFilter(key)}
    >
      <Text style={styles.filterEmoji}>{emoji}</Text>
      <Text style={[
        styles.filterLabel,
        activeFilter === key && styles.filterLabelActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderGymItem = ({ item: gym }: { item: Gym }) => {
    const priceTag = getPriceTag(gym.membership_cost);
    
    return (
      <TouchableOpacity
        style={styles.gymCard}
        onPress={() => handleSelectGym(gym)}
        activeOpacity={0.9}
        disabled={selecting !== null}
      >
        <View style={styles.gymHeader}>
          <View style={styles.gymIconBox}>
            <Text style={styles.gymIcon}>🏋️</Text>
          </View>
          <View style={styles.gymDetails}>
            <Text style={styles.gymName} numberOfLines={1}>{gym.name}</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.gymAddress} numberOfLines={1}>
                {gym.city || 'NYC'} • {gym.pincode}
              </Text>
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
              <Text style={styles.selectBtnText}>Join</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.gymMeta}>
          <View style={[styles.priceTag, { backgroundColor: priceTag.color + '20' }]}>
            <Text style={[styles.priceTagText, { color: priceTag.color }]}>
              💰 ${gym.membership_cost}/mo
            </Text>
          </View>
          
          {gym.rating && (
            <View style={styles.ratingBox}>
              <Text style={styles.ratingStars}>{getRatingStars(gym.rating)}</Text>
              <Text style={styles.ratingValue}>{gym.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {gym.facilities && gym.facilities.length > 0 && (
          <View style={styles.facilitiesRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {gym.facilities.slice(0, 4).map((facility, index) => (
                <View key={index} style={styles.facilityChip}>
                  <Text style={styles.facilityText}>{facility}</Text>
                </View>
              ))}
              {gym.facilities.length > 4 && (
                <View style={styles.facilityChip}>
                  <Text style={styles.facilityText}>+{gym.facilities.length - 4}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onClose}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>
            {isLookingForGym ? 'Find Your Gym' : 'Select Your Gym'}
          </Text>
          <TouchableOpacity 
            style={styles.sortBtn}
            onPress={() => setShowSortOptions(!showSortOptions)}
          >
            <Text style={styles.sortBtnText}>
              {sortBy === 'name' ? '🔤' : sortBy === 'price-low' ? '💰↓' : sortBy === 'price-high' ? '💰↑' : '⭐'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          {filteredGyms.length} gyms found • {activeFilter !== 'all' ? CITY_FILTERS.find(f => f.key === activeFilter)?.label : 'All Areas'}
        </Text>
      </View>

      {/* Sort Options Dropdown */}
      {showSortOptions && (
        <View style={styles.sortDropdown}>
          {[
            { key: 'name', label: 'Name (A-Z)', emoji: '🔤' },
            { key: 'price-low', label: 'Price: Low to High', emoji: '💰↓' },
            { key: 'price-high', label: 'Price: High to Low', emoji: '💰↑' },
            { key: 'rating', label: 'Rating', emoji: '⭐' },
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortOption,
                sortBy === option.key && styles.sortOptionActive
              ]}
              onPress={() => {
                setSortBy(option.key as SortType);
                setShowSortOptions(false);
              }}
            >
              <Text style={styles.sortOptionEmoji}>{option.emoji}</Text>
              <Text style={[
                styles.sortOptionLabel,
                sortBy === option.key && styles.sortOptionLabelActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search gym, area, facility..."
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

        {/* Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterScrollContent}
        >
          {CITY_FILTERS.map(renderFilterChip)}
        </ScrollView>
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
              Try a different search or filter
            </Text>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                setSearchQuery('');
                setActiveFilter('all');
                setGyms(nycGyms as Gym[]);
              }}
            >
              <Text style={styles.resetBtnText}>Reset Filters</Text>
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
    paddingBottom: 20,
  },
  backBtn: {
    marginBottom: 12,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  sortBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sortBtnText: {
    fontSize: 16,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  sortDropdown: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  sortOptionActive: {
    backgroundColor: '#ECFDF5',
  },
  sortOptionEmoji: {
    fontSize: 16,
    marginRight: 10,
  },
  sortOptionLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  sortOptionLabelActive: {
    color: '#059669',
    fontWeight: '600',
  },
  searchContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
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
  filterScroll: {
    marginTop: 14,
  },
  filterScrollContent: {
    paddingRight: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#059669',
  },
  filterEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterLabelActive: {
    color: '#fff',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  separator: {
    height: 14,
  },
  gymCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  gymHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gymIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  gymIcon: {
    fontSize: 22,
  },
  gymDetails: {
    flex: 1,
  },
  gymName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  gymAddress: {
    fontSize: 13,
    color: '#64748B',
  },
  selectBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 70,
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
  gymMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 12,
  },
  priceTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStars: {
    fontSize: 12,
    color: '#F59E0B',
    marginRight: 4,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  facilitiesRow: {
    marginTop: 10,
  },
  facilityChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 6,
  },
  facilityText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
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

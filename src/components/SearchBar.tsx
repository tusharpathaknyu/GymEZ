import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../services/supabase';
import { useAuth } from '../services/auth';

interface SearchResult {
  id: string;
  type: 'user' | 'gym' | 'exercise' | 'post';
  title: string;
  subtitle?: string;
  icon: string;
  data: any;
}

interface SearchBarProps {
  placeholder?: string;
  onResultSelect?: (result: SearchResult) => void;
  searchTypes?: ('user' | 'gym' | 'exercise' | 'post')[];
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search users, gyms, exercises...',
  onResultSelect,
  searchTypes = ['user', 'gym', 'exercise'],
}) => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const searchTimeout = useRef<NodeJS.Timeout>();

  // Exercise database for local search
  const exercises = [
    { id: 'benchpress', name: 'Bench Press', icon: '🏋️', muscle: 'Chest' },
    { id: 'squat', name: 'Squat', icon: '🦵', muscle: 'Legs' },
    { id: 'deadlift', name: 'Deadlift', icon: '💪', muscle: 'Back' },
    { id: 'pullup', name: 'Pull-ups', icon: '🎯', muscle: 'Back' },
    { id: 'pushup', name: 'Push-ups', icon: '👊', muscle: 'Chest' },
    { id: 'dip', name: 'Dips', icon: '💥', muscle: 'Triceps' },
    { id: 'ohp', name: 'Overhead Press', icon: '🙌', muscle: 'Shoulders' },
    { id: 'row', name: 'Barbell Row', icon: '🚣', muscle: 'Back' },
    { id: 'curl', name: 'Bicep Curl', icon: '💪', muscle: 'Biceps' },
    { id: 'lunge', name: 'Lunges', icon: '🦿', muscle: 'Legs' },
  ];

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(animatedWidth, {
      toValue: 1,
      useNativeDriver: false,
      friction: 8,
    }).start();
  };

  const handleBlur = () => {
    if (!query) {
      setIsFocused(false);
      Animated.spring(animatedWidth, {
        toValue: 0,
        useNativeDriver: false,
        friction: 8,
      }).start();
    }
  };

  const searchAll = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const allResults: SearchResult[] = [];
    const lowercaseQuery = searchQuery.toLowerCase();

    try {
      // Search exercises locally
      if (searchTypes.includes('exercise')) {
        const matchedExercises = exercises
          .filter(
            e =>
              e.name.toLowerCase().includes(lowercaseQuery) ||
              e.muscle.toLowerCase().includes(lowercaseQuery)
          )
          .map(e => ({
            id: e.id,
            type: 'exercise' as const,
            title: e.name,
            subtitle: e.muscle,
            icon: e.icon,
            data: e,
          }));
        allResults.push(...matchedExercises);
      }

      // Search users
      if (searchTypes.includes('user') && user?.id) {
        const { data: users } = await supabase
          .from('profiles')
          .select('id, full_name, username, profile_picture')
          .or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
          .neq('id', user.id)
          .limit(5);

        if (users) {
          const userResults: SearchResult[] = users.map(u => ({
            id: u.id,
            type: 'user',
            title: u.full_name || u.username || 'Unknown',
            subtitle: u.username ? `@${u.username}` : undefined,
            icon: '👤',
            data: u,
          }));
          allResults.push(...userResults);
        }
      }

      // Search gyms
      if (searchTypes.includes('gym')) {
        const { data: gyms } = await supabase
          .from('gyms')
          .select('id, name, address, city')
          .or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
          .limit(5);

        if (gyms) {
          const gymResults: SearchResult[] = gyms.map(g => ({
            id: g.id,
            type: 'gym',
            title: g.name,
            subtitle: g.city || g.address,
            icon: '🏋️',
            data: g,
          }));
          allResults.push(...gymResults);
        }
      }

      setResults(allResults.slice(0, 10));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTypes, user?.id, exercises]);

  useEffect(() => {
    // Debounce search
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      searchAll(query);
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query, searchAll]);

  const handleResultPress = (result: SearchResult) => {
    onResultSelect?.(result);
    setQuery('');
    setResults([]);
    Keyboard.dismiss();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  const getTypeColor = (type: SearchResult['type']) => {
    const colors = {
      user: '#3b82f6',
      gym: '#10b981',
      exercise: '#f59e0b',
      post: '#8b5cf6',
    };
    return colors[type];
  };

  const renderResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleResultPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.resultIcon, { backgroundColor: `${getTypeColor(item.type)}20` }]}>
        <Text style={styles.resultIconText}>{item.icon}</Text>
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
        <Text style={styles.typeBadgeText}>{item.type}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={[styles.searchContainer, isFocused && styles.searchContainerFocused]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={setQuery}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {loading && (
          <ActivityIndicator size="small" color="#10b981" style={styles.loader} />
        )}
        {query.length > 0 && !loading && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results Dropdown */}
      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={results}
            renderItem={renderResult}
            keyExtractor={item => `${item.type}-${item.id}`}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* No Results */}
      {query.length > 2 && results.length === 0 && !loading && (
        <View style={styles.noResults}>
          <Text style={styles.noResultsIcon}>🔍</Text>
          <Text style={styles.noResultsText}>No results found for "{query}"</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  searchContainerFocused: {
    backgroundColor: '#fff',
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
  },
  loader: {
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearIcon: {
    fontSize: 16,
    color: '#9ca3af',
  },
  resultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultIconText: {
    fontSize: 18,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  resultSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  noResults: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  noResultsIcon: {
    fontSize: 32,
    marginBottom: 8,
    opacity: 0.5,
  },
  noResultsText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default SearchBar;

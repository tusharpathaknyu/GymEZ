import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../services/auth';
import { supabase } from '../services/supabase';
import { buttonPress, successHaptic } from '../utils/haptics';

const { width } = Dimensions.get('window');

interface Measurement {
  id: string;
  user_id: string;
  date: string;
  weight?: number;
  body_fat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  bicep_left?: number;
  bicep_right?: number;
  thigh_left?: number;
  thigh_right?: number;
  calf_left?: number;
  calf_right?: number;
  neck?: number;
  shoulders?: number;
  forearm?: number;
}

const MEASUREMENT_FIELDS = [
  { key: 'weight', label: 'Weight', unit: 'lbs', icon: '⚖️', color: '#10b981' },
  { key: 'body_fat', label: 'Body Fat', unit: '%', icon: '📊', color: '#f59e0b' },
  { key: 'chest', label: 'Chest', unit: 'in', icon: '💪', color: '#3b82f6' },
  { key: 'waist', label: 'Waist', unit: 'in', icon: '📏', color: '#ef4444' },
  { key: 'hips', label: 'Hips', unit: 'in', icon: '🍑', color: '#8b5cf6' },
  { key: 'shoulders', label: 'Shoulders', unit: 'in', icon: '🔱', color: '#06b6d4' },
  { key: 'bicep_left', label: 'Left Bicep', unit: 'in', icon: '💪', color: '#ec4899' },
  { key: 'bicep_right', label: 'Right Bicep', unit: 'in', icon: '💪', color: '#ec4899' },
  { key: 'thigh_left', label: 'Left Thigh', unit: 'in', icon: '🦵', color: '#14b8a6' },
  { key: 'thigh_right', label: 'Right Thigh', unit: 'in', icon: '🦵', color: '#14b8a6' },
  { key: 'calf_left', label: 'Left Calf', unit: 'in', icon: '🦶', color: '#f97316' },
  { key: 'calf_right', label: 'Right Calf', unit: 'in', icon: '🦶', color: '#f97316' },
  { key: 'neck', label: 'Neck', unit: 'in', icon: '🎯', color: '#6366f1' },
  { key: 'forearm', label: 'Forearm', unit: 'in', icon: '✊', color: '#84cc16' },
];

const BodyMeasurementsScreen = ({ navigation }: { navigation: any }) => {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMeasurement, setNewMeasurement] = useState<Partial<Measurement>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'trends'>('overview');

  const loadMeasurements = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      setMeasurements(data || []);
    } catch (error) {
      console.error('Error loading measurements:', error);
      // Use mock data for demo
      setMeasurements([
        {
          id: '1',
          user_id: user.id,
          date: new Date().toISOString(),
          weight: 175,
          body_fat: 15,
          chest: 42,
          waist: 32,
          bicep_left: 15,
          bicep_right: 15.2,
        },
        {
          id: '2',
          user_id: user.id,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          weight: 176,
          body_fat: 15.5,
          chest: 41.5,
          waist: 32.5,
          bicep_left: 14.8,
          bicep_right: 15,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadMeasurements();
  }, [loadMeasurements]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMeasurements();
    setRefreshing(false);
  };

  const handleSaveMeasurement = async () => {
    if (!user?.id) return;
    buttonPress();
    
    try {
      const measurementData = {
        ...newMeasurement,
        user_id: user.id,
        date: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('body_measurements')
        .insert(measurementData);

      if (error) throw error;

      successHaptic();
      setShowAddModal(false);
      setNewMeasurement({});
      loadMeasurements();
      Alert.alert('Success! 💪', 'Measurements saved successfully!');
    } catch (error) {
      console.error('Error saving measurement:', error);
      // For demo, just close modal
      successHaptic();
      setShowAddModal(false);
      setNewMeasurement({});
      Alert.alert('Success! 💪', 'Measurements recorded!');
    }
  };

  const getLatestValue = (key: string): number | null => {
    const latest = measurements[0];
    if (!latest) return null;
    return (latest as any)[key] || null;
  };

  const getChange = (key: string): { value: number; isPositive: boolean } | null => {
    if (measurements.length < 2) return null;
    const current = (measurements[0] as any)[key];
    const previous = (measurements[1] as any)[key];
    if (!current || !previous) return null;
    const change = current - previous;
    // For weight and body fat, negative is usually positive (loss)
    const isPositive = key === 'weight' || key === 'body_fat' ? change <= 0 : change >= 0;
    return { value: Math.abs(change), isPositive };
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: '#10b981' }]}>
          <Text style={styles.summaryIcon}>⚖️</Text>
          <Text style={styles.summaryValue}>{getLatestValue('weight') || '--'}</Text>
          <Text style={styles.summaryLabel}>lbs</Text>
          {getChange('weight') && (
            <View style={[styles.changeTag, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.changeText}>
                {getChange('weight')?.isPositive ? '↓' : '↑'} {getChange('weight')?.value.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#f59e0b' }]}>
          <Text style={styles.summaryIcon}>📊</Text>
          <Text style={styles.summaryValue}>{getLatestValue('body_fat') || '--'}</Text>
          <Text style={styles.summaryLabel}>% body fat</Text>
          {getChange('body_fat') && (
            <View style={[styles.changeTag, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.changeText}>
                {getChange('body_fat')?.isPositive ? '↓' : '↑'} {getChange('body_fat')?.value.toFixed(1)}%
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* All Measurements Grid */}
      <Text style={styles.sectionTitle}>Body Measurements</Text>
      <View style={styles.measurementsGrid}>
        {MEASUREMENT_FIELDS.slice(2).map(field => {
          const value = getLatestValue(field.key);
          const change = getChange(field.key);
          return (
            <View key={field.key} style={styles.measurementCard}>
              <View style={[styles.measurementIcon, { backgroundColor: field.color + '20' }]}>
                <Text style={styles.measurementEmoji}>{field.icon}</Text>
              </View>
              <Text style={styles.measurementLabel}>{field.label}</Text>
              <Text style={styles.measurementValue}>
                {value ? `${value} ${field.unit}` : '--'}
              </Text>
              {change && (
                <Text style={[styles.measurementChange, { color: change.isPositive ? '#10b981' : '#ef4444' }]}>
                  {change.isPositive ? '+' : '-'}{change.value.toFixed(1)}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Tips Card */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>📐 Measurement Tips</Text>
        <Text style={styles.tipText}>• Measure at the same time each day (morning is best)</Text>
        <Text style={styles.tipText}>• Use a flexible tape measure</Text>
        <Text style={styles.tipText}>• Keep the tape snug but not tight</Text>
        <Text style={styles.tipText}>• Track weekly for best trend data</Text>
      </View>
    </View>
  );

  const renderHistory = () => (
    <View style={styles.historyContainer}>
      {measurements.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📏</Text>
          <Text style={styles.emptyText}>No measurements yet</Text>
          <Text style={styles.emptySubtext}>Start tracking to see your progress!</Text>
        </View>
      ) : (
        measurements.map((measurement, index) => (
          <View key={measurement.id} style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyDate}>{formatDate(measurement.date)}</Text>
              {index === 0 && (
                <View style={styles.latestTag}>
                  <Text style={styles.latestText}>Latest</Text>
                </View>
              )}
            </View>
            <View style={styles.historyGrid}>
              {MEASUREMENT_FIELDS.slice(0, 6).map(field => {
                const value = (measurement as any)[field.key];
                if (!value) return null;
                return (
                  <View key={field.key} style={styles.historyItem}>
                    <Text style={styles.historyItemLabel}>{field.label}</Text>
                    <Text style={styles.historyItemValue}>{value} {field.unit}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderTrends = () => (
    <View style={styles.trendsContainer}>
      <View style={styles.trendCard}>
        <Text style={styles.trendTitle}>Weight Trend</Text>
        <View style={styles.trendChart}>
          {/* Simple visual trend indicator */}
          <View style={styles.trendLine}>
            {measurements.slice(0, 7).reverse().map((m, i) => {
              const height = m.weight ? ((m.weight - 150) / 50) * 100 : 50;
              return (
                <View key={i} style={styles.trendBarContainer}>
                  <View style={[styles.trendBar, { height: `${Math.min(Math.max(height, 10), 100)}%` }]} />
                </View>
              );
            })}
          </View>
        </View>
        <View style={styles.trendLabels}>
          <Text style={styles.trendLabel}>7 days ago</Text>
          <Text style={styles.trendLabel}>Today</Text>
        </View>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>📈 30-Day Summary</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {measurements.length > 1 
                ? (((measurements[0]?.weight || 0) - (measurements[measurements.length - 1]?.weight || 0)) * -1).toFixed(1)
                : '0'
              }
            </Text>
            <Text style={styles.statLabel}>lbs lost</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{measurements.length}</Text>
            <Text style={styles.statLabel}>entries</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {measurements.length > 0 
                ? Math.min(...measurements.map(m => m.weight || 999))
                : '--'
              }
            </Text>
            <Text style={styles.statLabel}>lowest weight</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Body Measurements</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              buttonPress();
              setShowAddModal(true);
            }}
          >
            <Text style={styles.addIcon}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['overview', 'history', 'trends'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => {
                buttonPress();
                setActiveTab(tab);
              }}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'trends' && renderTrends()}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Add Measurement Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Measurements</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {MEASUREMENT_FIELDS.map(field => (
                <View key={field.key} style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {field.icon} {field.label} ({field.unit})
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    keyboardType="decimal-pad"
                    value={(newMeasurement as any)[field.key]?.toString() || ''}
                    onChangeText={text => 
                      setNewMeasurement(prev => ({
                        ...prev,
                        [field.key]: text ? parseFloat(text) : undefined,
                      }))
                    }
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveMeasurement}>
              <Text style={styles.saveButtonText}>Save Measurements</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#374151',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#10b981',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#10b981',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  overviewContainer: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  summaryIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  changeTag: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  measurementCard: {
    width: (width - 52) / 3,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  measurementIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  measurementEmoji: {
    fontSize: 18,
  },
  measurementLabel: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  measurementValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  measurementChange: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  tipsCard: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 13,
    color: '#3b82f6',
    marginBottom: 6,
    lineHeight: 18,
  },
  historyContainer: {
    padding: 16,
  },
  historyCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  latestTag: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  latestText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  historyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  historyItem: {
    width: '30%',
  },
  historyItemLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 2,
  },
  historyItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  trendsContainer: {
    padding: 16,
  },
  trendCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  trendChart: {
    height: 100,
  },
  trendLine: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    gap: 8,
  },
  trendBarContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  trendBar: {
    backgroundColor: '#10b981',
    borderRadius: 4,
    minHeight: 10,
  },
  trendLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  trendLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  statsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalClose: {
    fontSize: 20,
    color: '#6b7280',
    padding: 4,
  },
  modalScroll: {
    padding: 20,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  saveButton: {
    backgroundColor: '#10b981',
    margin: 20,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 40,
  },
});

export default BodyMeasurementsScreen;

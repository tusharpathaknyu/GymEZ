import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  Modal,
} from 'react-native';
import { useAuth } from '../services/auth';
import { buttonPress, successHaptic } from '../utils/haptics';

const { width } = Dimensions.get('window');

// Mock data - replace with real data from Supabase
const MOCK_WEIGHT_DATA = [
  { date: '2024-11-01', value: 85 },
  { date: '2024-11-15', value: 84.2 },
  { date: '2024-12-01', value: 83.5 },
  { date: '2024-12-15', value: 82.8 },
];

const MOCK_STRENGTH_DATA = {
  bench: [
    { date: '2024-11-01', value: 80 },
    { date: '2024-11-15', value: 82.5 },
    { date: '2024-12-01', value: 85 },
    { date: '2024-12-15', value: 87.5 },
  ],
  squat: [
    { date: '2024-11-01', value: 100 },
    { date: '2024-11-15', value: 105 },
    { date: '2024-12-01', value: 110 },
    { date: '2024-12-15', value: 115 },
  ],
  deadlift: [
    { date: '2024-11-01', value: 120 },
    { date: '2024-11-15', value: 125 },
    { date: '2024-12-01', value: 130 },
    { date: '2024-12-15', value: 137.5 },
  ],
};

const MOCK_BODY_STATS = {
  chest: [{ date: '2024-11-01', value: 100 }, { date: '2024-12-15', value: 102 }],
  arms: [{ date: '2024-11-01', value: 35 }, { date: '2024-12-15', value: 36.5 }],
  waist: [{ date: '2024-11-01', value: 86 }, { date: '2024-12-15', value: 84 }],
};

const MOCK_PHOTOS = [
  { id: '1', date: '2024-11-01', uri: null, label: 'Week 1' },
  { id: '2', date: '2024-11-15', uri: null, label: 'Week 3' },
  { id: '3', date: '2024-12-01', uri: null, label: 'Week 5' },
  { id: '4', date: '2024-12-15', uri: null, label: 'Week 7' },
];

type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';
type ChartType = 'weight' | 'strength' | 'body';

const ProgressDashboardScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('3M');
  const [activeChart, setActiveChart] = useState<ChartType>('weight');
  const [selectedLift, setSelectedLift] = useState<'bench' | 'squat' | 'deadlift'>('bench');
  const [showPhotoCompare, setShowPhotoCompare] = useState(false);
  const [compareIndex, setCompareIndex] = useState(0);
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Simple line chart renderer
  const renderLineChart = (data: { date: string; value: number }[], color: string, unit: string) => {
    if (data.length === 0) return null;
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;
    const chartHeight = 150;
    const chartWidth = width - 80;
    const pointSpacing = chartWidth / (data.length - 1 || 1);

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartYAxis}>
          <Text style={styles.axisLabel}>{maxValue.toFixed(1)}</Text>
          <Text style={styles.axisLabel}>{((maxValue + minValue) / 2).toFixed(1)}</Text>
          <Text style={styles.axisLabel}>{minValue.toFixed(1)}</Text>
        </View>
        <View style={styles.chartArea}>
          {/* Grid lines */}
          <View style={[styles.gridLine, { top: 0 }]} />
          <View style={[styles.gridLine, { top: chartHeight / 2 }]} />
          <View style={[styles.gridLine, { top: chartHeight }]} />
          
          {/* Data points and lines */}
          <View style={styles.dataContainer}>
            {data.map((point, index) => {
              const x = index * pointSpacing;
              const y = chartHeight - ((point.value - minValue) / range) * chartHeight;
              
              return (
                <React.Fragment key={index}>
                  {/* Line to next point */}
                  {index < data.length - 1 && (
                    <View
                      style={[
                        styles.chartLine,
                        {
                          left: x + 6,
                          top: y + 6,
                          width: pointSpacing,
                          backgroundColor: color,
                          transform: [
                            {
                              rotate: `${Math.atan2(
                                (chartHeight - ((data[index + 1].value - minValue) / range) * chartHeight) - y,
                                pointSpacing
                              )}rad`,
                            },
                          ],
                        },
                      ]}
                    />
                  )}
                  {/* Data point */}
                  <TouchableOpacity
                    style={[
                      styles.dataPoint,
                      {
                        left: x,
                        top: y,
                        backgroundColor: color,
                      },
                    ]}
                    onPress={() => {
                      buttonPress();
                    }}
                  >
                    <View style={styles.dataPointInner} />
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
          
          {/* X-axis labels */}
          <View style={styles.chartXAxis}>
            {data.map((point, index) => (
              <Text key={index} style={styles.xAxisLabel}>
                {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            ))}
          </View>
        </View>
        
        {/* Stats summary */}
        <View style={styles.statsSummary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Start</Text>
            <Text style={styles.summaryValue}>{data[0]?.value.toFixed(1)} {unit}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Current</Text>
            <Text style={[styles.summaryValue, { color }]}>{data[data.length - 1]?.value.toFixed(1)} {unit}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Change</Text>
            <Text style={[
              styles.summaryValue,
              { color: (data[data.length - 1]?.value - data[0]?.value) >= 0 ? '#10b981' : '#ef4444' }
            ]}>
              {(data[data.length - 1]?.value - data[0]?.value) >= 0 ? '+' : ''}
              {(data[data.length - 1]?.value - data[0]?.value).toFixed(1)} {unit}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      {(['1W', '1M', '3M', '6M', '1Y', 'ALL'] as TimeRange[]).map((range) => (
        <TouchableOpacity
          key={range}
          style={[styles.timeRangeButton, timeRange === range && styles.timeRangeActive]}
          onPress={() => {
            buttonPress();
            setTimeRange(range);
          }}
        >
          <Text style={[styles.timeRangeText, timeRange === range && styles.timeRangeTextActive]}>
            {range}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderChartTypeSelector = () => (
    <View style={styles.chartTypeContainer}>
      <TouchableOpacity
        style={[styles.chartTypeButton, activeChart === 'weight' && styles.chartTypeActive]}
        onPress={() => { buttonPress(); setActiveChart('weight'); }}
      >
        <Text style={styles.chartTypeIcon}>⚖️</Text>
        <Text style={[styles.chartTypeText, activeChart === 'weight' && styles.chartTypeTextActive]}>Weight</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.chartTypeButton, activeChart === 'strength' && styles.chartTypeActive]}
        onPress={() => { buttonPress(); setActiveChart('strength'); }}
      >
        <Text style={styles.chartTypeIcon}>💪</Text>
        <Text style={[styles.chartTypeText, activeChart === 'strength' && styles.chartTypeTextActive]}>Strength</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.chartTypeButton, activeChart === 'body' && styles.chartTypeActive]}
        onPress={() => { buttonPress(); setActiveChart('body'); }}
      >
        <Text style={styles.chartTypeIcon}>📏</Text>
        <Text style={[styles.chartTypeText, activeChart === 'body' && styles.chartTypeTextActive]}>Body</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStrengthSelector = () => (
    <View style={styles.liftSelector}>
      {(['bench', 'squat', 'deadlift'] as const).map((lift) => (
        <TouchableOpacity
          key={lift}
          style={[styles.liftButton, selectedLift === lift && styles.liftButtonActive]}
          onPress={() => { buttonPress(); setSelectedLift(lift); }}
        >
          <Text style={[styles.liftButtonText, selectedLift === lift && styles.liftButtonTextActive]}>
            {lift.charAt(0).toUpperCase() + lift.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPhotoTimeline = () => (
    <View style={styles.photoSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📸 Progress Photos</Text>
        <TouchableOpacity onPress={() => { buttonPress(); setShowPhotoCompare(true); }}>
          <Text style={styles.compareButton}>Compare →</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
        {MOCK_PHOTOS.map((photo, index) => (
          <TouchableOpacity
            key={photo.id}
            style={styles.photoCard}
            onPress={() => {
              buttonPress();
              setCompareIndex(index);
              setShowPhotoCompare(true);
            }}
          >
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderIcon}>📷</Text>
              <Text style={styles.photoPlaceholderText}>Add Photo</Text>
            </View>
            <Text style={styles.photoLabel}>{photo.label}</Text>
            <Text style={styles.photoDate}>
              {new Date(photo.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.photoCard, styles.addPhotoCard]}>
          <View style={styles.addPhotoButton}>
            <Text style={styles.addPhotoIcon}>+</Text>
          </View>
          <Text style={styles.addPhotoText}>Add New</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderWeeklyReport = () => {
    const weightChange = MOCK_WEIGHT_DATA[MOCK_WEIGHT_DATA.length - 1].value - MOCK_WEIGHT_DATA[MOCK_WEIGHT_DATA.length - 2].value;
    const benchChange = MOCK_STRENGTH_DATA.bench[MOCK_STRENGTH_DATA.bench.length - 1].value - MOCK_STRENGTH_DATA.bench[MOCK_STRENGTH_DATA.bench.length - 2].value;
    
    return (
      <View style={styles.weeklyReport}>
        <Text style={styles.sectionTitle}>📊 This Week's Summary</Text>
        <View style={styles.reportGrid}>
          <View style={styles.reportCard}>
            <Text style={styles.reportIcon}>⚖️</Text>
            <Text style={styles.reportLabel}>Weight</Text>
            <Text style={[styles.reportValue, { color: weightChange <= 0 ? '#10b981' : '#f59e0b' }]}>
              {weightChange <= 0 ? '' : '+'}{weightChange.toFixed(1)} kg
            </Text>
          </View>
          <View style={styles.reportCard}>
            <Text style={styles.reportIcon}>🏋️</Text>
            <Text style={styles.reportLabel}>Bench PR</Text>
            <Text style={[styles.reportValue, { color: benchChange >= 0 ? '#10b981' : '#ef4444' }]}>
              {benchChange >= 0 ? '+' : ''}{benchChange.toFixed(1)} kg
            </Text>
          </View>
          <View style={styles.reportCard}>
            <Text style={styles.reportIcon}>🔥</Text>
            <Text style={styles.reportLabel}>Workouts</Text>
            <Text style={styles.reportValue}>5 / 5</Text>
          </View>
          <View style={styles.reportCard}>
            <Text style={styles.reportIcon}>📈</Text>
            <Text style={styles.reportLabel}>Streak</Text>
            <Text style={[styles.reportValue, { color: '#f59e0b' }]}>12 days</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progress Dashboard</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareIcon}>📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Time Range Selector */}
        {renderTimeRangeSelector()}

        {/* Chart Type Selector */}
        {renderChartTypeSelector()}

        {/* Main Chart */}
        <Animated.View style={[styles.chartCard, { opacity: fadeAnim }]}>
          {activeChart === 'weight' && (
            <>
              <Text style={styles.chartTitle}>Body Weight</Text>
              {renderLineChart(MOCK_WEIGHT_DATA, '#10b981', 'kg')}
            </>
          )}
          {activeChart === 'strength' && (
            <>
              <Text style={styles.chartTitle}>Strength Progress</Text>
              {renderStrengthSelector()}
              {renderLineChart(MOCK_STRENGTH_DATA[selectedLift], '#6366f1', 'kg')}
            </>
          )}
          {activeChart === 'body' && (
            <>
              <Text style={styles.chartTitle}>Body Measurements</Text>
              <View style={styles.bodyStatsGrid}>
                <View style={styles.bodyStatCard}>
                  <Text style={styles.bodyStatIcon}>💪</Text>
                  <Text style={styles.bodyStatLabel}>Arms</Text>
                  <Text style={styles.bodyStatValue}>36.5 cm</Text>
                  <Text style={styles.bodyStatChange}>+1.5 cm</Text>
                </View>
                <View style={styles.bodyStatCard}>
                  <Text style={styles.bodyStatIcon}>🫁</Text>
                  <Text style={styles.bodyStatLabel}>Chest</Text>
                  <Text style={styles.bodyStatValue}>102 cm</Text>
                  <Text style={styles.bodyStatChange}>+2 cm</Text>
                </View>
                <View style={styles.bodyStatCard}>
                  <Text style={styles.bodyStatIcon}>🎯</Text>
                  <Text style={styles.bodyStatLabel}>Waist</Text>
                  <Text style={styles.bodyStatValue}>84 cm</Text>
                  <Text style={[styles.bodyStatChange, { color: '#10b981' }]}>-2 cm</Text>
                </View>
              </View>
            </>
          )}
        </Animated.View>

        {/* Photo Timeline */}
        {renderPhotoTimeline()}

        {/* Weekly Report */}
        {renderWeeklyReport()}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Photo Compare Modal */}
      <Modal visible={showPhotoCompare} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.compareModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Before & After</Text>
              <TouchableOpacity onPress={() => setShowPhotoCompare(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.compareContainer}>
              <View style={styles.comparePhoto}>
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderIcon}>📷</Text>
                </View>
                <Text style={styles.compareLabel}>Before</Text>
              </View>
              <View style={styles.comparePhoto}>
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderIcon}>📷</Text>
                </View>
                <Text style={styles.compareLabel}>After</Text>
              </View>
            </View>
            <Text style={styles.compareStats}>7 weeks • -2.2 kg • +7.5 kg strength</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIcon: {
    fontSize: 18,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    gap: 8,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  timeRangeActive: {
    backgroundColor: '#10b981',
  },
  timeRangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  timeRangeTextActive: {
    color: '#fff',
  },
  chartTypeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    gap: 12,
  },
  chartTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    gap: 6,
  },
  chartTypeActive: {
    backgroundColor: '#ecfdf5',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  chartTypeIcon: {
    fontSize: 16,
  },
  chartTypeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  chartTypeTextActive: {
    color: '#10b981',
  },
  chartCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  chartContainer: {
    marginTop: 8,
  },
  chartArea: {
    height: 180,
    marginLeft: 40,
    position: 'relative',
  },
  chartYAxis: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 30,
    width: 40,
    justifyContent: 'space-between',
  },
  axisLabel: {
    fontSize: 10,
    color: '#9ca3af',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  dataContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 30,
  },
  chartLine: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
  },
  dataPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataPointInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  chartXAxis: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xAxisLabel: {
    fontSize: 9,
    color: '#9ca3af',
  },
  statsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  liftSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  liftButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  liftButtonActive: {
    backgroundColor: '#6366f1',
  },
  liftButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  liftButtonTextActive: {
    color: '#fff',
  },
  bodyStatsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  bodyStatCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  bodyStatIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  bodyStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  bodyStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  bodyStatChange: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
    marginTop: 4,
  },
  photoSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  compareButton: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  photoScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  photoCard: {
    width: 100,
    marginRight: 12,
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 100,
    height: 130,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  photoPlaceholderText: {
    fontSize: 10,
    color: '#9ca3af',
  },
  photoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
  },
  photoDate: {
    fontSize: 10,
    color: '#9ca3af',
  },
  addPhotoCard: {
    opacity: 0.7,
  },
  addPhotoButton: {
    width: 100,
    height: 130,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#9ca3af',
  },
  addPhotoIcon: {
    fontSize: 32,
    color: '#9ca3af',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  weeklyReport: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  reportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  reportCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  reportIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  reportLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  reportValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compareModal: {
    width: width - 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    fontSize: 20,
    color: '#6b7280',
  },
  compareContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  comparePhoto: {
    flex: 1,
    alignItems: 'center',
  },
  compareLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
  },
  compareStats: {
    textAlign: 'center',
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 20,
  },
});

export default ProgressDashboardScreen;

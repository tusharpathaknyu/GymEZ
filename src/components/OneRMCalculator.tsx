import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import { buttonPress, successHaptic } from '../utils/haptics';

const { width } = Dimensions.get('window');

interface CalculatorResult {
  weight: number;
  reps: number;
  oneRM: number;
  percentages: { percent: number; weight: number; reps: string }[];
}

// 1RM Calculation Formulas
const formulas = {
  epley: (weight: number, reps: number) => weight * (1 + reps / 30),
  brzycki: (weight: number, reps: number) => weight * (36 / (37 - reps)),
  lander: (weight: number, reps: number) => (100 * weight) / (101.3 - 2.67123 * reps),
  lombardi: (weight: number, reps: number) => weight * Math.pow(reps, 0.1),
  mayhew: (weight: number, reps: number) => (100 * weight) / (52.2 + 41.9 * Math.exp(-0.055 * reps)),
  oconner: (weight: number, reps: number) => weight * (1 + reps / 40),
  wathen: (weight: number, reps: number) => (100 * weight) / (48.8 + 53.8 * Math.exp(-0.075 * reps)),
};

const FORMULA_OPTIONS = [
  { key: 'epley', name: 'Epley', description: 'Most commonly used' },
  { key: 'brzycki', name: 'Brzycki', description: 'Popular alternative' },
  { key: 'lander', name: 'Lander', description: 'Good for higher reps' },
  { key: 'lombardi', name: 'Lombardi', description: 'Simple formula' },
];

const REP_PERCENTAGES = [
  { percent: 100, reps: '1' },
  { percent: 95, reps: '2' },
  { percent: 93, reps: '3' },
  { percent: 90, reps: '4' },
  { percent: 87, reps: '5' },
  { percent: 85, reps: '6' },
  { percent: 83, reps: '7' },
  { percent: 80, reps: '8' },
  { percent: 77, reps: '9' },
  { percent: 75, reps: '10' },
  { percent: 70, reps: '11-12' },
  { percent: 67, reps: '13-15' },
  { percent: 65, reps: '16-20' },
];

const COMMON_LIFTS = [
  { name: 'Bench Press', icon: '🏋️', avgMale: 135, avgFemale: 65 },
  { name: 'Squat', icon: '🦵', avgMale: 185, avgFemale: 95 },
  { name: 'Deadlift', icon: '💪', avgMale: 225, avgFemale: 115 },
  { name: 'Overhead Press', icon: '🙆', avgMale: 95, avgFemale: 45 },
  { name: 'Barbell Row', icon: '🚣', avgMale: 135, avgFemale: 65 },
];

interface OneRMCalculatorProps {
  visible: boolean;
  onClose: () => void;
}

const OneRMCalculator: React.FC<OneRMCalculatorProps> = ({ visible, onClose }) => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [selectedFormula, setSelectedFormula] = useState('epley');
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [selectedLift, setSelectedLift] = useState<string | null>(null);
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  const calculateOneRM = useCallback(() => {
    const w = parseFloat(weight);
    const r = parseInt(reps);

    if (isNaN(w) || isNaN(r) || w <= 0 || r <= 0 || r > 30) {
      return;
    }

    buttonPress();

    const formula = formulas[selectedFormula as keyof typeof formulas];
    const oneRM = Math.round(formula(w, r));

    const percentages = REP_PERCENTAGES.map(p => ({
      percent: p.percent,
      weight: Math.round(oneRM * (p.percent / 100)),
      reps: p.reps,
    }));

    setResult({
      weight: w,
      reps: r,
      oneRM,
      percentages,
    });

    successHaptic();
  }, [weight, reps, selectedFormula]);

  const handleReset = () => {
    buttonPress();
    setWeight('');
    setReps('');
    setResult(null);
    setSelectedLift(null);
  };

  const handleQuickSelect = (lift: typeof COMMON_LIFTS[0]) => {
    buttonPress();
    setSelectedLift(lift.name);
    setWeight(lift.avgMale.toString());
    setReps('5');
  };

  const getStrengthLevel = (oneRM: number, lift: string): { level: string; color: string } => {
    // Simplified strength standards based on 1RM
    if (lift === 'Bench Press') {
      if (oneRM < 135) return { level: 'Beginner', color: '#6b7280' };
      if (oneRM < 185) return { level: 'Novice', color: '#3b82f6' };
      if (oneRM < 225) return { level: 'Intermediate', color: '#10b981' };
      if (oneRM < 315) return { level: 'Advanced', color: '#f59e0b' };
      return { level: 'Elite', color: '#ef4444' };
    }
    if (lift === 'Squat') {
      if (oneRM < 185) return { level: 'Beginner', color: '#6b7280' };
      if (oneRM < 275) return { level: 'Novice', color: '#3b82f6' };
      if (oneRM < 365) return { level: 'Intermediate', color: '#10b981' };
      if (oneRM < 455) return { level: 'Advanced', color: '#f59e0b' };
      return { level: 'Elite', color: '#ef4444' };
    }
    if (lift === 'Deadlift') {
      if (oneRM < 225) return { level: 'Beginner', color: '#6b7280' };
      if (oneRM < 315) return { level: 'Novice', color: '#3b82f6' };
      if (oneRM < 405) return { level: 'Intermediate', color: '#10b981' };
      if (oneRM < 500) return { level: 'Advanced', color: '#f59e0b' };
      return { level: 'Elite', color: '#ef4444' };
    }
    return { level: 'N/A', color: '#6b7280' };
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🧮 1RM Calculator</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Quick Lift Selection */}
            <Text style={styles.sectionTitle}>Select Exercise</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.liftsRow}>
              {COMMON_LIFTS.map(lift => (
                <TouchableOpacity
                  key={lift.name}
                  style={[
                    styles.liftCard,
                    selectedLift === lift.name && styles.liftCardActive,
                  ]}
                  onPress={() => handleQuickSelect(lift)}
                >
                  <Text style={styles.liftIcon}>{lift.icon}</Text>
                  <Text style={[
                    styles.liftName,
                    selectedLift === lift.name && styles.liftNameActive,
                  ]}>
                    {lift.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Input Fields */}
            <View style={styles.inputContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight Lifted</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                    placeholderTextColor="#9ca3af"
                  />
                  <Text style={styles.inputUnit}>lbs</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reps Performed</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    keyboardType="numeric"
                    value={reps}
                    onChangeText={setReps}
                    maxLength={2}
                    placeholderTextColor="#9ca3af"
                  />
                  <Text style={styles.inputUnit}>reps</Text>
                </View>
              </View>
            </View>

            {/* Quick Rep Buttons */}
            <View style={styles.quickRepsRow}>
              {[3, 5, 8, 10].map(r => (
                <TouchableOpacity
                  key={r}
                  style={[styles.quickRepButton, reps === r.toString() && styles.quickRepActive]}
                  onPress={() => {
                    buttonPress();
                    setReps(r.toString());
                  }}
                >
                  <Text style={[
                    styles.quickRepText,
                    reps === r.toString() && styles.quickRepTextActive,
                  ]}>
                    {r} reps
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Formula Selection */}
            <TouchableOpacity 
              style={styles.formulaSelector}
              onPress={() => setShowFormulaInfo(!showFormulaInfo)}
            >
              <View>
                <Text style={styles.formulaLabel}>Formula</Text>
                <Text style={styles.formulaName}>
                  {FORMULA_OPTIONS.find(f => f.key === selectedFormula)?.name}
                </Text>
              </View>
              <Text style={styles.formulaArrow}>{showFormulaInfo ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {showFormulaInfo && (
              <View style={styles.formulaOptions}>
                {FORMULA_OPTIONS.map(formula => (
                  <TouchableOpacity
                    key={formula.key}
                    style={[
                      styles.formulaOption,
                      selectedFormula === formula.key && styles.formulaOptionActive,
                    ]}
                    onPress={() => {
                      buttonPress();
                      setSelectedFormula(formula.key);
                      setShowFormulaInfo(false);
                    }}
                  >
                    <Text style={[
                      styles.formulaOptionName,
                      selectedFormula === formula.key && styles.formulaOptionNameActive,
                    ]}>
                      {formula.name}
                    </Text>
                    <Text style={styles.formulaOptionDesc}>{formula.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Calculate Button */}
            <TouchableOpacity style={styles.calculateButton} onPress={calculateOneRM}>
              <Text style={styles.calculateButtonText}>Calculate 1RM</Text>
            </TouchableOpacity>

            {/* Results */}
            {result && (
              <View style={styles.resultContainer}>
                {/* Main Result */}
                <View style={styles.mainResult}>
                  <Text style={styles.resultLabel}>Estimated 1 Rep Max</Text>
                  <Text style={styles.resultValue}>{result.oneRM}</Text>
                  <Text style={styles.resultUnit}>lbs</Text>
                  
                  {selectedLift && (
                    <View style={[
                      styles.strengthBadge,
                      { backgroundColor: getStrengthLevel(result.oneRM, selectedLift).color + '20' }
                    ]}>
                      <Text style={[
                        styles.strengthText,
                        { color: getStrengthLevel(result.oneRM, selectedLift).color }
                      ]}>
                        {getStrengthLevel(result.oneRM, selectedLift).level}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Percentage Table */}
                <Text style={styles.tableTitle}>Rep-Percentage Chart</Text>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText}>%1RM</Text>
                  <Text style={styles.tableHeaderText}>Weight</Text>
                  <Text style={styles.tableHeaderText}>Reps</Text>
                </View>
                {result.percentages.map((row, idx) => (
                  <View 
                    key={idx} 
                    style={[
                      styles.tableRow,
                      idx % 2 === 0 && styles.tableRowAlt,
                      row.percent === 100 && styles.tableRowHighlight,
                    ]}
                  >
                    <Text style={[
                      styles.tableCell,
                      row.percent === 100 && styles.tableCellHighlight,
                    ]}>
                      {row.percent}%
                    </Text>
                    <Text style={[
                      styles.tableCellWeight,
                      row.percent === 100 && styles.tableCellHighlight,
                    ]}>
                      {row.weight} lbs
                    </Text>
                    <Text style={styles.tableCell}>{row.reps}</Text>
                  </View>
                ))}

                {/* Training Recommendations */}
                <View style={styles.recommendationsContainer}>
                  <Text style={styles.recommendationsTitle}>💡 Training Tips</Text>
                  <View style={styles.recommendationCard}>
                    <Text style={styles.recommendationLabel}>Strength (85-95%)</Text>
                    <Text style={styles.recommendationValue}>
                      {Math.round(result.oneRM * 0.85)}-{Math.round(result.oneRM * 0.95)} lbs × 2-5 reps
                    </Text>
                  </View>
                  <View style={styles.recommendationCard}>
                    <Text style={styles.recommendationLabel}>Hypertrophy (70-80%)</Text>
                    <Text style={styles.recommendationValue}>
                      {Math.round(result.oneRM * 0.70)}-{Math.round(result.oneRM * 0.80)} lbs × 8-12 reps
                    </Text>
                  </View>
                  <View style={styles.recommendationCard}>
                    <Text style={styles.recommendationLabel}>Endurance (60-70%)</Text>
                    <Text style={styles.recommendationValue}>
                      {Math.round(result.oneRM * 0.60)}-{Math.round(result.oneRM * 0.70)} lbs × 15-20 reps
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Reset Button */}
            {result && (
              <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                <Text style={styles.resetButtonText}>Reset Calculator</Text>
              </TouchableOpacity>
            )}

            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Standalone Screen Version
const OneRMCalculatorScreen = ({ navigation }: { navigation: any }) => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [selectedFormula, setSelectedFormula] = useState('epley');
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [selectedLift, setSelectedLift] = useState<string | null>(null);

  const calculateOneRM = useCallback(() => {
    const w = parseFloat(weight);
    const r = parseInt(reps);

    if (isNaN(w) || isNaN(r) || w <= 0 || r <= 0 || r > 30) {
      return;
    }

    buttonPress();

    const formula = formulas[selectedFormula as keyof typeof formulas];
    const oneRM = Math.round(formula(w, r));

    const percentages = REP_PERCENTAGES.map(p => ({
      percent: p.percent,
      weight: Math.round(oneRM * (p.percent / 100)),
      reps: p.reps,
    }));

    setResult({
      weight: w,
      reps: r,
      oneRM,
      percentages,
    });

    successHaptic();
  }, [weight, reps, selectedFormula]);

  return (
    <View style={styles.screenContainer}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>1RM Calculator</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Lift Selection */}
        <Text style={styles.sectionTitle}>Select Exercise</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.liftsRow}>
          {COMMON_LIFTS.map(lift => (
            <TouchableOpacity
              key={lift.name}
              style={[
                styles.liftCard,
                selectedLift === lift.name && styles.liftCardActive,
              ]}
              onPress={() => {
                buttonPress();
                setSelectedLift(lift.name);
                setWeight(lift.avgMale.toString());
                setReps('5');
              }}
            >
              <Text style={styles.liftIcon}>{lift.icon}</Text>
              <Text style={[
                styles.liftName,
                selectedLift === lift.name && styles.liftNameActive,
              ]}>
                {lift.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Weight Lifted</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                placeholderTextColor="#9ca3af"
              />
              <Text style={styles.inputUnit}>lbs</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reps Performed</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={reps}
                onChangeText={setReps}
                maxLength={2}
                placeholderTextColor="#9ca3af"
              />
              <Text style={styles.inputUnit}>reps</Text>
            </View>
          </View>
        </View>

        {/* Quick Rep Buttons */}
        <View style={styles.quickRepsRow}>
          {[3, 5, 8, 10].map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.quickRepButton, reps === r.toString() && styles.quickRepActive]}
              onPress={() => {
                buttonPress();
                setReps(r.toString());
              }}
            >
              <Text style={[
                styles.quickRepText,
                reps === r.toString() && styles.quickRepTextActive,
              ]}>
                {r} reps
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Calculate Button */}
        <TouchableOpacity style={styles.calculateButton} onPress={calculateOneRM}>
          <Text style={styles.calculateButtonText}>Calculate 1RM</Text>
        </TouchableOpacity>

        {/* Results */}
        {result && (
          <View style={styles.resultContainer}>
            <View style={styles.mainResult}>
              <Text style={styles.resultLabel}>Estimated 1 Rep Max</Text>
              <Text style={styles.resultValue}>{result.oneRM}</Text>
              <Text style={styles.resultUnit}>lbs</Text>
            </View>

            <Text style={styles.tableTitle}>Rep-Percentage Chart</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>%1RM</Text>
              <Text style={styles.tableHeaderText}>Weight</Text>
              <Text style={styles.tableHeaderText}>Reps</Text>
            </View>
            {result.percentages.slice(0, 8).map((row, idx) => (
              <View 
                key={idx} 
                style={[
                  styles.tableRow,
                  idx % 2 === 0 && styles.tableRowAlt,
                  row.percent === 100 && styles.tableRowHighlight,
                ]}
              >
                <Text style={[
                  styles.tableCell,
                  row.percent === 100 && styles.tableCellHighlight,
                ]}>
                  {row.percent}%
                </Text>
                <Text style={[
                  styles.tableCellWeight,
                  row.percent === 100 && styles.tableCellHighlight,
                ]}>
                  {row.weight} lbs
                </Text>
                <Text style={styles.tableCell}>{row.reps}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  screenHeader: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
  screenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: '#6b7280',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  liftsRow: {
    marginBottom: 20,
  },
  liftCard: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  liftCardActive: {
    backgroundColor: '#d1fae5',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  liftIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  liftName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
  },
  liftNameActive: {
    color: '#10b981',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  inputUnit: {
    paddingRight: 14,
    fontSize: 14,
    color: '#6b7280',
  },
  quickRepsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  quickRepButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  quickRepActive: {
    backgroundColor: '#10b981',
  },
  quickRepText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  quickRepTextActive: {
    color: '#fff',
  },
  formulaSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formulaLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  formulaName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  formulaArrow: {
    fontSize: 12,
    color: '#6b7280',
  },
  formulaOptions: {
    marginBottom: 16,
  },
  formulaOption: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    marginBottom: 8,
  },
  formulaOptionActive: {
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  formulaOptionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  formulaOptionNameActive: {
    color: '#10b981',
  },
  formulaOptionDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  calculateButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  resultContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  mainResult: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 56,
    fontWeight: '800',
    color: '#10b981',
  },
  resultUnit: {
    fontSize: 18,
    color: '#6b7280',
  },
  strengthBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  strengthText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  tableRowAlt: {
    backgroundColor: '#fff',
  },
  tableRowHighlight: {
    backgroundColor: '#d1fae5',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  tableCellWeight: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  tableCellHighlight: {
    fontWeight: '700',
    color: '#10b981',
  },
  recommendationsContainer: {
    marginTop: 20,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  recommendationCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  recommendationLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  recommendationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  resetButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  bottomPadding: {
    height: 40,
  },
});

export { OneRMCalculator, OneRMCalculatorScreen };
export default OneRMCalculator;

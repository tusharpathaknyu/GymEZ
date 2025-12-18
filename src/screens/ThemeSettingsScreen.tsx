import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Switch,
} from 'react-native';
import { useTheme, THEMES, Theme } from '../context/ThemeContext';
import { buttonPress, successHaptic } from '../utils/haptics';

const { width } = Dimensions.get('window');

const ThemeSettingsScreen = ({ navigation }: any) => {
  const { theme, colors, setTheme, isDark, toggleDarkMode } = useTheme();
  const [showPreview, setShowPreview] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);

  const handleThemeSelect = (selectedTheme: Theme) => {
    buttonPress();
    if (selectedTheme.isPremium) {
      // Show premium modal or upgrade prompt
      return;
    }
    successHaptic();
    setTheme(selectedTheme.id);
  };

  const renderThemeCard = (themeOption: Theme) => {
    const isSelected = theme.id === themeOption.id;
    const previewColors = themeOption.colors;

    return (
      <TouchableOpacity
        key={themeOption.id}
        style={[
          styles.themeCard,
          { backgroundColor: colors.card, borderColor: isSelected ? colors.primary : colors.border },
          isSelected && styles.selectedCard,
        ]}
        onPress={() => handleThemeSelect(themeOption)}
        onLongPress={() => {
          buttonPress();
          setPreviewTheme(themeOption);
          setShowPreview(true);
        }}
        activeOpacity={0.8}
      >
        {themeOption.isPremium && (
          <View style={[styles.premiumBadge, { backgroundColor: colors.warning }]}>
            <Text style={styles.premiumText}>PRO</Text>
          </View>
        )}
        
        {isSelected && (
          <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.selectedText}>✓</Text>
          </View>
        )}
        
        {/* Theme Preview */}
        <View style={[styles.themePreview, { backgroundColor: previewColors.background }]}>
          {/* Mini app preview */}
          <View style={[styles.previewHeader, { backgroundColor: previewColors.surface }]}>
            <View style={[styles.previewDot, { backgroundColor: previewColors.primary }]} />
            <View style={[styles.previewTitle, { backgroundColor: previewColors.textMuted }]} />
          </View>
          
          <View style={styles.previewContent}>
            <View style={[styles.previewCard, { backgroundColor: previewColors.card }]}>
              <View style={[styles.previewLine, { backgroundColor: previewColors.text, width: '60%' }]} />
              <View style={[styles.previewLine, { backgroundColor: previewColors.textSecondary, width: '80%' }]} />
            </View>
            <View style={[styles.previewCard, { backgroundColor: previewColors.card }]}>
              <View style={[styles.previewLine, { backgroundColor: previewColors.text, width: '50%' }]} />
              <View style={[styles.previewLine, { backgroundColor: previewColors.textSecondary, width: '70%' }]} />
            </View>
          </View>
          
          <View style={[styles.previewTabBar, { backgroundColor: previewColors.tabBar }]}>
            <View style={[styles.previewTab, { backgroundColor: previewColors.tabBarActive }]} />
            <View style={[styles.previewTab, { backgroundColor: previewColors.tabBarInactive }]} />
            <View style={[styles.previewTabCenter, { backgroundColor: previewColors.primary }]} />
            <View style={[styles.previewTab, { backgroundColor: previewColors.tabBarInactive }]} />
            <View style={[styles.previewTab, { backgroundColor: previewColors.tabBarInactive }]} />
          </View>
        </View>
        
        <View style={styles.themeInfo}>
          <Text style={styles.themeIcon}>{themeOption.icon}</Text>
          <Text style={[styles.themeName, { color: colors.text }]}>{themeOption.name}</Text>
        </View>
        
        {/* Color swatches */}
        <View style={styles.colorSwatches}>
          <View style={[styles.swatch, { backgroundColor: previewColors.primary }]} />
          <View style={[styles.swatch, { backgroundColor: previewColors.secondary }]} />
          <View style={[styles.swatch, { backgroundColor: previewColors.accent }]} />
          <View style={[styles.swatch, { backgroundColor: previewColors.background }]} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderQuickToggle = () => (
    <View style={[styles.quickToggle, { backgroundColor: colors.card }]}>
      <View style={styles.toggleInfo}>
        <Text style={styles.toggleIcon}>🌙</Text>
        <View>
          <Text style={[styles.toggleTitle, { color: colors.text }]}>Dark Mode</Text>
          <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
            {isDark ? 'Currently using dark theme' : 'Switch to dark theme'}
          </Text>
        </View>
      </View>
      <Switch
        value={isDark}
        onValueChange={() => {
          buttonPress();
          toggleDarkMode();
        }}
        trackColor={{ false: colors.border, true: colors.primary + '50' }}
        thumbColor={isDark ? colors.primary : '#f4f4f5'}
      />
    </View>
  );

  const renderAccentColorPicker = () => {
    const accentColors = [
      { color: '#10b981', name: 'Emerald' },
      { color: '#6366f1', name: 'Indigo' },
      { color: '#f59e0b', name: 'Amber' },
      { color: '#ef4444', name: 'Red' },
      { color: '#8b5cf6', name: 'Purple' },
      { color: '#ec4899', name: 'Pink' },
      { color: '#0ea5e9', name: 'Sky' },
      { color: '#22c55e', name: 'Green' },
    ];

    return (
      <View style={[styles.accentSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Accent Color</Text>
        <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
          Customize your primary color
        </Text>
        <View style={styles.accentGrid}>
          {accentColors.map((accent) => (
            <TouchableOpacity
              key={accent.color}
              style={[
                styles.accentButton,
                { backgroundColor: accent.color },
                colors.primary === accent.color && styles.accentSelected,
              ]}
              onPress={() => buttonPress()}
            >
              {colors.primary === accent.color && (
                <Text style={styles.accentCheck}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.card }]}>
          <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Appearance</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Quick Dark Mode Toggle */}
        <View style={styles.section}>
          {renderQuickToggle()}
        </View>

        {/* Theme Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🎨 Choose Theme</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Long press to preview
          </Text>
          
          <View style={styles.themesGrid}>
            {THEMES.filter(t => !t.isPremium).map(renderThemeCard)}
          </View>
          
          {/* Premium Themes */}
          <Text style={[styles.premiumTitle, { color: colors.text }]}>✨ Premium Themes</Text>
          <View style={styles.themesGrid}>
            {THEMES.filter(t => t.isPremium).map(renderThemeCard)}
          </View>
        </View>

        {/* Accent Color */}
        <View style={styles.section}>
          {renderAccentColorPicker()}
        </View>

        {/* Additional Options */}
        <View style={styles.section}>
          <View style={[styles.optionsCard, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.optionRow} onPress={() => buttonPress()}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionIcon}>🔤</Text>
                <Text style={[styles.optionText, { color: colors.text }]}>Font Size</Text>
              </View>
              <Text style={[styles.optionValue, { color: colors.textSecondary }]}>Medium →</Text>
            </TouchableOpacity>
            
            <View style={[styles.optionDivider, { backgroundColor: colors.divider }]} />
            
            <TouchableOpacity style={styles.optionRow} onPress={() => buttonPress()}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionIcon}>🎭</Text>
                <Text style={[styles.optionText, { color: colors.text }]}>Icon Style</Text>
              </View>
              <Text style={[styles.optionValue, { color: colors.textSecondary }]}>Emoji →</Text>
            </TouchableOpacity>
            
            <View style={[styles.optionDivider, { backgroundColor: colors.divider }]} />
            
            <TouchableOpacity style={styles.optionRow} onPress={() => buttonPress()}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionIcon}>📱</Text>
                <Text style={[styles.optionText, { color: colors.text }]}>Follow System</Text>
              </View>
              <Switch
                value={false}
                onValueChange={() => buttonPress()}
                trackColor={{ false: colors.border, true: colors.primary + '50' }}
                thumbColor={'#f4f4f5'}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  sectionSubtitle: { fontSize: 12, marginBottom: 16 },
  
  // Quick Toggle
  quickToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
  },
  toggleInfo: { flexDirection: 'row', alignItems: 'center' },
  toggleIcon: { fontSize: 24, marginRight: 12 },
  toggleTitle: { fontSize: 14, fontWeight: '600' },
  toggleDesc: { fontSize: 12, marginTop: 2 },
  
  // Themes Grid
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  themeCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    position: 'relative',
  },
  selectedCard: { borderWidth: 2 },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  premiumText: { fontSize: 10, fontWeight: 'bold', color: '#1f2937' },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  selectedText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  
  // Theme Preview
  themePreview: {
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  previewHeader: {
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  previewDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  previewTitle: { width: 40, height: 6, borderRadius: 3 },
  previewContent: { flex: 1, padding: 8, gap: 6 },
  previewCard: { borderRadius: 6, padding: 6 },
  previewLine: { height: 4, borderRadius: 2, marginBottom: 4 },
  previewTabBar: { height: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 12 },
  previewTab: { width: 16, height: 4, borderRadius: 2 },
  previewTabCenter: { width: 20, height: 20, borderRadius: 10 },
  
  themeInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  themeIcon: { fontSize: 20, marginRight: 8 },
  themeName: { fontSize: 14, fontWeight: '600' },
  
  colorSwatches: { flexDirection: 'row', gap: 6 },
  swatch: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(0,0,0,0.1)' },
  
  premiumTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12, marginTop: 8 },
  
  // Accent Color
  accentSection: { borderRadius: 16, padding: 16 },
  sectionLabel: { fontSize: 14, fontWeight: '600' },
  sectionDesc: { fontSize: 12, marginTop: 4, marginBottom: 16 },
  accentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  accentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentSelected: { borderWidth: 3, borderColor: '#fff' },
  accentCheck: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  // Options
  optionsCard: { borderRadius: 16, overflow: 'hidden' },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionInfo: { flexDirection: 'row', alignItems: 'center' },
  optionIcon: { fontSize: 20, marginRight: 12 },
  optionText: { fontSize: 14 },
  optionValue: { fontSize: 13 },
  optionDivider: { height: 1, marginLeft: 48 },
});

export default ThemeSettingsScreen;

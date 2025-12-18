import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { buttonPress } from '../utils/haptics';

const { width } = Dimensions.get('window');

interface AIFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string[];
  screen: string;
  badge?: string;
}

const AI_FEATURES: AIFeature[] = [
  {
    id: 'coach',
    title: 'AI Coach',
    description: 'Get instant answers to your fitness questions',
    icon: '🤖',
    color: '#8b5cf6',
    gradient: ['#8b5cf6', '#6d28d9'],
    screen: 'AICoach',
    badge: 'Chat',
  },
  {
    id: 'workout',
    title: 'Workout Generator',
    description: 'Custom workouts based on your goals & equipment',
    icon: '💪',
    color: '#10b981',
    gradient: ['#10b981', '#059669'],
    screen: 'AIWorkoutGenerator',
    badge: 'New',
  },
  {
    id: 'insights',
    title: 'Progress Insights',
    description: 'Smart analysis of your workout data & trends',
    icon: '📊',
    color: '#3b82f6',
    gradient: ['#3b82f6', '#2563eb'],
    screen: 'AIProgressInsights',
    badge: 'Analytics',
  },
  {
    id: 'meal',
    title: 'Meal Planner',
    description: 'Personalized meal plans to match your macros',
    icon: '🍽️',
    color: '#f59e0b',
    gradient: ['#f59e0b', '#d97706'],
    screen: 'AIMealPlanner',
    badge: 'Nutrition',
  },
];

const QUICK_ACTIONS = [
  { id: 'generate', label: 'Generate Workout', icon: '⚡', screen: 'AIWorkoutGenerator' },
  { id: 'ask', label: 'Ask AI Coach', icon: '💬', screen: 'AICoach' },
  { id: 'analyze', label: 'View Insights', icon: '📈', screen: 'AIProgressInsights' },
  { id: 'plan', label: 'Plan Meals', icon: '🥗', screen: 'AIMealPlanner' },
];

const AI_TIPS = [
  '💡 Ask the AI Coach about proper form for any exercise',
  '🎯 Generate workouts specific to your available equipment',
  '📊 Check your progress insights weekly for best results',
  '🍎 Let AI create meal plans that fit your macro goals',
];

const AIHubScreen = ({ navigation }: { navigation: any }) => {
  const renderFeatureCard = (feature: AIFeature) => (
    <TouchableOpacity
      key={feature.id}
      style={[styles.featureCard, { borderColor: feature.color + '40' }]}
      onPress={() => {
        buttonPress();
        navigation.navigate(feature.screen);
      }}
      activeOpacity={0.8}
    >
      <View style={[styles.featureIconContainer, { backgroundColor: feature.color + '15' }]}>
        <Text style={styles.featureIcon}>{feature.icon}</Text>
      </View>
      <View style={styles.featureContent}>
        <View style={styles.featureTitleRow}>
          <Text style={styles.featureTitle}>{feature.title}</Text>
          {feature.badge && (
            <View style={[styles.featureBadge, { backgroundColor: feature.color }]}>
              <Text style={styles.featureBadgeText}>{feature.badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
      <Text style={[styles.featureArrow, { color: feature.color }]}>→</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Features</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <Text style={styles.heroIcon}>🧠</Text>
          </View>
          <Text style={styles.heroTitle}>Your AI Fitness Assistant</Text>
          <Text style={styles.heroSubtitle}>
            Powered by artificial intelligence to help you achieve your fitness goals faster
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map(action => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionButton}
                onPress={() => {
                  buttonPress();
                  navigation.navigate(action.screen);
                }}
              >
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>AI Features</Text>
          {AI_FEATURES.map(renderFeatureCard)}
        </View>

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>✨ AI Tips</Text>
          {AI_TIPS.map((tip, index) => (
            <Text key={index} style={styles.tipItem}>{tip}</Text>
          ))}
        </View>

        {/* Coming Soon */}
        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonTitle}>🚀 Coming Soon</Text>
          <View style={styles.comingSoonFeature}>
            <Text style={styles.comingSoonIcon}>📸</Text>
            <View style={styles.comingSoonInfo}>
              <Text style={styles.comingSoonName}>Form Analyzer</Text>
              <Text style={styles.comingSoonDesc}>AI-powered exercise form feedback</Text>
            </View>
          </View>
          <View style={styles.comingSoonFeature}>
            <Text style={styles.comingSoonIcon}>🎯</Text>
            <View style={styles.comingSoonInfo}>
              <Text style={styles.comingSoonName}>Smart Periodization</Text>
              <Text style={styles.comingSoonDesc}>AI-optimized training cycles</Text>
            </View>
          </View>
          <View style={styles.comingSoonFeature}>
            <Text style={styles.comingSoonIcon}>💬</Text>
            <View style={styles.comingSoonInfo}>
              <Text style={styles.comingSoonName}>Voice Commands</Text>
              <Text style={styles.comingSoonDesc}>Hands-free workout assistance</Text>
            </View>
          </View>
        </View>

        {/* WhatsApp Integration Banner */}
        <TouchableOpacity
          style={styles.whatsappBanner}
          onPress={() => {
            buttonPress();
            navigation.navigate('WhatsAppIntegration');
          }}
          activeOpacity={0.8}
        >
          <View style={styles.whatsappIconContainer}>
            <Text style={styles.whatsappIcon}>💬</Text>
          </View>
          <View style={styles.whatsappContent}>
            <Text style={styles.whatsappTitle}>WhatsApp Meal Tracker</Text>
            <Text style={styles.whatsappSubtitle}>Send food photos on WhatsApp for instant analysis!</Text>
          </View>
          <Text style={styles.whatsappArrow}>→</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: '#8b5cf6',
    padding: 24,
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 32,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIcon: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  quickActionsSection: {
    padding: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickActionButton: {
    width: (width - 50) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  quickActionIcon: {
    fontSize: 22,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  featuresSection: {
    padding: 20,
    paddingTop: 12,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureContent: {
    flex: 1,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  featureBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  featureBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  featureDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 18,
  },
  featureArrow: {
    fontSize: 22,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipsCard: {
    marginHorizontal: 20,
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 12,
  },
  tipItem: {
    fontSize: 13,
    color: '#92400e',
    marginBottom: 8,
    lineHeight: 18,
  },
  comingSoonCard: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  comingSoonTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  comingSoonFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  comingSoonIcon: {
    fontSize: 24,
    marginRight: 12,
    opacity: 0.6,
  },
  comingSoonInfo: {
    flex: 1,
  },
  comingSoonName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  comingSoonDesc: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  // WhatsApp Banner Styles
  whatsappBanner: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#25D366',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  whatsappIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  whatsappIcon: {
    fontSize: 24,
  },
  whatsappContent: {
    flex: 1,
  },
  whatsappTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  whatsappSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  whatsappArrow: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
});

export default AIHubScreen;

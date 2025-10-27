import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useAuth} from '../services/auth';
import PRDashboard from '../components/PRDashboard';
import PRLogForm from '../components/PRLogForm';
import PRAnalytics from '../components/PRAnalytics';
import PRGoals from '../components/PRGoals';

const PRScreen = () => {
  const {user} = useAuth();
  const [showPRForm, setShowPRForm] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'analytics' | 'goals'>('dashboard');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Personal Records 🏆</Text>
          <Text style={styles.headerSubtitle}>Track and improve your best lifts</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowPRForm(true)}
        >
          <Text style={styles.addButtonText}>➕ Log PR</Text>
        </TouchableOpacity>
      </View>

      {/* View Toggle */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeView === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveView('dashboard')}
        >
          <Text style={[styles.tabText, activeView === 'dashboard' && styles.activeTabText]}>
            📊 Dashboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeView === 'analytics' && styles.activeTab]}
          onPress={() => setActiveView('analytics')}
        >
          <Text style={[styles.tabText, activeView === 'analytics' && styles.activeTabText]}>
            📈 Analytics
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeView === 'goals' && styles.activeTab]}
          onPress={() => setActiveView('goals')}
        >
          <Text style={[styles.tabText, activeView === 'goals' && styles.activeTabText]}>
            🎯 Goals
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeView === 'dashboard' && <PRDashboard />}
        {activeView === 'analytics' && <PRAnalytics />}
        {activeView === 'goals' && <PRGoals />}
      </ScrollView>

      {/* PR Log Form Modal */}
      <PRLogForm
        visible={showPRForm}
        onClose={() => setShowPRForm(false)}
        onSuccess={() => setShowPRForm(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#ecfdf5',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#10b981',
  },
  content: {
    flex: 1,
  },
});

export default PRScreen;

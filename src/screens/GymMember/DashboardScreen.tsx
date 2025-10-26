import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

const GymMemberDashboard = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Dashboard</Text>
          <Text style={styles.headerSubtitle}>Welcome back, Member!</Text>
        </View>

        <View style={styles.membershipCard}>
          <Text style={styles.cardTitle}>Active Membership</Text>
          <View style={styles.membershipInfo}>
            <Text style={styles.gymName}>FitZone Gym</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.badgeText}>ACTIVE</Text>
            </View>
          </View>
          <View style={styles.membershipDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Plan:</Text>
              <Text style={styles.detailValue}>Monthly Premium</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Valid Until:</Text>
              <Text style={styles.detailValue}>Dec 31, 2025</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Member ID:</Text>
              <Text style={styles.detailValue}>MEM-2024-001</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🏋️</Text>
            <Text style={styles.actionText}>Check-In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionText}>Book Classes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>💳</Text>
            <Text style={styles.actionText}>View Payments</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>✅</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Checked in at FitZone</Text>
              <Text style={styles.activityTime}>Today, 6:00 AM</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>📅</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Booked Yoga Class</Text>
              <Text style={styles.activityTime}>Yesterday</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>💪</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Completed workout session</Text>
              <Text style={styles.activityTime}>2 days ago</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#50C878',
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },
  membershipCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  membershipInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  gymName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  activeBadge: {
    backgroundColor: '#50C878',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  membershipDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  section: {
    padding: 15,
    paddingTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  actionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  activityItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 3,
  },
});

export default GymMemberDashboard;

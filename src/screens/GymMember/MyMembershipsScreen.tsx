import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {Membership} from '../../types';

const MyMembershipsScreen = () => {
  const memberships: Membership[] = [
    {
      id: '1',
      gymId: 'gym1',
      gymName: 'FitZone Gym',
      memberId: 'member1',
      startDate: '2024-01-01',
      endDate: '2025-12-31',
      type: 'annual',
      status: 'active',
    },
    {
      id: '2',
      gymId: 'gym2',
      gymName: 'YogaFlex Studio',
      memberId: 'member1',
      startDate: '2024-10-01',
      endDate: '2025-01-01',
      type: 'quarterly',
      status: 'active',
    },
    {
      id: '3',
      gymId: 'gym3',
      gymName: 'PowerHouse Fitness',
      memberId: 'member1',
      startDate: '2023-06-01',
      endDate: '2024-06-01',
      type: 'annual',
      status: 'expired',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#50C878';
      case 'expired':
        return '#FF6B6B';
      case 'cancelled':
        return '#999';
      default:
        return '#666';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly':
        return 'Monthly Plan';
      case 'quarterly':
        return 'Quarterly Plan';
      case 'annual':
        return 'Annual Plan';
      default:
        return type;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Memberships</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Memberships</Text>
          {memberships
            .filter(m => m.status === 'active')
            .map(membership => (
              <TouchableOpacity
                key={membership.id}
                style={styles.membershipCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.gymName}>{membership.gymName}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {backgroundColor: getStatusColor(membership.status)},
                    ]}>
                    <Text style={styles.statusText}>
                      {membership.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Plan:</Text>
                    <Text style={styles.detailValue}>
                      {getTypeLabel(membership.type)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Start Date:</Text>
                    <Text style={styles.detailValue}>
                      {membership.startDate}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Valid Until:</Text>
                    <Text style={styles.detailValue}>{membership.endDate}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.renewButton}>
                  <Text style={styles.renewButtonText}>Manage</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past Memberships</Text>
          {memberships
            .filter(m => m.status !== 'active')
            .map(membership => (
              <View key={membership.id} style={styles.membershipCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.gymName}>{membership.gymName}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {backgroundColor: getStatusColor(membership.status)},
                    ]}>
                    <Text style={styles.statusText}>
                      {membership.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Plan:</Text>
                    <Text style={styles.detailValue}>
                      {getTypeLabel(membership.type)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Expired On:</Text>
                    <Text style={styles.detailValue}>{membership.endDate}</Text>
                  </View>
                </View>
              </View>
            ))}
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
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  membershipCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gymName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardBody: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
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
  renewButton: {
    backgroundColor: '#50C878',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  renewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default MyMembershipsScreen;

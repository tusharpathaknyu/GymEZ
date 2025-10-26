import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {Member} from '../../types';

const MembersScreen = () => {
  // Sample data
  const members: Member[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-0101',
      membershipId: 'M001',
      joinDate: '2024-01-15',
      status: 'active',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '555-0102',
      membershipId: 'M002',
      joinDate: '2024-02-20',
      status: 'active',
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '555-0103',
      membershipId: 'M003',
      joinDate: '2023-12-10',
      status: 'active',
    },
    {
      id: '4',
      name: 'Alice Brown',
      email: 'alice@example.com',
      membershipId: 'M004',
      joinDate: '2024-03-05',
      status: 'inactive',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Members</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Member</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView}>
        {members.map(member => (
          <TouchableOpacity key={member.id} style={styles.memberCard}>
            <View style={styles.memberHeader}>
              <View>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberEmail}>{member.email}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  member.status === 'active'
                    ? styles.activeBadge
                    : styles.inactiveBadge,
                ]}>
                <Text style={styles.statusText}>
                  {member.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.memberDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Member ID:</Text>
                <Text style={styles.detailValue}>{member.membershipId}</Text>
              </View>
              {member.phone && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone:</Text>
                  <Text style={styles.detailValue}>{member.phone}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Join Date:</Text>
                <Text style={styles.detailValue}>{member.joinDate}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    backgroundColor: '#4A90E2',
    padding: 20,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#4A90E2',
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  memberCard: {
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
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#50C878',
  },
  inactiveBadge: {
    backgroundColor: '#FF6B6B',
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  memberDetails: {
    marginTop: 5,
  },
  detailRow: {
    flexDirection: 'row',
    marginTop: 5,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    width: 90,
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
});

export default MembersScreen;

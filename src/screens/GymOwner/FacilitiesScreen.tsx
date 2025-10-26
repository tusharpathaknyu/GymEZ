import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

const FacilitiesScreen = () => {
  const facilities = [
    {id: '1', name: 'Cardio Zone', equipment: 20, status: 'operational'},
    {id: '2', name: 'Weight Training', equipment: 35, status: 'operational'},
    {id: '3', name: 'Yoga Studio', equipment: 15, status: 'operational'},
    {
      id: '4',
      name: 'Swimming Pool',
      equipment: 0,
      status: 'maintenance',
    },
    {id: '5', name: 'Sauna', equipment: 0, status: 'operational'},
    {id: '6', name: 'Basketball Court', equipment: 0, status: 'operational'},
    {id: '7', name: 'Spinning Room', equipment: 25, status: 'operational'},
    {id: '8', name: 'Personal Training', equipment: 10, status: 'operational'},
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Facilities</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView}>
        {facilities.map(facility => (
          <TouchableOpacity key={facility.id} style={styles.facilityCard}>
            <View style={styles.facilityHeader}>
              <Text style={styles.facilityName}>{facility.name}</Text>
              <View
                style={[
                  styles.statusDot,
                  facility.status === 'operational'
                    ? styles.operationalDot
                    : styles.maintenanceDot,
                ]}
              />
            </View>
            <View style={styles.facilityDetails}>
              <Text style={styles.detailText}>
                Equipment: {facility.equipment > 0 ? facility.equipment : 'N/A'}
              </Text>
              <Text
                style={[
                  styles.statusText,
                  facility.status === 'operational'
                    ? styles.operationalText
                    : styles.maintenanceText,
                ]}>
                {facility.status === 'operational'
                  ? 'Operational'
                  : 'Under Maintenance'}
              </Text>
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
    paddingHorizontal: 20,
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
  facilityCard: {
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
  facilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  operationalDot: {
    backgroundColor: '#50C878',
  },
  maintenanceDot: {
    backgroundColor: '#FFA500',
  },
  facilityDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  operationalText: {
    color: '#50C878',
  },
  maintenanceText: {
    color: '#FFA500',
  },
});

export default FacilitiesScreen;

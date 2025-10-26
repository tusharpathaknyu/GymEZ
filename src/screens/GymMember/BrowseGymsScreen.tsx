import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {Gym} from '../../types';

const BrowseGymsScreen = () => {
  const gyms: Gym[] = [
    {
      id: '1',
      name: 'FitZone Gym',
      address: '123 Fitness St, New York, NY',
      description: 'Modern gym with state-of-the-art equipment',
      ownerId: 'owner1',
      facilities: ['Cardio', 'Weights', 'Pool', 'Sauna'],
      pricing: {
        monthly: 50,
        quarterly: 140,
        annual: 500,
      },
      rating: 4.5,
    },
    {
      id: '2',
      name: 'PowerHouse Fitness',
      address: '456 Strength Ave, New York, NY',
      description: 'Premium weightlifting and powerlifting facility',
      ownerId: 'owner2',
      facilities: ['Weights', 'Personal Training', 'Nutrition'],
      pricing: {
        monthly: 75,
        quarterly: 210,
        annual: 750,
      },
      rating: 4.8,
    },
    {
      id: '3',
      name: 'YogaFlex Studio',
      address: '789 Wellness Rd, New York, NY',
      description: 'Yoga and mindfulness center',
      ownerId: 'owner3',
      facilities: ['Yoga', 'Meditation', 'Pilates'],
      pricing: {
        monthly: 40,
        quarterly: 110,
        annual: 400,
      },
      rating: 4.7,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse Gyms</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        {gyms.map(gym => (
          <TouchableOpacity key={gym.id} style={styles.gymCard}>
            <View style={styles.gymHeader}>
              <View style={styles.gymInfo}>
                <Text style={styles.gymName}>{gym.name}</Text>
                {gym.rating && (
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingIcon}>⭐</Text>
                    <Text style={styles.ratingText}>{gym.rating}</Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.gymAddress}>{gym.address}</Text>
            <Text style={styles.gymDescription}>{gym.description}</Text>
            <View style={styles.facilitiesContainer}>
              {gym.facilities.map((facility, index) => (
                <View key={index} style={styles.facilityTag}>
                  <Text style={styles.facilityText}>{facility}</Text>
                </View>
              ))}
            </View>
            <View style={styles.pricingContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Monthly:</Text>
                <Text style={styles.priceValue}>${gym.pricing.monthly}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Annual:</Text>
                <Text style={styles.priceValue}>${gym.pricing.annual}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.joinButton}>
              <Text style={styles.joinButtonText}>View Details</Text>
            </TouchableOpacity>
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
    padding: 15,
  },
  gymCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  gymHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  gymInfo: {
    flex: 1,
  },
  gymName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: 14,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  gymAddress: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  gymDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  facilityTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  facilityText: {
    fontSize: 12,
    color: '#50C878',
    fontWeight: '500',
  },
  pricingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginBottom: 12,
  },
  priceRow: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#50C878',
    marginTop: 4,
  },
  joinButton: {
    backgroundColor: '#50C878',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BrowseGymsScreen;

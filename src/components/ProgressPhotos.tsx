import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';

interface PhotoEntry {
  id: string;
  date: string;
  photoUrl: string;
  caption?: string;
}

const ProgressPhotos = () => {
  const [photos, _setPhotos] = useState<PhotoEntry[]>([]);

  const handleAddPhoto = () => {
    Alert.alert(
      'Add Progress Photo',
      'Take a new photo or select from gallery to track your progress visually.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => console.log('Open camera') },
        {
          text: 'Choose from Gallery',
          onPress: () => console.log('Open gallery'),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Progress Photos 📸</Text>
          <Text style={styles.subtitle}>
            Track your transformation with before/after photos
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPhoto}>
          <Text style={styles.addButtonText}>➕ Add</Text>
        </TouchableOpacity>
      </View>

      {photos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📸</Text>
          <Text style={styles.emptyTitle}>No Photos Yet</Text>
          <Text style={styles.emptyDescription}>
            Start documenting your fitness journey with progress photos
          </Text>
          <TouchableOpacity
            style={styles.addButtonLarge}
            onPress={handleAddPhoto}
          >
            <Text style={styles.addButtonText}>Add Your First Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {photos.map(photo => (
            <View key={photo.id} style={styles.photoCard}>
              <Image source={{ uri: photo.photoUrl }} style={styles.photo} />
              <Text style={styles.photoDate}>
                {new Date(photo.date).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  addButtonLarge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  photoCard: {
    marginRight: 16,
  },
  photo: {
    width: 120,
    height: 160,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  photoDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ProgressPhotos;

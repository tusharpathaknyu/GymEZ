import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');

interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  timestamp: Date;
}

const StoryView = () => {
  const [stories] = useState<Story[]>([]);

  const handleAddStory = () => {
    // Open story creation
    console.log('Open story camera');
  };

  const handleViewStory = (story: Story) => {
    // Open full screen story viewer
    console.log('View story:', story.id);
  };

  if (stories.length === 0) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.storyCircle, styles.addStoryCircle]}
          onPress={handleAddStory}
        >
          <Text style={styles.addIcon}>➕</Text>
        </TouchableOpacity>
        <Text style={styles.emptyText}>Tap to add your story</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesList}
      >
        <TouchableOpacity
          style={[styles.storyCircle, styles.addStoryCircle]}
          onPress={handleAddStory}
        >
          <Text style={styles.addIcon}>➕</Text>
          <Text style={styles.addLabel}>Add</Text>
        </TouchableOpacity>

        {stories.map(story => (
          <TouchableOpacity
            key={story.id}
            style={styles.storyCircle}
            onPress={() => handleViewStory(story)}
          >
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {story.userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.userName} numberOfLines={1}>
              {story.userName.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  storiesList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  storyCircle: {
    alignItems: 'center',
  },
  addStoryCircle: {
    marginRight: 8,
  },
  addIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  addLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#10b981',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 11,
    color: '#111827',
    marginTop: 4,
    maxWidth: 70,
  },
  emptyText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 16,
  },
});

export default StoryView;


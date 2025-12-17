import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

interface VideoRecorderProps {
  visible: boolean;
  onClose: () => void;
  onVideoRecorded: (
    videoUri: string,
    title: string,
    description: string,
    exerciseType: string,
    duration: number,
  ) => void;
  exerciseType?: string;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  visible,
  onClose,
  onVideoRecorded,
  exerciseType,
}) => {
  const handleRecord = () => {
    // Placeholder for video recording functionality
    onVideoRecorded(
      'placeholder-video-path.mp4',
      'Sample Workout Video',
      'Recorded with placeholder camera',
      exerciseType || 'general',
      30,
    );
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Record Workout Video</Text>
        </View>

        <View style={styles.cameraContainer}>
          <Text style={styles.placeholderText}>
            Camera functionality will be available{'\n'}
            after installing react-native-vision-camera
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.recordButton} onPress={handleRecord}>
            <Text style={styles.recordButtonText}>Record</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  controls: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VideoRecorder;

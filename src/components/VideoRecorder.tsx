import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  TextInput,
  Modal,
  ActivityIndicator,
  Switch,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {Platform} from 'react-native';
import {PersonalRecordsService} from '../services/personalRecordsService';
import {SocialService} from '../services/socialService';
import {useAuth} from '../services/auth';
import {ExerciseType} from '../types';

interface VideoRecorderProps {
  visible: boolean;
  onClose: () => void;
  onVideoRecorded: (videoUri: string, title: string, description: string, exerciseType: string, duration: number) => void;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  visible,
  onClose,
  onVideoRecorded,
}) => {
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'back');

  const {user} = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [exerciseType, setExerciseType] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
  
  // PR submission states
  const [isForPR, setIsForPR] = useState(false);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [prExerciseType, setPrExerciseType] = useState<ExerciseType>('benchpress');
  const [makePost, setMakePost] = useState(false);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  useEffect(() => {
    if (isRecording) {
      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      setRecordingTimer(timer);
    } else if (recordingTimer) {
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }
    
    return () => {
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
    };
  }, [isRecording]);

  const checkCameraPermission = async () => {
    const cameraPermission = Platform.OS === 'ios' 
      ? PERMISSIONS.IOS.CAMERA 
      : PERMISSIONS.ANDROID.CAMERA;
    
    const microphonePermission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.MICROPHONE
      : PERMISSIONS.ANDROID.RECORD_AUDIO;

    const cameraStatus = await check(cameraPermission);
    const microphoneStatus = await check(microphonePermission);

    if (cameraStatus === RESULTS.GRANTED && microphoneStatus === RESULTS.GRANTED) {
      setHasPermission(true);
    } else {
      requestPermissions();
    }
  };

  const requestPermissions = async () => {
    const cameraPermission = Platform.OS === 'ios' 
      ? PERMISSIONS.IOS.CAMERA 
      : PERMISSIONS.ANDROID.CAMERA;
    
    const microphonePermission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.MICROPHONE
      : PERMISSIONS.ANDROID.RECORD_AUDIO;

    const cameraResult = await request(cameraPermission);
    const microphoneResult = await request(microphonePermission);

    if (cameraResult === RESULTS.GRANTED && microphoneResult === RESULTS.GRANTED) {
      setHasPermission(true);
    } else {
      Alert.alert(
        'Permission Required',
        'Camera and microphone permissions are required to record videos.',
        [{text: 'OK', onPress: onClose}]
      );
    }
  };

  const startRecording = async () => {
    if (!camera.current || !device) return;

    try {
      setIsRecording(true);
      setRecordingDuration(0);
      
      const video = await camera.current.startRecording({
        flash: 'off',
        onRecordingFinished: (video) => {
          setRecordedVideoUri(video.path);
          setShowDetails(true);
          setIsRecording(false);
        },
        onRecordingError: (error) => {
          console.error('Recording error:', error);
          setIsRecording(false);
          Alert.alert('Error', 'Failed to record video');
        },
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!camera.current) return;

    try {
      await camera.current.stopRecording();
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const handleSaveVideo = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your video');
      return;
    }

    if (!exerciseType.trim()) {
      Alert.alert('Error', 'Please enter the exercise type');
      return;
    }

    // Validate PR fields if this is a PR video
    if (isForPR) {
      if (!weight.trim() || !reps.trim()) {
        Alert.alert('Error', 'Please enter weight and reps for your PR');
        return;
      }

      const weightNum = parseFloat(weight);
      const repsNum = parseInt(reps);

      if (isNaN(weightNum) || isNaN(repsNum) || weightNum <= 0 || repsNum <= 0) {
        Alert.alert('Error', 'Please enter valid weight and reps');
        return;
      }

      try {
        // Submit PR first
        const newPR = await PersonalRecordsService.createPR(
          user!.id,
          prExerciseType,
          weightNum,
          repsNum,
          recordedVideoUri
        );

        // Create post if requested and PR was accepted/is new best
        if (makePost && newPR) {
          const prText = `New ${prExerciseType} PR: ${weightNum}lbs x ${repsNum} reps! 💪`;
          await SocialService.createPost(
            user!.id,
            `${title}\n\n${prText}\n\n${description}`,
            'pr_achievement',
            undefined, // video will be handled separately
            newPR.id,
            user!.gym_id
          );
        }

        Alert.alert(
          'Success!', 
          newPR ? 'New PR recorded and video saved!' : 'Video saved!',
          [{text: 'OK', onPress: () => {
            onVideoRecorded(recordedVideoUri, title, description, exerciseType, recordingDuration);
            resetRecorder();
            onClose();
          }}]
        );
      } catch (error) {
        console.error('Error saving PR:', error);
        Alert.alert('Error', 'Failed to save PR. Please try again.');
        return;
      }
    } else {
      onVideoRecorded(recordedVideoUri, title, description, exerciseType, recordingDuration);
      resetRecorder();
      onClose();
    }
  };

  const resetRecorder = () => {
    setRecordedVideoUri('');
    setTitle('');
    setDescription('');
    setExerciseType('');
    setIsForPR(false);
    setWeight('');
    setReps('');
    setPrExerciseType('benchpress');
    setMakePost(false);
    setRecordingDuration(0);
    setShowDetails(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!visible) return null;

  if (!hasPermission) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Camera and microphone permissions are required
          </Text>
          <TouchableOpacity style={styles.button} onPress={checkCameraPermission}>
            <Text style={styles.buttonText}>Grant Permissions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  if (showDetails) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Video Details</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Video Title *"
            value={title}
            onChangeText={setTitle}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Exercise Type *"
            value={exerciseType}
            onChangeText={setExerciseType}
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          {/* PR Submission Section */}
          <View style={styles.prSection}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Submit as Personal Record</Text>
              <Switch
                value={isForPR}
                onValueChange={setIsForPR}
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={isForPR ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>

            {isForPR && (
              <View style={styles.prForm}>
                <View style={styles.exerciseTypeContainer}>
                  <Text style={styles.fieldLabel}>Exercise Type:</Text>
                  <View style={styles.exerciseButtons}>
                    {(['benchpress', 'squat', 'deadlift', 'pullup', 'pushup', 'dip'] as ExerciseType[]).map(exercise => (
                      <TouchableOpacity
                        key={exercise}
                        style={[
                          styles.exerciseButton,
                          prExerciseType === exercise && styles.selectedExerciseButton
                        ]}
                        onPress={() => setPrExerciseType(exercise)}>
                        <Text style={[
                          styles.exerciseButtonText,
                          prExerciseType === exercise && styles.selectedExerciseButtonText
                        ]}>
                          {exercise.charAt(0).toUpperCase() + exercise.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.prInputRow}>
                  <TextInput
                    style={[styles.input, styles.prInput]}
                    placeholder="Weight (lbs)"
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.prInput]}
                    placeholder="Reps"
                    value={reps}
                    onChangeText={setReps}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Share as post when approved</Text>
                  <Switch
                    value={makePost}
                    onValueChange={setMakePost}
                    trackColor={{false: '#767577', true: '#81b0ff'}}
                    thumbColor={makePost ? '#f5dd4b' : '#f4f3f4'}
                  />
                </View>
              </View>
            )}
          </View>
          
          <View style={styles.durationContainer}>
            <Text style={styles.durationLabel}>Duration: {formatTime(recordingDuration)}</Text>
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                resetRecorder();
                setShowDetails(false);
              }}>
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.button}
              onPress={handleSaveVideo}>
              <Text style={styles.buttonText}>Save Video</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  if (!device) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading camera...</Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Camera
          ref={camera}
          style={styles.camera}
          device={device}
          isActive={visible}
          video={true}
          audio={true}
        />
        
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            
            <Text style={styles.instruction}>
              {isRecording ? 'Recording workout video...' : 'Record your workout set'}
            </Text>
          </View>
          
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingTime}>{formatTime(recordingDuration)}</Text>
            </View>
          )}
          
          <View style={styles.bottomBar}>
            <View style={styles.recordButtonContainer}>
              <TouchableOpacity
                style={[styles.recordButton, isRecording && styles.recordingButton]}
                onPress={isRecording ? stopRecording : startRecording}>
                <View style={[styles.recordButtonInner, isRecording && styles.recordingInner]} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instruction: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 120,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  recordingTime: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomBar: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  recordButtonContainer: {
    alignItems: 'center',
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  recordingButton: {
    backgroundColor: '#dc2626',
  },
  recordButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#dc2626',
  },
  recordingInner: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#374151',
  },
  detailsContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#1f2937',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#374151',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  durationContainer: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  button: {
    flex: 1,
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  prSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  prForm: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  exerciseTypeContainer: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  exerciseButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exerciseButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedExerciseButton: {
    backgroundColor: '#2563eb',
  },
  exerciseButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  selectedExerciseButtonText: {
    color: '#fff',
  },
  prInputRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  prInput: {
    flex: 1,
  },
});

export default VideoRecorder;
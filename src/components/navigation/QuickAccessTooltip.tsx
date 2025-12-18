import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface QuickAccessTooltipProps {
  visible: boolean;
  onDismiss: () => void;
}

const TOOLTIP_KEY = '@quick_access_tooltip_shown';

const QuickAccessTooltip: React.FC<QuickAccessTooltipProps> = ({ visible, onDismiss }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Bounce animation pointing down
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity onPress={handleDismiss} activeOpacity={0.9}>
        <View style={styles.tooltip}>
          <Text style={styles.tooltipTitle}>✨ New! Quick Access</Text>
          <Text style={styles.tooltipText}>
            Tap the + button to quickly access{'\n'}all features from anywhere!
          </Text>
          <Animated.View style={[styles.arrow, { transform: [{ translateY }] }]}>
            <Text style={styles.arrowText}>↓</Text>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Hook to manage tooltip visibility
export const useQuickAccessTooltip = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    checkTooltipStatus();
  }, []);

  const checkTooltipStatus = async () => {
    try {
      const shown = await AsyncStorage.getItem(TOOLTIP_KEY);
      if (!shown) {
        // Show tooltip after a short delay
        setTimeout(() => {
          setShowTooltip(true);
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking tooltip status:', error);
    }
  };

  const dismissTooltip = async () => {
    setShowTooltip(false);
    try {
      await AsyncStorage.setItem(TOOLTIP_KEY, 'true');
    } catch (error) {
      console.error('Error saving tooltip status:', error);
    }
  };

  return { showTooltip, dismissTooltip };
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  tooltip: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxWidth: width - 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  tooltipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  tooltipText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  arrow: {
    marginTop: 8,
  },
  arrowText: {
    fontSize: 24,
    color: '#10b981',
  },
});

export default QuickAccessTooltip;

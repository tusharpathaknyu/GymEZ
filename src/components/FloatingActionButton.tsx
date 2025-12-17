import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { buttonPress, successHaptic } from '../utils/haptics';

interface FABAction {
  icon: string;
  label: string;
  color?: string;
  onPress: () => void;
}

interface FloatingActionButtonProps {
  actions: FABAction[];
  mainIcon?: string;
  mainColor?: string;
  position?: 'bottomRight' | 'bottomLeft' | 'bottomCenter';
}

const { width, height } = Dimensions.get('window');

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions,
  mainIcon = '+',
  mainColor = '#10b981',
  position = 'bottomRight',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(animation, {
        toValue: isOpen ? 1 : 0,
        useNativeDriver: true,
        friction: 5,
        tension: 80,
      }),
      Animated.timing(rotateAnimation, {
        toValue: isOpen ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen, animation, rotateAnimation]);

  const toggleMenu = () => {
    buttonPress();
    setIsOpen(!isOpen);
  };

  const handleActionPress = (action: FABAction) => {
    successHaptic();
    setIsOpen(false);
    action.onPress();
  };

  const rotation = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const getPositionStyle = () => {
    switch (position) {
      case 'bottomLeft':
        return { left: 20 };
      case 'bottomCenter':
        return { left: width / 2 - 28 };
      default:
        return { right: 20 };
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ]}
          />
        </TouchableWithoutFeedback>
      )}

      {/* FAB Container */}
      <View style={[styles.container, getPositionStyle()]}>
        {/* Action buttons */}
        {actions.map((action, index) => {
          const translateY = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -((index + 1) * 70)],
          });

          const scale = animation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0.5, 1],
          });

          const opacity = animation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0, 1],
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.actionContainer,
                {
                  transform: [{ translateY }, { scale }],
                  opacity,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.actionLabelContainer}
                onPress={() => handleActionPress(action)}
                activeOpacity={0.8}
              >
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: action.color || '#6b7280' },
                ]}
                onPress={() => handleActionPress(action)}
                activeOpacity={0.8}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Main FAB */}
        <TouchableOpacity
          style={[styles.mainButton, { backgroundColor: mainColor }]}
          onPress={toggleMenu}
          activeOpacity={0.8}
        >
          <Animated.Text
            style={[styles.mainIcon, { transform: [{ rotate: rotation }] }]}
          >
            {mainIcon}
          </Animated.Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  container: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mainIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  actionContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    right: 0,
  },
  actionLabelContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionIcon: {
    fontSize: 22,
  },
});

export default FloatingActionButton;

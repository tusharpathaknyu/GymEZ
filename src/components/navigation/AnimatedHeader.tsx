import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { buttonPress } from '../../utils/haptics';

const { width } = Dimensions.get('window');

interface AnimatedHeaderProps {
  title: string;
  subtitle?: string;
  scrollY: Animated.Value;
  showBackButton?: boolean;
  rightActions?: React.ReactNode;
  backgroundColor?: string;
  tintColor?: string;
  leftIcon?: string;
  onLeftPress?: () => void;
}

const HEADER_MAX_HEIGHT = 140;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 100 : 80;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
  title,
  subtitle,
  scrollY,
  showBackButton = false,
  rightActions,
  backgroundColor = '#fff',
  tintColor = '#111827',
  leftIcon,
  onLeftPress,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Interpolations for header animations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT + insets.top, HEADER_MIN_HEIGHT + insets.top],
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.95, 0.85],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -10],
    extrapolate: 'clamp',
  });

  const subtitleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const shadowOpacity = scrollY.interpolate({
    inputRange: [0, 20],
    outputRange: [0, 0.1],
    extrapolate: 'clamp',
  });

  const handleBack = () => {
    buttonPress();
    navigation.goBack();
  };

  const handleLeftPress = () => {
    if (onLeftPress) {
      buttonPress();
      onLeftPress();
    }
  };

  return (
    <Animated.View
      style={[
        styles.header,
        {
          height: headerHeight,
          paddingTop: insets.top,
          backgroundColor,
          shadowOpacity,
        },
      ]}
    >
      <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
        {/* Left side */}
        <View style={styles.leftContainer}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.backIcon, { color: tintColor }]}>←</Text>
            </TouchableOpacity>
          )}
          {leftIcon && (
            <TouchableOpacity
              style={styles.leftButton}
              onPress={handleLeftPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.leftIconText}>{leftIcon}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Title section */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              transform: [
                { scale: titleScale },
                { translateY: titleTranslateY },
              ],
            },
          ]}
        >
          <Text style={[styles.title, { color: tintColor }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Animated.Text
              style={[
                styles.subtitle,
                { opacity: subtitleOpacity },
              ]}
            >
              {subtitle}
            </Animated.Text>
          )}
        </Animated.View>

        {/* Right side */}
        <View style={styles.rightContainer}>
          {rightActions}
        </View>
      </Animated.View>
    </Animated.View>
  );
};

// Preset Header Styles
export const ScreenHeader: React.FC<{
  title: string;
  scrollY: Animated.Value;
  rightActions?: React.ReactNode;
}> = ({ title, scrollY, rightActions }) => (
  <AnimatedHeader
    title={title}
    scrollY={scrollY}
    showBackButton={true}
    rightActions={rightActions}
  />
);

export const HomeHeader: React.FC<{
  userName: string;
  scrollY: Animated.Value;
  onNotificationPress: () => void;
  onProfilePress: () => void;
}> = ({ userName, scrollY, onNotificationPress, onProfilePress }) => {
  const insets = useSafeAreaInsets();

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.homeHeader,
        {
          paddingTop: insets.top + 10,
          opacity: headerOpacity,
        },
      ]}
    >
      <View style={styles.homeHeaderContent}>
        <View style={styles.homeHeaderLeft}>
          <Text style={styles.greetingText}>{getGreeting()},</Text>
          <Text style={styles.userNameText}>{userName}! 👋</Text>
        </View>
        <View style={styles.homeHeaderRight}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={onNotificationPress}
          >
            <Text style={styles.headerIcon}>🔔</Text>
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  leftContainer: {
    width: 50,
    alignItems: 'flex-start',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 22,
    fontWeight: '600',
  },
  leftButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIconText: {
    fontSize: 20,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  rightContainer: {
    width: 50,
    alignItems: 'flex-end',
  },
  // Home Header Styles
  homeHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  homeHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  homeHeaderLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  userNameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  homeHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default AnimatedHeader;

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { buttonPress } from '../../utils/haptics';

interface NavigationHeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
  onBack?: () => void;
  onRightPress?: () => void;
  showBackButton?: boolean;
  transparent?: boolean;
  dark?: boolean;
  rightComponent?: React.ReactNode;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  title,
  subtitle,
  leftIcon = '←',
  rightIcon,
  onBack,
  onRightPress,
  showBackButton = true,
  transparent = false,
  dark = false,
  rightComponent,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleBack = () => {
    buttonPress();
    onBack?.();
  };

  const handleRightPress = () => {
    buttonPress();
    onRightPress?.();
  };

  const textColor = dark ? '#fff' : '#1f2937';
  const iconColor = dark ? 'rgba(255,255,255,0.9)' : '#374151';
  const subtitleColor = dark ? 'rgba(255,255,255,0.7)' : '#6b7280';

  return (
    <Animated.View 
      style={[
        styles.container,
        transparent && styles.transparent,
        { opacity: fadeAnim },
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
        <View style={styles.headerContent}>
          {/* Left - Back Button */}
          <View style={styles.leftContainer}>
            {showBackButton && onBack && (
              <TouchableOpacity
                style={[styles.backButton, transparent && styles.transparentButton]}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <Text style={[styles.backIcon, { color: iconColor }]}>{leftIcon}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Center - Title */}
          <View style={styles.centerContainer}>
            <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: subtitleColor }]} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>

          {/* Right - Action Button or Component */}
          <View style={styles.rightContainer}>
            {rightComponent ? (
              rightComponent
            ) : rightIcon && onRightPress ? (
              <TouchableOpacity
                style={[styles.rightButton, transparent && styles.transparentButton]}
                onPress={handleRightPress}
                activeOpacity={0.7}
              >
                <Text style={[styles.rightIcon, { color: iconColor }]}>{rightIcon}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  safeArea: {
    paddingTop: StatusBar.currentHeight || 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
  },
  leftContainer: {
    width: 48,
    alignItems: 'flex-start',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  rightContainer: {
    width: 48,
    alignItems: 'flex-end',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transparentButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  backIcon: {
    fontSize: 20,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rightButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIcon: {
    fontSize: 18,
  },
});

export default NavigationHeader;

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tabChangeHaptic, successHaptic, buttonPress } from '../../utils/haptics';

const { width } = Dimensions.get('window');
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 85 : 70;

interface TabConfig {
  name: string;
  icon: string;
  activeIcon: string;
  label: string;
}

const TABS: TabConfig[] = [
  { name: 'HomeTab', icon: '🏠', activeIcon: '🏠', label: 'Home' },
  { name: 'Activity', icon: '📊', activeIcon: '📊', label: 'Activity' },
  { name: 'QuickAction', icon: '➕', activeIcon: '➕', label: '' },
  { name: 'Leaderboard', icon: '🏆', activeIcon: '🏆', label: 'Ranks' },
  { name: 'ProfileTab', icon: '👤', activeIcon: '👤', label: 'Profile' },
];

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
  onQuickActionPress: () => void;
}

// Individual Tab Item Component
const TabItem: React.FC<{
  tab: TabConfig;
  index: number;
  isFocused: boolean;
  onPress: () => void;
  isCenter?: boolean;
}> = ({ tab, index, isFocused, onPress, isCenter }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(isFocused ? 1.1 : 1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(iconScale, {
        toValue: isFocused ? 1.15 : 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: isFocused ? -2 : 0,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (isCenter) {
      successHaptic();
    } else {
      tabChangeHaptic();
    }
    onPress();
  };

  if (isCenter) {
    return <CenterButton onPress={onPress} />;
  }

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={styles.tabItem}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          styles.tabContent,
          {
            transform: [
              { scale: scaleAnim },
              { translateY },
            ],
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.tabIcon,
            { transform: [{ scale: iconScale }] },
          ]}
        >
          {isFocused ? tab.activeIcon : tab.icon}
        </Animated.Text>
        <Text
          style={[
            styles.tabLabel,
            isFocused && styles.tabLabelActive,
          ]}
        >
          {tab.label}
        </Text>
        {isFocused && (
          <View style={styles.activeIndicator} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Center Action Button with pulse animation
const CenterButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Subtle pulse glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePress = () => {
    successHaptic();
    
    // Press animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.85,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    
    onPress();
  };

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.centerButtonContainer}
      activeOpacity={1}
    >
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.centerGlow,
          {
            transform: [{ scale: pulseScale }],
            opacity: pulseAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.6],
            }),
          },
        ]}
      />
      
      {/* Main button */}
      <Animated.View
        style={[
          styles.centerButton,
          {
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseScale) },
            ],
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.centerIcon,
            { transform: [{ rotate: rotation }] },
          ]}
        >
          ➕
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Main Custom Tab Bar Component
const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
  onQuickActionPress,
}) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleTabPress = (routeName: string, index: number) => {
    if (routeName === 'QuickAction') {
      onQuickActionPress();
      return;
    }

    const event = navigation.emit({
      type: 'tabPress',
      target: state.routes[getActualRouteIndex(index)]?.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  // Map visual index to actual route index (QuickAction is placeholder)
  const getActualRouteIndex = (visualIndex: number) => {
    if (visualIndex === 2) return -1; // Center button
    if (visualIndex > 2) return visualIndex - 1;
    return visualIndex;
  };

  const isTabFocused = (tabName: string) => {
    const currentRoute = state.routes[state.index];
    return currentRoute?.name === tabName;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            },
          ],
        },
      ]}
    >
      {/* Background blur effect simulation */}
      <View style={styles.background} />
      
      {/* Tab items */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab, index) => (
          <TabItem
            key={tab.name}
            tab={tab}
            index={index}
            isFocused={isTabFocused(tab.name)}
            onPress={() => handleTabPress(tab.name, index)}
            isCenter={index === 2}
          />
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 25,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
  },
  tabLabelActive: {
    color: '#10b981',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10b981',
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  centerGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10b981',
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
    borderWidth: 4,
    borderColor: '#fff',
  },
  centerIcon: {
    fontSize: 28,
    color: '#fff',
  },
});

export default CustomTabBar;

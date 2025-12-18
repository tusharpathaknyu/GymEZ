import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { buttonPress, successHaptic, tabChangeHaptic } from '../../utils/haptics';

const { width } = Dimensions.get('window');

interface TabItem {
  name: string;
  icon: string;
  label: string;
}

interface EnhancedTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
  onQuickActionPress: () => void;
}

const TABS: TabItem[] = [
  { name: 'HomeTab', icon: '🏠', label: 'Home' },
  { name: 'Activity', icon: '📊', label: 'Activity' },
  { name: 'QuickAction', icon: '➕', label: '' }, // Center button
  { name: 'Leaderboard', icon: '🏆', label: 'Ranks' },
  { name: 'ProfileTab', icon: '👤', label: 'Profile' },
];

const EnhancedTabBar: React.FC<EnhancedTabBarProps> = ({
  state,
  descriptors,
  navigation,
  onQuickActionPress,
}) => {
  const scaleAnims = useRef(TABS.map(() => new Animated.Value(1))).current;
  const centerButtonAnim = useRef(new Animated.Value(0)).current;
  const [centerButtonScale] = useState(new Animated.Value(1));

  useEffect(() => {
    // Pulse animation for center button
    Animated.loop(
      Animated.sequence([
        Animated.timing(centerButtonAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(centerButtonAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleTabPress = (index: number, routeName: string) => {
    // Center button (Quick Action)
    if (routeName === 'QuickAction') {
      successHaptic();
      Animated.sequence([
        Animated.timing(centerButtonScale, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(centerButtonScale, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
      onQuickActionPress();
      return;
    }

    tabChangeHaptic();

    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Map visual index to actual route index (accounting for center button)
    let actualIndex = index;
    if (index > 2) {
      actualIndex = index - 1; // Adjust for the fake center button
    }

    const event = navigation.emit({
      type: 'tabPress',
      target: state.routes[actualIndex]?.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(state.routes[actualIndex]?.name);
    }
  };

  // Map state index to visual index
  const getVisualIndex = (stateIndex: number) => {
    if (stateIndex >= 2) return stateIndex + 1; // Add 1 for center button
    return stateIndex;
  };

  const currentVisualIndex = getVisualIndex(state.index);

  return (
    <View style={styles.container}>
      {/* Tab indicator line */}
      <View style={styles.tabBar}>
        {TABS.map((tab, index) => {
          const isCenter = tab.name === 'QuickAction';
          const isFocused = currentVisualIndex === index;

          if (isCenter) {
            // Center Quick Action Button
            const pulseScale = centerButtonAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.05],
            });

            return (
              <Animated.View
                key={tab.name}
                style={[
                  styles.centerButtonWrapper,
                  {
                    transform: [
                      { scale: Animated.multiply(centerButtonScale, pulseScale) },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.centerButton}
                  onPress={() => handleTabPress(index, tab.name)}
                  activeOpacity={0.8}
                >
                  <View style={styles.centerButtonInner}>
                    <Text style={styles.centerButtonIcon}>➕</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          }

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={() => handleTabPress(index, tab.name)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.tabContent,
                  { transform: [{ scale: scaleAnims[index] }] },
                ]}
              >
                <Text style={[styles.tabIcon, isFocused && styles.tabIconFocused]}>
                  {tab.icon}
                </Text>
                <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
                  {tab.label}
                </Text>
                {isFocused && <View style={styles.focusIndicator} />}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    paddingTop: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabContent: {
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 24,
    opacity: 0.5,
  },
  tabIconFocused: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9ca3af',
    marginTop: 4,
  },
  tabLabelFocused: {
    color: '#10b981',
    fontWeight: '600',
  },
  focusIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10b981',
    marginTop: 4,
  },
  centerButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    marginTop: -30,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  centerButtonInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  centerButtonIcon: {
    fontSize: 28,
  },
});

export default EnhancedTabBar;

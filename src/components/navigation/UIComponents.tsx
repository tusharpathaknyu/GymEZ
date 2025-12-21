import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// === SCREEN WRAPPER ===
// A consistent wrapper for all screens with built-in features
interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  refreshable?: boolean;
  onRefresh?: () => Promise<void>;
  backgroundColor?: string;
  safeAreaTop?: boolean;
  safeAreaBottom?: boolean;
  statusBarStyle?: 'light-content' | 'dark-content';
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
  onScroll?: (event: any) => void;
  scrollRef?: React.RefObject<ScrollView>;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollable = true,
  refreshable = false,
  onRefresh,
  backgroundColor = '#f9fafb',
  safeAreaTop = true,
  safeAreaBottom = true,
  statusBarStyle = 'dark-content',
  headerComponent,
  footerComponent,
  onScroll,
  scrollRef,
}) => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  }, [onRefresh]);

  const contentStyle = {
    flex: 1,
    backgroundColor,
    paddingTop: safeAreaTop ? insets.top : 0,
    paddingBottom: safeAreaBottom ? insets.bottom : 0,
  };

  return (
    <View style={[styles.screenWrapper, { backgroundColor }]}>
      <StatusBar barStyle={statusBarStyle} />
      {headerComponent}
      {scrollable ? (
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: safeAreaTop && !headerComponent ? insets.top : 0,
            paddingBottom: safeAreaBottom ? insets.bottom + 20 : 20,
          }}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          refreshControl={
            refreshable ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#10b981"
                colors={['#10b981']}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={contentStyle}>{children}</View>
      )}
      {footerComponent}
    </View>
  );
};

// === SECTION HEADER ===
// Consistent section headers throughout the app
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: string;
  style?: any;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionText,
  onAction,
  icon,
  style,
}) => (
  <View style={[styles.sectionHeader, style]}>
    <View style={styles.sectionHeaderLeft}>
      {icon && <Text style={styles.sectionIcon}>{icon}</Text>}
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    {actionText && onAction && (
      <TouchableOpacity onPress={onAction} style={styles.sectionAction}>
        <Text style={styles.sectionActionText}>{actionText}</Text>
        <Text style={styles.sectionActionArrow}>→</Text>
      </TouchableOpacity>
    )}
  </View>
);

// === CARD COMPONENT ===
// Versatile card for various content types
interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  variant = 'default',
  padding = 'medium',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };

  const variantStyles = {
    default: styles.cardDefault,
    elevated: styles.cardElevated,
    outlined: styles.cardOutlined,
    gradient: styles.cardGradient,
  };

  const paddingStyles = {
    none: 0,
    small: 8,
    medium: 16,
    large: 24,
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <CardComponent
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={[
          styles.card,
          variantStyles[variant],
          { padding: paddingStyles[padding] },
          style,
        ]}
      >
        {children}
      </CardComponent>
    </Animated.View>
  );
};

// === ACTION BUTTON ===
// Primary action button with animations
interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: any;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const variantStyles: Record<string, any> = {
    primary: {
      button: styles.buttonPrimary,
      text: styles.buttonPrimaryText,
    },
    secondary: {
      button: styles.buttonSecondary,
      text: styles.buttonSecondaryText,
    },
    outline: {
      button: styles.buttonOutline,
      text: styles.buttonOutlineText,
    },
    ghost: {
      button: styles.buttonGhost,
      text: styles.buttonGhostText,
    },
    danger: {
      button: styles.buttonDanger,
      text: styles.buttonDangerText,
    },
  };

  const sizeStyles = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      fontSize: 13,
    },
    medium: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      fontSize: 15,
    },
    large: {
      paddingVertical: 18,
      paddingHorizontal: 32,
      fontSize: 17,
    },
  };

  return (
    <Animated.View
      style={[{ transform: [{ scale: scaleAnim }] }, fullWidth && { width: '100%' }]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          styles.button,
          variantStyles[variant].button,
          {
            paddingVertical: sizeStyles[size].paddingVertical,
            paddingHorizontal: sizeStyles[size].paddingHorizontal,
          },
          disabled && styles.buttonDisabled,
          fullWidth && { width: '100%' },
          style,
        ]}
      >
        {loading ? (
          <Text style={[variantStyles[variant].text, { fontSize: sizeStyles[size].fontSize }]}>
            ⏳
          </Text>
        ) : (
          <View style={styles.buttonContent}>
            {icon && iconPosition === 'left' && (
              <Text style={[styles.buttonIcon, { marginRight: 8 }]}>{icon}</Text>
            )}
            <Text
              style={[
                styles.buttonText,
                variantStyles[variant].text,
                { fontSize: sizeStyles[size].fontSize },
              ]}
            >
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <Text style={[styles.buttonIcon, { marginLeft: 8 }]}>{icon}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// === BACK BUTTON ===
// Consistent back navigation button
interface BackButtonProps {
  onPress?: () => void;
  color?: string;
  label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  color = '#1f2937',
  label,
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.backButton}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text style={[styles.backButtonIcon, { color }]}>←</Text>
      {label && <Text style={[styles.backButtonLabel, { color }]}>{label}</Text>}
    </TouchableOpacity>
  );
};

// === EMPTY STATE ===
// Beautiful empty state for lists and screens
interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionTitle?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionTitle,
  onAction,
}) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyStateIcon}>{icon}</Text>
    <Text style={styles.emptyStateTitle}>{title}</Text>
    <Text style={styles.emptyStateMessage}>{message}</Text>
    {actionTitle && onAction && (
      <ActionButton
        title={actionTitle}
        onPress={onAction}
        variant="primary"
        size="medium"
        style={{ marginTop: 20 }}
      />
    )}
  </View>
);

// === DIVIDER ===
// Simple divider component
interface DividerProps {
  text?: string;
  style?: any;
}

export const Divider: React.FC<DividerProps> = ({ text, style }) => (
  <View style={[styles.divider, style]}>
    <View style={styles.dividerLine} />
    {text && <Text style={styles.dividerText}>{text}</Text>}
    {text && <View style={styles.dividerLine} />}
  </View>
);

// === BADGE ===
// Notification/status badge
interface BadgeProps {
  count?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'small' | 'medium';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  count,
  variant = 'primary',
  size = 'small',
  dot = false,
}) => {
  const variantColors = {
    primary: '#10b981',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
  };

  const sizeStyles = {
    small: { minWidth: 18, height: 18, fontSize: 10 },
    medium: { minWidth: 24, height: 24, fontSize: 12 },
  };

  if (dot) {
    return (
      <View
        style={[
          styles.badgeDot,
          { backgroundColor: variantColors[variant] },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantColors[variant],
          minWidth: sizeStyles[size].minWidth,
          height: sizeStyles[size].height,
        },
      ]}
    >
      <Text style={[styles.badgeText, { fontSize: sizeStyles[size].fontSize }]}>
        {count && count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};

// === AVATAR ===
// User avatar component
interface AvatarProps {
  source?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showBadge?: boolean;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'danger';
  onPress?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'medium',
  showBadge = false,
  badgeVariant = 'success',
  onPress,
}) => {
  const sizeMap = {
    small: 32,
    medium: 48,
    large: 64,
    xlarge: 96,
  };

  const avatarSize = sizeMap[size];
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : '?';

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container onPress={onPress} style={styles.avatarContainer}>
      <View
        style={[
          styles.avatar,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          },
        ]}
      >
        <Text style={[styles.avatarText, { fontSize: avatarSize * 0.4 }]}>
          {initials}
        </Text>
      </View>
      {showBadge && (
        <View
          style={[
            styles.avatarBadge,
            {
              backgroundColor:
                badgeVariant === 'primary'
                  ? '#10b981'
                  : badgeVariant === 'success'
                  ? '#22c55e'
                  : badgeVariant === 'warning'
                  ? '#f59e0b'
                  : '#ef4444',
              right: 0,
              bottom: 0,
            },
          ]}
        />
      )}
    </Container>
  );
};

// === CHIP ===
// Tag/chip component for categories
interface ChipProps {
  label: string;
  icon?: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: 'filled' | 'outlined';
}

export const Chip: React.FC<ChipProps> = ({
  label,
  icon,
  selected = false,
  onPress,
  variant = 'filled',
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={!onPress}
    style={[
      styles.chip,
      variant === 'filled' ? styles.chipFilled : styles.chipOutlined,
      selected && styles.chipSelected,
    ]}
  >
    {icon && <Text style={styles.chipIcon}>{icon}</Text>}
    <Text
      style={[
        styles.chipLabel,
        variant === 'outlined' && styles.chipLabelOutlined,
        selected && styles.chipLabelSelected,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

// === LIST ITEM ===
// Consistent list item component
interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
  rightText?: string;
  onPress?: () => void;
  showChevron?: boolean;
  disabled?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  rightText,
  onPress,
  showChevron = true,
  disabled = false,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || !onPress}
    style={[styles.listItem, disabled && styles.listItemDisabled]}
    activeOpacity={0.7}
  >
    {leftIcon && (
      <View style={styles.listItemIconContainer}>
        <Text style={styles.listItemIcon}>{leftIcon}</Text>
      </View>
    )}
    <View style={styles.listItemContent}>
      <Text style={styles.listItemTitle}>{title}</Text>
      {subtitle && <Text style={styles.listItemSubtitle}>{subtitle}</Text>}
    </View>
    {rightText && <Text style={styles.listItemRightText}>{rightText}</Text>}
    {rightIcon && <Text style={styles.listItemRightIcon}>{rightIcon}</Text>}
    {showChevron && !rightIcon && <Text style={styles.listItemChevron}>›</Text>}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  // Screen Wrapper
  screenWrapper: {
    flex: 1,
  },
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  sectionActionArrow: {
    fontSize: 14,
    color: '#10b981',
    marginLeft: 4,
  },
  // Card
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardDefault: {
    backgroundColor: '#ffffff',
  },
  cardElevated: {
    backgroundColor: '#ffffff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardOutlined: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardGradient: {
    backgroundColor: '#10b981',
  },
  // Buttons
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '600',
  },
  buttonIcon: {
    fontSize: 16,
  },
  buttonPrimary: {
    backgroundColor: '#10b981',
  },
  buttonPrimaryText: {
    color: '#ffffff',
  },
  buttonSecondary: {
    backgroundColor: '#f3f4f6',
  },
  buttonSecondaryText: {
    color: '#1f2937',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  buttonOutlineText: {
    color: '#10b981',
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonGhostText: {
    color: '#10b981',
  },
  buttonDanger: {
    backgroundColor: '#ef4444',
  },
  buttonDangerText: {
    color: '#ffffff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  // Back Button
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backButtonIcon: {
    fontSize: 24,
    fontWeight: '300',
  },
  backButtonLabel: {
    fontSize: 16,
    marginLeft: 4,
  },
  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    fontSize: 13,
    color: '#9ca3af',
    marginHorizontal: 12,
  },
  // Badge
  badge: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Avatar
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#10b981',
    fontWeight: '600',
  },
  avatarBadge: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  // Chip
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  chipFilled: {
    backgroundColor: '#f3f4f6',
  },
  chipOutlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipSelected: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  chipIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4b5563',
  },
  chipLabelOutlined: {
    color: '#6b7280',
  },
  chipLabelSelected: {
    color: '#10b981',
  },
  // List Item
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  listItemDisabled: {
    opacity: 0.5,
  },
  listItemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listItemIcon: {
    fontSize: 18,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
  },
  listItemSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  listItemRightText: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  listItemRightIcon: {
    fontSize: 18,
    color: '#9ca3af',
  },
  listItemChevron: {
    fontSize: 20,
    color: '#d1d5db',
    fontWeight: '300',
  },
});

export default ScreenWrapper;

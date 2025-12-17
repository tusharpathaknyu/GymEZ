import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { selectionHaptic } from '../utils/haptics';

interface AnimatedInputProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

/**
 * Animated floating label input
 */
export const AnimatedInput: React.FC<AnimatedInputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  value,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const hasValue = value && value.length > 0;

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: isFocused || hasValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    Animated.timing(borderAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, hasValue]);

  useEffect(() => {
    if (error) {
      // Shake animation on error
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    selectionHaptic();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const labelTranslateY = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, -8],
  });

  const labelScale = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.85],
  });

  const borderColor = error 
    ? '#ef4444' 
    : borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#e5e7eb', '#10b981'],
      });

  const borderWidth = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        containerStyle,
        { transform: [{ translateX: shakeAnim }] },
      ]}
    >
      <Animated.View
        style={[
          styles.inputContainer,
          {
            borderColor,
            borderWidth,
          },
        ]}
      >
        {leftIcon && <Text style={styles.leftIcon}>{leftIcon}</Text>}
        
        <View style={styles.inputWrapper}>
          <Animated.Text
            style={[
              styles.label,
              {
                transform: [
                  { translateY: labelTranslateY },
                  { scale: labelScale },
                ],
                color: error ? '#ef4444' : isFocused ? '#10b981' : '#6b7280',
              },
            ]}
          >
            {label}
          </Animated.Text>
          <TextInput
            {...props}
            value={value}
            style={[styles.input, leftIcon ? styles.inputWithLeftIcon : undefined]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconButton}
            activeOpacity={0.7}
          >
            <Text style={[styles.rightIcon]}>{rightIcon}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {(error || hint) && (
        <View style={styles.helperContainer}>
          <Text style={[styles.helperText, error ? styles.errorText : undefined]}>
            {error || hint}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

/**
 * Search input with clear button
 */
export const SearchInput: React.FC<{
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  autoFocus?: boolean;
}> = ({ value, onChangeText, placeholder = 'Search...', onSubmit, autoFocus }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleFocus = () => {
    selectionHaptic();
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const handleBlur = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  return (
    <Animated.View style={[styles.searchContainer, { transform: [{ scale: scaleAnim }] }]}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={onSubmit}
        autoFocus={autoFocus}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            selectionHaptic();
            onChangeText('');
          }}
          style={styles.clearButton}
        >
          <Text style={styles.clearIcon}>✕</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

/**
 * Numeric input with increment/decrement buttons
 */
export const NumericInput: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
}> = ({ value, onChange, min = 0, max = 999, step = 1, label, unit }) => {
  const handleIncrement = () => {
    if (value + step <= max) {
      selectionHaptic();
      onChange(value + step);
    }
  };

  const handleDecrement = () => {
    if (value - step >= min) {
      selectionHaptic();
      onChange(value - step);
    }
  };

  return (
    <View style={styles.numericContainer}>
      {label && <Text style={styles.numericLabel}>{label}</Text>}
      <View style={styles.numericInputRow}>
        <TouchableOpacity
          style={[styles.numericButton, value <= min && styles.numericButtonDisabled]}
          onPress={handleDecrement}
          disabled={value <= min}
          activeOpacity={0.7}
        >
          <Text style={styles.numericButtonText}>−</Text>
        </TouchableOpacity>
        
        <View style={styles.numericValueContainer}>
          <Text style={styles.numericValue}>{value}</Text>
          {unit && <Text style={styles.numericUnit}>{unit}</Text>}
        </View>
        
        <TouchableOpacity
          style={[styles.numericButton, value >= max && styles.numericButtonDisabled]}
          onPress={handleIncrement}
          disabled={value >= max}
          activeOpacity={0.7}
        >
          <Text style={styles.numericButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    left: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    fontSize: 16,
  },
  input: {
    fontSize: 16,
    color: '#111827',
    paddingTop: 8,
    paddingBottom: 8,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  leftIcon: {
    fontSize: 20,
    marginRight: 4,
  },
  rightIconButton: {
    padding: 8,
    marginLeft: 4,
  },
  rightIcon: {
    fontSize: 20,
  },
  helperContainer: {
    marginTop: 4,
    paddingHorizontal: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
  },
  errorText: {
    color: '#ef4444',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIcon: {
    fontSize: 12,
    color: '#6b7280',
  },
  numericContainer: {
    marginBottom: 16,
  },
  numericLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  numericInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numericButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numericButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  numericButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  numericValueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numericValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  numericUnit: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
});

export default {
  AnimatedInput,
  SearchInput,
  NumericInput,
};

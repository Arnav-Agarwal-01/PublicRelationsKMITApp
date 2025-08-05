/**
 * Custom Button component with modern dark theme styling
 * Supports different variants and loading states
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false, 
  loading = false,
  style,
  textStyle 
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const buttonStyle = [
    styles.base,
    styles[variant],
    (disabled || loading) && styles.disabled,
    style
  ];

  const buttonTextStyle = [
    styles.text,
    styles[`${variant}Text`],
    (disabled || loading) && styles.disabledText,
    textStyle
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? colors.primary : colors.accent} 
          size="small" 
        />
      ) : (
        <Text style={buttonTextStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primary: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.accent,
    shadowOpacity: 0,
    elevation: 0,
  },
  ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  disabled: {
    backgroundColor: colors.divider,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    ...typography.button,
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: colors.primary,
  },
  secondaryText: {
    color: colors.accent,
  },
  ghostText: {
    color: colors.accent,
  },
  disabledText: {
    color: colors.textMuted,
  },
});

export default Button;
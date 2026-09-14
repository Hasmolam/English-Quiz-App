import React, { useState } from 'react';
import {
  Text,
  Pressable,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { colors as themeColors, spacing, radius } from '@/theme';

export type TactileVariant = 'primary' | 'success' | 'danger' | 'gold' | 'outline' | 'slate';
export type TactileSize = 'sm' | 'md' | 'lg';

interface TactileButtonProps {
  onPress?: () => void;
  title: string;
  variant?: TactileVariant;
  size?: TactileSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

const variantStyles: Record<
  TactileVariant,
  {
    bg: string;
    border: string;
    textColor: string;
  }
> = {
  primary: {
    bg: themeColors.primary,
    border: themeColors.primaryDark,
    textColor: themeColors.textOnColor,
  },
  success: {
    bg: themeColors.success,
    border: themeColors.successDark,
    textColor: themeColors.textOnColor,
  },
  danger: {
    bg: themeColors.danger,
    border: themeColors.dangerDark,
    textColor: themeColors.textOnColor,
  },
  gold: {
    bg: themeColors.warning,
    border: themeColors.warningDark,
    textColor: themeColors.textOnColor,
  },
  outline: {
    bg: themeColors.surface,
    border: themeColors.borderDark,
    textColor: themeColors.textPrimary,
  },
  slate: {
    bg: themeColors.slate,
    border: themeColors.slateDark,
    textColor: themeColors.textOnColor,
  },
};

const sizeStyles: Record<
  TactileSize,
  {
    paddingVertical: number;
    paddingHorizontal: number;
    fontSize: number;
    borderBottomWidth: number;
    pressedTranslateY: number;
  }
> = {
  sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: 14,
    fontSize: 13,
    borderBottomWidth: 3,
    pressedTranslateY: 3,
  },
  md: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 16,
    borderBottomWidth: 4,
    pressedTranslateY: 4,
  },
  lg: {
    paddingVertical: 18,
    paddingHorizontal: spacing.lg,
    fontSize: 18,
    borderBottomWidth: 5,
    pressedTranslateY: 5,
  },
};

export const TactileButton: React.FC<TactileButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = true,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const colors = variantStyles[variant];
  const dimensions = sizeStyles[size];

  const currentTranslateY = isPressed && !disabled && !loading ? dimensions.pressedTranslateY : 0;
  const currentBorderBottom = isPressed && !disabled && !loading ? 0 : dimensions.borderBottomWidth;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      onPressIn={() => {
        setIsPressed(true);
        if (process.env.EXPO_OS !== 'web' && !disabled && !loading) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
      }}
      onPressOut={() => setIsPressed(false)}
      style={[
        styles.baseButton,
        {
          backgroundColor: disabled ? themeColors.disabled : colors.bg,
          borderBottomColor: disabled ? themeColors.disabledDark : colors.border,
          borderBottomWidth: currentBorderBottom,
          transform: [{ translateY: currentTranslateY }],
          paddingVertical: dimensions.paddingVertical,
          paddingHorizontal: dimensions.paddingHorizontal,
          width: fullWidth ? '100%' : 'auto',
          opacity: disabled ? 0.65 : 1,
          minHeight: 48,
          cursor: process.env.EXPO_OS === 'web' && (!disabled && !loading) ? 'pointer' : undefined,
        },
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {loading ? (
          <ActivityIndicator color={colors.textColor} size="small" />
        ) : (
          <>
            {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
            <Text
              style={[
                styles.buttonText,
                {
                  color: colors.textColor,
                  fontSize: dimensions.fontSize,
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
            {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
          </>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

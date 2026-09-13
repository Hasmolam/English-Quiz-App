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
  Platform,
} from 'react-native';

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
    bg: '#4F46E5',       // Learning Indigo (Primary token)
    border: '#3730A3',   // Deep Indigo underside
    textColor: '#FFFFFF',
  },
  success: {
    bg: '#16A34A',       // Progress Green (CTA token)
    border: '#15803D',   // Dark Green underside
    textColor: '#FFFFFF',
  },
  danger: {
    bg: '#DC2626',       // Ruby Red (Destructive token)
    border: '#991B1B',   // Dark Red underside
    textColor: '#FFFFFF',
  },
  gold: {
    bg: '#D97706',       // Amber Gold
    border: '#B45309',   // Dark Amber underside
    textColor: '#FFFFFF',
  },
  outline: {
    bg: '#FFFFFF',       // Clean White surface
    border: '#CBD5E1',   // Slate-300 underside
    textColor: '#0F172A',
  },
  slate: {
    bg: '#334155',       // Slate-700
    border: '#0F172A',   // Slate-900 underside
    textColor: '#FFFFFF',
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
    paddingVertical: 8,
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
    paddingHorizontal: 24,
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
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[
        styles.baseButton,
        {
          backgroundColor: disabled ? '#94A3B8' : colors.bg,
          borderBottomColor: disabled ? '#64748B' : colors.border,
          borderBottomWidth: currentBorderBottom,
          transform: [{ translateY: currentTranslateY }],
          paddingVertical: dimensions.paddingVertical,
          paddingHorizontal: dimensions.paddingHorizontal,
          width: fullWidth ? '100%' : 'auto',
          opacity: disabled ? 0.65 : 1,
          minHeight: 48,
          cursor: Platform.OS === 'web' && (!disabled && !loading) ? 'pointer' : undefined,
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
    borderRadius: 16,
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

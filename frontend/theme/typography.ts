import { TextStyle } from 'react-native';
import { colors } from './colors';

export const typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  headline: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  body: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  subhead: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    lineHeight: 18,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

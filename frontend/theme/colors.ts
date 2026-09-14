export const colors = {
  // Brand & Accent
  primary: '#4F46E5',         // Learning Indigo
  primaryDark: '#3730A3',     // Deep Indigo underside
  primaryLight: '#EEF2FF',    // Soft Indigo tint

  // Status & Gamification
  success: '#16A34A',         // Progress Green (CTA)
  successDark: '#15803D',     // Dark Green underside
  successLight: '#DCFCE7',    // Light Green surface

  danger: '#DC2626',          // Ruby Red (Destructive)
  dangerDark: '#991B1B',      // Dark Red underside
  dangerLight: '#FEE2E2',     // Light Red surface

  warning: '#D97706',         // Amber Gold (XP/Trophy)
  warningDark: '#B45309',     // Dark Amber underside
  warningLight: '#FEF3C7',    // Light Amber surface

  streak: '#EA580C',          // Fire Orange
  streakLight: '#FFEDD5',     // Fire Orange surface

  slate: '#334155',           // Slate-700
  slateDark: '#0F172A',       // Slate-900 underside
  slateLight: '#F1F5F9',      // Slate-100

  // Surface & Layout
  surface: '#FFFFFF',
  background: '#F8FAFC',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#CBD5E1',

  // Typography
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  textSubtle: '#94A3B8',
  textOnColor: '#FFFFFF',

  // Interactive states
  disabled: '#94A3B8',
  disabledDark: '#64748B',
} as const;

export type ColorToken = keyof typeof colors;

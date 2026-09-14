import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

import { colors, spacing, radius } from '@/theme';

interface HeaderHUDProps {
  streak?: number;
  xp?: number;
  lives?: number;
  maxLives?: number;
  showLevel?: boolean;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  streak = 1,
  xp,
  lives = 5,
  maxLives = 5,
  showLevel = true,
}) => {
  const { user } = useAuth();
  const router = useRouter();

  const totalXP = xp !== undefined ? xp : (user?.total_score || 0);
  const userLevel = user?.level || 'A1';

  return (
    <View style={styles.hudContainer} accessibilityRole="toolbar">
      {/* 1. Level / User Profile Pill */}
      {showLevel && (
        <Pressable
          style={styles.pill}
          onPress={() => router.push('/(home)/stats')}
          accessibilityRole="button"
          accessibilityLabel={`Profil: ${user?.username || 'Kullanıcı'}, Seviye: ${userLevel}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{userLevel}</Text>
          </View>
          <Text style={styles.pillLabel} numberOfLines={1}>{user?.username || 'Gezgin'}</Text>
        </Pressable>
      )}

      {/* 2. Streak Fire Pill */}
      <View
        style={[styles.pill, styles.streakPill]}
        accessible={true}
        accessibilityRole="summary"
        accessibilityLabel={`Günlük seri: ${streak} gün`}
      >
        <Ionicons name="flame" size={20} color={colors.streak} />
        <Text style={[styles.pillValue, { color: colors.streak }]}>{streak}</Text>
      </View>

      {/* 3. XP Star Pill */}
      <View
        style={[styles.pill, styles.xpPill]}
        accessible={true}
        accessibilityRole="summary"
        accessibilityLabel={`Toplam tecrübe: ${totalXP} XP`}
      >
        <Ionicons name="flash" size={18} color={colors.warning} />
        <Text style={[styles.pillValue, { color: colors.warning }]}>{totalXP}</Text>
      </View>

      {/* 4. Lives / Hearts Pill */}
      <View
        style={[styles.pill, styles.livesPill]}
        accessible={true}
        accessibilityRole="summary"
        accessibilityLabel={`Kalan can: ${lives}`}
      >
        <Ionicons name="heart" size={18} color={colors.danger} />
        <Text style={[styles.pillValue, { color: colors.danger }]}>
          {lives}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hudContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.xl,
    gap: spacing.xs,
    cursor: process.env.EXPO_OS === 'web' ? 'pointer' : undefined,
  },
  levelBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginRight: 2,
  },
  levelBadgeText: {
    color: colors.textOnColor,
    fontWeight: '900',
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  pillLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    maxWidth: 90,
  },
  pillValue: {
    fontSize: 14,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  streakPill: {
    borderColor: '#FED7AA',
    backgroundColor: colors.streakLight,
  },
  xpPill: {
    borderColor: '#FDE68A',
    backgroundColor: colors.warningLight,
  },
  livesPill: {
    borderColor: '#FECDD3',
    backgroundColor: colors.dangerLight,
  },
});

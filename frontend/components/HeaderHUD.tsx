import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

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
        <Ionicons name="flame" size={20} color="#EA580C" />
        <Text style={[styles.pillValue, { color: '#EA580C' }]}>{streak}</Text>
      </View>

      {/* 3. XP Star Pill */}
      <View
        style={[styles.pill, styles.xpPill]}
        accessible={true}
        accessibilityRole="summary"
        accessibilityLabel={`Toplam tecrübe: ${totalXP} XP`}
      >
        <Ionicons name="flash" size={18} color="#D97706" />
        <Text style={[styles.pillValue, { color: '#D97706' }]}>{totalXP}</Text>
      </View>

      {/* 4. Lives / Hearts Pill */}
      <View
        style={[styles.pill, styles.livesPill]}
        accessible={true}
        accessibilityRole="summary"
        accessibilityLabel={`Kalan can: ${lives}`}
      >
        <Ionicons name="heart" size={18} color="#DC2626" />
        <Text style={[styles.pillValue, { color: '#DC2626' }]}>
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 4,
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
  levelBadge: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 2,
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
  },
  pillLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    maxWidth: 90,
  },
  pillValue: {
    fontSize: 14,
    fontWeight: '900',
  },
  streakPill: {
    borderColor: '#FED7AA',
    backgroundColor: '#FFF7ED',
  },
  xpPill: {
    borderColor: '#FDE68A',
    backgroundColor: '#FEFCE8',
  },
  livesPill: {
    borderColor: '#FECDD3',
    backgroundColor: '#FFF1F2',
  },
});

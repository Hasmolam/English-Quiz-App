import React, { useState, useCallback } from 'react';
import {
  Text,
  View,
  Pressable,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/utils/api';
import { HeaderHUD } from '@/components/HeaderHUD';
import { ProgressBar } from '@/components/ProgressBar';
import { TactileButton } from '@/components/TactileButton';
import { SignOutButton } from '@/components/SignOutButton';

interface UserStats {
  total_score: number;
  level: string;
  rank: number;
  total_players: number;
  current_streak?: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuth();
  const { fetchWithAuth } = useApi();

  const [dailyStats, setDailyStats] = useState({ completed: 0, target: 5 });
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        fetchDashboardData();
      }
    }, [isAuthenticated])
  );

  const fetchDashboardData = async () => {
    try {
      const [progressData, statsData] = await Promise.all([
        fetchWithAuth('/quiz/daily_progress'),
        fetchWithAuth('/quiz/stats'),
      ]);
      if (progressData) setDailyStats(progressData);
      if (statsData) {
        setUserStats(statsData);
        if (user && (user.total_score !== statsData.total_score || user.level !== statsData.level)) {
          updateUser({ ...user, total_score: statsData.total_score, level: statsData.level });
        }
      }
    } catch (e) {
      console.log('Dashboard fetch error:', e);
    }
  };

  const questProgress = Math.min(1, dailyStats.completed / (dailyStats.target || 5));
  const isQuestFinished = dailyStats.completed >= dailyStats.target;

  // Real live score and level from userStats or fallback to user
  const currentXP = userStats?.total_score ?? user?.total_score ?? 0;
  const currentLevel = userStats?.level ?? user?.level ?? 'A1';
  const currentStreak = userStats?.current_streak && userStats.current_streak > 0 
    ? userStats.current_streak 
    : (dailyStats.completed > 0 ? dailyStats.completed : 1);

  // Dynamic Level Roadmap:
  // A1: 0 - 100 XP (target: 100)
  // A2: 100 - 300 XP (target: 300)
  // B1: 300 - 600 XP (target: 600)
  // B2: 600 - 1000 XP (target: 1000)
  // C1: 1000+ XP (Master)
  let tierBaseXP = 0;
  let tierTargetXP = 100;
  let nextLevelName = 'A2';

  if (currentXP >= 1000) {
    tierBaseXP = 1000;
    tierTargetXP = 1000;
    nextLevelName = 'C1 (Usta)';
  } else if (currentXP >= 600) {
    tierBaseXP = 600;
    tierTargetXP = 1000;
    nextLevelName = 'C1';
  } else if (currentXP >= 300) {
    tierBaseXP = 300;
    tierTargetXP = 600;
    nextLevelName = 'B2';
  } else if (currentXP >= 100) {
    tierBaseXP = 100;
    tierTargetXP = 300;
    nextLevelName = 'B1';
  } else {
    tierBaseXP = 0;
    tierTargetXP = 100;
    nextLevelName = 'A2';
  }

  const spanXP = tierTargetXP - tierBaseXP;
  const earnedInTier = Math.max(0, currentXP - tierBaseXP);
  const levelProgress = spanXP > 0 ? Math.min(1, earnedInTier / spanXP) : 1;
  const xpNeeded = Math.max(0, tierTargetXP - currentXP);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. TOP GAMING HUD (XP, Streak, Can, Level) */}
      <HeaderHUD streak={currentStreak} xp={currentXP} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. GAMIFIED HERO MISSION / DAILY QUEST CARD */}
        <View style={styles.questCard}>
          <View style={styles.questHeader}>
            <View style={styles.questTitleRow}>
              <View style={styles.chestIcon}>
                <Ionicons
                  name={isQuestFinished ? 'gift' : 'flag'}
                  size={24}
                  color={isQuestFinished ? '#10B981' : '#F59E0B'}
                />
              </View>
              <View>
                <Text style={styles.questSuperText}>GÜNLÜK GÖREV</Text>
                <Text style={styles.questTitle}>
                  {isQuestFinished ? 'Görev Tamamlandı!' : `${dailyStats.target} Quiz Bitir (+50 XP)`}
                </Text>
              </View>
            </View>
            <View style={styles.questCountPill}>
              <Text style={styles.questCountText}>
                {dailyStats.completed}/{dailyStats.target}
              </Text>
            </View>
          </View>

          <View style={styles.questProgressWrapper}>
            <ProgressBar
              progress={questProgress}
              height={14}
              fillColor="#16A34A"
            />
          </View>

          <View style={styles.questFooter}>
            <Text style={styles.questRewardText}>
              {isQuestFinished ? 'Tüm ödüller toplandı!' : 'Hedefi tamamla, liglerde yüksel!'}
            </Text>
            <Pressable
              onPress={() => router.push('/(home)/quiz')}
              style={styles.miniPlayButton}
              accessibilityRole="button"
              accessibilityLabel="Görevi oyna"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="play" size={14} color="#FFFFFF" />
              <Text style={styles.miniPlayText}>Devam</Text>
            </Pressable>
          </View>
        </View>

        {/* 3. MAIN GAME PLAY CARD (Big 3D Action) */}
        <View style={styles.playCard}>
          <View style={styles.playCardHeader}>
            <View style={styles.playBadge}>
              <Ionicons name="game-controller" size={16} color="#4F46E5" />
              <Text style={styles.playBadgeText}>QUİZ MODU</Text>
            </View>
            <View style={styles.xpRewardPill}>
              <Ionicons name="flash" size={14} color="#D97706" />
              <Text style={styles.xpRewardText}>+10 XP / Soru</Text>
            </View>
          </View>

          <Text style={styles.playCardTitle}>Kelime Bilgini Sına!</Text>
          <Text style={styles.playCardSubtitle}>
            5 soru ile İngilizce kelime dağarcığını güçlendir ve puanları topla.
          </Text>

          <TactileButton
            title="Hemen Başla"
            icon={<Ionicons name="rocket" size={20} color="#FFFFFF" />}
            variant="primary"
            size="lg"
            onPress={() => router.push('/(home)/quiz')}
          />
        </View>

        {/* 4. LEVEL PROGRESS ROADMAP */}
        <View style={styles.levelCard}>
          <View style={styles.levelCardHeader}>
            <View style={styles.levelBadgeContainer}>
              <Ionicons name="ribbon" size={20} color="#4F46E5" />
              <Text style={styles.levelCardTitle}>Seviye İlerlemesi ({currentLevel})</Text>
            </View>
            <Text style={styles.levelNextText}>
              {currentXP >= 1000 ? 'Maksimum Seviye' : `${xpNeeded} XP sonra ${nextLevelName}!`}
            </Text>
          </View>

          <ProgressBar
            progress={levelProgress}
            height={10}
            fillColor="#4F46E5"
          />
        </View>

        {/* 5. GAMIFIED BENTO ACTIONS */}
        <View style={styles.bentoRow}>
          {/* LEADERBOARD CARD */}
          <Pressable
            style={[styles.bentoCard, styles.leaderboardCard]}
            onPress={() => router.push('/(home)/leaderboard')}
            accessibilityRole="button"
            accessibilityLabel="Liderlik tablosunu görüntüle"
          >
            <View style={[styles.bentoIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="trophy" size={26} color="#D97706" />
            </View>
            <Text style={styles.bentoTitle}>Liderlik</Text>
            <Text style={styles.bentoSubtitle}>
              {userStats ? `Sıranız: #${userStats.rank}` : 'Podyuma Çık'}
            </Text>
            <View style={styles.bentoArrow}>
              <Ionicons name="arrow-forward" size={14} color="#D97706" />
            </View>
          </Pressable>

          {/* STATS & ACHIEVEMENTS CARD */}
          <Pressable
            style={[styles.bentoCard, styles.statsCard]}
            onPress={() => router.push('/(home)/stats')}
            accessibilityRole="button"
            accessibilityLabel="Başarımlar ve istatistikleri görüntüle"
          >
            <View style={[styles.bentoIconBox, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="medal" size={26} color="#0284C7" />
            </View>
            <Text style={styles.bentoTitle}>Başarımlar</Text>
            <Text style={styles.bentoSubtitle}>Rozetler & İstatistik</Text>
            <View style={styles.bentoArrow}>
              <Ionicons name="arrow-forward" size={14} color="#0284C7" />
            </View>
          </Pressable>
        </View>

        {/* 6. USER PROFILE & LOGOUT FOOTER */}
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <View style={styles.profileAvatar}>
              <Ionicons name="person" size={20} color="#4F46E5" />
            </View>
            <View>
              <Text style={styles.profileUsername}>{user?.username || 'Kullanıcı'}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
          <SignOutButton />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  questCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#E2E8F0',
    borderBottomColor: '#CBD5E1',
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  questTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  chestIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  questSuperText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  questTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 2,
  },
  questCountPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  questCountText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#475569',
  },
  questProgressWrapper: {
    marginBottom: 12,
  },
  questFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questRewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  miniPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#15803D',
    gap: 4,
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
  miniPlayText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  playCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: '#C7D2FE',
    borderBottomColor: '#A5B4FC',
  },
  playCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  playBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 6,
  },
  playBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#4F46E5',
    letterSpacing: 0.5,
  },
  xpRewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  xpRewardText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
  },
  playCardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 6,
  },
  playCardSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 18,
  },
  levelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    borderColor: '#E2E8F0',
    borderBottomColor: '#CBD5E1',
  },
  levelCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  levelNextText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  bentoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
    position: 'relative',
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
  leaderboardCard: {
    borderColor: '#FEF3C7',
    borderBottomColor: '#FDE68A',
  },
  statsCard: {
    borderColor: '#E0F2FE',
    borderBottomColor: '#BAE6FD',
  },
  bentoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  bentoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  bentoSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  bentoArrow: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderBottomWidth: 3,
    borderColor: '#E2E8F0',
    borderBottomColor: '#CBD5E1',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileUsername: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  profileEmail: {
    fontSize: 12,
    color: '#64748B',
  },
});

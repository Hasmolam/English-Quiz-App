import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApi } from '@/utils/api';
import { ProgressBar } from '@/components/ProgressBar';
import { BadgeCard, BadgeData } from '@/components/BadgeCard';

interface DailyActivityItem {
  day_name: string;
  date: string;
  is_completed: boolean;
  is_today: boolean;
}

interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  current_value: number;
  target_value: number;
  is_unlocked: boolean;
  color: string;
}

interface UserStats {
  total_score: number;
  level: string;
  rank: number;
  total_players: number;
  quizzes_completed: number;
  correct_answers: number;
  total_answers: number;
  accuracy_rate: number;
  current_streak: number;
  longest_streak: number;
  weekly_activity: DailyActivityItem[];
  achievements: AchievementItem[];
}

export default function StatsScreen() {
  const router = useRouter();
  const { fetchWithAuth } = useApi();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const data = await fetchWithAuth('/quiz/stats');
      setStats(data);
    } catch (error) {
      console.error('Stats loading error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Gelişimin yükleniyor...</Text>
      </View>
    );
  }

  const score = stats?.total_score || 0;
  const currentRank = stats?.rank || 1;
  const totalPlayers = stats?.total_players || 1;
  const userLevel = stats?.level || 'A1';
  const accuracyRate = stats?.accuracy_rate || 0;
  const streak = stats?.current_streak || 0;

  // Multi-tier Level Roadmap calculation:
  // A1: 0 - 100 XP
  // A2: 100 - 300 XP
  // B1: 300 - 600 XP
  // B2: 600 - 1000 XP
  // C1: 1000+ XP
  let tierBaseXP = 0;
  let tierTargetXP = 100;
  let nextLevelName = 'A2';

  if (score >= 1000) {
    tierBaseXP = 1000;
    tierTargetXP = 1000;
    nextLevelName = 'C1 (Usta)';
  } else if (score >= 600) {
    tierBaseXP = 600;
    tierTargetXP = 1000;
    nextLevelName = 'C1';
  } else if (score >= 300) {
    tierBaseXP = 300;
    tierTargetXP = 600;
    nextLevelName = 'B2';
  } else if (score >= 100) {
    tierBaseXP = 100;
    tierTargetXP = 300;
    nextLevelName = 'B1';
  } else {
    tierBaseXP = 0;
    tierTargetXP = 100;
    nextLevelName = 'A2';
  }

  const spanXP = tierTargetXP - tierBaseXP;
  const earnedInTier = Math.max(0, score - tierBaseXP);
  const currentLevelProgress = spanXP > 0 ? Math.min(1, earnedInTier / spanXP) : 1;
  const xpNeeded = Math.max(0, tierTargetXP - score);

  // Real achievement badges mapped from backend API
  const badges: BadgeData[] = (stats?.achievements || []).map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    icon: (a.icon as any) || 'medal',
    currentValue: a.current_value,
    targetValue: a.target_value,
    isUnlocked: a.is_unlocked,
    color: a.color,
  }));

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;
  const weeklyDays = stats?.weekly_activity || [];
  const activeWeeklyDaysCount = weeklyDays.filter((d) => d.is_completed).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Geri Dön"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </Pressable>
        <Text style={styles.appBarTitle}>Profil & İstatistikler</Text>
        <View style={styles.appBarBadge}>
          <Ionicons name="shield-checkmark" size={18} color="#4F46E5" />
          <Text style={styles.appBarBadgeText}>{userLevel}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Level Progression Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroIconBox}>
              <Ionicons name="school" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.heroTitleBox}>
              <Text style={styles.heroSubtitle}>GÜNCEL SEVİYE</Text>
              <Text style={styles.heroTitle}>{userLevel} - Keşif Seviyesi</Text>
            </View>
            <View style={styles.xpPill}>
              <Ionicons name="flash" size={14} color="#FBBF24" />
              <Text style={styles.xpPillText}>{score} XP</Text>
            </View>
          </View>

          <View style={styles.levelProgressContainer}>
            <View style={styles.levelProgressMeta}>
              <Text style={styles.levelProgressLabel}>
                {score >= 1000 ? 'En Üst Seviye' : `Sonraki Seviye (${nextLevelName})`}
              </Text>
              <Text style={styles.levelProgressValue}>
                {score >= 1000 ? 'Tamamlandı 🏆' : `${xpNeeded} XP kaldı`}
              </Text>
            </View>
            <ProgressBar
              progress={currentLevelProgress}
              height={14}
              fillColor="#F59E0B"
              backgroundColor="rgba(255, 255, 255, 0.25)"
            />
          </View>
        </View>

        {/* Bento Metrics 2x2 Grid */}
        <Text style={styles.sectionHeader}>Oyun İstatistikleri</Text>
        <View style={styles.bentoGrid}>
          {/* Bento 1: Total XP */}
          <View style={[styles.bentoCard, styles.bentoCardAmber]}>
            <View style={[styles.bentoIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="flash" size={22} color="#D97706" />
            </View>
            <Text style={styles.bentoValue}>{score}</Text>
            <Text style={styles.bentoLabel}>Toplam XP</Text>
          </View>

          {/* Bento 2: Leaderboard Rank */}
          <View style={[styles.bentoCard, styles.bentoCardIndigo]}>
            <View style={[styles.bentoIcon, { backgroundColor: '#E0E7FF' }]}>
              <Ionicons name="trophy" size={22} color="#4F46E5" />
            </View>
            <View style={styles.rankRow}>
              <Text style={styles.bentoValue}>#{currentRank}</Text>
              <Text style={styles.bentoSubtext}>/{totalPlayers}</Text>
            </View>
            <Text style={styles.bentoLabel}>Sıralama</Text>
          </View>

          {/* Bento 3: Real Streak Flame */}
          <View style={[styles.bentoCard, styles.bentoCardRed]}>
            <View style={[styles.bentoIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="flame" size={22} color="#DC2626" />
            </View>
            <Text style={styles.bentoValue}>{streak} Gün</Text>
            <Text style={styles.bentoLabel}>Ateşli Seri</Text>
          </View>

          {/* Bento 4: Real Accuracy Rate */}
          <View style={[styles.bentoCard, styles.bentoCardGreen]}>
            <View style={[styles.bentoIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="radio-button-on" size={22} color="#16A34A" />
            </View>
            <Text style={styles.bentoValue}>%{accuracyRate}</Text>
            <Text style={styles.bentoLabel}>İsabet Oranı</Text>
          </View>
        </View>

        {/* Weekly Activity Row */}
        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <View style={styles.activityTitleGroup}>
              <Ionicons name="calendar" size={18} color="#4F46E5" />
              <Text style={styles.activityTitle}>Haftalık Pratik Rutini</Text>
            </View>
            <Text style={styles.activityBadge}>{activeWeeklyDaysCount}/7 Gün</Text>
          </View>
          <View style={styles.daysRow}>
            {weeklyDays.map((day) => (
              <View key={day.date} style={styles.dayItem}>
                <View
                  style={[
                    styles.dayCircle,
                    day.is_completed && styles.dayCircleCompleted,
                    day.is_today && styles.dayCircleToday,
                  ]}
                >
                  {day.is_completed ? (
                    <Ionicons name="checkmark-sharp" size={16} color="#FFFFFF" />
                  ) : (
                    <Text style={styles.dayCirclePendingText}>{day.day_name[0]}</Text>
                  )}
                </View>
                <Text style={[styles.dayName, day.is_today && styles.dayNameToday]}>
                  {day.day_name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Achievement Badges Section */}
        <View style={styles.badgesHeaderRow}>
          <View>
            <Text style={styles.sectionHeader}>Başarı Rozetleri</Text>
            <Text style={styles.sectionSub}>Yeni rozetlerin kilidini açmak için oyna</Text>
          </View>
          <View style={styles.badgeCounterPill}>
            <Ionicons name="medal" size={15} color="#D97706" />
            <Text style={styles.badgeCounterText}>
              {unlockedCount}/{badges.length}
            </Text>
          </View>
        </View>

        <View style={styles.badgesList}>
          {badges.map((b) => (
            <BadgeCard key={b.id} badge={b} />
          ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  appBarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
  },
  appBarBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#4F46E5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#4338CA',
    borderBottomWidth: 5,
    borderBottomColor: '#3730A3',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  heroTitleBox: {
    flex: 1,
  },
  heroSubtitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#C7D2FE',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  xpPillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  levelProgressContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 16,
    padding: 12,
  },
  levelProgressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelProgressLabel: {
    color: '#E0E7FF',
    fontSize: 12,
    fontWeight: '700',
  },
  levelProgressValue: {
    color: '#FDE68A',
    fontSize: 12,
    fontWeight: '900',
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: -8,
    marginBottom: 14,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  bentoCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
  },
  bentoCardAmber: {
    borderColor: '#FEF3C7',
    borderBottomColor: '#FDE68A',
  },
  bentoCardIndigo: {
    borderColor: '#E0E7FF',
    borderBottomColor: '#C7D2FE',
  },
  bentoCardRed: {
    borderColor: '#FEE2E2',
    borderBottomColor: '#FECACA',
  },
  bentoCardGreen: {
    borderColor: '#DCFCE7',
    borderBottomColor: '#BBF7D0',
  },
  bentoIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  bentoValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bentoSubtext: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginLeft: 2,
  },
  bentoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 4,
    borderBottomColor: '#CBD5E1',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  activityBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayItem: {
    alignItems: 'center',
    gap: 6,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  dayCircleCompleted: {
    backgroundColor: '#22C55E',
    borderColor: '#16A34A',
  },
  dayCircleToday: {
    borderColor: '#4F46E5',
    borderWidth: 2.5,
  },
  dayCirclePendingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
  },
  dayName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  dayNameToday: {
    color: '#4F46E5',
    fontWeight: '900',
  },
  badgesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeCounterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  badgeCounterText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#B45309',
  },
  badgesList: {
    marginTop: 4,
  },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useApi } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface LeaderboardUser {
  id: number;
  username?: string;
  email?: string;
  total_score: number;
  level?: string;
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { fetchWithAuth } = useApi();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLeague, setActiveLeague] = useState<'bronz' | 'gumus' | 'altin'>('bronz');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/quiz/leaderboard');
      setUsers(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const top1 = users[0];
  const top2 = users[1];
  const top3 = users[2];
  const remainingUsers = users.slice(3);

  // Find user's rank
  const myRankIndex = users.findIndex((u) => u.id === currentUser?.id);
  const myRank = myRankIndex !== -1 ? myRankIndex + 1 : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. Header Bar */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Geri Dön"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <View style={styles.headerTitleRow}>
          <Ionicons name="trophy" size={22} color="#D97706" style={{ marginRight: 6 }} />
          <Text style={styles.headerTitle}>Liderlik Tablosu</Text>
        </View>
      </View>

      {/* 2. League Tabs */}
      <View style={styles.leagueTabsContainer} accessibilityRole="tablist">
        {(['bronz', 'gumus', 'altin'] as const).map((league) => {
          const isActive = activeLeague === league;
          const leagueInfo: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
            bronz: { label: 'Bronz', icon: 'shield', color: '#CD7F32' },
            gumus: { label: 'Gümüş', icon: 'shield-half', color: '#94A3B8' },
            altin: { label: 'Altın', icon: 'shield-checkmark', color: '#D97706' },
          };
          const info = leagueInfo[league];
          return (
            <Pressable
              key={league}
              onPress={() => setActiveLeague(league)}
              style={[styles.leagueTab, isActive && styles.leagueTabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${info.label} Ligi`}
            >
              <Ionicons
                name={info.icon}
                size={16}
                color={isActive ? '#FFFFFF' : info.color}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[styles.leagueTabText, isActive && styles.leagueTabTextActive]}
              >
                {info.label} Lig
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Sıralama Hesaplanıyor...</Text>
        </View>
      ) : (
        <View style={styles.mainContainer}>
          {/* 3. PODIUM STAGE FOR TOP 3 */}
          {users.length > 0 && (
            <View style={styles.podiumSection}>
              {/* 2nd Place (Silver) */}
              {top2 ? (
                <View style={styles.podiumColumn}>
                  <View style={[styles.avatarCircle, styles.avatarSilver]}>
                    <Text style={styles.avatarInitial}>
                      {(top2.username || '2')[0].toUpperCase()}
                    </Text>
                    <View style={styles.medalBadgeSilver}>
                      <Text style={styles.medalBadgeText}>2</Text>
                    </View>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {top2.username || 'User 2'}
                  </Text>
                  <Text style={styles.podiumScore}>{top2.total_score} XP</Text>
                  <View style={[styles.podiumBase, styles.podiumBaseSilver]}>
                    <Text style={styles.podiumBaseNumber}>2</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.podiumColumn} />
              )}

              {/* 1st Place (Gold) - Center and Tallest */}
              {top1 ? (
                <View style={[styles.podiumColumn, styles.podiumColumnCenter]}>
                  <View style={styles.crownContainer}>
                    <Ionicons name="trophy" size={26} color="#D97706" />
                  </View>
                  <View style={[styles.avatarCircle, styles.avatarGold]}>
                    <Text style={[styles.avatarInitial, { color: '#B45309' }]}>
                      {(top1.username || '1')[0].toUpperCase()}
                    </Text>
                    <View style={styles.medalBadgeGold}>
                      <Text style={styles.medalBadgeText}>1</Text>
                    </View>
                  </View>
                  <Text style={[styles.podiumName, styles.podiumNameGold]} numberOfLines={1}>
                    {top1.username || 'User 1'}
                  </Text>
                  <Text style={[styles.podiumScore, styles.podiumScoreGold]}>
                    {top1.total_score} XP
                  </Text>
                  <View style={[styles.podiumBase, styles.podiumBaseGold]}>
                    <Text style={[styles.podiumBaseNumber, { color: '#92400E' }]}>1</Text>
                  </View>
                </View>
              ) : null}

              {/* 3rd Place (Bronze) */}
              {top3 ? (
                <View style={styles.podiumColumn}>
                  <View style={[styles.avatarCircle, styles.avatarBronze]}>
                    <Text style={styles.avatarInitial}>
                      {(top3.username || '3')[0].toUpperCase()}
                    </Text>
                    <View style={styles.medalBadgeBronze}>
                      <Text style={styles.medalBadgeText}>3</Text>
                    </View>
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {top3.username || 'User 3'}
                  </Text>
                  <Text style={styles.podiumScore}>{top3.total_score} XP</Text>
                  <View style={[styles.podiumBase, styles.podiumBaseBronze]}>
                    <Text style={styles.podiumBaseNumber}>3</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.podiumColumn} />
              )}
            </View>
          )}

          {/* 4. REMAINING PLAYERS LIST (#4+) */}
          <FlatList
            data={remainingUsers}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => {
              const actualRank = index + 4;
              const isMe = item.id === currentUser?.id;

              return (
                <View
                  style={[
                    styles.playerCard,
                    isMe && styles.playerCardMe,
                  ]}
                >
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankBadgeText}>#{actualRank}</Text>
                  </View>

                  <View style={styles.playerAvatar}>
                    <Text style={styles.playerAvatarText}>
                      {(item.username || 'U')[0].toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.playerDetails}>
                    <View style={styles.playerNameRow}>
                      <Text style={styles.playerName} numberOfLines={1}>
                        {item.username || `User ${item.id}`}
                      </Text>
                      {isMe && (
                        <View style={styles.youBadge}>
                          <Text style={styles.youBadgeText}>Sen</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.playerLevel}>{item.level || 'A1 Seviye'}</Text>
                  </View>

                  <View style={styles.playerScorePill}>
                    <Ionicons name="flash" size={14} color="#F59E0B" />
                    <Text style={styles.playerScoreText}>{item.total_score} XP</Text>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              users.length <= 3 ? null : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Daha fazla oyuncu yok.</Text>
                </View>
              )
            }
          />

          {/* 5. STICKY USER RANK FOOTER */}
          {myRank !== null && (
            <View style={styles.stickyRankBar}>
              <View style={styles.stickyRankInfo}>
                <View style={styles.stickyRankBadge}>
                  <Text style={styles.stickyRankNumber}>#{myRank}</Text>
                </View>
                <View>
                  <Text style={styles.stickyTitle}>Sıralaman</Text>
                  <Text style={styles.stickySubtitle}>
                    {myRank === 1 ? 'Lider sensin! 👑' : `${users[0]?.total_score - (currentUser?.total_score || 0)} XP ile 1. sıradasın`}
                  </Text>
                </View>
              </View>

              <View style={styles.stickyScoreBadge}>
                <Ionicons name="flash" size={16} color="#FFFFFF" />
                <Text style={styles.stickyScoreText}>{currentUser?.total_score || 0} XP</Text>
              </View>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 6,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leagueTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  leagueTab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: 'transparent',
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
  leagueTabActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#3730A3',
  },
  leagueTabText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  leagueTabTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  mainContainer: {
    flex: 1,
  },
  podiumSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  podiumColumn: {
    flex: 1,
    alignItems: 'center',
  },
  podiumColumnCenter: {
    zIndex: 10,
  },
  crownContainer: {
    marginBottom: -8,
    zIndex: 10,
  },
  crownEmoji: {
    fontSize: 24,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    position: 'relative',
    marginBottom: 6,
  },
  avatarGold: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 5,
  },
  avatarSilver: {
    borderColor: '#94A3B8',
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 4,
  },
  avatarBronze: {
    borderColor: '#F97316',
    backgroundColor: '#FFEDD5',
    borderBottomWidth: 4,
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '900',
    color: '#475569',
  },
  medalBadgeGold: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medalBadgeSilver: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#94A3B8',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medalBadgeBronze: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#F97316',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medalBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
  },
  podiumName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    maxWidth: 90,
  },
  podiumNameGold: {
    fontSize: 15,
    color: '#92400E',
  },
  podiumScore: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 8,
  },
  podiumScoreGold: {
    color: '#B45309',
    fontWeight: '900',
  },
  podiumBase: {
    width: '90%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumBaseGold: {
    height: 105,
    backgroundColor: '#FDE68A',
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: '#F59E0B',
  },
  podiumBaseSilver: {
    height: 80,
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: '#94A3B8',
  },
  podiumBaseBronze: {
    height: 60,
    backgroundColor: '#FFEDD5',
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: '#FB923C',
  },
  podiumBaseNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#64748B',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    borderColor: '#E2E8F0',
    borderBottomColor: '#CBD5E1',
  },
  playerCardMe: {
    borderColor: '#C7D2FE',
    borderBottomColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  rankBadge: {
    width: 32,
    marginRight: 8,
  },
  rankBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#64748B',
  },
  rankBadgeTextMe: {
    color: '#4F46E5',
  },
  playerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerAvatarText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#4F46E5',
  },
  playerDetails: {
    flex: 1,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  playerNameMe: {
    color: '#312E81',
  },
  youBadge: {
    backgroundColor: '#C7D2FE',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  youBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3730A3',
  },
  playerLevel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  playerScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  playerScoreText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#D97706',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    color: '#94A3B8',
    fontWeight: '700',
  },
  stickyRankBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 2,
    borderTopColor: '#3730A3',
  },
  stickyRankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stickyRankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyRankNumber: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  stickyTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
  stickySubtitle: {
    color: '#DDD6FE',
    fontSize: 12,
    fontWeight: '600',
  },
  stickyScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  stickyScoreText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
});

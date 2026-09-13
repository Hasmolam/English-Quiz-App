import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from './ProgressBar';

export interface BadgeData {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  currentValue: number;
  targetValue: number;
  isUnlocked: boolean;
  color: string;
}

interface BadgeCardProps {
  badge: BadgeData;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  const progress = Math.min(1, badge.currentValue / badge.targetValue);

  return (
    <View style={[styles.card, badge.isUnlocked ? styles.cardUnlocked : styles.cardLocked]}>
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: badge.isUnlocked ? badge.color : '#CBD5E1' },
          ]}
        >
          <Ionicons
            name={badge.icon}
            size={26}
            color={badge.isUnlocked ? '#FFFFFF' : '#64748B'}
          />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{badge.title}</Text>
            {badge.isUnlocked && (
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            )}
          </View>
          <Text style={styles.description}>{badge.description}</Text>
        </View>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressBarWrapper}>
          <ProgressBar
            progress={progress}
            height={8}
            fillColor={badge.isUnlocked ? '#10B981' : badge.color}
          />
        </View>
        <Text style={styles.progressText}>
          {badge.currentValue}/{badge.targetValue}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderBottomWidth: 4,
  },
  cardUnlocked: {
    borderColor: '#E2E8F0',
    borderBottomColor: '#CBD5E1',
  },
  cardLocked: {
    borderColor: '#F1F5F9',
    borderBottomColor: '#E2E8F0',
    opacity: 0.85,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  description: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarWrapper: {
    flex: 1,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
});

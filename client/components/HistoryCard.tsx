import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

interface HistoryCardProps {
  fileName: string;
  score: number;
  date: string;
  onPress: () => void;
}

export function HistoryCard({ fileName, score, date, onPress }: HistoryCardProps) {
  const { theme } = useTheme();

  const getScoreColor = () => {
    if (score >= 80) return theme.scoreExcellent;
    if (score >= 60) return theme.scoreGood;
    if (score >= 40) return theme.scoreAverage;
    return theme.scorePoor;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}15` }]}>
        <Feather name="file-text" size={20} color={theme.primary} />
      </View>
      <View style={styles.content}>
        <ThemedText type="h4" numberOfLines={1} style={styles.fileName}>
          {fileName}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {formatDate(date)}
        </ThemedText>
      </View>
      <View style={[styles.scoreBadge, { backgroundColor: `${getScoreColor()}15` }]}>
        <ThemedText type="h4" style={{ color: getScoreColor() }}>
          {score}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  fileName: {
    marginBottom: Spacing.xs,
  },
  scoreBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
});

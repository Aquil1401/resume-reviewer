import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

interface SectionStatusProps {
  title: string;
  present: boolean;
  score?: number;
  issues?: string[];
  onPress?: () => void;
}

export function SectionStatus({ title, present, score, issues = [], onPress }: SectionStatusProps) {
  const { theme } = useTheme();

  const getStatusColor = () => {
    if (!present) return theme.error;
    if (score && score >= 80) return theme.success;
    if (score && score >= 60) return theme.primary;
    if (score && score >= 40) return theme.warning;
    return theme.error;
  };

  const statusColor = getStatusColor();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <ThemedText type="h4" style={styles.title}>
            {title}
          </ThemedText>
        </View>
        <View style={styles.statusContainer}>
          {present ? (
            <Feather name="check-circle" size={20} color={statusColor} />
          ) : (
            <Feather name="x-circle" size={20} color={statusColor} />
          )}
          {score !== undefined && (
            <ThemedText type="small" style={[styles.score, { color: statusColor }]}>
              {score}%
            </ThemedText>
          )}
        </View>
      </View>
      {issues.length > 0 && (
        <View style={styles.issuesList}>
          {issues.slice(0, 2).map((issue, index) => (
            <View key={index} style={styles.issueRow}>
              <Feather name="alert-circle" size={14} color={theme.warning} />
              <ThemedText type="small" style={[styles.issueText, { color: theme.textSecondary }]}>
                {issue}
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  title: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  score: {
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  issuesList: {
    marginTop: Spacing.sm,
    paddingLeft: Spacing.lg,
  },
  issueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  issueText: {
    flex: 1,
  },
});

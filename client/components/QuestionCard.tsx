import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

interface QuestionCardProps {
  category: 'hr' | 'technical' | 'situational';
  question: string;
  hint?: string;
  index: number;
}

export function QuestionCard({ category, question, hint, index }: QuestionCardProps) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const getCategoryConfig = () => {
    switch (category) {
      case 'hr':
        return { icon: 'users' as const, color: theme.primary, label: 'HR' };
      case 'technical':
        return { icon: 'code' as const, color: theme.accent, label: 'Technical' };
      case 'situational':
        return { icon: 'message-circle' as const, color: theme.warning, label: 'Situational' };
    }
  };

  const config = getCategoryConfig();

  return (
    <Pressable
      onPress={() => hint && setExpanded(!expanded)}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.indexBadge, { backgroundColor: `${config.color}15` }]}>
          <ThemedText type="caption" style={{ color: config.color, fontWeight: '600' }}>
            {index + 1}
          </ThemedText>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: `${config.color}15` }]}>
          <Feather name={config.icon} size={12} color={config.color} />
          <ThemedText type="caption" style={{ color: config.color, marginLeft: 4 }}>
            {config.label}
          </ThemedText>
        </View>
      </View>
      <ThemedText type="body" style={styles.question}>
        {question}
      </ThemedText>
      {hint && (
        <>
          <Pressable
            onPress={() => setExpanded(!expanded)}
            style={styles.hintToggle}
          >
            <Feather
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={theme.textSecondary}
            />
            <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 4 }}>
              {expanded ? 'Hide hint' : 'Show hint'}
            </ThemedText>
          </Pressable>
          {expanded && (
            <View style={[styles.hintContainer, { backgroundColor: `${theme.primary}08` }]}>
              <Feather name="info" size={14} color={theme.primary} />
              <ThemedText type="small" style={[styles.hintText, { color: theme.textSecondary }]}>
                {hint}
              </ThemedText>
            </View>
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  indexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  question: {
    lineHeight: 24,
  },
  hintToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  hintText: {
    flex: 1,
  },
});

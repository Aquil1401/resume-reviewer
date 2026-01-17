import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

interface PremiumBadgeProps {
  size?: 'small' | 'medium';
}

export function PremiumBadge({ size = 'small' }: PremiumBadgeProps) {
  const { theme } = useTheme();

  const isSmall = size === 'small';

  return (
    <View style={[styles.container, { backgroundColor: `${theme.premium}20` }]}>
      <Feather
        name="star"
        size={isSmall ? 10 : 14}
        color={theme.premium}
      />
      {!isSmall && (
        <ThemedText
          type="caption"
          style={[styles.text, { color: theme.premium }]}
        >
          Premium
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  text: {
    fontWeight: '600',
  },
});

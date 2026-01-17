import React from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { updateSubscription } from '@/lib/storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/RootStackNavigator';

type PremiumUpgradeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PremiumUpgrade'>;
};

const features = [
  { icon: 'check-circle', title: 'Unlimited Resume Scans', included: { free: '3 scans', premium: 'Unlimited' } },
  { icon: 'target', title: 'JD Matching', included: { free: 'Basic', premium: 'Advanced' } },
  { icon: 'edit-3', title: 'Resume Improvement', included: { free: false, premium: true } },
  { icon: 'help-circle', title: 'Interview Questions', included: { free: false, premium: true } },
  { icon: 'file-plus', title: 'Cover Letter Generator', included: { free: false, premium: true } },
  { icon: 'star', title: 'Priority Support', included: { free: false, premium: true } },
];

export default function PremiumUpgradeScreen({ navigation }: PremiumUpgradeScreenProps) {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    Alert.alert(
      'Demo Mode',
      'This is a demo. In a real app, this would connect to a payment processor. For now, we\'ll activate premium features.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate Premium',
          onPress: async () => {
            await updateSubscription({
              tier: 'premium',
              scansRemaining: 999,
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: headerHeight + Spacing.xl, paddingBottom: insets.bottom + Spacing['3xl'] },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${theme.premium}20` }]}>
          <Feather name="star" size={32} color={theme.premium} />
        </View>
        <ThemedText type="h1" style={styles.title}>
          Go Premium
        </ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          Unlock all features and land your dream job faster
        </ThemedText>
      </View>

      <View style={[styles.comparisonCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.comparisonHeader}>
          <View style={styles.planColumn} />
          <View style={styles.planColumn}>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              FREE
            </ThemedText>
          </View>
          <View style={styles.planColumn}>
            <View style={[styles.premiumLabel, { backgroundColor: `${theme.premium}20` }]}>
              <ThemedText type="caption" style={{ color: theme.premium, fontWeight: '600' }}>
                PREMIUM
              </ThemedText>
            </View>
          </View>
        </View>

        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <View style={styles.featureInfo}>
              <Feather name={feature.icon as any} size={16} color={theme.textSecondary} />
              <ThemedText type="body" style={styles.featureTitle}>
                {feature.title}
              </ThemedText>
            </View>
            <View style={styles.planColumn}>
              {typeof feature.included.free === 'string' ? (
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {feature.included.free}
                </ThemedText>
              ) : feature.included.free ? (
                <Feather name="check" size={18} color={theme.accent} />
              ) : (
                <Feather name="x" size={18} color={theme.textSecondary} />
              )}
            </View>
            <View style={styles.planColumn}>
              {typeof feature.included.premium === 'string' ? (
                <ThemedText type="small" style={{ color: theme.accent, fontWeight: '600' }}>
                  {feature.included.premium}
                </ThemedText>
              ) : (
                <Feather name="check" size={18} color={theme.accent} />
              )}
            </View>
          </View>
        ))}
      </View>

      <ThemedText type="h3" style={styles.pricingTitle}>
        Choose Your Plan
      </ThemedText>

      <View style={styles.pricingCards}>
        <Pressable
          onPress={() => handleSubscribe('monthly')}
          style={({ pressed }) => [
            styles.pricingCard,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <ThemedText type="h4">Monthly</ThemedText>
          <View style={styles.priceRow}>
            <ThemedText type="hero" style={{ color: theme.primary }}>$9.99</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>/month</ThemedText>
          </View>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Cancel anytime
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => handleSubscribe('yearly')}
          style={({ pressed }) => [
            styles.pricingCard,
            styles.popularCard,
            { backgroundColor: `${theme.primary}08`, borderColor: theme.primary, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <View style={[styles.saveBadge, { backgroundColor: theme.accent }]}>
            <ThemedText type="caption" style={{ color: '#FFFFFF', fontWeight: '600' }}>
              SAVE 40%
            </ThemedText>
          </View>
          <ThemedText type="h4">Yearly</ThemedText>
          <View style={styles.priceRow}>
            <ThemedText type="hero" style={{ color: theme.primary }}>$71.99</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>/year</ThemedText>
          </View>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Just $5.99/month
          </ThemedText>
        </Pressable>
      </View>

      <ThemedText type="small" style={[styles.disclaimer, { color: theme.textSecondary }]}>
        Payment will be charged to your account upon confirmation. Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period.
      </ThemedText>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
  },
  comparisonCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  comparisonHeader: {
    flexDirection: 'row',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    marginBottom: Spacing.sm,
  },
  planColumn: {
    width: 70,
    alignItems: 'center',
  },
  premiumLabel: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  featureInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureTitle: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  pricingTitle: {
    marginBottom: Spacing.md,
  },
  pricingCards: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  pricingCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  popularCard: {
    borderWidth: 2,
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  disclaimer: {
    textAlign: 'center',
    lineHeight: 18,
  },
});

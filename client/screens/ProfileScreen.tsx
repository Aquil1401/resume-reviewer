import React, { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { View, StyleSheet, Pressable, Alert, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { PremiumBadge } from '@/components/PremiumBadge';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { getSubscription, updateSubscription, resetAllData } from '@/lib/storage';
import type { UserSubscription } from '@/types/resume';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootStackParamList } from '@/navigation/RootStackNavigator';
import type { MainTabParamList } from '@/navigation/MainTabNavigator';

type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'ProfileTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [subscription, setSubscription] = useState<UserSubscription | null>(null);

  const loadData = useCallback(async () => {
    const sub = await getSubscription();
    setSubscription(sub);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleUpgrade = () => {
    navigation.navigate('PremiumUpgrade');
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will clear all your scan history and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
            await loadData();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) Alert.alert("Error", error.message);
          }
        }
      ]
    );
  };

  const isPremium = subscription?.tier === 'premium';

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: headerHeight + Spacing.xl, paddingBottom: tabBarHeight + Spacing.xl },
      ]}
    >
      <View style={styles.profileHeader}>
        <Image
          source={require('../../assets/images/illustrations/profile-avatar.png')}
          style={styles.avatar}
        />
        <ThemedText type="h2" style={styles.userName}>
          Job Seeker
        </ThemedText>
        {isPremium ? (
          <PremiumBadge size="medium" />
        ) : (
          <View style={[styles.freeBadge, { backgroundColor: `${theme.textSecondary}15` }]}>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Free Plan
            </ThemedText>
          </View>
        )}
      </View>

      <Card style={[styles.subscriptionCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.subscriptionHeader}>
          <ThemedText type="h4">Your Plan</ThemedText>
          {isPremium ? (
            <View style={[styles.planBadge, { backgroundColor: `${theme.premium}15` }]}>
              <Feather name="star" size={14} color={theme.premium} />
              <ThemedText type="caption" style={{ color: theme.premium, marginLeft: 4 }}>
                Premium
              </ThemedText>
            </View>
          ) : (
            <View style={[styles.planBadge, { backgroundColor: `${theme.textSecondary}15` }]}>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Free
              </ThemedText>
            </View>
          )}
        </View>

        {!isPremium ? (
          <>
            <View style={styles.usageRow}>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                Scans remaining
              </ThemedText>
              <ThemedText type="h4">
                {subscription?.scansRemaining || 0} / {subscription?.maxFreeScans || 3}
              </ThemedText>
            </View>
            <View style={[styles.usageBar, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.usageProgress,
                  {
                    backgroundColor: theme.primary,
                    width: `${((subscription?.scansRemaining || 0) / (subscription?.maxFreeScans || 3)) * 100}%`,
                  },
                ]}
              />
            </View>
            <Button onPress={handleUpgrade} style={styles.upgradeButton}>
              Upgrade to Premium
            </Button>
          </>
        ) : (
          <View style={styles.premiumPerks}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Unlimited scans, JD matching, resume improvement, and more!
            </ThemedText>
          </View>
        )}
      </Card>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Features
      </ThemedText>

      <View style={styles.featuresList}>
        {[
          { icon: 'file-text', title: 'Resume Scan', desc: 'ATS compatibility analysis', free: true },
          { icon: 'target', title: 'JD Matching', desc: 'Compare with job descriptions', free: false },
          { icon: 'edit-3', title: 'Resume Improvement', desc: 'AI-powered rewriting', free: false },
          { icon: 'help-circle', title: 'Interview Questions', desc: 'Personalized prep questions', free: false },
          { icon: 'file-plus', title: 'Cover Letter', desc: 'Auto-generate cover letters', free: false },
        ].map((feature, index) => (
          <View
            key={index}
            style={[styles.featureRow, { backgroundColor: theme.backgroundDefault }]}
          >
            <View style={[styles.featureIcon, { backgroundColor: `${theme.primary}15` }]}>
              <Feather name={feature.icon as any} size={18} color={theme.primary} />
            </View>
            <View style={styles.featureContent}>
              <ThemedText type="h4">{feature.title}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {feature.desc}
              </ThemedText>
            </View>
            {feature.free ? (
              <Feather name="check-circle" size={20} color={theme.accent} />
            ) : isPremium ? (
              <Feather name="check-circle" size={20} color={theme.accent} />
            ) : (
              <View style={[styles.lockedBadge, { backgroundColor: `${theme.premium}15` }]}>
                <Feather name="lock" size={12} color={theme.premium} />
              </View>
            )}
          </View>
        ))}
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Settings
      </ThemedText>

      <Pressable
        onPress={handleResetData}
        style={({ pressed }) => [
          styles.settingRow,
          { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <View style={[styles.settingIcon, { backgroundColor: `${theme.error}15` }]}>
          <Feather name="trash-2" size={18} color={theme.error} />
        </View>
        <View style={styles.settingContent}>
          <ThemedText type="h4">Reset All Data</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Clear scan history and settings
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </Pressable>

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.settingRow,
          { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <View style={[styles.settingIcon, { backgroundColor: `${theme.textSecondary}15` }]}>
          <Feather name="log-out" size={18} color={theme.text} />
        </View>
        <View style={styles.settingContent}>
          <ThemedText type="h4">Sign Out</ThemedText>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </Pressable>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: Spacing.md,
  },
  userName: {
    marginBottom: Spacing.sm,
  },
  freeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  subscriptionCard: {
    marginBottom: Spacing['2xl'],
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  usageBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  usageProgress: {
    height: '100%',
    borderRadius: 4,
  },
  upgradeButton: {},
  premiumPerks: {
    paddingTop: Spacing.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  featuresList: {
    marginBottom: Spacing['2xl'],
    gap: Spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  lockedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
});

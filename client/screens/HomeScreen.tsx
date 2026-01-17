import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { StatCard } from '@/components/StatCard';
import { HistoryCard } from '@/components/HistoryCard';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { getScanHistory, getSubscription, getCurrentResume } from '@/lib/storage';
import type { ScanHistoryItem, UserSubscription, ResumeAnalysis } from '@/types/resume';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootStackParamList } from '@/navigation/RootStackNavigator';
import type { MainTabParamList } from '@/navigation/MainTabNavigator';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'HomeTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [currentResume, setCurrentResume] = useState<ResumeAnalysis | null>(null);

  const loadData = useCallback(async () => {
    const [historyData, subData, resumeData] = await Promise.all([
      getScanHistory(),
      getSubscription(),
      getCurrentResume(),
    ]);
    setHistory(historyData);
    setSubscription(subData);
    setCurrentResume(resumeData);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const avgScore = history.length > 0
    ? Math.round(history.reduce((sum, h) => sum + h.score, 0) / history.length)
    : 0;

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: headerHeight + Spacing.xl, paddingBottom: tabBarHeight + Spacing.xl },
      ]}
    >
      <Card
        style={[styles.heroCard, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('ScanTab')}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroTextContainer}>
            <ThemedText type="h2" style={styles.heroTitle}>
              Upload New Resume
            </ThemedText>
            <ThemedText type="body" style={styles.heroSubtitle}>
              Get your ATS compatibility score and actionable insights
            </ThemedText>
          </View>
          <View style={[styles.heroIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Feather name="upload" size={28} color="#FFFFFF" />
          </View>
        </View>
      </Card>

      <View style={styles.statsRow}>
        <StatCard
          icon="file-text"
          label="Total Scans"
          value={subscription?.scansUsed || 0}
          color={theme.primary}
        />
        <View style={{ width: Spacing.sm }} />
        <StatCard
          icon="trending-up"
          label="Avg Score"
          value={avgScore > 0 ? `${avgScore}%` : '--'}
          color={theme.accent}
        />
        <View style={{ width: Spacing.sm }} />
        <StatCard
          icon="check-circle"
          label="Improvements"
          value={history.length}
          color={theme.warning}
        />
      </View>

      {currentResume ? (
        <Pressable
          onPress={() => navigation.navigate('ResumeReport', { analysisId: currentResume.id })}
          style={({ pressed }) => [
            styles.currentResumeCard,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <View style={styles.currentResumeHeader}>
            <ThemedText type="h4">Current Resume</ThemedText>
            <View style={[styles.scorePill, { backgroundColor: `${theme.accent}15` }]}>
              <ThemedText type="h4" style={{ color: theme.accent }}>
                {currentResume.atsScore}%
              </ThemedText>
            </View>
          </View>
          <ThemedText type="body" numberOfLines={1} style={{ color: theme.textSecondary }}>
            {currentResume.fileName}
          </ThemedText>
          <View style={styles.currentResumeActions}>
            <Pressable
              onPress={() => navigation.navigate('JDMatch')}
              style={[styles.actionButton, { backgroundColor: `${theme.primary}10` }]}
            >
              <Feather name="target" size={16} color={theme.primary} />
              <ThemedText type="small" style={{ color: theme.primary, marginLeft: Spacing.xs }}>
                Match with JD
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('ImproveResume')}
              style={[styles.actionButton, { backgroundColor: `${theme.accent}10` }]}
            >
              <Feather name="edit-3" size={16} color={theme.accent} />
              <ThemedText type="small" style={{ color: theme.accent, marginLeft: Spacing.xs }}>
                Improve
              </ThemedText>
            </Pressable>
          </View>
        </Pressable>
      ) : null}

      <View style={styles.sectionHeader}>
        <ThemedText type="h3">Quick Actions</ThemedText>
      </View>

      <View style={styles.quickActionsRow}>
        <Pressable
          onPress={() => navigation.navigate('JDMatch')}
          style={({ pressed }) => [
            styles.quickAction,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: `${theme.primary}15` }]}>
            <Feather name="target" size={22} color={theme.primary} />
          </View>
          <ThemedText type="h4" style={styles.quickActionTitle}>
            Match with JD
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            Compare with job description
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('CoverLetter')}
          style={({ pressed }) => [
            styles.quickAction,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: `${theme.accent}15` }]}>
            <Feather name="file-plus" size={22} color={theme.accent} />
          </View>
          <ThemedText type="h4" style={styles.quickActionTitle}>
            Cover Letter
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            Generate professional letter
          </ThemedText>
        </Pressable>
      </View>

      {history.length > 0 ? (
        <>
          <View style={styles.sectionHeader}>
            <ThemedText type="h3">Recent Scans</ThemedText>
            <Pressable onPress={() => navigation.navigate('HistoryTab')}>
              <ThemedText type="link">View All</ThemedText>
            </Pressable>
          </View>
          {history.slice(0, 3).map((item) => (
            <HistoryCard
              key={item.id}
              fileName={item.fileName}
              score={item.score}
              date={item.scannedAt}
              onPress={() => navigation.navigate('ResumeReport', { analysisId: item.id })}
            />
          ))}
        </>
      ) : null}
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
  heroCard: {
    marginBottom: Spacing.lg,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: Spacing['2xl'],
  },
  currentResumeCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing['2xl'],
  },
  currentResumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  scorePill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  currentResumeActions: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  quickAction: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionTitle: {
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
});

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { ScoreCircle } from '@/components/ScoreCircle';
import { SectionStatus } from '@/components/SectionStatus';
import { PremiumBadge } from '@/components/PremiumBadge';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { getCurrentResume, getSubscription } from '@/lib/storage';
import type { ResumeAnalysis, UserSubscription } from '@/types/resume';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/RootStackNavigator';

type ResumeReportScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ResumeReport'>;
  route: RouteProp<RootStackParamList, 'ResumeReport'>;
};

export default function ResumeReportScreen({ navigation, route }: ResumeReportScreenProps) {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [resumeData, subData] = await Promise.all([
        getCurrentResume(),
        getSubscription(),
      ]);
      setAnalysis(resumeData);
      setSubscription(subData);
    };
    loadData();
  }, [route.params?.analysisId]);

  const isPremium = subscription?.tier === 'premium';

  const handleMatchJD = () => {
    navigation.navigate('JDMatch');
  };

  const handleImprove = () => {
    if (!isPremium) {
      navigation.navigate('PremiumUpgrade');
      return;
    }
    navigation.navigate('ImproveResume');
  };

  const handleInterviewQuestions = () => {
    if (!isPremium) {
      navigation.navigate('PremiumUpgrade');
      return;
    }
    navigation.navigate('InterviewQuestions');
  };

  if (!analysis) {
    return (
      <View style={[styles.container, styles.loading, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText type="body">Loading analysis...</ThemedText>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: headerHeight + Spacing.xl, paddingBottom: insets.bottom + Spacing['3xl'] },
      ]}
    >
      <View style={styles.scoreSection}>
        <ScoreCircle score={analysis.atsScore} size={140} />
      </View>

      <View style={[styles.fileInfo, { backgroundColor: theme.backgroundDefault }]}>
        <Feather name="file-text" size={18} color={theme.primary} />
        <ThemedText type="body" numberOfLines={1} style={styles.fileName}>
          {analysis.fileName}
        </ThemedText>
      </View>

      <ThemedText type="h3" style={styles.sectionTitle}>
        Section Analysis
      </ThemedText>

      <SectionStatus
        title="Skills"
        present={analysis.sections.skills.present}
        score={analysis.sections.skills.score}
        issues={analysis.sections.skills.issues}
      />
      <SectionStatus
        title="Experience"
        present={analysis.sections.experience.present}
        score={analysis.sections.experience.score}
        issues={analysis.sections.experience.issues}
      />
      <SectionStatus
        title="Education"
        present={analysis.sections.education.present}
        score={analysis.sections.education.score}
        issues={analysis.sections.education.issues}
      />
      <SectionStatus
        title="Keywords"
        present={analysis.sections.keywords.present}
        score={analysis.sections.keywords.score}
        issues={analysis.sections.keywords.issues}
      />
      <SectionStatus
        title="Formatting"
        present={analysis.sections.formatting.present}
        score={analysis.sections.formatting.score}
        issues={analysis.sections.formatting.issues}
      />

      {analysis.missingItems.length > 0 ? (
        <>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Missing Items
          </ThemedText>
          <View style={[styles.missingCard, { backgroundColor: theme.backgroundDefault }]}>
            {analysis.missingItems.map((item, index) => (
              <View key={index} style={styles.missingRow}>
                <Feather name="alert-circle" size={16} color={theme.warning} />
                <ThemedText type="body" style={[styles.missingText, { color: theme.textSecondary }]}>
                  {item}
                </ThemedText>
              </View>
            ))}
          </View>
        </>
      ) : null}

      {analysis.suggestions.length > 0 ? (
        <>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Suggestions
          </ThemedText>
          <View style={[styles.suggestionsCard, { backgroundColor: `${theme.accent}10` }]}>
            {analysis.suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionRow}>
                <Feather name="check" size={16} color={theme.accent} />
                <ThemedText type="body" style={styles.suggestionText}>
                  {suggestion}
                </ThemedText>
              </View>
            ))}
          </View>
        </>
      ) : null}

      <ThemedText type="h3" style={styles.sectionTitle}>
        Next Steps
      </ThemedText>

      <View style={styles.actionsGrid}>
        <Pressable
          onPress={handleMatchJD}
          style={({ pressed }) => [
            styles.actionCard,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <View style={[styles.actionIcon, { backgroundColor: `${theme.primary}15` }]}>
            <Feather name="target" size={22} color={theme.primary} />
          </View>
          <ThemedText type="h4" style={styles.actionTitle}>
            Match with JD
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            Compare your resume with a job description
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={handleImprove}
          style={({ pressed }) => [
            styles.actionCard,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          {!isPremium && <PremiumBadge />}
          <View style={[styles.actionIcon, { backgroundColor: `${theme.accent}15` }]}>
            <Feather name="edit-3" size={22} color={theme.accent} />
          </View>
          <ThemedText type="h4" style={styles.actionTitle}>
            Improve Resume
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            AI-powered resume enhancement
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={handleInterviewQuestions}
          style={({ pressed }) => [
            styles.actionCard,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          {!isPremium && <PremiumBadge />}
          <View style={[styles.actionIcon, { backgroundColor: `${theme.warning}15` }]}>
            <Feather name="help-circle" size={22} color={theme.warning} />
          </View>
          <ThemedText type="h4" style={styles.actionTitle}>
            Interview Prep
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            Get personalized questions
          </ThemedText>
        </Pressable>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing['2xl'],
  },
  fileName: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  missingCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  missingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  missingText: {
    flex: 1,
  },
  suggestionsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  suggestionText: {
    flex: 1,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  actionCard: {
    width: '47%',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionTitle: {
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
});

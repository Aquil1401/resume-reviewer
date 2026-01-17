import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { getCurrentResume, getSubscription } from '@/lib/storage';
import { getApiUrl } from '@/lib/query-client';
import type { ResumeAnalysis, ImprovedResume, UserSubscription } from '@/types/resume';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/RootStackNavigator';

type ImproveResumeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ImproveResume'>;
};

export default function ImproveResumeScreen({ navigation }: ImproveResumeScreenProps) {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [resume, setResume] = useState<ResumeAnalysis | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const [improvements, setImprovements] = useState<ImprovedResume | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [resumeData, subData] = await Promise.all([
        getCurrentResume(),
        getSubscription(),
      ]);
      setResume(resumeData);
      setSubscription(subData);
    };
    loadData();
  }, []);

  const handleImprove = async () => {
    if (!resume) {
      Alert.alert('No Resume', 'Please upload a resume first.');
      return;
    }

    if (subscription?.tier !== 'premium') {
      navigation.navigate('PremiumUpgrade');
      return;
    }

    setIsImproving(true);
    try {
      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}api/resume/improve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeContent: resume.resumeContent,
          suggestions: resume.suggestions,
        }),
      });

      if (!response.ok) throw new Error('Failed to improve resume');

      const data: ImprovedResume = await response.json();
      setImprovements(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error improving resume:', error);
      Alert.alert('Improvement Failed', 'Could not generate improvements. Please try again.');
    } finally {
      setIsImproving(false);
    }
  };

  if (!resume) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText type="body">Please upload a resume first.</ThemedText>
        <Button onPress={() => navigation.goBack()} style={styles.backButton}>
          Go Back
        </Button>
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
      <ThemedText type="h2" style={styles.title}>
        Improve Resume
      </ThemedText>
      <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
        Let AI enhance your resume with ATS-friendly language while keeping your information accurate.
      </ThemedText>

      {!improvements ? (
        <>
          <View style={[styles.previewCard, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.previewHeader}>
              <Feather name="file-text" size={20} color={theme.primary} />
              <ThemedText type="h4" style={{ marginLeft: Spacing.sm }}>
                {resume.fileName}
              </ThemedText>
            </View>
            <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
              Current ATS Score: {resume.atsScore}%
            </ThemedText>
          </View>

          <View style={[styles.infoCard, { backgroundColor: `${theme.primary}08` }]}>
            <Feather name="info" size={18} color={theme.primary} />
            <View style={styles.infoContent}>
              <ThemedText type="h4">How it works</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                AI will rewrite your resume bullet points using action verbs and quantifiable achievements while maintaining complete honesty about your experience.
              </ThemedText>
            </View>
          </View>

          <Button
            onPress={handleImprove}
            disabled={isImproving}
            style={styles.improveButton}
          >
            {isImproving ? 'Improving...' : 'Generate Improvements'}
          </Button>

          {isImproving ? (
            <View style={styles.loadingSection}>
              <ActivityIndicator size="large" color={theme.primary} />
              <ThemedText type="body" style={[styles.loadingText, { color: theme.textSecondary }]}>
                AI is enhancing your resume...
              </ThemedText>
            </View>
          ) : null}
        </>
      ) : (
        <>
          <View style={styles.successHeader}>
            <Image
              source={require('../../assets/images/illustrations/success-checkmark.png')}
              style={styles.successImage}
            />
            <ThemedText type="h3" style={styles.successTitle}>
              Improvements Generated!
            </ThemedText>
          </View>

          <ThemedText type="h4" style={styles.sectionTitle}>
            Summary
          </ThemedText>
          <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="body">{improvements.summary}</ThemedText>
          </View>

          <ThemedText type="h4" style={styles.sectionTitle}>
            Before & After
          </ThemedText>
          {improvements.originalPoints.map((original, index) => (
            <View key={index} style={styles.comparisonBlock}>
              <View style={[styles.comparisonCard, { backgroundColor: `${theme.error}08`, borderLeftColor: theme.error }]}>
                <ThemedText type="caption" style={{ color: theme.error, marginBottom: Spacing.xs }}>
                  ORIGINAL
                </ThemedText>
                <ThemedText type="body">{original}</ThemedText>
              </View>
              <View style={styles.arrowContainer}>
                <Feather name="arrow-down" size={20} color={theme.textSecondary} />
              </View>
              <View style={[styles.comparisonCard, { backgroundColor: `${theme.accent}08`, borderLeftColor: theme.accent }]}>
                <ThemedText type="caption" style={{ color: theme.accent, marginBottom: Spacing.xs }}>
                  IMPROVED
                </ThemedText>
                <ThemedText type="body">{improvements.improvedPoints[index]}</ThemedText>
              </View>
            </View>
          ))}

          <Button
            onPress={() => navigation.navigate('InterviewQuestions')}
            style={styles.nextButton}
          >
            Prepare for Interviews
          </Button>
        </>
      )}
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing['2xl'],
  },
  previewCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing['2xl'],
    gap: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  improveButton: {},
  loadingSection: {
    alignItems: 'center',
    marginTop: Spacing['3xl'],
  },
  loadingText: {
    marginTop: Spacing.lg,
  },
  backButton: {
    marginTop: Spacing.lg,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  successImage: {
    width: 100,
    height: 100,
    marginBottom: Spacing.md,
  },
  successTitle: {
    textAlign: 'center',
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  summaryCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  comparisonBlock: {
    marginBottom: Spacing.lg,
  },
  comparisonCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
  },
  arrowContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  nextButton: {
    marginTop: Spacing['2xl'],
  },
});

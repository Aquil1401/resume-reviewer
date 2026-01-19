import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { ScoreCircle } from '@/components/ScoreCircle';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { getCurrentResume, saveLastJD, getLastJD, getSubscription } from '@/lib/storage';
import { getApiUrl } from '@/lib/query-client';
import type { JDMatchResult, ResumeAnalysis, UserSubscription } from '@/types/resume';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/RootStackNavigator';

type JDMatchScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'JDMatch'>;
};

export default function JDMatchScreen({ navigation }: JDMatchScreenProps) {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<JDMatchResult | null>(null);
  const [resume, setResume] = useState<ResumeAnalysis | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [resumeData, lastJD, subData] = await Promise.all([
        getCurrentResume(),
        getLastJD(),
        getSubscription(),
      ]);
      setResume(resumeData);
      setSubscription(subData);
      if (lastJD) setJobDescription(lastJD);
    };
    loadData();
  }, []);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      Alert.alert('Missing Information', 'Please paste a job description to analyze.');
      return;
    }

    if (!resume) {
      Alert.alert('No Resume', 'Please upload a resume first before matching with a job description.');
      return;
    }

    setIsAnalyzing(true);
    try {
      await saveLastJD(jobDescription);

      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}/api/resume/match-jd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeContent: resume.resumeContent,
          jobDescription,
        }),
      });

      if (!response.ok) throw new Error('Failed to analyze');

      const data: JDMatchResult = await response.json();
      setResult(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error matching JD:', error);
      Alert.alert('Analysis Failed', 'Could not analyze the job description. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateCoverLetter = () => {
    if (subscription?.tier !== 'premium') {
      navigation.navigate('PremiumUpgrade');
      return;
    }
    navigation.navigate('CoverLetter');
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: headerHeight + Spacing.xl, paddingBottom: insets.bottom + Spacing['3xl'] },
      ]}
    >
      <ThemedText type="h2" style={styles.title}>
        JD Match
      </ThemedText>
      <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
        Compare your resume with a job description to find gaps and improve your application.
      </ThemedText>

      {!resume ? (
        <View style={[styles.warningCard, { backgroundColor: `${theme.warning}15` }]}>
          <Feather name="alert-triangle" size={20} color={theme.warning} />
          <ThemedText type="body" style={[styles.warningText, { color: theme.warning }]}>
            Please upload a resume first to use JD matching.
          </ThemedText>
        </View>
      ) : null}

      <ThemedText type="h4" style={styles.inputLabel}>
        Job Description
      </ThemedText>
      <TextInput
        style={[
          styles.textArea,
          {
            backgroundColor: theme.backgroundDefault,
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        multiline
        numberOfLines={8}
        placeholder="Paste the full job description here..."
        placeholderTextColor={theme.textSecondary}
        value={jobDescription}
        onChangeText={setJobDescription}
        textAlignVertical="top"
      />

      <Button
        onPress={handleAnalyze}
        disabled={isAnalyzing || !resume}
        style={styles.analyzeButton}
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze Match'}
      </Button>

      {result ? (
        <View style={styles.resultsSection}>
          <View style={styles.matchScoreSection}>
            <ScoreCircle score={result.matchPercentage} size={120} label="Match Score" />
          </View>

          {result.matchedSkills.length > 0 ? (
            <>
              <ThemedText type="h4" style={styles.resultTitle}>
                Matched Skills
              </ThemedText>
              <View style={styles.tagContainer}>
                {result.matchedSkills.map((skill, index) => (
                  <View key={index} style={[styles.tag, { backgroundColor: `${theme.accent}15` }]}>
                    <Feather name="check" size={12} color={theme.accent} />
                    <ThemedText type="small" style={{ color: theme.accent, marginLeft: 4 }}>
                      {skill}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {result.missingSkills.length > 0 ? (
            <>
              <ThemedText type="h4" style={styles.resultTitle}>
                Missing Skills
              </ThemedText>
              <View style={styles.tagContainer}>
                {result.missingSkills.map((skill, index) => (
                  <View key={index} style={[styles.tag, { backgroundColor: `${theme.error}15` }]}>
                    <Feather name="x" size={12} color={theme.error} />
                    <ThemedText type="small" style={{ color: theme.error, marginLeft: 4 }}>
                      {skill}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {result.keywordGaps.length > 0 ? (
            <>
              <ThemedText type="h4" style={styles.resultTitle}>
                Keyword Gaps
              </ThemedText>
              <View style={[styles.gapsCard, { backgroundColor: theme.backgroundDefault }]}>
                {result.keywordGaps.map((keyword, index) => (
                  <View key={index} style={styles.gapRow}>
                    <Feather name="alert-circle" size={14} color={theme.warning} />
                    <ThemedText type="body" style={{ color: theme.textSecondary, flex: 1 }}>
                      {keyword}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {result.recommendations.length > 0 ? (
            <>
              <ThemedText type="h4" style={styles.resultTitle}>
                Recommendations
              </ThemedText>
              <View style={[styles.recommendationsCard, { backgroundColor: `${theme.primary}08` }]}>
                {result.recommendations.map((rec, index) => (
                  <View key={index} style={styles.recRow}>
                    <ThemedText type="body" style={{ color: theme.text }}>
                      {index + 1}. {rec}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          <Button onPress={handleGenerateCoverLetter} style={styles.coverLetterButton}>
            Generate Cover Letter
          </Button>
        </View>
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
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing['2xl'],
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  warningText: {
    flex: 1,
  },
  inputLabel: {
    marginBottom: Spacing.sm,
  },
  textArea: {
    minHeight: 160,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  analyzeButton: {
    marginTop: Spacing.lg,
  },
  resultsSection: {
    marginTop: Spacing['3xl'],
  },
  matchScoreSection: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  resultTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  gapsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  gapRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  recommendationsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  recRow: {
    marginBottom: Spacing.sm,
  },
  coverLetterButton: {
    marginTop: Spacing['2xl'],
  },
});

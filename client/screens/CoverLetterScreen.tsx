import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Alert, ActivityIndicator, Pressable } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { getCurrentResume, getLastJD, getSubscription } from '@/lib/storage';
import { getApiUrl } from '@/lib/query-client';
import type { ResumeAnalysis, CoverLetter, UserSubscription } from '@/types/resume';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/RootStackNavigator';

type CoverLetterScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CoverLetter'>;
};

export default function CoverLetterScreen({ navigation }: CoverLetterScreenProps) {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [resume, setResume] = useState<ResumeAnalysis | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [resumeData, jd, subData] = await Promise.all([
        getCurrentResume(),
        getLastJD(),
        getSubscription(),
      ]);
      setResume(resumeData);
      setJobDescription(jd);
      setSubscription(subData);
    };
    loadData();
  }, []);

  const handleGenerate = async () => {
    if (subscription?.tier !== 'premium') {
      navigation.navigate('PremiumUpgrade');
      return;
    }

    if (!jobDescription.trim()) {
      Alert.alert('Missing Information', 'Please add a job description first in the JD Match screen.');
      return;
    }

    setIsGenerating(true);
    try {
      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}api/resume/cover-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeContent: resume?.resumeContent || '',
          jobDescription,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate cover letter');

      const data: CoverLetter = await response.json();
      setCoverLetter(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error generating cover letter:', error);
      Alert.alert('Generation Failed', 'Could not generate cover letter. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!coverLetter) return;
    await Clipboard.setStringAsync(coverLetter.content);
    setCopied(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCopied(false), 2000);
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
        Cover Letter
      </ThemedText>
      <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
        Generate a professional cover letter tailored to the job description.
      </ThemedText>

      {!jobDescription.trim() ? (
        <View style={[styles.warningCard, { backgroundColor: `${theme.warning}15` }]}>
          <Feather name="alert-triangle" size={20} color={theme.warning} />
          <View style={styles.warningContent}>
            <ThemedText type="body" style={{ color: theme.warning }}>
              Add a job description first
            </ThemedText>
            <Button
              onPress={() => navigation.navigate('JDMatch')}
              style={styles.jdButton}
            >
              Go to JD Match
            </Button>
          </View>
        </View>
      ) : !coverLetter ? (
        <>
          <View style={[styles.infoCard, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.infoRow}>
              <Feather name="file-text" size={18} color={theme.primary} />
              <View style={styles.infoTextContainer}>
                <ThemedText type="h4">Resume</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {resume ? resume.fileName : 'Not uploaded'}
                </ThemedText>
              </View>
              {resume ? (
                <Feather name="check-circle" size={18} color={theme.accent} />
              ) : (
                <Feather name="x-circle" size={18} color={theme.error} />
              )}
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.infoRow}>
              <Feather name="briefcase" size={18} color={theme.primary} />
              <View style={styles.infoTextContainer}>
                <ThemedText type="h4">Job Description</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={1}>
                  {jobDescription.slice(0, 50)}...
                </ThemedText>
              </View>
              <Feather name="check-circle" size={18} color={theme.accent} />
            </View>
          </View>

          <Button
            onPress={handleGenerate}
            disabled={isGenerating}
            style={styles.generateButton}
          >
            {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
          </Button>

          {isGenerating ? (
            <View style={styles.loadingSection}>
              <ActivityIndicator size="large" color={theme.primary} />
              <ThemedText type="body" style={[styles.loadingText, { color: theme.textSecondary }]}>
                Creating your personalized cover letter...
              </ThemedText>
            </View>
          ) : null}
        </>
      ) : (
        <>
          <View style={styles.actionsRow}>
            <Pressable
              onPress={handleCopy}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: `${theme.primary}15`, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Feather name={copied ? 'check' : 'copy'} size={18} color={theme.primary} />
              <ThemedText type="body" style={{ color: theme.primary, marginLeft: Spacing.xs }}>
                {copied ? 'Copied!' : 'Copy'}
              </ThemedText>
            </Pressable>
          </View>

          <View style={[styles.letterContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <TextInput
              style={[styles.letterText, { color: theme.text }]}
              multiline
              value={coverLetter.content}
              onChangeText={(text) => setCoverLetter({ ...coverLetter, content: text })}
              textAlignVertical="top"
            />
          </View>

          <Button onPress={handleGenerate} style={styles.regenerateButton}>
            Generate New Letter
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
    alignItems: 'flex-start',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  warningContent: {
    flex: 1,
  },
  jdButton: {
    marginTop: Spacing.md,
  },
  infoCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing['2xl'],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  generateButton: {},
  loadingSection: {
    alignItems: 'center',
    marginTop: Spacing['3xl'],
  },
  loadingText: {
    marginTop: Spacing.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  letterContainer: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minHeight: 400,
  },
  letterText: {
    padding: Spacing.lg,
    fontSize: 16,
    lineHeight: 26,
  },
  regenerateButton: {
    marginTop: Spacing.lg,
  },
});

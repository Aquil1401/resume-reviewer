import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, SectionList } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { QuestionCard } from '@/components/QuestionCard';
import { EmptyState } from '@/components/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { getCurrentResume, getLastJD, getSubscription } from '@/lib/storage';
import { getApiUrl } from '@/lib/query-client';
import type { InterviewQuestion, ResumeAnalysis, UserSubscription } from '@/types/resume';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/RootStackNavigator';

type InterviewQuestionsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'InterviewQuestions'>;
};

interface QuestionSection {
  title: string;
  category: 'hr' | 'technical' | 'situational';
  data: InterviewQuestion[];
}

export default function InterviewQuestionsScreen({ navigation }: InterviewQuestionsScreenProps) {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [resume, setResume] = useState<ResumeAnalysis | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);

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

    if (!resume) {
      Alert.alert('No Resume', 'Please upload a resume first.');
      return;
    }

    setIsGenerating(true);
    try {
      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}api/resume/interview-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeContent: resume.resumeContent,
          jobDescription,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate questions');

      const data: { questions: InterviewQuestion[] } = await response.json();
      setQuestions(data.questions);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error generating questions:', error);
      Alert.alert('Generation Failed', 'Could not generate interview questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const sections: QuestionSection[] = [
    {
      title: 'HR Questions',
      category: 'hr',
      data: questions.filter(q => q.category === 'hr'),
    },
    {
      title: 'Technical Questions',
      category: 'technical',
      data: questions.filter(q => q.category === 'technical'),
    },
    {
      title: 'Situational Questions',
      category: 'situational',
      data: questions.filter(q => q.category === 'situational'),
    },
  ].filter(s => s.data.length > 0);

  const renderSectionHeader = ({ section }: { section: QuestionSection }) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.backgroundRoot }]}>
      <ThemedText type="h3">{section.title}</ThemedText>
      <View style={[styles.countBadge, { backgroundColor: `${theme.primary}15` }]}>
        <ThemedText type="caption" style={{ color: theme.primary }}>
          {section.data.length}
        </ThemedText>
      </View>
    </View>
  );

  const renderItem = ({ item, index }: { item: InterviewQuestion; index: number }) => (
    <QuestionCard
      category={item.category}
      question={item.question}
      hint={item.hint}
      index={index}
    />
  );

  const renderEmpty = () => (
    <EmptyState
      image={require('../../assets/images/illustrations/empty-questions.png')}
      title="No Questions Yet"
      description="Generate personalized interview questions based on your resume and job description."
      actionLabel="Generate Questions"
      onAction={handleGenerate}
    />
  );

  if (questions.length === 0 && !isGenerating) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot, paddingTop: headerHeight }]}>
        {renderEmpty()}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {isGenerating ? (
        <View style={[styles.loadingContainer, { paddingTop: headerHeight }]}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText type="body" style={[styles.loadingText, { color: theme.textSecondary }]}>
            Generating personalized questions...
          </ThemedText>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => `${item.category}-${index}`}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={[
            styles.content,
            { paddingTop: headerHeight + Spacing.xl, paddingBottom: insets.bottom + Spacing['3xl'] },
          ]}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            <View style={styles.header}>
              <ThemedText type="h2">Interview Prep</ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                {questions.length} questions based on your resume
              </ThemedText>
            </View>
          }
          ListFooterComponent={
            <Button onPress={handleGenerate} style={styles.regenerateButton}>
              Generate New Questions
            </Button>
          }
        />
      )}
    </View>
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
    marginBottom: Spacing['2xl'],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  regenerateButton: {
    marginTop: Spacing.lg,
  },
});

import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { UploadArea } from '@/components/UploadArea';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/constants/theme';
import { apiRequest, getApiUrl } from '@/lib/query-client';
import { useFreeScan, saveCurrentResume, addScanToHistory, getSubscription } from '@/lib/storage';
import type { ResumeAnalysis } from '@/types/resume';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootStackParamList } from '@/navigation/RootStackNavigator';
import type { MainTabParamList } from '@/navigation/MainTabNavigator';

type ScanScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'ScanTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface ScanScreenProps {
  navigation: ScanScreenNavigationProp;
}

export default function ScanScreen({ navigation }: ScanScreenProps) {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: number;
    uri: string;
    mimeType: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({
          name: file.name,
          size: file.size || 0,
          uri: file.uri,
          mimeType: file.mimeType || 'application/octet-stream',
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    const subscription = await getSubscription();
    if (subscription.tier === 'free' && subscription.scansRemaining <= 0) {
      navigation.navigate('PremiumUpgrade');
      return;
    }

    setIsAnalyzing(true);
    try {
      const canScan = await useFreeScan();
      if (!canScan) {
        navigation.navigate('PremiumUpgrade');
        return;
      }

      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.mimeType,
        name: selectedFile.name,
      } as any);

      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}api/resume/analyze`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const analysis: ResumeAnalysis = await response.json();
      
      await saveCurrentResume(analysis);
      await addScanToHistory({
        id: analysis.id,
        fileName: analysis.fileName,
        score: analysis.atsScore,
        scannedAt: analysis.uploadedAt,
        resumeContent: analysis.resumeContent,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSelectedFile(null);
      navigation.navigate('ResumeReport', { analysisId: analysis.id });
    } catch (error) {
      console.error('Error analyzing resume:', error);
      Alert.alert('Analysis Failed', 'We couldn\'t analyze your resume. Please make sure the file is a valid PDF or DOCX and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: headerHeight + Spacing.xl, paddingBottom: tabBarHeight + Spacing['3xl'] },
      ]}
    >
      <ThemedText type="h2" style={styles.title}>
        Resume Scan
      </ThemedText>
      <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
        Upload your resume to get an ATS compatibility score and detailed feedback.
      </ThemedText>

      <UploadArea
        onPress={handlePickDocument}
        fileName={selectedFile?.name}
        fileSize={selectedFile?.size}
        isLoading={isLoading}
        onRemove={handleRemoveFile}
      />

      {selectedFile ? (
        <View style={styles.analyzeContainer}>
          <Button
            onPress={handleAnalyze}
            disabled={isAnalyzing}
            style={styles.analyzeButton}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
          </Button>
          <ThemedText type="small" style={[styles.disclaimer, { color: theme.textSecondary }]}>
            Your resume will be analyzed by AI to check ATS compatibility
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.tipsSection}>
        <ThemedText type="h4" style={styles.tipsTitle}>
          Tips for Best Results
        </ThemedText>
        {[
          'Use a clean, simple format without tables or graphics',
          'Include relevant keywords from job descriptions',
          'List your experience in reverse chronological order',
          'Keep file size under 2MB for faster processing',
        ].map((tip, index) => (
          <View key={index} style={styles.tipRow}>
            <View style={[styles.tipDot, { backgroundColor: theme.accent }]} />
            <ThemedText type="small" style={{ color: theme.textSecondary, flex: 1 }}>
              {tip}
            </ThemedText>
          </View>
        ))}
      </View>
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
  analyzeContainer: {
    marginTop: Spacing['2xl'],
  },
  analyzeButton: {
    marginBottom: Spacing.md,
  },
  disclaimer: {
    textAlign: 'center',
  },
  tipsSection: {
    marginTop: Spacing['3xl'],
  },
  tipsTitle: {
    marginBottom: Spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: Spacing.sm,
  },
});

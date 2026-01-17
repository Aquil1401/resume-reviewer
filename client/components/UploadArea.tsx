import React from 'react';
import { View, StyleSheet, Pressable, Image, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

interface UploadAreaProps {
  onPress: () => void;
  fileName?: string;
  fileSize?: number;
  isLoading?: boolean;
  onRemove?: () => void;
}

export function UploadArea({ onPress, fileName, fileSize, isLoading, onRemove }: UploadAreaProps) {
  const { theme } = useTheme();

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { borderColor: theme.primary, backgroundColor: theme.backgroundDefault }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText type="body" style={[styles.loadingText, { color: theme.textSecondary }]}>
          Reading your resume...
        </ThemedText>
      </View>
    );
  }

  if (fileName) {
    return (
      <View style={[styles.fileContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={[styles.fileIcon, { backgroundColor: `${theme.primary}20` }]}>
          <Feather name="file-text" size={24} color={theme.primary} />
        </View>
        <View style={styles.fileInfo}>
          <ThemedText type="h4" numberOfLines={1} style={styles.fileName}>
            {fileName}
          </ThemedText>
          {fileSize ? (
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {formatFileSize(fileSize)}
            </ThemedText>
          ) : null}
        </View>
        <Pressable
          onPress={onRemove}
          style={({ pressed }) => [
            styles.removeButton,
            { backgroundColor: `${theme.error}20`, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="x" size={18} color={theme.error} />
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { borderColor: theme.primary, backgroundColor: `${theme.primary}08`, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Image
        source={require('../../assets/images/illustrations/upload-resume.png')}
        style={styles.illustration}
        resizeMode="contain"
      />
      <View style={[styles.uploadIcon, { backgroundColor: `${theme.primary}15` }]}>
        <Feather name="upload" size={24} color={theme.primary} />
      </View>
      <ThemedText type="h4" style={styles.uploadTitle}>
        Upload Your Resume
      </ThemedText>
      <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
        Tap to select a PDF or DOCX file
      </ThemedText>
      <View style={[styles.formatBadge, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          PDF or DOCX
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    padding: Spacing['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
  },
  loadingContainer: {
    borderStyle: 'solid',
  },
  illustration: {
    width: 120,
    height: 120,
    marginBottom: Spacing.lg,
  },
  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  uploadTitle: {
    marginBottom: Spacing.xs,
  },
  formatBadge: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  loadingText: {
    marginTop: Spacing.lg,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  fileName: {
    marginBottom: Spacing.xs,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

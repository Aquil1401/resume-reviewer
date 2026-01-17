import React, { useState, useCallback } from 'react';
import { FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HistoryCard } from '@/components/HistoryCard';
import { EmptyState } from '@/components/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/constants/theme';
import { getScanHistory } from '@/lib/storage';
import type { ScanHistoryItem } from '@/types/resume';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootStackParamList } from '@/navigation/RootStackNavigator';
import type { MainTabParamList } from '@/navigation/MainTabNavigator';

type HistoryScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'HistoryTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface HistoryScreenProps {
  navigation: HistoryScreenNavigationProp;
}

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    const data = await getScanHistory();
    setHistory(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, [loadHistory]);

  const renderItem = ({ item }: { item: ScanHistoryItem }) => (
    <HistoryCard
      fileName={item.fileName}
      score={item.score}
      date={item.scannedAt}
      onPress={() => navigation.navigate('ResumeReport', { analysisId: item.id })}
    />
  );

  const renderEmpty = () => (
    <EmptyState
      image={require('../../assets/images/illustrations/empty-history.png')}
      title="No Scans Yet"
      description="Upload your first resume to see your scan history here."
      actionLabel="Upload Resume"
      onAction={() => navigation.navigate('ScanTab')}
    />
  );

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
          flexGrow: history.length === 0 ? 1 : undefined,
        },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={history}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ResumeAnalysis, ScanHistoryItem, UserSubscription } from '@/types/resume';

const KEYS = {
  SCAN_HISTORY: 'ats_scan_history',
  SUBSCRIPTION: 'ats_subscription',
  CURRENT_RESUME: 'ats_current_resume',
  LAST_JD: 'ats_last_jd',
};

const DEFAULT_SUBSCRIPTION: UserSubscription = {
  tier: 'free',
  scansRemaining: 3,
  scansUsed: 0,
  maxFreeScans: 3,
};

export async function getScanHistory(): Promise<ScanHistoryItem[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SCAN_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function addScanToHistory(scan: ScanHistoryItem): Promise<void> {
  try {
    const history = await getScanHistory();
    history.unshift(scan);
    await AsyncStorage.setItem(KEYS.SCAN_HISTORY, JSON.stringify(history.slice(0, 50)));
  } catch (error) {
    console.error('Failed to save scan history:', error);
  }
}

export async function clearScanHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.SCAN_HISTORY);
  } catch (error) {
    console.error('Failed to clear scan history:', error);
  }
}

export async function getSubscription(): Promise<UserSubscription> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SUBSCRIPTION);
    return data ? JSON.parse(data) : DEFAULT_SUBSCRIPTION;
  } catch {
    return DEFAULT_SUBSCRIPTION;
  }
}

export async function updateSubscription(subscription: Partial<UserSubscription>): Promise<UserSubscription> {
  try {
    const current = await getSubscription();
    const updated = { ...current, ...subscription };
    await AsyncStorage.setItem(KEYS.SUBSCRIPTION, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_SUBSCRIPTION;
  }
}

export async function useFreeScan(): Promise<boolean> {
  try {
    const subscription = await getSubscription();
    if (subscription.tier === 'premium') return true;
    if (subscription.scansRemaining <= 0) return false;
    
    await updateSubscription({
      scansRemaining: subscription.scansRemaining - 1,
      scansUsed: subscription.scansUsed + 1,
    });
    return true;
  } catch {
    return false;
  }
}

export async function saveCurrentResume(analysis: ResumeAnalysis): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.CURRENT_RESUME, JSON.stringify(analysis));
  } catch (error) {
    console.error('Failed to save current resume:', error);
  }
}

export async function getCurrentResume(): Promise<ResumeAnalysis | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.CURRENT_RESUME);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function saveLastJD(jd: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.LAST_JD, jd);
  } catch (error) {
    console.error('Failed to save JD:', error);
  }
}

export async function getLastJD(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(KEYS.LAST_JD)) || '';
  } catch {
    return '';
  }
}

export async function resetAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  } catch (error) {
    console.error('Failed to reset data:', error);
  }
}

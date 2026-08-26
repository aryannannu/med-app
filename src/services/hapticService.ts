import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'HEALIT_HAPTICS_ENABLED';
let isHapticsEnabled = true;
let lastHapticTimestamp = 0;
const DEBOUNCE_THRESHOLD_MS = 80;

// Initialize preference from storage
AsyncStorage.getItem(STORAGE_KEY).then((value) => {
  if (value !== null) {
    isHapticsEnabled = value === 'true';
  }
}).catch(() => {
  // Default to enabled if storage read fails
  isHapticsEnabled = true;
});

const canTrigger = (): boolean => {
  if (!isHapticsEnabled) return false;
  if (Platform.OS === 'web') return false;

  const now = Date.now();
  if (now - lastHapticTimestamp < DEBOUNCE_THRESHOLD_MS) {
    return false;
  }
  lastHapticTimestamp = now;
  return true;
};

export const haptics = {
  /**
   * Selection feedback for changing between options, tab switches, radio buttons
   */
  selection: () => {
    if (!canTrigger()) return;
    try {
      Haptics.selectionAsync().catch(() => {});
    } catch (_) {}
  },

  /**
   * Light impact for small taps, card selections, subtle UI responses
   */
  light: () => {
    if (!canTrigger()) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch (_) {}
  },

  /**
   * Medium impact for important user actions like Add to Cart, Primary CTA tap
   */
  medium: () => {
    if (!canTrigger()) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } catch (_) {}
  },

  /**
   * Heavy impact for major confirmations
   */
  heavy: () => {
    if (!canTrigger()) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    } catch (_) {}
  },

  /**
   * Notification success for completed orders, coupon applied, address saved
   */
  success: () => {
    if (!canTrigger()) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (_) {}
  },

  /**
   * Notification warning for pending payments, Rx required, order delays
   */
  warning: () => {
    if (!canTrigger()) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    } catch (_) {}
  },

  /**
   * Notification error for failed payments, invalid coupon, rejected upload
   */
  error: () => {
    if (!canTrigger()) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    } catch (_) {}
  },

  /**
   * Toggle or set haptic feedback preference
   */
  setEnabled: async (enabled: boolean) => {
    isHapticsEnabled = enabled;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, String(enabled));
    } catch (_) {}
  },

  /**
   * Get current enabled state
   */
  isEnabled: () => isHapticsEnabled,
};

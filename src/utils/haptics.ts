import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Light haptic feedback - pour les interactions légères (tap, sélection)
 */
export const lightHaptic = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

/**
 * Medium haptic feedback - pour les actions moyennes (swipe, toggle)
 */
export const mediumHaptic = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
};

/**
 * Heavy haptic feedback - pour les actions importantes (suppression, confirmation)
 */
export const heavyHaptic = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
};

/**
 * Success haptic - pattern de succès
 */
export const successHaptic = () => {
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
};

/**
 * Warning haptic - pattern d'avertissement
 */
export const warningHaptic = () => {
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
};

/**
 * Error haptic - pattern d'erreur
 */
export const errorHaptic = () => {
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
};

/**
 * Selection haptic - pour les changements de sélection (picker, menu)
 */
export const selectionHaptic = () => {
  if (Platform.OS !== 'web') {
    Haptics.selectionAsync();
  }
};

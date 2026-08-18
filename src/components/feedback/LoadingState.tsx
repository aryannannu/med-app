import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '../../theme';
import { AppText } from '../common/AppText';

export interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  style?: ViewStyle;
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading details...',
  subMessage,
  style,
  fullScreen = false,
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <View style={styles.spinnerWrapper}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
      <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600" align="center" style={styles.message}>
        {message}
      </AppText>
      {subMessage && (
        <AppText variant="bodySmall" color={COLORS.textSecondary} align="center" style={styles.subMessage}>
          {subMessage}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  spinnerWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  message: {
    marginTop: SPACING.xs,
  },
  subMessage: {
    marginTop: SPACING.xs,
    maxWidth: 280,
  },
});

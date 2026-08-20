import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../theme';
import { AppText } from '../common/AppText';
import { AppButton } from '../common/AppButton';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  style?: ViewStyle;
  fullScreen?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an unexpected issue while fetching your medicine data. Please try again.',
  onRetry,
  retryText = 'Try Again',
  style,
  fullScreen = false,
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <View style={styles.iconWrapper}>
        <Ionicons name="alert-circle" size={40} color={COLORS.danger} />
      </View>

      <AppText variant="h3" color={COLORS.textPrimary} weight="600" align="center" style={styles.title}>
        {title}
      </AppText>

      <AppText variant="bodyMedium" color={COLORS.textSecondary} align="center" style={styles.message}>
        {message}
      </AppText>

      {onRetry && (
        <AppButton
          title={retryText}
          variant="primary"
          onPress={onRetry}
          style={styles.btn}
          fullWidth={false}
          leftIcon={<Ionicons name="refresh" size={18} color={COLORS.textInverse} />}
        />
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
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    marginBottom: SPACING.xs,
  },
  message: {
    maxWidth: 320,
    marginBottom: SPACING.lg,
  },
  btn: {
    minWidth: 160,
  },
});

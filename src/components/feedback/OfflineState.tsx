import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../theme';
import { useAppTheme } from '../../store/ThemeContext';
import { AppText } from '../common/AppText';
import { AppButton } from '../common/AppButton';

export interface OfflineStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
  fullScreen?: boolean;
}

export const OfflineState: React.FC<OfflineStateProps> = ({
  title = 'No Internet Connection',
  message = 'Please check your Wi-Fi or mobile data network to browse medicines and receive live pharmacy offers.',
  onRetry,
  style,
  fullScreen = false,
}) => {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <View style={styles.iconWrapper}>
        <Ionicons name="cloud-offline-outline" size={42} color={colors.primary} />
      </View>

      <AppText variant="h3" color={colors.textPrimary} weight="600" align="center" style={styles.title}>
        {title}
      </AppText>

      <AppText variant="bodyMedium" color={colors.textSecondary} align="center" style={styles.message}>
        {message}
      </AppText>

      {onRetry && (
        <AppButton
          title="Retry Connection"
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    marginBottom: SPACING.xs,
  },
  message: {
    maxWidth: 320,
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  btn: {
    minWidth: 180,
  },
});




import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../theme';
import { AppText } from '../common/AppText';
import { AppButton } from '../common/AppButton';

export interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionText?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
  fullScreen?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'file-tray-outline',
  title,
  message,
  actionText,
  onActionPress,
  style,
  fullScreen = false,
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={42} color={COLORS.primary} />
      </View>

      <AppText variant="h3" color={COLORS.textPrimary} weight="700" align="center" style={styles.title}>
        {title}
      </AppText>

      <AppText variant="bodyMedium" color={COLORS.textSecondary} align="center" style={styles.message}>
        {message}
      </AppText>

      {actionText && onActionPress && (
        <AppButton
          title={actionText}
          variant="primary"
          onPress={onActionPress}
          style={styles.btn}
          fullWidth={false}
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
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  btn: {
    minWidth: 180,
  },
});

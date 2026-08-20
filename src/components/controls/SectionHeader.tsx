import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '../../theme';
import { AppText } from '../common/AppText';
import { Ionicons } from '@expo/vector-icons';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionText,
  onActionPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleContainer}>
        <AppText variant="h4" color={COLORS.textPrimary} weight="600">
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="bodySmall" color={COLORS.textSecondary} style={styles.subtitle}>
            {subtitle}
          </AppText>
        )}
      </View>

      {actionText && onActionPress && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onActionPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.actionBtn}
        >
          <AppText variant="buttonSmall" color={COLORS.primary} weight="600">
            {actionText}
          </AppText>
          <Ionicons name="chevron-forward" size={14} color={COLORS.primary} style={styles.actionIcon} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  titleContainer: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  subtitle: {
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  actionIcon: {
    marginLeft: 2,
  },
});

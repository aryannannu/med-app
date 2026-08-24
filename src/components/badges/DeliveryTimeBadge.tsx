import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme';
import { useAppTheme } from '../../store/ThemeContext';
import { AppText } from '../common/AppText';
import { formatDeliveryTime } from '../../utils/formatters';

export interface DeliveryTimeBadgeProps {
  minutes: number;
  isExpress?: boolean;
  style?: ViewStyle;
}

export const DeliveryTimeBadge: React.FC<DeliveryTimeBadgeProps> = ({
  minutes,
  isExpress = false,
  style,
}) => {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.badge,
        isExpress ? styles.badgeExpress : styles.badgeStandard,
        style,
      ]}
    >
      <Ionicons
        name={isExpress ? 'flash' : 'time-outline'}
        size={12}
        color={isExpress ? COLORS.primary : COLORS.textSecondary}
        style={{ marginRight: 3 }}
      />
      <AppText
        variant="caption"
        color={isExpress ? COLORS.primary : COLORS.textSecondary}
        weight="600"
        style={styles.text}
      >
        {formatDeliveryTime(minutes)}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: SPACING.xs + 3,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeStandard: {
    backgroundColor: COLORS.surfaceSubtle,
    borderColor: COLORS.border,
  },
  badgeExpress: {
    backgroundColor: COLORS.primarySubtle,
    borderColor: COLORS.primaryMuted,
  },
  text: {
    fontSize: 11,
  },
});




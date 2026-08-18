import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme';
import { AppText } from '../common/AppText';

export interface RxBadgeProps {
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const RxBadge: React.FC<RxBadgeProps> = ({ size = 'sm', style }) => {
  return (
    <View
      style={[
        styles.badge,
        size === 'sm' ? styles.badgeSm : styles.badgeMd,
        style,
      ]}
    >
      <AppText
        variant="badge"
        color={COLORS.rxRed}
        weight="800"
        style={size === 'sm' ? styles.textSm : styles.textMd}
      >
        Rx Required
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: COLORS.rxRedLight,
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.xs,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSm: {
    paddingVertical: 2,
    paddingHorizontal: SPACING.xs + 2,
  },
  badgeMd: {
    paddingVertical: SPACING.xxs,
    paddingHorizontal: SPACING.sm,
  },
  textSm: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  textMd: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
});

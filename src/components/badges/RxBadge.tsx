import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SPACING, BORDER_RADIUS } from '../../theme';
import { useAppTheme } from '../../store/ThemeContext';
import { AppText } from '../common/AppText';

export interface RxBadgeProps {
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const RxBadge: React.FC<RxBadgeProps> = ({ size = 'sm', style }) => {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' ? styles.badgeSm : styles.badgeMd,
        { backgroundColor: colors.rxRedLight, borderColor: colors.rxRedBorder },
        style,
      ]}
    >
      <AppText
        variant="badge"
        color={colors.rxRed}
        weight="600"
        style={size === 'sm' ? styles.textSm : styles.textMd}
      >
        Rx Required
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
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

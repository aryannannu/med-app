import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme';
import { useAppTheme } from '../../store/ThemeContext';
import { AppText } from '../common/AppText';

export interface VerifiedBadgeProps {
  label?: string;
  style?: ViewStyle;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  label = 'Verified Pharmacy',
  style,
}) => {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.badge, style]}>
      <Ionicons name="checkmark-circle" size={14} color={COLORS.secondary} />
      <AppText variant="caption" color={COLORS.secondaryDark} weight="600" style={styles.text}>
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryLight,
    paddingVertical: 2,
    paddingHorizontal: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.xs,
    alignSelf: 'flex-start',
  },
  text: {
    marginLeft: 3,
    fontSize: 11,
  },
});




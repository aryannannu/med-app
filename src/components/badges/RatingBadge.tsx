import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme';
import { useAppTheme } from '../../store/ThemeContext';
import { AppText } from '../common/AppText';

export interface RatingBadgeProps {
  rating: number;
  reviewCount?: number;
  showCount?: boolean;
  style?: ViewStyle;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  rating,
  reviewCount,
  showCount = true,
  style,
}) => {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.container, style]}>
      <View style={styles.pill}>
        <Ionicons name="star" size={11} color="#FFFFFF" />
        <AppText variant="caption" color="#FFFFFF" weight="600" style={styles.ratingText}>
          {rating.toFixed(1)}
        </AppText>
      </View>
      {showCount && reviewCount !== undefined && (
        <AppText variant="caption" color={colors.textMuted} style={styles.countText}>
          ({reviewCount.toLocaleString()})
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15803D', // Modern accessible emerald
    paddingVertical: 2,
    paddingHorizontal: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  ratingText: {
    marginLeft: 3,
    fontSize: 11,
  },
  countText: {
    marginLeft: SPACING.xs,
    fontSize: 11,
  },
});




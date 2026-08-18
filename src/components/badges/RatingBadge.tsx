import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme';
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
  return (
    <View style={[styles.container, style]}>
      <View style={styles.pill}>
        <Ionicons name="star" size={12} color="#FFFFFF" />
        <AppText variant="caption" color="#FFFFFF" weight="700" style={styles.ratingText}>
          {rating.toFixed(1)}
        </AppText>
      </View>
      {showCount && reviewCount !== undefined && (
        <AppText variant="caption" color={COLORS.textMuted} style={styles.countText}>
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
    backgroundColor: '#059669', // Healthy emerald green
    paddingVertical: 2,
    paddingHorizontal: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.xs,
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

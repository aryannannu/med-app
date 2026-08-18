import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme';
import { AppText } from '../common/AppText';
import { OfferTag } from '../../types/offer';

export interface OfferTagBadgeProps {
  tag: OfferTag;
  style?: ViewStyle;
}

export const OfferTagBadge: React.FC<OfferTagBadgeProps> = ({ tag, style }) => {
  const getTagConfig = () => {
    switch (tag) {
      case 'lowest_price':
        return {
          label: 'LOWEST PRICE',
          icon: 'pricetag' as const,
          color: COLORS.tagLowestPrice,
          bgColor: COLORS.tagLowestPriceBg,
          borderColor: '#A7F3D0',
        };
      case 'fastest_delivery':
        return {
          label: 'FASTEST DELIVERY',
          icon: 'flash' as const,
          color: COLORS.tagFastestDelivery,
          bgColor: COLORS.tagFastestDeliveryBg,
          borderColor: '#BFDBFE',
        };
      case 'best_rated':
        return {
          label: 'BEST RATED',
          icon: 'star' as const,
          color: COLORS.tagBestRated,
          bgColor: COLORS.tagBestRatedBg,
          borderColor: '#FDE68A',
        };
      case 'recommended':
      default:
        return {
          label: 'RECOMMENDED',
          icon: 'sparkles' as const,
          color: COLORS.primary,
          bgColor: COLORS.primarySubtle,
          borderColor: COLORS.primaryMuted,
        };
    }
  };

  const config = getTagConfig();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
        },
        style,
      ]}
    >
      <Ionicons name={config.icon} size={12} color={config.color} style={styles.icon} />
      <AppText variant="badge" color={config.color} weight="800" style={styles.text}>
        {config.label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: SPACING.xs + 3,
    borderRadius: BORDER_RADIUS.xs,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 10,
    letterSpacing: 0.6,
  },
});

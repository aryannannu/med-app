import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme';
import { AppText } from '../common/AppText';
import { formatCurrency, formatDiscount } from '../../utils/currency';

export interface PriceDisplayProps {
  price: number;
  mrp?: number;
  discountPercentage?: number;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'row' | 'column';
  style?: ViewStyle;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  mrp,
  discountPercentage,
  size = 'md',
  layout = 'row',
  style,
}) => {
  const showDiscount = mrp && mrp > price;
  const calculatedDiscount = discountPercentage || (mrp ? Math.round(((mrp - price) / mrp) * 100) : 0);

  const priceVariant = size === 'sm' ? 'titleSmall' : size === 'md' ? 'titleLarge' : 'h3';
  const mrpVariant = size === 'sm' ? 'caption' : 'bodySmall';

  return (
    <View style={[layout === 'row' ? styles.row : styles.column, style]}>
      <AppText variant={priceVariant} color={COLORS.primary} weight="800">
        {formatCurrency(price)}
      </AppText>

      {showDiscount && (
        <View style={styles.discountRow}>
          <AppText
            variant={mrpVariant}
            color={COLORS.textMuted}
            style={styles.mrpText}
          >
            {formatCurrency(mrp)}
          </AppText>

          {calculatedDiscount > 0 && (
            <View style={styles.discountPill}>
              <AppText variant="badge" color={COLORS.secondaryDark} weight="700">
                {formatDiscount(calculatedDiscount)}
              </AppText>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  column: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.xs,
    marginTop: 2,
  },
  mrpText: {
    textDecorationLine: 'line-through',
    marginRight: SPACING.xs,
  },
  discountPill: {
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.xs,
  },
});

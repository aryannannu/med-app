import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Medicine } from '../../types/medicine';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../common/AppText';
import { RxBadge } from '../badges/RxBadge';
import { QuantitySelector } from '../controls/QuantitySelector';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/currency';

export interface MedicineCardProps {
  medicine: Medicine;
  onPress: () => void;
  onAddToCart?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  cartQuantity?: number;
  layout?: 'grid' | 'list';
  storeAttribution?: string;
  style?: ViewStyle;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  onPress,
  onAddToCart,
  onIncrement,
  onDecrement,
  cartQuantity = 0,
  layout = 'grid',
  storeAttribution,
  style,
}) => {
  const isOutOfStock = medicine.inStock === false;
  const savingsAmount = Math.max(0, medicine.mrp - medicine.discountPrice);

  if (layout === 'grid') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[styles.cardContainer, SHADOWS.subtle, style]}
      >
        {/* 1. Top Image Container with floating ADD button */}
        <View style={styles.imageBox}>
          <Image source={{ uri: medicine.image }} style={styles.productImg} resizeMode="contain" />

          {medicine.rxRequired && <RxBadge style={styles.rxBadge} />}

          {/* Floating ADD / Quantity Button on Bottom-Right of Image Box */}
          <View style={styles.floatingActionContainer}>
            {isOutOfStock ? (
              <View style={styles.outOfStockPill}>
                <AppText variant="caption" color={COLORS.danger} weight="600" style={{ fontSize: 9 }}>
                  OUT OF STOCK
                </AppText>
              </View>
            ) : cartQuantity > 0 ? (
              <QuantitySelector
                quantity={cartQuantity}
                onIncrement={onIncrement || (() => {})}
                onDecrement={onDecrement || (() => {})}
                size="sm"
              />
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onAddToCart}
                style={styles.addPillBtn}
              >
                <AppText variant="buttonSmall" color="#15803D" weight="600" style={styles.addBtnText}>
                  ADD
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Info Block */}
        <View style={styles.infoWrapper}>
          {/* 2. Price Block: Solid Green Price Tag + Strikethrough MRP */}
          <View style={styles.priceRow}>
            <View style={styles.greenPriceTag}>
              <AppText variant="titleSmall" color="#FFFFFF" weight="600" style={{ fontSize: 13 }}>
                {formatCurrency(medicine.discountPrice)}
              </AppText>
            </View>
            <AppText variant="caption" color={COLORS.textMuted} style={styles.strikeMrp}>
              {formatCurrency(medicine.mrp)}
            </AppText>
          </View>

          {/* 3. Discount Line: e.g. ₹77 OFF */}
          <View style={styles.discountRow}>
            <AppText variant="caption" color="#15803D" weight="600" style={styles.discountText}>
              {savingsAmount > 0 ? `${formatCurrency(savingsAmount)} OFF` : `${medicine.discountPercentage}% OFF`}
            </AppText>
            <View style={styles.dottedLine} />
          </View>

          {/* 4. Product Title (consistent 2-line baseline height) */}
          <View style={styles.titleContainer}>
            <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600" numberOfLines={2} style={styles.title}>
              {medicine.name}
            </AppText>
          </View>

          {/* 5. Pack Size or Store Attribution */}
          <AppText variant="caption" color={COLORS.textSecondary} numberOfLines={1} style={styles.packSize}>
            {storeAttribution ? `🏪 ${storeAttribution}` : (medicine.packForm || '10 Tablets')}
          </AppText>

          {/* 6. Rating */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color="#15803D" />
            <AppText variant="caption" color="#15803D" weight="600" style={{ marginLeft: 3, fontSize: 11 }}>
              {medicine.rating || 4.7} ({medicine.reviewCount || '4.1k'})
            </AppText>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // List layout
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.listContainer, SHADOWS.subtle, style]}
    >
      <View style={styles.listImageWrapper}>
        <Image source={{ uri: medicine.image }} style={styles.listImage} resizeMode="contain" />
        {medicine.rxRequired && <RxBadge style={styles.rxBadge} />}
      </View>

      <View style={styles.listContent}>
        <AppText variant="titleSmall" color={COLORS.textPrimary} numberOfLines={1} weight="600">
          {medicine.name}
        </AppText>
        <AppText variant="caption" color={COLORS.textSecondary} numberOfLines={1}>
          {medicine.saltComposition}
        </AppText>
        <AppText variant="caption" color={COLORS.textMuted} numberOfLines={1} style={{ marginTop: 2 }}>
          {medicine.packForm}
        </AppText>

        <View style={styles.listBottomRow}>
          <View style={styles.priceRow}>
            <View style={styles.greenPriceTag}>
              <AppText variant="titleSmall" color="#FFFFFF" weight="600">
                {formatCurrency(medicine.discountPrice)}
              </AppText>
            </View>
            <AppText variant="caption" color={COLORS.textMuted} style={styles.strikeMrp}>
              {formatCurrency(medicine.mrp)}
            </AppText>
          </View>

          {cartQuantity > 0 ? (
            <QuantitySelector
              quantity={cartQuantity}
              onIncrement={onIncrement || (() => {})}
              onDecrement={onDecrement || (() => {})}
              size="sm"
            />
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onAddToCart}
              style={styles.addPillBtn}
            >
              <AppText variant="buttonSmall" color="#15803D" weight="600" style={styles.addBtnText}>
                ADD
              </AppText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  imageBox: {
    position: 'relative',
    width: '100%',
    height: 124,
    backgroundColor: '#F8F8FC',
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  productImg: {
    width: '85%',
    height: '85%',
  },
  rxBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  floatingActionContainer: {
    position: 'absolute',
    bottom: -10,
    right: 6,
    zIndex: 10,
  },
  addPillBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: '#15803D',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  addBtnText: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  outOfStockPill: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  infoWrapper: {
    paddingTop: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenPriceTag: {
    backgroundColor: '#15803D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  strikeMrp: {
    textDecorationLine: 'line-through',
    marginLeft: 6,
    fontSize: 11,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  discountText: {
    fontSize: 11,
    marginRight: 6,
  },
  dottedLine: {
    flex: 1,
    height: 1,
    borderWidth: 0.5,
    borderColor: '#E8E8EE',
    borderStyle: 'dashed',
  },
  titleContainer: {
    height: 36,
    justifyContent: 'center',
    marginTop: 4,
  },
  title: {
    fontSize: 13,
    lineHeight: 17,
  },
  packSize: {
    marginTop: 2,
    fontSize: 11,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: '#DCFCE7',
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },

  // List Styles
  listContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    alignItems: 'center',
  },
  listImageWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
    backgroundColor: '#F8F8FC',
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  listImage: {
    width: '80%',
    height: '80%',
  },
  listContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  listBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
});

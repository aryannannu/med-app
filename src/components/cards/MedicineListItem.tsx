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
import { PriceRow } from '../controls/PriceRow';
import { QuantitySelector } from '../controls/QuantitySelector';
import { Ionicons } from '@expo/vector-icons';

export interface MedicineListItemProps {
  medicine: Medicine;
  onPress: () => void;
  onAddToCart?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  cartQuantity?: number;
  style?: ViewStyle;
}

export const MedicineListItem: React.FC<MedicineListItemProps> = ({
  medicine,
  onPress,
  onAddToCart,
  onIncrement,
  onDecrement,
  cartQuantity = 0,
  style,
}) => {
  const isOutOfStock = medicine.inStock === false;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.listContainer, SHADOWS.subtle, style]}
    >
      <View style={styles.listImageWrapper}>
        <Image source={{ uri: medicine.image }} style={styles.listImage} resizeMode="cover" />
        {medicine.rxRequired && <RxBadge style={styles.listRxBadge} />}
      </View>

      <View style={styles.listContent}>
        <View style={styles.headerRow}>
          <AppText variant="titleMedium" color={COLORS.textPrimary} numberOfLines={1} weight="700" style={styles.medName}>
            {medicine.name}
          </AppText>
        </View>

        <AppText variant="caption" color={COLORS.textSecondary} numberOfLines={1} style={styles.saltText}>
          {medicine.saltComposition}
        </AppText>

        <AppText variant="caption" color={COLORS.textMuted} numberOfLines={1} style={styles.packText}>
          By {medicine.manufacturer} • {medicine.packForm}
        </AppText>

        <View style={styles.listActionRow}>
          <PriceRow price={medicine.discountPrice} mrp={medicine.mrp} size="md" />

          {isOutOfStock ? (
            <View style={styles.outOfStockPill}>
              <AppText variant="caption" color={COLORS.danger} weight="700">
                Unavailable
              </AppText>
            </View>
          ) : cartQuantity > 0 ? (
            <QuantitySelector
              quantity={cartQuantity}
              onIncrement={onIncrement || (() => {})}
              onDecrement={onDecrement || (() => {})}
              size="md"
            />
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onAddToCart}
              style={styles.listAddBtn}
            >
              <Ionicons name="cart-outline" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
              <AppText variant="buttonSmall" color={COLORS.primary} weight="700">
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
  listContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  listImageWrapper: {
    position: 'relative',
    width: 90,
    height: 90,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceSubtle,
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  listRxBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
  },
  listContent: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  medName: {
    flex: 1,
  },
  saltText: {
    color: COLORS.primaryDark,
    marginTop: 2,
  },
  packText: {
    marginTop: 2,
  },
  listActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  listAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySubtle,
    minHeight: 38,
  },
  outOfStockPill: {
    backgroundColor: COLORS.dangerLight,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.xs,
  },
});

import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Medicine } from '../../types/medicine';
import { AppText } from '../common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/currency';
import { useAppTheme } from '../../store/ThemeContext';

export interface MedicineCardProps {
  medicine: Medicine;
  onPress: () => void;
  onAddToCart?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onOpenVariantModal?: (medicine: Medicine) => void;
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
  onOpenVariantModal,
  cartQuantity = 0,
  layout = 'grid',
  storeAttribution,
  style,
}) => {
  const { colors, isDark } = useAppTheme();
  const isOutOfStock = medicine.inStock === false;
  const hasMultipleVariants =
    medicine.variants && medicine.variants.length > 1;

  const handleAddPress = () => {
    if (hasMultipleVariants && onOpenVariantModal) {
      onOpenVariantModal(medicine);
    } else if (onAddToCart) {
      onAddToCart();
    }
  };

  const renderActionControl = () => {
    if (isOutOfStock) {
      return (
        <View style={[styles.outOfStockPill, { backgroundColor: colors.dangerLight }]}>
          <AppText style={[styles.outOfStockText, { color: colors.danger }]}>OUT OF STOCK</AppText>
        </View>
      );
    }

    if (hasMultipleVariants) {
      if (cartQuantity > 0) {
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onOpenVariantModal && onOpenVariantModal(medicine)}
            style={[styles.activeQtyPillBtn, { backgroundColor: colors.primarySubtle, borderColor: colors.primary }]}
          >
            <Ionicons name="add" size={14} color={colors.primary} />
            <View style={[styles.qtyBadgeInner, { backgroundColor: colors.surface }]}>
              <AppText style={[styles.qtyText, { color: colors.primary }]}>{cartQuantity}</AppText>
              <Ionicons name="chevron-down" size={12} color={colors.primary} style={{ marginLeft: 2 }} />
            </View>
          </TouchableOpacity>
        );
      }
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleAddPress}
          style={[styles.addPillBtn, { backgroundColor: colors.primarySubtle, borderColor: colors.primary }]}
        >
          <Ionicons name="add" size={20} color={colors.primary} />
        </TouchableOpacity>
      );
    }

    if (cartQuantity > 0) {
      return (
        <View style={[styles.stepperContainer, { backgroundColor: colors.primarySubtle, borderColor: colors.primary }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onDecrement}
            style={styles.stepperTouchBtn}
          >
            <Ionicons
              name={cartQuantity === 1 ? 'trash-outline' : 'remove'}
              size={13}
              color={colors.primary}
            />
          </TouchableOpacity>
          <AppText style={[styles.stepperQtyNum, { color: colors.primary }]}>{cartQuantity}</AppText>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onIncrement}
            style={styles.stepperTouchBtn}
          >
            <Ionicons name="add" size={13} color={colors.primary} />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleAddPress}
        style={[styles.addPillBtn, { backgroundColor: colors.primarySubtle, borderColor: colors.primary }]}
      >
        <Ionicons name="add" size={20} color={colors.primary} />
      </TouchableOpacity>
    );
  };

  if (layout === 'grid') {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={[styles.cardContainer, { backgroundColor: colors.surface, borderColor: colors.border }, style]}
      >
        {/* 1. Image Box Container */}
        <View style={[styles.imageBox, { backgroundColor: colors.surfaceSubtle }]}>
          <Image
            source={{ uri: medicine.image }}
            style={styles.productImg}
            resizeMode="cover"
          />

          {medicine.rxRequired && (
            <View style={styles.rxTag}>
              <AppText style={styles.rxTagText}>RX</AppText>
            </View>
          )}

          <View style={styles.floatingActionContainer}>
            {renderActionControl()}
          </View>
        </View>

        {/* 2. Manufacturer Brand Name */}
        <AppText style={styles.manufacturerText} color={colors.textSecondary} numberOfLines={1}>
          {(medicine.manufacturer || 'CIPLA').toUpperCase()}
        </AppText>

        {/* 3. Product Title */}
        <View style={styles.titleWrapper}>
          <AppText weight="700" style={styles.productTitle} color={colors.textPrimary} numberOfLines={2}>
            {medicine.name}
          </AppText>
        </View>

        {/* 4. Dosage & Pack Size Pill Tag */}
        <View style={[styles.dosagePillTag, { backgroundColor: colors.primarySubtle, borderColor: colors.primaryBorder }]}>
          <Ionicons name="bandage-outline" size={11} color={colors.primary} style={{ marginRight: 3 }} />
          <AppText style={[styles.dosagePillText, { color: colors.primary }]} numberOfLines={1}>
            {hasMultipleVariants
              ? 'Multiple Options'
              : medicine.packForm || '10mg • 30N'}
          </AppText>
        </View>

        {/* 5. Delivery ETA & Rating Row */}
        <View style={styles.metaRow}>
          <View style={styles.etaBadge}>
            <Ionicons name="flash" size={10} color="#D97706" style={{ marginRight: 2 }} />
            <AppText style={styles.etaText}>
              4MINS{storeAttribution ? ' • 1.1KM' : ''}
            </AppText>
          </View>

          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={10} color={colors.success} style={{ marginRight: 2 }} />
            <AppText style={[styles.ratingText, { color: colors.success }]}>
              {medicine.rating || '4.2'}
            </AppText>
          </View>
        </View>

        {/* 6. Price & Discount Row */}
        <View style={styles.priceRow}>
          <AppText style={styles.strikeMrpText} color={colors.textMuted}>
            {formatCurrency(medicine.mrp)}
          </AppText>
          <AppText style={styles.sellingPriceText} color={colors.textPrimary}>
            {formatCurrency(medicine.discountPrice)}
          </AppText>
          <AppText style={styles.discountText} color={colors.success}>
            {medicine.discountPercentage || 15}% OFF
          </AppText>
        </View>
      </TouchableOpacity>
    );
  }

  // List layout
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.listContainer, { backgroundColor: colors.surface, borderColor: colors.border }, style]}
    >
      <View style={[styles.listImageWrapper, { backgroundColor: colors.surfaceSubtle }]}>
        <Image source={{ uri: medicine.image }} style={styles.listImage} resizeMode="cover" />
        {medicine.rxRequired && (
          <View style={styles.rxTagList}>
            <AppText style={styles.rxTagText}>RX</AppText>
          </View>
        )}
      </View>

      <View style={styles.listContent}>
        <AppText style={styles.manufacturerText} color={colors.textSecondary} numberOfLines={1}>
          {(medicine.manufacturer || 'CIPLA').toUpperCase()}
        </AppText>
        <AppText weight="700" style={styles.productTitle} color={colors.textPrimary} numberOfLines={1}>
          {medicine.name}
        </AppText>
        
        <View style={[styles.dosagePillTag, { backgroundColor: colors.primarySubtle, borderColor: colors.primaryBorder, alignSelf: 'flex-start', marginHorizontal: 0, marginTop: 4 }]}>
          <Ionicons name="bandage" size={12} color={colors.primary} style={{ marginRight: 3 }} />
          <AppText style={[styles.dosagePillText, { color: colors.primary }]}>
            {hasMultipleVariants ? 'Multiple Options' : medicine.packForm || '10mg • 30N'}
          </AppText>
        </View>

        <View style={styles.listBottomRow}>
          <View style={styles.priceRow}>
            <AppText style={styles.strikeMrpText} color={colors.textMuted}>{formatCurrency(medicine.mrp)}</AppText>
            <AppText style={styles.sellingPriceText} color={colors.textPrimary}>{formatCurrency(medicine.discountPrice)}</AppText>
            <AppText style={styles.discountText} color={colors.success}>{medicine.discountPercentage || 15}%off</AppText>
          </View>

          {renderActionControl()}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 160,
    borderRadius: 20,
    paddingBottom: 10,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  imageBox: {
    position: 'relative',
    width: '100%',
    height: 135,
    borderRadius: 18,
    overflow: 'hidden',
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  rxTag: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderTopLeftRadius: 18,
    borderBottomRightRadius: 10,
    zIndex: 10,
  },
  rxTagList: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 8,
    zIndex: 10,
  },
  rxTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  floatingActionContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    zIndex: 10,
  },
  addPillBtn: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  activeQtyPillBtn: {
    paddingHorizontal: 8,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
  },
  stepperContainer: {
    width: 74,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 4,
  },
  stepperTouchBtn: {
    width: 20,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperQtyNum: {
    fontSize: 13,
    fontWeight: '700',
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  qtyBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    marginLeft: 6,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '700',
  },
  outOfStockPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  outOfStockText: {
    fontSize: 9,
    fontWeight: '700',
  },
  dosagePillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginHorizontal: 8,
    marginTop: 8,
  },
  dosagePillText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 8,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  etaText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '700',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
  },
  manufacturerText: {
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0.4,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  titleWrapper: {
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginTop: 2,
  },
  productTitle: {
    fontSize: 14,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 10,
    marginTop: 4,
  },
  strikeMrpText: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  sellingPriceText: {
    fontSize: 16,
    fontWeight: '800',
  },
  discountText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  listContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  listImageWrapper: {
    position: 'relative',
    width: 85,
    height: 85,
    borderRadius: 14,
    overflow: 'hidden',
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
  },
  listBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
});

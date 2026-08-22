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
        <View style={styles.outOfStockPill}>
          <AppText style={styles.outOfStockText}>OUT OF STOCK</AppText>
        </View>
      );
    }

    // SCENARIO B: Multi-variant medicine already in cart or tapping add
    if (hasMultipleVariants) {
      if (cartQuantity > 0) {
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onOpenVariantModal && onOpenVariantModal(medicine)}
            style={styles.activeQtyPillBtn}
          >
            <Ionicons name="add" size={14} color="#4C2A9C" />
            <View style={styles.qtyBadgeInner}>
              <AppText style={styles.qtyText}>{cartQuantity}</AppText>
              <Ionicons name="chevron-down" size={12} color="#4C2A9C" style={{ marginLeft: 2 }} />
            </View>
          </TouchableOpacity>
        );
      }
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleAddPress}
          style={styles.addPillBtn}
        >
          <Ionicons name="add" size={20} color="#4C2A9C" />
        </TouchableOpacity>
      );
    }

    // SCENARIO A: Single-variant medicine with quantity stepper
    if (cartQuantity > 0) {
      return (
        <View style={styles.stepperContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onDecrement}
            style={styles.stepperTouchBtn}
          >
            <Ionicons
              name={cartQuantity === 1 ? 'trash-outline' : 'remove'}
              size={13}
              color="#4C2A9C"
            />
          </TouchableOpacity>
          <AppText style={styles.stepperQtyNum}>{cartQuantity}</AppText>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onIncrement}
            style={styles.stepperTouchBtn}
          >
            <Ionicons name="add" size={13} color="#4C2A9C" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleAddPress}
        style={styles.addPillBtn}
      >
        <Ionicons name="add" size={20} color="#4C2A9C" />
      </TouchableOpacity>
    );
  };

  if (layout === 'grid') {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={[styles.cardContainer, style]}
      >
        {/* 1. Image Box Container */}
        <View style={styles.imageBox}>
          <Image
            source={{ uri: medicine.image }}
            style={styles.productImg}
            resizeMode="cover"
          />

          {/* Green RX Badge top-left */}
          {medicine.rxRequired && (
            <View style={styles.rxTag}>
              <AppText style={styles.rxTagText}>RX</AppText>
            </View>
          )}

          {/* Floating ADD / Quantity Pill Button on bottom-right of image */}
          <View style={styles.floatingActionContainer}>
            {renderActionControl()}
          </View>
        </View>

        {/* 2. Dosage & Pack Size Pill Tag */}
        <View style={styles.dosagePillTag}>
          <Ionicons name="bandage" size={13} color="#4C2A9C" style={{ marginRight: 4 }} />
          <AppText style={styles.dosagePillText} numberOfLines={1}>
            {hasMultipleVariants
              ? 'Multiple Options'
              : medicine.packForm || '10mg • 30N'}
          </AppText>
        </View>

        {/* 3. Delivery ETA & Rating Row */}
        <View style={styles.metaRow}>
          <View style={styles.etaBadge}>
            <Ionicons name="flash" size={11} color="#D97706" style={{ marginRight: 2 }} />
            <AppText style={styles.etaText}>
              4MINS{storeAttribution ? ' • 1.1KM' : ''}
            </AppText>
          </View>

          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={11} color="#059669" style={{ marginRight: 2 }} />
            <AppText style={styles.ratingText}>
              {medicine.rating || '4.2'}({medicine.reviewCount ? `${(medicine.reviewCount/1000).toFixed(1)}k` : '2.k'})
            </AppText>
          </View>
        </View>

        {/* 4. Manufacturer Brand Name */}
        <AppText style={styles.manufacturerText} numberOfLines={1}>
          {(medicine.manufacturer || 'CIPLA').toUpperCase()}
        </AppText>

        {/* 5. Product Title */}
        <View style={styles.titleWrapper}>
          <AppText weight="700" style={styles.productTitle} numberOfLines={2}>
            {medicine.name}
          </AppText>
        </View>

        {/* 6. Price & Discount Row */}
        <View style={styles.priceRow}>
          <AppText style={styles.strikeMrpText}>
            {formatCurrency(medicine.mrp)}
          </AppText>
          <AppText style={styles.sellingPriceText}>
            {formatCurrency(medicine.discountPrice)}
          </AppText>
          <AppText style={styles.discountText}>
            {medicine.discountPercentage || 15}%off
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
      style={[styles.listContainer, style]}
    >
      <View style={styles.listImageWrapper}>
        <Image source={{ uri: medicine.image }} style={styles.listImage} resizeMode="cover" />
        {medicine.rxRequired && (
          <View style={styles.rxTagList}>
            <AppText style={styles.rxTagText}>RX</AppText>
          </View>
        )}
      </View>

      <View style={styles.listContent}>
        <AppText style={styles.manufacturerText} numberOfLines={1}>
          {(medicine.manufacturer || 'CIPLA').toUpperCase()}
        </AppText>
        <AppText weight="700" style={styles.productTitle} numberOfLines={1}>
          {medicine.name}
        </AppText>
        
        <View style={[styles.dosagePillTag, { alignSelf: 'flex-start', marginHorizontal: 0, marginTop: 4 }]}>
          <Ionicons name="bandage" size={12} color="#4C2A9C" style={{ marginRight: 3 }} />
          <AppText style={styles.dosagePillText}>
            {hasMultipleVariants ? 'Multiple Options' : medicine.packForm || '10mg • 30N'}
          </AppText>
        </View>

        <View style={styles.listBottomRow}>
          <View style={styles.priceRow}>
            <AppText style={styles.strikeMrpText}>{formatCurrency(medicine.mrp)}</AppText>
            <AppText style={styles.sellingPriceText}>{formatCurrency(medicine.discountPrice)}</AppText>
            <AppText style={styles.discountText}>{medicine.discountPercentage || 15}%off</AppText>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF',
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
    backgroundColor: '#F8F8FC',
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
    backgroundColor: '#EEF0FD',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#5B28D6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5B28D6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  activeQtyPillBtn: {
    paddingHorizontal: 8,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF0FD',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#5B28D6',
  },
  stepperContainer: {
    width: 74,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF0FD',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#5B28D6',
    paddingHorizontal: 4,
  },
  stepperTouchBtn: {
    width: 20,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperQtyNum: {
    color: '#4C2A9C',
    fontSize: 13,
    fontWeight: '700',
  },
  addBtnText: {
    color: '#4C2A9C',
    fontSize: 15,
    fontWeight: '700',
  },
  qtyBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    marginLeft: 6,
  },
  qtyText: {
    color: '#4C2A9C',
    fontSize: 13,
    fontWeight: '700',
  },
  outOfStockPill: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  outOfStockText: {
    color: '#DC2626',
    fontSize: 9,
    fontWeight: '700',
  },
  dosagePillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF0FD',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginHorizontal: 8,
    marginTop: 8,
  },
  dosagePillText: {
    color: '#4C2A9C',
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
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  manufacturerText: {
    color: '#71717A',
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
    color: '#0F172A',
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
    color: '#A1A1AA',
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  sellingPriceText: {
    color: '#09090B',
    fontSize: 16,
    fontWeight: '800',
  },
  discountText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },

  // List Styles
  listContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    alignItems: 'center',
  },
  listImageWrapper: {
    position: 'relative',
    width: 85,
    height: 85,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F8F8FC',
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


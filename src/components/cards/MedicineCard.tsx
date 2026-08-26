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
import { haptics } from '../../services/hapticService';

export interface MedicineCardProps {
  medicine: Medicine;
  onPress: () => void;
  onAddToCart?: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onOpenVariantModal?: (medicine: Medicine) => void;
  cartQuantity?: number;
  layout?: 'grid' | 'list';
  size?: 'small' | 'medium';
  actionVariant?: 'plus' | 'add' | 'stepper' | 'dropdown';
  dosageText?: string;
  deliveryEta?: string;
  ratingText?: string;
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
  size = 'small',
  actionVariant,
  dosageText,
  deliveryEta = '4MINS',
  ratingText,
  storeAttribution,
  style,
}) => {
  const { colors, isDark } = useAppTheme();
  const isOutOfStock = medicine.inStock === false;
  const variantCount = medicine.variants ? medicine.variants.length : 1;
  const hasMultipleVariants = variantCount > 1;

  const handleCardPress = () => {
    haptics.light();
    if (onPress) onPress();
  };

  const handleAddPress = () => {
    haptics.medium();
    if (hasMultipleVariants && onOpenVariantModal) {
      onOpenVariantModal(medicine);
    } else if (onAddToCart) {
      onAddToCart();
    }
  };

  const handleIncrementPress = () => {
    haptics.light();
    if (onIncrement) onIncrement();
  };

  const handleDecrementPress = () => {
    haptics.light();
    if (onDecrement) onDecrement();
  };

  const formattedDosage = dosageText || '10mg · 30N';

  const formattedRating =
    ratingText || `${medicine.rating || 4.2}(2.k)`;

  const renderActionControl = () => {
    if (isOutOfStock) {
      return (
        <View style={[styles.outOfStockPill, { backgroundColor: colors.dangerLight }]}>
          <AppText style={[styles.outOfStockText, { color: colors.danger }]}>OUT OF STOCK</AppText>
        </View>
      );
    }

    // Force explicit variant if provided for design showcase
    if (actionVariant === 'plus') {
      return (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleAddPress}
          style={[styles.plusPillBtn, { backgroundColor: isDark ? '#312E81' : '#FFFFFF', borderColor: isDark ? '#818CF8' : '#D6D0F0' }]}
        >
          <Ionicons name="add" size={22} color={isDark ? '#A5B4FC' : '#4C1D95'} />
        </TouchableOpacity>
      );
    }

    if (actionVariant === 'add') {
      return (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleAddPress}
          style={[styles.addTextPillBtn, { backgroundColor: isDark ? '#312E81' : '#FFFFFF', borderColor: isDark ? '#818CF8' : '#D6D0F0' }]}
        >
          <AppText style={[styles.addTextPillLabel, { color: isDark ? '#A5B4FC' : '#3B1F8E' }]}>Add</AppText>
        </TouchableOpacity>
      );
    }

    // Scenario B: Multiple mg / Multiple Variants -> "Add" + separate count badge "3 ˅"
    if (hasMultipleVariants || actionVariant === 'dropdown') {
      const displayCount = hasMultipleVariants ? variantCount : 3;
      return (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => (onOpenVariantModal ? onOpenVariantModal(medicine) : handleAddPress())}
          style={[styles.dropdownQtyBtn, { backgroundColor: isDark ? '#312E81' : '#FFFFFF', borderColor: isDark ? '#818CF8' : '#D6D0F0' }]}
        >
          <AppText style={[styles.addTextPillLabel, { color: isDark ? '#A5B4FC' : '#3B1F8E' }]}>Add</AppText>
          <View style={[styles.dropdownCountBadge, { backgroundColor: isDark ? '#1E1B4B' : '#F0ECF9', borderColor: isDark ? '#6366F1' : '#DDD6F3' }]}>
            <AppText style={[styles.dropdownCountText, { color: isDark ? '#A5B4FC' : '#3B1F8E' }]}>{displayCount}</AppText>
            <Ionicons name="chevron-down" size={11} color={isDark ? '#A5B4FC' : '#3B1F8E'} style={{ marginLeft: 1 }} />
          </View>
        </TouchableOpacity>
      );
    }

    // Scenario A: Single mg / Single Variant (In Cart -> Stepper)
    if (cartQuantity > 0) {
      return (
        <View style={[styles.stepperContainer, { backgroundColor: isDark ? '#312E81' : '#FFFFFF', borderColor: isDark ? '#818CF8' : '#D6D0F0' }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleDecrementPress}
            style={styles.stepperTouchBtn}
          >
            <Ionicons
              name={cartQuantity === 1 ? 'trash-outline' : 'remove'}
              size={13}
              color={isDark ? '#A5B4FC' : '#3B1F8E'}
            />
          </TouchableOpacity>
          <AppText style={[styles.stepperQtyNum, { color: isDark ? '#A5B4FC' : '#3B1F8E' }]}>{cartQuantity}</AppText>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleIncrementPress}
            style={styles.stepperTouchBtn}
          >
            <Ionicons name="add" size={13} color={isDark ? '#A5B4FC' : '#3B1F8E'} />
          </TouchableOpacity>
        </View>
      );
    }

    // Scenario A: Single mg / Single Variant (Not in Cart -> "Add")
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleAddPress}
        style={[styles.addTextPillBtn, { backgroundColor: isDark ? '#312E81' : '#FFFFFF', borderColor: isDark ? '#818CF8' : '#D6D0F0' }]}
      >
        <AppText style={[styles.addTextPillLabel, { color: isDark ? '#A5B4FC' : '#3B1F8E' }]}>Add</AppText>
      </TouchableOpacity>
    );
  };

  if (layout === 'grid') {
    const isSmall = size === 'small';

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={handleCardPress}
        style={[
          styles.cardContainer,
          isSmall ? styles.cardSmall : styles.cardMedium,
          { backgroundColor: colors.surface, borderColor: colors.border },
          style,
        ]}
      >
        {/* 1. Top Image Box Container (Pastel Lavender Background) */}
        <View style={[styles.imageBox, isSmall ? styles.imageBoxSmall : styles.imageBoxMedium, { backgroundColor: isDark ? '#1E1B4B' : '#ECE5FF' }]}>
          <Image
            source={{ uri: medicine.image }}
            style={styles.productImg}
            resizeMode="cover"
          />

          {/* RX Banner Badge */}
          {medicine.rxRequired && (
            <View style={styles.rxFlagTag}>
              <AppText style={styles.rxFlagText}>RX</AppText>
              <View style={styles.rxFlagSpeechTail} />
            </View>
          )}

          {/* Bottom-Right Floating Action Button */}
          <View style={styles.floatingActionContainer}>
            {renderActionControl()}
          </View>

          {/* Full-Width Dosage Strip at Bottom */}
          <View style={[styles.dosageStrip, { backgroundColor: isDark ? '#1E1B4B' : '#E4DAFC' }]}>
            <AppText style={styles.dosagePillEmoji}>💊</AppText>
            <AppText style={[styles.dosageStripText, { color: isDark ? '#C7D2FE' : '#3B1F8E' }]} numberOfLines={1}>
              {formattedDosage}
            </AppText>
          </View>
        </View>

        {/* 2. Delivery ETA & Rating Row */}
        <View style={styles.metaRow}>
          <View style={styles.etaBadge}>
            <Ionicons name="flash" size={12} color="#F97316" style={{ marginRight: 2 }} />
            <AppText style={styles.etaText}>
              {deliveryEta}
            </AppText>
          </View>

          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#10B981" style={{ marginRight: 2 }} />
            <AppText style={styles.ratingText}>
              {formattedRating}
            </AppText>
          </View>
        </View>

        {/* 3. Manufacturer Brand Name */}
        <AppText style={styles.manufacturerText} color={colors.textSecondary} numberOfLines={1}>
          {(medicine.manufacturer || medicine.brandName || 'CIPLA').toUpperCase()}
        </AppText>

        {/* 4. Product Title */}
        <View style={isSmall ? styles.titleWrapperSmall : styles.titleWrapperMedium}>
          <AppText weight="700" style={isSmall ? styles.productTitleSmall : styles.productTitleMedium} color={colors.textPrimary} numberOfLines={2}>
            {medicine.name}
          </AppText>
        </View>

        {/* 5. Price & Discount Row */}
        <View style={styles.priceRow}>
          <AppText style={styles.strikeMrpText} color={colors.textMuted}>
            {formatCurrency(medicine.mrp)}
          </AppText>
          <AppText style={styles.sellingPriceText} color={colors.textPrimary}>
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
      style={[styles.listContainer, { backgroundColor: colors.surface, borderColor: colors.border }, style]}
    >
      <View style={[styles.listImageWrapper, { backgroundColor: isDark ? '#1E1B4B' : '#ECE5FF' }]}>
        <Image source={{ uri: medicine.image }} style={styles.listImage} resizeMode="cover" />
        {medicine.rxRequired && (
          <View style={styles.rxFlagTagList}>
            <AppText style={styles.rxFlagText}>RX</AppText>
          </View>
        )}
      </View>

      <View style={styles.listContent}>
        <View style={styles.listMetaRow}>
          <AppText style={styles.manufacturerTextList} color={colors.textSecondary} numberOfLines={1}>
            {(medicine.manufacturer || medicine.brandName || 'CIPLA').toUpperCase()}
          </AppText>
          <View style={styles.etaBadge}>
            <Ionicons name="flash" size={11} color="#F97316" style={{ marginRight: 2 }} />
            <AppText style={styles.etaText}>{deliveryEta}</AppText>
          </View>
        </View>

        <AppText weight="700" style={styles.productTitleList} color={colors.textPrimary} numberOfLines={1}>
          {medicine.name}
        </AppText>
        
        <View style={[styles.dosageInsetPillList, { backgroundColor: isDark ? '#1E1B4B' : '#FFFFFF', borderColor: isDark ? '#6366F1' : '#C5B9E8' }]}>
          <AppText style={styles.dosagePillEmoji}>💊</AppText>
          <AppText style={[styles.dosageInsetText, { color: isDark ? '#C7D2FE' : '#3B1F8E' }]}>
            {formattedDosage}
          </AppText>
        </View>

        <View style={styles.listBottomRow}>
          <View style={styles.priceRow}>
            <AppText style={styles.strikeMrpText} color={colors.textMuted}>{formatCurrency(medicine.mrp)}</AppText>
            <AppText style={styles.sellingPriceText} color={colors.textPrimary}>{formatCurrency(medicine.discountPrice)}</AppText>
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
    borderRadius: 22,
    paddingBottom: 12,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  cardSmall: {
    width: 164,
  },
  cardMedium: {
    width: 180,
  },

  // Image Container
  imageBox: {
    position: 'relative',
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBoxSmall: {
    height: 135,
  },
  imageBoxMedium: {
    height: 150,
  },
  productImg: {
    width: '100%',
    height: '100%',
  },

  // RX Flag Tag
  rxFlagTag: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#00B67A',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderTopLeftRadius: 20,
    borderBottomRightRadius: 12,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 2,
    zIndex: 12,
  },
  rxFlagTagList: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#00B67A',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderTopLeftRadius: 14,
    borderBottomRightRadius: 10,
    zIndex: 12,
  },
  rxFlagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  rxFlagSpeechTail: {
    position: 'absolute',
    bottom: -3,
    left: 0,
    width: 0,
    height: 0,
    borderRightWidth: 4,
    borderRightColor: 'transparent',
    borderTopWidth: 4,
    borderTopColor: '#047857',
  },

  // Floating Action Controls (bottom-right of image)
  floatingActionContainer: {
    position: 'absolute',
    bottom: 30,
    right: 8,
    zIndex: 15,
  },
  plusPillBtn: {
    width: 32,
    height: 32,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  addTextPillBtn: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  addTextPillLabel: {
    fontSize: 13.5,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
  },
  dropdownQtyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  dropdownCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  dropdownCountText: {
    fontSize: 13.5,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
  },

  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 88,
    height: 36,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  stepperTouchBtn: {
    width: 24,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperQtyNum: {
    fontSize: 14,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
  },

  outOfStockPill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  outOfStockText: {
    fontSize: 9.5,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
  },

  // Full-Width Dosage Strip at Bottom of Image
  dosageStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    zIndex: 10,
  },
  dosagePillEmoji: {
    fontSize: 13,
    marginRight: 4,
  },
  dosageStripText: {
    fontSize: 12,
    fontFamily: 'LexendDeca_600SemiBold',
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Legacy dosage pill (used in list layout)
  dosageInsetPill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 4.5,
    paddingHorizontal: 10,
    zIndex: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dosageInsetText: {
    fontSize: 12,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
  },

  // Meta Row Below Image
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
    color: '#EA580C',
    fontSize: 11.5,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#059669',
    fontSize: 11.5,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
  },

  manufacturerText: {
    fontSize: 10,
    fontFamily: 'LexendDeca_600SemiBold',
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#64748B',
    paddingHorizontal: 10,
    marginTop: 5,
  },

  titleWrapperSmall: {
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginTop: 2,
  },
  titleWrapperMedium: {
    height: 42,
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginTop: 2,
  },
  productTitleSmall: {
    fontSize: 14,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
    lineHeight: 18,
    color: '#0F172A',
  },
  productTitleMedium: {
    fontSize: 15,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
    lineHeight: 19,
    color: '#0F172A',
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
    color: '#94A3B8',
    marginRight: 5,
  },
  sellingPriceText: {
    fontSize: 16,
    fontFamily: 'LexendDeca_800ExtraBold',
    fontWeight: '800',
    color: '#0F172A',
  },
  discountText: {
    fontSize: 12.5,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
    color: '#059669',
    marginLeft: 5,
  },

  // List layout styles
  listContainer: {
    flexDirection: 'row',
    borderRadius: 22,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  listImageWrapper: {
    position: 'relative',
    width: 90,
    height: 90,
    borderRadius: 16,
    overflow: 'hidden',
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  listContent: {
    flex: 1,
    marginLeft: 14,
  },
  listMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  manufacturerTextList: {
    fontSize: 10,
    fontFamily: 'LexendDeca_600SemiBold',
    letterSpacing: 0.4,
    color: '#64748B',
  },
  productTitleList: {
    fontSize: 15,
    fontFamily: 'LexendDeca_700Bold',
    color: '#0F172A',
    marginTop: 2,
  },
  dosageInsetPillList: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginTop: 5,
  },
  listBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});


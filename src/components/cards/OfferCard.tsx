import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { PharmacyOffer } from '../../types/offer';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { useAppTheme } from '../../store/ThemeContext';
import { AppText } from '../common/AppText';
import { OfferTagBadge } from '../badges/OfferTagBadge';
import { VerifiedBadge } from '../badges/VerifiedBadge';
import { RatingBadge } from '../badges/RatingBadge';
import { AppButton } from '../common/AppButton';
import { formatCurrency } from '../../utils/currency';
import { formatDistance, formatDeliveryTime } from '../../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export interface OfferCardProps {
  offer: PharmacyOffer;
  isSelected?: boolean;
  onSelect: () => void;
  style?: ViewStyle;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  isSelected = false,
  onSelect,
  style,
}) => {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.card,
        isSelected ? styles.cardSelected : styles.cardDefault,
        SHADOWS.card,
        style,
      ]}
    >
      {/* Top Banner Tag */}
      <View style={styles.headerRow}>
        <View style={styles.tagsContainer}>
          {offer.tags.map((tag) => (
            <OfferTagBadge key={tag} tag={tag} style={{ marginRight: SPACING.xs }} />
          ))}
        </View>

        <View style={styles.etaPill}>
          <Ionicons name="flash" size={12} color={colors.primary} />
          <AppText variant="badge" color={colors.primary} weight="600" style={styles.etaText}>
            {offer.estimatedDeliveryTimeText}
          </AppText>
        </View>
      </View>

      {/* Pharmacy Info Row */}
      <View style={styles.pharmacyRow}>
        <View style={styles.pharmacyDetails}>
          <AppText variant="titleMedium" color={colors.textPrimary} weight="600" numberOfLines={1}>
            {offer.pharmacy.name}
          </AppText>
          <View style={styles.subMetaRow}>
            {offer.pharmacy.isVerified && <VerifiedBadge style={{ marginRight: SPACING.sm }} />}
            <RatingBadge rating={offer.pharmacy.rating} reviewCount={offer.pharmacy.reviewCount} />
          </View>
        </View>

        <View style={styles.distanceBox}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <AppText variant="caption" color={colors.textSecondary} weight="600" style={styles.distanceText}>
            {formatDistance(offer.pharmacy.distanceKm)}
          </AppText>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Pricing Breakdown Grid */}
      <View style={styles.priceBreakdown}>
        <View style={styles.priceItem}>
          <AppText variant="caption" color={colors.textMuted}>
            Medicines Total
          </AppText>
          <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
            {formatCurrency(offer.medicineSubtotal)}
          </AppText>
        </View>

        <View style={styles.priceItem}>
          <AppText variant="caption" color={colors.textMuted}>
            Delivery Fee
          </AppText>
          <AppText
            variant="titleSmall"
            color={offer.deliveryFee === 0 ? COLORS.success : COLORS.textPrimary}
            weight="600"
          >
            {offer.deliveryFee === 0 ? 'FREE' : formatCurrency(offer.deliveryFee)}
          </AppText>
        </View>

        <View style={styles.priceItem}>
          <AppText variant="caption" color={colors.textMuted}>
            Total Payable
          </AppText>
          <AppText variant="titleLarge" color={colors.primary} weight="600">
            {formatCurrency(offer.finalPayableAmount)}
          </AppText>
        </View>
      </View>

      {/* Savings Highlight */}
      {offer.totalSavings > 0 && (
        <View style={styles.savingsBanner}>
          <Ionicons name="sparkles" size={13} color="#15803D" />
          <AppText variant="caption" color="#15803D" weight="600" style={styles.savingsText}>
            You save {formatCurrency(offer.totalSavings)} with this pharmacy!
          </AppText>
        </View>
      )}

      {/* Primary Select Action */}
      <AppButton
        title={isSelected ? 'SELECTED OFFER' : 'ACCEPT THIS OFFER'}
        variant={isSelected ? 'secondary' : 'primary'}
        size="md"
        onPress={onSelect}
        leftIcon={
          <Ionicons
            name={isSelected ? 'checkmark-circle' : 'bag-check-outline'}
            size={18}
            color={isSelected ? COLORS.primary : COLORS.textInverse}
          />
        }
        style={styles.selectBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md + 2,
    marginBottom: SPACING.lg,
    borderWidth: 2,
  },
  cardDefault: {
    borderColor: COLORS.border,
  },
  cardSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: '#F0FDFA', // Light mint
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySubtle,
    paddingVertical: 3,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  etaText: {
    marginLeft: 3,
  },
  pharmacyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  pharmacyDetails: {
    flex: 1,
  },
  subMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  distanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    paddingVertical: 3,
    paddingHorizontal: SPACING.xs + 3,
    borderRadius: BORDER_RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  distanceText: {
    marginLeft: 3,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  priceBreakdown: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceSubtle,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  priceItem: {
    alignItems: 'flex-start',
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryLight,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
  },
  savingsText: {
    marginLeft: SPACING.xs,
  },
  selectBtn: {
    marginTop: SPACING.md,
  },
});




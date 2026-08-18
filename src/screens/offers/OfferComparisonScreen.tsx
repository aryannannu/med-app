import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppScreen } from '../../components/layout/AppScreen';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { Ionicons } from '@expo/vector-icons';
import { useOffers } from '../../store/OfferContext';
import { useAddress } from '../../store/AddressContext';
import { usePrescription } from '../../store/PrescriptionContext';
import { useOrders } from '../../store/OrderContext';
import { useCart } from '../../store/CartContext';
import { useToast } from '../../store/ToastContext';
import { formatCurrency } from '../../utils/currency';
import { formatTimeRemaining } from '../../utils/formatters';
import { PharmacyOffer } from '../../types/offer';

export const OfferComparisonScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'OfferComparison'>>();

  const {
    offers,
    selectedOffer,
    selectOffer,
    activeFilter,
    setActiveFilter,
    filteredOffers,
    timeRemainingSeconds,
    isOffersExpired,
    startFindingPharmacies,
  } = useOffers();

  const { selectedAddress } = useAddress();
  const { activePrescription } = usePrescription();
  const { createOrder } = useOrders();
  const { items, summary, clearCart } = useCart();
  const { showToast } = useToast();

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const handleSelectOffer = (offer: PharmacyOffer) => {
    selectOffer(offer);
  };

  const handleProceedWithOffer = (offer: PharmacyOffer) => {
    selectOffer(offer);
    setConfirmModalVisible(true);
  };

  const handleConfirmOrder = async () => {
    if (!selectedOffer || !selectedAddress) return;

    setPlacingOrder(true);
    try {
      const order = await createOrder(
        selectedOffer,
        selectedAddress,
        activePrescription || undefined
      );

      setConfirmModalVisible(false);
      clearCart();
      showToast('Order confirmed successfully!', 'success');
      navigation.navigate('OrderDetails', { orderId: order.id, order });
    } catch (e) {
      showToast('Failed to place order. Please try again.', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <AppScreen
      scrollable
      header={
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <AppText variant="titleMedium" color={COLORS.textPrimary} weight="700">
            Compare Vendors
          </AppText>
          <View style={{ width: 40 }} />
        </View>
      }
      footer={
        selectedOffer ? (
          <View style={[styles.bottomBar, SHADOWS.card]}>
            <View style={styles.bottomOfferInfo}>
              <AppText variant="caption" color={COLORS.textMuted}>
                Selected: <AppText variant="caption" color={COLORS.textPrimary} weight="700">{selectedOffer.pharmacy.name}</AppText>
              </AppText>
              <View style={styles.bottomPriceRow}>
                <AppText variant="h3" color={COLORS.primary} weight="800">
                  {formatCurrency(selectedOffer.finalPayableAmount)}
                </AppText>
                {selectedOffer.totalSavings > 0 && (
                  <View style={styles.saveBadgeBottom}>
                    <AppText variant="caption" color={COLORS.successDark} weight="700" style={{ fontSize: 10 }}>
                      Save {formatCurrency(selectedOffer.totalSavings)}
                    </AppText>
                  </View>
                )}
              </View>
            </View>

            <AppButton
              title="Continue with Selected"
              variant="primary"
              onPress={() => setConfirmModalVisible(true)}
              style={styles.continueBtn}
              fullWidth={false}
              rightIcon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
            />
          </View>
        ) : undefined
      }
    >
      {/* Top Banner: Pharmacy Count & Subtitle */}
      <View style={styles.topBanner}>
        <View>
          <AppText variant="titleMedium" color={COLORS.textPrimary} weight="800">
            {offers.length || 4} Pharmacies Found
          </AppText>
          <AppText variant="caption" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
            Smart results based on distance, price &amp; availability
          </AppText>
        </View>

        {/* Live Countdown Timer */}
        <View style={styles.timerPill}>
          <Ionicons name="time-outline" size={14} color={isOffersExpired ? COLORS.danger : COLORS.primary} />
          <AppText
            variant="caption"
            color={isOffersExpired ? COLORS.danger : COLORS.primary}
            weight="700"
            style={{ marginLeft: 4 }}
          >
            {isOffersExpired ? 'Expired' : formatTimeRemaining(timeRemainingSeconds)}
          </AppText>
        </View>
      </View>

      {/* Filter Tabs matching Image 3 Step 7: Cheapest | Fastest | Best Rated | All */}
      <View style={styles.filterTabsRow}>
        {[
          { key: 'all', label: 'Best Match' },
          { key: 'lowest_price', label: 'Cheapest' },
          { key: 'fastest_delivery', label: 'Fastest' },
          { key: 'best_rated', label: 'Best Rated' },
        ].map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.8}
              onPress={() => setActiveFilter(tab.key as any)}
              style={[styles.filterTabBtn, isActive && styles.filterTabBtnActive]}
            >
              <AppText
                variant="caption"
                color={isActive ? COLORS.primary : COLORS.textSecondary}
                weight={isActive ? '700' : '500'}
              >
                {tab.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Offers List */}
      {filteredOffers.length === 0 ? (
        <EmptyState
          icon="pricetags-outline"
          title="No Matching Offers"
          message="Try selecting 'Best Match' to view all available pharmacy offers."
          actionText="Show All Offers"
          onActionPress={() => setActiveFilter('all')}
        />
      ) : (
        filteredOffers.map((offer) => {
          const isSelected = selectedOffer?.id === offer.id;
          const totalItems = offer.itemPrices?.length || items.length || 8;
          const availableItems = offer.itemPrices?.filter((i) => i.isAvailable).length || totalItems;

          return (
            <TouchableOpacity
              key={offer.id}
              activeOpacity={0.9}
              onPress={() => handleSelectOffer(offer)}
              style={[
                styles.offerCard,
                isSelected && styles.offerCardSelected,
                SHADOWS.subtle,
              ]}
            >
              {/* Top Row: Store Info & Badge */}
              <View style={styles.cardTopRow}>
                <View style={styles.storeInfoRow}>
                  <View style={styles.storeLogoBox}>
                    <Ionicons name="medical" size={20} color={COLORS.primary} />
                  </View>
                  <View style={{ marginLeft: SPACING.sm }}>
                    <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700">
                      {offer.pharmacy.name}
                    </AppText>
                    <AppText variant="caption" color={COLORS.textSecondary}>
                      ★ {offer.pharmacy.rating} • {offer.pharmacy.distanceKm} km • {offer.estimatedDeliveryMinutes} mins
                    </AppText>
                  </View>
                </View>

                {/* Offer Category Tag */}
                <View style={styles.offerTagBadge}>
                  <AppText variant="caption" color={COLORS.successDark} weight="700" style={{ fontSize: 9 }}>
                    {offer.tags.includes('recommended')
                      ? 'BEST MATCH'
                      : offer.tags.includes('lowest_price')
                      ? 'CHEAPEST'
                      : offer.tags.includes('fastest_delivery')
                      ? 'FASTEST'
                      : 'BEST RATED'}
                  </AppText>
                </View>
              </View>

              {/* Middle Row: Availability & Price */}
              <View style={styles.cardMidRow}>
                <View style={styles.availabilityRow}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <AppText variant="bodySmall" color={COLORS.successDark} weight="700" style={{ marginLeft: 4 }}>
                    {availableItems}/{totalItems} Medicines Available
                  </AppText>
                </View>

                <View style={styles.priceCol}>
                  <AppText variant="h3" color={COLORS.textPrimary} weight="800">
                    {formatCurrency(offer.finalPayableAmount)}
                  </AppText>
                  {offer.totalSavings > 0 && (
                    <AppText variant="caption" color={COLORS.success} weight="700">
                      You Save {formatCurrency(offer.totalSavings)}
                    </AppText>
                  )}
                </View>
              </View>

              {/* Bottom Action Row */}
              <View style={styles.cardBottomRow}>
                <TouchableOpacity
                  onPress={() => handleSelectOffer(offer)}
                  style={styles.detailsLink}
                >
                  <AppText variant="caption" color={COLORS.primary} weight="700">
                    View Quote Details &gt;
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleProceedWithOffer(offer)}
                  style={[styles.selectBtn, isSelected && styles.selectBtnActive]}
                >
                  <AppText
                    variant="buttonSmall"
                    color={isSelected ? '#FFFFFF' : COLORS.primary}
                    weight="700"
                  >
                    {isSelected ? 'Selected ✓' : 'Select'}
                  </AppText>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })
      )}

      {/* Confirmation Modal */}
      {selectedOffer && (
        <ConfirmationModal
          visible={confirmModalVisible}
          title={`Order from ${selectedOffer.pharmacy.name}?`}
          message={`Total amount: ${formatCurrency(selectedOffer.finalPayableAmount)}\nDelivery to: ${selectedAddress?.streetAddress || 'Saved Address'}\nEstimated Time: ${selectedOffer.estimatedDeliveryMinutes} mins`}
          confirmText="Confirm & Place Order"
          cancelText="Change Pharmacy"
          onConfirm={handleConfirmOrder}
          onCancel={() => setConfirmModalVisible(false)}
        />
      )}
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: SPACING.md,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySubtle,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primaryMuted,
  },
  filterTabsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: BORDER_RADIUS.md,
    padding: 3,
    marginBottom: SPACING.lg,
  },
  filterTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  filterTabBtnActive: {
    backgroundColor: COLORS.surface,
    ...SHADOWS.subtle,
  },
  offerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  offerCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySubtle,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  storeLogoBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerTagBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardMidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailsLink: {
    paddingVertical: 4,
  },
  selectBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  selectBtnActive: {
    backgroundColor: COLORS.primary,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bottomOfferInfo: {
    flex: 1,
  },
  bottomPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  saveBadgeBottom: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
    marginLeft: 6,
  },
  continueBtn: {
    minWidth: 180,
  },
});

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { useOffers } from '../../store/OfferContext';
import { useCart } from '../../store/CartContext';
import { useToast } from '../../store/ToastContext';
import { useAppTheme } from '../../store/ThemeContext';
import { formatCurrency } from '../../utils/currency';
import { formatTimeRemaining } from '../../utils/formatters';
import { PharmacyOffer } from '../../types/offer';
import { OfferService } from '../../services/offerService';

type SortOption = 'best_overall' | 'lowest_price' | 'fastest_delivery' | 'nearest' | 'highest_rated';

export const OfferComparisonScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'OfferComparison'>>();

  const {
    offers,
    selectedOffer,
    selectOffer,
    timeRemainingSeconds,
    isOffersExpired,
    startFindingPharmacies,
  } = useOffers();

  const { items, summary } = useCart();
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();

  // Sorting & Filtering State
  const [selectedSort, setSelectedSort] = useState<SortOption>('best_overall');
  const [filterCompleteOnly, setFilterCompleteOnly] = useState(false);
  const [filterUnder15Min, setFilterUnder15Min] = useState(false);
  const [filterFourStar, setFilterFourStar] = useState(false);
  const [filterFreeDelivery, setFilterFreeDelivery] = useState(false);

  // Modals
  const [inspectingOffer, setInspectingOffer] = useState<PharmacyOffer | null>(null);
  const [partialOfferPending, setPartialOfferPending] = useState<PharmacyOffer | null>(null);
  const [newOfferBannerVisible, setNewOfferBannerVisible] = useState(false);

  // If user lands directly on OfferComparison or after reload, ensure offers exist
  useEffect(() => {
    if (offers.length === 0) {
      startFindingPharmacies(route.params?.cartId || 'cart-current', items, null);
    }
  }, [offers.length, route.params?.cartId, items, startFindingPharmacies]);

  // Simulated live offer arrival banner after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setNewOfferBannerVisible(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const sourceList = useMemo(() => {
    return offers.length > 0 ? offers : OfferService.getMockOffersSync(route.params?.cartId || 'cart-current', items);
  }, [offers, route.params?.cartId, items]);

  // Sorted & Filtered Offers
  const processedOffers = useMemo(() => {
    let list = [...sourceList];

    // Filters
    if (filterCompleteOnly) {
      list = list.filter((o) => o.allMedicinesAvailable);
    }
    if (filterUnder15Min) {
      list = list.filter((o) => o.estimatedDeliveryMinutes <= 15);
    }
    if (filterFourStar) {
      list = list.filter((o) => o.pharmacy.rating >= 4.5);
    }
    if (filterFreeDelivery) {
      list = list.filter((o) => o.deliveryFee === 0);
    }

    // Sort
    switch (selectedSort) {
      case 'lowest_price':
        list.sort((a, b) => a.finalPayableAmount - b.finalPayableAmount);
        break;
      case 'fastest_delivery':
        list.sort((a, b) => a.estimatedDeliveryMinutes - b.estimatedDeliveryMinutes);
        break;
      case 'nearest':
        list.sort((a, b) => a.pharmacy.distanceKm - b.pharmacy.distanceKm);
        break;
      case 'highest_rated':
        list.sort((a, b) => b.pharmacy.rating - a.pharmacy.rating);
        break;
      case 'best_overall':
      default:
        list.sort((a, b) => (b.allMedicinesAvailable ? 1 : 0) - (a.allMedicinesAvailable ? 1 : 0));
        break;
    }

    return list;
  }, [offers, selectedSort, filterCompleteOnly, filterUnder15Min, filterFourStar, filterFreeDelivery, route.params?.cartId, items]);

  const handleChoosePharmacy = (offer: PharmacyOffer) => {
    selectOffer(offer);

    if (!offer.allMedicinesAvailable) {
      // Partial fulfillment case
      setPartialOfferPending(offer);
    } else {
      // Direct checkout
      navigation.navigate('CheckoutReview');
    }
  };

  const handleConfirmPartial = () => {
    if (partialOfferPending) {
      setPartialOfferPending(null);
      navigation.navigate('CheckoutReview');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Cart')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <AppText variant="titleMedium" color={colors.textPrimary} weight="600">
            Compare Pharmacy Offers
          </AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            {offers.length} verified pharmacies responded
          </AppText>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('HelpArticle', { articleId: 'art-1' })}
          style={styles.helpBtn}
        >
          <Ionicons name="help-circle-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Countdown & Status Bar */}
        <View style={styles.topStatusRow}>
          <View style={styles.liveIndicator}>
            <View style={styles.greenPulseDot} />
            <AppText variant="caption" color="#15803D" weight="600">
              Live Bids Active
            </AppText>
          </View>

          <View style={[styles.timerPill, isOffersExpired && styles.timerPillExpired]}>
            <Ionicons name="time-outline" size={14} color={isOffersExpired ? '#DC2626' : COLORS.primary} />
            <AppText
              variant="caption"
              color={isOffersExpired ? '#DC2626' : COLORS.primary}
              weight="600"
              style={{ marginLeft: 4 }}
            >
              {isOffersExpired ? 'Offer Window Ended' : `Bids expire in ${formatTimeRemaining(timeRemainingSeconds)}`}
            </AppText>
          </View>
        </View>

        {/* Real-Time Offer Arrival Notification */}
        {newOfferBannerVisible && (
          <View style={[styles.newOfferToast, SHADOWS.subtle]}>
            <Ionicons name="flash" size={16} color="#15803D" />
            <AppText variant="caption" color="#15803D" weight="600" style={{ marginLeft: 6, flex: 1 }}>
              Apollo Pharmacy updated their delivery bid: 10-12 mins express!
            </AppText>
            <TouchableOpacity onPress={() => setNewOfferBannerVisible(false)}>
              <Ionicons name="close" size={16} color="#15803D" />
            </TouchableOpacity>
          </View>
        )}

        {/* Sorting Segment Controls */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortScrollContainer}
        >
          {[
            { id: 'best_overall', label: 'Best Overall', icon: 'sparkles' },
            { id: 'lowest_price', label: 'Cheapest Price', icon: 'pricetag-outline' },
            { id: 'fastest_delivery', label: 'Fastest ETA', icon: 'flash-outline' },
            { id: 'nearest', label: 'Nearest Store', icon: 'location-outline' },
            { id: 'highest_rated', label: 'Highest Rated', icon: 'star-outline' },
          ].map((s) => {
            const isSelected = selectedSort === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => setSelectedSort(s.id as SortOption)}
                style={[styles.sortPill, isSelected && styles.sortPillActive]}
              >
                <Ionicons
                  name={s.icon as any}
                  size={14}
                  color={isSelected ? '#FFFFFF' : COLORS.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <AppText
                  variant="caption"
                  color={isSelected ? '#FFFFFF' : COLORS.textPrimary}
                  weight="600"
                >
                  {s.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Quick Filter Chips */}
        <View style={styles.filterChipsRow}>
          <TouchableOpacity
            onPress={() => setFilterCompleteOnly(!filterCompleteOnly)}
            style={[styles.filterChip, filterCompleteOnly && styles.filterChipActive]}
          >
            <Ionicons
              name={filterCompleteOnly ? 'checkmark-circle' : 'add-circle-outline'}
              size={14}
              color={filterCompleteOnly ? '#15803D' : COLORS.textSecondary}
            />
            <AppText
              variant="caption"
              color={filterCompleteOnly ? '#15803D' : COLORS.textSecondary}
              weight="600"
              style={{ marginLeft: 4 }}
            >
              Complete Cart ({summary.itemCount}/{summary.itemCount})
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterUnder15Min(!filterUnder15Min)}
            style={[styles.filterChip, filterUnder15Min && styles.filterChipActive]}
          >
            <AppText
              variant="caption"
              color={filterUnder15Min ? '#15803D' : COLORS.textSecondary}
              weight="600"
            >
              âš¡ Under 15 mins
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterFreeDelivery(!filterFreeDelivery)}
            style={[styles.filterChip, filterFreeDelivery && styles.filterChipActive]}
          >
            <AppText
              variant="caption"
              color={filterFreeDelivery ? '#15803D' : COLORS.textSecondary}
              weight="600"
            >
              Free Delivery
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Offers List */}
        {processedOffers.length === 0 && (
          <View style={[styles.filterNoticeBanner, SHADOWS.subtle]}>
            <Ionicons name="information-circle" size={18} color={colors.primary} />
            <AppText variant="caption" color={colors.textPrimary} style={{ marginLeft: 6, flex: 1 }}>
              No bids matched all selected filters. Showing all {sourceList.length} available pharmacy bids below.
            </AppText>
            <TouchableOpacity
              onPress={() => {
                setSelectedSort('best_overall');
                setFilterCompleteOnly(false);
                setFilterUnder15Min(false);
                setFilterFourStar(false);
                setFilterFreeDelivery(false);
              }}
              style={styles.resetFiltersPill}
            >
              <AppText variant="caption" color={colors.primary} weight="600">
                Reset
              </AppText>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.offersContainer}>
          {(processedOffers.length > 0 ? processedOffers : sourceList).map((offer) => {
              const isSelected = selectedOffer?.id === offer.id;
              const totalItems = offer.itemPrices?.length || items.length || 4;
              const availableItems = offer.itemPrices?.filter((i) => i.isAvailable).length || totalItems;
              const isComplete = offer.allMedicinesAvailable;

              return (
                <View
                  key={offer.id}
                  style={[
                    styles.offerCard,
                    isSelected && styles.offerCardSelected,
                    SHADOWS.card,
                  ]}
                >
                  {/* Factual Tag Header */}
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.storeDetails}>
                      <View style={styles.storeNameRow}>
                        <AppText variant="titleSmall" color={colors.textPrimary} weight="600" numberOfLines={1}>
                          {offer.pharmacy.name}
                        </AppText>
                        {offer.pharmacy.isVerified && (
                          <Ionicons name="checkmark-circle" size={16} color="#15803D" style={{ marginLeft: 4 }} />
                        )}
                      </View>

                      <View style={styles.storeMetaRow}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <AppText variant="caption" color={colors.textPrimary} weight="600" style={{ marginLeft: 2 }}>
                          {offer.pharmacy.rating}
                        </AppText>
                        <AppText variant="caption" color={colors.textMuted}>
                          â€¢
                        </AppText>
                        <AppText variant="caption" color={colors.textSecondary}>
                          {offer.pharmacy.distanceKm} km away
                        </AppText>
                      </View>
                    </View>

                    {/* ETA Badge */}
                    <View style={styles.etaBadge}>
                      <Ionicons name="flash" size={12} color="#15803D" />
                      <AppText variant="caption" color="#15803D" weight="600" style={{ marginLeft: 3 }}>
                        {offer.estimatedDeliveryMinutes} mins
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  {/* Mid Row: Medicine Fulfillment & Pricing */}
                  <View style={styles.cardMidRow}>
                    {/* Fulfillment Status */}
                    <View>
                      <View style={[styles.fulfillmentTag, { backgroundColor: isComplete ? '#DCFCE7' : '#FEF3C7' }]}>
                        <Ionicons
                          name={isComplete ? 'checkmark-circle' : 'alert-circle'}
                          size={14}
                          color={isComplete ? '#15803D' : '#D97706'}
                        />
                        <AppText
                          variant="caption"
                          color={isComplete ? '#15803D' : '#D97706'}
                          weight="600"
                          style={{ marginLeft: 4, fontSize: 11 }}
                        >
                          {isComplete
                            ? `All ${totalItems} Medicines Available`
                            : `${availableItems} of ${totalItems} Available`}
                        </AppText>
                      </View>

                      <TouchableOpacity
                        onPress={() => setInspectingOffer(offer)}
                        style={styles.quoteDetailsLink}
                      >
                        <AppText variant="caption" color={colors.primary} weight="600">
                          View itemized quote &gt;
                        </AppText>
                      </TouchableOpacity>
                    </View>

                    {/* Price & Savings */}
                    <View style={styles.priceContainer}>
                      <AppText variant="h2" color={colors.textPrimary} weight="800" style={{ fontSize: 26 }}>
                        {formatCurrency(offer.finalPayableAmount)}
                      </AppText>
                      {offer.totalSavings > 0 && (
                        <View style={styles.savingsTag}>
                          <AppText variant="caption" color="#15803D" weight="600" style={{ fontSize: 10 }}>
                            Save {formatCurrency(offer.totalSavings)}
                          </AppText>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Bottom Action CTA */}
                  <AppButton
                    title="Choose Pharmacy"
                    variant="secondary"
                    size="md"
                    onPress={() => handleChoosePharmacy(offer)}
                    rightIcon={<Ionicons name="arrow-forward" size={16} color={colors.primary} />}
                    style={styles.choosePharmacyBtn}
                  />
                </View>
              );
            })}
          </View>
      </ScrollView>

      {/* Offer Details Itemized Modal */}
      <Modal visible={!!inspectingOffer} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.modal]}>
            <View style={styles.modalHeader}>
              <View>
                <AppText variant="titleMedium" color={colors.textPrimary} weight="600">
                  {inspectingOffer?.pharmacy.name}
                </AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {inspectingOffer?.pharmacy.address.line1} â€¢ DL: {inspectingOffer?.pharmacy.licenseNumber}
                </AppText>
              </View>
              <TouchableOpacity onPress={() => setInspectingOffer(null)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
              <AppText variant="caption" color={colors.textSecondary} weight="600" style={styles.modalSectionTitle}>
                DISPENSED MEDICINE QUOTES
              </AppText>

              {inspectingOffer?.itemPrices.map((item, i) => (
                <View key={i} style={styles.modalItemRow}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="bodySmall" color={colors.textPrimary} weight="600">
                      {item.medicineName}
                    </AppText>
                    <AppText variant="caption" color={colors.textMuted}>
                      Qty: {item.quantity} â€¢ Batch stock confirmed
                    </AppText>
                  </View>
                  <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
                    {formatCurrency(item.totalPrice)}
                  </AppText>
                </View>
              ))}

              <View style={styles.modalDivider} />

              <View style={styles.modalBillRow}>
                <AppText variant="caption" color={colors.textSecondary}>
                  Medicine Subtotal
                </AppText>
                <AppText variant="caption" color={colors.textPrimary} weight="600">
                  {formatCurrency(inspectingOffer?.medicineSubtotal || 0)}
                </AppText>
              </View>

              <View style={styles.modalBillRow}>
                <AppText variant="caption" color="#15803D">
                  Store Discount
                </AppText>
                <AppText variant="caption" color="#15803D" weight="600">
                  - {formatCurrency(inspectingOffer?.discountAmount || 0)}
                </AppText>
              </View>

              <View style={styles.modalBillRow}>
                <AppText variant="caption" color={colors.textSecondary}>
                  Express Delivery ({inspectingOffer?.estimatedDeliveryMinutes} min)
                </AppText>
                <AppText variant="caption" color={colors.textPrimary} weight="600">
                  {inspectingOffer?.deliveryFee === 0 ? 'FREE' : formatCurrency(inspectingOffer?.deliveryFee || 0)}
                </AppText>
              </View>

              <View style={[styles.modalBillRow, { marginTop: SPACING.xs }]}>
                <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
                  Final Payable Amount
                </AppText>
                <AppText variant="titleMedium" color={colors.primary} weight="600">
                  {formatCurrency(inspectingOffer?.finalPayableAmount || 0)}
                </AppText>
              </View>
            </ScrollView>

            <AppButton
              title="Choose This Pharmacy"
              variant="primary"
              size="lg"
              onPress={() => {
                const offer = inspectingOffer;
                setInspectingOffer(null);
                if (offer) handleChoosePharmacy(offer);
              }}
              style={{ marginTop: SPACING.lg }}
            />
          </View>
        </View>
      </Modal>

      {/* Partial Fulfillment Resolution Modal */}
      <Modal visible={!!partialOfferPending} transparent animationType="fade">
        <View style={styles.modalOverlayCenter}>
          <View style={[styles.partialModalCard, SHADOWS.modal]}>
            <View style={styles.partialIconCircle}>
              <Ionicons name="alert-circle" size={32} color="#D97706" />
            </View>
            <AppText variant="titleMedium" color={colors.textPrimary} weight="600" style={{ marginTop: SPACING.sm }}>
              Partial Cart Fulfillment
            </AppText>
            <AppText variant="bodySmall" color={colors.textSecondary} align="center" style={{ marginTop: SPACING.xs, lineHeight: 20 }}>
              {partialOfferPending?.pharmacy.name} has{' '}
              <AppText variant="bodySmall" weight="600" color="#15803D">
                {partialOfferPending?.itemPrices.filter((i) => i.isAvailable).length} of {items.length} medicines
              </AppText>{' '}
              in stock. 1 item is unavailable at this pharmacy.
            </AppText>

            <View style={styles.partialActionsCol}>
              <AppButton
                title="Continue with Available Items"
                variant="primary"
                size="md"
                onPress={handleConfirmPartial}
                style={{ width: '100%' }}
              />
              <AppButton
                title="Choose Another Pharmacy"
                variant="outline"
                size="md"
                onPress={() => setPartialOfferPending(null)}
                style={{ width: '100%', marginTop: SPACING.xs }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EE',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleCol: {
    flex: 1,
    alignItems: 'center',
  },
  helpBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 80,
  },
  topStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#15803D',
    marginRight: 6,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECE8F7',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  timerPillExpired: {
    backgroundColor: '#FEF2F2',
  },
  newOfferToast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  sortScrollContainer: {
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  sortPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  filterChipActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#15803D',
  },
  offersContainer: {
    gap: SPACING.md,
  },
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: '#E8E8EE',
  },
  offerCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FAF9FF',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  storeDetails: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E8E8EE',
    marginVertical: SPACING.md,
  },
  cardMidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  fulfillmentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  quoteDetailsLink: {
    marginTop: 4,
    paddingVertical: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  savingsTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  choosePharmacyBtn: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EE',
  },
  modalSectionTitle: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginVertical: SPACING.sm,
  },
  modalItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#E8E8EE',
    marginVertical: SPACING.sm,
  },
  modalBillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  partialModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  partialIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partialActionsCol: {
    width: '100%',
    marginTop: SPACING.lg,
    gap: SPACING.xs,
  },
  filterNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECE8F7',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#DCD5F0',
  },
  resetFiltersPill: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.full,
    marginLeft: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
});


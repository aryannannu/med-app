import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { RxBadge } from '../../components/badges/RxBadge';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../store/CartContext';
import { useAddress } from '../../store/AddressContext';
import { usePrescription } from '../../store/PrescriptionContext';
import { useOffers } from '../../store/OfferContext';
import { useOrders } from '../../store/OrderContext';
import { useWallet } from '../../store/WalletContext';
import { useToast } from '../../store/ToastContext';
import { useAppTheme } from '../../store/ThemeContext';
import { formatCurrency } from '../../utils/currency';
import { formatPhoneNumber } from '../../utils/formatters';
import { PharmacyOffer } from '../../types/offer';
import { haptics } from '../../services/hapticService';

type PaymentMode = 'upi' | 'card' | 'cod';

export const CheckoutReviewScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { items, summary, clearCart } = useCart();
  const { selectedAddress } = useAddress();
  const { activePrescription, prescriptions, selectActivePrescription } = usePrescription();
  const { selectedOffer } = useOffers();
  const { createOrder } = useOrders();
  const { balance: walletBalance, deductMoney } = useWallet();
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();

  const [deliveryInstructions, setDeliveryInstructions] = useState('Please ring bell & leave at door');
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<PaymentMode>('upi');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Selected Pharmacy details from chosen offer
  const pharmacy = selectedOffer?.pharmacy;
  const storeName = pharmacy?.name || items[0]?.sourcePharmacyName || 'Apollo Pharmacy 24x7';
  const deliveryEta = selectedOffer?.estimatedDeliveryMinutes || 12;

  // Financial calculations
  const baseOrderTotal = selectedOffer ? selectedOffer.finalPayableAmount : summary.estimatedFinalTotal;
  const walletDeduction = useWalletBalance ? Math.min(walletBalance, baseOrderTotal) : 0;
  const finalPayableAmount = Math.max(0, baseOrderTotal - walletDeduction);

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return; // Double-tap protection

    if (!selectedAddress) {
      haptics.warning();
      showToast('Please select a delivery address', 'warning');
      navigation.navigate('AddressSelection', { isSelectingForCheckout: true });
      return;
    }

    if (summary.hasRxItems && !activePrescription) {
      if (prescriptions.length > 0) {
        selectActivePrescription(prescriptions[0]);
      } else {
        haptics.warning();
        showToast('Please upload prescription for Rx medicines', 'warning');
        navigation.navigate('UploadPrescription', { fromCart: true });
        return;
      }
    }

    haptics.medium();
    setIsPlacingOrder(true);

    try {
      // Create fallback offer if checking out from store mode directly
      const offerToUse: PharmacyOffer = selectedOffer || {
        id: `off-direct-${Date.now()}`,
        cartId: 'direct-cart',
        pharmacyId: items[0]?.sourcePharmacyId || 'pharm-1',
        pharmacy: {
          id: items[0]?.sourcePharmacyId || 'pharm-1',
          name: storeName,
          logo: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=160&auto=format&fit=crop&q=80',
          rating: 4.8,
          reviewCount: 342,
          distanceKm: 1.2,
          address: {
            line1: 'SCF 14, Main Market',
            line2: 'Sector 22',
            city: 'Chandigarh',
            pincode: '160022',
          },
          isVerified: true,
          licenseNumber: 'DL-CH-2024-48192',
          estimatedDeliveryTimeMinutes: 12,
          openingTime: '00:00',
          closingTime: '23:59',
          isOpenNow: true,
          phone: '+91 98140 12345',
          deliveryFee: 0,
        },
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000,
        isExpired: false,
        tags: ['recommended'],
        medicineSubtotal: summary.itemTotal,
        mrpTotal: summary.mrpTotal,
        discountAmount: summary.savingsTotal,
        deliveryFee: summary.estimatedDeliveryFee,
        taxesAndFees: summary.taxesAndHandling,
        finalPayableAmount: summary.estimatedFinalTotal,
        totalSavings: summary.savingsTotal,
        estimatedDeliveryMinutes: 12,
        estimatedDeliveryTimeText: '10â€“15 mins',
        fulfillmentScore: 100,
        allMedicinesAvailable: true,
        itemPrices: items.map((it) => ({
          medicineId: it.medicineId,
          medicineName: it.medicine.name,
          quantity: it.quantity,
          unitPrice: it.selectedVariant?.discountPrice ?? it.medicine.discountPrice,
          totalPrice: (it.selectedVariant?.discountPrice ?? it.medicine.discountPrice) * it.quantity,
          isAvailable: true,
        })),
      };

      const order = await createOrder(
        offerToUse,
        selectedAddress,
        activePrescription || undefined,
        deliveryInstructions
      );

      // Deduct from wallet if applied
      if (walletDeduction > 0) {
        await deductMoney(walletDeduction, order.id);
      }

      clearCart();
      showToast('Order placed successfully!', 'success');

      // Navigate to Order Confirmation screen
      navigation.navigate('OrderConfirmation', { order });
    } catch (e) {
      showToast('Failed to place order. Please try again.', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="titleMedium" color={colors.textPrimary} weight="600">
          Order Review &amp; Payment
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step Progress Tracker */}
        <View style={styles.stepProgressRow}>
          <View style={styles.stepDoneCol}>
            <Ionicons name="checkmark-circle" size={16} color="#15803D" />
            <AppText variant="caption" color="#15803D" weight="600" style={{ fontSize: 10 }}>
              1. Cart
            </AppText>
          </View>
          <View style={[styles.stepLine, { backgroundColor: '#15803D' }]} />
          <View style={styles.stepDoneCol}>
            <Ionicons name="checkmark-circle" size={16} color="#15803D" />
            <AppText variant="caption" color="#15803D" weight="600" style={{ fontSize: 10 }}>
              2. Vendor Offer
            </AppText>
          </View>
          <View style={[styles.stepLine, { backgroundColor: COLORS.primary }]} />
          <View style={styles.stepDoneCol}>
            <View style={styles.activeStepCircle}>
              <AppText variant="caption" color="#FFFFFF" weight="600" style={{ fontSize: 10 }}>
                3
              </AppText>
            </View>
            <AppText variant="caption" color={colors.primary} weight="600" style={{ fontSize: 10 }}>
              Checkout
            </AppText>
          </View>
        </View>

        {/* Section 1: Delivery Address */}
        <View style={[styles.sectionCard, SHADOWS.subtle]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="location" size={18} color={colors.primary} />
              <AppText variant="titleSmall" color={colors.textPrimary} weight="600" style={{ marginLeft: 6 }}>
                Delivery Address
              </AppText>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddressSelection', { isSelectingForCheckout: true })}
            >
              <AppText variant="caption" color={colors.primary} weight="600">
                Change
              </AppText>
            </TouchableOpacity>
          </View>

          {selectedAddress ? (
            <View style={styles.addressBox}>
              <View style={styles.addressLabelPill}>
                <AppText variant="caption" color={colors.primary} weight="600" style={{ fontSize: 10 }}>
                  {selectedAddress.label.toUpperCase()}
                </AppText>
              </View>
              <AppText variant="bodySmall" color={colors.textPrimary} weight="600" style={{ marginTop: 2 }}>
                {selectedAddress.recipientName} â€¢ {formatPhoneNumber(selectedAddress.phone)}
              </AppText>
              <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                {selectedAddress.houseFlatNumber}, {selectedAddress.streetAddress}, {selectedAddress.city} - {selectedAddress.pincode}
              </AppText>
            </View>
          ) : (
            <AppButton
              title="Add Delivery Address"
              variant="outline"
              size="sm"
              onPress={() => navigation.navigate('AddEditAddress', {})}
              style={{ marginTop: SPACING.sm }}
            />
          )}
        </View>

        {/* Section 2: Selected Dispensing Pharmacy */}
        <View style={[styles.sectionCard, SHADOWS.subtle]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="storefront" size={18} color="#15803D" />
              <AppText variant="titleSmall" color={colors.textPrimary} weight="600" style={{ marginLeft: 6 }}>
                Dispensing Pharmacy
              </AppText>
            </View>
            {selectedOffer && (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <AppText variant="caption" color={colors.primary} weight="600">
                  Change
                </AppText>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.pharmacySummaryRow}>
            <View style={styles.pharmacyIconBox}>
              <Ionicons name="medical" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <AppText variant="bodyMedium" color={colors.textPrimary} weight="600">
                  {storeName}
                </AppText>
                <Ionicons name="checkmark-circle" size={14} color="#15803D" style={{ marginLeft: 4 }} />
              </View>
              <AppText variant="caption" color={colors.textSecondary}>
                Express delivery in {deliveryEta} mins â€¢ Licensed Retailer
              </AppText>
            </View>
          </View>
        </View>

        {/* Section 3: Medicine Requirement Summary */}
        <View style={[styles.sectionCard, SHADOWS.subtle]}>
          <AppText variant="titleSmall" color={colors.textPrimary} weight="600" style={{ marginBottom: SPACING.sm }}>
            Medicines in Order ({summary.totalQuantity} items)
          </AppText>

          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Image source={{ uri: item.medicine.image }} style={styles.itemThumb} resizeMode="cover" />
              <View style={styles.itemDetails}>
                <AppText variant="bodySmall" color={colors.textPrimary} weight="600" numberOfLines={1}>
                  {item.medicine.name}
                </AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  Qty: {item.quantity} â€¢ {item.medicine.packForm}
                </AppText>
                {item.rxRequired && <RxBadge style={{ marginTop: 2 }} />}
              </View>
              <AppText variant="bodySmall" color={colors.textPrimary} weight="600">
                {formatCurrency((item.selectedVariant?.discountPrice ?? item.medicine.discountPrice) * item.quantity)}
              </AppText>
            </View>
          ))}
        </View>

        {/* Section 4: Attached Prescription */}
        {summary.hasRxItems && (
          <View style={[styles.sectionCard, SHADOWS.subtle]}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="document-text" size={18} color={colors.primary} />
                <AppText variant="titleSmall" color={colors.textPrimary} weight="600" style={{ marginLeft: 6 }}>
                  Attached Prescription
                </AppText>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('UploadPrescription', { fromCart: true })}>
                <AppText variant="caption" color={colors.primary} weight="600">
                  {activePrescription ? 'Change' : 'Upload'}
                </AppText>
              </TouchableOpacity>
            </View>

            {activePrescription ? (
              <View style={styles.rxAttachedBox}>
                <Ionicons name="checkmark-circle" size={18} color="#15803D" />
                <AppText variant="caption" color="#15803D" weight="600" style={{ marginLeft: 6, flex: 1 }}>
                  {activePrescription.fileName} (Verified)
                </AppText>
              </View>
            ) : (
              <View style={styles.rxMissingBox}>
                <Ionicons name="alert-circle" size={18} color="#DC2626" />
                <AppText variant="caption" color="#DC2626" weight="600" style={{ marginLeft: 6, flex: 1 }}>
                  Prescription required for Rx medicines.
                </AppText>
              </View>
            )}
          </View>
        )}

        {/* Section 5: HEALIT Wallet Balance Application */}
        <View style={[styles.sectionCard, SHADOWS.subtle]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setUseWalletBalance(!useWalletBalance)}
            style={styles.walletToggleRow}
          >
            <View style={styles.walletLeftCol}>
              <View style={styles.walletIconCircle}>
                <Ionicons name="wallet" size={18} color={colors.primary} />
              </View>
              <View style={{ marginLeft: SPACING.sm }}>
                <AppText variant="bodySmall" color={colors.textPrimary} weight="600">
                  HEALIT Wallet
                </AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {formatCurrency(walletBalance)} available
                </AppText>
              </View>
            </View>

            <Ionicons
              name={useWalletBalance ? 'checkbox' : 'square-outline'}
              size={22}
              color={useWalletBalance ? COLORS.primary : COLORS.textMuted}
            />
          </TouchableOpacity>

          {useWalletBalance && (
            <View style={styles.walletAppliedAlert}>
              <Ionicons name="checkmark-circle" size={14} color="#15803D" />
              <AppText variant="caption" color="#15803D" weight="600" style={{ marginLeft: 4 }}>
                {formatCurrency(walletDeduction)} applied from wallet
              </AppText>
            </View>
          )}
        </View>

        {/* Section 6: Payment Method Picker */}
        {finalPayableAmount > 0 && (
          <View style={[styles.sectionCard, SHADOWS.subtle]}>
            <AppText variant="titleSmall" color={colors.textPrimary} weight="600" style={{ marginBottom: SPACING.sm }}>
              Select Payment Method
            </AppText>

            {[
              { id: 'upi', label: 'UPI (Google Pay / PhonePe / Paytm / BHIM)', icon: 'flash-outline' },
              { id: 'card', label: 'Credit / Debit Card', icon: 'card-outline' },
              { id: 'cod', label: 'Cash on Delivery (Pay at Doorstep)', icon: 'cash-outline' },
            ].map((method) => {
              const isSelected = selectedPaymentMode === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  onPress={() => setSelectedPaymentMode(method.id as PaymentMode)}
                  style={[styles.paymentMethodRow, isSelected && styles.paymentMethodSelected]}
                >
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={isSelected ? COLORS.primary : COLORS.textMuted}
                  />
                  <AppText
                    variant="bodySmall"
                    color={colors.textPrimary}
                    weight={isSelected ? '600' : '400'}
                    style={{ marginLeft: SPACING.sm, flex: 1 }}
                  >
                    {method.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Delivery Instructions Input */}
        <View style={[styles.sectionCard, SHADOWS.subtle]}>
          <AppText variant="titleSmall" color={colors.textPrimary} weight="600" style={{ marginBottom: SPACING.xs }}>
            Delivery Instructions
          </AppText>
          <AppInput
            placeholder="e.g. Call upon arrival, leave at doorstep"
            value={deliveryInstructions}
            onChangeText={setDeliveryInstructions}
            containerStyle={{ marginBottom: 0 }}
          />
        </View>

        {/* Section 7: Final Bill Summary */}
        <View style={[styles.sectionCard, SHADOWS.subtle]}>
          <AppText variant="titleSmall" color={colors.textPrimary} weight="600" style={{ marginBottom: SPACING.sm }}>
            Payment Summary
          </AppText>

          <View style={styles.billRow}>
            <AppText variant="caption" color={colors.textSecondary}>
              Medicine Subtotal
            </AppText>
            <AppText variant="caption" color={colors.textPrimary} weight="600">
              {formatCurrency(selectedOffer ? selectedOffer.medicineSubtotal : summary.itemTotal)}
            </AppText>
          </View>

          <View style={styles.billRow}>
            <AppText variant="caption" color="#15803D">
              Store &amp; Bid Discount
            </AppText>
            <AppText variant="caption" color="#15803D" weight="600">
              - {formatCurrency(selectedOffer ? selectedOffer.discountAmount : summary.savingsTotal)}
            </AppText>
          </View>

          <View style={styles.billRow}>
            <AppText variant="caption" color={colors.textSecondary}>
              Express Delivery Fee ({deliveryEta} mins)
            </AppText>
            <AppText variant="caption" color={colors.textPrimary} weight="600">
              {(selectedOffer?.deliveryFee ?? summary.estimatedDeliveryFee) === 0
                ? 'FREE'
                : formatCurrency(selectedOffer?.deliveryFee ?? summary.estimatedDeliveryFee)}
            </AppText>
          </View>

          {useWalletBalance && walletDeduction > 0 && (
            <View style={styles.billRow}>
              <AppText variant="caption" color={colors.primary} weight="600">
                HEALIT Wallet Applied
              </AppText>
              <AppText variant="caption" color={colors.primary} weight="600">
                - {formatCurrency(walletDeduction)}
              </AppText>
            </View>
          )}

          <View style={styles.billDivider} />

          <View style={styles.billRow}>
            <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
              Final Amount Payable
            </AppText>
            <AppText variant="titleLarge" color={colors.primary} weight="600">
              {formatCurrency(finalPayableAmount)}
            </AppText>
          </View>
        </View>
      </ScrollView>

      {/* Primary Sticky Bottom CTA */}
      <View style={[styles.bottomBar, SHADOWS.modal]}>
        <View style={styles.bottomTotalCol}>
          <AppText variant="caption" color={colors.textMuted}>
            Final Payable
          </AppText>
          <AppText variant="titleLarge" color={colors.primary} weight="600">
            {formatCurrency(finalPayableAmount)}
          </AppText>
        </View>

        <View style={styles.bottomBtnCol}>
          <AppButton
            title={
              isPlacingOrder
                ? 'Processing...'
                : finalPayableAmount === 0
                ? 'Place Order (Wallet)'
                : `Pay ${formatCurrency(finalPayableAmount)} & Place Order`
            }
            variant="primary"
            size="lg"
            disabled={isPlacingOrder}
            onPress={handlePlaceOrder}
            rightIcon={
              isPlacingOrder ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
              )
            }
          />
        </View>
      </View>
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
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 110,
  },
  stepProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  stepDoneCol: {
    alignItems: 'center',
    gap: 2,
  },
  activeStepCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    height: 2,
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressBox: {
    marginTop: 2,
  },
  addressLabelPill: {
    backgroundColor: '#ECE8F7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  pharmacySummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  pharmacyIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECE8F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: '#F8F8FC',
  },
  itemThumb: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#F8F8FC',
  },
  itemDetails: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  rxAttachedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  rxMissingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  walletToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ECE8F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletAppliedAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 4,
  },
  paymentMethodSelected: {
    backgroundColor: '#ECE8F7',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  billDivider: {
    height: 1,
    backgroundColor: '#E8E8EE',
    marginVertical: SPACING.xs,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E8E8EE',
  },
  bottomTotalCol: {
    flex: 1,
  },
  bottomBtnCol: {
    flex: 1.5,
  },
});


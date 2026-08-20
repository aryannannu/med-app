import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { QuantitySelector } from '../../components/controls/QuantitySelector';
import { PriceDisplay } from '../../components/controls/PriceDisplay';
import { RxBadge } from '../../components/badges/RxBadge';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../store/CartContext';
import { usePrescription } from '../../store/PrescriptionContext';
import { useToast } from '../../store/ToastContext';
import { formatCurrency } from '../../utils/currency';

export const CartScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { cartId, items, summary, updateQuantity, removeFromCart, clearCart } = useCart();
  const { activePrescription } = usePrescription();
  const { showToast } = useToast();

  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  // Check if cart was created inside a specific store
  const isStoreSpecificCart = items.length > 0 && items.every((i) => i.sourcePharmacyId);
  const storeName = isStoreSpecificCart ? items[0]?.sourcePharmacyName || 'Local Pharmacy' : null;

  // Check if any item is out of stock / unavailable
  const unavailableItems = items.filter((i) => i.medicine?.inStock === false);

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600">
            Medicine Cart
          </AppText>
          <View style={{ width: 40 }} />
        </View>

        <EmptyState
          icon="cart-outline"
          title="Your Cart is Empty"
          message="Search medicines or upload your doctor's prescription to receive competitive pharmacy bids."
          actionText="Browse Medicines"
          onActionPress={() => navigation.navigate('Search')}
        />
      </SafeAreaView>
    );
  }

  const handleProceed = () => {
    if (unavailableItems.length > 0) {
      showToast('Please remove unavailable items before continuing', 'warning');
      return;
    }

    if (summary.hasRxItems && !activePrescription) {
      showToast('Please attach a prescription for your Rx medicines', 'warning');
      navigation.navigate('UploadPrescription', { fromCart: true });
      return;
    }

    if (isStoreSpecificCart) {
      // Mode 2: Direct Store Checkout
      navigation.navigate('CheckoutReview');
    } else {
      // Mode 1: Marketplace Bidding
      navigation.navigate('FindingPharmacies', { cartId });
    }
  };

  const handleRemoveUnavailable = () => {
    unavailableItems.forEach((it) => removeFromCart(it.id));
    showToast('Removed unavailable items from cart', 'info');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600">
            {isStoreSpecificCart ? `Cart • ${storeName}` : 'Medicine Cart'}
          </AppText>
          <AppText variant="caption" color={COLORS.textSecondary}>
            {summary.itemCount} {summary.itemCount === 1 ? 'medicine' : 'medicines'} ({summary.totalQuantity} items)
          </AppText>
        </View>

        <TouchableOpacity onPress={() => clearCart()} style={styles.clearBtn}>
          <AppText variant="caption" color={COLORS.danger} weight="600">
            Clear All
          </AppText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Universal Marketplace Cart Banner vs Store Cart */}
        {!isStoreSpecificCart ? (
          <View style={[styles.marketplaceBanner, SHADOWS.subtle]}>
            <View style={styles.bannerIconCircle}>
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <AppText variant="titleSmall" color={COLORS.primary} weight="600">
                Universal Medicine Request
              </AppText>
              <AppText variant="caption" color={COLORS.textSecondary} style={{ marginTop: 2, lineHeight: 18 }}>
                You don't need to pick a pharmacy now. After you tap below, eligible local pharmacies will send you competing prices &amp; express delivery bids.
              </AppText>
            </View>
          </View>
        ) : (
          <View style={[styles.storeBanner, SHADOWS.subtle]}>
            <Ionicons name="storefront" size={18} color="#15803D" />
            <AppText variant="caption" color="#15803D" weight="600" style={{ marginLeft: 6, flex: 1 }}>
              Direct ordering from {storeName}. Your order will be fulfilled exclusively by this pharmacy.
            </AppText>
          </View>
        )}

        {/* Unavailable items alert banner if applicable */}
        {unavailableItems.length > 0 && (
          <View style={[styles.unavailableBanner, SHADOWS.subtle]}>
            <View style={styles.unavailableTopRow}>
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                <AppText variant="titleSmall" color="#DC2626" weight="600">
                  {unavailableItems.length} Item{unavailableItems.length > 1 ? 's' : ''} Currently Unavailable
                </AppText>
                <AppText variant="caption" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
                  Some items are out of stock at nearby pharmacies. Please remove them to proceed.
                </AppText>
              </View>
            </View>
            <TouchableOpacity onPress={handleRemoveUnavailable} style={styles.removeUnavailableBtn}>
              <AppText variant="caption" color="#DC2626" weight="600">
                Remove Unavailable Items
              </AppText>
            </TouchableOpacity>
          </View>
        )}

        {/* Prescription Requirement Banner */}
        {summary.hasRxItems && (
          <View style={[styles.rxAlertCard, !activePrescription ? styles.rxAlertWarning : styles.rxAlertSuccess, SHADOWS.subtle]}>
            <Ionicons
              name={activePrescription ? 'checkmark-circle' : 'document-text'}
              size={24}
              color={activePrescription ? '#15803D' : '#DC2626'}
            />
            <View style={styles.rxAlertContent}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                {activePrescription ? 'Prescription Attached' : 'Prescription Required for Rx Medicines'}
              </AppText>
              <AppText variant="caption" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
                {activePrescription
                  ? `Attached: ${activePrescription.fileName}`
                  : 'Your doctor prescription is needed before dispatch.'}
              </AppText>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('UploadPrescription', { fromCart: true })}
              style={styles.rxActionBtn}
            >
              <AppText variant="buttonSmall" color={COLORS.primary} weight="600">
                {activePrescription ? 'Change' : 'Upload'}
              </AppText>
            </TouchableOpacity>
          </View>
        )}

        {/* Free Delivery Progress Bar */}
        <View style={[styles.freeDeliveryBox, SHADOWS.subtle]}>
          <View style={styles.freeDeliveryHeader}>
            <Ionicons
              name="bicycle"
              size={18}
              color={summary.isEligibleForFreeDelivery ? '#15803D' : COLORS.primary}
            />
            <AppText
              variant="bodySmall"
              color={COLORS.textPrimary}
              weight="600"
              style={{ marginLeft: 6, flex: 1 }}
            >
              {summary.isEligibleForFreeDelivery
                ? 'Yay! You unlocked FREE express delivery'
                : `Add ${formatCurrency(summary.amountNeededForFreeDelivery)} more for free delivery`}
            </AppText>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(100, (summary.itemTotal / summary.freeDeliveryThreshold) * 100)}%`,
                  backgroundColor: summary.isEligibleForFreeDelivery ? '#15803D' : COLORS.primary,
                },
              ]}
            />
          </View>
        </View>

        {/* Medicine Cart Items List */}
        <View style={styles.itemsContainer}>
          <View style={styles.itemsHeaderRow}>
            <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600">
              Medicines ({summary.itemCount})
            </AppText>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <AppText variant="caption" color={COLORS.primary} weight="600">
                + Add More
              </AppText>
            </TouchableOpacity>
          </View>

          {items.map((item) => (
            <View key={item.id} style={[styles.itemCard, SHADOWS.subtle]}>
              <Image source={{ uri: item.medicine.image }} style={styles.itemImage} resizeMode="cover" />

              <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                  <View style={{ flex: 1, marginRight: SPACING.sm }}>
                    <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600" numberOfLines={1}>
                      {item.medicine.name}
                    </AppText>
                    <AppText variant="caption" color={COLORS.textSecondary} numberOfLines={1} style={{ marginTop: 1 }}>
                      {item.medicine.saltComposition}
                    </AppText>
                  </View>

                  <TouchableOpacity
                    onPress={() => setItemToRemove(item.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.deleteIconBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>

                {item.rxRequired && <RxBadge style={{ marginTop: 3 }} />}

                <View style={styles.itemBottomRow}>
                  <PriceDisplay
                    price={item.selectedVariant?.discountPrice ?? item.medicine.discountPrice}
                    mrp={item.selectedVariant?.mrp ?? item.medicine.mrp}
                    size="sm"
                  />

                  <QuantitySelector
                    quantity={item.quantity}
                    onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                    onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                    size="sm"
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Bill Estimate Summary */}
        <View style={[styles.billCard, SHADOWS.subtle]}>
          <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600" style={{ marginBottom: SPACING.md }}>
            Price &amp; Bill Estimate
          </AppText>

          <View style={styles.billRow}>
            <AppText variant="bodySmall" color={COLORS.textSecondary}>
              Item Total (MRP)
            </AppText>
            <AppText variant="bodySmall" color={COLORS.textPrimary}>
              {formatCurrency(summary.mrpTotal)}
            </AppText>
          </View>

          <View style={styles.billRow}>
            <AppText variant="bodySmall" color="#15803D" weight="600">
              Estimated Marketplace Savings
            </AppText>
            <AppText variant="bodySmall" color="#15803D" weight="600">
              - {formatCurrency(summary.savingsTotal)}
            </AppText>
          </View>

          <View style={styles.billRow}>
            <AppText variant="bodySmall" color={COLORS.textSecondary}>
              Delivery Partner Fee
            </AppText>
            <AppText
              variant="bodySmall"
              color={summary.estimatedDeliveryFee === 0 ? '#15803D' : COLORS.textPrimary}
              weight="600"
            >
              {summary.estimatedDeliveryFee === 0 ? 'FREE' : formatCurrency(summary.estimatedDeliveryFee)}
            </AppText>
          </View>

          <View style={styles.billRow}>
            <AppText variant="bodySmall" color={COLORS.textSecondary}>
              Pharmacy Handling &amp; GST
            </AppText>
            <AppText variant="bodySmall" color={COLORS.textPrimary}>
              {formatCurrency(summary.taxesAndHandling)}
            </AppText>
          </View>

          <View style={styles.billDivider} />

          <View style={styles.billRow}>
            <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600">
              Estimated Total
            </AppText>
            <AppText variant="titleLarge" color={COLORS.primary} weight="600">
              {formatCurrency(summary.estimatedFinalTotal)}
            </AppText>
          </View>

          <View style={styles.estimateNoticeBox}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
            <AppText variant="caption" color={COLORS.textSecondary} style={{ marginLeft: 6, flex: 1, fontSize: 11 }}>
              {isStoreSpecificCart
                ? 'Final order bill from this store.'
                : 'Final price will be determined when nearby pharmacies submit competitive bids.'}
            </AppText>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action */}
      <View style={[styles.bottomBar, SHADOWS.modal]}>
        <View style={styles.bottomTotalCol}>
          <AppText variant="caption" color={COLORS.textMuted}>
            Cart Total ({summary.totalQuantity} items)
          </AppText>
          <AppText variant="titleLarge" color={COLORS.primary} weight="600">
            {formatCurrency(summary.estimatedFinalTotal)}
          </AppText>
        </View>

        <View style={styles.bottomBtnCol}>
          <AppButton
            title={isStoreSpecificCart ? 'Continue to Checkout' : 'Find Best Offers'}
            variant="primary"
            size="lg"
            onPress={handleProceed}
            rightIcon={
              <Ionicons
                name={isStoreSpecificCart ? 'arrow-forward' : 'sparkles'}
                size={18}
                color="#FFFFFF"
              />
            }
          />
        </View>
      </View>

      {/* Remove Confirmation Modal */}
      <ConfirmationModal
        visible={!!itemToRemove}
        title="Remove Medicine?"
        message="Are you sure you want to remove this medicine from your cart?"
        confirmText="Remove"
        cancelText="Cancel"
        isDestructive
        icon="trash-outline"
        onConfirm={() => {
          if (itemToRemove) {
            removeFromCart(itemToRemove);
            setItemToRemove(null);
            showToast('Item removed from cart', 'info');
          }
        }}
        onCancel={() => setItemToRemove(null)}
      />
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleCol: {
    flex: 1,
    alignItems: 'center',
  },
  clearBtn: {
    padding: SPACING.xs,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 110,
  },
  marketplaceBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECE8F7',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#DCD5F0',
  },
  bannerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  storeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  unavailableBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  unavailableTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  removeUnavailableBtn: {
    marginTop: SPACING.sm,
    paddingVertical: 4,
    alignSelf: 'flex-end',
  },
  rxAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
  },
  rxAlertWarning: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  rxAlertSuccess: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  rxAlertContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  rxActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  freeDeliveryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.lg,
  },
  freeDeliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F8F8FC',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  itemsContainer: {
    marginBottom: SPACING.lg,
  },
  itemsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.sm,
  },
  itemImage: {
    width: 68,
    height: 68,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#F8F8FC',
  },
  itemInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  deleteIconBtn: {
    padding: 2,
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.lg,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  billDivider: {
    height: 1,
    backgroundColor: '#E8E8EE',
    marginVertical: SPACING.sm,
  },
  estimateNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9FF',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.xs,
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
    flex: 1.4,
  },
});

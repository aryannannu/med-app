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
  const { items, summary, updateQuantity, removeFromCart, clearCart } = useCart();
  const { activePrescription } = usePrescription();
  const { showToast } = useToast();

  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <AppText variant="titleMedium" color={COLORS.textPrimary} weight="700">
            Medicine Cart
          </AppText>
          <View style={{ width: 40 }} />
        </View>

        <EmptyState
          icon="cart-outline"
          title="Your Cart is Empty"
          message="Search and add medicines or upload your doctor's prescription to receive competitive pharmacy offers."
          actionText="Browse Medicines"
          onActionPress={() => navigation.navigate('Search')}
        />
      </SafeAreaView>
    );
  }

  const handleCheckout = () => {
    if (summary.hasRxItems && !activePrescription) {
      showToast('Please attach a prescription for your Rx medicines', 'warning');
      navigation.navigate('UploadPrescription', { fromCart: true });
    } else {
      navigation.navigate('CheckoutReview');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <AppText variant="titleMedium" color={COLORS.textPrimary} weight="700">
          Medicine Requirement ({summary.itemCount})
        </AppText>
        <TouchableOpacity onPress={() => clearCart()} style={styles.clearBtn}>
          <AppText variant="caption" color={COLORS.danger} weight="700">
            Clear All
          </AppText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Marketplace Notice Banner */}
        <View style={styles.marketplaceBanner}>
          <Ionicons name="sparkles" size={18} color={COLORS.primary} style={{ marginRight: 8, marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <AppText variant="titleSmall" color={COLORS.primaryDark} weight="700">
              Universal Medicine Cart
            </AppText>
            <AppText variant="caption" color={COLORS.textSecondary}>
              You don't need to choose a specific pharmacy now. After you submit, verified local pharmacies will send competing price & ETA offers.
            </AppText>
          </View>
        </View>

        {/* Prescription Requirement Banner if applicable */}
        {summary.hasRxItems && (
          <View style={[styles.rxAlertCard, !activePrescription ? styles.rxAlertWarning : styles.rxAlertSuccess]}>
            <Ionicons
              name={activePrescription ? 'checkmark-circle' : 'alert-circle'}
              size={24}
              color={activePrescription ? COLORS.success : COLORS.rxRed}
            />
            <View style={styles.rxAlertContent}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700">
                {activePrescription ? 'Prescription Attached' : 'Prescription Required for 1+ Items'}
              </AppText>
              <AppText variant="caption" color={COLORS.textSecondary}>
                {activePrescription
                  ? `Attached: ${activePrescription.fileName}`
                  : 'Please upload a prescription before checkout.'}
              </AppText>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('UploadPrescription', { fromCart: true })}
              style={styles.rxActionBtn}
            >
              <AppText variant="buttonSmall" color={COLORS.primary} weight="700">
                {activePrescription ? 'Change' : 'Upload'}
              </AppText>
            </TouchableOpacity>
          </View>
        )}

        {/* Free Delivery Progress */}
        <View style={styles.freeDeliveryBox}>
          <View style={styles.freeDeliveryHeader}>
            <Ionicons
              name="bicycle"
              size={18}
              color={summary.isEligibleForFreeDelivery ? COLORS.success : COLORS.primary}
            />
            <AppText
              variant="bodySmall"
              color={COLORS.textPrimary}
              weight="600"
              style={{ marginLeft: 6, flex: 1 }}
            >
              {summary.isEligibleForFreeDelivery
                ? 'Yay! You are eligible for FREE delivery offers'
                : `Add ${formatCurrency(summary.amountNeededForFreeDelivery)} more for free delivery`}
            </AppText>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(100, (summary.itemTotal / summary.freeDeliveryThreshold) * 100)}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Medicine Cart Items List */}
        <View style={styles.itemsContainer}>
          <AppText variant="titleMedium" color={COLORS.textPrimary} weight="700" style={{ marginBottom: SPACING.md }}>
            Medicines ({summary.itemCount})
          </AppText>

          {items.map((item) => (
            <View key={item.id} style={[styles.itemCard, SHADOWS.subtle]}>
              <Image source={{ uri: item.medicine.image }} style={styles.itemImage} resizeMode="cover" />

              <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                  <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700" numberOfLines={1} style={{ flex: 1 }}>
                    {item.medicine.name}
                  </AppText>
                  <TouchableOpacity
                    onPress={() => setItemToRemove(item.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>

                <AppText variant="caption" color={COLORS.textSecondary} numberOfLines={1}>
                  {item.medicine.saltComposition}
                </AppText>

                {item.rxRequired && <RxBadge style={{ marginTop: 4 }} />}

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

        {/* Bill Summary */}
        <View style={[styles.billCard, SHADOWS.subtle]}>
          <AppText variant="titleMedium" color={COLORS.textPrimary} weight="700" style={{ marginBottom: SPACING.md }}>
            Order Estimate
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
            <AppText variant="bodySmall" color={COLORS.secondaryDark} weight="600">
              Total Discount Savings
            </AppText>
            <AppText variant="bodySmall" color={COLORS.secondaryDark} weight="700">
              - {formatCurrency(summary.savingsTotal)}
            </AppText>
          </View>

          <View style={styles.billRow}>
            <AppText variant="bodySmall" color={COLORS.textSecondary}>
              Est. Delivery Fee
            </AppText>
            <AppText
              variant="bodySmall"
              color={summary.estimatedDeliveryFee === 0 ? COLORS.success : COLORS.textPrimary}
              weight="600"
            >
              {summary.estimatedDeliveryFee === 0 ? 'FREE' : formatCurrency(summary.estimatedDeliveryFee)}
            </AppText>
          </View>

          <View style={styles.billRow}>
            <AppText variant="bodySmall" color={COLORS.textSecondary}>
              Handling & Packaging
            </AppText>
            <AppText variant="bodySmall" color={COLORS.textPrimary}>
              {formatCurrency(summary.taxesAndHandling)}
            </AppText>
          </View>

          <View style={styles.billDivider} />

          <View style={styles.billRow}>
            <AppText variant="titleMedium" color={COLORS.textPrimary} weight="800">
              Estimated Total
            </AppText>
            <AppText variant="titleLarge" color={COLORS.primary} weight="800">
              {formatCurrency(summary.estimatedFinalTotal)}
            </AppText>
          </View>

          <AppText variant="caption" color={COLORS.textMuted} style={{ marginTop: 6 }}>
            *Final payable amount depends on the pharmacy offer you select next.
          </AppText>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action */}
      <View style={[styles.bottomBar, SHADOWS.modal]}>
        <View style={styles.bottomTotalCol}>
          <AppText variant="caption" color={COLORS.textMuted}>
            Cart Total ({summary.totalQuantity} items)
          </AppText>
          <AppText variant="titleLarge" color={COLORS.primary} weight="800">
            {formatCurrency(summary.estimatedFinalTotal)}
          </AppText>
        </View>

        <View style={styles.bottomBtnCol}>
          <AppButton
            title="PROCEED"
            variant="primary"
            size="lg"
            onPress={handleCheckout}
            rightIcon={<Ionicons name="arrow-forward" size={18} color={COLORS.textInverse} />}
          />
        </View>
      </View>

      {/* Remove confirmation modal */}
      <ConfirmationModal
        visible={!!itemToRemove}
        title="Remove Medicine?"
        message="Are you sure you want to remove this item from your cart requirement?"
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
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: COLORS.primarySubtle,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primaryMuted,
  },
  rxAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
  },
  rxAlertWarning: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  rxAlertSuccess: {
    backgroundColor: COLORS.successLight,
    borderColor: '#A7F3D0',
  },
  rxAlertContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  rxActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  freeDeliveryBox: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    backgroundColor: COLORS.surfaceMuted,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 3,
  },
  itemsContainer: {
    marginBottom: SPACING.lg,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceSubtle,
  },
  itemInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  billCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bottomTotalCol: {
    flex: 1,
  },
  bottomBtnCol: {
    flex: 1.2,
  },
});

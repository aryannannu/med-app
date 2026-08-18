import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { RxBadge } from '../../components/badges/RxBadge';
import { PriceDisplay } from '../../components/controls/PriceDisplay';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../store/CartContext';
import { useAddress } from '../../store/AddressContext';
import { usePrescription } from '../../store/PrescriptionContext';
import { useToast } from '../../store/ToastContext';
import { formatCurrency } from '../../utils/currency';
import { formatPhoneNumber } from '../../utils/formatters';

export const CheckoutReviewScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { cartId, items, summary } = useCart();
  const { selectedAddress } = useAddress();
  const { activePrescription } = usePrescription();
  const { showToast } = useToast();

  const [deliveryInstructions, setDeliveryInstructions] = useState('Please call before delivery');

  const handleRequestOffers = () => {
    if (!selectedAddress) {
      showToast('Please select a delivery address', 'warning');
      navigation.navigate('AddressSelection', { isSelectingForCheckout: true });
      return;
    }

    if (summary.hasRxItems && !activePrescription) {
      showToast('Please upload a prescription for Rx medicines', 'warning');
      navigation.navigate('UploadPrescription', { fromCart: true });
      return;
    }

    // Launch Finding Pharmacies screen
    navigation.navigate('FindingPharmacies', { cartId });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <AppText variant="titleMedium" color={COLORS.textPrimary} weight="700">
          Review Order Request
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <View style={styles.stepItemActive}>
            <View style={styles.stepCircleActive}>
              <AppText variant="caption" color="#FFFFFF" weight="700">1</AppText>
            </View>
            <AppText variant="caption" color={COLORS.primary} weight="700">Review</AppText>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.stepItemPending}>
            <View style={styles.stepCirclePending}>
              <AppText variant="caption" color={COLORS.textMuted} weight="700">2</AppText>
            </View>
            <AppText variant="caption" color={COLORS.textMuted}>Get Offers</AppText>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.stepItemPending}>
            <View style={styles.stepCirclePending}>
              <AppText variant="caption" color={COLORS.textMuted} weight="700">3</AppText>
            </View>
            <AppText variant="caption" color={COLORS.textMuted}>Confirm</AppText>
          </View>
        </View>

        {/* Delivery Address Card */}
        <View style={[styles.sectionCard, SHADOWS.subtle]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="location" size={18} color={COLORS.primary} />
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700" style={{ marginLeft: 6 }}>
                Delivery Address
              </AppText>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('AddressSelection', { isSelectingForCheckout: true })}
            >
              <AppText variant="buttonSmall" color={COLORS.primary} weight="700">
                Change
              </AppText>
            </TouchableOpacity>
          </View>

          {selectedAddress ? (
            <View style={styles.addressInfo}>
              <View style={styles.labelPill}>
                <AppText variant="badge" color={COLORS.primary} weight="700">
                  {selectedAddress.label.toUpperCase()}
                </AppText>
              </View>
              <AppText variant="bodyMedium" color={COLORS.textPrimary} weight="700" style={{ marginTop: 4 }}>
                {selectedAddress.recipientName} ({formatPhoneNumber(selectedAddress.phone)})
              </AppText>
              <AppText variant="bodySmall" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
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

        {/* Prescription Attachment Card */}
        {summary.hasRxItems && (
          <View style={[styles.sectionCard, SHADOWS.subtle]}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="document-text" size={18} color={COLORS.secondary} />
                <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700" style={{ marginLeft: 6 }}>
                  Attached Prescription
                </AppText>
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate('UploadPrescription', { fromCart: true })}
              >
                <AppText variant="buttonSmall" color={COLORS.primary} weight="700">
                  {activePrescription ? 'Change' : 'Upload'}
                </AppText>
              </TouchableOpacity>
            </View>

            {activePrescription ? (
              <View style={styles.rxAttachedRow}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                  <AppText variant="bodySmall" color={COLORS.textPrimary} weight="600">
                    {activePrescription.fileName}
                  </AppText>
                  <AppText variant="caption" color={COLORS.textMuted}>
                    Verified by pharmacist team
                  </AppText>
                </View>
              </View>
            ) : (
              <View style={styles.rxMissingAlert}>
                <Ionicons name="alert-circle" size={18} color={COLORS.rxRed} />
                <AppText variant="caption" color={COLORS.rxRed} weight="600" style={{ marginLeft: 6, flex: 1 }}>
                  Prescription required for Rx medicines. Tap upload above.
                </AppText>
              </View>
            )}
          </View>
        )}

        {/* Delivery Instructions */}
        <View style={[styles.sectionCard, SHADOWS.subtle]}>
          <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700" style={{ marginBottom: SPACING.xs }}>
            Delivery Instructions
          </AppText>
          <AppInput
            placeholder="e.g. Leave at security, Ring doorbell"
            value={deliveryInstructions}
            onChangeText={setDeliveryInstructions}
            containerStyle={{ marginBottom: 0 }}
          />
        </View>

        {/* Items Summary Breakdown */}
        <View style={[styles.sectionCard, SHADOWS.subtle]}>
          <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700" style={{ marginBottom: SPACING.md }}>
            Medicines in Request ({summary.totalQuantity} items)
          </AppText>

          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Image source={{ uri: item.medicine.image }} style={styles.itemThumb} resizeMode="cover" />
              <View style={styles.itemDetails}>
                <AppText variant="bodyMedium" color={COLORS.textPrimary} weight="700" numberOfLines={1}>
                  {item.medicine.name}
                </AppText>
                <AppText variant="caption" color={COLORS.textMuted}>
                  Qty: {item.quantity} • {item.medicine.packForm}
                </AppText>
                {item.rxRequired && <RxBadge style={{ marginTop: 2 }} />}
              </View>
              <AppText variant="titleSmall" color={COLORS.primary} weight="700">
                {formatCurrency((item.selectedVariant?.discountPrice ?? item.medicine.discountPrice) * item.quantity)}
              </AppText>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Primary Bottom Action */}
      <View style={[styles.bottomBar, SHADOWS.modal]}>
        <AppButton
          title="REQUEST PHARMACY OFFERS"
          variant="primary"
          size="lg"
          onPress={handleRequestOffers}
          rightIcon={<Ionicons name="sparkles" size={18} color={COLORS.textInverse} />}
        />
      </View>
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
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  stepItemActive: {
    alignItems: 'center',
  },
  stepItemPending: {
    alignItems: 'center',
  },
  stepCircleActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  stepCirclePending: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  stepLine: {
    height: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressInfo: {
    marginTop: 4,
  },
  labelPill: {
    backgroundColor: COLORS.primarySubtle,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BORDER_RADIUS.xs,
    alignSelf: 'flex-start',
  },
  rxAttachedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: 4,
  },
  rxMissingAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surfaceSubtle,
  },
  itemDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

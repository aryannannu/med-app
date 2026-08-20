import React, { useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/currency';
import { useOrders } from '../../store/OrderContext';

export const OrderConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'OrderConfirmation'>>();
  const { orders } = useOrders();

  const order = route.params?.order || orders[0];

  // Scale animation for celebratory success checkmark
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const pharmacyName = order?.selectedPharmacy?.name || order?.selectedOffer?.pharmacy?.name || 'Apollo Pharmacy 24x7';
  const deliveryEta = order?.selectedOffer?.estimatedDeliveryMinutes || 12;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Success Animation Badge */}
        <View style={styles.celebrationContainer}>
          <Animated.View style={[styles.successIconCircle, { transform: [{ scale: scaleAnim }] }]}>
            <Ionicons name="checkmark" size={44} color="#FFFFFF" />
          </Animated.View>

          <AppText variant="h2" color={COLORS.textPrimary} weight="600" style={styles.successTitle}>
            Order Placed Successfully!
          </AppText>
          <AppText variant="caption" color={COLORS.textSecondary} align="center">
            Your medicine cart has been confirmed &amp; sent to the dispensing pharmacy.
          </AppText>
        </View>

        {/* Order Reference Card */}
        <View style={[styles.orderHeroCard, SHADOWS.card]}>
          <View style={styles.orderHeroTop}>
            <View>
              <AppText variant="caption" color={COLORS.textMuted} weight="600">
                ORDER ID
              </AppText>
              <AppText variant="titleMedium" color={COLORS.primary} weight="600" style={{ marginTop: 2 }}>
                #{order.id.toUpperCase()}
              </AppText>
            </View>

            <View style={styles.etaPill}>
              <Ionicons name="flash" size={14} color="#15803D" />
              <AppText variant="caption" color="#15803D" weight="600" style={{ marginLeft: 4 }}>
                ETA {deliveryEta} mins
              </AppText>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Pharmacy Info */}
          <View style={styles.pharmacyRow}>
            <View style={styles.pharmacyIconBox}>
              <Ionicons name="storefront" size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <AppText variant="caption" color={COLORS.textMuted}>
                DISPENSING PHARMACY
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 1 }}>
                <AppText variant="bodyMedium" color={COLORS.textPrimary} weight="600">
                  {pharmacyName}
                </AppText>
                <Ionicons name="checkmark-circle" size={14} color="#15803D" style={{ marginLeft: 4 }} />
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Delivery Address */}
          <View style={styles.deliveryRow}>
            <Ionicons name="location-outline" size={18} color={COLORS.textSecondary} />
            <View style={{ flex: 1, marginLeft: SPACING.xs }}>
              <AppText variant="caption" color={COLORS.textSecondary}>
                Deliver to: <AppText variant="caption" color={COLORS.textPrimary} weight="600">{order.deliveryAddress.recipientName}</AppText> ({order.deliveryAddress.label})
              </AppText>
              <AppText variant="caption" color={COLORS.textMuted} numberOfLines={1} style={{ fontSize: 11 }}>
                {order.deliveryAddress.houseFlatNumber}, {order.deliveryAddress.streetAddress}, {order.deliveryAddress.city}
              </AppText>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Payment Details */}
          <View style={styles.paymentRow}>
            <View>
              <AppText variant="caption" color={COLORS.textMuted}>
                AMOUNT PAID
              </AppText>
              <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600" style={{ marginTop: 2 }}>
                {formatCurrency(order.totalAmount)}
              </AppText>
            </View>

            <View style={styles.paymentConfirmedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#15803D" />
              <AppText variant="caption" color="#15803D" weight="600" style={{ marginLeft: 4 }}>
                Payment Confirmed
              </AppText>
            </View>
          </View>
        </View>

        {/* Live Order Steps Timeline Preview */}
        <View style={[styles.timelineCard, SHADOWS.subtle]}>
          <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600" style={{ marginBottom: SPACING.md }}>
            Live Fulfillment Status
          </AppText>

          <View style={styles.timelineStep}>
            <View style={styles.stepDotActive}>
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <AppText variant="bodySmall" color={COLORS.textPrimary} weight="600">
                Order Received by Pharmacy
              </AppText>
              <AppText variant="caption" color={COLORS.textMuted}>
                Pharmacist verifying batch stocks &amp; packing medicines
              </AppText>
            </View>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.timelineStep}>
            <View style={styles.stepDotPending} />
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <AppText variant="bodySmall" color={COLORS.textSecondary}>
                Express Rider Assigned
              </AppText>
              <AppText variant="caption" color={COLORS.textMuted}>
                Delivery partner will pick up from store
              </AppText>
            </View>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.timelineStep}>
            <View style={styles.stepDotPending} />
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <AppText variant="bodySmall" color={COLORS.textSecondary}>
                Delivered at Doorstep ({deliveryEta} mins)
              </AppText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.bottomBar, SHADOWS.modal]}>
        <AppButton
          title="Track Live Order"
          variant="primary"
          size="lg"
          onPress={() => navigation.navigate('OrderDetails', { orderId: order.id, order })}
          rightIcon={<Ionicons name="location" size={18} color="#FFFFFF" />}
          style={{ marginBottom: SPACING.xs }}
        />

        <View style={styles.secondaryActionsRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate('OrderInvoice', { orderId: order.id })}
            style={styles.secondaryActionBtn}
          >
            <Ionicons name="document-text-outline" size={16} color={COLORS.primary} />
            <AppText variant="caption" color={COLORS.primary} weight="600" style={{ marginLeft: 4 }}>
              Tax Invoice
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
            style={styles.secondaryActionBtn}
          >
            <Ionicons name="home-outline" size={16} color={COLORS.textSecondary} />
            <AppText variant="caption" color={COLORS.textSecondary} weight="600" style={{ marginLeft: 4 }}>
              Continue Shopping
            </AppText>
          </TouchableOpacity>
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
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 120,
  },
  celebrationContainer: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#15803D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  successTitle: {
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  orderHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.md,
  },
  orderHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8EE',
    marginVertical: SPACING.md,
  },
  pharmacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pharmacyIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ECE8F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentConfirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepDotActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#15803D',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepDotPending: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E8E8EE',
    backgroundColor: '#F8F8FC',
    marginTop: 2,
  },
  stepLine: {
    width: 2,
    height: 24,
    backgroundColor: '#E8E8EE',
    marginLeft: 9,
    marginVertical: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E8E8EE',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
  },
});

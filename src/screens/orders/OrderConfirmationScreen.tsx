import React, { useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/currency';
import { useOrders } from '../../store/OrderContext';
import { useAppTheme } from '../../store/ThemeContext';
import { haptics } from '../../services/hapticService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const OrderConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { colors, isDark } = useAppTheme();
  const route = useRoute<RouteProp<AppStackParamList, 'OrderConfirmation'>>();
  const { orders } = useOrders();

  const order = route.params?.order || orders[0] || {
    id: '1787942483771',
    totalAmount: 277,
    selectedPharmacy: { name: 'Apollo Pharmacy 24x7', isVerified: true },
    deliveryAddress: {
      recipientName: 'Gurpreet Singh',
      label: 'Home',
      houseFlatNumber: 'House #121',
      streetAddress: 'Near Community Park, Main Boulevard',
      city: 'Karimpur',
    },
    selectedOffer: { estimatedDeliveryMinutes: 10 },
  };

  // Scale animation for celebratory success checkmark
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 45,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const pharmacyName =
    order?.selectedPharmacy?.name ||
    order?.selectedOffer?.pharmacy?.name ||
    'Apollo Pharmacy 24x7';
  const deliveryEta = order?.selectedOffer?.estimatedDeliveryMinutes || 10;
  const recipientName = order?.deliveryAddress?.recipientName || 'Gurpreet Singh';
  const addressLabel = order?.deliveryAddress?.label || 'Home';
  const formattedAddress = `${order?.deliveryAddress?.houseFlatNumber || 'House #121'}, ${order?.deliveryAddress?.streetAddress || 'Near Community Park, Main Boulevard'}, ${order?.deliveryAddress?.city || 'Karimpur'}`;
  const orderIdText = order?.id ? `#ORD-${order.id.replace(/^ord-/i, '')}` : '#ORD-1787942483771';

  // Current formatted time for timeline step 1
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? colors.background : '#F8F9FD' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Celebration & Hero Section */}
        <View style={styles.celebrationHeroContainer}>
          {/* Floating Particle Confetti Decor */}
          <View style={styles.particlesContainer} pointerEvents="none">
            {/* Top Left Plus & Dots */}
            <AppText style={[styles.particlePlus, { top: 10, left: 24, fontSize: 18, color: '#DDD6FE' }]}>+</AppText>
            <View style={[styles.particleDot, { top: 22, left: 108, width: 7, height: 7, backgroundColor: '#22C55E' }]} />
            <View style={[styles.particleDot, { top: 52, left: 98, width: 6, height: 6, backgroundColor: '#7C3AED' }]} />
            <View style={[styles.particleDot, { top: 64, left: 114, width: 4, height: 4, backgroundColor: '#6366F1' }]} />

            {/* Top Right Plus & Dots */}
            <View style={[styles.particleDot, { top: 12, right: 108, width: 6, height: 6, backgroundColor: '#3B82F6' }]} />
            <View style={[styles.particleDot, { top: 24, right: 98, width: 4, height: 4, backgroundColor: '#A855F7' }]} />
            <View style={[styles.particleDot, { top: 48, right: 104, width: 6, height: 6, backgroundColor: '#10B981' }]} />
            <View style={[styles.particleDot, { top: 78, right: 106, width: 5, height: 5, backgroundColor: '#6366F1' }]} />
            <AppText style={[styles.particlePlus, { top: 44, right: 38, fontSize: 20, color: '#EDE9FE' }]}>+</AppText>
            <AppText style={[styles.particlePlus, { top: 18, right: 78, fontSize: 13, color: '#C4B5FD' }]}>+</AppText>
          </View>

          {/* Big Green Success Checkmark */}
          <Animated.View style={[styles.successIconCircle, { transform: [{ scale: scaleAnim }] }]}>
            <Ionicons name="checkmark" size={44} color="#FFFFFF" />
          </Animated.View>

          {/* Heading Title */}
          <AppText variant="h2" color={colors.textPrimary} weight="800" style={styles.successHeading}>
            Order Placed Successfully!
          </AppText>

          {/* Subtitle */}
          <AppText variant="bodySmall" color={colors.textSecondary} align="center" style={styles.successSubtitle}>
            Your medicines are confirmed and we've sent the order to the pharmacy
          </AppText>
        </View>

        {/* Card 1: Order Details Summary Card */}
        <View style={[styles.whiteCard, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.subtle]}>
          {/* Header Row: ORDER ID & ETA Badge */}
          <View style={styles.cardHeaderRow}>
            <View>
              <AppText variant="caption" color={colors.textMuted} weight="700" style={styles.labelMeta}>
                ORDER ID
              </AppText>
              <AppText variant="titleMedium" color="#1E1B4B" weight="800" style={styles.orderIdValue}>
                {orderIdText}
              </AppText>
            </View>

            <View style={styles.etaPill}>
              <Ionicons name="flash" size={13} color="#059669" />
              <AppText variant="caption" color="#059669" weight="700" style={{ marginLeft: 3, fontSize: 11 }}>
                ETA {deliveryEta} mins
              </AppText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? colors.border : '#F3F4F6' }]} />

          {/* Row 1: Dispensing Pharmacy */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => haptics.light()}
            style={styles.infoRow}
          >
            <View style={[styles.iconCircle, { backgroundColor: isDark ? colors.surfaceElevated : '#F3E8FF' }]}>
              <Ionicons name="storefront" size={18} color="#3A2986" />
            </View>

            <View style={styles.infoCol}>
              <AppText variant="caption" color={colors.textMuted} weight="700" style={styles.labelMeta}>
                DISPENSING PHARMACY
              </AppText>
              <View style={styles.nameBadgeRow}>
                <AppText variant="bodyMedium" color={colors.textPrimary} weight="700">
                  {pharmacyName}
                </AppText>
                <Ionicons name="checkmark-circle" size={14} color="#16A34A" style={{ marginLeft: 5 }} />
              </View>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: isDark ? colors.border : '#F3F4F6' }]} />

          {/* Row 2: Deliver To */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => haptics.light()}
            style={styles.infoRow}
          >
            <View style={[styles.iconCircle, { backgroundColor: isDark ? colors.surfaceElevated : '#F3E8FF' }]}>
              <Ionicons name="location" size={18} color="#3A2986" />
            </View>

            <View style={styles.infoCol}>
              <AppText variant="caption" color={colors.textMuted} weight="700" style={styles.labelMeta}>
                DELIVER TO
              </AppText>
              <AppText variant="bodyMedium" color={colors.textPrimary} weight="700" numberOfLines={1}>
                {recipientName} <AppText variant="bodyMedium" color={colors.textSecondary}>({addressLabel})</AppText>
              </AppText>
              <AppText variant="caption" color={colors.textSecondary} numberOfLines={1} style={styles.addressLine}>
                {formattedAddress}
              </AppText>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: isDark ? colors.border : '#F3F4F6' }]} />

          {/* Row 3: Amount Paid & Payment Status */}
          <View style={styles.bottomMetaRow}>
            <View>
              <AppText variant="caption" color={colors.textMuted} weight="700" style={styles.labelMeta}>
                AMOUNT PAID
              </AppText>
              <AppText variant="titleLarge" color={colors.textPrimary} weight="800" style={styles.amountValue}>
                {formatCurrency(order.totalAmount || 277)}
              </AppText>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <AppText variant="caption" color={colors.textMuted} weight="700" style={[styles.labelMeta, { marginBottom: 3 }]}>
                PAYMENT STATUS
              </AppText>
              <View style={styles.paymentConfirmedPill}>
                <Ionicons name="checkmark-circle" size={13} color="#15803D" />
                <AppText variant="caption" color="#15803D" weight="700" style={{ marginLeft: 4, fontSize: 11 }}>
                  Payment Confirmed
                </AppText>
              </View>
            </View>
          </View>
        </View>

        {/* Card 2: Live Fulfillment Status */}
        <View style={[styles.whiteCard, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 14 }, SHADOWS.subtle]}>
          <AppText variant="titleMedium" color={colors.textPrimary} weight="800" style={{ marginBottom: 18 }}>
            Live Fulfillment Status
          </AppText>

          {/* Vertical Stepper Timeline */}
          <View style={styles.timelineContainer}>
            {/* Step 1: Order Received by Pharmacy */}
            <View style={styles.stepItemRow}>
              <View style={styles.stepLeftNodeCol}>
                <View style={[styles.nodeIconCircle, { backgroundColor: '#16A34A' }]}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
                {/* Solid Green Connector Line */}
                <View style={styles.solidLine} />
              </View>

              <View style={styles.stepContentCol}>
                <View style={styles.stepHeaderRow}>
                  <AppText variant="bodyMedium" color={colors.textPrimary} weight="700">
                    Order Received by Pharmacy
                  </AppText>
                  <View style={styles.completedTag}>
                    <AppText variant="caption" color="#7C3AED" weight="700" style={{ fontSize: 10 }}>
                      Completed
                    </AppText>
                  </View>
                </View>
                <AppText variant="caption" color={colors.textSecondary} style={styles.stepDesc}>
                  Pharmacist verifying batch stocks &amp; packing medicines
                </AppText>
                <AppText variant="caption" color={colors.textMuted} style={styles.stepTime}>
                  {currentTime}
                </AppText>
              </View>
            </View>

            {/* Step 2: Express Rider Assigned */}
            <View style={styles.stepItemRow}>
              <View style={styles.stepLeftNodeCol}>
                <View style={[styles.nodeIconCircle, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="bicycle" size={14} color="#7C3AED" />
                </View>
                {/* Dashed Line */}
                <View style={styles.dashedLine} />
              </View>

              <View style={styles.stepContentCol}>
                <View style={styles.stepHeaderRow}>
                  <AppText variant="bodyMedium" color={colors.textPrimary} weight="700">
                    Express Rider Assigned
                  </AppText>
                  <View style={styles.inProgressTag}>
                    <AppText variant="caption" color="#7C3AED" weight="700" style={{ fontSize: 10 }}>
                      In Progress
                    </AppText>
                  </View>
                </View>
                <AppText variant="caption" color={colors.textSecondary} style={styles.stepDesc}>
                  Delivery partner will pick up from store
                </AppText>
              </View>
            </View>

            {/* Step 3: Picked up & On the way */}
            <View style={styles.stepItemRow}>
              <View style={styles.stepLeftNodeCol}>
                <View style={[styles.nodeIconCircle, { backgroundColor: isDark ? colors.surfaceElevated : '#F3F4F6' }]}>
                  <Ionicons name="bag-handle" size={13} color="#9CA3AF" />
                </View>
                {/* Dashed Line */}
                <View style={styles.dashedLine} />
              </View>

              <View style={styles.stepContentCol}>
                <View style={styles.stepHeaderRow}>
                  <AppText variant="bodyMedium" color={colors.textPrimary} weight="600">
                    Picked up &amp; On the way
                  </AppText>
                  <View style={styles.upcomingTag}>
                    <AppText variant="caption" color="#9CA3AF" weight="600" style={{ fontSize: 10 }}>
                      Upcoming
                    </AppText>
                  </View>
                </View>
                <AppText variant="caption" color={colors.textSecondary} style={styles.stepDesc}>
                  Rider is on the way to deliver your order
                </AppText>
              </View>
            </View>

            {/* Step 4: Delivered */}
            <View style={[styles.stepItemRow, { marginBottom: 0 }]}>
              <View style={styles.stepLeftNodeCol}>
                <View style={[styles.nodeIconCircle, { backgroundColor: isDark ? colors.surfaceElevated : '#F3F4F6' }]}>
                  <Ionicons name="home" size={13} color="#9CA3AF" />
                </View>
              </View>

              <View style={styles.stepContentCol}>
                <View style={styles.stepHeaderRow}>
                  <AppText variant="bodyMedium" color={colors.textPrimary} weight="600">
                    Delivered
                  </AppText>
                  <View style={styles.upcomingTag}>
                    <AppText variant="caption" color="#9CA3AF" weight="600" style={{ fontSize: 10 }}>
                      Upcoming
                    </AppText>
                  </View>
                </View>
                <AppText variant="caption" color={colors.textSecondary} style={styles.stepDesc}>
                  Your order will be delivered soon
                </AppText>
              </View>
            </View>
          </View>
        </View>

        {/* Card 3: 100% Genuine Medicines Banner */}
        <View
          style={[
            styles.genuineCard,
            {
              backgroundColor: isDark ? colors.surfaceElevated : '#F8F9FE',
              borderColor: isDark ? colors.border : '#EDE9FE',
            },
          ]}
        >
          <View style={[styles.genuineIconBox, { backgroundColor: '#FFFFFF' }]}>
            <Ionicons name="shield-checkmark" size={18} color="#3A2986" />
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <AppText variant="titleSmall" color={colors.textPrimary} weight="700" style={{ fontSize: 13 }}>
              100% Genuine Medicines
            </AppText>
            <AppText variant="caption" color={colors.textSecondary} style={{ fontSize: 11, marginTop: 1 }}>
              Sourced from verified &amp; trusted pharmacies
            </AppText>
          </View>

          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions Container */}
      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }, SHADOWS.card]}>
        {/* Primary CTA: Track Live Order */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            haptics.medium();
            navigation.navigate('OrderDetails', { orderId: order.id, order });
          }}
          style={styles.primaryTrackBtn}
        >
          <AppText variant="titleSmall" color="#FFFFFF" weight="700" style={{ fontSize: 15 }}>
            Track Live Order
          </AppText>
          <Ionicons name="location" size={17} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        {/* Secondary CTAs Row */}
        <View style={styles.secondaryBtnRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              haptics.light();
              navigation.navigate('OrderInvoice', { orderId: order.id });
            }}
            style={[styles.secondaryActionBtn, { borderColor: isDark ? colors.border : '#E5E7EB', backgroundColor: colors.surface }]}
          >
            <Ionicons name="document-text-outline" size={16} color="#3A2986" style={{ marginRight: 6 }} />
            <AppText variant="caption" color="#3A2986" weight="700" style={{ fontSize: 12 }}>
              Tax Invoice
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              haptics.light();
              navigation.navigate('MainTabs', { screen: 'HomeTab' });
            }}
            style={[styles.secondaryActionBtn, { borderColor: isDark ? colors.border : '#E5E7EB', backgroundColor: colors.surface }]}
          >
            <Ionicons name="bag-handle-outline" size={16} color="#3A2986" style={{ marginRight: 6 }} />
            <AppText variant="caption" color="#3A2986" weight="700" style={{ fontSize: 12 }}>
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
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: 140,
  },
  celebrationHeroContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    position: 'relative',
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  particlePlus: {
    position: 'absolute',
    fontWeight: '800',
  },
  particleDot: {
    position: 'absolute',
    borderRadius: 4,
  },
  successIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 14,
  },
  successHeading: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 6,
  },
  successSubtitle: {
    lineHeight: 18,
    maxWidth: 290,
  },
  whiteCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelMeta: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  orderIdValue: {
    fontSize: 16,
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 6,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressLine: {
    fontSize: 11,
    marginTop: 2,
  },
  bottomMetaRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  amountValue: {
    fontSize: 20,
  },
  paymentConfirmedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  stepItemRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  stepLeftNodeCol: {
    alignItems: 'center',
    width: 28,
  },
  nodeIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  solidLine: {
    width: 2,
    height: 44,
    backgroundColor: '#16A34A',
    marginTop: -2,
    marginBottom: -2,
  },
  dashedLine: {
    width: 1.5,
    height: 42,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    marginTop: -2,
    marginBottom: -2,
  },
  stepContentCol: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 14,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  completedTag: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  inProgressTag: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  upcomingTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  stepDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  stepTime: {
    fontSize: 10,
    marginTop: 2,
  },
  genuineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginTop: 14,
  },
  genuineIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
    borderTopWidth: 1,
  },
  primaryTrackBtn: {
    backgroundColor: '#2E1B73',
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  secondaryActionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

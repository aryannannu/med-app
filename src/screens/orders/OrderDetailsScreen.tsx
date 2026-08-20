import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppScreen } from '../../components/layout/AppScreen';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { LoadingState } from '../../components/feedback/LoadingState';
import { BottomSheet } from '../../components/modals/BottomSheet';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../../store/OrderContext';
import { useToast } from '../../store/ToastContext';
import { Order } from '../../types/order';
import { formatCurrency } from '../../utils/currency';
import { formatDateTime } from '../../utils/formatters';

const CANCEL_REASONS = [
  'Ordered by mistake',
  'Need medicine faster than estimated time',
  'Found alternative at local clinic',
  'Incorrect delivery address entered',
  'Other reasons',
];

export const OrderDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'OrderDetails'>>();
  const orderId = route.params?.orderId || 'order-1';
  const initialOrder = route.params?.order;

  const [order, setOrder] = useState<Order | null>(initialOrder || null);
  const [isLoading, setIsLoading] = useState(!initialOrder);
  const [cancelSheetVisible, setCancelSheetVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);

  const { getOrderById, cancelOrder, reorder } = useOrders();
  const { showToast } = useToast();

  useEffect(() => {
    if (!order) {
      getOrderById(orderId).then((data) => {
        setOrder(data);
        setIsLoading(false);
      });
    }
  }, [orderId, order, getOrderById]);

  if (isLoading || !order) {
    return <LoadingState fullScreen message="Loading order details..." />;
  }

  const handleCancelOrder = async () => {
    const success = await cancelOrder(order.id, selectedReason);
    if (success) {
      setCancelSheetVisible(false);
      showToast('Order cancelled successfully', 'info');
      const updated = await getOrderById(order.id);
      if (updated) setOrder(updated);
    } else {
      showToast('Cannot cancel this order at current stage', 'error');
    }
  };

  const handleReorder = () => {
    reorder(order);
    showToast('Items added to cart', 'success');
    navigation.navigate('Cart');
  };

  return (
    <AppScreen
      scrollable
      header={
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600">
            Track Order
          </AppText>
          <View style={{ width: 40 }} />
        </View>
      }
    >
      {/* 1. Green Hero Order Banner matching Image 3 Step 14 */}
      <View style={[styles.orderHeroBanner, SHADOWS.subtle]}>
        <View style={styles.heroTopRow}>
          <View>
            <AppText variant="titleMedium" color="#FFFFFF" weight="600">
              Order ID: #{order.orderNumber}
            </AppText>
            <AppText variant="caption" color={COLORS.primaryMuted} style={{ marginTop: 2 }}>
              Placed on {formatDateTime(order.createdAt)}
            </AppText>
          </View>
          <View style={styles.statusPillHero}>
            <AppText variant="caption" color={COLORS.successDark} weight="600" style={{ fontSize: 10 }}>
              {order.status.toUpperCase()}
            </AppText>
          </View>
        </View>
      </View>

      {/* 2. Step-by-Step Status Timeline */}
      <View style={[styles.timelineCard, SHADOWS.subtle]}>
        {order.timeline.map((step, idx) => {
          const isLast = idx === order.timeline.length - 1;
          return (
            <View key={step.id || idx} style={styles.timelineRow}>
              <View style={styles.timelineIconCol}>
                <View
                  style={[
                    styles.timelineDot,
                    step.isCompleted && styles.dotCompleted,
                    step.isCurrent && styles.dotCurrent,
                    !step.isCompleted && !step.isCurrent && styles.dotPending,
                  ]}
                >
                  {step.isCompleted ? (
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  ) : step.isCurrent ? (
                    <View style={styles.dotCurrentInner} />
                  ) : null}
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.timelineLine,
                      step.isCompleted ? styles.lineCompleted : styles.linePending,
                    ]}
                  />
                )}
              </View>

              <View style={styles.timelineContentCol}>
                <View style={styles.timelineTitleRow}>
                  <AppText
                    variant="titleSmall"
                    color={step.isCurrent ? COLORS.primary : step.isCompleted ? COLORS.textPrimary : COLORS.textMuted}
                    weight={step.isCurrent || step.isCompleted ? '600' : '400'}
                  >
                    {step.title}
                  </AppText>
                  {step.timestamp > 0 && (
                    <AppText variant="caption" color={COLORS.textMuted}>
                      {formatDateTime(step.timestamp)}
                    </AppText>
                  )}
                </View>
                <AppText variant="bodySmall" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
                  {step.description}
                </AppText>
              </View>
            </View>
          );
        })}
      </View>

      {/* 3. Delivery Partner Info Card */}
      {order.rider && (
        <View style={[styles.riderCard, SHADOWS.subtle]}>
          <View style={styles.riderAvatar}>
            <Ionicons name="person" size={24} color={COLORS.primary} />
          </View>

          <View style={styles.riderInfoCol}>
            <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
              {order.rider.name}
            </AppText>
            <AppText variant="caption" color={COLORS.textSecondary}>
              Delivery Partner • ★ {order.rider.rating || 4.8}
            </AppText>
          </View>

          <View style={styles.riderActionButtons}>
            <TouchableOpacity
              onPress={() => showToast(`Calling ${order.rider?.name}...`, 'info')}
              style={styles.riderCallBtn}
            >
              <Ionicons name="call" size={16} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => showToast(`Opening chat with ${order.rider?.name}...`, 'info')}
              style={[styles.riderCallBtn, { marginLeft: 8 }]}
            >
              <Ionicons name="chatbubble-ellipses" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 4. Live Map / ETA Simulation Card */}
      <View style={[styles.mapPreviewCard, SHADOWS.subtle]}>
        <View style={styles.mapHeaderRow}>
          <Ionicons name="navigate-circle" size={18} color={COLORS.primary} />
          <AppText variant="caption" color={COLORS.primary} weight="600" style={{ marginLeft: 4 }}>
            LIVE LOCATION • 2 MINS AWAY
          </AppText>
        </View>
        <View style={styles.mapRouteVisual}>
          <View style={styles.pharmacyNode}>
            <Ionicons name="business" size={14} color={COLORS.primary} />
          </View>
          <View style={styles.routeDottedLine} />
          <View style={styles.riderBikeNode}>
            <Ionicons name="bicycle" size={18} color={COLORS.success} />
          </View>
          <View style={styles.routeDottedLine} />
          <View style={styles.homeNode}>
            <Ionicons name="home" size={14} color={COLORS.primary} />
          </View>
        </View>
      </View>

      {/* 5. Order Items & Pharmacy Details */}
      <View style={[styles.itemsCard, SHADOWS.subtle]}>
        <View style={styles.pharmacyHeaderRow}>
          <View style={styles.pharmLogoBox}>
            <Ionicons name="medical" size={18} color={COLORS.primary} />
          </View>
          <View style={{ marginLeft: 8 }}>
            <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
              {order.selectedPharmacy?.name || 'Local Verified Pharmacy'}
            </AppText>
            <AppText variant="caption" color={COLORS.textSecondary}>
              Fulfilled by verified local licensed pharmacy
            </AppText>
          </View>
        </View>

        <View style={styles.itemsDivider} />

        {order.items.map((item, idx) => (
          <View key={item.medicineId || idx} style={styles.orderItemRow}>
            <Image
              source={{ uri: item.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80' }}
              style={styles.orderItemImg}
              resizeMode="contain"
            />
            <View style={styles.orderItemInfo}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                {item.medicineName}
              </AppText>
              <AppText variant="caption" color={COLORS.textMuted}>
                Qty: {item.quantity} • {item.packForm}
              </AppText>
            </View>
            <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
              {formatCurrency(item.unitPrice * item.quantity)}
            </AppText>
          </View>
        ))}
      </View>

      {/* 6. Payment & Delivery Breakdown */}
      <View style={[styles.billCard, SHADOWS.subtle]}>
        <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600" style={{ marginBottom: SPACING.sm }}>
          Payment Summary
        </AppText>

        <View style={styles.billRow}>
          <AppText variant="bodySmall" color={COLORS.textSecondary}>
            Items Total (MRP)
          </AppText>
          <AppText variant="bodySmall" color={COLORS.textPrimary} weight="600">
            {formatCurrency(order.totalAmount + (order.savingsTotal || 118))}
          </AppText>
        </View>

        <View style={styles.billRow}>
          <AppText variant="bodySmall" color={COLORS.success}>
            Marketplace Discount
          </AppText>
          <AppText variant="bodySmall" color={COLORS.success} weight="600">
            -{formatCurrency(order.savingsTotal || 118)}
          </AppText>
        </View>

        <View style={styles.billRow}>
          <AppText variant="bodySmall" color={COLORS.textSecondary}>
            Delivery Fee
          </AppText>
          <AppText variant="bodySmall" color={COLORS.success} weight="600">
            FREE
          </AppText>
        </View>

        <View style={styles.billDivider} />

        <View style={styles.billRow}>
          <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600">
            Paid via UPI / Online
          </AppText>
          <AppText variant="titleLarge" color={COLORS.primary} weight="600">
            {formatCurrency(order.totalAmount)}
          </AppText>
        </View>
      </View>

      {/* Actions: Reorder, Invoice & Cancel */}
      <View style={styles.actionsFooter}>
        <AppButton
          title="Reorder All Items"
          variant="primary"
          onPress={handleReorder}
          style={{ marginBottom: SPACING.sm }}
          leftIcon={<Ionicons name="repeat" size={18} color="#FFFFFF" />}
        />

        <AppButton
          title="View & Download Invoice"
          variant="outline"
          onPress={() => navigation.navigate('OrderInvoice', { orderId: order.id })}
          style={{ marginBottom: SPACING.md }}
          leftIcon={<Ionicons name="document-text-outline" size={18} color={COLORS.primary} />}
        />

        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <TouchableOpacity onPress={() => setCancelSheetVisible(true)} style={styles.cancelLink}>
            <AppText variant="caption" color={COLORS.danger} weight="600">
              Cancel this Order
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      {/* Cancel Order Reason Sheet */}
      <BottomSheet
        visible={cancelSheetVisible}
        onClose={() => setCancelSheetVisible(false)}
        title="Reason for Cancellation"
      >
        <View style={{ paddingBottom: SPACING.lg }}>
          {CANCEL_REASONS.map((reason, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setSelectedReason(reason)}
              style={styles.reasonRadioRow}
            >
              <Ionicons
                name={selectedReason === reason ? 'radio-button-on' : 'radio-button-off'}
                size={18}
                color={COLORS.primary}
              />
              <AppText variant="bodySmall" color={COLORS.textPrimary} style={{ marginLeft: 8 }}>
                {reason}
              </AppText>
            </TouchableOpacity>
          ))}

          <AppButton
            title="Confirm Cancellation"
            variant="danger"
            onPress={handleCancelOrder}
            style={{ marginTop: SPACING.lg }}
          />
        </View>
      </BottomSheet>
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
  orderHeroBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPillHero: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  timelineCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  timelineIconCol: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompleted: {
    backgroundColor: COLORS.success,
  },
  dotCurrent: {
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.primaryMuted,
  },
  dotCurrentInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  dotPending: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  lineCompleted: {
    backgroundColor: COLORS.success,
  },
  linePending: {
    backgroundColor: COLORS.border,
  },
  timelineContentCol: {
    flex: 1,
    marginLeft: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  timelineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  riderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderInfoCol: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  riderActionButtons: {
    flexDirection: 'row',
  },
  riderCallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPreviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapRouteVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  pharmacyNode: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderBikeNode: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeNode: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeDottedLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  itemsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pharmacyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pharmLogoBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  orderItemImg: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  orderItemInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  billCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  billDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  actionsFooter: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxxl,
    alignItems: 'center',
  },
  cancelLink: {
    padding: SPACING.sm,
  },
  reasonRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
});

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
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
import { useAppTheme } from '../../store/ThemeContext';
import { Order, OrderStatus } from '../../types/order';
import { formatCurrency } from '../../utils/currency';
import { formatDateTime } from '../../utils/formatters';

import { LiveOrderMap } from '../../components/maps/LiveOrderMap';

const CANCEL_REASONS = [
  'Ordered by mistake',
  'Need medicine faster than estimated time',
  'Found alternative at local clinic',
  'Incorrect delivery address entered',
  'Other reasons',
];

// Clean Google Maps silver/light mode styling
const silverMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#dadada" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#c9c9c9" }]
  }
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
  const [showItemsDetails, setShowItemsDetails] = useState(false);

  const { getOrderById, cancelOrder, reorder } = useOrders();
  const { showToast } = useToast();
  const { colors } = useAppTheme();

  useEffect(() => {
    if (!order) {
      getOrderById(orderId).then((data) => {
        setOrder(data);
        setIsLoading(false);
      });
    }
  }, [orderId, order, getOrderById]);

  // Dynamic Status Mapper for UI
  const statusInfo = useMemo(() => {
    if (!order) return null;
    
    switch (order.status) {
      case 'request_created':
      case 'finding_pharmacy':
        return {
          title: 'Order Placed',
          subtitle: 'Your order has been received.',
          step: 0,
          showMap: false,
        };
      case 'offers_received':
      case 'offer_selected':
        return {
          title: 'Pharmacy Confirmed',
          subtitle: 'Your pharmacy has accepted the order.',
          step: 1,
          showMap: false,
        };
      case 'preparing':
        return {
          title: 'Preparing your order',
          subtitle: 'Your medicines are being packed.',
          step: 1,
          showMap: false,
        };
      case 'packed':
        return {
          title: 'Ready for pickup',
          subtitle: 'Your order is ready for the delivery partner.',
          step: 1,
          showMap: false,
        };
      case 'out_for_delivery':
        return {
          title: 'Out for Delivery',
          subtitle: order.rider ? `Your rider ${order.rider.name} is on the way.` : 'Your order is on the way.',
          step: 2,
          showMap: true,
        };
      case 'delivered':
        return {
          title: 'Delivered',
          subtitle: `Your order was delivered.`,
          step: 3,
          showMap: false,
        };
      case 'cancelled':
        return {
          title: 'Order Cancelled',
          subtitle: order.cancellationReason || 'This order was cancelled.',
          step: -1,
          showMap: false,
        };
      default:
        return {
          title: 'Processing',
          subtitle: 'Updating order status...',
          step: 0,
          showMap: false,
        };
    }
  }, [order]);

  const pharmacyCoords = useMemo(() => {
    return {
      latitude: order?.selectedPharmacy?.address?.latitude || 31.1512,
      longitude: order?.selectedPharmacy?.address?.longitude || 75.3489,
    };
  }, [order]);

  const homeCoords = {
    latitude: 31.1445,
    longitude: 75.3398,
  };

  const riderCoords = {
    latitude: 31.1478,
    longitude: 75.3443,
  };

  if (isLoading || !order || !statusInfo) {
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

  const hasRider = !!order.rider;

  return (
    <AppScreen
      scrollable
      header={
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <AppText variant="titleMedium" color={colors.textPrimary} weight="600">
            Track Order
          </AppText>
          <View style={{ width: 40 }} />
        </View>
      }
    >
      <View style={styles.pageContent}>
        {/* =========================================================================
            LEVEL 1 — CURRENT STATUS HERO
           ========================================================================= */}
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.heroRow}>
            <View style={{ flex: 1 }}>
              <AppText variant="titleSmall" color={colors.textSecondary} weight="500">
                {statusInfo.title}
              </AppText>
              
              {/* Dynamic ETA Text display */}
              {order.status === 'out_for_delivery' ? (
                <AppText variant="h2" color={colors.success} weight="700" style={styles.heroEtaText}>
                  Arriving in 8–12 min
                </AppText>
              ) : order.status === 'delivered' ? (
                <AppText variant="h2" color={colors.success} weight="700" style={styles.heroEtaText}>
                  Delivered at {order.deliveredAt ? formatDateTime(order.deliveredAt) : '9:12 PM'}
                </AppText>
              ) : order.estimatedDeliveryTimestamp ? (
                <AppText variant="h2" color={colors.primary} weight="700" style={styles.heroEtaText}>
                  ETA: {formatDateTime(order.estimatedDeliveryTimestamp)}
                </AppText>
              ) : (
                <AppText variant="bodyMedium" color={colors.textSecondary} weight="600" style={{ marginTop: 4 }}>
                  Estimated time will appear shortly
                </AppText>
              )}
              
              <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: SPACING.xs }}>
                {statusInfo.subtitle}
              </AppText>
            </View>

            <View style={[styles.orderIdBadge, { backgroundColor: colors.primaryMuted }]}>
              <AppText variant="caption" color={colors.textPrimaryBrand} weight="700">
                #{order.orderNumber}
              </AppText>
            </View>
          </View>
        </View>

        {/* =========================================================================
            LEVEL 2 — DUAL CAPSULE HORIZONTAL TRACKER
           ========================================================================= */}
        <View style={[styles.horizontalTrackerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.trackerTrack}>
            <View style={[styles.trackerLineBg, { backgroundColor: colors.border }]} />
            <View 
              style={[
                styles.trackerLineActive, 
                { 
                  backgroundColor: colors.primary,
                  width: `${statusInfo.step >= 0 ? (statusInfo.step / 3) * 100 : 0}%` 
                }
              ]} 
            />

            <View style={styles.trackerNodesRow}>
              {/* Node 1: Placed */}
              <View style={[
                styles.trackerNode, 
                statusInfo.step >= 0 ? { backgroundColor: colors.primary } : { backgroundColor: colors.border }
              ]}>
                <Ionicons name="receipt" size={12} color="#FFFFFF" />
              </View>

              {/* Node 2: Preparing */}
              <View style={[
                styles.trackerNode, 
                statusInfo.step >= 1 ? { backgroundColor: colors.primary } : { backgroundColor: colors.border }
              ]}>
                <Ionicons name="cube" size={12} color="#FFFFFF" />
              </View>

              {/* Node 3: On The Way */}
              <View style={[
                styles.trackerNode, 
                statusInfo.step >= 2 ? { backgroundColor: colors.primary } : { backgroundColor: colors.border }
              ]}>
                <Ionicons name="bicycle" size={12} color="#FFFFFF" />
              </View>

              {/* Node 4: Delivered */}
              <View style={[
                styles.trackerNode, 
                statusInfo.step >= 3 ? { backgroundColor: colors.primary } : { backgroundColor: colors.border }
              ]}>
                <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" />
              </View>
            </View>
          </View>
          
          <View style={styles.trackerLabelsRow}>
            <AppText variant="caption" color={statusInfo.step >= 0 ? colors.textPrimary : colors.textMuted} weight={statusInfo.step === 0 ? '700' : '500'} style={styles.trackerLabel}>Placed</AppText>
            <AppText variant="caption" color={statusInfo.step >= 1 ? colors.textPrimary : colors.textMuted} weight={statusInfo.step === 1 ? '700' : '500'} style={styles.trackerLabel}>Preparing</AppText>
            <AppText variant="caption" color={statusInfo.step >= 2 ? colors.textPrimary : colors.textMuted} weight={statusInfo.step === 2 ? '700' : '500'} style={styles.trackerLabel}>On the Way</AppText>
            <AppText variant="caption" color={statusInfo.step >= 3 ? colors.textPrimary : colors.textMuted} weight={statusInfo.step === 3 ? '700' : '500'} style={styles.trackerLabel}>Delivered</AppText>
          </View>
        </View>

        {/* =========================================================================
            LEVEL 3 — LIVE TRACKING VISUAL (MAP VIEW FOR ACTIVE ORDER)
           ========================================================================= */}
        {statusInfo.showMap ? (
          <View style={[styles.mapCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.mapHeaderRow}>
              <View style={styles.pulseIndicator}>
                <View style={[styles.pulseCore, { backgroundColor: colors.success }]} />
                <View style={[styles.pulseWave, { borderColor: colors.success }]} />
              </View>
              <AppText variant="caption" color={colors.textSecondary} weight="600" style={{ marginLeft: 8 }}>
                Live Location Active
              </AppText>
            </View>
            
            <View style={styles.mapContainer}>
              <LiveOrderMap
                colors={colors}
                pharmacyCoords={pharmacyCoords}
                homeCoords={homeCoords}
                riderCoords={riderCoords}
                silverMapStyle={silverMapStyle}
              />
            </View>
          </View>
        ) : (
          /* Detailed Vertical progress timeline for early/completed states */
          <View style={[styles.vTimelineCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <AppText variant="titleSmall" color={colors.textPrimary} weight="700" style={{ marginBottom: SPACING.md }}>
              Fulfillment Status
            </AppText>
            {order.timeline.map((event, index) => {
              const isCompleted = event.isCompleted;
              const isCurrent = event.isCurrent;
              const isLast = index === order.timeline.length - 1;
              return (
                <View key={event.id || index} style={styles.vTimelineRow}>
                  <View style={styles.vTimelineDotColumn}>
                    <View style={[
                      styles.vTimelineDot,
                      isCompleted ? { backgroundColor: colors.success } : isCurrent ? { backgroundColor: colors.primary } : { backgroundColor: colors.border }
                    ]}>
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                      ) : isCurrent ? (
                        <View style={[styles.vTimelineDotInner, { backgroundColor: '#FFFFFF' }]} />
                      ) : null}
                    </View>
                    {!isLast && <View style={[styles.vTimelineConnector, { backgroundColor: isCompleted ? colors.success : colors.border }]} />}
                  </View>
                  <View style={styles.vTimelineContent}>
                    <View style={styles.vTimelineHeader}>
                      <AppText variant="bodySmall" color={isCurrent ? colors.textPrimary : isCompleted ? colors.textPrimary : colors.textMuted} weight={isCurrent ? '700' : '500'}>
                        {event.title}
                      </AppText>
                      {event.timestamp > 0 && (
                        <AppText variant="caption" color={colors.textMuted}>
                          {formatDateTime(event.timestamp)}
                        </AppText>
                      )}
                    </View>
                    <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                      {event.description}
                    </AppText>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* =========================================================================
            LEVEL 4 — LIVE DELIVERY INFORMATION (RIDER CARD)
           ========================================================================= */}
        {hasRider ? (
          <View style={[styles.riderDetailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.riderProfileSection}>
              {order.rider?.photoUrl ? (
                <Image source={{ uri: order.rider.photoUrl }} style={styles.riderAvatarImg} />
              ) : (
                <View style={[styles.riderAvatarFallback, { backgroundColor: colors.primarySubtle }]}>
                  <Ionicons name="person" size={20} color={colors.primary} />
                </View>
              )}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText variant="caption" color={colors.textSecondary} weight="500">
                  Your Delivery Partner
                </AppText>
                <AppText variant="bodyMedium" color={colors.textPrimary} weight="700">
                  {order.rider?.name}
                </AppText>
                <View style={styles.riderRatingRow}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <AppText variant="caption" color={colors.textSecondary} style={{ marginLeft: 4 }}>
                    {order.rider?.rating || '4.9'} • Delivering your order
                  </AppText>
                </View>
              </View>
            </View>
            
            <View style={styles.riderActionRow}>
              <TouchableOpacity
                onPress={() => showToast(`Calling ${order.rider?.name}...`, 'info')}
                style={[styles.riderActionBtn, { backgroundColor: colors.primarySubtle }]}
              >
                <Ionicons name="call" size={16} color={colors.primary} />
                <AppText variant="caption" color={colors.primary} weight="700" style={{ marginLeft: 6 }}>
                  Call Partner
                </AppText>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => showToast(`Opening chat with ${order.rider?.name}...`, 'info')}
                style={[styles.riderActionBtn, { backgroundColor: colors.primarySubtle, marginLeft: 10 }]}
              >
                <Ionicons name="chatbubble-ellipses" size={16} color={colors.primary} />
                <AppText variant="caption" color={colors.primary} weight="700" style={{ marginLeft: 6 }}>
                  Chat
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.emptyRiderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="bicycle" size={18} color={colors.textMuted} />
            <AppText variant="caption" color={colors.textSecondary} style={{ marginLeft: 10, flex: 1 }}>
              Delivery partner will be assigned once your order is ready.
            </AppText>
          </View>
        )}

        {/* =========================================================================
            LEVEL 5 — PHARMACY CARD
           ========================================================================= */}
        <View style={[styles.pharmacyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.pharmacyIconContainer, { backgroundColor: colors.primarySubtle }]}>
            <Ionicons name="storefront" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <AppText variant="caption" color={colors.textSecondary}>
              Preparing Pharmacy
            </AppText>
            <AppText variant="bodySmall" color={colors.textPrimary} weight="700">
              {order.selectedPharmacy?.name || 'Verified HEALIT Partner'}
            </AppText>
            <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
              {order.selectedPharmacy?.distanceKm ? `${order.selectedPharmacy.distanceKm} km away` : 'Licensed Store'} • Verified Doctor Approved
            </AppText>
          </View>
        </View>

        {/* =========================================================================
            LEVEL 6 — EXPANDABLE ORDER SUMMARY CARD
           ========================================================================= */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowItemsDetails(!showItemsDetails)}
            style={styles.summaryHeaderRow}
          >
            <View style={{ flex: 1 }}>
              <AppText variant="caption" color={colors.textSecondary}>
                Order Summary
              </AppText>
              <AppText variant="bodySmall" color={colors.textPrimary} weight="700">
                {order.items.length} {order.items.length === 1 ? 'medicine' : 'medicines'} • {formatCurrency(order.totalAmount)}
              </AppText>
            </View>
            <View style={styles.expandAction}>
              <AppText variant="caption" color={colors.primary} weight="700">
                {showItemsDetails ? 'Hide Details' : 'View Details'}
              </AppText>
              <Ionicons name={showItemsDetails ? 'chevron-up' : 'chevron-down'} size={14} color={colors.primary} style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>

          {showItemsDetails && (
            <View style={styles.summaryDetailsList}>
              <View style={[styles.itemDivider, { backgroundColor: colors.borderLight }]} />
              {order.items.map((item, idx) => (
                <View key={item.medicineId || idx} style={styles.medicationRow}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="bodySmall" color={colors.textPrimary} weight="600">
                      {item.medicineName}
                    </AppText>
                    <AppText variant="caption" color={colors.textMuted}>
                      Qty: {item.quantity} • {item.packForm}
                    </AppText>
                  </View>
                  <AppText variant="bodySmall" color={colors.textPrimary} weight="700">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </AppText>
                </View>
              ))}

              <View style={[styles.itemDivider, { backgroundColor: colors.borderLight }]} />
              
              <View style={styles.financialRow}>
                <AppText variant="caption" color={colors.textSecondary}>Items Total (MRP)</AppText>
                <AppText variant="caption" color={colors.textPrimary}>{formatCurrency(order.mrpTotal || order.totalAmount)}</AppText>
              </View>
              
              {order.savingsTotal > 0 && (
                <View style={styles.financialRow}>
                  <AppText variant="caption" color={colors.success}>Discount Savings</AppText>
                  <AppText variant="caption" color={colors.success} weight="600">-{formatCurrency(order.savingsTotal)}</AppText>
                </View>
              )}

              <View style={styles.financialRow}>
                <AppText variant="caption" color={colors.textSecondary}>Delivery Partner Fee</AppText>
                <AppText variant="caption" color={colors.success} weight="600">FREE</AppText>
              </View>

              <View style={[styles.itemDivider, { backgroundColor: colors.borderLight }]} />

              <View style={styles.financialRow}>
                <AppText variant="bodySmall" color={colors.textPrimary} weight="700">Total Paid Amount</AppText>
                <AppText variant="bodySmall" color={colors.primary} weight="700">{formatCurrency(order.totalAmount)}</AppText>
              </View>
            </View>
          )}
        </View>

        {/* =========================================================================
            LEVEL 7 — COMPACT DELIVERY ADDRESS CARD
           ========================================================================= */}
        <View style={[styles.addressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.addressIconWrapper}>
            <Ionicons name="location" size={18} color={colors.textSecondary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <AppText variant="caption" color={colors.textSecondary}>
              Delivering to
            </AppText>
            <AppText variant="bodySmall" color={colors.textPrimary} weight="700">
              {order.deliveryAddress.label || 'Home Address'}
            </AppText>
            <AppText variant="caption" color={colors.textMuted} numberOfLines={1} style={{ marginTop: 2 }}>
              {order.deliveryAddress.houseFlatNumber}, {order.deliveryAddress.streetAddress}, {order.deliveryAddress.city}
            </AppText>
          </View>
        </View>

        {/* =========================================================================
            LEVEL 8 — COMPACT SUPPORT ENTRY POINT
           ========================================================================= */}
        <View style={[styles.supportEntryPointCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <AppText variant="bodySmall" color={colors.textPrimary} weight="700">
              Need assistance?
            </AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Help with missing medicines, delays, or invoices.
            </AppText>
          </View>
          <TouchableOpacity
            onPress={() => showToast('Connecting to HEALIT Live Care...', 'info')}
            style={[styles.getHelpBtn, { borderColor: colors.primary }]}
          >
            <AppText variant="caption" color={colors.primary} weight="700">
              Get Help
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Action button triggers depending on order state */}
        <View style={styles.footerActionsArea}>
          {order.status === 'preparing' && (
            <AppButton
              title="Contact Pharmacy"
              variant="outline"
              leftIcon={<Ionicons name="call-outline" size={16} color={colors.primary} />}
              onPress={() => showToast(`Calling ${order.selectedPharmacy?.name || 'Pharmacy'}...`, 'info')}
              style={{ marginBottom: SPACING.md }}
            />
          )}

          {order.status === 'out_for_delivery' && (
            <AppButton
              title="Call Delivery Partner"
              variant="primary"
              leftIcon={<Ionicons name="call" size={16} color="#FFFFFF" />}
              onPress={() => showToast(`Calling ${order.rider?.name || 'Rider'}...`, 'info')}
              style={{ marginBottom: SPACING.md }}
            />
          )}

          {order.status === 'delivered' && (
            <View style={{ width: '100%' }}>
              <AppButton
                title="Reorder Medicines"
                variant="primary"
                leftIcon={<Ionicons name="refresh" size={16} color="#FFFFFF" />}
                onPress={handleReorder}
                style={{ marginBottom: SPACING.sm }}
              />
              <AppButton
                title="Download Tax Invoice"
                variant="outline"
                leftIcon={<Ionicons name="document-text-outline" size={16} color={colors.primary} />}
                onPress={() => navigation.navigate('OrderInvoice', { orderId: order.id })}
                style={{ marginBottom: SPACING.md }}
              />
            </View>
          )}

          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setCancelSheetVisible(true)} 
              style={styles.cancelRequestBtn}
            >
              <AppText variant="caption" color={colors.danger} weight="700">
                Cancel this Order
              </AppText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Cancellation Reason Selector */}
      <BottomSheet
        visible={cancelSheetVisible}
        onClose={() => setCancelSheetVisible(false)}
        title="Cancel Order"
      >
        <View style={{ paddingBottom: SPACING.xl }}>
          <AppText variant="bodySmall" color={colors.textSecondary} style={{ marginBottom: SPACING.md }}>
            Please select the reason for cancellation:
          </AppText>
          
          {CANCEL_REASONS.map((reason, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setSelectedReason(reason)}
              style={[styles.reasonSelectorRow, { borderBottomColor: colors.borderLight }]}
            >
              <Ionicons
                name={selectedReason === reason ? 'radio-button-on' : 'radio-button-off'}
                size={18}
                color={colors.primary}
              />
              <AppText variant="bodySmall" color={colors.textPrimary} style={{ marginLeft: 10 }}>
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
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageContent: {
    padding: SPACING.lg,
  },
  heroCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 10, // Adjusted margin spacing for rhythm
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroEtaText: {
    marginTop: 2,
    marginBottom: 2,
  },
  orderIdBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  horizontalTrackerCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  trackerTrack: {
    position: 'relative',
    height: 24,
    justifyContent: 'center',
    marginHorizontal: SPACING.xs,
  },
  trackerLineBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 1.5,
  },
  trackerLineActive: {
    position: 'absolute',
    left: 0,
    height: 3,
    borderRadius: 1.5,
  },
  trackerNodesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackerNode: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackerLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  trackerLabel: {
    width: 60,
    textAlign: 'center',
  },
  mapCard: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pulseIndicator: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pulseWave: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    opacity: 0.6,
  },
  mapContainer: {
    height: 210,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: '#ECEAF3',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapMarkerBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  vTimelineCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  vTimelineRow: {
    flexDirection: 'row',
    minHeight: 48,
  },
  vTimelineDotColumn: {
    alignItems: 'center',
    width: 20,
  },
  vTimelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vTimelineDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  vTimelineConnector: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  vTimelineContent: {
    flex: 1,
    marginLeft: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  vTimelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riderDetailsCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  riderProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riderAvatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  riderAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  riderActionRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  riderActionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 38,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRiderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  pharmacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  pharmacyIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expandAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryDetailsList: {
    marginTop: SPACING.xs,
  },
  itemDivider: {
    height: 1,
    marginVertical: SPACING.sm,
  },
  medicationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  addressIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportEntryPointCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  getHelpBtn: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
  },
  footerActionsArea: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  cancelRequestBtn: {
    paddingVertical: SPACING.xs,
  },
  reasonSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  fallbackMapVisual: {
    height: 110,
    borderRadius: 16,
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  routePathLine: {
    position: 'absolute',
    left: 48,
    right: 48,
    height: 2,
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  routeNodesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeNodeWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  routeRiderBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  nodeTag: {
    position: 'absolute',
    bottom: -18,
    fontSize: 9,
    fontFamily: 'LexendDeca_600SemiBold',
    width: 60,
    textAlign: 'center',
  },
});

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { haptics } from '../../services/hapticService';

import { LiveOrderMap } from '../../components/maps/LiveOrderMap';

const CANCEL_REASONS = [
  'Ordered by mistake',
  'Need medicine faster than estimated time',
  'Found alternative at local clinic',
  'Incorrect delivery address entered',
  'Other reasons',
];

const DELIVERY_INSTRUCTION_OPTIONS = [
  'Ring the doorbell',
  'Call when you arrive',
  'Leave at the door',
  'Hand over to security',
];

const HELP_ISSUES = [
  'Order delayed',
  'Medicine missing',
  'Wrong medicine received',
  'Damaged packaging',
  'Prescription issue',
  'Payment issue',
  'Delivery issue',
  'Other',
];

export const OrderDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'OrderDetails'>>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { showToast } = useToast();
  const { getOrderById, cancelOrder, reorder } = useOrders();

  const orderId = route.params?.orderId || 'ord-101';
  const initialOrder = route.params?.order;

  const [order, setOrder] = useState<Order | null>(initialOrder || null);
  const [isLoading, setIsLoading] = useState(!initialOrder);

  // Map & View States
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Bottom Sheets
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [deliveryDetailsSheetVisible, setDeliveryDetailsSheetVisible] = useState(false);
  const [changeAddressSheetVisible, setChangeAddressSheetVisible] = useState(false);
  const [editInstructionsSheetVisible, setEditInstructionsSheetVisible] = useState(false);
  const [cancelSheetVisible, setCancelSheetVisible] = useState(false);
  const [getHelpSheetVisible, setGetHelpSheetVisible] = useState(false);
  const [orderDetailsModalVisible, setOrderDetailsModalVisible] = useState(false);

  // Form & Selection States
  const [selectedInstruction, setSelectedInstruction] = useState('Ring the doorbell');
  const [customNote, setCustomNote] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('Home');
  const [selectedCancelReason, setSelectedCancelReason] = useState(CANCEL_REASONS[0]);

  useEffect(() => {
    if (!order) {
      getOrderById(orderId).then((data) => {
        setOrder(data);
        setIsLoading(false);
      });
    }
  }, [orderId, order, getOrderById]);

  // Derived Status Info
  const currentStatus: OrderStatus = order?.status || 'preparing';
  const isRxIssue = currentStatus === 'request_created' && order?.items.some((i) => i.rxRequired);
  const isPaymentIssue = (order as any)?.paymentStatus === 'failed';
  const isDelayed = currentStatus === 'preparing' && (order as any)?.isDelayed;

  // Status transition haptic feedback
  useEffect(() => {
    if (order) {
      if (currentStatus === 'delivered') {
        haptics.success();
      } else if (currentStatus === 'out_for_delivery' || currentStatus === 'packed') {
        haptics.medium();
      }
    }
  }, [currentStatus, order]);

  // Timeline Progress Step (0: Placed, 1: Confirmed, 2: Preparing, 3: Out for Delivery, 4: Delivered)
  const timelineStep = useMemo(() => {
    switch (currentStatus) {
      case 'request_created':
      case 'finding_pharmacy':
        return 0;
      case 'offer_selected':
        return 1;
      case 'preparing':
      case 'packed':
        return 2;
      case 'out_for_delivery':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 2;
    }
  }, [currentStatus]);

  // Status Badge Label & Title Data
  const statusCardContent = useMemo(() => {
    if (isRxIssue) {
      return {
        badgeType: 'ACTION REQUIRED',
        badgeColor: '#EF4444',
        badgeBg: '#FEE2E2',
        title: 'Prescription needs review',
        desc: 'Your pharmacy needs a valid prescription before preparing this medicine.',
        eta: 'ETA',
        etaValue: '15',
        actionLabel: 'Review prescription',
      };
    }
    if (isPaymentIssue) {
      return {
        badgeType: 'ACTION REQUIRED',
        badgeColor: '#F59E0B',
        badgeBg: '#FEF3C7',
        title: 'Payment required',
        desc: 'Please complete payment to proceed with pharmacy dispatch.',
        eta: 'ETA',
        etaValue: '--',
        actionLabel: 'Pay now',
      };
    }
    if (isDelayed) {
      return {
        badgeType: '⚠ DELAYED',
        badgeColor: '#F59E0B',
        badgeBg: '#FEF3C7',
        title: 'Your order is taking a little longer',
        desc: 'Your pharmacy is carefully preparing your medicines. Thanks for waiting!',
        eta: 'mins',
        etaValue: '18',
      };
    }

    switch (currentStatus) {
      case 'request_created':
      case 'finding_pharmacy':
        return {
          badgeType: '● SEARCHING',
          badgeColor: '#3B82F6',
          badgeBg: '#DBEAFE',
          title: 'Finding pharmacy partner',
          desc: 'We are matching your order with a nearby verified chemist.',
          eta: 'mins',
          etaValue: '15–20',
        };
      case 'offer_selected':
        return {
          badgeType: '● CONFIRMED',
          badgeColor: '#10B981',
          badgeBg: '#E6F4EA',
          title: 'Pharmacy confirmed order',
          desc: 'CarePlus Pharmacy confirmed your order. Packing will start shortly.',
          eta: 'mins',
          etaValue: '15',
        };
      case 'preparing':
      case 'packed':
        return {
          badgeType: '● ON TRACK',
          badgeColor: '#10B981',
          badgeBg: '#E6F4EA',
          title: 'Preparing your medicines',
          desc: "Your pharmacy is carefully packing your order. We'll notify you once it's picked up.",
          eta: 'mins',
          etaValue: '12',
        };
      case 'packed':
        return {
          badgeType: '● ASSIGNED',
          badgeColor: '#10B981',
          badgeBg: '#E6F4EA',
          title: 'Delivery partner assigned',
          desc: 'Ramesh is heading to the pharmacy to pick up your package.',
          eta: 'mins',
          etaValue: '10',
        };
      case 'out_for_delivery':
        return {
          badgeType: '● ON TIME',
          badgeColor: '#10B981',
          badgeBg: '#E6F4EA',
          title: 'Your medicines are on the way',
          desc: 'Your delivery partner is heading to your address.',
          eta: 'mins',
          etaValue: '8',
        };
      case 'delivered':
        return {
          badgeType: '✓ DELIVERED',
          badgeColor: '#059669',
          badgeBg: '#D1FAE5',
          title: 'Order delivered',
          desc: 'Delivered safely at your address.',
          eta: 'Time',
          etaValue: '10:52',
        };
      default:
        return {
          badgeType: '● ON TRACK',
          badgeColor: '#10B981',
          badgeBg: '#E6F4EA',
          title: 'Preparing your medicines',
          desc: 'Your pharmacy is preparing your medicines.',
          eta: 'mins',
          etaValue: '12',
        };
    }
  }, [currentStatus, isRxIssue, isPaymentIssue, isDelayed]);

  // Handlers
  const handleCancelOrderSubmit = async () => {
    if (timelineStep >= 3) {
      Alert.alert(
        'Cancellation unavailable',
        'Order cancellation is no longer available because your order is already out for delivery.',
        [
          { text: 'Keep order', style: 'cancel' },
          { text: 'Get Help', onPress: () => setGetHelpSheetVisible(true) },
        ]
      );
      setCancelSheetVisible(false);
      return;
    }

    if (order) {
      const result = await cancelOrder(order.id, selectedCancelReason);
      setCancelSheetVisible(false);
      if (result) {
        setOrder(result);
        showToast('Order cancelled successfully', 'info');
      }
    }
  };

  const handleAddressChangeClick = () => {
    if (currentStatus === 'out_for_delivery') {
      Alert.alert(
        'Delivery already in progress',
        'Your medicines are already on the way. The delivery address cannot be changed here.',
        [
          { text: 'Keep current address', style: 'cancel' },
          { text: 'Contact Support', onPress: () => setGetHelpSheetVisible(true) },
        ]
      );
      return;
    }

    if (timelineStep >= 2) {
      Alert.alert(
        'Order being prepared',
        'Your order is already being prepared by the pharmacy. Changing delivery address may affect delivery time.',
        [
          { text: 'Keep current', style: 'cancel' },
          { text: 'Continue', onPress: () => setChangeAddressSheetVisible(true) },
        ]
      );
      return;
    }

    setChangeAddressSheetVisible(true);
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <LoadingState message="Loading live order status..." />
      </View>
    );
  }

  const pharmacyName = order?.selectedPharmacy?.name || 'CarePlus Pharmacy';
  const itemCount = order?.items?.length || 3;
  const isCancelEligible = timelineStep < 2;

  return (
    <View style={styles.screenContainer}>
      {/* 1. Full Screen Live Map Background */}
      <LiveOrderMap
        colors={colors}
        pharmacyName={pharmacyName}
        orderStatus={currentStatus}
        showRider={currentStatus === 'out_for_delivery' || currentStatus === 'packed'}
        onExpandMap={() => setIsMapExpanded(!isMapExpanded)}
        isExpanded={isMapExpanded}
      />

      {/* 2. Floating Top Header */}
      <View style={[styles.topHeaderFloating, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.goBack()}
          style={styles.circleHeaderBtn}
        >
          <Ionicons name="arrow-back" size={20} color="#1E1B4B" />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <View style={styles.headerTitleRow}>
            <AppText style={styles.headerPharmacyName} numberOfLines={1}>
              {pharmacyName}
            </AppText>
            <View style={styles.verifiedCheckBadge}>
              <Ionicons name="checkmark" size={10} color="#FFFFFF" />
            </View>
          </View>
          <AppText style={styles.headerSubtext}>
            Order placed at 10:44 AM • {itemCount} medicines
          </AppText>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setMoreMenuVisible(true)}
          style={styles.circleHeaderBtn}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#1E1B4B" />
        </TouchableOpacity>
      </View>

      {/* Expanded Map Compact Bottom Bar (When map is expanded) */}
      {isMapExpanded ? (
        <View style={[styles.expandedMapBottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.expandedStatusCol}>
            <AppText style={styles.expandedStatusTitle}>{statusCardContent.title}</AppText>
            <AppText style={styles.expandedStatusEta}>{statusCardContent.etaValue} {statusCardContent.eta}</AppText>
          </View>
          <TouchableOpacity
            onPress={() => setDeliveryDetailsSheetVisible(true)}
            style={styles.expandedDetailsBtn}
          >
            <AppText style={styles.expandedDetailsText}>Delivery details</AppText>
            <Ionicons name="chevron-forward" size={14} color="#3A2986" />
          </TouchableOpacity>
        </View>
      ) : (
        /* 3. Normal Mode: Floating Bottom Status Card (Exact Reference Replica) */
        <View style={styles.bottomCardWrapper}>
          <View style={[styles.floatingStatusCard, { backgroundColor: isDark ? '#1E1B4B' : '#FFFFFF', paddingBottom: Math.max(insets.bottom, 16) }]}>
            {/* Top Grab Handle Pill */}
            <View style={styles.cardGrabHandle} />

            {/* Status Label Pill & Main Content Row */}
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardTextCol}>
                <View style={[styles.statusBadgePill, { backgroundColor: statusCardContent.badgeBg }]}>
                  <AppText style={[styles.statusBadgeText, { color: statusCardContent.badgeColor }]}>
                    {statusCardContent.badgeType}
                  </AppText>
                </View>

                <AppText style={[styles.cardStatusTitle, { color: isDark ? '#FFFFFF' : '#1E1B4B' }]}>
                  {statusCardContent.title}
                </AppText>
                <AppText style={[styles.cardStatusDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  {statusCardContent.desc}
                </AppText>
              </View>

              {/* Prominent Right ETA Box */}
              <View style={styles.etaBlockBox}>
                <AppText style={styles.etaNumber}>{statusCardContent.etaValue}</AppText>
                <AppText style={styles.etaMinsText}>{statusCardContent.eta}</AppText>
                <AppText style={styles.etaSubtext}>ETA</AppText>
              </View>
            </View>

            {/* Horizontal Timeline Progress Step Indicator */}
            <View style={styles.timelineProgressSection}>
              <View style={styles.timelineTrackRow}>
                <View style={[styles.timelineTrackLine, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]} />
                <View
                  style={[
                    styles.timelineTrackActiveLine,
                    {
                      width: `${(timelineStep / 4) * 100}%`,
                      backgroundColor: '#3A2986',
                    },
                  ]}
                />
                <View style={styles.timelineNodesContainer}>
                  {[0, 1, 2, 3, 4].map((stepIdx) => {
                    const isDone = stepIdx < timelineStep;
                    const isCurrent = stepIdx === timelineStep;

                    return (
                      <View key={stepIdx} style={styles.timelineNodeBox}>
                        {isDone ? (
                          <View style={styles.timelineDoneNode}>
                            <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                          </View>
                        ) : isCurrent ? (
                          <View style={styles.timelineCurrentNode}>
                            <View style={styles.timelineCurrentInnerDot} />
                          </View>
                        ) : (
                          <View style={styles.timelineUpcomingNode} />
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Timeline Labels Row */}
              <View style={styles.timelineLabelsRow}>
                <View style={styles.timelineLabelCol}>
                  <AppText style={timelineStep >= 0 ? styles.timelineLabelActive : styles.timelineLabelMuted}>
                    Order{'\n'}placed
                  </AppText>
                  <AppText style={styles.timelineTimeText}>10:44 AM</AppText>
                </View>

                <View style={styles.timelineLabelCol}>
                  <AppText style={timelineStep >= 1 ? styles.timelineLabelActive : styles.timelineLabelMuted}>
                    Pharmacy{'\n'}confirmed
                  </AppText>
                  <AppText style={styles.timelineTimeText}>10:46 AM</AppText>
                </View>

                <View style={styles.timelineLabelCol}>
                  <AppText style={timelineStep >= 2 ? styles.timelineLabelActive : styles.timelineLabelMuted}>
                    Preparing{'\n'}order
                  </AppText>
                </View>

                <View style={styles.timelineLabelCol}>
                  <AppText style={timelineStep >= 3 ? styles.timelineLabelActive : styles.timelineLabelMuted}>
                    Out for{'\n'}delivery
                  </AppText>
                </View>

                <View style={styles.timelineLabelCol}>
                  <AppText style={timelineStep >= 4 ? styles.timelineLabelActive : styles.timelineLabelMuted}>
                    Delivered
                  </AppText>
                </View>
              </View>
            </View>

            {/* Delivery Details Action Card */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => setDeliveryDetailsSheetVisible(true)}
              style={[styles.deliveryActionCard, { borderColor: isDark ? '#334155' : '#F0EEF8' }]}
            >
              <View style={styles.deliveryActionIconCircle}>
                <Ionicons name="location" size={16} color="#3A2986" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <AppText style={[styles.deliveryActionTitle, { color: isDark ? '#FFFFFF' : '#1E1B4B' }]}>
                  Delivery details
                </AppText>
                <AppText style={styles.deliveryActionSubtitle} numberOfLines={1}>
                  {selectedAddress} • {selectedInstruction}
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Help Card Row */}
            <View style={[styles.helpCardRow, { backgroundColor: isDark ? '#1E1B4B' : '#F5F3FF' }]}>
              <View style={styles.helpIconCircle}>
                <Ionicons name="headset" size={16} color="#3A2986" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <AppText style={styles.helpTitle}>Need help with your order?</AppText>
                <AppText style={styles.helpSub}>We are here 24/7 to assist you</AppText>
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setGetHelpSheetVisible(true)}
                style={styles.getHelpBtn}
              >
                <AppText style={styles.getHelpBtnText}>Get Help</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* =========================================================================
          BOTTOM SHEETS & MODALS
         ========================================================================= */}

      {/* A. MORE MENU SHEET */}
      <BottomSheet
        visible={moreMenuVisible}
        onClose={() => setMoreMenuVisible(false)}
        title="Order options"
      >
        <View style={{ paddingVertical: 8 }}>
          <TouchableOpacity
            style={styles.sheetOptionRow}
            onPress={() => {
              setMoreMenuVisible(false);
              setOrderDetailsModalVisible(true);
            }}
          >
            <Ionicons name="document-text-outline" size={20} color="#3A2986" style={{ marginRight: 12 }} />
            <AppText style={styles.sheetOptionText}>View order details</AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sheetOptionRow}
            onPress={() => {
              setMoreMenuVisible(false);
              setGetHelpSheetVisible(true);
            }}
          >
            <Ionicons name="help-buoy-outline" size={20} color="#3A2986" style={{ marginRight: 12 }} />
            <AppText style={styles.sheetOptionText}>Get help</AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sheetOptionRow}
            onPress={() => {
              setMoreMenuVisible(false);
              setGetHelpSheetVisible(true);
            }}
          >
            <Ionicons name="alert-circle-outline" size={20} color="#3A2986" style={{ marginRight: 12 }} />
            <AppText style={styles.sheetOptionText}>Report an issue</AppText>
          </TouchableOpacity>

          {isCancelEligible && (
            <TouchableOpacity
              style={styles.sheetOptionRow}
              onPress={() => {
                setMoreMenuVisible(false);
                setCancelSheetVisible(true);
              }}
            >
              <Ionicons name="close-circle-outline" size={20} color="#EF4444" style={{ marginRight: 12 }} />
              <AppText style={[styles.sheetOptionText, { color: '#EF4444' }]}>Cancel order</AppText>
            </TouchableOpacity>
          )}
        </View>
      </BottomSheet>

      {/* B. DELIVERY DETAILS SHEET */}
      <BottomSheet
        visible={deliveryDetailsSheetVisible}
        onClose={() => setDeliveryDetailsSheetVisible(false)}
        title="Delivery details"
      >
        <ScrollView style={{ maxHeight: 420 }}>
          {/* Delivering To Section */}
          <View style={styles.sheetSectionBox}>
            <AppText style={styles.sheetSectionLabel}>DELIVERING TO</AppText>
            <View style={styles.sheetDetailRow}>
              <View style={{ flex: 1 }}>
                <AppText style={styles.sheetBoldTitle}>{selectedAddress}</AppText>
                <AppText style={styles.sheetSubText}>House 24, Sector 15, Chandigarh</AppText>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setDeliveryDetailsSheetVisible(false);
                  handleAddressChangeClick();
                }}
                style={styles.smallActionTextBtn}
              >
                <AppText style={styles.smallActionText}>Change address</AppText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Delivery Instructions Section */}
          <View style={styles.sheetSectionBox}>
            <AppText style={styles.sheetSectionLabel}>DELIVERY INSTRUCTIONS</AppText>
            <View style={styles.sheetDetailRow}>
              <View style={{ flex: 1 }}>
                <AppText style={styles.sheetBoldTitle}>{selectedInstruction}</AppText>
                {customNote ? <AppText style={styles.sheetSubText}>"{customNote}"</AppText> : null}
              </View>
              <TouchableOpacity
                onPress={() => {
                  setDeliveryDetailsSheetVisible(false);
                  setEditInstructionsSheetVisible(true);
                }}
                style={styles.smallActionTextBtn}
              >
                <AppText style={styles.smallActionText}>Edit instructions</AppText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact Section */}
          <View style={styles.sheetSectionBox}>
            <AppText style={styles.sheetSectionLabel}>CONTACT</AppText>
            <AppText style={styles.sheetBoldTitle}>Call on delivery</AppText>
            <AppText style={styles.sheetSubText}>Rider will call your mobile number upon arrival</AppText>
          </View>

          <AppButton
            title="Done"
            onPress={() => setDeliveryDetailsSheetVisible(false)}
            style={{ marginTop: 16 }}
          />
        </ScrollView>
      </BottomSheet>

      {/* C. CHANGE ADDRESS SHEET */}
      <BottomSheet
        visible={changeAddressSheetVisible}
        onClose={() => setChangeAddressSheetVisible(false)}
        title="Select delivery address"
      >
        <View style={{ paddingVertical: 10 }}>
          {['Home', 'Work', 'Parents House'].map((addr) => (
            <TouchableOpacity
              key={addr}
              style={[
                styles.addressSelectOption,
                selectedAddress === addr && styles.addressSelectOptionActive,
              ]}
              onPress={() => {
                setSelectedAddress(addr);
                setChangeAddressSheetVisible(false);
                showToast(`Address updated to ${addr}`, 'success');
              }}
            >
              <Ionicons
                name={addr === 'Home' ? 'home-outline' : addr === 'Work' ? 'briefcase-outline' : 'location-outline'}
                size={20}
                color="#3A2986"
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <AppText style={styles.addressTitle}>{addr}</AppText>
                <AppText style={styles.addressDesc}>House {addr === 'Home' ? '24' : '108'}, Sector 15, Chandigarh</AppText>
              </View>
              {selectedAddress === addr && (
                <Ionicons name="checkmark-circle" size={20} color="#3A2986" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheet>

      {/* D. EDIT INSTRUCTIONS SHEET */}
      <BottomSheet
        visible={editInstructionsSheetVisible}
        onClose={() => setEditInstructionsSheetVisible(false)}
        title="Delivery instructions"
      >
        <ScrollView style={{ maxHeight: 400 }}>
          {DELIVERY_INSTRUCTION_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.instructionCheckRow,
                selectedInstruction === opt && styles.instructionCheckRowActive,
              ]}
              onPress={() => setSelectedInstruction(opt)}
            >
              <Ionicons
                name={selectedInstruction === opt ? 'radio-button-on' : 'radio-button-off'}
                size={18}
                color="#3A2986"
                style={{ marginRight: 10 }}
              />
              <AppText style={styles.instructionText}>{opt}</AppText>
            </TouchableOpacity>
          ))}

          <View style={{ marginTop: 14 }}>
            <AppText style={styles.inputLabel}>Add a delivery note (optional):</AppText>
            <TextInput
              style={styles.instructionInput}
              placeholder="e.g. Please call when you arrive."
              placeholderTextColor="#94A3B8"
              maxLength={120}
              value={customNote}
              onChangeText={setCustomNote}
            />
            <AppText style={styles.charCountText}>{customNote.length}/120 characters</AppText>
          </View>

          <AppButton
            title="Save instructions"
            onPress={() => {
              setEditInstructionsSheetVisible(false);
              showToast('Delivery instructions updated', 'success');
            }}
            style={{ marginTop: 16 }}
          />
        </ScrollView>
      </BottomSheet>

      {/* E. GET HELP / SUPPORT SHEET */}
      <BottomSheet
        visible={getHelpSheetVisible}
        onClose={() => setGetHelpSheetVisible(false)}
        title="How can we help?"
      >
        <ScrollView style={{ maxHeight: 380 }}>
          {HELP_ISSUES.map((issue) => (
            <TouchableOpacity
              key={issue}
              style={styles.helpIssueRow}
              onPress={() => {
                setGetHelpSheetVisible(false);
                showToast(`Support ticket created for: ${issue}`, 'success');
              }}
            >
              <AppText style={styles.helpIssueText}>{issue}</AppText>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BottomSheet>

      {/* F. CANCEL ORDER CONFIRMATION SHEET */}
      <BottomSheet
        visible={cancelSheetVisible}
        onClose={() => setCancelSheetVisible(false)}
        title="Cancel this order?"
      >
        <View style={{ paddingVertical: 6 }}>
          <AppText style={styles.cancelWarningText}>
            Are you sure you want to cancel? Full refund of {formatCurrency(order?.totalAmount || 245)} will be processed to your original payment method.
          </AppText>

          <AppText style={[styles.inputLabel, { marginTop: 12 }]}>Select reason for cancellation:</AppText>
          {CANCEL_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={styles.cancelReasonOption}
              onPress={() => setSelectedCancelReason(reason)}
            >
              <Ionicons
                name={selectedCancelReason === reason ? 'radio-button-on' : 'radio-button-off'}
                size={18}
                color="#3A2986"
                style={{ marginRight: 8 }}
              />
              <AppText style={styles.cancelReasonText}>{reason}</AppText>
            </TouchableOpacity>
          ))}

          <View style={{ flexDirection: 'row', marginTop: 18 }}>
            <AppButton
              title="Keep order"
              variant="outline"
              onPress={() => setCancelSheetVisible(false)}
              style={{ flex: 1, marginRight: 8 }}
            />
            <AppButton
              title="Cancel order"
              onPress={handleCancelOrderSubmit}
              style={{ flex: 1, backgroundColor: '#EF4444' }}
            />
          </View>
        </View>
      </BottomSheet>

      {/* G. FULL ORDER DETAILS MODAL */}
      <Modal
        visible={orderDetailsModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setOrderDetailsModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity onPress={() => setOrderDetailsModalVisible(false)}>
              <Ionicons name="close" size={24} color="#1E1B4B" />
            </TouchableOpacity>
            <AppText style={styles.modalTitle}>Order Details</AppText>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={{ flex: 1, padding: 16 }}>
            <AppText style={styles.modalSubHeader}>MEDICINES ORDERED</AppText>
            {order?.items.map((it, idx) => (
              <View key={idx} style={styles.modalItemRow}>
                <Image source={{ uri: it.image }} style={styles.modalItemImg} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <AppText style={styles.modalItemName}>{it.medicineName}</AppText>
                  <AppText style={styles.modalItemQty}>{it.packForm || 'Strip'} • Qty: {it.quantity}</AppText>
                </View>
                <AppText style={styles.modalItemPrice}>{formatCurrency(it.totalPrice)}</AppText>
              </View>
            ))}

            <AppText style={[styles.modalSubHeader, { marginTop: 20 }]}>PAYMENT SUMMARY</AppText>
            <View style={styles.priceRowModal}>
              <AppText style={styles.priceLabel}>Items Total</AppText>
              <AppText style={styles.priceValue}>{formatCurrency(order?.totalAmount || 245)}</AppText>
            </View>
            <View style={styles.priceRowModal}>
              <AppText style={styles.priceLabel}>Delivery Fee</AppText>
              <AppText style={{ color: '#059669', fontWeight: '700' }}>FREE</AppText>
            </View>
            <View style={[styles.priceRowModal, { borderTopWidth: 1, borderColor: '#E2E8F0', paddingTop: 10, marginTop: 10 }]}>
              <AppText style={{ fontSize: 16, fontWeight: '700', color: '#1E1B4B' }}>Total Amount</AppText>
              <AppText style={{ fontSize: 16, fontWeight: '800', color: '#3A2986' }}>{formatCurrency(order?.totalAmount || 245)}</AppText>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FAF9FE',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 2. Floating Top Header
  topHeaderFloating: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 50,
  },
  circleHeaderBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3A2986',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  headerTitleBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerPharmacyName: {
    fontSize: 16,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
    color: '#1E1B4B',
  },
  verifiedCheckBadge: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#3A2986',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  headerSubtext: {
    fontSize: 11,
    fontFamily: 'LexendDeca_500Medium',
    color: '#64748B',
    marginTop: 2,
  },

  // Expanded Map Bottom Bar
  expandedMapBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 40,
  },
  expandedStatusCol: {
    flex: 1,
  },
  expandedStatusTitle: {
    fontSize: 15,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
    color: '#1E1B4B',
  },
  expandedStatusEta: {
    fontSize: 12,
    fontFamily: 'LexendDeca_600SemiBold',
    color: '#3A2986',
    marginTop: 2,
  },
  expandedDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  expandedDetailsText: {
    fontSize: 12,
    fontFamily: 'LexendDeca_700Bold',
    color: '#3A2986',
    marginRight: 4,
  },

  // 3. Floating Bottom Status Card
  bottomCardWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 40,
  },
  floatingStatusCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 16,
    shadowColor: '#3A2986',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  cardGrabHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C7D2FE',
    alignSelf: 'center',
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTextCol: {
    flex: 1,
    marginRight: 14,
  },
  statusBadgePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  cardStatusTitle: {
    fontSize: 18,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  cardStatusDesc: {
    fontSize: 12,
    fontFamily: 'LexendDeca_400Regular',
    lineHeight: 16,
    marginTop: 4,
  },

  // Prominent Right ETA Block Box
  etaBlockBox: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: '#3A2986',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    shadowColor: '#3A2986',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  etaNumber: {
    fontSize: 22,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  etaMinsText: {
    fontSize: 11,
    fontFamily: 'LexendDeca_600SemiBold',
    color: '#FFFFFF',
    marginTop: -2,
  },
  etaSubtext: {
    fontSize: 8.5,
    fontFamily: 'LexendDeca_500Medium',
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 1,
  },

  // Horizontal Timeline Progress Step Indicator
  timelineProgressSection: {
    marginTop: 18,
    marginBottom: 14,
  },
  timelineTrackRow: {
    position: 'relative',
    height: 18,
    justifyContent: 'center',
  },
  timelineTrackLine: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 2,
  },
  timelineTrackActiveLine: {
    position: 'absolute',
    left: 12,
    height: 2.5,
  },
  timelineNodesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  timelineNodeBox: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  timelineDoneNode: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#3A2986',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCurrentNode: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#3A2986',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCurrentInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3A2986',
  },
  timelineUpcomingNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CBD5E1',
  },
  timelineLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timelineLabelCol: {
    width: '19%',
    alignItems: 'center',
  },
  timelineLabelActive: {
    fontSize: 10,
    fontFamily: 'LexendDeca_600SemiBold',
    fontWeight: '600',
    color: '#1E1B4B',
    textAlign: 'center',
    lineHeight: 12,
  },
  timelineLabelMuted: {
    fontSize: 10,
    fontFamily: 'LexendDeca_500Medium',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 12,
  },
  timelineTimeText: {
    fontSize: 8.5,
    fontFamily: 'LexendDeca_400Regular',
    color: '#64748B',
    marginTop: 2,
  },

  // Delivery Details Action Row
  deliveryActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  deliveryActionIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryActionTitle: {
    fontSize: 13,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
  },
  deliveryActionSubtitle: {
    fontSize: 11,
    fontFamily: 'LexendDeca_400Regular',
    color: '#64748B',
    marginTop: 1,
  },

  // Help Card Row
  helpCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
  },
  helpIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpTitle: {
    fontSize: 12.5,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
    color: '#1E1B4B',
  },
  helpSub: {
    fontSize: 10.5,
    fontFamily: 'LexendDeca_400Regular',
    color: '#64748B',
    marginTop: 1,
  },
  getHelpBtn: {
    borderWidth: 1.5,
    borderColor: '#3A2986',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  getHelpBtnText: {
    fontSize: 11.5,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
    color: '#3A2986',
  },

  // Bottom Sheet Custom Rows
  sheetOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  sheetOptionText: {
    fontSize: 14,
    fontFamily: 'LexendDeca_600SemiBold',
    color: '#1E1B4B',
  },
  sheetSectionBox: {
    marginBottom: 16,
  },
  sheetSectionLabel: {
    fontSize: 10.5,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  sheetDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetBoldTitle: {
    fontSize: 14,
    fontFamily: 'LexendDeca_700Bold',
    color: '#1E1B4B',
  },
  sheetSubText: {
    fontSize: 12,
    fontFamily: 'LexendDeca_400Regular',
    color: '#64748B',
    marginTop: 2,
  },
  smallActionTextBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  smallActionText: {
    fontSize: 12,
    fontFamily: 'LexendDeca_700Bold',
    color: '#3A2986',
  },
  addressSelectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  addressSelectOptionActive: {
    borderColor: '#3A2986',
    backgroundColor: '#F5F3FF',
  },
  addressTitle: {
    fontSize: 13,
    fontFamily: 'LexendDeca_700Bold',
    color: '#1E1B4B',
  },
  addressDesc: {
    fontSize: 11,
    fontFamily: 'LexendDeca_400Regular',
    color: '#64748B',
    marginTop: 1,
  },
  instructionCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  instructionCheckRowActive: {
    backgroundColor: '#F5F3FF',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  instructionText: {
    fontSize: 13,
    fontFamily: 'LexendDeca_500Medium',
    color: '#1E1B4B',
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'LexendDeca_600SemiBold',
    color: '#334155',
    marginBottom: 6,
  },
  instructionInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 10,
    fontSize: 13,
    fontFamily: 'LexendDeca_400Regular',
    color: '#1E1B4B',
    backgroundColor: '#FFFFFF',
  },
  charCountText: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'right',
    marginTop: 4,
  },
  helpIssueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  helpIssueText: {
    fontSize: 13.5,
    fontFamily: 'LexendDeca_600SemiBold',
    color: '#1E1B4B',
  },
  cancelWarningText: {
    fontSize: 12.5,
    fontFamily: 'LexendDeca_400Regular',
    color: '#64748B',
    lineHeight: 18,
  },
  cancelReasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelReasonText: {
    fontSize: 12.5,
    fontFamily: 'LexendDeca_500Medium',
    color: '#334155',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
    color: '#1E1B4B',
  },
  modalSubHeader: {
    fontSize: 11,
    fontFamily: 'LexendDeca_700Bold',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  modalItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 14,
  },
  modalItemImg: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  modalItemName: {
    fontSize: 13,
    fontFamily: 'LexendDeca_700Bold',
    color: '#1E1B4B',
  },
  modalItemQty: {
    fontSize: 11,
    fontFamily: 'LexendDeca_400Regular',
    color: '#64748B',
    marginTop: 2,
  },
  modalItemPrice: {
    fontSize: 13,
    fontFamily: 'LexendDeca_700Bold',
    color: '#3A2986',
  },
  priceRowModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  priceLabel: {
    fontSize: 13,
    fontFamily: 'LexendDeca_500Medium',
    color: '#64748B',
  },
  priceValue: {
    fontSize: 13,
    fontFamily: 'LexendDeca_700Bold',
    color: '#1E1B4B',
  },
});

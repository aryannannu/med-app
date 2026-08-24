import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, Image } from 'react-native';
import { Order } from '../../types/order';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../common/AppText';
import { formatCurrency } from '../../utils/currency';
import { formatDateTime } from '../../utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../store/ThemeContext';
import { useToast } from '../../store/ToastContext';

export interface OrderCardProps {
  order: Order;
  onPress: () => void;
  onReorder?: () => void;
  style?: ViewStyle;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPress,
  onReorder,
  style,
}) => {
  const { colors } = useAppTheme();
  const { showToast } = useToast();

  // Local state to store ratings to make UI interactive
  const [storeRating, setStoreRating] = useState<number>(0);
  const [deliveryRating, setDeliveryRating] = useState<number>(0);

  const getStatusConfig = () => {
    switch (order.status) {
      case 'delivered':
        return {
          color: colors.success,
          bg: colors.successLight,
          icon: 'checkmark-circle' as const,
          label: 'Delivered',
        };
      case 'cancelled':
        return {
          color: colors.danger,
          bg: colors.dangerLight,
          icon: 'close-circle' as const,
          label: 'Cancelled',
        };
      case 'out_for_delivery':
        return {
          color: colors.primary,
          bg: colors.primarySubtle,
          icon: 'bicycle' as const,
          label: 'On the Way',
        };
      case 'preparing':
      case 'packed':
        return {
          color: colors.warning,
          bg: colors.warningLight,
          icon: 'cube-outline' as const,
          label: 'Preparing',
        };
      case 'offers_received':
        return {
          color: colors.secondary,
          bg: colors.secondaryLight,
          icon: 'pricetags-outline' as const,
          label: 'Offers In',
        };
      default:
        return {
          color: colors.info,
          bg: colors.infoLight,
          icon: 'hourglass-outline' as const,
          label: 'Processing',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const isDelivered = order.status === 'delivered';

  const handleRateStore = (rating: number) => {
    setStoreRating(rating);
    showToast(`Rated pharmacy ${rating} stars! Thank you.`, 'success');
  };

  const handleRateDelivery = (rating: number) => {
    setDeliveryRating(rating);
    showToast(`Rated delivery partner ${rating} stars! Thank you.`, 'success');
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        SHADOWS.subtle,
        style
      ]}
    >
      {/* 1. Header: Store Logo + Name + Status */}
      <View style={styles.header}>
        <View style={styles.storeDetails}>
          {order.selectedPharmacy?.logo ? (
            <Image source={{ uri: order.selectedPharmacy.logo }} style={styles.storeLogo} />
          ) : (
            <View style={[styles.storeLogoFallback, { backgroundColor: colors.primarySubtle }]}>
              <Ionicons name="storefront" size={18} color={colors.primary} />
            </View>
          )}
          
          <View style={{ marginLeft: 12, flex: 1 }}>
            <AppText variant="bodySmall" color={colors.textPrimary} weight="700" numberOfLines={1}>
              {order.selectedPharmacy?.name || 'HEALIT Local Store'}
            </AppText>
            <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
              {order.selectedPharmacy?.address?.city || 'Verified Pharmacy'}
            </AppText>
          </View>
        </View>

        {/* Status indicator on the right side */}
        <View style={styles.statusBadgeRow}>
          <Ionicons name={statusConfig.icon} size={13} color={statusConfig.color} />
          <AppText variant="caption" color={statusConfig.color} weight="700" style={{ marginLeft: 4 }}>
            {statusConfig.label}
          </AppText>
        </View>
      </View>

      {/* 2. Items List */}
      <View style={styles.itemsListArea}>
        {order.items.map((item, idx) => (
          <View key={item.medicineId || idx} style={styles.itemRow}>
            <View style={[styles.qtyBadge, { backgroundColor: colors.borderLight }]}>
              <AppText variant="caption" color={colors.textSecondary} weight="700" style={{ fontSize: 9.5 }}>
                {item.quantity}X
              </AppText>
            </View>
            <AppText variant="bodySmall" color={colors.textSecondary} numberOfLines={1} style={styles.itemNameText}>
              {item.medicineName}
            </AppText>
          </View>
        ))}
      </View>

      {/* 3. Ratings section (Only visible when Delivered) */}
      {isDelivered && (
        <>
          <View style={[styles.horizontalDivider, { backgroundColor: colors.borderLight }]} />
          
          <View style={styles.ratingsSection}>
            <View style={styles.ratingColumn}>
              <AppText variant="caption" color={colors.textSecondary} weight="500" style={{ marginBottom: 4 }}>
                Pharmacy Rating
              </AppText>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRateStore(star);
                    }}
                    style={styles.starTouch}
                  >
                    <Ionicons
                      name={star <= storeRating ? "star" : "star-outline"}
                      size={16}
                      color={star <= storeRating ? "#F59E0B" : colors.textMuted}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.verticalDivider, { backgroundColor: colors.borderLight }]} />

            <View style={styles.ratingColumn}>
              <AppText variant="caption" color={colors.textSecondary} weight="500" style={{ marginBottom: 4 }}>
                Delivery Rating
              </AppText>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRateDelivery(star);
                    }}
                    style={styles.starTouch}
                  >
                    <Ionicons
                      name={star <= deliveryRating ? "star" : "star-outline"}
                      size={16}
                      color={star <= deliveryRating ? "#F59E0B" : colors.textMuted}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </>
      )}

      {/* 4. Action Button Row */}
      <View style={styles.actionSection}>
        {isDelivered && onReorder ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={(e) => {
              e.stopPropagation();
              onReorder();
            }}
            style={[styles.primaryActionBtn, { backgroundColor: colors.primarySubtle }]}
          >
            <AppText variant="bodySmall" color={colors.primary} weight="700">
              Reorder
            </AppText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={[styles.primaryActionBtn, { backgroundColor: colors.primarySubtle }]}
          >
            <AppText variant="bodySmall" color={colors.primary} weight="700">
              Track Order
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      {/* 5. Card Footer Info */}
      <View style={styles.cardFooter}>
        <AppText variant="caption" color={colors.textMuted} style={styles.footerText}>
          Ordered: {formatDateTime(order.createdAt)} • Bill Total: {formatCurrency(order.totalAmount)}
        </AppText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: SPACING.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  storeLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  storeLogoFallback: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemsListArea: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  qtyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    minWidth: 24,
    alignItems: 'center',
  },
  itemNameText: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  horizontalDivider: {
    height: 1,
    marginVertical: SPACING.md,
  },
  ratingsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  ratingColumn: {
    flex: 1,
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
  },
  starTouch: {
    padding: 3,
  },
  verticalDivider: {
    width: 1,
    height: 32,
  },
  actionSection: {
    width: '100%',
    marginTop: SPACING.xs,
  },
  primaryActionBtn: {
    width: '100%',
    height: 44,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  footerText: {
    fontSize: 10.5,
  },
});

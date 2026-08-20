import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Order } from '../../types/order';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../common/AppText';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

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
  const getStatusStyle = () => {
    switch (order.status) {
      case 'delivered':
        return {
          color: COLORS.successDark,
          bg: COLORS.successLight,
          icon: 'checkmark-circle' as const,
        };
      case 'cancelled':
        return {
          color: COLORS.dangerDark,
          bg: COLORS.dangerLight,
          icon: 'close-circle' as const,
        };
      case 'out_for_delivery':
        return {
          color: COLORS.primary,
          bg: COLORS.primarySubtle,
          icon: 'bicycle' as const,
        };
      case 'preparing':
      case 'packed':
        return {
          color: COLORS.warningDark,
          bg: COLORS.warningLight,
          icon: 'cube-outline' as const,
        };
      case 'offers_received':
        return {
          color: COLORS.secondaryDark,
          bg: COLORS.secondaryLight,
          icon: 'pricetags-outline' as const,
        };
      default:
        return {
          color: COLORS.infoDark,
          bg: COLORS.infoLight,
          icon: 'hourglass-outline' as const,
        };
    }
  };

  const statusConfig = getStatusStyle();
  const isDelivered = order.status === 'delivered';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, SHADOWS.card, style]}
    >
      {/* Header with Order No & Status */}
      <View style={styles.header}>
        <View>
          <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600">
            Order #{order.orderNumber}
          </AppText>
          <AppText variant="caption" color={COLORS.textMuted} style={styles.date}>
            Placed on {formatDate(order.createdAt)}
          </AppText>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
          <Ionicons name={statusConfig.icon} size={11} color={statusConfig.color} style={{ marginRight: 4 }} />
          <AppText variant="badge" color={statusConfig.color} weight="600">
            {order.statusText}
          </AppText>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Pharmacy & Items summary */}
      {order.selectedPharmacy && (
        <View style={styles.pharmacyRow}>
          <Ionicons name="storefront-outline" size={15} color={COLORS.primary} />
          <AppText variant="bodySmall" color={COLORS.textPrimary} weight="600" style={styles.pharmacyName}>
            {order.selectedPharmacy.name}
          </AppText>
        </View>
      )}

      <View style={styles.itemsSummary}>
        <AppText variant="bodySmall" color={COLORS.textSecondary} numberOfLines={2}>
          {order.items.map((it) => `${it.quantity}x ${it.medicineName}`).join(', ')}
        </AppText>
      </View>

      {/* Footer with Total and Action */}
      <View style={styles.footer}>
        <View>
          <AppText variant="caption" color={COLORS.textMuted}>
            Total Amount
          </AppText>
          <AppText variant="titleMedium" color={COLORS.primary} weight="600">
            {formatCurrency(order.totalAmount)}
          </AppText>
        </View>

        <View style={styles.actionRow}>
          {isDelivered && onReorder && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation();
                onReorder();
              }}
              style={styles.reorderBtn}
            >
              <Ionicons name="repeat" size={13} color={COLORS.primary} style={{ marginRight: 4 }} />
              <AppText variant="buttonSmall" color={COLORS.primary} weight="600">
                Reorder
              </AppText>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={styles.viewBtn}
          >
            <AppText variant="buttonSmall" color={COLORS.textPrimary} weight="600">
              Details
            </AppText>
            <Ionicons name="chevron-forward" size={14} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  date: {
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.xs,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  pharmacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pharmacyName: {
    marginLeft: SPACING.xs,
  },
  itemsSummary: {
    marginVertical: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primarySubtle,
    borderWidth: 1,
    borderColor: COLORS.primaryMuted,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
  },
});

import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Address } from '../../types/user';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../common/AppText';
import { formatPhoneNumber } from '../../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export interface AddressCardProps {
  address: Address;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  style?: ViewStyle;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  isSelected = false,
  onSelect,
  onEdit,
  style,
}) => {
  const Container = onSelect ? TouchableOpacity : View;

  return (
    <Container
      activeOpacity={0.85}
      onPress={onSelect}
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        SHADOWS.subtle,
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.labelPill}>
          <Ionicons
            name={
              address.label === 'Home'
                ? 'home-outline'
                : address.label === 'Work'
                ? 'briefcase-outline'
                : 'location-outline'
            }
            size={14}
            color={COLORS.primary}
          />
          <AppText variant="caption" color={COLORS.primary} weight="600" style={{ marginLeft: 4 }}>
            {address.label.toUpperCase()}
          </AppText>
        </View>

        {isSelected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark-circle" size={15} color={COLORS.primary} />
            <AppText variant="caption" color={COLORS.primary} weight="600" style={{ marginLeft: 3 }}>
              Selected
            </AppText>
          </View>
        )}
      </View>

      <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600" style={styles.recipientName}>
        {address.recipientName}
      </AppText>

      <AppText variant="bodyMedium" color={COLORS.textSecondary} style={styles.fullAddress}>
        {address.houseFlatNumber}, {address.streetAddress}
        {address.landmark ? `, Near ${address.landmark}` : ''}
      </AppText>

      <AppText variant="bodySmall" color={COLORS.textMuted} style={styles.cityPincode}>
        {address.city} - {address.pincode}
      </AppText>

      <AppText variant="bodySmall" color={COLORS.textPrimary} weight="600" style={styles.phone}>
        Phone: {formatPhoneNumber(address.phone)}
      </AppText>

      {onEdit && (
        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={onEdit} style={styles.editBtn}>
            <Ionicons name="pencil-outline" size={14} color={COLORS.primary} />
            <AppText variant="buttonSmall" color={COLORS.primary} weight="600" style={{ marginLeft: 4 }}>
              Edit Address
            </AppText>
          </TouchableOpacity>
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySubtle,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  labelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryLight,
    paddingVertical: 2,
    paddingHorizontal: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  recipientName: {
    marginTop: 4,
  },
  fullAddress: {
    marginTop: 4,
    lineHeight: 20,
  },
  cityPincode: {
    marginTop: 2,
  },
  phone: {
    marginTop: SPACING.xs,
  },
  actionsRow: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
  },
});

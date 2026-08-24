import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Pharmacy } from '../../types/pharmacy';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../common/AppText';
import { RatingBadge } from '../badges/RatingBadge';
import { VerifiedBadge } from '../badges/VerifiedBadge';
import { formatDistance, formatDeliveryTime } from '../../utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../store/ThemeContext';

export interface PharmacyCardProps {
  pharmacy: Pharmacy;
  onPress: () => void;
  style?: ViewStyle;
}

export const PharmacyCard: React.FC<PharmacyCardProps> = ({
  pharmacy,
  onPress,
  style,
}) => {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.subtle, style]}
    >
      <View style={styles.topRow}>
        <Image source={{ uri: pharmacy.logo }} style={[styles.logo, { backgroundColor: colors.surfaceSubtle }]} resizeMode="cover" />

        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <AppText variant="titleMedium" color={colors.textPrimary} numberOfLines={1} weight="600" style={styles.name}>
              {pharmacy.name}
            </AppText>
          </View>

          {pharmacy.isVerified && <VerifiedBadge style={styles.verifiedBadge} />}

          <AppText variant="caption" color={colors.textSecondary} numberOfLines={1} style={styles.address}>
            {pharmacy.address.line1}, {pharmacy.address.city}
          </AppText>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.metaRow}>
        <RatingBadge rating={pharmacy.rating} reviewCount={pharmacy.reviewCount} />

        <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />

        <View style={styles.metaItem}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <AppText variant="caption" color={colors.textSecondary} style={styles.metaText}>
            {formatDistance(pharmacy.distanceKm)}
          </AppText>
        </View>

        <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />

        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <AppText variant="caption" color={colors.textSecondary} style={styles.metaText}>
            {formatDeliveryTime(pharmacy.estimatedDeliveryTimeMinutes)}
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceSubtle,
  },
  infoContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    flex: 1,
  },
  verifiedBadge: {
    marginTop: 4,
  },
  address: {
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 3,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.textMuted,
    marginHorizontal: SPACING.sm,
  },
});

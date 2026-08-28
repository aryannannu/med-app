import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { DetectedMedicine } from '../../types/prescription';
import { AppText } from '../common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../store/ThemeContext';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { haptics } from '../../services/hapticService';
import { formatCurrency } from '../../utils/currency';

interface DetectedMedicineCardProps {
  medicine: DetectedMedicine;
  onQuantityChange: (qty: number) => void;
  onEdit: () => void;
  onRemove: () => void;
}

export const DetectedMedicineCard: React.FC<DetectedMedicineCardProps> = ({
  medicine,
  onQuantityChange,
  onEdit,
  onRemove,
}) => {
  const { colors, isDark } = useAppTheme();

  const handleDecrement = () => {
    if (medicine.quantity > 1) {
      haptics.light();
      onQuantityChange(medicine.quantity - 1);
    }
  };

  const handleIncrement = () => {
    haptics.light();
    onQuantityChange(medicine.quantity + 1);
  };

  const renderStatusBadge = () => {
    switch (medicine.reviewStatus) {
      case 'matched':
        return (
          <View style={[styles.badge, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
            <Ionicons name="checkmark-circle" size={12} color="#059669" style={{ marginRight: 4 }} />
            <AppText variant="caption" color="#047857" weight="700" style={{ fontSize: 10 }}>
              Matched
            </AppText>
          </View>
        );
      case 'review_needed':
        return (
          <View style={[styles.badge, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
            <Ionicons name="alert-circle" size={12} color="#D97706" style={{ marginRight: 4 }} />
            <AppText variant="caption" color="#B45309" weight="700" style={{ fontSize: 10 }}>
              Please Review
            </AppText>
          </View>
        );
      case 'unclear':
        return (
          <View style={[styles.badge, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
            <Ionicons name="help-circle" size={12} color="#DC2626" style={{ marginRight: 4 }} />
            <AppText variant="caption" color="#B91C1C" weight="700" style={{ fontSize: 10 }}>
              Medicine Unclear
            </AppText>
          </View>
        );
    }
  };

  const isUnclear = medicine.reviewStatus === 'unclear';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isUnclear ? '#FCA5A5' : colors.border,
        },
        SHADOWS.subtle,
      ]}
    >
      {/* Top Meta Row: Badges & Actions */}
      <View style={styles.topRow}>
        <View style={styles.badgeCluster}>
          {renderStatusBadge()}

          {medicine.source === 'edited' && (
            <View style={[styles.badge, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', marginLeft: 6 }]}>
              <AppText variant="caption" color="#1D4ED8" weight="600" style={{ fontSize: 10 }}>
                Updated by you
              </AppText>
            </View>
          )}

          {medicine.source === 'manual' && (
            <View style={[styles.badge, { backgroundColor: '#F3E8FF', borderColor: '#DDD6FE', marginLeft: 6 }]}>
              <AppText variant="caption" color="#7C3AED" weight="600" style={{ fontSize: 10 }}>
                Added manually
              </AppText>
            </View>
          )}
        </View>

        <View style={styles.actionsCluster}>
          <TouchableOpacity
            onPress={onEdit}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.miniActionBtn, { backgroundColor: isDark ? colors.surfaceElevated : '#F5F3FF' }]}
          >
            <Ionicons name="pencil" size={14} color={colors.primary} />
            <AppText variant="caption" color={colors.primary} weight="700" style={{ fontSize: 11, marginLeft: 4 }}>
              Edit
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onRemove}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.miniActionBtn, { backgroundColor: '#FEF2F2', marginLeft: 6 }]}
          >
            <Ionicons name="trash-outline" size={14} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Medicine Details */}
      <View style={styles.contentRow}>
        {medicine.image ? (
          <Image source={{ uri: medicine.image }} style={styles.thumb} resizeMode="contain" />
        ) : (
          <View style={[styles.placeholderThumb, { backgroundColor: isDark ? colors.surfaceElevated : '#F3E8FF' }]}>
            <Ionicons name="medkit-outline" size={24} color={colors.primary} />
          </View>
        )}

        <View style={styles.infoCol}>
          <AppText variant="titleSmall" color={colors.textPrimary} weight="700" numberOfLines={2}>
            {medicine.name}
          </AppText>

          <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
            {medicine.composition || medicine.strength} • {medicine.form}
          </AppText>

          {medicine.brandName ? (
            <AppText variant="caption" color={colors.textMuted} style={{ fontSize: 11, marginTop: 1 }}>
              By {medicine.brandName}
            </AppText>
          ) : null}

          {/* Rx Status Notification */}
          {medicine.rxRequired && (
            <View style={styles.rxAttachedRow}>
              <Ionicons name="document-text" size={12} color="#7C3AED" />
              <AppText variant="caption" color="#6D28D9" weight="700" style={{ fontSize: 10, marginLeft: 4 }}>
                Rx • Prescription Attached
              </AppText>
            </View>
          )}
        </View>
      </View>

      {/* Unclear Medicine Notice */}
      {isUnclear ? (
        <View style={[styles.unclearNoticeBox, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
          <Ionicons name="alert-circle-outline" size={16} color="#DC2626" style={{ marginTop: 1 }} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <AppText variant="caption" color="#991B1B" weight="600">
              We couldn't confidently identify this medicine.
            </AppText>
            {medicine.rawOcrText && (
              <AppText variant="caption" color="#B91C1C" style={{ fontSize: 11, marginTop: 2 }}>
                Found text: "{medicine.rawOcrText}"
              </AppText>
            )}
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onEdit}
                style={[styles.findMedicineBtn, { backgroundColor: colors.primary }]}
              >
                <AppText variant="caption" color="#FFFFFF" weight="700">
                  Find Medicine
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onRemove}
                style={styles.unclearRemoveBtn}
              >
                <AppText variant="caption" color="#DC2626" weight="600">
                  Remove
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        /* Dosage Requirement vs Available Pack Clarification */
        <View style={[styles.packClarificationCard, { backgroundColor: isDark ? colors.surfaceElevated : '#F8FAFC', borderColor: colors.border }]}>
          {medicine.dosageInstructions ? (
            <View style={styles.dosageRow}>
              <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
              <AppText variant="caption" color={colors.textSecondary} style={{ marginLeft: 5, fontSize: 11 }}>
                Dosage: {medicine.dosageInstructions}
              </AppText>
            </View>
          ) : null}

          <View style={styles.requirementComparisonRow}>
            {medicine.suggestedRequirement && (
              <View style={styles.reqCol}>
                <AppText variant="caption" color={colors.textMuted} style={{ fontSize: 10 }}>
                  Suggested requirement
                </AppText>
                <AppText variant="caption" color={colors.textPrimary} weight="700">
                  {medicine.suggestedRequirement}
                </AppText>
              </View>
            )}

            <View style={styles.reqDivider} />

            <View style={styles.reqCol}>
              <AppText variant="caption" color={colors.textMuted} style={{ fontSize: 10 }}>
                Available pack
              </AppText>
              <AppText variant="caption" color={colors.primary} weight="700">
                {medicine.availablePack}
              </AppText>
            </View>
          </View>
        </View>
      )}

      {/* Bottom Row: Price & Quantity Controls */}
      {!isUnclear && (
        <View style={styles.footerRow}>
          <View style={styles.priceCol}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <AppText variant="titleSmall" color={colors.textPrimary} weight="800">
                {formatCurrency(medicine.price * medicine.quantity)}
              </AppText>
              {medicine.mrp > medicine.price && (
                <AppText variant="caption" color={colors.textMuted} style={styles.mrpText}>
                  {formatCurrency(medicine.mrp * medicine.quantity)}
                </AppText>
              )}
            </View>
            <AppText variant="caption" color={colors.textMuted} style={{ fontSize: 10 }}>
              {formatCurrency(medicine.price)} / {medicine.availablePack}
            </AppText>
          </View>

          {/* Quantity Stepper */}
          <View style={[styles.stepperContainer, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDFC' }]}>
            <TouchableOpacity
              onPress={handleDecrement}
              disabled={medicine.quantity <= 1}
              style={[styles.stepperBtn, medicine.quantity <= 1 && { opacity: 0.35 }]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="remove" size={16} color={colors.primary} />
            </TouchableOpacity>

            <View style={styles.stepperValueBox}>
              <AppText variant="bodySmall" color={colors.primary} weight="800">
                {medicine.quantity}
              </AppText>
            </View>

            <TouchableOpacity
              onPress={handleIncrement}
              style={styles.stepperBtn}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="add" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Verification notice for Rx medicines */}
      {medicine.rxRequired && !isUnclear && (
        <AppText variant="caption" color={colors.textMuted} style={styles.rxFootnote}>
          The pharmacy will verify your prescription before fulfilment.
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  badgeCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  actionsCluster: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  placeholderThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  rxAttachedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  packClarificationCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginBottom: SPACING.sm,
  },
  dosageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requirementComparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reqCol: {
    flex: 1,
  },
  reqDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  unclearNoticeBox: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginBottom: SPACING.sm,
  },
  findMedicineBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unclearRemoveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.xs,
  },
  priceCol: {
    flex: 1,
  },
  mrpText: {
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValueBox: {
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rxFootnote: {
    fontSize: 10,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

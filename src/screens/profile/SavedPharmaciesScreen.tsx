import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { Ionicons } from '@expo/vector-icons';
import { useSavedPharmacies } from '../../store/SavedPharmaciesContext';
import { useToast } from '../../store/ToastContext';

export const SavedPharmaciesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { savedPharmacies, removeSavedPharmacy } = useSavedPharmacies();
  const { showToast } = useToast();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleConfirmRemove = () => {
    if (!deleteTargetId) return;
    removeSavedPharmacy(deleteTargetId);
    setDeleteTargetId(null);
    showToast('Pharmacy removed from favorites', 'info');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600" style={styles.headerTitle}>
          Saved Pharmacies ({savedPharmacies.length})
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {savedPharmacies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-outline" size={48} color={COLORS.primary} />
            </View>
            <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600" style={{ marginTop: SPACING.md }}>
              No Saved Pharmacies Yet
            </AppText>
            <AppText
              variant="bodySmall"
              color={COLORS.textSecondary}
              align="center"
              style={{ marginTop: SPACING.xs, paddingHorizontal: SPACING.xl }}
            >
              Bookmark your favorite local pharmacies for faster reordering and inventory checks.
            </AppText>
            <AppButton
              title="Explore Nearby Pharmacies"
              variant="primary"
              size="md"
              onPress={() => navigation.navigate('PharmacyListing', {})}
              style={{ marginTop: SPACING.lg }}
            />
          </View>
        ) : (
          <View style={styles.listContainer}>
            {savedPharmacies.map((pharmacy) => (
              <View key={pharmacy.id} style={[styles.pharmacyCard, SHADOWS.card]}>
                <View style={styles.cardHeaderRow}>
                  <Image source={{ uri: pharmacy.logo }} style={styles.pharmacyLogo} />
                  <View style={styles.pharmacyInfo}>
                    <View style={styles.nameRow}>
                      <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600" numberOfLines={1}>
                        {pharmacy.name}
                      </AppText>
                      {pharmacy.isVerified && (
                        <Ionicons name="checkmark-circle" size={16} color="#15803D" style={{ marginLeft: 4 }} />
                      )}
                    </View>
                    <AppText variant="caption" color={COLORS.textSecondary} numberOfLines={1} style={{ marginTop: 2 }}>
                      {pharmacy.address.line1}, {pharmacy.address.city}
                    </AppText>
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <AppText variant="caption" color={COLORS.textPrimary} weight="600" style={{ marginLeft: 3 }}>
                          {pharmacy.rating}
                        </AppText>
                      </View>
                      <AppText variant="caption" color={COLORS.textMuted}>
                        •
                      </AppText>
                      <AppText variant="caption" color={COLORS.textSecondary}>
                        {pharmacy.distanceKm} km away
                      </AppText>
                      <AppText variant="caption" color={COLORS.textMuted}>
                        •
                      </AppText>
                      <AppText variant="caption" color="#15803D" weight="600">
                        {pharmacy.estimatedDeliveryTimeMinutes} mins
                      </AppText>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setDeleteTargetId(pharmacy.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.favBtn}
                  >
                    <Ionicons name="heart" size={20} color="#DC2626" />
                  </TouchableOpacity>
                </View>

                {/* Status Bar */}
                {!pharmacy.isOpen && (
                  <View style={styles.closedBanner}>
                    <Ionicons name="time-outline" size={14} color="#D97706" />
                    <AppText variant="caption" color="#D97706" weight="600" style={{ marginLeft: 4 }}>
                      Currently closed • Opens at 8:00 AM
                    </AppText>
                  </View>
                )}

                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() =>
                      navigation.navigate('PharmacyDetail', {
                        pharmacyId: pharmacy.id,
                        pharmacy,
                      })
                    }
                    style={styles.viewStoreBtn}
                  >
                    <AppText variant="buttonSmall" color={COLORS.primary} weight="600">
                      View Store Inventory
                    </AppText>
                    <Ionicons name="arrow-forward" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Delete Confirmation */}
      <ConfirmationModal
        visible={!!deleteTargetId}
        title="Remove Saved Pharmacy?"
        message="Are you sure you want to remove this pharmacy from your favorites?"
        confirmText="Remove"
        cancelText="Cancel"
        isDestructive
        icon="heart-dislike-outline"
        onConfirm={handleConfirmRemove}
        onCancel={() => setDeleteTargetId(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EE',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 60,
  },
  listContainer: {
    gap: SPACING.md,
  },
  pharmacyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pharmacyLogo: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#F8F8FC',
  },
  pharmacyInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favBtn: {
    padding: 6,
  },
  closedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
  },
  cardActionsRow: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#E8E8EE',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  viewStoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECE8F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

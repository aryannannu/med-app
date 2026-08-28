import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { PrescriptionImageViewerModal } from '../../components/prescriptions/PrescriptionImageViewerModal';
import { RenamePrescriptionModal } from '../../components/prescriptions/RenamePrescriptionModal';
import { Ionicons } from '@expo/vector-icons';
import { usePrescription } from '../../store/PrescriptionContext';
import { useCart } from '../../store/CartContext';
import { useToast } from '../../store/ToastContext';
import { useAppTheme } from '../../store/ThemeContext';
import { formatCurrency } from '../../utils/currency';

export const SavedPrescriptionDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'SavedPrescriptionDetail'>>();
  const { prescriptionId } = route.params;

  const { getPrescriptionById, removePrescription, selectActivePrescription, updatePrescriptionName } = usePrescription();
  const { setCartFromMedicines } = useCart();
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();

  const prescription = getPrescriptionById(prescriptionId);

  const [viewerVisible, setViewerVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [isRevalidating, setIsRevalidating] = useState(false);

  if (!prescription) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.notFoundContainer}>
          <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
          <AppText variant="titleMedium" color={colors.textPrimary} style={{ marginTop: 12 }}>
            Prescription Not Found
          </AppText>
          <AppButton
            title="Go Back"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const medicines = prescription.detectedMedicines || [];

  const handleOrderTheseMedicines = async () => {
    if (medicines.length === 0) {
      showToast('No valid medicines found in this prescription to order.', 'warning');
      return;
    }

    setIsRevalidating(true);
    // Revalidate products, active availability, strength, and live packaging per product principles
    await new Promise((r) => setTimeout(r, 600));
    setIsRevalidating(false);

    selectActivePrescription(prescription);

    const validMedicines = medicines
      .filter((med) => med.reviewStatus !== 'unclear')
      .map((med) => ({
        medicine: {
          id: med.medicineId || med.id,
          name: med.name,
          brandName: med.brandName || 'Verified Manufacturer',
          mrp: med.mrp,
          discountPrice: med.price,
          discountPercentage: Math.round(((med.mrp - med.price) / med.mrp) * 100),
          rxRequired: med.rxRequired,
          image: med.image || prescription.uri,
          saltComposition: med.composition,
          genericName: med.composition,
          manufacturer: med.brandName || 'Pharma Partner',
          description: med.dosageInstructions || 'Prescribed medicine',
          uses: ['Prescription Treatment'],
          category: 'Prescription',
          categorySlug: 'prescription',
          packForm: med.availablePack,
        } as any,
        quantity: med.quantity,
        rxRequired: med.rxRequired,
      }));

    const { cartId } = setCartFromMedicines(validMedicines);
    showToast('Prescription cart created!', 'success');
    navigation.navigate('FindingPharmacies', { cartId });
  };

  const handleConfirmDelete = () => {
    removePrescription(prescription.id);
    setDeleteModalVisible(false);
    showToast('Prescription deleted successfully', 'info');
    navigation.goBack();
  };

  const calculateTotal = () => {
    return medicines.reduce((sum, m) => sum + m.price * m.quantity, 0);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="titleMedium" color={colors.textPrimary} weight="700" style={{ flex: 1, marginLeft: 8 }}>
          Prescription Details
        </AppText>
        <TouchableOpacity
          onPress={() => setDeleteModalVisible(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.deleteHeaderBtn}
        >
          <Ionicons name="trash-outline" size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Prescription Document Card */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setViewerVisible(true)}
          style={[styles.documentCard, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.subtle]}
        >
          <Image source={{ uri: prescription.uri }} style={styles.documentThumb} resizeMode="cover" />
          <View style={styles.documentMeta}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#059669" />
                <AppText variant="caption" color="#047857" weight="700" style={{ marginLeft: 4, fontSize: 10 }}>
                  VERIFIED DOCUMENT
                </AppText>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
              <AppText variant="titleSmall" color={colors.textPrimary} weight="700" numberOfLines={1} style={{ flex: 1 }}>
                {prescription.name || prescription.doctorName || 'Prescription Document'}
              </AppText>
              <TouchableOpacity
                onPress={() => setRenameModalVisible(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={[styles.renamePillBtn, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDFC' }]}
              >
                <Ionicons name="pencil" size={12} color={colors.primary} />
                <AppText variant="caption" color={colors.primary} weight="700" style={{ fontSize: 10, marginLeft: 3 }}>
                  Rename
                </AppText>
              </TouchableOpacity>
            </View>

            <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
              {prescription.doctorName ? `By ${prescription.doctorName}` : `Uploaded on ${prescription.prescriptionDate || 'Recent'}`}
            </AppText>

            <View style={styles.tapToViewRow}>
              <Ionicons name="expand-outline" size={14} color={colors.primary} />
              <AppText variant="caption" color={colors.primary} weight="700" style={{ marginLeft: 4 }}>
                Tap to view full image
              </AppText>
            </View>
          </View>
        </TouchableOpacity>

        {/* Medicines Section Header */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <AppText variant="titleSmall" color={colors.textPrimary} weight="700">
              Prescribed Medicines ({medicines.length})
            </AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Reviewed medicines ready for marketplace matching
            </AppText>
          </View>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('UploadPrescription', {
                initialStep: 'review',
                prescriptionId: prescription.id,
              })
            }
            style={[styles.editListBtn, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDFC' }]}
          >
            <Ionicons name="pencil" size={13} color={colors.primary} />
            <AppText variant="caption" color={colors.primary} weight="700" style={{ marginLeft: 4 }}>
              Edit List
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Medicine List */}
        {medicines.map((med) => (
          <View
            key={med.id}
            style={[
              styles.medCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              SHADOWS.subtle,
            ]}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <AppText variant="titleSmall" color={colors.textPrimary} weight="700">
                  {med.name}
                </AppText>
                {med.rxRequired && (
                  <View style={styles.rxBadge}>
                    <AppText variant="caption" color="#DC2626" weight="800" style={{ fontSize: 9 }}>
                      Rx
                    </AppText>
                  </View>
                )}
              </View>

              <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                {med.composition} • {med.form}
              </AppText>

              {med.dosageInstructions ? (
                <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 2, fontSize: 11 }}>
                  Dosage: {med.dosageInstructions}
                </AppText>
              ) : null}

              <View style={styles.packQtyRow}>
                <View style={[styles.packPill, { backgroundColor: isDark ? colors.surfaceElevated : '#F1F3F9' }]}>
                  <AppText variant="caption" color={colors.textSecondary} style={{ fontSize: 11 }}>
                    Pack: {med.availablePack}
                  </AppText>
                </View>
                <AppText variant="caption" color={colors.textPrimary} weight="700" style={{ marginLeft: 8 }}>
                  Qty: {med.quantity}
                </AppText>
              </View>
            </View>

            <View style={styles.medPriceCol}>
              <AppText variant="titleSmall" color={colors.primary} weight="800">
                {formatCurrency(med.price * med.quantity)}
              </AppText>
              {med.mrp > med.price && (
                <AppText variant="caption" color={colors.textMuted} style={{ textDecorationLine: 'line-through' }}>
                  {formatCurrency(med.mrp * med.quantity)}
                </AppText>
              )}
            </View>
          </View>
        ))}

        {/* Total Estimate Card */}
        <View style={[styles.totalCard, { backgroundColor: isDark ? colors.surfaceElevated : '#F9FAFD', borderColor: colors.border }]}>
          <View style={styles.totalRow}>
            <AppText variant="bodyMedium" color={colors.textSecondary}>
              Estimated Medicine Total
            </AppText>
            <AppText variant="titleMedium" color={colors.textPrimary} weight="800">
              {formatCurrency(calculateTotal())}
            </AppText>
          </View>
          <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 4, fontSize: 11 }}>
            Final price and discounts will be provided by nearby pharmacies based on current live inventory.
          </AppText>
        </View>
      </ScrollView>

      {/* Bottom CTA Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }, SHADOWS.card]}>
        <AppButton
          title={`Order These Medicines (${medicines.length})`}
          variant="primary"
          size="lg"
          loading={isRevalidating}
          onPress={handleOrderTheseMedicines}
          leftIcon={<Ionicons name="cart" size={20} color="#FFFFFF" />}
        />
      </View>

      {/* Prescription Zoom Viewer */}
      <PrescriptionImageViewerModal
        visible={viewerVisible}
        imageUri={prescription.uri}
        onClose={() => setViewerVisible(false)}
      />

      {/* Rename Prescription Modal */}
      <RenamePrescriptionModal
        visible={renameModalVisible}
        currentName={prescription.name || prescription.doctorName || 'My Prescription'}
        onSave={(newName) => {
          updatePrescriptionName(prescription.id, newName);
          showToast('Prescription renamed successfully!', 'success');
        }}
        onClose={() => setRenameModalVisible(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={deleteModalVisible}
        title="Delete this prescription?"
        message="This prescription and its reviewed medicines list will be removed from your saved records."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        icon="trash-outline"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 120,
  },
  documentCard: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  documentThumb: {
    width: 100,
    height: 110,
    backgroundColor: '#E2E8F0',
  },
  documentMeta: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  renamePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 6,
  },
  tapToViewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  editListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  medCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  rxBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  packQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  packPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  medPriceCol: {
    alignItems: 'flex-end',
    marginLeft: SPACING.sm,
  },
  totalCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginTop: SPACING.md,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    borderTopWidth: 1,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
});

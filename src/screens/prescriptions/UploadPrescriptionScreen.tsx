import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { DetectedMedicineCard } from '../../components/prescriptions/DetectedMedicineCard';
import { MedicineSearchModal } from '../../components/prescriptions/MedicineSearchModal';
import { PrescriptionImageViewerModal } from '../../components/prescriptions/PrescriptionImageViewerModal';
import { RenamePrescriptionModal } from '../../components/prescriptions/RenamePrescriptionModal';
import { Ionicons } from '@expo/vector-icons';
import { usePrescription } from '../../store/PrescriptionContext';
import { useCart } from '../../store/CartContext';
import { useToast } from '../../store/ToastContext';
import { useAppTheme } from '../../store/ThemeContext';
import { DetectedMedicine } from '../../types/prescription';
import { haptics } from '../../services/hapticService';
import { formatCurrency } from '../../utils/currency';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SAMPLE_PRESCRIPTIONS = [
  'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80',
];

export const UploadPrescriptionScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'UploadPrescription'>>();
  const fromCart = route.params?.fromCart || false;
  const initialStepParam = route.params?.initialStep;
  const prescriptionIdParam = route.params?.prescriptionId;

  const {
    prescriptions,
    scanSession,
    startScanSession,
    resetScanSession,
    updateMedicineQuantity,
    editDetectedMedicine,
    addMissingMedicine,
    removeDetectedMedicine,
    undoRemoveMedicine,
    savePrescriptionForLater,
    selectActivePrescription,
    loadScanSession,
    updatePrescriptionName,
    getPrescriptionById,
  } = usePrescription();

  const { addToCart, clearCart, setCartFromMedicines } = useCart();
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();

  // Screen Flow Steps: 'list' | 'scan' | 'preview' | 'processing' | 'review'
  const [currentStep, setCurrentStep] = useState<'list' | 'scan' | 'preview' | 'processing' | 'review'>(() => {
    if (initialStepParam) return initialStepParam;
    if (fromCart) return 'scan';
    return prescriptions.length > 0 ? 'list' : 'scan';
  });

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [showQualityWarning, setShowQualityWarning] = useState(false);

  // Modals & Snackbars
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchModalConfig, setSearchModalConfig] = useState<{
    title: string;
    originalOcrText?: string;
    editingId?: string;
  }>({ title: 'Add Another Medicine' });

  const [viewerVisible, setViewerVisible] = useState(false);
  const [customPrescriptionName, setCustomPrescriptionName] = useState<string>('');
  const [renameModalVisible, setRenameModalVisible] = useState<boolean>(false);
  const [editingPrescriptionForRename, setEditingPrescriptionForRename] = useState<{ id: string; name: string } | null>(null);
  const [undoSnackbarVisible, setUndoSnackbarVisible] = useState(false);
  const [removedMedicineName, setRemovedMedicineName] = useState('');
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scanner Laser Animation
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentStep === 'scan') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 240,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [currentStep]);

  // Load existing prescription if passed via params or ensure detected medicines exist in review
  useEffect(() => {
    if (prescriptionIdParam) {
      const rx = getPrescriptionById(prescriptionIdParam);
      if (rx && rx.detectedMedicines && rx.detectedMedicines.length > 0) {
        setCapturedImage(rx.uri);
        setCustomPrescriptionName(rx.name || '');
        loadScanSession(rx.uri, rx.detectedMedicines);
        setCurrentStep('review');
      }
    } else if (initialStepParam === 'review' && scanSession.detectedMedicines.length === 0) {
      const rx = prescriptions[0];
      if (rx && rx.detectedMedicines && rx.detectedMedicines.length > 0) {
        setCapturedImage(rx.uri);
        setCustomPrescriptionName(rx.name || '');
        loadScanSession(rx.uri, rx.detectedMedicines);
      }
    }
  }, [prescriptionIdParam, initialStepParam, getPrescriptionById, loadScanSession, prescriptions, scanSession.detectedMedicines.length]);

  // ----------------------------------------------------
  // CAMERA & PICK ACTIONS
  // ----------------------------------------------------
  const handleCapturePhoto = () => {
    haptics.medium();
    const sample = SAMPLE_PRESCRIPTIONS[0];
    setCapturedImage(sample);
    setShowQualityWarning(false);
    setCurrentStep('preview');
  };

  const handlePickGallery = () => {
    haptics.light();
    const sample = SAMPLE_PRESCRIPTIONS[1];
    setCapturedImage(sample);
    setShowQualityWarning(true); // Demonstrates quality advice UX
    setCurrentStep('preview');
  };

  const handleChooseFile = () => {
    haptics.light();
    const sample = SAMPLE_PRESCRIPTIONS[0];
    setCapturedImage(sample);
    setShowQualityWarning(false);
    setCurrentStep('preview');
  };

  // ----------------------------------------------------
  // PROCEED TO OCR PROCESSING
  // ----------------------------------------------------
  const handleUseThisPrescription = async () => {
    if (!capturedImage) return;
    haptics.selection();
    setCurrentStep('processing');
    try {
      await startScanSession(capturedImage);
      setCurrentStep('review');
    } catch {
      showToast('Prescription scan failed. Please retake or upload again.', 'error');
      setCurrentStep('preview');
    }
  };

  // ----------------------------------------------------
  // REVIEW EDITING & UNDO ACTIONS
  // ----------------------------------------------------
  const handleEditMedicine = (med: DetectedMedicine) => {
    setSearchModalConfig({
      title: `Edit ${med.name}`,
      originalOcrText: med.rawOcrText || med.name,
      editingId: med.id,
    });
    setSearchModalVisible(true);
  };

  const handleAddMedicine = () => {
    setSearchModalConfig({
      title: 'Add Missing Medicine',
      originalOcrText: undefined,
      editingId: undefined,
    });
    setSearchModalVisible(true);
  };

  const handleMedicineSelectedFromSearch = (medData: Partial<DetectedMedicine>) => {
    if (searchModalConfig.editingId) {
      editDetectedMedicine(searchModalConfig.editingId, medData);
      showToast('Medicine updated!', 'success');
    } else {
      const newMed: DetectedMedicine = {
        id: `det-manual-${Date.now()}`,
        medicineId: medData.medicineId,
        name: medData.name || 'Custom Medicine',
        composition: medData.composition || 'Active Salt',
        strength: medData.strength || 'Standard',
        form: medData.form || 'Tablet',
        availablePack: medData.availablePack || 'Strip of 10',
        quantity: 1,
        price: medData.price || 80,
        mrp: medData.mrp || 95,
        rxRequired: medData.rxRequired || false,
        reviewStatus: 'matched',
        source: 'manual',
        brandName: medData.brandName,
        image: medData.image,
      };
      addMissingMedicine(newMed);
      showToast('Medicine added to list!', 'success');
    }
  };

  const handleRemoveMedicine = (med: DetectedMedicine) => {
    const removed = removeDetectedMedicine(med.id);
    if (removed) {
      haptics.light();
      setRemovedMedicineName(removed.name);
      setUndoSnackbarVisible(true);

      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = setTimeout(() => {
        setUndoSnackbarVisible(false);
      }, 4500);
    }
  };

  const handleUndoRemove = () => {
    haptics.success();
    undoRemoveMedicine();
    setUndoSnackbarVisible(false);
    showToast('Medicine restored', 'info');
  };

  // ----------------------------------------------------
  // SAVE FOR LATER
  // ----------------------------------------------------
  const handleSaveForLater = async () => {
    const validMeds = scanSession.detectedMedicines.filter((m) => m.reviewStatus !== 'unclear');
    if (validMeds.length === 0) {
      showToast('Please confirm at least one valid medicine before saving.', 'warning');
      return;
    }

    haptics.success();
    await savePrescriptionForLater(
      capturedImage || undefined,
      scanSession.detectedMedicines,
      prescriptionIdParam,
      customPrescriptionName || undefined
    );
    showToast('Prescription saved to your profile!', 'success');
    setCurrentStep('list');
  };

  // ----------------------------------------------------
  // ORDER NOW / FIND NEARBY PHARMACIES
  // ----------------------------------------------------
  const [isCreatingCart, setIsCreatingCart] = useState(false);

  const handleFindStores = async () => {
    const validMeds = scanSession.detectedMedicines.filter((m) => m.reviewStatus !== 'unclear');

    if (validMeds.length === 0) {
      showToast('Please resolve or remove unclear medicines before finding stores.', 'warning');
      return;
    }

    haptics.selection();
    setIsCreatingCart(true);

    try {
      // 1. Save and set as active prescription for verification at checkout
      const savedRx = await savePrescriptionForLater(
        capturedImage || undefined,
        scanSession.detectedMedicines,
        prescriptionIdParam,
        customPrescriptionName || undefined
      );
      selectActivePrescription(savedRx);

      // 2. Populate active marketplace cart atomically
      const prescriptionCartMedicines = validMeds.map((med) => ({
        medicine: {
          id: med.medicineId || med.id,
          name: med.name,
          brandName: med.brandName || 'Verified Manufacturer',
          mrp: med.mrp,
          discountPrice: med.price,
          discountPercentage: Math.round(((med.mrp - med.price) / med.mrp) * 100),
          rxRequired: med.rxRequired,
          image: med.image || capturedImage || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&q=80',
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

      const { cartId: newCartId } = setCartFromMedicines(prescriptionCartMedicines);

      // 3. Navigate to FindingPharmacies with the active cartId
      setIsCreatingCart(false);
      navigation.navigate('FindingPharmacies', { cartId: newCartId });
    } catch (err) {
      setIsCreatingCart(false);
      showToast('Unable to initiate pharmacy matching. Please try again.', 'error');
    }
  };

  // ====================================================
  // RENDER SCREEN 1: SCAN WITH CAMERA
  // ====================================================
  if (currentStep === 'scan') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: '#111827' }]}>
        {/* Top Camera Controls */}
        <View style={styles.cameraHeader}>
          <TouchableOpacity
            onPress={() => {
              if (prescriptions.length > 0 && !fromCart) {
                setCurrentStep('list');
              } else {
                navigation.goBack();
              }
            }}
            style={styles.cameraCircleBtn}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <AppText variant="titleMedium" color="#FFFFFF" weight="700">
            Scan Prescription
          </AppText>

          <TouchableOpacity onPress={() => setFlashOn((prev) => !prev)} style={styles.cameraCircleBtn}>
            <Ionicons name={flashOn ? 'flash' : 'flash-off'} size={20} color={flashOn ? '#FBBF24' : '#FFFFFF'} />
          </TouchableOpacity>
        </View>

        {/* Camera Document Frame */}
        <View style={styles.cameraViewfinderContainer}>
          <View style={styles.documentTargetFrame}>
            {/* 4 Corner Markers */}
            <View style={[styles.cornerMarker, styles.cornerTL]} />
            <View style={[styles.cornerMarker, styles.cornerTR]} />
            <View style={[styles.cornerMarker, styles.cornerBL]} />
            <View style={[styles.cornerMarker, styles.cornerBR]} />

            {/* Laser scan line */}
            <Animated.View style={[styles.scannerLaserLine, { transform: [{ translateY: scanLineAnim }] }]} />

            <View style={styles.frameCenterHelper}>
              <Ionicons name="document-text-outline" size={44} color="rgba(255, 255, 255, 0.45)" />
              <AppText variant="caption" color="rgba(255, 255, 255, 0.85)" weight="600" style={{ marginTop: 8 }}>
                Align prescription within frame
              </AppText>
            </View>
          </View>

          <AppText variant="caption" color="rgba(255, 255, 255, 0.7)" style={styles.helperNotice}>
            Make sure medicine names, dosage and doctor's stamp are clearly visible.
          </AppText>
        </View>

        {/* Camera Bottom Controls */}
        <View style={styles.cameraBottomBar}>
          <View style={styles.altUploadRow}>
            <TouchableOpacity onPress={handlePickGallery} style={styles.altUploadBtn}>
              <Ionicons name="images-outline" size={20} color="#FFFFFF" />
              <AppText variant="caption" color="#FFFFFF" weight="600" style={{ marginLeft: 6 }}>
                Gallery
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleChooseFile} style={styles.altUploadBtn}>
              <Ionicons name="document-attach-outline" size={20} color="#FFFFFF" />
              <AppText variant="caption" color="#FFFFFF" weight="600" style={{ marginLeft: 6 }}>
                Files (PDF)
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Shutter Capture Button */}
          <TouchableOpacity onPress={handleCapturePhoto} activeOpacity={0.8} style={styles.shutterOuterCircle}>
            <View style={styles.shutterInnerCircle} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ====================================================
  // RENDER SCREEN 2: PRESCRIPTION PREVIEW & QUALITY CHECK
  // ====================================================
  if (currentStep === 'preview') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => setCurrentStep('scan')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <AppText variant="titleMedium" color={colors.textPrimary} weight="700" style={{ flex: 1, marginLeft: 8 }}>
            Prescription Preview
          </AppText>
        </View>

        <ScrollView contentContainerStyle={styles.previewScroll} showsVerticalScrollIndicator={false}>
          {/* Quality Advice Warning Banner */}
          {showQualityWarning && (
            <View style={[styles.warningBanner, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
              <Ionicons name="alert-circle" size={20} color="#D97706" style={{ marginTop: 2 }} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <AppText variant="titleSmall" color="#92400E" weight="700">
                  Some parts may be difficult to read
                </AppText>
                <AppText variant="caption" color="#B45309" style={{ marginTop: 2 }}>
                  Glare or shadows can affect medicine detection. You will review and can correct any medicine on the next step.
                </AppText>
              </View>
            </View>
          )}

          {/* Large Image Preview Card */}
          <View style={[styles.previewImageCard, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.card]}>
            {capturedImage ? (
              <Image source={{ uri: capturedImage }} style={styles.largePreviewImg} resizeMode="contain" />
            ) : null}
          </View>
        </ScrollView>

        {/* Bottom Actions Bar */}
        <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }, SHADOWS.card]}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <AppButton
                title="Retake"
                variant="secondary"
                size="lg"
                onPress={() => setCurrentStep('scan')}
                leftIcon={<Ionicons name="camera-reverse-outline" size={18} color={colors.primary} />}
              />
            </View>
            <View style={{ flex: 2 }}>
              <AppButton
                title={showQualityWarning ? 'Continue Anyway' : 'Use This Prescription'}
                variant="primary"
                size="lg"
                onPress={handleUseThisPrescription}
                rightIcon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ====================================================
  // RENDER SCREEN 3: MULTI-STAGE PROCESSING
  // ====================================================
  if (currentStep === 'processing') {
    const stage = scanSession.processingStage;
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.processingContainer}>
          <View style={[styles.pulseIconCircle, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDFC' }]}>
            <Ionicons name="scan-circle" size={64} color={colors.primary} />
          </View>

          <AppText variant="titleLarge" color={colors.textPrimary} weight="800" style={{ marginTop: 24, textAlign: 'center' }}>
            Reading your prescription…
          </AppText>

          <AppText variant="bodySmall" color={colors.textSecondary} style={{ marginTop: 8, textAlign: 'center', maxWidth: 300 }}>
            Our healthcare assistant is extracting medicines from your prescription document.
          </AppText>

          {/* Contextual Processing Stages */}
          <View style={[styles.stagesCard, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.subtle]}>
            {/* Stage 1 */}
            <View style={styles.stageItem}>
              <View style={[styles.stageIconBox, stage >= 1 && styles.stageIconBoxActive]}>
                {stage > 1 ? (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                ) : (
                  <Ionicons name="ellipsis-horizontal" size={14} color={colors.primary} />
                )}
              </View>
              <AppText
                variant="bodySmall"
                color={stage >= 1 ? colors.textPrimary : colors.textMuted}
                weight={stage === 1 ? '700' : '500'}
                style={{ marginLeft: 12 }}
              >
                Reading medicine names
              </AppText>
            </View>

            {/* Stage 2 */}
            <View style={styles.stageItem}>
              <View style={[styles.stageIconBox, stage >= 2 && styles.stageIconBoxActive]}>
                {stage > 2 ? (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                ) : (
                  <Ionicons name="ellipsis-horizontal" size={14} color={stage === 2 ? colors.primary : colors.textMuted} />
                )}
              </View>
              <AppText
                variant="bodySmall"
                color={stage >= 2 ? colors.textPrimary : colors.textMuted}
                weight={stage === 2 ? '700' : '500'}
                style={{ marginLeft: 12 }}
              >
                Checking strengths and forms
              </AppText>
            </View>

            {/* Stage 3 */}
            <View style={styles.stageItem}>
              <View style={[styles.stageIconBox, stage >= 3 && styles.stageIconBoxActive]}>
                <Ionicons name="ellipsis-horizontal" size={14} color={stage === 3 ? colors.primary : colors.textMuted} />
              </View>
              <AppText
                variant="bodySmall"
                color={stage >= 3 ? colors.textPrimary : colors.textMuted}
                weight={stage === 3 ? '700' : '500'}
                style={{ marginLeft: 12 }}
              >
                Preparing your medicine list
              </AppText>
            </View>
          </View>

          <View style={styles.reassurancePill}>
            <Ionicons name="shield-checkmark" size={14} color="#059669" />
            <AppText variant="caption" color="#047857" weight="700" style={{ marginLeft: 6 }}>
              You'll review everything before ordering.
            </AppText>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ====================================================
  // RENDER SCREEN 4: DETECTED MEDICINES REVIEW
  // ====================================================
  if (currentStep === 'review') {
    const medicines = scanSession.detectedMedicines;
    const validCount = medicines.filter((m) => m.reviewStatus !== 'unclear').length;

    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => setCurrentStep('scan')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
              Medicines We Found
            </AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Review before ordering or saving
            </AppText>
          </View>

          {/* View Prescription Document Link */}
          {capturedImage && (
            <TouchableOpacity onPress={() => setViewerVisible(true)} style={[styles.viewDocLinkBtn, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDFC' }]}>
              <Ionicons name="document-text-outline" size={14} color={colors.primary} />
              <AppText variant="caption" color={colors.primary} weight="700" style={{ marginLeft: 4 }}>
                View Prescription
              </AppText>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.reviewScroll} showsVerticalScrollIndicator={false}>
          {/* Prescription Title & Rename Card */}
          <View style={[styles.rxNameHeaderCard, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.subtle]}>
            <View style={{ flex: 1 }}>
              <AppText variant="caption" color={colors.textMuted} weight="700" style={{ fontSize: 10 }}>
                PRESCRIPTION NAME
              </AppText>
              <AppText variant="titleSmall" color={colors.textPrimary} weight="800" numberOfLines={1} style={{ marginTop: 2 }}>
                {customPrescriptionName || (medicines[0]?.name ? `${medicines[0].name.split(' ')[0]} Care (${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})` : 'Prescription Document')}
              </AppText>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                const current = customPrescriptionName || (medicines[0]?.name ? `${medicines[0].name.split(' ')[0]} Care (${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})` : 'My Prescription');
                setEditingPrescriptionForRename({ id: prescriptionIdParam || 'current', name: current });
                setRenameModalVisible(true);
              }}
              style={[styles.editNamePill, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDFC' }]}
            >
              <Ionicons name="pencil" size={13} color={colors.primary} />
              <AppText variant="caption" color={colors.primary} weight="700" style={{ marginLeft: 4, fontSize: 11 }}>
                Edit Name
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Assistive Guidance Banner */}
          <View style={[styles.assistiveBanner, { backgroundColor: isDark ? colors.surfaceElevated : '#EFF6FF', borderColor: '#BFDBFE' }]}>
            <Ionicons name="information-circle" size={18} color="#2563EB" style={{ marginTop: 1 }} />
            <AppText variant="caption" color="#1E40AF" style={{ flex: 1, marginLeft: 8 }}>
              Review the medicine name, strength and quantity before continuing. You can edit any item or add missing medicines.
            </AppText>
          </View>

          {/* Detected Medicines List */}
          {medicines.map((med) => (
            <DetectedMedicineCard
              key={med.id}
              medicine={med}
              onQuantityChange={(qty) => updateMedicineQuantity(med.id, qty)}
              onEdit={() => handleEditMedicine(med)}
              onRemove={() => handleRemoveMedicine(med)}
            />
          ))}

          {/* Add Another Medicine Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAddMedicine}
            style={[styles.addAnotherBtn, { backgroundColor: colors.surface, borderColor: colors.primaryBorder }]}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <AppText variant="titleSmall" color={colors.primary} weight="700" style={{ marginLeft: 8 }}>
              + Add another medicine
            </AppText>
          </TouchableOpacity>
        </ScrollView>

        {/* Undo Removed Medicine Snackbar */}
        {undoSnackbarVisible && (
          <View style={[styles.undoSnackbar, SHADOWS.card]}>
            <AppText variant="bodySmall" color="#FFFFFF" numberOfLines={1} style={{ flex: 1 }}>
              {removedMedicineName} removed
            </AppText>
            <TouchableOpacity onPress={handleUndoRemove} style={styles.undoBtn}>
              <AppText variant="buttonSmall" color="#FDE047" weight="800">
                UNDO
              </AppText>
            </TouchableOpacity>
          </View>
        )}

        {/* Sticky Dual Bottom Action Bar */}
        <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }, SHADOWS.card]}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <AppButton
                title="Save for Later"
                variant="secondary"
                size="lg"
                onPress={handleSaveForLater}
              />
            </View>
            <View style={{ flex: 2 }}>
              <AppButton
                title={`Find Stores for ${validCount} Medicines`}
                variant="primary"
                size="lg"
                loading={isCreatingCart}
                disabled={validCount === 0 || isCreatingCart}
                onPress={handleFindStores}
                rightIcon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
              />
            </View>
          </View>
        </View>

        {/* Modals */}
        <MedicineSearchModal
          visible={searchModalVisible}
          title={searchModalConfig.title}
          originalOcrText={searchModalConfig.originalOcrText}
          onClose={() => setSearchModalVisible(false)}
          onSelect={handleMedicineSelectedFromSearch}
        />

        <PrescriptionImageViewerModal
          visible={viewerVisible}
          imageUri={capturedImage}
          onClose={() => setViewerVisible(false)}
        />

        {/* Rename Modal */}
        <RenamePrescriptionModal
          visible={renameModalVisible}
          currentName={editingPrescriptionForRename?.name || customPrescriptionName || 'My Prescription'}
          onSave={(newName) => {
            if (editingPrescriptionForRename && editingPrescriptionForRename.id !== 'current') {
              updatePrescriptionName(editingPrescriptionForRename.id, newName);
            }
            setCustomPrescriptionName(newName);
            showToast('Prescription name updated!', 'success');
          }}
          onClose={() => {
            setRenameModalVisible(false);
            setEditingPrescriptionForRename(null);
          }}
        />
      </SafeAreaView>
    );
  }

  // ====================================================
  // RENDER SAVED PRESCRIPTIONS LIST (MY PRESCRIPTIONS)
  // ====================================================
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="titleMedium" color={colors.textPrimary} weight="700" style={{ flex: 1, marginLeft: 8 }}>
          My Prescriptions
        </AppText>
      </View>

      <View style={styles.listContent}>
        {/* Top Scan New Prescription Button (Secondary Style) */}
        <AppButton
          title="+ Scan New Prescription"
          variant="secondary"
          size="md"
          onPress={() => {
            resetScanSession();
            setCurrentStep('scan');
          }}
          leftIcon={<Ionicons name="camera" size={18} color={colors.primary} />}
          style={{ marginBottom: SPACING.md }}
        />

        <FlatList
          data={prescriptions}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
          renderItem={({ item }) => {
            const medCount = item.detectedMedicines?.length || 0;
            const firstMed = item.detectedMedicines?.[0]?.name;
            const summaryText = firstMed
              ? `${firstMed}${medCount > 1 ? ` + ${medCount - 1} more` : ''}`
              : 'Prescription document';

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('SavedPrescriptionDetail', { prescriptionId: item.id })}
                style={[styles.savedRxCard, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.subtle]}
              >
                <Image source={{ uri: item.uri }} style={styles.savedRxThumb} resizeMode="cover" />

                <View style={styles.savedRxInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <AppText variant="caption" color={colors.textMuted}>
                      {item.prescriptionDate || 'Recent'}
                    </AppText>
                    <View style={styles.verifiedTag}>
                      <AppText variant="caption" color="#059669" weight="700" style={{ fontSize: 9 }}>
                        VERIFIED
                      </AppText>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                    <AppText variant="titleSmall" color={colors.textPrimary} weight="700" numberOfLines={1} style={{ flex: 1 }}>
                      {item.name || item.doctorName || 'Prescription Document'}
                    </AppText>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        setEditingPrescriptionForRename({ id: item.id, name: item.name || item.doctorName || 'My Prescription' });
                        setRenameModalVisible(true);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={[styles.miniRenameBtn, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDFC' }]}
                    >
                      <Ionicons name="pencil" size={11} color={colors.primary} />
                      <AppText variant="caption" color={colors.primary} weight="700" style={{ fontSize: 9, marginLeft: 2 }}>
                        Rename
                      </AppText>
                    </TouchableOpacity>
                  </View>

                  <AppText variant="caption" color={colors.textSecondary} numberOfLines={1} style={{ marginTop: 2 }}>
                    {summaryText}
                  </AppText>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Ionicons name="medkit" size={12} color={colors.primary} />
                    <AppText variant="caption" color={colors.primary} weight="700" style={{ marginLeft: 4, fontSize: 11 }}>
                      {medCount} medicines • Ready to order
                    </AppText>
                  </View>
                </View>

                <View style={[styles.viewCtaBtn, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDFC' }]}>
                  <AppText variant="caption" color={colors.primary} weight="700">
                    View
                  </AppText>
                  <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
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
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  cameraCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraViewfinderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  documentTargetFrame: {
    width: SCREEN_WIDTH - 48,
    height: (SCREEN_WIDTH - 48) * 1.3,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerMarker: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#7C3AED',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  scannerLaserLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#A855F7',
    shadowColor: '#A855F7',
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  frameCenterHelper: {
    alignItems: 'center',
  },
  helperNotice: {
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  cameraBottomBar: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  altUploadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  altUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shutterOuterCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInnerCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
  },
  previewScroll: {
    padding: SPACING.lg,
    paddingBottom: 120,
  },
  warningBanner: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  previewImageCard: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    height: 420,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largePreviewImg: {
    width: '100%',
    height: '100%',
  },
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  pulseIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stagesCard: {
    width: '100%',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    marginTop: 24,
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  stageIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageIconBoxActive: {
    backgroundColor: '#7C3AED',
  },
  reassurancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 20,
  },
  reviewScroll: {
    padding: SPACING.lg,
    paddingBottom: 130,
  },
  viewDocLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rxNameHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  editNamePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 8,
  },
  miniRenameBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  assistiveBanner: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  addAnotherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 14,
    marginTop: 4,
  },
  undoSnackbar: {
    position: 'absolute',
    bottom: 96,
    left: 16,
    right: 16,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 99,
  },
  undoBtn: {
    marginLeft: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    borderTopWidth: 1,
  },
  listContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  savedRxCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  savedRxThumb: {
    width: 80,
    height: 90,
    backgroundColor: '#E2E8F0',
  },
  savedRxInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  verifiedTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  viewCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
});

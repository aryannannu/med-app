import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppScreen } from '../../components/layout/AppScreen';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { usePrescription } from '../../store/PrescriptionContext';
import { useToast } from '../../store/ToastContext';
import { useAppTheme } from '../../store/ThemeContext';
import { Prescription } from '../../types/prescription';

export const UploadPrescriptionScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'UploadPrescription'>>();
  const fromCart = route.params?.fromCart || false;

  const [step, setStep] = useState<'list' | 'pick' | 'review' | 'matching'>(fromCart ? 'pick' : 'list');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [matchingProgress, setMatchingProgress] = useState(1);
  const [viewerImage, setViewerImage] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const { prescriptions, uploadPrescription, removePrescription } = usePrescription();
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();

  const handlePickSample = (source: 'camera' | 'gallery' | 'files') => {
    // High-res authentic sample prescription document
    const sampleDoc = 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&q=80';
    setSelectedImage(sampleDoc);
    setStep('review');
  };

  const handleConfirmUpload = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    try {
      await uploadPrescription(
        selectedImage,
        'Dr_Sharma_Rx.jpg',
        'image/jpeg'
      );
      setStep('matching');
    } catch (e) {
      showToast('Prescription upload failed. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // 4-stage matching animation effect
  useEffect(() => {
    if (step === 'matching') {
      const timer1 = setTimeout(() => setMatchingProgress(2), 1200);
      const timer2 = setTimeout(() => setMatchingProgress(3), 2400);
      const timer3 = setTimeout(() => setMatchingProgress(4), 3600);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [step]);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Prescription',
      'Are you sure you want to remove this prescription record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removePrescription(id);
            showToast('Prescription record removed', 'success');
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderHeaderTitle = () => {
    if (step === 'list') return 'My Prescriptions';
    if (step === 'matching') return 'Finding Best Offers';
    return 'Upload Prescription';
  };

  return (
    <AppScreen
      scrollable={step !== 'list'}
      header={
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => {
            if (step === 'pick' && !fromCart) {
              setStep('list');
            } else if (step === 'review') {
              setStep('pick');
            } else {
              navigation.goBack();
            }
          }} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <AppText variant="titleMedium" color={colors.textPrimary} weight="600">
            {renderHeaderTitle()}
          </AppText>
          <View style={{ width: 40 }} />
        </View>
      }
    >
      {/* 1. SAVED PRESCRIPTIONS LIST FLOW */}
      {step === 'list' && (
        <View style={styles.listContainer}>
          {prescriptions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.rxIconCircle, { backgroundColor: colors.surfaceSubtle }]}>
                <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
              </View>
              <AppText variant="titleMedium" color={colors.textPrimary} weight="600" style={{ marginTop: SPACING.md }}>
                No Prescriptions Uploaded
              </AppText>
              <AppText variant="bodyMedium" color={colors.textSecondary} align="center" style={{ marginTop: 6, paddingHorizontal: SPACING.xl }}>
                Upload prescriptions to quickly match with local verified pharmacies and order medicine.
              </AppText>

              <AppButton
                title="+ Upload Prescription"
                variant="primary"
                onPress={() => setStep('pick')}
                style={styles.emptyUploadBtn}
              />
            </View>
          ) : (
            <View style={styles.fullListWrap}>
              <AppButton
                title="+ Upload New Prescription"
                variant="outline"
                size="md"
                onPress={() => setStep('pick')}
                style={styles.topUploadBtn}
              />

              <FlatList
                data={prescriptions}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
                renderItem={({ item }) => (
                  <View style={[styles.rxCard, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.subtle]}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setViewerImage(item.uri)}
                      style={styles.rxCardTouch}
                    >
                      <Image source={{ uri: item.uri }} style={styles.thumbnail} />
                      <View style={styles.rxDetails}>
                        <AppText variant="titleSmall" color={colors.textPrimary} weight="600" numberOfLines={1}>
                          {item.doctorName || 'Dr. Self / Custom'}
                        </AppText>
                        <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                          Uploaded: {formatDate(item.uploadedAt)}
                        </AppText>
                        
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: item.status === 'verified' ? '#D1FAE5' : '#ECE8F7' }
                        ]}>
                          <AppText
                            variant="caption"
                            color={item.status === 'verified' ? '#065F46' : colors.primary}
                            weight="700"
                            style={{ fontSize: 9 }}
                          >
                            {item.status.toUpperCase()}
                          </AppText>
                        </View>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDelete(item.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          )}
        </View>
      )}

      {/* 2. PICK PRESCRIPTION WIZARD */}
      {step === 'pick' && (
        <View style={styles.pickContainer}>
          {/* Main Upload Box */}
          <View style={[styles.uploadBox, SHADOWS.subtle, { borderColor: colors.primaryBorder }]}>
            <View style={styles.rxIconCircle}>
              <Ionicons name="document-text-outline" size={48} color={colors.primary} />
            </View>
            <AppText variant="titleMedium" color={colors.textPrimary} weight="600" style={{ marginTop: SPACING.md }}>
              Click a photo
            </AppText>
            <AppText variant="bodySmall" color={colors.textSecondary} style={{ marginTop: 2 }}>
              or upload from gallery
            </AppText>
            <AppText variant="caption" color={colors.textMuted} style={{ marginTop: SPACING.xs }}>
              JPG, PNG, PDF up to 10MB
            </AppText>
          </View>

          {/* 3 Upload Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handlePickSample('camera')}
              style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.subtle]}
            >
              <Ionicons name="camera-outline" size={24} color={colors.primary} />
              <AppText variant="buttonSmall" color={colors.textPrimary} weight="600" style={{ marginTop: 4 }}>
                Camera
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handlePickSample('gallery')}
              style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.subtle]}
            >
              <Ionicons name="images-outline" size={24} color={colors.primary} />
              <AppText variant="buttonSmall" color={colors.textPrimary} weight="600" style={{ marginTop: 4 }}>
                Gallery
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handlePickSample('files')}
              style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.subtle]}
            >
              <Ionicons name="folder-outline" size={24} color={colors.primary} />
              <AppText variant="buttonSmall" color={colors.textPrimary} weight="600" style={{ marginTop: 4 }}>
                Files
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Guide / Instructions Card */}
          <View style={[styles.guideCard, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.subtle]}>
            <AppText variant="titleSmall" color={colors.textPrimary} weight="600" style={{ marginBottom: SPACING.sm }}>
              Valid Prescription Guide
            </AppText>

            {[
              'Doctor Name & Clinic details must be visible',
              'Patient Name & Date of consultation',
              'Clear medicine name, strength & dosage',
              'Do not crop any side of the prescription',
            ].map((tip, idx) => (
              <View key={idx} style={styles.guideRow}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} />
                <AppText variant="bodySmall" color={colors.textSecondary} style={{ marginLeft: 8, flex: 1 }}>
                  {tip}
                </AppText>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 3. REVIEW SELECTION STEP */}
      {step === 'review' && selectedImage && (
        <View style={styles.reviewContainer}>
          <AppText variant="titleSmall" color={colors.textSecondary} style={{ marginBottom: SPACING.sm }}>
            Review &amp; Confirm Prescription
          </AppText>

          <View style={[styles.previewFrame, { borderColor: colors.primary }, SHADOWS.card]}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="contain" />
            <View style={styles.cropCornerTL} />
            <View style={styles.cropCornerTR} />
            <View style={styles.cropCornerBL} />
            <View style={styles.cropCornerBR} />
          </View>

          <View style={styles.reviewActionsRow}>
            <AppButton
              title="Retake"
              variant="outline"
              onPress={() => setStep('pick')}
              style={{ flex: 1, marginRight: SPACING.sm }}
            />
            <AppButton
              title="Upload & Find Offers"
              variant="primary"
              loading={isUploading}
              onPress={handleConfirmUpload}
              style={{ flex: 2 }}
            />
          </View>
        </View>
      )}

      {/* 4. MATCHING PROGRESS ANIMATION FLOW */}
      {step === 'matching' && (
        <View style={styles.matchingContainer}>
          <View style={[styles.successIconCircle, SHADOWS.card]}>
            <Ionicons name="checkmark-circle" size={56} color={colors.success} />
          </View>

          <AppText variant="h2" color={colors.textPrimary} weight="600" align="center" style={{ marginTop: SPACING.md }}>
            Prescription Uploaded!
          </AppText>

          <AppText variant="bodyMedium" color={colors.textSecondary} align="center" style={{ marginTop: 4, maxWidth: 300 }}>
            We've received your prescription. Hang tight while we find the best pharmacy offers near you.
          </AppText>

          {/* 4-Stage Progress Checklist matching Image 3 Step 5 */}
          <View style={[styles.checklistCard, SHADOWS.subtle]}>
            {[
              { title: 'Prescription Received', done: matchingProgress >= 1, active: matchingProgress === 1 },
              { title: 'Finding Nearby Pharmacies', done: matchingProgress >= 2, active: matchingProgress === 2 },
              { title: 'Collecting Quotes', done: matchingProgress >= 3, active: matchingProgress === 3 },
              { title: 'Comparing Prices & Discounts', done: matchingProgress >= 4, active: matchingProgress === 4 },
            ].map((item, idx) => (
              <View key={idx} style={styles.checklistItemRow}>
                {item.done ? (
                  <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                ) : item.active ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <View style={styles.pendingDot} />
                )}
                <AppText
                  variant="bodyMedium"
                  color={item.done ? COLORS.textPrimary : item.active ? COLORS.primary : COLORS.textMuted}
                  weight={item.done || item.active ? '600' : '400'}
                  style={{ marginLeft: 12 }}
                >
                  {item.title}
                </AppText>
              </View>
            ))}
          </View>

          <AppText variant="caption" color={colors.textMuted} align="center" style={{ marginTop: SPACING.md }}>
            This usually takes 15 - 30 seconds
          </AppText>

          <AppButton
            title={fromCart ? "View Pharmacy Offers" : "Back to Prescriptions"}
            variant="primary"
            onPress={() => {
              if (fromCart) {
                navigation.navigate('CheckoutReview');
              } else {
                setStep('list');
              }
            }}
            style={{ marginTop: SPACING.xl, width: '100%' }}
            rightIcon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
          />
        </View>
      )}

      {/* 5. FULL IMAGE SCREEN VIEWER MODAL */}
      <Modal visible={!!viewerImage} transparent animationType="fade">
        <View style={styles.viewerOverlay}>
          <TouchableOpacity
            style={styles.closeViewerBtn}
            onPress={() => setViewerImage(null)}
          >
            <Ionicons name="close" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          {viewerImage && (
            <Image source={{ uri: viewerImage }} style={styles.viewerImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyUploadBtn: {
    marginTop: SPACING.xl,
    width: 220,
  },
  topUploadBtn: {
    marginBottom: SPACING.lg,
  },
  fullListWrap: {
    flex: 1,
  },
  rxCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  rxCardTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  thumbnail: {
    width: 55,
    height: 55,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  rxDetails: {
    flex: 1,
    marginLeft: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  deleteBtn: {
    padding: 8,
  },
  pickContainer: {
    marginTop: SPACING.md,
  },
  uploadBox: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  rxIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.lg,
  },
  actionBtn: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
  },
  guideCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    marginBottom: SPACING.xxxl,
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  reviewContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xxxl,
  },
  previewFrame: {
    position: 'relative',
    height: 380,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 2,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  cropCornerTL: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#FFFFFF',
  },
  cropCornerTR: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#FFFFFF',
  },
  cropCornerBL: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#FFFFFF',
  },
  cropCornerBR: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#FFFFFF',
  },
  reviewActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  matchingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  successIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    width: '100%',
    marginTop: SPACING.xl,
  },
  checklistItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginLeft: 7,
    marginRight: 7,
  },
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeViewerBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  viewerImage: {
    width: '90%',
    height: '80%',
  },
});

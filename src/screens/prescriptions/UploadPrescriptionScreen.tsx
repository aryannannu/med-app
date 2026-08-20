import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
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
import { Prescription } from '../../types/prescription';

export const UploadPrescriptionScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'UploadPrescription'>>();
  const fromCart = route.params?.fromCart || false;

  const [step, setStep] = useState<'pick' | 'review' | 'matching'>('pick');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [matchingProgress, setMatchingProgress] = useState(1);

  const [isUploading, setIsUploading] = useState(false);
  const { uploadPrescription } = usePrescription();
  const { showToast } = useToast();

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
      const presc = await uploadPrescription(
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

  return (
    <AppScreen
      scrollable
      header={
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600">
            {step === 'matching' ? 'Finding Best Offers' : 'Upload Prescription'}
          </AppText>
          <View style={{ width: 40 }} />
        </View>
      }
    >
      {step === 'pick' && (
        <View style={styles.pickContainer}>
          {/* Main Upload Box */}
          <View style={[styles.uploadBox, SHADOWS.subtle]}>
            <View style={styles.rxIconCircle}>
              <Ionicons name="document-text-outline" size={48} color={COLORS.primary} />
            </View>
            <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600" style={{ marginTop: SPACING.md }}>
              Click a photo
            </AppText>
            <AppText variant="bodySmall" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
              or upload from gallery
            </AppText>
            <AppText variant="caption" color={COLORS.textMuted} style={{ marginTop: SPACING.xs }}>
              JPG, PNG, PDF up to 10MB
            </AppText>
          </View>

          {/* 3 Upload Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handlePickSample('camera')}
              style={[styles.actionBtn, SHADOWS.subtle]}
            >
              <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
              <AppText variant="buttonSmall" color={COLORS.textPrimary} weight="600" style={{ marginTop: 4 }}>
                Camera
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handlePickSample('gallery')}
              style={[styles.actionBtn, SHADOWS.subtle]}
            >
              <Ionicons name="images-outline" size={24} color={COLORS.primary} />
              <AppText variant="buttonSmall" color={COLORS.textPrimary} weight="600" style={{ marginTop: 4 }}>
                Gallery
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handlePickSample('files')}
              style={[styles.actionBtn, SHADOWS.subtle]}
            >
              <Ionicons name="folder-outline" size={24} color={COLORS.primary} />
              <AppText variant="buttonSmall" color={COLORS.textPrimary} weight="600" style={{ marginTop: 4 }}>
                Files
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Guide / Instructions Card */}
          <View style={[styles.guideCard, SHADOWS.subtle]}>
            <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600" style={{ marginBottom: SPACING.sm }}>
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
                <AppText variant="bodySmall" color={COLORS.textSecondary} style={{ marginLeft: 8, flex: 1 }}>
                  {tip}
                </AppText>
              </View>
            ))}
          </View>
        </View>
      )}

      {step === 'review' && selectedImage && (
        <View style={styles.reviewContainer}>
          <AppText variant="titleSmall" color={COLORS.textSecondary} style={{ marginBottom: SPACING.sm }}>
            Review &amp; Confirm Prescription
          </AppText>

          <View style={[styles.previewFrame, SHADOWS.card]}>
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

      {step === 'matching' && (
        <View style={styles.matchingContainer}>
          <View style={[styles.successIconCircle, SHADOWS.card]}>
            <Ionicons name="checkmark-circle" size={56} color={COLORS.success} />
          </View>

          <AppText variant="h2" color={COLORS.textPrimary} weight="600" align="center" style={{ marginTop: SPACING.md }}>
            Prescription Uploaded!
          </AppText>

          <AppText variant="bodyMedium" color={COLORS.textSecondary} align="center" style={{ marginTop: 4, maxWidth: 300 }}>
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
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
                ) : item.active ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
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

          <AppText variant="caption" color={COLORS.textMuted} align="center" style={{ marginTop: SPACING.md }}>
            This usually takes 15 - 30 seconds
          </AppText>

          <AppButton
            title="View Pharmacy Offers"
            variant="primary"
            onPress={() => {
              if (fromCart) {
                navigation.navigate('CheckoutReview');
              } else {
                navigation.navigate('OfferComparison', { cartId: 'cart-1' });
              }
            }}
            style={{ marginTop: SPACING.xl, width: '100%' }}
            rightIcon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
          />
        </View>
      )}
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
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderColor: COLORS.primaryMuted,
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
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  guideCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    borderColor: COLORS.primary,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  cropCornerTL: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: COLORS.primary,
  },
  cropCornerTR: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: COLORS.primary,
  },
  cropCornerBL: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: COLORS.primary,
  },
  cropCornerBR: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: COLORS.primary,
  },
  reviewActionsRow: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
  },
  matchingContainer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxxl,
  },
  successIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checklistItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  pendingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../../store/OrderContext';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../../store/ToastContext';

export const DeleteAccountScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { activeOrders } = useOrders();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [selectedReason, setSelectedReason] = useState<string>('privacy');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [isDeleting, setIsDeleting] = useState(false);

  const hasActiveOrder = activeOrders.length > 0;
  const activeOrder = activeOrders[0];

  const REASONS = [
    { id: 'privacy', label: 'I have health data privacy concerns' },
    { id: 'unused', label: 'I no longer need medicine deliveries' },
    { id: 'duplicate', label: 'I created another account with a different number' },
    { id: 'experience', label: 'Poor delivery or customer service experience' },
    { id: 'other', label: 'Other reason' },
  ];

  const handleInitiateDelete = () => {
    if (hasActiveOrder) {
      showToast('Cannot delete account while an order is active', 'error');
      return;
    }
    setShowOtpModal(true);
    showToast(`Verification code sent to +91 ${user?.phoneNumber || '9876543210'} (Code: 123456)`, 'info');
  };

  const handleFinalDelete = async () => {
    setIsDeleting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsDeleting(false);
    setShowOtpModal(false);

    showToast('Your HEALIT account has been deleted permanently.', 'info');
    await logout();
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
        <AppText variant="titleMedium" color={COLORS.danger} weight="600" style={styles.headerTitle}>
          Delete Account
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Order Blocker Banner */}
        {hasActiveOrder ? (
          <View style={[styles.blockerCard, SHADOWS.card]}>
            <View style={styles.blockerIconCircle}>
              <Ionicons name="alert-circle" size={32} color="#DC2626" />
            </View>
            <AppText variant="titleMedium" color="#DC2626" weight="600" style={{ marginTop: SPACING.md }}>
              Active Order in Progress
            </AppText>
            <AppText variant="bodySmall" color={COLORS.textSecondary} align="center" style={{ marginTop: SPACING.xs }}>
              You currently have an ongoing medicine order (#{activeOrder?.id?.toUpperCase() || 'HL-ORDER'}). Please wait until the delivery is completed or resolved before deleting your account.
            </AppText>
            <AppButton
              title="View Active Order"
              variant="outline"
              size="md"
              onPress={() => activeOrder?.id && navigation.navigate('OrderDetails', { orderId: activeOrder.id })}
              style={{ marginTop: SPACING.lg, width: '100%' }}
            />
          </View>
        ) : (
          <>
            {/* Warning Card */}
            <View style={[styles.warningCard, SHADOWS.subtle]}>
              <View style={styles.warningHeader}>
                <Ionicons name="warning-outline" size={22} color="#DC2626" />
                <AppText variant="titleSmall" color="#DC2626" weight="600" style={{ marginLeft: 8 }}>
                  Permanent Action
                </AppText>
              </View>
              <AppText variant="bodySmall" color={COLORS.textPrimary} style={{ marginTop: SPACING.xs, lineHeight: 20 }}>
                Deleting your HEALIT account is permanent and cannot be undone. You will immediately lose:
              </AppText>

              <View style={styles.consequencesList}>
                <View style={styles.consequenceItem}>
                  <Ionicons name="close-circle" size={16} color="#DC2626" />
                  <AppText variant="caption" color={COLORS.textSecondary} style={{ marginLeft: 6 }}>
                    All saved delivery addresses and contacts
                  </AppText>
                </View>
                <View style={styles.consequenceItem}>
                  <Ionicons name="close-circle" size={16} color="#DC2626" />
                  <AppText variant="caption" color={COLORS.textSecondary} style={{ marginLeft: 6 }}>
                    Uploaded prescription records and digital vault
                  </AppText>
                </View>
                <View style={styles.consequenceItem}>
                  <Ionicons name="close-circle" size={16} color="#DC2626" />
                  <AppText variant="caption" color={COLORS.textSecondary} style={{ marginLeft: 6 }}>
                    Any remaining HEALIT Wallet balance &amp; coupons
                  </AppText>
                </View>
              </View>
            </View>

            {/* Reason Selector */}
            <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600" style={{ marginTop: SPACING.lg, marginBottom: SPACING.sm }}>
              Please let us know why you are leaving:
            </AppText>

            <View style={[styles.reasonsCard, SHADOWS.subtle]}>
              {REASONS.map((r, idx) => {
                const isSelected = selectedReason === r.id;
                return (
                  <React.Fragment key={r.id}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setSelectedReason(r.id)}
                      style={styles.reasonRow}
                    >
                      <Ionicons
                        name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={isSelected ? '#DC2626' : COLORS.textMuted}
                      />
                      <AppText variant="bodySmall" color={COLORS.textPrimary} style={{ marginLeft: SPACING.md, flex: 1 }}>
                        {r.label}
                      </AppText>
                    </TouchableOpacity>
                    {idx < REASONS.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                );
              })}
            </View>

            {/* Action Buttons */}
            <AppButton
              title="Delete My Account"
              variant="danger"
              size="lg"
              onPress={handleInitiateDelete}
              style={{ marginTop: SPACING.xl }}
            />

            <AppButton
              title="Keep My Account"
              variant="outline"
              size="lg"
              onPress={() => navigation.goBack()}
              style={{ marginTop: SPACING.sm }}
            />
          </>
        )}
      </ScrollView>

      {/* Confirmation OTP Sheet */}
      <Modal visible={showOtpModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.modal]}>
            <View style={styles.modalHeader}>
              <AppText variant="titleMedium" color="#DC2626" weight="600">
                Confirm Account Deletion
              </AppText>
              <TouchableOpacity onPress={() => setShowOtpModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <AppText variant="bodySmall" color={COLORS.textSecondary} style={{ marginTop: SPACING.md }}>
              Enter the 6-digit verification code sent to +91 {user?.phoneNumber || '9876543210'} to permanently erase your account.
            </AppText>

            <View style={styles.otpBoxesRow}>
              {otp.map((d, i) => (
                <TextInput
                  key={i}
                  value={d}
                  onChangeText={(val) => {
                    const copy = [...otp];
                    copy[i] = val.slice(-1);
                    setOtp(copy);
                  }}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={styles.otpBox}
                />
              ))}
            </View>

            <AppButton
              title={isDeleting ? 'Erasing Account...' : 'Permanently Delete Account'}
              variant="danger"
              size="md"
              loading={isDeleting}
              onPress={handleFinalDelete}
              style={{ marginTop: SPACING.lg }}
            />
          </View>
        </View>
      </Modal>
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
  blockerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: SPACING.xl,
  },
  blockerIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  consequencesList: {
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  consequenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reasonsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8EE',
    marginHorizontal: SPACING.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EE',
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.lg,
  },
  otpBox: {
    width: 44,
    height: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#DC2626',
    backgroundColor: '#F8F8FC',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
});

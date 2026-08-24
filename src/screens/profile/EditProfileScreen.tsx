import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../../store/ToastContext';
import { useAppTheme } from '../../store/ThemeContext';
import { formatPhoneNumber } from '../../utils/formatters';

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();

  const [name, setName] = useState(user?.name || 'Aryan Kumar');
  const [email, setEmail] = useState(user?.email || 'aryan.kumar@example.com');
  const [phone, setPhone] = useState(user?.phoneNumber || '9876543210');
  const [dob, setDob] = useState('14 Aug 1996');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [isSaving, setIsSaving] = useState(false);

  // Errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  // Mobile Change Modal State
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [phoneOtp, setPhoneOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [otpStep, setOtpStep] = useState<'input' | 'otp'>('input');
  const [phoneModalError, setPhoneModalError] = useState('');
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);

  const validate = () => {
    let isValid = true;
    setNameError('');
    setEmailError('');

    if (!name.trim()) {
      setNameError('Full name is required');
      isValid = false;
    } else if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      isValid = false;
    } else if (name.trim().length > 50) {
      setNameError('Name cannot exceed 50 characters');
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() && !emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSaving(false);

    showToast('Profile updated successfully!', 'success');
    navigation.goBack();
  };

  // Phone Change Handlers
  const handleSendOtp = async () => {
    if (!newPhone || newPhone.length !== 10) {
      setPhoneModalError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (newPhone === phone) {
      setPhoneModalError('New number cannot be the same as current number');
      return;
    }

    setPhoneModalError('');
    setIsVerifyingPhone(true);
    await new Promise((r) => setTimeout(r, 500));
    setIsVerifyingPhone(false);
    setOtpStep('otp');
    showToast('OTP sent to +91 ' + newPhone + ' (Test code: 123456)', 'info');
  };

  const handleVerifyPhoneOtp = async () => {
    const entered = phoneOtp.join('');
    if (entered.length !== 6) {
      setPhoneModalError('Please enter 6-digit code');
      return;
    }

    setIsVerifyingPhone(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsVerifyingPhone(false);

    setPhone(newPhone);
    setShowPhoneModal(false);
    setOtpStep('input');
    setNewPhone('');
    showToast('Mobile number updated successfully!', 'success');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="titleMedium" color={colors.textPrimary} weight="600" style={styles.headerTitle}>
          Personal Information
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.initialsAvatar}>
                  <AppText variant="h2" color="#FFFFFF" weight="600">
                    {name.slice(0, 1).toUpperCase()}
                  </AppText>
                </View>
              )}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => showToast('Photo picker opened', 'info')}
                style={styles.avatarEditBadge}
              >
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: SPACING.sm }}>
              Tap to change profile picture
            </AppText>
          </View>

          {/* Form Fields */}
          <View style={[styles.card, SHADOWS.subtle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <AppText variant="caption" color={colors.textSecondary} weight="600" style={styles.label}>
                FULL NAME *
              </AppText>
              <TextInput
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  if (nameError) setNameError('');
                }}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, nameError ? styles.inputError : null]}
              />
              {nameError ? (
                <AppText variant="caption" color={colors.danger} style={styles.errorText}>
                  {nameError}
                </AppText>
              ) : null}
            </View>

            {/* Mobile Number with Change Trigger */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <AppText variant="caption" color={colors.textSecondary} weight="600" style={styles.label}>
                  MOBILE NUMBER * (LOGIN ID)
                </AppText>
                <TouchableOpacity onPress={() => setShowPhoneModal(true)}>
                  <AppText variant="caption" color={colors.primary} weight="600">
                    Change
                  </AppText>
                </TouchableOpacity>
              </View>
              <View style={styles.phoneDisplayBox}>
                <AppText variant="bodyMedium" color={colors.textPrimary} weight="600">
                  +91 {formatPhoneNumber(phone)}
                </AppText>
                <View style={styles.verifiedTag}>
                  <Ionicons name="checkmark-circle" size={14} color="#15803D" />
                  <AppText variant="caption" color="#15803D" weight="600" style={{ marginLeft: 3, fontSize: 11 }}>
                    Verified
                  </AppText>
                </View>
              </View>
            </View>

            {/* Email Address */}
            <View style={styles.fieldGroup}>
              <AppText variant="caption" color={colors.textSecondary} weight="600" style={styles.label}>
                EMAIL ADDRESS (FOR INVOICES)
              </AppText>
              <TextInput
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (emailError) setEmailError('');
                }}
                placeholder="Enter email address"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, emailError ? styles.inputError : null]}
              />
              {emailError ? (
                <AppText variant="caption" color={colors.danger} style={styles.errorText}>
                  {emailError}
                </AppText>
              ) : null}
            </View>

            {/* Date of Birth */}
            <View style={styles.fieldGroup}>
              <AppText variant="caption" color={colors.textSecondary} weight="600" style={styles.label}>
                DATE OF BIRTH (OPTIONAL)
              </AppText>
              <TextInput
                value={dob}
                onChangeText={setDob}
                placeholder="DD Month YYYY (e.g. 14 Aug 1996)"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>

            {/* Gender */}
            <View style={styles.fieldGroupLast}>
              <AppText variant="caption" color={colors.textSecondary} weight="600" style={styles.label}>
                GENDER
              </AppText>
              <View style={styles.genderRow}>
                {(['male', 'female', 'other'] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setGender(g)}
                    style={[
                      styles.genderPill,
                      gender === g ? styles.genderPillActive : null,
                    ]}
                  >
                    <AppText
                      variant="bodySmall"
                      color={gender === g ? '#FFFFFF' : COLORS.textSecondary}
                      weight="600"
                    >
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Sticky Save CTA */}
        <View style={[styles.bottomBar, SHADOWS.modal]}>
          <AppButton
            title={isSaving ? 'Saving Changes...' : 'Save Profile'}
            variant="primary"
            size="lg"
            loading={isSaving}
            onPress={handleSave}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Change Mobile Number Modal */}
      <Modal visible={showPhoneModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.modal]}>
            <View style={styles.modalHeader}>
              <AppText variant="titleMedium" color={colors.textPrimary} weight="600">
                Change Mobile Number
              </AppText>
              <TouchableOpacity onPress={() => setShowPhoneModal(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {otpStep === 'input' ? (
              <View style={{ marginTop: SPACING.md }}>
                <AppText variant="bodySmall" color={colors.textSecondary} style={{ marginBottom: SPACING.md }}>
                  Enter your new 10-digit mobile number. We will send a 6-digit OTP to verify.
                </AppText>

                <View style={styles.phoneInputRow}>
                  <View style={styles.countryCodeBox}>
                    <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
                      🇮🇳 +91
                    </AppText>
                  </View>
                  <TextInput
                    value={newPhone}
                    onChangeText={(t) => {
                      setNewPhone(t.replace(/\D/g, ''));
                      if (phoneModalError) setPhoneModalError('');
                    }}
                    placeholder="New Mobile Number"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    maxLength={10}
                    style={styles.phoneInput}
                  />
                </View>

                {phoneModalError ? (
                  <AppText variant="caption" color={colors.danger} style={styles.errorText}>
                    {phoneModalError}
                  </AppText>
                ) : null}

                <AppButton
                  title={isVerifyingPhone ? 'Sending OTP...' : 'Send Verification OTP'}
                  variant="primary"
                  size="md"
                  loading={isVerifyingPhone}
                  onPress={handleSendOtp}
                  style={{ marginTop: SPACING.lg }}
                />
              </View>
            ) : (
              <View style={{ marginTop: SPACING.md }}>
                <AppText variant="bodySmall" color={colors.textSecondary} style={{ marginBottom: SPACING.md }}>
                  Enter the 6-digit OTP sent to <AppText variant="bodySmall" weight="600" color={colors.textPrimary}>+91 {newPhone}</AppText>
                </AppText>

                <View style={styles.otpBoxesRow}>
                  {phoneOtp.map((d, i) => (
                    <TextInput
                      key={i}
                      value={d}
                      onChangeText={(val) => {
                        const copy = [...phoneOtp];
                        copy[i] = val.slice(-1);
                        setPhoneOtp(copy);
                      }}
                      keyboardType="number-pad"
                      maxLength={1}
                      style={styles.otpBox}
                    />
                  ))}
                </View>

                {phoneModalError ? (
                  <AppText variant="caption" color={colors.danger} style={styles.errorText}>
                    {phoneModalError}
                  </AppText>
                ) : null}

                <AppButton
                  title={isVerifyingPhone ? 'Verifying...' : 'Confirm New Number'}
                  variant="primary"
                  size="md"
                  loading={isVerifyingPhone}
                  onPress={handleVerifyPhoneOtp}
                  style={{ marginTop: SPACING.lg }}
                />
              </View>
            )}
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
    paddingBottom: 100,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  initialsAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  fieldGroup: {
    marginBottom: SPACING.lg,
  },
  fieldGroupLast: {
    marginBottom: 0,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  inputError: {
    borderColor: COLORS.danger,
    backgroundColor: '#FEF2F2',
  },
  phoneDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 4,
  },
  errorText: {
    marginTop: 4,
  },
  genderRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  genderPill: {
    flex: 1,
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E8E8EE',
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
  phoneInputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  countryCodeBox: {
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 15,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.md,
  },
  otpBox: {
    width: 44,
    height: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: '#F8F8FC',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
});





import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../../store/ToastContext';
import { useAppTheme } from '../../store/ThemeContext';
import { formatPhoneNumber } from '../../utils/formatters';

export const OtpVerificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<AuthStackParamList, 'OtpVerification'>>();
  const phoneNumber = route.params?.phoneNumber || '9876543210';

  const [otpDigits, setOtpDigits] = useState(['1', '2', '3', '4', '5', '6']);
  const [resendTimer, setResendTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const { verifyOtp, login } = useAuth();
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleDigitChange = (value: string, index: number) => {
    const cleanVal = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (cleanVal.length > 1) {
      // User pasted full OTP
      const pasted = cleanVal.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
      return;
    }

    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);
    if (error) setError('');

    // Auto-advance
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const otpValue = otpDigits.join('');
  const isOtpComplete = otpValue.length === 6;

  const handleVerify = async () => {
    if (!isOtpComplete) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await verifyOtp(phoneNumber, otpValue);
      setLoading(false);

      if (res.success) {
        showToast('Welcome to HEALIT!', 'success');
      } else {
        setError("That code isn't correct. Try again.");
      }
    } catch (e) {
      setLoading(false);
      setError('Couldnâ€™t connect. Check your internet connection and try again.');
    }
  };

  const handleResend = async () => {
    if (resendTimer === 0) {
      setError('');
      try {
        const res = await login(phoneNumber);
        setResendTimer(30);
        setOtpDigits(['1', '2', '3', '4', '5', '6']);
        showToast(`New code sent! Test OTP is ${res.testOtp || '123456'}`, 'info');
      } catch (e) {
        showToast('Couldnâ€™t send a new code. Please try again.', 'error');
      }
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Top Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={[styles.iconCircle, SHADOWS.subtle]}>
            <Ionicons name="shield-checkmark-outline" size={36} color={colors.primary} />
          </View>

          <AppText variant="h1" color={colors.textPrimary} weight="600" style={styles.title}>
            Verify your number
          </AppText>

          <View style={styles.subtitleRow}>
            <AppText variant="bodyMedium" color={colors.textSecondary}>
              Enter the 6-digit code sent to{' '}
              <AppText variant="bodyMedium" weight="600" color={colors.textPrimary}>
                +91 {phoneNumber.slice(0, 2)}XXX {phoneNumber.slice(-4)}
              </AppText>
            </AppText>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.changeNumberBtn}>
              <AppText variant="caption" color={colors.primary} weight="600">
                Change
              </AppText>
            </TouchableOpacity>
          </View>

          {/* 6-Digit OTP Boxes */}
          <View style={styles.otpBoxesRow}>
            {otpDigits.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(ref) => {
                  inputRefs.current[idx] = ref;
                }}
                value={digit}
                onChangeText={(val) => handleDigitChange(val, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                style={[
                  styles.otpBox,
                  digit ? styles.otpBoxFilled : null,
                  error ? styles.otpBoxError : null,
                  SHADOWS.subtle,
                ]}
              />
            ))}
          </View>

          {error ? (
            <AppText variant="caption" color={colors.danger} align="center" style={styles.errorText}>
              {error}
            </AppText>
          ) : null}

          {/* Resend Timer / Action */}
          <View style={styles.resendContainer}>
            {resendTimer > 0 ? (
              <AppText variant="caption" color={colors.textSecondary}>
                Resend code in <AppText variant="caption" color={colors.primary} weight="600">{resendTimer}s</AppText>
              </AppText>
            ) : (
              <View style={styles.resendActionRow}>
                <AppText variant="caption" color={colors.textSecondary}>
                  Didn't receive the code?{' '}
                </AppText>
                <TouchableOpacity onPress={handleResend}>
                  <AppText variant="caption" color={colors.primary} weight="600">
                    Resend code
                  </AppText>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Verify Button */}
          <AppButton
            title="Verify & Continue"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={!isOtpComplete || loading}
            onPress={handleVerify}
            style={styles.verifyBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8FC',
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    paddingVertical: SPACING.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: SPACING.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    marginBottom: SPACING.xs,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  changeNumberBtn: {
    marginLeft: 6,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: SPACING.md,
  },
  otpBox: {
    width: 46,
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8E8EE',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  otpBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySubtle,
  },
  otpBoxError: {
    borderColor: COLORS.danger,
  },
  errorText: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  resendContainer: {
    marginVertical: SPACING.md,
    alignItems: 'center',
  },
  resendActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifyBtn: {
    width: '100%',
    marginTop: SPACING.lg,
  },
});


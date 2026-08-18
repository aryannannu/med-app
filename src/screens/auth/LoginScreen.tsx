import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { HealitLogo } from '../../components/common/HealitLogo';
import { Ionicons } from '@expo/vector-icons';
import { isValidIndianPhoneNumber } from '../../utils/validators';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../../store/ToastContext';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Login'>>();
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();

  const isPhoneValid = isValidIndianPhoneNumber(phoneNumber);

  const handleSendOtp = async () => {
    if (!isPhoneValid) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const normalized = phoneNumber.replace(/\D/g, '');
      const res = await login(normalized);
      setLoading(false);

      if (res.success) {
        showToast(`Verification code sent! Test OTP is ${res.testOtp || '123456'}`, 'info', 4000);
        navigation.navigate('OtpVerification', { phoneNumber: normalized });
      }
    } catch (e) {
      setLoading(false);
      setError('Couldn’t send verification code. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const res = await login('9876543210');
      setLoading(false);
      if (res.success) {
        showToast('Signed in with Google!', 'success');
      }
    } catch (e) {
      setLoading(false);
      showToast('Couldn’t sign you in with Google. Please try again.', 'error');
    }
  };

  const handleContinueAsGuest = async () => {
    setLoading(true);
    try {
      const res = await login('9876543210');
      setLoading(false);
      if (res.success) {
        showToast('Welcome to HEALIT!', 'success');
      }
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. Top Visual Showcase: Floating Angled Medicine Cards matching Reference Screen */}
          <View style={styles.showcaseSection}>
            {/* Card 1 */}
            <View style={[styles.floatingCard, styles.card1, SHADOWS.card]}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80' }}
                style={styles.floatingMedImg}
                resizeMode="contain"
              />
              <View style={styles.floatingMedInfo}>
                <AppText variant="caption" color={COLORS.textSecondary} weight="700" style={{ fontSize: 10 }}>
                  CIPLA
                </AppText>
                <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700">
                  Amoxicillin Capsules
                </AppText>
                <AppText variant="caption" color={COLORS.textMuted}>
                  250mg • 10N
                </AppText>
              </View>
              <View style={styles.floatingPriceCol}>
                <AppText variant="caption" color={COLORS.textMuted} style={styles.strikePrice}>
                  ₹150
                </AppText>
                <AppText variant="titleSmall" color={COLORS.textPrimary} weight="800">
                  ₹135
                </AppText>
              </View>
            </View>

            {/* Card 2 */}
            <View style={[styles.floatingCard, styles.card2, SHADOWS.card]}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&q=80' }}
                style={styles.floatingMedImg}
                resizeMode="contain"
              />
              <View style={styles.floatingMedInfo}>
                <AppText variant="caption" color={COLORS.textSecondary} weight="700" style={{ fontSize: 10 }}>
                  CIPLA
                </AppText>
                <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700">
                  Atorvastatin Tablets
                </AppText>
                <AppText variant="caption" color={COLORS.textMuted}>
                  20mg • 30N
                </AppText>
              </View>
              <View style={styles.floatingPriceCol}>
                <AppText variant="caption" color={COLORS.textMuted} style={styles.strikePrice}>
                  ₹120
                </AppText>
                <AppText variant="titleSmall" color={COLORS.textPrimary} weight="800">
                  ₹99
                </AppText>
              </View>
            </View>

            {/* Card 3 */}
            <View style={[styles.floatingCard, styles.card3, SHADOWS.card]}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&q=80' }}
                style={styles.floatingMedImg}
                resizeMode="contain"
              />
              <View style={styles.floatingMedInfo}>
                <AppText variant="caption" color={COLORS.textSecondary} weight="700" style={{ fontSize: 10 }}>
                  STERIS
                </AppText>
                <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700">
                  Lisinopril Tablets
                </AppText>
                <AppText variant="caption" color={COLORS.textMuted}>
                  2.5mg • 10N
                </AppText>
              </View>
              <View style={styles.floatingPriceCol}>
                <AppText variant="caption" color={COLORS.textMuted} style={styles.strikePrice}>
                  ₹130
                </AppText>
                <AppText variant="titleSmall" color={COLORS.textPrimary} weight="800">
                  ₹110
                </AppText>
              </View>
            </View>
          </View>

          {/* 2. HEALIT Logo Header */}
          <View style={styles.logoSection}>
            <HealitLogo width={160} height={52} />
            <AppText variant="h2" color={COLORS.textPrimary} weight="800" align="center" style={{ marginTop: SPACING.sm }}>
              We Deliver Care
            </AppText>
            <AppText variant="bodyMedium" color={COLORS.textSecondary} align="center" style={{ marginTop: 2 }}>
              Log in or sign up
            </AppText>
          </View>

          {/* 3. Phone Input Section with Country Code */}
          <View style={styles.inputSection}>
            <View style={styles.phoneInputRow}>
              {/* Country Code Box */}
              <View style={[styles.countryCodeBox, SHADOWS.subtle]}>
                <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700">
                  🇮🇳 +91
                </AppText>
              </View>

              {/* Mobile Number Box */}
              <View style={[styles.phoneInputBox, error ? styles.inputBoxError : null, SHADOWS.subtle]}>
                <TextInput
                  value={phoneNumber}
                  onChangeText={(txt) => {
                    setPhoneNumber(txt.replace(/\D/g, ''));
                    if (error) setError('');
                  }}
                  placeholder="Mobile Number"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={styles.textInput}
                />
              </View>
            </View>

            {error ? (
              <AppText variant="caption" color={COLORS.danger} style={styles.errorText}>
                {error}
              </AppText>
            ) : null}

            {/* Primary CTA */}
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={loading || !isPhoneValid}
              onPress={handleSendOtp}
              style={[
                styles.primaryCta,
                !isPhoneValid ? styles.primaryCtaDisabled : styles.primaryCtaEnabled,
                SHADOWS.subtle,
              ]}
            >
              <AppText
                variant="button"
                color={isPhoneValid ? '#FFFFFF' : '#707070'}
                weight="700"
              >
                {loading ? 'Sending Code...' : 'Log in'}
              </AppText>
            </TouchableOpacity>
          </View>

          {/* 4. OR Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <AppText variant="caption" color={COLORS.textMuted} weight="700" style={styles.orText}>
              OR
            </AppText>
            <View style={styles.dividerLine} />
          </View>

          {/* 5. Secondary Options: Google & Guest */}
          <View style={styles.secondaryActionsSection}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleGoogleLogin}
              style={[styles.socialBtn, SHADOWS.subtle]}
            >
              <Ionicons name="logo-google" size={18} color="#EA4335" style={{ marginRight: SPACING.sm }} />
              <AppText variant="buttonSmall" color={COLORS.textPrimary} weight="700">
                Continue with google
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleContinueAsGuest}
              style={[styles.socialBtn, { marginTop: SPACING.md }, SHADOWS.subtle]}
            >
              <Ionicons name="person-outline" size={18} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
              <AppText variant="buttonSmall" color={COLORS.textPrimary} weight="700">
                Continue as guest
              </AppText>
            </TouchableOpacity>
          </View>

          {/* 6. Terms & Privacy Notice */}
          <View style={styles.legalFooter}>
            <AppText variant="caption" color={COLORS.textSecondary} align="center" style={{ lineHeight: 18 }}>
              By Log in, you are agreeing to our{' '}
              <AppText variant="caption" color={COLORS.textPrimary} weight="700" style={styles.underline}>
                Privacy Policy
              </AppText>{' '}
              and{' '}
              <AppText variant="caption" color={COLORS.textPrimary} weight="700" style={styles.underline}>
                Terms &amp; Conditions
              </AppText>
              .
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8FC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxxl,
  },
  showcaseSection: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  floatingCard: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    width: '94%',
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  card1: {
    top: 0,
    transform: [{ rotate: '-4deg' }, { scale: 0.9 }],
    opacity: 0.75,
  },
  card2: {
    top: 36,
    transform: [{ rotate: '3deg' }, { scale: 0.95 }],
    opacity: 0.9,
  },
  card3: {
    top: 76,
    transform: [{ rotate: '-1.5deg' }],
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.primaryMuted,
  },
  floatingMedImg: {
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceSubtle,
  },
  floatingMedInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  floatingPriceCol: {
    alignItems: 'flex-end',
  },
  strikePrice: {
    textDecorationLine: 'line-through',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  inputSection: {
    marginBottom: SPACING.lg,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneInputBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    justifyContent: 'center',
  },
  inputBoxError: {
    borderColor: COLORS.danger,
  },
  textInput: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  errorText: {
    marginTop: SPACING.xs,
    marginLeft: 4,
  },
  primaryCta: {
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  primaryCtaEnabled: {
    backgroundColor: COLORS.primary,
  },
  primaryCtaDisabled: {
    backgroundColor: '#DCD5F0',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E8EE',
  },
  orText: {
    marginHorizontal: SPACING.md,
  },
  secondaryActionsSection: {
    marginBottom: SPACING.xl,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  legalFooter: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  underline: {
    textDecorationLine: 'underline',
  },
});

import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { HealitLogo } from '../../components/common/HealitLogo';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { useAppTheme } from '../../store/ThemeContext';

const ONBOARDING_STEPS = [
  {
    title: 'Find Any Medicine Fast',
    description: 'Search by brand name, salt composition, or generic name. Browse verified pharmacies and build your medicine list effortlessly.',
    icon: 'search-circle-outline' as const,
    iconColor: COLORS.primary,
  },
  {
    title: 'Never Worry Which Pharmacy Has Stock',
    description: 'Add medicines from multiple stores into one shopping cart. You do not need to manually check stock at each medical store.',
    icon: 'cart-outline' as const,
    iconColor: COLORS.secondary,
  },
  {
    title: 'Compare Live Pharmacy Offers',
    description: 'Local pharmacies compete to fulfill your order. Choose the Lowest Price, Fastest Delivery, or Highest Rated pharmacy offer.',
    icon: 'pricetags-outline' as const,
    iconColor: '#F59E0B',
  },
];

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>>();
  const { colors, isDark } = useAppTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const { completeOnboarding } = useAuth();

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
      navigation.navigate('LocationPermission');
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    navigation.navigate('LocationPermission');
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* Top Header with Skip */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <HealitLogo width={110} height={32} />

          {currentStep < ONBOARDING_STEPS.length - 1 && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
              <AppText variant="buttonSmall" color={colors.textSecondary} weight="600">
                Skip
              </AppText>
            </TouchableOpacity>
          )}
        </View>

        {/* Content Card */}
        <View style={styles.content}>
          <View style={[styles.iconWrapper, { backgroundColor: `${step.iconColor}15` }]}>
            <Ionicons name={step.icon} size={84} color={step.iconColor} />
          </View>

          <AppText variant="h1" color={colors.textPrimary} weight="600" align="center" style={styles.title}>
            {step.title}
          </AppText>

          <AppText variant="bodyLarge" color={colors.textSecondary} align="center" style={styles.description}>
            {step.description}
          </AppText>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.footer}>
          {/* Progress Dots */}
          <View style={styles.dotsRow}>
            {ONBOARDING_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentStep === index ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          <AppButton
            title={currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'}
            variant="primary"
            size="lg"
            onPress={handleNext}
            rightIcon={
              <Ionicons
                name={currentStep === ONBOARDING_STEPS.length - 1 ? 'checkmark' : 'arrow-forward'}
                size={20}
                color={COLORS.textInverse}
              />
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    marginLeft: SPACING.xs,
    letterSpacing: 1,
  },
  skipBtn: {
    padding: SPACING.xs,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  iconWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    marginBottom: SPACING.md,
  },
  description: {
    lineHeight: 24,
  },
  footer: {
    width: '100%',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: COLORS.surfaceMuted,
  },
});


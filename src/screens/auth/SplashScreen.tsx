import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { HealitLogo } from '../../components/common/HealitLogo';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Splash'>>();
  const { isAuthenticated, isOnboarded } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOnboarded) {
        navigation.replace('Onboarding');
      } else {
        navigation.replace('Login');
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [isOnboarded, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.brandContainer}>
        <View style={styles.logoWrapper}>
          <HealitLogo width={220} height={66} />
        </View>
        <AppText variant="bodyLarge" color={COLORS.primarySubtle} style={styles.tagline}>
          Smart Medicine Marketplace
        </AppText>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#FFFFFF" />
        <AppText variant="caption" color={COLORS.primarySubtle} style={styles.footerText}>
          Connecting you to nearby verified pharmacies
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.massive,
    paddingHorizontal: SPACING.xl,
  },
  brandContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    ...SHADOWS.elevated,
  },
  iconCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  brandTitle: {
    letterSpacing: 2,
  },
  tagline: {
    marginTop: SPACING.xs,
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    marginTop: SPACING.sm,
  },
});

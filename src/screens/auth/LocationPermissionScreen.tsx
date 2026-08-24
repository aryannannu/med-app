import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { useAppTheme } from '../../store/ThemeContext';

export const LocationPermissionScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'LocationPermission'>>();
  const { colors, isDark } = useAppTheme();
  const { grantLocationPermission } = useAuth();

  const handleAllowLocation = () => {
    grantLocationPermission();
    navigation.navigate('Login');
  };

  const handleEnterManually = () => {
    grantLocationPermission();
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name="location" size={60} color={colors.primary} />
          </View>

          <AppText variant="h1" color={colors.textPrimary} weight="600" align="center" style={styles.title}>
            Find Nearby Pharmacies
          </AppText>

          <AppText variant="bodyMedium" color={colors.textSecondary} align="center" style={styles.description}>
            HEALIT uses your delivery location to match your medicine requirements with verified pharmacies in your local area and compute accurate delivery times.
          </AppText>

          <View style={styles.trustCard}>
            <Ionicons name="shield-checkmark" size={24} color={COLORS.secondary} style={styles.trustIcon} />
            <View style={styles.trustTextContainer}>
              <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
                100% Privacy Protected
              </AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Your location is used solely to find nearby verified pharmacies and coordinate doorstep delivery.
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <AppButton
            title="Enable Device Location"
            variant="primary"
            size="lg"
            onPress={handleAllowLocation}
            leftIcon={<Ionicons name="navigate" size={18} color={COLORS.textInverse} />}
            style={styles.primaryBtn}
          />

          <AppButton
            title="Enter Location Manually"
            variant="outline"
            size="lg"
            onPress={handleEnterManually}
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
    paddingVertical: SPACING.lg,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    marginBottom: SPACING.md,
  },
  description: {
    lineHeight: 24,
    maxWidth: 320,
  },
  trustCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.xxl,
    width: '100%',
  },
  trustIcon: {
    marginRight: SPACING.md,
  },
  trustTextContainer: {
    flex: 1,
  },
  footer: {
    width: '100%',
  },
  primaryBtn: {
    marginBottom: SPACING.md,
  },
});


import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, SafeAreaView, Animated, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { useOffers } from '../../store/OfferContext';
import { useCart } from '../../store/CartContext';
import { useAddress } from '../../store/AddressContext';
import { useAppTheme } from '../../store/ThemeContext';

export const FindingPharmaciesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { colors, isDark } = useAppTheme();
  const route = useRoute<RouteProp<AppStackParamList, 'FindingPharmacies'>>();
  const cartId = route.params?.cartId || 'cart-current';

  const { items } = useCart();
  const { selectedAddress } = useAddress();
  const { offers, matchingStep, matchingStatusText, startFindingPharmacies } = useOffers();
  const [isCompleted, setIsCompleted] = useState(false);

  const hasRunRef = useRef(false);

  // Radar Pulse Animation
  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;
  const pulseAnim3 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim1, {
          toValue: 1.5,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim1, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    );

    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim2, {
          toValue: 1.8,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim2, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );

    const loop3 = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim3, {
          toValue: 2.1,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim3, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    );

    loop1.start();
    loop2.start();
    loop3.start();

    return () => {
      loop1.stop();
      loop2.stop();
      loop3.stop();
    };
  }, [pulseAnim1, pulseAnim2, pulseAnim3]);

  // Main Bidding Process Trigger
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    startFindingPharmacies(cartId, items, selectedAddress)
      .then((results) => {
        setIsCompleted(true);
        // Automatically navigate to Offer Comparison after a short delay so user sees step 4 completed
        setTimeout(() => {
          navigation.navigate('OfferComparison', { cartId });
        }, 700);
      })
      .catch(() => {
        setIsCompleted(true);
        setTimeout(() => {
          navigation.navigate('OfferComparison', { cartId });
        }, 700);
      });

    // Fallback safety timer: ensure user is never stuck beyond 4 seconds
    const safetyTimer = setTimeout(() => {
      setIsCompleted(true);
      navigation.navigate('OfferComparison', { cartId });
    }, 4000);

    return () => clearTimeout(safetyTimer);
  }, [cartId, items, selectedAddress, startFindingPharmacies, navigation]);

  const handleManualProceed = () => {
    navigation.navigate('OfferComparison', { cartId });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* Brand header */}
        <View style={styles.brandRow}>
          <View style={styles.brandIconCircle}>
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
          </View>
          <AppText variant="titleSmall" color={colors.primary} weight="600" style={{ marginLeft: 8, letterSpacing: 0.5 }}>
            HEALIT MARKETPLACE ENGINE
          </AppText>
        </View>

        {/* Pulse Radar Center with Store Satellites */}
        <View style={styles.radarContainer}>
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                transform: [{ scale: pulseAnim3 }],
                opacity: 0.1,
                backgroundColor: COLORS.primary,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                transform: [{ scale: pulseAnim2 }],
                opacity: 0.18,
                backgroundColor: COLORS.primary,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                transform: [{ scale: pulseAnim1 }],
                opacity: 0.28,
                backgroundColor: '#6366F1',
              },
            ]}
          />

          {/* Central User Location Marker */}
          <View style={styles.centerIconCircle}>
            <Ionicons name="location" size={38} color="#FFFFFF" />
          </View>

          {/* Satellite Pharmacy Pins */}
          <View style={[styles.satellitePin, { top: 15, left: 35 }]}>
            <Ionicons name="storefront" size={14} color={colors.primary} />
          </View>
          <View style={[styles.satellitePin, { top: 30, right: 30 }]}>
            <Ionicons name="medical" size={14} color="#15803D" />
          </View>
          <View style={[styles.satellitePin, { bottom: 25, left: 45 }]}>
            <Ionicons name="medkit" size={14} color="#D97706" />
          </View>
          <View style={[styles.satellitePin, { bottom: 35, right: 40 }]}>
            <Ionicons name="storefront" size={14} color="#2563EB" />
          </View>
        </View>

        {/* Status Messaging */}
        <View style={styles.statusContainer}>
          <AppText variant="h2" color={colors.textPrimary} weight="600" align="center" style={styles.statusTitle}>
            Requesting Pharmacy Bids
          </AppText>

          <AppText variant="bodySmall" color={colors.textSecondary} align="center" style={styles.statusDescription}>
            {matchingStatusText || 'Matching your medicine requirement with licensed local pharmacies...'}
          </AppText>

          {/* Stepped Checklist */}
          <View style={[styles.stepsCard, SHADOWS.subtle]}>
            {/* Step 1 */}
            <View style={styles.stepRow}>
              {matchingStep >= 1 ? (
                <View style={styles.stepDoneIcon}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              ) : (
                <ActivityIndicator size="small" color={colors.primary} />
              )}
              <AppText
                variant="bodySmall"
                color={matchingStep >= 1 ? COLORS.textPrimary : COLORS.textMuted}
                weight={matchingStep === 1 ? '600' : '400'}
                style={{ marginLeft: 10, flex: 1 }}
              >
                Checking delivery location &amp; serviceability radius
              </AppText>
            </View>

            {/* Step 2 */}
            <View style={styles.stepRow}>
              {matchingStep >= 2 ? (
                <View style={styles.stepDoneIcon}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              ) : matchingStep === 1 ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <View style={styles.stepPendingDot} />
              )}
              <AppText
                variant="bodySmall"
                color={matchingStep >= 2 ? COLORS.textPrimary : COLORS.textMuted}
                weight={matchingStep === 2 ? '600' : '400'}
                style={{ marginLeft: 10, flex: 1 }}
              >
                Found 12 licensed pharmacies within 3 km
              </AppText>
            </View>

            {/* Step 3 */}
            <View style={styles.stepRow}>
              {matchingStep >= 3 ? (
                <View style={styles.stepDoneIcon}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              ) : matchingStep === 2 ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <View style={styles.stepPendingDot} />
              )}
              <AppText
                variant="bodySmall"
                color={matchingStep >= 3 ? COLORS.textPrimary : COLORS.textMuted}
                weight={matchingStep === 3 ? '600' : '400'}
                style={{ marginLeft: 10, flex: 1 }}
              >
                Verifying live batch stock &amp; prescription requirements
              </AppText>
            </View>

            {/* Step 4 */}
            <View style={styles.stepRow}>
              {matchingStep >= 4 || isCompleted ? (
                <View style={[styles.stepDoneIcon, { backgroundColor: '#15803D' }]}>
                  <Ionicons name="flash" size={12} color="#FFFFFF" />
                </View>
              ) : matchingStep === 3 ? (
                <ActivityIndicator size="small" color="#15803D" />
              ) : (
                <View style={styles.stepPendingDot} />
              )}
              <AppText
                variant="bodySmall"
                color={matchingStep >= 4 || isCompleted ? '#15803D' : COLORS.textMuted}
                weight={matchingStep >= 4 || isCompleted ? '600' : '400'}
                style={{ marginLeft: 10, flex: 1 }}
              >
                Received competitive bids with lowest prices &amp; express ETAs
              </AppText>
            </View>
          </View>

          {/* Direct Proceed Action when complete */}
          {(matchingStep >= 4 || isCompleted || offers.length > 0) && (
            <AppButton
              title="View Pharmacy Bids"
              variant="primary"
              size="lg"
              onPress={handleManualProceed}
              rightIcon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
              style={styles.proceedBtn}
            />
          )}
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark" size={16} color="#15803D" />
          <AppText variant="caption" color={colors.textSecondary} style={{ marginLeft: 6 }}>
            100% verified retail pharmacies with valid Drug Licenses
          </AppText>
        </View>
      </View>
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
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECE8F7',
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  brandIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarContainer: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: SPACING.lg,
  },
  pulseCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  centerIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#3A2986',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  satellitePin: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
    borderWidth: 1.5,
    borderColor: '#E8E8EE',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusContainer: {
    width: '100%',
    alignItems: 'center',
  },
  statusTitle: {
    marginBottom: SPACING.xs,
  },
  statusDescription: {
    maxWidth: 320,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  stepsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    gap: SPACING.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDoneIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#15803D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPendingDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#E8E8EE',
    backgroundColor: '#F8F8FC',
  },
  proceedBtn: {
    width: '100%',
    marginTop: SPACING.lg,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
});


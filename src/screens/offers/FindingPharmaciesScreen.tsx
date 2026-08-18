import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, Animated, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useOffers } from '../../store/OfferContext';
import { useCart } from '../../store/CartContext';
import { useAddress } from '../../store/AddressContext';

export const FindingPharmaciesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'FindingPharmacies'>>();
  const { cartId } = route.params;

  const { items } = useCart();
  const { selectedAddress } = useAddress();
  const { isMatching, matchingStep, matchingStatusText, startFindingPharmacies } = useOffers();

  // Radar Pulse Animation
  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim1, {
          toValue: 1.4,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim1, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim2, {
          toValue: 1.7,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim2, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );

    loop1.start();
    loop2.start();

    return () => {
      loop1.stop();
      loop2.stop();
    };
  }, [pulseAnim1, pulseAnim2]);

  useEffect(() => {
    if (selectedAddress) {
      startFindingPharmacies(cartId, items, selectedAddress).then((offers) => {
        if (offers.length > 0) {
          navigation.replace('OfferComparison', { cartId });
        }
      });
    }
  }, [cartId, items, selectedAddress, startFindingPharmacies, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Brand header */}
        <View style={styles.brandRow}>
          <Ionicons name="medkit" size={24} color={COLORS.primary} />
          <AppText variant="titleMedium" color={COLORS.primary} weight="800" style={{ marginLeft: 6 }}>
            HEALIT MARKETPLACE ENGINE
          </AppText>
        </View>

        {/* Pulse Radar Center */}
        <View style={styles.radarContainer}>
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                transform: [{ scale: pulseAnim2 }],
                opacity: 0.15,
                backgroundColor: COLORS.primary,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                transform: [{ scale: pulseAnim1 }],
                opacity: 0.25,
                backgroundColor: COLORS.secondary,
              },
            ]}
          />

          <View style={styles.centerIconCircle}>
            <Ionicons name="storefront" size={42} color="#FFFFFF" />
          </View>
        </View>

        {/* Status Messaging */}
        <View style={styles.statusContainer}>
          <AppText variant="h2" color={COLORS.textPrimary} weight="800" align="center" style={styles.statusTitle}>
            Finding Best Pharmacy Offers
          </AppText>

          <AppText variant="bodyMedium" color={COLORS.textSecondary} align="center" style={styles.statusDescription}>
            {matchingStatusText || 'Matching your medicine cart with licensed pharmacies nearby...'}
          </AppText>

          {/* Stepped Checklist */}
          <View style={[styles.stepsCard, SHADOWS.subtle]}>
            <View style={styles.stepRow}>
              {matchingStep >= 1 ? (
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              ) : (
                <ActivityIndicator size="small" color={COLORS.primary} />
              )}
              <AppText
                variant="bodySmall"
                color={matchingStep >= 1 ? COLORS.textPrimary : COLORS.textMuted}
                weight={matchingStep === 1 ? '700' : '500'}
                style={{ marginLeft: 8 }}
              >
                Checking medicine availability in 12 local pharmacies
              </AppText>
            </View>

            <View style={styles.stepRow}>
              {matchingStep >= 2 ? (
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              ) : matchingStep === 1 ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Ionicons name="ellipse-outline" size={20} color={COLORS.textMuted} />
              )}
              <AppText
                variant="bodySmall"
                color={matchingStep >= 2 ? COLORS.textPrimary : COLORS.textMuted}
                weight={matchingStep === 2 ? '700' : '500'}
                style={{ marginLeft: 8 }}
              >
                Matching nearby verified stores & batch stock
              </AppText>
            </View>

            <View style={styles.stepRow}>
              {matchingStep >= 3 ? (
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              ) : matchingStep === 2 ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Ionicons name="ellipse-outline" size={20} color={COLORS.textMuted} />
              )}
              <AppText
                variant="bodySmall"
                color={matchingStep >= 3 ? COLORS.textPrimary : COLORS.textMuted}
                weight={matchingStep === 3 ? '700' : '500'}
                style={{ marginLeft: 8 }}
              >
                Receiving competitive price & express delivery offers
              </AppText>
            </View>
          </View>
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.textMuted} />
          <AppText variant="caption" color={COLORS.textMuted} style={{ marginLeft: 4 }}>
            Only 100% verified & licensed pharmacies are eligible to bid.
          </AppText>
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
    paddingVertical: SPACING.xl,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  radarContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: SPACING.xl,
  },
  pulseCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  centerIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 4,
    borderColor: '#FFFFFF',
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
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  stepsCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs + 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
});

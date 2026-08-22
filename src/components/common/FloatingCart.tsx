import React, { useState } from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from '../../store/CartContext';
import { AppText } from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { OffersForYouModal } from '../modals/OffersForYouModal';

export interface FloatingCartProps {
  onPressViewCart: () => void;
  bottomOffset?: Animated.AnimatedInterpolation<number> | number;
}

export const FloatingCart: React.FC<FloatingCartProps> = ({
  onPressViewCart,
  bottomOffset = 88,
}) => {
  const { totalItemCount, summary } = useCart();
  const [offersModalVisible, setOffersModalVisible] = useState(false);

  if (totalItemCount <= 0) return null;

  const FREE_DELIVERY_THRESHOLD = 199;
  const currentSubtotal = summary.itemTotal;
  const isFreeDeliveryUnlocked = currentSubtotal >= FREE_DELIVERY_THRESHOLD;
  const remainingForFreeDelivery = FREE_DELIVERY_THRESHOLD - currentSubtotal;

  return (
    <>
      <Animated.View
        style={[
          styles.floatingCartContainer,
          {
            bottom: bottomOffset,
          },
        ]}
      >
        {/* Left Dark Capsule: Offers & Free Delivery progress */}
        <View style={styles.leftOfferCapsuleContainer}>
          {/* Top attached "Offers ^" Tag */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setOffersModalVisible(true)}
            style={styles.offersTopTag}
          >
            <AppText style={styles.offersTagText}>Offers</AppText>
            <Ionicons name="chevron-up" size={12} color="#5B28D6" style={{ marginLeft: 2 }} />
          </TouchableOpacity>

          {/* Main Dark Capsule Body */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setOffersModalVisible(true)}
            style={styles.leftCapsuleBody}
          >
            {/* Scooter / Delivery icon inside circular progress outline */}
            <View
              style={[
                styles.deliveryProgressCircle,
                isFreeDeliveryUnlocked && styles.unlockedProgressCircle,
              ]}
            >
              <Ionicons
                name="bicycle"
                size={16}
                color={isFreeDeliveryUnlocked ? '#10B981' : '#FFFFFF'}
              />
            </View>

            <View style={styles.deliveryTextCol}>
              <AppText style={styles.deliveryTitleText} numberOfLines={1}>
                {isFreeDeliveryUnlocked ? 'Free delivery unlocked!' : 'Unlock free delivery'}
              </AppText>
              <AppText style={styles.deliverySubtext} numberOfLines={1}>
                {isFreeDeliveryUnlocked
                  ? '🎉 Enjoy zero delivery fee'
                  : `Shop for ₹${Math.ceil(remainingForFreeDelivery)} more`}
              </AppText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Right HEALIT Purple Capsule: Cart Action */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={onPressViewCart}
        >
          <LinearGradient
            colors={['#6933DC', '#431EAF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.rightCartPill}
          >
            <View style={styles.cartIconBox}>
              <Ionicons name="bag-handle" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.cartTextCol}>
              <AppText style={styles.cartTitleText}>Cart</AppText>
              <AppText style={styles.cartSubtext}>
                {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
              </AppText>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Offers for you Bottom Sheet Modal */}
      <OffersForYouModal
        visible={offersModalVisible}
        onClose={() => setOffersModalVisible(false)}
        cartSubtotal={currentSubtotal}
      />
    </>
  );
};

const styles = StyleSheet.create({
  floatingCartContainer: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftOfferCapsuleContainer: {
    flex: 1,
    marginRight: 10,
    position: 'relative',
  },
  offersTopTag: {
    position: 'absolute',
    top: -11,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 3,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#EEF0FD',
    shadowColor: '#5B28D6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  offersTagText: {
    color: '#5B28D6',
    fontSize: 11,
    fontFamily: 'LexendDeca_700Bold',
  },
  leftCapsuleBody: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181528',
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#352E54',
    shadowColor: '#181528',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  deliveryProgressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  unlockedProgressCircle: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  deliveryTextCol: {
    flex: 1,
  },
  deliveryTitleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'LexendDeca_700Bold',
    lineHeight: 16,
  },
  deliverySubtext: {
    color: '#A78BFA',
    fontSize: 11,
    fontFamily: 'LexendDeca_500Medium',
    marginTop: 1,
  },
  rightCartPill: {
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#431EAF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  cartIconBox: {
    marginRight: 8,
  },
  cartTextCol: {
    justifyContent: 'center',
  },
  cartTitleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'LexendDeca_800ExtraBold',
    lineHeight: 16,
  },
  cartSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    fontFamily: 'LexendDeca_600SemiBold',
  },
});

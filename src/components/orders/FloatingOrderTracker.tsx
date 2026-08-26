import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { useOrders } from '../../store/OrderContext';
import { AppText } from '../common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../store/ThemeContext';
import { SHADOWS } from '../../theme';

export const FloatingOrderTracker: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { activeOrders } = useOrders();
  const { isDark } = useAppTheme();

  if (!activeOrders || activeOrders.length === 0) {
    return null;
  }

  const activeOrder = activeOrders[0];

  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => navigation.navigate('OrderDetails', { orderId: activeOrder.id })}
        style={[
          styles.container,
          {
            backgroundColor: isDark ? '#1E1B4B' : '#3A2986',
            borderColor: isDark ? '#4338CA' : '#5B21B6',
          },
          SHADOWS.card,
        ]}
      >
        <View style={styles.leftRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="bicycle" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.textCol}>
            <View style={styles.titleRow}>
              <AppText style={styles.titleText}>Order on the way</AppText>
              <View style={styles.pulseDot} />
            </View>
            <AppText style={styles.subtitleText}>
              {activeOrder.items?.length || 1} items • Arriving in 10-15 min
            </AppText>
          </View>
        </View>

        <View style={styles.trackBtn}>
          <AppText style={styles.trackBtnText}>Track</AppText>
          <Ionicons name="arrow-forward" size={12} color="#3A2986" style={{ marginLeft: 3 }} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: 84,
    left: 16,
    right: 16,
    zIndex: 999,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 14,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginLeft: 6,
  },
  subtitleText: {
    fontSize: 11,
    fontFamily: 'LexendDeca_500Medium',
    color: 'rgba(255, 255, 255, 0.82)',
    marginTop: 1,
  },
  trackBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackBtnText: {
    fontSize: 12,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
    color: '#3A2986',
  },
});

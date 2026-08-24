import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../common/AppText';
import { ThemeColors } from '../../theme/colors';

interface LiveOrderMapProps {
  colors: ThemeColors;
  pharmacyCoords: { latitude: number; longitude: number };
  homeCoords: { latitude: number; longitude: number };
  riderCoords: { latitude: number; longitude: number };
  silverMapStyle: any;
}

export const LiveOrderMap: React.FC<LiveOrderMapProps> = ({
  colors,
}) => {
  return (
    <View style={[styles.fallbackMapVisual, { backgroundColor: colors.background }]}>
      <View style={[styles.routePathLine, { borderColor: colors.primaryBorder }]} />
      <View style={styles.routeNodesRow}>
        <View style={[styles.routeNodeWrapper, { backgroundColor: colors.surface }]}>
          <Ionicons name="storefront" size={16} color={colors.primary} />
          <AppText variant="caption" color={colors.textSecondary} style={styles.nodeTag}>Store</AppText>
        </View>
        <View style={[styles.routeRiderBox, { backgroundColor: colors.successLight, borderColor: colors.success }]}>
          <Ionicons name="bicycle" size={18} color={colors.success} />
          <AppText variant="caption" color={colors.success} weight="700" style={styles.nodeTag}>Rider</AppText>
        </View>
        <View style={[styles.routeNodeWrapper, { backgroundColor: colors.surface }]}>
          <Ionicons name="home" size={16} color={colors.primary} />
          <AppText variant="caption" color={colors.textSecondary} style={styles.nodeTag}>You</AppText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fallbackMapVisual: {
    flex: 1,
    height: 210,
    borderRadius: 16,
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  routePathLine: {
    position: 'absolute',
    left: 48,
    right: 48,
    height: 2,
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  routeNodesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeNodeWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  routeRiderBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  nodeTag: {
    position: 'absolute',
    bottom: -18,
    fontSize: 9,
    fontFamily: 'LexendDeca_600SemiBold',
    width: 60,
    textAlign: 'center',
  },
});

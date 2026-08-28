import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../common/AppText';
import { ThemeColors } from '../../theme/colors';

interface LiveOrderMapProps {
  colors: ThemeColors;
  pharmacyCoords?: { latitude: number; longitude: number };
  homeCoords?: { latitude: number; longitude: number };
  riderCoords?: { latitude: number; longitude: number };
  pharmacyName?: string;
  orderStatus?: string;
  showRider?: boolean;
  onExpandMap?: () => void;
  isExpanded?: boolean;
}

export const LiveOrderMap: React.FC<LiveOrderMapProps> = ({
  colors,
  pharmacyName = 'CarePlus Pharmacy',
  orderStatus = 'preparing',
  showRider = true,
  onExpandMap,
  isExpanded = false,
}) => {
  const isDelivered = orderStatus === 'delivered';
  const isOutForDelivery = orderStatus === 'out_for_delivery';
  const isRiderVisible = showRider && (orderStatus === 'rider_assigned' || isOutForDelivery);

  return (
    <View style={styles.mapContainer}>
      {/* SVG-style Clean Vector Live Map Canvas Background */}
      <View style={styles.mapCanvas}>
        {/* Map Grid Roads & Features */}
        <View style={[styles.roadHorizontal, { top: '35%' }]} />
        <View style={[styles.roadHorizontal, { top: '65%' }]} />
        <View style={[styles.roadVertical, { left: '30%' }]} />
        <View style={[styles.roadVertical, { left: '70%' }]} />
        <View style={styles.parkArea} />
        <View style={styles.waterArea} />

        {/* Map Sector Labels */}
        <AppText style={[styles.sectorLabel, { top: '15%', left: '42%' }]}>SECTOR 15</AppText>
        <AppText style={[styles.sectorLabel, { top: '32%', left: '72%' }]}>PHASE 5</AppText>
        <AppText style={[styles.sectorLabel, { top: '48%', left: '12%' }]}>INDUSTRIAL AREA</AppText>
        <AppText style={[styles.sectorLabel, { top: '68%', left: '32%' }]}>PHASE 7</AppText>
        <AppText style={[styles.landmarkLabel, { top: '78%', left: '48%' }]}>
          🎓 Chandigarh University
        </AppText>

        {/* Live Route Dashed Path Line */}
        <View style={styles.routePathSvg}>
          <View style={styles.dashedLineSegment1} />
          <View style={styles.dashedLineSegment2} />
        </View>

        {/* 1. Pharmacy Marker & Label */}
        <View style={[styles.markerContainer, { top: '22%', left: '18%' }]}>
          <View style={styles.markerLabelCard}>
            <AppText style={styles.markerLabelTitle}>{pharmacyName}</AppText>
            <AppText style={styles.markerLabelSub}>0.8 km away</AppText>
          </View>
          <View style={[styles.markerPin, { backgroundColor: '#3A2986' }]}>
            <Ionicons name="add" size={16} color="#FFFFFF" />
          </View>
          <View style={styles.markerShadow} />
        </View>

        {/* 2. Rider Marker & Pulse (Visible when assigned/out for delivery) */}
        {isRiderVisible && (
          <View style={[styles.markerContainer, { top: '48%', left: '55%' }]}>
            <View style={styles.riderPulseRing} />
            <View style={[styles.markerPin, styles.riderPin]}>
              <Ionicons name="bicycle" size={17} color="#FFFFFF" />
            </View>
          </View>
        )}

        {/* 3. Destination Home Marker & Label */}
        <View style={[styles.markerContainer, { top: '65%', left: '78%' }]}>
          <View style={[styles.markerPin, { backgroundColor: '#059669' }]}>
            <Ionicons name="home" size={15} color="#FFFFFF" />
          </View>
          <View style={styles.markerLabelCardBelow}>
            <AppText style={styles.markerLabelTitle}>Your Home</AppText>
            <AppText style={styles.markerLabelSub}>2.3 km away</AppText>
          </View>
        </View>
      </View>

      {/* Expand Map Control Button (Upper Right - Icon Only) */}
      {onExpandMap && (
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={onExpandMap}
          style={styles.expandMapBtn}
        >
          <Ionicons name={isExpanded ? 'contract-outline' : 'expand-outline'} size={20} color="#3A2986" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F3F4F6',
  },
  mapCanvas: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FAF9FE',
  },
  roadHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  roadVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 14,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E5E7EB',
  },
  parkArea: {
    position: 'absolute',
    top: '18%',
    left: '52%',
    width: '18%',
    height: '14%',
    borderRadius: 16,
    backgroundColor: '#E6F4EA',
    borderWidth: 1,
    borderColor: '#CEEAD6',
  },
  waterArea: {
    position: 'absolute',
    top: '60%',
    left: '5%',
    width: '20%',
    height: '12%',
    borderRadius: 20,
    backgroundColor: '#E8F0FE',
  },
  sectorLabel: {
    position: 'absolute',
    fontSize: 9.5,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.6,
  },
  landmarkLabel: {
    position: 'absolute',
    fontSize: 10,
    fontFamily: 'LexendDeca_600SemiBold',
    color: '#64748B',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  routePathSvg: {
    position: 'absolute',
    top: '25%',
    left: '21%',
    width: '60%',
    height: '45%',
  },
  dashedLineSegment1: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: '60%',
    height: 2,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: '#3A2986',
    transform: [{ rotate: '25deg' }],
  },
  dashedLineSegment2: {
    position: 'absolute',
    top: '55%',
    left: '50%',
    width: '50%',
    height: 2,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: '#0284C7',
    transform: [{ rotate: '38deg' }],
  },
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  markerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#3A2986',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  riderPin: {
    backgroundColor: '#3A2986',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  riderPulseRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(58, 41, 134, 0.18)',
  },
  markerShadow: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.12)',
    marginTop: 2,
  },
  markerLabelCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center',
  },
  markerLabelCardBelow: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center',
  },
  markerLabelTitle: {
    fontSize: 11,
    fontFamily: 'LexendDeca_700Bold',
    fontWeight: '700',
    color: '#1E1B4B',
  },
  markerLabelSub: {
    fontSize: 9.5,
    fontFamily: 'LexendDeca_500Medium',
    color: '#64748B',
  },
  expandMapBtn: {
    position: 'absolute',
    top: 96,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 30,
  },
});

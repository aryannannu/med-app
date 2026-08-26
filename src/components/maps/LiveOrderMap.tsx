import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { ThemeColors } from '../../theme/colors';
import { AppText } from '../common/AppText';

interface LiveOrderMapProps {
  colors: ThemeColors;
  pharmacyCoords?: { latitude: number; longitude: number };
  homeCoords?: { latitude: number; longitude: number };
  riderCoords?: { latitude: number; longitude: number };
  silverMapStyle?: any;
  pharmacyName?: string;
  orderStatus?: string;
  showRider?: boolean;
  onExpandMap?: () => void;
  isExpanded?: boolean;
}

const DEFAULT_PHARMACY = { latitude: 30.7333, longitude: 76.7794 };
const DEFAULT_HOME = { latitude: 30.7455, longitude: 76.7885 };
const DEFAULT_RIDER = { latitude: 30.7394, longitude: 76.7840 };

export const LiveOrderMap: React.FC<LiveOrderMapProps> = ({
  colors,
  pharmacyCoords = DEFAULT_PHARMACY,
  homeCoords = DEFAULT_HOME,
  riderCoords = DEFAULT_RIDER,
  silverMapStyle,
  pharmacyName = 'CarePlus Pharmacy',
  orderStatus = 'preparing',
  showRider = true,
  onExpandMap,
  isExpanded = false,
}) => {
  const isRiderVisible = showRider && (orderStatus === 'out_for_delivery' || orderStatus === 'packed');

  return (
    <View style={styles.mapWrapper}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: (pharmacyCoords.latitude + homeCoords.latitude) / 2,
          longitude: (pharmacyCoords.longitude + homeCoords.longitude) / 2,
          latitudeDelta: Math.abs(pharmacyCoords.latitude - homeCoords.latitude) * 1.8,
          longitudeDelta: Math.abs(pharmacyCoords.longitude - homeCoords.longitude) * 1.8,
        }}
        customMapStyle={silverMapStyle}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        {/* Pharmacy Node */}
        <Marker coordinate={pharmacyCoords}>
          <View style={[styles.mapMarkerBox, { backgroundColor: '#3A2986' }]}>
            <Ionicons name="add" size={16} color="#FFFFFF" />
          </View>
        </Marker>

        {/* Rider Node */}
        {isRiderVisible && (
          <Marker coordinate={riderCoords}>
            <View style={[styles.mapMarkerBox, { backgroundColor: '#3A2986', width: 36, height: 36, borderRadius: 18 }]}>
              <Ionicons name="bicycle" size={17} color="#FFFFFF" />
            </View>
          </Marker>
        )}

        {/* Home Node */}
        <Marker coordinate={homeCoords}>
          <View style={[styles.mapMarkerBox, { backgroundColor: '#059669' }]}>
            <Ionicons name="home" size={15} color="#FFFFFF" />
          </View>
        </Marker>

        <Polyline
          coordinates={isRiderVisible ? [pharmacyCoords, riderCoords, homeCoords] : [pharmacyCoords, homeCoords]}
          strokeColor="#3A2986"
          strokeWidth={3.5}
          lineDashPattern={[6, 6]}
        />
      </MapView>

      {/* Expand Map Button */}
      {onExpandMap && (
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={onExpandMap}
          style={styles.expandMapBtn}
        >
          <Ionicons name={isExpanded ? 'contract-outline' : 'expand-outline'} size={18} color="#3A2986" />
          <AppText style={styles.expandMapText}>
            {isExpanded ? 'Collapse' : 'Expand map'}
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mapWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapMarkerBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  expandMapBtn: {
    position: 'absolute',
    top: 90,
    right: 16,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 30,
  },
  expandMapText: {
    fontSize: 9.5,
    fontFamily: 'LexendDeca_600SemiBold',
    color: '#3A2986',
    marginTop: 2,
  },
});

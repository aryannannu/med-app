import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
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
  pharmacyCoords,
  homeCoords,
  riderCoords,
  silverMapStyle,
}) => {
  return (
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
        <View style={[styles.mapMarkerBox, { backgroundColor: colors.primary }]}>
          <Ionicons name="storefront" size={13} color="#FFFFFF" />
        </View>
      </Marker>

      {/* Rider Node */}
      <Marker coordinate={riderCoords}>
        <View style={[styles.mapMarkerBox, { backgroundColor: colors.success, width: 34, height: 34, borderRadius: 17 }]}>
          <Ionicons name="bicycle" size={16} color="#FFFFFF" />
        </View>
      </Marker>

      {/* Home Node */}
      <Marker coordinate={homeCoords}>
        <View style={[styles.mapMarkerBox, { backgroundColor: colors.primaryDark }]}>
          <Ionicons name="home" size={13} color="#FFFFFF" />
        </View>
      </Marker>

      <Polyline
        coordinates={[pharmacyCoords, riderCoords, homeCoords]}
        strokeColor={colors.primary}
        strokeWidth={3.5}
        lineDashPattern={[6, 6]}
      />
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapMarkerBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});

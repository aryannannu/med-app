import React from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { BottomTabParamList, AppStackParamList } from '../types/navigation';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CategoriesScreen } from '../screens/medicines/CategoriesScreen';
import { OrdersScreen } from '../screens/orders/OrdersScreen';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';
import { AppText } from '../components/common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../store/OrderContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator<BottomTabParamList>();

interface TabItemConfig {
  name: keyof BottomTabParamList;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}

const TAB_CONFIG: TabItemConfig[] = [
  { name: 'HomeTab', label: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
  { name: 'CategoriesTab', label: 'Categories', activeIcon: 'grid', inactiveIcon: 'grid-outline' },
  { name: 'OrdersTab', label: 'Orders', activeIcon: 'receipt', inactiveIcon: 'receipt-outline' },
];

const FloatingLiquidGlassTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const rootNav = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { activeOrders } = useOrders();

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      {/* 1. SEPARATE FLOATING SCAN CTA (Bottom Right Floating Action Button) */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => rootNav.navigate('UploadPrescription', { fromCart: false })}
        style={styles.floatingScanFab}
      >
        <View style={styles.scanFabCircle}>
          <Ionicons name="scan" size={22} color="#FFFFFF" />
        </View>
        <AppText variant="caption" color="#FFFFFF" weight="800" style={styles.scanFabLabel}>
          Scan
        </AppText>
      </TouchableOpacity>

      {/* 2. MAIN LIQUID GLASS NAVIGATION BAR (Equal, Symmetric 3-Item Spacing) */}
      <View style={styles.capsuleShadowWrapper}>
        <BlurView intensity={Platform.OS === 'ios' ? 75 : 95} tint="light" style={styles.blurCapsule}>
          <View style={styles.glassInnerContent}>
            {state.routes.map((route, index) => {
              const isFocused = state.index === index;
              const config = TAB_CONFIG.find((c) => c.name === route.name);
              if (!config) return null;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const isOrdersTab = route.name === 'OrdersTab';
              const showBadge = isOrdersTab && activeOrders.length > 0;

              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  onPress={onPress}
                  activeOpacity={0.8}
                  style={styles.tabItemWrapper}
                >
                  <View style={[styles.tabItemPill, isFocused && styles.tabItemPillActive]}>
                    <View style={styles.iconWrapper}>
                      <Ionicons
                        name={isFocused ? config.activeIcon : config.inactiveIcon}
                        size={20}
                        color={isFocused ? '#FFFFFF' : '#64748B'}
                      />
                      {showBadge && (
                        <View style={styles.badgePill}>
                          <AppText variant="caption" color="#FFFFFF" weight="800" style={styles.badgeText}>
                            {activeOrders.length}
                          </AppText>
                        </View>
                      )}
                    </View>

                    <AppText
                      variant="bodySmall"
                      color={isFocused ? '#FFFFFF' : '#64748B'}
                      weight={isFocused ? '800' : '600'}
                      style={styles.tabLabel}
                      numberOfLines={1}
                    >
                      {config.label}
                    </AppText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      </View>
    </View>
  );
};

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      tabBar={(props) => <FloatingLiquidGlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: 0,
          backgroundColor: 'transparent',
        },
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="CategoriesTab" component={CategoriesScreen} />
      <Tab.Screen name="OrdersTab" component={OrdersScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 14 : 22,
    left: 16,
    right: 16,
    zIndex: 999,
  },
  // Floating Scan CTA Button on Bottom Right
  floatingScanFab: {
    position: 'absolute',
    right: 4,
    top: -62,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A2986',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#3A2986',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 1000,
  },
  scanFabCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  scanFabLabel: {
    fontSize: 12,
    letterSpacing: 0.3,
  },

  // Main Liquid Glass Capsule
  capsuleShadowWrapper: {
    width: '100%',
    borderRadius: 36,
    backgroundColor: Platform.OS === 'android' ? 'rgba(255, 255, 255, 0.94)' : 'rgba(255, 255, 255, 0.84)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#3A2986',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 14,
  },
  blurCapsule: {
    width: '100%',
    borderRadius: 34,
    overflow: 'hidden',
  },
  glassInnerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    height: 66,
  },
  tabItemWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabItemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 22,
    width: '100%',
  },
  tabItemPillActive: {
    backgroundColor: '#3A2986',
    shadowColor: '#3A2986',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginLeft: 6,
  },
  badgePill: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#E11D48',
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 8,
    lineHeight: 10,
  },
});

import React from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { BottomTabParamList, AppStackParamList } from '../types/navigation';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CategoriesScreen } from '../screens/medicines/CategoriesScreen';
import { OrdersScreen } from '../screens/orders/OrdersScreen';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';
import { AppText } from '../components/common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../store/OrderContext';
import { useTabBarScroll } from '../store/TabBarScrollContext';
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
  const { collapseAnim } = useTabBarScroll();

  // Dynamic Animated Values based on scroll
  const barHeight = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [64, 48],
  });

  const horizontalMargin = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 36],
  });

  const labelOpacity = collapseAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [1, 0, 0],
  });

  const labelMaxWidth = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [72, 0],
  });

  const labelMarginLeft = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 0],
  });

  const pillPaddingHorizontal = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 10],
  });

  const pillPaddingVertical = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 6],
  });

  const scanFabTop = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-58, -50],
  });

  const scanFabLabelOpacity = collapseAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [1, 0, 0],
  });

  const scanFabLabelMaxWidth = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [46, 0],
  });

  const scanFabPaddingHorizontal = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 10],
  });

  return (
    <Animated.View
      style={[
        styles.floatingContainer,
        {
          left: horizontalMargin,
          right: horizontalMargin,
        },
      ]}
      pointerEvents="box-none"
    >
      {/* 1. SEPARATE FLOATING SCAN CTA (Bottom Right Floating Action Button) */}
      <Animated.View style={{ position: 'absolute', right: 4, top: scanFabTop, zIndex: 1000 }}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => rootNav.navigate('UploadPrescription', { fromCart: false })}
        >
          <Animated.View
            style={[
              styles.floatingScanFab,
              {
                paddingHorizontal: scanFabPaddingHorizontal,
              },
            ]}
          >
            <View style={styles.scanFabCircle}>
              <Ionicons name="scan" size={20} color="#FFFFFF" />
            </View>
            <Animated.View
              style={{
                maxWidth: scanFabLabelMaxWidth,
                opacity: scanFabLabelOpacity,
                overflow: 'hidden',
              }}
            >
              <AppText variant="caption" color="#FFFFFF" weight="600" style={styles.scanFabLabel}>
                Scan
              </AppText>
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {/* 2. MAIN LIQUID GLASS NAVIGATION BAR (Equal, Symmetric 3-Item Spacing) */}
      <View style={styles.capsuleShadowWrapper}>
        <BlurView intensity={Platform.OS === 'ios' ? 75 : 95} tint="light" style={styles.blurCapsule}>
          <Animated.View style={[styles.glassInnerContent, { height: barHeight }]}>
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
                  <Animated.View
                    style={[
                      styles.tabItemPill,
                      isFocused && styles.tabItemPillActive,
                      {
                        paddingHorizontal: pillPaddingHorizontal,
                        paddingVertical: pillPaddingVertical,
                      },
                    ]}
                  >
                    <View style={styles.iconWrapper}>
                      <Ionicons
                        name={isFocused ? config.activeIcon : config.inactiveIcon}
                        size={19}
                        color={isFocused ? '#FFFFFF' : '#64748B'}
                      />
                      {showBadge && (
                        <View style={styles.badgePill}>
                          <AppText variant="caption" color="#FFFFFF" weight="600" style={styles.badgeText}>
                            {activeOrders.length}
                          </AppText>
                        </View>
                      )}
                    </View>

                    <Animated.View
                      style={{
                        maxWidth: labelMaxWidth,
                        opacity: labelOpacity,
                        marginLeft: labelMarginLeft,
                        overflow: 'hidden',
                      }}
                    >
                      <AppText
                        variant="bodySmall"
                        color={isFocused ? '#FFFFFF' : '#64748B'}
                        weight="600"
                        style={styles.tabLabel}
                        numberOfLines={1}
                      >
                        {config.label}
                      </AppText>
                    </Animated.View>
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        </BlurView>
      </View>
    </Animated.View>
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
    zIndex: 999,
  },
  // Floating Scan CTA Button on Bottom Right
  floatingScanFab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A2986',
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#3A2986',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  scanFabCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFabLabel: {
    fontSize: 12,
    letterSpacing: 0.3,
    marginLeft: 5,
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
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tabItemWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  tabItemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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

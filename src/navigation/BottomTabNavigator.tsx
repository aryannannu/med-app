import React from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabParamList } from '../types/navigation';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CategoriesScreen } from '../screens/medicines/CategoriesScreen';
import { OrdersScreen } from '../screens/orders/OrdersScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { AppText } from '../components/common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../store/OrderContext';
import { useTabBarScroll } from '../store/TabBarScrollContext';
import { useAppTheme } from '../store/ThemeContext';

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
  { name: 'OrdersTab', label: 'Recent order', activeIcon: 'receipt', inactiveIcon: 'receipt-outline' },
  { name: 'ProfileTab', label: 'Profile', activeIcon: 'person', inactiveIcon: 'person-outline' },
];

const CustomBottomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { activeOrders } = useOrders();
  const { collapseAnim } = useTabBarScroll();
  const { colors, isDark } = useAppTheme();

  const translateY = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 110],
  });

  const opacity = collapseAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [1, 0.4, 0],
  });

  const scale = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.94],
  });

  const gradientColors: [string, string, string] = isDark
    ? ['rgba(15, 15, 20, 0)', 'rgba(15, 15, 20, 0.75)', 'rgba(15, 15, 20, 0.98)']
    : ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.75)', 'rgba(255, 255, 255, 0.98)'];

  return (
    <Animated.View
      style={[
        styles.floatingContainer,
        {
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
      pointerEvents="box-none"
    >
      {/* Soft Linear Gradient Overlay Under Nav Bar */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.bottomGradientOverlay}
        pointerEvents="none"
      />
      <View style={[styles.tabCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
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
              activeOpacity={0.75}
              style={styles.tabItem}
            >
              <View
                style={[
                  styles.iconPill,
                  isFocused && { backgroundColor: colors.primaryMuted },
                ]}
              >
                <Ionicons
                  name={isFocused ? config.activeIcon : config.inactiveIcon}
                  size={22}
                  color={isFocused ? colors.primary : colors.textSecondary}
                />
                {showBadge && (
                  <View style={[styles.badgePill, { borderColor: colors.surfaceElevated }]}>
                    <AppText variant="caption" color="#FFFFFF" weight="600" style={styles.badgeText}>
                      {activeOrders.length}
                    </AppText>
                  </View>
                )}
              </View>
              <AppText
                style={[
                  styles.tabLabel,
                  { color: isFocused ? colors.primary : colors.textSecondary },
                  isFocused ? styles.activeTabLabel : styles.inactiveTabLabel,
                ]}
                numberOfLines={1}
              >
                {config.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      tabBar={(props) => <CustomBottomTabBar {...props} />}
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
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    paddingHorizontal: 12,
  },
  bottomGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: -1,
  },
  tabCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 36,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPill: {
    width: 68,
    height: 38,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabLabel: {
    fontSize: 11.5,
    marginTop: 3,
    textAlign: 'center',
  },
  activeTabLabel: {
    fontWeight: '700',
  },
  inactiveTabLabel: {
    fontWeight: '600',
  },
  badgePill: {
    position: 'absolute',
    top: 2,
    right: 14,
    backgroundColor: '#E11D48',
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 8,
    lineHeight: 10,
  },
});


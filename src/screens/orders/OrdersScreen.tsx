import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { OrderCard } from '../../components/orders/OrderCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useOrders } from '../../store/OrderContext';
import { useToast } from '../../store/ToastContext';
import { useTabBarScroll } from '../../store/TabBarScrollContext';
import { useAppTheme } from '../../store/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '../../types/order';

export const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'cancelled'>('active');

  const { activeOrders, completedOrders, cancelledOrders, isLoading, reorder } = useOrders();
  const { showToast } = useToast();
  const { onScroll } = useTabBarScroll();
  const { colors, isDark } = useAppTheme();

  const getDisplayedOrders = (): Order[] => {
    switch (activeTab) {
      case 'active':
        return activeOrders;
      case 'completed':
        return completedOrders;
      case 'cancelled':
        return cancelledOrders;
      default:
        return activeOrders;
    }
  };

  const orders = getDisplayedOrders();

  const handleReorder = async (order: Order) => {
    await reorder(order);
    showToast('Items added to cart for reorder!', 'success');
    navigation.navigate('Cart');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {navigation.canGoBack() && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        <AppText variant="titleMedium" color={colors.textPrimary} weight="700" style={{ marginLeft: navigation.canGoBack() ? 10 : 0 }}>
          My Orders
        </AppText>
      </View>

      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('active')}
          style={[styles.tabBtn, activeTab === 'active' && styles.tabBtnActive]}
        >
          <AppText
            variant="buttonSmall"
            color={activeTab === 'active' ? COLORS.primary : COLORS.textSecondary}
            weight="600"
          >
            Active ({activeOrders.length})
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('completed')}
          style={[styles.tabBtn, activeTab === 'completed' && styles.tabBtnActive]}
        >
          <AppText
            variant="buttonSmall"
            color={activeTab === 'completed' ? COLORS.primary : COLORS.textSecondary}
            weight="600"
          >
            Completed ({completedOrders.length})
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('cancelled')}
          style={[styles.tabBtn, activeTab === 'cancelled' && styles.tabBtnActive]}
        >
          <AppText
            variant="buttonSmall"
            color={activeTab === 'cancelled' ? COLORS.primary : COLORS.textSecondary}
            weight="600"
          >
            Cancelled ({cancelledOrders.length})
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      {isLoading ? (
        <LoadingState message="Loading your orders..." />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title={`No ${activeTab.toUpperCase()} Orders`}
          message={
            activeTab === 'active'
              ? 'You have no active orders in progress.'
              : activeTab === 'completed'
              ? 'You have no past completed orders yet.'
              : 'You have no cancelled orders.'
          }
          actionText="Browse Medicines"
          onActionPress={() => navigation.navigate('Search')}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={() => navigation.navigate('OrderDetails', { orderId: order.id, order })}
              onReorder={() => handleReorder(order)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: COLORS.primary,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
});

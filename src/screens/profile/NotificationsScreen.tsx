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
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { useAppTheme } from '../../store/ThemeContext';
import { AppText } from '../../components/common/AppText';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_NOTIFICATIONS } from '../../services/mockData';
import { NotificationItem } from '../../types/user';
import { formatDateTime } from '../../utils/formatters';

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { colors, isDark } = useAppTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'offer_received':
        return { icon: 'pricetag' as const, color: COLORS.primary, bg: COLORS.primarySubtle };
      case 'prescription_verified':
        return { icon: 'checkmark-circle' as const, color: COLORS.secondary, bg: COLORS.secondaryLight };
      case 'order_status':
        return { icon: 'bicycle' as const, color: '#F59E0B', bg: '#FEF3C7' };
      default:
        return { icon: 'notifications' as const, color: COLORS.info, bg: COLORS.infoLight };
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="titleMedium" color={colors.textPrimary} weight="600">
          Notifications
        </AppText>
        <TouchableOpacity onPress={markAllRead} style={styles.readAllBtn}>
          <AppText variant="caption" color={colors.primary} weight="600">
            Mark Read
          </AppText>
        </TouchableOpacity>
      </View>

      {notifications.length === 0 ? (
        <EmptyState
          icon="notifications-off-outline"
          title="No Notifications"
          message="You're all caught up! Updates about your orders and offers will appear here."
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {notifications.map((notif) => {
            const config = getNotifIcon(notif.type);

            return (
              <TouchableOpacity
                key={notif.id}
                activeOpacity={0.85}
                onPress={() => {
                  if (notif.orderId) {
                    navigation.navigate('OrderDetails', { orderId: notif.orderId });
                  }
                }}
                style={[
                  styles.notifCard,
                  !notif.isRead && styles.notifCardUnread,
                  SHADOWS.subtle,
                ]}
              >
                <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
                  <Ionicons name={config.icon} size={22} color={config.color} />
                </View>

                <View style={styles.contentCol}>
                  <View style={styles.titleRow}>
                    <AppText variant="titleSmall" color={colors.textPrimary} weight="600" style={{ flex: 1 }}>
                      {notif.title}
                    </AppText>
                    {!notif.isRead && <View style={styles.unreadDot} />}
                  </View>

                  <AppText variant="bodySmall" color={colors.textSecondary} style={{ marginTop: 2 }}>
                    {notif.message}
                  </AppText>

                  <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 6 }}>
                    {formatDateTime(notif.timestamp)}
                  </AppText>
                </View>
              </TouchableOpacity>
            );
          })}
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readAllBtn: {
    padding: SPACING.xs,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  notifCardUnread: {
    borderColor: COLORS.primaryMuted,
    backgroundColor: '#FBF9FE',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentCol: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.xs,
  },
});




import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useSupport } from '../../store/SupportContext';
import { useToast } from '../../store/ToastContext';

export const NotificationPreferencesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { notificationSettings, updateNotificationSetting } = useSupport();
  const { showToast } = useToast();

  const handleToggle = (key: keyof typeof notificationSettings, value: boolean) => {
    updateNotificationSetting(key, value);
    showToast('Preferences updated', 'info');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600" style={styles.headerTitle}>
          Notification Preferences
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* System Permission Status Banner */}
        <View style={[styles.osPermissionBanner, SHADOWS.subtle]}>
          <View style={styles.osIconCircle}>
            <Ionicons name="notifications" size={20} color="#15803D" />
          </View>
          <View style={styles.osTextCol}>
            <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
              System Notifications Active
            </AppText>
            <AppText variant="caption" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
              HEALIT has permission to send order alerts on this device.
            </AppText>
          </View>
        </View>

        {/* Toggles Container */}
        <View style={[styles.card, SHADOWS.subtle]}>
          {/* Order Updates */}
          <View style={styles.row}>
            <View style={styles.textCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                Order &amp; Prescription Updates
              </AppText>
              <AppText variant="caption" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
                Confirmed, packing, prescription verification &amp; rider assignment
              </AppText>
            </View>
            <Switch
              value={notificationSettings.orderUpdates}
              onValueChange={(val) => handleToggle('orderUpdates', val)}
              trackColor={{ false: '#E8E8EE', true: COLORS.primary }}
              thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
            />
          </View>

          <View style={styles.divider} />

          {/* Delivery Updates */}
          <View style={styles.row}>
            <View style={styles.textCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                Live Delivery Alerts
              </AppText>
              <AppText variant="caption" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
                Rider arrival notifications, ETA countdown, doorstep delivery pin
              </AppText>
            </View>
            <Switch
              value={notificationSettings.deliveryUpdates}
              onValueChange={(val) => handleToggle('deliveryUpdates', val)}
              trackColor={{ false: '#E8E8EE', true: COLORS.primary }}
              thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
            />
          </View>

          <View style={styles.divider} />

          {/* Offers & Discounts */}
          <View style={styles.row}>
            <View style={styles.textCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                Pharmacy Offers &amp; Discounts
              </AppText>
              <AppText variant="caption" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
                Promotional coupons, free delivery vouchers, wallet cashbacks
              </AppText>
            </View>
            <Switch
              value={notificationSettings.offersAndDiscounts}
              onValueChange={(val) => handleToggle('offersAndDiscounts', val)}
              trackColor={{ false: '#E8E8EE', true: COLORS.primary }}
              thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
            />
          </View>

          <View style={styles.divider} />

          {/* Medicine Reminders */}
          <View style={styles.row}>
            <View style={styles.textCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                Medicine Refill Reminders
              </AppText>
              <AppText variant="caption" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
                Smart refill alerts for chronic medicines before your stock runs out
              </AppText>
            </View>
            <Switch
              value={notificationSettings.medicineReminders}
              onValueChange={(val) => handleToggle('medicineReminders', val)}
              trackColor={{ false: '#E8E8EE', true: COLORS.primary }}
              thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EE',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 60,
  },
  osPermissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  osIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  osTextCol: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  textCol: {
    flex: 1,
    marginRight: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8EE',
    marginHorizontal: SPACING.lg,
  },
});

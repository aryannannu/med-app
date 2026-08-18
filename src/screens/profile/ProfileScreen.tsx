import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { usePrescription } from '../../store/PrescriptionContext';
import { useAddress } from '../../store/AddressContext';
import { formatPhoneNumber } from '../../utils/formatters';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { user, logout } = useAuth();
  const { prescriptions } = usePrescription();
  const { addresses } = useAddress();

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    await logout();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <AppText variant="titleLarge" color={COLORS.textPrimary} weight="800">
          Account & Settings
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={[styles.userCard, SHADOWS.card]}>
          <Image
            source={{ uri: user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80' }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <AppText variant="h3" color={COLORS.textPrimary} weight="800">
              {user?.name || 'Rahul Sharma'}
            </AppText>
            <AppText variant="bodySmall" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
              {user?.phoneNumber ? formatPhoneNumber(user.phoneNumber) : '+91 98765 43210'}
            </AppText>
            <AppText variant="caption" color={COLORS.primary} weight="600" style={{ marginTop: 2 }}>
              {user?.email || 'rahul.sharma@example.com'}
            </AppText>
          </View>
        </View>

        {/* Quick Menu Links */}
        <View style={[styles.menuSection, SHADOWS.subtle]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AddressSelection', { isSelectingForCheckout: false })}
            style={styles.menuItem}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: COLORS.primarySubtle }]}>
              <Ionicons name="location-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.menuTextCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700">
                Saved Delivery Addresses
              </AppText>
              <AppText variant="caption" color={COLORS.textMuted}>
                {addresses.length} saved addresses
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('UploadPrescription', { fromCart: false })}
            style={styles.menuItem}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: COLORS.secondaryLight }]}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.secondary} />
            </View>
            <View style={styles.menuTextCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700">
                Prescription Vault
              </AppText>
              <AppText variant="caption" color={COLORS.textMuted}>
                {prescriptions.length} uploaded prescriptions
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MainTabs', { screen: 'OrdersTab' } as any)}
            style={styles.menuItem}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="receipt-outline" size={20} color="#F59E0B" />
            </View>
            <View style={styles.menuTextCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700">
                Order History & Invoices
              </AppText>
              <AppText variant="caption" color={COLORS.textMuted}>
                View all active & past orders
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Notifications')}
            style={styles.menuItem}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="notifications-outline" size={20} color="#6366F1" />
            </View>
            <View style={styles.menuTextCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700">
                Notifications & Alerts
              </AppText>
              <AppText variant="caption" color={COLORS.textMuted}>
                Order status & pharmacy offers
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Support & Legal */}
        <View style={[styles.menuSection, SHADOWS.subtle]}>
          <TouchableOpacity activeOpacity={0.8} style={styles.menuItem}>
            <View style={[styles.menuIconCircle, { backgroundColor: COLORS.surfaceSubtle }]}>
              <Ionicons name="headset-outline" size={20} color={COLORS.textPrimary} />
            </View>
            <View style={styles.menuTextCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700">
                Help & Customer Support
              </AppText>
              <AppText variant="caption" color={COLORS.textMuted}>
                24x7 chat & helpline
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity activeOpacity={0.8} style={styles.menuItem}>
            <View style={[styles.menuIconCircle, { backgroundColor: COLORS.surfaceSubtle }]}>
              <Ionicons name="shield-outline" size={20} color={COLORS.textPrimary} />
            </View>
            <View style={styles.menuTextCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700">
                Privacy Policy & Terms
              </AppText>
              <AppText variant="caption" color={COLORS.textMuted}>
                Compliance & data safety
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setLogoutModalVisible(true)}
          style={styles.logoutBtn}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <AppText variant="button" color={COLORS.danger} weight="700" style={{ marginLeft: 8 }}>
            Logout
          </AppText>
        </TouchableOpacity>

        <AppText variant="caption" color={COLORS.textMuted} align="center" style={styles.versionText}>
          HEALIT v1.0.0 (Production Build)
        </AppText>
      </ScrollView>

      {/* Logout Confirmation */}
      <ConfirmationModal
        visible={logoutModalVisible}
        title="Logout from HEALIT?"
        message="Are you sure you want to log out of your HEALIT account?"
        confirmText="Log Out"
        cancelText="Cancel"
        isDestructive
        icon="log-out-outline"
        onConfirm={handleLogout}
        onCancel={() => setLogoutModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surfaceSubtle,
  },
  userInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  menuSection: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextCol: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SPACING.lg,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: SPACING.sm,
  },
  versionText: {
    marginTop: SPACING.xl,
  },
});

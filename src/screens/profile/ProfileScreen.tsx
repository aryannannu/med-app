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
import { useWallet } from '../../store/WalletContext';
import { useAddress } from '../../store/AddressContext';
import { usePrescription } from '../../store/PrescriptionContext';
import { useSavedPharmacies } from '../../store/SavedPharmaciesContext';
import { useAppTheme } from '../../store/ThemeContext';
import { formatCurrency } from '../../utils/currency';
import { formatPhoneNumber } from '../../utils/formatters';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { user, logout } = useAuth();
  const { balance } = useWallet();
  const { addresses } = useAddress();
  const { prescriptions } = usePrescription();
  const { savedPharmacies } = useSavedPharmacies();
  const { themeMode } = useAppTheme();

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    await logout();
  };

  const userName = user?.name || 'Aryan';
  const userPhone = user?.phoneNumber ? formatPhoneNumber(user.phoneNumber) : '+91 98765 43210';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Profile Header (Clean, no cart/notification) */}
      <View style={styles.header}>
        <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600">
          Profile
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* =========================================================================
            1. USER IDENTITY CARD
           ========================================================================= */}
        <View style={[styles.userCard, SHADOWS.card]}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.initialsAvatar}>
              <AppText variant="h2" color="#FFFFFF" weight="600">
                {userName.slice(0, 1).toUpperCase()}
              </AppText>
            </View>
          )}

          <View style={styles.userInfo}>
            <AppText variant="h3" color={COLORS.textPrimary} weight="600">
              {userName}
            </AppText>
            <AppText variant="bodySmall" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
              {userPhone}
            </AppText>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('EditProfile')}
              style={styles.editProfileLink}
            >
              <AppText variant="caption" color={COLORS.primary} weight="600">
                Edit Profile →
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* =========================================================================
            2. QUICK ACTIONS
           ========================================================================= */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('MainTabs', { screen: 'OrdersTab' } as any)}
            style={[styles.quickActionCard, SHADOWS.subtle]}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: '#ECE8F7' }]}>
              <Ionicons name="receipt" size={20} color={COLORS.primary} />
            </View>
            <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600" style={{ marginTop: SPACING.xs }}>
              My Orders
            </AppText>
            <AppText variant="caption" color={COLORS.textSecondary} style={{ fontSize: 11 }}>
              Track &amp; Invoices
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AddressSelection', { isSelectingForCheckout: false })}
            style={[styles.quickActionCard, SHADOWS.subtle]}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="location" size={20} color="#2563EB" />
            </View>
            <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600" style={{ marginTop: SPACING.xs }}>
              Addresses
            </AppText>
            <AppText variant="caption" color={COLORS.textSecondary} style={{ fontSize: 11 }}>
              {addresses.length} Saved
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SavedPharmacies')}
            style={[styles.quickActionCard, SHADOWS.subtle]}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="heart" size={20} color="#DC2626" />
            </View>
            <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600" style={{ marginTop: SPACING.xs }}>
              Pharmacies
            </AppText>
            <AppText variant="caption" color={COLORS.textSecondary} style={{ fontSize: 11 }}>
              {savedPharmacies.length} Saved
            </AppText>
          </TouchableOpacity>
        </View>

        {/* =========================================================================
            3. ACCOUNT SECTION
           ========================================================================= */}
        <AppText variant="caption" color={COLORS.textSecondary} weight="600" style={styles.sectionHeading}>
          ACCOUNT
        </AppText>

        <View style={[styles.menuCard, SHADOWS.subtle]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.menuRow}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#F8F8FC' }]}>
              <Ionicons name="person-outline" size={20} color={COLORS.textPrimary} />
            </View>
            <View style={styles.menuTextCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                Personal Information
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('MainTabs', { screen: 'OrdersTab' } as any)}
            style={styles.menuRow}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#F8F8FC' }]}>
              <Ionicons name="receipt-outline" size={20} color={COLORS.textPrimary} />
            </View>
            <View style={styles.menuTextCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                My Orders
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('UploadPrescription', { fromCart: false })}
            style={styles.menuRow}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#F8F8FC' }]}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.textPrimary} />
            </View>
            <View style={styles.menuTextCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                My Prescriptions
              </AppText>
              <AppText variant="caption" color={COLORS.textSecondary}>
                {prescriptions.length} uploaded records
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Wallet')}
            style={styles.menuRow}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#ECE8F7' }]}>
              <Ionicons name="wallet-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.menuTextCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                HEALIT Wallet
              </AppText>
              <AppText variant="caption" color="#15803D" weight="600">
                {formatCurrency(balance)} available
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('PaymentMethods')}
            style={styles.menuRow}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#F8F8FC' }]}>
              <Ionicons name="card-outline" size={20} color={COLORS.textPrimary} />
            </View>
            <View style={styles.menuTextCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                Payment Methods
              </AppText>
              <AppText variant="caption" color={COLORS.textSecondary}>
                Saved UPI &amp; Cards
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* =========================================================================
            4. SAVED SECTION
           ========================================================================= */}
        <AppText variant="caption" color={COLORS.textSecondary} weight="600" style={styles.sectionHeading}>
          SAVED
        </AppText>

        <View style={[styles.menuCard, SHADOWS.subtle]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AddressSelection', { isSelectingForCheckout: false })}
            style={styles.menuRow}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#F8F8FC' }]}>
              <Ionicons name="location-outline" size={20} color={COLORS.textPrimary} />
            </View>
            <View style={styles.menuTextCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                Saved Addresses
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('SavedPharmacies')}
            style={styles.menuRow}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#F8F8FC' }]}>
              <Ionicons name="heart-outline" size={20} color={COLORS.textPrimary} />
            </View>
            <View style={styles.menuTextCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                Saved Pharmacies
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* =========================================================================
            5. PREFERENCES SECTION
           ========================================================================= */}
        <AppText variant="caption" color={COLORS.textSecondary} weight="600" style={styles.sectionHeading}>
          PREFERENCES
        </AppText>

        <View style={[styles.menuCard, SHADOWS.subtle]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Appearance')}
            style={styles.menuRow}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#F8F8FC' }]}>
              <Ionicons name="color-palette-outline" size={20} color={COLORS.textPrimary} />
            </View>
            <View style={styles.menuTextCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                Appearance
              </AppText>
              <AppText variant="caption" color={COLORS.textSecondary}>
                {themeMode === 'system' ? 'System Default' : themeMode === 'dark' ? 'Dark' : 'Light'}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('NotificationPreferences')}
            style={styles.menuRow}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#F8F8FC' }]}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.textPrimary} />
            </View>
            <View style={styles.menuTextCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                Notifications
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('PrivacySecurity')}
            style={styles.menuRow}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#F8F8FC' }]}>
              <Ionicons name="shield-outline" size={20} color={COLORS.textPrimary} />
            </View>
            <View style={styles.menuTextCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                Privacy &amp; Security
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* =========================================================================
            6. SUPPORT SECTION
           ========================================================================= */}
        <AppText variant="caption" color={COLORS.textSecondary} weight="600" style={styles.sectionHeading}>
          SUPPORT
        </AppText>

        <View style={[styles.menuCard, SHADOWS.subtle]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('HelpCenter')}
            style={styles.menuRow}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#F8F8FC' }]}>
              <Ionicons name="help-circle-outline" size={20} color={COLORS.textPrimary} />
            </View>
            <View style={styles.menuTextCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                Help Center
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ContactSupport')}
            style={styles.menuRow}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#F8F8FC' }]}>
              <Ionicons name="headset-outline" size={20} color={COLORS.textPrimary} />
            </View>
            <View style={styles.menuTextCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                Contact Support
              </AppText>
              <AppText variant="caption" color="#15803D" weight="600">
                24x7 Live Chat &amp; Call
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ReportIssue')}
            style={styles.menuRow}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#F8F8FC' }]}>
              <Ionicons name="alert-circle-outline" size={20} color={COLORS.textPrimary} />
            </View>
            <View style={styles.menuTextCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                Report an Issue
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* =========================================================================
            7. ABOUT & LEGAL SECTION
           ========================================================================= */}
        <AppText variant="caption" color={COLORS.textSecondary} weight="600" style={styles.sectionHeading}>
          ABOUT &amp; LEGAL
        </AppText>

        <View style={[styles.menuCard, SHADOWS.subtle]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('LegalDocument', { docType: 'terms' })}
            style={styles.menuRow}
          >
            <View style={styles.menuTextCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                Terms &amp; Conditions
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('LegalDocument', { docType: 'privacy' })}
            style={styles.menuRow}
          >
            <View style={styles.menuTextCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                Privacy Policy
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('LegalDocument', { docType: 'refund' })}
            style={styles.menuRow}
          >
            <View style={styles.menuTextCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                Refund / Cancellation Policy
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('LegalDocument', { docType: 'medicine_policy' })}
            style={styles.menuRow}
          >
            <View style={styles.menuTextCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                Medicine Ordering Policy
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <AppText variant="caption" color={COLORS.textMuted} align="center" style={styles.versionText}>
          HEALIT Version 1.0.0
        </AppText>

        {/* =========================================================================
            8. BOTTOM ACTIONS (LOG OUT & DELETE ACCOUNT)
           ========================================================================= */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setLogoutModalVisible(true)}
          style={styles.logoutBtn}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <AppText variant="button" color={COLORS.danger} weight="600" style={{ marginLeft: 8 }}>
            Log Out
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('DeleteAccount')}
          style={styles.deleteAccountBtn}
        >
          <AppText variant="caption" color={COLORS.textMuted} weight="600">
            Delete Account
          </AppText>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Bottom Modal */}
      <ConfirmationModal
        visible={logoutModalVisible}
        title="Log out of HEALIT?"
        message="You'll need to sign in again to access your account."
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
    backgroundColor: '#F8F8FC',
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EE',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8F8FC',
  },
  initialsAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  editProfileLink: {
    marginTop: 4,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    alignItems: 'center',
  },
  quickIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.xl,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextCol: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8EE',
    marginHorizontal: SPACING.md,
  },
  versionText: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
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
    marginBottom: SPACING.md,
  },
  deleteAccountBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
});

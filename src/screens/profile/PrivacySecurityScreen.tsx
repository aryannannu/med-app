import React from 'react';
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
import { AppText } from '../../components/common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../store/ToastContext';

export const PrivacySecurityScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { showToast } = useToast();

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
          Privacy &amp; Security
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section 1: Account Security */}
        <View style={styles.section}>
          <AppText variant="caption" color={COLORS.textSecondary} weight="600" style={styles.sectionTitle}>
            ACCOUNT SECURITY
          </AppText>

          <View style={[styles.card, SHADOWS.subtle]}>
            <View style={styles.row}>
              <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="shield-checkmark" size={20} color="#15803D" />
              </View>
              <View style={styles.textCol}>
                <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                  Two-Factor OTP Login
                </AppText>
                <AppText variant="caption" color={COLORS.textSecondary}>
                  Encrypted SMS authentication enabled for your account
                </AppText>
              </View>
              <View style={styles.activeTag}>
                <AppText variant="caption" color="#15803D" weight="600" style={{ fontSize: 10 }}>
                  ACTIVE
                </AppText>
              </View>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => showToast('Session tokens verified securely', 'info')}
              style={styles.row}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#ECE8F7' }]}>
                <Ionicons name="key-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.textCol}>
                <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                  Active Login Sessions
                </AppText>
                <AppText variant="caption" color={COLORS.textSecondary}>
                  1 device currently logged in
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 2: App Permissions */}
        <View style={styles.section}>
          <AppText variant="caption" color={COLORS.textSecondary} weight="600" style={styles.sectionTitle}>
            APP PERMISSIONS
          </AppText>

          <View style={[styles.card, SHADOWS.subtle]}>
            <View style={styles.row}>
              <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="location-outline" size={20} color="#2563EB" />
              </View>
              <View style={styles.textCol}>
                <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                  Location Access
                </AppText>
                <AppText variant="caption" color={COLORS.textSecondary}>
                  Required for discovering nearby 10-15 min pharmacy inventory
                </AppText>
              </View>
              <View style={styles.grantedTag}>
                <AppText variant="caption" color="#15803D" weight="600" style={{ fontSize: 11 }}>
                  Allowed
                </AppText>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="camera-outline" size={20} color="#D97706" />
              </View>
              <View style={styles.textCol}>
                <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                  Camera Access
                </AppText>
                <AppText variant="caption" color={COLORS.textSecondary}>
                  Used for real-time doctor prescription scanning
                </AppText>
              </View>
              <View style={styles.grantedTag}>
                <AppText variant="caption" color="#15803D" weight="600" style={{ fontSize: 11 }}>
                  Allowed
                </AppText>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="images-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.textCol}>
                <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                  Photo &amp; Document Storage
                </AppText>
                <AppText variant="caption" color={COLORS.textSecondary}>
                  Used to upload saved PDF &amp; JPG prescriptions
                </AppText>
              </View>
              <View style={styles.grantedTag}>
                <AppText variant="caption" color="#15803D" weight="600" style={{ fontSize: 11 }}>
                  Allowed
                </AppText>
              </View>
            </View>
          </View>
        </View>

        {/* Section 3: Data & Privacy */}
        <View style={styles.section}>
          <AppText variant="caption" color={COLORS.textSecondary} weight="600" style={styles.sectionTitle}>
            DATA &amp; PRIVACY
          </AppText>

          <View style={[styles.card, SHADOWS.subtle]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('LegalDocument', { docType: 'privacy' })}
              style={styles.row}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#F8F8FC' }]}>
                <Ionicons name="document-text-outline" size={20} color={COLORS.textPrimary} />
              </View>
              <View style={styles.textCol}>
                <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                  Privacy Policy
                </AppText>
                <AppText variant="caption" color={COLORS.textSecondary}>
                  Learn how HEALIT encrypts and protects your health data
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => showToast('Data summary generated. Sent to registered email.', 'success')}
              style={styles.row}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#F8F8FC' }]}>
                <Ionicons name="download-outline" size={20} color={COLORS.textPrimary} />
              </View>
              <View style={styles.textCol}>
                <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                  Download My Data
                </AppText>
                <AppText variant="caption" color={COLORS.textSecondary}>
                  Export order history, invoices, and prescription records
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
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
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
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
    padding: SPACING.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  activeTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  grantedTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8EE',
    marginHorizontal: SPACING.md,
  },
});

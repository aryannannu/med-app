import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { Ionicons } from '@expo/vector-icons';

interface DocContent {
  title: string;
  lastUpdated: string;
  sections: { heading: string; body: string }[];
}

const LEGAL_DOCS: Record<string, DocContent> = {
  terms: {
    title: 'Terms & Conditions',
    lastUpdated: 'August 2026',
    sections: [
      {
        heading: '1. Introduction & Platform Scope',
        body: 'HEALIT is a hyperlocal technology platform connecting verified end-users with licensed neighborhood retail pharmacies. HEALIT acts as a facilitator and does not directly manufacture, distribute, or sell pharmaceutical goods.',
      },
      {
        heading: '2. User Eligibility & Account Responsibilities',
        body: 'You must be at least 18 years of age to register and place medicine delivery orders on HEALIT. You are solely responsible for maintaining the confidentiality of your account credentials and registered mobile phone number.',
      },
      {
        heading: '3. Pricing & Billing',
        body: 'Medicine prices, Maximum Retail Price (MRP), and applicable discounts are governed directly by our registered pharmacy partners adhering to the National Pharmaceutical Pricing Authority (NPPA) guidelines.',
      },
      {
        heading: '4. Delivery Timelines',
        body: 'Estimated delivery times (typically 10-15 minutes in operational zones) are indicative and dependent on live traffic, weather conditions, and pharmacy packaging speed.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'August 2026',
    sections: [
      {
        heading: '1. Health Data & Prescription Confidentiality',
        body: 'Your medical records, uploaded prescriptions, and order history are treated with stringent confidentiality and 256-bit encryption. They are shared solely with the dispensing licensed pharmacist for dispensing verification.',
      },
      {
        heading: '2. Information We Collect',
        body: 'We collect your name, mobile number, delivery address coordinates, prescription image uploads, and transactional payment references to process your orders seamlessly.',
      },
      {
        heading: '3. No Third-Party Sale of Health Data',
        body: 'HEALIT strictly does NOT sell, rent, or trade your personal medical information or medication history to marketing agencies or unauthorized third parties.',
      },
      {
        heading: '4. Data Retention & Deletion',
        body: 'You have the right to request account deletion and export your data at any time via Profile → Privacy & Security or Delete Account.',
      },
    ],
  },
  refund: {
    title: 'Refund & Cancellation Policy',
    lastUpdated: 'August 2026',
    sections: [
      {
        heading: '1. Free Cancellation Window',
        body: 'You may cancel any medicine order free of cost before the partner pharmacy dispatches the delivery rider.',
      },
      {
        heading: '2. Instant HEALIT Wallet Credit',
        body: 'All eligible cancellations and order refunds are credited instantly to your HEALIT Wallet within 10 seconds.',
      },
      {
        heading: '3. Bank / UPI Refund Timelines',
        body: 'If you choose to receive refunds to your original bank card or UPI account, standard banking processing times of 2 to 4 business days apply.',
      },
      {
        heading: '4. Damaged or Discrepant Products',
        body: 'If you receive an incorrect, broken, or near-expiry medicine, report the issue within 48 hours for immediate replacement or full reimbursement.',
      },
    ],
  },
  medicine_policy: {
    title: 'Medicine Ordering Policy',
    lastUpdated: 'August 2026',
    sections: [
      {
        heading: '1. Prescription Compliance (Schedule H & H1)',
        body: 'Orders containing Schedule H, H1, or X prescription drugs strictly require a valid, legible prescription issued by a registered medical practitioner (RMP).',
      },
      {
        heading: '2. Pharmacist Verification',
        body: 'A licensed registered pharmacist audits every Rx prescription upload for doctor registration number, dosage safety, and valid date before order fulfillment.',
      },
      {
        heading: '3. Authentic Manufacturer Batches',
        body: 'All medicines delivered through HEALIT are sourced exclusively from verified retail pharmacy inventory, sealed in tamper-proof bags with batch number and expiry dates.',
      },
      {
        heading: '4. Prohibited Substances',
        body: 'HEALIT does not facilitate the delivery of restricted narcotics, habit-forming drugs, or unapproved chemical formulations.',
      },
    ],
  },
};

export const LegalDocumentScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'LegalDocument'>>();
  const docType = route.params?.docType || 'terms';
  const doc = LEGAL_DOCS[docType] || LEGAL_DOCS.terms;

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
          {doc.title}
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Compliance Badge */}
        <View style={[styles.complianceCard, SHADOWS.subtle]}>
          <Ionicons name="shield-checkmark" size={20} color="#15803D" />
          <View style={{ marginLeft: SPACING.md, flex: 1 }}>
            <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
              Government Regulatory Compliance
            </AppText>
            <AppText variant="caption" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
              Compliant with Drugs and Cosmetics Act &amp; Pharmacy Practice Regulations • Last Updated {doc.lastUpdated}
            </AppText>
          </View>
        </View>

        {/* Document Sections */}
        <View style={[styles.docCard, SHADOWS.subtle]}>
          {doc.sections.map((section, idx) => (
            <View key={idx} style={styles.sectionBlock}>
              <AppText variant="titleSmall" color={COLORS.primary} weight="600" style={{ marginBottom: 4 }}>
                {section.heading}
              </AppText>
              <AppText variant="bodySmall" color={COLORS.textPrimary} style={{ lineHeight: 22 }}>
                {section.body}
              </AppText>
              {idx < doc.sections.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
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
  complianceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  docCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  sectionBlock: {
    marginBottom: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8EE',
    marginTop: SPACING.md,
  },
});

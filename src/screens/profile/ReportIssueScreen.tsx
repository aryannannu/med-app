import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { useSupport } from '../../store/SupportContext';
import { TicketCategory } from '../../types/support';
import { useToast } from '../../store/ToastContext';

const ISSUE_CATEGORIES: TicketCategory[] = [
  'Order',
  'Delivery',
  'Prescription',
  'Payment',
  'Wallet',
  'Pharmacy',
  'Account',
  'App',
];

export const ReportIssueScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'ReportIssue'>>();
  const { createTicket } = useSupport();
  const { showToast } = useToast();

  const [category, setCategory] = useState<TicketCategory>(
    (route.params?.category as TicketCategory) || 'Order'
  );
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttachment, setHasAttachment] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  // Errors
  const [subjectError, setSubjectError] = useState('');
  const [descError, setDescError] = useState('');

  const orderId = route.params?.orderId;

  const validate = () => {
    let isValid = true;
    setSubjectError('');
    setDescError('');

    if (!subject.trim()) {
      setSubjectError('Please enter a brief issue subject');
      isValid = false;
    }
    if (!description.trim() || description.trim().length < 10) {
      setDescError('Please provide more details (at least 10 characters)');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    const ticket = await createTicket({
      category,
      subject: subject.trim(),
      description: description.trim(),
      relatedOrderId: orderId,
    });
    setIsSubmitting(false);

    setCreatedTicketId(ticket.id);
  };

  const handleSuccessClose = () => {
    setCreatedTicketId(null);
    showToast('Support ticket logged successfully!', 'success');
    navigation.goBack();
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
          Report an Issue
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Category Selector */}
        <AppText variant="caption" color={COLORS.textSecondary} weight="600" style={styles.sectionTitle}>
          SELECT ISSUE CATEGORY *
        </AppText>

        <View style={styles.categoriesRow}>
          {ISSUE_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[
                styles.categoryChip,
                category === cat && styles.categoryChipActive,
              ]}
            >
              <AppText
                variant="caption"
                color={category === cat ? '#FFFFFF' : COLORS.textPrimary}
                weight="600"
              >
                {cat}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form Container */}
        <View style={[styles.formCard, SHADOWS.subtle]}>
          {/* Related Order if present */}
          {orderId && (
            <View style={styles.relatedOrderRow}>
              <Ionicons name="receipt-outline" size={16} color={COLORS.primary} />
              <AppText variant="caption" color={COLORS.textPrimary} weight="600" style={{ marginLeft: 6 }}>
                Order #{orderId.toUpperCase()} linked
              </AppText>
            </View>
          )}

          {/* Subject Field */}
          <View style={styles.fieldGroup}>
            <AppText variant="caption" color={COLORS.textSecondary} weight="600" style={styles.label}>
              ISSUE SUMMARY / TITLE *
            </AppText>
            <TextInput
              value={subject}
              onChangeText={(t) => {
                setSubject(t);
                if (subjectError) setSubjectError('');
              }}
              placeholder="e.g. Received incorrect dosage, delayed delivery"
              placeholderTextColor={COLORS.textMuted}
              style={[styles.input, subjectError ? styles.inputError : null]}
            />
            {subjectError ? (
              <AppText variant="caption" color={COLORS.danger} style={styles.errorText}>
                {subjectError}
              </AppText>
            ) : null}
          </View>

          {/* Description Field */}
          <View style={styles.fieldGroup}>
            <AppText variant="caption" color={COLORS.textSecondary} weight="600" style={styles.label}>
              DESCRIBE THE ISSUE IN DETAIL *
            </AppText>
            <TextInput
              value={description}
              onChangeText={(t) => {
                setDescription(t);
                if (descError) setDescError('');
              }}
              placeholder="Please describe what happened so our pharmacy operations team can resolve it quickly..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              style={[styles.textArea, descError ? styles.inputError : null]}
            />
            {descError ? (
              <AppText variant="caption" color={COLORS.danger} style={styles.errorText}>
                {descError}
              </AppText>
            ) : null}
          </View>

          {/* Attachment Box */}
          <View style={styles.attachmentBox}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setHasAttachment(!hasAttachment);
                showToast(
                  hasAttachment ? 'Attachment removed' : 'Photo attached: medicine_batch.jpg',
                  'info'
                );
              }}
              style={styles.attachmentBtn}
            >
              <Ionicons
                name={hasAttachment ? 'checkmark-circle' : 'camera-outline'}
                size={20}
                color={hasAttachment ? '#15803D' : COLORS.primary}
              />
              <AppText
                variant="bodySmall"
                color={hasAttachment ? '#15803D' : COLORS.primary}
                weight="600"
                style={{ marginLeft: 6 }}
              >
                {hasAttachment ? 'Photo Attached (medicine_batch.jpg)' : 'Attach Photo / Invoice (Optional)'}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        <AppButton
          title={isSubmitting ? 'Submitting Ticket...' : 'Submit Issue Report'}
          variant="primary"
          size="lg"
          loading={isSubmitting}
          onPress={handleSubmit}
          style={{ marginTop: SPACING.xl }}
        />
      </ScrollView>

      {/* Ticket Confirmation Modal */}
      <Modal visible={!!createdTicketId} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.successCard, SHADOWS.modal]}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark" size={32} color="#15803D" />
            </View>
            <AppText variant="h3" color={COLORS.textPrimary} weight="600" style={{ marginTop: SPACING.md }}>
              Issue Reported!
            </AppText>
            <AppText variant="bodySmall" color={COLORS.textSecondary} align="center" style={{ marginTop: SPACING.xs }}>
              Ticket Reference ID:
            </AppText>
            <View style={styles.ticketIdBadge}>
              <AppText variant="titleMedium" color={COLORS.primary} weight="600">
                {createdTicketId}
              </AppText>
            </View>
            <AppText variant="caption" color={COLORS.textSecondary} align="center" style={{ marginTop: SPACING.md }}>
              Our customer care and pharmacy partner team will review your report and respond within 2 hours.
            </AppText>
            <AppButton
              title="Done"
              variant="primary"
              size="md"
              onPress={handleSuccessClose}
              style={{ marginTop: SPACING.lg, width: '100%' }}
            />
          </View>
        </View>
      </Modal>
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
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 7,
    paddingHorizontal: SPACING.md,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  relatedOrderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECE8F7',
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  fieldGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  textArea: {
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    minHeight: 110,
  },
  inputError: {
    borderColor: COLORS.danger,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    marginTop: 4,
  },
  attachmentBox: {
    borderWidth: 1.5,
    borderColor: '#DCD5F0',
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  attachmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  successCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketIdBadge: {
    backgroundColor: '#ECE8F7',
    paddingVertical: 6,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    marginTop: 4,
  },
});

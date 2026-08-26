import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { Ionicons } from '@expo/vector-icons';
import { usePaymentMethods } from '../../store/PaymentMethodsContext';
import { useToast } from '../../store/ToastContext';
import { useAppTheme } from '../../store/ThemeContext';

export const PaymentMethodsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const {
    upiList,
    cardsList,
    addUPI,
    removeUPI,
    setDefaultUPI,
    addCard,
    removeCard,
    setDefaultCard,
  } = usePaymentMethods();
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();

  // Add UPI Modal State
  const [showAddUpiModal, setShowAddUpiModal] = useState(false);
  const [newUpiId, setNewUpiId] = useState('');
  const [upiError, setUpiError] = useState('');
  const [isAddingUpi, setIsAddingUpi] = useState(false);

  // Add Card Modal State
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('12');
  const [expiryYear, setExpiryYear] = useState('28');
  const [cardError, setCardError] = useState('');
  const [isAddingCard, setIsAddingCard] = useState(false);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'upi' | 'card'; id: string; name: string } | null>(null);

  const handleAddUPI = async () => {
    setIsAddingUpi(true);
    const res = await addUPI(newUpiId);
    setIsAddingUpi(false);

    if (res.success) {
      showToast('UPI ID added successfully!', 'success');
      setShowAddUpiModal(false);
      setNewUpiId('');
      setUpiError('');
    } else {
      setUpiError(res.error || 'Failed to add UPI');
    }
  };

  const handleAddCard = async () => {
    setIsAddingCard(true);
    const res = await addCard({
      cardNumber,
      cardholderName,
      expiryMonth,
      expiryYear,
    });
    setIsAddingCard(false);

    if (res.success) {
      showToast('Card saved securely!', 'success');
      setShowAddCardModal(false);
      setCardNumber('');
      setCardholderName('');
      setCardError('');
    } else {
      setCardError(res.error || 'Failed to add card');
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'upi') {
      removeUPI(deleteTarget.id);
      showToast('UPI ID removed', 'info');
    } else {
      removeCard(deleteTarget.id);
      showToast('Card removed', 'info');
    }

    setDeleteTarget(null);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="titleMedium" color={colors.textPrimary} weight="600" style={styles.headerTitle}>
          Payment Methods
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section 1: Saved UPI */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
              UPI Accounts ({upiList.length})
            </AppText>
            <TouchableOpacity onPress={() => setShowAddUpiModal(true)}>
              <AppText variant="caption" color={colors.primary} weight="600">
                + Add UPI ID
              </AppText>
            </TouchableOpacity>
          </View>

          <View style={[styles.cardContainer, SHADOWS.subtle]}>
            {upiList.map((upi, idx) => (
              <React.Fragment key={upi.id}>
                <View style={styles.methodRow}>
                  <View style={[styles.methodIconCircle, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="flash" size={18} color="#2563EB" />
                  </View>
                  <View style={styles.methodDetails}>
                    <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
                      {upi.upiId}
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      Instant 1-Tap UPI
                    </AppText>
                  </View>
                  <View style={styles.methodActions}>
                    {upi.isDefault ? (
                      <View style={styles.defaultBadge}>
                        <AppText variant="caption" color="#15803D" weight="600" style={{ fontSize: 10 }}>
                          DEFAULT
                        </AppText>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => setDefaultUPI(upi.id)}
                        style={styles.makeDefaultBtn}
                      >
                        <AppText variant="caption" color={colors.primary} weight="600" style={{ fontSize: 11 }}>
                          Set Default
                        </AppText>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => setDeleteTarget({ type: 'upi', id: upi.id, name: upi.upiId })}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
                {idx < upiList.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Section 2: Saved Cards */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
              Saved Cards ({cardsList.length})
            </AppText>
            <TouchableOpacity onPress={() => setShowAddCardModal(true)}>
              <AppText variant="caption" color={colors.primary} weight="600">
                + Add New Card
              </AppText>
            </TouchableOpacity>
          </View>

          <View style={[styles.cardContainer, SHADOWS.subtle]}>
            {cardsList.map((card, idx) => (
              <React.Fragment key={card.id}>
                <View style={styles.methodRow}>
                  <View style={[styles.methodIconCircle, { backgroundColor: '#F3E8FF' }]}>
                    <Ionicons name="card" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.methodDetails}>
                    <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
                      {card.brand.toUpperCase()} {card.maskedNumber}
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      Expires {card.expiryMonth}/{card.expiryYear} • {card.cardholderName}
                    </AppText>
                  </View>
                  <View style={styles.methodActions}>
                    {card.isDefault ? (
                      <View style={styles.defaultBadge}>
                        <AppText variant="caption" color="#15803D" weight="600" style={{ fontSize: 10 }}>
                          DEFAULT
                        </AppText>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => setDefaultCard(card.id)}
                        style={styles.makeDefaultBtn}
                      >
                        <AppText variant="caption" color={colors.primary} weight="600" style={{ fontSize: 11 }}>
                          Set Default
                        </AppText>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() =>
                        setDeleteTarget({
                          type: 'card',
                          id: card.id,
                          name: `${card.brand.toUpperCase()} ${card.maskedNumber}`,
                        })
                      }
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
                {idx < cardsList.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Section 3: Cash on Delivery Note */}
        <View style={[styles.codCard, SHADOWS.subtle]}>
          <View style={styles.codIconBox}>
            <Ionicons name="cash-outline" size={20} color="#15803D" />
          </View>
          <View style={styles.codTextCol}>
            <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
              Cash on Delivery (COD)
            </AppText>
            <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
              Available directly during checkout for all serviceable addresses.
            </AppText>
          </View>
        </View>
      </ScrollView>

      {/* Add UPI Modal */}
      <Modal visible={showAddUpiModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.modal]}>
            <View style={styles.modalHeader}>
              <AppText variant="titleMedium" color={colors.textPrimary} weight="600">
                Add New UPI ID
              </AppText>
              <TouchableOpacity onPress={() => setShowAddUpiModal(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: SPACING.md }}>
              <AppText variant="caption" color={colors.textSecondary} weight="600" style={styles.inputLabel}>
                VIRTUAL PAYMENT ADDRESS (VPA) *
              </AppText>
              <TextInput
                value={newUpiId}
                onChangeText={(t) => {
                  setNewUpiId(t);
                  if (upiError) setUpiError('');
                }}
                placeholder="e.g. rahul@okaxis, user@paytm"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                style={[styles.modalInput, upiError ? styles.modalInputError : null]}
              />
              {upiError ? (
                <AppText variant="caption" color={colors.danger} style={styles.errorText}>
                  {upiError}
                </AppText>
              ) : (
                <AppText variant="caption" color={colors.textMuted} style={styles.helperText}>
                  Supports Google Pay, PhonePe, Paytm, BHIM, Axis, HDFC, ICICI
                </AppText>
              )}

              <AppButton
                title={isAddingUpi ? 'Verifying...' : 'Save UPI ID'}
                variant="primary"
                size="md"
                loading={isAddingUpi}
                onPress={handleAddUPI}
                style={{ marginTop: SPACING.lg }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Card Modal */}
      <Modal visible={showAddCardModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.modal]}>
            <View style={styles.modalHeader}>
              <AppText variant="titleMedium" color={colors.textPrimary} weight="600">
                Add Credit / Debit Card
              </AppText>
              <TouchableOpacity onPress={() => setShowAddCardModal(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: SPACING.md }}>
              <AppText variant="caption" color={colors.textSecondary} weight="600" style={styles.inputLabel}>
                CARD NUMBER *
              </AppText>
              <TextInput
                value={cardNumber}
                onChangeText={(t) => {
                  setCardNumber(t.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 '));
                  if (cardError) setCardError('');
                }}
                placeholder="4111 2222 3333 4444"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={19}
                style={[styles.modalInput, cardError ? styles.modalInputError : null]}
              />

              <AppText variant="caption" color={colors.textSecondary} weight="600" style={[styles.inputLabel, { marginTop: SPACING.md }]}>
                NAME ON CARD *
              </AppText>
              <TextInput
                value={cardholderName}
                onChangeText={setCardholderName}
                placeholder="Full Name as on card"
                placeholderTextColor={colors.textMuted}
                style={styles.modalInput}
              />

              <View style={styles.expiryRow}>
                <View style={{ flex: 1 }}>
                  <AppText variant="caption" color={colors.textSecondary} weight="600" style={styles.inputLabel}>
                    EXPIRY MONTH
                  </AppText>
                  <TextInput
                    value={expiryMonth}
                    onChangeText={setExpiryMonth}
                    placeholder="MM (e.g. 12)"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={2}
                    style={styles.modalInput}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="caption" color={colors.textSecondary} weight="600" style={styles.inputLabel}>
                    EXPIRY YEAR
                  </AppText>
                  <TextInput
                    value={expiryYear}
                    onChangeText={setExpiryYear}
                    placeholder="YY (e.g. 28)"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={2}
                    style={styles.modalInput}
                  />
                </View>
              </View>

              {cardError ? (
                <AppText variant="caption" color={colors.danger} style={styles.errorText}>
                  {cardError}
                </AppText>
              ) : null}

              <AppButton
                title={isAddingCard ? 'Securing Card...' : 'Save Card Securely'}
                variant="primary"
                size="md"
                loading={isAddingCard}
                onPress={handleAddCard}
                style={{ marginTop: SPACING.lg }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={!!deleteTarget}
        title="Remove Payment Method?"
        message={`Are you sure you want to remove ${deleteTarget?.name}?`}
        confirmText="Remove"
        cancelText="Cancel"
        isDestructive
        icon="trash-outline"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#E8E8EE',
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  methodIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  methodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  defaultBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  makeDefaultBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  deleteBtn: {
    padding: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8EE',
    marginHorizontal: SPACING.md,
  },
  codCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  codIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codTextCol: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EE',
  },
  inputLabel: {
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  modalInputError: {
    borderColor: COLORS.danger,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    marginTop: 4,
  },
  helperText: {
    marginTop: 4,
  },
  expiryRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
});





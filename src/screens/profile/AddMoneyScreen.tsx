import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '../../store/WalletContext';
import { usePaymentMethods } from '../../store/PaymentMethodsContext';
import { useToast } from '../../store/ToastContext';
import { formatCurrency } from '../../utils/currency';

export const AddMoneyScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'AddMoney'>>();
  const { addMoney, balance } = useWallet();
  const { upiList, cardsList } = usePaymentMethods();
  const { showToast } = useToast();

  const [amountStr, setAmountStr] = useState(
    route.params?.prefilledAmount ? String(route.params.prefilledAmount) : '500'
  );
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [selectedUpiId, setSelectedUpiId] = useState(upiList[0]?.id || 'gpay');
  const [selectedCardId, setSelectedCardId] = useState(cardsList[0]?.id || 'card-1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const numAmount = parseFloat(amountStr) || 0;

  const handleChipSelect = (amt: number) => {
    setAmountStr(String(amt));
    if (error) setError('');
  };

  const handleAddMoney = async () => {
    if (numAmount < 10) {
      setError('Minimum top-up amount is ₹10');
      return;
    }
    if (numAmount > 10000) {
      setError('Maximum top-up amount is ₹10,000');
      return;
    }

    setError('');
    setIsLoading(true);

    const paymentSource =
      selectedMethod === 'upi'
        ? `UPI (${upiList.find((u) => u.id === selectedUpiId)?.upiId || 'Google Pay'})`
        : selectedMethod === 'card'
        ? `Card (${cardsList.find((c) => c.id === selectedCardId)?.maskedNumber || 'Visa'})`
        : 'Net Banking';

    const res = await addMoney(numAmount, paymentSource);
    setIsLoading(false);

    if (res.success) {
      showToast(`${formatCurrency(numAmount)} added to your HEALIT Wallet!`, 'success');
      navigation.goBack();
    } else {
      setError(res.error || 'Payment failed. Please try again.');
    }
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
          Top-up Wallet
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Current Balance Banner */}
        <View style={styles.currentBalanceBanner}>
          <AppText variant="caption" color={COLORS.textSecondary}>
            Current Balance:{' '}
            <AppText variant="caption" color={COLORS.primary} weight="600">
              {formatCurrency(balance)}
            </AppText>
          </AppText>
        </View>

        {/* Amount Input Card */}
        <View style={[styles.amountCard, SHADOWS.subtle]}>
          <AppText variant="caption" color={COLORS.textSecondary} weight="600" style={styles.label}>
            ENTER TOP-UP AMOUNT
          </AppText>

          <View style={[styles.amountInputRow, error ? styles.inputRowError : null]}>
            <AppText variant="h2" color={COLORS.textPrimary} weight="600" style={styles.currencySymbol}>
              ₹
            </AppText>
            <TextInput
              value={amountStr}
              onChangeText={(txt) => {
                setAmountStr(txt.replace(/\D/g, ''));
                if (error) setError('');
              }}
              placeholder="0"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              maxLength={5}
              style={styles.amountInput}
            />
          </View>

          {error ? (
            <AppText variant="caption" color={COLORS.danger} style={styles.errorText}>
              {error}
            </AppText>
          ) : (
            <AppText variant="caption" color={COLORS.textMuted} style={styles.helperText}>
              Min ₹10 • Max ₹10,000 per transaction
            </AppText>
          )}

          {/* Quick Amount Suggestion Chips */}
          <View style={styles.chipsRow}>
            {[100, 250, 500, 1000].map((amt) => (
              <TouchableOpacity
                key={amt}
                onPress={() => handleChipSelect(amt)}
                style={[
                  styles.amountChip,
                  numAmount === amt && styles.amountChipActive,
                ]}
              >
                <AppText
                  variant="caption"
                  color={numAmount === amt ? '#FFFFFF' : COLORS.primary}
                  weight="600"
                >
                  +{formatCurrency(amt)}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Select Payment Method */}
        <View style={styles.sectionHeader}>
          <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
            Select Payment Method
          </AppText>
        </View>

        {/* Method 1: UPI */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSelectedMethod('upi')}
          style={[
            styles.methodCard,
            selectedMethod === 'upi' && styles.methodCardSelected,
            SHADOWS.subtle,
          ]}
        >
          <View style={styles.methodTopRow}>
            <View style={[styles.methodIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="flash-outline" size={20} color="#2563EB" />
            </View>
            <View style={styles.methodInfoCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                UPI Instant Payment
              </AppText>
              <AppText variant="caption" color={COLORS.textSecondary}>
                Google Pay, PhonePe, Paytm, BHIM
              </AppText>
            </View>
            <Ionicons
              name={selectedMethod === 'upi' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selectedMethod === 'upi' ? COLORS.primary : COLORS.textMuted}
            />
          </View>

          {selectedMethod === 'upi' && (
            <View style={styles.upiOptionsContainer}>
              {upiList.map((upi) => (
                <TouchableOpacity
                  key={upi.id}
                  onPress={() => setSelectedUpiId(upi.id)}
                  style={[
                    styles.upiSubOption,
                    selectedUpiId === upi.id && styles.upiSubOptionActive,
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={selectedUpiId === upi.id ? COLORS.primary : COLORS.textMuted}
                  />
                  <AppText variant="caption" color={COLORS.textPrimary} weight="600" style={{ marginLeft: 6 }}>
                    {upi.upiId}
                  </AppText>
                  {upi.isDefault && (
                    <View style={styles.defaultBadge}>
                      <AppText variant="caption" color={COLORS.primary} style={{ fontSize: 9 }}>
                        Default
                      </AppText>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </TouchableOpacity>

        {/* Method 2: Cards */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSelectedMethod('card')}
          style={[
            styles.methodCard,
            selectedMethod === 'card' && styles.methodCardSelected,
            SHADOWS.subtle,
          ]}
        >
          <View style={styles.methodTopRow}>
            <View style={[styles.methodIconBox, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="card-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.methodInfoCol}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                Credit / Debit Card
              </AppText>
              <AppText variant="caption" color={COLORS.textSecondary}>
                Visa, MasterCard, RuPay
              </AppText>
            </View>
            <Ionicons
              name={selectedMethod === 'card' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selectedMethod === 'card' ? COLORS.primary : COLORS.textMuted}
            />
          </View>

          {selectedMethod === 'card' && (
            <View style={styles.upiOptionsContainer}>
              {cardsList.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setSelectedCardId(c.id)}
                  style={[
                    styles.upiSubOption,
                    selectedCardId === c.id && styles.upiSubOptionActive,
                  ]}
                >
                  <Ionicons
                    name="card"
                    size={16}
                    color={selectedCardId === c.id ? COLORS.primary : COLORS.textMuted}
                  />
                  <AppText variant="caption" color={COLORS.textPrimary} weight="600" style={{ marginLeft: 6 }}>
                    {c.brand.toUpperCase()} {c.maskedNumber}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Sticky Top-up Button */}
      <View style={[styles.bottomBar, SHADOWS.modal]}>
        <AppButton
          title={isLoading ? 'Processing Payment...' : `Add ${formatCurrency(numAmount)} to Wallet`}
          variant="primary"
          size="lg"
          disabled={numAmount < 10 || isLoading}
          loading={isLoading}
          onPress={handleAddMoney}
        />
      </View>
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
    paddingBottom: 100,
  },
  currentBalanceBanner: {
    backgroundColor: '#ECE8F7',
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  amountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8FC',
    borderWidth: 1.5,
    borderColor: '#E8E8EE',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  inputRowError: {
    borderColor: COLORS.danger,
    backgroundColor: '#FEF2F2',
  },
  currencySymbol: {
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  errorText: {
    marginTop: 6,
  },
  helperText: {
    marginTop: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  amountChip: {
    flex: 1,
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#DCD5F0',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sectionHeader: {
    marginBottom: SPACING.sm,
  },
  methodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.md,
  },
  methodCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FAF9FF',
  },
  methodTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfoCol: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  upiOptionsContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#E8E8EE',
    gap: SPACING.xs,
  },
  upiSubOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#FFFFFF',
  },
  upiSubOptionActive: {
    backgroundColor: '#ECE8F7',
  },
  defaultBadge: {
    marginLeft: 'auto',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E8E8EE',
  },
});

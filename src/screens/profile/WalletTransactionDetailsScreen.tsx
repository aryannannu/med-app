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
import { AppButton } from '../../components/common/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../store/ToastContext';
import { useAppTheme } from '../../store/ThemeContext';
import { formatCurrency } from '../../utils/currency';
import { formatDateTime } from '../../utils/formatters';

import { useWallet } from '../../store/WalletContext';

export const WalletTransactionDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'WalletTransactionDetails'>>();
  const { transactions } = useWallet();
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();

  const transaction = route.params?.transaction || transactions[0] || {
    id: 'tx-default',
    type: 'topup',
    amount: 500,
    status: 'success',
    description: 'Added money to wallet via UPI',
    timestamp: Date.now(),
    referenceId: 'UPI-REF-984210',
    balanceAfter: 748,
  };

  const isCredit =
    transaction.type === 'topup' || transaction.type === 'refund' || transaction.type === 'cashback';

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
          Transaction Receipt
        </AppText>
        <TouchableOpacity
          onPress={() => showToast('Receipt details copied to clipboard', 'info')}
          style={styles.backBtn}
        >
          <Ionicons name="share-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Hero Receipt Card */}
        <View style={[styles.receiptCard, SHADOWS.card]}>
          <View
            style={[
              styles.statusIconCircle,
              { backgroundColor: isCredit ? '#DCFCE7' : '#FEE2E2' },
            ]}
          >
            <Ionicons
              name={isCredit ? 'checkmark-circle' : 'arrow-up-circle'}
              size={36}
              color={isCredit ? '#15803D' : '#DC2626'}
            />
          </View>

          <AppText variant="caption" color={colors.textSecondary} weight="600" style={styles.txTitle}>
            {transaction.title.toUpperCase()}
          </AppText>

          <AppText
            variant="h1"
            color={isCredit ? '#15803D' : COLORS.textPrimary}
            weight="600"
            style={styles.amount}
          >
            {isCredit ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </AppText>

          <View style={styles.statusPill}>
            <Ionicons name="checkmark-done" size={12} color="#15803D" />
            <AppText variant="caption" color="#15803D" weight="600" style={{ marginLeft: 3, fontSize: 11 }}>
              {transaction.status.toUpperCase()}
            </AppText>
          </View>

          <View style={styles.dashedDivider} />

          {/* Key-Value Details */}
          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <AppText variant="caption" color={colors.textSecondary}>
                Transaction ID
              </AppText>
              <AppText variant="caption" color={colors.textPrimary} weight="600">
                {transaction.id.toUpperCase()}
              </AppText>
            </View>

            <View style={styles.detailRow}>
              <AppText variant="caption" color={colors.textSecondary}>
                Date &amp; Time
              </AppText>
              <AppText variant="caption" color={colors.textPrimary} weight="600">
                {formatDateTime(transaction.timestamp)}
              </AppText>
            </View>

            <View style={styles.detailRow}>
              <AppText variant="caption" color={colors.textSecondary}>
                Transaction Type
              </AppText>
              <AppText variant="caption" color={colors.textPrimary} weight="600">
                {transaction.type === 'topup'
                  ? 'Wallet Top-up'
                  : transaction.type === 'refund'
                  ? 'Order Cancellation Refund'
                  : 'Medicine Order Payment'}
              </AppText>
            </View>

            {transaction.paymentSource && (
              <View style={styles.detailRow}>
                <AppText variant="caption" color={colors.textSecondary}>
                  Payment Mode
                </AppText>
                <AppText variant="caption" color={colors.textPrimary} weight="600">
                  {transaction.paymentSource}
                </AppText>
              </View>
            )}

            {transaction.referenceId && (
              <View style={styles.detailRow}>
                <AppText variant="caption" color={colors.textSecondary}>
                  Reference No.
                </AppText>
                <AppText variant="caption" color={colors.textPrimary} weight="600">
                  {transaction.referenceId}
                </AppText>
              </View>
            )}
          </View>
        </View>

        {/* Related Order Action if applicable */}
        {transaction.relatedOrderId && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('OrderDetails', {
                orderId: transaction.relatedOrderId || 'ord-1',
              })
            }
            style={[styles.orderLinkCard, SHADOWS.subtle]}
          >
            <View style={styles.orderLinkIconBox}>
              <Ionicons name="receipt-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.orderLinkInfo}>
              <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
                View Related Order Details
              </AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Tap to inspect items &amp; invoice
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Help Link */}
        <AppButton
          title="Need Help with this Transaction?"
          variant="outline"
          size="md"
          onPress={() =>
            navigation.navigate('ContactSupport', {
              orderId: transaction.relatedOrderId,
            })
          }
          leftIcon={<Ionicons name="chatbubbles-outline" size={18} color={colors.primary} />}
          style={{ marginTop: SPACING.md }}
        />
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
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.md,
  },
  statusIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  txTitle: {
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  amount: {
    marginBottom: SPACING.xs,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: SPACING.md,
  },
  dashedDivider: {
    width: '100%',
    height: 1,
    borderWidth: 0.5,
    borderColor: '#E8E8EE',
    borderStyle: 'dashed',
    marginVertical: SPACING.md,
  },
  detailsList: {
    width: '100%',
    gap: SPACING.sm + 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  orderLinkIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECE8F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderLinkInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
});




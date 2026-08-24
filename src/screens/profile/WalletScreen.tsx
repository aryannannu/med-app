import React, { useState, useMemo } from 'react';
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
import { AppButton } from '../../components/common/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '../../store/WalletContext';
import { useAppTheme } from '../../store/ThemeContext';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/formatters';

export const WalletScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { colors, isDark } = useAppTheme();
  const { balance, transactions } = useWallet();
  const [activeTab, setActiveTab] = useState<'all' | 'credits' | 'debits'>('all');

  const filteredTransactions = useMemo(() => {
    if (activeTab === 'credits') {
      return transactions.filter((t) => t.type === 'topup' || t.type === 'refund' || t.type === 'cashback');
    }
    if (activeTab === 'debits') {
      return transactions.filter((t) => t.type === 'order_payment');
    }
    return transactions;
  }, [transactions, activeTab]);

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
          HEALIT Wallet
        </AppText>
        <TouchableOpacity
          onPress={() => navigation.navigate('HelpArticle', { articleId: 'art-4' })}
          style={styles.helpBtn}
        >
          <Ionicons name="help-circle-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Wallet Balance Hero Card */}
        <View style={[styles.heroCard, SHADOWS.card]}>
          <View style={styles.heroTopRow}>
            <View>
              <AppText variant="caption" color="rgba(255, 255, 255, 0.8)" weight="600" style={{ letterSpacing: 0.5 }}>
                TOTAL AVAILABLE BALANCE
              </AppText>
              <AppText variant="h1" color="#FFFFFF" weight="600" style={styles.balanceText}>
                {formatCurrency(balance)}
              </AppText>
            </View>
            <View style={styles.walletIconCircle}>
              <Ionicons name="wallet" size={28} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroFooterRow}>
            <View style={styles.heroBenefitItem}>
              <Ionicons name="flash" size={14} color="#FBBF24" />
              <AppText variant="caption" color="rgba(255, 255, 255, 0.9)" weight="600" style={{ marginLeft: 4 }}>
                Instant 1-Tap Checkout
              </AppText>
            </View>
            <View style={styles.heroBenefitItem}>
              <Ionicons name="shield-checkmark" size={14} color="#34D399" />
              <AppText variant="caption" color="rgba(255, 255, 255, 0.9)" weight="600" style={{ marginLeft: 4 }}>
                Zero-Delay Refunds
              </AppText>
            </View>
          </View>
        </View>

        {/* Add Money CTA Button */}
        <AppButton
          title="Add Money to Wallet"
          variant="primary"
          size="lg"
          onPress={() => navigation.navigate('AddMoney')}
          leftIcon={<Ionicons name="add-circle" size={20} color="#FFFFFF" />}
          style={styles.addMoneyBtn}
        />

        {/* Quick Suggestion Chips */}
        <View style={styles.quickChipsRow}>
          {[100, 250, 500, 1000].map((amt) => (
            <TouchableOpacity
              key={amt}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('AddMoney', { prefilledAmount: amt })}
              style={[styles.quickChip, SHADOWS.subtle]}
            >
              <AppText variant="caption" color={colors.primary} weight="600">
                +{formatCurrency(amt)}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transaction History Section */}
        <View style={styles.historySection}>
          <AppText variant="titleMedium" color={colors.textPrimary} weight="600" style={{ marginBottom: SPACING.sm }}>
            Wallet Activity & History
          </AppText>

          {/* Filter Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              onPress={() => setActiveTab('all')}
              style={[styles.tabPill, activeTab === 'all' && styles.tabPillActive]}
            >
              <AppText
                variant="buttonSmall"
                color={activeTab === 'all' ? '#FFFFFF' : COLORS.textSecondary}
                weight="600"
              >
                All Activity
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('credits')}
              style={[styles.tabPill, activeTab === 'credits' && styles.tabPillActive]}
            >
              <AppText
                variant="buttonSmall"
                color={activeTab === 'credits' ? '#FFFFFF' : COLORS.textSecondary}
                weight="600"
              >
                Money In (+)
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('debits')}
              style={[styles.tabPill, activeTab === 'debits' && styles.tabPillActive]}
            >
              <AppText
                variant="buttonSmall"
                color={activeTab === 'debits' ? '#FFFFFF' : COLORS.textSecondary}
                weight="600"
              >
                Money Out (-)
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Transactions List */}
          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
              <AppText variant="titleSmall" color={colors.textPrimary} weight="600" style={{ marginTop: SPACING.sm }}>
                No transactions in this category
              </AppText>
              <AppText variant="caption" color={colors.textSecondary} align="center" style={{ marginTop: 2 }}>
                Your wallet top-ups, order payments, and refunds will show up here.
              </AppText>
            </View>
          ) : (
            <View style={[styles.transactionsCard, SHADOWS.subtle]}>
              {filteredTransactions.map((tx, idx) => {
                const isCredit = tx.type === 'topup' || tx.type === 'refund' || tx.type === 'cashback';
                return (
                  <React.Fragment key={tx.id}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        navigation.navigate('WalletTransactionDetails', {
                          transactionId: tx.id,
                          transaction: tx,
                        })
                      }
                      style={styles.txRow}
                    >
                      <View
                        style={[
                          styles.txIconCircle,
                          { backgroundColor: isCredit ? '#DCFCE7' : '#FEE2E2' },
                        ]}
                      >
                        <Ionicons
                          name={
                            tx.type === 'topup'
                              ? 'arrow-down-outline'
                              : tx.type === 'refund'
                              ? 'refresh-outline'
                              : 'cart-outline'
                          }
                          size={18}
                          color={isCredit ? '#15803D' : '#DC2626'}
                        />
                      </View>

                      <View style={styles.txDetailsCol}>
                        <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
                          {tx.title}
                        </AppText>
                        <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                          {formatDate(tx.timestamp)}
                        </AppText>
                      </View>

                      <View style={styles.txAmountCol}>
                        <AppText
                          variant="titleSmall"
                          color={isCredit ? '#15803D' : COLORS.textPrimary}
                          weight="600"
                        >
                          {isCredit ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </AppText>
                        <View
                          style={[
                            styles.statusTag,
                            {
                              backgroundColor:
                                tx.status === 'completed'
                                  ? '#DCFCE7'
                                  : tx.status === 'pending'
                                  ? '#FEF3C7'
                                  : '#FEE2E2',
                            },
                          ]}
                        >
                          <AppText
                            variant="caption"
                            color={
                              tx.status === 'completed'
                                ? '#15803D'
                                : tx.status === 'pending'
                                ? '#D97706'
                                : '#DC2626'
                            }
                            weight="600"
                            style={{ fontSize: 10 }}
                          >
                            {tx.status.toUpperCase()}
                          </AppText>
                        </View>
                      </View>
                    </TouchableOpacity>
                    {idx < filteredTransactions.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                );
              })}
            </View>
          )}
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
  helpBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 60,
  },
  heroCard: {
    backgroundColor: '#3A2986',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceText: {
    marginTop: 4,
  },
  walletIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: SPACING.md,
  },
  heroFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroBenefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addMoneyBtn: {
    marginBottom: SPACING.md,
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  quickChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCD5F0',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historySection: {
    marginTop: SPACING.xs,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  tabPill: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPillActive: {
    backgroundColor: '#3A2986',
    borderColor: '#3A2986',
  },
  transactionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  txIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txDetailsCol: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  txAmountCol: {
    alignItems: 'flex-end',
  },
  statusTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8EE',
    marginHorizontal: SPACING.md,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    padding: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});




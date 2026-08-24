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
import { useOrders } from '../../store/OrderContext';
import { useToast } from '../../store/ToastContext';
import { useAppTheme } from '../../store/ThemeContext';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/formatters';

export const OrderInvoiceScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'OrderInvoice'>>();
  const { orders } = useOrders();
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();

  const order = orders.find((o) => o.id === route.params?.orderId) || orders[0];

  if (!order) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <AppText variant="titleMedium" color={colors.textPrimary} weight="600">
            Invoice Not Found
          </AppText>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>
    );
  }

  const handleDownload = () => {
    showToast(`Invoice #${order.id.toUpperCase()}.pdf downloaded to device`, 'success');
  };

  const handleShare = () => {
    showToast('Invoice shared via link', 'info');
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
          Tax Invoice
        </AppText>
        <TouchableOpacity onPress={handleShare} style={styles.backBtn}>
          <Ionicons name="share-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.invoicePaper, SHADOWS.card]}>
          {/* Invoice Header */}
          <View style={styles.invoiceTopRow}>
            <View>
              <AppText variant="h3" color={colors.primary} weight="600">
                HEALIT
              </AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Retail Medicine Marketplace
              </AppText>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={styles.taxInvoiceTag}>
                <AppText variant="caption" color="#15803D" weight="600" style={{ fontSize: 10 }}>
                  TAX INVOICE
                </AppText>
              </View>
              <AppText variant="caption" color={colors.textPrimary} weight="600" style={{ marginTop: 4 }}>
                #{order.id.toUpperCase()}
              </AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Date: {formatDate(order.createdAt)}
              </AppText>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Pharmacy Details */}
          <View style={styles.sectionBlock}>
            <AppText variant="caption" color={colors.textSecondary} weight="600" style={styles.blockTitle}>
              DISPENSED &amp; BILLED BY:
            </AppText>
            <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
              {order.selectedPharmacy?.name || order.selectedOffer?.pharmacy?.name || 'Apollo Pharmacy 24x7'}
            </AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              {order.selectedPharmacy?.address.line1 || 'SCF 14, Sector 22, Chandigarh - 160022'}
            </AppText>
            <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
              DL No: 20B/48192, 21B/48193 â€¢ GSTIN: 07AAACH1289P1Z8
            </AppText>
          </View>

          <View style={styles.divider} />

          {/* Customer Details */}
          <View style={styles.sectionBlock}>
            <AppText variant="caption" color={colors.textSecondary} weight="600" style={styles.blockTitle}>
              DELIVERED TO:
            </AppText>
            <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
              {order.deliveryAddress.recipientName} ({order.deliveryAddress.label.toUpperCase()})
            </AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              {order.deliveryAddress.houseFlatNumber}, {order.deliveryAddress.streetAddress}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
            </AppText>
          </View>

          <View style={styles.divider} />

          {/* Items Table */}
          <AppText variant="caption" color={colors.textSecondary} weight="600" style={styles.blockTitle}>
            ITEMIZED BREAKDOWN
          </AppText>

          <View style={styles.tableHeader}>
            <AppText variant="caption" color={colors.textSecondary} weight="600" style={{ flex: 2 }}>
              Item
            </AppText>
            <AppText variant="caption" color={colors.textSecondary} weight="600" style={{ flex: 0.8, textAlign: 'center' }}>
              Qty
            </AppText>
            <AppText variant="caption" color={colors.textSecondary} weight="600" style={{ flex: 1.2, textAlign: 'right' }}>
              Price
            </AppText>
          </View>

          {order.items.map((it, idx) => (
            <View key={idx} style={styles.tableRow}>
              <View style={{ flex: 2 }}>
                <AppText variant="bodySmall" color={colors.textPrimary} weight="600">
                  {it.medicineName}
                </AppText>
                <AppText variant="caption" color={colors.textMuted} style={{ fontSize: 10 }}>
                  Batch: DL-{Math.floor(1000 + Math.random() * 9000)} â€¢ Exp: 09/27
                </AppText>
              </View>
              <AppText variant="bodySmall" color={colors.textPrimary} style={{ flex: 0.8, textAlign: 'center' }}>
                {it.quantity}
              </AppText>
              <AppText variant="bodySmall" color={colors.textPrimary} weight="600" style={{ flex: 1.2, textAlign: 'right' }}>
                {formatCurrency(it.unitPrice * it.quantity)}
              </AppText>
            </View>
          ))}

          <View style={styles.divider} />

          {/* Pricing Totals */}
          <View style={styles.totalsList}>
            <View style={styles.totalRow}>
              <AppText variant="caption" color={colors.textSecondary}>
                Items Subtotal
              </AppText>
              <AppText variant="caption" color={colors.textPrimary} weight="600">
                {formatCurrency(order.itemSubtotal)}
              </AppText>
            </View>

            <View style={styles.totalRow}>
              <AppText variant="caption" color={colors.textSecondary}>
                Pharmacy Discount
              </AppText>
              <AppText variant="caption" color="#15803D" weight="600">
                -{formatCurrency(order.discount)}
              </AppText>
            </View>

            <View style={styles.totalRow}>
              <AppText variant="caption" color={colors.textSecondary}>
                GST (Includes 6% CGST + 6% SGST)
              </AppText>
              <AppText variant="caption" color={colors.textPrimary} weight="600">
                {formatCurrency(order.taxes)}
              </AppText>
            </View>

            <View style={styles.totalRow}>
              <AppText variant="caption" color={colors.textSecondary}>
                Delivery Partner Fee
              </AppText>
              <AppText variant="caption" color={colors.textPrimary} weight="600">
                {order.deliveryFee === 0 ? 'FREE' : formatCurrency(order.deliveryFee)}
              </AppText>
            </View>

            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
                Total Paid
              </AppText>
              <AppText variant="titleMedium" color={colors.primary} weight="600">
                {formatCurrency(order.totalAmount)}
              </AppText>
            </View>
          </View>

          <View style={styles.paymentModeBox}>
            <Ionicons name="card" size={16} color={colors.primary} />
            <AppText variant="caption" color={colors.textPrimary} weight="600" style={{ marginLeft: 6 }}>
              Paid via Online Payment (Transaction Confirmed)
            </AppText>
          </View>
        </View>

        {/* Download Action */}
        <AppButton
          title="Download PDF Invoice"
          variant="primary"
          size="lg"
          onPress={handleDownload}
          leftIcon={<Ionicons name="download-outline" size={20} color="#FFFFFF" />}
          style={{ marginTop: SPACING.xl }}
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
  invoicePaper: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  invoiceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taxInvoiceTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8EE',
    marginVertical: SPACING.md,
  },
  sectionBlock: {
    gap: 2,
  },
  blockTitle: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EE',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    alignItems: 'center',
  },
  totalsList: {
    gap: SPACING.xs,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalRow: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#E8E8EE',
    marginTop: 4,
  },
  paymentModeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECE8F7',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
});


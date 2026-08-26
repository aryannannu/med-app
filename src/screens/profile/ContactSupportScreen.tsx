import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../../store/OrderContext';
import { useToast } from '../../store/ToastContext';
import { useAppTheme } from '../../store/ThemeContext';

export const ContactSupportScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'ContactSupport'>>();
  const { activeOrders, orders } = useOrders();
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();

  const orderIdParam = route.params?.orderId;
  const selectedOrder =
    (orderIdParam ? orders.find((o) => o.id === orderIdParam) : null) ||
    activeOrders[0] ||
    orders[0];

  const handleCall = () => {
    Linking.openURL('tel:18004204325').catch(() => {
      showToast('Calling toll-free helpline: 1800-420-HEALIT', 'info');
    });
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@healitapp.com?subject=HEALIT%20Support%20Request').catch(() => {
      showToast('Email client opened for support@healitapp.com', 'info');
    });
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
          Contact Support
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Order Context Card */}
        {selectedOrder && (
          <View style={[styles.orderContextCard, SHADOWS.subtle]}>
            <View style={styles.orderContextLeft}>
              <AppText variant="caption" color={colors.textMuted} weight="600">
                REFERRED ORDER
              </AppText>
              <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
                #{selectedOrder?.id?.toUpperCase()} • {selectedOrder?.selectedPharmacy?.name || selectedOrder?.selectedOffer?.pharmacy?.name || 'Local Pharmacy'}
              </AppText>
            </View>
            <View style={styles.orderStatusBadge}>
              <AppText variant="caption" color="#15803D" weight="600" style={{ fontSize: 10 }}>
                {selectedOrder?.status?.replace('_', ' ').toUpperCase()}
              </AppText>
            </View>
          </View>
        )}

        {/* Support Channels List */}
        <AppText variant="titleSmall" color={colors.textPrimary} weight="600" style={{ marginBottom: SPACING.sm }}>
          Available Channels
        </AppText>

        <View style={styles.channelsList}>
          {/* Channel 1: Live Chat */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SupportChat', { orderId: selectedOrder?.id })}
            style={[styles.channelCard, SHADOWS.subtle]}
          >
            <View style={[styles.channelIconBox, { backgroundColor: '#ECE8F7' }]}>
              <Ionicons name="chatbubbles" size={24} color={colors.primary} />
            </View>
            <View style={styles.channelInfo}>
              <View style={styles.titleRow}>
                <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
                  24x7 Live Chat Support
                </AppText>
                <View style={styles.onlineBadge}>
                  <View style={styles.onlineDot} />
                  <AppText variant="caption" color="#15803D" weight="600" style={{ fontSize: 10 }}>
                    Online
                  </AppText>
                </View>
              </View>
              <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                Instant agent response • Ideal for live tracking &amp; medicines
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Channel 2: Phone Helpline */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCall}
            style={[styles.channelCard, SHADOWS.subtle]}
          >
            <View style={[styles.channelIconBox, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="call" size={24} color="#15803D" />
            </View>
            <View style={styles.channelInfo}>
              <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
                Toll-Free Customer Helpline
              </AppText>
              <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                1800-420-HEALIT • Mon-Sun 7:00 AM to 11:00 PM
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Channel 3: Email Support */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleEmail}
            style={[styles.channelCard, SHADOWS.subtle]}
          >
            <View style={[styles.channelIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="mail" size={24} color="#2563EB" />
            </View>
            <View style={styles.channelInfo}>
              <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
                Priority Email Support
              </AppText>
              <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                support@healitapp.com • Replies within 2 hours
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Channel 4: Report Issue */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ReportIssue', { orderId: selectedOrder?.id })}
            style={[styles.channelCard, SHADOWS.subtle]}
          >
            <View style={[styles.channelIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="alert-circle" size={24} color="#D97706" />
            </View>
            <View style={styles.channelInfo}>
              <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
                Report a Specific Issue
              </AppText>
              <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                File ticket for damaged medicine, refund, or rider dispute
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Emergency Notice */}
        <View style={styles.emergencyNotice}>
          <Ionicons name="medical" size={16} color="#DC2626" />
          <AppText variant="caption" color="#DC2626" weight="600" style={{ marginLeft: 6, flex: 1 }}>
            Emergency Notice: For critical life-saving emergencies, immediately call national ambulance services (108 / 112).
          </AppText>
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
  orderContextCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.lg,
  },
  orderContextTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderContextLeft: {
    flex: 1,
  },
  orderIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECE8F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderStatusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  channelsList: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  channelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  channelIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.full,
    marginLeft: SPACING.xs,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#15803D',
    marginRight: 3,
  },
  emergencyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
});




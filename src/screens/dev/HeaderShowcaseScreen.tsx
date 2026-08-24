import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { useAppTheme } from '../../store/ThemeContext';
import { AppText } from '../../components/common/AppText';
import { AdaptiveHeader, HeaderType } from '../../components/layout/AdaptiveHeader';

interface HeaderVariantSpec {
  id: string;
  type: HeaderType;
  numberLabel: string;
  titleName: string;
  categoryGroup: 'DISCOVERY' | 'SHOPPING' | 'TRANSACTION' | 'MANAGEMENT' | 'FOCUSED';
  uxPriority: string;
  props: any;
}

export const HeaderShowcaseScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useAppTheme();
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('ALL');
  const [activeHomeMode, setActiveHomeMode] = useState<'medicines' | 'stores'>('medicines');
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [activeChip, setActiveChip] = useState('best-match');

  const HEADER_SPECS: HeaderVariantSpec[] = [
    {
      id: 'v1',
      type: 'home',
      numberLabel: 'HEADER TYPE 01',
      titleName: 'HOME SCREEN HEADER',
      categoryGroup: 'DISCOVERY',
      uxPriority: 'Deliver to location, Notification bell (badge: 3), Segmented mode toggle [Shop by Medicine / Shop by Store], Large search bar with camera scan.',
      props: {
        type: 'home',
        activeMode: activeHomeMode,
        onModeChange: (m: 'medicines' | 'stores') => setActiveHomeMode(m),
        notificationCount: 3,
      },
    },
    {
      id: 'v2',
      type: 'standard',
      numberLabel: 'HEADER TYPE 02',
      titleName: 'STANDARD INNER PAGE HEADER',
      categoryGroup: 'SHOPPING',
      uxPriority: 'Back arrow, Strong page title (Pain Relief), Subtitle context (120+ products), Search ðŸ”, Cart badge ðŸ›’ 2.',
      props: {
        type: 'standard',
        title: 'Pain Relief & Fever',
        subtitle: '120+ products available near you',
      },
    },
    {
      id: 'v3',
      type: 'search',
      numberLabel: 'HEADER TYPE 03',
      titleName: 'SEARCH CONTEXT HEADER',
      categoryGroup: 'DISCOVERY',
      uxPriority: 'Back arrow, Auto-focused search input field, clear action, voice search mic icon ðŸŽ™ï¸.',
      props: {
        type: 'search',
        searchPlaceholder: 'Search medicines, brands or pharmacies...',
        autoFocusSearch: false,
      },
    },
    {
      id: 'v4',
      type: 'category',
      numberLabel: 'HEADER TYPE 04',
      titleName: 'CATEGORY DETAIL HEADER',
      categoryGroup: 'DISCOVERY',
      uxPriority: 'Back arrow, Category Name (Diabetes Care), Product count subtext (200+ products), Search ðŸ”, Cart badge ðŸ›’.',
      props: {
        type: 'category',
        title: 'Diabetes Care',
        subtitle: '200+ products',
      },
    },
    {
      id: 'v5',
      type: 'product',
      numberLabel: 'HEADER TYPE 05',
      titleName: 'PRODUCT DETAIL HEADER',
      categoryGroup: 'SHOPPING',
      uxPriority: 'Back arrow, Product Name (Crocin 650 Tablet), Brand subtitle (GSK), Search ðŸ”, Wishlist â™¡, Cart badge ðŸ›’.',
      props: {
        type: 'product',
        title: 'Crocin 650 Advance Tablet',
        subtitle: 'GlaxoSmithKline â€¢ Strip of 15',
        brandName: 'GSK',
      },
    },
    {
      id: 'v6',
      type: 'store',
      numberLabel: 'HEADER TYPE 06',
      titleName: 'STORE DETAIL HEADER',
      categoryGroup: 'SHOPPING',
      uxPriority: 'Back arrow, Pharmacy logo, Verified badge âœ“, Rating â˜… 4.6 â€¢ 1.2 km â€¢ 20 min, Share â†—, Save â™¡.',
      props: {
        type: 'store',
        title: 'Apollo Pharmacy 24x7',
        storeRating: 4.8,
        storeDistanceTime: '0.8 km â€¢ 15 min',
        isVerifiedStore: true,
      },
    },
    {
      id: 'v7',
      type: 'cart',
      numberLabel: 'HEADER TYPE 07',
      titleName: 'CART HEADER',
      categoryGroup: 'TRANSACTION',
      uxPriority: 'Back arrow, My Cart title, Item count (3 items), Trust security badge ðŸ›¡ï¸ 100% Secure.',
      props: {
        type: 'cart',
        title: 'My Cart',
        subtitle: '3 items',
      },
    },
    {
      id: 'v8',
      type: 'checkout',
      numberLabel: 'HEADER TYPE 08',
      titleName: 'CHECKOUT HEADER',
      categoryGroup: 'TRANSACTION',
      uxPriority: 'Back arrow, Checkout title, Step progress indicator (1 Delivery âž” 2 Payment âž” 3 Confirmation).',
      props: {
        type: 'checkout',
        title: 'Checkout',
        checkoutStep: checkoutStep,
      },
    },
    {
      id: 'v9',
      type: 'prescription-upload',
      numberLabel: 'HEADER TYPE 09',
      titleName: 'PRESCRIPTION UPLOAD HEADER',
      categoryGroup: 'FOCUSED',
      uxPriority: 'Back arrow, Upload Prescription title, Secure & Private subtext, Privacy shield ðŸ›¡ï¸.',
      props: {
        type: 'prescription-upload',
        title: 'Upload Prescription',
        subtitle: 'Secure & Private Medical Vault',
      },
    },
    {
      id: 'v10',
      type: 'prescription-comparison',
      numberLabel: 'HEADER TYPE 10',
      titleName: 'PRESCRIPTION COMPARISON HEADER',
      categoryGroup: 'SHOPPING',
      uxPriority: 'Back arrow, Compare Pharmacies, 8 medicines â€¢ 6 stores found, Filter button, Contextual filter chips.',
      props: {
        type: 'prescription-comparison',
        title: 'Compare Nearby Pharmacies',
        subtitle: '8 medicines detected â€¢ 6 stores available',
        selectedChip: activeChip,
        onChipSelect: (id: string) => setActiveChip(id),
      },
    },
    {
      id: 'v11',
      type: 'orders',
      numberLabel: 'HEADER TYPE 11',
      titleName: 'ORDERS HEADER',
      categoryGroup: 'MANAGEMENT',
      uxPriority: 'Back arrow, My Orders title, Track & manage subtext, Search ðŸ”, Filter âš™.',
      props: {
        type: 'orders',
        title: 'My Orders',
        subtitle: 'Track and manage your healthcare orders',
      },
    },
    {
      id: 'v12',
      type: 'order-detail',
      numberLabel: 'HEADER TYPE 12',
      titleName: 'ORDER DETAIL HEADER',
      categoryGroup: 'MANAGEMENT',
      uxPriority: 'Back arrow, Order #HLT23984 title, Placed on 22 May subtext, Support / Help CTA ðŸ’¬.',
      props: {
        type: 'order-detail',
        title: 'Order #HLT-98421',
        subtitle: 'Placed on 22 May â€¢ Delivered',
      },
    },
    {
      id: 'v13',
      type: 'profile',
      numberLabel: 'HEADER TYPE 13',
      titleName: 'PROFILE HEADER',
      categoryGroup: 'MANAGEMENT',
      uxPriority: 'Back arrow, My Profile title, Manage your account subtext, Settings icon âš™.',
      props: {
        type: 'profile',
        title: 'My Profile',
        subtitle: 'Manage account, wallet & preferences',
      },
    },
    {
      id: 'v14',
      type: 'address',
      numberLabel: 'HEADER TYPE 14',
      titleName: 'ADDRESS MANAGEMENT HEADER',
      categoryGroup: 'MANAGEMENT',
      uxPriority: 'Back arrow, Manage Addresses title, 3 saved addresses subtext, + Add button CTA.',
      props: {
        type: 'address',
        title: 'Manage Addresses',
        subtitle: '3 saved delivery locations',
      },
    },
    {
      id: 'v15',
      type: 'wishlist',
      numberLabel: 'HEADER TYPE 15',
      titleName: 'WISHLIST HEADER',
      categoryGroup: 'SHOPPING',
      uxPriority: 'Back arrow, Wishlist title, 12 saved items subtext, Search ðŸ”, Cart badge ðŸ›’.',
      props: {
        type: 'wishlist',
        title: 'Saved Medicines',
        subtitle: '12 items saved for reorder',
      },
    },
    {
      id: 'v16',
      type: 'notification',
      numberLabel: 'HEADER TYPE 16',
      titleName: 'NOTIFICATIONS HEADER',
      categoryGroup: 'MANAGEMENT',
      uxPriority: 'Back arrow, Notifications title, Stay updated subtext, Mark all as read button CTA.',
      props: {
        type: 'notification',
        title: 'Notifications',
        subtitle: 'Stay updated with HEALIT orders & offers',
      },
    },
    {
      id: 'v17',
      type: 'filter',
      numberLabel: 'HEADER TYPE 17',
      titleName: 'FILTER HEADER',
      categoryGroup: 'SHOPPING',
      uxPriority: 'Back arrow, Filters title + Badge [3], Clear All button CTA, Active filter chips row.',
      props: {
        type: 'filter',
        title: 'Filter Medicines',
        activeFilterCount: 3,
      },
    },
    {
      id: 'v18',
      type: 'offers',
      numberLabel: 'HEADER TYPE 18',
      titleName: 'OFFERS / CAMPAIGN HEADER',
      categoryGroup: 'DISCOVERY',
      uxPriority: 'Back arrow, Campaign title (Flat 20% OFF), Subtitle, Coupon Badge HEAL20, Purple Gradient.',
      props: {
        type: 'offers',
        title: 'Flat 20% OFF Essential Meds',
        subtitle: 'Valid on orders above â‚¹299 from nearby stores',
        couponCode: 'HEAL20',
      },
    },
    {
      id: 'v19',
      type: 'support',
      numberLabel: 'HEADER TYPE 19',
      titleName: 'HELP & SUPPORT HEADER',
      categoryGroup: 'MANAGEMENT',
      uxPriority: 'Back arrow, Help & Support title, How can we help subtext, Chat / Call support CTA.',
      props: {
        type: 'support',
        title: 'Help & Support',
        subtitle: 'We are here to assist you 24/7',
      },
    },
    {
      id: 'v20',
      type: 'focused',
      numberLabel: 'HEADER TYPE 20',
      titleName: 'FULL SCREEN FOCUSED TASK HEADER',
      categoryGroup: 'FOCUSED',
      uxPriority: 'Back arrow, Clear task title (Add New Address / Payment), Step indicator, Minimal distractions.',
      props: {
        type: 'focused',
        title: 'Add New Delivery Address',
        subtitle: 'Step 1 of 2 â€¢ Enter location details',
      },
    },
  ];

  const filteredSpecs = HEADER_SPECS.filter((spec) => {
    if (selectedFilterCategory === 'ALL') return true;
    return spec.categoryGroup === selectedFilterCategory;
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* Top Screen Title & Back */}
        <View style={styles.showcaseTopBar}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()} style={styles.backCircleBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={{ flex: 1, marginLeft: 10 }}>
            <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
              Universal Header Design System
            </AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              HEALIT 20 Master Adaptive Header Variants
            </AppText>
          </View>
        </View>

        {/* Filter Category Pills Row */}
        <View style={styles.filterBarWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBar}>
            {['ALL', 'DISCOVERY', 'SHOPPING', 'TRANSACTION', 'MANAGEMENT', 'FOCUSED'].map((cat) => {
              const isSel = selectedFilterCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.8}
                  onPress={() => setSelectedFilterCategory(cat)}
                  style={[styles.catFilterPill, isSel ? styles.catFilterPillActive : undefined]}
                >
                  <AppText style={[styles.catFilterText, isSel ? styles.catFilterTextActive : undefined]}>
                    {cat}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Interactive Controls Bar */}
        <View style={styles.interactiveControlsRow}>
          <AppText variant="caption" color={colors.textSecondary} weight="600">
            Interactive Test Controls:
          </AppText>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setCheckoutStep((prev) => (prev === 3 ? 1 : ((prev + 1) as any)))}
            style={styles.controlPillBtn}
          >
            <Ionicons name="arrow-forward-circle" size={14} color={colors.primary} style={{ marginRight: 4 }} />
            <AppText variant="caption" color={colors.primary} weight="600">
              Step: {checkoutStep}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* List of 20 Master Header Variants */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {filteredSpecs.map((spec) => (
            <View key={spec.id} style={styles.variantCard}>
              {/* Header Spec Label */}
              <View style={styles.specHeaderRow}>
                <View style={styles.specTitlePill}>
                  <AppText style={styles.specNumberText}>{spec.numberLabel}</AppText>
                </View>
                <AppText style={styles.specNameText}>{spec.titleName}</AppText>
                <View style={styles.specGroupBadge}>
                  <AppText style={styles.specGroupText}>{spec.categoryGroup}</AppText>
                </View>
              </View>

              {/* UX Priority Context Notes */}
              <View style={styles.uxNotesBox}>
                <Ionicons name="information-circle" size={15} color={colors.primary} style={{ marginRight: 6 }} />
                <AppText variant="caption" color={colors.textSecondary} style={{ flex: 1, fontSize: 11.5 }}>
                  <AppText weight="700" color={colors.textPrimary}>UX Intent: </AppText>
                  {spec.uxPriority}
                </AppText>
              </View>

              {/* Rendered Mobile Header Fragment */}
              <View style={styles.headerRenderFragmentBox}>
                <AdaptiveHeader
                  {...spec.props}
                  isStandaloneShowcase={true}
                />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F8',
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F4F8',
  },
  showcaseTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EE',
  },
  backCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8F8FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBarWrapper: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EE',
  },
  filterBar: {
    paddingHorizontal: 16,
    gap: 8,
  },
  catFilterPill: {
    backgroundColor: '#F8F8FC',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  catFilterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catFilterText: {
    fontSize: 11,
    fontFamily: 'LexendDeca_600SemiBold',
    color: COLORS.textSecondary,
  },
  catFilterTextActive: {
    color: '#FFFFFF',
  },
  interactiveControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ECE8F7',
  },
  controlPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 20,
  },
  variantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E2EC',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  specHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  specTitlePill: {
    backgroundColor: '#351682',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  specNumberText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontFamily: 'LexendDeca_700Bold',
  },
  specNameText: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: 'LexendDeca_700Bold',
    color: COLORS.textPrimary,
  },
  specGroupBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  specGroupText: {
    color: COLORS.primary,
    fontSize: 9.5,
    fontFamily: 'LexendDeca_700Bold',
  },
  uxNotesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F8FC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  headerRenderFragmentBox: {
    borderTopWidth: 1,
    borderTopColor: '#E8E8EE',
    backgroundColor: '#FAFAFD',
  },
});


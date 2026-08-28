import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { PharmacyService } from '../../services/pharmacyService';
import { Pharmacy } from '../../types/pharmacy';
import { Medicine } from '../../types/medicine';
import { useCart } from '../../store/CartContext';
import { useToast } from '../../store/ToastContext';
import { useAppTheme } from '../../store/ThemeContext';
import { MedicineCard } from '../../components/cards/MedicineCard';
import { VariantSelectionModal } from '../../components/modals/VariantSelectionModal';
import { FloatingCart } from '../../components/common/FloatingCart';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = (SCREEN_WIDTH - 32 - 12) / 2;

export const PharmacyDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'PharmacyDetail'>>();
  const pharmacyId = route.params?.pharmacyId || 'pharm-1';
  const initialPharm = route.params?.pharmacy;

  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(initialPharm || null);
  const [inventory, setInventory] = useState<{ medicine: Medicine; inventory: any }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'rx' | 'otc' | 'supplements'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMedicineForVariant, setSelectedMedicineForVariant] = useState<Medicine | null>(null);

  const { totalItemCount, addToCart, removeFromCart, getItemQuantity, updateQuantity, undoRemove } = useCart();
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerBgOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [25, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    PharmacyService.getPharmacyInventory(pharmacyId).then((res) => {
      if (res.pharmacy) setPharmacy(res.pharmacy);
      setInventory(res.items);
      setIsLoading(false);
    });
  }, [pharmacyId]);

  if (isLoading || !pharmacy) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="bodyMedium" color={colors.textSecondary} style={{ marginTop: 12 }}>
          Loading pharmacy inventory...
        </AppText>
      </View>
    );
  }

  const formatPrice = (price: number) => '₹' + price;

  // Filter items based on search query and active tab filter
  const getFilteredItems = () => {
    let list = inventory;
    
    // 1. Text Search Filter
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.medicine.name.toLowerCase().includes(q) ||
          item.medicine.saltComposition.toLowerCase().includes(q) ||
          item.medicine.category?.toLowerCase().includes(q)
      );
    }

    // 2. Chip Tab Filter
    if (selectedFilter === 'rx') {
      list = list.filter((item) => item.medicine.rxRequired);
    } else if (selectedFilter === 'otc') {
      list = list.filter((item) => !item.medicine.rxRequired && !isSupplement(item.medicine));
    } else if (selectedFilter === 'supplements') {
      list = list.filter((item) => isSupplement(item.medicine));
    }

    return list;
  };

  const isSupplement = (med: Medicine) => {
    const supplementKeywords = ['vitamin', 'supplement', 'calcium', 'multivitamin', 'capsule', 'iron'];
    return (
      med.category?.toLowerCase().includes('vitamins') ||
      med.category?.toLowerCase().includes('supplements') ||
      supplementKeywords.some((kw) => med.name.toLowerCase().includes(kw))
    );
  };

  const filteredItems = getFilteredItems();

  // Segmenting for Sections
  const topPicks = filteredItems.slice(0, 4);
  const prescriptionMeds = filteredItems.filter((item) => item.medicine.rxRequired);
  const otcMeds = filteredItems.filter((item) => !item.medicine.rxRequired && !isSupplement(item.medicine));
  const supplementMeds = filteredItems.filter((item) => isSupplement(item.medicine));

  const handleAddOne = (med: Medicine) => {
    addToCart(med, 1, undefined, pharmacy.id, pharmacy.name);
    showToast(med.name + ' added to cart from ' + pharmacy.name, 'success');
  };

  const renderStoreMedicineCard = (med: Medicine, index: number, isHorizontal = false) => {
    return (
      <MedicineCard
        key={med.id}
        medicine={med}
        onPress={() => navigation.navigate('MedicineDetails', { medicineId: med.id, medicine: med })}
        onOpenVariantModal={(m) => setSelectedMedicineForVariant(m)}
        onAddToCart={() => {
          const added = addToCart(med, 1, undefined, pharmacy.id, pharmacy.name);
          if (added) {
            showToast(`Added ${med.name} to cart!`, 'success');
            if (med.rxRequired) {
              setTimeout(() => {
                showToast('Prescription will be required before placing order', 'info', 3500);
              }, 800);
            }
          } else {
            showToast('Maximum quantity limit (10) reached', 'warning');
          }
        }}
        onIncrement={() => {
          const currentQty = getItemQuantity(med.id);
          if (currentQty >= 10) {
            showToast('Maximum quantity limit (10) reached', 'warning');
          } else {
            updateQuantity(med.id, currentQty + 1);
          }
        }}
        onDecrement={() => {
          const q = getItemQuantity(med.id);
          if (q === 1) {
            removeFromCart(med.id);
            showToast(`${med.name} removed from cart`, 'info', 4000, 'Undo', () => undoRemove());
          } else {
            updateQuantity(med.id, q - 1);
          }
        }}
        cartQuantity={getItemQuantity(med.id)}
        storeAttribution={pharmacy.name}
        style={
          isHorizontal
            ? { marginRight: SPACING.md }
            : { width: PRODUCT_CARD_WIDTH, marginBottom: SPACING.md, marginRight: index % 2 === 0 ? 12 : 0 }
        }
      />
    );
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 1. TOP STICKY ANIMATED HEADER BAR */}
      <Animated.View
        style={[
          styles.stickyHeaderBar,
          {
            paddingTop: insets.top + (Platform.OS === 'android' ? 6 : 2),
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            opacity: headerBgOpacity,
          },
          SHADOWS.subtle,
        ]}
      >
        <Animated.View style={[styles.stickyHeaderCenter, { opacity: headerTitleOpacity }]}>
          <AppText variant="titleSmall" color={colors.textPrimary} weight="700" numberOfLines={1}>
            {pharmacy.name}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary} numberOfLines={1} style={{ fontSize: 10 }}>
            {pharmacy.isVerified ? '✓ Verified Partner' : 'Partner Store'}
          </AppText>
        </Animated.View>
      </Animated.View>

      {/* FLOATING ACTION BUTTONS (Back & Cart) */}
      <View
        style={[
          styles.floatingHeaderRow,
          {
            top: insets.top + (Platform.OS === 'android' ? 6 : 4),
          },
        ]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.floatingIconButton}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Cart')}
          style={styles.floatingIconButton}
        >
          <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
          {totalItemCount > 0 && (
            <View style={[styles.cartBadgeCircle, { backgroundColor: colors.primary }]}>
              <AppText variant="caption" color="#FFFFFF" weight="700" style={{ fontSize: 9 }}>
                {totalItemCount}
              </AppText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* =========================================================================
            1. TOP BANNER BACKGROUND & OVERLAPPING CIRCLE LOGO
           ========================================================================= */}
        <View style={[styles.topGradientBanner, { backgroundColor: isDark ? '#1C1917' : '#3A2986', paddingTop: insets.top }]} />
        
        <View style={[styles.logoWrapper, SHADOWS.card, { backgroundColor: colors.surface }]}>
          <Image source={{ uri: pharmacy.logo }} style={styles.logoImage} resizeMode="contain" />
        </View>

        {/* =========================================================================
            2. MAIN PROFILE CARD (Matches Swiggy Pizza layout concept)
           ========================================================================= */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.card]}>
          
          {/* Verification Label Tag */}
          <View style={[styles.verifiedTag, { backgroundColor: isDark ? colors.surfaceElevated : '#EEF2FF' }]}>
            <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
            <AppText variant="caption" color={colors.primary} weight="700" style={{ marginLeft: 3, fontSize: 10 }}>
              HEALIT VERIFIED PARTNER
            </AppText>
          </View>

          {/* Store Name & Rating Capsule Row */}
          <View style={styles.storeMainRow}>
            <View style={styles.storeNameCol}>
              <AppText variant="titleLarge" color={colors.textPrimary} weight="700" numberOfLines={2} style={{ fontSize: 20 }}>
                {pharmacy.name}
              </AppText>
              <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                License: {pharmacy.licenseNumber}
              </AppText>
            </View>

            {/* Green Rating Badge */}
            <View style={styles.ratingBadgeCol}>
              <View style={[styles.ratingCapsule, { backgroundColor: '#15803D' }]}>
                <AppText variant="bodySmall" color="#FFFFFF" weight="700">
                  {pharmacy.rating}
                </AppText>
                <Ionicons name="star" size={10} color="#FFFFFF" style={{ marginLeft: 2 }} />
              </View>
              <AppText variant="caption" color={colors.textSecondary} style={styles.ratingsCountText}>
                {pharmacy.reviewCount + ' reviews'}
              </AppText>
            </View>
          </View>

          {/* Metadata Row: Delivery Time, Distance, Location */}
          <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />
          
          <View style={styles.deliveryMetaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={14} color={colors.primary} />
              <AppText variant="bodySmall" color={colors.textPrimary} weight="600" style={{ marginLeft: 4 }}>
                {(pharmacy.estimatedDeliveryTimeMinutes - 5) + '-' + pharmacy.estimatedDeliveryTimeMinutes + ' mins'}
              </AppText>
            </View>

            <View style={[styles.metaSeparator, { backgroundColor: colors.textMuted }]} />

            <View style={styles.metaItem}>
              <Ionicons name="location-sharp" size={14} color={colors.textSecondary} />
              <AppText variant="bodySmall" color={colors.textSecondary} style={{ marginLeft: 4 }}>
                {pharmacy.distanceKm + ' km away'}
              </AppText>
            </View>

            <View style={[styles.metaSeparator, { backgroundColor: colors.textMuted }]} />

            <AppText variant="bodySmall" color={colors.textSecondary} numberOfLines={1} style={{ flex: 1 }}>
              {pharmacy.address.city}
            </AppText>
          </View>

          {/* Dotted Border Offers Slider Box */}
          <View style={[styles.offersBox, { backgroundColor: isDark ? colors.surfaceElevated : '#FDF2E9', borderColor: '#EA580C' }]}>
            <View style={styles.offerIconWrap}>
              <Ionicons name="pricetag" size={14} color="#EA580C" />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <AppText variant="caption" color="#EA580C" weight="700" style={{ letterSpacing: 0.5 }}>
                FLAT 15% OFF | USE HEAL15
              </AppText>
              <AppText variant="caption" color={colors.textSecondary} style={{ fontSize: 10 }}>
                {'On prescription drugs above ' + formatPrice(499)}
              </AppText>
            </View>
            <AppText variant="caption" color={colors.textMuted} weight="600">
              1/2
            </AppText>
          </View>

          {/* Free Shipping Footer Bar */}
          <View style={[styles.freeShippingFooter, { backgroundColor: isDark ? colors.surfaceElevated : '#F5F3FE' }]}>
            <Ionicons name="flash-sharp" size={14} color={colors.primary} />
            <AppText variant="caption" color={colors.textPrimary} weight="600" style={{ marginLeft: 6 }}>
              {'Free doorstep delivery on medicine orders above ' + formatPrice(pharmacy.freeDeliveryAbove || 0)}
            </AppText>
          </View>
        </View>

        {/* =========================================================================
            3. IN-STORE SEARCH BAR & FILTER CHIPS
           ========================================================================= */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBarRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              placeholder={'Search for medicines in ' + pharmacy.name + '...'}
              placeholderTextColor={isDark ? colors.textMuted : '#8E8E93'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[styles.searchInput, { color: colors.textPrimary }]}
            />
            <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Ionicons name="mic-outline" size={20} color={colors.primary} />
          </View>

          {/* Horizontal Filters Chips Row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsRow}
          >
            {[
              { id: 'all', label: 'All Items' },
              { id: 'rx', label: 'Rx Required 📄' },
              { id: 'otc', label: 'OTC Relief 💊' },
              { id: 'supplements', label: 'Wellness/Vitamins 🥗' },
            ].map((chip) => {
              const isSelected = selectedFilter === chip.id;
              return (
                <TouchableOpacity
                  key={chip.id}
                  onPress={() => setSelectedFilter(chip.id as any)}
                  style={[
                    styles.filterChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    isSelected && [styles.filterChipActive, { backgroundColor: colors.primary, borderColor: colors.primary }]
                  ]}
                >
                  <AppText
                    variant="caption"
                    color={isSelected ? '#FFFFFF' : colors.textPrimary}
                    weight="600"
                  >
                    {chip.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* =========================================================================
            4. GIFT BANNER (Free item for you!)
           ========================================================================= */}
        <View style={[styles.giftBanner, { backgroundColor: isDark ? colors.surfaceElevated : '#FFF5F5', borderColor: '#FECACA' }]}>
          <View style={{ flex: 1 }}>
            <View style={styles.giftTitleRow}>
              <AppText variant="titleSmall" color="#DC2626" weight="700">
                FREE Gift added to Cart! 🎁
              </AppText>
            </View>
            <AppText variant="caption" color={colors.textPrimary} weight="600" style={{ marginTop: 2 }}>
              Get Free Vitamin C chewable strip
            </AppText>
            <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 1, fontSize: 10 }}>
              {'Auto-applies on checkout cart total above ' + formatPrice(999)}
            </AppText>
          </View>
          <View style={styles.giftImageWrap}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1616679911721-eff6eec18fcd?w=200&q=80' }}
              style={styles.giftImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* =========================================================================
            5. HORIZONTAL TOP PICKS / BESTSELLERS
           ========================================================================= */}
        {topPicks.length > 0 && (
          <View style={styles.topPicksSection}>
            <AppText variant="titleMedium" color={colors.textPrimary} weight="700" style={{ marginBottom: 12, paddingHorizontal: 16 }}>
              Top Picks &amp; Bestsellers
            </AppText>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {topPicks.map((item, idx) => renderStoreMedicineCard(item.medicine, idx, true))}
            </ScrollView>
          </View>
        )}

        {/* =========================================================================
            6. GROUPED CATEGORIES & SECTIONS LIST (Prescription, OTC, Supplements)
           ========================================================================= */}
        
        {/* Category Section 1: Prescription Drugs */}
        {prescriptionMeds.length > 0 && (
          <View style={styles.categorySection}>
            <View style={styles.sectionHeaderWrap}>
              <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                Prescription Drugs (Rx)
              </AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Doctor prescription required for checkout
              </AppText>
            </View>

            <View style={styles.gridContainer}>
              {prescriptionMeds.map((item, idx) => renderStoreMedicineCard(item.medicine, idx, false))}
            </View>
          </View>
        )}

        {/* Category Section 2: OTC Medicines */}
        {otcMeds.length > 0 && (
          <View style={styles.categorySection}>
            <View style={styles.sectionHeaderWrap}>
              <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                Over the Counter (OTC) Relief
              </AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Self-care essentials, no prescription needed
              </AppText>
            </View>

            <View style={styles.gridContainer}>
              {otcMeds.map((item, idx) => renderStoreMedicineCard(item.medicine, idx, false))}
            </View>
          </View>
        )}

        {/* Category Section 3: Supplements & Wellness */}
        {supplementMeds.length > 0 && (
          <View style={styles.categorySection}>
            <View style={styles.sectionHeaderWrap}>
              <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                Wellness &amp; Health Supplements
              </AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Daily vitamins, minerals, and calcium formulas
              </AppText>
            </View>

            <View style={styles.gridContainer}>
              {supplementMeds.map((item, idx) => renderStoreMedicineCard(item.medicine, idx, false))}
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      {/* Floating Cart */}
      <FloatingCart onPressViewCart={() => navigation.navigate('Cart')} />

      {/* Variant Selection Modal */}
      <VariantSelectionModal
        visible={!!selectedMedicineForVariant}
        medicine={selectedMedicineForVariant}
        onClose={() => setSelectedMedicineForVariant(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyHeaderBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    borderBottomWidth: 1,
  },
  stickyHeaderCenter: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 70,
  },
  floatingHeaderRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
  },
  floatingIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeCircle: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  topGradientBanner: {
    height: 130,
    width: '100%',
  },
  logoWrapper: {
    position: 'absolute',
    top: 65,
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  logoImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profileCard: {
    borderRadius: 24,
    padding: 16,
    paddingTop: 45, // clearance for overlapping circle logo
    marginTop: 40, // overlap pulling
    marginHorizontal: 16,
    borderWidth: 1.5,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 10,
  },
  storeMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  storeNameCol: {
    flex: 1,
    paddingRight: 12,
  },
  ratingBadgeCol: {
    alignItems: 'flex-end',
  },
  ratingCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingsCountText: {
    fontSize: 9,
    marginTop: 4,
  },
  metaDivider: {
    height: 1,
    marginVertical: 14,
  },
  deliveryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 8,
  },
  offersBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  freeShippingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 12,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
  },
  filterChipsRow: {
    paddingVertical: SPACING.md,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterChipActive: {
    borderColor: 'transparent',
  },
  giftBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
  },
  giftTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  giftImageWrap: {
    width: 55,
    height: 55,
    borderRadius: 8,
    overflow: 'hidden',
    marginLeft: 12,
  },
  giftImage: {
    width: '100%',
    height: '100%',
  },
  topPicksSection: {
    marginTop: 24,
    paddingLeft: 16,
  },
  topPicksScroll: {
    paddingRight: 16,
  },
  topPickCard: {
    width: 145,
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
    marginRight: 12,
  },
  topPickImage: {
    width: '100%',
    height: 90,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  topPickDetails: {
    marginTop: 8,
    position: 'relative',
  },
  rxBadgeTiny: {
    position: 'absolute',
    top: -12,
    left: 0,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  topPickName: {
    fontSize: 13,
  },
  topPickPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quickAddBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categorySection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeaderWrap: {
    marginBottom: 12,
    borderLeftWidth: 3.5,
    borderLeftColor: COLORS.primary,
    paddingLeft: 8,
  },
  medListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  medListImage: {
    width: 70,
    height: 70,
  },
  medListDetails: {
    flex: 1,
    marginLeft: 12,
  },
  medNameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rxBadgeText: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  medListPriceAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#F3F4F6',
  },
  priceColumn: {
    justifyContent: 'center',
  },
  strikeMrp: {
    textDecorationLine: 'line-through',
    fontSize: 10,
    marginTop: 1,
  },
  listItemAddBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});

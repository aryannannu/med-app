import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
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

  const { totalItemCount, addToCart, getItemQuantity } = useCart();
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();

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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header Bar */}
      <View style={[styles.headerBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <AppText variant="titleMedium" color={colors.textPrimary} weight="600" numberOfLines={1}>
            {pharmacy.name}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            {pharmacy.isVerified ? '✓ Verified Partner Pharmacy' : 'Partner Store'}
          </AppText>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Cart')}
          style={styles.cartIconContainer}
        >
          <Ionicons name="cart-outline" size={24} color={colors.textPrimary} />
          {totalItemCount > 0 && (
            <View style={[styles.cartBadgeCircle, { backgroundColor: colors.primary }]}>
              <AppText variant="caption" color="#FFFFFF" weight="700" style={{ fontSize: 9 }}>
                {totalItemCount}
              </AppText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* =========================================================================
            1. TOP BANNER BACKGROUND & OVERLAPPING CIRCLE LOGO
           ========================================================================= */}
        <View style={[styles.topGradientBanner, { backgroundColor: isDark ? '#1C1917' : '#3A2986' }]} />
        
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
            <AppText variant="titleMedium" color={colors.textPrimary} weight="700" style={{ marginBottom: 12 }}>
              Top Picks &amp; Bestsellers
            </AppText>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topPicksScroll}
            >
              {topPicks.map((item) => {
                const qty = getItemQuantity(item.medicine.id);
                return (
                  <View
                    key={item.medicine.id}
                    style={[styles.topPickCard, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.subtle]}
                  >
                    <Image source={{ uri: item.medicine.image }} style={styles.topPickImage} resizeMode="contain" />
                    
                    <View style={styles.topPickDetails}>
                      {item.medicine.rxRequired && (
                        <View style={styles.rxBadgeTiny}>
                          <AppText variant="caption" color="#DC2626" weight="800" style={{ fontSize: 8 }}>Rx</AppText>
                        </View>
                      )}
                      
                      <AppText variant="titleSmall" color={colors.textPrimary} weight="600" numberOfLines={1} style={styles.topPickName}>
                        {item.medicine.name}
                      </AppText>
                      
                      <AppText variant="caption" color={colors.textSecondary} numberOfLines={1}>
                        {item.medicine.packForm}
                      </AppText>

                      <View style={styles.topPickPriceRow}>
                        <AppText variant="titleMedium" color={colors.primary} weight="700">
                          {formatPrice(item.medicine.discountPrice || item.medicine.mrp)}
                        </AppText>
                        
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => handleAddOne(item.medicine)}
                          style={[styles.quickAddBtn, { backgroundColor: colors.primaryMuted, borderColor: colors.primary }]}
                        >
                          <AppText variant="caption" color={colors.primary} weight="700">
                            {qty > 0 ? qty + ' ADDED' : '+ ADD'}
                          </AppText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
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

            {prescriptionMeds.map((item) => {
              const qty = getItemQuantity(item.medicine.id);
              return (
                <View
                  key={item.medicine.id}
                  style={[styles.medListItem, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.subtle]}
                >
                  <Image source={{ uri: item.medicine.image }} style={styles.medListImage} resizeMode="contain" />
                  
                  <View style={styles.medListDetails}>
                    <View style={styles.medNameBadgeRow}>
                      <AppText variant="titleMedium" color={colors.textPrimary} weight="600" style={{ flex: 1 }}>
                        {item.medicine.name}
                      </AppText>
                      <View style={styles.rxBadgeText}>
                        <AppText variant="caption" color="#DC2626" weight="800" style={{ fontSize: 9 }}>Rx REQUIRED</AppText>
                      </View>
                    </View>

                    <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                      {'Salt: ' + item.medicine.saltComposition}
                    </AppText>
                    <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                      {'Dosage: ' + item.medicine.packForm}
                    </AppText>

                    <View style={styles.medListPriceAddRow}>
                      <View style={styles.priceColumn}>
                        <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                          {formatPrice(item.medicine.discountPrice || item.medicine.mrp)}
                        </AppText>
                        {item.medicine.mrp > (item.medicine.discountPrice || 0) && (
                          <AppText variant="caption" color={colors.textMuted} style={styles.strikeMrp}>
                            {'MRP ' + formatPrice(item.medicine.mrp)}
                          </AppText>
                        )}
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleAddOne(item.medicine)}
                        style={[styles.listItemAddBtn, { backgroundColor: colors.primaryMuted, borderColor: colors.primary }]}
                      >
                        <AppText variant="bodySmall" color={colors.primary} weight="700">
                          {qty > 0 ? qty + ' in Cart' : '+ ADD TO CART'}
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
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

            {otcMeds.map((item) => {
              const qty = getItemQuantity(item.medicine.id);
              return (
                <View
                  key={item.medicine.id}
                  style={[styles.medListItem, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.subtle]}
                >
                  <Image source={{ uri: item.medicine.image }} style={styles.medListImage} resizeMode="contain" />
                  
                  <View style={styles.medListDetails}>
                    <AppText variant="titleMedium" color={colors.textPrimary} weight="600">
                      {item.medicine.name}
                    </AppText>

                    <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                      {'Category: ' + (item.medicine.category || 'Pain Relief / Cold')}
                    </AppText>
                    <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                      {'Dosage: ' + item.medicine.packForm}
                    </AppText>

                    <View style={styles.medListPriceAddRow}>
                      <View style={styles.priceColumn}>
                        <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                          {formatPrice(item.medicine.discountPrice || item.medicine.mrp)}
                        </AppText>
                        {item.medicine.mrp > (item.medicine.discountPrice || 0) && (
                          <AppText variant="caption" color={colors.textMuted} style={styles.strikeMrp}>
                            {'MRP ' + formatPrice(item.medicine.mrp)}
                          </AppText>
                        )}
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleAddOne(item.medicine)}
                        style={[styles.listItemAddBtn, { backgroundColor: colors.primaryMuted, borderColor: colors.primary }]}
                      >
                        <AppText variant="bodySmall" color={colors.primary} weight="700">
                          {qty > 0 ? qty + ' in Cart' : '+ ADD TO CART'}
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
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

            {supplementMeds.map((item) => {
              const qty = getItemQuantity(item.medicine.id);
              return (
                <View
                  key={item.medicine.id}
                  style={[styles.medListItem, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.subtle]}
                >
                  <Image source={{ uri: item.medicine.image }} style={styles.medListImage} resizeMode="contain" />
                  
                  <View style={styles.medListDetails}>
                    <AppText variant="titleMedium" color={colors.textPrimary} weight="600">
                      {item.medicine.name}
                    </AppText>

                    <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                      Category: Vitamins &amp; Wellness Supplements
                    </AppText>
                    <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                      {'Form: ' + item.medicine.packForm}
                    </AppText>

                    <View style={styles.medListPriceAddRow}>
                      <View style={styles.priceColumn}>
                        <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                          {formatPrice(item.medicine.discountPrice || item.medicine.mrp)}
                        </AppText>
                        {item.medicine.mrp > (item.medicine.discountPrice || 0) && (
                          <AppText variant="caption" color={colors.textMuted} style={styles.strikeMrp}>
                            {'MRP ' + formatPrice(item.medicine.mrp)}
                          </AppText>
                        )}
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleAddOne(item.medicine)}
                        style={[styles.listItemAddBtn, { backgroundColor: colors.primaryMuted, borderColor: colors.primary }]}
                      >
                        <AppText variant="bodySmall" color={colors.primary} weight="700">
                          {qty > 0 ? qty + ' in Cart' : '+ ADD TO CART'}
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
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
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  cartIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadgeCircle: {
    position: 'absolute',
    top: 2,
    right: 2,
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
    height: 110,
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

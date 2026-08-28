import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { Medicine } from '../../types/medicine';
import { useCart } from '../../store/CartContext';
import { useToast } from '../../store/ToastContext';
import { useAddress } from '../../store/AddressContext';
import { useAppTheme } from '../../store/ThemeContext';
import { formatCurrency } from '../../utils/currency';

interface StoreAvailabilityItem {
  id: string;
  name: string;
  distanceKm: number;
  price: number;
  mrp: number;
  discountPercentage: number;
  deliveryEtaMins: string;
  rating: number;
  reviewCount: number;
  isRecommended?: boolean;
  inStock: boolean;
  stockCount?: number;
  offerText?: string;
  address: string;
}

const MOCK_STORES: StoreAvailabilityItem[] = [
  {
    id: 'pharm-1',
    name: 'CarePlus Pharmacy & Surgical',
    distanceKm: 0.8,
    price: 18.5,
    mrp: 25.0,
    discountPercentage: 26,
    deliveryEtaMins: '12–15 min',
    rating: 4.8,
    reviewCount: 210,
    isRecommended: true,
    inStock: true,
    stockCount: 14,
    offerText: 'FLAT 15% OFF | Code: HEAL15',
    address: 'Phase 7, Sector 61, Mohali',
  },
  {
    id: 'pharm-2',
    name: 'Apollo Pharmacy Express',
    distanceKm: 1.4,
    price: 17.0,
    mrp: 25.0,
    discountPercentage: 32,
    deliveryEtaMins: '20–25 min',
    rating: 4.6,
    reviewCount: 450,
    inStock: true,
    stockCount: 8,
    offerText: 'Free doorstep delivery',
    address: 'Sector 70, Main Market, Mohali',
  },
  {
    id: 'pharm-3',
    name: 'MedPlus Health Store',
    distanceKm: 2.1,
    price: 19.0,
    mrp: 25.0,
    discountPercentage: 24,
    deliveryEtaMins: '15–20 min',
    rating: 4.7,
    reviewCount: 180,
    inStock: true,
    stockCount: 3,
    offerText: 'Bank Offer 10% Cashback',
    address: 'Industrial Area Phase 8, Mohali',
  },
  {
    id: 'pharm-4',
    name: 'Sanjivani Medicos',
    distanceKm: 3.2,
    price: 21.0,
    mrp: 25.0,
    discountPercentage: 16,
    deliveryEtaMins: '30–35 min',
    rating: 4.4,
    reviewCount: 95,
    inStock: false,
    address: 'Sector 71, Near Fortis, Mohali',
  },
];

export const StoreAvailabilityScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'StoreAvailability'>>();
  const { medicineId, medicine: initialMed } = route.params;

  const { colors, isDark } = useAppTheme();
  const { showToast } = useToast();
  const { selectedAddress } = useAddress();
  const { items, addToCart } = useCart();

  const [sortBy, setSortBy] = useState<'recommended' | 'price' | 'eta' | 'distance'>('recommended');

  const medicine: Medicine = initialMed || {
    id: medicineId || 'med-1',
    name: 'Dolo 650 Tablet',
    brandName: 'Micro Labs Ltd',
    genericName: 'Paracetamol 650 mg',
    category: 'Fever & Pain',
    categorySlug: 'fever-pain',
    description: 'Dolo 650 Tablet is an analgesic and antipyretic medicine.',
    uses: ['Fever', 'Headache', 'Body ache'],
    mrp: 25.0,
    discountPrice: 18.5,
    discountPercentage: 26,
    packForm: 'Strip of 15 Tablets',
    rxRequired: false,
    inStock: true,
    rating: 4.8,
    reviewCount: 12458,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80',
    saltComposition: 'Paracetamol 650 mg',
    manufacturer: 'Micro Labs Ltd',
  };

  const sortedStores = useMemo(() => {
    const list = [...MOCK_STORES];
    if (sortBy === 'price') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'eta') {
      list.sort((a, b) => parseInt(a.deliveryEtaMins) - parseInt(b.deliveryEtaMins));
    } else if (sortBy === 'distance') {
      list.sort((a, b) => a.distanceKm - b.distanceKm);
    } else {
      list.sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0));
    }
    return list;
  }, [sortBy]);

  const handleBuyFromStore = (store: StoreAvailabilityItem) => {
    // Check if cart has items from another store
    const currentVendorId = items.length > 0 ? items[0].sourcePharmacyId : null;
    const currentVendorName = items.length > 0 ? items[0].sourcePharmacyName : null;

    if (currentVendorId && currentVendorId !== store.id) {
      Alert.alert(
        'Switch Store Fulfillment?',
        `Your cart currently contains medicines from ${currentVendorName || 'another store'}.\n\nDo you want to switch to ${store.name}?`,
        [
          {
            text: 'View Cart',
            onPress: () => navigation.navigate('Cart'),
            style: 'cancel',
          },
          {
            text: `Switch to ${store.name}`,
            onPress: () => {
              addToCart(medicine, 1, undefined, store.id, store.name);
              showToast(`Medicine added! Fulfilled by ${store.name}`, 'success');
              navigation.navigate('Cart');
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      addToCart(medicine, 1, undefined, store.id, store.name);
      showToast(`Medicine added! Fulfilled by ${store.name}`, 'success');
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={[styles.backBtn, { backgroundColor: isDark ? colors.surfaceElevated : '#F3F4F6' }]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
            Available at Stores
          </AppText>
          <AppText variant="caption" color={colors.textSecondary} numberOfLines={1}>
            {medicine.name} • {medicine.saltComposition}
          </AppText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Delivery Location Bar */}
        <View style={[styles.locationBar, { backgroundColor: isDark ? colors.surfaceElevated : '#F5F3FE', borderColor: colors.primaryBorder }]}>
          <Ionicons name="location-sharp" size={18} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <AppText variant="caption" color={colors.primary} weight="700">
              DELIVERING TO
            </AppText>
            <AppText variant="bodySmall" color={colors.textPrimary} weight="600" numberOfLines={1}>
              {selectedAddress
                ? `${selectedAddress.houseFlatNumber}, ${selectedAddress.streetAddress}, ${selectedAddress.city}`
                : 'Mohali, Sector 74 (160055)'}
            </AppText>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('AddressSelection', { isSelectingForCheckout: false })}>
            <AppText variant="caption" color={colors.primary} weight="700">
              Change &gt;
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Product Brief Summary Bar */}
        <View style={[styles.productBriefCard, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.subtle]}>
          <Image source={{ uri: medicine.image }} style={styles.briefImage} resizeMode="contain" />
          <View style={styles.briefInfo}>
            <AppText variant="titleSmall" color={colors.textPrimary} weight="700" numberOfLines={1}>
              {medicine.name}
            </AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              {medicine.saltComposition} • {medicine.packForm}
            </AppText>
            <AppText variant="caption" color={colors.primary} weight="600" style={{ marginTop: 2 }}>
              {sortedStores.filter((s) => s.inStock).length} nearby pharmacies have this item in stock
            </AppText>
          </View>
        </View>

        {/* Sort Chips Filter Bar */}
        <View style={styles.sortSection}>
          <AppText variant="caption" color={colors.textSecondary} weight="700" style={{ marginBottom: 8 }}>
            SORT BY
          </AppText>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
            {[
              { id: 'recommended', label: 'Recommended ⭐' },
              { id: 'price', label: 'Lowest Price 🏷️' },
              { id: 'eta', label: 'Fastest Delivery ⚡' },
              { id: 'distance', label: 'Nearest 📍' },
            ].map((chip) => {
              const isSelected = sortBy === chip.id;
              return (
                <TouchableOpacity
                  key={chip.id}
                  onPress={() => setSortBy(chip.id as any)}
                  style={[
                    styles.sortChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    isSelected && [styles.sortChipActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
                  ]}
                >
                  <AppText variant="caption" color={isSelected ? '#FFFFFF' : colors.textPrimary} weight="700">
                    {chip.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Store Result Cards List */}
        <View style={styles.storeList}>
          {sortedStores.map((store) => (
            <View
              key={store.id}
              style={[
                styles.storeCard,
                { backgroundColor: colors.surface, borderColor: store.isRecommended ? colors.primary : colors.border },
                SHADOWS.card,
              ]}
            >
              {/* Recommended Ribbon */}
              {store.isRecommended && (
                <View style={[styles.recommendedTag, { backgroundColor: colors.primary }]}>
                  <Ionicons name="sparkles" size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <AppText variant="caption" color="#FFFFFF" weight="800" style={{ fontSize: 9, letterSpacing: 0.5 }}>
                    RECOMMENDED VENDOR
                  </AppText>
                </View>
              )}

              {/* Store Title & Distance Row */}
              <View style={styles.storeHeaderRow}>
                <View style={styles.storeTitleCol}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="business" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                    <AppText variant="titleMedium" color={colors.textPrimary} weight="700" numberOfLines={1} style={{ flex: 1 }}>
                      {store.name}
                    </AppText>
                  </View>
                  <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                    📍 {store.distanceKm} km away • {store.address}
                  </AppText>
                </View>

                {/* Rating Badge */}
                <View style={styles.ratingCapsule}>
                  <AppText variant="caption" color="#15803D" weight="800">
                    ★ {store.rating}
                  </AppText>
                </View>
              </View>

              {/* Price & Delivery ETA Highlights Box */}
              <View style={[styles.priceEtaBox, { backgroundColor: isDark ? colors.surfaceElevated : '#F9FAFB' }]}>
                <View style={styles.priceCol}>
                  <AppText variant="caption" color={colors.textMuted}>
                    Price at this store
                  </AppText>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 2 }}>
                    <AppText variant="titleLarge" color={colors.primary} weight="800">
                      {formatCurrency(store.price)}
                    </AppText>
                    {store.mrp > store.price && (
                      <AppText variant="caption" color={colors.textMuted} style={styles.strikeMrp}>
                        {formatCurrency(store.mrp)}
                      </AppText>
                    )}
                    <AppText variant="caption" color="#16A34A" weight="700" style={{ marginLeft: 6 }}>
                      {store.discountPercentage}% OFF
                    </AppText>
                  </View>
                </View>

                <View style={styles.etaCol}>
                  <AppText variant="caption" color={colors.textMuted}>
                    Delivery Time
                  </AppText>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Ionicons name="flash-sharp" size={14} color="#EA580C" style={{ marginRight: 4 }} />
                    <AppText variant="titleSmall" color={colors.textPrimary} weight="800">
                      {store.deliveryEtaMins}
                    </AppText>
                  </View>
                </View>
              </View>

              {/* Stock Status & Offer Tag */}
              <View style={styles.statusOfferRow}>
                <View
                  style={[
                    styles.stockStatusPill,
                    { backgroundColor: store.inStock ? '#DCFCE7' : '#FEE2E2' },
                  ]}
                >
                  <Ionicons
                    name={store.inStock ? 'checkmark-circle' : 'alert-circle'}
                    size={12}
                    color={store.inStock ? '#166534' : '#991B1B'}
                  />
                  <AppText
                    variant="caption"
                    color={store.inStock ? '#166534' : '#991B1B'}
                    weight="700"
                    style={{ marginLeft: 4, fontSize: 10 }}
                  >
                    {store.inStock
                      ? store.stockCount && store.stockCount < 5
                        ? `Only ${store.stockCount} left!`
                        : 'In Stock'
                      : 'Out of Stock'}
                  </AppText>
                </View>

                {store.offerText && (
                  <View style={styles.offerPill}>
                    <Ionicons name="pricetag" size={11} color="#EA580C" style={{ marginRight: 4 }} />
                    <AppText variant="caption" color="#EA580C" weight="700" style={{ fontSize: 10 }}>
                      {store.offerText}
                    </AppText>
                  </View>
                )}
              </View>

              {/* Action Buttons Row */}
              <View style={styles.actionBtnRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('PharmacyDetail', {
                      pharmacyId: store.id,
                      pharmacy: {
                        id: store.id,
                        name: store.name,
                        address: { street: store.address, city: 'Mohali', pincode: '160055' },
                        rating: store.rating,
                        reviewCount: store.reviewCount,
                        estimatedDeliveryTimeMinutes: parseInt(store.deliveryEtaMins),
                        distanceKm: store.distanceKm,
                        isVerified: true,
                        logo: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=200&q=80',
                      } as any,
                    })
                  }
                  style={[styles.viewStoreBtn, { borderColor: colors.primary }]}
                >
                  <Ionicons name="storefront-outline" size={16} color={colors.primary} style={{ marginRight: 4 }} />
                  <AppText variant="caption" color={colors.primary} weight="700">
                    View Store
                  </AppText>
                </TouchableOpacity>

                {store.inStock ? (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleBuyFromStore(store)}
                    style={[styles.buyStoreBtn, { backgroundColor: colors.primary }]}
                  >
                    <Ionicons name="cart" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <AppText variant="buttonSmall" color="#FFFFFF" weight="700">
                      Buy from this Store
                    </AppText>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => showToast(`We will notify you when ${store.name} restocks!`, 'info')}
                    style={[styles.buyStoreBtn, { backgroundColor: isDark ? colors.surfaceElevated : '#E5E7EB' }]}
                  >
                    <Ionicons name="notifications-outline" size={16} color={colors.textMuted} style={{ marginRight: 6 }} />
                    <AppText variant="buttonSmall" color={colors.textMuted} weight="700">
                      Notify Me
                    </AppText>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleCol: {
    flex: 1,
    marginLeft: 12,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  productBriefCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
  },
  briefImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 12,
  },
  briefInfo: {
    flex: 1,
  },
  sortSection: {
    marginBottom: 16,
  },
  sortScroll: {
    paddingRight: 16,
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  sortChipActive: {},
  storeList: {
    gap: 16,
  },
  storeCard: {
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  recommendedTag: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  storeTitleCol: {
    flex: 1,
    paddingRight: 8,
  },
  ratingCapsule: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceEtaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  priceCol: {
    flex: 1,
  },
  etaCol: {
    alignItems: 'flex-end',
  },
  strikeMrp: {
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  statusOfferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 8,
  },
  stockStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  offerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  viewStoreBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyStoreBtn: {
    flex: 1.4,
    height: 42,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

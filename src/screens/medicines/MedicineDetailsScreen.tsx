// Force Metro cache refresh: 23:00 - Interactive Brand UI & Connected Discovery Flow
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { RxBadge } from '../../components/badges/RxBadge';
import { QuantitySelector } from '../../components/controls/QuantitySelector';
import { LoadingState } from '../../components/feedback/LoadingState';
import { BottomSheet } from '../../components/modals/BottomSheet';
import { VariantSelectionModal } from '../../components/modals/VariantSelectionModal';
import { MedicineCard } from '../../components/cards/MedicineCard';
import { Ionicons } from '@expo/vector-icons';
import { MedicineService } from '../../services/medicineService';
import { Medicine } from '../../types/medicine';
import { useCart } from '../../store/CartContext';
import { useToast } from '../../store/ToastContext';
import { useAppTheme } from '../../store/ThemeContext';
import { formatCurrency } from '../../utils/currency';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NearbyStoreAvailability {
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

const NEARBY_STORES: NearbyStoreAvailability[] = [
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

const extractMedicineSpecs = (med: Medicine) => {
  const nameLower = (med.name || '').toLowerCase();
  const saltLower = (med.saltComposition || '').toLowerCase();
  const packLower = (med.packForm || '').toLowerCase();
  const descLower = (med.description || '').toLowerCase();
  const fullText = `${nameLower} ${saltLower} ${packLower} ${descLower}`;

  // 1. Extract Form / Presentation Type
  let formType: 'tube' | 'syrup' | 'drops' | 'inhaler' | 'capsule' | 'tablet' | 'powder' = 'tablet';
  let formLabel = 'Tablet';
  let formIcon = 'medkit-outline';

  if (fullText.includes('tube') || fullText.includes('ointment') || fullText.includes('gel') || fullText.includes('cream')) {
    formType = 'tube';
    formLabel = fullText.includes('ointment') ? 'Ointment Tube' : fullText.includes('gel') ? 'Gel Tube' : fullText.includes('cream') ? 'Cream Tube' : 'Topical Tube';
    formIcon = 'color-fill-outline';
  } else if (fullText.includes('syrup') || fullText.includes('suspension') || fullText.includes('liquid') || fullText.includes('tonic') || fullText.includes('solution')) {
    formType = 'syrup';
    formLabel = fullText.includes('suspension') ? 'Oral Suspension' : 'Syrup Bottle';
    formIcon = 'water-outline';
  } else if (fullText.includes('drop') || fullText.includes('eye drop') || fullText.includes('ear drop') || fullText.includes('nasal')) {
    formType = 'drops';
    formLabel = 'Dropper Bottle';
    formIcon = 'eyedrop-outline';
  } else if (fullText.includes('inhaler') || fullText.includes('rotacap') || fullText.includes('respules')) {
    formType = 'inhaler';
    formLabel = 'Metered Inhaler';
    formIcon = 'speedometer-outline';
  } else if (fullText.includes('capsule') || fullText.includes('cap')) {
    formType = 'capsule';
    formLabel = 'Capsule';
    formIcon = 'bandage-outline';
  } else if (fullText.includes('sachet') || fullText.includes('powder') || fullText.includes('granules')) {
    formType = 'powder';
    formLabel = 'Powder Sachet';
    formIcon = 'cube-outline';
  }

  // 2. Extract Strength / Dosage Unit (e.g. 650 mg, 500 mg, 15 gm, 30 gm, 100 ml, etc.)
  let dosageValue = '';
  const strengthMatch = (med.saltComposition || med.name).match(/(\d+(?:\.\d+)?\s*(?:mg|mcg|gm|g|ml|%|iu|w\/w|w\/v))/i) ||
                        med.name.match(/(\d+(?:\.\d+)?\s*(?:mg|mcg|gm|g|ml|%|iu))/i);

  if (strengthMatch) {
    dosageValue = strengthMatch[0].trim();
  } else if (formType === 'tube') {
    const gmMatch = packLower.match(/(\d+\s*(?:gm|g))/i);
    dosageValue = gmMatch ? gmMatch[0] : '30 gm';
  } else if (formType === 'syrup') {
    const mlMatch = packLower.match(/(\d+\s*ml)/i);
    dosageValue = mlMatch ? mlMatch[0] : '100 ml';
  } else if (formType === 'drops') {
    const mlMatch = packLower.match(/(\d+\s*ml)/i);
    dosageValue = mlMatch ? mlMatch[0] : '10 ml';
  } else {
    const numMatch = med.name.match(/\b(\d{2,4})\b/);
    dosageValue = numMatch ? `${numMatch[1]} mg` : 'Standard Strength';
  }

  // 3. Extract Brand
  const brandName = med.brandName || med.manufacturer || med.name.split(' ')[0] || 'Verified Brand';

  // 4. Generate dynamic pack variants based on medicine form
  let variants: Array<{ label: string; price: number; unitPrice: string }> = [];
  const basePrice = med.discountPrice || 20;

  if (formType === 'tube') {
    variants = [
      { label: `1 Tube (${dosageValue})`, price: basePrice, unitPrice: `₹${(basePrice / 30).toFixed(2)} / gm` },
      { label: `Pack of 2 Tubes`, price: Math.round(basePrice * 1.85), unitPrice: `₹${((basePrice * 1.85) / 60).toFixed(2)} / gm` },
      { label: `Jumbo Tube (75g)`, price: Math.round(basePrice * 2.2), unitPrice: `₹${((basePrice * 2.2) / 75).toFixed(2)} / gm` },
    ];
  } else if (formType === 'syrup') {
    variants = [
      { label: `1 Bottle (${dosageValue})`, price: basePrice, unitPrice: `₹${(basePrice / 100).toFixed(2)} / ml` },
      { label: `Economy (200ml)`, price: Math.round(basePrice * 1.75), unitPrice: `₹${((basePrice * 1.75) / 200).toFixed(2)} / ml` },
      { label: `Family Pack of 2`, price: Math.round(basePrice * 1.9), unitPrice: `₹${((basePrice * 1.9) / 200).toFixed(2)} / ml` },
    ];
  } else if (formType === 'drops') {
    variants = [
      { label: `1 Dropper Bottle (${dosageValue})`, price: basePrice, unitPrice: `Single Unit` },
      { label: `Twin Pack (2 x ${dosageValue})`, price: Math.round(basePrice * 1.85), unitPrice: `Combo Savings` },
    ];
  } else if (formType === 'capsule') {
    variants = [
      { label: `Strip of 10 Capsules`, price: basePrice, unitPrice: `₹${(basePrice / 10).toFixed(2)} / Cap` },
      { label: `Box of 30 Capsules`, price: Math.round(basePrice * 2.7), unitPrice: `₹${((basePrice * 2.7) / 30).toFixed(2)} / Cap` },
      { label: `Value Pack of 60`, price: Math.round(basePrice * 4.9), unitPrice: `₹${((basePrice * 4.9) / 60).toFixed(2)} / Cap` },
    ];
  } else {
    // Standard Tablets
    variants = [
      { label: `Strip of 15 Tablets`, price: basePrice, unitPrice: `₹${(basePrice / 15).toFixed(2)} / Tab` },
      { label: `Strip of 30 Tablets`, price: Math.round(basePrice * 1.8), unitPrice: `₹${((basePrice * 1.8) / 30).toFixed(2)} / Tab` },
      { label: `Value Pack of 60`, price: Math.round(basePrice * 3.2), unitPrice: `₹${((basePrice * 3.2) / 60).toFixed(2)} / Tab` },
    ];
  }

  return {
    brandName,
    dosageValue,
    formType,
    formLabel,
    formIcon,
    variants,
  };
};

export const MedicineDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'MedicineDetails'>>();
  const medicineId = route.params?.medicineId || 'med-1';
  const initialMed = route.params?.medicine;

  const [medicine, setMedicine] = useState<Medicine | null>(initialMed || null);
  const [genericAlternatives, setGenericAlternatives] = useState<any[]>([]);
  const [brandProducts, setBrandProducts] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(!initialMed);
  const [selectedPackSize, setSelectedPackSize] = useState('Strip of 15');
  const [activeTab, setActiveTab] = useState<'overview' | 'uses' | 'sideEffects' | 'howToUse' | 'ingredients' | 'safety'>('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPriceCompareSheet, setShowPriceCompareSheet] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showStoresDrawer, setShowStoresDrawer] = useState(false);
  const [storeSortBy, setStoreSortBy] = useState<'recommended' | 'price' | 'eta' | 'distance'>('recommended');
  const [selectedVendorName, setSelectedVendorName] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const { items, totalItemCount, addToCart, removeFromCart, updateQuantity, getItemQuantity, undoRemove } = useCart();
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();

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

  const sortedStores = React.useMemo(() => {
    const list = [...NEARBY_STORES];
    if (storeSortBy === 'price') {
      list.sort((a, b) => a.price - b.price);
    } else if (storeSortBy === 'eta') {
      list.sort((a, b) => parseInt(a.deliveryEtaMins) - parseInt(b.deliveryEtaMins));
    } else if (storeSortBy === 'distance') {
      list.sort((a, b) => a.distanceKm - b.distanceKm);
    } else {
      list.sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0));
    }
    return list;
  }, [storeSortBy]);

  const handleBuyFromStore = (store: NearbyStoreAvailability) => {
    if (!medicine) return;
    const currentVendorId = items.length > 0 ? items[0].sourcePharmacyId : null;
    const currentVendorName = items.length > 0 ? items[0].sourcePharmacyName : null;

    if (currentVendorId && currentVendorId !== store.id) {
      Alert.alert(
        'Switch Store Fulfillment?',
        `Your cart currently contains medicines from ${currentVendorName || 'another store'}.\n\nDo you want to switch to ${store.name}?`,
        [
          {
            text: 'View Cart',
            onPress: () => {
              setShowStoresDrawer(false);
              navigation.navigate('Cart');
            },
            style: 'cancel',
          },
          {
            text: `Switch to ${store.name}`,
            onPress: () => {
              addToCart(medicine, 1, undefined, store.id, store.name);
              setSelectedVendorName(store.name);
              setShowStoresDrawer(false);
              showToast(`Medicine added! Fulfilled by ${store.name}`, 'success');
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      addToCart(medicine, 1, undefined, store.id, store.name);
      setSelectedVendorName(store.name);
      setShowStoresDrawer(false);
      showToast(`Medicine added! Fulfilled by ${store.name}`, 'success');
    }
  };

  const fetchDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await MedicineService.getMedicineById(medicineId);
      if (data) {
        setMedicine(data);
        const alts = await MedicineService.getAlternatives(medicineId);
        setGenericAlternatives(alts);

        // Fetch brand products or category products
        const bQuery = data.brandName || data.manufacturer;
        if (bQuery) {
          const bProds = await MedicineService.getMedicinesByBrand(bQuery);
          const otherBProds = bProds.filter((m) => m.id !== data.id);
          if (otherBProds.length > 0) {
            setBrandProducts(otherBProds);
          } else {
            const catProds = await MedicineService.getMedicinesByCategory(data.categorySlug || 'pain-relief');
            setBrandProducts(catProds.filter((m) => m.id !== data.id).slice(0, 8));
          }
        }
      }
    } catch (e) {
      showToast('Could not load complete medicine data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [medicineId, showToast]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const DEFAULT_SPECS = {
    brandName: 'Cipla',
    dosageValue: '100mg',
    formType: 'tablet',
    formLabel: 'Tablet',
    formIcon: 'bandage-outline',
    variants: [{ label: 'Standard Pack', price: 20, unitPrice: '₹1.5 / Tab' }],
  };
  const specs = medicine ? extractMedicineSpecs(medicine) : DEFAULT_SPECS;
  const currentPackSize = selectedPackSize || specs.variants[0]?.label || 'Standard Pack';

  const navigateToBrandDetail = useCallback(() => {
    if (!medicine) return;
    const bName = specs.brandName || medicine.manufacturer || 'Cipla';
    const bLower = bName.toLowerCase();
    let bId = 'cipla';
    let bBg = '#004B93';
    let bImage = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80';

    if (bLower.includes('sun')) {
      bId = 'sun';
      bBg = '#4A2810';
      bImage = 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&q=80';
    } else if (bLower.includes('abbott')) {
      bId = 'abbott';
      bBg = '#0072CE';
      bImage = 'https://images.unsplash.com/photo-1550572017-edb79a557451?w=300&q=80';
    } else if (bLower.includes('reddy')) {
      bId = 'drreddy';
      bBg = '#4B286D';
      bImage = 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&q=80';
    } else if (bLower.includes('mankind')) {
      bId = 'mankind';
      bBg = '#0A4D9C';
      bImage = 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=300&q=80';
    } else if (bLower.includes('himalaya')) {
      bId = 'himalaya';
      bBg = '#00833E';
      bImage = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&q=80';
    } else if (bLower.includes('gsk')) {
      bId = 'gsk';
      bBg = '#E31B23';
      bImage = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80';
    } else if (bLower.includes('micro') || bLower.includes('dolo')) {
      bId = 'micro';
      bBg = '#2C1D54';
      bImage = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80';
    }

    navigation.navigate('BrandDetail', {
      brandId: bId,
      brandName: bName,
      brandQuery: bName,
      brandBg: bBg,
      brandImage: bImage,
      brandCount: `${Math.max(brandProducts.length + 1, 12)}+ products`,
    });
  }, [medicine, specs.brandName, brandProducts.length, navigation]);

  if (isLoading || !medicine) {
    return <LoadingState fullScreen message="Loading medicine details..." />;
  }

  const cartQuantity = getItemQuantity(medicine.id);
  const isOutOfStock = medicine.inStock === false;
  const hasMultipleVariants = medicine.variants && medicine.variants.length > 1;

  const topOffset = Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, insets.top) + 4 : insets.top + 4;

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* 1. TOP HEADER BAR WITH DYNAMIC SCROLL FADE-IN */}
      <Animated.View
        style={[
          styles.stickyHeaderBar,
          {
            paddingTop: topOffset,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            opacity: headerBgOpacity,
          },
          SHADOWS.subtle,
        ]}
      >
        <Animated.View style={[styles.stickyHeaderCenter, { opacity: headerTitleOpacity }]}>
          <AppText variant="titleMedium" color={colors.textPrimary} weight="700" numberOfLines={1}>
            Details
          </AppText>
        </Animated.View>
      </Animated.View>

      {/* FLOATING ACTION BUTTONS (Always accessible at top safe area) */}
      <View
        style={[
          styles.floatingHeaderRow,
          {
            top: topOffset,
          },
        ]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={[styles.floatingIconButton, { backgroundColor: isDark ? colors.surfaceElevated : '#FFFFFF' }, SHADOWS.subtle]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerActionsRight}>
          <TouchableOpacity
            onPress={() => showToast('Medicine link copied to share', 'info')}
            style={[styles.floatingIconButton, { backgroundColor: isDark ? colors.surfaceElevated : '#FFFFFF' }, SHADOWS.subtle]}
          >
            <Ionicons name="share-social-outline" size={18} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setIsFavorite(!isFavorite);
              showToast(isFavorite ? 'Removed from saved' : 'Added to saved medicines', 'info');
            }}
            style={[
              styles.floatingIconButton,
              { backgroundColor: isDark ? colors.surfaceElevated : '#FFFFFF', marginLeft: 8 },
              SHADOWS.subtle,
            ]}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? '#DC2626' : colors.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Cart')}
            style={[
              styles.floatingIconButton,
              { backgroundColor: isDark ? colors.surfaceElevated : '#FFFFFF', marginLeft: 8 },
              SHADOWS.subtle,
            ]}
          >
            <Ionicons name="cart-outline" size={19} color={colors.textPrimary} />
            {totalItemCount > 0 && (
              <View style={[styles.headerCartBadge, { backgroundColor: colors.primary }]}>
                <AppText style={styles.headerCartBadgeText}>
                  {totalItemCount}
                </AppText>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: topOffset + 46,
          },
        ]}
      >
        {/* 2. PRODUCT HERO IMAGE CONTAINER */}
        <View style={[styles.heroImageContainer, { backgroundColor: isDark ? '#231D38' : '#F5F3FF' }]}>
          {/* Main Product Image rendered first */}
          <Image
            source={{ uri: medicine.image }}
            style={styles.heroProductImg}
            resizeMode="contain"
          />

          {/* Strength / Dosage Badge (Non-clickable) */}
          <View
            style={[styles.manufacturerBadge, { backgroundColor: isDark ? colors.surfaceElevated : '#FFFFFF' }, SHADOWS.subtle]}
          >
            <Ionicons name="shield-checkmark" size={12} color={colors.primary} style={{ marginRight: 4 }} />
            <AppText variant="caption" color={colors.textPrimary} weight="700" style={{ fontSize: 11 }}>
              {specs.dosageValue}
            </AppText>
          </View>

          {/* Discount Pill on top right of photo */}
          {medicine.discountPercentage > 0 && (
            <View style={[styles.photoDiscountBadge, { backgroundColor: '#15803D' }]}>
              <AppText variant="caption" color="#FFFFFF" weight="800" style={{ fontSize: 10 }}>
                {medicine.discountPercentage}% OFF
              </AppText>
            </View>
          )}

          {/* Pagination Indicators */}
          <View style={styles.paginationDotsRow}>
            {[0, 1, 2, 3].map((dotIndex) => (
              <View
                key={dotIndex}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      dotIndex === activeImageIndex
                        ? colors.primary
                        : isDark
                        ? 'rgba(255,255,255,0.3)'
                        : 'rgba(0,0,0,0.15)',
                    width: dotIndex === activeImageIndex ? 18 : 6,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* 3. NEW "AVAILABLE AT STORES" CARD BANNER (CRITICAL FEATURE) */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => setShowStoresDrawer(true)}
          style={[
            styles.availableStoresBanner,
            { backgroundColor: colors.surface, borderColor: colors.primaryBorder },
            SHADOWS.subtle,
          ]}
        >
          <View style={[styles.storeIconCircle, { backgroundColor: colors.primarySubtle }]}>
            <Ionicons name="business" size={22} color={colors.primary} />
          </View>

          <View style={styles.storeBannerTextCol}>
            <AppText variant="titleSmall" color={colors.primary} weight="700" style={{ fontSize: 15 }}>
              Available at 18 nearby stores
            </AppText>
            <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
              Compare price &amp; delivery time
            </AppText>
          </View>

          <View style={[styles.viewStoresBtn, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDFC' }]}>
            <AppText variant="caption" color={colors.primary} weight="700">
              View stores →
            </AppText>
          </View>
        </TouchableOpacity>

        {/* 4. MAIN PRODUCT DETAILS SECTION */}
        <View style={[styles.mainDetailCard, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.card]}>
          {/* Header Row with Title & Rx Tag */}
          <View style={styles.titleRxRow}>
            <View style={styles.titleCol}>
              <AppText variant="titleLarge" color={colors.textPrimary} weight="700" style={{ fontSize: 22 }}>
                {medicine.name}
              </AppText>
              <AppText variant="bodySmall" color={colors.textSecondary} style={{ marginTop: 2 }}>
                {medicine.saltComposition}
              </AppText>
            </View>

            {/* Rx Badge - Only shown when prescription is required, nothing when not required */}
            {medicine.rxRequired && (
              <View style={[styles.rxStatusTag, { backgroundColor: '#FEE2E2' }]}>
                <AppText variant="caption" color="#DC2626" weight="700" style={{ fontSize: 10 }}>
                  Rx Required 📄
                </AppText>
              </View>
            )}
          </View>

          {/* Key Product Metadata & Strength / Unit Highlights Bar */}
          <View style={styles.specsHighlightRow}>
            {/* Brand Card (Interactive — Navigates to Brand products flow) */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={navigateToBrandDetail}
              style={[styles.specHighlightCard, { backgroundColor: isDark ? colors.surfaceElevated : '#F5F3FF', borderColor: colors.primaryBorder }]}
            >
              <View style={[styles.specIconCircle, { backgroundColor: colors.primarySubtle }]}>
                <Ionicons name="business" size={13} color={colors.primary} />
              </View>
              <View style={styles.specTextCol}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <AppText variant="caption" color={colors.textMuted} style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    BRAND
                  </AppText>
                  <Ionicons name="arrow-forward-circle" size={10} color={colors.primary} style={{ marginLeft: 3 }} />
                </View>
                <AppText variant="caption" color={colors.primary} weight="800" numberOfLines={1} style={{ fontSize: 11 }}>
                  {specs.brandName}
                </AppText>
              </View>
            </TouchableOpacity>

            {/* Strength / Dosage Card */}
            <View style={[styles.specHighlightCard, { backgroundColor: isDark ? colors.surfaceElevated : '#ECFDF5', borderColor: '#A7F3D0' }]}>
              <View style={[styles.specIconCircle, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="fitness" size={13} color="#059669" />
              </View>
              <View style={styles.specTextCol}>
                <AppText variant="caption" color="#047857" style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  STRENGTH
                </AppText>
                <AppText variant="caption" color="#065F46" weight="800" numberOfLines={1} style={{ fontSize: 11 }}>
                  {specs.dosageValue}
                </AppText>
              </View>
            </View>

            {/* Form & Unit Card */}
            <View style={[styles.specHighlightCard, { backgroundColor: isDark ? colors.surfaceElevated : '#EFF6FF', borderColor: '#BFDBFE' }]}>
              <View style={[styles.specIconCircle, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name={specs.formIcon as any} size={13} color="#2563EB" />
              </View>
              <View style={styles.specTextCol}>
                <AppText variant="caption" color="#1D4ED8" style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  FORM / UNIT
                </AppText>
                <AppText variant="caption" color="#1E40AF" weight="800" numberOfLines={1} style={{ fontSize: 11 }}>
                  {specs.formLabel}
                </AppText>
              </View>
            </View>
          </View>

          {/* Rating & Feature Highlights Row */}
          <View style={styles.ratingHighlightsRow}>
            <View style={styles.ratingLeftCol}>
              <View style={styles.ratingCapsule}>
                <Ionicons name="star" size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
                <AppText variant="caption" color="#FFFFFF" weight="700">
                  {medicine.rating || 4.6}
                </AppText>
              </View>
              <AppText variant="caption" color={colors.textMuted} style={{ marginLeft: 6 }}>
                | {(medicine.reviewCount || 12458).toLocaleString()} ratings
              </AppText>
            </View>

            {/* Micro Feature Icons Grid */}
            <View style={styles.microFeatureGrid}>
              {[
                { label: 'Fever Relief', icon: 'thermometer-outline' },
                { label: 'Pain Relief', icon: 'body-outline' },
                { label: 'Trusted Brand', icon: 'shield-checkmark-outline' },
                { label: 'Fast Delivery', icon: 'bicycle-outline' },
              ].map((feat, idx) => (
                <View key={idx} style={styles.microFeatureItem}>
                  <View style={[styles.microIconCircle, { backgroundColor: isDark ? colors.surfaceElevated : '#F3F4F6' }]}>
                    <Ionicons name={feat.icon as any} size={15} color={colors.primary} />
                  </View>
                  <AppText variant="caption" color={colors.textSecondary} style={{ fontSize: 9, marginTop: 2, textAlign: 'center' }}>
                    {feat.label}
                  </AppText>
                </View>
              ))}
            </View>
          </View>

          {/* Price & Taxes Section */}
          <View style={styles.priceContainer}>
            <View style={styles.priceRowMain}>
              <AppText variant="titleLarge" color={colors.primary} weight="800" style={{ fontSize: 26 }}>
                {formatCurrency(medicine.discountPrice)}
              </AppText>

              {medicine.mrp > medicine.discountPrice && (
                <AppText variant="bodyMedium" color={colors.textMuted} style={styles.mrpStruck}>
                  {formatCurrency(medicine.mrp)}
                </AppText>
              )}

              {medicine.discountPercentage > 0 && (
                <View style={styles.greenDiscountPill}>
                  <AppText variant="caption" color="#16A34A" weight="800">
                    {medicine.discountPercentage}% OFF
                  </AppText>
                </View>
              )}
            </View>
            <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
              MRP (Inclusive of all taxes)
            </AppText>
          </View>
        </View>

        {/* 5. SELECT PACK SIZE (Dynamic by Form, Stepper Removed) */}
        <View style={[styles.packSelectionCard, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.subtle]}>
          <View style={styles.packHeaderRow}>
            <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
              Select pack size
            </AppText>
            <View style={[styles.packFormPill, { backgroundColor: isDark ? colors.surfaceElevated : '#F5F3FE' }]}>
              <Ionicons name={specs.formIcon as any} size={13} color={colors.primary} style={{ marginRight: 4 }} />
              <AppText variant="caption" color={colors.primary} weight="700" style={{ fontSize: 11 }}>
                {specs.formLabel}
              </AppText>
            </View>
          </View>

          {/* Pack Size Variant Cards (Full Width Scroll, Stepper Removed) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.packScrollContent}
          >
            {specs.variants.map((variant) => {
              const isSelected = currentPackSize === variant.label;
              return (
                <TouchableOpacity
                  key={variant.label}
                  activeOpacity={0.85}
                  onPress={() => setSelectedPackSize(variant.label)}
                  style={[
                    styles.packCardItem,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    isSelected && [
                      styles.packCardSelected,
                      { backgroundColor: isDark ? 'rgba(58, 41, 134, 0.25)' : '#F5F3FE', borderColor: colors.primary },
                    ],
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <AppText
                      variant="caption"
                      color={isSelected ? colors.primary : colors.textPrimary}
                      weight="700"
                      numberOfLines={1}
                    >
                      {variant.label}
                    </AppText>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={14} color={colors.primary} style={{ marginLeft: 6 }} />
                    )}
                  </View>

                  <AppText
                    variant="titleSmall"
                    color={isSelected ? colors.primary : colors.textPrimary}
                    weight="800"
                    style={{ marginTop: 4, fontSize: 15 }}
                  >
                    {formatCurrency(variant.price)}
                  </AppText>
                  <AppText variant="caption" color={colors.textMuted} style={{ fontSize: 10, marginTop: 2 }}>
                    {variant.unitPrice}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 5.5 DEDICATED BRAND STORE BANNER (Connects directly to BrandDetail flow) */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={navigateToBrandDetail}
          style={[
            styles.brandShowcaseCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
            SHADOWS.subtle,
          ]}
        >
          <View style={styles.brandShowcaseLeft}>
            <View style={[styles.brandLogoCircle, { backgroundColor: isDark ? colors.surfaceElevated : '#F0ECFA' }]}>
              <Ionicons name="business" size={20} color={colors.primary} />
            </View>
            <View style={styles.brandInfoCol}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <AppText variant="titleSmall" color={colors.textPrimary} weight="700">
                  {specs.brandName}
                </AppText>
                <Ionicons name="checkmark-circle" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
              </View>
              <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                Explore all medicines & health products by {specs.brandName}
              </AppText>
            </View>
          </View>

          <View style={[styles.viewBrandProductsBtn, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDFC' }]}>
            <AppText variant="caption" color={colors.primary} weight="700">
              View all products →
            </AppText>
          </View>
        </TouchableOpacity>

        {/* 6. DELIVERY ETA CARD */}
        <View style={[styles.etaDeliveryCard, { backgroundColor: isDark ? colors.surfaceElevated : '#FAFAFE', borderColor: colors.border }, SHADOWS.subtle]}>
          <View style={styles.etaLeftIconCircle}>
            <Ionicons name="bicycle-outline" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <AppText variant="bodySmall" color={colors.textPrimary} weight="700">
              Get it by today, 10:30 PM
            </AppText>
            <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
              Express delivery in 15–30 min from verified local store
            </AppText>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('AddressSelection', { isSelectingForCheckout: false })}>
            <AppText variant="caption" color={colors.primary} weight="700">
              Change &gt;
            </AppText>
          </TouchableOpacity>
        </View>

        {/* 7. OFFERS & COUPONS BANNER */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => showToast('Available bank offers: FLAT 15% OFF via UPI', 'info')}
          style={[styles.offersCardBanner, { backgroundColor: isDark ? colors.surfaceElevated : '#ECFDF5', borderColor: '#A7F3D0' }]}
        >
          <View style={styles.offerTagCircle}>
            <Ionicons name="pricetag" size={16} color="#059669" />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppText variant="titleSmall" color="#047857" weight="700">
                Offers &amp; Coupons
              </AppText>
              <View style={styles.offersCountBadge}>
                <AppText variant="caption" color="#047857" weight="800" style={{ fontSize: 9 }}>
                  2 Offers Available
                </AppText>
              </View>
            </View>
            <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
              Save extra with bank offers and coupon discounts
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#047857" />
        </TouchableOpacity>

        {/* 8. HORIZONTAL TABS & DETAILED INFORMATION */}
        <View style={styles.tabsSectionContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabHeadersRow}>
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'uses', label: 'Uses' },
              { key: 'sideEffects', label: 'Side Effects' },
              { key: 'howToUse', label: 'How to Use' },
              { key: 'ingredients', label: 'Ingredients' },
              { key: 'safety', label: 'Safety Advice' },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab(tab.key as any)}
                  style={[styles.tabHeaderBtn, isActive && [styles.tabHeaderBtnActive, { borderBottomColor: colors.primary }]]}
                >
                  <AppText
                    variant="buttonSmall"
                    color={isActive ? colors.primary : colors.textSecondary}
                    weight={isActive ? '700' : '500'}
                  >
                    {tab.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={[styles.tabContentCard, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.subtle]}>
            {activeTab === 'overview' && (
              <View>
                <AppText variant="titleMedium" color={colors.textPrimary} weight="700" style={{ marginBottom: 6 }}>
                  About this product
                </AppText>
                <AppText variant="bodySmall" color={colors.textSecondary} style={{ lineHeight: 22 }}>
                  {medicine.description ||
                    'Dolo 650 Tablet is used to relieve pain and reduce fever. It is commonly used for headache, body ache, toothache, and fever associated with cold and flu.'}
                </AppText>

                <AppText variant="titleSmall" color={colors.textPrimary} weight="700" style={{ marginTop: 16, marginBottom: 6 }}>
                  What is it used for?
                </AppText>
                <View style={styles.usesChipsRow}>
                  {['Fever', 'Headache', 'Body Ache', 'Toothache', 'Cold & Flu'].map((u, i) => (
                    <View key={i} style={[styles.useChipPill, { backgroundColor: isDark ? colors.surfaceElevated : '#F3F4F6' }]}>
                      <Ionicons name="checkmark-circle" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                      <AppText variant="caption" color={colors.textPrimary} weight="600">
                        {u}
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {activeTab === 'uses' && (
              <View>
                <AppText variant="titleMedium" color={colors.textPrimary} weight="700" style={{ marginBottom: 8 }}>
                  Primary Medical Indications
                </AppText>
                {(medicine.uses || ['Fever reduction', 'Mild to moderate pain relief', 'Symptomatic cold relief']).map((use, i) => (
                  <View key={i} style={styles.bulletRowItem}>
                    <View style={[styles.bulletDotItem, { backgroundColor: colors.primary }]} />
                    <AppText variant="bodySmall" color={colors.textSecondary} style={{ flex: 1 }}>
                      {use}
                    </AppText>
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'sideEffects' && (
              <View>
                <AppText variant="titleMedium" color={colors.textPrimary} weight="700" style={{ marginBottom: 8 }}>
                  Reported Side Effects
                </AppText>
                {(medicine.sideEffects || ['Mild nausea', 'Dizziness', 'Headache']).map((effect, i) => (
                  <View key={i} style={styles.bulletRowItem}>
                    <Ionicons name="alert-circle-outline" size={16} color="#EA580C" style={{ marginRight: 6 }} />
                    <AppText variant="bodySmall" color={colors.textSecondary} style={{ flex: 1 }}>
                      {effect}
                    </AppText>
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'howToUse' && (
              <View>
                <AppText variant="titleMedium" color={colors.textPrimary} weight="700" style={{ marginBottom: 8 }}>
                  How to Consume
                </AppText>
                <AppText variant="bodySmall" color={colors.textSecondary} style={{ lineHeight: 22 }}>
                  Take this medicine in the dose and duration as advised by your doctor. Swallow it as a whole with water. Do not chew, crush or break it.
                </AppText>
              </View>
            )}

            {activeTab === 'ingredients' && (
              <View>
                <AppText variant="titleMedium" color={colors.textPrimary} weight="700" style={{ marginBottom: 8 }}>
                  Active Ingredients &amp; Salt
                </AppText>
                <AppText variant="bodySmall" color={colors.textSecondary} style={{ lineHeight: 22 }}>
                  {medicine.saltComposition || 'Paracetamol 650 mg'}
                </AppText>
              </View>
            )}

            {activeTab === 'safety' && (
              <View>
                <AppText variant="titleMedium" color={colors.textPrimary} weight="700" style={{ marginBottom: 8 }}>
                  Safety Warnings &amp; Precautions
                </AppText>
                {[
                  { type: 'ALCOHOL', status: 'Unsafe', advice: 'Avoid consuming alcohol while taking this medication.' },
                  { type: 'PREGNANCY', status: 'Consult Doctor', advice: 'Safe under doctor guidance when necessary.' },
                  { type: 'DRIVING', status: 'Safe', advice: 'Does not affect driving ability under normal dosage.' },
                ].map((p, i) => (
                  <View key={i} style={[styles.safetyAdviceBox, { backgroundColor: isDark ? colors.surfaceElevated : '#F9FAFB' }]}>
                    <AppText variant="caption" color={colors.primary} weight="800">
                      {p.type}: {p.status}
                    </AppText>
                    <AppText variant="bodySmall" color={colors.textSecondary} style={{ marginTop: 2 }}>
                      {p.advice}
                    </AppText>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* 8.5 MORE PRODUCTS FROM THIS BRAND CAROUSEL */}
        {brandProducts.length > 0 && (
          <View style={styles.moreFromBrandSection}>
            <View style={styles.brandSectionHeaderRow}>
              <View>
                <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                  More from {specs.brandName}
                </AppText>
                <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                  Browse other products from {specs.brandName}
                </AppText>
              </View>
              <TouchableOpacity activeOpacity={0.7} onPress={navigateToBrandDetail}>
                <AppText variant="bodySmall" color={colors.primary} weight="700">
                  View all →
                </AppText>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.brandProductsScroll}
            >
              {brandProducts.slice(0, 8).map((item) => (
                <MedicineCard
                  key={item.id}
                  medicine={item}
                  onPress={() => navigation.push('MedicineDetails', { medicineId: item.id, medicine: item })}
                  onAddToCart={() => {
                    addToCart(item, 1);
                    showToast(`Added ${item.name} to cart!`, 'success');
                  }}
                  onIncrement={() => {
                    const q = getItemQuantity(item.id);
                    updateQuantity(item.id, q + 1);
                  }}
                  onDecrement={() => {
                    const q = getItemQuantity(item.id);
                    if (q === 1) {
                      removeFromCart(item.id);
                      showToast(`${item.name} removed from cart`, 'info', 4000, 'Undo', () => undoRemove());
                    } else {
                      updateQuantity(item.id, q - 1);
                    }
                  }}
                  cartQuantity={getItemQuantity(item.id)}
                  style={{ width: 165, marginRight: 12 }}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 110 }} />
      </Animated.ScrollView>

      {/* 9. STICKY BOTTOM ADD TO CART BAR */}
      <View style={[styles.bottomStickyBar, { backgroundColor: colors.surface, borderTopColor: colors.border }, SHADOWS.card]}>
        <View style={styles.bottomPriceCol}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <AppText variant="titleLarge" color={colors.textPrimary} weight="800" style={{ fontSize: 22 }}>
              {formatCurrency(medicine.discountPrice)}
            </AppText>

            {medicine.mrp > medicine.discountPrice && (
              <AppText variant="caption" color={colors.textMuted} style={styles.mrpStruck}>
                {formatCurrency(medicine.mrp)}
              </AppText>
            )}

            {medicine.discountPercentage > 0 && (
              <AppText variant="caption" color="#16A34A" weight="800" style={{ marginLeft: 6 }}>
                {medicine.discountPercentage}% OFF
              </AppText>
            )}
          </View>
          <AppText variant="caption" color={colors.textMuted} style={{ fontSize: 10 }}>
            MRP (Inclusive of all taxes)
          </AppText>
        </View>

        {isOutOfStock ? (
          <AppButton
            title="Notify Me"
            variant="outline"
            onPress={() => showToast('We will notify you when back in stock!', 'info')}
            style={{ width: 170 }}
          />
        ) : cartQuantity > 0 ? (
          <AppButton
            title={`${cartQuantity} in Cart • Go to Cart`}
            variant="primary"
            onPress={() => navigation.navigate('Cart')}
            style={{ width: 200, backgroundColor: colors.primary }}
            leftIcon={<Ionicons name="cart" size={18} color="#FFFFFF" />}
          />
        ) : (
          <AppButton
            title={medicine.rxRequired ? 'Add to Cart (Rx)' : 'Add to Cart'}
            variant="primary"
            onPress={() => {
              const added = addToCart(medicine, 1);
              if (added) {
                showToast(`Added ${medicine.name} to cart!`, 'success');
              } else {
                showToast('Maximum quantity limit (10) reached', 'warning');
              }
            }}
            style={{ width: 170, backgroundColor: colors.primary }}
            leftIcon={<Ionicons name="cart-outline" size={18} color="#FFFFFF" />}
          />
        )}
      </View>

      <VariantSelectionModal
        visible={showVariantModal}
        medicine={medicine}
        onClose={() => setShowVariantModal(false)}
      />

      {/* 10. STORES AVAILABILITY BOTTOM DRAWER (Opens from bottom, no page jump) */}
      <Modal
        visible={showStoresDrawer}
        animationType="slide"
        transparent
        onRequestClose={() => setShowStoresDrawer(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowStoresDrawer(false)}>
          <View style={styles.drawerOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.drawerSheet, { backgroundColor: colors.surface }, SHADOWS.modal]}>
                {/* Drag Handle */}
                <View style={styles.drawerHandleBar}>
                  <View style={[styles.drawerHandle, { backgroundColor: isDark ? colors.border : '#D1D5DB' }]} />
                </View>

                {/* Drawer Header */}
                <View style={styles.drawerHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="storefront" size={20} color={colors.primary} style={{ marginRight: 6 }} />
                      <AppText variant="titleMedium" color={colors.textPrimary} weight="700" style={{ fontSize: 18 }}>
                        Available at Stores
                      </AppText>
                    </View>
                    <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                      {sortedStores.filter((s) => s.inStock).length} nearby pharmacies have this in stock
                    </AppText>
                  </View>

                  <TouchableOpacity
                    onPress={() => setShowStoresDrawer(false)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={[styles.drawerCloseBtn, { backgroundColor: isDark ? colors.surfaceElevated : '#F3F4F6' }]}
                  >
                    <Ionicons name="close" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Filter Chips */}
                <View style={styles.drawerFilterRow}>
                  {[
                    { id: 'recommended', label: 'Recommended ⭐' },
                    { id: 'price', label: 'Lowest Price 🏷️' },
                    { id: 'eta', label: 'Fastest Delivery ⚡' },
                    { id: 'distance', label: 'Nearest 📍' },
                  ].map((filter) => {
                    const isSelected = storeSortBy === filter.id;
                    return (
                      <TouchableOpacity
                        key={filter.id}
                        activeOpacity={0.8}
                        onPress={() => setStoreSortBy(filter.id as any)}
                        style={[
                          styles.drawerFilterChip,
                          { backgroundColor: isDark ? colors.surfaceElevated : '#F3F4F6', borderColor: colors.border },
                          isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                        ]}
                      >
                        <AppText
                          variant="caption"
                          color={isSelected ? '#FFFFFF' : colors.textPrimary}
                          weight="700"
                        >
                          {filter.label}
                        </AppText>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Stores Scroll List */}
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.drawerStoresList}
                >
                  {sortedStores.map((store) => (
                    <View
                      key={store.id}
                      style={[
                        styles.drawerStoreCard,
                        {
                          backgroundColor: isDark ? colors.surfaceElevated : '#FAFAFE',
                          borderColor: store.isRecommended ? colors.primary : colors.border,
                        },
                        SHADOWS.subtle,
                      ]}
                    >
                      {/* Top Row: Store Name & Rating */}
                      <View style={styles.drawerStoreTopRow}>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <AppText variant="titleSmall" color={colors.textPrimary} weight="700" numberOfLines={1} style={{ flex: 1 }}>
                              {store.name}
                            </AppText>
                            {store.isRecommended && (
                              <View style={[styles.drawerRecBadge, { backgroundColor: colors.primary }]}>
                                <AppText variant="caption" color="#FFFFFF" weight="800" style={{ fontSize: 8 }}>
                                  TOP PICK
                                </AppText>
                              </View>
                            )}
                          </View>
                          <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                            📍 {store.distanceKm} km away • {store.address}
                          </AppText>
                        </View>

                        <View style={styles.drawerRatingCapsule}>
                          <Ionicons name="star" size={11} color="#15803D" style={{ marginRight: 2 }} />
                          <AppText variant="caption" color="#15803D" weight="800">
                            {store.rating}
                          </AppText>
                        </View>
                      </View>

                      {/* Middle Row: Price, ETA & Stock */}
                      <View style={[styles.drawerStoreMetaBox, { backgroundColor: colors.surface }]}>
                        <View>
                          <AppText variant="caption" color={colors.textMuted} style={{ fontSize: 10 }}>
                            Store Price
                          </AppText>
                          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 1 }}>
                            <AppText variant="titleMedium" color={colors.primary} weight="800">
                              {formatCurrency(store.price)}
                            </AppText>
                            {store.mrp > store.price && (
                              <AppText variant="caption" color={colors.textMuted} style={styles.mrpStruck}>
                                {formatCurrency(store.mrp)}
                              </AppText>
                            )}
                            <AppText variant="caption" color="#16A34A" weight="700" style={{ marginLeft: 4, fontSize: 11 }}>
                              {store.discountPercentage}% OFF
                            </AppText>
                          </View>
                        </View>

                        <View style={{ alignItems: 'flex-end' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="flash" size={12} color="#EA580C" style={{ marginRight: 3 }} />
                            <AppText variant="caption" color={colors.textPrimary} weight="800">
                              {store.deliveryEtaMins}
                            </AppText>
                          </View>
                          <View
                            style={[
                              styles.drawerStockTag,
                              { backgroundColor: store.inStock ? '#DCFCE7' : '#FEE2E2', marginTop: 2 },
                            ]}
                          >
                            <AppText
                              variant="caption"
                              color={store.inStock ? '#166534' : '#991B1B'}
                              weight="700"
                              style={{ fontSize: 9 }}
                            >
                              {store.inStock
                                ? store.stockCount && store.stockCount < 5
                                  ? `Only ${store.stockCount} left`
                                  : 'In Stock'
                                : 'Out of Stock'}
                            </AppText>
                          </View>
                        </View>
                      </View>

                      {/* Action Buttons */}
                      <View style={styles.drawerActionRow}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => {
                            setShowStoresDrawer(false);
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
                            });
                          }}
                          style={[styles.drawerOutlineBtn, { borderColor: colors.primary }]}
                        >
                          <Ionicons name="storefront-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                          <AppText variant="caption" color={colors.primary} weight="700">
                            View Store
                          </AppText>
                        </TouchableOpacity>

                        {store.inStock ? (
                          <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => handleBuyFromStore(store)}
                            style={[styles.drawerPrimaryBtn, { backgroundColor: colors.primary }]}
                          >
                            <Ionicons name="cart" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                            <AppText variant="caption" color="#FFFFFF" weight="700">
                              Buy from this Store
                            </AppText>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => {
                              showToast(`We will notify you when ${store.name} restocks!`, 'info');
                            }}
                            style={[styles.drawerPrimaryBtn, { backgroundColor: isDark ? colors.border : '#E5E7EB' }]}
                          >
                            <AppText variant="caption" color={colors.textMuted} weight="700">
                              Notify Me
                            </AppText>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    paddingHorizontal: 80,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  headerActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  headerCartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'LexendDeca_700Bold',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroImageContainer: {
    height: 250,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  manufacturerBadge: {
    position: 'absolute',
    top: 14,
    left: 16,
    zIndex: 10,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  photoDiscountBadge: {
    position: 'absolute',
    top: 14,
    right: 16,
    zIndex: 10,
    elevation: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroProductImg: {
    width: '92%',
    height: '84%',
  },
  paginationDotsRow: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  availableStoresBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 14,
  },
  storeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeBannerTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  viewStoresBtn: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  mainDetailCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
  },
  titleRxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleCol: {
    flex: 1,
    paddingRight: 10,
  },
  rxStatusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingHighlightsRow: {
    marginTop: 14,
  },
  ratingLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  microFeatureGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  microFeatureItem: {
    alignItems: 'center',
    width: (SCREEN_WIDTH - 64) / 4,
  },
  microIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  priceRowMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  mrpStruck: {
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  greenDiscountPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 10,
  },
  specsHighlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  brandShowcaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  brandShowcaseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  brandLogoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandInfoCol: {
    marginLeft: 12,
    flex: 1,
  },
  viewBrandProductsBtn: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  moreFromBrandSection: {
    marginTop: 18,
    marginBottom: 8,
  },
  brandSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  brandProductsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  specHighlightCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  specIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  specTextCol: {
    flex: 1,
  },
  packSelectionCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
  },
  packHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  packFormPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  packScrollContent: {
    gap: 10,
    paddingRight: 10,
  },
  packCardItem: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 120,
  },
  packCardSelected: {
    borderColor: '#3A2986',
  },
  etaDeliveryCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  etaLeftIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offersCardBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerTagCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offersCountBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  tabsSectionContainer: {
    marginTop: 20,
  },
  tabHeadersRow: {
    paddingHorizontal: 16,
    gap: 16,
  },
  tabHeaderBtn: {
    paddingVertical: 8,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabHeaderBtnActive: {},
  tabContentCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
  },
  usesChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  useChipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bulletRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  bulletDotItem: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  safetyAdviceBox: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  bottomStickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  bottomPriceCol: {
    flex: 1,
  },
  // Drawer Styles
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  drawerSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 32,
    maxHeight: SCREEN_HEIGHT * 0.78,
  },
  drawerHandleBar: {
    alignItems: 'center',
    marginBottom: 8,
  },
  drawerHandle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
  },
  drawerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  drawerCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerFilterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 10,
    flexWrap: 'wrap',
  },
  drawerFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
  },
  drawerStoresList: {
    paddingTop: 8,
    paddingBottom: 20,
    gap: 12,
  },
  drawerStoreCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
  },
  drawerStoreTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  drawerRecBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  drawerRatingCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  drawerStoreMetaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  drawerStockTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  drawerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  drawerOutlineBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerPrimaryBtn: {
    flex: 1.4,
    height: 38,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

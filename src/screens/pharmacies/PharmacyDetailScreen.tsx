import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StatusBar,
  Platform,
  Dimensions,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { AppStackParamList } from '../../types/navigation';
import { AppText } from '../../components/common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { PharmacyService } from '../../services/pharmacyService';
import { Pharmacy } from '../../types/pharmacy';
import { useCart } from '../../store/CartContext';
import { useToast } from '../../store/ToastContext';
import { useAppTheme } from '../../store/ThemeContext';
import { VariantSelectionModal } from '../../components/modals/VariantSelectionModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Sidebar Category Type ────────────────────────────────────────────────────
interface SidebarCategory {
  id: string;
  label: string;
  icon: string;
  emoji?: string;
}

const SIDEBAR_CATEGORIES: SidebarCategory[] = [
  { id: 'pain',      label: 'Pain Relief',   icon: 'medkit-outline',     emoji: '💊' },
  { id: 'cold',      label: 'Cold & Cough',  icon: 'thermometer-outline',emoji: '🧪' },
  { id: 'vitamins',  label: 'Vitamins',      icon: 'sunny-outline',      emoji: '💛' },
  { id: 'diabetes',  label: 'Diabetes Care', icon: 'water-outline',      emoji: '🩺' },
  { id: 'baby',      label: 'Baby Care',     icon: 'happy-outline',      emoji: '👶' },
  { id: 'skin',      label: 'Skin Care',     icon: 'sparkles-outline',   emoji: '🧴' },
  { id: 'firstaid',  label: 'First Aid',     icon: 'fitness-outline',    emoji: '🩹' },
  { id: 'all',       label: 'View All',      icon: 'grid-outline',       emoji: '🔲' },
];

// ── Product Item Type ────────────────────────────────────────────────────────
interface CustomProduct {
  id: string;
  name: string;
  packSize: string;
  usage: string;
  price: number;
  mrp: number;
  discountBadge?: string;
  savingsText: string;
  image: string;
  categoryId: string;
  brand: string;
  rxRequired?: boolean;
}

const SAMPLE_PRODUCTS: CustomProduct[] = [
  {
    id: 'p-1',
    name: 'Crocin 650',
    packSize: '15 Tablets',
    usage: 'Pain relief • Fever reducer',
    price: 32,
    mrp: 40,
    discountBadge: '20% OFF',
    savingsText: 'You save ₹8',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
    categoryId: 'pain',
    brand: 'Crocin',
  },
  {
    id: 'p-2',
    name: 'Dolo 650',
    packSize: '15 Tablets',
    usage: 'Pain relief • Fever reducer',
    price: 28,
    mrp: 33,
    discountBadge: '15% OFF',
    savingsText: 'You save ₹5',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&q=80',
    categoryId: 'pain',
    brand: 'Dolo',
  },
  {
    id: 'p-3',
    name: 'Vicks VapoRub',
    packSize: '50ml',
    usage: 'Relieves 6 cough & cold symptoms',
    price: 120,
    mrp: 150,
    discountBadge: '20% OFF',
    savingsText: 'You save ₹30',
    image: 'https://images.unsplash.com/photo-1550572017-edb79a557451?w=400&q=80',
    categoryId: 'cold',
    brand: 'Vicks',
  },
  {
    id: 'p-4',
    name: 'ORS Hydration',
    packSize: '1 Packet',
    usage: 'Restores fluids & electrolytes',
    price: 20,
    mrp: 25,
    discountBadge: '20% OFF',
    savingsText: 'You save ₹5',
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&q=80',
    categoryId: 'diabetes',
    brand: 'ORS',
  },
  {
    id: 'p-5',
    name: 'Cetirizine 10mg',
    packSize: '10 Tablets',
    usage: 'Allergy relief',
    price: 12,
    mrp: 15,
    discountBadge: '20% OFF',
    savingsText: 'You save ₹3',
    image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&q=80',
    categoryId: 'cold',
    brand: 'Cipla',
  },
  {
    id: 'p-6',
    name: 'Himalaya Liv.52 DS',
    packSize: '60 Tablets',
    usage: 'Supports liver health',
    price: 180,
    mrp: 225,
    discountBadge: '20% OFF',
    savingsText: 'You save ₹45',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&q=80',
    categoryId: 'vitamins',
    brand: 'Himalaya',
  },
];

const SIDEBAR_WIDTH = 92;
const RIGHT_CONTENT_WIDTH = SCREEN_WIDTH - SIDEBAR_WIDTH;
const PRODUCT_CARD_WIDTH = (RIGHT_CONTENT_WIDTH - 24) / 2;

type FilterModalType = 'filters' | 'sort' | 'price' | 'brands' | null;

export const PharmacyDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'PharmacyDetail'>>();
  const pharmacyId = route.params?.pharmacyId || 'pharm-1';
  const initialPharm = route.params?.pharmacy;

  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(initialPharm || null);
  const [selectedCategory, setSelectedCategory] = useState<string>('pain');
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [variantMed, setVariantMed] = useState<any | null>(null);

  // Filter & Sort States
  const [activeModal, setActiveModal] = useState<FilterModalType>(null);
  const [selectedSort, setSelectedSort] = useState<string>('relevance');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('all');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<string>('all');

  const { totalItemCount, cartItems, addToCart, getItemQuantity } = useCart();
  const { showToast } = useToast();
  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Header background opacity on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    PharmacyService.getPharmacyById(pharmacyId).then((res) => {
      if (res) setPharmacy(res);
      setIsLoading(false);
    });
  }, [pharmacyId]);

  if (isLoading || !pharmacy) {
    return (
      <View style={[S.loaderContainer, { backgroundColor: '#0B082B' }]}>
        <ActivityIndicator size="large" color="#8B74E6" />
        <AppText variant="bodyMedium" color="rgba(255,255,255,0.7)" style={{ marginTop: 12 }}>
          Loading Apollo Pharmacy...
        </AppText>
      </View>
    );
  }

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = (product: CustomProduct) => {
    const medObj: any = {
      id: product.id,
      name: product.name,
      mrp: product.mrp,
      discountPrice: product.price,
      discountPercentage: 20,
      image: product.image,
      packForm: product.packSize,
      category: product.usage,
      rxRequired: false,
    };
    addToCart(medObj, 1, undefined, pharmacy.id, pharmacy.name);
    showToast(`${product.name} added to cart`, 'success');
  };

  // Filter & Sort Logic
  let displayedProducts = SAMPLE_PRODUCTS.filter(
    (p) => selectedCategory === 'all' || p.categoryId === selectedCategory
  );

  if (selectedBrandFilter !== 'all') {
    displayedProducts = displayedProducts.filter(
      (p) => p.brand.toLowerCase() === selectedBrandFilter.toLowerCase()
    );
  }

  if (selectedPriceFilter === 'under50') {
    displayedProducts = displayedProducts.filter((p) => p.price <= 50);
  } else if (selectedPriceFilter === '50to150') {
    displayedProducts = displayedProducts.filter((p) => p.price > 50 && p.price <= 150);
  } else if (selectedPriceFilter === 'above150') {
    displayedProducts = displayedProducts.filter((p) => p.price > 150);
  }

  if (selectedSort === 'price_asc') {
    displayedProducts.sort((a, b) => a.price - b.price);
  } else if (selectedSort === 'price_desc') {
    displayedProducts.sort((a, b) => b.price - a.price);
  } else if (selectedSort === 'discount') {
    displayedProducts.sort((a, b) => (b.mrp - b.price) - (a.mrp - a.price));
  }

  // Cart total calculations
  const totalCartItemsCount = totalItemCount > 0 ? totalItemCount : 2;
  const cartTotalPrice = totalItemCount > 0 
    ? cartItems.reduce((sum, item) => sum + item.medicine.discountPrice * item.quantity, 0)
    : 152;
  const cartTotalSaved = 48;

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ══════════════════════════════════════════════════════════════════════
          STICKY HEADER BAR
         ══════════════════════════════════════════════════════════════════════ */}
      <Animated.View
        style={[
          S.stickyHeader,
          {
            paddingTop: insets.top + (Platform.OS === 'android' ? 6 : 2),
            opacity: headerOpacity,
            backgroundColor: '#0B082B',
          },
        ]}
      >
        <View style={S.stickyHeaderCenter}>
          <AppText variant="titleSmall" color="#FFFFFF" weight="700" numberOfLines={1}>
            Apollo Pharmacy
          </AppText>
          <AppText variant="caption" color="rgba(255,255,255,0.7)" style={{ fontSize: 10 }}>
            ★ 4.6 | Verified Store
          </AppText>
        </View>
      </Animated.View>

      {/* ══════════════════════════════════════════════════════════════════════
          FLOATING ACTION BUTTONS
         ══════════════════════════════════════════════════════════════════════ */}
      <View
        style={[S.floatingHeaderRow, { top: insets.top + (Platform.OS === 'android' ? 8 : 4) }]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={S.headerCircleBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={S.headerRightGroup}>
          <TouchableOpacity style={S.headerCircleBtn}>
            <Ionicons name="search-outline" size={19} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={[S.headerCircleBtn, { marginLeft: 8 }]}>
            <Ionicons name="heart-outline" size={19} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={[S.headerCircleBtn, { marginLeft: 8 }]}>
            <Ionicons name="ellipsis-vertical" size={19} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN SCROLL CONTENT
         ══════════════════════════════════════════════════════════════════════ */}
      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* ──────────────────────────────────────────────────────────────────
            1. STORE PROFILE HEADER (Dark Navy Background)
           ────────────────────────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#070420', '#0B082B', '#110C3D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[S.storeHero, { paddingTop: insets.top + 60 }]}
        >
          {/* Logo + Store Title */}
          <View style={S.storeMainRow}>
            <View style={S.logoContainer}>
              <View style={S.logoBox}>
                <Image
                  source={{ uri: pharmacy.logo || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80' }}
                  style={S.logoImage}
                  resizeMode="contain"
                />
              </View>
              <View style={S.openStatusBadge}>
                <View style={S.openDot} />
                <AppText style={S.openStatusText}>Open</AppText>
              </View>
            </View>

            <View style={S.storeDetailsCol}>
              <View style={S.storeTitleRow}>
                <AppText style={S.storeTitle}>Apollo Pharmacy</AppText>
                <View style={S.verifiedIconCircle}>
                  <Ionicons name="checkmark" size={11} color="#0B082B" />
                </View>
              </View>

              <View style={S.ratingBadgeRow}>
                <Ionicons name="star" size={13} color="#10B981" />
                <AppText style={S.ratingScoreText}>4.6</AppText>
                <AppText style={S.ratingDividerText}>|</AppText>
                <AppText style={S.ratingCountText}>2.3K+ Ratings</AppText>
              </View>
            </View>
          </View>

          {/* Info Grid (3 Columns) */}
          <View style={S.infoGridRow}>
            <View style={S.infoCol}>
              <View style={[S.infoIconBox, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                <Ionicons name="location-sharp" size={15} color="#A78BFA" />
              </View>
              <View style={S.infoTextWrap}>
                <AppText style={S.infoValText}>1.2 km away</AppText>
                <AppText style={S.infoSubText}>from your location</AppText>
              </View>
            </View>

            <View style={S.infoCol}>
              <View style={[S.infoIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                <Ionicons name="stopwatch-outline" size={15} color="#60A5FA" />
              </View>
              <View style={S.infoTextWrap}>
                <AppText style={S.infoValText}>20–25 mins</AppText>
                <AppText style={S.infoSubText}>delivery time</AppText>
              </View>
            </View>

            <View style={S.infoCol}>
              <View style={[S.infoIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                <Ionicons name="bag-handle-outline" size={15} color="#34D399" />
              </View>
              <View style={S.infoTextWrap}>
                <AppText style={S.infoValText}>8/8 medicines</AppText>
                <AppText style={S.infoSubText}>available</AppText>
              </View>
            </View>
          </View>

          {/* Offers Strip (2 Cards Side by Side) */}
          <View style={S.offersStripRow}>
            <View style={S.offerCard}>
              <View style={[S.offerIconCircle, { backgroundColor: '#4C1D95' }]}>
                <Ionicons name="bicycle" size={16} color="#C4B5FD" />
              </View>
              <View style={S.offerCardTextCol}>
                <AppText style={S.offerCardTitle}>FREE delivery above ₹299</AppText>
                <AppText style={S.offerCardSub}>No delivery charges</AppText>
              </View>
            </View>

            <View style={S.offerCard}>
              <View style={[S.offerIconCircle, { backgroundColor: '#831843' }]}>
                <Ionicons name="pricetag" size={15} color="#F472B6" />
              </View>
              <View style={S.offerCardTextCol}>
                <AppText style={S.offerCardTitle}>15% OFF on medicines</AppText>
                <AppText style={S.offerCardCodeText}>
                  Use code: <AppText style={{ color: '#10B981', fontWeight: '700' }}>APOLLO20</AppText>
                </AppText>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ──────────────────────────────────────────────────────────────────
            2. MINT PROMO CARD ("UP TO 20% OFF")
           ────────────────────────────────────────────────────────────────── */}
        <View style={S.promoContainer}>
          <LinearGradient
            colors={['#F0FDF4', '#E6F4EA', '#F5F9F6']}
            style={S.promoCard}
          >
            <View style={S.promoPercentBadge}>
              <AppText style={S.promoPercentIcon}>%</AppText>
            </View>

            <View style={{ flex: 1, paddingRight: 10 }}>
              <AppText style={S.promoSubLabel}>Save extra on medicines</AppText>
              <AppText style={S.promoMainTitle}>UP TO 20% OFF</AppText>

              <View style={S.couponPill}>
                <AppText style={S.couponPillText}>
                  Use code: <AppText style={{ fontWeight: '700', color: '#047857' }}>APOLLO20</AppText>
                </AppText>
              </View>

              <TouchableOpacity style={S.orderNowBtn} activeOpacity={0.85}>
                <AppText style={S.orderNowText}>Order Now</AppText>
                <Ionicons name="arrow-forward" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>

            <View style={S.promoImageWrap}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80' }}
                style={S.promoMedicineImage}
                resizeMode="contain"
              />
            </View>
          </LinearGradient>
        </View>

        {/* ──────────────────────────────────────────────────────────────────
            2.5. UPLOAD PRESCRIPTION BANNER CARD
           ────────────────────────────────────────────────────────────────── */}
        <View style={S.uploadPrescriptionContainer}>
          <TouchableOpacity
            style={S.uploadPrescriptionCard}
            onPress={() => navigation.navigate('PrescriptionUpload' as any)}
            activeOpacity={0.88}
          >
            <View style={S.rxBannerLeft}>
              <View style={S.rxIconBox}>
                <Ionicons name="document-text-outline" size={20} color="#3A2986" />
              </View>
              <View style={S.rxTextCol}>
                <AppText style={S.rxTitleText}>Upload Prescription</AppText>
                <AppText style={S.rxSubText}>Get accurate medicine suggestions</AppText>
              </View>
            </View>

            <View style={S.rxUploadBtn}>
              <Ionicons name="cloud-upload-outline" size={15} color="#3A2986" style={{ marginRight: 5 }} />
              <AppText style={S.rxUploadBtnText}>Upload</AppText>
            </View>
          </TouchableOpacity>
        </View>

        {/* ──────────────────────────────────────────────────────────────────
            3. MAIN PRODUCTS SECTION: SIDEBAR + PRODUCT GRID
           ────────────────────────────────────────────────────────────────── */}
        <View style={S.mainBodyRow}>
          {/* LEFT SIDEBAR NAVIGATION */}
          <View style={S.sidebarCol}>
            {SIDEBAR_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={[
                    S.sidebarTabItem,
                    isSelected && S.sidebarTabItemActive,
                  ]}
                  activeOpacity={0.85}
                >
                  {isSelected && <View style={S.sidebarActiveIndicator} />}

                  <View style={[S.sidebarIconBox, isSelected && S.sidebarIconBoxActive]}>
                    <AppText style={{ fontSize: 16 }}>{cat.emoji || '💊'}</AppText>
                  </View>

                  <AppText
                    style={[
                      S.sidebarTabLabel,
                      isSelected && S.sidebarTabLabelActive,
                    ]}
                    numberOfLines={2}
                  >
                    {cat.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* RIGHT CONTENT AREA */}
          <View style={S.rightContentCol}>
            {/* Filter & Sort Bar (Clean, Stable Horizontal Pill Row) */}
            <View style={S.filterBarRow}>
              <TouchableOpacity
                style={[S.filterPillBtn, activeModal === 'filters' && S.filterPillBtnActive]}
                onPress={() => setActiveModal('filters')}
                activeOpacity={0.75}
              >
                <Ionicons name="options-outline" size={14} color={activeModal === 'filters' ? '#3A2986' : '#374151'} style={{ marginRight: 4 }} />
                <AppText style={[S.filterPillText, activeModal === 'filters' && S.filterPillTextActive]}>Filters</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[S.filterPillBtn, (activeModal === 'sort' || selectedSort !== 'relevance') && S.filterPillBtnActive]}
                onPress={() => setActiveModal('sort')}
                activeOpacity={0.75}
              >
                <Ionicons name="swap-vertical-outline" size={14} color={(activeModal === 'sort' || selectedSort !== 'relevance') ? '#3A2986' : '#374151'} style={{ marginRight: 4 }} />
                <AppText style={[S.filterPillText, (activeModal === 'sort' || selectedSort !== 'relevance') && S.filterPillTextActive]}>Sort</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[S.filterPillBtn, (activeModal === 'price' || selectedPriceFilter !== 'all') && S.filterPillBtnActive]}
                onPress={() => setActiveModal('price')}
                activeOpacity={0.75}
              >
                <AppText style={[S.filterPillText, (activeModal === 'price' || selectedPriceFilter !== 'all') && S.filterPillTextActive]}>Price</AppText>
                <Ionicons name="chevron-down" size={12} color={(activeModal === 'price' || selectedPriceFilter !== 'all') ? '#3A2986' : '#6B7280'} style={{ marginLeft: 3 }} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[S.filterPillBtn, (activeModal === 'brands' || selectedBrandFilter !== 'all') && S.filterPillBtnActive]}
                onPress={() => setActiveModal('brands')}
                activeOpacity={0.75}
              >
                <AppText style={[S.filterPillText, (activeModal === 'brands' || selectedBrandFilter !== 'all') && S.filterPillTextActive]}>Brands</AppText>
                <Ionicons name="chevron-down" size={12} color={(activeModal === 'brands' || selectedBrandFilter !== 'all') ? '#3A2986' : '#6B7280'} style={{ marginLeft: 3 }} />
              </TouchableOpacity>
            </View>

            {/* Product Cards Grid (2 Columns) */}
            <View style={S.productGrid}>
              {displayedProducts.map((product) => {
                const isFav = !!wishlist[product.id];

                return (
                  <View key={product.id} style={S.productCard}>
                    {/* Top Row: Discount Badge & Wishlist Heart */}
                    <View style={S.cardTopHeaderRow}>
                      {product.discountBadge ? (
                        <View style={S.discountBadge}>
                          <AppText style={S.discountBadgeText}>{product.discountBadge}</AppText>
                        </View>
                      ) : <View />}

                      <TouchableOpacity
                        onPress={() => toggleWishlist(product.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name={isFav ? 'heart' : 'heart-outline'}
                          size={18}
                          color={isFav ? '#EF4444' : '#9CA3AF'}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Product Image & Veg Symbol Overlay */}
                    <View style={S.cardImageWrapper}>
                      <Image
                        source={{ uri: product.image }}
                        style={S.productImage}
                        resizeMode="contain"
                      />
                      <View style={S.vegSymbolBox}>
                        <View style={S.vegSymbolDot} />
                      </View>
                    </View>

                    {/* Product Info */}
                    <AppText style={S.productTitle} numberOfLines={1}>
                      {product.name}
                    </AppText>

                    <AppText style={S.productPackSize} numberOfLines={1}>
                      {product.packSize}
                    </AppText>

                    <AppText style={S.productUsage} numberOfLines={1}>
                      {product.usage}
                    </AppText>

                    {/* Pricing & Add Button Footer */}
                    <View style={S.cardFooterRow}>
                      <View style={S.priceBlock}>
                        <View style={S.priceInlineRow}>
                          <AppText style={S.sellingPrice}>₹{product.price}</AppText>
                          <AppText style={S.mrpPrice}>₹{product.mrp}</AppText>
                        </View>
                        <AppText style={S.savingsText}>{product.savingsText}</AppText>
                      </View>

                      {/* Add Button */}
                      <TouchableOpacity
                        style={S.addPillBtn}
                        onPress={() => handleAddToCart(product)}
                        activeOpacity={0.85}
                      >
                        <AppText style={S.addPillBtnText}>+ Add</AppText>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* ══════════════════════════════════════════════════════════════════════
          4. STICKY BOTTOM FLOATING CART BAR
         ══════════════════════════════════════════════════════════════════════ */}
      <View style={S.floatingCartBar}>
        <View style={S.cartLeftSection}>
          <View style={S.cartIconWrap}>
            <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
            <View style={S.cartBadgeCircle}>
              <AppText style={S.cartBadgeText}>{totalCartItemsCount}</AppText>
            </View>
          </View>

          <View style={S.cartTextCol}>
            <AppText style={S.cartItemsPriceText}>
              {totalCartItemsCount} Items  |  ₹{cartTotalPrice}
            </AppText>
            <AppText style={S.cartSavingsText}>
              You saved ₹{cartTotalSaved}
            </AppText>
          </View>
        </View>

        <TouchableOpacity
          style={S.viewCartBtn}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.88}
        >
          <AppText style={S.viewCartBtnText}>View Cart</AppText>
          <Ionicons name="arrow-forward" size={15} color="#3A2986" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      {/* ══════════════════════════════════════════════════════════════════════
          5. FILTER & SORT BOTTOM MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={activeModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <TouchableOpacity
          style={S.modalOverlay}
          activeOpacity={1}
          onPress={() => setActiveModal(null)}
        >
          <View style={S.modalSheetContainer}>
            <View style={S.modalHeaderRow}>
              <AppText style={S.modalTitleText}>
                {activeModal === 'sort' && 'Sort Medicines'}
                {activeModal === 'price' && 'Filter by Price'}
                {activeModal === 'brands' && 'Filter by Brand'}
                {activeModal === 'filters' && 'All Filters'}
              </AppText>

              <TouchableOpacity onPress={() => setActiveModal(null)} style={S.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* SORT OPTIONS */}
            {activeModal === 'sort' && (
              <View style={S.modalOptionsCol}>
                {[
                  { id: 'relevance', label: 'Relevance' },
                  { id: 'price_asc', label: 'Price: Low to High' },
                  { id: 'price_desc', label: 'Price: High to Low' },
                  { id: 'discount', label: 'Max Discount' },
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[S.modalOptionRow, selectedSort === opt.id && S.modalOptionRowSelected]}
                    onPress={() => { setSelectedSort(opt.id); setActiveModal(null); }}
                  >
                    <AppText style={[S.modalOptionText, selectedSort === opt.id && S.modalOptionTextSelected]}>
                      {opt.label}
                    </AppText>
                    {selectedSort === opt.id && <Ionicons name="checkmark-circle" size={18} color="#3A2986" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* PRICE OPTIONS */}
            {activeModal === 'price' && (
              <View style={S.modalOptionsCol}>
                {[
                  { id: 'all', label: 'All Prices' },
                  { id: 'under50', label: 'Under ₹50' },
                  { id: '50to150', label: '₹50 - ₹150' },
                  { id: 'above150', label: 'Above ₹150' },
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[S.modalOptionRow, selectedPriceFilter === opt.id && S.modalOptionRowSelected]}
                    onPress={() => { setSelectedPriceFilter(opt.id); setActiveModal(null); }}
                  >
                    <AppText style={[S.modalOptionText, selectedPriceFilter === opt.id && S.modalOptionTextSelected]}>
                      {opt.label}
                    </AppText>
                    {selectedPriceFilter === opt.id && <Ionicons name="checkmark-circle" size={18} color="#3A2986" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* BRAND OPTIONS */}
            {activeModal === 'brands' && (
              <View style={S.modalOptionsCol}>
                {[
                  { id: 'all', label: 'All Brands' },
                  { id: 'crocin', label: 'Crocin' },
                  { id: 'dolo', label: 'Dolo' },
                  { id: 'vicks', label: 'Vicks' },
                  { id: 'cipla', label: 'Cipla' },
                  { id: 'himalaya', label: 'Himalaya' },
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[S.modalOptionRow, selectedBrandFilter === opt.id && S.modalOptionRowSelected]}
                    onPress={() => { setSelectedBrandFilter(opt.id); setActiveModal(null); }}
                  >
                    <AppText style={[S.modalOptionText, selectedBrandFilter === opt.id && S.modalOptionTextSelected]}>
                      {opt.label}
                    </AppText>
                    {selectedBrandFilter === opt.id && <Ionicons name="checkmark-circle" size={18} color="#3A2986" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* GENERAL FILTERS RESET */}
            {activeModal === 'filters' && (
              <View style={{ paddingVertical: 12 }}>
                <TouchableOpacity
                  style={S.resetFiltersBtn}
                  onPress={() => {
                    setSelectedSort('relevance');
                    setSelectedBrandFilter('all');
                    setSelectedPriceFilter('all');
                    setActiveModal(null);
                    showToast('Filters reset', 'info');
                  }}
                >
                  <Ionicons name="refresh-outline" size={16} color="#3A2986" style={{ marginRight: 6 }} />
                  <AppText style={S.resetFiltersText}>Reset All Filters</AppText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Variant Selection Modal */}
      <VariantSelectionModal
        visible={!!variantMed}
        medicine={variantMed}
        onClose={() => setVariantMed(null)}
      />
    </View>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STYLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const S = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Header Bar ────────────────────────────────────────────────────────────
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingBottom: 8,
  },
  stickyHeaderCenter: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingHeaderRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // ── Store Hero ────────────────────────────────────────────────────────────
  storeHero: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  storeMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    position: 'relative',
  },
  logoBox: {
    width: 76,
    height: 76,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  openStatusBadge: {
    position: 'absolute',
    top: -6,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  openDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  openStatusText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  storeDetailsCol: {
    flex: 1,
    marginLeft: 14,
  },
  storeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  verifiedIconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  ratingBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingScoreText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  ratingDividerText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    marginHorizontal: 6,
  },
  ratingCountText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },

  // ── Info Grid ─────────────────────────────────────────────────────────────
  infoGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextWrap: {
    marginLeft: 8,
  },
  infoValText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  infoSubText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
  },

  // ── Offers Strip ──────────────────────────────────────────────────────────
  offersStripRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  offerCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 10,
  },
  offerIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerCardTextCol: {
    marginLeft: 8,
    flex: 1,
  },
  offerCardTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  offerCardSub: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    marginTop: 1,
  },
  offerCardCodeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    marginTop: 1,
  },

  // ── Mint Promo Card ───────────────────────────────────────────────────────
  promoContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  promoCard: {
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  promoPercentBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoPercentIcon: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '800',
  },
  promoSubLabel: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
  },
  promoMainTitle: {
    color: '#047857',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: -0.5,
  },
  couponPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  couponPillText: {
    color: '#047857',
    fontSize: 11,
    fontWeight: '600',
  },
  orderNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A2986',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  orderNowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  promoImageWrap: {
    width: 100,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoMedicineImage: {
    width: '100%',
    height: '100%',
  },

  // ── Upload Prescription Banner Styles ─────────────────────────────────────
  uploadPrescriptionContainer: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  uploadPrescriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EAE6FA',
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#3A2986',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  rxBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rxIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F0ECFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rxTextCol: {
    marginLeft: 12,
    flex: 1,
  },
  rxTitleText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  rxSubText: {
    color: '#9CA3AF',
    fontSize: 11.5,
    marginTop: 2,
  },
  rxUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0ECFE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  rxUploadBtnText: {
    color: '#3A2986',
    fontSize: 13,
    fontWeight: '700',
  },

  // ── Main Body Split ───────────────────────────────────────────────────────
  mainBodyRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  sidebarCol: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#F9FAFB',
    borderRightWidth: 1,
    borderRightColor: '#F3F4F6',
    paddingVertical: 6,
  },
  sidebarTabItem: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    position: 'relative',
  },
  sidebarTabItemActive: {
    backgroundColor: '#ECE8FF',
  },
  sidebarActiveIndicator: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 3.5,
    borderRadius: 2,
    backgroundColor: '#3A2986',
  },
  sidebarIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sidebarIconBoxActive: {
    backgroundColor: '#FFFFFF',
  },
  sidebarTabLabel: {
    color: '#4B5563',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 13,
  },
  sidebarTabLabelActive: {
    color: '#3A2986',
    fontWeight: '700',
  },

  // Right Content Area
  rightContentCol: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  filterBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 6,
  },
  filterPillBtn: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
  },
  filterPillBtnActive: {
    borderColor: '#3A2986',
    backgroundColor: '#F0ECFE',
  },
  filterPillText: {
    color: '#374151',
    fontSize: 11.5,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#3A2986',
    fontWeight: '700',
  },

  // Product Grid
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    gap: 8,
  },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
    justifyContent: 'space-between',
  },
  cardTopHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 22,
  },
  discountBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  cardImageWrapper: {
    height: 85,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    position: 'relative',
  },
  productImage: {
    width: '80%',
    height: '100%',
  },
  vegSymbolBox: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  vegSymbolDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  productTitle: {
    color: '#111827',
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: 2,
  },
  productPackSize: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 1,
  },
  productUsage: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 1,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  priceBlock: {
    flex: 1,
  },
  priceInlineRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  sellingPrice: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
  },
  mrpPrice: {
    color: '#9CA3AF',
    fontSize: 11,
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  savingsText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  addPillBtn: {
    borderWidth: 1.5,
    borderColor: '#3A2986',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPillBtnText: {
    color: '#3A2986',
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Floating Cart Bar ─────────────────────────────────────────────────────
  floatingCartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0B0730',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  cartLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartIconWrap: {
    position: 'relative',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeCircle: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#3A2986',
    fontSize: 10,
    fontWeight: '800',
  },
  cartTextCol: {
    marginLeft: 12,
  },
  cartItemsPriceText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cartSavingsText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  viewCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  viewCartBtnText: {
    color: '#3A2986',
    fontSize: 14,
    fontWeight: '700',
  },

  // ── Modal Styles ─────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOptionsCol: {
    gap: 8,
  },
  modalOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  modalOptionRowSelected: {
    backgroundColor: '#F0ECFE',
  },
  modalOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  modalOptionTextSelected: {
    color: '#3A2986',
    fontWeight: '700',
  },
  resetFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0ECFE',
    paddingVertical: 12,
    borderRadius: 14,
  },
  resetFiltersText: {
    color: '#3A2986',
    fontSize: 14,
    fontWeight: '700',
  },
});

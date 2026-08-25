import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { MedicineService } from '../../services/medicineService';
import { Medicine } from '../../types/medicine';
import { useCart } from '../../store/CartContext';
import { useToast } from '../../store/ToastContext';
import { useAppTheme } from '../../store/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatCurrency } from '../../utils/currency';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 230;
const PRODUCT_CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - 12) / 2;

// Brand metadata with descriptions, taglines, certifications etc.
const BRAND_META: Record<string, {
  tagline: string;
  description: string;
  founded: string;
  hq: string;
  certifications: string[];
  specialties: string[];
}> = {
  cipla: {
    tagline: 'Caring for Life',
    description: 'One of India\'s leading pharmaceutical companies, Cipla manufactures affordable medicines across therapeutic categories including respiratory, cardiovascular, and anti-infective.',
    founded: '1935',
    hq: 'Mumbai, India',
    certifications: ['WHO-GMP', 'US-FDA', 'EU-GMP', 'ISO 14001'],
    specialties: ['Respiratory', 'Anti-Retroviral', 'Cardiology', 'Oncology'],
  },
  sun: {
    tagline: 'Quality. Affordable. Life.',
    description: 'Sun Pharmaceutical Industries is the world\'s 4th largest specialty generic pharmaceutical company and India\'s top pharmaceutical company.',
    founded: '1983',
    hq: 'Mumbai, India',
    certifications: ['US-FDA', 'WHO-GMP', 'MHRA UK', 'TGA Australia'],
    specialties: ['Dermatology', 'Psychiatry', 'Neurology', 'Cardiology'],
  },
  abbott: {
    tagline: 'Life. To the Fullest.',
    description: 'Abbott is a global healthcare leader creating breakthrough science to advance people\'s health. Their nutrition, diagnostics, and branded generic pharmaceuticals serve millions.',
    founded: '1888',
    hq: 'Chicago, USA',
    certifications: ['US-FDA', 'WHO-GMP', 'CE Mark', 'ISO 13485'],
    specialties: ['Nutrition', 'Diagnostics', 'Gastroenterology', 'Women\'s Health'],
  },
  drreddy: {
    tagline: 'Good Health Can\'t Wait',
    description: 'Dr. Reddy\'s Laboratories is an integrated pharmaceutical company committed to providing affordable and innovative medicines for healthier lives.',
    founded: '1984',
    hq: 'Hyderabad, India',
    certifications: ['US-FDA', 'WHO-GMP', 'EU-GMP', 'PMDA Japan'],
    specialties: ['Oncology', 'Neurology', 'Cardiology', 'Pain Management'],
  },
  himalaya: {
    tagline: 'Wellness Through Nature',
    description: 'Himalaya Wellness Company leverages the principles of Ayurveda to create breakthrough formulations backed by clinical research for holistic well-being.',
    founded: '1930',
    hq: 'Bengaluru, India',
    certifications: ['WHO-GMP', 'ISO 9001', 'USDA Organic', 'Halal Certified'],
    specialties: ['Herbal Care', 'Personal Care', 'Baby Care', 'Animal Health'],
  },
  mankind: {
    tagline: 'Serving Life',
    description: 'Mankind Pharma is among the fastest-growing pharmaceutical companies in India, offering a wide range of affordable healthcare solutions across therapeutic areas.',
    founded: '1995',
    hq: 'New Delhi, India',
    certifications: ['WHO-GMP', 'ISO 9001', 'US-FDA', 'NABL'],
    specialties: ['Anti-infective', 'Cardiovascular', 'Gastrointestinal', 'Dermatology'],
  },
};

export const BrandDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'BrandDetail'>>();
  const { brandId, brandName, brandQuery, brandBg, brandImage, brandCount } = route.params;

  const { colors, isDark } = useAppTheme();
  const { addToCart, getItemQuantity, updateQuantity } = useCart();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const [products, setProducts] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [scrollY] = useState(new Animated.Value(0));

  const meta = BRAND_META[brandId] || BRAND_META.cipla;

  useEffect(() => {
    MedicineService.getMedicinesByBrand(brandQuery).then((meds) => {
      setProducts(meds);
      setIsLoading(false);
    });
  }, [brandQuery]);

  // Derive categories from the product list
  const categories = useMemo(() => {
    const catMap = new Map<string, number>();
    products.forEach((p) => {
      const cat = p.category || 'Other';
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });
    return [
      { slug: 'all', name: 'All', count: products.length },
      ...Array.from(catMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ slug: name.toLowerCase().replace(/\s+/g, '-'), name, count })),
    ];
  }, [products]);

  // Filter by category
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter(
      (p) => (p.category || '').toLowerCase().replace(/\s+/g, '-') === activeCategory,
    );
  }, [products, activeCategory]);

  // Featured = top rated or popular
  const featuredProducts = useMemo(
    () =>
      products
        .filter((p) => p.rating && p.rating >= 4.0)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 8),
    [products],
  );

  // Best deals = highest discount
  const bestDeals = useMemo(
    () =>
      products
        .filter((p) => p.discountPercentage > 0)
        .sort((a, b) => b.discountPercentage - a.discountPercentage)
        .slice(0, 8),
    [products],
  );

  // Rx Required products
  const rxProducts = useMemo(
    () => products.filter((p) => p.rxRequired).slice(0, 8),
    [products],
  );

  const handleAddToCart = useCallback(
    (medicine: Medicine) => {
      addToCart(medicine, undefined, undefined, medicine.sourcePharmacyId);
      showToast(`${medicine.brandName} added to cart`, 'success');
    },
    [addToCart, showToast],
  );

  // Animated header opacity
  const headerBgOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT - 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const renderProductCard = useCallback(
    (item: Medicine, index: number, isHorizontal = false) => {
      const qty = getItemQuantity(item.id);
      const cardWidth = isHorizontal ? 160 : PRODUCT_CARD_WIDTH;

      return (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('MedicineDetails', { medicineId: item.id, medicine: item })}
          style={[
            styles.productCard,
            {
              width: cardWidth,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              marginRight: isHorizontal ? 12 : index % 2 === 0 ? 12 : 0,
            },
            SHADOWS.subtle,
          ]}
        >
          {/* Discount badge */}
          {item.discountPercentage > 0 && (
            <View style={[styles.discountBadge, { backgroundColor: colors.success }]}>
              <AppText variant="caption" color="#FFF" weight="700" style={{ fontSize: 9 }}>
                {item.discountPercentage}% OFF
              </AppText>
            </View>
          )}

          {/* Rx Badge */}
          {item.rxRequired && (
            <View style={[styles.rxBadge, { backgroundColor: colors.rxRedLight, borderColor: colors.rxRedBorder }]}>
              <AppText variant="caption" color={colors.rxRed} weight="700" style={{ fontSize: 8 }}>
                Rx
              </AppText>
            </View>
          )}

          {/* Image */}
          <View style={[styles.productImageContainer, { backgroundColor: isDark ? colors.surfaceElevated : '#F8F8FC' }]}>
            <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="contain" />
          </View>

          {/* Info */}
          <View style={styles.productInfo}>
            <AppText variant="caption" color={colors.textSecondary} weight="500" numberOfLines={1} style={{ fontSize: 10 }}>
              {item.packForm}
            </AppText>
            <AppText variant="bodySmall" color={colors.textPrimary} weight="600" numberOfLines={2} style={styles.productName}>
              {item.name}
            </AppText>

            {/* Price row */}
            <View style={styles.priceRow}>
              <AppText variant="titleSmall" color={colors.textPrimary} weight="700">
                {formatCurrency(item.discountPrice)}
              </AppText>
              {item.mrp > item.discountPrice && (
                <AppText variant="caption" color={colors.textMuted} style={styles.mrpText}>
                  {formatCurrency(item.mrp)}
                </AppText>
              )}
            </View>

            {/* Rating */}
            {item.rating && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={10} color={colors.starGold} />
                <AppText variant="caption" color={colors.textSecondary} weight="600" style={{ marginLeft: 2, fontSize: 10 }}>
                  {item.rating}
                </AppText>
                {item.reviewCount && (
                  <AppText variant="caption" color={colors.textMuted} style={{ fontSize: 9, marginLeft: 2 }}>
                    ({item.reviewCount})
                  </AppText>
                )}
              </View>
            )}
          </View>

          {/* Add / Qty Button */}
          <View style={styles.cartBtnContainer}>
            {qty > 0 ? (
              <View style={[styles.qtyRow, { backgroundColor: colors.primary }]}>
                <TouchableOpacity onPress={() => updateQuantity(item.id, qty - 1)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="remove" size={14} color="#FFF" />
                </TouchableOpacity>
                <AppText variant="caption" color="#FFF" weight="700" style={{ marginHorizontal: 8 }}>
                  {qty}
                </AppText>
                <TouchableOpacity onPress={() => updateQuantity(item.id, qty + 1)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="add" size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => handleAddToCart(item)}
                style={[styles.addBtn, { borderColor: colors.primary }]}
              >
                <AppText variant="caption" color={colors.primary} weight="700" style={{ fontSize: 11 }}>
                  ADD
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [colors, isDark, navigation, getItemQuantity, handleAddToCart, updateQuantity],
  );

  // Section component
  const renderSection = (
    title: string,
    subtitle: string,
    icon: string,
    data: Medicine[],
    isHorizontal = true,
  ) => {
    if (data.length === 0) return null;
    return (
      <View style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderLeft}>
            <View style={[styles.sectionIconBg, { backgroundColor: isDark ? colors.primaryMuted : colors.primarySubtle }]}>
              <Ionicons name={icon as any} size={16} color={colors.primary} />
            </View>
            <View style={{ marginLeft: 10, flex: 1 }}>
              <AppText variant="titleSmall" color={colors.textPrimary} weight="700">
                {title}
              </AppText>
              <AppText variant="caption" color={colors.textSecondary} style={{ fontSize: 10, marginTop: 1 }}>
                {subtitle}
              </AppText>
            </View>
          </View>
          <AppText variant="caption" color={colors.primary} weight="600">
            {data.length} items
          </AppText>
        </View>

        {isHorizontal ? (
          <FlatList
            data={data}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 4 }}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => renderProductCard(item, index, true)}
          />
        ) : (
          <View style={styles.gridContainer}>
            {data.map((item, idx) => renderProductCard(item, idx, false))}
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="bodyMedium" color={colors.textSecondary} style={{ marginTop: 12 }}>
          Loading {brandName.replace('\n', ' ')} products...
        </AppText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Animated sticky header */}
      <Animated.View
        style={[
          styles.stickyHeader,
          {
            paddingTop: insets.top,
            backgroundColor: colors.surface,
            opacity: headerBgOpacity,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.stickyHeaderInner}>
          <AppText variant="titleSmall" color={colors.textPrimary} weight="700" numberOfLines={1}>
            {brandName.replace('\n', ' ')}
          </AppText>
        </View>
      </Animated.View>

      {/* Back button (always visible) */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.backBtn, { top: insets.top + 8 }]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={[styles.backBtnCircle, { backgroundColor: 'rgba(0,0,0,0.35)' }]}>
          <Ionicons name="arrow-back" size={20} color="#FFF" />
        </View>
      </TouchableOpacity>

      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── HERO BANNER ─── */}
        <View style={[styles.heroBanner, { backgroundColor: brandBg }]}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.65)']}
            style={StyleSheet.absoluteFillObject}
          />
          <Image
            source={{ uri: brandImage }}
            style={styles.heroImage}
            resizeMode="cover"
            blurRadius={Platform.OS === 'android' ? 2 : 4}
          />
          <LinearGradient
            colors={['transparent', brandBg + 'EE', brandBg]}
            locations={[0, 0.6, 1]}
            style={styles.heroOverlay}
          />

          <View style={[styles.heroContent, { paddingTop: insets.top + 40 }]}>
            <View style={styles.heroTextCol}>
              <AppText style={[styles.heroTitle, { color: '#FFFFFF' }]} numberOfLines={2}>
                {brandName.replace('\n', ' ')}
              </AppText>
              <AppText style={[styles.heroTagline, { color: 'rgba(255,255,255,0.8)' }]}>
                {meta.tagline}
              </AppText>
              <View style={styles.heroCountRow}>
                <View style={styles.heroCountPill}>
                  <Ionicons name="cube-outline" size={12} color="#FFF" />
                  <AppText variant="caption" color="#FFF" weight="700" style={{ marginLeft: 4, fontSize: 11 }}>
                    {brandCount}
                  </AppText>
                </View>
                <View style={[styles.heroCountPill, { marginLeft: 8 }]}>
                  <Ionicons name="shield-checkmark-outline" size={12} color="#FFF" />
                  <AppText variant="caption" color="#FFF" weight="700" style={{ marginLeft: 4, fontSize: 11 }}>
                    Certified
                  </AppText>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ─── BRAND INFO CARD ─── */}
        <View style={[styles.brandInfoCard, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.card]}>
          <AppText variant="bodySmall" color={colors.textSecondary} style={styles.brandDesc}>
            {meta.description}
          </AppText>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: isDark ? colors.primaryMuted : colors.primarySubtle }]}>
                <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              </View>
              <AppText variant="caption" color={colors.textSecondary} style={{ fontSize: 10 }}>
                Founded
              </AppText>
              <AppText variant="bodySmall" color={colors.textPrimary} weight="700">
                {meta.founded}
              </AppText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: isDark ? colors.primaryMuted : colors.primarySubtle }]}>
                <Ionicons name="location-outline" size={16} color={colors.primary} />
              </View>
              <AppText variant="caption" color={colors.textSecondary} style={{ fontSize: 10 }}>
                Headquarters
              </AppText>
              <AppText variant="bodySmall" color={colors.textPrimary} weight="700" numberOfLines={1}>
                {meta.hq}
              </AppText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: isDark ? colors.primaryMuted : colors.primarySubtle }]}>
                <Ionicons name="medkit-outline" size={16} color={colors.primary} />
              </View>
              <AppText variant="caption" color={colors.textSecondary} style={{ fontSize: 10 }}>
                Products
              </AppText>
              <AppText variant="bodySmall" color={colors.textPrimary} weight="700">
                {products.length}
              </AppText>
            </View>
          </View>

          {/* Certifications */}
          <View style={styles.certRow}>
            {meta.certifications.map((cert) => (
              <View
                key={cert}
                style={[styles.certChip, { backgroundColor: isDark ? colors.surfaceElevated : colors.primarySubtle, borderColor: isDark ? colors.primaryBorder : colors.primaryBorder }]}
              >
                <Ionicons name="checkmark-circle" size={10} color={colors.success} />
                <AppText variant="caption" color={colors.textSecondary} weight="600" style={{ fontSize: 9, marginLeft: 3 }}>
                  {cert}
                </AppText>
              </View>
            ))}
          </View>

          {/* Specialties */}
          <View style={styles.specialtiesRow}>
            <AppText variant="caption" color={colors.textMuted} weight="600" style={{ fontSize: 10, marginRight: 6 }}>
              SPECIALTIES
            </AppText>
            {meta.specialties.map((s) => (
              <View
                key={s}
                style={[styles.specialtyChip, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDFF', borderColor: isDark ? colors.primaryBorder : '#DCD5F0' }]}
              >
                <AppText variant="caption" color={colors.primary} weight="600" style={{ fontSize: 10 }}>
                  {s}
                </AppText>
              </View>
            ))}
          </View>
        </View>

        {/* ─── CATEGORY FILTER CHIPS ─── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScrollContainer}
          style={styles.chipScroll}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <TouchableOpacity
                key={cat.slug}
                activeOpacity={0.8}
                onPress={() => setActiveCategory(cat.slug)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive
                      ? colors.primary
                      : isDark ? colors.surfaceElevated : colors.surface,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                  isActive && SHADOWS.subtle,
                ]}
              >
                <AppText
                  variant="caption"
                  color={isActive ? '#FFF' : colors.textSecondary}
                  weight={isActive ? '700' : '500'}
                  style={{ fontSize: 12 }}
                >
                  {cat.name}
                </AppText>
                <View
                  style={[
                    styles.chipCountBadge,
                    {
                      backgroundColor: isActive
                        ? 'rgba(255,255,255,0.25)'
                        : isDark ? colors.surfaceMuted : colors.primarySubtle,
                    },
                  ]}
                >
                  <AppText
                    variant="caption"
                    color={isActive ? '#FFF' : colors.textMuted}
                    weight="700"
                    style={{ fontSize: 9 }}
                  >
                    {cat.count}
                  </AppText>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ─── FEATURED PRODUCTS (horizontal) ─── */}
        {activeCategory === 'all' && renderSection(
          'Featured Products',
          `Top-rated from ${brandName.replace('\n', ' ')}`,
          'star-outline',
          featuredProducts,
          true,
        )}

        {/* ─── BEST DEALS (horizontal) ─── */}
        {activeCategory === 'all' && renderSection(
          'Best Deals',
          'Maximum savings on these products',
          'pricetag-outline',
          bestDeals,
          true,
        )}

        {/* ─── PRESCRIPTION MEDICINES (horizontal, shown if exists) ─── */}
        {activeCategory === 'all' && rxProducts.length > 0 && renderSection(
          'Prescription Medicines',
          'Requires valid Rx from licensed doctor',
          'document-text-outline',
          rxProducts,
          true,
        )}

        {/* ─── ALL PRODUCTS (grid) ─── */}
        <View style={[styles.sectionContainer, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIconBg, { backgroundColor: isDark ? colors.primaryMuted : colors.primarySubtle }]}>
                <Ionicons name="grid-outline" size={16} color={colors.primary} />
              </View>
              <View style={{ marginLeft: 10, flex: 1 }}>
                <AppText variant="titleSmall" color={colors.textPrimary} weight="700">
                  {activeCategory === 'all' ? 'All Products' : categories.find((c) => c.slug === activeCategory)?.name || 'Products'}
                </AppText>
                <AppText variant="caption" color={colors.textSecondary} style={{ fontSize: 10, marginTop: 1 }}>
                  {filteredProducts.length} products available
                </AppText>
              </View>
            </View>
          </View>

          {filteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={colors.textMuted} />
              <AppText variant="bodyMedium" color={colors.textSecondary} style={{ marginTop: 12 }}>
                No products found in this category
              </AppText>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {filteredProducts.map((item, idx) => renderProductCard(item, idx, false))}
            </View>
          )}
        </View>

        {/* Bottom spacer */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─── Sticky Header ───
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    borderBottomWidth: 1,
  },
  stickyHeaderInner: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 56,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    zIndex: 30,
  },
  backBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─── Hero ───
  heroBanner: {
    height: HERO_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.35,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingBottom: 20,
  },
  heroTextCol: {},
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  heroTagline: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  heroCountRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  heroCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  // ─── Brand Info Card ───
  brandInfoCard: {
    marginHorizontal: SPACING.lg,
    marginTop: -24,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    zIndex: 5,
  },
  brandDesc: {
    lineHeight: 18,
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 4,
  },
  certRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 6,
  },
  certChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  specialtyChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },

  // ─── Category Chips ───
  chipScroll: {
    marginTop: 16,
  },
  chipScrollContainer: {
    paddingHorizontal: SPACING.lg,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipCountBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },

  // ─── Section ───
  sectionContainer: {
    marginTop: 20,
    paddingBottom: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─── Product Card ───
  productCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 2,
  },
  rxBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    zIndex: 2,
  },
  productImageContainer: {
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  productImage: {
    width: '65%',
    height: '75%',
  },
  productInfo: {
    padding: 10,
    paddingBottom: 6,
  },
  productName: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
    minHeight: 32,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  mrpText: {
    fontSize: 10,
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  cartBtnContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  addBtn: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyRow: {
    flexDirection: 'row',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Grid ───
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
  },

  // ─── Empty ───
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
});

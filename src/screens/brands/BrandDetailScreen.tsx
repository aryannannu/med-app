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
import { MedicineCard } from '../../components/cards/MedicineCard';
import { VariantSelectionModal } from '../../components/modals/VariantSelectionModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Brand metadata with descriptions, taglines, certifications etc.
const BRAND_META: Record<string, {
  tagline: string;
  description: string;
  founded: string;
  hq: string;
  certifications: string[];
  specialties: string[];
  buildingImage: string;
  logoTextColor: string;
}> = {
  cipla: {
    tagline: 'Caring for Life',
    description: 'One of India\'s leading pharmaceutical companies, Cipla manufactures affordable medicines across therapeutic categories including respiratory, cardiovascular, and anti-infective.',
    founded: '1935',
    hq: 'Mumbai, India',
    certifications: ['WHO-GMP', 'US-FDA', 'EU-GMP', 'ISO 14001'],
    specialties: ['Respiratory', 'Anti-Retroviral', 'Cardiology', 'Oncology'],
    buildingImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80',
    logoTextColor: '#004B93',
  },
  sun: {
    tagline: 'Quality. Affordable. Life.',
    description: 'Sun Pharmaceutical Industries is the world\'s 4th largest specialty generic pharmaceutical company and India\'s top pharmaceutical company.',
    founded: '1983',
    hq: 'Mumbai, India',
    certifications: ['US-FDA', 'WHO-GMP', 'MHRA UK', 'TGA Australia'],
    specialties: ['Dermatology', 'Psychiatry', 'Neurology', 'Cardiology'],
    buildingImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?w=400&q=80',
    logoTextColor: '#E35205',
  },
  abbott: {
    tagline: 'Life. To the Fullest.',
    description: 'Abbott is a global healthcare leader creating breakthrough science to advance people\'s health with branded generic pharmaceuticals serving millions.',
    founded: '1888',
    hq: 'Chicago, USA',
    certifications: ['US-FDA', 'WHO-GMP', 'CE Mark', 'ISO 13485'],
    specialties: ['Nutrition', 'Diagnostics', 'Gastroenterology', 'Women\'s Health'],
    buildingImage: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=400&q=80',
    logoTextColor: '#0072CE',
  },
  drreddy: {
    tagline: 'Good Health Can\'t Wait',
    description: 'Dr. Reddy\'s Laboratories is an integrated pharmaceutical company committed to providing affordable and innovative medicines for healthier lives.',
    founded: '1984',
    hq: 'Hyderabad, India',
    certifications: ['US-FDA', 'WHO-GMP', 'EU-GMP', 'PMDA Japan'],
    specialties: ['Oncology', 'Neurology', 'Cardiology', 'Pain Management'],
    buildingImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
    logoTextColor: '#4B286D',
  },
  himalaya: {
    tagline: 'Wellness Through Nature',
    description: 'Himalaya Wellness Company leverages the principles of Ayurveda to create breakthrough formulations backed by clinical research for holistic well-being.',
    founded: '1930',
    hq: 'Bengaluru, India',
    certifications: ['WHO-GMP', 'ISO 9001', 'USDA Organic', 'Halal Certified'],
    specialties: ['Herbal Care', 'Personal Care', 'Baby Care', 'Animal Health'],
    buildingImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80',
    logoTextColor: '#00833E',
  },
  mankind: {
    tagline: 'Serving Life',
    description: 'Mankind Pharma is among the fastest-growing pharmaceutical companies in India, offering a wide range of affordable healthcare solutions across therapeutic areas.',
    founded: '1995',
    hq: 'New Delhi, India',
    certifications: ['WHO-GMP', 'ISO 9001', 'US-FDA', 'NABL'],
    specialties: ['Anti-infective', 'Cardiovascular', 'Gastrointestinal', 'Dermatology'],
    buildingImage: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=400&q=80',
    logoTextColor: '#0A4D9C',
  },
  micro: {
    tagline: 'Committed to Health',
    description: 'Micro Labs is a multi-faceted healthcare organization with state-of-the-art manufacturing and presence in prescription pharmaceuticals including Dolo.',
    founded: '1973',
    hq: 'Bengaluru, India',
    certifications: ['WHO-GMP', 'US-FDA', 'UK-MHRA', 'ISO 9001'],
    specialties: ['Cardiology', 'Diabetes', 'Pain Management', 'Ophthalmology'],
    buildingImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80',
    logoTextColor: '#1E3A8A',
  },
};

export const BrandDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'BrandDetail'>>();
  const { brandId, brandName, brandQuery, brandCount } = route.params;

  const { colors, isDark } = useAppTheme();
  const { addToCart, removeFromCart, getItemQuantity, updateQuantity, undoRemove } = useCart();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const [products, setProducts] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [scrollY] = useState(new Animated.Value(0));
  const [selectedMedicineForVariant, setSelectedMedicineForVariant] = useState<Medicine | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const cleanBrandName = brandName.replace('\n', ' ').trim();
  const brandKey = (brandId || '').toLowerCase();
  const meta =
    BRAND_META[brandKey] ||
    (brandKey.includes('sun')
      ? BRAND_META.sun
      : brandKey.includes('abbott')
      ? BRAND_META.abbott
      : brandKey.includes('reddy')
      ? BRAND_META.drreddy
      : brandKey.includes('mankind')
      ? BRAND_META.mankind
      : brandKey.includes('himalaya')
      ? BRAND_META.himalaya
      : brandKey.includes('micro')
      ? BRAND_META.micro
      : BRAND_META.cipla);

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

  // Animated sticky header
  const headerBgOpacity = scrollY.interpolate({
    inputRange: [0, 160],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const renderProductCard = useCallback(
    (item: Medicine, index: number, isHorizontal = false) => {
      return (
        <MedicineCard
          key={item.id}
          medicine={item}
          onPress={() => navigation.push('MedicineDetails', { medicineId: item.id, medicine: item })}
          onOpenVariantModal={(m) => setSelectedMedicineForVariant(m)}
          onAddToCart={() => {
            const added = addToCart(item, 1);
            if (added) {
              showToast(`Added ${item.name} to cart!`, 'success');
              if (item.rxRequired) {
                setTimeout(() => {
                  showToast('Prescription will be required before placing order', 'info', 3500);
                }, 800);
              }
            } else {
              showToast('Maximum quantity limit (10) reached', 'warning');
            }
          }}
          onIncrement={() => {
            const currentQty = getItemQuantity(item.id);
            if (currentQty >= 10) {
              showToast('Maximum quantity limit (10) reached', 'warning');
            } else {
              updateQuantity(item.id, currentQty + 1);
            }
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
          style={
            isHorizontal
              ? { marginRight: 12, width: 165 }
              : { marginRight: index % 2 === 0 ? 12 : 0, marginBottom: 14 }
          }
        />
      );
    },
    [navigation, addToCart, removeFromCart, getItemQuantity, updateQuantity, undoRemove, showToast],
  );

  if (isLoading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="bodyMedium" color={colors.textSecondary} style={{ marginTop: 12 }}>
          Loading {cleanBrandName} products...
        </AppText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Floating Animated Header on Scroll */}
      <Animated.View
        style={[
          styles.stickyHeader,
          {
            paddingTop: insets.top + (Platform.OS === 'android' ? 6 : 2),
            backgroundColor: colors.surface,
            opacity: headerBgOpacity,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.stickyHeaderInner}>
          <AppText variant="titleSmall" color={colors.textPrimary} weight="700" numberOfLines={1}>
            {cleanBrandName}
          </AppText>
        </View>
      </Animated.View>

      {/* Floating Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.floatingIconBtn, { top: insets.top + (Platform.OS === 'android' ? 6 : 4), left: 16 }]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={styles.floatingIconCircle}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Floating Wishlist Button */}
      <TouchableOpacity
        onPress={() => {
          setIsFavorite(!isFavorite);
          showToast(isFavorite ? 'Removed from favorites' : 'Brand saved to favorites!', 'info');
        }}
        style={[styles.floatingIconBtn, { top: insets.top + (Platform.OS === 'android' ? 6 : 4), right: 16 }]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={styles.floatingIconCircle}>
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#EF4444' : '#FFFFFF'} />
        </View>
      </TouchableOpacity>

      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── 1. TOP HERO BRAND BANNER (Dark Indigo with Building Overlay) ─── */}
        <View style={[styles.heroBanner, { paddingTop: insets.top + 52 }]}>
          <Image
            source={{ uri: meta.buildingImage }}
            style={styles.heroBgImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(26,16,61,0.72)', 'rgba(30,18,66,0.92)', '#1A0F38']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Brand Identity Row: Large Round Logo + Name + Tagline + Pills */}
          <View style={styles.heroContentRow}>
            {/* Round Brand Logo Circle */}
            <View style={[styles.brandLogoCircle, SHADOWS.card]}>
              <AppText style={[styles.brandLogoText, { color: meta.logoTextColor }]}>
                {cleanBrandName}
              </AppText>
            </View>

            {/* Brand Titles Column */}
            <View style={styles.heroTextCol}>
              <AppText style={styles.heroTitle} numberOfLines={1}>
                {cleanBrandName}
              </AppText>
              <View style={styles.taglineRow}>
                <AppText style={styles.heroTagline} numberOfLines={1}>
                  {meta.tagline}
                </AppText>
                <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
              </View>

              {/* Discovery Pills */}
              <View style={styles.heroPillsRow}>
                <View style={styles.heroPill}>
                  <Ionicons name="cube-outline" size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <AppText style={styles.heroPillText}>
                    {brandCount || `${Math.max(products.length, 12)}+ Products`}
                  </AppText>
                </View>
                <View style={[styles.heroPill, { marginLeft: 8 }]}>
                  <Ionicons name="shield-checkmark" size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <AppText style={styles.heroPillText}>
                    Certified
                  </AppText>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ─── 2. WHITE CONTENT CONTAINER (Curves over Hero) ─── */}
        <View style={[styles.whiteContentContainer, { backgroundColor: colors.background }]}>
          {/* Company Description Card with Corporate Building Image */}
          <View style={[styles.descriptionCard, { backgroundColor: isDark ? colors.surfaceElevated : '#F8F9FD', borderColor: isDark ? colors.border : '#EBF0F8' }]}>
            <View style={styles.descTextCol}>
              <AppText variant="bodySmall" color={colors.textSecondary} style={styles.descParagraph}>
                {meta.description}
              </AppText>
            </View>
            <Image
              source={{ uri: meta.buildingImage }}
              style={styles.buildingThumbnail}
              resizeMode="cover"
            />
          </View>

          {/* Key Metrics Row (3 Equal Cards: Founded, Headquarters, Products) */}
          <View style={styles.metricsRow}>
            {/* Founded */}
            <View style={[styles.metricCard, { backgroundColor: isDark ? colors.surfaceElevated : '#F8F9FD', borderColor: isDark ? colors.border : '#EBF0F8' }]}>
              <View style={[styles.metricIconBox, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="calendar-outline" size={16} color="#7C3AED" />
              </View>
              <AppText variant="caption" color={colors.textMuted} style={styles.metricLabel}>
                Founded
              </AppText>
              <AppText variant="bodySmall" color={colors.textPrimary} weight="700" style={styles.metricValue}>
                {meta.founded}
              </AppText>
            </View>

            {/* Headquarters */}
            <View style={[styles.metricCard, { backgroundColor: isDark ? colors.surfaceElevated : '#F8F9FD', borderColor: isDark ? colors.border : '#EBF0F8' }]}>
              <View style={[styles.metricIconBox, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="location-outline" size={16} color="#0284C7" />
              </View>
              <AppText variant="caption" color={colors.textMuted} style={styles.metricLabel}>
                Headquarters
              </AppText>
              <AppText variant="bodySmall" color={colors.textPrimary} weight="700" style={styles.metricValue} numberOfLines={1}>
                {meta.hq}
              </AppText>
            </View>

            {/* Products */}
            <View style={[styles.metricCard, { backgroundColor: isDark ? colors.surfaceElevated : '#F8F9FD', borderColor: isDark ? colors.border : '#EBF0F8' }]}>
              <View style={[styles.metricIconBox, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="briefcase-outline" size={16} color="#7C3AED" />
              </View>
              <AppText variant="caption" color={colors.textMuted} style={styles.metricLabel}>
                Products
              </AppText>
              <AppText variant="bodySmall" color={colors.textPrimary} weight="700" style={styles.metricValue}>
                {products.length || 6}
              </AppText>
            </View>
          </View>

          {/* Certifications Row (WHO-GMP, US-FDA, EU-GMP, ISO 14001) */}
          <View style={[styles.certificationsBox, { backgroundColor: isDark ? colors.surfaceElevated : '#F8F9FD', borderColor: isDark ? colors.border : '#EBF0F8' }]}>
            {meta.certifications.map((cert, index) => (
              <React.Fragment key={cert}>
                {index > 0 && <View style={[styles.certDivider, { backgroundColor: isDark ? colors.border : '#E2E8F0' }]} />}
                <View style={styles.certItem}>
                  <Ionicons name="checkmark-circle" size={14} color="#16A34A" style={{ marginRight: 4 }} />
                  <AppText variant="caption" color={colors.textPrimary} weight="700" style={{ fontSize: 11 }}>
                    {cert}
                  </AppText>
                </View>
              </React.Fragment>
            ))}
          </View>

          {/* Specialties Section */}
          <View style={styles.specialtiesSection}>
            <AppText variant="titleSmall" color={colors.textPrimary} weight="700" style={styles.specialtiesTitle}>
              Specialties
            </AppText>
            <View style={styles.specialtiesPillsRow}>
              {meta.specialties.map((s) => (
                <View key={s} style={[styles.specialtyPill, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDFC' }]}>
                  <AppText style={[styles.specialtyPillText, { color: colors.primary }]}>
                    {s}
                  </AppText>
                </View>
              ))}
            </View>
          </View>

          {/* ─── 3. CATEGORY FILTER CHIPS ROW (Screenshot Matching) ─── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterTabsScroll}
            style={{ marginTop: 16, marginBottom: 8 }}
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat.slug;
              return (
                <TouchableOpacity
                  key={cat.slug}
                  activeOpacity={0.8}
                  onPress={() => setActiveCategory(cat.slug)}
                  style={[
                    styles.categoryFilterChip,
                    {
                      backgroundColor: isActive ? '#3A2986' : isDark ? colors.surfaceElevated : '#FFFFFF',
                      borderColor: isActive ? '#3A2986' : isDark ? colors.border : '#E5E7EB',
                    },
                    isActive && SHADOWS.subtle,
                  ]}
                >
                  <AppText
                    style={[
                      styles.categoryFilterText,
                      { color: isActive ? '#FFFFFF' : colors.textPrimary },
                    ]}
                  >
                    {cat.name}
                  </AppText>
                  <View
                    style={[
                      styles.categoryFilterBadge,
                      { backgroundColor: isActive ? '#5223C7' : isDark ? colors.surfaceMuted : '#F1F3F9' },
                    ]}
                  >
                    <AppText
                      style={[
                        styles.categoryFilterBadgeText,
                        { color: isActive ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {cat.count}
                    </AppText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ─── 4. ACTIVE FILTER HEADING & PRODUCT GRID ─── */}
          <View style={styles.allProductsSection}>
            <View style={styles.activeFilterTitleRow}>
              <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                {activeCategory === 'all' ? 'All Products' : categories.find((c) => c.slug === activeCategory)?.name || 'Products'}
              </AppText>
              <AppText variant="bodySmall" color={colors.primary} weight="700">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
              </AppText>
            </View>

            {filteredProducts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={44} color={colors.textMuted} />
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

          {/* ─── 6. BOTTOM TRUST PILLARS (Screenshot Matching) ─── */}
          <View style={[styles.trustPillarsCard, { backgroundColor: isDark ? colors.surfaceElevated : '#FFFFFF', borderColor: isDark ? colors.border : '#EBF0F8' }, SHADOWS.subtle]}>
            {/* Pillar 1 */}
            <View style={styles.trustPillarCol}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#5A31F4" style={{ marginBottom: 4 }} />
              <AppText variant="caption" color={colors.textPrimary} weight="700" style={styles.pillarTitle}>
                Trusted Quality
              </AppText>
              <AppText variant="caption" color={colors.textMuted} style={styles.pillarSubtitle}>
                50+ Years of Trust
              </AppText>
            </View>

            <View style={[styles.pillarDivider, { backgroundColor: isDark ? colors.border : '#F0F2F8' }]} />

            {/* Pillar 2 */}
            <View style={styles.trustPillarCol}>
              <Ionicons name="flask-outline" size={20} color="#5A31F4" style={{ marginBottom: 4 }} />
              <AppText variant="caption" color={colors.textPrimary} weight="700" style={styles.pillarTitle}>
                Science Driven
              </AppText>
              <AppText variant="caption" color={colors.textMuted} style={styles.pillarSubtitle}>
                Innovative Solutions
              </AppText>
            </View>

            <View style={[styles.pillarDivider, { backgroundColor: isDark ? colors.border : '#F0F2F8' }]} />

            {/* Pillar 3 */}
            <View style={styles.trustPillarCol}>
              <Ionicons name="globe-outline" size={20} color="#5A31F4" style={{ marginBottom: 4 }} />
              <AppText variant="caption" color={colors.textPrimary} weight="700" style={styles.pillarTitle}>
                Global Presence
              </AppText>
              <AppText variant="caption" color={colors.textMuted} style={styles.pillarSubtitle}>
                150+ Countries
              </AppText>
            </View>

            <View style={[styles.pillarDivider, { backgroundColor: isDark ? colors.border : '#F0F2F8' }]} />

            {/* Pillar 4 */}
            <View style={styles.trustPillarCol}>
              <Ionicons name="people-outline" size={20} color="#5A31F4" style={{ marginBottom: 4 }} />
              <AppText variant="caption" color={colors.textPrimary} weight="700" style={styles.pillarTitle}>
                Patient Centric
              </AppText>
              <AppText variant="caption" color={colors.textMuted} style={styles.pillarSubtitle}>
                Care for Life
              </AppText>
            </View>
          </View>

          {/* Bottom spacer */}
          <View style={{ height: 90 }} />
        </View>
      </Animated.ScrollView>

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
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Floating Header
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
  floatingIconBtn: {
    position: 'absolute',
    zIndex: 30,
  },
  floatingIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 1. Hero Brand Area
  heroBanner: {
    minHeight: 235,
    position: 'relative',
    overflow: 'hidden',
    paddingBottom: 36,
  },
  heroBgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.35,
  },
  heroContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 10,
  },
  brandLogoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    marginRight: 14,
  },
  brandLogoText: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'LexendDeca_700Bold',
  },
  heroTextCol: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'LexendDeca_700Bold',
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  heroTagline: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'LexendDeca_500Medium',
  },
  heroPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroPillText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
    fontFamily: 'LexendDeca_600SemiBold',
  },

  // 2. White Sheet Body
  whiteContentContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -22,
    paddingTop: 16,
  },
  descriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  descTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  descParagraph: {
    fontSize: 11.5,
    lineHeight: 17,
  },
  buildingThumbnail: {
    width: 90,
    height: 72,
    borderRadius: 12,
  },

  // Key Metrics
  metricsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  metricIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 9.5,
  },
  metricValue: {
    fontSize: 12,
    marginTop: 2,
  },

  // Certifications
  certificationsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  certItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  certDivider: {
    width: 1,
    height: 16,
  },

  // Specialties
  specialtiesSection: {
    marginHorizontal: 16,
    marginTop: 14,
  },
  specialtiesTitle: {
    fontSize: 13,
    marginBottom: 8,
  },
  specialtiesPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  specialtyPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  specialtyPillText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'LexendDeca_600SemiBold',
  },

  // 3. Filter Tabs
  filterTabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryFilterText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'LexendDeca_600SemiBold',
  },
  categoryFilterBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  categoryFilterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'LexendDeca_700Bold',
  },

  // 4. Featured Section
  featuredSectionContainer: {
    marginTop: 10,
  },
  featuredSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  featuredHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalProductsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },

  allProductsSection: {
    marginTop: 14,
    paddingHorizontal: 16,
  },
  activeFilterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  allProductsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 6. Trust Pillars
  trustPillarsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  trustPillarCol: {
    flex: 1,
    alignItems: 'center',
  },
  pillarTitle: {
    fontSize: 9.5,
    textAlign: 'center',
  },
  pillarSubtitle: {
    fontSize: 8,
    marginTop: 1,
    textAlign: 'center',
  },
  pillarDivider: {
    width: 1,
    height: 28,
  },
});

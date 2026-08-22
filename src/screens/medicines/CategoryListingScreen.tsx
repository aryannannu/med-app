import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { FloatingCart } from '../../components/common/FloatingCart';
import { MedicineCard } from '../../components/cards/MedicineCard';
import { VariantSelectionModal } from '../../components/modals/VariantSelectionModal';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Ionicons } from '@expo/vector-icons';
import { MedicineService } from '../../services/medicineService';
import { Medicine } from '../../types/medicine';
import { useCart } from '../../store/CartContext';
import { useAddress } from '../../store/AddressContext';
import { useToast } from '../../store/ToastContext';
import { formatCurrency } from '../../utils/currency';

type SortOption = 'relevance' | 'fastest' | 'price_asc' | 'price_desc' | 'discount' | 'rating';

interface FilterState {
  availability: 'all' | 'fast_delivery' | 'in_stock';
  prescription: 'all' | 'otc_only' | 'rx_only';
  priceRange: 'all' | '0_100' | '100_250' | '250_500' | '500_plus';
  minDiscount: number; // 0, 10, 20
  brand: string; // 'all' or brand name
}

const INITIAL_FILTERS: FilterState = {
  availability: 'all',
  prescription: 'all',
  priceRange: 'all',
  minDiscount: 0,
  brand: 'all',
};

const SUBCATEGORY_MAP: Record<string, string[]> = {
  'pain-relief': ['All', 'Headache', 'Fever', 'Body Pain', 'Muscle Pain', 'Joint Pain'],
  'pain-fever': ['All', 'Headache', 'Fever', 'Body Pain', 'Muscle Pain', 'Joint Pain'],
  'cold-flu': ['All', 'Cough Syrups', 'Nasal Drops', 'Anti-Allergic', 'Throat Lozenges'],
  'cold-cough': ['All', 'Cough Syrups', 'Nasal Drops', 'Anti-Allergic', 'Throat Lozenges'],
  'diabetes': ['All', 'Insulin', 'Sugar Test Strips', 'Oral Tablets', 'Ayurvedic Sugar Care'],
  'vitamins': ['All', 'Multivitamins', 'Vitamin C', 'Vitamin D3', 'Zinc & Immunity', 'Calcium'],
  'digestive': ['All', 'Antacids', 'Probiotics', 'Gas Relief', 'Laxatives', 'Digestive Enzymes'],
  'digestion': ['All', 'Antacids', 'Probiotics', 'Gas Relief', 'Laxatives', 'Digestive Enzymes'],
  'skin': ['All', 'Antifungal', 'Sunscreen', 'Acne Treatment', 'Moisturizers'],
  'skin-care': ['All', 'Antifungal', 'Sunscreen', 'Acne Treatment', 'Moisturizers'],
  'baby': ['All', 'Baby Diapers', 'Baby Gripe Water', 'Baby Lotion', 'Nasal Aspirators'],
  'ayurveda': ['All', 'Chyawanprash', 'Herbal Juices', 'Herbal Pain Oils', 'Ashwagandha'],
  'heart-bp': ['All', 'BP Tablets', 'Cholesterol', 'Heart Tonics'],
  'eye-ear': ['All', 'Eye Drops', 'Ear Drops', 'Eye Wipes'],
  'wellness': ['All', 'Supplements', 'Performance', 'Daily Care'],
  'first-aid': ['All', 'Bandages', 'Antiseptic', 'Cotton & Dressing'],
};

const SUBCATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  All: 'grid-outline',
  Headache: 'fitness-outline',
  Fever: 'thermometer-outline',
  'Body Pain': 'body-outline',
  'Muscle Pain': 'fitness-outline',
  'Joint Pain': 'walk-outline',
  'Cough Syrups': 'flask-outline',
  'Nasal Drops': 'water-outline',
  'Anti-Allergic': 'shield-checkmark-outline',
  'Throat Lozenges': 'nutrition-outline',
  Insulin: 'water-outline',
  'Sugar Test Strips': 'barcode-outline',
  'Oral Tablets': 'bandage-outline',
  'Ayurvedic Sugar Care': 'leaf-outline',
  Multivitamins: 'sunny-outline',
  'Vitamin C': 'nutrition-outline',
  'Vitamin D3': 'sunny-outline',
  'Zinc & Immunity': 'shield-outline',
  Calcium: 'fitness-outline',
  Antacids: 'heart-outline',
  Probiotics: 'sparkles-outline',
  'Gas Relief': 'pulse-outline',
  Laxatives: 'water-outline',
  'Digestive Enzymes': 'flask-outline',
  Antifungal: 'shield-outline',
  Sunscreen: 'sunny-outline',
  'Acne Treatment': 'sparkles-outline',
  Moisturizers: 'water-outline',
  'Baby Diapers': 'happy-outline',
  'Baby Gripe Water': 'flask-outline',
  'Baby Lotion': 'water-outline',
  'Nasal Aspirators': 'medical-outline',
  Chyawanprash: 'leaf-outline',
  'Herbal Juices': 'color-fill-outline',
  'Herbal Pain Oils': 'beaker-outline',
  Ashwagandha: 'leaf-outline',
};

export const CategoryListingScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'CategoryListing'>>();
  const categorySlug = route.params?.categorySlug || 'pain-relief';
  const categoryName = route.params?.categoryName || 'Pain Relief';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sorting & Filtering States
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [tempFilters, setTempFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('all');
  const [wishlistSet, setWishlistSet] = useState<Set<string>>(new Set());

  const [selectedMedicineForVariant, setSelectedMedicineForVariant] = useState<Medicine | null>(null);

  const { items, summary, totalItemCount, addToCart, removeFromCart, updateQuantity, getItemQuantity, undoRemove } = useCart();
  const { selectedAddress } = useAddress();
  const { showToast } = useToast();

  const formattedCategoryName = useMemo(() => {
    if (categoryName) return categoryName;
    return categorySlug
      .split('-')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }, [categorySlug, categoryName]);

  const subcategories = useMemo(() => {
    return SUBCATEGORY_MAP[categorySlug] || ['All', 'Tablets', 'Syrups', 'Ointments'];
  }, [categorySlug]);

  const loadCategoryData = useCallback(async () => {
    try {
      setIsLoading(true);
      const meds = await MedicineService.getMedicinesByCategory(categorySlug);
      setAllMedicines(meds);
    } catch (e) {
      showToast('Failed to load category medicines', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [categorySlug, showToast]);

  useEffect(() => {
    loadCategoryData();
  }, [loadCategoryData]);

  // Extract unique brands for brand filter chips
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    allMedicines.forEach((m) => {
      if (m.brandName) brands.add(m.brandName);
      if (m.manufacturer) brands.add(m.manufacturer);
    });
    return Array.from(brands).slice(0, 8);
  }, [allMedicines]);

  // Compute filtered & sorted medicines
  const filteredMedicines = useMemo(() => {
    let result = [...allMedicines];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.genericName?.toLowerCase().includes(q) ||
          m.saltComposition.toLowerCase().includes(q)
      );
    }

    // 2. Subcategory Filter
    if (selectedSubcategory !== 'All') {
      const subLower = selectedSubcategory.toLowerCase();
      const subFiltered = result.filter(
        (m) =>
          m.uses.some((u) => u.toLowerCase().includes(subLower)) ||
          m.name.toLowerCase().includes(subLower) ||
          m.saltComposition.toLowerCase().includes(subLower) ||
          m.packForm?.toLowerCase().includes(subLower) ||
          m.description?.toLowerCase().includes(subLower)
      );
      if (subFiltered.length > 0) {
        result = subFiltered;
      }
    }

    // 3. Brand Chip Filter
    if (selectedBrandFilter !== 'all') {
      result = result.filter(
        (m) =>
          m.brandName?.toLowerCase() === selectedBrandFilter.toLowerCase() ||
          m.manufacturer.toLowerCase().includes(selectedBrandFilter.toLowerCase())
      );
    }

    // 4. Availability Filter
    if (filters.availability === 'in_stock') {
      result = result.filter((m) => m.inStock !== false);
    }

    // 5. Prescription Filter
    if (filters.prescription === 'otc_only') {
      result = result.filter((m) => !m.rxRequired);
    } else if (filters.prescription === 'rx_only') {
      result = result.filter((m) => m.rxRequired);
    }

    // 6. Price Range Filter
    if (filters.priceRange === '0_100') {
      result = result.filter((m) => m.discountPrice <= 100);
    } else if (filters.priceRange === '100_250') {
      result = result.filter((m) => m.discountPrice > 100 && m.discountPrice <= 250);
    } else if (filters.priceRange === '250_500') {
      result = result.filter((m) => m.discountPrice > 250 && m.discountPrice <= 500);
    } else if (filters.priceRange === '500_plus') {
      result = result.filter((m) => m.discountPrice > 500);
    }

    // 7. Sorting
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.discountPrice - b.discountPrice);
        break;
      case 'price_desc':
        result.sort((a, b) => b.discountPrice - a.discountPrice);
        break;
      case 'discount':
        result.sort((a, b) => b.discountPercentage - a.discountPercentage);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
        break;
      case 'fastest':
      case 'relevance':
      default:
        result.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
        break;
    }

    return result;
  }, [allMedicines, searchQuery, selectedSubcategory, selectedBrandFilter, filters, sortBy]);

  const toggleWishlist = (id: string) => {
    const next = new Set(wishlistSet);
    if (next.has(id)) {
      next.delete(id);
      showToast('Removed from wishlist', 'info');
    } else {
      next.add(id);
      showToast('Saved to wishlist', 'success');
    }
    setWishlistSet(next);
  };

  const freeDeliveryDeficit = Math.max(0, 199 - summary.itemTotal);

  if (isLoading) {
    return <LoadingState fullScreen message={`Loading ${formattedCategoryName}...`} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* =========================================================================
            1. TOP HEADER (Matching Screenshot: Back, Category Title, Heart, Search)
           ========================================================================= */}
        <View style={styles.topHeaderBar}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()} style={styles.headerIconButton}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <AppText variant="titleMedium" color={COLORS.textPrimary} weight="700" style={styles.headerTitle} numberOfLines={1}>
            {formattedCategoryName}
          </AppText>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => (navigation as any).navigate('Search', { initialQuery: formattedCategoryName })}
              style={styles.headerIconButton}
            >
              <Ionicons name="heart-outline" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Search', { initialQuery: formattedCategoryName })}
              style={[styles.headerIconButton, { marginLeft: 8 }]}
            >
              <Ionicons name="search-outline" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* =========================================================================
            2. MAIN SPLIT-SCREEN WORKSPACE (Left Subcategories Sidebar + Right Content)
           ========================================================================= */}
        <View style={styles.splitWorkspace}>
          {/* LEFT VERTICAL SUBCATEGORIES SIDEBAR */}
          <View style={styles.leftSidebar}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.leftSidebarScroll}>
              {subcategories.map((subcat) => {
                const isSelected = selectedSubcategory === subcat;
                const iconName = SUBCATEGORY_ICONS[subcat] || 'medkit-outline';

                return (
                  <TouchableOpacity
                    key={subcat}
                    activeOpacity={0.8}
                    onPress={() => setSelectedSubcategory(subcat)}
                    style={[styles.sidebarItem, isSelected && styles.sidebarItemActive]}
                  >
                    {/* Active Left Purple Bar Highlight */}
                    {isSelected && <View style={styles.sidebarActiveIndicator} />}

                    <View style={[styles.sidebarIconCircle, isSelected && styles.sidebarIconCircleActive]}>
                      <Ionicons
                        name={iconName}
                        size={20}
                        color={isSelected ? '#5B28D6' : COLORS.textSecondary}
                      />
                    </View>

                    <AppText
                      style={[styles.sidebarItemText, isSelected && styles.sidebarItemTextActive]}
                      numberOfLines={2}
                      align="center"
                    >
                      {subcat}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* RIGHT WORKSPACE AREA (Filters Bar + 2-Column Product Grid) */}
          <View style={styles.rightWorkspace}>
            {/* TOP FILTER CHIPS ROW */}
            <View style={styles.topFilterChipsWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topFilterChipsScroll}>
                {/* Main Filter Icon Button */}
                <TouchableOpacity activeOpacity={0.8} onPress={() => setIsFilterModalVisible(true)} style={styles.filterChipIconBtn}>
                  <Ionicons name="options-outline" size={16} color={COLORS.textPrimary} />
                </TouchableOpacity>

                {/* Brand Dropdown Filter */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedBrandFilter(selectedBrandFilter === 'all' ? availableBrands[0] || 'all' : 'all');
                  }}
                  style={[styles.filterChipItem, selectedBrandFilter !== 'all' && styles.filterChipItemActive]}
                >
                  <AppText style={[styles.filterChipText, selectedBrandFilter !== 'all' && styles.filterChipTextActive]}>
                    Brand {selectedBrandFilter !== 'all' ? `: ${selectedBrandFilter}` : '▾'}
                  </AppText>
                </TouchableOpacity>

                {/* Brand Chips */}
                {availableBrands.map((brand) => {
                  const isSel = selectedBrandFilter === brand;
                  return (
                    <TouchableOpacity
                      key={brand}
                      activeOpacity={0.8}
                      onPress={() => setSelectedBrandFilter(isSel ? 'all' : brand)}
                      style={[styles.filterChipItem, isSel && styles.filterChipItemActive]}
                    >
                      <AppText style={[styles.filterChipText, isSel && styles.filterChipTextActive]}>
                        {brand}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}

                {/* OTC / Prescription Filter Chip */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setFilters((prev) => ({
                      ...prev,
                      prescription: prev.prescription === 'otc_only' ? 'all' : 'otc_only',
                    }));
                  }}
                  style={[styles.filterChipItem, filters.prescription === 'otc_only' && styles.filterChipItemActive]}
                >
                  <AppText style={[styles.filterChipText, filters.prescription === 'otc_only' && styles.filterChipTextActive]}>
                    OTC Only
                  </AppText>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* 2-COLUMN PRODUCT GRID */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridScrollContent}>
              {filteredMedicines.length > 0 ? (
                <View style={styles.productGrid}>
                  {filteredMedicines.map((med) => {
                    const isWishlisted = wishlistSet.has(med.id);
                    return (
                      <View key={med.id} style={styles.gridItemWrapper}>
                        {/* Wishlist Heart Icon Overlaid at Top Right */}
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => toggleWishlist(med.id)}
                          style={styles.cardWishlistHeartBtn}
                        >
                          <Ionicons
                            name={isWishlisted ? 'heart' : 'heart-outline'}
                            size={18}
                            color={isWishlisted ? '#E11D48' : '#666666'}
                          />
                        </TouchableOpacity>

                        <MedicineCard
                          medicine={med}
                          onPress={() => navigation.navigate('MedicineDetails', { medicineId: med.id })}
                          onOpenVariantModal={(m) => setSelectedMedicineForVariant(m)}
                          onAddToCart={() => {
                            const added = addToCart(med, 1);
                            if (added) {
                              showToast(`Added ${med.name} to cart!`, 'success');
                            }
                          }}
                          onIncrement={() => {
                            const currentQty = getItemQuantity(med.id);
                            if (currentQty < 10) updateQuantity(med.id, currentQty + 1);
                          }}
                          onDecrement={() => {
                            const q = getItemQuantity(med.id);
                            if (q === 1) removeFromCart(med.id);
                            else updateQuantity(med.id, q - 1);
                          }}
                          cartQuantity={getItemQuantity(med.id)}
                          layout="grid"
                          style={styles.medicineCardOverride}
                        />
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={42} color={COLORS.textMuted} />
                  <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600" style={{ marginTop: 12 }}>
                    No items found
                  </AppText>
                  <AppText variant="caption" color={COLORS.textSecondary} align="center" style={{ marginTop: 4 }}>
                    Try selecting another subcategory or clear active brand filters.
                  </AppText>
                </View>
              )}
            </ScrollView>
          </View>
        </View>

        {/* =========================================================================
            3. BOTTOM FLOATING OFFER BANNER & CART PILL (Zepto-Style Dual Capsule)
           ========================================================================= */}
        <FloatingCart
          onPressViewCart={() => navigation.navigate('Cart')}
          bottomOffset={16}
        />

        {/* VARIANT MODAL */}
        {selectedMedicineForVariant && (
          <VariantSelectionModal
            visible={!!selectedMedicineForVariant}
            medicine={selectedMedicineForVariant}
            onClose={() => setSelectedMedicineForVariant(null)}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // 1. Top Header Bar
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 17,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // 2. Main Split Workspace
  splitWorkspace: {
    flex: 1,
    flexDirection: 'row',
  },

  // Left Sidebar Navigation
  leftSidebar: {
    width: 82,
    backgroundColor: '#FAFAFD',
    borderRightWidth: 1,
    borderRightColor: '#EFEFEF',
  },
  leftSidebarScroll: {
    paddingVertical: 8,
  },
  sidebarItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    position: 'relative',
    marginBottom: 4,
  },
  sidebarItemActive: {
    backgroundColor: '#ECE8F7',
  },
  sidebarActiveIndicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 4,
    backgroundColor: '#5B28D6',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  sidebarIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  sidebarIconCircleActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#5B28D6',
  },
  sidebarItemText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'LexendDeca_500Medium',
  },
  sidebarItemTextActive: {
    color: '#5B28D6',
    fontFamily: 'LexendDeca_700Bold',
  },

  // Right Workspace
  rightWorkspace: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topFilterChipsWrapper: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
    backgroundColor: '#FFFFFF',
  },
  topFilterChipsScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  filterChipIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E2EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E2EC',
    justifyContent: 'center',
  },
  filterChipItemActive: {
    backgroundColor: '#ECE8F7',
    borderColor: '#5B28D6',
  },
  filterChipText: {
    fontSize: 11.5,
    color: COLORS.textPrimary,
    fontFamily: 'LexendDeca_500Medium',
  },
  filterChipTextActive: {
    color: '#5B28D6',
    fontFamily: 'LexendDeca_700Bold',
  },

  // Grid Scroll Content
  gridScrollContent: {
    padding: 10,
    paddingBottom: 110,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItemWrapper: {
    width: '48.2%',
    position: 'relative',
  },
  cardWishlistHeartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicineCardOverride: {
    width: '100%',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },

  // 3. Bottom Floating Banner & Cart Pill (Exact Match to Screenshot)
  bottomFloatingContainer: {
    position: 'absolute',
    bottom: 24,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
  },

  // Left Dark Delivery Offer Banner
  darkOfferBanner: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 10,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  offersTopTag: {
    position: 'absolute',
    top: -9,
    left: 36,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 1.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E2EC',
  },
  offersTagText: {
    fontSize: 9.5,
    color: '#E11D48',
    fontFamily: 'LexendDeca_700Bold',
  },
  darkOfferContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scooterIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkOfferTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'LexendDeca_700Bold',
  },
  darkOfferSub: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontFamily: 'LexendDeca_400Regular',
    marginTop: 1,
  },

  // Right Magenta/Pink Cart Pill
  magentaCartPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E11D48',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cartIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBtnTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'LexendDeca_700Bold',
  },
  cartBtnSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 10,
    fontFamily: 'LexendDeca_500Medium',
  },
});

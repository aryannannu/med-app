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
import { MedicineCard } from '../../components/cards/MedicineCard';
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
};

export const CategoryListingScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'CategoryListing'>>();
  const { categorySlug, categoryName } = route.params;

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

  const { items, summary, totalItemCount, addToCart, getItemQuantity, updateQuantity } = useCart();
  const { selectedAddress } = useAddress();
  const { showToast } = useToast();

  const formattedCategoryName = useMemo(() => {
    if (categoryName) return categoryName;
    return categorySlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }, [categorySlug, categoryName]);

  const subcategories = useMemo(() => {
    return SUBCATEGORY_MAP[categorySlug] || ['All', 'Popular', 'Tablets', 'Syrups', 'Ointments'];
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
      result = result.filter(
        (m) =>
          m.uses.some((u) => u.toLowerCase().includes(selectedSubcategory.toLowerCase())) ||
          m.name.toLowerCase().includes(selectedSubcategory.toLowerCase()) ||
          m.saltComposition.toLowerCase().includes(selectedSubcategory.toLowerCase())
      );
    }

    // 3. Availability Filter
    if (filters.availability === 'in_stock') {
      result = result.filter((m) => m.inStock !== false);
    }

    // 4. Prescription Filter
    if (filters.prescription === 'otc_only') {
      result = result.filter((m) => !m.rxRequired);
    } else if (filters.prescription === 'rx_only') {
      result = result.filter((m) => m.rxRequired);
    }

    // 5. Price Range Filter
    if (filters.priceRange === '0_100') {
      result = result.filter((m) => m.discountPrice <= 100);
    } else if (filters.priceRange === '100_250') {
      result = result.filter((m) => m.discountPrice > 100 && m.discountPrice <= 250);
    } else if (filters.priceRange === '250_500') {
      result = result.filter((m) => m.discountPrice > 250 && m.discountPrice <= 500);
    } else if (filters.priceRange === '500_plus') {
      result = result.filter((m) => m.discountPrice > 500);
    }

    // 6. Discount Filter
    if (filters.minDiscount > 0) {
      result = result.filter((m) => m.discountPercentage >= filters.minDiscount);
    }

    // 7. Brand Filter
    if (filters.brand !== 'all') {
      result = result.filter((m) => m.manufacturer.toLowerCase().includes(filters.brand.toLowerCase()));
    }

    // 8. Sorting
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
  }, [allMedicines, searchQuery, selectedSubcategory, filters, sortBy]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.availability !== 'all') count++;
    if (filters.prescription !== 'all') count++;
    if (filters.priceRange !== 'all') count++;
    if (filters.minDiscount > 0) count++;
    if (filters.brand !== 'all') count++;
    return count;
  }, [filters]);

  const sortLabels: Record<SortOption, string> = {
    relevance: 'Relevance',
    fastest: 'Fastest Delivery',
    price_asc: 'Price: Low to High',
    price_desc: 'Price: High to Low',
    discount: 'Highest Discount',
    rating: 'Top Rated',
  };

  const openFilterModal = () => {
    setTempFilters({ ...filters });
    setIsFilterModalVisible(true);
  };

  const applyFilters = () => {
    setFilters({ ...tempFilters });
    setIsFilterModalVisible(false);
  };

  const clearAllFilters = () => {
    setTempFilters(INITIAL_FILTERS);
  };

  if (isLoading) {
    return <LoadingState fullScreen message={`Loading ${formattedCategoryName}...`} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 1. Header with back button, category title & location context */}
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <AppText variant="titleMedium" color={COLORS.textPrimary} weight="800" numberOfLines={1}>
              {formattedCategoryName}
            </AppText>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('AddressSelection', { isSelectingForCheckout: false })}
              style={styles.locationSubRow}
            >
              <Ionicons name="location" size={12} color={COLORS.primary} />
              <AppText variant="caption" color={COLORS.textSecondary} numberOfLines={1} style={{ marginLeft: 3, fontSize: 11 }}>
                Delivering to {selectedAddress?.label || 'Home'} • {selectedAddress?.city || 'Punjab'}
              </AppText>
              <Ionicons name="chevron-down" size={11} color={COLORS.textSecondary} style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>

          {/* Cart Badge in header if items in cart */}
          {totalItemCount > 0 && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Cart')}
              style={styles.headerCartBtn}
            >
              <Ionicons name="cart" size={20} color={COLORS.primary} />
              <View style={styles.headerBadgeCircle}>
                <AppText variant="caption" color="#FFFFFF" weight="800" style={{ fontSize: 9 }}>
                  {totalItemCount}
                </AppText>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* 2. Category-Scoped Search Bar */}
        <View style={styles.searchBarWrapper}>
          <View style={[styles.searchBar, SHADOWS.subtle]}>
            <Ionicons name="search" size={18} color={COLORS.primary} style={{ marginRight: SPACING.xs }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search in ${formattedCategoryName}`}
              placeholderTextColor={COLORS.textMuted}
              style={styles.searchInput}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 3. Horizontal Subcategories Selector */}
        <View style={styles.subcategoriesWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subcategoriesScroll}>
            {subcategories.map((subcat) => {
              const isSelected = selectedSubcategory === subcat;
              return (
                <TouchableOpacity
                  key={subcat}
                  activeOpacity={0.8}
                  onPress={() => setSelectedSubcategory(subcat)}
                  style={[styles.subcategoryChip, isSelected && styles.subcategoryChipActive]}
                >
                  <AppText
                    variant="caption"
                    color={isSelected ? '#FFFFFF' : COLORS.textPrimary}
                    weight={isSelected ? '800' : '600'}
                  >
                    {subcat}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 4. Sticky Filter + Sort Bar & Result Count */}
        <View style={styles.filterSortBar}>
          <AppText variant="caption" color={COLORS.textSecondary} weight="600">
            {filteredMedicines.length} {filteredMedicines.length === 1 ? 'medicine' : 'medicines'} available
          </AppText>

          <View style={styles.filterSortActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={openFilterModal}
              style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
            >
              <Ionicons
                name="options-outline"
                size={14}
                color={activeFilterCount > 0 ? COLORS.primary : COLORS.textPrimary}
              />
              <AppText
                variant="caption"
                color={activeFilterCount > 0 ? COLORS.primary : COLORS.textPrimary}
                weight="700"
                style={{ marginLeft: 4 }}
              >
                Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsSortModalVisible(true)}
              style={styles.sortBtn}
            >
              <Ionicons name="swap-vertical" size={14} color={COLORS.textPrimary} />
              <AppText variant="caption" color={COLORS.textPrimary} weight="700" style={{ marginLeft: 4 }}>
                {sortLabels[sortBy]} ˅
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. Medicines Listing Grid */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.medicinesGridContent}
        >
          {filteredMedicines.length > 0 ? (
            <View style={styles.medicinesGrid}>
              {filteredMedicines.map((med) => (
                <MedicineCard
                  key={med.id}
                  medicine={med}
                  onPress={() => navigation.navigate('MedicineDetails', { medicineId: med.id })}
                  onAddToCart={() => {
                    addToCart(med, 1);
                    showToast(`Added ${med.name} to cart!`, 'success');
                  }}
                  onIncrement={() => addToCart(med, 1)}
                  onDecrement={() => {
                    const q = getItemQuantity(med.id);
                    updateQuantity(med.id, q - 1);
                  }}
                  cartQuantity={getItemQuantity(med.id)}
                  layout="grid"
                  style={styles.gridMedicineCard}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
              <AppText variant="titleMedium" color={COLORS.textPrimary} weight="800" style={{ marginTop: SPACING.md }}>
                No medicines found
              </AppText>
              <AppText variant="caption" color={COLORS.textSecondary} align="center" style={{ marginTop: 4, maxWidth: 260 }}>
                Try adjusting your search query or reset your active filters.
              </AppText>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedSubcategory('All');
                  setFilters(INITIAL_FILTERS);
                }}
                style={styles.resetFiltersBtn}
              >
                <AppText variant="buttonSmall" color={COLORS.primary} weight="700">
                  Reset All Filters
                </AppText>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* 6. Floating Cart Indicator */}
        {totalItemCount > 0 && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Cart')}
            style={[styles.floatingCart, SHADOWS.modal]}
          >
            <View style={styles.floatingCartLeft}>
              <View style={styles.floatingCartBadge}>
                <Ionicons name="cart" size={16} color={COLORS.primary} />
                <AppText variant="caption" color={COLORS.primary} weight="800" style={{ marginLeft: 4 }}>
                  {totalItemCount} {totalItemCount === 1 ? 'Medicine' : 'Medicines'}
                </AppText>
              </View>
              <AppText variant="titleSmall" color="#FFFFFF" weight="800" style={{ marginLeft: SPACING.md }}>
                {formatCurrency(summary.estimatedFinalTotal)}
              </AppText>
            </View>

            <View style={styles.floatingCartRight}>
              <AppText variant="buttonSmall" color="#FFFFFF" weight="700">
                View Cart
              </AppText>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>
        )}

        {/* 7. Comprehensive Filter Modal / Bottom Sheet */}
        <Modal
          visible={isFilterModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setIsFilterModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.filterModalContent}>
              {/* Filter Header */}
              <View style={styles.filterModalHeader}>
                <TouchableOpacity onPress={() => setIsFilterModalVisible(false)} style={{ padding: 4 }}>
                  <Ionicons name="close" size={22} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <AppText variant="titleMedium" color={COLORS.textPrimary} weight="800">
                  Filters
                </AppText>
                <TouchableOpacity onPress={clearAllFilters} style={{ padding: 4 }}>
                  <AppText variant="caption" color={COLORS.primary} weight="700">
                    Clear All
                  </AppText>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.filterModalBody}>
                {/* 1. Availability */}
                <View style={styles.filterGroup}>
                  <AppText variant="titleSmall" color={COLORS.textPrimary} weight="800" style={styles.filterGroupTitle}>
                    Availability
                  </AppText>
                  <View style={styles.filterOptionsWrap}>
                    {[
                      { id: 'all', label: 'All Items' },
                      { id: 'in_stock', label: 'In Stock Only' },
                    ].map((opt) => (
                      <TouchableOpacity
                        key={opt.id}
                        onPress={() => setTempFilters((prev) => ({ ...prev, availability: opt.id as any }))}
                        style={[
                          styles.filterOptionPill,
                          tempFilters.availability === opt.id && styles.filterOptionPillActive,
                        ]}
                      >
                        <AppText
                          variant="caption"
                          color={tempFilters.availability === opt.id ? '#FFFFFF' : COLORS.textPrimary}
                          weight="700"
                        >
                          {opt.label}
                        </AppText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* 2. Prescription (Rx / OTC) */}
                <View style={styles.filterGroup}>
                  <AppText variant="titleSmall" color={COLORS.textPrimary} weight="800" style={styles.filterGroupTitle}>
                    Prescription Type
                  </AppText>
                  <View style={styles.filterOptionsWrap}>
                    {[
                      { id: 'all', label: 'All Medicines' },
                      { id: 'otc_only', label: 'OTC (No Rx Needed)' },
                      { id: 'rx_only', label: 'Prescription Required (Rx)' },
                    ].map((opt) => (
                      <TouchableOpacity
                        key={opt.id}
                        onPress={() => setTempFilters((prev) => ({ ...prev, prescription: opt.id as any }))}
                        style={[
                          styles.filterOptionPill,
                          tempFilters.prescription === opt.id && styles.filterOptionPillActive,
                        ]}
                      >
                        <AppText
                          variant="caption"
                          color={tempFilters.prescription === opt.id ? '#FFFFFF' : COLORS.textPrimary}
                          weight="700"
                        >
                          {opt.label}
                        </AppText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* 3. Price Range */}
                <View style={styles.filterGroup}>
                  <AppText variant="titleSmall" color={COLORS.textPrimary} weight="800" style={styles.filterGroupTitle}>
                    Price Range
                  </AppText>
                  <View style={styles.filterOptionsWrap}>
                    {[
                      { id: 'all', label: 'Any Price' },
                      { id: '0_100', label: '₹0 – ₹100' },
                      { id: '100_250', label: '₹100 – ₹250' },
                      { id: '250_500', label: '₹250 – ₹500' },
                      { id: '500_plus', label: '₹500+' },
                    ].map((opt) => (
                      <TouchableOpacity
                        key={opt.id}
                        onPress={() => setTempFilters((prev) => ({ ...prev, priceRange: opt.id as any }))}
                        style={[
                          styles.filterOptionPill,
                          tempFilters.priceRange === opt.id && styles.filterOptionPillActive,
                        ]}
                      >
                        <AppText
                          variant="caption"
                          color={tempFilters.priceRange === opt.id ? '#FFFFFF' : COLORS.textPrimary}
                          weight="700"
                        >
                          {opt.label}
                        </AppText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* 4. Minimum Discounts */}
                <View style={styles.filterGroup}>
                  <AppText variant="titleSmall" color={COLORS.textPrimary} weight="800" style={styles.filterGroupTitle}>
                    Discounts &amp; Offers
                  </AppText>
                  <View style={styles.filterOptionsWrap}>
                    {[
                      { val: 0, label: 'All Deals' },
                      { val: 10, label: '10% & above' },
                      { val: 20, label: '20% & above' },
                    ].map((opt) => (
                      <TouchableOpacity
                        key={opt.val}
                        onPress={() => setTempFilters((prev) => ({ ...prev, minDiscount: opt.val }))}
                        style={[
                          styles.filterOptionPill,
                          tempFilters.minDiscount === opt.val && styles.filterOptionPillActive,
                        ]}
                      >
                        <AppText
                          variant="caption"
                          color={tempFilters.minDiscount === opt.val ? '#FFFFFF' : COLORS.textPrimary}
                          weight="700"
                        >
                          {opt.label}
                        </AppText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* 5. Brand / Manufacturer */}
                <View style={styles.filterGroup}>
                  <AppText variant="titleSmall" color={COLORS.textPrimary} weight="800" style={styles.filterGroupTitle}>
                    Top Brands
                  </AppText>
                  <View style={styles.filterOptionsWrap}>
                    {['all', 'Micro Labs', 'Cipla', 'Sun Pharma', 'GlaxoSmithKline', 'Abbott'].map((b) => (
                      <TouchableOpacity
                        key={b}
                        onPress={() => setTempFilters((prev) => ({ ...prev, brand: b }))}
                        style={[
                          styles.filterOptionPill,
                          tempFilters.brand === b && styles.filterOptionPillActive,
                        ]}
                      >
                        <AppText
                          variant="caption"
                          color={tempFilters.brand === b ? '#FFFFFF' : COLORS.textPrimary}
                          weight="700"
                        >
                          {b === 'all' ? 'All Brands' : b}
                        </AppText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              {/* Sticky Filter Bottom CTA */}
              <View style={styles.filterModalFooter}>
                <TouchableOpacity activeOpacity={0.85} onPress={applyFilters} style={styles.applyFilterBtn}>
                  <AppText variant="labelLarge" color="#FFFFFF" weight="800">
                    Apply Filters
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* 8. Sort Selection Modal */}
        <Modal
          visible={isSortModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setIsSortModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setIsSortModalVisible(false)}
            style={styles.modalOverlay}
          >
            <View style={styles.sortModalContent}>
              <View style={styles.sortModalHeader}>
                <AppText variant="titleMedium" color={COLORS.textPrimary} weight="800">
                  Sort By
                </AppText>
                <TouchableOpacity onPress={() => setIsSortModalVisible(false)}>
                  <Ionicons name="close" size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>

              {(Object.keys(sortLabels) as SortOption[]).map((key) => {
                const isSelected = sortBy === key;
                return (
                  <TouchableOpacity
                    key={key}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSortBy(key);
                      setIsSortModalVisible(false);
                    }}
                    style={styles.sortOptionRow}
                  >
                    <AppText
                      variant="bodyMedium"
                      color={isSelected ? COLORS.primary : COLORS.textPrimary}
                      weight={isSelected ? '800' : '500'}
                    >
                      {sortLabels[key]}
                    </AppText>
                    {isSelected && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8FC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F8FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EE',
  },
  backBtn: {
    padding: 6,
    marginRight: SPACING.xs,
  },
  headerCenter: {
    flex: 1,
  },
  locationSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  headerCartBtn: {
    position: 'relative',
    padding: 8,
    backgroundColor: '#ECE8F7',
    borderRadius: BORDER_RADIUS.full,
    marginLeft: SPACING.xs,
  },
  headerBadgeCircle: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  searchBarWrapper: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8FC',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'LexendDeca_400Regular',
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  subcategoriesWrapper: {
    backgroundColor: '#FFFFFF',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EE',
  },
  subcategoriesScroll: {
    paddingHorizontal: SPACING.md,
  },
  subcategoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginRight: SPACING.xs,
  },
  subcategoryChipActive: {
    backgroundColor: '#3A2986',
    borderColor: '#3A2986',
  },
  filterSortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EE',
  },
  filterSortActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: SPACING.xs,
  },
  filterBtnActive: {
    backgroundColor: '#ECE8F7',
    borderColor: '#DCD5F0',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  medicinesGridContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  medicinesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridMedicineCard: {
    width: '48%',
    marginRight: 0,
    marginBottom: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  resetFiltersBtn: {
    marginTop: SPACING.md,
    backgroundColor: '#ECE8F7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#DCD5F0',
  },
  floatingCart: {
    position: 'absolute',
    bottom: 12,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
  },
  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  floatingCartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  floatingCartRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Filter Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 24 : SPACING.md,
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EE',
  },
  filterModalBody: {
    padding: SPACING.md,
  },
  filterGroup: {
    marginBottom: SPACING.lg,
  },
  filterGroupTitle: {
    marginBottom: SPACING.sm,
  },
  filterOptionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOptionPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  filterOptionPillActive: {
    backgroundColor: '#3A2986',
    borderColor: '#3A2986',
  },
  filterModalFooter: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#E8E8EE',
  },
  applyFilterBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sort Modal Styles
  sortModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? 32 : SPACING.lg,
  },
  sortModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sortOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8FC',
  },
});

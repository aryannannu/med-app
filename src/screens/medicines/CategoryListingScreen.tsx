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
import { useAppTheme } from '../../store/ThemeContext';
import { formatCurrency } from '../../utils/currency';

type SortOption =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'discount'
  | 'fastest'
  | 'popular'
  | 'rating';

const SORT_LABELS: Record<SortOption, string> = {
  relevance: 'Relevance',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  discount: 'Discount: High to Low',
  fastest: 'Fastest Delivery',
  popular: 'Most Popular',
  rating: 'Highest Rated',
};

interface FilterState {
  availability: 'all' | 'nearby' | 'in_stock' | 'fast_delivery';
  prescription: 'all' | 'otc_only' | 'rx_only';
  deliveryTime: 'all' | '10_15' | 'under_30';
  priceRange: 'all' | '0_100' | '100_250' | '250_500' | '500_1000' | '1000_plus';
  minDiscount: number; // 0, 10, 20, 30
  brands: string[];
  forms: string[];
  strengths: string[];
  packSizes: string[];
  salts: string[];
  storeAvailability: number; // 0, 1, 3, 5
  minRating: number; // 0, 3, 4
  ageGroup?: string;
  petType?: string;
  deviceType?: string;
}

const INITIAL_FILTERS: FilterState = {
  availability: 'all',
  prescription: 'all',
  deliveryTime: 'all',
  priceRange: 'all',
  minDiscount: 0,
  brands: [],
  forms: [],
  strengths: [],
  packSizes: [],
  salts: [],
  storeAvailability: 0,
  minRating: 0,
};

type FilterGroupId =
  | 'availability'
  | 'prescription'
  | 'delivery'
  | 'price'
  | 'discount'
  | 'brand'
  | 'form'
  | 'strength'
  | 'pack_size'
  | 'salt'
  | 'stores'
  | 'rating'
  | 'age_group'
  | 'pet_type'
  | 'device_type';

const SUBCATEGORY_MAP: Record<string, string[]> = {
  'pain-relief': ['All', 'Headache', 'Fever', 'Body Pain', 'Muscle Pain', 'Joint Pain'],
  'pain-fever': ['All', 'Headache', 'Fever', 'Body Pain', 'Muscle Pain', 'Joint Pain'],
  'cold-flu': ['All', 'Cough Syrups', 'Nasal Drops', 'Anti-Allergic', 'Throat Lozenges'],
  'cold-cough': ['All', 'Cough Syrups', 'Nasal Drops', 'Anti-Allergic', 'Throat Lozenges'],
  diabetes: ['All', 'Insulin', 'Sugar Test Strips', 'Oral Tablets', 'Ayurvedic Sugar Care'],
  vitamins: ['All', 'Multivitamins', 'Vitamin C', 'Vitamin D3', 'Zinc & Immunity', 'Calcium'],
  digestive: ['All', 'Antacids', 'Probiotics', 'Gas Relief', 'Laxatives', 'Digestive Enzymes'],
  digestion: ['All', 'Antacids', 'Probiotics', 'Gas Relief', 'Laxatives', 'Digestive Enzymes'],
  skin: ['All', 'Antifungal', 'Sunscreen', 'Acne Treatment', 'Moisturizers'],
  'skin-care': ['All', 'Antifungal', 'Sunscreen', 'Acne Treatment', 'Moisturizers'],
  baby: ['All', 'Baby Diapers', 'Baby Gripe Water', 'Baby Lotion', 'Nasal Aspirators'],
  ayurveda: ['All', 'Chyawanprash', 'Herbal Juices', 'Herbal Pain Oils', 'Ashwagandha'],
  'heart-bp': ['All', 'BP Tablets', 'Cholesterol', 'Heart Tonics'],
  'eye-ear': ['All', 'Eye Drops', 'Ear Drops', 'Eye Wipes'],
  wellness: ['All', 'Supplements', 'Performance', 'Daily Care'],
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

// Helper: Extract form from medicine
const getMedicineForm = (m: Medicine): string => {
  const text = `${m.packForm || ''} ${m.name || ''} ${m.description || ''}`.toLowerCase();
  if (text.includes('capsule')) return 'Capsule';
  if (text.includes('syrup') || text.includes('liquid') || text.includes('suspension')) return 'Syrup';
  if (text.includes('drop')) return 'Drops';
  if (text.includes('cream') || text.includes('ointment')) return 'Cream';
  if (text.includes('gel')) return 'Gel';
  if (text.includes('spray')) return 'Spray';
  if (text.includes('inhaler')) return 'Inhaler';
  if (text.includes('powder') || text.includes('sachet')) return 'Powder';
  if (text.includes('device') || text.includes('monitor') || text.includes('meter')) return 'Device';
  return 'Tablet';
};

// Helper: Extract strength from medicine
const getMedicineStrength = (m: Medicine): string | null => {
  const match = (m.saltComposition || m.name).match(/(\d+(?:\.\d+)?\s*(?:mg|mcg|gm|g|ml))/i);
  return match ? match[0].toLowerCase().replace(/\s+/g, '') : null;
};

// Helper: Extract store availability count (mocked 1–6 based on medicine)
const getNearbyStoreCount = (m: Medicine): number => {
  return Math.max(1, (m.name.length % 6) + 1);
};

export const CategoryListingScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'CategoryListing'>>();
  const categorySlug = route.params?.categorySlug || 'pain-relief';
  const categoryName = route.params?.categoryName || 'Pain Relief';

  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sorting & Filtering States
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [tempFilters, setTempFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [activeFilterGroup, setActiveFilterGroup] = useState<FilterGroupId>('availability');
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [saltSearchQuery, setSaltSearchQuery] = useState('');

  const [wishlistSet, setWishlistSet] = useState<Set<string>>(new Set());
  const [selectedMedicineForVariant, setSelectedMedicineForVariant] = useState<Medicine | null>(null);

  const { items, summary, totalItemCount, addToCart, removeFromCart, updateQuantity, getItemQuantity, undoRemove } = useCart();
  const { selectedAddress } = useAddress();
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();

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

  // Contextual category classification
  const isBabyCategory = categorySlug.includes('baby') || categorySlug.includes('mother');
  const isVetCategory = categorySlug.includes('vet') || categorySlug.includes('pet');
  const isDevicesCategory = categorySlug.includes('surgical') || categorySlug.includes('device');
  const isMedicineCategory = !isBabyCategory && !isVetCategory && !isDevicesCategory;

  // Extract dynamically available facet values from loaded medicines
  const facetData = useMemo(() => {
    const brandsSet = new Set<string>();
    const formsSet = new Set<string>();
    const strengthsSet = new Set<string>();
    const packSizesSet = new Set<string>();
    const saltsSet = new Set<string>();

    allMedicines.forEach((m) => {
      if (m.brandName) brandsSet.add(m.brandName);
      if (m.manufacturer) brandsSet.add(m.manufacturer);
      formsSet.add(getMedicineForm(m));
      const str = getMedicineStrength(m);
      if (str) strengthsSet.add(str);
      if (m.packForm) packSizesSet.add(m.packForm.split(' ')[0] || 'Strip');
      if (m.saltComposition) {
        m.saltComposition.split(/[\+,]/).forEach((s) => {
          const clean = s.trim().split(/\d+/)[0]?.trim();
          if (clean && clean.length > 2) saltsSet.add(clean);
        });
      }
    });

    return {
      brands: Array.from(brandsSet).slice(0, 20),
      forms: Array.from(formsSet),
      strengths: Array.from(strengthsSet).slice(0, 10),
      packSizes: ['Strip', 'Bottle', 'Tube', 'Sachet', 'Box', 'Pack of 2'],
      salts: Array.from(saltsSet).slice(0, 15),
    };
  }, [allMedicines]);

  // Core Filtering Engine function (reusable for both live listing & temp modal count)
  const executeFilterLogic = useCallback(
    (source: Medicine[], currentFilter: FilterState): Medicine[] => {
      return source.filter((m) => {
        // 1. Availability
        if (currentFilter.availability === 'in_stock' && m.inStock === false) return false;
        if (currentFilter.availability === 'nearby' && getNearbyStoreCount(m) < 2) return false;
        if (currentFilter.availability === 'fast_delivery' && !m.isPopular) return false;

        // 2. Prescription
        if (currentFilter.prescription === 'otc_only' && m.rxRequired) return false;
        if (currentFilter.prescription === 'rx_only' && !m.rxRequired) return false;

        // 3. Delivery Time
        if (currentFilter.deliveryTime === '10_15' && !m.isPopular) return false;

        // 4. Price Range
        if (currentFilter.priceRange === '0_100' && m.discountPrice > 100) return false;
        if (currentFilter.priceRange === '100_250' && (m.discountPrice <= 100 || m.discountPrice > 250)) return false;
        if (currentFilter.priceRange === '250_500' && (m.discountPrice <= 250 || m.discountPrice > 500)) return false;
        if (currentFilter.priceRange === '500_1000' && (m.discountPrice <= 500 || m.discountPrice > 1000)) return false;
        if (currentFilter.priceRange === '1000_plus' && m.discountPrice <= 1000) return false;

        // 5. Discount
        if (currentFilter.minDiscount > 0 && (m.discountPercentage || 0) < currentFilter.minDiscount) return false;

        // 6. Brand
        if (currentFilter.brands.length > 0) {
          const brandMatch = currentFilter.brands.some(
            (b) =>
              (m.brandName || '').toLowerCase() === b.toLowerCase() ||
              (m.manufacturer || '').toLowerCase().includes(b.toLowerCase())
          );
          if (!brandMatch) return false;
        }

        // 7. Medicine Form
        if (currentFilter.forms.length > 0) {
          const form = getMedicineForm(m);
          if (!currentFilter.forms.includes(form)) return false;
        }

        // 8. Strength / Dosage
        if (currentFilter.strengths.length > 0) {
          const str = getMedicineStrength(m);
          if (!str || !currentFilter.strengths.includes(str)) return false;
        }

        // 9. Pack Size
        if (currentFilter.packSizes.length > 0) {
          const packLower = (m.packForm || '').toLowerCase();
          const packMatch = currentFilter.packSizes.some((p) => packLower.includes(p.toLowerCase()));
          if (!packMatch) return false;
        }

        // 10. Salt / Composition
        if (currentFilter.salts.length > 0) {
          const saltLower = (m.saltComposition || '').toLowerCase();
          const saltMatch = currentFilter.salts.some((s) => saltLower.includes(s.toLowerCase()));
          if (!saltMatch) return false;
        }

        // 11. Store Availability
        if (currentFilter.storeAvailability > 0 && getNearbyStoreCount(m) < currentFilter.storeAvailability) {
          return false;
        }

        // 12. Rating
        if (currentFilter.minRating > 0 && (m.rating || 4.5) < currentFilter.minRating) {
          return false;
        }

        return true;
      });
    },
    []
  );

  // Filtered & Sorted medicines for the page
  const filteredMedicines = useMemo(() => {
    let result = [...allMedicines];

    // Subcategory Filter
    if (selectedSubcategory !== 'All') {
      const subLower = selectedSubcategory.toLowerCase();
      const subFiltered = result.filter(
        (m) =>
          m.uses.some((u) => u.toLowerCase().includes(subLower)) ||
          m.name.toLowerCase().includes(subLower) ||
          m.saltComposition.toLowerCase().includes(subLower) ||
          (m.packForm || '').toLowerCase().includes(subLower)
      );
      if (subFiltered.length > 0) result = subFiltered;
    }

    // Apply active filter state
    result = executeFilterLogic(result, filters);

    // Sorting
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
      case 'fastest':
        result.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
        break;
      case 'popular':
        result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
        break;
      case 'relevance':
      default:
        result.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
        break;
    }

    return result;
  }, [allMedicines, selectedSubcategory, filters, sortBy, executeFilterLogic]);

  // Dynamic count for the "Show X Products" button inside the modal
  const tempMatchingCount = useMemo(() => {
    let list = [...allMedicines];
    if (selectedSubcategory !== 'All') {
      const subLower = selectedSubcategory.toLowerCase();
      const subFiltered = list.filter(
        (m) =>
          m.uses.some((u) => u.toLowerCase().includes(subLower)) ||
          m.name.toLowerCase().includes(subLower) ||
          m.saltComposition.toLowerCase().includes(subLower)
      );
      if (subFiltered.length > 0) list = subFiltered;
    }
    return executeFilterLogic(list, tempFilters).length;
  }, [allMedicines, selectedSubcategory, tempFilters, executeFilterLogic]);

  // Removable active filter chips list
  const activeFilterChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];

    if (filters.availability === 'nearby') {
      chips.push({ key: 'avail_nearby', label: 'Available nearby', onRemove: () => setFilters((f) => ({ ...f, availability: 'all' })) });
    } else if (filters.availability === 'in_stock') {
      chips.push({ key: 'avail_stock', label: 'In stock', onRemove: () => setFilters((f) => ({ ...f, availability: 'all' })) });
    } else if (filters.availability === 'fast_delivery') {
      chips.push({ key: 'avail_fast', label: 'Fast delivery', onRemove: () => setFilters((f) => ({ ...f, availability: 'all' })) });
    }

    if (filters.prescription === 'otc_only') {
      chips.push({ key: 'rx_otc', label: 'OTC only', onRemove: () => setFilters((f) => ({ ...f, prescription: 'all' })) });
    } else if (filters.prescription === 'rx_only') {
      chips.push({ key: 'rx_req', label: 'Rx required', onRemove: () => setFilters((f) => ({ ...f, prescription: 'all' })) });
    }

    if (filters.deliveryTime === '10_15') {
      chips.push({ key: 'del_15', label: '10–15 min', onRemove: () => setFilters((f) => ({ ...f, deliveryTime: 'all' })) });
    } else if (filters.deliveryTime === 'under_30') {
      chips.push({ key: 'del_30', label: 'Under 30 min', onRemove: () => setFilters((f) => ({ ...f, deliveryTime: 'all' })) });
    }

    if (filters.priceRange !== 'all') {
      const pLabels: Record<string, string> = {
        '0_100': 'Under ₹100',
        '100_250': '₹100–₹250',
        '250_500': '₹250–₹500',
        '500_1000': '₹500–₹1000',
        '1000_plus': '₹1000+',
      };
      chips.push({ key: 'price', label: pLabels[filters.priceRange] || filters.priceRange, onRemove: () => setFilters((f) => ({ ...f, priceRange: 'all' })) });
    }

    if (filters.minDiscount > 0) {
      chips.push({ key: 'discount', label: `${filters.minDiscount}%+ Off`, onRemove: () => setFilters((f) => ({ ...f, minDiscount: 0 })) });
    }

    filters.brands.forEach((b) => {
      chips.push({ key: `brand_${b}`, label: b, onRemove: () => setFilters((f) => ({ ...f, brands: f.brands.filter((x) => x !== b) })) });
    });

    filters.forms.forEach((fm) => {
      chips.push({ key: `form_${fm}`, label: fm, onRemove: () => setFilters((f) => ({ ...f, forms: f.forms.filter((x) => x !== fm) })) });
    });

    filters.strengths.forEach((st) => {
      chips.push({ key: `str_${st}`, label: st, onRemove: () => setFilters((f) => ({ ...f, strengths: f.strengths.filter((x) => x !== st) })) });
    });

    if (filters.storeAvailability > 0) {
      chips.push({ key: 'stores', label: `${filters.storeAvailability}+ Nearby Stores`, onRemove: () => setFilters((f) => ({ ...f, storeAvailability: 0 })) });
    }

    if (filters.minRating > 0) {
      chips.push({ key: 'rating', label: `${filters.minRating}★ & above`, onRemove: () => setFilters((f) => ({ ...f, minRating: 0 })) });
    }

    return chips;
  }, [filters]);

  const activeFilterCount = activeFilterChips.length;

  const handleClearAll = () => {
    setFilters(INITIAL_FILTERS);
    setTempFilters(INITIAL_FILTERS);
    showToast('Filters cleared', 'info');
  };

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

  // Group definitions for the Left Rail in the Filter Modal
  const filterGroups = useMemo(() => {
    const groups: { id: FilterGroupId; label: string; count: number }[] = [
      { id: 'availability', label: 'Availability', count: tempFilters.availability !== 'all' ? 1 : 0 },
      { id: 'prescription', label: 'Prescription', count: tempFilters.prescription !== 'all' ? 1 : 0 },
      { id: 'delivery', label: 'Delivery Time', count: tempFilters.deliveryTime !== 'all' ? 1 : 0 },
      { id: 'price', label: 'Price', count: tempFilters.priceRange !== 'all' ? 1 : 0 },
      { id: 'discount', label: 'Discount', count: tempFilters.minDiscount > 0 ? 1 : 0 },
      { id: 'brand', label: 'Brand', count: tempFilters.brands.length },
    ];

    if (isMedicineCategory) {
      groups.push(
        { id: 'form', label: 'Medicine Form', count: tempFilters.forms.length },
        { id: 'strength', label: 'Strength / Dosage', count: tempFilters.strengths.length },
        { id: 'pack_size', label: 'Pack Size', count: tempFilters.packSizes.length },
        { id: 'salt', label: 'Composition / Salt', count: tempFilters.salts.length },
        { id: 'stores', label: 'Store Availability', count: tempFilters.storeAvailability > 0 ? 1 : 0 },
        { id: 'rating', label: 'Rating', count: tempFilters.minRating > 0 ? 1 : 0 }
      );
    } else if (isBabyCategory) {
      groups.push(
        { id: 'age_group', label: 'Age Group', count: tempFilters.ageGroup ? 1 : 0 },
        { id: 'rating', label: 'Rating', count: tempFilters.minRating > 0 ? 1 : 0 },
        { id: 'stores', label: 'Store Availability', count: tempFilters.storeAvailability > 0 ? 1 : 0 }
      );
    } else if (isDevicesCategory) {
      groups.push(
        { id: 'device_type', label: 'Device Type', count: tempFilters.deviceType ? 1 : 0 },
        { id: 'rating', label: 'Rating', count: tempFilters.minRating > 0 ? 1 : 0 },
        { id: 'stores', label: 'Store Availability', count: tempFilters.storeAvailability > 0 ? 1 : 0 }
      );
    }

    return groups;
  }, [tempFilters, isMedicineCategory, isBabyCategory, isDevicesCategory]);

  if (isLoading) {
    return <LoadingState fullScreen message={`Loading ${formattedCategoryName}...`} />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.topHeaderBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()} style={styles.headerIconButton}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <AppText variant="titleMedium" color={colors.textPrimary} weight="700" style={styles.headerTitle} numberOfLines={1}>
            {formattedCategoryName}
          </AppText>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => (navigation as any).navigate('Search', { initialQuery: formattedCategoryName })}
              style={styles.headerIconButton}
            >
              <Ionicons name="search-outline" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Workspace */}
        <View style={styles.splitWorkspace}>
          {/* LEFT SIDEBAR (Subcategories) */}
          <View style={[styles.leftSidebar, { backgroundColor: colors.surfaceSubtle, borderRightColor: colors.border }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.leftSidebarScroll}>
              {subcategories.map((subcat) => {
                const isSelected = selectedSubcategory === subcat;
                const iconName = SUBCATEGORY_ICONS[subcat] || 'medkit-outline';

                return (
                  <TouchableOpacity
                    key={subcat}
                    activeOpacity={0.8}
                    onPress={() => setSelectedSubcategory(subcat)}
                    style={[styles.sidebarItem, isSelected && { backgroundColor: colors.primaryMuted }]}
                  >
                    {isSelected && <View style={[styles.sidebarActiveIndicator, { backgroundColor: colors.primary }]} />}
                    <View style={[styles.sidebarIconCircle, { backgroundColor: colors.surface, borderColor: isSelected ? colors.primary : colors.border }]}>
                      <Ionicons name={iconName} size={20} color={isSelected ? colors.primary : colors.textSecondary} />
                    </View>
                    <AppText
                      style={[styles.sidebarItemText, { color: isSelected ? colors.primary : colors.textSecondary }, isSelected && styles.sidebarItemTextActive]}
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

          {/* RIGHT WORKSPACE */}
          <View style={[styles.rightWorkspace, { backgroundColor: colors.background }]}>
            {/* STICKY FILTER ENTRY ROW: [ Filters (N) ] [ Sort: Relevance ▾ ] */}
            <View style={[styles.stickyFilterRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setTempFilters(filters);
                  setIsFilterModalVisible(true);
                }}
                style={[
                  styles.filterButtonPill,
                  activeFilterCount > 0 && {
                    backgroundColor: isDark ? 'rgba(58,41,134,0.25)' : '#F3EFFF',
                    borderColor: '#3A2986',
                  },
                ]}
              >
                <Ionicons
                  name="options-outline"
                  size={15}
                  color={activeFilterCount > 0 ? '#3A2986' : colors.textPrimary}
                  style={{ marginRight: 6 }}
                />
                <AppText
                  style={[
                    styles.filterButtonText,
                    activeFilterCount > 0 && { color: '#3A2986', fontWeight: '700' },
                  ]}
                >
                  Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setIsSortModalVisible(true)}
                style={styles.sortButtonPill}
              >
                <AppText style={styles.sortButtonText} numberOfLines={1}>
                  Sort: {SORT_LABELS[sortBy]}
                </AppText>
                <Ionicons name="chevron-down" size={13} color={colors.textSecondary} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>

            {/* REMOVABLE ACTIVE CHIPS ROW */}
            {activeFilterChips.length > 0 && (
              <View style={[styles.activeChipsBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeChipsScroll}>
                  {activeFilterChips.map((chip) => (
                    <TouchableOpacity
                      key={chip.key}
                      activeOpacity={0.75}
                      onPress={chip.onRemove}
                      style={[styles.removableActiveChip, { backgroundColor: isDark ? 'rgba(58,41,134,0.3)' : '#F3EFFF', borderColor: '#3A2986' }]}
                    >
                      <AppText style={styles.removableActiveChipText}>{chip.label}</AppText>
                      <Ionicons name="close" size={13} color="#3A2986" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity activeOpacity={0.75} onPress={handleClearAll} style={styles.clearAllChipBtn}>
                    <AppText style={styles.clearAllChipText}>Clear all</AppText>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}

            {/* 2-COLUMN PRODUCT GRID */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridScrollContent}>
              {filteredMedicines.length > 0 ? (
                <View style={styles.productGrid}>
                  {filteredMedicines.map((med) => {
                    const isWishlisted = wishlistSet.has(med.id);
                    return (
                      <View key={med.id} style={styles.gridItemWrapper}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => toggleWishlist(med.id)}
                          style={styles.cardWishlistHeartBtn}
                        >
                          <Ionicons
                            name={isWishlisted ? 'heart' : 'heart-outline'}
                            size={17}
                            color={isWishlisted ? '#E11D48' : '#666666'}
                          />
                        </TouchableOpacity>

                        <MedicineCard
                          medicine={med}
                          onPress={() => navigation.navigate('MedicineDetails', { medicineId: med.id })}
                          onOpenVariantModal={(m) => setSelectedMedicineForVariant(m)}
                          onAddToCart={() => {
                            const added = addToCart(med, 1);
                            if (added) showToast(`Added ${med.name} to cart!`, 'success');
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
                /* EMPTY STATE (As requested) */
                <View style={styles.emptyStateContainer}>
                  <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? colors.surfaceElevated : '#F3EFFF' }]}>
                    <Ionicons name="filter-outline" size={36} color="#3A2986" />
                  </View>
                  <AppText variant="titleMedium" color={colors.textPrimary} weight="700" style={{ marginTop: 14 }}>
                    No products match these filters
                  </AppText>
                  <AppText variant="caption" color={colors.textSecondary} align="center" style={{ marginTop: 6, maxWidth: 240 }}>
                    Try removing one or more filters to view available medicines.
                  </AppText>
                  <TouchableOpacity activeOpacity={0.85} onPress={handleClearAll} style={styles.emptyClearBtn}>
                    <AppText style={styles.emptyClearBtnText}>Clear Filters</AppText>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>

        {/* BOTTOM FLOATING CART */}
        <FloatingCart onPressViewCart={() => navigation.navigate('Cart')} bottomOffset={16} />

        {/* VARIANT MODAL */}
        {selectedMedicineForVariant && (
          <VariantSelectionModal
            visible={!!selectedMedicineForVariant}
            medicine={selectedMedicineForVariant}
            onClose={() => setSelectedMedicineForVariant(null)}
          />
        )}
      </View>

      {/* =========================================================================
          SORT BOTTOM SHEET MODAL
         ========================================================================= */}
      <Modal visible={isSortModalVisible} transparent animationType="slide" onRequestClose={() => setIsSortModalVisible(false)}>
        <TouchableOpacity activeOpacity={1} onPress={() => setIsSortModalVisible(false)} style={styles.sortModalOverlay}>
          <View style={[styles.sortBottomSheet, { backgroundColor: colors.surface }, SHADOWS.modal]}>
            <View style={styles.bottomSheetHandle} />
            <View style={styles.sortHeaderRow}>
              <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                Sort By
              </AppText>
              <TouchableOpacity onPress={() => setIsSortModalVisible(false)}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => {
              const isSelected = sortBy === option;
              return (
                <TouchableOpacity
                  key={option}
                  activeOpacity={0.75}
                  onPress={() => {
                    setSortBy(option);
                    setIsSortModalVisible(false);
                  }}
                  style={styles.sortOptionItem}
                >
                  <AppText
                    style={[
                      styles.sortOptionText,
                      { color: isSelected ? '#3A2986' : colors.textPrimary },
                      isSelected && { fontWeight: '700' },
                    ]}
                  >
                    {SORT_LABELS[option]}
                  </AppText>
                  <View style={[styles.sortRadioCircle, isSelected && { borderColor: '#3A2986' }]}>
                    {isSelected && <View style={styles.sortRadioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* =========================================================================
          FULL-SCREEN MOBILE FILTER EXPERIENCE (Two-Column Architecture)
         ========================================================================= */}
      <Modal visible={isFilterModalVisible} animationType="slide" onRequestClose={() => setIsFilterModalVisible(false)}>
        <SafeAreaView style={[styles.filterModalContainer, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.filterModalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <TouchableOpacity activeOpacity={0.7} onPress={() => setIsFilterModalVisible(false)} style={styles.filterModalBackBtn}>
              <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
              <AppText variant="titleMedium" color={colors.textPrimary} weight="700" style={{ marginLeft: 10 }}>
                Filters
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setTempFilters(INITIAL_FILTERS);
                showToast('Reset all filters', 'info');
              }}
            >
              <AppText variant="bodySmall" color="#DC2626" weight="700">
                Clear all
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Split Filter Body */}
          <View style={styles.filterModalBody}>
            {/* Left Rail (Filter Categories) */}
            <View style={[styles.filterLeftRail, { backgroundColor: isDark ? colors.surfaceSubtle : '#F8F9FD', borderRightColor: colors.border }]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {filterGroups.map((group) => {
                  const isActive = activeFilterGroup === group.id;
                  return (
                    <TouchableOpacity
                      key={group.id}
                      activeOpacity={0.8}
                      onPress={() => setActiveFilterGroup(group.id)}
                      style={[
                        styles.filterRailItem,
                        isActive && { backgroundColor: colors.surface, borderLeftColor: '#3A2986' },
                      ]}
                    >
                      <AppText
                        style={[
                          styles.filterRailItemText,
                          { color: isActive ? '#3A2986' : colors.textSecondary },
                          isActive && { fontWeight: '700' },
                        ]}
                      >
                        {group.label}
                      </AppText>
                      {group.count > 0 && (
                        <View style={styles.filterRailBadge}>
                          <AppText style={styles.filterRailBadgeText}>{group.count}</AppText>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Right Pane (Options for Active Group) */}
            <View style={[styles.filterRightPane, { backgroundColor: colors.surface }]}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
                {/* 1. AVAILABILITY */}
                {activeFilterGroup === 'availability' && (
                  <View>
                    <AppText variant="titleSmall" color={colors.textPrimary} weight="700" style={{ marginBottom: 14 }}>
                      Availability
                    </AppText>
                    {[
                      { id: 'all', label: 'All Products' },
                      { id: 'nearby', label: 'Available nearby (< 2km)' },
                      { id: 'in_stock', label: 'In stock only' },
                      { id: 'fast_delivery', label: 'Fast delivery (10–15 min)' },
                    ].map((opt) => {
                      const isSel = tempFilters.availability === opt.id;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          activeOpacity={0.75}
                          onPress={() => setTempFilters((prev) => ({ ...prev, availability: opt.id as any }))}
                          style={styles.filterOptionRow}
                        >
                          <AppText style={[styles.filterOptionText, isSel && { color: '#3A2986', fontWeight: '700' }]}>
                            {opt.label}
                          </AppText>
                          <View style={[styles.filterRadioCircle, isSel && { borderColor: '#3A2986' }]}>
                            {isSel && <View style={styles.filterRadioDot} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* 2. PRESCRIPTION */}
                {activeFilterGroup === 'prescription' && (
                  <View>
                    <AppText variant="titleSmall" color={colors.textPrimary} weight="700" style={{ marginBottom: 14 }}>
                      Prescription Requirement
                    </AppText>
                    {[
                      { id: 'all', label: 'All products' },
                      { id: 'otc_only', label: 'OTC / No prescription required' },
                      { id: 'rx_only', label: 'Rx / Prescription required' },
                    ].map((opt) => {
                      const isSel = tempFilters.prescription === opt.id;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          activeOpacity={0.75}
                          onPress={() => setTempFilters((prev) => ({ ...prev, prescription: opt.id as any }))}
                          style={styles.filterOptionRow}
                        >
                          <AppText style={[styles.filterOptionText, isSel && { color: '#3A2986', fontWeight: '700' }]}>
                            {opt.label}
                          </AppText>
                          <View style={[styles.filterRadioCircle, isSel && { borderColor: '#3A2986' }]}>
                            {isSel && <View style={styles.filterRadioDot} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* 3. DELIVERY TIME */}
                {activeFilterGroup === 'delivery' && (
                  <View>
                    <AppText variant="titleSmall" color={colors.textPrimary} weight="700" style={{ marginBottom: 14 }}>
                      Delivery Time
                    </AppText>
                    {[
                      { id: 'all', label: 'Any delivery time' },
                      { id: '10_15', label: '10–15 min (Fast Delivery ⚡)' },
                      { id: 'under_30', label: 'Under 30 min' },
                    ].map((opt) => {
                      const isSel = tempFilters.deliveryTime === opt.id;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          activeOpacity={0.75}
                          onPress={() => setTempFilters((prev) => ({ ...prev, deliveryTime: opt.id as any }))}
                          style={styles.filterOptionRow}
                        >
                          <AppText style={[styles.filterOptionText, isSel && { color: '#3A2986', fontWeight: '700' }]}>
                            {opt.label}
                          </AppText>
                          <View style={[styles.filterRadioCircle, isSel && { borderColor: '#3A2986' }]}>
                            {isSel && <View style={styles.filterRadioDot} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* 4. PRICE RANGE */}
                {activeFilterGroup === 'price' && (
                  <View>
                    <AppText variant="titleSmall" color={colors.textPrimary} weight="700" style={{ marginBottom: 14 }}>
                      Price Range
                    </AppText>
                    {[
                      { id: 'all', label: 'Any Price' },
                      { id: '0_100', label: '₹0 – ₹100' },
                      { id: '100_250', label: '₹100 – ₹250' },
                      { id: '250_500', label: '₹250 – ₹500' },
                      { id: '500_1000', label: '₹500 – ₹1000' },
                      { id: '1000_plus', label: '₹1000+' },
                    ].map((opt) => {
                      const isSel = tempFilters.priceRange === opt.id;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          activeOpacity={0.75}
                          onPress={() => setTempFilters((prev) => ({ ...prev, priceRange: opt.id as any }))}
                          style={styles.filterOptionRow}
                        >
                          <AppText style={[styles.filterOptionText, isSel && { color: '#3A2986', fontWeight: '700' }]}>
                            {opt.label}
                          </AppText>
                          <View style={[styles.filterRadioCircle, isSel && { borderColor: '#3A2986' }]}>
                            {isSel && <View style={styles.filterRadioDot} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* 5. DISCOUNT */}
                {activeFilterGroup === 'discount' && (
                  <View>
                    <AppText variant="titleSmall" color={colors.textPrimary} weight="700" style={{ marginBottom: 14 }}>
                      Discount
                    </AppText>
                    {[
                      { val: 0, label: 'All Products' },
                      { val: 1, label: 'On Offer (Any Discount)' },
                      { val: 10, label: '10%+ Off' },
                      { val: 20, label: '20%+ Off' },
                      { val: 30, label: '30%+ Off' },
                    ].map((opt) => {
                      const isSel = tempFilters.minDiscount === opt.val;
                      return (
                        <TouchableOpacity
                          key={opt.val}
                          activeOpacity={0.75}
                          onPress={() => setTempFilters((prev) => ({ ...prev, minDiscount: opt.val }))}
                          style={styles.filterOptionRow}
                        >
                          <AppText style={[styles.filterOptionText, isSel && { color: '#3A2986', fontWeight: '700' }]}>
                            {opt.label}
                          </AppText>
                          <View style={[styles.filterRadioCircle, isSel && { borderColor: '#3A2986' }]}>
                            {isSel && <View style={styles.filterRadioDot} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* 6. BRAND */}
                {activeFilterGroup === 'brand' && (
                  <View>
                    <View style={styles.filterSearchInputWrap}>
                      <Ionicons name="search-outline" size={16} color={colors.textMuted} style={{ marginRight: 6 }} />
                      <TextInput
                        placeholder="Search brands..."
                        placeholderTextColor={colors.textMuted}
                        value={brandSearchQuery}
                        onChangeText={setBrandSearchQuery}
                        style={[styles.filterSearchInput, { color: colors.textPrimary }]}
                      />
                    </View>
                    {facetData.brands
                      .filter((b) => b.toLowerCase().includes(brandSearchQuery.toLowerCase()))
                      .map((brand) => {
                        const isSel = tempFilters.brands.includes(brand);
                        return (
                          <TouchableOpacity
                            key={brand}
                            activeOpacity={0.75}
                            onPress={() => {
                              setTempFilters((prev) => ({
                                ...prev,
                                brands: isSel ? prev.brands.filter((x) => x !== brand) : [...prev.brands, brand],
                              }));
                            }}
                            style={styles.filterOptionRow}
                          >
                            <AppText style={[styles.filterOptionText, isSel && { color: '#3A2986', fontWeight: '700' }]}>
                              {brand}
                            </AppText>
                            <View style={[styles.filterCheckbox, isSel && { backgroundColor: '#3A2986', borderColor: '#3A2986' }]}>
                              {isSel && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                )}

                {/* 7. MEDICINE FORM */}
                {activeFilterGroup === 'form' && (
                  <View>
                    <AppText variant="titleSmall" color={colors.textPrimary} weight="700" style={{ marginBottom: 14 }}>
                      Product / Medicine Form
                    </AppText>
                    {facetData.forms.map((form) => {
                      const isSel = tempFilters.forms.includes(form);
                      return (
                        <TouchableOpacity
                          key={form}
                          activeOpacity={0.75}
                          onPress={() => {
                            setTempFilters((prev) => ({
                              ...prev,
                              forms: isSel ? prev.forms.filter((x) => x !== form) : [...prev.forms, form],
                            }));
                          }}
                          style={styles.filterOptionRow}
                        >
                          <AppText style={[styles.filterOptionText, isSel && { color: '#3A2986', fontWeight: '700' }]}>
                            {form}
                          </AppText>
                          <View style={[styles.filterCheckbox, isSel && { backgroundColor: '#3A2986', borderColor: '#3A2986' }]}>
                            {isSel && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* 8. STRENGTH / DOSAGE */}
                {activeFilterGroup === 'strength' && (
                  <View>
                    <AppText variant="titleSmall" color={colors.textPrimary} weight="700" style={{ marginBottom: 14 }}>
                      Strength / Dosage
                    </AppText>
                    {facetData.strengths.map((str) => {
                      const isSel = tempFilters.strengths.includes(str);
                      return (
                        <TouchableOpacity
                          key={str}
                          activeOpacity={0.75}
                          onPress={() => {
                            setTempFilters((prev) => ({
                              ...prev,
                              strengths: isSel ? prev.strengths.filter((x) => x !== str) : [...prev.strengths, str],
                            }));
                          }}
                          style={styles.filterOptionRow}
                        >
                          <AppText style={[styles.filterOptionText, isSel && { color: '#3A2986', fontWeight: '700' }]}>
                            {str.toUpperCase()}
                          </AppText>
                          <View style={[styles.filterCheckbox, isSel && { backgroundColor: '#3A2986', borderColor: '#3A2986' }]}>
                            {isSel && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* 9. PACK SIZE */}
                {activeFilterGroup === 'pack_size' && (
                  <View>
                    <AppText variant="titleSmall" color={colors.textPrimary} weight="700" style={{ marginBottom: 14 }}>
                      Pack Size
                    </AppText>
                    {facetData.packSizes.map((pk) => {
                      const isSel = tempFilters.packSizes.includes(pk);
                      return (
                        <TouchableOpacity
                          key={pk}
                          activeOpacity={0.75}
                          onPress={() => {
                            setTempFilters((prev) => ({
                              ...prev,
                              packSizes: isSel ? prev.packSizes.filter((x) => x !== pk) : [...prev.packSizes, pk],
                            }));
                          }}
                          style={styles.filterOptionRow}
                        >
                          <AppText style={[styles.filterOptionText, isSel && { color: '#3A2986', fontWeight: '700' }]}>
                            {pk}
                          </AppText>
                          <View style={[styles.filterCheckbox, isSel && { backgroundColor: '#3A2986', borderColor: '#3A2986' }]}>
                            {isSel && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* 10. COMPOSITION / SALT */}
                {activeFilterGroup === 'salt' && (
                  <View>
                    <View style={styles.filterSearchInputWrap}>
                      <Ionicons name="search-outline" size={16} color={colors.textMuted} style={{ marginRight: 6 }} />
                      <TextInput
                        placeholder="Search salt / composition..."
                        placeholderTextColor={colors.textMuted}
                        value={saltSearchQuery}
                        onChangeText={setSaltSearchQuery}
                        style={[styles.filterSearchInput, { color: colors.textPrimary }]}
                      />
                    </View>
                    {facetData.salts
                      .filter((s) => s.toLowerCase().includes(saltSearchQuery.toLowerCase()))
                      .map((salt) => {
                        const isSel = tempFilters.salts.includes(salt);
                        return (
                          <TouchableOpacity
                            key={salt}
                            activeOpacity={0.75}
                            onPress={() => {
                              setTempFilters((prev) => ({
                                ...prev,
                                salts: isSel ? prev.salts.filter((x) => x !== salt) : [...prev.salts, salt],
                              }));
                            }}
                            style={styles.filterOptionRow}
                          >
                            <AppText style={[styles.filterOptionText, isSel && { color: '#3A2986', fontWeight: '700' }]}>
                              {salt}
                            </AppText>
                            <View style={[styles.filterCheckbox, isSel && { backgroundColor: '#3A2986', borderColor: '#3A2986' }]}>
                              {isSel && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                )}

                {/* 11. STORE AVAILABILITY */}
                {activeFilterGroup === 'stores' && (
                  <View>
                    <AppText variant="titleSmall" color={colors.textPrimary} weight="700" style={{ marginBottom: 14 }}>
                      Nearby Store Availability
                    </AppText>
                    {[
                      { count: 0, label: 'All stores' },
                      { count: 1, label: 'Available at 1+ nearby store' },
                      { count: 3, label: 'Available at 3+ nearby stores' },
                      { count: 5, label: 'Available at 5+ nearby stores' },
                    ].map((opt) => {
                      const isSel = tempFilters.storeAvailability === opt.count;
                      return (
                        <TouchableOpacity
                          key={opt.count}
                          activeOpacity={0.75}
                          onPress={() => setTempFilters((prev) => ({ ...prev, storeAvailability: opt.count }))}
                          style={styles.filterOptionRow}
                        >
                          <AppText style={[styles.filterOptionText, isSel && { color: '#3A2986', fontWeight: '700' }]}>
                            {opt.label}
                          </AppText>
                          <View style={[styles.filterRadioCircle, isSel && { borderColor: '#3A2986' }]}>
                            {isSel && <View style={styles.filterRadioDot} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* 12. RATING */}
                {activeFilterGroup === 'rating' && (
                  <View>
                    <AppText variant="titleSmall" color={colors.textPrimary} weight="700" style={{ marginBottom: 14 }}>
                      Customer Rating
                    </AppText>
                    {[
                      { val: 0, label: 'All ratings' },
                      { val: 4, label: '4★ & above (Top Rated)' },
                      { val: 3, label: '3★ & above' },
                    ].map((opt) => {
                      const isSel = tempFilters.minRating === opt.val;
                      return (
                        <TouchableOpacity
                          key={opt.val}
                          activeOpacity={0.75}
                          onPress={() => setTempFilters((prev) => ({ ...prev, minRating: opt.val }))}
                          style={styles.filterOptionRow}
                        >
                          <AppText style={[styles.filterOptionText, isSel && { color: '#3A2986', fontWeight: '700' }]}>
                            {opt.label}
                          </AppText>
                          <View style={[styles.filterRadioCircle, isSel && { borderColor: '#3A2986' }]}>
                            {isSel && <View style={styles.filterRadioDot} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* CATEGORY-SPECIFIC: Mom & Baby Age Group */}
                {activeFilterGroup === 'age_group' && (
                  <View>
                    <AppText variant="titleSmall" color={colors.textPrimary} weight="700" style={{ marginBottom: 14 }}>
                      Age Group
                    </AppText>
                    {['All Ages', '0–3 Months', '3–6 Months', '6–12 Months', '1–2 Years', '2+ Years'].map((ag) => {
                      const isSel = tempFilters.ageGroup === ag || (!tempFilters.ageGroup && ag === 'All Ages');
                      return (
                        <TouchableOpacity
                          key={ag}
                          activeOpacity={0.75}
                          onPress={() => setTempFilters((prev) => ({ ...prev, ageGroup: ag === 'All Ages' ? undefined : ag }))}
                          style={styles.filterOptionRow}
                        >
                          <AppText style={[styles.filterOptionText, isSel && { color: '#3A2986', fontWeight: '700' }]}>
                            {ag}
                          </AppText>
                          <View style={[styles.filterRadioCircle, isSel && { borderColor: '#3A2986' }]}>
                            {isSel && <View style={styles.filterRadioDot} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* CATEGORY-SPECIFIC: Device Type */}
                {activeFilterGroup === 'device_type' && (
                  <View>
                    <AppText variant="titleSmall" color={colors.textPrimary} weight="700" style={{ marginBottom: 14 }}>
                      Device Type
                    </AppText>
                    {['All Devices', 'BP Monitors', 'Glucometers', 'Thermometers', 'Oximeters', 'Nebulizers'].map((dt) => {
                      const isSel = tempFilters.deviceType === dt || (!tempFilters.deviceType && dt === 'All Devices');
                      return (
                        <TouchableOpacity
                          key={dt}
                          activeOpacity={0.75}
                          onPress={() => setTempFilters((prev) => ({ ...prev, deviceType: dt === 'All Devices' ? undefined : dt }))}
                          style={styles.filterOptionRow}
                        >
                          <AppText style={[styles.filterOptionText, isSel && { color: '#3A2986', fontWeight: '700' }]}>
                            {dt}
                          </AppText>
                          <View style={[styles.filterRadioCircle, isSel && { borderColor: '#3A2986' }]}>
                            {isSel && <View style={styles.filterRadioDot} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>

          {/* Bottom Sticky Apply CTA: Show X Products (Dynamic updates) */}
          <View style={[styles.filterApplyBottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }, SHADOWS.modal]}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                setFilters(tempFilters);
                setIsFilterModalVisible(false);
                showToast(`Filters applied! Showing ${tempMatchingCount} products`, 'info');
              }}
              style={styles.filterApplyCtaBtn}
            >
              <AppText style={styles.filterApplyCtaBtnText}>
                Show {tempMatchingCount} Products
              </AppText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#E8E8EE',
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
  sidebarActiveIndicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 4,
    backgroundColor: '#3A2986',
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
  sidebarItemText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'LexendDeca_500Medium',
  },
  sidebarItemTextActive: {
    color: '#3A2986',
    fontFamily: 'LexendDeca_700Bold',
  },

  // Right Workspace
  rightWorkspace: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Sticky Filter Entry Row: [ Filters ] [ Sort: Relevance ]
  stickyFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  filterButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E2EC',
    backgroundColor: '#FFFFFF',
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: 'LexendDeca_600SemiBold',
    color: '#1F2937',
  },
  sortButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E2EC',
    backgroundColor: '#FFFFFF',
  },
  sortButtonText: {
    fontSize: 11.5,
    fontFamily: 'LexendDeca_500Medium',
    color: '#4B5563',
  },

  // Removable Active Chips Row
  activeChipsBar: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  activeChipsScroll: {
    paddingHorizontal: 12,
    gap: 6,
    alignItems: 'center',
  },
  removableActiveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  removableActiveChipText: {
    fontSize: 11,
    fontFamily: 'LexendDeca_600SemiBold',
    color: '#3A2986',
  },
  clearAllChipBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearAllChipText: {
    fontSize: 11,
    color: '#DC2626',
    fontFamily: 'LexendDeca_600SemiBold',
  },

  // Product Grid
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

  // Empty State
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyClearBtn: {
    marginTop: 18,
    backgroundColor: '#3A2986',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 14,
  },
  emptyClearBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'LexendDeca_700Bold',
  },

  // Sort Bottom Sheet Modal
  sortModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sortBottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  bottomSheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sortHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sortOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sortOptionText: {
    fontSize: 14,
    fontFamily: 'LexendDeca_500Medium',
  },
  sortRadioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3A2986',
  },

  // Full-Screen Mobile Filter Modal
  filterModalContainer: {
    flex: 1,
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  filterModalBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterModalBody: {
    flex: 1,
    flexDirection: 'row',
  },
  filterLeftRail: {
    width: 125,
    borderRightWidth: 1,
  },
  filterRailItem: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    position: 'relative',
  },
  filterRailItemText: {
    fontSize: 12,
    fontFamily: 'LexendDeca_500Medium',
  },
  filterRailBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3A2986',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  filterRailBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  filterRightPane: {
    flex: 1,
  },
  filterOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterOptionText: {
    fontSize: 13,
    fontFamily: 'LexendDeca_500Medium',
    color: '#374151',
    flex: 1,
    paddingRight: 10,
  },
  filterRadioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3A2986',
  },
  filterCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSearchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  filterSearchInput: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: 'LexendDeca_500Medium',
    padding: 0,
  },
  filterApplyBottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  filterApplyCtaBtn: {
    height: 48,
    backgroundColor: '#3A2986',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterApplyCtaBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'LexendDeca_700Bold',
  },
});

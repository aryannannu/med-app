import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  SafeAreaView,
  Platform,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { MedicineCard } from '../../components/cards/MedicineCard';
import { QuantitySelector } from '../../components/controls/QuantitySelector';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Ionicons } from '@expo/vector-icons';
import { MedicineService } from '../../services/medicineService';
import { PharmacyService } from '../../services/pharmacyService';
import { Medicine } from '../../types/medicine';
import { Pharmacy } from '../../types/pharmacy';
import { useCart } from '../../store/CartContext';
import { useAddress } from '../../store/AddressContext';
import { useOrders } from '../../store/OrderContext';
import { useAuth } from '../../store/AuthContext';
import { useToast } from '../../store/ToastContext';
import { useTabBarScroll } from '../../store/TabBarScrollContext';
import { formatCurrency } from '../../utils/currency';
import { formatDistance, formatDeliveryTime } from '../../utils/formatters';

type DiscoveryMode = 'medicines' | 'stores';

const HEALTH_NEEDS = [
  { id: 'fever', name: 'Fever & Flu', icon: 'thermometer-outline', bg: '#F3E8FF', color: '#7C3AED', slug: 'pain-relief' },
  { id: 'headache', name: 'Headache', icon: 'pulse-outline', bg: '#EFF6FF', color: '#2563EB', slug: 'pain-relief' },
  { id: 'acidity', name: 'Acidity & Gas', icon: 'flame-outline', bg: '#FEE2E2', color: '#DC2626', slug: 'digestive' },
  { id: 'cough', name: 'Cough & Throat', icon: 'medkit-outline', bg: '#ECFDF5', color: '#059669', slug: 'cold-flu' },
  { id: 'bodypain', name: 'Body Pain', icon: 'fitness-outline', bg: '#FEF3C7', color: '#D97706', slug: 'pain-relief' },
  { id: 'diabetes', name: 'Diabetes Care', icon: 'water-outline', bg: '#FDF2F8', color: '#DB2777', slug: 'diabetes' },
  { id: 'bones', name: 'Bone & Joints', icon: 'body-outline', bg: '#ECFEFF', color: '#0891B2', slug: 'vitamins' },
  { id: 'bp', name: 'Blood Pressure', icon: 'heart-outline', bg: '#DCFCE7', color: '#166534', slug: 'heart-bp' },
];

const CATEGORIES = [
  { id: 'pain', name: 'Pain Relief', icon: 'fitness-outline', color: '#7C3AED', bg: '#F3E8FF', slug: 'pain-relief' },
  { id: 'cold', name: 'Cold & Flu', icon: 'thermometer-outline', color: '#2563EB', bg: '#EFF6FF', slug: 'cold-flu' },
  { id: 'diabetes', name: 'Diabetes Care', icon: 'water-outline', color: '#D97706', bg: '#FEF3C7', slug: 'diabetes' },
  { id: 'vitamins', name: 'Vitamins', icon: 'sunny-outline', color: '#059669', bg: '#ECFDF5', slug: 'vitamins' },
  { id: 'digestive', name: 'Digestive Care', icon: 'heart-outline', color: '#DC2626', bg: '#FEE2E2', slug: 'digestive' },
  { id: 'skin', name: 'Skin Care', icon: 'sparkles-outline', color: '#DB2777', bg: '#FDF2F8', slug: 'skin' },
  { id: 'baby', name: 'Baby Care', icon: 'happy-outline', color: '#0891B2', bg: '#ECFEFF', slug: 'baby' },
  { id: 'ayurveda', name: 'Ayurvedic', icon: 'leaf-outline', color: '#166534', bg: '#DCFCE7', slug: 'ayurveda' },
];

const STORE_CATEGORIES = [
  { id: 'allopath', name: 'Allopathic Pharmacies', icon: 'medical-outline', color: '#2563EB', count: '18 stores' },
  { id: 'ayur_store', name: 'Ayurvedic Kendras', icon: 'leaf-outline', color: '#166534', count: '9 stores' },
  { id: 'surgical', name: 'Surgical & Ortho', icon: 'bandage-outline', color: '#D97706', count: '6 stores' },
  { id: 'baby_store', name: 'Mother & Baby Care', icon: 'happy-outline', color: '#DB2777', count: '12 stores' },
];

const STORE_DEALS = [
  {
    id: 'deal-1',
    pharmacyName: 'Sharma Medical Store',
    title: 'Flat 15% OFF on Chronic Medicines',
    badge: '15% OFF',
    pharmacyId: 'pharm-1',
    bg: '#ECE8F7',
    color: '#3A2986',
  },
  {
    id: 'deal-2',
    pharmacyName: 'Apollo Pharmacy 24x7',
    title: 'Free Delivery on Orders Above ₹199',
    badge: 'FREE DELIVERY',
    pharmacyId: 'pharm-2',
    bg: '#CCFBF1',
    color: '#0D9488',
  },
  {
    id: 'deal-3',
    pharmacyName: 'MedPlus Chemists',
    title: 'Flat 20% OFF on Baby & Skin Care',
    badge: '20% OFF',
    pharmacyId: 'pharm-3',
    bg: '#FEF3C7',
    color: '#D97706',
  },
];

const MEDICINE_TYPES = [
  { id: 'tab', name: 'Tablets & Capsules', icon: 'tablet-portrait-outline', count: '450+ meds' },
  { id: 'syr', name: 'Syrups & Liquids', icon: 'beaker-outline', count: '180+ meds' },
  { id: 'gel', name: 'Ointments & Gels', icon: 'color-fill-outline', count: '120+ meds' },
  { id: 'drop', name: 'Drops & Sprays', icon: 'water-outline', count: '90+ meds' },
  { id: 'pow', name: 'Powders & Sachets', icon: 'cube-outline', count: '65+ meds' },
];

const TOP_BRANDS = [
  { id: 'cipla', name: 'Cipla', count: '85+ Products', logo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120&q=80' },
  { id: 'sun', name: 'Sun Pharma', count: '110+ Products', logo: 'https://images.unsplash.com/photo-1550572017-edb79a557451?w=120&q=80' },
  { id: 'micro', name: 'Micro Labs', count: '45+ Products', logo: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=120&q=80' },
  { id: 'abbott', name: 'Abbott', count: '95+ Products', logo: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=120&q=80' },
  { id: 'gsk', name: 'GlaxoSmithKline', count: '60+ Products', logo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120&q=80' },
  { id: 'pfizer', name: 'Pfizer', count: '40+ Products', logo: 'https://images.unsplash.com/photo-1550572017-edb79a557451?w=120&q=80' },
];

const TOP_COMPOSITIONS = [
  { id: 'c1', name: 'Paracetamol (650mg)', count: '14 Brands available', uses: 'Fever & Pain' },
  { id: 'c2', name: 'Pantoprazole (40mg)', count: '8 Brands available', uses: 'Acidity & Gas' },
  { id: 'c3', name: 'Amoxicillin + Clavulanic Acid', count: '6 Brands available', uses: 'Bacterial Infections' },
  { id: 'c4', name: 'Calcium (500mg) + Vitamin D3', count: '10 Brands available', uses: 'Bone & Joints' },
  { id: 'c5', name: 'Cetirizine Hydrochloride (10mg)', count: '12 Brands available', uses: 'Allergy & Cold' },
];

const GENERIC_ALTERNATIVES = [
  {
    id: 'gen-1',
    brandName: 'Crocin 650 Advance',
    brandPrice: 35.0,
    genericName: 'Paracetamol 650mg (Jan Aushadhi)',
    genericPrice: 11.5,
    savingsPercent: 67,
  },
  {
    id: 'gen-2',
    brandName: 'Augmentin 625 Duo',
    brandPrice: 223.5,
    genericName: 'Amoxyclav 625 (Generic Equivalent)',
    genericPrice: 85.0,
    savingsPercent: 62,
  },
  {
    id: 'gen-3',
    brandName: 'Pan 40 Tablet',
    brandPrice: 162.0,
    genericName: 'Pantoprazole 40mg (Generic)',
    genericPrice: 45.0,
    savingsPercent: 72,
  },
];

const MEDICINE_SEARCH_PROMPTS = [
  'Search "Paracetamol"',
  'Search "Dolo 650"',
  'Search "Becosules Z"',
  'Search "Pan 40"',
  'Search "Augmentin 625"',
  'Search "Shelcal 500"',
  'Search "Cheston Cold"',
  'Search "Volini Gel"',
  'Search "Digene Gel"',
  'Search "Evion 400"',
  'Search "Saridon"',
  'Search "Cofsils"',
];

const STORE_SEARCH_PROMPTS = [
  'Search "Sharma Medical Store"',
  'Search "Apollo Pharmacy 24x7"',
  'Search "MedPlus Chemists"',
  'Search 24x7 pharmacies near you',
  'Search local chemist shops',
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [activeMode, setActiveMode] = useState<DiscoveryMode>('medicines');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [nearbyPharmacies, setNearbyPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Rotating placeholder every 2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => prev + 1);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const { items, summary, totalItemCount, addToCart, getItemQuantity, updateQuantity } = useCart();
  const { selectedAddress } = useAddress();
  const { activeOrders } = useOrders();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { onScroll, collapseAnim } = useTabBarScroll();

  // Floating Cart sits dynamically 12px above the floating tab bar
  const floatingCartBottom = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Platform.OS === 'android' ? 88 : 96, Platform.OS === 'android' ? 72 : 80],
  });

  const loadData = useCallback(async () => {
    try {
      const [meds, pharms] = await Promise.all([
        MedicineService.getAllMedicines(),
        PharmacyService.getNearbyPharmacies(),
      ]);
      setAllMedicines(meds);
      setNearbyPharmacies(pharms);
    } catch (e) {
      showToast('Failed to load marketplace items', 'error');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const activeOrder = activeOrders[0];

  const displayAddress = useMemo(() => {
    if (!selectedAddress) return 'Homeland City, Karimpur';
    const mainBuilding = selectedAddress.apartmentBuilding || selectedAddress.streetAddress || selectedAddress.city;
    const shortPart = mainBuilding.split(',')[0].trim();
    return `${shortPart}, ${selectedAddress.city}`;
  }, [selectedAddress]);

  const popularMedicines = useMemo(() => allMedicines.filter((m) => m.isPopular), [allMedicines]);
  const discountMedicines = useMemo(() => allMedicines.filter((m) => m.discountPercentage >= 14), [allMedicines]);
  const expressMedicines = useMemo(() => allMedicines.slice(0, 6), [allMedicines]);

  // Standard Medicine Card matching reference anatomy with perfect alignment
  const renderMedicineCard = (med: Medicine, storeAttribution?: string) => {
    if (!med || !med.id) return null;
    return (
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
        storeAttribution={storeAttribution}
        style={{ marginRight: SPACING.md }}
      />
    );
  };

  // Standard Pharmacy Card Component
  const renderPharmacyCard = (pharmacy: Pharmacy) => {
    if (!pharmacy || !pharmacy.id) return null;
    return (
      <TouchableOpacity
        key={pharmacy.id}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('PharmacyDetail', { pharmacyId: pharmacy.id })}
        style={[styles.pharmacyCard, SHADOWS.subtle]}
      >
        <Image source={{ uri: pharmacy.logo }} style={styles.pharmacyLogo} resizeMode="cover" />

        <View style={styles.pharmacyDetails}>
          <View style={styles.pharmacyNameRow}>
            <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600" numberOfLines={1} style={{ flex: 1 }}>
              {pharmacy.name}
            </AppText>
            {pharmacy.isVerified && (
              <View style={styles.verifiedTag}>
                <Ionicons name="checkmark-circle" size={12} color={COLORS.primary} />
                <AppText variant="caption" color={COLORS.primary} weight="600" style={{ fontSize: 10, marginLeft: 2 }}>
                  ✓ Verified
                </AppText>
              </View>
            )}
          </View>

          <View style={styles.pharmacyMetaRow}>
            <AppText variant="caption" color="#15803D" weight="600">
              {pharmacy.rating} ★
            </AppText>
            <AppText variant="caption" color={COLORS.textMuted} style={{ marginHorizontal: 4 }}>
              •
            </AppText>
            <AppText variant="caption" color={COLORS.textSecondary}>
              {formatDistance(pharmacy.distanceKm)}
            </AppText>
            <AppText variant="caption" color={COLORS.textMuted} style={{ marginHorizontal: 4 }}>
              •
            </AppText>
            <AppText variant="caption" color={COLORS.primary} weight="600">
              {formatDeliveryTime(pharmacy.estimatedDeliveryTimeMinutes)}
            </AppText>
            <AppText variant="caption" color={COLORS.textMuted} style={{ marginHorizontal: 4 }}>
              •
            </AppText>
            <AppText variant="caption" color={pharmacy.isOpenNow ? '#15803D' : '#DC2626'} weight="600">
              {pharmacy.isOpenNow ? 'Open Now' : 'Closed'}
            </AppText>
          </View>

          <AppText variant="caption" color={COLORS.textMuted} numberOfLines={1} style={{ marginTop: 2, fontSize: 11 }}>
            📍 {pharmacy.address.line1}
          </AppText>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <LoadingState fullScreen message="Loading HEALIT..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* =========================================================================
            1. HEADER & 2. DELIVERY LOCATION (Clean: No Cart icon, No Notification icon)
           ========================================================================= */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AddressSelection', { isSelectingForCheckout: false })}
            style={styles.locationSelector}
          >
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={16} color={COLORS.primary} />
              <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600" style={styles.locationLabel}>
                {selectedAddress?.label || 'Home'}
              </AppText>
              <Ionicons name="chevron-down" size={14} color={COLORS.textPrimary} style={{ marginLeft: 2 }} />

              {/* Delivery ETA badge */}
              <View style={styles.headerEtaPill}>
                <Ionicons name="flash" size={11} color="#FFFFFF" style={{ marginRight: 2 }} />
                <AppText variant="caption" color="#FFFFFF" weight="600" style={styles.headerEtaText}>
                  10–15 MINS
                </AppText>
              </View>
            </View>
            <AppText
              variant="caption"
              color={COLORS.textSecondary}
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.addressLine}
            >
              Delivering to {displayAddress}
            </AppText>
          </TouchableOpacity>

          {/* Profile Icon on Right */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Profile')}
            style={[styles.profileBtn, SHADOWS.subtle]}
          >
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} />
            ) : (
              <Ionicons name="person" size={20} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={onScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* =========================================================================
              3. SEARCH MODE TOGGLE (Switches in-place between Medicines and Stores)
             ========================================================================= */}
          <View style={styles.modeToggleContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setActiveMode('medicines')}
              style={[
                styles.modeToggleBtn,
                activeMode === 'medicines' && styles.modeToggleBtnActive,
              ]}
            >
              <Ionicons
                name="medkit"
                size={16}
                color={activeMode === 'medicines' ? '#FFFFFF' : COLORS.textSecondary}
                style={{ marginRight: 6 }}
              />
              <AppText
                variant="bodySmall"
                color={activeMode === 'medicines' ? '#FFFFFF' : COLORS.textSecondary}
                weight="600"
              >
                Search by Medicine
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setActiveMode('stores')}
              style={[
                styles.modeToggleBtn,
                activeMode === 'stores' && styles.modeToggleBtnActive,
              ]}
            >
              <Ionicons
                name="business"
                size={16}
                color={activeMode === 'stores' ? '#FFFFFF' : COLORS.textSecondary}
                style={{ marginRight: 6 }}
              />
              <AppText
                variant="bodySmall"
                color={activeMode === 'stores' ? '#FFFFFF' : COLORS.textSecondary}
                weight="600"
              >
                Search by Store
              </AppText>
            </TouchableOpacity>
          </View>

          {/* =========================================================================
              4. DYNAMIC SEARCH BAR (Rotating 2s placeholder strictly on 1 line)
             ========================================================================= */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate('MainTabs', {
                screen: 'SearchTab',
                params: { initialQuery: activeMode === 'stores' ? 'pharmacy' : '' },
              } as any)
            }
            style={[styles.universalSearchBar, SHADOWS.subtle]}
          >
            <Ionicons name="search" size={20} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
            <AppText
              variant="bodyMedium"
              color={COLORS.textMuted}
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ flex: 1 }}
            >
              {activeMode === 'medicines'
                ? MEDICINE_SEARCH_PROMPTS[placeholderIndex % MEDICINE_SEARCH_PROMPTS.length]
                : STORE_SEARCH_PROMPTS[placeholderIndex % STORE_SEARCH_PROMPTS.length]}
            </AppText>
            <Ionicons name="mic-outline" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Contextual Active Order Card (If any active) */}
          {activeOrder && (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('OrderDetails', { orderId: activeOrder.id })}
              style={[styles.activeOrderCard, SHADOWS.subtle]}
            >
              <View style={styles.activeOrderIconBox}>
                <Ionicons name="bicycle" size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <View style={styles.activeOrderHeader}>
                  <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                    Your order is on the way
                  </AppText>
                  <View style={styles.activePulseDot} />
                </View>
                <AppText variant="caption" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
                  {activeOrder.items.length} medicines • Arriving in 10–15 min
                </AppText>
              </View>
              <AppText variant="buttonSmall" color={COLORS.primary} weight="600">
                Track →
              </AppText>
            </TouchableOpacity>
          )}

          {/* =========================================================================
              MODE 1: MEDICINE DISCOVERY MODE CONTENT
             ========================================================================= */}
          {activeMode === 'medicines' && (
            <>
              {/* 5. Fast Delivery / Hero Banner */}
              <View style={[styles.heroBanner, SHADOWS.subtle]}>
                <View style={{ flex: 1, paddingRight: SPACING.sm }}>
                  <View style={styles.heroPill}>
                    <Ionicons name="flash" size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
                    <AppText variant="caption" color="#FFFFFF" weight="600" style={{ fontSize: 10 }}>
                      HYPERLOCAL DISPATCH
                    </AppText>
                  </View>
                  <AppText variant="headingSmall" color="#FFFFFF" weight="600" style={{ marginTop: 6 }}>
                    Medicines in 10–15 Min
                  </AppText>
                  <AppText variant="caption" color="#E8E8EE" style={{ marginTop: 2 }}>
                    Fulfilled directly by licensed pharmacies near you.
                  </AppText>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('UploadPrescription', { fromCart: false })}
                    style={styles.heroUploadBtn}
                  >
                    <Ionicons name="document-text-outline" size={15} color={COLORS.primary} style={{ marginRight: 4 }} />
                    <AppText variant="caption" color={COLORS.primary} weight="600">
                      Upload Prescription
                    </AppText>
                  </TouchableOpacity>
                </View>

                <View style={styles.heroIllustrationBox}>
                  <Ionicons name="shield-checkmark" size={56} color="#FFFFFF" style={{ opacity: 0.9 }} />
                </View>
              </View>

              {/* 6. Shop by Health Need (Quick Ailment Chips) */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600">
                      Shop by health need
                    </AppText>
                    <AppText variant="caption" color={COLORS.textSecondary}>
                      Find medicines for common symptoms
                    </AppText>
                  </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                  {HEALTH_NEEDS.map((need) => (
                    <TouchableOpacity
                      key={need.id}
                      activeOpacity={0.8}
                      onPress={() =>
                        navigation.navigate('CategoryListing', {
                          categorySlug: need.slug,
                          categoryName: need.name,
                        })
                      }
                      style={[styles.healthNeedCard, { backgroundColor: need.bg }]}
                    >
                      <View style={[styles.healthNeedIconCircle, { backgroundColor: '#FFFFFF' }]}>
                        <Ionicons name={need.icon as any} size={20} color={need.color} />
                      </View>
                      <AppText variant="caption" color={COLORS.textPrimary} weight="600" align="center" style={{ marginTop: 6 }}>
                        {need.name}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* 7. Shop by Category */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600">
                      Shop by category
                    </AppText>
                    <AppText variant="caption" color={COLORS.textSecondary}>
                      Explore by health condition &amp; usage
                    </AppText>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('CategoryListing', {
                        categorySlug: 'pain-relief',
                        categoryName: 'Pain Relief',
                      })
                    }
                  >
                    <AppText variant="bodySmall" color={COLORS.primary} weight="600">
                      View All →
                    </AppText>
                  </TouchableOpacity>
                </View>

                <View style={styles.categoriesGrid}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      activeOpacity={0.8}
                      onPress={() =>
                        navigation.navigate('CategoryListing', {
                          categorySlug: cat.slug,
                          categoryName: cat.name,
                        })
                      }
                      style={styles.categoryGridItem}
                    >
                      <View style={[styles.categoryCircle, { backgroundColor: cat.bg }]}>
                        <Ionicons name={cat.icon as any} size={24} color={cat.color} />
                      </View>
                      <AppText variant="caption" color={COLORS.textPrimary} weight="600" align="center" numberOfLines={1} style={{ marginTop: 4 }}>
                        {cat.name}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 8. Medicines Available Near You */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600">
                      Medicines available near you
                    </AppText>
                    <AppText variant="caption" color={COLORS.textSecondary}>
                      Verified stock at nearby pharmacies
                    </AppText>
                  </View>
                  <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                    <AppText variant="bodySmall" color={COLORS.primary} weight="600">
                      View All →
                    </AppText>
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                  {allMedicines.slice(0, 6).map((med) => renderMedicineCard(med))}
                </ScrollView>
              </View>

              {/* 9. Popular Near You */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600">
                      Popular near you
                    </AppText>
                    <AppText variant="caption" color={COLORS.textSecondary}>
                      Frequently ordered in your area
                    </AppText>
                  </View>
                  <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                    <AppText variant="bodySmall" color={COLORS.primary} weight="600">
                      View All →
                    </AppText>
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                  {popularMedicines.map((med) => renderMedicineCard(med))}
                </ScrollView>
              </View>

              {/* 10. Top Discounts */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600">
                      Top discounts
                    </AppText>
                    <AppText variant="caption" color={COLORS.textSecondary}>
                      Save more on essential medicines
                    </AppText>
                  </View>
                  <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                    <AppText variant="bodySmall" color={COLORS.primary} weight="600">
                      View All →
                    </AppText>
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                  {discountMedicines.map((med) => renderMedicineCard(med))}
                </ScrollView>
              </View>

              {/* 11. Quick Order Prescription Upload Banner */}
              <View style={[styles.rxCtaCard, SHADOWS.subtle]}>
                <View style={styles.rxCtaContent}>
                  <View style={styles.rxPill}>
                    <AppText variant="caption" color="#FFFFFF" weight="600" style={{ fontSize: 9 }}>
                      QUICK ORDER
                    </AppText>
                  </View>
                  <AppText variant="titleMedium" color={COLORS.primary} weight="600" style={{ marginTop: 4 }}>
                    Have a prescription?
                  </AppText>
                  <AppText variant="caption" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
                    Upload your Rx and let nearby pharmacies provide the best offers.
                  </AppText>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('UploadPrescription', { fromCart: false })}
                    style={styles.rxUploadCtaBtn}
                  >
                    <Ionicons name="camera-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <AppText variant="buttonSmall" color="#FFFFFF" weight="600">
                      Upload Prescription
                    </AppText>
                  </TouchableOpacity>
                </View>

                <View style={styles.rxCtaIllustration}>
                  <Ionicons name="document-attach" size={52} color={COLORS.primary} />
                </View>
              </View>

              {/* 12. Shop by Medicine Type */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600">
                      Shop by medicine type
                    </AppText>
                    <AppText variant="caption" color={COLORS.textSecondary}>
                      Filter by formulation and dosage form
                    </AppText>
                  </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                  {MEDICINE_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      activeOpacity={0.8}
                      onPress={() =>
                        navigation.navigate('Search', {
                          initialQuery: type.name.split(' ')[0],
                        })
                      }
                      style={[styles.typeCard, SHADOWS.subtle]}
                    >
                      <View style={styles.typeIconCircle}>
                        <Ionicons name={type.icon as any} size={24} color={COLORS.primary} />
                      </View>
                      <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600" align="center" numberOfLines={1} style={{ marginTop: 6 }}>
                        {type.name}
                      </AppText>
                      <View style={styles.typeCountBadge}>
                        <AppText variant="caption" color={COLORS.primary} weight="600" style={{ fontSize: 10 }}>
                          {type.count}
                        </AppText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* 13. Shop by Brand / Manufacturer */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600">
                      Shop by brand
                    </AppText>
                    <AppText variant="caption" color={COLORS.textSecondary}>
                      Trusted certified pharmaceutical companies
                    </AppText>
                  </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                  {TOP_BRANDS.map((brand) => (
                    <TouchableOpacity
                      key={brand.id}
                      activeOpacity={0.8}
                      onPress={() =>
                        navigation.navigate('Search', {
                          initialQuery: brand.name,
                        })
                      }
                      style={[styles.brandCard, SHADOWS.subtle]}
                    >
                      <Image source={{ uri: brand.logo }} style={styles.brandLogo} resizeMode="contain" />
                      <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600" style={{ marginTop: 6 }}>
                        {brand.name}
                      </AppText>
                      <AppText variant="caption" color={COLORS.textMuted} style={{ marginTop: 2 }}>
                        {brand.count}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* 14. Trusted Pharmacies Near You */}
              <View style={[styles.sectionContainer, { marginBottom: SPACING.xxl }]}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600">
                      Trusted pharmacies fulfilling orders
                    </AppText>
                    <AppText variant="caption" color={COLORS.textSecondary}>
                      Licensed local partners near your location
                    </AppText>
                  </View>
                  <TouchableOpacity onPress={() => setActiveMode('stores')}>
                    <AppText variant="bodySmall" color={COLORS.primary} weight="600">
                      View All →
                    </AppText>
                  </TouchableOpacity>
                </View>

                {nearbyPharmacies.slice(0, 3).map((pharmacy) => renderPharmacyCard(pharmacy))}
              </View>
            </>
          )}

          {/* =========================================================================
              MODE 2: STORE DISCOVERY MODE CONTENT (Right on HomeScreen!)
             ========================================================================= */}
          {activeMode === 'stores' && (
            <>
              {/* Store Mode Hero Banner */}
              <View style={[styles.storeHeroBanner, SHADOWS.subtle]}>
                <View style={{ flex: 1, paddingRight: SPACING.sm }}>
                  <View style={styles.storeHeroPill}>
                    <Ionicons name="business" size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
                    <AppText variant="caption" color="#FFFFFF" weight="600" style={{ fontSize: 10 }}>
                      LOCAL PHARMACY NETWORK
                    </AppText>
                  </View>
                  <AppText variant="headingSmall" color="#FFFFFF" weight="600" style={{ marginTop: 6 }}>
                    Order from Nearby Stores
                  </AppText>
                  <AppText variant="caption" color="#E8E8EE" style={{ marginTop: 2 }}>
                    Browse live inventories, compare offers, and get 10–15 min delivery.
                  </AppText>
                </View>

                <View style={styles.heroIllustrationBox}>
                  <Ionicons name="storefront" size={54} color="#FFFFFF" style={{ opacity: 0.9 }} />
                </View>
              </View>

              {/* 1. Store Deals & Offers */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600">
                      Store deals &amp; exclusive offers
                    </AppText>
                    <AppText variant="caption" color={COLORS.textSecondary}>
                      Special discounts offered by local chemists
                    </AppText>
                  </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                  {STORE_DEALS.map((deal) => (
                    <TouchableOpacity
                      key={deal.id}
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate('PharmacyDetail', { pharmacyId: deal.pharmacyId })}
                      style={[styles.storeDealCard, { backgroundColor: deal.bg }, SHADOWS.subtle]}
                    >
                      <View style={[styles.storeDealBadge, { backgroundColor: deal.color }]}>
                        <AppText variant="caption" color="#FFFFFF" weight="600" style={{ fontSize: 10 }}>
                          {deal.badge}
                        </AppText>
                      </View>
                      <AppText variant="titleSmall" color={deal.color} weight="600" style={{ marginTop: SPACING.sm }}>
                        {deal.title}
                      </AppText>
                      <AppText variant="caption" color={COLORS.textSecondary} style={{ marginTop: 4 }}>
                        🏪 {deal.pharmacyName}
                      </AppText>
                      <View style={styles.storeDealActionRow}>
                        <AppText variant="caption" color={deal.color} weight="600">
                          Visit Store →
                        </AppText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* 2. Nearby Pharmacies (Full List) */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600">
                      Pharmacies near you ({nearbyPharmacies.length})
                    </AppText>
                    <AppText variant="caption" color={COLORS.textSecondary}>
                      Delivering to {selectedAddress?.label || 'Home'} • {selectedAddress?.city || 'Punjab'}
                    </AppText>
                  </View>
                </View>

                {nearbyPharmacies.map((pharmacy) => renderPharmacyCard(pharmacy))}
              </View>

              {/* 3. Browse Stores by Category */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600">
                      Browse stores by specialization
                    </AppText>
                    <AppText variant="caption" color={COLORS.textSecondary}>
                      Find specialized retail medical shops
                    </AppText>
                  </View>
                </View>

                <View style={styles.storeCategoryGrid}>
                  {STORE_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      activeOpacity={0.8}
                      onPress={() =>
                        navigation.navigate('Search', {
                          initialQuery: cat.name,
                        })
                      }
                      style={[styles.storeCategoryCard, SHADOWS.subtle]}
                    >
                      <View style={[styles.storeCatIconCircle, { backgroundColor: '#ECE8F7' }]}>
                        <Ionicons name={cat.icon as any} size={24} color={COLORS.primary} />
                      </View>
                      <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600" style={{ marginTop: 8 }}>
                        {cat.name}
                      </AppText>
                      <AppText variant="caption" color={COLORS.textMuted} style={{ marginTop: 2 }}>
                        {cat.count}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 4. Popular Medicines in Nearby Stores */}
              <View style={[styles.sectionContainer, { marginBottom: SPACING.xxl }]}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600">
                      Available in nearby stores
                    </AppText>
                    <AppText variant="caption" color={COLORS.textSecondary}>
                      Ready for instant pickup or 10–15 min delivery
                    </AppText>
                  </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                  {allMedicines.slice(0, 6).map((med, idx) => {
                    const storeName = idx % 2 === 0 ? 'Sharma Medical Store' : 'Apollo Pharmacy';
                    return renderMedicineCard(med, storeName);
                  })}
                </ScrollView>
              </View>
            </>
          )}
        </ScrollView>

        {/* =========================================================================
            19. FLOATING CART (Always positioned 12px above bottom nav bar)
           ========================================================================= */}
        {totalItemCount > 0 && (
          <Animated.View style={[styles.floatingCart, { bottom: floatingCartBottom }, SHADOWS.modal]}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Cart')}
              style={styles.floatingCartInner}
            >
              <View style={styles.floatingCartLeft}>
                <View style={styles.floatingCartBadge}>
                  <Ionicons name="cart" size={16} color={COLORS.primary} />
                  <AppText variant="caption" color={COLORS.primary} weight="600" style={{ marginLeft: 4 }}>
                    {totalItemCount} {totalItemCount === 1 ? 'Medicine' : 'Medicines'}
                  </AppText>
                </View>
                <AppText variant="titleSmall" color="#FFFFFF" weight="600" style={{ marginLeft: SPACING.md }}>
                  {formatCurrency(summary.estimatedFinalTotal)}
                </AppText>
              </View>

              <View style={styles.floatingCartRight}>
                <AppText variant="buttonSmall" color="#FFFFFF" weight="600">
                  View Cart
                </AppText>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EE',
  },
  locationSelector: {
    flex: 1,
    marginRight: SPACING.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  locationLabel: {
    marginLeft: 3,
  },
  headerEtaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A2986',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.full,
    marginLeft: SPACING.sm,
  },
  headerEtaText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  addressLine: {
    marginTop: 2,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECE8F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 100,
  },
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#ECE8F7',
    borderRadius: BORDER_RADIUS.full,
    padding: 3,
    marginBottom: SPACING.md,
  },
  modeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  modeToggleBtnActive: {
    backgroundColor: '#3A2986',
    ...SHADOWS.subtle,
  },
  universalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.md,
  },
  heroBanner: {
    flexDirection: 'row',
    backgroundColor: '#3A2986',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  storeHeroBanner: {
    flexDirection: 'row',
    backgroundColor: '#0D9488',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  storeHeroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  heroUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
    marginTop: SPACING.md,
  },
  heroIllustrationBox: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeOrderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#15803D',
    marginBottom: SPACING.lg,
  },
  activeOrderIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#15803D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeOrderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#15803D',
    marginLeft: 6,
  },
  sectionContainer: {
    marginBottom: SPACING.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  horizontalList: {
    paddingRight: SPACING.lg,
  },
  healthNeedCard: {
    width: 100,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  healthNeedIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  categoryGridItem: {
    width: '23%',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  categoryCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicineCard: {
    width: 156,
    marginRight: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
  },
  medImgWrapper: {
    position: 'relative',
    width: '100%',
    height: 130,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  medImg: {
    width: '85%',
    height: '85%',
  },
  rxTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#DC2626',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  floatingActionContainer: {
    position: 'absolute',
    bottom: -8,
    right: 6,
    zIndex: 10,
  },
  addPillBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: '#E11D48',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  greenPriceTag: {
    backgroundColor: '#15803D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  strikeMrp: {
    textDecorationLine: 'line-through',
    marginLeft: 6,
    fontSize: 12,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  discountText: {
    fontSize: 11,
    marginRight: 6,
  },
  dottedLine: {
    flex: 1,
    height: 1,
    borderWidth: 0.5,
    borderColor: '#E8E8EE',
    borderStyle: 'dashed',
  },
  medTitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 16,
  },
  packSize: {
    marginTop: 4,
    fontSize: 11,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: '#DCFCE7',
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeCard: {
    width: 146,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  typeIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ECE8F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  typeCountBadge: {
    backgroundColor: '#F8F8FC',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.full,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  brandCard: {
    width: 130,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  brandLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F8FC',
  },
  rxCtaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FB',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#DCD5F0',
    marginBottom: SPACING.xl,
  },
  rxPill: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rxCtaContent: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  rxUploadCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
  },
  rxCtaIllustration: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compositionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.sm,
  },
  compIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ECE8F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genericCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.md,
  },
  genericCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  savingsTag: {
    backgroundColor: '#15803D',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  genericDivider: {
    height: 1,
    backgroundColor: '#E8E8EE',
    marginVertical: SPACING.sm,
  },
  genericCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  genericAddBtn: {
    backgroundColor: '#ECE8F7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#DCD5F0',
  },
  pharmacyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.md,
  },
  pharmacyLogo: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#F8F8FC',
  },
  pharmacyDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  pharmacyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECE8F7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  pharmacyMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  storeDealCard: {
    width: 240,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  storeDealBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  storeDealActionRow: {
    marginTop: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeCategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  storeCategoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  storeCatIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingCart: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    zIndex: 1005,
  },
  floatingCartInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
    width: '100%',
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
});

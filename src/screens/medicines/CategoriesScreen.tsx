import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { FloatingCart } from '../../components/common/FloatingCart';
import { Ionicons } from '@expo/vector-icons';
import { useAddress } from '../../store/AddressContext';
import { useCart } from '../../store/CartContext';
import { useTabBarScroll } from '../../store/TabBarScrollContext';
import { formatCurrency } from '../../utils/currency';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  itemCount: string;
  popularSubcats: string[];
}

const ALL_CATEGORIES: CategoryItem[] = [
  {
    id: 'c1',
    name: 'Pain Relief & Fever',
    slug: 'pain-relief',
    icon: 'fitness',
    color: '#7C3AED',
    bg: '#F3E8FF',
    itemCount: '142+ Meds',
    popularSubcats: ['Headache', 'Fever', 'Body Pain'],
  },
  {
    id: 'c2',
    name: 'Cold, Cough & Flu',
    slug: 'cold-flu',
    icon: 'thermometer',
    color: '#2563EB',
    bg: '#EFF6FF',
    itemCount: '98+ Meds',
    popularSubcats: ['Syrups', 'Nasal Drops', 'Lozenges'],
  },
  {
    id: 'c3',
    name: 'Diabetes Care',
    slug: 'diabetes',
    icon: 'water',
    color: '#D97706',
    bg: '#FEF3C7',
    itemCount: '86+ Meds',
    popularSubcats: ['Tablets', 'Test Strips', 'Insulin'],
  },
  {
    id: 'c4',
    name: 'Vitamins & Immunity',
    slug: 'vitamins',
    icon: 'sunny',
    color: '#059669',
    bg: '#ECFDF5',
    itemCount: '164+ Meds',
    popularSubcats: ['Multivitamins', 'Vitamin C', 'Zinc'],
  },
  {
    id: 'c5',
    name: 'Stomach & Digestion',
    slug: 'digestive',
    icon: 'heart',
    color: '#DC2626',
    bg: '#FEE2E2',
    itemCount: '115+ Meds',
    popularSubcats: ['Antacids', 'Gas Relief', 'Probiotics'],
  },
  {
    id: 'c6',
    name: 'Skin & Dermatology',
    slug: 'skin',
    icon: 'sparkles',
    color: '#DB2777',
    bg: '#FDF2F8',
    itemCount: '120+ Meds',
    popularSubcats: ['Anti-Fungal', 'Sunscreen', 'Acne Care'],
  },
  {
    id: 'c7',
    name: 'Baby & Mother Care',
    slug: 'baby',
    icon: 'happy',
    color: '#0891B2',
    bg: '#ECFEFF',
    itemCount: '74+ Meds',
    popularSubcats: ['Diapers', 'Gripe Water', 'Oils'],
  },
  {
    id: 'c8',
    name: 'Ayurvedic & Herbal',
    slug: 'ayurveda',
    icon: 'leaf',
    color: '#166534',
    bg: '#DCFCE7',
    itemCount: '110+ Meds',
    popularSubcats: ['Chyawanprash', 'Juices', 'Herbal Oils'],
  },
  {
    id: 'c9',
    name: 'Heart & BP Care',
    slug: 'heart-bp',
    icon: 'pulse',
    color: '#B91C1C',
    bg: '#FFE4E6',
    itemCount: '92+ Meds',
    popularSubcats: ['BP Tablets', 'Cholesterol', 'Tonics'],
  },
  {
    id: 'c10',
    name: 'Eye & Ear Care',
    slug: 'eye-ear',
    icon: 'eye',
    color: '#4F46E5',
    bg: '#EEF2FF',
    itemCount: '65+ Meds',
    popularSubcats: ['Eye Drops', 'Ear Drops', 'Wipes'],
  },
  {
    id: 'c11',
    name: 'Sexual Wellness',
    slug: 'wellness',
    icon: 'shield-checkmark',
    color: '#9333EA',
    bg: '#FAF5FF',
    itemCount: '58+ Meds',
    popularSubcats: ['Performance', 'Supplements', 'Care'],
  },
  {
    id: 'c12',
    name: 'First Aid & Surgical',
    slug: 'first-aid',
    icon: 'bandage',
    color: '#0284C7',
    bg: '#E0F2FE',
    itemCount: '80+ Meds',
    popularSubcats: ['Bandages', 'Antiseptic', 'Cotton'],
  },
];

export const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedAddress } = useAddress();
  const { summary, totalItemCount } = useCart();
  const { onScroll, collapseAnim } = useTabBarScroll();
  const insets = useSafeAreaInsets();

  const floatingCartBottom = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Platform.OS === 'android' ? 88 : 96, Platform.OS === 'android' ? 72 : 80],
  });

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return ALL_CATEGORIES;
    const q = searchQuery.toLowerCase();
    return ALL_CATEGORIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.popularSubcats.some((s) => s.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <AppText variant="titleLarge" color={COLORS.textPrimary} weight="700">
              Categories
            </AppText>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('AddressSelection', { isSelectingForCheckout: false })}
              style={styles.locationRow}
            >
              <Ionicons name="location-sharp" size={13} color={COLORS.primary} />
              <AppText variant="caption" color={COLORS.textSecondary} numberOfLines={1} style={{ marginLeft: 3, fontSize: 11 }}>
                Delivering to {selectedAddress?.label || 'Home'} • {selectedAddress?.city || 'Punjab'}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <View style={[styles.searchBar, SHADOWS.subtle]}>
            <Ionicons name="search" size={18} color={COLORS.primary} style={{ marginRight: SPACING.xs }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search categories (e.g. Pain, Diabetes, Baby)"
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

        {/* Categories 2-Column Grid */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: totalItemCount > 0 ? 150 : 110 },
          ]}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.sectionHeaderRow}>
            <AppText variant="titleMedium" color={COLORS.textPrimary} weight="700">
              Shop by Category
            </AppText>
            <AppText variant="caption" color={COLORS.textSecondary}>
              {filteredCategories.length} Categories Available
            </AppText>
          </View>

          <View style={styles.categoriesGrid}>
            {filteredCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.88}
                onPress={() =>
                  navigation.navigate('CategoryListing', {
                    categorySlug: cat.slug,
                    categoryName: cat.name,
                  })
                }
                style={[styles.categoryGridCard, { backgroundColor: cat.bg }]}
              >
                {/* Top Row: Icon circle + Count badge */}
                <View style={styles.cardTopRow}>
                  <View style={styles.categoryIconCircle}>
                    <Ionicons name={cat.icon} size={22} color={cat.color} />
                  </View>
                  <View style={styles.countBadge}>
                    <AppText style={[styles.countBadgeText, { color: cat.color }]}>
                      {cat.itemCount}
                    </AppText>
                  </View>
                </View>

                {/* Category Title */}
                <AppText style={[styles.categoryTitleText, { color: cat.color }]} numberOfLines={2}>
                  {cat.name}
                </AppText>

                {/* Subcategory Pills */}
                <View style={styles.subcatsRow}>
                  {cat.popularSubcats.map((sub, idx) => (
                    <View key={idx} style={styles.subcatPill}>
                      <AppText style={styles.subcatPillText} numberOfLines={1}>
                        {sub}
                      </AppText>
                    </View>
                  ))}
                </View>

                {/* Explore Link */}
                <View style={styles.exploreRow}>
                  <AppText style={[styles.exploreText, { color: cat.color }]}>
                    Explore →
                  </AppText>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {filteredCategories.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
              <AppText variant="titleMedium" color={COLORS.textPrimary} weight="600" style={{ marginTop: 12 }}>
                No categories found
              </AppText>
              <AppText variant="bodySmall" color={COLORS.textSecondary} style={{ marginTop: 4 }}>
                Try searching for "Pain", "Diabetes", or "Vitamins"
              </AppText>
            </View>
          )}
        </ScrollView>

        {/* Floating Cart Indicator */}
        <FloatingCart
          onPressViewCart={() => navigation.navigate('Cart')}
          bottomOffset={floatingCartBottom}
        />
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
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: SPACING.xs,
    backgroundColor: '#FFFFFF',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  searchWrapper: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EE',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8FC',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: Platform.OS === 'ios' ? 9 : 5,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'LexendDeca_400Regular',
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  sectionHeaderRow: {
    marginBottom: SPACING.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryGridCard: {
    width: '48.5%',
    minHeight: 165,
    borderRadius: 20,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  categoryIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 10,
    fontFamily: 'LexendDeca_700Bold',
  },
  categoryTitleText: {
    fontSize: 14,
    fontFamily: 'LexendDeca_700Bold',
    marginTop: 6,
    lineHeight: 18,
  },
  subcatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  subcatPill: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BORDER_RADIUS.sm,
  },
  subcatPillText: {
    fontSize: 9,
    fontFamily: 'LexendDeca_500Medium',
    color: COLORS.textSecondary,
  },
  exploreRow: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  exploreText: {
    fontSize: 11,
    fontFamily: 'LexendDeca_700Bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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

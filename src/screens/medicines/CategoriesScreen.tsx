import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useAddress } from '../../store/AddressContext';
import { useCart } from '../../store/CartContext';
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
    icon: 'fitness-outline',
    color: '#7C3AED',
    bg: '#F3E8FF',
    itemCount: '142+ Medicines',
    popularSubcats: ['Headache', 'Fever', 'Body Pain', 'Joints'],
  },
  {
    id: 'c2',
    name: 'Cold, Cough & Flu',
    slug: 'cold-flu',
    icon: 'thermometer-outline',
    color: '#2563EB',
    bg: '#EFF6FF',
    itemCount: '98+ Medicines',
    popularSubcats: ['Syrups', 'Nasal Drops', 'Anti-Allergic', 'Lozenges'],
  },
  {
    id: 'c3',
    name: 'Diabetes Care',
    slug: 'diabetes',
    icon: 'water-outline',
    color: '#D97706',
    bg: '#FEF3C7',
    itemCount: '86+ Medicines',
    popularSubcats: ['Oral Tablets', 'Test Strips', 'Insulin', 'Sugar Free'],
  },
  {
    id: 'c4',
    name: 'Vitamins & Immunity',
    slug: 'vitamins',
    icon: 'sunny-outline',
    color: '#059669',
    bg: '#ECFDF5',
    itemCount: '164+ Medicines',
    popularSubcats: ['Multivitamins', 'Vitamin C', 'Vitamin D3', 'Zinc'],
  },
  {
    id: 'c5',
    name: 'Stomach & Digestion',
    slug: 'digestive',
    icon: 'heart-outline',
    color: '#DC2626',
    bg: '#FEE2E2',
    itemCount: '115+ Medicines',
    popularSubcats: ['Antacids', 'Gas Relief', 'Probiotics', 'Laxatives'],
  },
  {
    id: 'c6',
    name: 'Skin & Dermatology',
    slug: 'skin',
    icon: 'sparkles-outline',
    color: '#DB2777',
    bg: '#FDF2F8',
    itemCount: '120+ Medicines',
    popularSubcats: ['Anti-Fungal', 'Sunscreen', 'Acne Care', 'Healers'],
  },
  {
    id: 'c7',
    name: 'Baby & Mother Care',
    slug: 'baby',
    icon: 'happy-outline',
    color: '#0891B2',
    bg: '#ECFEFF',
    itemCount: '74+ Medicines',
    popularSubcats: ['Colic Care', 'Massage Oils', 'Gripe Water', 'Drops'],
  },
  {
    id: 'c8',
    name: 'Ayurvedic & Herbal',
    slug: 'ayurveda',
    icon: 'leaf-outline',
    color: '#166534',
    bg: '#DCFCE7',
    itemCount: '110+ Medicines',
    popularSubcats: ['Chyawanprash', 'Liver Care', 'Herbal Cough', 'Honey'],
  },
  {
    id: 'c9',
    name: 'Heart & BP Care',
    slug: 'heart-bp',
    icon: 'pulse-outline',
    color: '#B91C1C',
    bg: '#FFE4E6',
    itemCount: '92+ Medicines',
    popularSubcats: ['BP Tablets', 'Cholesterol', 'Aspirin', 'Heart Tonics'],
  },
];

export const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedAddress } = useAddress();
  const { summary, totalItemCount } = useCart();

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
            <AppText variant="titleMedium" color={COLORS.textPrimary} weight="800">
              Categories
            </AppText>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('AddressSelection', { isSelectingForCheckout: false })}
              style={styles.locationRow}
            >
              <Ionicons name="location" size={12} color={COLORS.primary} />
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

        {/* Categories Grid List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <AppText variant="titleSmall" color={COLORS.textPrimary} weight="800" style={{ marginBottom: SPACING.md }}>
            All Health Categories ({filteredCategories.length})
          </AppText>

          <View style={styles.categoriesGrid}>
            {filteredCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('CategoryListing', {
                    categorySlug: cat.slug,
                    categoryName: cat.name,
                  })
                }
                style={[styles.categoryCard, SHADOWS.subtle]}
              >
                <View style={[styles.categoryIconBox, { backgroundColor: cat.bg }]}>
                  <Ionicons name={cat.icon} size={28} color={cat.color} />
                </View>

                <View style={styles.categoryInfo}>
                  <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700" numberOfLines={1}>
                    {cat.name}
                  </AppText>
                  <AppText variant="caption" color={COLORS.primary} weight="600" style={{ marginTop: 2, fontSize: 11 }}>
                    {cat.itemCount}
                  </AppText>

                  {/* Subcategories preview tags */}
                  <View style={styles.subcatsRow}>
                    {cat.popularSubcats.slice(0, 3).map((sub, idx) => (
                      <View key={idx} style={styles.subcatPill}>
                        <AppText variant="caption" color={COLORS.textSecondary} style={{ fontSize: 9 }}>
                          {sub}
                        </AppText>
                      </View>
                    ))}
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Floating Cart Indicator */}
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
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EE',
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
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 110,
  },
  categoriesGrid: {
    gap: SPACING.sm,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    marginBottom: SPACING.xs,
  },
  categoryIconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  subcatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  subcatPill: {
    backgroundColor: '#F8F8FC',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  floatingCart: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 88 : 98,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
    zIndex: 998,
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

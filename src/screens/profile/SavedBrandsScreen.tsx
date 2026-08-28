import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../store/ToastContext';
import { useAppTheme } from '../../store/ThemeContext';

interface SavedBrandItem {
  id: string;
  name: string;
  tagline: string;
  hq: string;
  founded: string;
  specialties: string[];
  productCount: string;
  bg: string;
  image: string;
}

const INITIAL_SAVED_BRANDS: SavedBrandItem[] = [
  {
    id: 'cipla',
    name: 'Cipla',
    tagline: 'Caring for Life • Global Healthcare Leader',
    hq: 'Mumbai, India',
    founded: '1935',
    specialties: ['Respiratory', 'Anti-Retroviral', 'Cardiology'],
    productCount: '85+ Products',
    bg: '#004B93',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
  },
  {
    id: 'sun',
    name: 'Sun Pharma',
    tagline: 'Quality. Affordable. Life.',
    hq: 'Mumbai, India',
    founded: '1983',
    specialties: ['Dermatology', 'Psychiatry', 'Neurology'],
    productCount: '120+ Products',
    bg: '#4A2810',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&q=80',
  },
  {
    id: 'drreddy',
    name: "Dr. Reddy's",
    tagline: "Good Health Can't Wait",
    hq: 'Hyderabad, India',
    founded: '1984',
    specialties: ['Gastroenterology', 'Oncology', 'Pain Management'],
    productCount: '60+ Products',
    bg: '#4B286D',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&q=80',
  },
  {
    id: 'abbott',
    name: 'Abbott Healthcare',
    tagline: 'Life. To the Fullest. Science for Life.',
    hq: 'Chicago / Mumbai',
    founded: '1888',
    specialties: ['Nutrition', 'Diagnostics', 'Metabolic Care'],
    productCount: '95+ Products',
    bg: '#0072CE',
    image: 'https://images.unsplash.com/photo-1550572017-edb79a557451?w=400&q=80',
  },
  {
    id: 'mankind',
    name: 'Mankind Pharma',
    tagline: 'Serving Life • Accessible Healthcare',
    hq: 'New Delhi, India',
    founded: '1995',
    specialties: ['Antibiotics', 'Gastroenterology', 'Cardiology'],
    productCount: '110+ Products',
    bg: '#0A4D9C',
    image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&q=80',
  },
  {
    id: 'himalaya',
    name: 'Himalaya Wellness',
    tagline: 'Wellness Through Nature & Ayurveda',
    hq: 'Bengaluru, India',
    founded: '1930',
    specialties: ['Herbal Care', 'Wellness', 'Personal Care'],
    productCount: '45+ Products',
    bg: '#00833E',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
  },
];

export const SavedBrandsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { colors, isDark } = useAppTheme();
  const { showToast } = useToast();

  const [savedBrands, setSavedBrands] = useState<SavedBrandItem[]>(INITIAL_SAVED_BRANDS);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleConfirmRemove = () => {
    if (!deleteTargetId) return;
    const removedItem = savedBrands.find((b) => b.id === deleteTargetId);
    setSavedBrands((prev) => prev.filter((b) => b.id !== deleteTargetId));
    setDeleteTargetId(null);
    showToast(`${removedItem?.name || 'Brand'} removed from saved`, 'info');
  };

  const handleOpenBrand = (brand: SavedBrandItem) => {
    navigation.navigate('BrandDetail', {
      brandId: brand.id,
      brandName: brand.name,
      brandQuery: brand.name,
      brandBg: brand.bg,
      brandImage: brand.image,
      brandCount: brand.productCount,
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleCenter}>
          <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
            Saved Brands ({savedBrands.length})
          </AppText>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {savedBrands.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? colors.surfaceElevated : '#E0F2FE' }]}>
              <Ionicons name="shield-checkmark-outline" size={48} color="#0284C7" />
            </View>
            <AppText variant="titleMedium" color={colors.textPrimary} weight="700" style={{ marginTop: SPACING.md }}>
              No Saved Brands
            </AppText>
            <AppText
              variant="bodySmall"
              color={colors.textSecondary}
              style={{ textAlign: 'center', marginTop: SPACING.xs, paddingHorizontal: 32 }}
            >
              Follow trusted healthcare brands to easily view their complete product catalogs and offers.
            </AppText>
            <AppButton
              title="Explore Brands"
              variant="primary"
              onPress={() => (navigation as any).navigate('MainTabs', { screen: 'SearchTab' })}
              style={{ marginTop: SPACING.xl, width: 200 }}
            />
          </View>
        ) : (
          savedBrands.map((brand) => (
            <TouchableOpacity
              key={brand.id}
              activeOpacity={0.88}
              onPress={() => handleOpenBrand(brand)}
              style={[
                styles.brandCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                SHADOWS.subtle,
              ]}
            >
              <View style={styles.brandTopRow}>
                {/* Brand Logo Circle */}
                <View style={[styles.brandLogoCircle, { backgroundColor: brand.bg }]}>
                  <AppText style={styles.brandLogoInitial}>{brand.name.slice(0, 2).toUpperCase()}</AppText>
                </View>

                {/* Brand Title & Tagline */}
                <View style={styles.brandInfoCol}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                      {brand.name}
                    </AppText>
                    <Ionicons name="checkmark-circle" size={16} color="#16A34A" style={{ marginLeft: 5 }} />
                  </View>
                  <AppText variant="caption" color={colors.textMuted} numberOfLines={1} style={{ marginTop: 2 }}>
                    {brand.tagline}
                  </AppText>
                </View>

                {/* Unsave Heart Button */}
                <TouchableOpacity
                  onPress={() => setDeleteTargetId(brand.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.heartBtn}
                >
                  <Ionicons name="heart" size={22} color="#DC2626" />
                </TouchableOpacity>
              </View>

              {/* Specialties Pills */}
              <View style={styles.specialtiesRow}>
                {brand.specialties.map((s) => (
                  <View
                    key={s}
                    style={[styles.specialtyChip, { backgroundColor: isDark ? colors.surfaceElevated : '#F3EFFF' }]}
                  >
                    <AppText style={[styles.specialtyChipText, { color: colors.primary }]}>{s}</AppText>
                  </View>
                ))}
              </View>

              {/* Footer Row: Product count & CTA */}
              <View style={[styles.brandFooterRow, { borderTopColor: isDark ? colors.border : '#F1F3F9' }]}>
                <View style={styles.metaRow}>
                  <Ionicons name="cube-outline" size={14} color={colors.textMuted} style={{ marginRight: 4 }} />
                  <AppText variant="caption" color={colors.textSecondary} weight="600">
                    {brand.productCount}
                  </AppText>
                  <AppText variant="caption" color={colors.textMuted} style={{ marginHorizontal: 8 }}>
                    •
                  </AppText>
                  <AppText variant="caption" color={colors.textMuted}>
                    Estd. {brand.founded}
                  </AppText>
                </View>

                <View style={styles.viewCatalogLink}>
                  <AppText variant="caption" color={colors.primary} weight="700">
                    View Catalog →
                  </AppText>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={!!deleteTargetId}
        title="Remove from Saved Brands?"
        message="Are you sure you want to unfollow this brand?"
        confirmText="Remove"
        cancelText="Cancel"
        isDestructive
        icon="heart-dislike-outline"
        onConfirm={handleConfirmRemove}
        onCancel={() => setDeleteTargetId(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleCenter: {
    flex: 1,
    alignItems: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  brandCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  brandTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogoInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  brandInfoCol: {
    flex: 1,
    marginLeft: 12,
  },
  heartBtn: {
    padding: 4,
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  specialtyChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  specialtyChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  brandFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCatalogLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

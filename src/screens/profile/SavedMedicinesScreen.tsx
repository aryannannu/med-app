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
import { useCart } from '../../store/CartContext';
import { useAppTheme } from '../../store/ThemeContext';
import { formatCurrency } from '../../utils/currency';
import { Medicine } from '../../types/medicine';

interface SavedMedicineItem {
  id: string;
  name: string;
  brand: string;
  dosage: string;
  price: number;
  mrp: number;
  discountPercentage: number;
  rxRequired: boolean;
  image: string;
  category: string;
  categorySlug: string;
  saltComposition: string;
}

const INITIAL_SAVED_MEDICINES: SavedMedicineItem[] = [
  {
    id: 'med-1',
    name: 'Dolo 650 Tablet',
    brand: 'Micro Labs Ltd',
    dosage: '650mg (15 Tablets)',
    price: 30.5,
    mrp: 34.0,
    discountPercentage: 10,
    rxRequired: false,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80',
    category: 'Pain Relief',
    categorySlug: 'pain-relief',
    saltComposition: 'Paracetamol (650mg)',
  },
  {
    id: 'med-2',
    name: 'Cheston Cold Tablet',
    brand: 'Cipla Ltd',
    dosage: '10 Tablets Strip',
    price: 45.0,
    mrp: 52.0,
    discountPercentage: 13,
    rxRequired: false,
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&q=80',
    category: 'Cold & Cough',
    categorySlug: 'cold-cough',
    saltComposition: 'Cetirizine + Paracetamol + Phenylephrine',
  },
  {
    id: 'med-3',
    name: 'Asthalin 100mcg Inhaler',
    brand: 'Cipla Ltd',
    dosage: '100mcg (200 Metered Doses)',
    price: 155.0,
    mrp: 175.0,
    discountPercentage: 11,
    rxRequired: true,
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&q=80',
    category: 'Respiratory',
    categorySlug: 'respiratory',
    saltComposition: 'Salbutamol (100mcg)',
  },
  {
    id: 'med-4',
    name: 'Shelcal 500 Tablet',
    brand: 'Torrent Pharma',
    dosage: '500mg (15 Tablets)',
    price: 110.0,
    mrp: 130.0,
    discountPercentage: 15,
    rxRequired: false,
    image: 'https://images.unsplash.com/photo-1550572017-edb79a557451?w=300&q=80',
    category: 'Vitamins & Supplements',
    categorySlug: 'vitamins',
    saltComposition: 'Calcium + Vitamin D3',
  },
  {
    id: 'med-5',
    name: 'Pan 40 Tablet',
    brand: 'Alkem Laboratories',
    dosage: '40mg (15 Tablets)',
    price: 142.0,
    mrp: 165.0,
    discountPercentage: 14,
    rxRequired: true,
    image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=300&q=80',
    category: 'Digestion',
    categorySlug: 'digestion',
    saltComposition: 'Pantoprazole (40mg)',
  },
];

export const SavedMedicinesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { colors, isDark } = useAppTheme();
  const { showToast } = useToast();
  const { addToCart, getItemQuantity } = useCart();

  const [savedMedicines, setSavedMedicines] = useState<SavedMedicineItem[]>(INITIAL_SAVED_MEDICINES);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleConfirmRemove = () => {
    if (!deleteTargetId) return;
    const removedItem = savedMedicines.find((m) => m.id === deleteTargetId);
    setSavedMedicines((prev) => prev.filter((m) => m.id !== deleteTargetId));
    setDeleteTargetId(null);
    showToast(`${removedItem?.name || 'Medicine'} removed from saved`, 'info');
  };

  const handleAddToCart = (item: SavedMedicineItem) => {
    const medObj: Medicine = {
      id: item.id,
      name: item.name,
      brandName: item.brand,
      mrp: item.mrp,
      discountPrice: item.price,
      discountPercentage: item.discountPercentage,
      rxRequired: item.rxRequired,
      image: item.image,
      saltComposition: item.saltComposition,
      genericName: item.saltComposition,
      manufacturer: item.brand,
      description: 'Clinically formulated healthcare medication',
      uses: ['Pain Relief', 'Daily Care'],
      category: item.category,
      categorySlug: item.categorySlug,
      packForm: item.dosage,
      inStock: true,
    };
    addToCart(medObj, 1);
    showToast(`${item.name} added to cart`, 'success');
  };

  const handleOpenDetails = (item: SavedMedicineItem) => {
    const medObj: Medicine = {
      id: item.id,
      name: item.name,
      brandName: item.brand,
      mrp: item.mrp,
      discountPrice: item.price,
      discountPercentage: item.discountPercentage,
      rxRequired: item.rxRequired,
      image: item.image,
      saltComposition: item.saltComposition,
      genericName: item.saltComposition,
      manufacturer: item.brand,
      description: 'Clinically formulated healthcare medication',
      uses: ['Pain Relief', 'Daily Care'],
      category: item.category,
      categorySlug: item.categorySlug,
      packForm: item.dosage,
      inStock: true,
    };
    navigation.navigate('MedicineDetails', {
      medicineId: item.id,
      medicine: medObj,
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
            Saved Medicines ({savedMedicines.length})
          </AppText>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Cart')}
          style={styles.cartIconBtn}
        >
          <Ionicons name="cart-outline" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {savedMedicines.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? colors.surfaceElevated : '#F3EFFF' }]}>
              <Ionicons name="medkit-outline" size={48} color={colors.primary} />
            </View>
            <AppText variant="titleMedium" color={colors.textPrimary} weight="700" style={{ marginTop: SPACING.md }}>
              No Saved Medicines
            </AppText>
            <AppText
              variant="bodySmall"
              color={colors.textSecondary}
              style={{ textAlign: 'center', marginTop: SPACING.xs, paddingHorizontal: 32 }}
            >
              Tap the heart icon on any medicine card to save it for quick reordering.
            </AppText>
            <AppButton
              title="Explore Medicines"
              variant="primary"
              onPress={() => (navigation as any).navigate('MainTabs', { screen: 'SearchTab' })}
              style={{ marginTop: SPACING.xl, width: 200 }}
            />
          </View>
        ) : (
          savedMedicines.map((item) => {
            const inCartQty = getItemQuantity(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.88}
                onPress={() => handleOpenDetails(item)}
                style={[
                  styles.medicineCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  SHADOWS.subtle,
                ]}
              >
                {/* Image Col */}
                <View style={[styles.imageWrapper, { backgroundColor: isDark ? colors.surfaceElevated : '#F8F9FD' }]}>
                  <Image source={{ uri: item.image }} style={styles.medicineThumb} resizeMode="contain" />
                  {item.rxRequired && (
                    <View style={styles.rxBadge}>
                      <AppText style={styles.rxBadgeText}>Rx</AppText>
                    </View>
                  )}
                </View>

                {/* Info Col */}
                <View style={styles.infoCol}>
                  <View style={styles.rowTop}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <AppText variant="titleSmall" color={colors.textPrimary} weight="700" numberOfLines={1}>
                        {item.name}
                      </AppText>
                      <AppText variant="caption" color={colors.textMuted} numberOfLines={1} style={{ marginTop: 2 }}>
                        {item.brand} • {item.dosage}
                      </AppText>
                    </View>

                    {/* Unsave Heart Button */}
                    <TouchableOpacity
                      onPress={() => setDeleteTargetId(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.heartBtn}
                    >
                      <Ionicons name="heart" size={20} color="#DC2626" />
                    </TouchableOpacity>
                  </View>

                  {/* Composition / Salt */}
                  <AppText variant="caption" color={colors.textSecondary} numberOfLines={1} style={{ marginTop: 4 }}>
                    {item.saltComposition}
                  </AppText>

                  {/* Pricing and Action Row */}
                  <View style={styles.priceActionRow}>
                    <View style={styles.priceWrapper}>
                      <AppText variant="titleMedium" color={colors.textPrimary} weight="800">
                        {formatCurrency(item.price)}
                      </AppText>
                      {item.mrp > item.price && (
                        <AppText variant="caption" color={colors.textMuted} style={styles.mrpStruck}>
                          {formatCurrency(item.mrp)}
                        </AppText>
                      )}
                      {item.discountPercentage > 0 && (
                        <View style={styles.discountBadge}>
                          <AppText style={styles.discountBadgeText}>{item.discountPercentage}% OFF</AppText>
                        </View>
                      )}
                    </View>

                    {/* Add to Cart Button */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleAddToCart(item)}
                      style={[
                        styles.addBtn,
                        {
                          backgroundColor: inCartQty > 0 ? '#10B981' : colors.primary,
                        },
                      ]}
                    >
                      <Ionicons
                        name={inCartQty > 0 ? 'checkmark' : 'add'}
                        size={15}
                        color="#FFFFFF"
                        style={{ marginRight: 3 }}
                      />
                      <AppText variant="caption" color="#FFFFFF" weight="700">
                        {inCartQty > 0 ? `Added (${inCartQty})` : 'Add'}
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={!!deleteTargetId}
        title="Remove from Saved?"
        message="Are you sure you want to remove this medicine from your saved items?"
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
  cartIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  medicineCard: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  medicineThumb: {
    width: 68,
    height: 68,
  },
  rxBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  rxBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  infoCol: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heartBtn: {
    padding: 2,
  },
  priceActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  mrpStruck: {
    textDecorationLine: 'line-through',
    fontSize: 11,
  },
  discountBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  discountBadgeText: {
    color: '#16A34A',
    fontSize: 10,
    fontWeight: '700',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
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

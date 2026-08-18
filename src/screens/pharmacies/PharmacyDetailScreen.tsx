import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { SearchBar } from '../../components/common/SearchBar';
import { VerifiedBadge } from '../../components/badges/VerifiedBadge';
import { RatingBadge } from '../../components/badges/RatingBadge';
import { CartBadge } from '../../components/badges/CartBadge';
import { MedicineCard } from '../../components/cards/MedicineCard';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Ionicons } from '@expo/vector-icons';
import { PharmacyService } from '../../services/pharmacyService';
import { Pharmacy, PharmacyInventoryItem } from '../../types/pharmacy';
import { Medicine } from '../../types/medicine';
import { useCart } from '../../store/CartContext';
import { useToast } from '../../store/ToastContext';
import { formatDistance, formatDeliveryTime } from '../../utils/formatters';

export const PharmacyDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'PharmacyDetail'>>();
  const { pharmacyId, pharmacy: initialPharm } = route.params;

  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(initialPharm || null);
  const [inventory, setInventory] = useState<{ medicine: Medicine; inventory: PharmacyInventoryItem }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { totalItemCount, addToCart, getItemQuantity } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    PharmacyService.getPharmacyInventory(pharmacyId).then((res) => {
      if (res.pharmacy) setPharmacy(res.pharmacy);
      setInventory(res.items);
      setIsLoading(false);
    });
  }, [pharmacyId]);

  if (isLoading || !pharmacy) {
    return <LoadingState fullScreen message="Loading pharmacy inventory..." />;
  }

  const filteredItems = inventory.filter((item) =>
    item.medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.medicine.saltComposition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <AppText variant="titleMedium" color={COLORS.textPrimary} weight="700" numberOfLines={1} style={styles.headerTitle}>
          {pharmacy.name}
        </AppText>
        <CartBadge count={totalItemCount} onPress={() => navigation.navigate('Cart')} />
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.medicine.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Store Profile Card */}
            <View style={[styles.profileCard, SHADOWS.card]}>
              <View style={styles.profileRow}>
                <Image source={{ uri: pharmacy.logo }} style={styles.logo} resizeMode="cover" />
                <View style={styles.profileInfo}>
                  <AppText variant="h3" color={COLORS.textPrimary} weight="800" numberOfLines={2}>
                    {pharmacy.name}
                  </AppText>
                  {pharmacy.isVerified && <VerifiedBadge style={{ marginTop: 4 }} />}
                  <AppText variant="caption" color={COLORS.textSecondary} style={{ marginTop: 4 }}>
                    License: {pharmacy.licenseNumber}
                  </AppText>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.metaRow}>
                <RatingBadge rating={pharmacy.rating} reviewCount={pharmacy.reviewCount} />
                <View style={styles.dot} />
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                  <AppText variant="caption" color={COLORS.textSecondary} style={{ marginLeft: 2 }}>
                    {formatDistance(pharmacy.distanceKm)}
                  </AppText>
                </View>
                <View style={styles.dot} />
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                  <AppText variant="caption" color={COLORS.textSecondary} style={{ marginLeft: 2 }}>
                    {formatDeliveryTime(pharmacy.estimatedDeliveryTimeMinutes)}
                  </AppText>
                </View>
              </View>

              {pharmacy.about && (
                <AppText variant="bodySmall" color={COLORS.textSecondary} style={styles.aboutText}>
                  {pharmacy.about}
                </AppText>
              )}
            </View>

            {/* In-Store Search Bar */}
            <View style={styles.searchWrap}>
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                onClear={() => setSearchQuery('')}
                placeholder={`Search inside ${pharmacy.name}...`}
              />
            </View>

            <AppText variant="h4" color={COLORS.textPrimary} weight="700" style={styles.sectionTitle}>
              Store Medicine Inventory ({filteredItems.length})
            </AppText>
          </View>
        }
        renderItem={({ item }) => {
          const qty = getItemQuantity(item.medicine.id);
          return (
            <MedicineCard
              medicine={item.medicine}
              cartQuantity={qty}
              onPress={() =>
                navigation.navigate('MedicineDetails', {
                  medicineId: item.medicine.id,
                  medicine: item.medicine,
                })
              }
              onAddToCart={() => {
                addToCart(item.medicine, 1, undefined, pharmacy.id, pharmacy.name);
                showToast(`${item.medicine.name} added to cart from ${pharmacy.name}`, 'success');
              }}
              onIncrement={() => addToCart(item.medicine, 1, undefined, pharmacy.id, pharmacy.name)}
              onDecrement={() => {}}
            />
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  listContent: {
    padding: SPACING.lg,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surfaceSubtle,
  },
  profileInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.textMuted,
    marginHorizontal: SPACING.sm,
  },
  aboutText: {
    marginTop: SPACING.md,
    lineHeight: 20,
  },
  searchWrap: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
});

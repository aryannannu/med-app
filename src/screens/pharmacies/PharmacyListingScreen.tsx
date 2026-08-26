import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { SearchBar } from '../../components/common/SearchBar';
import { PharmacyCard } from '../../components/cards/PharmacyCard';
import { LoadingState } from '../../components/feedback/LoadingState';
import { CartBadge } from '../../components/badges/CartBadge';
import { Ionicons } from '@expo/vector-icons';
import { PharmacyService } from '../../services/pharmacyService';
import { Pharmacy } from '../../types/pharmacy';
import { useCart } from '../../store/CartContext';
import { useAppTheme } from '../../store/ThemeContext';

export const PharmacyListingScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { totalItemCount } = useCart();
  const { colors, isDark } = useAppTheme();

  useEffect(() => {
    PharmacyService.getNearbyPharmacies().then((data) => {
      setPharmacies(data);
      setIsLoading(false);
    });
  }, []);

  const filteredPharmacies = pharmacies.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVerified = !filterVerifiedOnly || p.isVerified;
    return matchesSearch && matchesVerified;
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="titleMedium" color={colors.textPrimary} weight="600" style={styles.headerTitle}>
          Nearby Pharmacies
        </AppText>
        <CartBadge count={totalItemCount} onPress={() => navigation.navigate('Cart')} />
      </View>

      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search pharmacies by name..."
        />

        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
            style={[styles.filterChip, filterVerifiedOnly && styles.filterChipActive]}
          >
            <Ionicons
              name={filterVerifiedOnly ? 'checkmark-circle' : 'shield-checkmark-outline'}
              size={16}
              color={filterVerifiedOnly ? COLORS.secondary : COLORS.textSecondary}
              style={{ marginRight: 4 }}
            />
            <AppText
              variant="caption"
              color={filterVerifiedOnly ? COLORS.secondaryDark : COLORS.textSecondary}
              weight="600"
            >
              Verified Only
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <LoadingState message="Locating verified pharmacies nearby..." />
      ) : (
        <FlatList
          data={filteredPharmacies}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <PharmacyCard
              pharmacy={item}
              onPress={() => navigation.navigate('PharmacyDetail', { pharmacyId: item.id, pharmacy: item })}
            />
          )}
        />
      )}
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8F8FC',
    borderWidth: 1,
    borderColor: '#E8E8EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  searchSection: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.secondaryLight,
    borderColor: COLORS.secondary,
  },
  listContent: {
    padding: SPACING.lg,
  },
});

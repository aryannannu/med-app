import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList, BottomTabParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { SearchBar } from '../../components/common/SearchBar';
import { MedicineCard } from '../../components/cards/MedicineCard';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { MedicineService } from '../../services/medicineService';
import { Medicine } from '../../types/medicine';
import { useCart } from '../../store/CartContext';
import { useToast } from '../../store/ToastContext';
import { useAppTheme } from '../../store/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const RECENT_SEARCHES = ['Dolo 650', 'Amoxicillin 500mg', 'Paracetamol', 'Pantoprazole', 'Vitamin C'];
const POPULAR_SUGGESTIONS = ['Dolo 650', 'Augmentin 625', 'Pan-D', 'Telma 40', 'Becosules', 'Montair LC', 'Volini'];

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<any>();
  const { colors, isDark } = useAppTheme();

  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'rx' | 'otc'>('all');
  const [searchResults, setSearchResults] = useState<{
    medicines: Medicine[];
    bySaltMatches: Medicine[];
    byGenericMatches: Medicine[];
    byBrandMatches: Medicine[];
  }>({
    medicines: [],
    bySaltMatches: [],
    byGenericMatches: [],
    byBrandMatches: [],
  });
  const [recentList, setRecentList] = useState<string[]>(RECENT_SEARCHES);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { addToCart, getItemQuantity } = useCart();
  const { showToast } = useToast();

  const executeSearch = useCallback(async (searchText: string) => {
    if (!searchText.trim()) {
      setSearchResults({ medicines: [], bySaltMatches: [], byGenericMatches: [], byBrandMatches: [] });
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    const results = await MedicineService.searchMedicines(searchText);
    setSearchResults({ medicines: results, bySaltMatches: [], byGenericMatches: [], byBrandMatches: results });
    setIsLoading(false);

    if (searchText && !recentList.includes(searchText)) {
      setRecentList((prev) => [searchText, ...prev.slice(0, 4)]);
    }
  }, [recentList]);

  // Handle route params if opened with initial query or category
  useEffect(() => {
    if (route.params?.initialQuery) {
      const q = route.params.initialQuery;
      setQuery(q);
      executeSearch(q);
    } else if (route.params?.categorySlug) {
      MedicineService.getMedicinesByCategory(route.params.categorySlug).then((meds) => {
        setSearchResults({ medicines: meds, bySaltMatches: [], byGenericMatches: [], byBrandMatches: meds });
        setHasSearched(true);
      });
    }
  }, [route.params, executeSearch]);

  const filteredMedicines = searchResults.medicines.filter((m) => {
    if (selectedFilter === 'rx') return m.rxRequired;
    if (selectedFilter === 'otc') return !m.rxRequired;
    return true;
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Search Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <SearchBar
          value={query}
          onChangeText={(txt) => {
            setQuery(txt);
            executeSearch(txt);
          }}
          onClear={() => {
            setQuery('');
            executeSearch('');
          }}
          placeholder="Search by brand, salt (e.g. Paracetamol), or generic"
          autoFocus={false}
          containerStyle={styles.searchBar}
        />

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setSelectedFilter('all')}
            style={[styles.filterPill, selectedFilter === 'all' && styles.filterPillActive]}
          >
            <AppText
              variant="caption"
              color={selectedFilter === 'all' ? COLORS.primary : COLORS.textSecondary}
              weight="600"
            >
              All Medicines
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedFilter('otc')}
            style={[styles.filterPill, selectedFilter === 'otc' && styles.filterPillActive]}
          >
            <AppText
              variant="caption"
              color={selectedFilter === 'otc' ? COLORS.primary : COLORS.textSecondary}
              weight="600"
            >
              OTC (No Rx)
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedFilter('rx')}
            style={[styles.filterPill, selectedFilter === 'rx' && styles.filterPillActive]}
          >
            <AppText
              variant="caption"
              color={selectedFilter === 'rx' ? COLORS.primary : COLORS.textSecondary}
              weight="600"
            >
              Rx Required
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      {isLoading ? (
        <LoadingState message="Searching catalogue & generic salts..." />
      ) : !hasSearched || query.trim().length === 0 ? (
        <ScrollView contentContainerStyle={styles.defaultContent}>
          {/* Recent Searches */}
          {recentList.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
                  Recent Searches
                </AppText>
                <TouchableOpacity onPress={() => setRecentList([])}>
                  <AppText variant="caption" color={COLORS.textMuted} weight="600">
                    Clear
                  </AppText>
                </TouchableOpacity>
              </View>

              <View style={styles.chipsWrap}>
                {recentList.map((item, index) => (
                  <TouchableOpacity
                    key={`recent-${index}`}
                    onPress={() => {
                      setQuery(item);
                      executeSearch(item);
                    }}
                    style={styles.chip}
                  >
                    <Ionicons name="time-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                    <AppText variant="bodySmall" color={COLORS.textPrimary}>
                      {item}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Popular Suggestions */}
          <View style={styles.section}>
            <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600" style={{ marginBottom: SPACING.sm }}>
              Frequently Searched
            </AppText>
            <View style={styles.chipsWrap}>
              {POPULAR_SUGGESTIONS.map((item, index) => (
                <TouchableOpacity
                  key={`pop-${index}`}
                  onPress={() => {
                    setQuery(item);
                    executeSearch(item);
                  }}
                  style={styles.chip}
                >
                  <Ionicons name="trending-up" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
                  <AppText variant="bodySmall" color={COLORS.textPrimary}>
                    {item}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : filteredMedicines.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No Medicines Found"
          message={`We couldn't find any medicine or generic salt matching "${query}". Try searching by salt name or upload your doctor prescription.`}
          actionText="Upload Prescription"
          onActionPress={() => navigation.navigate('UploadPrescription', { fromCart: false })}
        />
      ) : (
        <FlatList
          data={filteredMedicines}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const qty = getItemQuantity(item.id);
            return (
              <MedicineCard
                medicine={item}
                cartQuantity={qty}
                onPress={() => navigation.navigate('MedicineDetails', { medicineId: item.id, medicine: item })}
                onAddToCart={() => {
                  addToCart(item, 1);
                  showToast(`${item.name} added to cart`, 'success');
                }}
                onIncrement={() => addToCart(item, 1)}
                onDecrement={() => {}}
              />
            );
          }}
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  searchBar: {
    marginBottom: SPACING.sm,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  filterPill: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.primarySubtle,
    borderColor: COLORS.primary,
  },
  defaultContent: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  listContent: {
    padding: SPACING.lg,
  },
});

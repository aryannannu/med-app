import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { AppText } from '../common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../store/ThemeContext';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { DetectedMedicine } from '../../types/prescription';
import { formatCurrency } from '../../utils/currency';
import { haptics } from '../../services/hapticService';

// Comprehensive catalog pool for search
const CATALOG_MEDICINES: Array<{
  medicineId: string;
  name: string;
  composition: string;
  strength: string;
  form: string;
  availablePack: string;
  price: number;
  mrp: number;
  rxRequired: boolean;
  brandName: string;
  image: string;
}> = [
  {
    medicineId: 'med-1',
    name: 'Dolo 650 Tablet',
    composition: 'Paracetamol 650mg',
    strength: '650mg',
    form: 'Tablet',
    availablePack: 'Strip of 15',
    price: 30.5,
    mrp: 34.0,
    rxRequired: false,
    brandName: 'Micro Labs',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80',
  },
  {
    medicineId: 'med-azithral',
    name: 'Azithral 500 Tablet',
    composition: 'Azithromycin 500mg',
    strength: '500mg',
    form: 'Tablet',
    availablePack: 'Strip of 5',
    price: 118.0,
    mrp: 132.0,
    rxRequired: true,
    brandName: 'Alembic Pharmaceuticals',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=200&q=80',
  },
  {
    medicineId: 'med-pan40',
    name: 'Pan 40 Tablet',
    composition: 'Pantoprazole Gastro-resistant 40mg',
    strength: '40mg',
    form: 'Tablet',
    availablePack: 'Strip of 15',
    price: 135.0,
    mrp: 155.0,
    rxRequired: true,
    brandName: 'Alkem Laboratories',
    image: 'https://images.unsplash.com/photo-1550572017-edb79a557451?w=200&q=80',
  },
  {
    medicineId: 'med-augmentin',
    name: 'Augmentin 625 Duo Tablet',
    composition: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
    strength: '625mg',
    form: 'Tablet',
    availablePack: 'Strip of 10',
    price: 185.0,
    mrp: 205.0,
    rxRequired: true,
    brandName: 'GSK',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&q=80',
  },
  {
    medicineId: 'med-cheston',
    name: 'Cheston Cold Tablet',
    composition: 'Cetirizine 5mg + Paracetamol 325mg + Phenylephrine 10mg',
    strength: 'Tablet',
    form: 'Tablet',
    availablePack: 'Strip of 10',
    price: 45.0,
    mrp: 52.0,
    rxRequired: false,
    brandName: 'Cipla Ltd',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=200&q=80',
  },
  {
    medicineId: 'med-glycomet',
    name: 'Glycomet 500mg SR Tablet',
    composition: 'Metformin Hydrochloride 500mg',
    strength: '500mg',
    form: 'Tablet',
    availablePack: 'Strip of 20',
    price: 52.0,
    mrp: 60.0,
    rxRequired: true,
    brandName: 'USV Ltd',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=200&q=80',
  },
  {
    medicineId: 'med-telma',
    name: 'Telma 40 Tablet',
    composition: 'Telmisartan 40mg',
    strength: '40mg',
    form: 'Tablet',
    availablePack: 'Strip of 30',
    price: 198.0,
    mrp: 228.0,
    rxRequired: true,
    brandName: 'Glenmark',
    image: 'https://images.unsplash.com/photo-1550572017-edb79a557451?w=200&q=80',
  },
  {
    medicineId: 'med-montair',
    name: 'Montair-LC Tablet',
    composition: 'Levocetirizine 5mg + Montelukast 10mg',
    strength: 'Tablet',
    form: 'Tablet',
    availablePack: 'Strip of 10',
    price: 165.0,
    mrp: 185.0,
    rxRequired: true,
    brandName: 'Cipla Ltd',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80',
  },
  {
    medicineId: 'med-shelcal',
    name: 'Shelcal 500 Tablet',
    composition: 'Calcium 500mg + Vitamin D3 250 IU',
    strength: '500mg',
    form: 'Tablet',
    availablePack: 'Strip of 15',
    price: 110.0,
    mrp: 130.0,
    rxRequired: false,
    brandName: 'Torrent Pharma',
    image: 'https://images.unsplash.com/photo-1550572017-edb79a557451?w=200&q=80',
  },
];

interface MedicineSearchModalProps {
  visible: boolean;
  title: string;
  originalOcrText?: string;
  onClose: () => void;
  onSelect: (medicine: Partial<DetectedMedicine>) => void;
}

export const MedicineSearchModal: React.FC<MedicineSearchModalProps> = ({
  visible,
  title,
  originalOcrText,
  onClose,
  onSelect,
}) => {
  const { colors, isDark } = useAppTheme();
  const [query, setQuery] = useState('');

  const filteredMedicines = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATALOG_MEDICINES;
    return CATALOG_MEDICINES.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.composition.toLowerCase().includes(q) ||
        m.brandName.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSelect = (item: (typeof CATALOG_MEDICINES)[0]) => {
    haptics.selection();
    onSelect({
      medicineId: item.medicineId,
      name: item.name,
      composition: item.composition,
      strength: item.strength,
      form: item.form,
      availablePack: item.availablePack,
      price: item.price,
      mrp: item.mrp,
      rxRequired: item.rxRequired,
      brandName: item.brandName,
      image: item.image,
      reviewStatus: 'matched',
    });
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }, SHADOWS.modal]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <AppText variant="titleMedium" color={colors.textPrimary} weight="700">
                {title}
              </AppText>
              {originalOcrText && (
                <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
                  Extracted text: "{originalOcrText}"
                </AppText>
              )}
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={[styles.searchBar, { backgroundColor: isDark ? colors.surfaceElevated : '#F1F3F9' }]}>
            <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search medicine by name, salt, brand..."
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { color: colors.textPrimary }]}
              autoFocus
              clearButtonMode="while-editing"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Search Results List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollList}
          >
            {filteredMedicines.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="search-outline" size={36} color={colors.textMuted} />
                <AppText variant="bodyMedium" color={colors.textSecondary} style={{ marginTop: 8 }}>
                  No matching medicine found
                </AppText>
                <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 4 }}>
                  Try checking the spelling or search by generic salt name.
                </AppText>
              </View>
            ) : (
              filteredMedicines.map((item) => (
                <TouchableOpacity
                  key={item.medicineId}
                  activeOpacity={0.7}
                  onPress={() => handleSelect(item)}
                  style={[
                    styles.medicineItem,
                    { backgroundColor: isDark ? colors.surfaceElevated : '#F9FAFD', borderColor: colors.border },
                  ]}
                >
                  <Image source={{ uri: item.image }} style={styles.itemThumb} resizeMode="contain" />

                  <View style={styles.itemInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <AppText variant="titleSmall" color={colors.textPrimary} weight="700">
                        {item.name}
                      </AppText>
                      {item.rxRequired && (
                        <View style={styles.rxBadge}>
                          <AppText variant="caption" color="#DC2626" weight="800" style={{ fontSize: 9 }}>
                            Rx
                          </AppText>
                        </View>
                      )}
                    </View>

                    <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                      {item.composition} • {item.form}
                    </AppText>

                    <AppText variant="caption" color={colors.textMuted} style={{ fontSize: 11, marginTop: 1 }}>
                      {item.brandName} • {item.availablePack}
                    </AppText>
                  </View>

                  <View style={styles.itemPriceCol}>
                    <AppText variant="bodyMedium" color={colors.primary} weight="800">
                      {formatCurrency(item.price)}
                    </AppText>
                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={{ marginTop: 4 }} />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: '60%',
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    marginBottom: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  scrollList: {
    paddingBottom: 40,
  },
  medicineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  itemThumb: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  itemInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  rxBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  itemPriceCol: {
    alignItems: 'flex-end',
    marginLeft: SPACING.sm,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
});

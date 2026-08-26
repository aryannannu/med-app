import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../store/ThemeContext';
import { AppText } from '../../components/common/AppText';
import { MedicineCard } from '../../components/cards/MedicineCard';
import { VariantSelectionModal } from '../../components/modals/VariantSelectionModal';
import { Medicine } from '../../types/medicine';
import { useToast } from '../../store/ToastContext';

export const ProductCardShowcaseScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useAppTheme();
  const { showToast } = useToast();

  const [cardSize, setCardSize] = useState<'small' | 'medium'>('small');
  const [variantModalVisible, setVariantModalVisible] = useState(false);
  const [selectedMedForVariant, setSelectedMedForVariant] = useState<Medicine | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({
    'med-1': 0,
    'med-2': 0,
    'med-3': 0,
    'med-4': 0,
  });

  const handleIncrement = (id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
    showToast('Updated item quantity', 'info');
  };

  const handleDecrement = (id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) - 1),
    }));
  };

  const MOCK_ITEMS: (Medicine & {
    actionVariant: 'plus' | 'add' | 'dropdown' | 'stepper';
    dosageText: string;
  })[] = [
    {
      id: 'med-1',
      name: 'Cetrizine Dichloride',
      brandName: 'CIPLA',
      genericName: 'Cetirizine',
      saltComposition: 'Cetirizine Dihydrochloride 10mg',
      manufacturer: 'CIPLA',
      image:
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
      description: 'Antihistamine for allergy relief and runny nose.',
      uses: ['Allergy', 'Cold', 'Sneezing'],
      mrp: 198,
      discountPrice: 145,
      discountPercentage: 15,
      rxRequired: false,
      category: 'Cold & Allergy',
      categorySlug: 'cold-flu',
      packForm: '250mg • 30N',
      dosageText: '250mg • 30N',
      actionVariant: 'plus',
      rating: 4.2,
      inStock: true,
    },
    {
      id: 'med-2',
      name: 'Cetrizine Dichloride',
      brandName: 'CIPLA',
      genericName: 'Cetirizine',
      saltComposition: 'Cetirizine Dihydrochloride 10mg',
      manufacturer: 'CIPLA',
      image:
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
      description: 'Prescription antihistamine medication.',
      uses: ['Allergy', 'Cold'],
      mrp: 198,
      discountPrice: 145,
      discountPercentage: 15,
      rxRequired: true,
      category: 'Cold & Allergy',
      categorySlug: 'cold-flu',
      packForm: '10mg • 30N',
      dosageText: '10mg • 30N',
      actionVariant: 'plus',
      rating: 4.2,
      inStock: true,
    },
    {
      id: 'med-3',
      name: 'Cetrizine Dichloride',
      brandName: 'CIPLA',
      genericName: 'Cetirizine',
      saltComposition: 'Cetirizine Dihydrochloride 10mg',
      manufacturer: 'CIPLA',
      image:
        'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=80',
      description: 'Effective prescription allergy tablets.',
      uses: ['Allergy', 'Fever'],
      mrp: 198,
      discountPrice: 145,
      discountPercentage: 15,
      rxRequired: true,
      category: 'Cold & Allergy',
      categorySlug: 'cold-flu',
      packForm: '10mg • 30N',
      dosageText: '10mg • 30N',
      actionVariant: 'add',
      rating: 4.2,
      inStock: true,
    },
    {
      id: 'med-4',
      name: 'Cetrizine Dichloride',
      brandName: 'CIPLA',
      genericName: 'Cetirizine',
      saltComposition: 'Cetirizine Dihydrochloride 10mg',
      manufacturer: 'CIPLA',
      image:
        'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=80',
      description: 'Pack of 3 strips cetirizine hydrochloride.',
      uses: ['Allergy'],
      mrp: 198,
      discountPrice: 145,
      discountPercentage: 15,
      rxRequired: true,
      category: 'Cold & Allergy',
      categorySlug: 'cold-flu',
      packForm: '10mg • 30N',
      dosageText: '10mg • 30N',
      actionVariant: 'dropdown',
      rating: 4.2,
      inStock: true,
      variants: [
        { id: 'v1', packSize: '5mg • 10 Tablets', mrp: 110, discountPrice: 85, inStock: true, label: '5mg • 10N' },
        { id: 'v2', packSize: '10mg • 30 Tablets', mrp: 198, discountPrice: 145, inStock: true, label: '10mg • 30N' },
        { id: 'v3', packSize: '20mg • 30 Tablets', mrp: 280, discountPrice: 220, inStock: true, label: '20mg • 30N' },
      ],
    },
  ];

  const handleOpenVariantSheet = (med: Medicine) => {
    setSelectedMedForVariant(med);
    setVariantModalVisible(true);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* Screen Header */}
        <View style={[styles.topHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <AppText variant="titleMedium" weight="700" color={colors.textPrimary}>
              Product Cards Showcase
            </AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Pixel-perfect match to reference design
            </AppText>
          </View>

          {/* Size Toggle Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setCardSize(cardSize === 'small' ? 'medium' : 'small')}
            style={[styles.sizeToggleBtn, { backgroundColor: colors.primarySubtle, borderColor: colors.primary }]}
          >
            <Ionicons name="resize-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
            <AppText variant="caption" color={colors.primary} weight="700">
              {cardSize === 'small' ? 'Small' : 'Medium'}
            </AppText>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Showcase Banner Note */}
          <View style={[styles.infoBanner, { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF', borderColor: isDark ? '#6366F1' : '#C7D2FE' }]}>
            <Ionicons name="sparkles" size={18} color="#6366F1" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <AppText weight="700" style={{ color: isDark ? '#C7D2FE' : '#4C1D95', fontSize: 13 }}>
                Reference Design Match
              </AppText>
              <AppText style={{ color: isDark ? '#A5B4FC' : '#5B21B6', fontSize: 11.5, marginTop: 2 }}>
                Includes RX tag banner, top-right action button, inset dosage pill, delivery/rating badge, and compact size.
              </AppText>
            </View>
          </View>

          {/* 4 Cards Grid - Matching Reference Image Layout */}
          <View style={styles.sectionHeader}>
            <AppText variant="titleSmall" weight="700" color={colors.textPrimary}>
              4 Variant Showcase (Side-by-Side)
            </AppText>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalGrid}>
            {MOCK_ITEMS.map((item, index) => (
              <View key={item.id} style={styles.cardItemWrapper}>
                <View style={styles.cardVariantLabel}>
                  <AppText style={styles.cardVariantLabelText}>Card 0{index + 1}</AppText>
                </View>

                <MedicineCard
                  medicine={item}
                  size={cardSize}
                  actionVariant={item.actionVariant}
                  dosageText={item.dosageText}
                  cartQuantity={quantities[item.id] || 0}
                  onPress={() => showToast(`Selected ${item.name}`, 'info')}
                  onAddToCart={() => handleIncrement(item.id)}
                  onIncrement={() => handleIncrement(item.id)}
                  onDecrement={() => handleDecrement(item.id)}
                  onOpenVariantModal={handleOpenVariantSheet}
                />
              </View>
            ))}
          </ScrollView>

          {/* Standard 2-Column Responsive Grid */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <AppText variant="titleSmall" weight="700" color={colors.textPrimary}>
              Standard 2-Column Responsive Grid
            </AppText>
          </View>

          <View style={styles.twoColumnGrid}>
            {MOCK_ITEMS.map((item) => (
              <View key={`grid-${item.id}`} style={styles.gridColumnItem}>
                <MedicineCard
                  medicine={item}
                  size={cardSize}
                  actionVariant={item.actionVariant}
                  dosageText={item.dosageText}
                  cartQuantity={quantities[item.id] || 0}
                  onPress={() => showToast(`Selected ${item.name}`, 'info')}
                  onAddToCart={() => handleIncrement(item.id)}
                  onIncrement={() => handleIncrement(item.id)}
                  onDecrement={() => handleDecrement(item.id)}
                  onOpenVariantModal={handleOpenVariantSheet}
                  style={{ width: '100%' }}
                />
              </View>
            ))}
          </View>
        </ScrollView>

        <VariantSelectionModal
          visible={variantModalVisible}
          medicine={selectedMedForVariant}
          onClose={() => {
            setVariantModalVisible(false);
            setSelectedMedForVariant(null);
          }}
        />
      </View>
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
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
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
  sizeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  horizontalGrid: {
    gap: 12,
    paddingRight: 16,
  },
  cardItemWrapper: {
    alignItems: 'center',
  },
  cardVariantLabel: {
    backgroundColor: '#351682',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  cardVariantLabelText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontFamily: 'LexendDeca_700Bold',
  },
  twoColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridColumnItem: {
    width: '48%',
  },
});

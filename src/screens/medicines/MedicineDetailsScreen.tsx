import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppScreen } from '../../components/layout/AppScreen';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { RxBadge } from '../../components/badges/RxBadge';
import { RatingBadge } from '../../components/badges/RatingBadge';
import { QuantitySelector } from '../../components/controls/QuantitySelector';
import { CartBadge } from '../../components/badges/CartBadge';
import { LoadingState } from '../../components/feedback/LoadingState';
import { BottomSheet } from '../../components/modals/BottomSheet';
import { Ionicons } from '@expo/vector-icons';
import { MedicineService } from '../../services/medicineService';
import { Medicine } from '../../types/medicine';
import { useCart } from '../../store/CartContext';
import { useToast } from '../../store/ToastContext';
import { formatCurrency } from '../../utils/currency';

export const MedicineDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'MedicineDetails'>>();
  const { medicineId, medicine: initialMed } = route.params;

  const [medicine, setMedicine] = useState<Medicine | null>(initialMed || null);
  const [genericAlternatives, setGenericAlternatives] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(!initialMed);
  const [selectedPackSize, setSelectedPackSize] = useState('10 Tablets');
  const [activeTab, setActiveTab] = useState<'overview' | 'uses' | 'sideEffects' | 'safety'>('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPriceCompareSheet, setShowPriceCompareSheet] = useState(false);

  const { totalItemCount, addToCart, getItemQuantity, updateQuantity } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const med = await MedicineService.getMedicineById(medicineId);
        if (med) {
          setMedicine(med);
          const alts = await MedicineService.getAlternatives(med.id);
          setGenericAlternatives(alts);
        }
      } catch (e) {
        showToast('Failed to load medicine details', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [medicineId, showToast]);

  if (isLoading || !medicine) {
    return <LoadingState fullScreen message="Loading medicine details..." />;
  }

  const cartQuantity = getItemQuantity(medicine.id);
  const isOutOfStock = medicine.inStock === false;

  return (
    <AppScreen
      scrollable
      header={
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              onPress={() => {
                setIsFavorite(!isFavorite);
                showToast(isFavorite ? 'Removed from saved' : 'Added to saved medicines', 'info');
              }}
              style={styles.headerBtn}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? COLORS.danger : COLORS.textPrimary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => showToast('Medicine link copied to clipboard', 'info')}
              style={styles.headerBtn}
            >
              <Ionicons name="share-social-outline" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <CartBadge count={totalItemCount} onPress={() => navigation.navigate('Cart')} />
          </View>
        </View>
      }
      footer={
        <View style={[styles.bottomBar, SHADOWS.card]}>
          <View style={styles.bottomPriceCol}>
            <AppText variant="caption" color={COLORS.textMuted}>
              Total Price
            </AppText>
            <View style={styles.bottomPriceRow}>
              <AppText variant="h3" color={COLORS.primary} weight="800">
                {formatCurrency(medicine.discountPrice)}
              </AppText>
              {medicine.mrp > medicine.discountPrice && (
                <AppText variant="caption" color={COLORS.textMuted} style={styles.mrpCross}>
                  {formatCurrency(medicine.mrp)}
                </AppText>
              )}
            </View>
          </View>

          {isOutOfStock ? (
            <AppButton
              title="Notify Me"
              variant="outline"
              onPress={() => showToast('We will notify you once this medicine is back in stock', 'info')}
              style={styles.bottomCta}
              fullWidth={false}
              leftIcon={<Ionicons name="notifications-outline" size={18} color={COLORS.primary} />}
            />
          ) : cartQuantity > 0 ? (
            <QuantitySelector
              quantity={cartQuantity}
              onIncrement={() => addToCart(medicine, 1)}
              onDecrement={() => updateQuantity(medicine.id, cartQuantity - 1)}
              size="lg"
            />
          ) : (
            <AppButton
              title={medicine.rxRequired ? 'Add to Cart (Rx Required)' : 'Add to Cart'}
              variant="primary"
              onPress={() => {
                addToCart(medicine, 1);
                showToast(`${medicine.name} added to cart`, 'success');
              }}
              style={styles.bottomCta}
              fullWidth={false}
              leftIcon={<Ionicons name="cart-outline" size={18} color="#FFFFFF" />}
            />
          )}
        </View>
      }
    >
      {/* 1. Main Product Showcase Box */}
      <View style={[styles.productImageContainer, SHADOWS.subtle]}>
        <Image source={{ uri: medicine.image }} style={styles.productImg} resizeMode="contain" />

        {/* Status Overlay Badges */}
        <View style={styles.badgeOverlayRow}>
          {medicine.rxRequired && <RxBadge />}
          <View
            style={[
              styles.stockBadge,
              isOutOfStock ? styles.stockBadgeRed : styles.stockBadgeGreen,
            ]}
          >
            <AppText
              variant="caption"
              color={isOutOfStock ? COLORS.dangerDark : COLORS.successDark}
              weight="700"
              style={{ fontSize: 10 }}
            >
              {isOutOfStock ? 'Out of Stock' : 'In Stock'}
            </AppText>
          </View>
        </View>
      </View>

      {/* 2. Medicine Title & Salt Info */}
      <View style={styles.titleSection}>
        <AppText variant="h2" color={COLORS.textPrimary} weight="800">
          {medicine.name}
        </AppText>

        <AppText variant="titleSmall" color={COLORS.primary} weight="700" style={{ marginTop: 2 }}>
          {medicine.saltComposition}
        </AppText>

        <View style={styles.ratingAndOrderRow}>
          <RatingBadge rating={medicine.rating || 4.5} reviewCount={medicine.reviewCount || 120} />
          <AppText variant="caption" color={COLORS.textMuted} style={{ marginLeft: 8 }}>
            | 12.3K+ orders
          </AppText>
        </View>

        {/* Price Row */}
        <View style={styles.priceRow}>
          <AppText variant="h2" color={COLORS.primary} weight="800">
            {formatCurrency(medicine.discountPrice)}
          </AppText>
          <AppText variant="bodyMedium" color={COLORS.textMuted} style={styles.mrpText}>
            {formatCurrency(medicine.mrp)}
          </AppText>
          <View style={styles.discountPill}>
            <AppText variant="caption" color={COLORS.successDark} weight="700">
              {medicine.discountPercentage}% OFF
            </AppText>
          </View>
        </View>
        <AppText variant="caption" color={COLORS.textMuted} style={{ marginTop: 2 }}>
          MRP incl. of all taxes
        </AppText>

        {/* Benefit Chips */}
        <View style={styles.benefitChipsRow}>
          {['Pain relief', 'Fever reducer', 'Easy on stomach'].map((tag, idx) => (
            <View key={idx} style={styles.benefitChip}>
              <Ionicons name="checkmark-circle" size={12} color={COLORS.secondary} style={{ marginRight: 4 }} />
              <AppText variant="caption" color={COLORS.textSecondary} weight="600">
                {tag}
              </AppText>
            </View>
          ))}
        </View>
      </View>

      {/* 3. Pack Size Selector */}
      <View style={styles.sectionCard}>
        <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700" style={{ marginBottom: SPACING.sm }}>
          Pack size
        </AppText>
        <View style={styles.packSizeRow}>
          {['10 Tablets', '15 Tablets', '30 Tablets'].map((size) => {
            const isSelected = selectedPackSize === size;
            return (
              <TouchableOpacity
                key={size}
                activeOpacity={0.8}
                onPress={() => setSelectedPackSize(size)}
                style={[styles.packSizePill, isSelected && styles.packSizePillSelected]}
              >
                <AppText
                  variant="caption"
                  color={isSelected ? COLORS.primary : COLORS.textPrimary}
                  weight={isSelected ? '700' : '500'}
                >
                  {size}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 4. Delivery & Seller Info */}
      <View style={styles.deliverySellerCard}>
        <View style={styles.deliveryRow}>
          <Ionicons name="flash" size={16} color={COLORS.success} />
          <AppText variant="bodySmall" color={COLORS.successDark} weight="700" style={{ marginLeft: 6 }}>
            Delivery in 2 hours
          </AppText>
        </View>
        <View style={styles.sellerRow}>
          <AppText variant="caption" color={COLORS.textSecondary}>
            Sold by <AppText variant="caption" color={COLORS.textPrimary} weight="700">MedPlus Pharmacy</AppText> (★ 4.7)
          </AppText>
          <TouchableOpacity onPress={() => setShowPriceCompareSheet(true)}>
            <AppText variant="caption" color={COLORS.primary} weight="700">
              Compare Prices &gt;
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* 5. Cheaper Generic Equivalent / Popular Substitute */}
      {genericAlternatives.length > 0 && (
        <View style={[styles.genericAltCard, SHADOWS.subtle]}>
          <View style={styles.genericAltHeader}>
            <View style={styles.sparkleRow}>
              <Ionicons name="sparkles" size={16} color={COLORS.secondary} />
              <AppText variant="titleSmall" color={COLORS.secondaryDark} weight="800" style={{ marginLeft: 4 }}>
                Popular Alternative Available
              </AppText>
            </View>
            <View style={styles.saveBadge}>
              <AppText variant="caption" color={COLORS.successDark} weight="700" style={{ fontSize: 10 }}>
                SAVE UP TO 35%
              </AppText>
            </View>
          </View>

          <AppText variant="caption" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
            Same active salt ({medicine.saltComposition}) at a lower cost:
          </AppText>

          <View style={styles.altMedRow}>
            <Image
              source={{ uri: genericAlternatives[0].image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80' }}
              style={styles.altMedImg}
              resizeMode="contain"
            />
            <View style={styles.altMedInfo}>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700">
                {genericAlternatives[0].name}
              </AppText>
              <AppText variant="caption" color={COLORS.textMuted}>
                By {genericAlternatives[0].manufacturer}
              </AppText>
              <View style={styles.altPriceRow}>
                <AppText variant="titleSmall" color={COLORS.primary} weight="800">
                  {formatCurrency(genericAlternatives[0].mrp * 0.7)}
                </AppText>
                <AppText variant="caption" color={COLORS.textMuted} style={styles.mrpCross}>
                  {formatCurrency(genericAlternatives[0].mrp)}
                </AppText>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                showToast(`Switched to cheaper alternative: ${genericAlternatives[0].name}`, 'success');
              }}
              style={styles.switchAltBtn}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" style={{ marginRight: 2 }} />
              <AppText variant="buttonSmall" color="#FFFFFF" weight="700">
                ADD
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 6. Tabs & Clinical Information */}
      <View style={styles.tabsSection}>
        <View style={styles.tabHeadersRow}>
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'uses', label: 'Uses' },
            { key: 'sideEffects', label: 'Side Effects' },
            { key: 'safety', label: 'Safety' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.8}
              onPress={() => setActiveTab(tab.key as any)}
              style={[styles.tabHeaderBtn, activeTab === tab.key && styles.tabHeaderBtnActive]}
            >
              <AppText
                variant="buttonSmall"
                color={activeTab === tab.key ? COLORS.primary : COLORS.textSecondary}
                weight={activeTab === tab.key ? '700' : '500'}
              >
                {tab.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabContentCard}>
          {activeTab === 'overview' && (
            <View>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700" style={{ marginBottom: 4 }}>
                About this medicine
              </AppText>
              <AppText variant="bodySmall" color={COLORS.textSecondary} style={{ lineHeight: 20 }}>
                {medicine.description}
              </AppText>

              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700" style={{ marginTop: SPACING.md, marginBottom: 4 }}>
                Key Benefits
              </AppText>
              {['Provides fast symptom relief', 'Clinically tested formulation', 'Trusted brand quality'].map((benefit, i) => (
                <View key={i} style={styles.benefitRow}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <AppText variant="bodySmall" color={COLORS.textSecondary} style={{ marginLeft: 6 }}>
                    {benefit}
                  </AppText>
                </View>
              ))}

              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700" style={{ marginTop: SPACING.md, marginBottom: 4 }}>
                Manufacturer
              </AppText>
              <AppText variant="bodySmall" color={COLORS.textSecondary}>
                {medicine.manufacturer}
              </AppText>
            </View>
          )}

          {activeTab === 'uses' && (
            <View>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700" style={{ marginBottom: 6 }}>
                Primary Indications &amp; Uses
              </AppText>
              {(medicine.uses || []).map((use, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <AppText variant="bodySmall" color={COLORS.textSecondary} style={{ flex: 1 }}>
                    {use}
                  </AppText>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'sideEffects' && (
            <View>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700" style={{ marginBottom: 6 }}>
                Reported Side Effects
              </AppText>
              {(medicine.sideEffects || ['Mild nausea', 'Dizziness', 'Headache']).map((effect, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Ionicons name="alert-circle-outline" size={16} color={COLORS.warning} />
                  <AppText variant="bodySmall" color={COLORS.textSecondary} style={{ marginLeft: 6, flex: 1 }}>
                    {effect}
                  </AppText>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'safety' && (
            <View>
              <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700" style={{ marginBottom: 8 }}>
                Safety Advice
              </AppText>
              {[
                { type: 'Alcohol', status: 'Unsafe', advice: 'Consult your doctor before consuming alcohol with this medicine.' },
                { type: 'Pregnancy', status: 'Consult Doctor', advice: 'Safe only under medical supervision during pregnancy.' },
                { type: 'Driving', status: 'Caution', advice: 'May cause mild drowsiness in some patients.' },
              ].map((p, i) => (
                <View key={i} style={styles.precautionItem}>
                  <AppText variant="caption" color={COLORS.primary} weight="700">
                    {p.type.toUpperCase()}: {p.status}
                  </AppText>
                  <AppText variant="bodySmall" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
                    {p.advice}
                  </AppText>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* 7. Safety & Trust Guarantee Section */}
      <View style={[styles.trustCard, SHADOWS.subtle]}>
        <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700" style={{ marginBottom: SPACING.md }}>
          Why shop from Healit?
        </AppText>

        <View style={styles.trustRow}>
          <Ionicons name="shield-checkmark" size={18} color={COLORS.secondary} />
          <View style={styles.trustTextCol}>
            <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
              100% Genuine Medicines
            </AppText>
            <AppText variant="caption" color={COLORS.textMuted}>
              Sourced directly from licensed verified pharmacies
            </AppText>
          </View>
        </View>

        <View style={styles.trustRow}>
          <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
          <View style={styles.trustTextCol}>
            <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
              Expiry Guarantee
            </AppText>
            <AppText variant="caption" color={COLORS.textMuted}>
              Long expiry medicines dispatched with batch verification
            </AppText>
          </View>
        </View>

        <View style={styles.trustRow}>
          <Ionicons name="swap-horizontal-outline" size={18} color={COLORS.warning} />
          <View style={styles.trustTextCol}>
            <AppText variant="titleSmall" color={COLORS.textPrimary} weight="600">
              Easy Returns
            </AppText>
            <AppText variant="caption" color={COLORS.textMuted}>
              Hassle-free return policy
            </AppText>
          </View>
        </View>
      </View>

      {/* Price Comparison Bottom Sheet */}
      <BottomSheet
        visible={showPriceCompareSheet}
        onClose={() => setShowPriceCompareSheet(false)}
        title="Best Prices for You"
      >
        <View style={{ paddingBottom: SPACING.lg }}>
          {[
            { name: 'MedPlus Pharmacy', price: medicine.discountPrice, time: '20 mins', bestPrice: true },
            { name: 'Apollo Pharmacy', price: medicine.discountPrice + 1, time: '45 mins', bestPrice: false },
            { name: 'Netmeds Partner', price: medicine.discountPrice + 2, time: '40 mins', bestPrice: false },
            { name: '1mg Pharmacy', price: medicine.discountPrice + 3, time: '25 mins', bestPrice: false },
          ].map((store, i) => (
            <View key={i} style={styles.compareStoreRow}>
              <View style={styles.compareStoreLeft}>
                <Ionicons name="business" size={20} color={COLORS.primary} />
                <View style={{ marginLeft: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700">
                      {store.name}
                    </AppText>
                    {store.bestPrice && (
                      <View style={styles.bestPriceBadge}>
                        <AppText variant="caption" color={COLORS.successDark} weight="700" style={{ fontSize: 9 }}>
                          BEST PRICE
                        </AppText>
                      </View>
                    )}
                  </View>
                  <AppText variant="caption" color={COLORS.textSecondary}>
                    Delivery by {store.time}
                  </AppText>
                </View>
              </View>

              <AppText variant="titleMedium" color={COLORS.textPrimary} weight="800">
                {formatCurrency(store.price)}
              </AppText>
            </View>
          ))}

          <AppButton
            title={`Continue with ${formatCurrency(medicine.discountPrice)}`}
            onPress={() => {
              setShowPriceCompareSheet(false);
              addToCart(medicine, 1);
              showToast('Added to cart with best price offer', 'success');
            }}
            style={{ marginTop: SPACING.lg }}
          />
        </View>
      </BottomSheet>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImageContainer: {
    position: 'relative',
    height: 240,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productImg: {
    width: '80%',
    height: '80%',
  },
  badgeOverlayRow: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.xs,
  },
  stockBadgeGreen: {
    backgroundColor: '#DCFCE7',
  },
  stockBadgeRed: {
    backgroundColor: '#FEE2E2',
  },
  titleSection: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ratingAndOrderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: SPACING.md,
  },
  mrpText: {
    textDecorationLine: 'line-through',
    marginLeft: SPACING.sm,
  },
  discountPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
    marginLeft: SPACING.sm,
  },
  benefitChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.md,
  },
  benefitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.xs,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  packSizeRow: {
    flexDirection: 'row',
  },
  packSizePill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  packSizePillSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySubtle,
  },
  deliverySellerCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
  },
  genericAltCard: {
    backgroundColor: '#F0FDFA',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  genericAltHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sparkleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  altMedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  altMedImg: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.sm,
  },
  altMedInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  altPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  switchAltBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
  },
  tabsSection: {
    marginTop: SPACING.lg,
  },
  tabHeadersRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabHeaderBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
  },
  tabHeaderBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabContentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  precautionItem: {
    backgroundColor: COLORS.surfaceSubtle,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  trustCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xxxl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  trustTextCol: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  compareStoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  compareStoreLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bestPriceBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginLeft: 6,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bottomPriceCol: {
    flex: 1,
  },
  bottomPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  mrpCross: {
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  bottomCta: {
    minWidth: 160,
  },
});

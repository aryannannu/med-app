import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  ViewStyle,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../common/AppText';
import { useCart } from '../../store/CartContext';
import { useAddress } from '../../store/AddressContext';
import { useAppTheme } from '../../store/ThemeContext';

export type HeaderType =
  | 'home'
  | 'standard'
  | 'search'
  | 'category'
  | 'product'
  | 'store'
  | 'cart'
  | 'checkout'
  | 'prescription-upload'
  | 'prescription-comparison'
  | 'orders'
  | 'order-detail'
  | 'profile'
  | 'address'
  | 'wishlist'
  | 'notification'
  | 'filter'
  | 'offers'
  | 'support'
  | 'focused';

export interface AdaptiveHeaderProps {
  type?: HeaderType;

  // Generic Header Content Props
  title?: string;
  subtitle?: string;
  onBackPress?: () => void;
  showBack?: boolean;

  // Search Context
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  searchPlaceholder?: string;
  onSearchFocus?: () => void;
  autoFocusSearch?: boolean;

  // Home Specific Props
  activeMode?: 'medicines' | 'stores';
  onModeChange?: (mode: 'medicines' | 'stores') => void;
  onNotificationPress?: () => void;
  notificationCount?: number;
  onScanPress?: () => void;
  onVoicePress?: () => void;

  // Store Specific Props
  storeLogo?: string;
  storeRating?: number;
  storeDistanceTime?: string;
  isVerifiedStore?: boolean;

  // Product / Wishlist Props
  brandName?: string;
  isWishlisted?: boolean;
  onWishlistToggle?: () => void;
  onSharePress?: () => void;

  // Action CTAs
  cartCount?: number;
  onCartPress?: () => void;
  onFilterPress?: () => void;
  onAddPress?: () => void;
  onClearAllPress?: () => void;
  onMarkReadPress?: () => void;
  onHelpPress?: () => void;

  // Checkout Step Props
  checkoutStep?: 1 | 2 | 3;

  // Prescription Comparison Chips
  selectedChip?: string;
  onChipSelect?: (chipId: string) => void;

  // Filter Chips
  activeFilterCount?: number;
  activeFilterChips?: Array<{ id: string; label: string }>;
  onRemoveFilterChip?: (chipId: string) => void;

  // Offer Campaign Props
  couponCode?: string;

  // Custom Overrides
  style?: ViewStyle;
  isStandaloneShowcase?: boolean;
}

const COMPARISON_CHIPS = [
  { id: 'best-match', label: 'Best Match' },
  { id: 'lowest-price', label: 'Lowest Price' },
  { id: 'nearest', label: 'Nearest' },
  { id: 'all-available', label: 'All Available' },
  { id: 'fastest-delivery', label: 'Fastest Delivery' },
];

export const AdaptiveHeader: React.FC<AdaptiveHeaderProps> = ({
  type = 'standard',
  title,
  subtitle,
  onBackPress,
  showBack = true,

  searchQuery,
  onSearchChange,
  searchPlaceholder,
  onSearchFocus,
  autoFocusSearch = false,

  activeMode = 'medicines',
  onModeChange,
  onNotificationPress,
  notificationCount = 3,
  onScanPress,
  onVoicePress,

  storeLogo,
  storeRating = 4.6,
  storeDistanceTime = '1.2 km â€¢ 20 min',
  isVerifiedStore = true,

  brandName,
  isWishlisted = false,
  onWishlistToggle,
  onSharePress,

  cartCount: propCartCount,
  onCartPress,
  onFilterPress,
  onAddPress,
  onClearAllPress,
  onMarkReadPress,
  onHelpPress,

  checkoutStep = 1,

  selectedChip = 'best-match',
  onChipSelect,

  activeFilterCount = 2,
  activeFilterChips = [
    { id: 'f1', label: 'Within 5 km' },
    { id: 'f2', label: 'Open Now' },
    { id: 'f3', label: '4+ Rating' },
  ],
  onRemoveFilterChip,

  couponCode = 'HEAL20',

  style,
  isStandaloneShowcase = false,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { totalItemCount } = useCart();
  const { selectedAddress } = useAddress();
  const { colors, isDark } = useAppTheme();

  const [internalSearch, setInternalSearch] = useState(searchQuery || '');
  const [internalWishlist, setInternalWishlist] = useState(isWishlisted);

  const cartBadgeCount = propCartCount !== undefined ? propCartCount : totalItemCount;

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleCartClick = () => {
    if (onCartPress) {
      onCartPress();
    } else {
      (navigation as any).navigate('Cart');
    }
  };

  const handleSearchClick = () => {
    (navigation as any).navigate('Search');
  };

  const paddingTop = isStandaloneShowcase ? 12 : Platform.OS === 'android' ? Math.max(insets.top, 28) : Math.max(insets.top, 16);

  // =========================================================================
  // TYPE 01 â€” HOME SCREEN HEADER (Purple Gradient, Location, Bell, Mode Toggle, Search)
  // =========================================================================
  if (type === 'home') {
    return (
      <LinearGradient
        colors={['#431EAF', '#5223C7', '#6933DC', '#F8F8FC']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.homeGradientHeader, { paddingTop }, style]}
      >
        {/* Top Location & Notification Bell Row */}
        <View style={styles.homeTopRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => (navigation as any).navigate('AddressSelection', { isSelectingForCheckout: false })}
            style={styles.locationContainer}
          >
            <View style={styles.locationLabelRow}>
              <AppText variant="caption" color="rgba(255, 255, 255, 0.82)" style={{ fontSize: 11 }}>
                Deliver to
              </AppText>
            </View>

            <View style={styles.locationTitleRow}>
              <Ionicons name="location-sharp" size={17} color="#FFFFFF" style={{ marginRight: 4 }} />
              <AppText variant="titleMedium" color="#FFFFFF" weight="700" numberOfLines={1} style={{ fontSize: 16 }}>
                {selectedAddress ? `${selectedAddress.label} / ${selectedAddress.streetAddress || selectedAddress.city}` : 'Home / Sector 18, Noida'}
              </AppText>
              <Ionicons name="chevron-down" size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>

          {/* Notification Bell */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onNotificationPress || (() => (navigation as any).navigate('Notifications'))}
            style={styles.headerIconButton}
          >
            <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
            {notificationCount > 0 && (
              <View style={styles.homeNotificationBadge}>
                <AppText style={styles.badgeTextSmall}>{notificationCount}</AppText>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Shop Mode Segmented Control Toggle */}
        <View style={styles.modeToggleContainer}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => onModeChange && onModeChange('medicines')}
            style={[styles.modeToggleBtn, activeMode === 'medicines' && styles.modeToggleBtnActive]}
          >
            <Ionicons
              name="medkit-outline"
              size={15}
              color={activeMode === 'medicines' ? '#FFFFFF' : '#351682'}
              style={{ marginRight: 6 }}
            />
            <AppText
              style={[styles.modeToggleText, activeMode === 'medicines' ? styles.modeToggleTextActive : styles.modeToggleTextInactive]}
            >
              Shop by Medicine
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => onModeChange && onModeChange('stores')}
            style={[styles.modeToggleBtn, activeMode === 'stores' && styles.modeToggleBtnActive]}
          >
            <Ionicons
              name="storefront-outline"
              size={15}
              color={activeMode === 'stores' ? '#FFFFFF' : '#351682'}
              style={{ marginRight: 6 }}
            />
            <AppText
              style={[styles.modeToggleText, activeMode === 'stores' ? styles.modeToggleTextActive : styles.modeToggleTextInactive]}
            >
              Shop by Store
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Large Search Bar with Scan & Voice Action */}
        <View style={styles.homeSearchRow}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onSearchFocus || handleSearchClick}
            style={styles.homeSearchBar}
          >
            <Ionicons name="search-outline" size={20} color="#666666" style={{ marginRight: 8 }} />
            <AppText style={styles.homeSearchPlaceholder} numberOfLines={1}>
              {searchPlaceholder || (activeMode === 'medicines' ? 'Search medicines, products or pharmacies' : 'Search nearby licensed chemist shops')}
            </AppText>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onScanPress || (() => (navigation as any).navigate('UploadPrescription', { fromCart: false }))}
              style={styles.searchInnerIconBtn}
            >
              <Ionicons name="camera-outline" size={19} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onVoicePress}
              style={styles.searchInnerIconBtn}
            >
              <Ionicons name="mic-outline" size={19} color={COLORS.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // =========================================================================
  // TYPE 03 â€” SEARCH CONTEXT HEADER (Autofocused Search, Voice, Clean Back)
  // =========================================================================
  if (type === 'search') {
    return (
      <View style={[styles.whiteHeaderContainer, { paddingTop }, style]}>
        <View style={styles.headerBarRow}>
          <TouchableOpacity activeOpacity={0.8} onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.activeSearchInputWrapper}>
            <Ionicons name="search-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
            <TextInput
              value={searchQuery !== undefined ? searchQuery : internalSearch}
              onChangeText={(txt) => {
                setInternalSearch(txt);
                if (onSearchChange) onSearchChange(txt);
              }}
              placeholder={searchPlaceholder || 'Search medicines, brands or pharmacies'}
              placeholderTextColor={COLORS.textMuted}
              style={styles.activeSearchInput}
              autoFocus={autoFocusSearch}
              clearButtonMode="while-editing"
            />
            {onVoicePress && (
              <TouchableOpacity onPress={onVoicePress} style={{ padding: 4 }}>
                <Ionicons name="mic" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  // =========================================================================
  // TYPE 18 â€” OFFERS / CAMPAIGN HEADER (Purple Banner with Coupon Badge)
  // =========================================================================
  if (type === 'offers') {
    return (
      <LinearGradient
        colors={['#431EAF', '#5223C7', '#6933DC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.offersGradientHeader, { paddingTop }, style]}
      >
        <View style={styles.headerBarRow}>
          {showBack && (
            <TouchableOpacity activeOpacity={0.8} onPress={handleBack} style={styles.backButtonWhite}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          <View style={{ flex: 1, marginLeft: showBack ? 8 : 0 }}>
            <AppText variant="titleLarge" color="#FFFFFF" weight="700">
              {title || 'Flat 20% OFF'}
            </AppText>

            <AppText variant="caption" color="rgba(255, 255, 255, 0.85)" style={{ marginTop: 2 }}>
              {subtitle || 'On medicines & healthcare products'}
            </AppText>
          </View>

          {couponCode && (
            <View style={styles.couponBadge}>
              <Ionicons name="pricetag" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
              <AppText variant="caption" color="#FFFFFF" weight="700" style={{ fontSize: 11 }}>
                {couponCode}
              </AppText>
            </View>
          )}
        </View>
      </LinearGradient>
    );
  }

  // =========================================================================
  // TYPE 10 â€” PRESCRIPTION COMPARISON HEADER (With Contextual Filter Chips)
  // =========================================================================
  if (type === 'prescription-comparison') {
    return (
      <View style={[styles.whiteHeaderContainer, { paddingTop }, style]}>
        <View style={styles.headerBarRow}>
          {showBack && (
            <TouchableOpacity activeOpacity={0.8} onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          )}

          <View style={{ flex: 1, marginLeft: showBack ? 8 : 0 }}>
            <AppText variant="titleMedium" color={COLORS.textPrimary} weight="700">
              {title || 'Compare Pharmacies'}
            </AppText>
            <AppText variant="caption" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
              {subtitle || '8 medicines â€¢ 6 stores found'}
            </AppText>
          </View>

          <TouchableOpacity activeOpacity={0.8} onPress={onFilterPress} style={styles.headerIconButtonLight}>
            <Ionicons name="options-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Contextual Filter Chips Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contextualChipsRow}>
          {COMPARISON_CHIPS.map((chip) => {
            const isSelected = selectedChip === chip.id;
            return (
              <TouchableOpacity
                key={chip.id}
                activeOpacity={0.8}
                onPress={() => onChipSelect && onChipSelect(chip.id)}
                style={[styles.contextualChip, isSelected ? styles.contextualChipActive : undefined]}
              >
                <AppText style={[styles.contextualChipText, isSelected ? styles.contextualChipTextActive : undefined]}>
                  {chip.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // =========================================================================
  // TYPE 17 â€” FILTER HEADER (Active Count Badge & Clear All + Active Filter Chips)
  // =========================================================================
  if (type === 'filter') {
    return (
      <View style={[styles.whiteHeaderContainer, { paddingTop }, style]}>
        <View style={styles.headerBarRow}>
          {showBack && (
            <TouchableOpacity activeOpacity={0.8} onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          )}

          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: showBack ? 8 : 0 }}>
            <AppText variant="titleMedium" color={COLORS.textPrimary} weight="700">
              {title || 'Filters'}
            </AppText>
            {activeFilterCount > 0 && (
              <View style={styles.activeFilterBadgePill}>
                <AppText style={styles.activeFilterBadgeText}>{activeFilterCount}</AppText>
              </View>
            )}
          </View>

          <TouchableOpacity activeOpacity={0.8} onPress={onClearAllPress}>
            <AppText variant="bodySmall" color={COLORS.primary} weight="600">
              Clear All
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Active Filter Chips */}
        {activeFilterChips.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contextualChipsRow}>
            {activeFilterChips.map((chip) => (
              <TouchableOpacity
                key={chip.id}
                activeOpacity={0.8}
                onPress={() => onRemoveFilterChip && onRemoveFilterChip(chip.id)}
                style={styles.activeFilterChipItem}
              >
                <AppText style={styles.activeFilterChipText}>{chip.label}</AppText>
                <Ionicons name="close-circle" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  }

  // =========================================================================
  // TYPE 06 â€” STORE DETAIL HEADER (Store Logo, Name, Verified Badge, Share, Save)
  // =========================================================================
  if (type === 'store') {
    return (
      <View style={[styles.whiteHeaderContainer, { paddingTop }, style]}>
        <View style={styles.headerBarRow}>
          {showBack && (
            <TouchableOpacity activeOpacity={0.8} onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          )}

          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: showBack ? 8 : 0 }}>
            <Image
              source={{ uri: storeLogo || 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=120&q=80' }}
              style={styles.miniStoreLogo}
              resizeMode="cover"
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <AppText variant="titleSmall" color={COLORS.textPrimary} weight="700" numberOfLines={1}>
                  {title || 'Apollo Pharmacy'}
                </AppText>
                {isVerifiedStore && (
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
                )}
              </View>

              <AppText variant="caption" color={COLORS.textSecondary} style={{ fontSize: 11, marginTop: 1 }}>
                â˜… {storeRating} â€¢ {storeDistanceTime}
              </AppText>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.8} onPress={onSharePress} style={styles.headerIconButtonLight}>
            <Ionicons name="share-social-outline" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setInternalWishlist(!internalWishlist);
              if (onWishlistToggle) onWishlistToggle();
            }}
            style={[styles.headerIconButtonLight, { marginLeft: 8 }]}
          >
            <Ionicons
              name={internalWishlist ? 'heart' : 'heart-outline'}
              size={20}
              color={internalWishlist ? '#E11D48' : COLORS.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // =========================================================================
  // TYPE 08 â€” CHECKOUT HEADER (Step Indicator: 1 Delivery -> 2 Payment -> 3 Confirmation)
  // =========================================================================
  if (type === 'checkout') {
    return (
      <View style={[styles.whiteHeaderContainer, { paddingTop }, style]}>
        <View style={styles.headerBarRow}>
          {showBack && (
            <TouchableOpacity activeOpacity={0.8} onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          )}

          <View style={{ flex: 1, marginLeft: showBack ? 8 : 0 }}>
            <AppText variant="titleMedium" color={COLORS.textPrimary} weight="700">
              {title || 'Checkout'}
            </AppText>
          </View>
        </View>

        {/* Step Indicator */}
        <View style={styles.checkoutStepRow}>
          <View style={styles.stepItem}>
            <View style={[styles.stepDot, checkoutStep >= 1 ? styles.stepDotActive : undefined]}>
              <AppText style={[styles.stepNumber, checkoutStep >= 1 ? styles.stepNumberActive : undefined]}>1</AppText>
            </View>
            <AppText style={[styles.stepLabel, checkoutStep >= 1 ? styles.stepLabelActive : undefined]}>Delivery</AppText>
          </View>

          <View style={[styles.stepLine, checkoutStep >= 2 ? styles.stepLineActive : undefined]} />

          <View style={styles.stepItem}>
            <View style={[styles.stepDot, checkoutStep >= 2 ? styles.stepDotActive : undefined]}>
              <AppText style={[styles.stepNumber, checkoutStep >= 2 ? styles.stepNumberActive : undefined]}>2</AppText>
            </View>
            <AppText style={[styles.stepLabel, checkoutStep >= 2 ? styles.stepLabelActive : undefined]}>Payment</AppText>
          </View>

          <View style={[styles.stepLine, checkoutStep >= 3 ? styles.stepLineActive : undefined]} />

          <View style={styles.stepItem}>
            <View style={[styles.stepDot, checkoutStep >= 3 ? styles.stepDotActive : undefined]}>
              <AppText style={[styles.stepNumber, checkoutStep >= 3 ? styles.stepNumberActive : undefined]}>3</AppText>
            </View>
            <AppText style={[styles.stepLabel, checkoutStep >= 3 ? styles.stepLabelActive : undefined]}>Confirmation</AppText>
          </View>
        </View>
      </View>
    );
  }

  // =========================================================================
  // TYPE 07 & TYPE 09 â€” CART & PRESCRIPTION UPLOAD (Trust / Privacy Shield)
  // =========================================================================
  if (type === 'cart' || type === 'prescription-upload') {
    const isCart = type === 'cart';
    return (
      <View style={[styles.whiteHeaderContainer, { paddingTop }, style]}>
        <View style={styles.headerBarRow}>
          {showBack && (
            <TouchableOpacity activeOpacity={0.8} onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          )}

          <View style={{ flex: 1, marginLeft: showBack ? 8 : 0 }}>
            <AppText variant="titleMedium" color={COLORS.textPrimary} weight="700">
              {title || (isCart ? 'My Cart' : 'Upload Prescription')}
            </AppText>
            <AppText variant="caption" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
              {subtitle || (isCart ? `${cartBadgeCount} items` : 'Secure & Private')}
            </AppText>
          </View>

          {/* Security / Trust Indicator */}
          <View style={styles.trustBadgePill}>
            <Ionicons name="shield-checkmark" size={14} color="#059669" style={{ marginRight: 4 }} />
            <AppText variant="caption" color="#059669" weight="700" style={{ fontSize: 11 }}>
              100% Secure
            </AppText>
          </View>
        </View>
      </View>
    );
  }

  // =========================================================================
  // DEFAULT & REMAINING TYPES (Standard, Category, Product, Orders, Profile, Address, Wishlist, Notification, Support, Focused, Order Detail)
  // =========================================================================
  const getDefaultTitle = () => {
    if (title) return title;
    switch (type) {
      case 'category':
        return 'Category Details';
      case 'product':
        return 'Crocin 650 Tablet';
      case 'orders':
        return 'My Orders';
      case 'order-detail':
        return 'Order #HLT23984';
      case 'profile':
        return 'My Profile';
      case 'address':
        return 'Manage Addresses';
      case 'wishlist':
        return 'Wishlist';
      case 'notification':
        return 'Notifications';
      case 'support':
        return 'Help & Support';
      case 'focused':
        return 'Focused Task';
      default:
        return 'HEALIT';
    }
  };

  const getDefaultSubtitle = () => {
    if (subtitle) return subtitle;
    switch (type) {
      case 'category':
        return '120+ products';
      case 'product':
        return brandName || '15 Tablets';
      case 'orders':
        return 'Track and manage your orders';
      case 'order-detail':
        return 'Placed on 22 May';
      case 'profile':
        return 'Manage your account';
      case 'address':
        return '3 saved addresses';
      case 'wishlist':
        return '12 saved items';
      case 'notification':
        return 'Stay updated with HEALIT';
      case 'support':
        return 'How can we help you?';
      case 'focused':
        return 'Step 2 of 3';
      default:
        return undefined;
    }
  };

  const renderRightActions = () => {
    switch (type) {
      case 'standard':
      case 'category':
      case 'wishlist':
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity activeOpacity={0.8} onPress={handleSearchClick} style={styles.headerIconButtonLight}>
              <Ionicons name="search-outline" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} onPress={handleCartClick} style={[styles.headerIconButtonLight, { marginLeft: 8 }]}>
              <Ionicons name="cart-outline" size={20} color={COLORS.textPrimary} />
              {cartBadgeCount > 0 && (
                <View style={styles.actionCartBadge}>
                  <AppText style={styles.badgeTextSmall}>{cartBadgeCount}</AppText>
                </View>
              )}
            </TouchableOpacity>
          </View>
        );

      case 'product':
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity activeOpacity={0.8} onPress={handleSearchClick} style={styles.headerIconButtonLight}>
              <Ionicons name="search-outline" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setInternalWishlist(!internalWishlist);
                if (onWishlistToggle) onWishlistToggle();
              }}
              style={[styles.headerIconButtonLight, { marginLeft: 8 }]}
            >
              <Ionicons
                name={internalWishlist ? 'heart' : 'heart-outline'}
                size={20}
                color={internalWishlist ? '#E11D48' : COLORS.textPrimary}
              />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} onPress={handleCartClick} style={[styles.headerIconButtonLight, { marginLeft: 8 }]}>
              <Ionicons name="cart-outline" size={20} color={COLORS.textPrimary} />
              {cartBadgeCount > 0 && (
                <View style={styles.actionCartBadge}>
                  <AppText style={styles.badgeTextSmall}>{cartBadgeCount}</AppText>
                </View>
              )}
            </TouchableOpacity>
          </View>
        );

      case 'orders':
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity activeOpacity={0.8} onPress={handleSearchClick} style={styles.headerIconButtonLight}>
              <Ionicons name="search-outline" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} onPress={onFilterPress} style={[styles.headerIconButtonLight, { marginLeft: 8 }]}>
              <Ionicons name="options-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        );

      case 'profile':
        return (
          <TouchableOpacity activeOpacity={0.8} onPress={() => (navigation as any).navigate('Appearance')} style={styles.headerIconButtonLight}>
            <Ionicons name="settings-outline" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        );

      case 'address':
        return (
          <TouchableOpacity activeOpacity={0.8} onPress={onAddPress || (() => (navigation as any).navigate('AddEditAddress'))} style={styles.addCtaButton}>
            <Ionicons name="add" size={16} color="#FFFFFF" style={{ marginRight: 2 }} />
            <AppText variant="buttonSmall" color="#FFFFFF" weight="600">
              Add
            </AppText>
          </TouchableOpacity>
        );

      case 'notification':
        return (
          <TouchableOpacity activeOpacity={0.8} onPress={onMarkReadPress}>
            <AppText variant="bodySmall" color={COLORS.primary} weight="600">
              Mark all read
            </AppText>
          </TouchableOpacity>
        );

      case 'order-detail':
      case 'support':
        return (
          <TouchableOpacity activeOpacity={0.8} onPress={onHelpPress || (() => (navigation as any).navigate('ContactSupport'))} style={styles.supportPillBtn}>
            <Ionicons name="chatbubble-ellipses-outline" size={15} color={COLORS.primary} style={{ marginRight: 4 }} />
            <AppText variant="caption" color={COLORS.primary} weight="600">
              Help
            </AppText>
          </TouchableOpacity>
        );

      case 'focused':
        return null;

      default:
        return null;
    }
  };

  return (
    <View style={[styles.whiteHeaderContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop }, style]}>
      <View style={styles.headerBarRow}>
        {showBack && (
          <TouchableOpacity activeOpacity={0.8} onPress={handleBack} style={[styles.backButton, { backgroundColor: colors.surfaceSubtle }]}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        )}

        <View style={{ flex: 1, marginLeft: showBack ? 8 : 0 }}>
          <AppText variant="titleMedium" color={colors.textPrimary} weight="700" numberOfLines={1}>
            {getDefaultTitle()}
          </AppText>
          {getDefaultSubtitle() && (
            <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }} numberOfLines={1}>
              {getDefaultSubtitle()}
            </AppText>
          )}
        </View>

        {renderRightActions()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Home Header Gradient
  homeGradientHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  homeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  locationContainer: {
    flex: 1,
    marginRight: 10,
  },
  locationLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  homeNotificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#E11D48',
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#5223C7',
  },
  badgeTextSmall: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'LexendDeca_700Bold',
  },
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 3,
    alignItems: 'center',
    marginBottom: 12,
  },
  modeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 20,
  },
  modeToggleBtnActive: {
    backgroundColor: '#351682',
  },
  modeToggleText: {
    fontSize: 12.5,
    fontFamily: 'LexendDeca_600SemiBold',
  },
  modeToggleTextActive: {
    color: '#FFFFFF',
  },
  modeToggleTextInactive: {
    color: '#351682',
  },
  homeSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeSearchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingHorizontal: 14,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  homeSearchPlaceholder: {
    color: '#666666',
    fontSize: 13,
    flex: 1,
  },
  searchInnerIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },

  // Standard White Header Container
  whiteHeaderContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EE',
  },
  headerBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonWhite: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconButtonLight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8FC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  actionCartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },

  // Search Header
  activeSearchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8FC',
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 42,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  activeSearchInput: {
    flex: 1,
    fontSize: 13.5,
    color: COLORS.textPrimary,
    fontFamily: 'LexendDeca_400Regular',
  },

  // Offers Header
  offersGradientHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  couponBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },

  // Contextual Chips Row
  contextualChipsRow: {
    paddingTop: 10,
    gap: 8,
  },
  contextualChip: {
    backgroundColor: '#F8F8FC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  contextualChipActive: {
    backgroundColor: '#ECE8F7',
    borderColor: COLORS.primary,
  },
  contextualChipText: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    fontFamily: 'LexendDeca_500Medium',
  },
  contextualChipTextActive: {
    color: COLORS.primary,
    fontFamily: 'LexendDeca_700Bold',
  },

  // Filter Header Active Chips
  activeFilterBadgePill: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
  },
  activeFilterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'LexendDeca_700Bold',
  },
  activeFilterChipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECE8F7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  activeFilterChipText: {
    fontSize: 11,
    color: COLORS.primary,
    fontFamily: 'LexendDeca_600SemiBold',
  },

  // Store Header
  miniStoreLogo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8F8FC',
  },

  // Checkout Header Steps
  checkoutStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 12,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8E8EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepNumber: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: 'LexendDeca_700Bold',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 3,
    fontFamily: 'LexendDeca_500Medium',
  },
  stepLabelActive: {
    color: COLORS.primary,
    fontFamily: 'LexendDeca_700Bold',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E8E8EE',
    marginHorizontal: 8,
    marginBottom: 14,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },

  // Trust Badge
  trustBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },

  // Add CTA Button
  addCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },

  // Support Pill Button
  supportPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECE8F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
});


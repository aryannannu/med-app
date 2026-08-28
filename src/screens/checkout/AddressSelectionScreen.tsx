import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useAddress } from '../../store/AddressContext';
import { useToast } from '../../store/ToastContext';
import { useAppTheme } from '../../store/ThemeContext';
import { Address } from '../../types/user';
import { shareAddressViaApp } from '../../utils/addressShareUtils';

export const AddressSelectionScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { colors, isDark } = useAppTheme();
  const { showToast } = useToast();
  const route = useRoute<RouteProp<AppStackParamList, 'AddressSelection'>>();
  const isSelectingForCheckout = route.params?.isSelectingForCheckout || false;

  const { addresses, selectedAddress, selectAddress, deleteAddress, saveAddress } = useAddress();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleSelect = (address: Address) => {
    selectAddress(address);
    navigation.goBack();
  };

  const filteredAddresses = addresses.filter((address) => {
    const query = searchQuery.toLowerCase();
    return (
      address.recipientName.toLowerCase().includes(query) ||
      address.streetAddress.toLowerCase().includes(query) ||
      address.city.toLowerCase().includes(query) ||
      address.label.toLowerCase().includes(query)
    );
  });

  const displayedAddresses = showAll ? filteredAddresses : filteredAddresses.slice(0, 3);

  const getMockDistance = (index: number) => {
    const distances = ['18 m', '1.1 km', '2.2 km', '3.5 km', '4.8 km'];
    return distances[index % distances.length];
  };

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    setTimeout(async () => {
      setIsLocating(false);
      try {
        const newAddr = await saveAddress({
          label: 'Home',
          recipientName: 'Current Location',
          phone: '9876543210',
          houseFlatNumber: 'Plot No. 12',
          streetAddress: 'Industrial Area Phase 8B, Sector 74',
          city: 'Mohali',
          pincode: '160055',
          isDefault: true,
        });
        selectAddress(newAddr);
        navigation.goBack();
      } catch (err) {
        Alert.alert('Error', 'Failed to fetch current location.');
      }
    }, 1200);
  };

  const handleOptionsMenu = (address: Address) => {
    Alert.alert(
      address.recipientName,
      `${address.houseFlatNumber}, ${address.streetAddress}${address.landmark ? `, Near ${address.landmark}` : ''}, ${address.city}`,
      [
        {
          text: 'Share Address 📲',
          onPress: () => shareAddressViaApp(address),
        },
        {
          text: 'Edit Address',
          onPress: () => navigation.navigate('AddEditAddress', { address }),
        },
        {
          text: 'Delete Address',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete Address',
              'Are you sure you want to delete this address?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    await deleteAddress(address.id);
                    showToast('Address deleted', 'info');
                  },
                },
              ]
            );
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={[styles.backBtn, { backgroundColor: isDark ? colors.surfaceElevated : '#F3F4F6' }]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="titleMedium" color={colors.textPrimary} weight="600" style={{ marginLeft: 12 }}>
          Select your location
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar Input Container */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput
            placeholder="Search an area or address"
            placeholderTextColor={isDark ? colors.textMuted : '#8E8E93'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.textPrimary }]}
          />
          <Ionicons name="search-outline" size={20} color={isDark ? colors.textMuted : '#8E8E93'} />
        </View>

        {/* Premium Action Row List Options Card (Custom UI, replaces grid) */}
        <View style={[styles.optionsCard, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.subtle]}>
          {/* Row 1: Use Current Location */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleUseCurrentLocation}
            disabled={isLocating}
            style={styles.optionRow}
          >
            <View style={[styles.optionIconCircle, { backgroundColor: colors.primaryMuted }]}>
              {isLocating ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="navigate-sharp" size={18} color={colors.primary} />
              )}
            </View>
            <View style={styles.optionTextCol}>
              <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
                {isLocating ? 'Locating...' : 'Use Current Location'}
              </AppText>
              <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                Enable device GPS for quick pin drop
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.optionDivider, { backgroundColor: colors.border }]} />

          {/* Row 2: Add New Address */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AddEditAddress', {})}
            style={styles.optionRow}
          >
            <View style={[styles.optionIconCircle, { backgroundColor: colors.primaryMuted }]}>
              <Ionicons name="add-sharp" size={18} color={colors.primary} />
            </View>
            <View style={styles.optionTextCol}>
              <AppText variant="titleSmall" color={colors.textPrimary} weight="600">
                Add New Address
              </AppText>
              <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                Manually type house number, street, landmark
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Saved Addresses Section */}
        {filteredAddresses.length > 0 && (
          <View style={styles.savedSection}>
            <AppText variant="caption" color={colors.textSecondary} weight="700" style={styles.sectionHeader}>
              SAVED ADDRESSES
            </AppText>

            {displayedAddresses.map((address, idx) => {
              const isSelected = selectedAddress?.id === address.id;
              const isHome = address.label.toLowerCase() === 'home';
              const isWork = address.label.toLowerCase() === 'work';

              return (
                <TouchableOpacity
                  key={address.id}
                  activeOpacity={0.85}
                  onPress={() => handleSelect(address)}
                  style={[
                    styles.addressCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    isSelected && [
                      styles.addressCardSelected,
                      {
                        backgroundColor: isDark ? 'rgba(58, 41, 134, 0.18)' : '#F5F3FE',
                        borderColor: colors.primary,
                      },
                    ],
                    SHADOWS.subtle,
                  ]}
                >
                  {/* Left Column: Icon & Distance */}
                  <View
                    style={[
                      styles.leftCol,
                      {
                        backgroundColor: isSelected
                          ? (isDark ? 'rgba(58, 41, 134, 0.35)' : '#EDE9FE')
                          : (isDark ? colors.surfaceElevated : '#F3F4F6'),
                      },
                    ]}
                  >
                    <Ionicons
                      name={isHome ? 'home-outline' : isWork ? 'briefcase-outline' : 'location-outline'}
                      size={20}
                      color={isSelected ? colors.primary : '#4B5563'}
                    />
                    <AppText
                      variant="caption"
                      color={isSelected ? colors.primary : '#4B5563'}
                      weight="600"
                      style={styles.distanceText}
                    >
                      {getMockDistance(idx)}
                    </AppText>
                  </View>

                  {/* Middle Column: Details */}
                  <View style={styles.midCol}>
                    <View style={styles.nameRow}>
                      <AppText variant="titleMedium" color={colors.textPrimary} weight="600" numberOfLines={1}>
                        {address.recipientName}
                      </AppText>
                      {isSelected && (
                        <View
                          style={[
                            styles.selectedBadge,
                            {
                              backgroundColor: isDark ? 'rgba(139, 116, 230, 0.25)' : '#EDE9FE',
                            },
                          ]}
                        >
                          <AppText variant="caption" color={colors.primary} weight="700" style={{ fontSize: 9 }}>
                            SELECTED
                          </AppText>
                        </View>
                      )}
                    </View>

                    <AppText variant="bodyMedium" color={colors.textSecondary} numberOfLines={2} style={styles.addressDetailText}>
                      {address.houseFlatNumber}, {address.streetAddress}
                      {address.landmark ? `, Near ${address.landmark}` : ''}, {address.city}
                    </AppText>
                  </View>

                  {/* Right Column: Meatballs / 3-dots Menu (Includes Share, Edit, Delete) */}
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleOptionsMenu(address);
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.optionsBtn}
                  >
                    <Ionicons name="ellipsis-vertical" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}

            {/* View All Dropdown Link */}
            {filteredAddresses.length > 3 && (
              <TouchableOpacity
                onPress={() => setShowAll(!showAll)}
                style={styles.viewAllRow}
              >
                <AppText variant="bodyMedium" color={colors.primary} weight="600">
                  {showAll ? 'View less ∧' : 'View all ∨'}
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
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
  scrollContent: {
    padding: SPACING.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 48,
    marginBottom: SPACING.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
  },
  optionsCard: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  optionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextCol: {
    flex: 1,
    marginLeft: 14,
  },
  optionDivider: {
    height: 1,
    width: '100%',
  },
  savedSection: {
    marginTop: SPACING.sm,
  },
  sectionHeader: {
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: SPACING.md,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
  },
  addressCardSelected: {
    backgroundColor: '#F5F3FE',
  },
  leftCol: {
    width: 48,
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  distanceText: {
    fontSize: 9,
    marginTop: 2,
  },
  midCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  addressDetailText: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  optionsBtn: {
    padding: 4,
  },
  viewAllRow: {
    alignSelf: 'center',
    paddingVertical: SPACING.md,
    marginTop: 4,
  },
});

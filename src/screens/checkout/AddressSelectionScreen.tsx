import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { useAddress } from '../../store/AddressContext';
import { Address } from '../../types/user';
import { formatPhoneNumber } from '../../utils/formatters';

export const AddressSelectionScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'AddressSelection'>>();
  const isSelectingForCheckout = route.params?.isSelectingForCheckout || false;

  const { addresses, selectedAddress, selectAddress } = useAddress();

  const handleSelect = (address: Address) => {
    selectAddress(address);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <AppText variant="titleMedium" color={COLORS.textPrimary} weight="700">
          Saved Delivery Addresses
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AppButton
          title="+ Add New Address"
          variant="outline"
          size="md"
          onPress={() => navigation.navigate('AddEditAddress', {})}
          style={styles.addNewBtn}
        />

        {addresses.map((address) => {
          const isSelected = selectedAddress?.id === address.id;

          return (
            <TouchableOpacity
              key={address.id}
              activeOpacity={0.85}
              onPress={() => handleSelect(address)}
              style={[
                styles.addressCard,
                isSelected && styles.addressCardSelected,
                SHADOWS.subtle,
              ]}
            >
              <View style={styles.topRow}>
                <View style={styles.labelPill}>
                  <Ionicons
                    name={address.label === 'Home' ? 'home-outline' : address.label === 'Work' ? 'briefcase-outline' : 'location-outline'}
                    size={14}
                    color={COLORS.primary}
                  />
                  <AppText variant="caption" color={COLORS.primary} weight="700" style={{ marginLeft: 4 }}>
                    {address.label.toUpperCase()}
                  </AppText>
                </View>

                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} />
                    <AppText variant="caption" color={COLORS.secondaryDark} weight="700" style={{ marginLeft: 3 }}>
                      Selected
                    </AppText>
                  </View>
                )}
              </View>

              <AppText variant="titleMedium" color={COLORS.textPrimary} weight="700" style={styles.recipientName}>
                {address.recipientName}
              </AppText>

              <AppText variant="bodyMedium" color={COLORS.textSecondary} style={styles.fullAddress}>
                {address.houseFlatNumber}, {address.streetAddress}
                {address.landmark ? `, Near ${address.landmark}` : ''}
              </AppText>

              <AppText variant="bodySmall" color={COLORS.textMuted} style={styles.cityPincode}>
                {address.city} - {address.pincode}
              </AppText>

              <AppText variant="bodySmall" color={COLORS.textPrimary} weight="600" style={styles.phone}>
                Phone: {formatPhoneNumber(address.phone)}
              </AppText>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AddEditAddress', { address })}
                  style={styles.editBtn}
                >
                  <Ionicons name="pencil-outline" size={14} color={COLORS.primary} />
                  <AppText variant="buttonSmall" color={COLORS.primary} weight="700" style={{ marginLeft: 4 }}>
                    Edit Address
                  </AppText>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
  scrollContent: {
    padding: SPACING.lg,
  },
  addNewBtn: {
    marginBottom: SPACING.lg,
  },
  addressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  addressCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySubtle,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  labelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryLight,
    paddingVertical: 2,
    paddingHorizontal: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  recipientName: {
    marginTop: 4,
  },
  fullAddress: {
    marginTop: 4,
    lineHeight: 20,
  },
  cityPincode: {
    marginTop: 2,
  },
  phone: {
    marginTop: SPACING.xs,
  },
  actionsRow: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
  },
});

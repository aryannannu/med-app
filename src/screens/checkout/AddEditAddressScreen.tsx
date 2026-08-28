import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme';
import { AppText } from '../../components/common/AppText';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { useAddress } from '../../store/AddressContext';
import { useToast } from '../../store/ToastContext';
import { useAppTheme } from '../../store/ThemeContext';
import { isValidPincode, isValidIndianPhoneNumber } from '../../utils/validators';

import { shareAddressViaApp } from '../../utils/addressShareUtils';

export const AddEditAddressScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'AddEditAddress'>>();
  const existing = route.params?.address;

  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>(existing?.label || 'Home');
  const [recipientName, setRecipientName] = useState(existing?.recipientName || 'Rahul Sharma');
  const [phone, setPhone] = useState(existing?.phone || '9876543210');
  const [houseFlatNumber, setHouseFlatNumber] = useState(existing?.houseFlatNumber || '');
  const [apartmentBuilding, setApartmentBuilding] = useState(existing?.apartmentBuilding || '');
  const [streetAddress, setStreetAddress] = useState(existing?.streetAddress || '');
  const [landmark, setLandmark] = useState(existing?.landmark || '');
  const [city, setCity] = useState(existing?.city || 'Bengaluru');
  const [pincode, setPincode] = useState(existing?.pincode || '560038');
  const [isDefault, setIsDefault] = useState(existing?.isDefault || false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);

  const { saveAddress } = useAddress();
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!recipientName.trim()) newErrors.recipientName = 'Name is required';
    if (!isValidIndianPhoneNumber(phone)) newErrors.phone = 'Valid 10-digit phone required';
    if (!houseFlatNumber.trim()) newErrors.houseFlatNumber = 'Flat / House number is required';
    if (!streetAddress.trim()) newErrors.streetAddress = 'Street / Area is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!isValidPincode(pincode)) newErrors.pincode = 'Valid 6-digit pincode required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      await saveAddress({
        id: existing?.id,
        label,
        recipientName,
        phone,
        houseFlatNumber,
        apartmentBuilding,
        streetAddress,
        landmark,
        city,
        pincode,
        isDefault,
      });

      setSaving(false);
      showToast('Address saved successfully', 'success');
      navigation.goBack();
    } catch (e) {
      setSaving(false);
      showToast('Failed to save address', 'error');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="titleMedium" color={colors.textPrimary} weight="600">
          {existing ? 'Edit Address' : 'Add New Address'}
        </AppText>
        {existing ? (
          <TouchableOpacity
            onPress={() => shareAddressViaApp(existing)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="share-social-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Label Type Selector */}
          <AppText variant="caption" color={colors.textSecondary} weight="600" style={styles.sectionLabel}>
            ADDRESS TYPE
          </AppText>
          <View style={styles.labelRow}>
            {(['Home', 'Work', 'Other'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setLabel(type)}
                style={[styles.labelBtn, label === type && styles.labelBtnActive]}
              >
                <Ionicons
                  name={type === 'Home' ? 'home' : type === 'Work' ? 'briefcase' : 'location'}
                  size={16}
                  color={label === type ? COLORS.primary : COLORS.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <AppText
                  variant="buttonSmall"
                  color={label === type ? COLORS.primary : COLORS.textSecondary}
                  weight="600"
                >
                  {type}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Form Inputs */}
          <AppInput
            label="Recipient Full Name"
            placeholder="e.g. Rahul Sharma"
            value={recipientName}
            onChangeText={setRecipientName}
            error={errors.recipientName}
          />

          <AppInput
            label="Mobile Number"
            placeholder="e.g. 98765 43210"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
            error={errors.phone}
          />

          <AppInput
            label="Flat / House / Building Number"
            placeholder="e.g. Flat 402, Oakwood Apartments"
            value={houseFlatNumber}
            onChangeText={setHouseFlatNumber}
            error={errors.houseFlatNumber}
          />

          <AppInput
            label="Street / Locality / Sector"
            placeholder="e.g. 14th Cross, 6th Main, Indiranagar"
            value={streetAddress}
            onChangeText={setStreetAddress}
            error={errors.streetAddress}
          />

          <AppInput
            label="Landmark (Optional)"
            placeholder="e.g. Opposite Metro Station"
            value={landmark}
            onChangeText={setLandmark}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: SPACING.sm }}>
              <AppInput
                label="City"
                placeholder="e.g. Bengaluru"
                value={city}
                onChangeText={setCity}
                error={errors.city}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppInput
                label="Pincode"
                placeholder="e.g. 560038"
                keyboardType="number-pad"
                maxLength={6}
                value={pincode}
                onChangeText={setPincode}
                error={errors.pincode}
              />
            </View>
          </View>

          {/* Set as default switch */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsDefault(!isDefault)}
            style={styles.defaultToggleRow}
          >
            <Ionicons
              name={isDefault ? 'checkbox' : 'square-outline'}
              size={22}
              color={isDefault ? COLORS.primary : COLORS.textMuted}
            />
            <AppText variant="bodySmall" color={colors.textPrimary} weight="600" style={{ marginLeft: SPACING.sm }}>
              Make this my default delivery address
            </AppText>
          </TouchableOpacity>

          <AppButton
            title={existing ? 'Save Changes' : 'Save Address'}
            variant="primary"
            size="lg"
            loading={saving}
            onPress={handleSave}
            style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    padding: SPACING.lg,
  },
  sectionLabel: {
    marginBottom: SPACING.xs,
  },
  labelRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  labelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  labelBtnActive: {
    backgroundColor: COLORS.primarySubtle,
    borderColor: COLORS.primary,
  },
  row: {
    flexDirection: 'row',
  },
  defaultToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  saveBtn: {
    marginTop: SPACING.md,
  },
});


import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Medicine, MedicineVariant } from '../../types/medicine';
import { useCart } from '../../store/CartContext';
import { useToast } from '../../store/ToastContext';
import { AppText } from '../common/AppText';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/currency';

export interface VariantSelectionModalProps {
  visible: boolean;
  medicine: Medicine | null;
  onClose: () => void;
  sourcePharmacyId?: string;
  sourcePharmacyName?: string;
}

export const VariantSelectionModal: React.FC<VariantSelectionModalProps> = ({
  visible,
  medicine,
  onClose,
  sourcePharmacyId,
  sourcePharmacyName,
}) => {
  const { addToCart, getVariantQuantity, updateQuantity, removeFromCart, undoRemove } = useCart();
  const { showToast } = useToast();

  const [selectedVariant, setSelectedVariant] = useState<MedicineVariant | null>(null);

  // Default selection when modal opens
  useEffect(() => {
    if (medicine && medicine.variants && medicine.variants.length > 0) {
      const firstInStock = medicine.variants.find((v) => v.inStock !== false);
      setSelectedVariant(firstInStock || medicine.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [medicine, visible]);

  if (!medicine || !visible) return null;

  const variants = medicine.variants || [];

  const handleConfirmAdd = () => {
    if (!selectedVariant) return;

    if (!selectedVariant.inStock) {
      showToast('Selected variant is currently out of stock', 'error');
      return;
    }

    const added = addToCart(
      medicine,
      1,
      selectedVariant,
      sourcePharmacyId,
      sourcePharmacyName
    );

    if (added) {
      showToast(
        `Added ${selectedVariant.label || selectedVariant.packSize} to cart!`,
        'success'
      );
      if (medicine.rxRequired) {
        setTimeout(() => {
          showToast('Prescription will be required before placing order', 'info', 3500);
        }, 800);
      }
      onClose();
    } else {
      showToast('Maximum quantity limit (10) reached for this medicine', 'warning');
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              {/* 1. Drag Handle */}
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>

              {/* 2. Header */}
              <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                  <AppText style={styles.title}>Select Pack</AppText>
                  <AppText style={styles.subtitle}>
                    Choose the option you want to add
                  </AppText>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.closeBtn}
                >
                  <Ionicons name="close" size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* 3. Medicine Info Summary Header */}
              <View style={styles.medicineSummaryCard}>
                <View style={{ flex: 1 }}>
                  <AppText style={styles.medicineName}>{medicine.name}</AppText>
                  <AppText style={styles.saltText}>{medicine.saltComposition}</AppText>
                </View>
                {medicine.rxRequired && (
                  <View style={styles.rxBadge}>
                    <AppText style={styles.rxBadgeText}>RX Required</AppText>
                  </View>
                )}
              </View>

              {/* 4. Variant List */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.variantList}
                contentContainerStyle={{ paddingBottom: 16 }}
              >
                {variants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const isAvailable = variant.inStock !== false;
                  const cartQty = getVariantQuantity(medicine.id, variant.id);
                  const savings =
                    variant.mrp && variant.discountPrice
                      ? Math.max(0, variant.mrp - variant.discountPrice)
                      : 0;

                  return (
                    <TouchableOpacity
                      key={variant.id}
                      activeOpacity={isAvailable ? 0.85 : 1}
                      onPress={() => {
                        if (isAvailable) setSelectedVariant(variant);
                      }}
                      style={[
                        styles.variantCard,
                        isSelected && styles.variantCardSelected,
                        !isAvailable && styles.variantCardDisabled,
                      ]}
                    >
                      {/* Left Radio / Check */}
                      <View style={styles.radioWrapper}>
                        <Ionicons
                          name={
                            isSelected ? 'radio-button-on' : 'radio-button-off'
                          }
                          size={22}
                          color={
                            !isAvailable
                              ? '#9CA3AF'
                              : isSelected
                              ? '#3A2986'
                              : '#6B7280'
                          }
                        />
                      </View>

                      {/* Variant Info */}
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <AppText
                            style={isSelected ? [styles.variantLabel, styles.variantLabelSelected] : styles.variantLabel}
                          >
                            {variant.label || variant.packSize}
                          </AppText>
                          {cartQty > 0 && (
                            <View style={styles.alreadyInCartPill}>
                              <AppText style={styles.alreadyInCartText}>
                                {cartQty} in cart
                              </AppText>
                            </View>
                          )}
                        </View>

                        <AppText style={styles.packDetailText}>
                          {variant.packSize}
                        </AppText>

                        {!isAvailable ? (
                          <AppText style={styles.unavailableText}>
                            Currently unavailable
                          </AppText>
                        ) : (
                          <View style={styles.priceRow}>
                            <AppText style={styles.priceText}>
                              {formatCurrency(variant.discountPrice || variant.mrp)}
                            </AppText>
                            {variant.discountPrice && variant.mrp > variant.discountPrice && (
                              <AppText style={styles.mrpText}>
                                {formatCurrency(variant.mrp)}
                              </AppText>
                            )}
                            {savings > 0 && (
                              <View style={styles.savingsTag}>
                                <AppText style={styles.savingsText}>
                                  Save {formatCurrency(savings)}
                                </AppText>
                              </View>
                            )}
                          </View>
                        )}
                      </View>

                      {/* Inline Stepper if ALREADY IN CART */}
                      {cartQty > 0 && isAvailable && (
                        <View style={styles.inlineStepper}>
                          <TouchableOpacity
                            onPress={() => {
                              if (cartQty === 1) {
                                removeFromCart(medicine.id, variant.id);
                                showToast(
                                  `${medicine.name} (${variant.label || variant.packSize}) removed`,
                                  'info',
                                  4000,
                                  'Undo',
                                  () => undoRemove()
                                );
                              } else {
                                updateQuantity(medicine.id, cartQty - 1, variant.id);
                              }
                            }}
                            style={styles.stepperBtn}
                          >
                            <Ionicons
                              name={cartQty === 1 ? 'trash-outline' : 'remove'}
                              size={14}
                              color="#3A2986"
                            />
                          </TouchableOpacity>
                          <AppText style={styles.stepperQtyText}>{cartQty}</AppText>
                          <TouchableOpacity
                            onPress={() =>
                              updateQuantity(medicine.id, cartQty + 1, variant.id)
                            }
                            style={styles.stepperBtn}
                          >
                            <Ionicons name="add" size={14} color="#3A2986" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* 5. Sticky Bottom CTA */}
              <View style={styles.stickyFooter}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={!selectedVariant || selectedVariant.inStock === false}
                  onPress={handleConfirmAdd}
                  style={[
                    styles.ctaBtn,
                    (!selectedVariant || selectedVariant.inStock === false) &&
                      styles.ctaBtnDisabled,
                  ]}
                >
                  <AppText style={styles.ctaBtnText}>
                    {!selectedVariant
                      ? 'Select a Pack'
                      : selectedVariant.inStock === false
                      ? 'Currently Unavailable'
                      : `Add ${selectedVariant.label || selectedVariant.packSize} • ${formatCurrency(
                          selectedVariant.discountPrice || selectedVariant.mrp
                        )}`}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 24,
    maxHeight: '82%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  medicineSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  medicineName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  saltText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  rxBadge: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rxBadgeText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
  },
  variantList: {
    maxHeight: 320,
  },
  variantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  variantCardSelected: {
    borderColor: '#3A2986',
    backgroundColor: '#F5F3FF',
  },
  variantCardDisabled: {
    opacity: 0.55,
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  radioWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  variantLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  variantLabelSelected: {
    color: '#3A2986',
  },
  alreadyInCartPill: {
    backgroundColor: '#EEF0FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  alreadyInCartText: {
    color: '#3A2986',
    fontSize: 11,
    fontWeight: '700',
  },
  packDetailText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  unavailableText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  mrpText: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  savingsTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  savingsText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },
  inlineStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#3A2986',
    paddingHorizontal: 4,
    paddingVertical: 3,
    marginLeft: 8,
  },
  stepperBtn: {
    padding: 4,
  },
  stepperQtyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A2986',
    paddingHorizontal: 6,
  },
  stickyFooter: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  ctaBtn: {
    backgroundColor: '#3A2986',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3A2986',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaBtnDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

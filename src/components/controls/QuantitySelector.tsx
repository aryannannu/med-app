import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme';
import { AppText } from '../common/AppText';

export interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  minQuantity?: number;
  maxQuantity?: number;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  minQuantity = 0,
  maxQuantity = 20,
  size = 'md',
  style,
}) => {
  const btnSize = size === 'sm' ? 32 : size === 'md' ? 38 : 44;
  const iconSize = size === 'sm' ? 14 : size === 'md' ? 18 : 20;

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onDecrement}
        disabled={quantity <= minQuantity}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={[
          styles.btn,
          { width: btnSize, height: btnSize, borderRadius: btnSize / 2 },
          quantity <= minQuantity && styles.btnDisabled,
        ]}
      >
        <Ionicons
          name={quantity === 1 && minQuantity === 0 ? 'trash-outline' : 'remove'}
          size={iconSize}
          color={quantity === 1 && minQuantity === 0 ? COLORS.danger : COLORS.primary}
        />
      </TouchableOpacity>

      <View style={styles.countContainer}>
        <AppText
          variant={size === 'sm' ? 'bodySmall' : size === 'md' ? 'titleMedium' : 'titleLarge'}
          color={COLORS.textPrimary}
          weight="700"
          align="center"
        >
          {quantity}
        </AppText>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onIncrement}
        disabled={quantity >= maxQuantity}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={[
          styles.btn,
          styles.btnPrimary,
          { width: btnSize, height: btnSize, borderRadius: btnSize / 2 },
          quantity >= maxQuantity && styles.btnDisabled,
        ]}
      >
        <Ionicons name="add" size={iconSize} color={COLORS.textInverse} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: BORDER_RADIUS.full,
    padding: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btn: {
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  countContainer: {
    minWidth: 32,
    paddingHorizontal: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

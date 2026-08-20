import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BORDER_RADIUS } from '../../theme';
import { AppText } from '../common/AppText';

export interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  minQuantity?: number;
  maxQuantity?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  minusColor?: string;
  style?: ViewStyle;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  minQuantity = 0,
  maxQuantity = 20,
  size = 'md',
  color = '#15803D',
  minusColor = '#DC2626',
  style,
}) => {
  const btnSize = size === 'sm' ? 26 : size === 'md' ? 32 : 38;
  const iconSize = size === 'sm' ? 14 : size === 'md' ? 16 : 18;

  return (
    <View style={[styles.container, size === 'sm' && styles.containerSm, { borderColor: color }, style]}>
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
          name="remove"
          size={iconSize}
          color={minusColor}
        />
      </TouchableOpacity>

      <View style={styles.countContainer}>
        <AppText
          variant={size === 'sm' ? 'caption' : size === 'md' ? 'bodyMedium' : 'titleMedium'}
          color={color}
          weight="600"
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
          { width: btnSize, height: btnSize, borderRadius: btnSize / 2 },
          quantity >= maxQuantity && styles.btnDisabled,
        ]}
      >
        <Ionicons name="add" size={iconSize} color={color} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: '#15803D',
    padding: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  containerSm: {
    padding: 1,
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  btnDisabled: {
    opacity: 0.3,
  },
  countContainer: {
    minWidth: 22,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme';
import { AppText } from '../common/AppText';

export interface CartBadgeProps {
  count: number;
  onPress: () => void;
  color?: string;
  badgeBgColor?: string;
  style?: ViewStyle;
}

export const CartBadge: React.FC<CartBadgeProps> = ({
  count,
  onPress,
  color = COLORS.primary,
  badgeBgColor = COLORS.danger,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={[styles.container, style]}
    >
      <Ionicons name="cart-outline" size={26} color={color} />
      {count > 0 && (
        <View style={[styles.badge, { backgroundColor: badgeBgColor }]}>
          <AppText variant="caption" color="#FFFFFF" weight="700" style={styles.badgeText}>
            {count > 99 ? '99+' : count}
          </AppText>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
  },
});

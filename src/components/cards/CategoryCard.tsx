import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { MedicineCategory } from '../../types/medicine';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../theme';
import { AppText } from '../common/AppText';
import { Ionicons } from '@expo/vector-icons';

export interface CategoryCardProps {
  category: MedicineCategory;
  onPress: () => void;
  isSelected?: boolean;
  style?: ViewStyle;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
  isSelected = false,
  style,
}) => {
  const iconColor = category.color || COLORS.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.container,
        isSelected && styles.containerSelected,
        SHADOWS.subtle,
        style,
      ]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={category.iconName as any || 'medkit-outline'} size={24} color={iconColor} />
      </View>
      <AppText
        variant="caption"
        color={isSelected ? COLORS.primary : COLORS.textPrimary}
        weight="700"
        align="center"
        numberOfLines={2}
        style={styles.name}
      >
        {category.name}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 86,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  containerSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySubtle,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  name: {
    height: 30,
    fontSize: 11,
  },
});

import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme';
import { AppText } from './AppText';

export interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  count?: number;
  iconName?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected,
  onPress,
  count,
  iconName,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.chip,
        selected ? styles.chipSelected : styles.chipDefault,
        style,
      ]}
    >
      {iconName && (
        <Ionicons
          name={iconName}
          size={14}
          color={selected ? COLORS.primary : COLORS.textSecondary}
          style={{ marginRight: 4 }}
        />
      )}
      <AppText
        variant="caption"
        color={selected ? COLORS.primary : COLORS.textSecondary}
        weight="600"
      >
        {label}
      </AppText>
      {count !== undefined && (
        <View style={[styles.badge, selected ? styles.badgeSelected : styles.badgeDefault]}>
          <AppText
            variant="caption"
            color={selected ? '#FFFFFF' : COLORS.textSecondary}
            weight="600"
            style={styles.badgeText}
          >
            {count}
          </AppText>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    marginRight: SPACING.xs,
  },
  chipDefault: {
    backgroundColor: COLORS.surfaceSubtle,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primarySubtle,
    borderColor: COLORS.primary,
  },
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.full,
    marginLeft: 4,
  },
  badgeDefault: {
    backgroundColor: COLORS.border,
  },
  badgeSelected: {
    backgroundColor: COLORS.primary,
  },
  badgeText: {
    fontSize: 10,
  },
});

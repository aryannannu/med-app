import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { SPACING, BORDER_RADIUS } from '../../theme';
import { useAppTheme } from '../../store/ThemeContext';
import { AppText } from './AppText';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  icon,
  variant = 'primary',
  size = 'md',
  style,
}) => {
  const { colors } = useAppTheme();

  const getChipColors = () => {
    if (selected) {
      return {
        bg: variant === 'secondary' ? colors.secondaryLight : colors.primarySubtle,
        border: variant === 'secondary' ? colors.secondary : colors.primary,
        text: variant === 'secondary' ? colors.secondaryDark : colors.primary,
      };
    }
    return {
      bg: colors.surfaceSubtle,
      border: colors.border,
      text: colors.textSecondary,
    };
  };

  const chipColors = getChipColors();

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: chipColors.bg,
          borderColor: chipColors.border,
          paddingVertical: size === 'sm' ? 4 : 6,
          paddingHorizontal: size === 'sm' ? SPACING.sm : SPACING.md,
        },
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <AppText
        variant={size === 'sm' ? 'caption' : 'bodySmall'}
        color={chipColors.text}
        weight={selected ? '700' : '500'}
      >
        {label}
      </AppText>
    </Container>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: SPACING.xs,
  },
});

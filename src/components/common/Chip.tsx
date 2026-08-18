import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme';
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
  const getColors = () => {
    if (selected) {
      return {
        bg: variant === 'secondary' ? COLORS.secondaryLight : COLORS.primarySubtle,
        border: variant === 'secondary' ? COLORS.secondary : COLORS.primary,
        text: variant === 'secondary' ? COLORS.secondaryDark : COLORS.primary,
      };
    }
    return {
      bg: COLORS.surfaceSubtle,
      border: COLORS.border,
      text: COLORS.textSecondary,
    };
  };

  const colors = getColors();

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          paddingVertical: size === 'sm' ? 4 : 6,
          paddingHorizontal: size === 'sm' ? SPACING.sm : SPACING.md,
        },
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <AppText
        variant={size === 'sm' ? 'caption' : 'bodySmall'}
        color={colors.text}
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

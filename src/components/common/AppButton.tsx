import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme';
import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  fullWidth = true,
}) => {
  const getContainerStyle = (): ViewStyle => {
    let bg: string = COLORS.primary;
    let border: string = 'transparent';
    let borderWidth: number = 0;

    switch (variant) {
      case 'primary':
        bg = COLORS.primary;
        break;
      case 'secondary':
        bg = COLORS.secondary;
        break;
      case 'outline':
        bg = 'transparent';
        border = COLORS.primary;
        borderWidth = 1.5;
        break;
      case 'ghost':
        bg = 'transparent';
        break;
      case 'danger':
        bg = COLORS.danger;
        break;
    }

    let minHeight: number = 52;
    let paddingVertical: number = SPACING.md;
    let paddingHorizontal: number = SPACING.xl;

    if (size === 'sm') {
      minHeight = 40;
      paddingVertical = SPACING.xs;
      paddingHorizontal = SPACING.md;
    } else if (size === 'md') {
      minHeight = 46;
      paddingVertical = SPACING.sm;
      paddingHorizontal = SPACING.lg;
    }

    return {
      backgroundColor: disabled ? COLORS.surfaceMuted : bg,
      borderColor: disabled ? COLORS.border : border,
      borderWidth,
      minHeight,
      paddingVertical,
      paddingHorizontal,
      borderRadius: BORDER_RADIUS.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      opacity: disabled ? 0.6 : 1,
      width: fullWidth ? '100%' : 'auto',
    };
  };

  const getTextColor = (): string => {
    if (disabled) return COLORS.textMuted;
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return COLORS.textInverse;
      case 'outline':
      case 'ghost':
        return COLORS.primary;
      default:
        return COLORS.textInverse;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.textInverse}
        />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <AppText
            variant={size === 'sm' ? 'buttonSmall' : 'button'}
            color={getTextColor()}
            weight="600"
            style={textStyle}
          >
            {title}
          </AppText>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
});

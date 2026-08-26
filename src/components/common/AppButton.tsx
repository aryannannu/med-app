import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { SPACING, BORDER_RADIUS } from '../../theme';
import { useAppTheme } from '../../store/ThemeContext';
import { AppText } from './AppText';

import { haptics } from '../../services/hapticService';

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
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'none';
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
  hapticType,
}) => {
  const { colors } = useAppTheme();

  const handlePress = () => {
    if (hapticType === 'none') {
      // Skip haptic
    } else if (hapticType) {
      haptics[hapticType]();
    } else if (variant === 'primary' || variant === 'danger') {
      haptics.medium();
    } else {
      haptics.light();
    }
    onPress();
  };

  const getContainerStyle = (): ViewStyle => {
    let bg: string = colors.primary;
    let border: string = 'transparent';
    let borderWidth: number = 0;

    switch (variant) {
      case 'primary':
        bg = colors.primary;
        break;
      case 'secondary':
        bg = colors.primaryMuted;
        break;
      case 'outline':
        bg = colors.surface;
        border = colors.primaryBorder;
        borderWidth = 1.5;
        break;
      case 'ghost':
        bg = 'transparent';
        break;
      case 'danger':
        bg = colors.danger;
        break;
    }

    let minHeight: number = 50;
    let paddingVertical: number = SPACING.md;
    let paddingHorizontal: number = SPACING.xl;

    if (size === 'sm') {
      minHeight = 38;
      paddingVertical = SPACING.xs + 2;
      paddingHorizontal = SPACING.md;
    } else if (size === 'md') {
      minHeight = 44;
      paddingVertical = SPACING.sm + 2;
      paddingHorizontal = SPACING.lg;
    }

    return {
      backgroundColor: disabled ? colors.surfaceMuted : bg,
      borderColor: disabled ? colors.border : border,
      borderWidth,
      minHeight,
      paddingVertical,
      paddingHorizontal,
      borderRadius: size === 'sm' ? BORDER_RADIUS.md : BORDER_RADIUS.lg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      opacity: disabled ? 0.55 : 1,
      width: fullWidth ? '100%' : 'auto',
    };
  };

  const getTextColor = (): string => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'primary':
      case 'danger':
        return colors.textInverse;
      case 'secondary':
        return colors.primary;
      case 'outline':
      case 'ghost':
        return colors.primary;
      default:
        return colors.textInverse;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textInverse}
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

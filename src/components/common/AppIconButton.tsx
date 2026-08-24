import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme';
import { useAppTheme } from '../../store/ThemeContext';

export interface AppIconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: number;
  backgroundColor?: string;
  borderColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export const AppIconButton: React.FC<AppIconButtonProps> = ({
  icon,
  onPress,
  size = 44,
  backgroundColor = COLORS.surfaceSubtle,
  borderColor = 'transparent',
  disabled = false,
  style,
}) => {
  const { colors } = useAppTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          borderColor,
          borderWidth: borderColor !== 'transparent' ? 1 : 0,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});




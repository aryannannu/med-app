import React from 'react';
import { Text, TextStyle, TextProps, Platform } from 'react-native';
import { COLORS, TYPOGRAPHY, FONT_FAMILY } from '../../theme';

export interface AppTextProps extends TextProps {
  variant?: keyof typeof TYPOGRAPHY;
  color?: string;
  weight?: '300' | '400' | '500' | '600' | '700' | '800' | '900';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: TextStyle | TextStyle[];
  children: React.ReactNode;
}

const getFontFamilyForWeight = (weight?: string) => {
  switch (weight) {
    case '300':
      return FONT_FAMILY.light;
    case '500':
      return FONT_FAMILY.medium;
    case '600':
    case '700':
    case '800':
    case '900':
      return FONT_FAMILY.semibold;
    case '400':
    default:
      return FONT_FAMILY.regular;
  }
};

export const AppText: React.FC<AppTextProps> = ({
  variant = 'bodyMedium',
  color = COLORS.textPrimary,
  weight,
  align,
  style,
  children,
  ...rest
}) => {
  const baseTypography = TYPOGRAPHY[variant] || TYPOGRAPHY.bodyMedium;
  const resolvedFontFamily = weight ? getFontFamilyForWeight(weight) : baseTypography.fontFamily;
  const normalizedWeight = weight
    ? parseInt(weight, 10) >= 600
      ? '600'
      : (weight as TextStyle['fontWeight'])
    : baseTypography.fontWeight;

  const customStyle: TextStyle = {
    ...baseTypography,
    color,
    ...(resolvedFontFamily ? { fontFamily: resolvedFontFamily } : {}),
    ...(normalizedWeight ? { fontWeight: normalizedWeight } : {}),
    ...(align ? { textAlign: align } : {}),
  };

  return (
    <Text style={[customStyle, style]} {...rest}>
      {children}
    </Text>
  );
};

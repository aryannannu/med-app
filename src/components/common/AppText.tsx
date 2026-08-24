import React from 'react';
import { Text, TextStyle, TextProps, StyleProp, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, FONT_FAMILY } from '../../theme';
import { useAppTheme } from '../../store/ThemeContext';

export interface AppTextProps extends TextProps {
  variant?: keyof typeof TYPOGRAPHY;
  color?: string;
  weight?: '300' | '400' | '500' | '600' | '700' | '800' | '900';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: StyleProp<TextStyle>;
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
  color,
  weight,
  align,
  style,
  children,
  ...rest
}) => {
  const { colors, isDark } = useAppTheme();
  const baseTypography = TYPOGRAPHY[variant] || TYPOGRAPHY.bodyMedium;
  const resolvedFontFamily = weight ? getFontFamilyForWeight(weight) : baseTypography.fontFamily;
  const normalizedWeight = weight
    ? parseInt(weight, 10) >= 600
      ? '600'
      : (weight as TextStyle['fontWeight'])
    : baseTypography.fontWeight;

  let resolvedColor = color;
  if (!color || color === COLORS.textPrimary || color === '#151515') {
    resolvedColor = colors.textPrimary;
  } else if (color === COLORS.textSecondary || color === '#707070') {
    resolvedColor = colors.textSecondary;
  } else if (color === COLORS.textMuted || color === '#9E9EA7') {
    resolvedColor = colors.textMuted;
  }

  const flattenedStyle = StyleSheet.flatten(style) || {};
  const styleColor = (flattenedStyle as TextStyle).color as string | undefined;

  let finalColor: string | undefined = resolvedColor;
  if (isDark) {
    if (!color) {
      if (
        !styleColor ||
        styleColor === '#0F172A' ||
        styleColor === '#09090B' ||
        styleColor === '#151515' ||
        styleColor === '#000000' ||
        styleColor === '#1E293B' ||
        styleColor === '#334155'
      ) {
        finalColor = colors.textPrimary;
      } else if (
        styleColor === '#71717A' ||
        styleColor === '#707070' ||
        styleColor === '#475569' ||
        styleColor === '#64748B'
      ) {
        finalColor = colors.textSecondary;
      } else if (styleColor === '#A1A1AA' || styleColor === '#9E9EA7' || styleColor === '#94A3B8') {
        finalColor = colors.textMuted;
      } else {
        finalColor = styleColor;
      }
    }
  } else {
    if (!color && styleColor) {
      finalColor = styleColor;
    }
  }

  const customStyle: TextStyle = {
    ...baseTypography,
    ...(resolvedFontFamily ? { fontFamily: resolvedFontFamily } : {}),
    ...(normalizedWeight ? { fontWeight: normalizedWeight } : {}),
    ...(align ? { textAlign: align } : {}),
  };

  return (
    <Text style={[customStyle, style, { color: finalColor }]} {...rest}>
      {children}
    </Text>
  );
};

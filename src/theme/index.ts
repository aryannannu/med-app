import { COLORS } from './colors';
import { TYPOGRAPHY, FONT_FAMILY, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS } from './typography';
import { SPACING, LAYOUT } from './spacing';
import { BORDER_RADIUS, ICON_SIZES } from './borderRadius';
import { SHADOWS } from './shadows';

export const THEME = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  fontFamily: FONT_FAMILY,
  fontSizes: FONT_SIZES,
  fontWeights: FONT_WEIGHTS,
  lineHeights: LINE_HEIGHTS,
  spacing: SPACING,
  layout: LAYOUT,
  borderRadius: BORDER_RADIUS,
  iconSizes: ICON_SIZES,
  shadows: SHADOWS,
} as const;

export type Theme = typeof THEME;

export {
  COLORS,
  TYPOGRAPHY,
  FONT_FAMILY,
  FONT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  SPACING,
  LAYOUT,
  BORDER_RADIUS,
  ICON_SIZES,
  SHADOWS,
};

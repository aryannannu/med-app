/**
 * HEALIT Centralized Design System - Colors
 * PRIMARY BRAND COLOR: #3A2986 (The Only Primary Brand Color)
 * Complete Tint and Shade Scale generated strictly from #3A2986
 */

export const PRIMARY_SCALE = {
  50: '#F5F3FB',   // Selected backgrounds, subtle highlights, focus tints
  100: '#ECE8F7',  // Informational surfaces, light pills, subtle chips
  200: '#DCD5F0',  // Borders on active cards, badges, light dividers
  300: '#C3B7E5',  // Secondary accents, inactive controls
  400: '#A18ED5',  // Medium tints
  500: '#3A2986',  // BASE PRIMARY BRAND COLOR (Primary buttons, Active navigation, CTAs, Highlights)
  600: '#322375',  // High emphasis highlights
  700: '#2A1D64',  // Pressed states, high-contrast actions
  800: '#221752',  // Strong primary actions
  900: '#1A1141',  // Deep brand dark
  950: '#100A2A',  // Ultra dark contrast
} as const;

export interface ThemeColors {
  primaryScale: typeof PRIMARY_SCALE;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySubtle: string;
  primaryMuted: string;
  primaryBorder: string;

  secondary: string;
  secondaryLight: string;
  secondaryDark: string;

  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceSubtle: string;
  surfaceMuted: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  textPrimaryBrand: string;

  border: string;
  borderLight: string;
  borderFocus: string;
  borderError: string;

  success: string;
  successLight: string;
  successDark: string;

  warning: string;
  warningLight: string;
  warningDark: string;

  danger: string;
  dangerLight: string;
  dangerDark: string;

  info: string;
  infoLight: string;
  infoDark: string;

  rxRed: string;
  rxRedLight: string;
  rxRedBorder: string;

  tagRecommended: string;
  tagRecommendedBg: string;
  tagRecommendedBorder: string;

  tagLowestPrice: string;
  tagLowestPriceBg: string;
  tagLowestPriceBorder: string;

  tagFastestDelivery: string;
  tagFastestDeliveryBg: string;
  tagFastestDeliveryBorder: string;

  tagBestRated: string;
  tagBestRatedBg: string;
  tagBestRatedBorder: string;

  priceGreen: string;
  priceGreenLight: string;
  priceGreenDark: string;
  savingsGreen: string;
  savingsGreenLight: string;
  savingsGreenBorder: string;
  brandAction: string;
  brandActionPressed: string;
  cardBorderSubtle: string;
  chipInactiveBg: string;
  chipInactiveText: string;
  skeletonBg: string;
  skeletonHighlight: string;

  overlay: string;
  overlayLight: string;
  starGold: string;
  starGoldLight: string;
}

export const LIGHT_COLORS: ThemeColors = {
  // Primary Brand & Complete Scale
  primaryScale: PRIMARY_SCALE,
  primary: PRIMARY_SCALE[500],       // #3A2986 (Base Primary Brand Color)
  primaryDark: PRIMARY_SCALE[700],   // #2A1D64 (Pressed state)
  primaryLight: PRIMARY_SCALE[400],  // #A18ED5 (Medium light)
  primarySubtle: PRIMARY_SCALE[50],  // #F5F3FB (Selected backgrounds, subtle highlights)
  primaryMuted: PRIMARY_SCALE[100],  // #ECE8F7 (Pills, informational surfaces)
  primaryBorder: PRIMARY_SCALE[200], // #DCD5F0 (Focus / active borders)

  // Secondary Support (aligned with calm healthcare trust)
  secondary: '#0D9488',
  secondaryLight: '#CCFBF1',
  secondaryDark: '#115E59',

  // Neutrals (calm, modern, trustworthy healthcare palette)
  background: '#F8F8FC',             // App Background: #F8F8FC
  surface: '#FFFFFF',                // Surface: #FFFFFF
  surfaceElevated: '#FFFFFF',
  surfaceSubtle: '#F2F2F7',
  surfaceMuted: '#E8E8EE',

  // Typography & Text Colors
  textPrimary: '#151515',            // Primary Text: #151515
  textSecondary: '#707070',          // Secondary Text: #707070
  textMuted: '#9E9EA7',
  textInverse: '#FFFFFF',
  textPrimaryBrand: PRIMARY_SCALE[500], // #3A2986

  // Borders & Dividers
  border: '#E8E8EE',                 // Border: #E8E8EE
  borderLight: '#F2F2F7',
  borderFocus: PRIMARY_SCALE[500],   // #3A2986
  borderError: '#DC2626',

  // Semantic Colors (accessible, strategic)
  success: '#15803D',                // Accessible Green (WCAG compliant)
  successLight: '#DCFCE7',
  successDark: '#14532D',

  // Amber Warning
  warning: '#D97706',                // Accessible Amber (WCAG compliant)
  warningLight: '#FEF3C7',
  warningDark: '#78350F',

  // Red Error / Danger
  danger: '#DC2626',                 // Accessible Red (WCAG compliant)
  dangerLight: '#FEE2E2',
  dangerDark: '#7F1D1D',

  // Informational
  info: '#2563EB',
  infoLight: '#DBEAFE',
  infoDark: '#1E40AF',

  // Rx Prescription Badges
  rxRed: '#DC2626',
  rxRedLight: '#FEE2E2',
  rxRedBorder: '#FECACA',

  // Marketplace Offer Tags (strictly using brand #3A2986 and accessible status colors)
  tagRecommended: PRIMARY_SCALE[500],
  tagRecommendedBg: PRIMARY_SCALE[50],
  tagRecommendedBorder: PRIMARY_SCALE[100],

  tagLowestPrice: '#15803D',
  tagLowestPriceBg: '#DCFCE7',
  tagLowestPriceBorder: '#BBF7D0',

  tagFastestDelivery: '#2563EB',
  tagFastestDeliveryBg: '#EFF6FF',
  tagFastestDeliveryBorder: '#BFDBFE',

  tagBestRated: '#D97706',
  tagBestRatedBg: '#FEF3C7',
  tagBestRatedBorder: '#FDE68A',

  // Quick-Commerce Shopping Tokens
  priceGreen: '#15803D',
  priceGreenLight: '#DCFCE7',
  priceGreenDark: '#14532D',
  savingsGreen: '#16A34A',
  savingsGreenLight: '#ECFDF5',
  savingsGreenBorder: '#A7F3D0',
  brandAction: PRIMARY_SCALE[500],
  brandActionPressed: PRIMARY_SCALE[700],
  cardBorderSubtle: '#F0F0F4',
  chipInactiveBg: '#F3F4F8',
  chipInactiveText: '#475569',
  skeletonBg: '#E2E8F0',
  skeletonHighlight: '#F1F5F9',

  // Overlays & Accents
  overlay: 'rgba(15, 23, 42, 0.45)',
  overlayLight: 'rgba(15, 23, 42, 0.20)',
  starGold: '#F59E0B',
  starGoldLight: '#FEF3C7',
};

export const DARK_COLORS: ThemeColors = {
  // Primary Brand & Scale for Dark Mode
  primaryScale: PRIMARY_SCALE,
  primary: '#8B74E6',                // Vibrant primary tint on dark background
  primaryDark: '#A18ED5',
  primaryLight: '#C3B7E5',
  primarySubtle: '#1E1838',          // Dark subtle purple highlight
  primaryMuted: '#281F4A',           // Dark purple pill/surface
  primaryBorder: '#43327A',          // Purple border on dark surface

  // Secondary Support
  secondary: '#2DD4BF',
  secondaryLight: '#115E59',
  secondaryDark: '#0F766E',

  // Neutrals (calm, deep healthcare dark theme)
  background: '#0F0F14',             // App Background: #0F0F14
  surface: '#181822',                // Surface/Card: #181822
  surfaceElevated: '#222230',        // Elevated Card/Modal: #222230
  surfaceSubtle: '#1D1D2B',
  surfaceMuted: '#272738',

  // Typography & Text Colors
  textPrimary: '#F5F5FA',            // Primary Text: #F5F5FA
  textSecondary: '#A0A0B2',          // Secondary Text: #A0A0B2
  textMuted: '#6E6E82',
  textInverse: '#151515',
  textPrimaryBrand: '#9B84EC',

  // Borders & Dividers
  border: '#272738',                 // Border: #272738
  borderLight: '#1F1F2E',
  borderFocus: '#8B74E6',
  borderError: '#EF4444',

  // Semantic Colors
  success: '#22C55E',
  successLight: '#052E16',
  successDark: '#166534',

  // Amber Warning
  warning: '#F59E0B',
  warningLight: '#451A03',
  warningDark: '#92400E',

  // Red Error / Danger
  danger: '#EF4444',
  dangerLight: '#450A0A',
  dangerDark: '#991B1B',

  // Informational
  info: '#3B82F6',
  infoLight: '#172554',
  infoDark: '#1E40AF',

  // Rx Prescription Badges
  rxRed: '#EF4444',
  rxRedLight: '#3B1317',
  rxRedBorder: '#5C1D24',

  // Marketplace Offer Tags
  tagRecommended: '#9B84EC',
  tagRecommendedBg: '#221840',
  tagRecommendedBorder: '#3D2E6D',

  tagLowestPrice: '#22C55E',
  tagLowestPriceBg: '#052E16',
  tagLowestPriceBorder: '#14532D',

  tagFastestDelivery: '#3B82F6',
  tagFastestDeliveryBg: '#172554',
  tagFastestDeliveryBorder: '#1E3A8A',

  tagBestRated: '#F59E0B',
  tagBestRatedBg: '#451A03',
  tagBestRatedBorder: '#78350F',

  // Quick-Commerce Shopping Tokens
  priceGreen: '#22C55E',
  priceGreenLight: '#052E16',
  priceGreenDark: '#166534',
  savingsGreen: '#34D399',
  savingsGreenLight: '#064E3B',
  savingsGreenBorder: '#065F46',
  brandAction: '#8B74E6',
  brandActionPressed: '#A18ED5',
  cardBorderSubtle: '#252536',
  chipInactiveBg: '#1E1E2C',
  chipInactiveText: '#A0A0B2',
  skeletonBg: '#242436',
  skeletonHighlight: '#32324A',

  // Overlays & Accents
  overlay: 'rgba(0, 0, 0, 0.75)',
  overlayLight: 'rgba(0, 0, 0, 0.45)',
  starGold: '#F59E0B',
  starGoldLight: '#451A03',
};

// Default export alias for backwards compatibility
export const COLORS = LIGHT_COLORS;

export type ColorKey = keyof ThemeColors;
export type PrimaryScaleKey = keyof typeof PRIMARY_SCALE;

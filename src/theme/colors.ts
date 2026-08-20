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

export const COLORS = {
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
} as const;

export type ColorKey = keyof typeof COLORS;
export type PrimaryScaleKey = keyof typeof PRIMARY_SCALE;

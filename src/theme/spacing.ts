/**
 * HEALIT Centralized Design System - Spacing Tokens
 * 8-Point Standard Spacing Foundation
 */
export const SPACING = {
  none: 0,
  xxs: 2,
  xs: 4,      // 4px - Micro gaps, icon-to-badge spacing
  sm: 8,      // 8px - Tight element spacing, related items
  md: 12,     // 12px - Medium gap, form elements, card internal rows
  lg: 16,     // 16px - Standard screen padding & standard card padding
  xl: 20,     // 20px - Large separation
  xxl: 24,    // 24px - Section-to-section separation
  xxxl: 32,   // 32px - Major content blocks separation
  huge: 40,   // 40px - Hero banners & modal bottom buffers
  massive: 48,// 48px - Primary CTA bottom buffer
  gigantic: 56,// 56px - Safe area footer margins
  extreme: 64,// 64px - Bottom tab clear buffer
} as const;

export const LAYOUT = {
  screenPadding: SPACING.lg,    // 16px - Uniform across all screens
  cardPadding: SPACING.lg,      // 16px - Standard card internal padding
  cardPaddingCompact: SPACING.md,// 12px - Compact cards
  sectionGap: SPACING.xxl,      // 24px - Section-to-section vertical rhythm
  itemGap: SPACING.md,          // 12px - Item-to-item list gap
  elementGap: SPACING.sm,       // 8px - Related element proximity gap
  inlineGap: SPACING.xs,        // 4px - Icon-to-text inline gap
  minTouchTarget: 44,           // 44px - iOS Human Interface Guidelines minimum tappable area
  buttonHeight: 48,             // 48px - Standard button height
  buttonHeightSmall: 36,        // 36px - Compact button height
  searchBarHeight: 48,          // 48px - Standard search input height
  headerHeight: 56,             // 56px - Standard screen header height
} as const;

export type SpacingKey = keyof typeof SPACING;

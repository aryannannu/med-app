import { TextStyle, Platform } from 'react-native';

/**
 * ============================================================================
 * HEALIT TYPOGRAPHY SYSTEM
 * Font Family: Lexend Deca (Only primary font family throughout the app)
 * Design Principles:
 * - Highly readable & accessible for users up to 60 years old
 * - Clean, modern, friendly healthcare aesthetics
 * - Consistent proportional line-heights & font weights
 * - Centralized design tokens
 * ============================================================================
 */

export const FONT_FAMILY = {
  light: Platform.select({
    web: "'Lexend Deca', sans-serif",
    default: 'LexendDeca_300Light',
  }),
  regular: Platform.select({
    web: "'Lexend Deca', sans-serif",
    default: 'LexendDeca_400Regular',
  }),
  medium: Platform.select({
    web: "'Lexend Deca', sans-serif",
    default: 'LexendDeca_500Medium',
  }),
  semibold: Platform.select({
    web: "'Lexend Deca', sans-serif",
    default: 'LexendDeca_600SemiBold',
  }),
  bold: Platform.select({
    web: "'Lexend Deca', sans-serif",
    default: 'LexendDeca_700Bold',
  }),
  extrabold: Platform.select({
    web: "'Lexend Deca', sans-serif",
    default: 'LexendDeca_800ExtraBold',
  }),
  black: Platform.select({
    web: "'Lexend Deca', sans-serif",
    default: 'LexendDeca_900Black',
  }),
};

export const FONT_SIZES = {
  labelSmall: 11,
  caption: 12,
  labelMedium: 13,
  bodySmall: 13,
  bodyMedium: 14,
  labelLarge: 15,
  titleSmall: 15,
  bodyLarge: 16,
  titleMedium: 16,
  titleLarge: 18,
  headingSmall: 18,
  headingMedium: 20,
  headingLarge: 24,
  displayMedium: 28,
  displayLarge: 34,
} as const;

export const FONT_WEIGHTS = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

export const LINE_HEIGHTS = {
  labelSmall: 15,
  caption: 16,
  labelMedium: 18,
  bodySmall: 18,
  bodyMedium: 20,
  labelLarge: 22,
  titleSmall: 22,
  bodyLarge: 24,
  titleMedium: 24,
  titleLarge: 26,
  headingSmall: 26,
  headingMedium: 28,
  headingLarge: 32,
  displayMedium: 36,
  displayLarge: 42,
} as const;

export const TYPOGRAPHY: Record<string, TextStyle> = {
  // 1. Display Large (34px / 42px / ExtraBold 800)
  displayLarge: {
    fontFamily: FONT_FAMILY.extrabold,
    fontWeight: '800',
    fontSize: FONT_SIZES.displayLarge,
    lineHeight: LINE_HEIGHTS.displayLarge,
    letterSpacing: -0.5,
  },

  // 2. Display Medium (28px / 36px / ExtraBold 800)
  displayMedium: {
    fontFamily: FONT_FAMILY.extrabold,
    fontWeight: '800',
    fontSize: FONT_SIZES.displayMedium,
    lineHeight: LINE_HEIGHTS.displayMedium,
    letterSpacing: -0.4,
  },

  // 3. Heading Large (24px / 32px / Bold 700)
  headingLarge: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: '700',
    fontSize: FONT_SIZES.headingLarge,
    lineHeight: LINE_HEIGHTS.headingLarge,
    letterSpacing: -0.3,
  },

  // 4. Heading Medium (20px / 28px / Bold 700)
  headingMedium: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: '700',
    fontSize: FONT_SIZES.headingMedium,
    lineHeight: LINE_HEIGHTS.headingMedium,
    letterSpacing: -0.2,
  },

  // 5. Heading Small (18px / 26px / SemiBold 600)
  headingSmall: {
    fontFamily: FONT_FAMILY.semibold,
    fontWeight: '600',
    fontSize: FONT_SIZES.headingSmall,
    lineHeight: LINE_HEIGHTS.headingSmall,
    letterSpacing: -0.1,
  },

  // 6. Title Large (18px / 26px / Bold 700)
  titleLarge: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: '700',
    fontSize: FONT_SIZES.titleLarge,
    lineHeight: LINE_HEIGHTS.titleLarge,
  },

  // 7. Title Medium (16px / 24px / SemiBold 600)
  titleMedium: {
    fontFamily: FONT_FAMILY.semibold,
    fontWeight: '600',
    fontSize: FONT_SIZES.titleMedium,
    lineHeight: LINE_HEIGHTS.titleMedium,
  },

  // 8. Title Small (15px / 22px / SemiBold 600)
  titleSmall: {
    fontFamily: FONT_FAMILY.semibold,
    fontWeight: '600',
    fontSize: FONT_SIZES.titleSmall,
    lineHeight: LINE_HEIGHTS.titleSmall,
  },

  // 9. Body Large (16px / 24px / Regular 400)
  bodyLarge: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: '400',
    fontSize: FONT_SIZES.bodyLarge,
    lineHeight: LINE_HEIGHTS.bodyLarge,
  },

  // 10. Body Medium (14px / 20px / Regular 400)
  bodyMedium: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: '400',
    fontSize: FONT_SIZES.bodyMedium,
    lineHeight: LINE_HEIGHTS.bodyMedium,
  },

  // 11. Body Small (13px / 18px / Regular 400)
  bodySmall: {
    fontFamily: FONT_FAMILY.regular,
    fontWeight: '400',
    fontSize: FONT_SIZES.bodySmall,
    lineHeight: LINE_HEIGHTS.bodySmall,
  },

  // 12. Label Large (15px / 22px / Bold 700)
  labelLarge: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: '700',
    fontSize: FONT_SIZES.labelLarge,
    lineHeight: LINE_HEIGHTS.labelLarge,
  },

  // 13. Label Medium (13px / 18px / SemiBold 600)
  labelMedium: {
    fontFamily: FONT_FAMILY.semibold,
    fontWeight: '600',
    fontSize: FONT_SIZES.labelMedium,
    lineHeight: LINE_HEIGHTS.labelMedium,
  },

  // 14. Label Small (11px / 15px / SemiBold 600)
  labelSmall: {
    fontFamily: FONT_FAMILY.semibold,
    fontWeight: '600',
    fontSize: FONT_SIZES.labelSmall,
    lineHeight: LINE_HEIGHTS.labelSmall,
  },

  // Backward compatibility aliases
  display: {
    fontFamily: FONT_FAMILY.extrabold,
    fontWeight: '800',
    fontSize: FONT_SIZES.displayLarge,
    lineHeight: LINE_HEIGHTS.displayLarge,
  },
  h1: {
    fontFamily: FONT_FAMILY.extrabold,
    fontWeight: '800',
    fontSize: FONT_SIZES.displayMedium,
    lineHeight: LINE_HEIGHTS.displayMedium,
  },
  h2: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: '700',
    fontSize: FONT_SIZES.headingLarge,
    lineHeight: LINE_HEIGHTS.headingLarge,
  },
  h3: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: '700',
    fontSize: FONT_SIZES.headingMedium,
    lineHeight: LINE_HEIGHTS.headingMedium,
  },
  h4: {
    fontFamily: FONT_FAMILY.semibold,
    fontWeight: '600',
    fontSize: FONT_SIZES.headingSmall,
    lineHeight: LINE_HEIGHTS.headingSmall,
  },
  caption: {
    fontFamily: FONT_FAMILY.medium,
    fontWeight: '500',
    fontSize: FONT_SIZES.caption,
    lineHeight: LINE_HEIGHTS.caption,
  },
  captionBold: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: '700',
    fontSize: FONT_SIZES.caption,
    lineHeight: LINE_HEIGHTS.caption,
  },
  buttonLarge: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: '700',
    fontSize: FONT_SIZES.labelLarge,
    lineHeight: LINE_HEIGHTS.labelLarge,
  },
  buttonMedium: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: '700',
    fontSize: FONT_SIZES.bodyMedium,
    lineHeight: LINE_HEIGHTS.bodyMedium,
  },
  buttonSmall: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: '700',
    fontSize: FONT_SIZES.labelMedium,
    lineHeight: LINE_HEIGHTS.labelMedium,
  },
};

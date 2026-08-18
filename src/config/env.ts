/**
 * Centralized Environment Configuration
 * Variables prefixed with EXPO_PUBLIC_ are automatically injected by Expo Metro.
 */
export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.healit.app/api/v1',
  ENVIRONMENT: (process.env.EXPO_PUBLIC_ENV || 'production') as 'development' | 'staging' | 'production',
  IS_PRODUCTION: process.env.EXPO_PUBLIC_ENV === 'production',
  ENABLE_MOCK_FALLBACK: process.env.EXPO_PUBLIC_ENABLE_MOCK_FALLBACK !== 'false',
  API_TIMEOUT: Number(process.env.EXPO_PUBLIC_API_TIMEOUT || 15000),
};

/**
 * Centralized Environment & Endpoints Configuration
 * All values are configurable via .env (EXPO_PUBLIC_*) without changing code.
 */
export const ENV = {
  // Main Domain & Server URLs
  SITE_URL: process.env.EXPO_PUBLIC_SITE_URL || 'https://healit.app',
  BASE_URL: process.env.EXPO_PUBLIC_BASE_URL || 'https://api.healit.app',
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.healit.app/api/v1',
  WS_URL: process.env.EXPO_PUBLIC_WS_URL || 'wss://api.healit.app/ws',
  CDN_IMAGE_URL: process.env.EXPO_PUBLIC_CDN_IMAGE_URL || 'https://images.healit.app',

  // Environment & Debug Flags
  ENVIRONMENT: (process.env.EXPO_PUBLIC_ENV || 'production') as 'development' | 'staging' | 'production',
  IS_PRODUCTION: process.env.EXPO_PUBLIC_ENV === 'production',
  ENABLE_MOCK_FALLBACK: process.env.EXPO_PUBLIC_ENABLE_MOCK_FALLBACK !== 'false',
  API_TIMEOUT: Number(process.env.EXPO_PUBLIC_API_TIMEOUT || 15000),

  // API Endpoints Registry
  ENDPOINTS: {
    // Auth
    AUTH_SEND_OTP: '/auth/send-otp',
    AUTH_VERIFY_OTP: '/auth/verify-otp',
    AUTH_ME: '/auth/me',
    AUTH_LOGOUT: '/auth/logout',

    // Medicines & Categories
    MEDICINES: '/medicines',
    MEDICINES_POPULAR: '/medicines/popular',
    MEDICINES_SEARCH: '/medicines/search',
    CATEGORIES: '/categories',

    // Pharmacies
    PHARMACIES: '/pharmacies',
    PHARMACIES_NEARBY: '/pharmacies/nearby',

    // Offers & Cart
    OFFERS: '/offers',
    OFFERS_GENERATE: '/offers/generate',

    // Orders
    ORDERS: '/orders',

    // Prescriptions
    PRESCRIPTIONS: '/prescriptions',
    PRESCRIPTIONS_UPLOAD: '/prescriptions/upload',

    // Addresses
    ADDRESSES: '/addresses',
  },
};

/**
 * Helper to build full URL from path or CDN
 */
export const getFullApiUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${ENV.API_URL}${cleanEndpoint}`;
};

export const getFullImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${ENV.CDN_IMAGE_URL}${cleanPath}`;
};

export interface SavedUPI {
  id: string;
  upiId: string;
  provider: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'other';
  isDefault: boolean;
  addedAt: number;
}

export interface SavedCard {
  id: string;
  maskedNumber: string; // e.g. "•••• 4821"
  cardholderName: string;
  expiryMonth: string; // "12"
  expiryYear: string; // "28"
  brand: 'visa' | 'mastercard' | 'rupay' | 'amex';
  isDefault: boolean;
  addedAt: number;
}

export interface PharmacyAddress {
  line1: string;
  line2?: string;
  city: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
}

export interface PharmacyInventoryItem {
  medicineId: string;
  inStock: boolean;
  stockQuantity: number;
  customPrice?: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  logo: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  address: PharmacyAddress;
  isVerified: boolean;
  licenseNumber: string;
  estimatedDeliveryTimeMinutes: number; // e.g. 25, 45, 60
  openingTime: string;
  closingTime: string;
  isOpenNow: boolean;
  phone: string;
  inventoryCount?: number;
  inventory?: PharmacyInventoryItem[];
  about?: string;
  deliveryFee: number;
  freeDeliveryAbove?: number;
}

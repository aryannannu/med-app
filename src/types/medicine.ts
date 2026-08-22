export interface MedicineSalt {
  name: string;
  strength?: string;
}

export interface MedicineVariant {
  id: string;
  form?: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Ointment' | 'Drops' | 'Inhaler' | 'Sachet';
  packSize: string; // e.g. "10 tablets in a strip", "100ml bottle"
  mrp: number;
  discountPrice?: number;
  inStock: boolean;
  strength?: string; // e.g. "500mg" or "650mg"
  savingsText?: string; // e.g. "Save ₹4"
  label?: string; // e.g. "1 Strip", "Pack of 2"
}

export interface AlternativeMedicine {
  id: string;
  name: string;
  brandName: string;
  manufacturer: string;
  mrp: number;
  savingsPercentage: number;
  saltComposition: string;
  image?: string;
  rxRequired: boolean;
}

export interface MedicineCategory {
  id: string;
  name: string;
  slug: string;
  iconName: string; // Ionicons / MaterialCommunityIcons key
  itemCount: number;
  color?: string;
}

export interface Medicine {
  id: string;
  name: string;
  brandName: string;
  genericName: string;
  saltComposition: string;
  manufacturer: string;
  image: string;
  description: string;
  uses: string[];
  sideEffects?: string[];
  safetyAdvice?: {
    pregnancy?: string;
    breastfeeding?: string;
    driving?: string;
    alcohol?: string;
  };
  mrp: number;
  discountPrice: number;
  discountPercentage: number;
  rxRequired: boolean;
  category: string;
  categorySlug: string;
  packForm: string; // e.g., "Strip of 10 tablets"
  variants?: MedicineVariant[];
  alternatives?: AlternativeMedicine[];
  isPopular?: boolean;
  inStock?: boolean;
  stockCount?: number;
  rating?: number;
  reviewCount?: number;
  sourcePharmacyId?: string;
}

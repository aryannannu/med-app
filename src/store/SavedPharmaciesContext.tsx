import React, { createContext, useContext, useState, useCallback } from 'react';
import { Pharmacy } from '../types/pharmacy';

export interface SavedPharmacyItem extends Pharmacy {
  isSaved: boolean;
  savedAt: number;
  isOpen: boolean;
}

interface SavedPharmaciesContextType {
  savedPharmacies: SavedPharmacyItem[];
  isPharmacySaved: (pharmacyId: string) => boolean;
  toggleSavePharmacy: (pharmacy: Pharmacy) => void;
  removeSavedPharmacy: (pharmacyId: string) => void;
}

const INITIAL_SAVED_PHARMACIES: SavedPharmacyItem[] = [
  {
    id: 'pharm-1',
    name: 'Apollo Pharmacy 24x7',
    address: {
      line1: 'SCF 14, Main Market',
      line2: 'Sector 22',
      city: 'Chandigarh',
      pincode: '160022',
    },
    distanceKm: 1.2,
    rating: 4.8,
    reviewCount: 342,
    estimatedDeliveryTimeMinutes: 12,
    isVerified: true,
    licenseNumber: 'DL-CH-2024-48192',
    openingTime: '00:00',
    closingTime: '23:59',
    isOpenNow: true,
    phone: '+91 98140 12345',
    deliveryFee: 0,
    logo: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=160&auto=format&fit=crop&q=80',
    isSaved: true,
    savedAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    isOpen: true,
  },
  {
    id: 'pharm-2',
    name: 'MedPlus Chemists',
    address: {
      line1: 'SCO 89, City Center',
      line2: 'Sector 17',
      city: 'Chandigarh',
      pincode: '160017',
    },
    distanceKm: 2.1,
    rating: 4.6,
    reviewCount: 218,
    estimatedDeliveryTimeMinutes: 15,
    isVerified: true,
    licenseNumber: 'DL-CH-2024-51029',
    openingTime: '08:00',
    closingTime: '23:00',
    isOpenNow: true,
    phone: '+91 98765 54321',
    deliveryFee: 25,
    logo: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=160&auto=format&fit=crop&q=80',
    isSaved: true,
    savedAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
    isOpen: true,
  },
  {
    id: 'pharm-3',
    name: 'Sharma Medical Store',
    address: {
      line1: 'Shop 4, Grain Market Road',
      city: 'Chandigarh',
      pincode: '160026',
    },
    distanceKm: 3.5,
    rating: 4.3,
    reviewCount: 94,
    estimatedDeliveryTimeMinutes: 20,
    isVerified: false,
    licenseNumber: 'DL-CH-2023-11024',
    openingTime: '09:00',
    closingTime: '21:00',
    isOpenNow: false,
    phone: '+91 98111 22334',
    deliveryFee: 30,
    logo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=160&auto=format&fit=crop&q=80',
    isSaved: true,
    savedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    isOpen: false, // Closed state
  },
];

const SavedPharmaciesContext = createContext<SavedPharmaciesContextType | undefined>(undefined);

export const SavedPharmaciesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedPharmacies, setSavedPharmacies] = useState<SavedPharmacyItem[]>(INITIAL_SAVED_PHARMACIES);

  const isPharmacySaved = useCallback(
    (pharmacyId: string) => {
      return savedPharmacies.some((p) => p.id === pharmacyId);
    },
    [savedPharmacies]
  );

  const toggleSavePharmacy = useCallback((pharmacy: Pharmacy) => {
    setSavedPharmacies((prev) => {
      const exists = prev.some((p) => p.id === pharmacy.id);
      if (exists) {
        return prev.filter((p) => p.id !== pharmacy.id);
      }
      const newItem: SavedPharmacyItem = {
        ...pharmacy,
        isSaved: true,
        savedAt: Date.now(),
        isOpen: true,
      };
      return [newItem, ...prev];
    });
  }, []);

  const removeSavedPharmacy = useCallback((pharmacyId: string) => {
    setSavedPharmacies((prev) => prev.filter((p) => p.id !== pharmacyId));
  }, []);

  return (
    <SavedPharmaciesContext.Provider
      value={{
        savedPharmacies,
        isPharmacySaved,
        toggleSavePharmacy,
        removeSavedPharmacy,
      }}
    >
      {children}
    </SavedPharmaciesContext.Provider>
  );
};

export const useSavedPharmacies = () => {
  const context = useContext(SavedPharmaciesContext);
  if (!context) {
    throw new Error('useSavedPharmacies must be used within a SavedPharmaciesProvider');
  }
  return context;
};

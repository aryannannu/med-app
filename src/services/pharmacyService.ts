import { Pharmacy, PharmacyInventoryItem } from '../types/pharmacy';
import { Medicine } from '../types/medicine';
import { MOCK_PHARMACIES, MOCK_MEDICINES } from './mockData';

export class PharmacyService {
  private static pharmacies: Pharmacy[] = [...MOCK_PHARMACIES];

  static async getNearbyPharmacies(): Promise<Pharmacy[]> {
    await this.delay(200);
    return [...this.pharmacies];
  }

  static async getPharmacyById(id: string): Promise<Pharmacy | null> {
    await this.delay(150);
    const pharmacy = this.pharmacies.find((p) => p.id === id);
    return pharmacy ? { ...pharmacy } : null;
  }

  static async getPharmacyInventory(pharmacyId: string): Promise<{
    pharmacy: Pharmacy | null;
    items: { medicine: Medicine; inventory: PharmacyInventoryItem }[];
  }> {
    await this.delay(250);
    const pharmacy = await this.getPharmacyById(pharmacyId);
    if (!pharmacy) {
      return { pharmacy: null, items: [] };
    }

    // Build inventory with realistic variations
    const items = MOCK_MEDICINES.map((med, index) => {
      // simulate price variance per pharmacy (e.g. +/- 5%)
      const priceVariation = 1 + ((index % 3) - 1) * 0.04;
      const customPrice = Math.round(med.discountPrice * priceVariation);
      const inStock = index !== 7; // one item temporarily out of stock to demonstrate UI state
      const stockQuantity = inStock ? 15 + index * 5 : 0;

      return {
        medicine: med,
        inventory: {
          medicineId: med.id,
          inStock,
          stockQuantity,
          customPrice,
          batchNumber: `BAT-${index + 101}`,
          expiryDate: '12/2027',
        },
      };
    });

    return { pharmacy, items };
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

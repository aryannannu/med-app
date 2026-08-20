import { Medicine, MedicineCategory, AlternativeMedicine } from '../types/medicine';
import { MOCK_MEDICINES, MOCK_CATEGORIES } from './mockData';
import { apiClient } from './apiClient';
import { ENV } from '../config/env';

const SLUG_ALIASES: Record<string, string[]> = {
  'pain-relief': ['pain-relief', 'pain-fever', 'pain'],
  'pain-fever': ['pain-relief', 'pain-fever', 'pain'],
  'cold-flu': ['cold-flu', 'cold-cough', 'cough-cold'],
  'cold-cough': ['cold-flu', 'cold-cough', 'cough-cold'],
  'diabetes': ['diabetes', 'diabetes-care'],
  'vitamins': ['vitamins', 'vitamins-immunity', 'immunity'],
  'digestive': ['digestive', 'digestion', 'stomach-digestion'],
  'digestion': ['digestive', 'digestion', 'stomach-digestion'],
  'skin': ['skin', 'skin-care', 'dermatology'],
  'skin-care': ['skin', 'skin-care', 'dermatology'],
  'baby': ['baby', 'baby-care', 'mother-baby'],
  'ayurveda': ['ayurveda', 'ayurvedic', 'herbal'],
  'heart-bp': ['heart-bp', 'cardiac', 'cardiac-care', 'bp'],
};

export class MedicineService {
  private static medicines: Medicine[] | null = null;
  private static categories: MedicineCategory[] | null = null;

  private static getMedicinesList(): Medicine[] {
    if (!this.medicines) {
      this.medicines = Array.isArray(MOCK_MEDICINES) ? [...MOCK_MEDICINES] : [];
    }
    return this.medicines;
  }

  private static getCategoriesList(): MedicineCategory[] {
    if (!this.categories) {
      this.categories = Array.isArray(MOCK_CATEGORIES) ? [...MOCK_CATEGORIES] : [];
    }
    return this.categories;
  }

  static async getAllMedicines(): Promise<Medicine[]> {
    try {
      const response = await apiClient.get<Medicine[]>('/medicines');
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        this.medicines = response.data;
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(100);
      return [...this.getMedicinesList()];
    }
    return [];
  }

  static async getPopularMedicines(): Promise<Medicine[]> {
    try {
      const response = await apiClient.get<Medicine[]>('/medicines/popular');
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(100);
      const list = this.getMedicinesList();
      return list.filter((m) => m.isPopular);
    }
    return [];
  }

  static async getMedicineById(id: string): Promise<Medicine | null> {
    try {
      const response = await apiClient.get<Medicine>(`/medicines/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(100);
      const list = this.getMedicinesList();
      const med = list.find((m) => m.id === id);
      return med || list[0] || null;
    }
    return null;
  }

  static async getMedicinesByCategory(categorySlug: string): Promise<Medicine[]> {
    try {
      const response = await apiClient.get<Medicine[]>(`/medicines/category/${categorySlug}`);
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(100);
      const list = this.getMedicinesList();
      const aliases = SLUG_ALIASES[categorySlug.toLowerCase()] || [categorySlug.toLowerCase()];
      return list.filter((m) => aliases.includes(m.category.toLowerCase()));
    }
    return [];
  }

  static async searchMedicines(query: string): Promise<Medicine[]> {
    if (!query || !query.trim()) return [];

    try {
      const response = await apiClient.get<Medicine[]>('/medicines/search', { q: query });
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(150);
      const q = query.toLowerCase().trim();
      const list = this.getMedicinesList();
      return list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.genericName.toLowerCase().includes(q) ||
          m.brandName.toLowerCase().includes(q) ||
          m.manufacturer.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      );
    }
    return [];
  }

  static async getCategories(): Promise<MedicineCategory[]> {
    try {
      const response = await apiClient.get<MedicineCategory[]>('/categories');
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        this.categories = response.data;
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(100);
      return [...this.getCategoriesList()];
    }
    return [];
  }

  static async getAlternatives(medicineId: string): Promise<AlternativeMedicine[]> {
    const list = this.getMedicinesList();
    const sourceMed = list.find((m) => m.id === medicineId) || list[0];
    if (!sourceMed) return [];

    const alternatives = list.filter(
      (m) =>
        m.id !== sourceMed.id &&
        (m.genericName.toLowerCase() === sourceMed.genericName.toLowerCase() ||
          m.category === sourceMed.category)
    );

    return alternatives.map((alt) => {
      const priceDifference = sourceMed.discountPrice - alt.discountPrice;
      const savingsPercentage =
        sourceMed.discountPrice > 0
          ? Math.max(0, Math.round((priceDifference / sourceMed.discountPrice) * 100))
          : 0;

      return {
        id: `alt-${alt.id}`,
        name: alt.name,
        brandName: alt.brandName,
        manufacturer: alt.manufacturer,
        mrp: alt.mrp,
        savingsPercentage,
        saltComposition: alt.saltComposition,
        image: alt.image,
        rxRequired: alt.rxRequired,
      };
    });
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

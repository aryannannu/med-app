import { Medicine, MedicineCategory, AlternativeMedicine } from '../types/medicine';
import { MOCK_MEDICINES, MOCK_CATEGORIES } from './mockData';
import { apiClient } from './apiClient';
import { ENV } from '../config/env';

const SLUG_ALIASES: Record<string, string[]> = {
  'pain-relief': ['pain-relief', 'pain-fever', 'pain', 'pain relief & fever'],
  'pain-fever': ['pain-relief', 'pain-fever', 'pain', 'pain relief & fever'],
  'cold-flu': ['cold-flu', 'cold-cough', 'cough-cold', 'cold, cough & flu'],
  'cold-cough': ['cold-flu', 'cold-cough', 'cough-cold', 'cold, cough & flu'],
  'diabetes': ['diabetes', 'diabetes-care', 'diabetes care'],
  'vitamins': ['vitamins', 'vitamins-immunity', 'immunity', 'vitamins & immunity'],
  'digestive': ['digestive', 'digestion', 'stomach-digestion', 'stomach & digestion', 'digestive care'],
  'digestion': ['digestive', 'digestion', 'stomach-digestion', 'stomach & digestion', 'digestive care'],
  'skin': ['skin', 'skin-care', 'dermatology', 'skin & dermatology'],
  'skin-care': ['skin', 'skin-care', 'dermatology', 'skin & dermatology'],
  'baby': ['baby', 'baby-care', 'mother-baby', 'baby & mother care'],
  'ayurveda': ['ayurveda', 'ayurvedic', 'herbal', 'ayurvedic & herbal'],
  'heart-bp': ['heart-bp', 'cardiac', 'cardiac-care', 'bp', 'heart & bp care'],
  'eye-ear': ['eye-ear', 'eye', 'ear', 'eye & ear care'],
  'wellness': ['wellness', 'sexual-wellness', 'sexual wellness'],
  'first-aid': ['first-aid', 'surgical', 'first aid & surgical'],
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
      const slugLower = (categorySlug || 'pain-relief').toLowerCase().trim();
      const aliases = SLUG_ALIASES[slugLower] || [slugLower];

      const filtered = list.filter((m) => {
        const catSlug = (m.categorySlug || '').toLowerCase();
        const catName = (m.category || '').toLowerCase();
        return (
          aliases.some((a) => catSlug.includes(a) || catName.includes(a)) ||
          aliases.includes(catSlug) ||
          aliases.includes(catName)
        );
      });

      if (filtered.length > 0) return filtered;

      // Fallback matching by name or category keyword
      const fallback = list.filter(
        (m) =>
          m.category.toLowerCase().includes(slugLower) ||
          m.name.toLowerCase().includes(slugLower)
      );

      return fallback.length > 0 ? fallback : list.slice(0, 8);
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

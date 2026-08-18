import { Address } from '../types/user';
import { MOCK_SAVED_ADDRESSES } from './mockData';
import { apiClient } from './apiClient';
import { ENV } from '../config/env';

export class AddressService {
  private static addresses: Address[] = [...MOCK_SAVED_ADDRESSES];

  static async getAddresses(): Promise<Address[]> {
    try {
      const response = await apiClient.get<Address[]>('/addresses');
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        this.addresses = response.data;
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(100);
      return [...this.addresses];
    }
    return [];
  }

  static async getDefaultAddress(): Promise<Address | null> {
    try {
      const response = await apiClient.get<Address>('/addresses/default');
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(80);
      const def = this.addresses.find((a) => a.isDefault);
      return def ? { ...def } : this.addresses[0] ? { ...this.addresses[0] } : null;
    }
    return null;
  }

  static async saveAddress(address: Partial<Address> & { houseFlatNumber: string; streetAddress: string; city: string; pincode: string }): Promise<Address> {
    try {
      const response = address.id
        ? await apiClient.put<Address>(`/addresses/${address.id}`, address)
        : await apiClient.post<Address>('/addresses', address);

      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(150);
      if (address.id) {
        const index = this.addresses.findIndex((a) => a.id === address.id);
        if (index !== -1) {
          if (address.isDefault) {
            this.addresses = this.addresses.map((a) => ({ ...a, isDefault: false }));
          }
          this.addresses[index] = { ...this.addresses[index], ...address } as Address;
          return { ...this.addresses[index] };
        }
      }

      if (address.isDefault) {
        this.addresses = this.addresses.map((a) => ({ ...a, isDefault: false }));
      }
      const newAddr: Address = {
        id: `addr-${Date.now()}`,
        label: address.label || 'Home',
        recipientName: address.recipientName || 'Rahul Sharma',
        phone: address.phone || '9876543210',
        houseFlatNumber: address.houseFlatNumber,
        apartmentBuilding: address.apartmentBuilding || '',
        streetAddress: address.streetAddress,
        landmark: address.landmark || '',
        city: address.city,
        pincode: address.pincode,
        isDefault: address.isDefault || this.addresses.length === 0,
      };
      this.addresses.push(newAddr);
      return newAddr;
    }

    throw new Error('Could not save address');
  }

  static async deleteAddress(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete(`/addresses/${id}`);
      if (response.success) {
        this.addresses = this.addresses.filter((a) => a.id !== id);
        return true;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(100);
      this.addresses = this.addresses.filter((a) => a.id !== id);
      return true;
    }
    return false;
  }

  static async setDefaultAddress(id: string): Promise<Address | null> {
    try {
      const response = await apiClient.put<Address>(`/addresses/${id}/default`);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(100);
      let updated: Address | null = null;
      this.addresses = this.addresses.map((a) => {
        if (a.id === id) {
          updated = { ...a, isDefault: true };
          return updated;
        }
        return { ...a, isDefault: false };
      });
      return updated;
    }
    return null;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

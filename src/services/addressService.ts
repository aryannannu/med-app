import { Address } from '../types/user';
import { MOCK_SAVED_ADDRESSES } from './mockData';

export class AddressService {
  private static addresses: Address[] = [...MOCK_SAVED_ADDRESSES];

  static async getAddresses(): Promise<Address[]> {
    await this.delay(150);
    return [...this.addresses];
  }

  static async getDefaultAddress(): Promise<Address | null> {
    await this.delay(100);
    const def = this.addresses.find((a) => a.isDefault);
    return def ? { ...def } : this.addresses[0] ? { ...this.addresses[0] } : null;
  }

  static async saveAddress(address: Partial<Address> & { houseFlatNumber: string; streetAddress: string; city: string; pincode: string }): Promise<Address> {
    await this.delay(250);
    if (address.id) {
      // Edit existing
      const index = this.addresses.findIndex((a) => a.id === address.id);
      if (index !== -1) {
        if (address.isDefault) {
          this.addresses = this.addresses.map((a) => ({ ...a, isDefault: false }));
        }
        this.addresses[index] = { ...this.addresses[index], ...address } as Address;
        return { ...this.addresses[index] };
      }
    }

    // Add new
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

  static async deleteAddress(id: string): Promise<boolean> {
    await this.delay(150);
    this.addresses = this.addresses.filter((a) => a.id !== id);
    return true;
  }

  static async setDefaultAddress(id: string): Promise<Address | null> {
    await this.delay(150);
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

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

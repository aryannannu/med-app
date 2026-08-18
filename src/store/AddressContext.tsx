import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Address } from '../types/user';
import { AddressService } from '../services/addressService';

interface AddressContextType {
  addresses: Address[];
  selectedAddress: Address | null;
  isLoading: boolean;
  selectAddress: (address: Address) => void;
  saveAddress: (address: Partial<Address> & { houseFlatNumber: string; streetAddress: string; city: string; pincode: string }) => Promise<Address>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  registerAddressChangedCallback: (cb: () => void) => void;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [invalidationCallback, setInvalidationCallback] = useState<(() => void) | null>(null);

  const loadAddresses = useCallback(async () => {
    setIsLoading(true);
    const list = await AddressService.getAddresses();
    setAddresses(list);
    const def = list.find((a) => a.isDefault) || list[0] || null;
    setSelectedAddress(def);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const selectAddress = useCallback(
    (address: Address) => {
      setSelectedAddress(address);
      if (invalidationCallback) {
        invalidationCallback();
      }
    },
    [invalidationCallback]
  );

  const registerAddressChangedCallback = useCallback((cb: () => void) => {
    setInvalidationCallback(() => cb);
  }, []);

  const saveAddress = useCallback(
    async (addressData: Partial<Address> & { houseFlatNumber: string; streetAddress: string; city: string; pincode: string }) => {
      const saved = await AddressService.saveAddress(addressData);
      await loadAddresses();
      if (saved.isDefault || !selectedAddress) {
        setSelectedAddress(saved);
      }
      return saved;
    },
    [loadAddresses, selectedAddress]
  );

  const deleteAddress = useCallback(
    async (id: string) => {
      await AddressService.deleteAddress(id);
      await loadAddresses();
    },
    [loadAddresses]
  );

  const setDefaultAddress = useCallback(
    async (id: string) => {
      await AddressService.setDefaultAddress(id);
      await loadAddresses();
    },
    [loadAddresses]
  );

  return (
    <AddressContext.Provider
      value={{
        addresses,
        selectedAddress,
        isLoading,
        selectAddress,
        saveAddress,
        deleteAddress,
        setDefaultAddress,
        registerAddressChangedCallback,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
};

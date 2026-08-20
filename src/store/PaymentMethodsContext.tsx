import React, { createContext, useContext, useState, useCallback } from 'react';
import { SavedUPI, SavedCard } from '../types/payment';

interface PaymentMethodsContextType {
  upiList: SavedUPI[];
  cardsList: SavedCard[];
  addUPI: (upiId: string) => Promise<{ success: boolean; error?: string }>;
  removeUPI: (id: string) => void;
  setDefaultUPI: (id: string) => void;
  addCard: (card: {
    cardNumber: string;
    cardholderName: string;
    expiryMonth: string;
    expiryYear: string;
    brand?: 'visa' | 'mastercard' | 'rupay' | 'amex';
  }) => Promise<{ success: boolean; error?: string }>;
  removeCard: (id: string) => void;
  setDefaultCard: (id: string) => void;
}

const INITIAL_UPI: SavedUPI[] = [
  {
    id: 'upi-1',
    upiId: 'aryan@okaxis',
    provider: 'gpay',
    isDefault: true,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
  },
  {
    id: 'upi-2',
    upiId: 'aryan.kumar@paytm',
    provider: 'paytm',
    isDefault: false,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
  },
];

const INITIAL_CARDS: SavedCard[] = [
  {
    id: 'card-1',
    maskedNumber: '•••• 4821',
    cardholderName: 'Aryan Kumar',
    expiryMonth: '08',
    expiryYear: '28',
    brand: 'visa',
    isDefault: true,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
  },
  {
    id: 'card-2',
    maskedNumber: '•••• 9104',
    cardholderName: 'Aryan Kumar',
    expiryMonth: '11',
    expiryYear: '27',
    brand: 'mastercard',
    isDefault: false,
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
  },
];

const PaymentMethodsContext = createContext<PaymentMethodsContextType | undefined>(undefined);

export const PaymentMethodsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [upiList, setUpiList] = useState<SavedUPI[]>(INITIAL_UPI);
  const [cardsList, setCardsList] = useState<SavedCard[]>(INITIAL_CARDS);

  const addUPI = useCallback(
    async (upiId: string): Promise<{ success: boolean; error?: string }> => {
      const cleanUpi = upiId.trim().toLowerCase();
      const upiRegex = /^[\w.-]+@[\w.-]+$/;

      if (!cleanUpi) {
        return { success: false, error: 'UPI ID cannot be empty' };
      }
      if (!upiRegex.test(cleanUpi)) {
        return { success: false, error: 'Please enter a valid UPI ID (e.g. name@okaxis)' };
      }
      if (upiList.some((u) => u.upiId.toLowerCase() === cleanUpi)) {
        return { success: false, error: 'This UPI ID is already saved' };
      }

      await new Promise((r) => setTimeout(r, 600));

      let provider: SavedUPI['provider'] = 'other';
      if (cleanUpi.includes('okaxis') || cleanUpi.includes('okhdfcbank') || cleanUpi.includes('okicici') || cleanUpi.includes('oksbi')) {
        provider = 'gpay';
      } else if (cleanUpi.includes('ybl') || cleanUpi.includes('ibl') || cleanUpi.includes('axl')) {
        provider = 'phonepe';
      } else if (cleanUpi.includes('paytm')) {
        provider = 'paytm';
      } else if (cleanUpi.includes('upi')) {
        provider = 'bhim';
      }

      const newUPI: SavedUPI = {
        id: `upi-${Date.now()}`,
        upiId: cleanUpi,
        provider,
        isDefault: upiList.length === 0,
        addedAt: Date.now(),
      };

      setUpiList((prev) => [newUPI, ...prev]);
      return { success: true };
    },
    [upiList]
  );

  const removeUPI = useCallback((id: string) => {
    setUpiList((prev) => {
      const remaining = prev.filter((u) => u.id !== id);
      if (remaining.length > 0 && !remaining.some((u) => u.isDefault)) {
        remaining[0].isDefault = true;
      }
      return remaining;
    });
  }, []);

  const setDefaultUPI = useCallback((id: string) => {
    setUpiList((prev) => prev.map((u) => ({ ...u, isDefault: u.id === id })));
  }, []);

  const addCard = useCallback(
    async (cardData: {
      cardNumber: string;
      cardholderName: string;
      expiryMonth: string;
      expiryYear: string;
      brand?: 'visa' | 'mastercard' | 'rupay' | 'amex';
    }): Promise<{ success: boolean; error?: string }> => {
      const cleanNum = cardData.cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 15 || cleanNum.length > 16) {
        return { success: false, error: 'Please enter a valid 16-digit card number' };
      }
      if (!cardData.cardholderName.trim()) {
        return { success: false, error: 'Please enter the cardholder name' };
      }
      if (!cardData.expiryMonth || !cardData.expiryYear) {
        return { success: false, error: 'Please select a valid expiry date' };
      }

      await new Promise((r) => setTimeout(r, 600));

      const last4 = cleanNum.slice(-4);
      const newCard: SavedCard = {
        id: `card-${Date.now()}`,
        maskedNumber: `•••• ${last4}`,
        cardholderName: cardData.cardholderName.trim(),
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear,
        brand: cardData.brand || (cleanNum.startsWith('4') ? 'visa' : cleanNum.startsWith('5') ? 'mastercard' : 'rupay'),
        isDefault: cardsList.length === 0,
        addedAt: Date.now(),
      };

      setCardsList((prev) => [newCard, ...prev]);
      return { success: true };
    },
    [cardsList]
  );

  const removeCard = useCallback((id: string) => {
    setCardsList((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (remaining.length > 0 && !remaining.some((c) => c.isDefault)) {
        remaining[0].isDefault = true;
      }
      return remaining;
    });
  }, []);

  const setDefaultCard = useCallback((id: string) => {
    setCardsList((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
  }, []);

  return (
    <PaymentMethodsContext.Provider
      value={{
        upiList,
        cardsList,
        addUPI,
        removeUPI,
        setDefaultUPI,
        addCard,
        removeCard,
        setDefaultCard,
      }}
    >
      {children}
    </PaymentMethodsContext.Provider>
  );
};

export const usePaymentMethods = () => {
  const context = useContext(PaymentMethodsContext);
  if (!context) {
    throw new Error('usePaymentMethods must be used within a PaymentMethodsProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { CartItem, CartSummary } from '../types/cart';
import { Medicine, MedicineVariant } from '../types/medicine';
import { CartService } from '../services/cartService';

interface CartContextType {
  cartId: string;
  items: CartItem[];
  summary: CartSummary;
  totalItemCount: number;
  addToCart: (medicine: Medicine, quantity?: number, variant?: MedicineVariant, sourcePharmacyId?: string, sourcePharmacyName?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  getItemQuantity: (medicineId: string) => number;
  clearCart: () => void;
  onCartModified?: () => void;
  registerOfferInvalidationCallback: (cb: () => void) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartId, setCartId] = useState<string>(() => `cart-${Date.now()}`);
  const [items, setItems] = useState<CartItem[]>([]);
  const [invalidationCallback, setInvalidationCallback] = useState<(() => void) | null>(null);

  const triggerInvalidation = useCallback(() => {
    if (invalidationCallback) {
      invalidationCallback();
    }
  }, [invalidationCallback]);

  const registerOfferInvalidationCallback = useCallback((cb: () => void) => {
    setInvalidationCallback(() => cb);
  }, []);

  const summary = useMemo(() => {
    return CartService.calculateSummary(items);
  }, [items]);

  const totalItemCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const addToCart = useCallback(
    (
      medicine: Medicine,
      quantity = 1,
      variant?: MedicineVariant,
      sourcePharmacyId?: string,
      sourcePharmacyName?: string
    ) => {
      if (!medicine || !medicine.id) return;

      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (it) => it.medicineId === medicine.id && it.selectedVariant?.id === variant?.id
        );

        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };
          return updated;
        }

        const newItem: CartItem = {
          id: `${medicine.id}-${variant?.id || 'base'}-${Date.now()}`,
          medicineId: medicine.id,
          medicine,
          quantity,
          selectedVariant: variant,
          rxRequired: medicine.rxRequired,
          sourcePharmacyId,
          sourcePharmacyName,
          addedAt: Date.now(),
        };
        return [...prev, newItem];
      });

      triggerInvalidation();
    },
    [triggerInvalidation]
  );

  const updateQuantity = useCallback(
    (idOrMedicineId: string, quantity: number) => {
      setItems((prev) => {
        if (quantity <= 0) {
          return prev.filter((it) => it.id !== idOrMedicineId && it.medicineId !== idOrMedicineId);
        }
        return prev.map((it) =>
          it.id === idOrMedicineId || it.medicineId === idOrMedicineId
            ? { ...it, quantity }
            : it
        );
      });

      triggerInvalidation();
    },
    [triggerInvalidation]
  );

  const removeFromCart = useCallback(
    (idOrMedicineId: string) => {
      setItems((prev) =>
        prev.filter((it) => it.id !== idOrMedicineId && it.medicineId !== idOrMedicineId)
      );
      triggerInvalidation();
    },
    [triggerInvalidation]
  );

  const getItemQuantity = useCallback(
    (medicineId: string): number => {
      const match = items.find((it) => it.medicineId === medicineId);
      return match ? match.quantity : 0;
    },
    [items]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setCartId(`cart-${Date.now()}`);
    triggerInvalidation();
  }, [triggerInvalidation]);

  return (
    <CartContext.Provider
      value={{
        cartId,
        items,
        summary,
        totalItemCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        getItemQuantity,
        clearCart,
        registerOfferInvalidationCallback,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

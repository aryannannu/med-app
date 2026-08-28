import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { CartItem, CartSummary } from '../types/cart';
import { Medicine, MedicineVariant } from '../types/medicine';
import { CartService } from '../services/cartService';
import { haptics } from '../services/hapticService';

interface CartContextType {
  cartId: string;
  items: CartItem[];
  summary: CartSummary;
  totalItemCount: number;
  lastRemovedItem: { item: CartItem; index: number } | null;
  addToCart: (
    medicine: Medicine,
    quantity?: number,
    variant?: MedicineVariant,
    sourcePharmacyId?: string,
    sourcePharmacyName?: string
  ) => boolean;
  removeFromCart: (cartItemIdOrMedicineId: string, variantId?: string) => void;
  updateQuantity: (cartItemIdOrMedicineId: string, quantity: number, variantId?: string) => void;
  getItemQuantity: (medicineId: string, variantId?: string) => number;
  getVariantQuantity: (medicineId: string, variantId: string) => number;
  getCartItemsForMedicine: (medicineId: string) => CartItem[];
  undoRemove: () => boolean;
  clearCart: () => void;
  setCartFromMedicines: (
    medicines: Array<{
      medicine: Medicine;
      quantity: number;
      rxRequired?: boolean;
    }>
  ) => { cartId: string; newItems: CartItem[] };
  registerOfferInvalidationCallback: (cb: () => void) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartId, setCartId] = useState<string>(() => `cart-${Date.now()}`);
  const [items, setItems] = useState<CartItem[]>([]);
  const [lastRemovedItem, setLastRemovedItem] = useState<{ item: CartItem; index: number } | null>(null);
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

  const getItemQuantity = useCallback(
    (medicineId: string, variantId?: string): number => {
      if (variantId) {
        const item = items.find(
          (it) => it.medicineId === medicineId && it.selectedVariant?.id === variantId
        );
        return item ? item.quantity : 0;
      }
      return items
        .filter((it) => it.medicineId === medicineId)
        .reduce((sum, item) => sum + item.quantity, 0);
    },
    [items]
  );

  const getVariantQuantity = useCallback(
    (medicineId: string, variantId: string): number => {
      const item = items.find(
        (it) => it.medicineId === medicineId && it.selectedVariant?.id === variantId
      );
      return item ? item.quantity : 0;
    },
    [items]
  );

  const getCartItemsForMedicine = useCallback(
    (medicineId: string): CartItem[] => {
      return items.filter((it) => it.medicineId === medicineId);
    },
    [items]
  );

  const addToCart = useCallback(
    (
      medicine: Medicine,
      quantity = 1,
      variant?: MedicineVariant,
      sourcePharmacyId?: string,
      sourcePharmacyName?: string
    ): boolean => {
      if (!medicine || !medicine.id) return false;

      let success = true;

      setItems((prev) => {
        const variantIdToMatch = variant?.id;
        const existingIndex = prev.findIndex(
          (it) =>
            it.medicineId === medicine.id &&
            (variantIdToMatch ? it.selectedVariant?.id === variantIdToMatch : !it.selectedVariant)
        );

        if (existingIndex > -1) {
          const currentQty = prev[existingIndex].quantity;
          const MAX_ALLOWED = 10;
          if (currentQty + quantity > MAX_ALLOWED) {
            success = false;
            return prev;
          }

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

      if (success) {
        haptics.medium();
      }
      triggerInvalidation();
      return success;
    },
    [triggerInvalidation]
  );

  const updateQuantity = useCallback(
    (cartItemIdOrMedicineId: string, quantity: number, variantId?: string) => {
      setItems((prev) => {
        if (quantity <= 0) {
          const removedIdx = prev.findIndex(
            (it) =>
              it.id === cartItemIdOrMedicineId ||
              (it.medicineId === cartItemIdOrMedicineId &&
                (variantId ? it.selectedVariant?.id === variantId : true))
          );
          if (removedIdx > -1) {
            setLastRemovedItem({ item: prev[removedIdx], index: removedIdx });
          }
          const nextItems = prev.filter((it, idx) => idx !== removedIdx);
          if (nextItems.length === 0) {
            haptics.medium();
          } else {
            haptics.light();
          }
          return nextItems;
        }

        haptics.light();
        return prev.map((it) => {
          const isMatch =
            it.id === cartItemIdOrMedicineId ||
            (it.medicineId === cartItemIdOrMedicineId &&
              (variantId ? it.selectedVariant?.id === variantId : true));
          if (isMatch) {
            const MAX_ALLOWED = 10;
            const validQty = Math.min(quantity, MAX_ALLOWED);
            return { ...it, quantity: validQty };
          }
          return it;
        });
      });

      triggerInvalidation();
    },
    [triggerInvalidation]
  );

  const removeFromCart = useCallback(
    (cartItemIdOrMedicineId: string, variantId?: string) => {
      setItems((prev) => {
        const removedIdx = prev.findIndex(
          (it) =>
            it.id === cartItemIdOrMedicineId ||
            (it.medicineId === cartItemIdOrMedicineId &&
              (variantId ? it.selectedVariant?.id === variantId : true))
        );
        if (removedIdx > -1) {
          setLastRemovedItem({ item: prev[removedIdx], index: removedIdx });
          const nextItems = prev.filter((_, idx) => idx !== removedIdx);
          if (nextItems.length === 0) {
            haptics.medium();
          } else {
            haptics.light();
          }
          return nextItems;
        }
        return prev;
      });
      triggerInvalidation();
    },
    [triggerInvalidation]
  );

  const undoRemove = useCallback((): boolean => {
    if (!lastRemovedItem) return false;
    setItems((prev) => {
      const restored = [...prev];
      restored.splice(lastRemovedItem.index, 0, lastRemovedItem.item);
      return restored;
    });
    setLastRemovedItem(null);
    haptics.light();
    triggerInvalidation();
    return true;
  }, [lastRemovedItem, triggerInvalidation]);

  const clearCart = useCallback(() => {
    setItems([]);
    setCartId(`cart-${Date.now()}`);
    setLastRemovedItem(null);
    haptics.medium();
    triggerInvalidation();
  }, [triggerInvalidation]);

  const setCartFromMedicines = useCallback(
    (
      medicines: Array<{
        medicine: Medicine;
        quantity: number;
        rxRequired?: boolean;
      }>
    ) => {
      const newCartId = `cart-${Date.now()}`;
      const newItems: CartItem[] = medicines.map((m, idx) => ({
        id: `${m.medicine.id}-rx-${Date.now()}-${idx}`,
        medicineId: m.medicine.id,
        medicine: m.medicine,
        quantity: m.quantity,
        rxRequired: m.rxRequired ?? m.medicine.rxRequired ?? false,
        addedAt: Date.now(),
      }));

      setItems(newItems);
      setCartId(newCartId);
      setLastRemovedItem(null);
      haptics.medium();
      triggerInvalidation();
      return { cartId: newCartId, newItems };
    },
    [triggerInvalidation]
  );

  return (
    <CartContext.Provider
      value={{
        cartId,
        items,
        summary,
        totalItemCount,
        lastRemovedItem,
        addToCart,
        removeFromCart,
        updateQuantity,
        getItemQuantity,
        getVariantQuantity,
        getCartItemsForMedicine,
        undoRemove,
        clearCart,
        setCartFromMedicines,
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

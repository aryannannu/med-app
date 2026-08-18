import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '../types/order';
import { PharmacyOffer } from '../types/offer';
import { Address } from '../types/user';
import { Prescription } from '../types/prescription';
import { OrderService } from '../services/orderService';
import { MedicineService } from '../services/medicineService';
import { useCart } from './CartContext';

interface OrderContextType {
  orders: Order[];
  activeOrders: Order[];
  completedOrders: Order[];
  cancelledOrders: Order[];
  isLoading: boolean;
  createOrder: (offer: PharmacyOffer, address: Address, prescription?: Prescription, deliveryInstructions?: string) => Promise<Order>;
  cancelOrder: (orderId: string, reason: string) => Promise<Order | null>;
  getOrderById: (orderId: string) => Promise<Order | null>;
  reorder: (order: Order) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart, clearCart } = useCart();

  const refreshOrders = useCallback(async () => {
    setIsLoading(true);
    const active = await OrderService.getOrders('active');
    const completed = await OrderService.getOrders('completed');
    const cancelled = await OrderService.getOrders('cancelled');
    setOrders([...active, ...completed, ...cancelled]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const activeOrders = orders.filter((o) =>
    ['request_created', 'finding_pharmacy', 'offers_received', 'offer_selected', 'preparing', 'packed', 'out_for_delivery'].includes(
      o.status
    )
  );

  const completedOrders = orders.filter((o) => o.status === 'delivered');
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled');

  const createOrder = useCallback(
    async (
      offer: PharmacyOffer,
      address: Address,
      prescription?: Prescription,
      deliveryInstructions?: string
    ): Promise<Order> => {
      const newOrder = await OrderService.createOrderFromOffer(offer, address, prescription, deliveryInstructions);
      setOrders((prev) => [newOrder, ...prev]);
      clearCart();
      return newOrder;
    },
    [clearCart]
  );

  const cancelOrder = useCallback(async (orderId: string, reason: string): Promise<Order | null> => {
    const updated = await OrderService.cancelOrder(orderId, reason);
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    }
    return updated;
  }, []);

  const getOrderById = useCallback(
    async (orderId: string): Promise<Order | null> => {
      const local = orders.find((o) => o.id === orderId);
      if (local) return local;
      return OrderService.getOrderById(orderId);
    },
    [orders]
  );

  const reorder = useCallback(
    async (order: Order) => {
      clearCart();
      for (const it of order.items) {
        const med = await MedicineService.getMedicineById(it.medicineId);
        if (med) {
          addToCart(med, it.quantity);
        }
      }
    },
    [addToCart, clearCart]
  );

  return (
    <OrderContext.Provider
      value={{
        orders,
        activeOrders,
        completedOrders,
        cancelledOrders,
        isLoading,
        createOrder,
        cancelOrder,
        getOrderById,
        reorder,
        refreshOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

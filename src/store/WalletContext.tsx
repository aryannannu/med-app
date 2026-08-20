import React, { createContext, useContext, useState, useCallback } from 'react';
import { WalletTransaction, WalletSummary } from '../types/wallet';

interface WalletContextType {
  balance: number;
  summary: WalletSummary;
  transactions: WalletTransaction[];
  addMoney: (amount: number, paymentSource?: string) => Promise<{ success: boolean; error?: string }>;
  deductMoney: (amount: number, orderId: string) => Promise<boolean>;
  processRefund: (amount: number, orderId: string, reason?: string) => void;
  getTransactionById: (id: string) => WalletTransaction | undefined;
}

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-1003',
    amount: 150,
    type: 'refund',
    status: 'completed',
    title: 'Refund: Order #ORD-8412',
    description: 'Refund credited for unfulfilled item',
    timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
    relatedOrderId: 'ord-3',
    paymentSource: 'HEALIT Quick Refund',
    referenceId: 'REF-992140',
  },
  {
    id: 'tx-1002',
    amount: 500,
    type: 'topup',
    status: 'completed',
    title: 'Wallet Top-up',
    description: 'Added via Google Pay UPI',
    timestamp: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
    paymentSource: 'Google Pay (UPI)',
    referenceId: 'UPI-7819203',
  },
  {
    id: 'tx-1001',
    amount: 402,
    type: 'order_payment',
    status: 'completed',
    title: 'Payment for Order #ORD-9201',
    description: 'Medicines delivered by Apollo Pharmacy',
    timestamp: Date.now() - 1000 * 60 * 60 * 72, // 3 days ago
    relatedOrderId: 'ord-2',
    paymentSource: 'HEALIT Wallet',
    referenceId: 'ORD-9201',
  },
];

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number>(248);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);

  const summary: WalletSummary = {
    balance,
    totalCashback: 50,
    pendingRefunds: 0,
  };

  const addMoney = useCallback(
    async (amount: number, paymentSource = 'UPI Payment'): Promise<{ success: boolean; error?: string }> => {
      if (amount <= 0 || isNaN(amount)) {
        return { success: false, error: 'Please enter a valid amount' };
      }
      if (amount < 10) {
        return { success: false, error: 'Minimum top-up amount is ₹10' };
      }
      if (amount > 10000) {
        return { success: false, error: 'Maximum top-up amount per transaction is ₹10,000' };
      }

      // Simulate secure payment processing
      await new Promise((res) => setTimeout(res, 900));

      const newTx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        amount,
        type: 'topup',
        status: 'completed',
        title: 'Wallet Top-up',
        description: `Added via ${paymentSource}`,
        timestamp: Date.now(),
        paymentSource,
        referenceId: `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
      };

      setBalance((prev) => prev + amount);
      setTransactions((prev) => [newTx, ...prev]);

      return { success: true };
    },
    []
  );

  const deductMoney = useCallback(
    async (amount: number, orderId: string): Promise<boolean> => {
      if (amount > balance) return false;

      const newTx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        amount,
        type: 'order_payment',
        status: 'completed',
        title: `Payment for Order #${orderId.toUpperCase()}`,
        description: 'Debited for medicine order checkout',
        timestamp: Date.now(),
        relatedOrderId: orderId,
        paymentSource: 'HEALIT Wallet',
        referenceId: orderId,
      };

      setBalance((prev) => Math.max(0, prev - amount));
      setTransactions((prev) => [newTx, ...prev]);
      return true;
    },
    [balance]
  );

  const processRefund = useCallback((amount: number, orderId: string, reason = 'Order cancellation refund') => {
    // Avoid double refund for same order
    setTransactions((prev) => {
      const alreadyRefunded = prev.some(
        (tx) => tx.type === 'refund' && tx.relatedOrderId === orderId && tx.status === 'completed'
      );
      if (alreadyRefunded) return prev;

      const newTx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        amount,
        type: 'refund',
        status: 'completed',
        title: `Refund: Order #${orderId.toUpperCase()}`,
        description: reason,
        timestamp: Date.now(),
        relatedOrderId: orderId,
        paymentSource: 'HEALIT Instant Refund',
        referenceId: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      };

      setBalance((curr) => curr + amount);
      return [newTx, ...prev];
    });
  }, []);

  const getTransactionById = useCallback(
    (id: string) => {
      return transactions.find((t) => t.id === id);
    },
    [transactions]
  );

  return (
    <WalletContext.Provider
      value={{
        balance,
        summary,
        transactions,
        addMoney,
        deductMoney,
        processRefund,
        getTransactionById,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

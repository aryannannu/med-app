export type WalletTransactionType = 'topup' | 'refund' | 'order_payment' | 'cashback';
export type WalletTransactionStatus = 'completed' | 'pending' | 'failed' | 'reversed';

export interface WalletTransaction {
  id: string;
  amount: number;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  title: string;
  description?: string;
  timestamp: number;
  relatedOrderId?: string;
  paymentSource?: string;
  referenceId?: string;
}

export interface WalletSummary {
  balance: number;
  totalCashback: number;
  pendingRefunds: number;
}

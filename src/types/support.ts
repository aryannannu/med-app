export type HelpCategoryId =
  | 'orders'
  | 'delivery'
  | 'medicines'
  | 'prescriptions'
  | 'payments'
  | 'wallet'
  | 'account'
  | 'refunds';

export interface HelpArticle {
  id: string;
  categoryId: HelpCategoryId;
  title: string;
  shortDescription: string;
  problemSummary: string;
  steps: string[];
  actionLabel?: string;
  actionRoute?: string;
  actionParams?: any;
}

export interface HelpCategory {
  id: HelpCategoryId;
  title: string;
  icon: string;
  description: string;
  articleCount: number;
}

export type TicketCategory =
  | 'Order'
  | 'Payment'
  | 'Wallet'
  | 'Prescription'
  | 'Pharmacy'
  | 'Delivery'
  | 'Account'
  | 'App';

export interface SupportTicket {
  id: string;
  category: TicketCategory;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: number;
  relatedOrderId?: string;
  attachments?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'support' | 'system';
  text: string;
  timestamp: number;
  orderId?: string;
}

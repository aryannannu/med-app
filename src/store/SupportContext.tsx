import React, { createContext, useContext, useState, useCallback } from 'react';
import { HelpCategory, HelpArticle, SupportTicket, ChatMessage, TicketCategory } from '../types/support';

export interface NotificationSettings {
  orderUpdates: boolean;
  deliveryUpdates: boolean;
  offersAndDiscounts: boolean;
  medicineReminders: boolean;
}

interface SupportContextType {
  helpCategories: HelpCategory[];
  helpArticles: HelpArticle[];
  supportTickets: SupportTicket[];
  chatMessages: ChatMessage[];
  notificationSettings: NotificationSettings;
  updateNotificationSetting: (key: keyof NotificationSettings, value: boolean) => void;
  getArticlesByCategory: (categoryId: string) => HelpArticle[];
  getArticleById: (articleId: string) => HelpArticle | undefined;
  createTicket: (ticket: {
    category: TicketCategory;
    subject: string;
    description: string;
    relatedOrderId?: string;
  }) => Promise<SupportTicket>;
  sendMessage: (text: string, orderId?: string) => Promise<void>;
}

const INITIAL_CATEGORIES: HelpCategory[] = [
  {
    id: 'orders',
    title: 'Orders & Tracking',
    icon: 'receipt-outline',
    description: 'Status, cancellation, live route, delivery ETA',
    articleCount: 4,
  },
  {
    id: 'delivery',
    title: 'Delivery & Partner',
    icon: 'bicycle-outline',
    description: 'Delivery partner, delivery time, doorstep handover',
    articleCount: 3,
  },
  {
    id: 'medicines',
    title: 'Medicines & Quality',
    icon: 'medkit-outline',
    description: 'Expiry dates, authentic stock, generic substitutes',
    articleCount: 4,
  },
  {
    id: 'prescriptions',
    title: 'Prescriptions (Rx)',
    icon: 'document-text-outline',
    description: 'Upload guidelines, pharmacist verification, rejection',
    articleCount: 3,
  },
  {
    id: 'payments',
    title: 'Payments & UPI',
    icon: 'card-outline',
    description: 'Failed transactions, double charge, payment modes',
    articleCount: 3,
  },
  {
    id: 'wallet',
    title: 'HEALIT Wallet',
    icon: 'wallet-outline',
    description: 'Adding balance, cashback, instant refunds',
    articleCount: 3,
  },
  {
    id: 'refunds',
    title: 'Refunds & Returns',
    icon: 'refresh-circle-outline',
    description: 'Refund timeline, policy, damaged medicine return',
    articleCount: 3,
  },
  {
    id: 'account',
    title: 'Account & Privacy',
    icon: 'person-circle-outline',
    description: 'Mobile number update, saved addresses, security',
    articleCount: 3,
  },
];

const INITIAL_ARTICLES: HelpArticle[] = [
  {
    id: 'art-1',
    categoryId: 'orders',
    title: 'Where is my medicine order?',
    shortDescription: 'Track your live order status and delivery partner location.',
    problemSummary: 'Your order moves through 5 stages: Confirmed → Pharmacy Packing → Rider Assigned → Out for Delivery → Delivered.',
    steps: [
      'Open the "My Orders" tab from the bottom navigation or profile menu.',
      'Tap on your active order to view the live status timeline.',
      'If a delivery partner is assigned, their contact button will be visible.',
      'Estimated delivery time (10-15 mins for local deliveries) updates in real-time.',
    ],
    actionLabel: 'Track Active Orders',
    actionRoute: 'MainTabs',
    actionParams: { screen: 'OrdersTab' },
  },
  {
    id: 'art-2',
    categoryId: 'orders',
    title: 'How can I cancel my order?',
    shortDescription: 'Order cancellation rules and instant refund process.',
    problemSummary: 'You can cancel your order free of charge before the local pharmacy dispatches the delivery.',
    steps: [
      'Go to "My Orders" and select your ongoing order.',
      'Tap "Cancel Order" at the bottom of the Order Details screen.',
      'Select a cancellation reason (e.g. Ordered by mistake, Delivery taking too long).',
      'Once cancelled, your payment is instantly credited back to your HEALIT Wallet or original payment method within 2-4 business hours.',
    ],
    actionLabel: 'View Active Orders',
    actionRoute: 'MainTabs',
    actionParams: { screen: 'OrdersTab' },
  },
  {
    id: 'art-3',
    categoryId: 'prescriptions',
    title: 'Why was my prescription rejected or under review?',
    shortDescription: 'Guidelines for valid prescription uploads under government regulations.',
    problemSummary: 'Under Indian pharmacy regulations, prescription medicines require a clear, valid doctor prescription.',
    steps: [
      'Ensure the doctor name, clinic letterhead, and registration number are clearly visible.',
      'Check that the patient name and date of consultation are within the valid validity window (usually 6 months for chronic meds).',
      'Ensure medicine names and dosages are legible and not cropped or blurry.',
      'Re-upload a clearer picture directly using your phone camera in good lighting.',
    ],
    actionLabel: 'Upload New Prescription',
    actionRoute: 'UploadPrescription',
    actionParams: { fromCart: false },
  },
  {
    id: 'art-4',
    categoryId: 'wallet',
    title: 'How do instant refunds work?',
    shortDescription: 'Learn about HEALIT Wallet refund processing speeds.',
    problemSummary: 'When an order is cancelled or an item is unavailable at the pharmacy, refunds are processed instantly.',
    steps: [
      'Refunds to HEALIT Wallet are credited within 10 seconds of cancellation.',
      'Wallet balance can be used immediately for any future medicine order with 1-tap checkout.',
      'UPI and Card refunds take 1 to 3 banking days depending on your issuing bank.',
    ],
    actionLabel: 'Check Wallet Balance',
    actionRoute: 'Wallet',
  },
  {
    id: 'art-5',
    categoryId: 'payments',
    title: 'Money was deducted but order was not placed',
    shortDescription: 'Automated reconciliation for interrupted payment sessions.',
    problemSummary: 'If your bank deducted the amount but network dropped before confirmation, your money is 100% safe.',
    steps: [
      'Wait 2 minutes for our automated webhook to verify payment status with your UPI app or bank.',
      'If the order is still not created, your bank will automatically reverse the transaction within 24 hours.',
      'You can also check your HEALIT Wallet for instant credit if auto-refund was routed.',
    ],
    actionLabel: 'Contact Support',
    actionRoute: 'ContactSupport',
  },
  {
    id: 'art-6',
    categoryId: 'medicines',
    title: 'Are medicines 100% genuine and authentic?',
    shortDescription: 'HEALIT pharmacy verification and quality standards.',
    problemSummary: 'HEALIT exclusively partners with licensed, government-verified local retail pharmacies.',
    steps: [
      'All pharmacy partners possess valid Drug Licenses (Form 20/21) inspected periodically.',
      'Medicines are dispensed directly from authorized manufacturer batches with complete GST invoice.',
      'Batch number and expiry dates are printed directly on the product and verified by registered pharmacists.',
    ],
  },
  {
    id: 'art-7',
    categoryId: 'refunds',
    title: 'Can I return medicines after delivery?',
    shortDescription: 'Return policy for medicines and healthcare products.',
    problemSummary: 'Due to temperature sensitivity and health safety regulations, sealed medicine returns have specific conditions.',
    steps: [
      'Damaged, incorrect, or expired medicines can be returned within 48 hours of delivery.',
      'Keep the original invoice, packaging, and intact strip/bottle.',
      'Report an issue through the "Report an Issue" screen or chat with support with a picture of the received item.',
    ],
    actionLabel: 'Report an Issue',
    actionRoute: 'ReportIssue',
  },
  {
    id: 'art-8',
    categoryId: 'account',
    title: 'How do I change my registered mobile number?',
    shortDescription: 'Step-by-step OTP verification to update your account identity.',
    problemSummary: 'Your mobile number is your primary login identity. You can update it anytime with OTP confirmation.',
    steps: [
      'Open Profile and tap "Personal Information".',
      'Tap "Change" next to your mobile number.',
      'Enter your new 10-digit mobile number.',
      'Enter the 6-digit verification code sent to your new number to complete the update.',
    ],
    actionLabel: 'Edit Profile',
    actionRoute: 'EditProfile',
  },
];

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'HLT-49102',
    category: 'Order',
    subject: 'Delayed delivery for Order #ORD-8412',
    description: 'Order took 35 mins due to heavy rain. Rider resolved safely.',
    status: 'Resolved',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    relatedOrderId: 'ord-3',
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'system',
    text: 'Welcome to HEALIT 24x7 Customer Support! How can we assist your medicine delivery today?',
    timestamp: Date.now() - 1000 * 60 * 5,
  },
  {
    id: 'msg-2',
    sender: 'support',
    text: 'Hi Aryan! I am Priya from HEALIT Support Team. I can see your recent orders and help you with tracking, prescriptions, or refunds.',
    timestamp: Date.now() - 1000 * 60 * 4,
  },
];

const SupportContext = createContext<SupportContextType | undefined>(undefined);

export const SupportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [helpCategories] = useState<HelpCategory[]>(INITIAL_CATEGORIES);
  const [helpArticles] = useState<HelpArticle[]>(INITIAL_ARTICLES);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    orderUpdates: true,
    deliveryUpdates: true,
    offersAndDiscounts: true,
    medicineReminders: false,
  });

  const updateNotificationSetting = useCallback((key: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const getArticlesByCategory = useCallback(
    (categoryId: string) => {
      return helpArticles.filter((a) => a.categoryId === categoryId);
    },
    [helpArticles]
  );

  const getArticleById = useCallback(
    (articleId: string) => {
      return helpArticles.find((a) => a.id === articleId);
    },
    [helpArticles]
  );

  const createTicket = useCallback(
    async (ticketData: {
      category: TicketCategory;
      subject: string;
      description: string;
      relatedOrderId?: string;
    }): Promise<SupportTicket> => {
      await new Promise((r) => setTimeout(r, 600));

      const newTicket: SupportTicket = {
        id: `HLT-${Math.floor(10000 + Math.random() * 90000)}`,
        category: ticketData.category,
        subject: ticketData.subject,
        description: ticketData.description,
        status: 'Open',
        createdAt: Date.now(),
        relatedOrderId: ticketData.relatedOrderId,
      };

      setSupportTickets((prev) => [newTicket, ...prev]);
      return newTicket;
    },
    []
  );

  const sendMessage = useCallback(async (text: string, orderId?: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
      orderId,
    };

    setChatMessages((prev) => [...prev, userMsg]);

    // Simulated smart assistant / agent response after 1 second
    setTimeout(() => {
      let replyText = "Thank you for reaching out. We have logged your request and our pharmacy operations team is looking into it.";
      const lower = text.toLowerCase();

      if (lower.includes('order') || lower.includes('track') || lower.includes('where')) {
        replyText = "I have checked your active order. The pharmacy has packed your medicines and our rider is en route to your doorstep!";
      } else if (lower.includes('refund') || lower.includes('money') || lower.includes('cancel')) {
        replyText = "Eligible refunds are processed immediately to your HEALIT Wallet. You can check your wallet balance under Profile → HEALIT Wallet.";
      } else if (lower.includes('prescription') || lower.includes('doctor') || lower.includes('rx')) {
        replyText = "For prescription medicines, our registered pharmacist verifies the dosage within 2-3 minutes. Make sure doctor registration number is visible.";
      }

      const botReply: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        sender: 'support',
        text: replyText,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, botReply]);
    }, 900);
  }, []);

  return (
    <SupportContext.Provider
      value={{
        helpCategories,
        helpArticles,
        supportTickets,
        chatMessages,
        notificationSettings,
        updateNotificationSetting,
        getArticlesByCategory,
        getArticleById,
        createTicket,
        sendMessage,
      }}
    >
      {children}
    </SupportContext.Provider>
  );
};

export const useSupport = () => {
  const context = useContext(SupportContext);
  if (!context) {
    throw new Error('useSupport must be used within a SupportProvider');
  }
  return context;
};

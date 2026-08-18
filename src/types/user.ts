export interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  recipientName: string;
  phone: string;
  houseFlatNumber: string;
  apartmentBuilding: string;
  streetAddress: string;
  landmark?: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  phoneNumber: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  savedAddresses: Address[];
  defaultAddressId?: string;
  createdAt: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'offer_received' | 'order_status' | 'prescription_verified' | 'reminder' | 'system';
  timestamp: number;
  isRead: boolean;
  orderId?: string;
  offerId?: string;
}

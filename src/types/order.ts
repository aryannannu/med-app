import { Address, User } from './user';
import { Pharmacy } from './pharmacy';
import { PharmacyOffer } from './offer';
import { Prescription } from './prescription';

export type OrderStatus =
  | 'request_created'
  | 'finding_pharmacy'
  | 'offers_received'
  | 'offer_selected'
  | 'preparing'
  | 'packed'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  medicineId: string;
  medicineName: string;
  genericName?: string;
  packForm: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  rxRequired: boolean;
  image?: string;
}

export interface OrderTimelineEvent {
  id: string;
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: number;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface RiderDetails {
  name: string;
  phone: string;
  vehicleNumber?: string;
  rating?: number;
  photoUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: number;
  status: OrderStatus;
  statusText: string;
  statusDescription: string;
  items: OrderItem[];
  itemCount: number;

  // Selected Pharmacy & Offer
  selectedOffer?: PharmacyOffer;
  selectedPharmacy?: Pharmacy;

  // Prescription
  prescription?: Prescription;
  hasRxItems: boolean;

  // Financials
  itemSubtotal: number;
  mrpTotal: number;
  discount: number;
  deliveryFee: number;
  taxes: number;
  totalAmount: number;
  savingsTotal: number;

  // Delivery Details
  deliveryAddress: Address;
  deliveryInstructions?: string;
  estimatedDeliveryTimestamp?: number;
  deliveredAt?: number;
  rider?: RiderDetails;

  // Cancellation
  cancellationReason?: string;
  cancelledAt?: number;

  // Timeline
  timeline: OrderTimelineEvent[];
}

import { Order, OrderStatus, OrderTimelineEvent } from '../types/order';
import { PharmacyOffer } from '../types/offer';
import { Address } from '../types/user';
import { Prescription } from '../types/prescription';
import { apiClient } from './apiClient';
import { ENV } from '../config/env';

export class OrderService {
  private static orders: Order[] | null = null;

  private static getInitialOrders(): Order[] {
    if (this.orders) return this.orders;

    this.orders = [
      {
        id: 'ord-101',
        orderNumber: 'DW-8924',
        createdAt: Date.now() - 45 * 60 * 1000,
        status: 'out_for_delivery',
        statusText: 'Out for Delivery',
        statusDescription: 'Your rider Ramesh is on the way to deliver your order.',
        items: [
          {
            medicineId: 'med-1',
            medicineName: 'Dolo 650 Tablet',
            genericName: 'Paracetamol',
            packForm: 'Strip of 15 Tablets',
            unitPrice: 28.5,
            quantity: 2,
            totalPrice: 57.0,
            rxRequired: false,
            image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop&q=80',
          },
          {
            medicineId: 'med-2',
            medicineName: 'Augmentin 625 Duo Tablet',
            genericName: 'Amoxycillin and Potassium Clavulanate',
            packForm: 'Strip of 10 Tablets',
            unitPrice: 189.0,
            quantity: 1,
            totalPrice: 189.0,
            rxRequired: true,
            image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=200&auto=format&fit=crop&q=80',
          },
        ],
        itemCount: 2,
        selectedPharmacy: {
          id: 'pharm-apollo',
          name: 'Apollo Pharmacy 24x7',
          logo: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=200&auto=format&fit=crop&q=80',
          licenseNumber: 'DL-PB-2022-874512',
          rating: 4.9,
          reviewCount: 2890,
          distanceKm: 0.8,
          estimatedDeliveryTimeMinutes: 10,
          isOpenNow: true,
          openingTime: '12:00 AM',
          closingTime: '11:59 PM',
          isVerified: true,
          phone: '+91 98765 22334',
          deliveryFee: 0,
          freeDeliveryAbove: 199,
          address: {
            line1: 'SCO 21-22, Phase 5 Commercial Complex',
            city: 'Karimpur',
            pincode: '144522',
            latitude: 31.1512,
            longitude: 75.3489,
          },
        },
        hasRxItems: true,
        itemSubtotal: 246.0,
        mrpTotal: 291.5,
        discount: 45.5,
        deliveryFee: 0,
        taxes: 4.0,
        totalAmount: 250.0,
        savingsTotal: 45.5,
        deliveryAddress: {
          id: 'addr-1',
          label: 'Home',
          recipientName: 'Aryan Kumar',
          phone: '+91 98765 43210',
          houseFlatNumber: 'House No. 412',
          apartmentBuilding: 'Block B',
          streetAddress: 'Green Avenue, Sector 4',
          city: 'Karimpur',
          pincode: '144522',
          isDefault: true,
        },
        deliveryInstructions: 'Ring bell and leave at door',
        estimatedDeliveryTimestamp: Date.now() + 15 * 60 * 1000,
        rider: {
          name: 'Ramesh Kumar',
          phone: '+91 98451 22334',
          vehicleNumber: 'KA 03 HM 4812',
          rating: 4.9,
        },
        timeline: [
          {
            id: 't-1',
            status: 'request_created',
            title: 'Order Request Created',
            description: 'Medicine cart submitted for pharmacy matching',
            timestamp: Date.now() - 45 * 60 * 1000,
            isCompleted: true,
            isCurrent: false,
          },
          {
            id: 't-2',
            status: 'offers_received',
            title: 'Offers Received',
            description: '4 local verified pharmacies sent competitive quotes',
            timestamp: Date.now() - 40 * 60 * 1000,
            isCompleted: true,
            isCurrent: false,
          },
          {
            id: 't-3',
            status: 'offer_selected',
            title: 'Offer Accepted',
            description: 'Selected Apollo Pharmacy (Best Price & Fastest Delivery)',
            timestamp: Date.now() - 35 * 60 * 1000,
            isCompleted: true,
            isCurrent: false,
          },
          {
            id: 't-4',
            status: 'preparing',
            title: 'Prescription Verified & Medicines Packed',
            description: 'Pharmacist verified prescription and sealed tamper-proof bag',
            timestamp: Date.now() - 25 * 60 * 1000,
            isCompleted: true,
            isCurrent: false,
          },
          {
            id: 't-5',
            status: 'out_for_delivery',
            title: 'Out for Delivery',
            description: 'Rider Ramesh Kumar is on the way (KA 03 HM 4812)',
            timestamp: Date.now() - 10 * 60 * 1000,
            isCompleted: false,
            isCurrent: true,
          },
          {
            id: 't-6',
            status: 'delivered',
            title: 'Delivered',
            description: 'Order delivered to doorstep',
            timestamp: 0,
            isCompleted: false,
            isCurrent: false,
          },
        ],
      },
      {
        id: 'ord-102',
        orderNumber: 'DW-8210',
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        status: 'delivered',
        statusText: 'Delivered',
        statusDescription: 'Order delivered on 16 Aug 2026, 04:35 PM',
        items: [
          {
            medicineId: 'med-3',
            medicineName: 'Pan 40 Tablet',
            genericName: 'Pantoprazole',
            packForm: 'Strip of 15 Tablets',
            unitPrice: 165.0,
            quantity: 1,
            totalPrice: 165.0,
            rxRequired: false,
            image: 'https://images.unsplash.com/photo-1550572017-edb79a557451?w=200&auto=format&fit=crop&q=80',
          },
        ],
        itemCount: 1,
        selectedPharmacy: {
          id: 'pharm-medplus',
          name: 'MedPlus Chemists & Druggists',
          logo: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=200&auto=format&fit=crop&q=80',
          licenseNumber: 'DL-PB-2021-654321',
          rating: 4.8,
          reviewCount: 1980,
          distanceKm: 1.2,
          estimatedDeliveryTimeMinutes: 12,
          isOpenNow: true,
          openingTime: '08:00 AM',
          closingTime: '11:00 PM',
          isVerified: true,
          phone: '+91 98765 33445',
          deliveryFee: 0,
          freeDeliveryAbove: 249,
          address: {
            line1: 'SCF 8-9, Sector 2 Market',
            city: 'Karimpur',
            pincode: '144522',
            latitude: 31.1445,
            longitude: 75.3398,
          },
        },
        hasRxItems: false,
        itemSubtotal: 165.0,
        mrpTotal: 195.0,
        discount: 30.0,
        deliveryFee: 0,
        taxes: 0,
        totalAmount: 165.0,
        savingsTotal: 30.0,
        deliveryAddress: {
          id: 'addr-1',
          label: 'Home',
          recipientName: 'Aryan Kumar',
          phone: '+91 98765 43210',
          houseFlatNumber: 'House No. 412',
          apartmentBuilding: 'Block B',
          streetAddress: 'Green Avenue, Sector 4',
          city: 'Karimpur',
          pincode: '144522',
          isDefault: true,
        },
        estimatedDeliveryTimestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000,
        timeline: [
          {
            id: 't-201',
            status: 'request_created',
            title: 'Order Placed',
            description: 'Requirement sent to pharmacies',
            timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
            isCompleted: true,
            isCurrent: false,
          },
          {
            id: 't-202',
            status: 'delivered',
            title: 'Delivered',
            description: 'Delivered by MedPlus rider',
            timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 + 32 * 60 * 1000,
            isCompleted: true,
            isCurrent: true,
          },
        ],
      },
    ];

    return this.orders || [];
  }

  static async getOrders(statusFilter?: 'active' | 'completed' | 'cancelled'): Promise<Order[]> {
    try {
      const response = await apiClient.get<Order[]>('/orders', statusFilter ? { status: statusFilter } : undefined);
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(100);
      const all = this.getInitialOrders();
      if (!statusFilter) return [...all];

      if (statusFilter === 'active') {
        return all.filter((o) =>
          ['request_created', 'finding_pharmacy', 'offers_received', 'offer_selected', 'preparing', 'packed', 'out_for_delivery'].includes(
            o.status
          )
        );
      }
      if (statusFilter === 'completed') {
        return all.filter((o) => o.status === 'delivered');
      }
      if (statusFilter === 'cancelled') {
        return all.filter((o) => o.status === 'cancelled');
      }
    }
    return [];
  }

  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const response = await apiClient.get<Order>(`/orders/${orderId}`);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(100);
      const all = this.getInitialOrders();
      const order = all.find((o) => o.id === orderId);
      return order || all[0] || null;
    }
    return null;
  }

  static async createOrderFromOffer(
    offer: PharmacyOffer,
    address: Address,
    prescription?: Prescription,
    deliveryInstructions?: string
  ): Promise<Order> {
    try {
      const response = await apiClient.post<Order>('/orders', {
        offerId: offer.id,
        cartId: offer.cartId,
        pharmacyId: offer.pharmacyId,
        addressId: address.id,
        prescriptionId: prescription?.id,
        deliveryInstructions,
      });
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // fallback
    }

    const all = this.getInitialOrders();
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `DW-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: Date.now(),
      status: 'offer_selected',
      statusText: 'Order Placed',
      statusDescription: 'Your order is being sent to the pharmacy for verification.',
      items: offer.itemPrices.map((item) => ({
        medicineId: item.medicineId,
        medicineName: item.medicineName,
        packForm: 'Strip / Bottle',
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        rxRequired: false,
      })),
      itemCount: offer.itemPrices.reduce((sum, item) => sum + item.quantity, 0),
      selectedPharmacy: offer.pharmacy,
      selectedOffer: offer,
      prescription,
      hasRxItems: !!prescription,
      itemSubtotal: offer.medicineSubtotal,
      mrpTotal: offer.mrpTotal,
      discount: offer.discountAmount,
      deliveryFee: offer.deliveryFee,
      taxes: offer.taxesAndFees,
      totalAmount: offer.finalPayableAmount,
      savingsTotal: offer.totalSavings,
      deliveryAddress: address,
      deliveryInstructions,
      estimatedDeliveryTimestamp: Date.now() + offer.estimatedDeliveryMinutes * 60 * 1000,
      timeline: [
        {
          id: `t-${Date.now()}-1`,
          status: 'offer_selected',
          title: 'Order Placed & Offer Confirmed',
          description: `Selected ${offer.pharmacy.name} with ETA ${offer.estimatedDeliveryMinutes} mins`,
          timestamp: Date.now(),
          isCompleted: true,
          isCurrent: true,
        },
        {
          id: `t-${Date.now()}-2`,
          status: 'preparing',
          title: 'Pharmacy Packing & Bill Generation',
          description: 'Pharmacist verifies batch & seals tamper-proof packaging',
          timestamp: 0,
          isCompleted: false,
          isCurrent: false,
        },
        {
          id: `t-${Date.now()}-3`,
          status: 'out_for_delivery',
          title: 'Out for Delivery',
          description: 'Delivery partner on the way to your location',
          timestamp: 0,
          isCompleted: false,
          isCurrent: false,
        },
        {
          id: `t-${Date.now()}-4`,
          status: 'delivered',
          title: 'Delivered',
          description: 'Medicines delivered safely at your doorstep',
          timestamp: 0,
          isCompleted: false,
          isCurrent: false,
        },
      ],
    };

    all.unshift(newOrder);
    return newOrder;
  }

  static async cancelOrder(orderId: string, reason: string): Promise<Order | null> {
    try {
      const response = await apiClient.post<Order>(`/orders/${orderId}/cancel`, { reason });
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // fallback
    }

    const all = this.getInitialOrders();
    const order = all.find((o) => o.id === orderId);
    if (order) {
      order.status = 'cancelled';
      order.statusText = 'Cancelled';
      order.statusDescription = `Order was cancelled: ${reason}`;
      order.timeline.push({
        id: `t-cancel-${Date.now()}`,
        status: 'cancelled',
        title: 'Order Cancelled',
        description: reason,
        timestamp: Date.now(),
        isCompleted: true,
        isCurrent: true,
      });
      return { ...order };
    }
    return null;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

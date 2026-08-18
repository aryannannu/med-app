import { Order, OrderStatus, OrderTimelineEvent } from '../types/order';
import { PharmacyOffer } from '../types/offer';
import { Address } from '../types/user';
import { Prescription } from '../types/prescription';
import { MOCK_SAVED_ADDRESSES, MOCK_PHARMACIES, MOCK_MEDICINES } from './mockData';

export class OrderService {
  private static orders: Order[] = [
    {
      id: 'ord-101',
      orderNumber: 'DW-8924',
      createdAt: Date.now() - 45 * 60 * 1000,
      status: 'out_for_delivery',
      statusText: 'Out for Delivery',
      statusDescription: 'Your rider Ramesh is on the way to deliver your order.',
      items: [
        {
          medicineId: MOCK_MEDICINES[0].id,
          medicineName: MOCK_MEDICINES[0].name,
          genericName: MOCK_MEDICINES[0].genericName,
          packForm: MOCK_MEDICINES[0].packForm,
          unitPrice: 28.5,
          quantity: 2,
          totalPrice: 57.0,
          rxRequired: false,
          image: MOCK_MEDICINES[0].image,
        },
        {
          medicineId: MOCK_MEDICINES[1].id,
          medicineName: MOCK_MEDICINES[1].name,
          genericName: MOCK_MEDICINES[1].genericName,
          packForm: MOCK_MEDICINES[1].packForm,
          unitPrice: 189.0,
          quantity: 1,
          totalPrice: 189.0,
          rxRequired: true,
          image: MOCK_MEDICINES[1].image,
        },
      ],
      itemCount: 2,
      selectedPharmacy: MOCK_PHARMACIES[0],
      hasRxItems: true,
      itemSubtotal: 246.0,
      mrpTotal: 291.5,
      discount: 45.5,
      deliveryFee: 0,
      taxes: 4.0,
      totalAmount: 250.0,
      savingsTotal: 45.5,
      deliveryAddress: MOCK_SAVED_ADDRESSES[0],
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
          title: 'Offer Selected',
          description: 'You accepted Apollo Medplus Pharmacy (Best Value)',
          timestamp: Date.now() - 35 * 60 * 1000,
          isCompleted: true,
          isCurrent: false,
        },
        {
          id: 't-4',
          status: 'preparing',
          title: 'Pharmacy Preparing Order',
          description: 'Pharmacist verified batch numbers & verified Rx',
          timestamp: Date.now() - 25 * 60 * 1000,
          isCompleted: true,
          isCurrent: false,
        },
        {
          id: 't-5',
          status: 'packed',
          title: 'Order Packed',
          description: 'Tamper-evident sealed pack handed to delivery partner',
          timestamp: Date.now() - 15 * 60 * 1000,
          isCompleted: true,
          isCurrent: false,
        },
        {
          id: 't-6',
          status: 'out_for_delivery',
          title: 'Out for Delivery',
          description: 'Rider Ramesh Kumar is arriving in ~12 mins',
          timestamp: Date.now() - 8 * 60 * 1000,
          isCompleted: false,
          isCurrent: true,
        },
        {
          id: 't-7',
          status: 'delivered',
          title: 'Delivered',
          description: 'Order handed over safely',
          timestamp: 0,
          isCompleted: false,
          isCurrent: false,
        },
      ],
    },
    {
      id: 'ord-99',
      orderNumber: 'DW-8812',
      createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      status: 'delivered',
      statusText: 'Delivered',
      statusDescription: 'Order delivered on 16 Aug 2026',
      items: [
        {
          medicineId: MOCK_MEDICINES[5].id,
          medicineName: MOCK_MEDICINES[5].name,
          genericName: MOCK_MEDICINES[5].genericName,
          packForm: MOCK_MEDICINES[5].packForm,
          unitPrice: 46.0,
          quantity: 2,
          totalPrice: 92.0,
          rxRequired: false,
          image: MOCK_MEDICINES[5].image,
        },
        {
          medicineId: MOCK_MEDICINES[7].id,
          medicineName: MOCK_MEDICINES[7].name,
          genericName: MOCK_MEDICINES[7].genericName,
          packForm: MOCK_MEDICINES[7].packForm,
          unitPrice: 114.0,
          quantity: 1,
          totalPrice: 114.0,
          rxRequired: false,
          image: MOCK_MEDICINES[7].image,
        },
      ],
      itemCount: 2,
      selectedPharmacy: MOCK_PHARMACIES[1],
      hasRxItems: false,
      itemSubtotal: 206.0,
      mrpTotal: 246.0,
      discount: 40.0,
      deliveryFee: 30.0,
      taxes: 4.0,
      totalAmount: 240.0,
      savingsTotal: 40.0,
      deliveryAddress: MOCK_SAVED_ADDRESSES[0],
      deliveredAt: Date.now() - 2 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000,
      timeline: [
        {
          id: 't-1',
          status: 'request_created',
          title: 'Order Placed',
          description: 'Order created',
          timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
          isCompleted: true,
          isCurrent: false,
        },
        {
          id: 't-7',
          status: 'delivered',
          title: 'Delivered',
          description: 'Delivered by Wellness Forever Chemists',
          timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000,
          isCompleted: true,
          isCurrent: true,
        },
      ],
    },
  ];

  static async getOrders(tab: 'active' | 'completed' | 'cancelled' = 'active'): Promise<Order[]> {
    await this.delay(200);
    if (tab === 'active') {
      return this.orders.filter((o) =>
        ['request_created', 'finding_pharmacy', 'offers_received', 'offer_selected', 'preparing', 'packed', 'out_for_delivery'].includes(
          o.status
        )
      );
    }
    if (tab === 'completed') {
      return this.orders.filter((o) => o.status === 'delivered');
    }
    return this.orders.filter((o) => o.status === 'cancelled');
  }

  static async getOrderById(orderId: string): Promise<Order | null> {
    await this.delay(150);
    const order = this.orders.find((o) => o.id === orderId);
    return order ? { ...order } : null;
  }

  static async createOrderFromOffer(
    offer: PharmacyOffer,
    address: Address,
    prescription?: Prescription,
    deliveryInstructions?: string
  ): Promise<Order> {
    await this.delay(400);

    const orderNumber = `DW-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = Date.now();

    const timeline: OrderTimelineEvent[] = [
      {
        id: `t-req-${now}`,
        status: 'request_created',
        title: 'Order Request Created',
        description: 'Medicine requirement submitted',
        timestamp: now - 60 * 1000,
        isCompleted: true,
        isCurrent: false,
      },
      {
        id: `t-off-${now}`,
        status: 'offers_received',
        title: 'Offers Received',
        description: 'Nearby verified pharmacies sent competitive quotes',
        timestamp: now - 30 * 1000,
        isCompleted: true,
        isCurrent: false,
      },
      {
        id: `t-sel-${now}`,
        status: 'offer_selected',
        title: 'Offer Accepted',
        description: `Accepted ${offer.pharmacy.name}'s offer`,
        timestamp: now,
        isCompleted: true,
        isCurrent: false,
      },
      {
        id: `t-prep-${now}`,
        status: 'preparing',
        title: 'Pharmacy Preparing Order',
        description: 'Pharmacist is packaging your items',
        timestamp: now + 5000,
        isCompleted: false,
        isCurrent: true,
      },
      {
        id: `t-pack-${now}`,
        status: 'packed',
        title: 'Order Packed',
        description: 'Ready for rider pickup',
        timestamp: 0,
        isCompleted: false,
        isCurrent: false,
      },
      {
        id: `t-out-${now}`,
        status: 'out_for_delivery',
        title: 'Out for Delivery',
        description: 'Rider is on the way',
        timestamp: 0,
        isCompleted: false,
        isCurrent: false,
      },
      {
        id: `t-del-${now}`,
        status: 'delivered',
        title: 'Delivered',
        description: 'Order delivered safely',
        timestamp: 0,
        isCompleted: false,
        isCurrent: false,
      },
    ];

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: now,
      status: 'preparing',
      statusText: 'Pharmacy Preparing Order',
      statusDescription: `${offer.pharmacy.name} is verifying prescription & packing medicines.`,
      items: offer.itemPrices.map((it) => ({
        medicineId: it.medicineId,
        medicineName: it.medicineName,
        packForm: 'Standard Pack',
        unitPrice: it.unitPrice,
        quantity: it.quantity,
        totalPrice: it.totalPrice,
        rxRequired: true,
      })),
      itemCount: offer.itemPrices.length,
      selectedOffer: offer,
      selectedPharmacy: offer.pharmacy,
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
      estimatedDeliveryTimestamp: now + offer.estimatedDeliveryMinutes * 60 * 1000,
      rider: {
        name: 'Sunil Verma',
        phone: '+91 98450 77112',
        vehicleNumber: 'KA 05 EQ 9182',
        rating: 4.8,
      },
      timeline,
    };

    this.orders.unshift(newOrder);
    return newOrder;
  }

  static async cancelOrder(orderId: string, reason: string): Promise<Order | null> {
    await this.delay(200);
    const order = this.orders.find((o) => o.id === orderId);
    if (order) {
      order.status = 'cancelled';
      order.statusText = 'Order Cancelled';
      order.statusDescription = `Cancelled: ${reason}`;
      order.cancellationReason = reason;
      order.cancelledAt = Date.now();
      return { ...order };
    }
    return null;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

import { CartItem, CartSummary } from '../types/cart';

export class CartService {
  private static FREE_DELIVERY_THRESHOLD = 300;
  private static BASE_DELIVERY_FEE = 29;
  private static HANDLING_FEE = 4;

  static calculateSummary(items: CartItem[]): CartSummary {
    let itemCount = items.length;
    let totalQuantity = 0;
    let mrpTotal = 0;
    let itemTotal = 0;
    let rxItemsCount = 0;

    for (const item of items) {
      const qty = item.quantity;
      totalQuantity += qty;
      const unitMrp = item.selectedVariant?.mrp ?? item.medicine.mrp;
      const unitDiscountPrice = item.selectedVariant?.discountPrice ?? item.medicine.discountPrice;

      mrpTotal += unitMrp * qty;
      itemTotal += unitDiscountPrice * qty;

      if (item.rxRequired || item.medicine.rxRequired) {
        rxItemsCount += 1;
      }
    }

    const savingsTotal = Math.max(0, mrpTotal - itemTotal);
    const isEligibleForFreeDelivery = itemTotal >= this.FREE_DELIVERY_THRESHOLD && itemTotal > 0;
    const estimatedDeliveryFee = itemTotal === 0 ? 0 : isEligibleForFreeDelivery ? 0 : this.BASE_DELIVERY_FEE;
    const amountNeededForFreeDelivery = isEligibleForFreeDelivery
      ? 0
      : Math.max(0, this.FREE_DELIVERY_THRESHOLD - itemTotal);
    const taxesAndHandling = itemTotal > 0 ? this.HANDLING_FEE : 0;
    const estimatedFinalTotal = itemTotal + estimatedDeliveryFee + taxesAndHandling;

    return {
      itemCount,
      totalQuantity,
      mrpTotal,
      itemTotal,
      savingsTotal,
      estimatedDeliveryFee,
      freeDeliveryThreshold: this.FREE_DELIVERY_THRESHOLD,
      amountNeededForFreeDelivery,
      isEligibleForFreeDelivery,
      taxesAndHandling,
      estimatedFinalTotal,
      hasRxItems: rxItemsCount > 0,
      rxItemsCount,
    };
  }
}

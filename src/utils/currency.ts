export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatDiscount(percentage: number | undefined | null): string {
  if (!percentage || percentage <= 0) return '';
  return `${Math.round(percentage)}% OFF`;
}

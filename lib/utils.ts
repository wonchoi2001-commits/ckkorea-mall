export function formatPrice(price: number | null) {
  if (price === null) return "견적문의";
  return `${price.toLocaleString()}원`;
}

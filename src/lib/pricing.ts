export function isDiscountActive(discountPercent?: number): boolean {
  return (
    typeof discountPercent === "number" &&
    Number.isFinite(discountPercent) &&
    discountPercent > 0 &&
    discountPercent < 100
  );
}

export function computeSalePriceValue(
  priceValue: number,
  discountPercent?: number
): number {
  return isDiscountActive(discountPercent)
    ? Math.round(priceValue * (1 - (discountPercent as number) / 100))
    : Math.round(priceValue);
}

export function formatRs(value: number): string {
  return `Rs. ${Math.round(value).toLocaleString("en-US")}`;
}

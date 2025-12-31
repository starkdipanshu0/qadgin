export function formatPrice(
    amount: number | string | null | undefined,
    currency: string = "INR",
    locale: string = "en-IN"
): string {
    if (amount === null || amount === undefined) return "";

    const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    if (isNaN(numericAmount)) return String(amount);

    try {
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 2,
        }).format(numericAmount);
    } catch (error) {
        // Fallback if currency code is invalid
        return `${currency} ${numericAmount.toFixed(2)}`;
    }
}

import { format } from "date-fns";

// Matches the format expected by App.test.tsx: formattedDate helper
export const formatDate = (dateString: string): string =>
  format(new Date(dateString), "dd/MM/yyyy, HH:mm:ss");

export const formatAmount = (amount: number, currency: string): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback for unknown/unsupported currency codes
    return `${currency} ${amount.toFixed(2)}`;
  }
};

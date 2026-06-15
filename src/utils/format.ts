import { format } from "date-fns";

export const formatDate = (dateString: string): string =>
  format(new Date(dateString), "dd/MM/yyyy, HH:mm:ss");

export const formatAmount = (amount: number): string =>
  amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

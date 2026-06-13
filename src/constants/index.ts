import type { PaymentFilters, SortField } from "../types";

// ── API ───────────────────────────────────────────────────────────────────────
export const API_URL = "/api/payments";

// ── Currencies ────────────────────────────────────────────────────────────────
export const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "AUD",
  "CAD",
  "ZAR",
  "JPY",
  "CZK",
] as const;

// ── i18n ──────────────────────────────────────────────────────────────────────
export const I18N = {
  // App
  APP_TITLE: "Checkout.com",
  PAGE_TITLE: "All payments",

  // Search & filter labels
  SEARCH_PLACEHOLDER: "Search by ID, customer, currency, status…",
  SEARCH_LABEL: "Search payments",
  CURRENCY_FILTER_LABEL: "Filter by currency",
  CURRENCIES_OPTION: "Currencies",
  PAGE_SIZE_LABEL: "Show:",

  // Buttons
  SEARCH_BUTTON: "Search",
  CLEAR_FILTERS: "Clear Filters",

  // Table headers
  TABLE_HEADER_PAYMENT_ID: "Payment ID",
  TABLE_HEADER_DATE: "Date",
  TABLE_HEADER_AMOUNT: "Amount",
  TABLE_HEADER_CUSTOMER: "Customer",
  TABLE_HEADER_CURRENCY: "Currency",
  TABLE_HEADER_STATUS: "Status",

  // Pagination
  PREVIOUS_BUTTON: "◀ Previous",
  NEXT_BUTTON: "Next ▶",
  PAGE_LABEL: "Page",

  // Messages
  NO_PAYMENTS_FOUND: "No payments found.",
  PAYMENT_NOT_FOUND: "Payment not found.",
  INTERNAL_SERVER_ERROR: "Internal server error. Please try again later.",
  UNAUTHORIZED: "Unauthorized. Please log in again.",
  SOMETHING_WENT_WRONG: "Something went wrong!",

  // Fallbacks
  EMPTY_CUSTOMER: "—",
  EMPTY_CURRENCY: "—",
} as const;

// ── Query ─────────────────────────────────────────────────────────────────────
export const STALE_TIME_MS = 30_000;

// ── Table ─────────────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 5;

export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

export const PAYMENT_TABLE_COLUMNS = [
  { key: "id", label: I18N.TABLE_HEADER_PAYMENT_ID },
  { key: "date", label: I18N.TABLE_HEADER_DATE },
  { key: "amount", label: I18N.TABLE_HEADER_AMOUNT },
  { key: "customer", label: I18N.TABLE_HEADER_CUSTOMER },
  { key: "currency", label: I18N.TABLE_HEADER_CURRENCY },
  { key: "status", label: I18N.TABLE_HEADER_STATUS },
] as const;

// ── Sorting ───────────────────────────────────────────────────────────────────
export const SORT_FIELDS: readonly SortField[] = [
  "id",
  "date",
  "amount",
  "customerName",
  "currency",
  "status",
];

export const SORTABLE_COLUMNS: Partial<Record<string, SortField>> = {
  date: "date",
  amount: "amount",
};

// ── Filters ───────────────────────────────────────────────────────────────────
export const INITIAL_FILTERS: PaymentFilters = {
  inputValue: "",
  committedSearch: "",
  currency: "",
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  sortBy: "date",
  sortDir: "desc",
};

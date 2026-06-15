// ── Payment ───────────────────────────────────────────────────────────────────
export interface Payment {
  id: string;
  customerName: string | null;
  amount: number;
  customerAddress: string;
  currency: string;
  status: string;
  date: string;
  description: string;
  clientId?: string;
}


export interface PaymentSearchResponse {
  payments: Payment[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Sorting ───────────────────────────────────────────────────────────────────
export type SortField = "id" | "date" | "amount" | "customerName" | "currency" | "status";
export type SortDirection = "asc" | "desc";

// ── Filters ───────────────────────────────────────────────────────────────────
export interface PaymentFilters {
  inputValue: string;
  committedSearch: string;
  currency: string;
  page: number;
  pageSize: number;
  sortBy: SortField;
  sortDir: SortDirection;
}

export interface PaymentFiltersActions {
  setInputValue: (value: string) => void;
  commitSearch: (value?: string) => void;
  setCurrency: (currency: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSort: (field: SortField) => void;
  clearFilters: () => void;
}

export interface PaymentSearchParams {
  search?: string;
  currency?: string;
  page?: number;
  pageSize?: number;
  sortBy?: SortField;
  sortDir?: SortDirection;
}

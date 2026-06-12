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

export interface PaymentSearchParams {
  search?: string;
  currency?: string;
  page?: number;
  pageSize?: number;
}

export interface PaymentSearchResponse {
  payments: Payment[];
  total: number;
  page: number;
  pageSize: number;
}

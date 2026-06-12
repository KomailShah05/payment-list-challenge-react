import { API_URL } from "../constants";
import { PaymentSearchParams, PaymentSearchResponse } from "../types";
import apiClient from "./client";

export const fetchPayments = async (
  params: PaymentSearchParams,
  signal?: AbortSignal
): Promise<PaymentSearchResponse> => {
  // Only include params that have a value — avoids ?search=&currency= noise
  // and ensures cache keys are canonical (undefined === omitted).
  const { data } = await apiClient.get<PaymentSearchResponse>(API_URL, {
    params: {
      ...(params.search   ? { search:   params.search   } : {}),
      ...(params.currency ? { currency: params.currency } : {}),
      page:     params.page     ?? 1,
      pageSize: params.pageSize ?? 5,
    },
    signal,
  });
  return data;
};

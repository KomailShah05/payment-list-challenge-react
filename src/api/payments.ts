import { API_URL } from "../constants";
import { PaymentSearchParams, PaymentSearchResponse } from "../types";
import apiClient from "./client";

export const fetchPayments = async (
  params: PaymentSearchParams,
  signal?: AbortSignal
): Promise<PaymentSearchResponse> => {
  const { data } = await apiClient.get<PaymentSearchResponse>(API_URL, {
    params: {
      search:   params.search   ?? "",
      currency: params.currency ?? "",
      page:     params.page     ?? 1,
      pageSize: params.pageSize ?? 5,
    },
    signal,
  });
  return data;
};

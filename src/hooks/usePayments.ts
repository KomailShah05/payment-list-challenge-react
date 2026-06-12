import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchPayments } from "../api/payments";
import { PaymentSearchParams, PaymentSearchResponse } from "../types";
import { STALE_TIME_MS } from "../constants";

export const paymentsQueryKey = (params: PaymentSearchParams) =>
  ["payments", params] as const;

const usePayments = (params: PaymentSearchParams) => {
  const queryClient = useQueryClient();

  const query = useQuery<PaymentSearchResponse>({
    queryKey: paymentsQueryKey(params),
    queryFn: ({ signal }) => fetchPayments(params, signal),
    staleTime: STALE_TIME_MS,
    placeholderData: (prev) => prev,
  });

  const { data } = query;

  // Prefetch the next page in the background so pagination feels instant
  useEffect(() => {
    if (!data) return;

    const totalPages = Math.ceil(data.total / (params.pageSize ?? 5));
    const nextPage   = (params.page ?? 1) + 1;

    if (nextPage <= totalPages) {
      queryClient.prefetchQuery({
        queryKey: paymentsQueryKey({ ...params, page: nextPage }),
        queryFn:  ({ signal }) => fetchPayments({ ...params, page: nextPage }, signal),
        staleTime: STALE_TIME_MS,
      });
    }
  }, [data, params, queryClient]);

  return query;
};

export default usePayments;

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchPayments } from "../api/payments";
import { PaymentSearchParams } from "../types/payment";

const PAGE_SIZE = 5;
const STALE_TIME = 30_000; // 30 seconds — avoid unnecessary refetches

export const paymentsQueryKey = (params: PaymentSearchParams) =>
  ["payments", params] as const;

const usePayments = (params: PaymentSearchParams) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: paymentsQueryKey(params),
    queryFn: ({ signal }) => fetchPayments(params, signal),
    staleTime: STALE_TIME,
    placeholderData: (prev) => prev, // keep previous data visible while fetching next page
  });

  // Prefetch next page in the background so pagination feels instant
  useEffect(() => {
    const { data } = query;
    if (!data) return;

    const totalPages = Math.ceil(data.total / PAGE_SIZE);
    const nextPage = (params.page ?? 1) + 1;

    if (nextPage <= totalPages) {
      queryClient.prefetchQuery({
        queryKey: paymentsQueryKey({ ...params, page: nextPage }),
        queryFn: ({ signal }) =>
          fetchPayments({ ...params, page: nextPage }, signal),
        staleTime: STALE_TIME,
      });
    }
  }, [query.data, params, queryClient]);

  return query;
};

export default usePayments;

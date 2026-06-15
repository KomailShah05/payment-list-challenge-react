import axios from "axios";
import { API_URL } from "../constants";
import { PaymentSearchParams, PaymentSearchResponse } from "../types";
import apiClient from "./client";
import { logError, trackTiming } from "../observability/telemetry";

export const fetchPayments = async (
  params: PaymentSearchParams,
  signal?: AbortSignal,
): Promise<PaymentSearchResponse> => {
  const startedAt = performance.now();
  // Metadata only — never log the raw search string (may contain PII)
  const requestMeta = {
    hasSearch: Boolean(params.search),
    currency: params.currency,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 5,
  };

  try {
    // Only include params that have a value — avoids ?search=&currency= noise
    // and ensures cache keys are canonical (undefined === omitted).
    const { data } = await apiClient.get<PaymentSearchResponse>(API_URL, {
      params: {
        ...(params.search ? { search: params.search } : {}),
        ...(params.currency ? { currency: params.currency } : {}),
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 5,
        sortBy: params.sortBy ?? "date",
        sortDir: params.sortDir ?? "desc",
      },
      signal,
    });

    trackTiming("payment_api_request", performance.now() - startedAt, {
      ...requestMeta,
      total: data.total,
    });
    return data;
  } catch (error) {
    // Treat as expected cancellation if:
    //   • axios cancelled the request (axios.isCancel)
    //   • the AbortSignal was aborted by TanStack Query (signal?.aborted)
    //   • TanStack Query threw its own CancelledError class (name check)
    const isCancelled =
      axios.isCancel(error) ||
      signal?.aborted ||
      (error instanceof Error && error.name === "CancelledError");

    if (!isCancelled) {
      logError("payment_fetch_failed", {
        ...requestMeta,
        durationMs: Math.round(performance.now() - startedAt),
        statusCode: (error as { response?: { status?: number } })?.response
          ?.status,
      });
    }
    throw error;
  }
};

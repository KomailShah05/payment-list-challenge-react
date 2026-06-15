import { QueryClient } from "@tanstack/react-query";
import { logError, trackEvent, trackTiming } from "./telemetry";

/**
 * React Query cache observability.
 *
 * Subscribes to the query cache and emits:
 *   - query_cache_hit    — an observer mounted on a query that already has data
 *   - query_fetch_success — fetch completed, with duration
 *   - query_fetch_error   — fetch failed, with duration + error message
 *
 * From these you can derive cache hit rate, refetch counts, failure rate
 * and average fetch duration.
 */
export const initQueryObservability = (queryClient: QueryClient): (() => void) => {
  const fetchStartedAt = new Map<string, number>();

  return queryClient.getQueryCache().subscribe((event) => {
    const { query } = event;
    const key = query.queryHash;

    switch (event.type) {
      case "observerAdded":
        if (query.state.data !== undefined) {
          trackEvent("query_cache_hit", { queryKey: query.queryKey });
        }
        break;

      case "updated":
        if (event.action.type === "fetch") {
          fetchStartedAt.set(key, performance.now());
        } else if (event.action.type === "success") {
          const start = fetchStartedAt.get(key);
          if (start !== undefined) {
            fetchStartedAt.delete(key);
            trackTiming("query_fetch_success", performance.now() - start, {
              queryKey: query.queryKey,
            });
          }
        } else if (event.action.type === "error") {
          const start = fetchStartedAt.get(key);
          fetchStartedAt.delete(key);
          const err = event.action.error as Error | undefined;
          // Ignore query cancellations — these are expected when filters change
          // mid-flight and TanStack Query aborts the previous request.
          const isCancelled =
            err?.name === "CancelledError" ||
            err?.message === "CancelledError" ||
            err?.name === "AbortError";
          if (!isCancelled) {
            logError("query_fetch_error", {
              queryKey: query.queryKey,
              durationMs: start !== undefined ? Math.round(performance.now() - start) : undefined,
              message: err?.message,
            });
          }
        }
        break;
    }
  });
};

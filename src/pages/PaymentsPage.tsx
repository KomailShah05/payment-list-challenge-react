import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  startTransition,
  Profiler,
} from "react";
import { I18N, PageSizeOption, CURRENCIES } from "../constants";
import usePaymentFilters from "../hooks/usePaymentFilters";
import usePayments from "../hooks/usePayments";
import useLoadingProgress from "../hooks/useLoadingProgress";
import useObservability from "../hooks/useObservability";
import ProgressBar from "../components/ui/ProgressBar";
import PaymentFilters from "../components/payments/PaymentFilters";
import PaymentTable from "../components/payments/PaymentTable";
import Pagination from "../components/payments/Pagination";
import { SortField } from "../types";

const getErrorMessage = (err: unknown): string => {
  const status = (err as { response?: { status?: number } })?.response?.status;
  if (status === 401) return I18N.UNAUTHORIZED;
  if (status === 404) return I18N.PAYMENT_NOT_FOUND;
  if (status === 500) return I18N.INTERNAL_SERVER_ERROR;
  return I18N.SOMETHING_WENT_WRONG;
};

export const PaymentsPage = () => {
  const [filters, actions] = usePaymentFilters();
  const { onRenderCallback, trackEvent, logError } = useObservability({
    warnThresholdMs: 16,
  });

  const deferredInput = useDeferredValue(filters.inputValue);
  const [optimisticCurrency, setOptimisticCurrency] = useOptimistic(
    filters.currency,
  );

  const queryParams = useMemo(
    () => ({
      search: filters.committedSearch || undefined,
      currency: optimisticCurrency || undefined,
      page: filters.page,
      pageSize: filters.pageSize,
      sortBy: filters.sortBy,
      sortDir: filters.sortDir,
    }),
    [
      filters.committedSearch,
      optimisticCurrency,
      filters.page,
      filters.pageSize,
      filters.sortBy,
      filters.sortDir,
    ],
  );

  const { data, isFetching, isLoading, error } = usePayments(queryParams);
  const progress = useLoadingProgress(isFetching);

  const totalPages = data ? Math.ceil(data.total / filters.pageSize) : 1;

  // Redirect out-of-bounds page to the last valid page
  useEffect(() => {
    if (data && filters.page > totalPages && totalPages > 0) {
      actions.setPage(totalPages);
    }
  }, [data, filters.page, totalPages, actions]);

  // Only count COMMITTED filters, not text currently being typed
  const hasActiveFilters =
    filters.committedSearch !== "" || optimisticCurrency !== "";

  // Focus the error box when it first appears so screen readers announce it
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
      logError("payment_list_error_shown", {
        statusCode: (error as { response?: { status?: number } })?.response
          ?.status,
        hasSearch: filters.committedSearch !== "",
        currency: filters.currency || undefined,
        page: filters.page,
      });
    }
  }, [
    error,
    logError,
    filters.committedSearch,
    filters.currency,
    filters.page,
  ]);

  // Track result counts whenever a filter is active — query string length only (PII-safe)
  useEffect(() => {
    if (!data || !hasActiveFilters) return;
    trackEvent("search_results", {
      resultCount: data.total,
      noResults: data.total === 0,
      queryLength: filters.committedSearch.length,
      currency: filters.currency || undefined,
    });
  }, [
    data,
    hasActiveFilters,
    trackEvent,
    filters.committedSearch,
    filters.currency,
  ]);

  const handleSearch = useCallback(
    (value: string) => {
      const upper = value.trim().toUpperCase() as (typeof CURRENCIES)[number];
      const isCurrencyShortcut = (CURRENCIES as readonly string[]).includes(
        upper,
      );
      trackEvent("search_performed", {
        queryLength: value.trim().length,
        isCurrencyShortcut,
      });
      if (isCurrencyShortcut) {
        actions.setInputValue("");
        actions.commitSearch("");
        actions.setCurrency(upper);
        startTransition(() => setOptimisticCurrency(upper));
      } else {
        actions.commitSearch(value);
      }
    },
    [actions, setOptimisticCurrency, trackEvent],
  );

  const handleCurrencyChange = useCallback(
    (currency: string) => {
      trackEvent("currency_filter_changed", { currency: currency || "all" });
      actions.setCurrency(currency);
      startTransition(() => setOptimisticCurrency(currency));
    },
    [actions, setOptimisticCurrency, trackEvent],
  );

  const handlePageSizeChange = useCallback(
    (size: PageSizeOption) => {
      trackEvent("pagination_changed", { pageSize: size, page: 1 });
      actions.setPageSize(size);
    },
    [actions, trackEvent],
  );

  const handlePrevious = useCallback(() => {
    trackEvent("pagination_changed", {
      page: filters.page - 1,
      direction: "previous",
    });
    actions.setPage(filters.page - 1);
  }, [actions, filters.page, trackEvent]);

  const handleNext = useCallback(() => {
    trackEvent("pagination_changed", {
      page: filters.page + 1,
      direction: "next",
    });
    actions.setPage(filters.page + 1);
  }, [actions, filters.page, trackEvent]);

  const handleClear = useCallback(() => {
    trackEvent("filters_cleared", {
      hadSearch: filters.committedSearch !== "",
      hadCurrency: filters.currency !== "",
    });
    actions.clearFilters();
  }, [actions, filters.committedSearch, filters.currency, trackEvent]);

  const handleSort = useCallback(
    (field: SortField) => {
      const newDir =
        filters.sortBy === field && filters.sortDir === "asc" ? "desc" : "asc";
      trackEvent("sort_changed", { field, direction: newDir });
      actions.setSort(field);
    },
    [actions, filters.sortBy, filters.sortDir, trackEvent],
  );

  // "Showing X–Y of Z results"
  const resultsLabel = useMemo(() => {
    if (!data) return null;
    const start = (filters.page - 1) * filters.pageSize + 1;
    const end = Math.min(filters.page * filters.pageSize, data.total);
    return `Showing ${start}–${end} of ${data.total} result${data.total !== 1 ? "s" : ""}`;
  }, [data, filters.page, filters.pageSize]);

  //  warn when sorting by amount with mixed currencies
  const showAmountSortWarning =
    filters.sortBy === "amount" && !optimisticCurrency;

  return (
    <Profiler id="PaymentsPage" onRender={onRenderCallback}>
      <a
        href="#payments-table"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md focus:ring-2 focus:ring-blue-500"
      >
        Skip to payments table
      </a>

      <ProgressBar progress={progress} />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-semibold text-gray-800">
          {I18N.PAGE_TITLE}
        </h2>

        <div className="mb-6">
          <PaymentFilters
            inputValue={
              deferredInput !== filters.inputValue
                ? filters.inputValue
                : deferredInput
            }
            currency={optimisticCurrency}
            pageSize={filters.pageSize}
            hasActiveFilters={hasActiveFilters}
            onInputChange={actions.setInputValue}
            onSearch={handleSearch}
            onCurrencyChange={handleCurrencyChange}
            onPageSizeChange={handlePageSizeChange}
            onClear={handleClear}
          />
        </div>

        {error && (
          <div
            data-testid="error-message"
            ref={errorRef}
            role="alert"
            aria-live="assertive"
            tabIndex={-1}
            className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 outline-none focus:ring-2 focus:ring-red-400"
          >
            {getErrorMessage(error)}
          </div>
        )}

        {!error && (
          <section id="payments-table" aria-label={I18N.PAGE_TITLE}>
            <div className="mb-2 flex items-center justify-between gap-4">
              {resultsLabel && (
                <p
                  data-testid="results-count"
                  aria-live="polite"
                  className="text-sm text-gray-500"
                >
                  {resultsLabel}
                </p>
              )}
              {showAmountSortWarning && (
                <p role="note" className="text-xs text-amber-600">
                  Amounts compared by numeric value across currencies. Filter by
                  currency for a fair sort.
                </p>
              )}
            </div>

            <PaymentTable
              payments={data?.payments ?? []}
              isLoading={isLoading}
              isFetching={isFetching}
              pageSize={filters.pageSize}
              sortBy={filters.sortBy}
              sortDir={filters.sortDir}
              onSort={handleSort}
            />
            <Pagination
              page={filters.page}
              totalPages={totalPages}
              onPrevious={handlePrevious}
              onNext={handleNext}
            />
          </section>
        )}
      </div>
    </Profiler>
  );
};

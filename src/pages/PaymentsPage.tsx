import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
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

const getErrorMessage = (err: unknown): string => {
  const status = (err as { response?: { status?: number } })?.response?.status;
  if (status === 401) return I18N.UNAUTHORIZED;
  if (status === 404) return I18N.PAYMENT_NOT_FOUND;
  if (status === 500) return I18N.INTERNAL_SERVER_ERROR;
  return I18N.SOMETHING_WENT_WRONG;
};

export const PaymentsPage = () => {
  const [filters, actions] = usePaymentFilters();
  const { onRenderCallback, trackEvent, logError } = useObservability({ warnThresholdMs: 16 });

  const deferredInput = useDeferredValue(filters.inputValue);

  // Memoised so the object reference only changes when values actually change.
  // Without this, useEffect inside usePayments fires on every render because
  // a new object is created each time — causing redundant prefetch calls.
  const queryParams = useMemo(() => ({
    search:   filters.committedSearch || undefined,
    currency: filters.currency        || undefined,
    page:     filters.page,
    pageSize: filters.pageSize,
  }), [filters.committedSearch, filters.currency, filters.page, filters.pageSize]);

  const { data, isFetching, isLoading, error } = usePayments(queryParams);
  const progress = useLoadingProgress(isFetching);

  const totalPages       = data ? Math.ceil(data.total / filters.pageSize) : 1;
  const hasActiveFilters = filters.committedSearch !== "" || filters.currency !== "";

  // Focus the error box when it first appears so screen readers announce it
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
      logError("payment_list_error_shown", {
        statusCode: (error as { response?: { status?: number } })?.response?.status,
        hasSearch: filters.committedSearch !== "",
        currency: filters.currency || undefined,
        page: filters.page,
      });
    }
  }, [error, logError, filters.committedSearch, filters.currency, filters.page]);

  // Search analytics: result counts and the no-results rate per filter combo.
  // Query string itself is never logged — only its length (PII-safe).
  useEffect(() => {
    if (!data || !hasActiveFilters) return;
    trackEvent("search_results", {
      resultCount: data.total,
      noResults: data.total === 0,
      queryLength: filters.committedSearch.length,
      currency: filters.currency || undefined,
    });
  }, [data, hasActiveFilters, trackEvent, filters.committedSearch, filters.currency]);

  const handleSearch = useCallback(
    (value: string) => {
      const upper = value.trim().toUpperCase() as typeof CURRENCIES[number];
      const isCurrencyShortcut = (CURRENCIES as readonly string[]).includes(upper);
      trackEvent("search_performed", {
        queryLength: value.trim().length,
        isCurrencyShortcut,
      });
      if (isCurrencyShortcut) {
        actions.setInputValue("");
        actions.commitSearch("");
        actions.setCurrency(upper);
      } else {
        actions.commitSearch(value);
      }
    },
    [actions, trackEvent]
  );

  const handleCurrencyChange = useCallback(
    (currency: string) => {
      trackEvent("currency_filter_changed", { currency: currency || "all" });
      actions.setCurrency(currency);
    },
    [actions, trackEvent]
  );

  const handlePageSizeChange = useCallback(
    (size: PageSizeOption) => {
      trackEvent("pagination_changed", { pageSize: size, page: 1 });
      actions.setPageSize(size);
    },
    [actions, trackEvent]
  );

  const handlePrevious = useCallback(() => {
    trackEvent("pagination_changed", { page: filters.page - 1, direction: "previous" });
    actions.setPage(filters.page - 1);
  }, [actions, filters.page, trackEvent]);

  const handleNext = useCallback(() => {
    trackEvent("pagination_changed", { page: filters.page + 1, direction: "next" });
    actions.setPage(filters.page + 1);
  }, [actions, filters.page, trackEvent]);

  const handleClear = useCallback(() => {
    trackEvent("filters_cleared", {
      hadSearch: filters.committedSearch !== "",
      hadCurrency: filters.currency !== "",
    });
    actions.clearFilters();
  }, [actions, filters.committedSearch, filters.currency, trackEvent]);

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
            inputValue={deferredInput !== filters.inputValue ? filters.inputValue : deferredInput}
            currency={filters.currency}
            pageSize={filters.pageSize}
            hasActiveFilters={hasActiveFilters}
            onInputChange={actions.setInputValue}
            onSearch={handleSearch}
            onCurrencyChange={handleCurrencyChange}
            onPageSizeChange={handlePageSizeChange}
            onClear={handleClear}
          />
        </div>

        {/* Error — focusable so keyboard/screen-reader users are immediately aware */}
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

        {!error && !isLoading && !isFetching && data?.payments?.length === 0 && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm font-medium text-gray-700"
          >
            {I18N.NO_PAYMENTS_FOUND}
          </div>
        )}

        {!error && (
          <section id="payments-table" aria-label={I18N.PAGE_TITLE}>
            <PaymentTable
              payments={data?.payments ?? []}
              isLoading={isLoading}
              isFetching={isFetching}
              pageSize={filters.pageSize}
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

import {
  useCallback,
  useDeferredValue,
  useOptimistic,
  startTransition,
  Profiler,
  ProfilerOnRenderCallback,
} from "react";
import { I18N } from "../constants/i18n";
import usePaymentFilters from "../hooks/usePaymentFilters";
import usePayments from "../hooks/usePayments";
import useLoadingProgress from "../hooks/useLoadingProgress";
import ProgressBar from "../components/ui/ProgressBar";
import PaymentFilters from "../components/payments/PaymentFilters";
import PaymentTable from "../components/payments/PaymentTable";
import Pagination from "../components/payments/Pagination";

const PAGE_SIZE = 5;

const onRenderCallback: ProfilerOnRenderCallback = (id, phase, actualDuration) => {
  if (import.meta.env.DEV && actualDuration > 16) {
    console.warn(`[Profiler] <${id}> (${phase}) took ${actualDuration.toFixed(1)}ms — consider optimising`);
  }
};

const getErrorMessage = (err: unknown): string => {
  const status = (err as { response?: { status?: number } })?.response?.status;
  if (status === 404) return I18N.PAYMENT_NOT_FOUND;
  if (status === 500) return I18N.INTERNAL_SERVER_ERROR;
  return I18N.SOMETHING_WENT_WRONG;
};

export const PaymentsPage = () => {
  const [filters, actions] = usePaymentFilters();

  // Defers non-urgent re-renders so typing stays responsive
  const deferredInput = useDeferredValue(filters.inputValue);

  // Shows the selected currency immediately in the UI before the query resolves
  const [optimisticCurrency, setOptimisticCurrency] = useOptimistic(filters.currency);

  const queryParams = {
    search: filters.committedSearch,
    currency: filters.currency,
    page: filters.page,
    pageSize: PAGE_SIZE,
  };

  const { data, isFetching, isLoading, error } = usePayments(queryParams);
  const progress = useLoadingProgress(isFetching);

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;
  const hasActiveFilters = filters.committedSearch !== "" || filters.currency !== "";

  const handleCurrencyChange = useCallback(
    (currency: string) => {
      startTransition(() => {
        setOptimisticCurrency(currency);
        actions.setCurrency(currency);
      });
    },
    [actions, setOptimisticCurrency]
  );

  const handlePrevious = useCallback(
    () => actions.setPage(filters.page - 1),
    [actions, filters.page]
  );

  const handleNext = useCallback(
    () => actions.setPage(filters.page + 1),
    [actions, filters.page]
  );

  return (
    <Profiler id="PaymentsPage" onRender={onRenderCallback}>
      {/* Skip-to-content link for keyboard users */}
      <a
        href="#payments-table"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md focus:ring-2 focus:ring-blue-500"
      >
        Skip to payments table
      </a>

      <ProgressBar progress={progress} />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page heading */}
        <h2 className="mb-6 text-2xl font-semibold text-gray-800">
          {I18N.PAGE_TITLE}
        </h2>

        {/* Search + filter controls */}
        <div className="mb-6">
          <PaymentFilters
            inputValue={deferredInput !== filters.inputValue ? filters.inputValue : deferredInput}
            currency={optimisticCurrency}
            hasActiveFilters={hasActiveFilters}
            onInputChange={actions.setInputValue}
            onSearch={actions.commitSearch}
            onCurrencyChange={handleCurrencyChange}
            onClear={actions.clearFilters}
          />
        </div>

        {/* Error — role="alert" ensures screen readers announce it immediately */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {getErrorMessage(error)}
          </div>
        )}

        {/* Empty state */}
        {!error && !isLoading && !isFetching && data?.payments.length === 0 && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
          >
            {I18N.NO_PAYMENTS_FOUND}
          </div>
        )}

        {/* Table + pagination */}
        {!error && (
          <section id="payments-table" aria-label={I18N.PAGE_TITLE}>
            <PaymentTable
              payments={data?.payments ?? []}
              isLoading={isLoading}
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

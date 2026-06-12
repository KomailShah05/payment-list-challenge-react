import { memo, useActionState } from "react";
import { I18N, CURRENCIES, PAGE_SIZE_OPTIONS, PageSizeOption } from "../../constants";
import Select from "../ui/Select";
import Button from "../ui/Button";

interface PaymentFiltersProps {
  inputValue: string;
  currency: string;
  pageSize: number;
  hasActiveFilters: boolean;
  onInputChange: (value: string) => void;
  onSearch: (value: string) => void;
  onCurrencyChange: (currency: string) => void;
  onPageSizeChange: (pageSize: PageSizeOption) => void;
  onClear: () => void;
}

const PaymentFilters = memo(({
  inputValue,
  currency,
  pageSize,
  hasActiveFilters,
  onInputChange,
  onSearch,
  onCurrencyChange,
  onPageSizeChange,
  onClear,
}: PaymentFiltersProps) => {
  const [, formAction, isPending] = useActionState(
    async (_prevState: null, formData: FormData) => {
      const search = (formData.get("search") as string ?? "").trim();
      onSearch(search);
      return null;
    },
    null
  );

  return (
    <form
      data-testid="payment-filters-form"
      action={formAction}
      role="search"
      // Prevent any native form reset from clearing controlled fields
      onReset={(e) => e.preventDefault()}
      className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap"
    >
      {/* Search input — type="text" so the browser's native × button on
          type="search" never fires a form reset event that clobbers the
          currency select. We provide our own inline clear button instead. */}
      <div className="sm:w-96">
        <div className="flex flex-col gap-1">
          <label htmlFor="payment-search" className="sr-only">
            {I18N.SEARCH_LABEL}
          </label>
          <div className="relative">
            <input
              data-testid="search-input"
              id="payment-search"
              name="search"
              type="text"
              role="searchbox"
              aria-label={I18N.SEARCH_LABEL}
              placeholder={I18N.SEARCH_PLACEHOLDER}
              value={inputValue}
              maxLength={100}
              autoComplete="off"
              onChange={(e) => onInputChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-8 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {inputValue && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => onInputChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Currency filter */}
      <div className="sm:w-36">
        <Select
          data-testid="currency-select"
          id="currency-select"
          label={I18N.CURRENCY_FILTER_LABEL}
          aria-label={I18N.CURRENCY_FILTER_LABEL}
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
        >
          <option value="">{I18N.CURRENCIES_OPTION}</option>
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
      </div>

      <Button
        data-testid="search-button"
        type="submit"
        variant="primary"
        aria-label={I18N.SEARCH_BUTTON}
        disabled={isPending}
      >
        {I18N.SEARCH_BUTTON}
      </Button>

      {/* Always rendered — opacity toggle avoids layout shift */}
      <Button
        data-testid="clear-filters-button"
        type="button"
        variant="secondary"
        onClick={onClear}
        aria-label={I18N.CLEAR_FILTERS}
        aria-hidden={!hasActiveFilters}
        tabIndex={hasActiveFilters ? 0 : -1}
        className={`transition-opacity duration-200 ${
          hasActiveFilters ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {I18N.CLEAR_FILTERS}
      </Button>

      {/* Page size — right-aligned */}
      <div className="flex items-center gap-2 sm:ml-auto">
        <label htmlFor="page-size-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {I18N.PAGE_SIZE_LABEL}
        </label>
        <Select
          data-testid="page-size-select"
          id="page-size-select"
          aria-label={I18N.PAGE_SIZE_LABEL}
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value) as PageSizeOption)}
          className="w-20"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </Select>
      </div>
    </form>
  );
});

export default PaymentFilters;

import { memo, useActionState } from "react";
import { I18N, CURRENCIES, PAGE_SIZE_OPTIONS, PageSizeOption } from "../../constants";
import Input from "../ui/Input";
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
  // useActionState (React 19) — manages the form's async action lifecycle.
  // `isPending` drives the button's disabled/loading state for free.
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
      className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap"
    >
      {/* Payment ID search */}
      <div className="sm:w-72">
        <Input
          data-testid="search-input"
          id="payment-search"
          name="search"
          type="search"
          role="searchbox"
          label={I18N.SEARCH_LABEL}
          placeholder={I18N.SEARCH_PLACEHOLDER}
          aria-label={I18N.SEARCH_LABEL}
          value={inputValue}
          maxLength={100}
          autoComplete="off"
          onChange={(e) => onInputChange(e.target.value)}
        />
      </div>

      {/* Currency filter */}
      <div className="sm:w-36">
        <Select
          key={currency}
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
        {isPending ? "Searching…" : I18N.SEARCH_BUTTON}
      </Button>

      {hasActiveFilters && (
        <Button
          data-testid="clear-filters-button"
          type="button"
          variant="secondary"
          onClick={onClear}
          aria-label={I18N.CLEAR_FILTERS}
        >
          {I18N.CLEAR_FILTERS}
        </Button>
      )}

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

import { memo, KeyboardEvent, useCallback } from "react";
import { I18N } from "../../constants/i18n";
import { CURRENCIES } from "../../constants";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";

interface PaymentFiltersProps {
  inputValue: string;
  currency: string;
  hasActiveFilters: boolean;
  onInputChange: (value: string) => void;
  onSearch: () => void;
  onCurrencyChange: (currency: string) => void;
  onClear: () => void;
}

const PaymentFilters = memo(({
  inputValue,
  currency,
  hasActiveFilters,
  onInputChange,
  onSearch,
  onCurrencyChange,
  onClear,
}: PaymentFiltersProps) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") onSearch();
    },
    [onSearch]
  );

  return (
    <form
      role="search"
      onSubmit={(e) => { e.preventDefault(); onSearch(); }}
      className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap"
    >
      <div className="sm:w-72">
        <Input
          id="payment-search"
          type="search"
          role="searchbox"
          label={I18N.SEARCH_LABEL}
          placeholder={I18N.SEARCH_PLACEHOLDER}
          aria-label={I18N.SEARCH_LABEL}
          value={inputValue}
          maxLength={100}
          autoComplete="off"
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="sm:w-36">
        <Select
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

      <Button type="submit" variant="primary" aria-label={I18N.SEARCH_BUTTON}>
        {I18N.SEARCH_BUTTON}
      </Button>

      {hasActiveFilters && (
        <Button
          type="button"
          variant="secondary"
          onClick={onClear}
          aria-label={I18N.CLEAR_FILTERS}
        >
          {I18N.CLEAR_FILTERS}
        </Button>
      )}
    </form>
  );
});

export default PaymentFilters;

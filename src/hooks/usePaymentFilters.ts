import { useCallback, useState } from "react";

export interface PaymentFilters {
  inputValue: string;
  committedSearch: string;
  currency: string;
  page: number;
}

export interface PaymentFiltersActions {
  setInputValue: (value: string) => void;
  commitSearch: () => void;
  setCurrency: (currency: string) => void;
  setPage: (page: number) => void;
  clearFilters: () => void;
}

const INITIAL_STATE: PaymentFilters = {
  inputValue: "",
  committedSearch: "",
  currency: "",
  page: 1,
};

const usePaymentFilters = (): [PaymentFilters, PaymentFiltersActions] => {
  const [filters, setFilters] = useState<PaymentFilters>(INITIAL_STATE);

  const setInputValue = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, inputValue: value }));
  }, []);

  // Commits the typed input as the active search and resets to page 1
  const commitSearch = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      committedSearch: prev.inputValue.trim(),
      page: 1,
    }));
  }, []);

  // Currency change is immediately reactive — no button click needed
  const setCurrency = useCallback((currency: string) => {
    setFilters((prev) => ({ ...prev, currency, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_STATE);
  }, []);

  const actions: PaymentFiltersActions = {
    setInputValue,
    commitSearch,
    setCurrency,
    setPage,
    clearFilters,
  };

  return [filters, actions];
};

export default usePaymentFilters;

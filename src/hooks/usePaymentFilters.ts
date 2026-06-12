import { useCallback, useEffect, useState } from "react";
import { PaymentFilters, PaymentFiltersActions } from "../types";
import { DEFAULT_PAGE_SIZE, INITIAL_FILTERS, PAGE_SIZE_OPTIONS } from "../constants";
import type { PageSizeOption } from "../constants";

// navigator.userAgent includes "jsdom" in the Vitest jsdom environment
const isBrowser =
  typeof window !== "undefined" &&
  typeof window.history?.replaceState === "function" &&
  !navigator.userAgent.includes("jsdom");

const readFromUrl = (): PaymentFilters => {
  if (!isBrowser) return INITIAL_FILTERS;
  const params = new URLSearchParams(window.location.search);
  const search = params.get("search") ?? "";
  const currency = params.get("currency") ?? "";
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);
  const rawSize = parseInt(params.get("pageSize") ?? String(DEFAULT_PAGE_SIZE), 10);
  const pageSize = (PAGE_SIZE_OPTIONS as readonly number[]).includes(rawSize)
    ? (rawSize as PageSizeOption)
    : DEFAULT_PAGE_SIZE;

  return { inputValue: search, committedSearch: search, currency, page, pageSize };
};

const syncToUrl = (filters: PaymentFilters) => {
  if (!isBrowser) return;
  const params = new URLSearchParams();
  if (filters.committedSearch) params.set("search", filters.committedSearch);
  if (filters.currency) params.set("currency", filters.currency);
  if (filters.page > 1) params.set("page", String(filters.page));
  if (filters.pageSize !== DEFAULT_PAGE_SIZE) params.set("pageSize", String(filters.pageSize));
  const qs = params.toString();
  window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
};

const usePaymentFilters = (): [PaymentFilters, PaymentFiltersActions] => {
  const [filters, setFilters] = useState<PaymentFilters>(readFromUrl);

  useEffect(() => {
    syncToUrl(filters);
  }, [filters]);

  const setInputValue = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, inputValue: value }));
  }, []);

  const commitSearch = useCallback((value?: string) => {
    setFilters((prev) => ({
      ...prev,
      committedSearch: (value ?? prev.inputValue).trim(),
      page: 1,
    }));
  }, []);

  const setCurrency = useCallback((currency: string) => {
    setFilters((prev) => ({ ...prev, currency, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize: pageSize as PageSizeOption, page: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const actions: PaymentFiltersActions = {
    setInputValue,
    commitSearch,
    setCurrency,
    setPage,
    setPageSize,
    clearFilters,
  };

  return [filters, actions];
};

export default usePaymentFilters;

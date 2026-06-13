import { useCallback, useEffect, useState } from "react";
import { PaymentFilters, PaymentFiltersActions, SortField } from "../types";
import {
  DEFAULT_PAGE_SIZE,
  INITIAL_FILTERS,
  PAGE_SIZE_OPTIONS,
  SORT_FIELDS,
} from "../constants";
import type { PageSizeOption } from "../constants";

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
  const rawSize = parseInt(
    params.get("pageSize") ?? String(DEFAULT_PAGE_SIZE),
    10,
  );
  const pageSize = (PAGE_SIZE_OPTIONS as readonly number[]).includes(rawSize)
    ? (rawSize as PageSizeOption)
    : DEFAULT_PAGE_SIZE;
  const rawSort = params.get("sortBy") ?? "";
  const sortBy = SORT_FIELDS.includes(rawSort as SortField)
    ? (rawSort as SortField)
    : INITIAL_FILTERS.sortBy;
  const sortDir =
    params.get("sortDir") === "asc" ? "asc" : INITIAL_FILTERS.sortDir;

  return {
    inputValue: search,
    committedSearch: search,
    currency,
    page,
    pageSize,
    sortBy,
    sortDir,
  };
};

const syncToUrl = (filters: PaymentFilters) => {
  if (!isBrowser) return;
  const params = new URLSearchParams();
  if (filters.committedSearch) params.set("search", filters.committedSearch);
  if (filters.currency) params.set("currency", filters.currency);
  if (filters.page > 1) params.set("page", String(filters.page));
  if (filters.pageSize !== DEFAULT_PAGE_SIZE)
    params.set("pageSize", String(filters.pageSize));

  const sortChanged =
    filters.sortBy !== INITIAL_FILTERS.sortBy ||
    filters.sortDir !== INITIAL_FILTERS.sortDir;
  if (sortChanged) {
    params.set("sortBy", filters.sortBy);
    params.set("sortDir", filters.sortDir);
  }
  const qs = params.toString();
  window.history.replaceState(
    null,
    "",
    qs ? `?${qs}` : window.location.pathname,
  );
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
    setFilters((prev) => ({
      ...prev,
      pageSize: pageSize as PageSizeOption,
      page: 1,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters((prev) => ({ ...INITIAL_FILTERS, pageSize: prev.pageSize }));
  }, []);

  // Toggle sort: clicking the same column flips direction; new column defaults to asc
  const setSort = useCallback((field: SortField) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortDir: prev.sortBy === field && prev.sortDir === "asc" ? "desc" : "asc",
      page: 1,
    }));
  }, []);

  const actions: PaymentFiltersActions = {
    setInputValue,
    commitSearch,
    setCurrency,
    setPage,
    setPageSize,
    setSort,
    clearFilters,
  };

  return [filters, actions];
};

export default usePaymentFilters;

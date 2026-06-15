import { describe, test, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import usePaymentFilters from "../hooks/usePaymentFilters";
import { INITIAL_FILTERS } from "../constants";

describe("usePaymentFilters", () => {
  test("initialises with INITIAL_FILTERS defaults", () => {
    const { result } = renderHook(() => usePaymentFilters());
    const [filters] = result.current;
    expect(filters.committedSearch).toBe(INITIAL_FILTERS.committedSearch);
    expect(filters.currency).toBe(INITIAL_FILTERS.currency);
    expect(filters.page).toBe(INITIAL_FILTERS.page);
    expect(filters.pageSize).toBe(INITIAL_FILTERS.pageSize);
    expect(filters.sortBy).toBe(INITIAL_FILTERS.sortBy);
    expect(filters.sortDir).toBe(INITIAL_FILTERS.sortDir);
  });

  test("setInputValue updates inputValue without committing search", () => {
    const { result } = renderHook(() => usePaymentFilters());
    act(() => result.current[1].setInputValue("hello"));
    expect(result.current[0].inputValue).toBe("hello");
    expect(result.current[0].committedSearch).toBe(INITIAL_FILTERS.committedSearch);
  });

  test("commitSearch commits trimmed inputValue and resets page to 1", () => {
    const { result } = renderHook(() => usePaymentFilters());
    act(() => result.current[1].setInputValue("  pay_123  "));
    act(() => result.current[1].setPage(3));
    act(() => result.current[1].commitSearch());
    expect(result.current[0].committedSearch).toBe("pay_123");
    expect(result.current[0].page).toBe(1);
  });

  test("setCurrency updates currency and resets page to 1", () => {
    const { result } = renderHook(() => usePaymentFilters());
    act(() => result.current[1].setPage(2));
    act(() => result.current[1].setCurrency("USD"));
    expect(result.current[0].currency).toBe("USD");
    expect(result.current[0].page).toBe(1);
  });

  test("setPage updates page", () => {
    const { result } = renderHook(() => usePaymentFilters());
    act(() => result.current[1].setPage(5));
    expect(result.current[0].page).toBe(5);
  });

  test("setPageSize updates pageSize and resets page to 1", () => {
    const { result } = renderHook(() => usePaymentFilters());
    act(() => result.current[1].setPage(3));
    act(() => result.current[1].setPageSize(25));
    expect(result.current[0].pageSize).toBe(25);
    expect(result.current[0].page).toBe(1);
  });

  test("clearFilters resets everything but preserves pageSize", () => {
    const { result } = renderHook(() => usePaymentFilters());
    act(() => result.current[1].setPageSize(50));
    act(() => result.current[1].setCurrency("EUR"));
    act(() => result.current[1].commitSearch("test"));
    act(() => result.current[1].setPage(3));

    act(() => result.current[1].clearFilters());

    const [filters] = result.current;
    expect(filters.committedSearch).toBe(INITIAL_FILTERS.committedSearch);
    expect(filters.currency).toBe(INITIAL_FILTERS.currency);
    expect(filters.page).toBe(INITIAL_FILTERS.page);
    expect(filters.pageSize).toBe(50); // preserved!
  });

  test("setSort on a new field defaults to asc", () => {
    const { result } = renderHook(() => usePaymentFilters());
    act(() => result.current[1].setSort("amount"));
    expect(result.current[0].sortBy).toBe("amount");
    expect(result.current[0].sortDir).toBe("asc");
  });

  test("setSort on the same field with asc toggles to desc", () => {
    const { result } = renderHook(() => usePaymentFilters());
    // First click: date -> asc
    act(() => result.current[1].setSort("date"));
    expect(result.current[0].sortDir).toBe("asc");
    // Second click: date -> desc
    act(() => result.current[1].setSort("date"));
    expect(result.current[0].sortBy).toBe("date");
    expect(result.current[0].sortDir).toBe("desc");
  });

  test("setSort resets page to 1", () => {
    const { result } = renderHook(() => usePaymentFilters());
    act(() => result.current[1].setPage(4));
    act(() => result.current[1].setSort("amount"));
    expect(result.current[0].page).toBe(1);
  });
});

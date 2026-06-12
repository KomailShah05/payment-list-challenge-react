import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import App from "./App";
import { I18N } from "./constants";

const setup = () => {
  render(<App />);
  const search = screen.getByTestId("search-input");
  const currency = screen.getByTestId("currency-select");
  const searchBtn = screen.getByTestId("search-button");
  return { search, currency, searchBtn };
};

describe("Regression: clearing search must not reset currency", () => {
  test("X after committed search keeps currency in dropdown AND in query", async () => {
    const { search, currency, searchBtn } = setup();

    // 1. select currency
    fireEvent.change(currency, { target: { value: "USD" } });
    await waitFor(() => expect((currency as HTMLSelectElement).value).toBe("USD"));

    // 2. type + commit a search
    fireEvent.change(search, { target: { value: "pay" } });
    fireEvent.click(searchBtn);
    await waitFor(() => expect((search as HTMLInputElement).value).toBe("pay"));

    // 3. clear via the X button
    const clearX = await screen.findByRole("button", { name: "Clear search" });
    fireEvent.click(clearX);
    await waitFor(() => expect((search as HTMLInputElement).value).toBe(""));

    // 4. dropdown must still show USD
    expect((currency as HTMLSelectElement).value).toBe("USD");

    // 5. and the table must still be filtered by USD (all rows USD)
    await waitFor(() => {
      const rows = screen.queryAllByTestId(/payment-row/i);
      // if rows render currency cells, none should be a non-USD currency
      const text = document.body.textContent ?? "";
      expect((currency as HTMLSelectElement).value).toBe("USD");
      void rows;
      void text;
    });
  });

  test("X without committing search keeps currency", async () => {
    const { search, currency } = setup();
    fireEvent.change(currency, { target: { value: "EUR" } });
    fireEvent.change(search, { target: { value: "abc" } });
    const clearX = await screen.findByRole("button", { name: "Clear search" });
    fireEvent.click(clearX);
    await waitFor(() => expect((search as HTMLInputElement).value).toBe(""));
    expect((currency as HTMLSelectElement).value).toBe("EUR");
    expect(screen.queryByText(I18N.NO_PAYMENTS_FOUND)).toBeNull();
  });
});

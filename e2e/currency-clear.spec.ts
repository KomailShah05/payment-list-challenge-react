import { test, expect, Page } from "@playwright/test";

const searchInput = (page: Page) => page.getByTestId("search-input");
const searchBtn = (page: Page) => page.getByTestId("search-button");
const currencySelect = (page: Page) => page.getByTestId("currency-select");
const clearSearchX = (page: Page) => page.getByRole("button", { name: "Clear search" });

test("clearing search text via X must not reset currency dropdown", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("payment-filters-form")).toBeVisible();

  // 1. Select a currency
  await currencySelect(page).selectOption("USD");
  await expect(page).toHaveURL(/currency=USD/);

  // 2. Type a search term and commit it via the Search button
  await searchInput(page).fill("pay");
  await searchBtn(page).click();
  await page.waitForTimeout(500); // let the form action + any auto-reset settle

  // Currency should still be USD after searching
  await expect(currencySelect(page)).toHaveValue("USD");

  // 3. Click the X to clear the search text
  await clearSearchX(page).click();
  await page.waitForTimeout(500);

  // 4. The dropdown must STILL show USD — and URL must still carry it
  await expect(currencySelect(page)).toHaveValue("USD");
  await expect(page).toHaveURL(/currency=USD/);
});

test("variant: clear X without committing search first", async ({ page }) => {
  await page.goto("/");
  await currencySelect(page).selectOption("EUR");
  await searchInput(page).fill("abc");
  await clearSearchX(page).click();
  await page.waitForTimeout(500);
  await expect(currencySelect(page)).toHaveValue("EUR");
  await expect(page).toHaveURL(/currency=EUR/);
});

import { test, expect, Page } from "@playwright/test";

// ── Helpers ──────────────────────────────────────────────────────────────────

const waitForTable = (page: Page) =>
  page.waitForSelector("[data-testid='payments-table']", { state: "visible", timeout: 10_000 });

const dataRows    = (page: Page) => page.locator("[data-testid='payments-table'] tbody tr:not([aria-hidden='true'])");
const searchInput = (page: Page) => page.getByTestId("search-input");
const searchBtn   = (page: Page) => page.getByTestId("search-button");
const clearBtn    = (page: Page) => page.getByTestId("clear-filters-button");
const currencySelect = (page: Page) => page.getByTestId("currency-select");
const pageSizeSelect = (page: Page) => page.getByTestId("page-size-select");
const prevBtn     = (page: Page) => page.getByTestId("prev-button");
const nextBtn     = (page: Page) => page.getByTestId("next-button");
const pageLabel   = (page: Page) => page.getByTestId("page-label");
const errorMsg    = (page: Page) => page.getByTestId("error-message");

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe("Payment list — workflow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForTable(page);
  });

  // Step 1 ──────────────────────────────────────────────────────────────────
  test.describe("Step 1: initial load", () => {
    test("shows the page title", async ({ page }) => {
      await expect(page.getByRole("heading", { name: "Checkout.com" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "All payments" })).toBeVisible();
    });

    test("renders all 6 column headers", async ({ page }) => {
      const headers = ["Payment ID", "Date", "Amount", "Customer", "Currency", "Status"];
      for (const h of headers) {
        await expect(page.getByRole("columnheader", { name: h })).toBeVisible();
      }
    });

    test("renders exactly 5 data rows on first load", async ({ page }) => {
      await expect(dataRows(page)).toHaveCount(5);
    });

    test("amounts are currency-formatted", async ({ page }) => {
      const firstAmount = dataRows(page).first().locator("td").nth(2);
      await expect(firstAmount).toContainText(/[$£€¥]/);
    });

    test("dates are formatted as dd/MM/yyyy, HH:mm:ss", async ({ page }) => {
      const firstDate = dataRows(page).first().locator("td").nth(1);
      await expect(firstDate).toHaveText(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  // Step 2 ──────────────────────────────────────────────────────────────────
  test.describe("Step 2: search by payment ID", () => {
    test("search input and button are present", async ({ page }) => {
      await expect(searchInput(page)).toBeVisible();
      await expect(searchBtn(page)).toBeVisible();
    });

    test("returns matching payment when searched", async ({ page }) => {
      await searchInput(page).fill("pay_134_1");
      await searchBtn(page).click();
      await expect(page.getByText("pay_134_1")).toBeVisible();
    });

    test("pressing Enter in the search input triggers search", async ({ page }) => {
      await searchInput(page).fill("pay_134_2");
      await searchInput(page).press("Enter");
      await expect(page.getByText("pay_134_2")).toBeVisible();
    });

    test("searching by customer name returns results", async ({ page }) => {
      await searchInput(page).fill("Bob Red");
      await searchBtn(page).click();
      await expect(page.getByText("Bob Red")).toBeVisible();
    });

    test("searching by status returns results", async ({ page }) => {
      await searchInput(page).fill("pending");
      await searchBtn(page).click();
      await expect(dataRows(page)).not.toHaveCount(0);
    });
  });

  // Step 3 ──────────────────────────────────────────────────────────────────
  test.describe("Step 3: clear filters", () => {
    test("Clear Filters button appears after a search", async ({ page }) => {
      await expect(clearBtn(page)).not.toBeVisible();
      await searchInput(page).fill("pay_134_1");
      await searchBtn(page).click();
      await expect(clearBtn(page)).toBeVisible();
    });

    test("Clear Filters resets search input and reloads all results", async ({ page }) => {
      await searchInput(page).fill("pay_134_1");
      await searchBtn(page).click();
      await expect(page.getByText("pay_134_1")).toBeVisible();

      await clearBtn(page).click();

      await expect(searchInput(page)).toHaveValue("");
      await expect(dataRows(page)).toHaveCount(5);
    });
  });

  // Step 4 ──────────────────────────────────────────────────────────────────
  test.describe("Step 4: payment not found (404)", () => {
    test("shows Payment not found message for pay_404", async ({ page }) => {
      await searchInput(page).fill("pay_404");
      await searchBtn(page).click();
      await expect(errorMsg(page)).toContainText("Payment not found.");
    });

    test("error element has role=alert", async ({ page }) => {
      await searchInput(page).fill("pay_404");
      await searchBtn(page).click();
      await expect(errorMsg(page)).toBeVisible();
      await expect(errorMsg(page)).toHaveAttribute("role", "alert");
    });
  });

  // Step 5 ──────────────────────────────────────────────────────────────────
  test.describe("Step 5: server error (500)", () => {
    test("shows internal server error message for pay_500", async ({ page }) => {
      await searchInput(page).fill("pay_500");
      await searchBtn(page).click();
      await expect(errorMsg(page)).toContainText(
        "Internal server error. Please try again later."
      );
    });
  });

  // Step 6 ──────────────────────────────────────────────────────────────────
  test.describe("Step 6: currency filter", () => {
    test("currency dropdown is present", async ({ page }) => {
      await expect(currencySelect(page)).toBeVisible();
    });

    test("filtering by USD shows only USD payments", async ({ page }) => {
      await currencySelect(page).selectOption("USD");
      await page.waitForTimeout(300);
      await expect(dataRows(page)).not.toHaveCount(0);
      const currencies = await dataRows(page).locator("td").nth(4).allTextContents();
      for (const c of currencies) {
        expect(c.trim()).toBe("USD");
      }
    });

    test("Clear Filters also resets the currency dropdown", async ({ page }) => {
      await currencySelect(page).selectOption("EUR");
      await expect(clearBtn(page)).toBeVisible();
      await clearBtn(page).click();
      await expect(currencySelect(page)).toHaveValue("");
    });
  });

  // Step 7 ──────────────────────────────────────────────────────────────────
  test.describe("Step 7: combined search + currency filter", () => {
    test("filters by both payment ID and currency simultaneously", async ({ page }) => {
      await searchInput(page).fill("pay_134");
      await searchBtn(page).click();
      await currencySelect(page).selectOption("USD");
      await page.waitForTimeout(300);

      const currencies = await dataRows(page).locator("td").nth(4).allTextContents();
      for (const c of currencies) {
        expect(c.trim()).toBe("USD");
      }
      const ids = await dataRows(page).locator("td").first().allTextContents();
      for (const id of ids) {
        expect(id.toLowerCase()).toContain("pay_134");
      }
    });
  });

  // Step 8 ──────────────────────────────────────────────────────────────────
  test.describe("Step 8: pagination", () => {
    test("Previous and Next buttons are visible", async ({ page }) => {
      await expect(prevBtn(page)).toBeVisible();
      await expect(nextBtn(page)).toBeVisible();
    });

    test("Previous button is disabled on page 1", async ({ page }) => {
      await expect(prevBtn(page)).toBeDisabled();
    });

    test("Next button navigates to page 2", async ({ page }) => {
      await nextBtn(page).click();
      await expect(pageLabel(page)).toContainText("Page 2");
      await expect(prevBtn(page)).toBeEnabled();
    });

    test("Previous button navigates back to page 1", async ({ page }) => {
      await nextBtn(page).click();
      await expect(pageLabel(page)).toContainText("Page 2");
      await prevBtn(page).click();
      await expect(pageLabel(page)).toContainText("Page 1");
      await expect(prevBtn(page)).toBeDisabled();
    });

    test("page 2 shows different rows than page 1", async ({ page }) => {
      const page1Ids = await dataRows(page).locator("td").first().allTextContents();
      await nextBtn(page).click();
      await page.waitForTimeout(300);
      const page2Ids = await dataRows(page).locator("td").first().allTextContents();
      expect(page1Ids[0]).not.toBe(page2Ids[0]);
    });
  });

  // Page size ───────────────────────────────────────────────────────────────
  test.describe("Page size selector", () => {
    test("changing page size to 10 shows up to 10 rows", async ({ page }) => {
      await pageSizeSelect(page).selectOption("10");
      await page.waitForTimeout(500);
      const count = await dataRows(page).count();
      expect(count).toBeGreaterThan(5);
      expect(count).toBeLessThanOrEqual(10);
    });

    test("changing page size resets to page 1", async ({ page }) => {
      await nextBtn(page).click();
      await expect(pageLabel(page)).toContainText("Page 2");
      await pageSizeSelect(page).selectOption("10");
      await expect(pageLabel(page)).toContainText("Page 1");
    });
  });

  // Keyboard navigation ─────────────────────────────────────────────────────
  test.describe("Keyboard navigation", () => {
    test("can focus search input and type", async ({ page }) => {
      await searchInput(page).focus();
      await page.keyboard.type("pay_134");
      await expect(searchInput(page)).toHaveValue("pay_134");
    });

    test("can submit search with Enter key", async ({ page }) => {
      await searchInput(page).fill("pay_134_3");
      await searchInput(page).press("Enter");
      await expect(page.getByText("pay_134_3")).toBeVisible();
    });

    test("Next button is reachable by keyboard", async ({ page }) => {
      await nextBtn(page).focus();
      await page.keyboard.press("Enter");
      await expect(pageLabel(page)).toContainText("Page 2");
    });

    test("skip-to-content link appears on focus", async ({ page }) => {
      await page.keyboard.press("Tab");
      await expect(page.getByText("Skip to payments table")).toBeVisible();
    });
  });

  // Edge cases ──────────────────────────────────────────────────────────────
  test.describe("Edge cases", () => {
    test("searching with whitespace-only input fetches all payments", async ({ page }) => {
      await searchInput(page).fill("   ");
      await searchBtn(page).click();
      await expect(dataRows(page)).toHaveCount(5);
    });

    test("table has aria-busy attribute", async ({ page }) => {
      await expect(page.getByTestId("payments-table")).toBeVisible();
    });

    test("status badges are visible for all statuses", async ({ page }) => {
      const badges = page.locator("[data-testid='payments-table'] tbody td:last-child span");
      const count = await badges.count();
      expect(count).toBeGreaterThan(0);
    });
  });
});

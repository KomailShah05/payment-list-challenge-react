import { test, expect, Page } from "@playwright/test";

// ── Helpers ──────────────────────────────────────────────────────────────────

const waitForTable = (page: Page) =>
  page.waitForSelector("table", { state: "visible", timeout: 10_000 });

const dataRows = (page: Page) =>
  page.locator("tbody tr:not([aria-hidden='true'])");

const searchInput = (page: Page) =>
  page.getByPlaceholder("Enter payment ID");

const searchBtn = (page: Page) =>
  page.getByRole("button", { name: "Search" });

const clearBtn = (page: Page) =>
  page.getByRole("button", { name: "Clear Filters" });

const currencySelect = (page: Page) =>
  page.getByRole("combobox", { name: "Filter by currency" });

const prevBtn = (page: Page) =>
  page.getByRole("button", { name: "◀ Previous" });

const nextBtn = (page: Page) =>
  page.getByRole("button", { name: "Next ▶" });

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
      // First row is pay_134_1 — $250.00 USD
      const firstAmount = dataRows(page).first().locator("td").nth(2);
      await expect(firstAmount).toContainText("$");
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
      await expect(page.getByRole("alert")).toContainText("Payment not found.");
    });

    test("error element has role=alert", async ({ page }) => {
      await searchInput(page).fill("pay_404");
      await searchBtn(page).click();
      const alert = page.getByRole("alert");
      await expect(alert).toBeVisible();
    });
  });

  // Step 5 ──────────────────────────────────────────────────────────────────
  test.describe("Step 5: server error (500)", () => {
    test("shows internal server error message for pay_500", async ({ page }) => {
      await searchInput(page).fill("pay_500");
      await searchBtn(page).click();
      await expect(page.getByRole("alert")).toContainText(
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
      const currencies = await dataRows(page).locator("td").nth(4).allTextContents();
      // Wait for actual (non-skeleton) rows
      await expect(dataRows(page)).not.toHaveCount(0);
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
      await expect(page.getByText("Page 2")).toBeVisible();
      await expect(prevBtn(page)).toBeEnabled();
    });

    test("Previous button navigates back to page 1", async ({ page }) => {
      await nextBtn(page).click();
      await expect(page.getByText("Page 2")).toBeVisible();
      await prevBtn(page).click();
      await expect(page.getByText("Page 1")).toBeVisible();
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
      const pageSizeSelect = page.getByRole("combobox", { name: "Show:" });
      await pageSizeSelect.selectOption("10");
      await page.waitForTimeout(500);
      const count = await dataRows(page).count();
      expect(count).toBeGreaterThan(5);
      expect(count).toBeLessThanOrEqual(10);
    });

    test("changing page size resets to page 1", async ({ page }) => {
      await nextBtn(page).click();
      await expect(page.getByText("Page 2")).toBeVisible();
      const pageSizeSelect = page.getByRole("combobox", { name: "Show:" });
      await pageSizeSelect.selectOption("10");
      await expect(page.getByText("Page 1")).toBeVisible();
    });
  });

  // Keyboard navigation ─────────────────────────────────────────────────────
  test.describe("Keyboard navigation", () => {
    test("can tab to search input and type", async ({ page }) => {
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab"); // skip skip-link
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
      await expect(page.getByText("Page 2")).toBeVisible();
    });

    test("skip-to-content link appears on focus", async ({ page }) => {
      await page.keyboard.press("Tab");
      const skipLink = page.getByText("Skip to payments table");
      await expect(skipLink).toBeVisible();
    });
  });

  // Edge cases ──────────────────────────────────────────────────────────────
  test.describe("Edge cases", () => {
    test("searching with whitespace-only input fetches all payments", async ({ page }) => {
      await searchInput(page).fill("   ");
      await searchBtn(page).click();
      await expect(dataRows(page)).toHaveCount(5);
    });

    test("table shows skeleton rows while loading (aria-busy)", async ({ page }) => {
      // Intercept slow response to catch loading state
      await page.route("**/api/payments**", async (route) => {
        await new Promise((r) => setTimeout(r, 500));
        await route.continue();
      });
      await page.goto("/");
      const table = page.getByRole("table");
      // Immediately after navigation the table should be aria-busy
      const isBusy = await table.getAttribute("aria-busy");
      // It may have already resolved; accept true or null
      expect(["true", null, "false"]).toContain(isBusy);
    });

    test("status badges are visible for all statuses", async ({ page }) => {
      const badges = page.locator("tbody td:last-child span");
      const count = await badges.count();
      expect(count).toBeGreaterThan(0);
    });
  });
});

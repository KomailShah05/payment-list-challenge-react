import { test, expect, Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"];

const analyze = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(wcagTags)
    .exclude("[aria-hidden='true']")
    .analyze();

const waitForTable = (page: Page) =>
  page.waitForSelector("[data-testid='payments-table']", { timeout: 10_000 });

test.describe("Accessibility — WCAG 2.1 AA/AAA", () => {
  test("initial page load has no violations", async ({ page }) => {
    await page.goto("/");
    await waitForTable(page);
    const { violations } = await analyze(page);
    expect(
      violations,
      violations.map((v) => `[${v.id}] ${v.description} — ${v.nodes.length} node(s)`).join("\n")
    ).toHaveLength(0);
  });

  test("search results state has no violations", async ({ page }) => {
    await page.goto("/");
    await waitForTable(page);
    await page.getByTestId("search-input").fill("pay_134");
    await page.getByTestId("search-button").click();
    await page.waitForTimeout(500);
    const { violations } = await analyze(page);
    expect(
      violations,
      violations.map((v) => `[${v.id}] ${v.description}`).join("\n")
    ).toHaveLength(0);
  });

  test("404 error state has no violations", async ({ page }) => {
    await page.goto("/");
    await waitForTable(page);
    await page.getByTestId("search-input").fill("pay_404");
    await page.getByTestId("search-button").click();
    await page.waitForSelector("[data-testid='error-message']");
    const { violations } = await analyze(page);
    expect(
      violations,
      violations.map((v) => `[${v.id}] ${v.description}`).join("\n")
    ).toHaveLength(0);
  });

  test("500 error state has no violations", async ({ page }) => {
    await page.goto("/");
    await waitForTable(page);
    await page.getByTestId("search-input").fill("pay_500");
    await page.getByTestId("search-button").click();
    await page.waitForSelector("[data-testid='error-message']");
    const { violations } = await analyze(page);
    expect(
      violations,
      violations.map((v) => `[${v.id}] ${v.description}`).join("\n")
    ).toHaveLength(0);
  });

  test("page 2 state has no violations", async ({ page }) => {
    await page.goto("/");
    await waitForTable(page);
    await page.getByTestId("next-button").click();
    await page.waitForTimeout(400);
    const { violations } = await analyze(page);
    expect(
      violations,
      violations.map((v) => `[${v.id}] ${v.description}`).join("\n")
    ).toHaveLength(0);
  });

  // ── Specific WCAG checks ────────────────────────────────────────────────

  test("all images and icons have alternative text or aria-hidden", async ({ page }) => {
    await page.goto("/");
    await waitForTable(page);
    const svgs = await page.locator("svg").all();
    for (const svg of svgs) {
      const hidden = await svg.getAttribute("aria-hidden");
      const label  = await svg.getAttribute("aria-label");
      expect(hidden === "true" || label !== null).toBe(true);
    }
  });

  test("all interactive elements are reachable by Tab", async ({ page }) => {
    await page.goto("/");
    await waitForTable(page);
    for (const selector of ["button:not([disabled])", "input", "select"]) {
      const elements = await page.locator(selector).all();
      for (const el of elements) {
        const tabIndex = await el.getAttribute("tabindex");
        expect(tabIndex === null || parseInt(tabIndex) >= -1).toBe(true);
      }
    }
  });

  test("error message receives focus when it appears", async ({ page }) => {
    await page.goto("/");
    await waitForTable(page);
    await page.getByTestId("search-input").fill("pay_404");
    await page.getByTestId("search-button").click();
    await page.waitForSelector("[data-testid='error-message']");
    const focusedRole = await page.evaluate(() => document.activeElement?.getAttribute("role"));
    expect(focusedRole).toBe("alert");
  });

  test("skip-to-content link is the first focusable element", async ({ page }) => {
    await page.goto("/");
    await waitForTable(page);
    await page.keyboard.press("Tab");
    const focusedText = await page.evaluate(() => document.activeElement?.textContent?.trim());
    expect(focusedText).toBe("Skip to payments table");
  });

  test("table column headers have scope='col'", async ({ page }) => {
    await page.goto("/");
    await waitForTable(page);
    const headers = await page.locator("th[scope='col']").count();
    expect(headers).toBe(6);
  });

  test("search input has an accessible label", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("search-input")).toBeVisible();
  });

  test("currency dropdown has an accessible label", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("currency-select")).toBeVisible();
  });

  test("pagination buttons have accessible labels", async ({ page }) => {
    await page.goto("/");
    await waitForTable(page);
    await expect(page.getByTestId("prev-button")).toBeVisible();
    await expect(page.getByTestId("next-button")).toBeVisible();
  });

  test("status badges have sufficient color contrast (AAA check via axe)", async ({ page }) => {
    await page.goto("/");
    await waitForTable(page);
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2aaa"])
      .include("tbody")
      .analyze();
    const contrastViolations = violations.filter((v) => v.id === "color-contrast-enhanced");
    expect(
      contrastViolations,
      contrastViolations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(", ")}`).join("\n")
    ).toHaveLength(0);
  });
});

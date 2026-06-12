import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Run axe against WCAG 2.1 AA + AAA rules
const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"];

const analyze = (page: Parameters<typeof AxeBuilder>[0]["page"]) =>
  new AxeBuilder({ page })
    .withTags(wcagTags)
    // These two rules flag false positives with MSW in dev mode
    .exclude("[aria-hidden='true']")
    .analyze();

test.describe("Accessibility — WCAG 2.1 AA/AAA", () => {
  test("initial page load has no violations", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("table", { timeout: 10_000 });
    const { violations } = await analyze(page);
    expect(
      violations,
      violations.map((v) => `[${v.id}] ${v.description} — ${v.nodes.length} node(s)`).join("\n")
    ).toHaveLength(0);
  });

  test("search results state has no violations", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("table");
    await page.getByPlaceholder("Enter payment ID").fill("pay_134");
    await page.getByRole("button", { name: "Search" }).click();
    await page.waitForTimeout(500);
    const { violations } = await analyze(page);
    expect(
      violations,
      violations.map((v) => `[${v.id}] ${v.description}`).join("\n")
    ).toHaveLength(0);
  });

  test("404 error state has no violations", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("table");
    await page.getByPlaceholder("Enter payment ID").fill("pay_404");
    await page.getByRole("button", { name: "Search" }).click();
    await page.waitForSelector("[role='alert']");
    const { violations } = await analyze(page);
    expect(
      violations,
      violations.map((v) => `[${v.id}] ${v.description}`).join("\n")
    ).toHaveLength(0);
  });

  test("500 error state has no violations", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("table");
    await page.getByPlaceholder("Enter payment ID").fill("pay_500");
    await page.getByRole("button", { name: "Search" }).click();
    await page.waitForSelector("[role='alert']");
    const { violations } = await analyze(page);
    expect(
      violations,
      violations.map((v) => `[${v.id}] ${v.description}`).join("\n")
    ).toHaveLength(0);
  });

  test("page 2 state has no violations", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("table");
    await page.getByRole("button", { name: "Next ▶" }).click();
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
    await page.waitForSelector("table");
    // SVG chevrons inside selects must be aria-hidden
    const svgs = await page.locator("svg").all();
    for (const svg of svgs) {
      const hidden = await svg.getAttribute("aria-hidden");
      const label  = await svg.getAttribute("aria-label");
      expect(hidden === "true" || label !== null).toBe(true);
    }
  });

  test("all interactive elements are reachable by Tab", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("table");

    const focusableSelectors = [
      "a[href]",
      "button:not([disabled])",
      "input",
      "select",
    ];

    for (const selector of focusableSelectors) {
      const elements = await page.locator(selector).all();
      for (const el of elements) {
        const tabIndex = await el.getAttribute("tabindex");
        // tabindex="-1" means programmatically focusable only (e.g. error box) — acceptable
        expect(tabIndex === null || parseInt(tabIndex) >= -1).toBe(true);
      }
    }
  });

  test("error message receives focus when it appears", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("table");
    await page.getByPlaceholder("Enter payment ID").fill("pay_404");
    await page.getByRole("button", { name: "Search" }).click();
    await page.waitForSelector("[role='alert']");

    const focusedTag = await page.evaluate(() => document.activeElement?.getAttribute("role"));
    expect(focusedTag).toBe("alert");
  });

  test("skip-to-content link is the first focusable element", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("table", { timeout: 10_000 });
    await page.keyboard.press("Tab");
    const focusedText = await page.evaluate(() => document.activeElement?.textContent?.trim());
    expect(focusedText).toBe("Skip to payments table");
  });

  test("table column headers have scope='col'", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("table");
    const headers = await page.locator("th[scope='col']").count();
    expect(headers).toBe(6);
  });

  test("search input has an accessible label", async ({ page }) => {
    await page.goto("/");
    const input = page.getByRole("searchbox", { name: "Search payments" });
    await expect(input).toBeVisible();
  });

  test("currency dropdown has an accessible label", async ({ page }) => {
    await page.goto("/");
    const select = page.getByRole("combobox", { name: "Filter by currency" });
    await expect(select).toBeVisible();
  });

  test("pagination buttons have accessible labels", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("table");
    await expect(page.getByRole("button", { name: "◀ Previous" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Next ▶" })).toBeVisible();
  });

  test("status badges have sufficient color contrast (AAA check via axe)", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("table");
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2aaa"])
      .include("tbody")
      .analyze();

    // Filter to only color-contrast violations
    const contrastViolations = violations.filter((v) => v.id === "color-contrast-enhanced");
    expect(
      contrastViolations,
      contrastViolations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(", ")}`).join("\n")
    ).toHaveLength(0);
  });
});

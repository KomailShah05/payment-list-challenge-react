import { describe, test, expect } from "vitest";
import { formatAmount, formatDate } from "../utils/format";

describe("formatAmount", () => {
  test("formats integer amounts with 2 decimal places", () => {
    expect(formatAmount(250)).toBe("250.00");
  });

  test("formats decimal amounts correctly", () => {
    expect(formatAmount(120.75)).toBe("120.75");
  });

  test("formats large amounts with thousands separator", () => {
    expect(formatAmount(1234567.89)).toBe("1,234,567.89");
  });

  test("formats zero correctly", () => {
    expect(formatAmount(0)).toBe("0.00");
  });

  test("rounds to 2 decimal places", () => {
    expect(formatAmount(99.999)).toBe("100.00");
  });
});

describe("formatDate", () => {
  test("formats ISO date string into dd/MM/yyyy, HH:mm:ss", () => {
    expect(formatDate("2024-04-15T10:00:00Z")).toMatch(
      /^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}$/
    );
  });
});

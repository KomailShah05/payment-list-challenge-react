import { trackTiming } from "./telemetry";

/**
 * Core Web Vitals reporting (LCP, CLS, INP).
 *
 * INP is the most relevant vital for this app — it captures input
 * responsiveness of the search field, currency filter and pagination.
 *
 * Imported dynamically so the app still boots if the dependency is
 * missing (e.g. in stripped-down CI environments).
 */
export const initWebVitals = async (): Promise<void> => {
  try {
    const { onCLS, onINP, onLCP } = await import("web-vitals");
    onLCP((m) => trackTiming("web_vital_lcp", m.value, { rating: m.rating }));
    onINP((m) => trackTiming("web_vital_inp", m.value, { rating: m.rating }));
    // CLS is unitless — report value as-is in metadata-friendly form
    onCLS((m) => trackTiming("web_vital_cls", m.value, { rating: m.rating }));
  } catch {
    // web-vitals not installed — observability must never break the app
  }
};

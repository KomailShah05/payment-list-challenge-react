# Payment List Challenge — React

> **Task brief**: [cko-recruitment/payment-list-challenge-react](https://github.com/cko-recruitment/payment-list-challenge-react)

A payment search interface built with React 19, TypeScript, and Tailwind CSS.

---

## Tech Stack

|                          |                                                        |
| ------------------------ | ------------------------------------------------------ |
| React 19                 | `useOptimistic`, `useActionState`, `useDeferredValue`  |
| TanStack Query v5        | Caching, pagination prefetch, stale-while-revalidate   |
| MSW v2                   | API mocking — search by ID, customer, currency, status |
| Vitest + Testing Library | 46 unit/component tests across all 8 steps             |
| Playwright + axe-core    | 49 E2E tests + WCAG 2.1 AA/AAA accessibility audit     |
| Tailwind CSS             | Utility-only styling                                   |

---

## Quick Start

```bash
npm install
npm run dev          # http://localhost:3000
```

---

## Running Tests

```bash
# Unit tests
npm test

# Unit tests with coverage report
npm run test:coverage

# Individual step
npm run test:step1
npm run test:step2
npm run test:step3
npm run test:step4
npm run test:step5
npm run test:step6
npm run test:step7
npm run test:step8

# E2E + accessibility (requires dev server on :3000)
npm run test:e2e

# Everything
npm run test:all
```

---

## What's Implemented

| Step | Feature                                                                           |
| ---- | --------------------------------------------------------------------------------- |
| 1    | Payment table — formatted amounts, dates (dd/MM/yyyy HH:mm:ss), status badges     |
| 2    | Search by Payment ID, customer name, currency, or status                          |
| 3    | Clear Filters — resets all active filters, preserves page size, returns to page 1 |
| 4    | 404 handling — "Payment not found" error with focus management                    |
| 5    | 500 handling — "Internal server error" with screen-reader announcement            |
| 6    | Currency dropdown filter (USD, EUR, GBP, AUD, CAD, ZAR, JPY, CZK)                 |
| 7    | Combined search + currency filter                                                 |
| 8    | Pagination — Previous / Next, configurable page size (5 / 10 / 25 / 50)           |

**Beyond the brief**: Column sorting (Date, Amount — amount sorting enabled only when a currency filter is active), URL state sync (filters survive reload/share), WCAG AAA colour contrast, skip-to-content link, frontend observability (see below), Axios token-bucket rate limiting + input sanitisation, skeleton loaders, percentage progress bar.

---

## Observability

All signals flow through a single telemetry core (`src/observability/telemetry.ts`) — buffered in memory, logged in dev, silent in tests, and forwarded to a pluggable transport (Sentry / Datadog / `sendBeacon`) in production via `setTransport()`. Inspect live events in the browser console with `window.__telemetry.events()`.

| Signal             | What's captured                                                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| User interactions  | `search_performed` (query _length_ only — PII-safe), `currency_filter_changed`, `pagination_changed`, `filters_cleared`, `sort_changed`  |
| Search analytics   | `search_results` — result count + no-results rate per filter combination                                                                 |
| API performance    | `payment_api_request` latency per request, with `X-Request-Id` correlation header                                                        |
| React Query cache  | Cache hit rate, fetch durations, query failures — cancelled requests excluded (`src/observability/queryObservability.ts`)                |
| Render performance | React Profiler — slow renders (>50ms) recorded with component + phase                                                                    |
| Core Web Vitals    | LCP / CLS / INP via `web-vitals` (`src/observability/webVitals.ts`)                                                                      |
| Errors             | Structured events from the ErrorBoundary (`react_render_error`) and API layer (`payment_fetch_failed` with status code + filter context) |

---

## Project Structure

```
src/
├── api/           # Axios client (rate limiting, CSRF, sanitisation)
├── components/
│   ├── payments/  # PaymentFilters, PaymentTable, PaymentRow, Pagination
│   └── ui/        # Button, Select, Badge, Skeleton, ProgressBar, SortIcon
├── constants/     # Single source — i18n strings, currencies, table columns
├── hooks/         # usePayments, usePaymentFilters, useLoadingProgress, useObservability
├── mocks/         # MSW v2 handlers + mock payment data
├── observability/ # telemetry, queryObservability, webVitals
├── pages/         # PaymentsPage
└── types/         # All interfaces and types
e2e/               # Playwright: payments.spec.ts + accessibility.spec.ts
```

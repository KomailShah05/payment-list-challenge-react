/**
 * Lightweight frontend telemetry core.
 *
 * Single entry point for all observability signals (user interactions,
 * timings, errors). Events are:
 *   - buffered in memory (inspectable via `window.__telemetry` in dev)
 *   - logged to the console in dev
 *   - forwarded to a pluggable transport in production (Sentry, Datadog,
 *     `navigator.sendBeacon` to a collector, …) via `setTransport`
 *   - silent in unit tests (jsdom) so test output stays clean
 */

export type TelemetryLevel = "info" | "timing" | "error";

export interface TelemetryEvent {
  event: string;
  level: TelemetryLevel;
  /** epoch ms */
  timestamp: number;
  /** stable per-tab id so events can be grouped into sessions */
  sessionId: string;
  metadata?: Record<string, unknown>;
}

export type TelemetryTransport = (event: TelemetryEvent) => void;

const BUFFER_LIMIT = 200;

const isJsdom =
  typeof navigator !== "undefined" && navigator.userAgent.includes("jsdom");

const sessionId = Math.random().toString(36).slice(2, 10);

const buffer: TelemetryEvent[] = [];

let transport: TelemetryTransport | null = null;

/** Plug in a production sink (Sentry/Datadog/sendBeacon). */
export const setTransport = (t: TelemetryTransport | null) => {
  transport = t;
};

/** Last N events — handy for debugging and for attaching to bug reports. */
export const getEvents = (): readonly TelemetryEvent[] => buffer;

const emit = (
  level: TelemetryLevel,
  event: string,
  metadata?: Record<string, unknown>
) => {
  const entry: TelemetryEvent = {
    event,
    level,
    timestamp: Date.now(),
    sessionId,
    ...(metadata ? { metadata } : {}),
  };

  buffer.push(entry);
  if (buffer.length > BUFFER_LIMIT) buffer.shift();

  if (isJsdom) return; // keep unit-test output clean

  if (import.meta.env.DEV) {
    const log = level === "error" ? console.error : console.debug;
    log(`[telemetry:${level}] ${event}`, metadata ?? "");
  }

  transport?.(entry);
};

/** Track a user interaction or app event. */
export const trackEvent = (
  event: string,
  metadata?: Record<string, unknown>
) => emit("info", event, metadata);

/** Track a duration metric (API latency, render time, web vital…). */
export const trackTiming = (
  event: string,
  durationMs: number,
  metadata?: Record<string, unknown>
) => emit("timing", event, { durationMs: Math.round(durationMs * 100) / 100, ...metadata });

/** Structured error logging — replaces bare console.error. */
export const logError = (
  event: string,
  metadata?: Record<string, unknown>
) => emit("error", event, metadata);

// Dev convenience: inspect the buffer from the browser console.
declare global {
  interface Window {
    __telemetry?: { events: () => readonly TelemetryEvent[] };
  }
}
if (typeof window !== "undefined" && import.meta.env.DEV && !isJsdom) {
  window.__telemetry = { events: getEvents };
}

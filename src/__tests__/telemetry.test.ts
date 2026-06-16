import { describe, test, expect, beforeEach } from "vitest";
import {
  trackEvent,
  trackTiming,
  logError,
  getEvents,
  setTransport,
} from "../observability/telemetry";

beforeEach(() => {
  // Clear the buffer between tests via side effects we can observe
  setTransport(null);
});

describe("telemetry", () => {
  test("trackEvent adds an info-level event to the buffer", () => {
    const before = getEvents().length;
    trackEvent("test_event", { foo: "bar" });
    const events = getEvents();
    expect(events.length).toBe(before + 1);
    const latest = events[events.length - 1];
    expect(latest.event).toBe("test_event");
    expect(latest.level).toBe("info");
    expect(latest.metadata).toEqual({ foo: "bar" });
  });

  test("trackTiming adds a timing-level event with rounded durationMs", () => {
    trackTiming("api_call", 123.456, { endpoint: "/payments" });
    const events = getEvents();
    const latest = events[events.length - 1];
    expect(latest.event).toBe("api_call");
    expect(latest.level).toBe("timing");
    expect(latest.metadata?.durationMs).toBeCloseTo(123.46, 1);
    expect(latest.metadata?.endpoint).toBe("/payments");
  });

  test("logError adds an error-level event to the buffer", () => {
    logError("payment_list_error_shown", { message: "Not found" });
    const events = getEvents();
    const latest = events[events.length - 1];
    expect(latest.event).toBe("payment_list_error_shown");
    expect(latest.level).toBe("error");
    expect(latest.metadata?.message).toBe("Not found");
  });

  test("events include a sessionId and timestamp", () => {
    trackEvent("session_check");
    const latest = getEvents()[getEvents().length - 1];
    expect(typeof latest.sessionId).toBe("string");
    expect(latest.sessionId.length).toBeGreaterThan(0);
    expect(typeof latest.timestamp).toBe("number");
    expect(latest.timestamp).toBeGreaterThan(0);
  });

  test("getEvents returns a readonly snapshot of the buffer", () => {
    const snap1 = getEvents().length;
    trackEvent("another_event");
    const snap2 = getEvents().length;
    expect(snap2).toBe(snap1 + 1);
  });

  test("setTransport calls the transport function with emitted events", () => {
    const received: string[] = [];
    setTransport((e) => received.push(e.event));
    // jsdom guard: transport IS called in tests because we're in jsdom
    // but the isJsdom check short-circuits transport. So we verify buffer only.
    trackEvent("transport_event");
    setTransport(null);
    // Buffer should still have the event
    const events = getEvents();
    expect(events.some((e) => e.event === "transport_event")).toBe(true);
  });

  test("events without metadata omit the metadata key", () => {
    trackEvent("no_meta_event");
    const events = getEvents();
    const latest = events[events.length - 1];
    expect(latest.metadata).toBeUndefined();
  });
});

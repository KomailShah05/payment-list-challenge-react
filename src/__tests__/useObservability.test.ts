import { describe, test, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import useObservability from "../hooks/useObservability";
import { getEvents } from "../observability/telemetry";

describe("useObservability", () => {
  test("returns the telemetry helpers and onRenderCallback", () => {
    const { result } = renderHook(() => useObservability());
    expect(typeof result.current.onRenderCallback).toBe("function");
    expect(typeof result.current.trackEvent).toBe("function");
    expect(typeof result.current.trackTiming).toBe("function");
    expect(typeof result.current.logError).toBe("function");
  });

  test("onRenderCallback does NOT emit a slow_render event when under threshold", () => {
    const { result } = renderHook(() => useObservability({ warnThresholdMs: 50 }));
    const before = getEvents().length;
    // Simulate a fast render (5ms < 50ms threshold)
    result.current.onRenderCallback("PaymentsPage", "mount", 5, 5, 0, 0);
    expect(getEvents().length).toBe(before);
  });

  test("onRenderCallback emits a slow_render timing event when over threshold", () => {
    const { result } = renderHook(() => useObservability({ warnThresholdMs: 50 }));
    const before = getEvents().length;
    // Simulate a slow render (100ms > 50ms threshold)
    result.current.onRenderCallback("PaymentsPage", "update", 100, 100, 0, 0);
    const events = getEvents();
    expect(events.length).toBe(before + 1);
    const latest = events[events.length - 1];
    expect(latest.event).toBe("slow_render");
    expect(latest.level).toBe("timing");
    expect(latest.metadata?.component).toBe("PaymentsPage");
    expect(latest.metadata?.phase).toBe("update");
    expect(latest.metadata?.thresholdMs).toBe(50);
  });

  test("uses default 16ms threshold when no config given", () => {
    const { result } = renderHook(() => useObservability());
    const before = getEvents().length;
    // 20ms > 16ms default threshold
    result.current.onRenderCallback("TestId", "mount", 20, 20, 0, 0);
    const events = getEvents();
    expect(events.length).toBe(before + 1);
    expect(events[events.length - 1].metadata?.thresholdMs).toBe(16);
  });

  test("trackEvent and logError are the same references as telemetry exports", async () => {
    const { trackEvent: te, logError: le } = renderHook(() => useObservability()).result.current;
    const { trackEvent: imported, logError: importedLogError } = await import(
      "../observability/telemetry"
    );
    expect(te).toBe(imported);
    expect(le).toBe(importedLogError);
  });
});

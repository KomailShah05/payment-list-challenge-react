import { ProfilerOnRenderCallback, useCallback } from "react";
import { logError, trackEvent, trackTiming } from "../observability/telemetry";

interface ObservabilityConfig {
  /** Warn when a render exceeds this threshold (ms). Default: 16ms (one frame) */
  warnThresholdMs?: number;
}

interface ObservabilityResult {
  onRenderCallback: ProfilerOnRenderCallback;
  trackEvent: typeof trackEvent;
  trackTiming: typeof trackTiming;
  logError: typeof logError;
}

/**
 * Component-facing observability API.
 *
 * - `onRenderCallback`: memoized React Profiler callback that records every
 *   render duration as a timing metric and warns on slow renders in dev.
 * - `trackEvent` / `trackTiming` / `logError`: structured telemetry
 *   (see src/observability/telemetry.ts).
 */
const useObservability = (
  { warnThresholdMs = 16 }: ObservabilityConfig = {}
): ObservabilityResult => {
  const onRenderCallback: ProfilerOnRenderCallback = useCallback(
    (id, phase, actualDuration) => {
      if (actualDuration > warnThresholdMs) {
        trackTiming("slow_render", actualDuration, {
          component: id,
          phase,
          thresholdMs: warnThresholdMs,
        });
        if (import.meta.env.DEV) {
          console.warn(
            `[Profiler] <${id}> (${phase}) took ${actualDuration.toFixed(1)}ms` +
            ` — threshold: ${warnThresholdMs}ms`
          );
        }
      }
    },
    [warnThresholdMs]
  );

  return { onRenderCallback, trackEvent, trackTiming, logError };
};

export default useObservability;

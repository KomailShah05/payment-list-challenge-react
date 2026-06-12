import { ProfilerOnRenderCallback, useCallback } from "react";

interface ObservabilityConfig {
  /** Warn when a render exceeds this threshold (ms). Default: 16ms (one frame) */
  warnThresholdMs?: number;
}

interface ObservabilityResult {
  onRenderCallback: ProfilerOnRenderCallback;
}

/**
 * Returns a memoized React Profiler onRender callback.
 * Logs slow renders in development. In production this hook is a no-op —
 * the callback exits immediately so there is zero runtime overhead.
 */
const useObservability = (
  { warnThresholdMs = 16 }: ObservabilityConfig = {}
): ObservabilityResult => {
  const onRenderCallback: ProfilerOnRenderCallback = useCallback(
    (id, phase, actualDuration) => {
      if (!import.meta.env.DEV) return;
      if (actualDuration > warnThresholdMs) {
        console.warn(
          `[Profiler] <${id}> (${phase}) took ${actualDuration.toFixed(1)}ms` +
          ` — threshold: ${warnThresholdMs}ms`
        );
      }
    },
    [warnThresholdMs]
  );

  return { onRenderCallback };
};

export default useObservability;

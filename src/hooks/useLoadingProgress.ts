import { useEffect, useRef, useState } from "react";

// Simulates a fetch progress percentage.
// Advances quickly to 90% while loading, then jumps to 100% on completion.
const useLoadingProgress = (isFetching: boolean): number => {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isFetching) {
      setProgress(0);
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          // Slow down as it approaches 90% — never auto-complete
          if (prev >= 90) return prev;
          const increment = (90 - prev) * 0.15;
          return Math.min(prev + increment, 90);
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Jump to 100% on completion, then reset after a short display period
      setProgress(100);
      const resetTimer = setTimeout(() => setProgress(0), 400);
      return () => clearTimeout(resetTimer);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isFetching]);

  return progress;
};

export default useLoadingProgress;

import { memo } from "react";

interface ProgressBarProps {
  progress: number;
}

const ProgressBar = memo(({ progress }: ProgressBarProps) => {
  if (progress === 0) return null;

  return (
    <div
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading payments"
      className="fixed top-0 left-0 z-50 h-0.5 bg-blue-600 transition-all duration-100"
      style={{
        width: `${progress}%`,
        opacity: progress === 100 ? 0 : 1,
        transition: "width 100ms ease, opacity 300ms ease",
      }}
    />
  );
});

export default ProgressBar;

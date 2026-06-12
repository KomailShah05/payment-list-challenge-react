import { memo } from "react";

type Status = "completed" | "pending" | "failed" | "refunded" | string;

interface BadgeProps {
  status: Status;
}

// Colors chosen for WCAG AAA contrast (7:1 ratio minimum)
const STATUS_CLASSES: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-900",
  pending:   "bg-amber-50   text-amber-900",
  failed:    "bg-red-50     text-red-900",
  refunded:  "bg-purple-50  text-purple-900",
};

const Badge = memo(({ status }: BadgeProps) => (
  <span
    className={[
      "inline-block rounded px-2.5 py-0.5 text-xs font-semibold capitalize",
      STATUS_CLASSES[status] ?? "bg-gray-100 text-gray-800",
    ].join(" ")}
  >
    {status}
  </span>
));

export default Badge;

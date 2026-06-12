import { memo } from "react";

interface SkeletonCellProps {
  width?: string;
}

export const SkeletonCell = memo(({ width = "w-full" }: SkeletonCellProps) => (
  <div className={`h-4 rounded bg-gray-200 animate-pulse ${width}`} />
));

interface SkeletonRowProps {
  columns?: number;
}

const SkeletonRow = memo(({ columns = 6 }: SkeletonRowProps) => (
  <tr aria-hidden="true">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <SkeletonCell />
      </td>
    ))}
  </tr>
));

export default SkeletonRow;

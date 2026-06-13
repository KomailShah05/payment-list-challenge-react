import { SortDirection } from "../../types";

interface SortIconProps {
  active: boolean;
  dir: SortDirection;
}

const SortIcon = ({ active, dir }: SortIconProps) => (
  <svg
    aria-hidden="true"
    width="10"
    height="14"
    viewBox="0 0 10 14"
    className="ml-1 inline-block align-middle"
  >
    <path
      d="M5 1 L9 6 H1 Z"
      fill={active && dir === "asc" ? "#2563eb" : "#d1d5db"}
    />
    <path
      d="M5 13 L9 8 H1 Z"
      fill={active && dir === "desc" ? "#2563eb" : "#d1d5db"}
    />
  </svg>
);

export default SortIcon;

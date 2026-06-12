import { memo, SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const ChevronDown = () => (
  <svg
    aria-hidden="true"
    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 6l4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Select = memo(({ label, id, className = "", children, ...rest }: SelectProps) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
    )}
    <div className="relative">
      <select
        id={id}
        {...rest}
        className={[
          "w-full appearance-none rounded-md border border-gray-300 bg-white",
          "py-2 pl-3 pr-8 text-sm text-gray-900 shadow-sm",
          "cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </select>
      <ChevronDown />
    </div>
  </div>
));

export default Select;

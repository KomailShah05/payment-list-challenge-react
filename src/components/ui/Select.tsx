import { memo, SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select = memo(({ label, id, className = "", children, ...rest }: SelectProps) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
    )}
    <select
      id={id}
      {...rest}
      className={[
        "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900",
        "shadow-sm cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </select>
  </div>
));

export default Select;

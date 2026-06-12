import { memo, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = memo(({ label, id, className = "", ...rest }: InputProps) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
    )}
    <input
      id={id}
      {...rest}
      className={[
        "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900",
        "shadow-sm placeholder:text-gray-400",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  </div>
));

export default Input;

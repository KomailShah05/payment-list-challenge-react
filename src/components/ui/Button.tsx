import { memo, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
  secondary:
    "bg-gray-600 text-white hover:bg-gray-700 focus-visible:ring-gray-500",
  ghost:
    "border border-gray-300 text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400",
};

const Button = memo(
  ({ variant = "primary", className = "", disabled, children, ...rest }: ButtonProps) => (
    <button
      {...rest}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANT_CLASSES[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  )
);

export default Button;

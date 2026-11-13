import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "sm";

const variants: Record<Variant, string> = {
  primary:
    "border-navy bg-navy text-white hover:border-navy-soft hover:bg-navy-soft",
  secondary:
    "border-line bg-white text-navy hover:border-sage-ink hover:bg-warm",
  ghost:
    "border-transparent bg-transparent text-navy hover:bg-sage/60",
};

export function buttonClasses(
  variant: Variant = "primary",
  size: Size = "md",
) {
  return [
    "inline-flex shrink-0 items-center justify-center gap-2",
    "rounded-full border font-semibold",
    "transition-colors duration-200",
    "disabled:cursor-not-allowed disabled:opacity-50",
    size === "sm"
      ? "min-h-11 px-5 py-2.5 text-sm"
      : "min-h-12 px-6 py-3 text-sm",
    variants[variant],
  ].join(" ");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  loadingText = "Please wait…",
  disabled,
  type = "button",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${buttonClasses(variant, size)} ${className}`}
    >
      {loading ? (
        <>
          <LoaderCircle
            size={17}
            className="motion-safe:animate-spin"
            aria-hidden="true"
          />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
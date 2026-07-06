import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-slate)]",
  secondary:
    "bg-transparent text-[var(--color-ink)] border border-[var(--color-line)] hover:border-[var(--color-ink)]",
  ghost: "bg-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)]",
  danger: "bg-transparent text-red-700 border border-red-200 hover:bg-red-50",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

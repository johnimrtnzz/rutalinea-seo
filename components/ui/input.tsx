import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-slate-soft)] focus:border-[var(--color-signal)] ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium uppercase tracking-wide text-[var(--color-slate-soft)] mb-1.5">
      {children}
    </label>
  );
}

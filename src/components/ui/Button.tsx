import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", ...props }, ref) => {
    let variantClasses = "";
    if (variant === "primary") {
      variantClasses = "bg-[var(--primary)] text-white border border-[var(--border-accent)] shadow-[var(--shadow-soft)] hover:bg-[var(--primary-hover)] active:translate-y-[1px] active:shadow-none";
    } else if (variant === "secondary") {
      variantClasses = "bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-subtle)] shadow-[var(--shadow-soft)] hover:bg-[var(--bg-app)] active:translate-y-[1px] active:shadow-none";
    } else if (variant === "ghost") {
      variantClasses = "bg-transparent text-[var(--text-main)] hover:bg-[var(--border-subtle)] active:translate-y-[1px]";
    }

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-sans font-bold px-4 py-2.5 text-sm rounded-md transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

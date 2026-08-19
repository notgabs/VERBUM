import React, { HTMLAttributes } from "react";

export const Card = React.forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-[var(--shadow-soft)] p-4 ${className}`}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

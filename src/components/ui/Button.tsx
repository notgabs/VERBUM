"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "motion/react";

type Variant = "primary" | "gold" | "secondary" | "tinted" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
  size?: Size;
}

const VARIANTS: Record<Variant, string> = {
  primary: "btn-3d bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]",
  gold: "btn-3d bg-[var(--color-gold)] text-[#3d2800] hover:brightness-105 [--btn-press:var(--color-gold-press)]",
  secondary: "bg-[var(--color-fill)] text-[var(--color-text-main)] hover:bg-[var(--color-fill-strong)]",
  tinted: "bg-[var(--color-primary-soft)] text-[var(--color-text-accent)] hover:brightness-95",
  ghost: "bg-transparent text-[var(--color-text-accent)] hover:bg-[var(--color-fill)]",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-[3.25rem] px-6 text-[17px]",
};

/** Botão em pílula com resposta tátil (mola ao pressionar). */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", type = "button", disabled, ...props }, ref) => (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      whileTap={disabled || variant === "primary" || variant === "gold" ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`inline-flex select-none items-center justify-center gap-2 rounded-full font-extrabold disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  )
);
Button.displayName = "Button";

interface IconButtonProps extends HTMLMotionProps<"button"> {
  label: string;
}

/** Botão circular só com ícone (fechar, info, som). */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className = "", label, type = "button", ...props }, ref) => (
    <motion.button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-fill)] text-[var(--color-text-main)] transition-colors hover:bg-[var(--color-fill-strong)] ${className}`}
      {...props}
    />
  )
);
IconButton.displayName = "IconButton";

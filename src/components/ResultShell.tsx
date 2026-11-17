"use client";

import React, { useEffect, useRef, type ReactNode } from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import { ModalBase } from "@/components/ModalBase";
import { useIsMobile } from "@/hooks/useIsMobile";

interface ResultShellProps {
  label: string;
  /** PC: janela aberta. Celular: ao virar true, a página rola até o painel. */
  open: boolean;
  onClose: () => void;
  /** Classes do painel no PC (largura, padding). */
  className?: string;
  children: ReactNode;
}

/**
 * Onde a tela de resultado aparece:
 *  - PC e tablet: janela (popup) no meio da tela;
 *  - celular: um painel que fica embaixo do jogo e a página desce até ele com uma rolagem suave.
 */
export function ResultShell({ label, open, onClose, className = "", children }: ResultShellProps) {
  const mobile = useIsMobile();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!mobile || !open) return;
    let controls: { stop: () => void } | null = null;
    const stopOnTouch = () => controls?.stop();
    const timer = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const from = window.scrollY;
      const to = Math.max(0, el.getBoundingClientRect().top + from - 12);
      if (reduce || Math.abs(to - from) < 4) { window.scrollTo(0, to); return; }
      // Descida lenta até o painel; se o jogador tocar ou rolar, a animação para
      controls = animate(from, to, {
        duration: 1.3,
        ease: [0.45, 0.05, 0.25, 1],
        onUpdate: (y) => window.scrollTo(0, y),
      });
      window.addEventListener("touchstart", stopOnTouch, { once: true, passive: true });
      window.addEventListener("wheel", stopOnTouch, { once: true, passive: true });
    }, 450);
    return () => {
      clearTimeout(timer);
      controls?.stop();
      window.removeEventListener("touchstart", stopOnTouch);
      window.removeEventListener("wheel", stopOnTouch);
    };
  }, [mobile, open, reduce]);

  if (!mobile) {
    return open ? <ModalBase label={label} onClose={onClose} className={className}>{children}</ModalBase> : null;
  }

  return (
    <motion.section
      ref={ref}
      aria-label={label}
      initial={reduce ? false : { opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 26 }}
      className="mb-8 mt-8 w-full max-w-md scroll-mt-4 overflow-hidden rounded-[28px] bg-[var(--color-surface)] text-[var(--color-text-main)] shadow-[var(--shadow-elevated)]"
    >
      {children}
    </motion.section>
  );
}

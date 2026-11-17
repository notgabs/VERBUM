"use client";

import React, { useLayoutEffect, useRef } from "react";

interface FitTextProps {
  children: React.ReactNode;
  /** Tamanho máximo e mínimo da fonte, em px. */
  max: number;
  min: number;
  className?: string;
}

/**
 * Parágrafo que diminui a fonte até caber no espaço do contêiner (sem rolagem),
 * recalculando quando o tamanho muda (girar o celular, redimensionar a janela).
 */
export function FitText({ children, max, min, className = "" }: FitTextProps) {
  const ref = useRef<HTMLParagraphElement | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box) return;
    const fit = () => {
      let size = max;
      el.style.fontSize = `${size}px`;
      while (size > min && box.scrollHeight > box.clientHeight + 1) {
        size -= 0.5;
        el.style.fontSize = `${size}px`;
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, [children, max, min]);

  return <p ref={ref} className={className}>{children}</p>;
}

import type { ReactNode } from "react";

interface GameHeaderProps {
  eyebrow?: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
}

/** Título grande alinhado à esquerda, no estilo das telas de sistema. */
export function GameHeader({ eyebrow, title, subtitle, trailing }: GameHeaderProps) {
  return (
    <header className="flex w-full flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1.5">{eyebrow}</div>}
        <h1 className="large-title">{title}</h1>
        {subtitle && <p className="mt-2 text-[15px] text-[var(--color-text-muted)]">{subtitle}</p>}
      </div>
      {trailing}
    </header>
  );
}

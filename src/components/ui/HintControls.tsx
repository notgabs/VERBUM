"use client";

import { motion, useReducedMotion } from "motion/react";
import { ModalBase } from "@/components/ModalBase";
import { LightbulbIcon } from "@/components/ui/Icons";

export type HintKey = "h1" | "h2";

const DEFAULT_THRESHOLDS: Record<HintKey, number> = { h1: 6, h2: 12 };

interface HintOrbProps {
  hint: HintKey;
  attempts: number;
  threshold?: number;
  unlocked: boolean;
  onOpen: (hint: HintKey) => void;
}

/**
 * Botão de dica em formato de orbe. O anel dourado enche a cada palpite;
 * quando completa, a lâmpada acende e pulsa até ser aberta.
 */
export function HintOrb({ hint, attempts, threshold, unlocked, onOpen }: HintOrbProps) {
  const reduce = useReducedMotion();
  const needed = threshold ?? DEFAULT_THRESHOLDS[hint];
  const available = attempts >= needed;
  const remaining = Math.max(0, needed - attempts);
  const fresh = available && !unlocked;
  const progress = Math.min(1, attempts / needed);
  const label = hint === "h1" ? "Dica 1" : "Dica 2";
  const R = 27;
  const C = 2 * Math.PI * R;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.button
        type="button"
        disabled={!available}
        onClick={() => onOpen(hint)}
        aria-label={available ? `Abrir ${label.toLowerCase()}` : `${label} bloqueada: faltam ${remaining} palpites`}
        title={available ? label : `Faltam ${remaining} palpites`}
        whileTap={available ? { scale: 0.9 } : undefined}
        animate={fresh && !reduce ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={fresh ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
        className="relative flex h-[62px] w-[62px] items-center justify-center rounded-full disabled:cursor-not-allowed"
      >
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 62 62" aria-hidden="true">
          <circle cx="31" cy="31" r={R} fill="none" stroke="var(--color-fill-strong)" strokeWidth="4" />
          <motion.circle
            cx="31" cy="31" r={R} fill="none" stroke="var(--color-gold)" strokeWidth="4" strokeLinecap="round"
            strokeDasharray={C}
            initial={false}
            animate={{ strokeDashoffset: C * (1 - progress) }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </svg>
        <span
          className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
            available
              ? fresh
                ? "bg-[var(--color-gold)] text-white shadow-[0_0_22px_color-mix(in_srgb,var(--color-gold)_70%,transparent)]"
                : "bg-[color-mix(in_srgb,var(--color-gold)_18%,var(--color-surface))] text-[var(--color-gold)]"
              : "bg-[var(--color-fill)] text-[var(--color-text-tertiary)]"
          }`}
        >
          <LightbulbIcon size={22} />
        </span>
        {!available && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-text-main)] px-1 text-[11px] font-black tabular-nums text-[var(--color-surface)]">
            {remaining}
          </span>
        )}
      </motion.button>
      <span className={`text-[12px] font-extrabold ${available ? "text-[var(--color-gold)]" : "text-[var(--color-text-tertiary)]"}`}>{label}</span>
    </div>
  );
}

interface HintControlsProps {
  attempts: number;
  thresholds?: Record<HintKey, number>;
  unlocked: Record<HintKey, boolean>;
  onOpen: (hint: HintKey) => void;
}

/** As duas orbes lado a lado. */
export function HintControls({ attempts, thresholds = DEFAULT_THRESHOLDS, unlocked, onOpen }: HintControlsProps) {
  return (
    <div className="flex gap-3">
      <HintOrb hint="h1" attempts={attempts} threshold={thresholds.h1} unlocked={unlocked.h1} onOpen={onOpen} />
      <HintOrb hint="h2" attempts={attempts} threshold={thresholds.h2} unlocked={unlocked.h2} onOpen={onOpen} />
    </div>
  );
}

interface HintDialogProps {
  hint: HintKey;
  text: string;
  onClose: () => void;
}

export function HintDialog({ hint, text, onClose }: HintDialogProps) {
  return (
    <ModalBase label={hint === "h1" ? "Dica 1" : "Dica 2"} onClose={onClose} className="max-w-md px-6 pb-8 pt-6 text-center sm:px-8">
      <motion.div
        initial={{ scale: 0.5, rotate: -12, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 14 }}
        className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-gold)] text-white shadow-[0_0_30px_color-mix(in_srgb,var(--color-gold)_60%,transparent)]"
      >
        <LightbulbIcon size={30} />
      </motion.div>
      <p className="mx-auto mt-5 max-w-sm text-[19px] font-bold leading-relaxed">{text}</p>
    </ModalBase>
  );
}

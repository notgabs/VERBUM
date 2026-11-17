"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { playClickSound } from "@/utils/sound";
import { CharacterPhoto } from "@/components/CharacterPhoto";
import { ModalBase } from "@/components/ModalBase";
import { NextChallengeCountdown } from "@/components/NextChallengeCountdown";
import { Button } from "@/components/ui/Button";
import { ChevronRight, RefreshIcon } from "@/components/ui/Icons";
import { asset } from "@/utils/asset";

interface VictoryModalProps {
  solutionName: string;
  solutionImage?: string;
  solutionImageId?: string;
  attemptsCount: number;
  hintsUsedCount: number;
  nextGameHref: string;
  nextGameLabel: string;
  nextGameDescription: string;
  nextGameIcon: string;
  passageTitle?: string;
  passageExplanation?: string;
  characterReference?: string;
  characterKnownFor?: string;
  characterType?: string;
  characterSummary?: string;
  onClose?: () => void;
  onReplay?: () => void;
  /** Mostra quanto falta para o próximo desafio diário. */
  showCountdown?: boolean;
}

const SPARKLES = [
  { x: "12%", y: "18%", s: 14, d: 0.2 },
  { x: "82%", y: "14%", s: 18, d: 0.6 },
  { x: "88%", y: "52%", s: 12, d: 1.0 },
  { x: "8%", y: "58%", s: 16, d: 0.8 },
  { x: "22%", y: "84%", s: 10, d: 1.3 },
  { x: "74%", y: "82%", s: 14, d: 0.4 },
];

function Sparkle({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0c.8 6.5 4.7 10.9 12 12-7.3 1.1-11.2 5.5-12 12-.8-6.5-4.7-10.9-12-12C7.3 10.9 11.2 6.5 12 0z" fill="#ffe08a" />
    </svg>
  );
}

function fireConfetti() {
  void import("canvas-confetti").then(({ default: confetti }) => {
    const colors = ["#ffd166", "#f2b300", "#ffffff", "#8fd0f2", "#2f8cff"];
    const base = { particleCount: 60, spread: 55, startVelocity: 55, ticks: 220, gravity: 0.9, scalar: 1.05, colors, zIndex: 70 };
    confetti({ ...base, angle: 60, origin: { x: 0, y: 0.85 } });
    confetti({ ...base, angle: 120, origin: { x: 1, y: 0.85 } });
    setTimeout(() => {
      confetti({ particleCount: 40, spread: 100, startVelocity: 30, origin: { x: 0.5, y: 0.35 }, colors, shapes: ["star"], scalar: 1.3, ticks: 180, zIndex: 70 });
    }, 450);
  });
}

export const VictoryModal: React.FC<VictoryModalProps> = (props) => {
  const reduce = useReducedMotion();
  const isPassage = Boolean(props.passageTitle);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(fireConfetti, 250);
    return () => clearTimeout(t);
  }, []);

  const enter = (delay: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, x: 16 },
    animate: { opacity: 1, x: 0 },
    transition: { type: "spring" as const, stiffness: 260, damping: 26, delay },
  });

  return (
    <ModalBase label="Vitória" onClose={props.onClose} className="max-w-[820px] overflow-hidden !p-0">
      <div className="grid md:grid-cols-[minmax(0,320px)_1fr]">
        {/* Palco: retrato com raios de luz */}
        <div className="relative flex flex-col items-center justify-center overflow-hidden bg-[linear-gradient(170deg,#2f8cff_0%,#1a4fa8_55%,#122f6b_100%)] px-6 pb-7 pt-9 text-center text-white md:pb-10 md:pt-12">
          <motion.div
            aria-hidden="true"
            className="sunburst absolute left-1/2 top-[42%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={reduce ? { opacity: 0.8, scale: 1 } : { opacity: 0.8, scale: 1, rotate: 360 }}
            transition={{ opacity: { duration: 0.6 }, scale: { type: "spring", stiffness: 80, damping: 14 }, rotate: { duration: 40, repeat: Infinity, ease: "linear" } }}
          />
          {!reduce && SPARKLES.map((sp, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              className="absolute"
              style={{ left: sp.x, top: sp.y }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], rotate: [0, 90] }}
              transition={{ duration: 1.8, delay: 0.5 + sp.d, repeat: Infinity, repeatDelay: 1.2 }}
            >
              <Sparkle size={sp.s} />
            </motion.span>
          ))}

          <motion.div
            initial={reduce ? false : { scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 13, delay: 0.1 }}
            className="relative"
          >
            <motion.div
              aria-hidden="true"
              className="absolute -inset-3 rounded-[38px] bg-[#ffd166]"
              animate={reduce ? { opacity: 0.35 } : { opacity: [0.25, 0.55, 0.25], scale: [1, 1.08, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "blur(14px)" }}
            />
            {isPassage ? (
              <div className="relative flex h-28 w-28 items-center justify-center rounded-[30px] bg-white text-[#1a4fa8] shadow-[0_0_0_5px_#ffd166] md:h-36 md:w-36">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.45 }} />
                </svg>
              </div>
            ) : (
              <div className="relative h-32 w-32 overflow-hidden rounded-[30px] bg-[#0f2a4a] shadow-[0_0_0_5px_#ffd166] md:h-44 md:w-44">
                <CharacterPhoto key={props.solutionImageId || props.solutionName} id={props.solutionImageId} image={props.solutionImage} alt={`Imagem de ${props.solutionName}`} className="h-full w-full object-cover" />
              </div>
            )}
          </motion.div>

          <h2 className="relative mt-6 text-[clamp(28px,4vw,38px)] font-black leading-tight tracking-[-0.02em] text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.2)]">
            <motion.span
              className="inline-block"
              initial={reduce ? false : { y: 24, opacity: 0, scale: 0.7 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 16, delay: 0.4 }}
            >
              {props.solutionName}
            </motion.span>
          </h2>
          {props.characterType && <p className="relative mt-1 text-[13px] font-bold text-white/75">{props.characterType}</p>}
        </div>

        {/* Detalhes */}
        <div className="flex flex-col gap-4 p-6 md:p-8">
          <motion.p {...enter(0.3)} className="pr-10 text-[13px] font-extrabold uppercase tracking-[0.08em] text-[var(--color-status-correct)]">
            Você acertou!
          </motion.p>

          {props.showCountdown && (
            <motion.div {...enter(0.33)} className="rounded-[18px] border-2 border-[var(--color-border-subtle)] px-4 py-3">
              <NextChallengeCountdown />
            </motion.div>
          )}

          {isPassage ? (
            <motion.div {...enter(0.36)} className="flex flex-col gap-3">
              <blockquote className="font-serif text-[17px] italic leading-relaxed">&ldquo;{props.passageTitle}&rdquo;</blockquote>
              {props.passageExplanation && (
                <div className="rounded-[18px] bg-[var(--color-fill)] p-4">
                  <p className="eyebrow">Sobre esta passagem</p>
                  <p className="mt-1 line-clamp-4 text-[15px] leading-relaxed">{props.passageExplanation}</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div {...enter(0.36)} className="flex flex-col gap-3">
              {props.characterSummary && <p className="line-clamp-3 text-[15px] leading-relaxed text-[var(--color-text-muted)]">{props.characterSummary}</p>}
              {(props.characterKnownFor || props.characterReference) && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {props.characterKnownFor && (
                    <div className="rounded-[18px] bg-[var(--color-fill)] p-4">
                      <p className="eyebrow">Conhecido por</p>
                      <p className="mt-1 text-[15px] font-bold leading-snug">{props.characterKnownFor}</p>
                    </div>
                  )}
                  {props.characterReference && (
                    <div className="rounded-[18px] bg-[var(--color-fill)] p-4">
                      <p className="eyebrow">Onde aparece</p>
                      <p className="mt-1 text-[15px] font-bold leading-snug">{props.characterReference}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          <motion.div {...enter(0.42)} className="flex gap-2">
            <div className="flex flex-1 items-center gap-3 rounded-[18px] bg-[var(--color-primary-soft)] px-4 py-3">
              <span className="text-[28px] font-black tabular-nums text-[var(--color-text-accent)]">{props.attemptsCount}</span>
              <span className="text-[13px] font-bold text-[var(--color-text-muted)]">{props.attemptsCount === 1 ? "palpite" : "palpites"}</span>
            </div>
            <div className="flex flex-1 items-center gap-3 rounded-[18px] bg-[color-mix(in_srgb,var(--color-gold)_16%,var(--color-surface))] px-4 py-3">
              <span className="text-[28px] font-black tabular-nums text-[var(--color-gold)]">{props.hintsUsedCount}</span>
              <span className="text-[13px] font-bold text-[var(--color-text-muted)]">{props.hintsUsedCount === 1 ? "dica" : "dicas"}</span>
            </div>
          </motion.div>

          {props.onReplay && (
            <motion.div {...enter(0.48)} className="flex">
              <Button size="lg" variant="tinted" onClick={() => { playClickSound(); props.onReplay?.(); }} className="flex-1">
                <RefreshIcon size={17} /> Jogar de novo
              </Button>
            </motion.div>
          )}

          <motion.div {...enter(0.54)}>
            <Link
              href={props.nextGameHref}
              onClick={() => playClickSound()}
              className="group flex items-center gap-3 rounded-[18px] border-2 border-[var(--color-border-subtle)] p-3 transition-colors hover:bg-[var(--color-fill)]"
            >
              <img src={asset(props.nextGameIcon)} alt="" className="h-11 w-11 shrink-0 object-contain" />
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-extrabold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Próximo jogo</span>
                <span className="block text-[16px] font-black">{props.nextGameLabel}</span>
              </span>
              <ChevronRight size={18} className="text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </ModalBase>
  );
};

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { AppShell, Wordmark } from "@/components/AppShell";
import { useGameStats } from "@/hooks/useGameStats";
import { playClickSound } from "@/utils/sound";
import { FlameIcon, LockIcon } from "@/components/ui/Icons";
import { asset } from "@/utils/asset";

const spring = { type: "spring", stiffness: 260, damping: 24 } as const;

/** Silhueta (gerada no ComfyUI): usa a imagem como máscara e se pinta com a cor do texto do contêiner. */
function Silhueta({ src, ratio }: { src: string; ratio: number }) {
  const mask = `url(${asset(src)}) center / contain no-repeat`;
  return <span className="block h-full bg-current" style={{ aspectRatio: ratio, maxWidth: "100%", mask, WebkitMask: mask }} />;
}
const CruzSilhueta = () => <Silhueta src="/menu/silhueta-cruz.webp" ratio={314 / 480} />;
const LivroSilhueta = () => <Silhueta src="/menu/silhueta-livro.webp" ratio={640 / 449} />;
const PessoaSilhueta = () => <Silhueta src="/menu/silhueta-pessoa.webp" ratio={520 / 507} />;
const NotaSilhueta = () => <Silhueta src="/menu/silhueta-nota.webp" ratio={1} />;

function CountUp({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => `${Math.round(v)}`);
  useEffect(() => {
    if (reduce) { mv.set(value); return; }
    const controls = animate(mv, value, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [value, mv, reduce]);
  return <motion.span>{text}</motion.span>;
}

interface ChallengeCardProps {
  href?: string;
  /** Silhueta usada como arte de fundo do cartão. */
  art: React.ReactNode;
  title: string;
  subtitle: string;
  /** Cor de fundo e cor da "base" 3D do cartão. */
  color: string;
  press: string;
  badge?: string;
  soon?: boolean;
  /** Faixa baixa numa linha só, para caber mais cartões no celular. */
  compact?: boolean;
}

/** Cartão de desafio com profundidade, no estilo de botão de jogo. */
function ChallengeCard({ href, art, title, subtitle, color, press, badge, soon, compact }: ChallengeCardProps) {
  const reduce = useReducedMotion();
  const body = compact ? (
    <span
      className="relative flex h-full items-center gap-3 overflow-hidden rounded-[22px] px-4 py-[clamp(12px,2.2vh,18px)] text-white"
      style={{ background: color, boxShadow: `0 5px 0 ${press}, 0 12px 24px rgba(15,42,74,0.2)` }}
    >
      <span aria-hidden="true" className="pointer-events-none absolute -right-1 top-1/2 flex h-[92%] -translate-y-1/2 items-center text-white/20 ">{art}</span>
      <span className="relative min-w-0 flex-1">
        <span className="block text-[17px] font-black leading-tight">{title}</span>
        <span className="mt-0.5 line-clamp-2 block text-[12px] font-semibold leading-snug text-white/80">{subtitle}</span>
      </span>
      {soon ? (
        <span className="relative inline-flex shrink-0 items-center gap-1 rounded-full bg-black/20 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.05em]">
          <LockIcon size={11} /> Em breve
        </span>
      ) : badge ? (
        <span className="relative shrink-0 rounded-full bg-[#ffd166] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.05em] text-[#5a3a00]">{badge}</span>
      ) : null}
    </span>
  ) : (
    <span
      className="relative flex h-full min-h-[clamp(150px,24vh,250px)] flex-col justify-end overflow-hidden rounded-[26px] p-[clamp(14px,2.4vh,22px)] text-white"
      style={{ background: color, boxShadow: `0 6px 0 ${press}, 0 16px 30px rgba(15,42,74,0.22)` }}
    >
      <span aria-hidden="true" className="pointer-events-none absolute -right-1 top-[6%] flex h-[80%] w-[55%] items-start justify-end text-white/25 ">{art}</span>
      {soon && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-black/20 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.05em]">
          <LockIcon size={11} /> Em breve
        </span>
      )}
      <span className="relative mt-[clamp(10px,2.5vh,28px)] block">
        <span className="block text-[clamp(18px,2.8vh,24px)] font-black leading-[1.08] tracking-[-0.01em]">{title}</span>
        <span className="mt-1 block text-[13px] font-semibold leading-snug text-white/80">{subtitle}</span>
      </span>
    </span>
  );

  if (soon || !href) {
    return <div className="h-full cursor-default opacity-80 saturate-[0.75]" aria-disabled="true">{body}</div>;
  }
  return (
    <motion.div className="h-full" whileHover={reduce ? undefined : { y: -4 }} whileTap={{ y: 3, scale: 0.98 }} transition={spring}>
      <Link href={href} onClick={() => playClickSound()} className="block h-full rounded-[26px]">
        {body}
      </Link>
    </motion.div>
  );
}

export default function HomePage() {
  const { streak: savedStreak, isLoaded } = useGameStats();
  const reduce = useReducedMotion();

  const container = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.07 } } };
  const item = { hidden: { opacity: 0, y: reduce ? 0 : 16 }, show: { opacity: 1, y: 0, transition: spring } };
  const streak = isLoaded ? savedStreak : 0;
  const games = [
    {
      key: "personagem", art: <CruzSilhueta />, title: "Adivinhe o personagem",
      href: "/personagem",
      subtitle: "O personagem bíblico de hoje",
      color: "linear-gradient(150deg,#2f8cff,#1a5fc9)", press: "#123f8f",
    },
    {
      key: "passagem", art: <LivroSilhueta />, title: "Acerte a passagem",
      href: "/passagem",
      subtitle: "Livro, capítulo e versículo de hoje",
      color: "linear-gradient(150deg,#ffad33,#f07c00)", press: "#b35a00",
    },
    {
      key: "quem-sou-eu", art: <PessoaSilhueta />, title: "Quem sou eu?",
      href: "/quem-sou-eu",
      subtitle: "Descubra quem está por trás das pistas",
      color: "linear-gradient(150deg,#3cc4dd,#178fae)", press: "#0e6680",
    },
    {
      key: "musica", art: <NotaSilhueta />, title: "Acerte a música",
      href: "/musica",
      subtitle: "Descubra o louvor em poucos segundos",
      color: "linear-gradient(150deg,#ff5fa2,#d6336c)", press: "#99214b",
    },
  ];

  return (
    <AppShell
      width="wide"
      fitViewport
      hideHeaderLogo
      infoTitle="Sobre o Verbum"
      infoContent={
        <div className="space-y-6 text-[0.95rem] leading-relaxed text-[var(--color-text-main)]">
          <p>
            O Verbum é um jogo gratuito para conhecer melhor a Bíblia e a fé católica brincando. Todo dia há um desafio novo em cada modo,
            igual para todo mundo.
          </p>
          <section className="space-y-2">
            <h3>Os jogos</h3>
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Adivinhe o personagem:</strong> descubra o personagem bíblico do dia.</li>
              <li><strong>Acerte a passagem:</strong> ache o livro, o capítulo e o versículo de um trecho da Bíblia.</li>
              <li><strong>Quem sou eu?:</strong> descubra o santo ou papa a partir de pistas.</li>
              <li><strong>Acerte a música:</strong> reconheça o louvor ouvindo poucos segundos.</li>
            </ul>
            <p className="text-sm opacity-90">Cada jogo tem as regras no botão de informações dentro dele.</p>
          </section>
          <section className="space-y-2">
            <h3>Sequência</h3>
            <p>Vença pelo menos um desafio por dia para manter a sua sequência de dias. Seu progresso fica salvo só neste aparelho.</p>
          </section>
        </div>
      }
    >
      <motion.div variants={container} initial="hidden" animate="show" className="flex w-full flex-col items-center gap-[clamp(14px,3.5vh,36px)]">
        <motion.div variants={item} className="flex flex-col items-center gap-[clamp(10px,2vh,18px)]">
          <Wordmark className="h-[clamp(44px,8vh,72px)] drop-shadow-[0_2px_10px_rgba(255,255,255,0.5)]" />

          {/* Sequência */}
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-surface)] py-1.5 pl-2 pr-4 shadow-[var(--shadow-soft)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff1dc] text-[#ff8a00]">
              <FlameIcon size={18} />
            </span>
            <span className="text-[20px] font-black tabular-nums"><CountUp value={streak} /></span>
            <span className="text-[14px] font-bold text-[var(--color-text-muted)]">{streak === 1 ? "dia de sequência" : "dias de sequência"}</span>
          </span>
        </motion.div>

        {/* Desafios: no celular, uma faixa por jogo; no desktop, os quatro lado a lado. */}
        <div className="flex w-full max-w-md flex-col gap-[clamp(10px,1.8vh,14px)] md:hidden">
          {games.map((g) => (
            <motion.div key={g.key} variants={item}>
              <ChallengeCard compact href={g.href} art={g.art} title={g.title} subtitle={g.subtitle} color={g.color} press={g.press} />
            </motion.div>
          ))}
        </div>
        <div className="hidden w-full max-w-2xl grid-cols-2 gap-[clamp(10px,1.8vh,18px)] md:grid lg:max-w-4xl lg:grid-cols-4">
          {games.map((g) => (
            <motion.div key={g.key} variants={item}>
              <ChallengeCard href={g.href} art={g.art} title={g.title} subtitle={g.subtitle} color={g.color} press={g.press} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AppShell>
  );
}

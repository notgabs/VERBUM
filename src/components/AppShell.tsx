"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { isAudioMuted, setAudioMuted, playClickSound, preloadSounds } from "@/utils/sound";
import { unlockAudio } from "@/utils/audioContext";
import { ModalBase } from "@/components/ModalBase";
import { IconButton } from "@/components/ui/Button";
import { InfoIcon, SpeakerIcon, SpeakerOffIcon } from "@/components/ui/Icons";
import { SkyBackground } from "@/components/SkyBackground";
import { asset } from "@/utils/asset";

interface AppShellProps {
  children: React.ReactNode;
  /** Título da janela de informações (padrão: "Como jogar"). */
  infoTitle?: string;
  /** Telas de jogo: mostra "Como jogar" à esquerda e o som à direita do logo. */
  gameControls?: boolean;
  infoContent?: React.ReactNode;
  /** Largura máxima do conteúdo. */
  width?: "narrow" | "wide" | "full";
  /** Esconde o logo da barra (quando a página já mostra um logo grande). */
  hideHeaderLogo?: boolean;
  /** Ocupa exatamente a altura da tela, sem rolagem (Home). */
  fitViewport?: boolean;
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <picture>
      <source srcSet={asset("/logo-verbum-wordmark-dark.png")} media="(prefers-color-scheme: dark)" />
      <img src={asset("/logo-verbum-wordmark.png")} alt="Verbum" className={`w-auto select-none ${className}`} draggable={false} />
    </picture>
  );
}

export const CONTATO_EMAIL = "gabrielhss025@gmail.com";

/** Rodapé de toda janela de informações: e-mail para bugs, correções, sugestões e feedback. */
function Contato() {
  return (
    <section className="mt-8 rounded-2xl bg-[var(--color-fill)] p-4 text-[0.95rem] leading-relaxed">
      <h3 className="!mt-0 font-bold">Fale comigo</h3>
      <p className="mt-1 text-sm opacity-90">
        Achou um bug ou uma informação errada? Quer sugerir uma música, um santo ou uma ideia, ou mandar um feedback? Escreva para:
      </p>
      <a href={`mailto:${CONTATO_EMAIL}?subject=Verbum`} className="mt-2 inline-block break-all text-[16px] font-extrabold text-[var(--color-text-accent)] underline underline-offset-2">
        {CONTATO_EMAIL}
      </a>
    </section>
  );
}

/** Estrutura de todas as páginas: barra superior sólida + conteúdo centralizado. */
export function AppShell({ children, gameControls = false, infoContent, infoTitle = "Como jogar", width = "wide", hideHeaderLogo = false, fitViewport = false }: AppShellProps) {
  const [muted, setMuted] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMuted(isAudioMuted()));
    // Libera o áudio e carrega os sons no primeiro toque (navegadores só liberam áudio após um toque)
    const events = ["pointerdown", "touchend", "click", "keydown"] as const;
    let loaded = false;
    const warm = () => {
      unlockAudio();
      if (!loaded) { loaded = true; void preloadSounds(); }
    };
    events.forEach((e) => window.addEventListener(e, warm, { passive: true }));
    return () => {
      cancelAnimationFrame(frame);
      events.forEach((e) => window.removeEventListener(e, warm));
    };
  }, []);

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setAudioMuted(next);
    if (!next) playClickSound();
  };

  const logo = <span className="inline-flex rounded-full bg-[var(--color-surface)] px-4 py-2 shadow-[var(--shadow-soft)]"><Wordmark className="h-5 sm:h-6" /></span>;

  return (
    <div className={`relative flex w-full flex-col text-[var(--color-text-main)] ${fitViewport ? "min-h-dvh [@media(min-width:768px)_and_(min-height:700px)]:h-dvh [@media(min-width:768px)_and_(min-height:700px)]:overflow-hidden" : "min-h-dvh"}`}>
      <SkyBackground />
      <header className="relative z-30 w-full shrink-0">
        {/* Tudo centralizado: "Como jogar" à esquerda, logo (volta ao início) no meio, som à direita */}
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-center gap-3 px-4 sm:h-16 sm:px-6">
          {infoContent && (
            <IconButton label={infoTitle} aria-haspopup="dialog" className="h-10 w-10 !bg-[var(--color-surface)] shadow-[var(--shadow-soft)]" onClick={() => { playClickSound(); setIsInfoOpen(true); }}>
              <InfoIcon size={19} />
            </IconButton>
          )}
          {!hideHeaderLogo && (
            <Link href="/" onClick={() => playClickSound()} aria-label="Verbum — início" className="block rounded-lg p-1">
              {logo}
            </Link>
          )}
          {gameControls && (
            <IconButton label={muted ? "Ativar som" : "Silenciar som"} aria-pressed={!muted} onClick={toggleSound} className="h-10 w-10 !bg-[var(--color-surface)] shadow-[var(--shadow-soft)]">
              {muted ? <SpeakerOffIcon size={18} /> : <SpeakerIcon size={18} />}
            </IconButton>
          )}
        </div>
      </header>

      <main
        className={`relative z-10 mx-auto flex w-full flex-1 flex-col items-center px-4 sm:px-6 ${fitViewport ? "min-h-0 justify-center pb-4" : "pb-16 pt-2 sm:pt-4"} ${width === "narrow" ? "max-w-md" : width === "wide" ? "max-w-5xl" : ""}`}
      >
        {children}
      </main>

      {isInfoOpen && infoContent && (
        <ModalBase labelledBy="game-info-title" onClose={() => { playClickSound(); setIsInfoOpen(false); }} className="max-w-xl px-6 pb-8 pt-6 sm:px-8">
          <h2 id="game-info-title" className="mb-6 mt-2 pr-10 text-[28px] font-bold tracking-tight">{infoTitle}</h2>
          <div className="info-content">{infoContent}</div>
          <Contato />
        </ModalBase>
      )}

    </div>
  );
}

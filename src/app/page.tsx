"use client";

import React from "react";
import Link from "next/link";
import { MonasteryBackground } from "@/components/MonasteryBackground";
import { useGameStats } from "@/hooks/useGameStats";
import { playClickSound } from "@/utils/sound";

export default function HomePage() {
  const { stats, winRate, isLoaded } = useGameStats();

  return (
    <MonasteryBackground fitViewport>
      <div className="home-screen relative h-full w-full max-w-xl flex flex-col items-center text-center my-auto">
        {/* VERBUM Logo & Emblem */}
        <div className="flex flex-col items-center gap-0">
          {/* Pixel Cross Emblem */}
          <div className="hidden w-16 h-16 sm:w-20 sm:h-20 bg-[#3b1f11] border-4 border-[#693d22] flex items-center justify-center shadow-2xl relative">
            <span className="text-3xl sm:text-4xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              ✝️
            </span>
          </div>

          <img
            src="/verbum-correto.svg"
            alt="Verbum"
            className="home-logo h-auto"
          />
          <p className="hidden text-[10px] sm:text-xs font-bold text-[#d4b996] uppercase tracking-wider -mt-2">
            O Jogo Diário Bíblico Monástico
          </p>
        </div>

        <div className="w-full max-w-sm grid grid-cols-1 gap-3 sm:gap-4 mt-4">
          {/* Clássico Card/Button */}
          <Link
            href="/personagem"
            onClick={() => playClickSound()}
            className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-[var(--shadow-soft)] p-3 flex items-center justify-start gap-4 text-left group cursor-pointer transition-all duration-200 hover:bg-[var(--bg-app)] hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[var(--shadow-soft)]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14">
              <img src="/personagem-emoji.svg" alt="" className="h-full w-full object-contain drop-shadow-sm" />
            </span>
            <span className="flex flex-col items-start gap-0.5">
              <span className="text-lg sm:text-xl font-serif font-black text-[var(--text-main)] uppercase tracking-wider">
                Clássico
              </span>
              <span className="text-[11px] text-[var(--text-muted)] font-sans font-medium">
                Adivinhe a figura bíblica
              </span>
            </span>
          </Link>

          {/* Acerte a Passagem Card/Button */}
          <Link
            href="/passagem"
            onClick={() => playClickSound()}
            className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-[var(--shadow-soft)] p-3 flex items-center justify-start gap-4 text-left group cursor-pointer transition-all duration-200 hover:bg-[var(--bg-app)] hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[var(--shadow-soft)]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14">
              <img src="/passagem-emoji.svg" alt="" className="h-full w-full object-contain drop-shadow-sm" />
            </span>
            <span className="flex flex-col items-start gap-0.5">
              <span className="text-lg sm:text-xl font-serif font-black text-[var(--text-main)] uppercase tracking-wider">
                Acerte a Passagem
              </span>
              <span className="text-[11px] text-[var(--text-muted)] font-sans font-medium">
                Adivinhe livro, cap e versículo
              </span>
            </span>
          </Link>
        </div>

        <div className="absolute inset-x-0 bottom-0 w-full bg-[var(--bg-app)] border-t border-[var(--border-subtle)] p-3 sm:p-4 shadow-[var(--shadow-elevated)]">
          <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center max-w-sm mx-auto">
            {/* Jogos realizados */}
            <div className="flex flex-col items-center justify-center p-2 bg-[var(--bg-surface)] rounded-lg shadow-[var(--shadow-soft)] border border-[var(--border-subtle)]">
              <span className="text-[10px] sm:text-xs font-sans font-bold text-[var(--text-muted)] uppercase tracking-wide">
                Jogos
              </span>
              <span className="font-sans text-xl sm:text-2xl font-black text-[var(--text-main)] mt-0.5">
                {isLoaded ? stats.jogosRealizados : 0}
              </span>
            </div>

            {/* Sequência atual */}
            <div className="flex flex-col items-center justify-center p-2 bg-[var(--bg-surface)] rounded-lg shadow-[var(--shadow-soft)] border border-[var(--border-subtle)]">
              <span className="text-[10px] sm:text-xs font-sans font-bold text-[var(--text-muted)] uppercase tracking-wide">
                Sequência
              </span>
              <span className="font-sans text-xl sm:text-2xl font-black text-[var(--status-correct)] mt-0.5 flex items-center gap-1">
                {isLoaded ? stats.sequenciaAtual : 0} <span className="text-sm">🔥</span>
              </span>
            </div>

            {/* Taxa de vitória */}
            <div className="flex flex-col items-center justify-center p-2 bg-[var(--bg-surface)] rounded-lg shadow-[var(--shadow-soft)] border border-[var(--border-subtle)]">
              <span className="text-[10px] sm:text-xs font-sans font-bold text-[var(--text-muted)] uppercase tracking-wide">
                Vitórias
              </span>
              <span className="font-sans text-xl sm:text-2xl font-black text-[var(--text-main)] mt-0.5">
                {isLoaded ? `${winRate}%` : "0%"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </MonasteryBackground>
  );
}

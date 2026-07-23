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

        {/* Two Large Buttons/Cards: Personagem and Passagem */}
        <div className="w-full max-w-sm grid grid-cols-1 gap-3 sm:gap-4">
          {/* Personagem Card/Button */}
          <Link
            href="/personagem"
            onClick={() => playClickSound()}
            className="pixel-btn-wood p-2.5 sm:p-3 flex items-center justify-start gap-3 text-left group cursor-pointer"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14">
              <img src="/personagem-emoji.svg" alt="" className="h-full w-full object-contain" />
            </span>
            <span className="flex flex-col items-start gap-0.5">
              <span className="text-lg sm:text-xl font-black text-[#f5c458] uppercase tracking-wider">
                Personagem
              </span>
              <span className="text-[11px] text-[#e2ceaa] font-serif italic">
                Adivinhe a figura bíblica
              </span>
            </span>
          </Link>

          {/* Passagem Card/Button */}
          <Link
            href="/passagem"
            onClick={() => playClickSound()}
            className="pixel-btn-wood p-2.5 sm:p-3 flex items-center justify-start gap-3 text-left group cursor-pointer"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14">
              <img src="/passagem-emoji.svg" alt="" className="h-full w-full object-contain" />
            </span>
            <span className="flex flex-col items-start gap-0.5">
              <span className="text-lg sm:text-xl font-black text-[#f5c458] uppercase tracking-wider">
                Passagem
              </span>
              <span className="text-[11px] text-[#e2ceaa] font-serif italic">
                Adivinhe livro, cap e versículo
              </span>
            </span>
          </Link>
        </div>

        {/* Below those buttons display: Jogos realizados, Sequência atual, Taxa de vitória */}
        <div className="absolute inset-x-0 bottom-0 w-full bg-[#201007]/90 border-4 border-[#472714] p-2 sm:p-3 shadow-2xl">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            {/* Jogos realizados */}
            <div className="flex flex-col items-center justify-center p-2 bg-[#120804] border-2 border-[#381f10]">
              <span className="text-[10px] sm:text-xs font-bold text-[#c7ab7c] uppercase">
                Jogos realizados
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#f5c458] mt-1">
                {isLoaded ? stats.jogosRealizados : 0}
              </span>
            </div>

            {/* Sequência atual */}
            <div className="flex flex-col items-center justify-center p-2 bg-[#120804] border-2 border-[#381f10]">
              <span className="text-[10px] sm:text-xs font-bold text-[#c7ab7c] uppercase">
                Sequência atual
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#4ec25f] mt-1">
                {isLoaded ? stats.sequenciaAtual : 0} 🔥
              </span>
            </div>

            {/* Taxa de vitória */}
            <div className="flex flex-col items-center justify-center p-2 bg-[#120804] border-2 border-[#381f10]">
              <span className="text-[10px] sm:text-xs font-bold text-[#c7ab7c] uppercase">
                Taxa de vitória
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#f5c458] mt-1">
                {isLoaded ? `${winRate}%` : "0%"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </MonasteryBackground>
  );
}

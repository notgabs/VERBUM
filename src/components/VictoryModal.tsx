"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { playClickSound } from "@/utils/sound";

interface VictoryModalProps {
  solutionName: string;
  attemptsCount: number;
  hintsUsedCount: number;
  nextGameHref: string;
  nextGameLabel: string;
  nextGameDescription: string;
  nextGameIcon: string;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  solutionName,
  attemptsCount,
  hintsUsedCount,
  nextGameHref,
  nextGameLabel,
  nextGameDescription,
  nextGameIcon,
}) => {
  useEffect(() => {
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#f5c458", "#e6af2e", "#ffffff", "#4ec25f", "#c98a1a"],
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <section className="w-full max-w-md border-2 border-[#62f3ad] bg-[linear-gradient(180deg,#0e542d_0%,#10271d_100%)] p-5 sm:p-6 text-center text-[#f4ecd8] shadow-[0_0_28px_rgba(98,243,173,0.25)]">
        <h2 className="font-serif text-4xl font-black lowercase leading-none text-white sm:text-5xl">
          amém! amém!
        </h2>

        <div className="mx-auto mt-5 flex w-fit items-center gap-3 text-left">
          <div className="flex h-16 w-16 items-center justify-center border-2 border-white bg-[#183628] p-1">
            <img src="/cubo-interrogacao.svg" alt="Personagem acertado" className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="text-sm font-black">Você acertou</p>
            <p className="font-serif text-2xl font-black text-white">{solutionName}</p>
          </div>
        </div>

        <p className="mt-4 text-sm font-bold">
          Número de tentativas: <span className="text-[#35e8e1]">{attemptsCount}</span>
        </p>
        <p className="mt-1 text-xs text-[#c9e0d1]">Dicas usadas: {hintsUsedCount}</p>

        <div className="my-5 h-px w-36 bg-white/80 mx-auto" />

        <p className="mb-2 font-serif text-xl font-black text-white">Próximo jogo</p>
        <Link
          href={nextGameHref}
          onClick={() => playClickSound()}
          className="mx-auto flex max-w-xs items-center gap-3 border-2 border-[#35e8e1] bg-[#1c2421] p-3 text-left transition-colors hover:bg-[#28342e]"
        >
          <img src={nextGameIcon} alt="" className="h-12 w-12 shrink-0 object-contain" />
          <span>
            <span className="block font-serif text-xl font-black text-white">{nextGameLabel}</span>
            <span className="block text-xs font-bold text-[#d7e7dd]">{nextGameDescription}</span>
          </span>
        </Link>
      </section>
    </div>
  );
};

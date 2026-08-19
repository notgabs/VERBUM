"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { playClickSound } from "@/utils/sound";
import { CharacterPhoto } from "@/components/CharacterPhoto";
import { ModalBase } from "@/components/ModalBase";

import { Button } from "@/components/ui/Button";

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
  onClose?: () => void;
  onReplay?: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = (props) => {
  const isPassage = Boolean(props.passageTitle);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    void import("canvas-confetti").then(({ default: confetti }) => confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 }, colors: ["#f5c458", "#e6af2e", "#ffffff", "#4ec25f", "#c98a1a"] }));
  }, []);

  return (
    <ModalBase label="Vitória" onClose={props.onClose} className="w-full max-w-md border-2 border-[#62f3ad] bg-[linear-gradient(180deg,#0e542d_0%,#10271d_100%)] p-5 sm:p-6 text-center text-[#f4ecd8] shadow-[0_0_28px_rgba(98,243,173,0.25)] animate-fadeIn">
        <h2 className="font-serif text-4xl font-black lowercase leading-none text-white sm:text-5xl">amém! amém!</h2>
        {props.onClose && <Button variant="secondary" onClick={() => { playClickSound(); props.onClose?.(); }} className="mt-4 text-xs uppercase px-4 py-2">Fechar</Button>}

        {isPassage ? (
          <div className="mt-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c9e0d1]">Você acertou a passagem</p>
            <p className="mt-2 font-serif text-2xl font-black leading-tight text-white">{props.passageTitle}</p>
            <div className="mx-auto mt-4 w-fit border-2 border-[#35e8e1] bg-[#10271d] px-4 py-2 font-serif text-lg font-bold text-[#35e8e1]">
              {props.solutionName}
            </div>
            <div className="mt-5 border-2 border-[#f5c458]/70 bg-[#10271d]/80 p-4 text-left shadow-inner">
              <p className="text-xs font-black uppercase tracking-widest text-[#f5c458]">Sobre esta passagem</p>
              <p className="mt-2 font-serif text-base leading-relaxed text-[#f4ecd8]">{props.passageExplanation}</p>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex flex-col items-center text-center">
            <div className={`flex items-center justify-center border-2 border-white bg-[#183628] mx-auto ${props.solutionImage ? "h-28 w-28 sm:h-32 sm:w-32" : "h-16 w-16 p-1"}`}>
              <CharacterPhoto key={props.solutionImageId || props.solutionName} id={props.solutionImageId} image={props.solutionImage} alt={`Imagem de ${props.solutionName}`} className="h-full w-full object-cover" />
            </div>
            
            <p className="mt-3 font-serif text-2xl font-black text-white uppercase">{props.solutionName}</p>

            {props.characterReference && (
              <p className="mt-2 text-sm font-bold text-[#f5c458]">
                📖 {props.characterReference}
              </p>
            )}

            {props.characterKnownFor && (
              <div className="mt-5 border-2 border-[#2875a8] bg-[#f5ecd8] p-4 text-left shadow-inner w-full max-w-sm mx-auto">
                <p className="text-xs font-black uppercase tracking-widest text-[#b57a0d]">Conhecido por</p>
                <p className="mt-2 font-serif text-base leading-relaxed text-[#183c5b]">{props.characterKnownFor}</p>
              </div>
            )}
          </div>
        )}

        <p className="mt-4 text-sm font-bold">Número de tentativas: <span className="text-[#35e8e1]">{props.attemptsCount}</span></p>
        <p className="mt-1 text-xs text-[#c9e0d1]">Dicas usadas: {props.hintsUsedCount}</p>
        {props.onReplay && <Button variant="secondary" onClick={() => { playClickSound(); props.onReplay?.(); }} className="mt-4 text-xs uppercase px-4 py-2">Jogar novamente</Button>}
        <div className="my-5 h-px w-36 bg-white/80 mx-auto" />
        <p className="mb-2 font-serif text-xl font-black text-white">Próximo jogo</p>
        <Link href={props.nextGameHref} onClick={() => playClickSound()} className="mx-auto flex max-w-xs items-center gap-3 border-2 border-[#35e8e1] bg-[#1c2421] p-3 text-left transition-colors hover:bg-[#28342e]">
          <img src={props.nextGameIcon} alt="" className="h-12 w-12 shrink-0 object-contain" />
          <span><span className="block font-serif text-xl font-black text-white">{props.nextGameLabel}</span><span className="block text-xs font-bold text-[#d7e7dd]">{props.nextGameDescription}</span></span>
        </Link>
    </ModalBase>
  );
};

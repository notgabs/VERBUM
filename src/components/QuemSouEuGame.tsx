"use client";

import React, { useState, useMemo, useRef } from "react";
import { QuemSouEu } from "@/types/game";
import { compareQuemSouEu } from "@/game/quemSouEuLogic";
import { useGameStats } from "@/hooks/useGameStats";
import {
  playClickSound,
  playVictorySound,
  playWrongSound,
} from "@/utils/sound";
import { VictoryModal } from "@/components/VictoryModal";
import { normalizeForSearch } from "@/utils/text";
import { selectRandomId } from "@/domain/game/dailyChallenge";
import { useQuemSouEuCatalog } from "@/hooks/useQuemSouEuCatalog";
import { useTimeoutRegistry } from "@/hooks/useTimeoutRegistry";
import { CatalogState } from "@/components/CatalogState";
import { ModalBase } from "@/components/ModalBase";
import { motion, useReducedMotion } from "motion/react";
import { GAME_CONFIG } from "@/config/game";

export const QuemSouEuGame: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(false);
  const [activeOptionIndex, setActiveOptionIndex] = useState(-1);
  const [showIntro, setShowIntro] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  const handleStartGame = () => {
    playClickSound();
    setShowIntro(false);
    schedule(() => setHasStarted(true), 350);
  };

  const { recordGameResult } = useGameStats();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { schedule } = useTimeoutRegistry();
  const { data: catalog, isLoading, error, retry } = useQuemSouEuCatalog();

  const targetPerson = useMemo(() => {
    if (catalog.length === 0) return null;
    const configuredId = GAME_CONFIG.developmentMode ? undefined : undefined;
    const targetId = configuredId ?? selectRandomId(catalog.map((c) => c.id));
    return catalog.find((c) => c.id === targetId) ?? catalog[0];
  }, [catalog]);

  const visibleHintsCount = Math.min(6, guesses.length + 1);

  const handleSelect = (selectedName: string) => {
    if (!targetPerson || isWon) return;

    const normSelected = normalizeForSearch(selectedName);
    const alreadyGuessed = guesses.some((g) => normalizeForSearch(g) === normSelected);
    
    if (alreadyGuessed) {
      setQuery("");
      setActiveDropdown(false);
      setIsShaking(true);
      schedule(() => setIsShaking(false), 400);
      return;
    }

    const { isCorrect } = compareQuemSouEu(selectedName, targetPerson);
    const updatedGuesses = [selectedName, ...guesses];
    
    setGuesses(updatedGuesses);
    setQuery("");
    setActiveDropdown(false);

    if (isCorrect) {
      setIsWon(true);
      playVictorySound();
      void import("canvas-confetti").then(({ default: confetti }) => 
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors: ["#ffd700", "#4ec25f", "#ffffff"] })
      );
      
      const hintsUsed = Math.min(6, guesses.length + 1);
      recordGameResult(true, updatedGuesses.length, hintsUsed);
      schedule(() => setIsVictoryModalOpen(true), 1500);
    } else {
      playWrongSound();
      setIsShaking(true);
      schedule(() => setIsShaking(false), 400);
    }
  };

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return catalog;
    const normQuery = normalizeForSearch(query.trim());
    return catalog.filter(
      (c) =>
        c.aliases.some(a => normalizeForSearch(a).includes(normQuery)) &&
        !guesses.some((g) => normalizeForSearch(g) === normalizeForSearch(c.nome))
    );
  }, [catalog, guesses, query]);

  const replay = () => {
    if (!GAME_CONFIG.allowReplay) return;
    setGuesses([]); 
    setIsWon(false); 
    setIsVictoryModalOpen(false); 
    inputRef.current?.focus();
  };

  if (isLoading || error) return <CatalogState error={error ? error.message : null} onRetry={retry} />;

  return (
    <motion.div
      animate={!shouldReduceMotion && isShaking ? { x: [0, -4, 4, -2, 2, 0] } : {}}
      transition={{ duration: 0.3 }}
      className="w-full max-w-[760px] flex flex-col items-center gap-4"
    >
      {showIntro && (
        <ModalBase
          labelledBy="intro-title"
          onClose={handleStartGame}
          className="bg-[var(--color-bg-app)] w-full max-w-lg border border-[var(--color-border-subtle)] rounded-xl p-6 sm:p-8 shadow-2xl custom-scrollbar"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <h2 id="intro-title" className="font-serif text-2xl font-black uppercase tracking-wider text-[var(--color-text-accent)]">
              Como jogar
            </h2>
            <button
              onClick={handleStartGame}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-app)] text-[var(--color-text-main)] transition-colors hover:bg-[var(--color-border-subtle)]"
              aria-label="Fechar informações"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4 text-[0.95rem] leading-relaxed text-[var(--color-text-main)] font-medium">
            <p>
              Descubra qual é a figura católica (Bíblica, Santo, Papa ou Anjo) por trás das pistas.
            </p>
            <p>
              Você recebe uma pista por vez. Se errar o palpite, uma nova pista é revelada, até o máximo de 6 pistas.
            </p>
            <p>
              O jogo não possui limite de tentativas.
            </p>
          </div>
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleStartGame}
              className="px-6 py-2 bg-[var(--color-text-accent)] text-white font-bold rounded-lg shadow-md hover:scale-105 transition-transform"
            >
              Começar
            </button>
          </div>
        </ModalBase>
      )}

      {/* Title & Subtitle */}
      <div className="text-center -mt-6 sm:-mt-8 mb-2 flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-[var(--color-text-accent)] uppercase drop-shadow-sm">
          Quem Sou Eu?
        </h1>
        <p className="text-xs sm:text-sm font-sans font-bold text-[#183c5b] uppercase tracking-wider opacity-90">
          Descubra quem está por trás das pistas
        </p>
      </div>

      {/* 6 Cards Grid */}
      <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: 6 }).map((_, index) => {
          const isRevealed = index < visibleHintsCount && hasStarted;
          const isNewlyRevealed = index === visibleHintsCount - 1 && !isWon && hasStarted;
          const dicaText = targetPerson?.dicas[index];

          // FULL 3D FLIP CARD
          return (
            <div 
              key={index} 
              className="scene relative w-full h-[160px] sm:h-[180px]" 
              style={{ perspective: "1000px" }}
            >
              <motion.div
                className="card relative w-full h-full"
                initial={false}
                animate={{ rotateY: isRevealed ? 180 : 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                style={{ 
                  transformStyle: "preserve-3d",
                  WebkitTransformStyle: "preserve-3d"
                }}
              >
                {/* FRONT FACE (LOCKED) */}
                <div
                  className="face front absolute inset-0 w-full h-full bg-[#183c5b] border border-[#2875a8] rounded-2xl flex items-center justify-center shadow-md"
                  style={{ 
                    backfaceVisibility: "hidden", 
                    WebkitBackfaceVisibility: "hidden" 
                  }}
                >
                  <span className="text-5xl font-black text-[#f9f6ef] opacity-80 drop-shadow-sm">
                    {index + 1}
                  </span>
                </div>

                {/* BACK FACE (REVEALED) */}
                <div
                  className={`face back absolute inset-0 w-full h-full bg-[#f9f6ef] border rounded-2xl p-4 sm:p-5 flex flex-col items-start text-left shadow-md ${isNewlyRevealed ? "border-[var(--color-text-accent)] ring-1 ring-[var(--color-text-accent)]/50" : "border-[var(--color-border-subtle)]"}`}
                  style={{ 
                    backfaceVisibility: "hidden", 
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)" 
                  }}
                >
                  <h3 className={`text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5 ${isNewlyRevealed ? "text-[var(--color-text-accent)]" : "text-[#b08b3a] opacity-90"}`}>
                    Dica {index + 1}
                  </h3>
                  
                  <div className="flex-1 w-full flex flex-col justify-center">
                    <p className={`font-serif text-[#183c5b] font-semibold ${
                      !dicaText ? "text-[14px] sm:text-[15px] leading-relaxed" 
                      : dicaText.length > 115 ? "text-[12px] sm:text-[12.5px] leading-snug" 
                      : dicaText.length > 85 ? "text-[13px] sm:text-[13.5px] leading-normal" 
                      : "text-[14px] sm:text-[15px] leading-relaxed"
                    }`}>
                      {dicaText}
                    </p>
                  </div>
                  
                  {isNewlyRevealed && (
                    <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-[var(--color-text-accent)]/15 to-transparent pointer-events-none rounded-tr-2xl" />
                  )}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Guess Input & Confirm Button */}
      {!isWon && (
        <div className="w-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-5 sm:p-6 shadow-md flex flex-col gap-3">
          <label htmlFor="quem-search" className="text-[12px] font-black uppercase text-[var(--color-text-main)] tracking-widest">
            Seu Palpite
          </label>
          <div className="relative">
            <input
              id="quem-search"
              autoComplete="off"
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveDropdown(true);
                setActiveOptionIndex(-1);
              }}
              onFocus={() => setActiveDropdown(true)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActiveOptionIndex((index) => Math.min(index + 1, filteredOptions.length - 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActiveOptionIndex((index) => Math.max(index - 1, 0));
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  if (activeDropdown && query.trim().length > 0 && filteredOptions.length > 0) {
                    const indexToSelect = activeOptionIndex >= 0 ? activeOptionIndex : 0;
                    const selected = filteredOptions[indexToSelect];
                    if (selected) { 
                      playClickSound();
                      setQuery(selected.nome);
                      setActiveDropdown(false);
                    }
                  } else {
                    handleSelect(query);
                  }
                } else if (event.key === "Escape") {
                  setActiveDropdown(false);
                  setActiveOptionIndex(-1);
                }
              }}
              placeholder="Digite um nome..."
              className="w-full bg-white text-[#183c5b] border-2 border-[var(--color-border-subtle)] focus:border-[#2875a8] rounded-xl px-4 py-3.5 text-[16px] font-sans font-bold focus:outline-none focus:ring-0 placeholder:text-[#91a0b3] transition-colors shadow-sm"
            />

            {activeDropdown && query.trim().length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -4, scale: shouldReduceMotion ? 1 : 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 z-40 bg-[#1f608c] backdrop-blur-md border border-[#183c5b] rounded-xl shadow-2xl max-h-56 overflow-y-auto py-1 custom-scrollbar"
              >
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((opt, index) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        playClickSound();
                        setQuery(opt.nome);
                        setActiveDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3.5 flex items-center justify-between font-sans transition-colors ${activeOptionIndex === index ? "bg-[#183c5b]" : "hover:bg-[#183c5b]"}`}
                    >
                      <span className="text-[15px] font-bold text-white">{opt.nome}</span>
                      <span className="text-[11px] font-semibold text-[#bce1f7] px-2 py-0.5 rounded bg-[#183c5b]/50 border border-[#bce1f7]/20 uppercase tracking-wide">{opt.tipo}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-4 text-[13px] text-[#bce1f7] font-sans text-center font-medium">
                    Nenhum personagem encontrado
                  </div>
                )}
              </motion.div>
            )}
          </div>

          <motion.button
            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            onClick={() => {
              playClickSound();
              handleSelect(query);
            }}
            disabled={!query.trim()}
            className="w-full mt-2 bg-[var(--color-interactive-surface-hover)] hover:bg-[#0f2a42] disabled:bg-[#dcd4c3] disabled:text-[#9faab5] disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-[13px] py-4 rounded-xl shadow-md disabled:shadow-none transition-all flex items-center justify-center border border-transparent disabled:border-[#dcd4c3]"
          >
            Confirmar Palpite
          </motion.button>
        </div>
      )}

      {/* Guesses History */}
      {guesses.length > 0 && (
        <div className="w-full max-w-[600px] flex flex-wrap gap-2 justify-center mt-2 px-2">
          {guesses.map((g, i) => (
            <div key={i} className="bg-[#fceeed] border border-[#f5c6c4] text-[#9b2a26] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm">
              <span>{g}</span>
              <span className="text-[9px] opacity-70">✕</span>
            </div>
          ))}
        </div>
      )}

      {isVictoryModalOpen && targetPerson && (
        <VictoryModal
          solutionName={targetPerson.nome}
          solutionImage={targetPerson.imagem}
          solutionImageId={targetPerson.personagemId || targetPerson.id}
          attemptsCount={guesses.length + 1}
          hintsUsedCount={Math.min(6, guesses.length + 1)}
          characterKnownFor={targetPerson.conhecidoPor}
          characterType={targetPerson.tipo}
          characterSummary={targetPerson.resumo}
          nextGameHref="/personagem"
          nextGameLabel="Personagem"
          nextGameDescription="Adivinhe por atributos"
          nextGameIcon="/personagem-emoji.svg"
          onClose={() => setIsVictoryModalOpen(false)}
          onReplay={GAME_CONFIG.allowReplay ? replay : undefined}
        />
      )}
    </motion.div>
  );
};

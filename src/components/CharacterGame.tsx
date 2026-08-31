"use client";

import React, { useState, useMemo, useRef } from "react";
import { Personagem, PersonagemGuessComparison, TileMatch } from "@/types/game";
import { comparePersonagem } from "@/game/characterLogic";
import { useGameStats } from "@/hooks/useGameStats";
import {
  playClickSound,
  playRevealSound,
  playVictorySound,
  playCorrectSound,
  playWrongSound,
  playPartialSound,
} from "@/utils/sound";
import { VictoryModal } from "@/components/VictoryModal";
import { CharacterPhoto } from "@/components/CharacterPhoto";
import { normalizeForSearch } from "@/utils/text";
import { GAME_CONFIG } from "@/config/game";
import { selectDailyId, selectRandomId } from "@/domain/game/dailyChallenge";
import { isPersonagem } from "@/domain/game/catalogContracts";
import { useJsonCatalog } from "@/hooks/useJsonCatalog";
import { useTimeoutRegistry } from "@/hooks/useTimeoutRegistry";
import { CatalogState } from "@/components/CatalogState";
import { ModalBase } from "@/components/ModalBase";
import { motion, useReducedMotion } from "motion/react";

export const CharacterGame: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const revealStepDuration = 200;
  const comparisonGridClass =
    "comparison-grid grid w-full grid-cols-[1.3fr_0.9fr_1.2fr_1fr_1.2fr_1.85fr_1.25fr_1.2fr] gap-1";
  const [query, setQuery] = useState("");
  const [guesses, setGuesses] = useState<PersonagemGuessComparison[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [hintsUnlocked, setHintsUnlocked] = useState<{
    h1: boolean;
    h2: boolean;
  }>({ h1: false, h2: false });
  const [activeHint, setActiveHint] = useState<"h1" | "h2" | null>(null);
  const [activeDropdown, setActiveDropdown] = useState(false);
  const [activeOptionIndex, setActiveOptionIndex] = useState(-1);
  const [revealingGuessId, setRevealingGuessId] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  const { recordGameResult } = useGameStats();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { schedule } = useTimeoutRegistry();
  const { data: characters, isLoading, error, retry } = useJsonCatalog("/data/personagens.json", isPersonagem);

  const targetChar = useMemo(() => {
    if (characters.length === 0) return null;
    const configuredId = GAME_CONFIG.developmentMode ? GAME_CONFIG.fixedCharacterId : undefined;
    const dailyId = GAME_CONFIG.enableDailyChallenge ? selectDailyId(characters.map((character) => character.id)) : undefined;
    const targetId = configuredId ?? dailyId ?? selectRandomId(characters.map((character) => character.id));
    return characters.find((character) => character.id === targetId) ?? characters[0];
  }, [characters]);

  const hint1Available = guesses.length >= 6;
  const hint2Available = guesses.length >= 12;

  const handleHintClick = (hint: "h1" | "h2") => {
    const isAvailable = hint === "h1" ? hint1Available : hint2Available;

    if (!isAvailable) return;

    playClickSound();
    setHintsUnlocked((prev) => ({ ...prev, [hint]: true }));
    setActiveHint(hint);
  };

  const handleSelectCharacter = (selected: Personagem) => {
    if (!targetChar || isWon || isRevealing) return;

    const alreadyGuessed = guesses.some((g) => g.character.id === selected.id);
    if (alreadyGuessed) {
      setQuery("");
      setActiveDropdown(false);
      return;
    }

    const result = comparePersonagem(selected, targetChar);
    const updatedGuesses = [result, ...guesses];
    const revealDuration = 8 * revealStepDuration + 250;

    setGuesses(updatedGuesses);
    setRevealingGuessId(selected.id);
    setIsRevealing(true);
    setQuery("");
    setActiveDropdown(false);

    schedule(() => setIsRevealing(false), revealDuration);
    
    const playSoundForMatch = (match: TileMatch | "IMAGE") => {
      if (match === "CORRECT") playCorrectSound();
      else if (match === "PARTIAL") playPartialSound();
      else if (match === "IMAGE") playClickSound(); // Som neutro para a imagem inicial
      else playWrongSound();
    };

    const soundSequence: (TileMatch | "IMAGE")[] = [
      "IMAGE", // 0: Imagem/Nome
      result.sexoMatch, // 1
      result.testamentoMatch, // 2
      result.divisaoMatch, // 3
      result.historiaNaBibliaMatch, // 4
      result.conhecidoPorMatch, // 5
      result.nascimentoMatch, // 6
      result.ocupacaoMatch, // 7
    ];

    soundSequence.forEach((match, index) => {
      schedule(() => playSoundForMatch(match), index * revealStepDuration);
    });

    if (result.isFullyCorrect) {
      setIsWon(true);
      schedule(() => {
        setIsVictoryModalOpen(true);
        playVictorySound();
        void import("canvas-confetti").then(({ default: confetti }) => confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors: ["#ffd700", "#4ec25f", "#ffffff"] }));

        const hintsCount =
          (hintsUnlocked.h1 ? 1 : 0) + (hintsUnlocked.h2 ? 1 : 0);
        recordGameResult(true, updatedGuesses.length, hintsCount);
      }, revealDuration);
    } else {
      setIsShaking(true);
      schedule(() => setIsShaking(false), 400);
    }
  };

  const filteredCharacters = useMemo(() => characters.filter(
    (c) =>
      normalizeForSearch(c.nome).includes(normalizeForSearch(query.trim())) &&
      !guesses.some((g) => g.character.id === c.id)
  ), [characters, guesses, query]);

  const replay = () => {
    if (!GAME_CONFIG.allowReplay) return;
    setGuesses([]); setIsWon(false); setIsVictoryModalOpen(false); setHintsUnlocked({ h1: false, h2: false }); setActiveHint(null); inputRef.current?.focus();
  };

  if (isLoading || error) return <CatalogState error={error} onRetry={retry} />;

  const getTileColor = (match: TileMatch) => {
    switch (match) {
      case "CORRECT":
        return "var(--color-status-correct)";
      case "PARTIAL":
        return "var(--color-status-partial)";
      case "WRONG":
        return "var(--color-status-wrong)";
      default:
        return "var(--color-status-wrong)";
    }
  };

  return (
    <motion.div
      animate={!shouldReduceMotion && isShaking ? { x: [0, -4, 4, -2, 2, 0] } : {}}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl flex flex-col items-center gap-4"
    >
      {/* Title Banner */}
      <div className="bg-[var(--color-bg-app)] border border-[var(--color-border-subtle)] rounded-xl w-full max-w-xl p-6 sm:p-9 text-center relative shadow-[var(--shadow-elevated)]">
        <div className="absolute -top-4 right-4 z-10 flex gap-2">
          <motion.button type="button"
            title="Dica 1"
            disabled={!hint1Available}
            aria-label="Abrir dica 1"
            onClick={() => handleHintClick("h1")}
            animate={hint1Available && !hintsUnlocked.h1 ? { scale: [1, 1.2, 1], boxShadow: ["0 0 0 rgba(0,0,0,0)", "0 0 10px rgba(255,215,0,0.5)", "0 0 0 rgba(0,0,0,0)"] } : { scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`flex h-10 w-10 rounded-full shadow-sm items-center justify-center border text-sm transition-colors ${
              hint1Available
                ? "bg-[var(--color-primary)] border-[var(--color-border-accent)] text-white hover:bg-[var(--color-primary-hover)] cursor-pointer"
                : "bg-[var(--color-surface)] border-[var(--color-border-subtle)] text-[var(--color-text-muted)] opacity-50 cursor-not-allowed"
            }`}
          >
            💡
          </motion.button>
          <motion.button type="button"
            title="Dica 2"
            disabled={!hint2Available}
            aria-label="Abrir dica 2"
            onClick={() => handleHintClick("h2")}
            animate={hint2Available && !hintsUnlocked.h2 ? { scale: [1, 1.2, 1], boxShadow: ["0 0 0 rgba(0,0,0,0)", "0 0 10px rgba(255,215,0,0.5)", "0 0 0 rgba(0,0,0,0)"] } : { scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`flex h-10 w-10 rounded-full shadow-sm items-center justify-center border text-sm transition-colors ${
              hint2Available
                ? "bg-[var(--color-primary)] border-[var(--color-border-accent)] text-white hover:bg-[var(--color-primary-hover)] cursor-pointer"
                : "bg-[var(--color-surface)] border-[var(--color-border-subtle)] text-[var(--color-text-muted)] opacity-50 cursor-not-allowed"
            }`}
          >
            💡
          </motion.button>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-widest text-[var(--color-text-accent)] uppercase flex items-center justify-center gap-2">
          <span>Adivinhe o Personagem</span>
        </h1>
        <p className="text-sm text-[var(--color-text-main)] opacity-80 mt-2 font-medium">
          Digite o nome de uma figura bíblica para comparar seus atributos
        </p>
      </div>

      {/* Autocomplete Search Bar */}
      {!isWon && (
        <div className="relative order-3 w-full max-w-xl">
          <div className="flex gap-2">
            <label htmlFor="character-search" className="sr-only">Nome do personagem</label><input
              id="character-search"
              name="character-search"
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
                  setActiveOptionIndex((index) => Math.min(index + 1, filteredCharacters.length - 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActiveOptionIndex((index) => Math.max(index - 1, 0));
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  if (activeDropdown && query.trim().length > 0 && filteredCharacters.length > 0) {
                    const indexToSelect = activeOptionIndex >= 0 ? activeOptionIndex : 0;
                    const selected = filteredCharacters[indexToSelect];
                    if (selected) { playClickSound(); handleSelectCharacter(selected); }
                  }
                } else if (event.key === "Escape") {
                  setActiveDropdown(false);
                  setActiveOptionIndex(-1);
                }
              }}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={activeDropdown && query.trim().length > 0}
              aria-controls="character-options"
              aria-activedescendant={activeOptionIndex >= 0 ? `character-option-${filteredCharacters[activeOptionIndex]?.id}` : undefined}
              placeholder="Digite o nome"
              className="flex-1 bg-[var(--color-interactive-surface)]/95 text-white border border-[var(--color-interactive-border)] rounded-xl shadow-lg px-4 py-3 text-sm font-sans font-bold focus:outline-none focus:border-[#4693cb] focus:ring-1 focus:ring-[#4693cb] placeholder:text-[var(--color-interactive-text-muted)] transition-colors"
            />
          </div>

          {activeDropdown && query.trim().length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.15 }}
              id="character-options" role="listbox" className="absolute top-full left-0 right-0 mt-2 z-40 bg-[var(--color-interactive-surface)]/95 backdrop-blur-sm border border-[var(--color-interactive-border)] rounded-xl shadow-xl max-h-60 overflow-y-auto py-1 custom-scrollbar">
              {filteredCharacters.length > 0 ? (
                filteredCharacters.map((char, index) => (
                  <button
                    key={char.id}
                    id={`character-option-${char.id}`}
                    onClick={() => {
                      playClickSound();
                      handleSelectCharacter(char);
                    }}
                    role="option" aria-selected={activeOptionIndex === index} className={`w-full text-left px-4 py-3 border-b border-[#2a6894] flex items-center justify-between text-sm font-sans font-bold text-white cursor-pointer transition-colors ${activeOptionIndex === index ? "bg-[var(--color-interactive-surface-hover)]" : "hover:bg-[var(--color-interactive-surface-hover)]"}`}
                  >
                    <span className="flex items-center gap-3">
                      <CharacterPhoto
                        id={char.id}
                        image={char.imagem}
                        alt={`Retrato de ${char.nome}`}
                        className="h-8 w-8 shrink-0 rounded-full border border-[var(--color-interactive-border)] object-cover"
                      />
                      <span>{char.nome}</span>
                    </span>
                    <span className="text-xs text-[var(--color-interactive-text-muted)] font-medium">
                      {char.testamento === "Antigo Testamento" ? "AT" : "NT"}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-[var(--text-muted)] font-sans">
                  Nenhum personagem encontrado.
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {activeHint && targetChar && (
        <ModalBase labelledBy="hint-dialog-title" onClose={() => setActiveHint(null)} className="bg-[var(--color-surface)] w-full max-w-md border border-[var(--border-accent)] rounded-xl p-6 text-center shadow-[var(--shadow-elevated)]">
            <h2 id="hint-dialog-title" className="font-serif text-2xl font-black text-[var(--text-main)] uppercase tracking-wider mb-4">
              Dica {activeHint === "h1" ? "1" : "2"}
            </h2>
            <p className="text-lg text-[var(--text-main)] mb-6">
              {activeHint === "h1" ? targetChar.dica1 : targetChar.dica2}
            </p>
        </ModalBase>
      )}

      {/* Comparison Legend */}
      <div className="order-4 flex flex-wrap items-center justify-center gap-4 text-[10px] sm:text-[11px] font-sans font-bold text-[var(--color-interactive-text)] bg-[var(--color-interactive-surface)]/40 px-4 py-2 rounded-full border border-[var(--color-interactive-border)]/50 shadow-sm backdrop-blur-sm mx-auto mb-2 mt-4">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-[3px] bg-[var(--color-status-correct)] shadow-sm border border-[#1a4a20]"></span> Correto
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-[3px] bg-[var(--color-status-partial)] shadow-sm border border-[#7a5005]"></span> Parcial
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-[3px] bg-[var(--color-status-wrong)] shadow-sm border border-[#521010]"></span> Incorreto
        </span>
      </div>

      {/* Comparison Grid Table - 8 colunas */}
      {guesses.length > 0 && (
        <div className="order-5 w-full overflow-x-auto custom-scrollbar pb-6 px-1">
          <div className="min-w-0 flex flex-col gap-3">
            <div className={`${comparisonGridClass} text-center text-[10px] sm:text-xs font-black uppercase text-[#e2ceaa]`}>
              <div className="comparison-header">Personagem</div>
              <div className="comparison-header">Gênero</div>
              <div className="comparison-header text-[9px] sm:text-xs">Testamento</div>
              <div className="comparison-header">Divisão</div>
              <div className="comparison-header">História na Bíblia</div>
              <div className="comparison-header">Conhecido Por</div>
              <div className="comparison-header">Nascimento</div>
              <div className="comparison-header text-[9px] sm:text-xs">Ocupação</div>
            </div>

            {guesses.map((g) => (
              <div
                key={g.character.id}
                className={`${comparisonGridClass} text-center font-bold items-stretch bg-[var(--color-interactive-surface)]/20 rounded-xl p-1 shadow-sm border border-[var(--color-interactive-border)]/30`}
              >
                <motion.div
                  initial={g.character.id === revealingGuessId ? { opacity: 0, rotateX: shouldReduceMotion ? 0 : -90, scale: shouldReduceMotion ? 1 : 0.9 } : false}
                  animate={{ opacity: 1, rotateX: 0, scale: 1 }}
                  transition={{ duration: 0.15, delay: g.character.id === revealingGuessId ? 0 : 0 }}
                  className="comparison-cell comparison-character-cell"
                  title={g.character.nome}
                >
                  <CharacterPhoto
                    key={g.character.id}
                    id={g.character.id}
                    image={g.character.imagem}
                    alt={`Imagem de ${g.character.nome}`}
                    className="w-full h-full object-contain drop-shadow-md rounded-[0.35rem]"
                  />
                  <span className="character-name-tooltip" role="tooltip">
                    {g.character.nome}
                  </span>
                </motion.div>

                <motion.div
                  initial={g.character.id === revealingGuessId ? { opacity: 0, rotateX: shouldReduceMotion ? 0 : -90, scale: shouldReduceMotion ? 1 : 0.9 } : false}
                  animate={{ opacity: 1, rotateX: 0, scale: 1 }}
                  transition={{ duration: 0.15, delay: g.character.id === revealingGuessId ? 1 * (revealStepDuration / 1000) : 0 }}
                  className="comparison-cell" style={{ backgroundColor: getTileColor(g.sexoMatch) }}>
                  <span>{g.character.sexo}</span>
                </motion.div>

                <motion.div
                  initial={g.character.id === revealingGuessId ? { opacity: 0, rotateX: shouldReduceMotion ? 0 : -90, scale: shouldReduceMotion ? 1 : 0.9 } : false}
                  animate={{ opacity: 1, rotateX: 0, scale: 1 }}
                  transition={{ duration: 0.15, delay: g.character.id === revealingGuessId ? 2 * (revealStepDuration / 1000) : 0 }}
                  className="comparison-cell" style={{ backgroundColor: getTileColor(g.testamentoMatch) }}>
                  <span className="leading-tight">{g.character.testamento}</span>
                </motion.div>

                <motion.div
                  initial={g.character.id === revealingGuessId ? { opacity: 0, rotateX: shouldReduceMotion ? 0 : -90, scale: shouldReduceMotion ? 1 : 0.9 } : false}
                  animate={{ opacity: 1, rotateX: 0, scale: 1 }}
                  transition={{ duration: 0.15, delay: g.character.id === revealingGuessId ? 3 * (revealStepDuration / 1000) : 0 }}
                  className="comparison-cell" style={{ backgroundColor: getTileColor(g.divisaoMatch) }}>
                  <span className="comparison-division-text leading-tight">{g.character.divisao}</span>
                </motion.div>

                <motion.div
                  initial={g.character.id === revealingGuessId ? { opacity: 0, rotateX: shouldReduceMotion ? 0 : -90, scale: shouldReduceMotion ? 1 : 0.9 } : false}
                  animate={{ opacity: 1, rotateX: 0, scale: 1 }}
                  transition={{ duration: 0.15, delay: g.character.id === revealingGuessId ? 4 * (revealStepDuration / 1000) : 0 }}
                  className={`comparison-cell ${g.historiaNaBibliaMatch === "WRONG" && g.historiaNaBibliaComparison !== "EQUAL" ? g.historiaNaBibliaComparison === "HIGHER" ? "character-arrow-up" : "character-arrow-down" : ""}`} style={{ backgroundColor: getTileColor(g.historiaNaBibliaMatch) }}>
                  <span className="comparison-history-text">
                    {g.character.historiaNaBiblia.split(/[;,]/).map((passagem) => (
                      <span key={passagem} className="block">
                        {passagem.trim()}
                      </span>
                    ))}
                  </span>
                </motion.div>

                <motion.div
                  initial={g.character.id === revealingGuessId ? { opacity: 0, rotateX: shouldReduceMotion ? 0 : -90, scale: shouldReduceMotion ? 1 : 0.9 } : false}
                  animate={{ opacity: 1, rotateX: 0, scale: 1 }}
                  transition={{ duration: 0.15, delay: g.character.id === revealingGuessId ? 5 * (revealStepDuration / 1000) : 0 }}
                  className="comparison-cell" style={{ backgroundColor: getTileColor(g.conhecidoPorMatch) }}>
                  <span className="leading-tight">
                    {g.character.conhecidoPor}
                  </span>
                </motion.div>

                <motion.div
                  initial={g.character.id === revealingGuessId ? { opacity: 0, rotateX: shouldReduceMotion ? 0 : -90, scale: shouldReduceMotion ? 1 : 0.9 } : false}
                  animate={{ opacity: 1, rotateX: 0, scale: 1 }}
                  transition={{ duration: 0.15, delay: g.character.id === revealingGuessId ? 6 * (revealStepDuration / 1000) : 0 }}
                  className={`comparison-cell ${g.nascimentoMatch === "WRONG" ? g.nascimentoComparison === "HIGHER" ? "character-arrow-up" : "character-arrow-down" : ""}`} style={{ backgroundColor: getTileColor(g.nascimentoMatch) }}>
                  <span>{g.character.nascimento}</span>
                </motion.div>

                <motion.div
                  initial={g.character.id === revealingGuessId ? { opacity: 0, rotateX: shouldReduceMotion ? 0 : -90, scale: shouldReduceMotion ? 1 : 0.9 } : false}
                  animate={{ opacity: 1, rotateX: 0, scale: 1 }}
                  transition={{ duration: 0.15, delay: g.character.id === revealingGuessId ? 7 * (revealStepDuration / 1000) : 0 }}
                  className="comparison-cell" style={{ backgroundColor: getTileColor(g.ocupacaoMatch) }}>
                  <span className="comparison-occupation-text leading-tight">
                    {g.character.ocupacao}
                  </span>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isWon && isVictoryModalOpen && targetChar && (
        <VictoryModal
          solutionName={targetChar.nome}
          solutionImage={targetChar.imagem}
          solutionImageId={targetChar.id}
          characterReference={targetChar.historiaNaBiblia}
          characterKnownFor={targetChar.conhecidoPor}
          attemptsCount={guesses.length}
          hintsUsedCount={
            (hintsUnlocked.h1 ? 1 : 0) + (hintsUnlocked.h2 ? 1 : 0)
          }
          nextGameHref="/passagem"
          nextGameLabel="Passagem"
          nextGameDescription="Adivinhe livro, capítulo e versículo"
          nextGameIcon="/passagem-emoji.svg"
          onClose={() => setIsVictoryModalOpen(false)}
          onReplay={GAME_CONFIG.allowReplay ? replay : undefined}
        />
      )}
    </motion.div>
  );
};

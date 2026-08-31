"use client";

import React, { useState, useMemo } from "react";
import { Passagem, PassagemGuessComparison } from "@/types/game";
import {
  comparePassagem,
} from "@/game/passageLogic";
import { CATHOLIC_BIBLE_CATALOG, findCatholicBibleBook } from "@/domain/bible/catalog";
import { normalizeForSearch } from "@/utils/text";
import { PASSAGE_EXPLANATIONS } from "@/data/passageExplanations";
import { useGameStats } from "@/hooks/useGameStats";
import {
  playStepperSound,
  playShinySound,
  playClickSound,
  playRevealSound,
  playVictorySound,
  playCorrectSound,
  playWrongSound,
  playPartialSound,
} from "@/utils/sound";
import { VictoryModal } from "@/components/VictoryModal";
import { GAME_CONFIG } from "@/config/game";
import { selectDailyId, selectRandomId } from "@/domain/game/dailyChallenge";
import { isPassagem } from "@/domain/game/catalogContracts";
import { useJsonCatalog } from "@/hooks/useJsonCatalog";
import { useTimeoutRegistry } from "@/hooks/useTimeoutRegistry";
import { CatalogState } from "@/components/CatalogState";
import { ModalBase } from "@/components/ModalBase";
import { Button } from "@/components/ui/Button";
import { motion, useReducedMotion } from "motion/react";

const REVEAL_STEP_DURATION = 300;

const withPastoralHints = (passage: Passagem): Passagem => ({
  ...passage,
  dica1:
    passage.dica1 ??
    `A passagem pertence ao ${passage.testamento}, na seção ${passage.divisao}.`,
  dica2: passage.dica2,
});

const formatPassageReference = (passage: Passagem) => {
  const endChapter = passage.capituloFim ?? passage.capitulo;
  const endVerse = passage.versiculoFim;
  if (!endVerse) return `${passage.livro} ${passage.capitulo}, ${passage.versiculo}`;
  const end = endChapter === passage.capitulo ? endVerse : `${endChapter}, ${endVerse}`;
  return `${passage.livro} ${passage.capitulo}, ${passage.versiculo}-${end}`;
};

const getPassageExplanation = (passage: Passagem) =>
  PASSAGE_EXPLANATIONS[passage.id] ?? passage.contexto ?? passage.texto;

export const PassageGame: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [inputBook, setInputBook] = useState("");
  const [inputChapter, setInputChapter] = useState<number | "">(1);
  const [inputVerse, setInputVerse] = useState<number | "">(1);

  const [guesses, setGuesses] = useState<PassagemGuessComparison[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [invalidFields, setInvalidFields] = useState({ book: false, chapter: false, verse: false });
  const [isRevealing, setIsRevealing] = useState(false);
  const [hintsUnlocked, setHintsUnlocked] = useState<{
    h1: boolean;
    h2: boolean;
  }>({ h1: false, h2: false });
  const [activeHint, setActiveHint] = useState<"h1" | "h2" | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeOptionIndex, setActiveOptionIndex] = useState(-1);

  const { recordGameResult } = useGameStats();
  const { schedule } = useTimeoutRegistry();
  const { data: rawPassages, isLoading, error, retry } = useJsonCatalog("/data/passagens.json", isPassagem);
  const passages = useMemo(() => rawPassages.map(withPastoralHints), [rawPassages]);
  const hint1Available = guesses.length >= 6;
  const hint2Available = guesses.length >= 12;
  const selectedBook = findCatholicBibleBook(inputBook);
  const maxChapter = selectedBook?.versesPerChapter.length ?? 150;
  const maxVerse = selectedBook?.versesPerChapter[(Number(inputChapter) || 1) - 1] ?? 176;

  const updateBook = (book: string) => {
    setInputBook(book);
    const selected = findCatholicBibleBook(book);
    if (!selected) return;

    const chapter = Math.min(Number(inputChapter) || 1, selected.versesPerChapter.length);
    setInputChapter(chapter);
    setInputVerse((verse) => Math.min(Number(verse) || 1, selected.versesPerChapter[chapter - 1]));
  };

  const updateChapter = (chapter: number | "") => {
    if (chapter === "") return setInputChapter("");
    const safeChapter = Math.min(Math.max(1, chapter), maxChapter);
    setInputChapter(safeChapter);
    setInputVerse((verse) => Math.min(Number(verse) || 1, selectedBook?.versesPerChapter[safeChapter - 1] ?? 176));
  };

  const updateVerse = (verse: number | "") => {
    if (verse === "") return setInputVerse("");
    setInputVerse(Math.min(Math.max(1, verse), maxVerse));
  };

  const targetPassage = useMemo(() => {
    if (passages.length === 0) return null;
    const fixedId = GAME_CONFIG.developmentMode ? GAME_CONFIG.fixedPassageId : undefined;
    const dailyId = GAME_CONFIG.enableDailyChallenge ? selectDailyId(passages.map((passage) => passage.id)) : undefined;
    const targetId = fixedId ?? dailyId ?? selectRandomId(passages.map((passage) => passage.id));
    return passages.find((passage) => passage.id === targetId) ?? passages[0];
  }, [passages]);

  const handleHintClick = (hint: "h1" | "h2") => {
    const isAvailable = hint === "h1" ? hint1Available : hint2Available;
    if (!isAvailable) return;

    playClickSound();
    setHintsUnlocked((prev) => ({ ...prev, [hint]: true }));
    setActiveHint(hint);
  };

  const handleSubmitGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPassage || isWon || isRevealing) return;

    const missing = {
      book: !inputBook.trim(),
      chapter: inputChapter === "",
      verse: inputVerse === "",
    };
    if (missing.book || missing.chapter || missing.verse) {
      setInvalidFields(missing);
      return;
    }

    const comparison = comparePassagem(
      inputBook,
      Number(inputChapter),
      Number(inputVerse),
      targetPassage
    );

    const isRepeated = guesses.some(
      (g) => g.livro === comparison.livro && g.capitulo === comparison.capitulo && g.versiculo === comparison.versiculo
    );

    const isBookAlreadyRuledOut = guesses.some(
      (g) => normalizeForSearch(g.livro) === normalizeForSearch(inputBook.trim()) && g.livroComparison !== "EQUAL"
    );

    if (isRepeated || isBookAlreadyRuledOut) {
      setIsShaking(true);
      schedule(() => setIsShaking(false), 400);
      return;
    }

    playClickSound();

    const updated = [comparison, ...guesses];
    setGuesses(updated);
    
    if (comparison.livroComparison !== "EQUAL") {
      setInputBook("");
    }
    
    const revealDuration = 3 * REVEAL_STEP_DURATION;
    setIsRevealing(true);
    
    // Cascata de som para cada coluna do palpite
    schedule(() => {
      if (comparison.livroMatch === "CORRECT") playCorrectSound();
      else playWrongSound();
    }, 0);
    
    schedule(() => {
      if (comparison.capituloMatch === "CORRECT") playCorrectSound();
      else if (comparison.capituloMatch === "PARTIAL") playPartialSound();
      else playWrongSound();
    }, REVEAL_STEP_DURATION);
    
    schedule(() => {
      if (comparison.versiculoMatch === "CORRECT") playCorrectSound();
      else if (comparison.versiculoMatch === "PARTIAL") playPartialSound();
      else playWrongSound();
    }, 2 * REVEAL_STEP_DURATION);

    schedule(() => setIsRevealing(false), revealDuration);

    if (comparison.isFullyCorrect) {
      setIsWon(true);
      schedule(() => {
        setIsVictoryModalOpen(true);
        playVictorySound();
        playShinySound();
        void import("canvas-confetti").then(({ default: confetti }) => confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors: ["#ffd700", "#4ec25f", "#ffffff"] }));
        recordGameResult(true, updated.length, (hintsUnlocked.h1 ? 1 : 0) + (hintsUnlocked.h2 ? 1 : 0));
      }, revealDuration);
    } else {
      setIsShaking(true);
      schedule(() => setIsShaking(false), 400);
    }
  };

  const wronglyGuessedBooks = new Set(
    guesses
      .filter((g) => g.livroComparison !== "EQUAL")
      .map((g) => normalizeForSearch(g.livro))
  );

  const normalizedBookQuery = normalizeForSearch(inputBook.trim());
  const filteredBooks = CATHOLIC_BIBLE_CATALOG
    .filter((book) => !wronglyGuessedBooks.has(normalizeForSearch(book.name)))
    .filter((book) => book.aliases.some((alias) => normalizeForSearch(alias).includes(normalizedBookQuery)))
    .map((book) => book.name);

  const replay = () => {
    if (!GAME_CONFIG.allowReplay) return;
    setGuesses([]); setIsWon(false); setIsVictoryModalOpen(false); setHintsUnlocked({ h1: false, h2: false }); setActiveHint(null); setInputBook(""); setInputChapter(1); setInputVerse(1);
  };

  if (isLoading || error) return <CatalogState error={error} onRetry={retry} />;

  return (
    <motion.div
      animate={!shouldReduceMotion && isShaking ? { x: [0, -4, 4, -2, 2, 0] } : {}}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl flex flex-col items-center gap-4"
    >
      {/* Passage Display Scroll */}
      <div className="bg-[var(--color-bg-app)] border border-[var(--color-border-subtle)] rounded-xl w-full p-6 sm:p-9 text-center relative shadow-[var(--shadow-elevated)]">
        <div className="absolute -top-4 right-4 z-10 flex gap-2">
          <button type="button"
            title="Dica 1"
            disabled={!hint1Available}
            aria-label="Abrir dica 1"
            onClick={() => handleHintClick("h1")}
            className={`flex h-10 w-10 rounded-full shadow-sm items-center justify-center border text-sm transition-colors ${
              hint1Available
                ? "bg-[var(--color-primary)] border-[var(--color-border-accent)] text-white hover:bg-[var(--color-primary-hover)] cursor-pointer"
                : "bg-[var(--color-surface)] border-[var(--color-border-subtle)] text-[var(--color-text-muted)] opacity-50 cursor-not-allowed"
            }`}
          >
            💡
          </button>
          <button type="button"
            title="Dica 2"
            disabled={!hint2Available}
            aria-label="Abrir dica 2"
            onClick={() => handleHintClick("h2")}
            className={`flex h-10 w-10 rounded-full shadow-sm items-center justify-center border text-sm transition-colors ${
              hint2Available
                ? "bg-[var(--color-primary)] border-[var(--color-border-accent)] text-white hover:bg-[var(--color-primary-hover)] cursor-pointer"
                : "bg-[var(--color-surface)] border-[var(--color-border-subtle)] text-[var(--color-text-muted)] opacity-50 cursor-not-allowed"
            }`}
          >
            💡
          </button>
        </div>
        <blockquote className="text-lg sm:text-xl md:text-2xl font-serif italic text-[var(--color-text-main)] font-medium leading-relaxed px-2">
          &ldquo;{targetPassage?.texto}&rdquo;
        </blockquote>
      </div>

      {/* Guess Input Form */}
      {!isWon && (
        <form
          onSubmit={handleSubmitGuess}
          noValidate
          className="order-3 w-full flex flex-col gap-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Book Selector with Dropdown */}
            <div className="relative bg-[var(--color-interactive-surface)] border border-[var(--color-interactive-border)] rounded-xl p-3 shadow-sm">
              <label htmlFor="passage-book" className="block text-[10px] font-sans font-bold uppercase text-[var(--color-interactive-text-muted)] tracking-wider mb-2">
                Livro
              </label>
              <input
                id="passage-book"
                name="passage-book-search"
                autoComplete="off"
                type="text"
                value={inputBook}
                onChange={(e) => {
                  updateBook(e.target.value);
                  setInvalidFields((fields) => ({ ...fields, book: false }));
                  setShowDropdown(true);
                  setActiveOptionIndex(-1);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setShowDropdown(false)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActiveOptionIndex((index) => Math.min(index + 1, filteredBooks.length - 1));
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActiveOptionIndex((index) => Math.max(index - 1, 0));
                  } else if (event.key === "Enter") {
                    if (showDropdown && inputBook.trim().length > 0 && filteredBooks.length > 0) {
                      event.preventDefault();
                      const indexToSelect = activeOptionIndex >= 0 ? activeOptionIndex : 0;
                      const selected = filteredBooks[indexToSelect];
                      if (selected) { updateBook(selected); setShowDropdown(false); }
                    }
                  } else if (event.key === "Escape") {
                    setShowDropdown(false);
                    setActiveOptionIndex(-1);
                  }
                }}
                role="combobox" aria-autocomplete="list" aria-expanded={showDropdown && inputBook.trim().length > 0} aria-controls="passage-book-options" aria-activedescendant={activeOptionIndex >= 0 ? `passage-book-option-${filteredBooks[activeOptionIndex]}` : undefined}
                placeholder="Ex: João..."
                className={`w-full h-[44px] bg-[var(--color-interactive-surface-hover)] text-white border border-[var(--color-border-subtle)]/20 rounded-md px-3 text-sm font-bold focus:outline-none focus:border-white/50 ${invalidFields.book ? "border-[var(--color-status-wrong)] animate-input-shake" : ""}`}
              />

              {showDropdown && inputBook.trim().length > 0 && (
                <div 
                  id="passage-book-options" 
                  role="listbox" 
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute top-[calc(100%+4px)] left-0 right-0 z-40 bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] rounded-xl shadow-[var(--shadow-elevated)] max-h-48 overflow-y-auto py-1"
                >
                  {filteredBooks.map((b, index) => (
                    <button
                      key={b}
                      id={`passage-book-option-${b}`}
                      type="button"
                      onClick={() => {
                        updateBook(b);
                        setShowDropdown(false);
                        setActiveOptionIndex(-1);
                      }}
                      role="option" aria-selected={activeOptionIndex === index} className={`w-full text-left px-3 py-2.5 text-sm font-bold text-[var(--color-text-main)] hover:bg-[var(--color-status-correct-bg)] border-b border-[var(--color-border-subtle)] last:border-0 ${activeOptionIndex === index ? "bg-[var(--color-status-correct-bg)]" : ""}`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chapter Input */}
            <div className="bg-[var(--color-interactive-surface)] border border-[var(--color-interactive-border)] rounded-xl p-3 shadow-sm">
              <label htmlFor="passage-chapter" className="block text-[10px] font-sans font-bold uppercase text-[var(--color-interactive-text-muted)] tracking-wider mb-2">
                Capítulo
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Diminuir capítulo"
                  onClick={() => { playStepperSound(); updateChapter(Math.max(1, (Number(inputChapter) || 1) - 1)); }}
                  className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-md border border-[var(--color-border-subtle)]/20 bg-[var(--color-interactive-surface-hover)] text-white font-bold transition-colors hover:bg-[var(--color-interactive-surface-hover)] hover:opacity-80 active:opacity-60 shadow-sm"
                >
                  -
                </button>
                <input
                  id="passage-chapter" type="number"
                  min={1}
                  max={maxChapter}
                  value={inputChapter}
                  onChange={(e) => { updateChapter(e.target.value === "" ? "" : Number(e.target.value)); setInvalidFields((fields) => ({ ...fields, chapter: false })); }}
                  className={`number-input-no-spinner flex-1 w-full text-center bg-transparent text-white font-sans font-bold text-xl h-[44px] focus:outline-none ${invalidFields.chapter ? "text-[var(--color-status-wrong)] animate-input-shake" : ""}`}
                />
                <button
                  type="button"
                  aria-label="Aumentar capítulo"
                  onClick={() => { playStepperSound(); updateChapter((Number(inputChapter) || 0) + 1); }}
                  className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-md border border-[var(--color-border-subtle)]/20 bg-[var(--color-interactive-surface-hover)] text-white font-bold transition-colors hover:bg-[var(--color-interactive-surface-hover)] hover:opacity-80 active:opacity-60 shadow-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Verse Input */}
            <div className="bg-[var(--color-interactive-surface)] border border-[var(--color-interactive-border)] rounded-xl p-3 shadow-sm">
              <label htmlFor="passage-verse" className="block text-[10px] font-sans font-bold uppercase text-[var(--color-interactive-text-muted)] tracking-wider mb-2">
                Versículo
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Diminuir versículo"
                  onClick={() => { playStepperSound(); updateVerse(Math.max(1, (Number(inputVerse) || 1) - 1)); }}
                  className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-md border border-[var(--color-border-subtle)]/20 bg-[var(--color-interactive-surface-hover)] text-white font-bold transition-colors hover:bg-[var(--color-interactive-surface-hover)] hover:opacity-80 active:opacity-60 shadow-sm"
                >
                  -
                </button>
                <input
                  id="passage-verse" type="number"
                  min={1}
                  max={maxVerse}
                  value={inputVerse}
                  onChange={(e) => { updateVerse(e.target.value === "" ? "" : Number(e.target.value)); setInvalidFields((fields) => ({ ...fields, verse: false })); }}
                  className={`number-input-no-spinner flex-1 w-full text-center bg-transparent text-white font-sans font-bold text-xl h-[44px] focus:outline-none ${invalidFields.verse ? "text-[var(--color-status-wrong)] animate-input-shake" : ""}`}
                />
                <button
                  type="button"
                  aria-label="Aumentar versículo"
                  onClick={() => { playStepperSound(); updateVerse((Number(inputVerse) || 0) + 1); }}
                  className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-md border border-[var(--color-border-subtle)]/20 bg-[var(--color-interactive-surface-hover)] text-white font-bold transition-colors hover:bg-[var(--color-interactive-surface-hover)] hover:opacity-80 active:opacity-60 shadow-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 h-14 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl shadow-md text-[var(--color-text-main)] font-serif font-black text-lg uppercase tracking-widest hover:bg-[var(--color-surface-elevated)] hover:shadow-lg active:translate-y-[1px] active:shadow-none transition-all duration-200 cursor-pointer flex items-center justify-center"
          >
            Confirmar Palpite
          </button>
        </form>
      )}

      {/* Guesses List */}
      {guesses.length > 0 && (
        <div className="order-4 w-full flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-black uppercase text-[#e2ceaa]">
            <div className="passage-grid-header">Livro</div>
            <div className="passage-grid-header">Capítulo</div>
            <div className="passage-grid-header">Versículo</div>
          </div>

          {guesses.map((g, i) => (
            <div
              key={`${g.livro}-${g.capitulo}-${g.versiculo}-${guesses.length - i}`}
              className="grid grid-cols-3 gap-2 text-center text-xs font-bold"
            >
              {/* Book Tile */}
              <motion.div
                initial={i === 0 && isRevealing ? { opacity: 0, rotateX: shouldReduceMotion ? 0 : -90, scale: shouldReduceMotion ? 1 : 0.9 } : false}
                animate={{ opacity: 1, rotateX: 0, scale: 1 }}
                transition={{ duration: 0.15, delay: i === 0 && isRevealing ? 0 : 0 }}
                className={`passage-result-tile ${
                  g.livroComparison === "EQUAL"
                    ? "bg-[var(--color-status-correct)] text-white"
                    : `bg-[var(--color-status-wrong)] text-white ${
                        g.livroComparison === "HIGHER"
                          ? "passage-arrow-up"
                          : "passage-arrow-down"
                      }`
                }`}
              >
                <span>{g.livro}</span>
              </motion.div>

              {/* Chapter Tile */}
              <motion.div
                initial={i === 0 && isRevealing ? { opacity: 0, rotateX: shouldReduceMotion ? 0 : -90, scale: shouldReduceMotion ? 1 : 0.9 } : false}
                animate={{ opacity: 1, rotateX: 0, scale: 1 }}
                transition={{ duration: 0.15, delay: i === 0 && isRevealing ? 1 * (REVEAL_STEP_DURATION / 1000) : 0 }}
                className={`passage-result-tile ${
                  g.capituloMatch === "CORRECT"
                    ? "bg-[var(--color-status-correct)] text-white"
                    : g.capituloMatch === "PARTIAL"
                    ? `bg-[var(--color-status-partial)] text-white ${
                        g.capituloComparison === "HIGHER"
                          ? "passage-arrow-up-yellow"
                          : "passage-arrow-down-yellow"
                      }`
                    : `bg-[var(--color-status-wrong)] text-white ${
                        g.capituloComparison === "HIGHER"
                          ? "passage-arrow-up"
                          : "passage-arrow-down"
                      }`
                }`}
              >
                <span>{g.capitulo}</span>
              </motion.div>

              {/* Verse Tile */}
              <motion.div
                initial={i === 0 && isRevealing ? { opacity: 0, rotateX: shouldReduceMotion ? 0 : -90, scale: shouldReduceMotion ? 1 : 0.9 } : false}
                animate={{ opacity: 1, rotateX: 0, scale: 1 }}
                transition={{ duration: 0.15, delay: i === 0 && isRevealing ? 2 * (REVEAL_STEP_DURATION / 1000) : 0 }}
                className={`passage-result-tile ${
                  g.versiculoMatch === "CORRECT"
                    ? "bg-[var(--color-status-correct)] text-white"
                    : g.versiculoMatch === "PARTIAL"
                    ? `bg-[var(--color-status-partial)] text-white ${
                        g.versiculoComparison === "HIGHER"
                          ? "passage-arrow-up-yellow"
                          : "passage-arrow-down-yellow"
                      }`
                    : `bg-[var(--color-status-wrong)] text-white ${
                        g.versiculoComparison === "HIGHER"
                          ? "passage-arrow-up"
                          : "passage-arrow-down"
                      }`
                }`}
              >
                <span>{g.versiculo}</span>
              </motion.div>
            </div>
          ))}
        </div>
      )}

      {activeHint && targetPassage && (
        <ModalBase labelledBy="hint-dialog-title" onClose={() => setActiveHint(null)} className="bg-[var(--color-surface)] w-full max-w-md border border-[var(--border-accent)] rounded-xl p-6 text-center shadow-[var(--shadow-elevated)]">
          <h2 id="hint-dialog-title" className="font-serif text-2xl font-black text-[var(--text-main)] uppercase tracking-wider mb-4">
            Dica {activeHint === "h1" ? "1" : "2"}
          </h2>
          <p className="text-lg text-[var(--text-main)] mb-6">
            {activeHint === "h1" ? targetPassage.dica1 : targetPassage.dica2}
          </p>
        </ModalBase>
      )}

      {/* Victory Modal */}
      {isWon && isVictoryModalOpen && targetPassage && (
        <VictoryModal
          solutionName={formatPassageReference(targetPassage)}
          passageTitle={targetPassage.texto}
          passageExplanation={getPassageExplanation(targetPassage)}
          attemptsCount={guesses.length}
          hintsUsedCount={
            (hintsUnlocked.h1 ? 1 : 0) + (hintsUnlocked.h2 ? 1 : 0)
          }
          nextGameHref="/"
          nextGameLabel="Início"
          nextGameDescription="Escolha seu próximo desafio"
          nextGameIcon="/personagem-emoji.svg"
          onReplay={GAME_CONFIG.allowReplay ? replay : undefined}
          onClose={() => setIsVictoryModalOpen(false)}
        />
      )}
    </motion.div>
  );
};

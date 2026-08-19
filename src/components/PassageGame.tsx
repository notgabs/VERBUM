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
} from "@/utils/sound";
import { VictoryModal } from "@/components/VictoryModal";
import { GAME_CONFIG } from "@/config/game";
import { selectDailyId, selectRandomId } from "@/domain/game/dailyChallenge";
import { isPassagem } from "@/domain/game/catalogContracts";
import { useJsonCatalog } from "@/hooks/useJsonCatalog";
import { useTimeoutRegistry } from "@/hooks/useTimeoutRegistry";
import { CatalogState } from "@/components/CatalogState";
import { ModalBase } from "@/components/ModalBase";

const REVEAL_STEP_DURATION = 350;

const withPastoralHints = (passage: Passagem): Passagem => ({
  ...passage,
  dica1:
    passage.dica1 ??
    `A passagem pertence ao ${passage.testamento}, na seção ${passage.divisao}.`,
  dica2:
    passage.dica2 ??
    `Procure ${passage.livro}, capítulo ${passage.capitulo}. O tema é: ${passage.texto}`,
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

    const updated = [comparison, ...guesses];
    setGuesses(updated);
    const revealDuration = 3 * REVEAL_STEP_DURATION;
    setIsRevealing(true);
    schedule(() => setIsRevealing(false), revealDuration);

    if (comparison.isFullyCorrect) {
      setIsWon(true);
      schedule(() => {
        setIsVictoryModalOpen(true);
        playShinySound();
        void import("canvas-confetti").then(({ default: confetti }) => confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors: ["#ffd700", "#4ec25f", "#ffffff"] }));
        recordGameResult(true, updated.length, (hintsUnlocked.h1 ? 1 : 0) + (hintsUnlocked.h2 ? 1 : 0));
      }, revealDuration);
    } else {
      setIsShaking(true);
      schedule(() => setIsShaking(false), 400);
    }
  };

  const normalizedBookQuery = normalizeForSearch(inputBook.trim());
  const filteredBooks = CATHOLIC_BIBLE_CATALOG
    .filter((book) => book.aliases.some((alias) => normalizeForSearch(alias).includes(normalizedBookQuery)))
    .map((book) => book.name);

  const replay = () => {
    if (!GAME_CONFIG.allowReplay) return;
    setGuesses([]); setIsWon(false); setIsVictoryModalOpen(false); setHintsUnlocked({ h1: false, h2: false }); setActiveHint(null); setInputBook(""); setInputChapter(1); setInputVerse(1);
  };

  if (isLoading || error) return <CatalogState error={error} onRetry={retry} />;

  return (
    <div
      className={`w-full max-w-2xl flex flex-col items-center gap-4 ${
        isShaking ? "animate-shake" : ""
      }`}
    >
      {/* Passage Display Scroll */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl w-full p-6 sm:p-9 text-center relative shadow-[var(--shadow-elevated)]">
        <div className="absolute -top-4 right-4 z-10 flex gap-2">
          <button type="button"
            title="Dica 1"
            disabled={!hint1Available}
            aria-label="Abrir dica 1"
            onClick={() => handleHintClick("h1")}
            className={`flex h-10 w-10 rounded-full shadow-sm items-center justify-center border text-sm transition-colors ${
              hint1Available
                ? "bg-[var(--primary)] border-[var(--border-accent)] text-white hover:bg-[var(--primary-hover)] cursor-pointer"
                : "bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-muted)] cursor-not-allowed"
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
                ? "bg-[var(--primary)] border-[var(--border-accent)] text-white hover:bg-[var(--primary-hover)] cursor-pointer"
                : "bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-muted)] cursor-not-allowed"
            }`}
          >
            💡
          </button>
        </div>
        <blockquote className="text-lg sm:text-xl md:text-2xl font-serif italic text-[var(--text-main)] leading-relaxed px-2">
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
            <div className="relative pixel-box p-3">
              <label htmlFor="passage-book" className="block text-[10px] font-black uppercase text-[#f5c458] mb-1">
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
                }}
                onFocus={() => setShowDropdown(true)}
                role="combobox" aria-autocomplete="list" aria-expanded={showDropdown && inputBook.trim().length > 0} aria-controls="passage-book-options"
                placeholder="Ex: João, Salmos..."
                className={`w-full bg-[#fffaf0] text-[#183c5b] border-2 px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#e3ab32] ${invalidFields.book ? "border-[#d83a32] animate-input-shake" : "border-[#2875a8]"}`}
              />

              {showDropdown && inputBook.trim().length > 0 && (
                <div id="passage-book-options" role="listbox" className="absolute top-full left-0 right-0 z-40 bg-[#f5ecd8] border-2 border-[#2875a8] max-h-48 overflow-y-auto mt-1">
                  {filteredBooks.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        updateBook(b);
                        setShowDropdown(false);
                      }}
                      role="option" aria-selected="false" className="w-full text-left px-3 py-1.5 text-xs text-[#183c5b] hover:bg-[#dceefa] border-b border-[#b5d5e8]"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chapter Input */}
            <div className="pixel-box p-3">
              <label htmlFor="passage-chapter" className="block text-[10px] font-black uppercase text-[#f5c458] mb-1">
                Capítulo
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => { playStepperSound(); updateChapter(Math.max(1, (Number(inputChapter) || 1) - 1)); }}
                  className="pixel-btn-wood px-2.5 py-1.5 text-xs font-black cursor-pointer"
                >
                  -
                </button>
                <input
                  id="passage-chapter" type="number"
                  min={1}
                  max={maxChapter}
                  value={inputChapter}
                  onChange={(e) => { updateChapter(e.target.value === "" ? "" : Number(e.target.value)); setInvalidFields((fields) => ({ ...fields, chapter: false })); }}
                  className={`number-input-no-spinner w-full text-center bg-[#180e07] text-[#f4ecd8] border-y-2 py-2 text-xs font-bold ${invalidFields.chapter ? "border-[#d83a32] animate-input-shake" : "border-[#52311c]"}`}
                />
                <button
                  type="button"
                  onClick={() => { playStepperSound(); updateChapter((Number(inputChapter) || 0) + 1); }}
                  className="pixel-btn-wood px-2.5 py-1.5 text-xs font-black cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Verse Input */}
            <div className="pixel-box p-3">
              <label htmlFor="passage-verse" className="block text-[10px] font-black uppercase text-[#f5c458] mb-1">
                Versículo
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => { playStepperSound(); updateVerse(Math.max(1, (Number(inputVerse) || 1) - 1)); }}
                  className="pixel-btn-wood px-2.5 py-1.5 text-xs font-black cursor-pointer"
                >
                  -
                </button>
                <input
                  id="passage-verse" type="number"
                  min={1}
                  max={maxVerse}
                  value={inputVerse}
                  onChange={(e) => { updateVerse(e.target.value === "" ? "" : Number(e.target.value)); setInvalidFields((fields) => ({ ...fields, verse: false })); }}
                  className={`number-input-no-spinner w-full text-center bg-[#180e07] text-[#f4ecd8] border-y-2 py-2 text-xs font-bold ${invalidFields.verse ? "border-[#d83a32] animate-input-shake" : "border-[#52311c]"}`}
                />
                <button
                  type="button"
                  onClick={() => { playStepperSound(); updateVerse((Number(inputVerse) || 0) + 1); }}
                  className="pixel-btn-wood px-2.5 py-1.5 text-xs font-black cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="pixel-btn-gold py-2.5 px-4 font-black uppercase text-xs sm:text-sm tracking-wider cursor-pointer mt-1"
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
              key={i}
              className="grid grid-cols-3 gap-2 text-center text-xs font-bold"
            >
              {/* Book Tile */}
              <div
                className={`passage-result-tile ${i === 0 && isRevealing ? "animate-passage-reveal" : ""} ${
                  g.livroComparison === "EQUAL"
                    ? (g.livroMatch === "CORRECT" ? "pixel-tile-green" : "pixel-tile-red")
                    : `pixel-tile-red ${
                        g.livroComparison === "HIGHER"
                          ? "passage-arrow-up"
                          : "passage-arrow-down"
                      }`
                }`}
                style={
                  i === 0 && isRevealing
                    ? { animationDelay: "0ms" }
                    : undefined
                }
              >
                <span>{g.livro}</span>
              </div>

              {/* Chapter Tile */}
              <div
                className={`passage-result-tile ${i === 0 && isRevealing ? "animate-passage-reveal" : ""} ${
                  g.capituloComparison === "EQUAL"
                    ? "pixel-tile-green"
                    : `pixel-tile-red ${
                        g.capituloComparison === "HIGHER"
                          ? "passage-arrow-up"
                          : "passage-arrow-down"
                      }`
                }`}
                style={
                  i === 0 && isRevealing
                    ? { animationDelay: `${REVEAL_STEP_DURATION}ms` }
                    : undefined
                }
              >
                <span>{g.capitulo}</span>
              </div>

              {/* Verse Tile */}
              <div
                className={`passage-result-tile ${i === 0 && isRevealing ? "animate-passage-reveal" : ""} ${
                  g.versiculoComparison === "EQUAL"
                    ? "pixel-tile-green"
                    : `pixel-tile-red ${
                        g.versiculoComparison === "HIGHER"
                          ? "passage-arrow-up"
                          : "passage-arrow-down"
                      }`
                }`}
                style={
                  i === 0 && isRevealing
                    ? { animationDelay: `${2 * REVEAL_STEP_DURATION}ms` }
                    : undefined
                }
              >
                <span>{g.versiculo}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeHint && targetPassage && (
        <ModalBase labelledBy="hint-dialog-title" onClose={() => setActiveHint(null)} className="bg-[var(--bg-surface)] w-full max-w-md border border-[var(--border-accent)] rounded-xl p-6 text-center shadow-[var(--shadow-elevated)]">
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
    </div>
  );
};

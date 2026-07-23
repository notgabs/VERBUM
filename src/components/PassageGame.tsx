"use client";

import React, { useState, useEffect } from "react";
import { Passagem, PassagemGuessComparison } from "@/types/game";
import {
  comparePassagem,
} from "@/game/passageLogic";
import { useGameStats } from "@/hooks/useGameStats";
import {
  playClickSound,
  playWrongSound,
  playVictorySound,
} from "@/utils/sound";
import { VictoryModal } from "@/components/VictoryModal";
import confetti from "canvas-confetti";

const BIBLE_BOOKS = [
  "Gênesis",
  "Êxodo",
  "Levítico",
  "Números",
  "Deuteronômio",
  "Josué",
  "Juízes",
  "Rute",
  "1 Samuel",
  "2 Samuel",
  "1 Reis",
  "2 Reis",
  "Salmos",
  "Provérbios",
  "Isaías",
  "Jeremias",
  "Mateus",
  "Marcos",
  "Lucas",
  "João",
  "Atos",
  "Romanos",
  "1 Coríntios",
  "2 Coríntios",
  "Gálatas",
  "Efésios",
  "Filipenses",
  "Colossenses",
  "Hebreus",
  "Tiago",
  "1 Pedro",
  "1 João",
  "Apocalipse",
];

export const PassageGame: React.FC = () => {
  const [passages, setPassages] = useState<Passagem[]>([]);
  const [targetPassage, setTargetPassage] = useState<Passagem | null>(null);

  const [inputBook, setInputBook] = useState("");
  const [inputChapter, setInputChapter] = useState<number>(1);
  const [inputVerse, setInputVerse] = useState<number>(1);

  const [guesses, setGuesses] = useState<PassagemGuessComparison[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [hintsUnlocked, setHintsUnlocked] = useState<{
    h1: boolean;
    h2: boolean;
  }>({ h1: false, h2: false });
  const [showDropdown, setShowDropdown] = useState(false);

  const { recordGameResult } = useGameStats();

  useEffect(() => {
    fetch("/data/passagens.json")
      .then((res) => res.json())
      .then((data: Passagem[]) => {
        setPassages(data);
        if (data.length > 0) {
          const rand = data[Math.floor(Math.random() * data.length)];
          setTargetPassage(rand);
        }
      })
      .catch((err) => console.error("Error loading passages:", err));
  }, []);

  useEffect(() => {
    if (guesses.length >= 3) {
      setHintsUnlocked((prev) => ({ ...prev, h1: true }));
    }
    if (guesses.length >= 6) {
      setHintsUnlocked((prev) => ({ ...prev, h2: true }));
    }
  }, [guesses.length]);

  const handleSubmitGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPassage || isWon || !inputBook.trim()) return;

    playClickSound();

    const comparison = comparePassagem(
      inputBook,
      Number(inputChapter),
      Number(inputVerse),
      targetPassage
    );

    const updated = [comparison, ...guesses];
    setGuesses(updated);

    if (comparison.isFullyCorrect) {
      setIsWon(true);
      playVictorySound();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#ffd700", "#4ec25f", "#ffffff"],
      });

      const hintsCount =
        (hintsUnlocked.h1 ? 1 : 0) + (hintsUnlocked.h2 ? 1 : 0);
      recordGameResult(true, updated.length, hintsCount);
    } else {
      playWrongSound();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
    }
  };

  const filteredBooks = BIBLE_BOOKS.filter((b) =>
    b.toLowerCase().includes(inputBook.toLowerCase().trim())
  );

  return (
    <div
      className={`w-full max-w-2xl flex flex-col items-center gap-4 ${
        isShaking ? "animate-shake" : ""
      }`}
    >
      {/* Passage Display Scroll */}
      <div className="pixel-parchment w-full p-6 sm:p-9 text-center relative shadow-2xl">
        <div className="absolute -top-10 left-0 z-10 flex gap-1">
          <div
            title="Dica 1"
            className={`flex h-8 w-8 items-center justify-center border-2 text-sm ${
              hintsUnlocked.h1
                ? "border-[#b57a0d] bg-[#f5c458] text-[#2b1810]"
                : "border-[#382112] bg-[#2b1f13] text-[#6b513c]"
            }`}
          >
            💡
          </div>
          <div
            title="Dica 2"
            className={`flex h-8 w-8 items-center justify-center border-2 text-sm ${
              hintsUnlocked.h2
                ? "border-[#b57a0d] bg-[#f5c458] text-[#2b1810]"
                : "border-[#382112] bg-[#2b1f13] text-[#6b513c]"
            }`}
          >
            💡
          </div>
        </div>
        <blockquote className="text-lg sm:text-xl md:text-2xl font-serif italic font-bold text-[#261308] leading-relaxed px-2">
          &ldquo;{targetPassage?.texto}&rdquo;
        </blockquote>
      </div>

      {/* Guess Input Form */}
      {!isWon && (
        <form
          onSubmit={handleSubmitGuess}
          className="order-3 w-full flex flex-col gap-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Book Selector with Dropdown */}
            <div className="relative pixel-box p-3">
              <label className="block text-[10px] font-black uppercase text-[#f5c458] mb-1">
                Livro
              </label>
              <input
                type="text"
                value={inputBook}
                onChange={(e) => {
                  setInputBook(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Ex: João, Salmos..."
                required
                className="w-full bg-[#180e07] text-[#f4ecd8] border-2 border-[#52311c] px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#f5c458]"
              />

              {showDropdown && inputBook.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 z-40 bg-[#2b1810] border-2 border-[#52311c] max-h-48 overflow-y-auto mt-1">
                  {filteredBooks.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setInputBook(b);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#f5eedc] hover:bg-[#4a2b1b] border-b border-[#381e10]"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chapter Input */}
            <div className="pixel-box p-3">
              <label className="block text-[10px] font-black uppercase text-[#f5c458] mb-1">
                Capítulo
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setInputChapter((c) => Math.max(1, c - 1))}
                  className="pixel-btn-wood px-2.5 py-1.5 text-xs font-black cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={150}
                  value={inputChapter}
                  onChange={(e) => setInputChapter(Number(e.target.value))}
                  required
                  className="w-full text-center bg-[#180e07] text-[#f4ecd8] border-y-2 border-[#52311c] py-2 text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={() => setInputChapter((c) => c + 1)}
                  className="pixel-btn-wood px-2.5 py-1.5 text-xs font-black cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Verse Input */}
            <div className="pixel-box p-3">
              <label className="block text-[10px] font-black uppercase text-[#f5c458] mb-1">
                Versículo
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setInputVerse((v) => Math.max(1, v - 1))}
                  className="pixel-btn-wood px-2.5 py-1.5 text-xs font-black cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={176}
                  value={inputVerse}
                  onChange={(e) => setInputVerse(Number(e.target.value))}
                  required
                  className="w-full text-center bg-[#180e07] text-[#f4ecd8] border-y-2 border-[#52311c] py-2 text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={() => setInputVerse((v) => v + 1)}
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

      {/* Hints Cards */}
      <div className="hidden order-2 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          className={`p-3 border-2 ${
            hintsUnlocked.h1
              ? "bg-[#2b1f13] border-[#f5c458] text-[#f4ecd8]"
              : "bg-[#160d07] border-[#382112] text-[#6b513c]"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-black uppercase mb-1">
            <span>💡 Dica 1 (3 tentativas)</span>
            <span>{hintsUnlocked.h1 ? "🔓 Revelada" : "🔒 Bloqueada"}</span>
          </div>
          <p className="text-xs font-serif italic">
            {hintsUnlocked.h1
              ? targetPassage?.dica1
              : `Faltam ${Math.max(0, 3 - guesses.length)} tentativa(s).`}
          </p>
        </div>

        <div
          className={`p-3 border-2 ${
            hintsUnlocked.h2
              ? "bg-[#2b1f13] border-[#f5c458] text-[#f4ecd8]"
              : "bg-[#160d07] border-[#382112] text-[#6b513c]"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-black uppercase mb-1">
            <span>💡 Dica 2 (6 tentativas)</span>
            <span>{hintsUnlocked.h2 ? "🔓 Revelada" : "🔒 Bloqueada"}</span>
          </div>
          <p className="text-xs font-serif italic">
            {hintsUnlocked.h2
              ? targetPassage?.dica2
              : `Faltam ${Math.max(0, 6 - guesses.length)} tentativa(s).`}
          </p>
        </div>
      </div>

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
                className={`passage-result-tile ${
                  g.livroMatch === "CORRECT"
                    ? "pixel-tile-green"
                    : "pixel-tile-red"
                }`}
              >
                <span>{g.livro}</span>
              </div>

              {/* Chapter Tile */}
              <div
                className={`passage-result-tile ${
                  g.capituloComparison === "EQUAL"
                    ? "pixel-tile-green"
                    : `pixel-tile-red ${
                        g.capituloComparison === "HIGHER"
                          ? "passage-arrow-up"
                          : "passage-arrow-down"
                      }`
                }`}
              >
                <span>{g.capitulo}</span>
              </div>

              {/* Verse Tile */}
              <div
                className={`passage-result-tile ${
                  g.versiculoComparison === "EQUAL"
                    ? "pixel-tile-green"
                    : `pixel-tile-red ${
                        g.versiculoComparison === "HIGHER"
                          ? "passage-arrow-up"
                          : "passage-arrow-down"
                      }`
                }`}
              >
                <span>{g.versiculo}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Victory Modal */}
      {isWon && targetPassage && (
        <VictoryModal
          solutionName={`${targetPassage.livro} ${targetPassage.capitulo}:${targetPassage.versiculo}`}
          attemptsCount={guesses.length}
          hintsUsedCount={
            (hintsUnlocked.h1 ? 1 : 0) + (hintsUnlocked.h2 ? 1 : 0)
          }
          nextGameHref="/"
          nextGameLabel="Início"
          nextGameDescription="Escolha seu próximo desafio"
          nextGameIcon="/personagem-emoji.svg"
        />
      )}
    </div>
  );
};

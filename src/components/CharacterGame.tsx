"use client";

import React, { useState, useEffect, useRef } from "react";
import { Personagem, PersonagemGuessComparison, TileMatch } from "@/types/game";
import {
  comparePersonagem,
} from "@/game/characterLogic";
import { useGameStats } from "@/hooks/useGameStats";
import {
  playClickSound,
  playCorrectSound,
  playWrongSound,
  playVictorySound,
} from "@/utils/sound";
import { VictoryModal } from "@/components/VictoryModal";
import confetti from "canvas-confetti";

export const CharacterGame: React.FC = () => {
  const [characters, setCharacters] = useState<Personagem[]>([]);
  const [targetChar, setTargetChar] = useState<Personagem | null>(null);
  const [query, setQuery] = useState("");
  const [guesses, setGuesses] = useState<PersonagemGuessComparison[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [hintsUnlocked, setHintsUnlocked] = useState<{
    h1: boolean;
    h2: boolean;
  }>({ h1: false, h2: false });
  const [activeDropdown, setActiveDropdown] = useState(false);

  const { recordGameResult } = useGameStats();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Load characters from public/data/personagens.json
  useEffect(() => {
    fetch("/data/personagens.json")
      .then((res) => res.json())
      .then((data: Personagem[]) => {
        setCharacters(data);
        if (data.length > 0) {
          // Select a target character
          const rand = data[Math.floor(Math.random() * data.length)];
          setTargetChar(rand);
        }
      })
      .catch((err) => console.error("Error loading characters:", err));
  }, []);

  // Update hints when guesses change
  useEffect(() => {
    if (guesses.length >= 6) {
      setHintsUnlocked((prev) => ({ ...prev, h1: true }));
    }
    if (guesses.length >= 8) {
      setHintsUnlocked((prev) => ({ ...prev, h2: true }));
    }
  }, [guesses.length]);

  const handleSelectCharacter = (selected: Personagem) => {
    if (!targetChar || isWon) return;

    // Check if already guessed
    const alreadyGuessed = guesses.some((g) => g.character.id === selected.id);
    if (alreadyGuessed) {
      setQuery("");
      setActiveDropdown(false);
      return;
    }

    const result = comparePersonagem(selected, targetChar);
    const updatedGuesses = [result, ...guesses];
    setGuesses(updatedGuesses);
    setQuery("");
    setActiveDropdown(false);

    if (result.isFullyCorrect) {
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
      recordGameResult(true, updatedGuesses.length, hintsCount);
    } else {
      playWrongSound();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
    }
  };

  const filteredCharacters = characters.filter(
    (c) =>
      c.nome.toLowerCase().includes(query.toLowerCase().trim()) &&
      !guesses.some((g) => g.character.id === c.id)
  );

  const getTileClass = (match: TileMatch) => {
    switch (match) {
      case "CORRECT":
        return "pixel-tile-green";
      case "PARTIAL":
        return "pixel-tile-yellow";
      case "WRONG":
        return "pixel-tile-red";
    }
  };

  const getTileLabel = (match: TileMatch) => {
    switch (match) {
      case "CORRECT":
        return "🟩";
      case "PARTIAL":
        return "🟨";
      case "WRONG":
        return "🟥";
    }
  };

  return (
    <div
      className={`w-full max-w-4xl flex flex-col items-center gap-4 ${
        isShaking ? "animate-shake" : ""
      }`}
    >
      {/* Title Parchment Banner */}
      <div className="pixel-parchment-dark w-full p-4 text-center relative">
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
        <h1 className="text-xl sm:text-2xl font-black tracking-widest text-[#f5c458] uppercase flex items-center justify-center gap-2">
          <span>📖</span>
          <span>Adivinhe o Personagem</span>
          <span>📖</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#d4b996] mt-1">
          Digite o nome de uma figura bíblica para comparar seus atributos
        </p>
      </div>

      {/* Autocomplete Search Bar */}
      {!isWon && (
        <div className="relative order-3 w-full max-w-xl">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveDropdown(true);
              }}
              onFocus={() => setActiveDropdown(true)}
              placeholder="Digite o nome"
              className="flex-1 bg-[#1e1008] text-[#f4ecd8] border-4 border-[#52311c] px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-[#f5c458] placeholder:text-[#8a6b52]"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {activeDropdown && query.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 z-40 bg-[#2b1810] border-4 border-[#52311c] shadow-2xl max-h-60 overflow-y-auto">
              {filteredCharacters.length > 0 ? (
                filteredCharacters.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => {
                      playClickSound();
                      handleSelectCharacter(char);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-[#4a2b1b] border-b border-[#3b2012] flex items-center justify-between text-sm font-bold text-[#f5eedc] cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>📜</span>
                      <span>{char.nome}</span>
                    </span>
                    <span className="text-xs text-[#c2a87c]">
                      {char.testamento}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-xs text-[#997c65]">
                  Nenhum personagem correspondente encontrado.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Hints Section (Unlocks after 6 and 8 attempts) */}
      <div className="hidden order-2 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          className={`p-3 border-2 ${
            hintsUnlocked.h1
              ? "bg-[#2b1f13] border-[#f5c458] text-[#f4ecd8]"
              : "bg-[#160d07] border-[#382112] text-[#6b513c]"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-black uppercase mb-1">
            <span>💡 Dica 1 (6 tentativas)</span>
            <span>{hintsUnlocked.h1 ? "🔓 Revelada" : "🔒 Bloqueada"}</span>
          </div>
          <p className="text-xs font-serif italic">
            {hintsUnlocked.h1
              ? targetChar?.dica1
              : `Realize mais ${Math.max(0, 6 - guesses.length)} tentativa(s) para desbloquear.`}
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
            <span>💡 Dica 2 (8 tentativas)</span>
            <span>{hintsUnlocked.h2 ? "🔓 Revelada" : "🔒 Bloqueada"}</span>
          </div>
          <p className="text-xs font-serif italic">
            {hintsUnlocked.h2
              ? targetChar?.dica2
              : `Realize mais ${Math.max(0, 8 - guesses.length)} tentativa(s) para desbloquear.`}
          </p>
        </div>
      </div>

      {/* Comparison Legend */}
      <div className="order-4 flex flex-wrap items-center justify-center gap-3 text-xs font-bold bg-[#140a04] px-3 py-1.5 border border-[#3e2413]">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-[#2b7a35]"></span> Correto
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-[#b57a0d]"></span> Parcial
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-[#8f2020]"></span> Incorreto
        </span>
      </div>

      {/* Comparison Grid Table */}
      {guesses.length > 0 && (
        <div className="order-5 w-full overflow-visible pb-4">
          <div className="w-full min-w-0 flex flex-col gap-2">
            {/* Headers */}
            <div className="grid grid-cols-10 gap-1 text-center text-[10px] sm:text-xs font-black uppercase text-[#e2ceaa]">
              <div className="comparison-header">Personagem</div>
              <div className="comparison-header">Sexo</div>
              <div className="comparison-header">Testamento</div>
              <div className="comparison-header">Divisão</div>
              <div className="comparison-header">Livro</div>
              <div className="comparison-header">História</div>
              <div className="comparison-header">Local</div>
              <div className="comparison-header">Nacionalidade</div>
              <div className="comparison-header">Nascimento</div>
              <div className="comparison-header">Ocupação</div>
            </div>

            {/* Guesses Rows */}
            {guesses.map((g, idx) => (
              <div
                key={idx}
                className="grid grid-cols-10 gap-1 text-center font-bold"
              >
                {/* Character Name */}
                <div className="comparison-cell comparison-character-cell">
                  <img
                    src="/cubo-interrogacao.svg"
                    alt={`Imagem de ${g.character.nome}`}
                    className="h-full w-full object-contain p-1"
                  />
                </div>

                {/* Sexo */}
                <div
                  className={`comparison-cell ${getTileClass(
                    g.sexoMatch
                  )}`}
                >
                  <span>{g.character.sexo}</span>
                </div>

                {/* Testamento */}
                <div
                  className={`comparison-cell ${getTileClass(
                    g.testamentoMatch
                  )}`}
                >
                  <span className="leading-tight">{g.character.testamento}</span>
                </div>

                {/* Divisão */}
                <div
                  className={`comparison-cell ${getTileClass(
                    g.divisaoMatch
                  )}`}
                >
                  <span className="leading-tight">{g.character.divisao}</span>
                </div>

                {/* Livro Principal */}
                <div
                  className={`comparison-cell ${getTileClass(
                    g.livroMatch
                  )}`}
                >
                  <span>{g.character.livroPrincipal}</span>
                </div>

                {/* História Principal */}
                <div
                  className={`comparison-cell ${getTileClass(
                    g.historiaMatch
                  )}`}
                >
                  <span className="leading-tight">
                    {g.character.historiaPrincipal}
                  </span>
                </div>

                {/* Local */}
                <div
                  className={`comparison-cell ${getTileClass(
                    g.localMatch
                  )}`}
                >
                  <span className="leading-tight">{g.character.local}</span>
                </div>

                {/* Nacionalidade */}
                <div
                  className={`comparison-cell ${getTileClass(
                    g.nacionalidadeMatch
                  )}`}
                >
                  <span className="leading-tight">{g.character.nacionalidade}</span>
                </div>

                {/* Nascimento */}
                <div
                  className={`comparison-cell ${getTileClass(
                    g.nascimentoMatch
                  )}`}
                >
                  <span>{g.character.nascimento}</span>
                </div>

                {/* Ocupação */}
                <div
                  className={`comparison-cell ${getTileClass(
                    g.ocupacaoMatch
                  )}`}
                >
                  <span className="leading-tight">
                    {g.character.ocupacao}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Victory Modal */}
      {isWon && targetChar && (
        <VictoryModal
          solutionName={targetChar.nome}
          attemptsCount={guesses.length}
          hintsUsedCount={
            (hintsUnlocked.h1 ? 1 : 0) + (hintsUnlocked.h2 ? 1 : 0)
          }
          nextGameHref="/passagem"
          nextGameLabel="Passagem"
          nextGameDescription="Adivinhe livro, capítulo e versículo"
          nextGameIcon="/passagem-emoji.svg"
        />
      )}
    </div>
  );
};

"use client";

import React, { useState, useMemo, useRef } from "react";
import { Personagem, PersonagemGuessComparison, TileMatch } from "@/types/game";
import { comparePersonagem } from "@/game/characterLogic";
import { useGameStats } from "@/hooks/useGameStats";
import {
  playClickSound,
  playRevealSound,
  playVictorySound,
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

export const CharacterGame: React.FC = () => {
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
    Array.from({ length: 8 }, (_, index) =>
      schedule(playRevealSound, index * revealStepDuration)
    );

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

  const getTileClass = (match: TileMatch) => {
    switch (match) {
      case "CORRECT":
        return "pixel-tile-green";
      case "PARTIAL":
        return "pixel-tile-yellow";
      case "WRONG":
        return "pixel-tile-red";
      default:
        return "pixel-tile-red";
    }
  };

  const getRevealClass = (characterId: string) =>
    characterId === revealingGuessId ? "animate-character-reveal" : "";

  const getRevealStyle = (characterId: string, index: number) =>
    characterId === revealingGuessId
      ? { animationDelay: `${index * revealStepDuration}ms` }
      : undefined;

  return (
    <div
      className={`w-full max-w-4xl flex flex-col items-center gap-4 ${
        isShaking ? "animate-shake" : ""
      }`}
    >
      {/* Title Parchment Banner */}
      <div className="pixel-parchment-dark w-full max-w-xl p-4 text-center relative">
        <div className="absolute -top-10 left-0 z-10 flex gap-1">
          <button type="button"
            title="Dica 1"
            disabled={!hint1Available}
            aria-label="Abrir dica 1"
            onClick={() => handleHintClick("h1")}
            className={`flex h-8 w-8 items-center justify-center border-2 text-sm ${
              hint1Available
                ? "border-[#0b3558] bg-[#174d78] text-[#fff7e7]"
                : "border-[#0b3558] bg-[#174d78]/60 text-[#b5d5e8]"
            }`}
          >
            💡
          </button>
          <button type="button"
            title="Dica 2"
            disabled={!hint2Available}
            aria-label="Abrir dica 2"
            onClick={() => handleHintClick("h2")}
            className={`flex h-8 w-8 items-center justify-center border-2 text-sm ${
              hint2Available
                ? "border-[#0b3558] bg-[#174d78] text-[#fff7e7]"
                : "border-[#0b3558] bg-[#174d78]/60 text-[#b5d5e8]"
            }`}
          >
            💡
          </button>
        </div>
        <h1 className="character-game-title text-xl sm:text-2xl font-black tracking-widest text-[#c98712] uppercase flex items-center justify-center gap-2">
          <span>📖</span>
          <span>Adivinhe o Personagem</span>
          <span>📖</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#285b7f] mt-1">
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
              className="flex-1 bg-[#fffaf0] text-[#183c5b] border-4 border-[#2875a8] px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-[#e3ab32] placeholder:text-[#6d8fa7]"
            />
          </div>

          {activeDropdown && query.trim().length > 0 && (
            <div id="character-options" role="listbox" className="absolute top-full left-0 right-0 mt-1 z-40 bg-[#f5ecd8] border-4 border-[#2875a8] shadow-2xl max-h-60 overflow-y-auto">
              {filteredCharacters.length > 0 ? (
                filteredCharacters.map((char) => (
                  <button
                    key={char.id}
                    id={`character-option-${char.id}`}
                    onClick={() => {
                      playClickSound();
                      handleSelectCharacter(char);
                    }}
                    role="option" aria-selected={activeOptionIndex === filteredCharacters.indexOf(char)} className={`w-full text-left px-4 py-3 hover:bg-[#dceefa] border-b border-[#b5d5e8] flex items-center justify-between text-sm font-bold text-[#183c5b] cursor-pointer ${activeOptionIndex === filteredCharacters.indexOf(char) ? "bg-[#dceefa]" : ""}`}
                  >
                    <span className="flex items-center gap-2">
                      <CharacterPhoto
                        id={char.id}
                        image={char.imagem}
                        alt={`Retrato de ${char.nome}`}
                        className="h-8 w-8 shrink-0 border border-[#2875a8] object-cover"
                      />
                      <span>{char.nome}</span>
                    </span>
                    <span className="text-xs text-[#527c98]">
                      {char.testamento}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-xs text-[#527c98]">
                  Nenhum personagem correspondente encontrado.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeHint && targetChar && (
        <ModalBase labelledBy="hint-dialog-title" onClose={() => setActiveHint(null)} className="bg-[var(--bg-surface)] w-full max-w-md border border-[var(--border-accent)] rounded-xl p-6 text-center shadow-[var(--shadow-elevated)]">
            <h2 id="hint-dialog-title" className="font-serif text-2xl font-black text-[var(--text-main)] uppercase tracking-wider mb-4">
              Dica {activeHint === "h1" ? "1" : "2"}
            </h2>
            <p className="text-lg text-[var(--text-main)] mb-6">
              {activeHint === "h1" ? targetChar.dica1 : targetChar.dica2}
            </p>
        </ModalBase>
      )}

      {/* Comparison Legend */}
      <div className="order-4 flex flex-wrap items-center justify-center gap-3 text-xs font-bold bg-[#174d78] text-[#fff7e7] px-3 py-1.5 border border-[#0b3558]">
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

      {/* Comparison Grid Table - 8 colunas */}
      {guesses.length > 0 && (
        <div className="order-5 w-full overflow-visible pb-4">
          <div className="w-full min-w-0 flex flex-col gap-2">
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
                className={`${comparisonGridClass} text-center font-bold`}
              >
                <div
                  className={`comparison-cell comparison-character-cell ${getRevealClass(g.character.id)}`}
                  style={getRevealStyle(g.character.id, 0)}
                  title={g.character.nome}
                >
                  <CharacterPhoto
                    key={g.character.id}
                    id={g.character.id}
                    image={g.character.imagem}
                    alt={`Imagem de ${g.character.nome}`}
                    className="h-full w-full object-cover"
                  />
                  <span className="character-name-tooltip" role="tooltip">
                    {g.character.nome}
                  </span>
                </div>

                <div className={`comparison-cell ${getRevealClass(g.character.id)}`} style={{ backgroundColor: getTileClass(g.sexoMatch) === 'pixel-tile-green' ? '#2b7a35' : getTileClass(g.sexoMatch) === 'pixel-tile-yellow' ? '#b57a0d' : '#8f2020', ...getRevealStyle(g.character.id, 1) }}>
                  <span>{g.character.sexo}</span>
                </div>

                <div className={`comparison-cell ${getRevealClass(g.character.id)}`} style={{ backgroundColor: getTileClass(g.testamentoMatch) === 'pixel-tile-green' ? '#2b7a35' : getTileClass(g.testamentoMatch) === 'pixel-tile-yellow' ? '#b57a0d' : '#8f2020', ...getRevealStyle(g.character.id, 2) }}>
                  <span className="leading-tight">{g.character.testamento}</span>
                </div>

                <div className={`comparison-cell ${getRevealClass(g.character.id)}`} style={{ backgroundColor: getTileClass(g.divisaoMatch) === 'pixel-tile-green' ? '#2b7a35' : getTileClass(g.divisaoMatch) === 'pixel-tile-yellow' ? '#b57a0d' : '#8f2020', ...getRevealStyle(g.character.id, 3) }}>
                  <span className="comparison-division-text leading-tight">{g.character.divisao}</span>
                </div>

                <div className={`comparison-cell ${getRevealClass(g.character.id)} ${g.historiaNaBibliaMatch === "WRONG" && g.historiaNaBibliaComparison !== "EQUAL" ? g.historiaNaBibliaComparison === "HIGHER" ? "character-arrow-up" : "character-arrow-down" : ""}`} style={{ backgroundColor: getTileClass(g.historiaNaBibliaMatch) === 'pixel-tile-green' ? '#2b7a35' : '#8f2020', ...getRevealStyle(g.character.id, 4) }}>
                  <span className="comparison-history-text">
                    {g.character.historiaNaBiblia.split(/[;,]/).map((passagem) => (
                      <span key={passagem} className="block">
                        {passagem.trim()}
                      </span>
                    ))}
                  </span>
                </div>

                <div className={`comparison-cell ${getRevealClass(g.character.id)}`} style={{ backgroundColor: getTileClass(g.conhecidoPorMatch) === 'pixel-tile-green' ? '#2b7a35' : getTileClass(g.conhecidoPorMatch) === 'pixel-tile-yellow' ? '#b57a0d' : '#8f2020', ...getRevealStyle(g.character.id, 5) }}>
                  <span className="leading-tight">
                    {g.character.conhecidoPor}
                  </span>
                </div>

                <div className={`comparison-cell ${getRevealClass(g.character.id)} ${g.nascimentoMatch === "WRONG" ? g.nascimentoComparison === "HIGHER" ? "character-arrow-up" : "character-arrow-down" : ""}`} style={{ backgroundColor: getTileClass(g.nascimentoMatch) === 'pixel-tile-green' ? '#2b7a35' : '#8f2020', ...getRevealStyle(g.character.id, 6) }}>
                  <span>{g.character.nascimento}</span>
                </div>

                <div className={`comparison-cell ${getRevealClass(g.character.id)}`} style={{ backgroundColor: getTileClass(g.ocupacaoMatch) === 'pixel-tile-green' ? '#2b7a35' : getTileClass(g.ocupacaoMatch) === 'pixel-tile-yellow' ? '#b57a0d' : '#8f2020', ...getRevealStyle(g.character.id, 7) }}>
                  <span className="comparison-occupation-text leading-tight">
                    {g.character.ocupacao}
                  </span>
                </div>
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
    </div>
  );
};

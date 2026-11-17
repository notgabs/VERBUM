"use client";

import React, { useState, useMemo, useRef, useEffect, Suspense } from "react";
import { Personagem, PersonagemGuessComparison, TileMatch } from "@/types/game";
import { comparePersonagem } from "@/game/characterLogic";
import { useGameStats } from "@/hooks/useGameStats";
import { playClickSound, playHintSound, playRevealSound, playTileSound, playVictorySound, playWrongSound } from "@/utils/sound";
import { VictoryModal } from "@/components/VictoryModal";
import { CharacterPhoto } from "@/components/CharacterPhoto";
import { normalizeForSearch } from "@/utils/text";
import { selectDailyId, getLocalDayKey } from "@/domain/game/dailyChallenge";
import { isPersonagem } from "@/domain/game/catalogContracts";
import { useJsonCatalog } from "@/hooks/useJsonCatalog";
import { useTimeoutRegistry } from "@/hooks/useTimeoutRegistry";
import { CatalogState } from "@/components/CatalogState";
import { NextChallengeCountdown } from "@/components/NextChallengeCountdown";
import { SearchCombobox } from "@/components/ui/SearchCombobox";
import { HintOrb, HintDialog, type HintKey } from "@/components/ui/HintControls";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import { motion, useReducedMotion } from "motion/react";
import { asset } from "@/utils/asset";

const REVEAL_STEP_MS = 420;
const FLIP_S = 0.55;
const GRID_COLS = "comparison-grid grid w-full grid-cols-[1.1fr_0.85fr_1fr_1.1fr_1.3fr_1.2fr_1.2fr] gap-1.5";

const TILE_CLASS: Record<TileMatch, string> = {
  CORRECT: "tile-correct",
  PARTIAL: "tile-partial",
  WRONG: "tile-wrong",
};

type Arrow = "up" | "down" | null;

interface CellSpec {
  key: string;
  match: TileMatch;
  arrow: Arrow;
  content: React.ReactNode;
}

function buildCells(g: PersonagemGuessComparison): CellSpec[] {
  const c = g.character;
  const historyArrow: Arrow =
    g.historiaNaBibliaMatch === "WRONG" && g.historiaNaBibliaComparison !== "EQUAL"
      ? g.historiaNaBibliaComparison === "HIGHER" ? "up" : "down"
      : null;

  return [
    { key: "sexo", match: g.sexoMatch, arrow: null, content: c.sexo },
    { key: "testamento", match: g.testamentoMatch, arrow: null, content: c.testamento },
    { key: "divisao", match: g.divisaoMatch, arrow: null, content: c.divisao },
    {
      key: "historia",
      match: g.historiaNaBibliaMatch,
      arrow: historyArrow,
      content: (
        <span className="comparison-history-text">
          {c.historiaNaBiblia.split(/[;,]/).map((p) => (
            <span key={p} className="block">{p.trim()}</span>
          ))}
        </span>
      ),
    },
    { key: "povo", match: g.povoMatch, arrow: null, content: <PovoLabel value={c.povo} /> },
    { key: "ocupacao", match: g.ocupacaoMatch, arrow: null, content: c.ocupacao },
  ];
}

const HEADERS = ["Personagem", "Gênero", "Testamento", "Divisão", "Passagem na Bíblia", "Povo", "Ocupação"];

/** "Israelita (Judá)" em duas linhas: povo e, menor, a tribo/tipo. */
function PovoLabel({ value }: { value: string }) {
  const m = value.match(/^(.*?)\s*(?:\((.*)\))?$/);
  return (
    <span className="flex flex-col items-center leading-tight">
      <span>{m?.[1] ?? value}</span>
      {m?.[2] && <span className="text-[0.85em] font-medium opacity-85">{m[2]}</span>}
    </span>
  );
}

const CharacterGameInner: React.FC = () => {

  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [guesses, setGuesses] = useState<PersonagemGuessComparison[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [hintsUnlocked, setHintsUnlocked] = useState<Record<HintKey, boolean>>({ h1: false, h2: false });
  const [activeHint, setActiveHint] = useState<HintKey | null>(null);
  const [revealingGuessId, setRevealingGuessId] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  const { recordGameResult } = useGameStats();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { schedule } = useTimeoutRegistry();
  const { data: characters, isLoading, error, retry } = useJsonCatalog(asset("/data/personagens.json"), isPersonagem);

  const targetChar = useMemo(() => {
    if (characters.length === 0) return null;
    const ids = characters.map((character) => character.id);
    const targetId = selectDailyId(ids);
    return characters.find((character) => character.id === targetId) ?? characters[0];
  }, [characters]);

  // Restaura o progresso do desafio diário
  useEffect(() => {
    if (characters.length === 0 || !targetChar) return;
    const saved = localStorage.getItem("verbum_daily_state_v1");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.date !== getLocalDayKey() || !parsed.guesses) return;
      const loadedGuesses = (parsed.guesses as string[])
        .map((id) => {
          const char = characters.find((c) => c.id === id);
          return char ? comparePersonagem(char, targetChar) : null;
        })
        .filter((g): g is PersonagemGuessComparison => g !== null)
        .reverse();

      if (loadedGuesses.length === 0) return;
      // Aplica no próximo quadro para não encadear renderizações dentro do efeito
      const frame = requestAnimationFrame(() => {
        setGuesses((current) => (current.length === 0 ? loadedGuesses : current));
        if (loadedGuesses[0].character.id === targetChar.id) {
          setIsWon(true);
          setIsVictoryModalOpen(true);
        }
      });
      return () => cancelAnimationFrame(frame);
    } catch { /* estado salvo inválido: ignora */ }
  }, [characters, targetChar]);

  // Salva o progresso do desafio diário
  useEffect(() => {
    if (guesses.length === 0) return;
    const guessIds = [...guesses].reverse().map((g) => g.character.id);
    localStorage.setItem("verbum_daily_state_v1", JSON.stringify({ date: getLocalDayKey(), guesses: guessIds }));
  }, [guesses]);

  const hintsUsed = (hintsUnlocked.h1 ? 1 : 0) + (hintsUnlocked.h2 ? 1 : 0);

  const handleHintClick = (hint: HintKey) => {
    const isAvailable = guesses.length >= (hint === "h1" ? 6 : 12);
    if (!isAvailable) return;
    playHintSound();
    setHintsUnlocked((prev) => ({ ...prev, [hint]: true }));
    setActiveHint(hint);
  };

  const handleSelectCharacter = (selected: Personagem) => {
    if (!targetChar || isWon || isRevealing) return;
    if (guesses.some((g) => g.character.id === selected.id)) { setQuery(""); return; }

    const result = comparePersonagem(selected, targetChar);
    const updatedGuesses = [result, ...guesses];
    const revealDuration = 6 * REVEAL_STEP_MS + FLIP_S * 1000 + 150;

    setGuesses(updatedGuesses);
    setRevealingGuessId(selected.id);
    setIsRevealing(true);
    setQuery("");
    schedule(() => setIsRevealing(false), revealDuration);

    const sequence: (TileMatch | "IMAGE")[] = [
      "IMAGE", result.sexoMatch, result.testamentoMatch, result.divisaoMatch,
      result.historiaNaBibliaMatch, result.povoMatch, result.ocupacaoMatch,
    ];
    sequence.forEach((match, index) => {
      schedule(() => {
        if (match === "IMAGE") playRevealSound();
        else playTileSound(match);
      }, index * REVEAL_STEP_MS);
    });

    if (result.isFullyCorrect) {
      // Só declara a vitória depois que a última peça virar (todas verdes)
      schedule(() => {
        setIsWon(true);
        setIsVictoryModalOpen(true);
        playVictorySound();
        recordGameResult(true, updatedGuesses.length, hintsUsed);
      }, revealDuration);
    } else {
      schedule(() => { playWrongSound(); setIsShaking(true); schedule(() => setIsShaking(false), 400); }, revealDuration - 150);
    }
  };

  const filteredCharacters = useMemo(() => {
    const q = normalizeForSearch(query.trim());
    return characters.filter((c) => normalizeForSearch(c.nome).includes(q) && !guesses.some((g) => g.character.id === c.id));
  }, [characters, guesses, query]);


  if (isLoading || error) return <CatalogState error={error} onRetry={retry} />;

  const submitFirst = () => {
    if (!query.trim() || isRevealing) return;
    const first = filteredCharacters[0];
    if (first) { playClickSound(); handleSelectCharacter(first); }
    else { setIsShaking(true); schedule(() => setIsShaking(false), 400); }
  };

  return (
    <div className="flex w-full flex-col gap-5">
      {/* Tabuleiro principal */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 24 }}
        className="surface relative z-20 mx-auto w-full max-w-3xl rounded-[30px] px-5 pb-6 pt-5 sm:px-8 sm:pb-8"
      >
        <div className="flex items-center justify-between">
          <span />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-fill)] px-3 py-1 text-[13px] font-extrabold tabular-nums">
            <motion.span key={guesses.length} initial={{ scale: 1.6, color: "var(--color-primary)" }} animate={{ scale: 1, color: "var(--color-text-main)" }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
              {guesses.length}
            </motion.span>
            <span className="text-[var(--color-text-muted)]">{guesses.length === 1 ? "palpite" : "palpites"}</span>
          </span>
        </div>

        <div className="mt-4 grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-6">
          <HintOrb hint="h1" attempts={guesses.length} unlocked={hintsUnlocked.h1} onOpen={handleHintClick} />
          <div className="flex flex-col items-center text-center">
            <motion.div
              animate={reduce || isWon ? undefined : { y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative flex h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(160deg,#1f4f8f,#0f2a4a)] shadow-[0_0_0_4px_var(--color-gold),0_0_28px_color-mix(in_srgb,var(--color-gold)_55%,transparent)] sm:h-24 sm:w-24"
            >
              {/* O personagem nunca é revelado aqui: só no modal de vitória */}
              {isWon ? (
                <CheckIcon size={44} className="text-[var(--color-gold)]" />
              ) : (
                <span className="text-[44px] font-black leading-none text-[var(--color-gold)] sm:text-[52px]">?</span>
              )}
            </motion.div>
            <h1 className="mt-3 text-[clamp(22px,4vw,32px)] font-black leading-tight tracking-[-0.02em]">
              Clássico
            </h1>
            <p className="mt-1 text-[14px] font-semibold text-[var(--color-text-muted)]">
              {isWon ? `Você acertou em ${guesses.length} ${guesses.length === 1 ? "palpite" : "palpites"}!` : ""}
            </p>
          </div>
          <HintOrb hint="h2" attempts={guesses.length} unlocked={hintsUnlocked.h2} onOpen={handleHintClick} />
        </div>

        {isWon ? (
          <div className="mt-6 flex flex-col items-center gap-4">
            <Button size="lg" variant="gold" onClick={() => { playClickSound(); setIsVictoryModalOpen(true); }}>
              <CheckIcon size={18} /> Ver resultado
            </Button>
            <NextChallengeCountdown />
          </div>
        ) : (
          <motion.div
            animate={!reduce && isShaking ? { x: [0, -8, 8, -4, 4, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6 flex gap-2"
          >
            <SearchCombobox
              id="character-search"
              label="Nome do personagem"
              className="flex-1"
              inputClassName="!h-14 !rounded-full !border-2 !border-transparent !bg-[var(--color-fill)] !text-[17px] !font-bold !shadow-none focus:!border-[var(--color-primary)]"
              value={query}
              onChange={setQuery}
              items={filteredCharacters}
              getKey={(c) => c.id}
              inputRef={inputRef}
              placeholder={isRevealing ? "Revelando…" : "Digite um nome…"}
              emptyText="Nenhum personagem encontrado"
              onPick={(c) => { playClickSound(); handleSelectCharacter(c); }}
              renderItem={(c) => (
                <span className="flex items-center gap-3">
                  <CharacterPhoto id={c.id} image={c.imagem} alt="" className="h-10 w-10 shrink-0 rounded-full bg-[var(--color-fill)] object-cover" />
                  <span className="flex-1 text-[16px] font-bold">{c.nome}</span>
                  <span className="rounded-full bg-[var(--color-fill)] px-2 py-0.5 text-[11px] font-extrabold text-[var(--color-text-muted)]">{c.testamento.startsWith("Antigo") ? "AT" : "NT"}</span>
                </span>
              )}
            />
            <Button size="lg" className="!h-14 shrink-0 px-7" disabled={!query.trim() || isRevealing} onClick={submitFirst}>
              Chutar
            </Button>
          </motion.div>
        )}

      </motion.section>

      {guesses.length > 0 && (
        <section className="surface mx-auto w-full overflow-hidden rounded-[26px] p-3 sm:p-4">
        <div className="overflow-x-auto">
          <div className="flex min-w-0 flex-col gap-2">
            <div className={GRID_COLS}>
              {HEADERS.map((h, i) => (
                <div key={h} className={`comparison-header ${i === 0 ? "comparison-sticky bg-[var(--color-surface)]" : ""}`}>{h}</div>
              ))}
            </div>

            {guesses.map((g) => {
              const isNew = g.character.id === revealingGuessId;
              const flip = (index: number) => ({
                initial: isNew ? { opacity: 0, rotateX: reduce ? 0 : -90 } : false,
                animate: { opacity: 1, rotateX: 0 },
                transition: { duration: FLIP_S, ease: [0.22, 1, 0.36, 1] as const, delay: isNew ? (index * REVEAL_STEP_MS) / 1000 : 0 },
              });

              return (
                <motion.div
                  key={g.character.id}
                  layout={!reduce}
                  initial={isNew ? { opacity: 0, y: -8 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  className={GRID_COLS}
                  style={{ perspective: 800 }}
                >
                  <motion.div {...flip(0)} className="comparison-sticky relative aspect-square self-center overflow-hidden rounded-[12px] bg-[var(--color-fill)]">
                    <CharacterPhoto id={g.character.id} image={g.character.imagem} alt={`Imagem de ${g.character.nome}`} className="h-full w-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-1.5 pb-1.5 pt-5 text-center text-[10px] font-semibold leading-tight text-white sm:text-[11px]">
                      {g.character.nome}
                    </span>
                  </motion.div>

                  {buildCells(g).map((cell, i) => (
                    <motion.div
                      key={cell.key}
                      {...flip(i + 1)}
                      className={`tile comparison-cell ${TILE_CLASS[cell.match]} ${cell.arrow ? `tile-arrow-${cell.arrow}` : ""}`}
                      aria-label={cell.arrow ? `${cell.key}: ${cell.arrow === "up" ? "seta para cima" : "seta para baixo"}` : undefined}
                    >
                      <span>{cell.content}</span>
                    </motion.div>
                  ))}
                </motion.div>
              );
            })}
          </div>
        </div>
        </section>
      )}

      {activeHint && targetChar && (
        <HintDialog hint={activeHint} text={activeHint === "h1" ? targetChar.dica1 : targetChar.dica2} onClose={() => setActiveHint(null)} />
      )}

      {isWon && isVictoryModalOpen && targetChar && (
        <VictoryModal
          solutionName={targetChar.nome}
          solutionImage={targetChar.imagem}
          solutionImageId={targetChar.id}
          characterReference={targetChar.historiaNaBiblia}
          characterKnownFor={targetChar.conhecidoPor}
          attemptsCount={guesses.length}
          hintsUsedCount={hintsUsed}
          nextGameHref="/passagem"
          nextGameLabel="Passagem"
          nextGameDescription="Adivinhe livro, capítulo e versículo"
          nextGameIcon="/passagem-emoji.webp"
          onClose={() => setIsVictoryModalOpen(false)}
          showCountdown
        />
      )}
    </div>
  );
};

export const CharacterGame: React.FC = () => (
  <Suspense fallback={<CatalogState />}>
    <CharacterGameInner />
  </Suspense>
);

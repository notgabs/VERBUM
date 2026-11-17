"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { Passagem, PassagemGuessComparison, TileMatch, NumberComparison } from "@/types/game";
import { comparePassagem } from "@/game/passageLogic";
import { CATHOLIC_BIBLE_BOOK_NAMES, CATHOLIC_BIBLE_CATALOG, findCatholicBibleBook } from "@/domain/bible/catalog";
import { normalizeForSearch } from "@/utils/text";
import { PASSAGE_EXPLANATIONS } from "@/data/passageExplanations";
import { useGameStats } from "@/hooks/useGameStats";
import { playStepperSound, playShinySound, playClickSound, playHintSound, playTileSound, playVictorySound, playWrongSound } from "@/utils/sound";
import { VictoryModal } from "@/components/VictoryModal";
import { GAME_CONFIG } from "@/config/game";
import { selectDailyId, getLocalDayKey } from "@/domain/game/dailyChallenge";
import { PASSAGE_DAILY_STORAGE_KEY } from "@/domain/game/storageKeys";
import { NextChallengeCountdown } from "@/components/NextChallengeCountdown";
import { isPassagem } from "@/domain/game/catalogContracts";
import { useJsonCatalog } from "@/hooks/useJsonCatalog";
import { useTimeoutRegistry } from "@/hooks/useTimeoutRegistry";
import { CatalogState } from "@/components/CatalogState";
import { SearchCombobox } from "@/components/ui/SearchCombobox";
import { HintControls, HintDialog, type HintKey } from "@/components/ui/HintControls";
import { GameHeader } from "@/components/ui/GameHeader";
import { Button } from "@/components/ui/Button";
import { CheckIcon, MinusIcon, PlusIcon } from "@/components/ui/Icons";
import { motion, useReducedMotion } from "motion/react";
import { asset } from "@/utils/asset";

const REVEAL_STEP_DURATION = 420;

const withPastoralHints = (passage: Passagem): Passagem => ({
  ...passage,
  dica1: passage.dica1 ?? `A passagem pertence ao ${passage.testamento}, na seção ${passage.divisao}.`,
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
  passage.contexto ?? PASSAGE_EXPLANATIONS[passage.id] ?? passage.texto;

const TILE_CLASS: Record<TileMatch, string> = { CORRECT: "tile-correct", PARTIAL: "tile-partial", WRONG: "tile-wrong" };
const arrowClass = (match: TileMatch, cmp: NumberComparison) =>
  match === "CORRECT" || cmp === "EQUAL" ? "" : cmp === "HIGHER" ? "tile-arrow-up" : "tile-arrow-down";

interface StepperProps {
  id: string;
  label: string;
  value: number | "";
  max: number;
  invalid: boolean;
  onChange: (value: number | "") => void;
  onStep: (delta: 1 | -1) => void;
}

function Stepper({ id, label, value, max, invalid, onChange, onStep }: StepperProps) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow mb-1.5 block">{label}</label>
      <div className={`field flex items-center gap-1 px-1.5 ${invalid ? "field-invalid animate-input-shake" : ""}`}>
        <motion.button type="button" whileTap={{ scale: 0.88 }} aria-label={`Diminuir ${label.toLowerCase()}`} onClick={() => onStep(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-fill)] text-[var(--color-text-main)] transition-colors hover:bg-[var(--color-fill-strong)]">
          <MinusIcon size={16} />
        </motion.button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={1}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          className="number-input-no-spinner h-full w-full min-w-0 flex-1 bg-transparent text-center text-[20px] font-semibold tabular-nums focus:outline-none"
        />
        <motion.button type="button" whileTap={{ scale: 0.88 }} aria-label={`Aumentar ${label.toLowerCase()}`} onClick={() => onStep(1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-fill)] text-[var(--color-text-main)] transition-colors hover:bg-[var(--color-fill-strong)]">
          <PlusIcon size={16} />
        </motion.button>
      </div>
    </div>
  );
}

interface SavedPassageGuess { livro: string; capitulo: number; versiculo: number }

const PassageGameInner: React.FC = () => {
  const reduce = useReducedMotion();
  const [inputBook, setInputBook] = useState("");
  const [inputChapter, setInputChapter] = useState<number | "">(1);
  const [inputVerse, setInputVerse] = useState<number | "">(1);

  const [guesses, setGuesses] = useState<PassagemGuessComparison[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  /** true só quando o jogador acabou de acertar (confete e som); ao voltar à tela já vencida, não. */
  const [justWon, setJustWon] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [invalidFields, setInvalidFields] = useState({ book: false, chapter: false, verse: false });
  const [isRevealing, setIsRevealing] = useState(false);
  const [hintsUnlocked, setHintsUnlocked] = useState<Record<HintKey, boolean>>({ h1: false, h2: false });
  const [activeHint, setActiveHint] = useState<HintKey | null>(null);

  const { recordGameResult } = useGameStats();
  const { schedule } = useTimeoutRegistry();
  const { data: rawPassages, isLoading, error, retry } = useJsonCatalog(asset("/data/passagens.json"), isPassagem);
  const passages = useMemo(() => rawPassages.map(withPastoralHints), [rawPassages]);
  const selectedBook = findCatholicBibleBook(inputBook);
  const maxChapter = selectedBook?.versesPerChapter.length ?? 150;
  const maxVerse = selectedBook?.versesPerChapter[(Number(inputChapter) || 1) - 1] ?? 176;
  const hintsUsed = (hintsUnlocked.h1 ? 1 : 0) + (hintsUnlocked.h2 ? 1 : 0);

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
    const ids = passages.map((p) => p.id);
    const fixedId = GAME_CONFIG.developmentMode ? GAME_CONFIG.fixedPassageId : undefined;
    const targetId = fixedId ?? selectDailyId(ids);
    return passages.find((p) => p.id === targetId) ?? passages[0];
  }, [passages]);

  // Restaura o progresso do desafio diário
  useEffect(() => {
    if (!targetPassage) return;
    try {
      const saved = JSON.parse(localStorage.getItem(PASSAGE_DAILY_STORAGE_KEY) ?? "null");
      if (saved?.date !== getLocalDayKey() || saved.passageId !== targetPassage.id || !Array.isArray(saved.guesses)) return;
      const loaded = (saved.guesses as SavedPassageGuess[])
        .filter((g) => findCatholicBibleBook(g.livro) && Number.isInteger(g.capitulo) && Number.isInteger(g.versiculo))
        .map((g) => comparePassagem(g.livro, g.capitulo, g.versiculo, targetPassage))
        .reverse();
      if (loaded.length === 0) return;
      // Aplica no próximo quadro para não encadear renderizações dentro do efeito
      const frame = requestAnimationFrame(() => {
        setGuesses((current) => (current.length === 0 ? loaded : current));
        if (loaded[0].isFullyCorrect) {
          setIsWon(true);
          setIsVictoryModalOpen(true);
        }
      });
      return () => cancelAnimationFrame(frame);
    } catch { /* estado salvo inválido: ignora */ }
  }, [targetPassage]);

  // Salva o progresso do desafio diário
  useEffect(() => {
    if (!targetPassage || guesses.length === 0) return;
    const saved: SavedPassageGuess[] = [...guesses].reverse().map((g) => ({ livro: g.livro, capitulo: g.capitulo, versiculo: g.versiculo }));
    try {
      localStorage.setItem(PASSAGE_DAILY_STORAGE_KEY, JSON.stringify({ date: getLocalDayKey(), passageId: targetPassage.id, guesses: saved }));
    } catch { /* armazenamento indisponível: segue sem salvar */ }
  }, [guesses, targetPassage]);

  const handleHintClick = (hint: HintKey) => {
    if (guesses.length < (hint === "h1" ? 6 : 12)) return;
    playHintSound();
    setHintsUnlocked((prev) => ({ ...prev, [hint]: true }));
    setActiveHint(hint);
  };

  const shake = () => { setIsShaking(true); schedule(() => setIsShaking(false), 400); };

  const handleSubmitGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPassage || isWon || isRevealing) return;

    const missing = { book: !selectedBook, chapter: inputChapter === "", verse: inputVerse === "" };
    if (missing.book || missing.chapter || missing.verse) { setInvalidFields(missing); return; }

    const comparison = comparePassagem(inputBook, Number(inputChapter), Number(inputVerse), targetPassage);
    const isRepeated = guesses.some((g) => g.livro === comparison.livro && g.capitulo === comparison.capitulo && g.versiculo === comparison.versiculo);
    const isBookAlreadyRuledOut = guesses.some((g) => normalizeForSearch(g.livro) === normalizeForSearch(inputBook.trim()) && g.livroComparison !== "EQUAL");
    if (isRepeated || isBookAlreadyRuledOut) { shake(); return; }

    playClickSound();
    const updated = [comparison, ...guesses];
    setGuesses(updated);
    if (comparison.livroComparison !== "EQUAL") setInputBook("");

    const revealDuration = 2 * REVEAL_STEP_DURATION + 700;
    setIsRevealing(true);

    schedule(() => playTileSound(comparison.livroMatch), 0);
    schedule(() => playTileSound(comparison.capituloMatch), REVEAL_STEP_DURATION);
    schedule(() => playTileSound(comparison.versiculoMatch), 2 * REVEAL_STEP_DURATION);
    schedule(() => setIsRevealing(false), revealDuration);

    if (comparison.isFullyCorrect) {
      // Só declara a vitória depois que as três peças virarem
      schedule(() => {
        setIsWon(true);
        setJustWon(true);
        setIsVictoryModalOpen(true);
        playVictorySound();
        playShinySound();
        recordGameResult(true, updated.length, hintsUsed);
      }, revealDuration);
    } else {
      schedule(() => { playWrongSound(); shake(); }, revealDuration);
    }
  };

  const wronglyGuessedBooks = new Set(guesses.filter((g) => g.livroComparison !== "EQUAL").map((g) => normalizeForSearch(g.livro)));
  const normalizedBookQuery = normalizeForSearch(inputBook.trim());
  const filteredBooks = CATHOLIC_BIBLE_CATALOG
    .filter((book) => !wronglyGuessedBooks.has(normalizeForSearch(book.name)))
    .filter((book) => book.aliases.some((alias) => normalizeForSearch(alias).includes(normalizedBookQuery)))
    .map((book) => book.name);

  if (isLoading || error) return <CatalogState error={error} onRetry={retry} />;

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <GameHeader
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            {guesses.length > 0 && <span className="text-[13px] font-medium tabular-nums text-[var(--color-text-muted)]">{guesses.length} {guesses.length === 1 ? "palpite" : "palpites"}</span>}
          </span>
        }
        title="De onde é este versículo?"
        trailing={<HintControls attempts={guesses.length} unlocked={hintsUnlocked} onOpen={handleHintClick} />}
      />

      {/* Versículo */}
      <motion.figure
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="surface relative overflow-hidden px-6 pb-8 pt-10 sm:px-10"
      >
        <span aria-hidden="true" className="absolute left-5 top-0 font-serif text-[88px] leading-none text-[var(--color-gold)] opacity-30 sm:left-8">&ldquo;</span>
        <blockquote className="relative text-balance text-center font-serif text-[20px] leading-relaxed sm:text-[24px]">
          {targetPassage?.texto}
        </blockquote>
      </motion.figure>

      {isWon ? (
        <div className="flex flex-col gap-4">
          <div className="surface flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-status-correct)] text-white"><CheckIcon size={18} /></span>
              <span className="text-[15px] font-semibold">{targetPassage && formatPassageReference(targetPassage)}</span>
            </span>
            <span className="flex flex-wrap gap-2">
              <Button size="sm" variant="tinted" className="max-md:hidden" onClick={() => { playClickSound(); setIsVictoryModalOpen(true); }}>Ver resultado</Button>
            </span>
          </div>
          <div className="flex justify-center"><NextChallengeCountdown /></div>
        </div>
      ) : (
        <motion.form
          onSubmit={handleSubmitGuess}
          noValidate
          animate={!reduce && isShaking ? { x: [0, -6, 6, -3, 3, 0] } : { x: 0 }}
          transition={{ duration: 0.35 }}
          className="relative z-20 flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1.4fr_1fr_1fr]">
            <SearchCombobox
              id="passage-book"
              className="col-span-2 sm:col-span-1"
              label="Livro"
              hideLabel={false}
              showIcon={false}
              value={inputBook}
              onChange={(v) => { updateBook(v); setInvalidFields((f) => ({ ...f, book: false })); }}
              items={filteredBooks}
              getKey={(b) => b}
              placeholder="Ex.: João"
              emptyText="Nenhum livro encontrado"
              invalid={invalidFields.book}
              onPick={(b) => { playClickSound(); updateBook(b); }}
              renderItem={(b) => (
                <span className="flex items-center gap-3">
                  <span className="w-7 text-right text-[12px] font-extrabold tabular-nums text-[var(--color-text-tertiary)]">{CATHOLIC_BIBLE_BOOK_NAMES.indexOf(b) + 1}</span>
                  <span className="text-[15px] font-medium">{b}</span>
                </span>
              )}
            />
            <Stepper
              id="passage-chapter"
              label="Capítulo"
              value={inputChapter}
              max={maxChapter}
              invalid={invalidFields.chapter}
              onChange={(v) => { updateChapter(v); setInvalidFields((f) => ({ ...f, chapter: false })); }}
              onStep={(d) => { playStepperSound(); updateChapter(Math.max(1, (Number(inputChapter) || (d > 0 ? 0 : 1)) + d)); }}
            />
            <Stepper
              id="passage-verse"
              label="Versículo"
              value={inputVerse}
              max={maxVerse}
              invalid={invalidFields.verse}
              onChange={(v) => { updateVerse(v); setInvalidFields((f) => ({ ...f, verse: false })); }}
              onStep={(d) => { playStepperSound(); updateVerse(Math.max(1, (Number(inputVerse) || (d > 0 ? 0 : 1)) + d)); }}
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={isRevealing}>Confirmar palpite</Button>
        </motion.form>
      )}

      {guesses.length > 0 && (
        <div className="surface flex flex-col gap-2 p-3 sm:p-4">
          <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-1.5">
            {["Livro", "Capítulo", "Versículo"].map((h) => <div key={h} className="comparison-header">{h}</div>)}
          </div>
          {guesses.map((g, i) => {
            const isNew = i === 0 && isRevealing;
            const tiles = [
              { key: "livro", value: g.livro, match: g.livroMatch, cmp: g.livroComparison },
              { key: "capitulo", value: g.capitulo, match: g.capituloMatch, cmp: g.capituloComparison },
              { key: "versiculo", value: g.versiculo, match: g.versiculoMatch, cmp: g.versiculoComparison },
            ];
            return (
              <motion.div
                key={`${g.livro}-${g.capitulo}-${g.versiculo}-${guesses.length - i}`}
                layout={!reduce}
                className="grid grid-cols-[1.4fr_1fr_1fr] gap-1.5"
                style={{ perspective: 800 }}
              >
                {tiles.map((t, ti) => (
                  <motion.div
                    key={t.key}
                    initial={isNew ? { opacity: 0, rotateX: reduce ? 0 : -90 } : false}
                    animate={{ opacity: 1, rotateX: 0 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: isNew ? (ti * REVEAL_STEP_DURATION) / 1000 : 0 }}
                    className={`tile min-h-14 text-[15px] sm:text-[17px] ${TILE_CLASS[t.match]} ${arrowClass(t.match, t.cmp)}`}
                  >
                    <span className={ti === 0 ? "whitespace-nowrap text-[13px] sm:text-[16px]" : "tabular-nums"}>{t.value}</span>
                  </motion.div>
                ))}
              </motion.div>
            );
          })}
        </div>
      )}

      {activeHint && targetPassage && (
        <HintDialog hint={activeHint} text={activeHint === "h1" ? targetPassage.dica1 : targetPassage.dica2} onClose={() => setActiveHint(null)} />
      )}

      {isWon && targetPassage && (
        <VictoryModal
          solutionName={formatPassageReference(targetPassage)}
          passageTitle={targetPassage.texto}
          passageExplanation={getPassageExplanation(targetPassage)}
          attemptsCount={guesses.length}
          hintsUsedCount={hintsUsed}
          game="passagem"
          open={isVictoryModalOpen}
          celebrate={justWon}
          showCountdown
          onClose={() => setIsVictoryModalOpen(false)}
        />
      )}
    </div>
  );
};

export const PassageGame: React.FC = () => (
  <Suspense fallback={<CatalogState />}>
    <PassageGameInner />
  </Suspense>
);

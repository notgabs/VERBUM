"use client";

import React, { useState, useMemo, useRef, useEffect, Suspense } from "react";
import { compareQuemSouEu } from "@/game/quemSouEuLogic";
import { useGameStats } from "@/hooks/useGameStats";
import { playClickSound, playRevealSound, playVictorySound, playWrongSound } from "@/utils/sound";
import { VictoryModal } from "@/components/VictoryModal";
import { CharacterPhoto } from "@/components/CharacterPhoto";
import { normalizeForSearch } from "@/utils/text";
import { selectDailyId, getLocalDayKey } from "@/domain/game/dailyChallenge";
import { QUEM_SOU_EU_DAILY_STORAGE_KEY } from "@/domain/game/storageKeys";
import { useQuemSouEuCatalog } from "@/hooks/useQuemSouEuCatalog";
import { useTimeoutRegistry } from "@/hooks/useTimeoutRegistry";
import { CatalogState } from "@/components/CatalogState";
import { FitText } from "@/components/FitText";
import { NextChallengeCountdown } from "@/components/NextChallengeCountdown";
import { SearchCombobox } from "@/components/ui/SearchCombobox";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { QuemSouEu } from "@/types/game";

const TOTAL_PISTAS = 6;
/** Com as 6 pistas abertas (após 5 erros) sobra só mais 1 tentativa: 6 palpites no total. */
const MAX_GUESSES = TOTAL_PISTAS;
/** Duração da virada de cada carta (mais lenta, para dar tempo de acompanhar). */
const FLIP_SECONDS = 1.2;
/** Intervalo entre as cartas que se abrem em sequência quando o jogador acerta. */
const WIN_CASCADE_SECONDS = 0.45;

const TIPO_LABEL: Record<string, string> = { Santo: "Santo", Papa: "Papa", Clero: "Clero", Outro: "Outro" };

/**
 * As pistas vêm do catálogo como [Pista 1 ... Pista 6]: a 1 entrega a resposta e a 6 é a mais difícil.
 * O jogo abre a Pista 6 e, a cada erro, revela a próxima número abaixo, até a Pista 1.
 */
const pistaNumber = (revealOrder: number) => TOTAL_PISTAS - revealOrder; // ordem 0 -> Pista 6
const pistaText = (person: QuemSouEu | null, numero: number) => person?.dicas[numero - 1] ?? "";

const QuemSouEuGameInner: React.FC = () => {

  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  /** Palpites, do mais recente ao mais antigo, guardados pelo id da figura. */
  const [guesses, setGuesses] = useState<string[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  /** true só quando o jogador acabou de acertar (confete e som); ao voltar à tela já vencida, não. */
  const [justWon, setJustWon] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const { recordGameResult } = useGameStats();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { schedule } = useTimeoutRegistry();
  const { data: catalog, isLoading, error, retry } = useQuemSouEuCatalog();
  const byId = useMemo(() => new Map(catalog.map((c) => [c.id, c])), [catalog]);

  const targetPerson = useMemo(() => {
    if (catalog.length === 0) return null;
    const ids = catalog.map((c) => c.id);
    const targetId = selectDailyId(ids);
    return catalog.find((c) => c.id === targetId) ?? catalog[0];
  }, [catalog]);

  // Restaura o progresso do desafio diário
  useEffect(() => {
    if (!targetPerson || byId.size === 0) return;
    try {
      const saved = JSON.parse(localStorage.getItem(QUEM_SOU_EU_DAILY_STORAGE_KEY) ?? "null");
      if (saved?.date !== getLocalDayKey() || saved.targetId !== targetPerson.id || !Array.isArray(saved.guesses)) return;
      const loaded = (saved.guesses as unknown[])
        .filter((g): g is string => typeof g === "string" && byId.has(g))
        .reverse();
      if (loaded.length === 0) return;
      // Aplica no próximo quadro para não encadear renderizações dentro do efeito
      const frame = requestAnimationFrame(() => {
        setGuesses((current) => (current.length === 0 ? loaded : current));
        if (loaded[0] === targetPerson.id) {
          setIsWon(true);
          setIsVictoryModalOpen(true);
        }
      });
      return () => cancelAnimationFrame(frame);
    } catch { /* estado salvo inválido: ignora */ }
  }, [targetPerson, byId]);

  // Salva o progresso do desafio diário
  useEffect(() => {
    if (!targetPerson || guesses.length === 0) return;
    try {
      localStorage.setItem(QUEM_SOU_EU_DAILY_STORAGE_KEY, JSON.stringify({
        date: getLocalDayKey(),
        targetId: targetPerson.id,
        guesses: [...guesses].reverse(),
      }));
    } catch { /* armazenamento indisponível: segue sem salvar */ }
  }, [guesses, targetPerson]);

  /** Quantas pistas o jogador já viu (começa com 1: a Pista 6). Ao acertar, todas se abrem. */
  const wrongGuesses = isWon ? guesses.slice(1) : guesses;
  const isLost = !isWon && guesses.length >= MAX_GUESSES;
  const attemptsLeft = Math.max(0, MAX_GUESSES - guesses.length);
  const seenCount = Math.min(TOTAL_PISTAS, wrongGuesses.length + 1);
  const revealedCount = isWon ? TOTAL_PISTAS : seenCount;
  const currentPista = pistaNumber(seenCount - 1);

  const shake = () => { setIsShaking(true); schedule(() => setIsShaking(false), 400); };

  const handleSelect = (selected: QuemSouEu) => {
    if (!targetPerson || isWon || isLost) return;
    if (guesses.includes(selected.id)) { setQuery(""); shake(); return; }

    const { isCorrect } = compareQuemSouEu(selected.nome, targetPerson);
    const updatedGuesses = [selected.id, ...guesses];
    setGuesses(updatedGuesses);
    setQuery("");

    if (isCorrect) {
      setIsWon(true);
      setJustWon(true);
      playVictorySound();
      recordGameResult(true, updatedGuesses.length, seenCount);
      // A tela de vitória sobe na hora; as pistas restantes se abrem por trás e ficam visíveis ao fechá-la
      setIsVictoryModalOpen(true);
    } else {
      playWrongSound();
      if (updatedGuesses.length < MAX_GUESSES) schedule(() => playRevealSound(), 250);
      // Esgotou a última tentativa: derrota
      else recordGameResult(false, updatedGuesses.length, TOTAL_PISTAS);
      shake();
    }
  };

  const filteredOptions = useMemo(() => {
    const normQuery = normalizeForSearch(query.trim());
    return catalog.filter(
      (c) =>
        (!normQuery ||
          normalizeForSearch(c.nome).includes(normQuery) ||
          c.aliases.some((a) => normalizeForSearch(a).includes(normQuery))) &&
        !guesses.includes(c.id)
    );
  }, [catalog, guesses, query]);

  if (isLoading || error) return <CatalogState error={error ? error.message : null} onRetry={retry} />;

  /** Enter ou "Chutar": usa a primeira sugestão; texto que não está no catálogo não gasta tentativa. */
  const submitFirst = () => {
    if (!query.trim() || isWon || isLost) return;
    const first = filteredOptions[0];
    if (first) { playClickSound(); handleSelect(first); }
    else shake();
  };

  const chronological = [...guesses].reverse();
  const subtitle = isWon
    ? `Você acertou em ${guesses.length} ${guesses.length === 1 ? "palpite" : "palpites"}!`
    : isLost
    ? "Acabaram as tentativas."
    : attemptsLeft === 1
    ? "Última tentativa!"
    : "";

  return (
    <>
    <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col max-md:min-h-[calc(100dvh-4.5rem)] gap-2.5 sm:gap-3">
      {/* Cabeçalho compacto */}
      <header className="flex shrink-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[clamp(22px,3.5vw,30px)] font-black leading-tight tracking-[-0.02em]">Quem sou eu?</h1>
          </div>
          {subtitle && <p className={`text-[13px] font-semibold ${!isWon && !isLost && attemptsLeft === 1 ? "text-[var(--color-status-wrong)]" : "text-[var(--color-text-muted)]"}`}>{subtitle}</p>}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--color-surface)] px-3.5 py-1.5 text-[13px] font-extrabold tabular-nums shadow-[var(--shadow-soft)]" aria-label={`${guesses.length} de ${MAX_GUESSES} tentativas`}>
          <motion.span key={guesses.length} initial={{ scale: 1.6, color: "var(--color-primary)" }} animate={{ scale: 1, color: "var(--color-text-main)" }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
            {guesses.length}
          </motion.span>
          <span className="text-[var(--color-text-muted)]">/ {MAX_GUESSES}</span>
        </span>
      </header>

      {/* As 6 cartas, da 6 à 1: ocupam o espaço que sobra na tela, sem rolagem */}
      <section className="grid min-h-0 w-full flex-1 grid-cols-2 grid-rows-[repeat(3,minmax(120px,1fr))] gap-2.5 md:grid-cols-3 md:grid-rows-[repeat(2,minmax(130px,1fr))] md:gap-3 [@media(orientation:landscape)_and_(max-height:600px)]:grid-cols-3 [@media(orientation:landscape)_and_(max-height:600px)]:grid-rows-[repeat(2,minmax(130px,1fr))]" aria-label="Pistas">
        {Array.from({ length: TOTAL_PISTAS }).map((_, order) => {
          const numero = pistaNumber(order);
          const isRevealed = order < revealedCount;
          const isCurrent = !isWon && !isLost && numero === currentPista;
          const isBonus = (isWon || isLost) && order >= seenCount;
          const text = pistaText(targetPerson, numero);
          const delay = isBonus ? (order - seenCount) * WIN_CASCADE_SECONDS : 0.15;

          return (
            <div key={`${targetPerson?.id}-${numero}`} className="relative min-h-0" style={{ perspective: 1200 }}>
              <motion.div
                className="relative h-full w-full"
                initial={false}
                animate={{ rotateY: isRevealed ? 180 : 0 }}
                transition={reduce ? { duration: 0 } : { duration: FLIP_SECONDS, ease: [0.45, 0.05, 0.25, 1], delay }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Frente: fechada */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-[20px] bg-[linear-gradient(160deg,#1f4f8f,#0f2a4a)] text-[var(--color-gold)] shadow-[inset_0_0_0_2px_color-mix(in_srgb,var(--color-gold)_45%,transparent),0_10px_24px_rgba(15,42,74,0.25)]"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="text-[44px] font-black leading-none sm:text-[56px]">{numero}</span>
                </div>

                {/* Verso: pista aberta */}
                <div
                  className={`surface absolute inset-0 flex flex-col overflow-y-auto rounded-[20px] p-3 text-left sm:p-4 ${
                    isCurrent
                      ? "outline-[3px] outline-offset-0 outline-[var(--color-primary)] [outline-style:solid]"
                      : isBonus
                      ? "outline-2 outline-offset-0 outline-[var(--color-gold)] [outline-style:solid]"
                      : ""
                  }`}
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <span className={`eyebrow ${isCurrent ? "!text-[var(--color-text-accent)]" : ""}`}>Pista {numero}</span>
                  <FitText max={15} min={10} className="my-auto py-1 font-semibold leading-snug">
                    {text}
                  </FitText>
                </div>
              </motion.div>
            </div>
          );
        })}
      </section>

      {/* As 6 tentativas: foto e nome de cada palpite */}
      <section className="grid shrink-0 grid-cols-6 gap-2" aria-label="Tentativas">
        {Array.from({ length: MAX_GUESSES }).map((_, slot) => {
          const person = chronological[slot] ? byId.get(chronological[slot]) : undefined;
          const isWinningGuess = isWon && slot === chronological.length - 1;
          return (
            <figure key={slot} className="flex min-w-0 flex-col items-center gap-1 text-center">
              {person ? (
                <motion.span
                  initial={reduce ? false : { opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className={`relative block aspect-square w-full max-w-[52px] overflow-hidden rounded-[14px] sm:max-w-[60px] ${
                    isWinningGuess ? "ring-[3px] ring-[var(--color-status-correct)]" : "ring-[3px] ring-[var(--color-status-wrong)]"
                  }`}
                >
                  <CharacterPhoto image={person.imagem} alt={`Imagem de ${person.nome}`} className={`h-full w-full object-cover ${isWinningGuess ? "" : "grayscale-[35%]"}`} />
                  <span
                    className={`absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black text-white ${
                      isWinningGuess ? "bg-[var(--color-status-correct)]" : "bg-[var(--color-status-wrong)]"
                    }`}
                    aria-hidden="true"
                  >
                    {isWinningGuess ? <CheckIcon size={10} /> : "✕"}
                  </span>
                </motion.span>
              ) : (
                <span className="flex aspect-square w-full max-w-[52px] items-center justify-center rounded-[14px] border-2 border-dashed border-[color-mix(in_srgb,var(--color-text-muted)_40%,transparent)] text-[13px] font-extrabold text-[var(--color-text-muted)] sm:max-w-[60px]" aria-hidden="true">
                  {slot + 1}
                </span>
              )}
              <figcaption className="line-clamp-2 h-[2.3em] w-full text-[10px] font-bold leading-[1.15] sm:text-[11.5px]">{person ? person.nome : ""}</figcaption>
            </figure>
          );
        })}
      </section>

      {/* Barra de chute / fim de jogo */}
      {isWon ? (
        <div className="surface flex shrink-0 flex-wrap items-center justify-center gap-2 rounded-[22px] px-3 py-2.5">
          <NextChallengeCountdown />
        </div>
      ) : isLost && targetPerson ? (
        <div className="surface flex h-14 shrink-0 items-center gap-3 rounded-full py-1.5 pl-2 pr-2">
          <CharacterPhoto image={targetPerson.imagem} alt={`Imagem de ${targetPerson.nome}`} className="h-11 w-11 shrink-0 rounded-full object-cover ring-[3px] ring-[var(--color-gold)]" />
          <span className="min-w-0 flex-1">
            <span className="eyebrow block">Era</span>
            <span className="block truncate text-[15px] font-black leading-tight sm:text-[17px]">{targetPerson.nome}</span>
          </span>
          <NextChallengeCountdown />
        </div>
      ) : (
        <motion.div
          animate={!reduce && isShaking ? { x: [0, -8, 8, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-20 flex shrink-0 gap-2"
        >
          <SearchCombobox
            id="quem-search"
            label="Seu palpite"
            className="flex-1"
            inputClassName="!h-14 !rounded-full !border-2 !border-transparent !bg-[var(--color-surface)] !text-[17px] !font-bold !shadow-[var(--shadow-soft)] focus:!border-[var(--color-primary)]"
            value={query}
            onChange={setQuery}
            items={filteredOptions}
            getKey={(o) => o.id}
            inputRef={inputRef}
            placeholder="Quem sou eu? Digite um nome…"
            emptyText="Nenhuma figura encontrada"
            dropUp
            onPick={(o) => { playClickSound(); handleSelect(o); }}
            onSubmitRaw={submitFirst}
            renderItem={(o) => (
              <span className="flex items-center gap-3">
                <CharacterPhoto image={o.imagem} alt="" className="h-10 w-10 shrink-0 rounded-full bg-[var(--color-fill)] object-cover" />
                <span className="flex-1 text-[16px] font-bold">{o.nome}</span>
                <span className="rounded-full bg-[var(--color-fill)] px-2 py-0.5 text-[11px] font-extrabold text-[var(--color-text-muted)]">
                  {TIPO_LABEL[o.tipo] ?? o.tipo}
                </span>
              </span>
            )}
          />
          <Button size="lg" className="!h-14 shrink-0 px-6" disabled={!query.trim()} onClick={submitFirst}>
            Chutar
          </Button>
        </motion.div>
      )}

    </div>
  {isWon && targetPerson && (
    <VictoryModal
      solutionName={targetPerson.nome}
      solutionImage={targetPerson.imagem}
      attemptsCount={guesses.length}
      hintsUsedCount={seenCount}
      characterKnownFor={targetPerson.conhecidoPor}
      characterType={TIPO_LABEL[targetPerson.tipo] ?? targetPerson.tipo}
      characterSummary={targetPerson.resumo}
      game="quem-sou-eu"
      open={isVictoryModalOpen}
      celebrate={justWon}
      onClose={() => setIsVictoryModalOpen(false)}
      showCountdown
    />
  )}
    </>
  );
};

export const QuemSouEuGame: React.FC = () => (
  <Suspense fallback={<CatalogState />}>
    <QuemSouEuGameInner />
  </Suspense>
);

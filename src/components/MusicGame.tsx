"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import catalogo from "../../public/data/musicas.json";
import {
  CLIP_STEPS, MAX_ATTEMPTS, clipForAttempts, formatSeconds, isCorrectGuess, musicGameStatus, timelinePosition, titleKey,
  type MusicAttempt,
} from "@/domain/game/musicLogic";
import { getLocalDayKey, selectDailyId } from "@/domain/game/dailyChallenge";
import { MUSIC_DAILY_STORAGE_KEY } from "@/domain/game/storageKeys";
import { useClipPlayer } from "@/hooks/useClipPlayer";
import { useGameStats } from "@/hooks/useGameStats";
import { useTimeoutRegistry } from "@/hooks/useTimeoutRegistry";
import { playClickSound, playVictorySound, playWrongSound } from "@/utils/sound";
import { normalizeForSearch } from "@/utils/text";
import { SearchCombobox } from "@/components/ui/SearchCombobox";
import { Button } from "@/components/ui/Button";
import { CheckIcon, MusicIcon, RefreshIcon } from "@/components/ui/Icons";
import { ModalBase } from "@/components/ModalBase";
import { NextChallengeCountdown } from "@/components/NextChallengeCountdown";
import { CatalogState } from "@/components/CatalogState";

type Musica = (typeof catalogo.musicas)[number];
interface Opcao { key: string; titulo: string; artista: string; apelidos: string[] }

const MUSICAS: Musica[] = catalogo.musicas;
/** Tudo o que aparece na busca: as músicas jogáveis e outros louvores conhecidos (que não tocam). */
const OPCOES: Opcao[] = [
  ...MUSICAS.map((m) => ({ key: m.id, titulo: m.titulo, artista: m.artista, apelidos: m.apelidos })),
  ...(catalogo.outrasMusicas as { titulo: string; artista: string }[]).map((m) => ({ key: `outra-${titleKey(m.titulo)}`, titulo: m.titulo, artista: m.artista, apelidos: [] })),
].sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR") || a.artista.localeCompare(b.artista, "pt-BR"));
const PLAYABLE_IDS = new Set(MUSICAS.map((m) => m.id));
/** Identifica a opção escolhida num palpite (palpites salvos antes da chave usam o título). */
const attemptKey = (a: Exclude<MusicAttempt, { kind: "skip" }>) =>
  a.key ?? OPCOES.find((o) => titleKey(o.titulo) === titleKey(a.titulo))?.key ?? a.titulo;

const PlayIcon = ({ size = 30 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg>
);
const StopIcon = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.5" /></svg>
);
const SkipIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 6.2v11.6a.8.8 0 0 0 1.2.7L14 13.2V17.8a.8.8 0 0 0 1.2.7l7.3-5.8a.9.9 0 0 0 0-1.4l-7.3-5.8a.8.8 0 0 0-1.2.7v4.6L6.2 5.5a.8.8 0 0 0-1.2.7Z" /></svg>
);

function readDaily(targetId: string): MusicAttempt[] {
  try {
    const saved = JSON.parse(localStorage.getItem(MUSIC_DAILY_STORAGE_KEY) ?? "null");
    if (saved?.date !== getLocalDayKey() || saved.targetId !== targetId || !Array.isArray(saved.attempts)) return [];
    return (saved.attempts as MusicAttempt[]).filter((a) => a && ["skip", "wrong", "correct"].includes(a.kind)).slice(0, MAX_ATTEMPTS);
  } catch { return []; }
}

const MusicGameInner: React.FC = () => {
  const reduce = useReducedMotion();
  const { recordMusicResult } = useGameStats();
  const { schedule } = useTimeoutRegistry();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const target = useMemo(() => {
    const id = selectDailyId(MUSICAS.map((m) => m.id));
    return MUSICAS.find((m) => m.id === id) ?? MUSICAS[0];
  }, []);

  const [attempts, setAttempts] = useState<MusicAttempt[]>([]);
  const [query, setQuery] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const player = useClipPlayer(target.deezerId);

  const status = musicGameStatus(attempts);
  const isOver = status !== "playing";
  /** Trecho que o botão toca agora: o liberado na tentativa atual; no fim do jogo, os 20 s inteiros. */
  const clip = isOver ? CLIP_STEPS[MAX_ATTEMPTS - 1] : clipForAttempts(attempts.length);

  // Restaura o desafio diário
  useEffect(() => {
    const loaded = readDaily(target.id);
    if (loaded.length === 0) return;
    const frame = requestAnimationFrame(() => {
      setAttempts((cur) => (cur.length === 0 ? loaded : cur));
      if (musicGameStatus(loaded) !== "playing") setIsResultOpen(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [target.id]);

  // Salva o desafio diário
  useEffect(() => {
    if (attempts.length === 0) return;
    try {
      localStorage.setItem(MUSIC_DAILY_STORAGE_KEY, JSON.stringify({ date: getLocalDayKey(), targetId: target.id, attempts }));
    } catch { /* sem armazenamento: segue sem salvar */ }
  }, [attempts, target.id]);

  const shake = () => { setIsShaking(true); schedule(() => setIsShaking(false), 400); };

  const finish = (updated: MusicAttempt[]) => {
    const result = musicGameStatus(updated);
    if (result === "playing") return;
    player.stop();
    recordMusicResult(result === "won");
    if (result === "won") playVictorySound();
    // A tela de resultado sobe na hora
    setIsResultOpen(true);
  };

  const guess = (opcao: Opcao) => {
    if (isOver) return;
    if (attempts.some((a) => a.kind !== "skip" && attemptKey(a) === opcao.key)) { setQuery(""); shake(); return; }
    // Músicas jogáveis contam pela faixa exata (há títulos iguais, como as duas "Yeshua"); as outras, pelo título
    const correct = opcao.key === target.id || (!PLAYABLE_IDS.has(opcao.key) && isCorrectGuess(opcao.titulo, target));
    const updated: MusicAttempt[] = [...attempts, { kind: correct ? "correct" : "wrong", titulo: opcao.titulo, key: opcao.key }];
    setAttempts(updated);
    setQuery("");
    if (!correct) { playWrongSound(); shake(); }
    finish(updated);
  };

  const skip = () => {
    if (isOver) return;
    playClickSound();
    const updated: MusicAttempt[] = [...attempts, { kind: "skip" }];
    setAttempts(updated);
    finish(updated);
  };

  const guessed = useMemo(() => new Set(attempts.flatMap((a) => (a.kind === "skip" ? [] : [attemptKey(a)]))), [attempts]);
  const filtered = useMemo(() => {
    const q = normalizeForSearch(query.trim());
    if (!q) return [];
    return OPCOES.filter(
      (o) => !guessed.has(o.key) &&
        [o.titulo, o.artista, ...o.apelidos].some((t) => normalizeForSearch(t).includes(q))
    ).slice(0, 30);
  }, [query, guessed]);

  const submitFirst = () => {
    if (!query.trim() || isOver) return;
    const first = filtered[0];
    if (first) { playClickSound(); guess(first); } else shake();
  };

  const togglePlay = () => {
    if (player.status !== "ready") return;
    if (player.isPlaying) player.stop();
    else void player.play(clip);
  };

  // Barra de trechos: até onde está liberado e até onde já tocou
  const unlocked = timelinePosition(clip);
  const progress = player.elapsed !== null ? timelinePosition(player.elapsed) : 0;
  const subtitle = status === "won"
    ? `Você acertou em ${attempts.length} ${attempts.length === 1 ? "tentativa" : "tentativas"}!`
    : status === "lost"
    ? "Acabaram as tentativas."
    : attempts.length === MAX_ATTEMPTS - 1
    ? "Última tentativa: 20 s de música!"
    : "";

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col gap-2.5 sm:gap-3">
      <header className="flex shrink-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[clamp(22px,3.5vw,30px)] font-black leading-tight tracking-[-0.02em]">Acerte a música</h1>
          </div>
          {subtitle && <p className={`text-[13px] font-semibold ${status === "playing" && attempts.length === MAX_ATTEMPTS - 1 ? "text-[var(--color-status-wrong)]" : "text-[var(--color-text-muted)]"}`}>{subtitle}</p>}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--color-surface)] px-3.5 py-1.5 text-[13px] font-extrabold tabular-nums shadow-[var(--shadow-soft)]" aria-label={`${attempts.length} de ${MAX_ATTEMPTS} tentativas`}>
          {attempts.length}<span className="text-[var(--color-text-muted)]">/ {MAX_ATTEMPTS}</span>
        </span>
      </header>

      {/* Player */}
      <section className="surface flex shrink-0 flex-col gap-4 rounded-[26px] p-4 sm:p-5" aria-label="Trecho da música">
        <div className="flex items-center gap-4">
          <motion.button
            type="button"
            onClick={togglePlay}
            disabled={player.status !== "ready"}
            whileTap={{ scale: 0.92 }}
            aria-label={player.isPlaying ? "Parar" : `Tocar ${formatSeconds(clip)} da música`}
            className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-[0_5px_0_var(--color-primary-press,#123f8f),0_12px_24px_rgba(15,42,74,0.25)] disabled:opacity-50 sm:h-20 sm:w-20"
          >
            {player.status === "loading" ? (
              <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-white/40 border-t-white" aria-hidden="true" />
            ) : player.isPlaying ? <StopIcon /> : <span className="translate-x-[2px]"><PlayIcon /></span>}
          </motion.button>
          <div className="min-w-0 flex-1">
            {player.status === "error" ? (
              <div className="flex flex-col items-start gap-2">
                <p className="text-[14px] font-bold text-[var(--color-status-wrong)]">Não foi possível carregar a música.</p>
                <Button size="sm" variant="tinted" onClick={player.retry}><RefreshIcon size={15} /> Tentar de novo</Button>
              </div>
            ) : (
              <>
                <p className="eyebrow">{isOver ? "Ouça os 20 s" : "Trecho liberado"}</p>
                <p className="text-[clamp(26px,5vw,34px)] font-black leading-none tabular-nums">{formatSeconds(clip)}</p>
              </>
            )}
          </div>
          {!isOver && (
            <Button variant="secondary" className="shrink-0 !px-4" onClick={skip} disabled={player.status === "loading"} aria-label="Pular e ouvir um trecho maior">
              <SkipIcon /> <span className="hidden sm:inline">Pular</span>
            </Button>
          )}
        </div>

        {/* Barra com os 8 trechos */}
        <div>
          <div className="relative h-3 overflow-hidden rounded-full bg-[var(--color-fill)]">
            <div className="absolute inset-y-0 left-0 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_28%,transparent)]" style={{ width: `${unlocked * 100}%` }} />
            <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-primary)]" style={{ width: `${progress * 100}%` }} />
            {CLIP_STEPS.slice(0, -1).map((_, i) => (
              <span key={i} className="absolute inset-y-0 w-[2px] bg-[var(--color-surface)]" style={{ left: `${((i + 1) / MAX_ATTEMPTS) * 100}%` }} aria-hidden="true" />
            ))}
          </div>
          <div className="mt-1.5 grid grid-cols-8 text-center text-[10px] font-bold tabular-nums text-[var(--color-text-muted)] sm:text-[11px]">
            {CLIP_STEPS.map((s, i) => (
              <span key={s} className={i < attempts.length + 1 || isOver ? "text-[var(--color-text-main)]" : ""}>{String(s).replace(".", ",")}s</span>
            ))}
          </div>
        </div>
      </section>

      {/* As 8 tentativas */}
      <section className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto sm:gap-1.5" aria-label="Tentativas">
        {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
          const a = attempts[i];
          const isCurrent = !isOver && i === attempts.length;
          return (
            <div
              key={i}
              className={`flex min-h-[29px] shrink-0 items-center gap-2.5 rounded-[12px] px-3 py-0.5 text-[13.5px] font-bold sm:min-h-9 sm:rounded-[14px] ${
                !a
                  ? `border-2 border-dashed ${isCurrent ? "border-[var(--color-primary)]" : "border-[color-mix(in_srgb,var(--color-text-muted)_30%,transparent)]"} text-[var(--color-text-muted)]`
                  : a.kind === "correct"
                  ? "bg-[color-mix(in_srgb,var(--color-status-correct)_18%,var(--color-surface))]"
                  : "surface"
              }`}
            >
              <span className="w-10 shrink-0 text-[11px] font-extrabold tabular-nums text-[var(--color-text-muted)]">{formatSeconds(CLIP_STEPS[i])}</span>
              {a ? (
                <motion.span initial={reduce ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex min-w-0 flex-1 items-center gap-2">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white ${a.kind === "correct" ? "bg-[var(--color-status-correct)]" : a.kind === "wrong" ? "bg-[var(--color-status-wrong)]" : "bg-[var(--color-text-muted)]"}`} aria-hidden="true">
                    {a.kind === "correct" ? <CheckIcon size={11} /> : a.kind === "wrong" ? "✕" : "»"}
                  </span>
                  <span className={`truncate ${a.kind === "skip" ? "italic text-[var(--color-text-muted)]" : ""}`}>{a.kind === "skip" ? "Pulou" : a.titulo}</span>
                </motion.span>
              ) : (
                <span className="flex-1 text-[12.5px] font-semibold">{isCurrent ? "Sua vez" : ""}</span>
              )}
            </div>
          );
        })}
      </section>

      {/* Barra de chute / fim de jogo */}
      {isOver ? (
        <div className="surface flex h-14 shrink-0 items-center justify-center gap-2 rounded-full px-2">
          <Button variant="gold" className="!h-11" onClick={() => { playClickSound(); setIsResultOpen(true); }}>
            <MusicIcon size={18} /> Ver a música
          </Button>
          <NextChallengeCountdown />
        </div>
      ) : (
        <motion.div animate={!reduce && isShaking ? { x: [0, -8, 8, -4, 4, 0] } : { x: 0 }} transition={{ duration: 0.4 }} className="relative z-20 flex shrink-0 gap-2">
          <SearchCombobox
            id="musica-search"
            label="Seu palpite"
            className="flex-1"
            inputClassName="!h-14 !rounded-full !border-2 !border-transparent !bg-[var(--color-surface)] !text-[17px] !font-bold !shadow-[var(--shadow-soft)] focus:!border-[var(--color-primary)]"
            value={query}
            onChange={setQuery}
            items={filtered}
            getKey={(o) => o.key}
            inputRef={inputRef}
            placeholder="Qual é o louvor?"
            emptyText="Nenhuma música encontrada"
            dropUp
            onPick={(o) => { playClickSound(); guess(o); }}
            onSubmitRaw={submitFirst}
            renderItem={(o) => (
              <span className="flex flex-col">
                <span className="text-[16px] font-bold leading-tight">{o.titulo}</span>
                <span className="text-[12px] font-semibold text-[var(--color-text-muted)]">{o.artista}</span>
              </span>
            )}
          />
          <Button size="lg" className="!h-14 shrink-0 px-6" disabled={!query.trim()} onClick={submitFirst}>Chutar</Button>
        </motion.div>
      )}

      <AnimatePresence>
        {isOver && isResultOpen && (
          <MusicResult
            musica={target}
            cover={player.cover}
            won={status === "won"}
            attemptsCount={attempts.length}
            onPlay={() => void player.play(CLIP_STEPS[MAX_ATTEMPTS - 1])}
            onStop={player.stop}
            isPlaying={player.isPlaying}
            canPlay={player.status === "ready"}
            onClose={() => setIsResultOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

interface MusicResultProps {
  musica: Musica;
  cover: string | null;
  won: boolean;
  attemptsCount: number;
  isPlaying: boolean;
  canPlay: boolean;
  onPlay: () => void;
  onStop: () => void;
  onClose: () => void;
}

/** Tela final: capa, título, artista e links para ouvir a música completa. */
function MusicResult({ musica, cover, won, attemptsCount, isPlaying, canPlay, onPlay, onStop, onClose }: MusicResultProps) {
  const links = [
    { label: "Spotify", href: musica.spotify, cls: "bg-[#1db954] text-white" },
    { label: "YouTube", href: musica.youtube, cls: "bg-[#ff0033] text-white" },
    { label: "Deezer", href: musica.deezer, cls: "bg-[#a238ff] text-white" },
  ];
  return (
    <ModalBase label={won ? "Você acertou" : "Fim de jogo"} onClose={onClose} className="max-w-md overflow-hidden !p-0">
      <div className={`flex flex-col items-center px-6 pb-6 pt-8 text-center text-white ${won ? "bg-[linear-gradient(170deg,#2f8cff,#122f6b)]" : "bg-[linear-gradient(170deg,#5b6b8c,#1e2a44)]"}`}>
        <div className="relative h-36 w-36 overflow-hidden rounded-[24px] bg-[#0f2a4a] shadow-[0_0_0_4px_#ffd166,0_16px_30px_rgba(0,0,0,0.3)]">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={`Capa de ${musica.titulo}`} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-white/60"><MusicIcon size={48} /></span>
          )}
          <button
            type="button"
            onClick={isPlaying ? onStop : onPlay}
            disabled={!canPlay}
            aria-label={isPlaying ? "Parar" : "Ouvir 20 s da música"}
            className="absolute bottom-2 right-2 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1a4fa8] shadow-lg disabled:opacity-50"
          >
            {isPlaying ? <StopIcon size={18} /> : <span className="translate-x-[1px]"><PlayIcon size={20} /></span>}
          </button>
        </div>
        <p className={`mt-5 text-[12px] font-extrabold uppercase tracking-[0.08em] ${won ? "text-[#ffd166]" : "text-white/70"}`}>
          {won ? `Você acertou em ${attemptsCount} ${attemptsCount === 1 ? "tentativa" : "tentativas"}!` : "Era esta a música"}
        </p>
        <h2 className="mt-1 text-[clamp(24px,5vw,30px)] font-black leading-tight">{musica.titulo}</h2>
        <p className="text-[15px] font-bold text-white/80">{musica.artista}</p>
      </div>
      <div className="flex flex-col gap-3 p-5">
        <p className="eyebrow text-center">Ouça completa</p>
        <div className="grid grid-cols-3 gap-2">
          {links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" onClick={() => playClickSound()}
              className={`flex h-11 items-center justify-center rounded-full text-[14px] font-extrabold transition-transform active:scale-95 ${l.cls}`}>
              {l.label}
            </a>
          ))}
        </div>
        
          <div className="rounded-[18px] border-2 border-[var(--color-border-subtle)] px-4 py-3"><NextChallengeCountdown /></div>
        
        <p className="text-center text-[11px] font-semibold text-[var(--color-text-muted)]">Trecho: prévia oficial do Deezer.</p>
      </div>
    </ModalBase>
  );
}

export const MusicGame: React.FC = () => (
  <Suspense fallback={<CatalogState />}>
    <MusicGameInner />
  </Suspense>
);

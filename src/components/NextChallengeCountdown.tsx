"use client";

import { useEffect, useState } from "react";

const REGIONS: Record<string, string> = {
  America: "América",
  Europe: "Europa",
  Africa: "África",
  Asia: "Ásia",
  Australia: "Oceania",
  Pacific: "Pacífico",
  Atlantic: "Atlântico",
  Indian: "Índico",
  Antarctica: "Antártida",
};

/** Milissegundos até a próxima meia-noite local (quando o desafio diário troca). */
function msUntilMidnight(now: Date) {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

function format(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function timezoneLabel(now: Date) {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  const region = REGIONS[zone.split("/")[0]] ?? "Local";
  const offsetMin = -now.getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const hours = Math.floor(Math.abs(offsetMin) / 60);
  const minutes = Math.abs(offsetMin) % 60;
  const offset = `UTC${sign}${hours}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""}`;
  return `${region} (meia-noite em ${offset})`;
}

interface Props {
  className?: string;
  label?: string;
}

/** "Próximo personagem em 09:47:38 · Fuso horário: América (meia-noite em UTC-3)". */
export function NextChallengeCountdown({ className = "", label = "Próximo personagem em" }: Props) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = requestAnimationFrame(tick);
    const id = setInterval(tick, 1000);
    return () => { cancelAnimationFrame(first); clearInterval(id); };
  }, []);

  if (!now) return <div className={`h-[52px] ${className}`} aria-hidden="true" />;
  const remaining = msUntilMidnight(now);

  return (
    <div className={`text-center ${className}`} role="timer" aria-live="off">
      {remaining > 1000 ? (
        <p className="text-[15px] font-bold">
          {label}{" "}
          <span className="inline-block min-w-[5.5ch] rounded-lg bg-[var(--color-primary-soft)] px-2 py-0.5 font-black tabular-nums text-[var(--color-text-accent)]">
            {format(remaining)}
          </span>
        </p>
      ) : (
        <p className="text-[15px] font-bold">Novo personagem disponível! Recarregue a página.</p>
      )}
      <p className="mt-1 text-[12px] font-semibold text-[var(--color-text-muted)]">Fuso horário: {timezoneLabel(now)}</p>
    </div>
  );
}

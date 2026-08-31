import { Attempt } from "@/hooks/useMusicGame";

interface Props {
  attempts: Attempt[];
}

/** Grade visual que exibe cada tentativa e seu feedback. */
export const MusicBoard: React.FC<Props> = ({ attempts }) => {
  return (
    <div className="mt-4 grid gap-2">
      {attempts.map((a, i) => (
        <div
          key={i}
          className={`flex items-center rounded-xl px-3 py-2 text-sm font-sans shadow-sm border ${
            a.correct 
              ? "bg-[var(--color-status-correct)] text-white border-[var(--color-status-correct)]" 
              : "bg-[var(--color-status-wrong)] text-white border-[var(--color-status-wrong)]"
          }`}
        >
          <span className="w-6 text-center font-black">{i + 1}.</span>
          <span className="flex-1 ml-2 truncate font-medium">{a.guess}</span>
          <span className="w-12 text-center opacity-90">{a.clipLength}s</span>
          {a.correct ? (
            <span className="ml-2 font-bold text-lg">✓</span>
          ) : (
            <span className="ml-2 font-bold text-lg">{a.direction === "up" ? "↑" : "↓"}</span>
          )}
        </div>
      ))}
    </div>
  );
};

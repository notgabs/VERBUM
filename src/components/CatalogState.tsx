import { Button } from "@/components/ui/Button";
import { RefreshIcon } from "@/components/ui/Icons";

interface CatalogStateProps { error?: string | null; onRetry?: () => void; }

/** Carregamento (esqueleto) ou erro recuperável do catálogo. */
export function CatalogState({ error, onRetry }: CatalogStateProps) {
  if (!error) {
    return (
      <div className="w-full max-w-3xl space-y-4" role="status" aria-label="Preparando o desafio">
        <div className="skeleton h-4 w-28" />
        <div className="skeleton h-10 w-72" />
        <div className="skeleton h-[3.25rem] w-full" />
        <div className="skeleton h-24 w-full" />
        <span className="sr-only">Preparando o desafio…</span>
      </div>
    );
  }
  return (
    <div className="surface max-w-md p-6 text-center" role="alert">
      <p className="text-[15px] text-[var(--color-text-muted)]">{error}</p>
      <Button onClick={onRetry} variant="tinted" className="mt-4">
        <RefreshIcon size={16} /> Tentar novamente
      </Button>
    </div>
  );
}

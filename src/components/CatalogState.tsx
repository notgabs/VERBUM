interface CatalogStateProps { error?: string | null; onRetry?: () => void; }

export function CatalogState({ error, onRetry }: CatalogStateProps) {
  if (!error) return <p className="pixel-parchment-dark p-4 text-sm text-[#285b7f]" role="status">Preparando o desafio…</p>;
  return <div className="pixel-parchment-dark max-w-md p-5 text-center" role="alert"><p>{error}</p><button type="button" onClick={onRetry} className="pixel-btn-wood mt-4 px-4 py-2 text-sm font-bold">Tentar novamente</button></div>;
}


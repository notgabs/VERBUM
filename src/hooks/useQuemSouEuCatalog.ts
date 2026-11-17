import { useState, useEffect, useCallback } from "react";
import { QuemSouEu } from "@/types/game";
import { hydrateQuemSouEu } from "@/domain/game/catalogQuemSouEu";
import { asset } from "@/utils/asset";

/** Carrega o catálogo do Quem Sou Eu? (só figuras do catolicismo, sem personagens bíblicos). */
export function useQuemSouEuCatalog() {
  const [data, setData] = useState<QuemSouEu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(asset("/data/quem-sou-eu.json"));
      if (!res.ok) throw new Error("Falha ao carregar o catálogo");
      setData(hydrateQuemSouEu(await res.json(), []));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro desconhecido"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
  }, [fetchData]);

  return { data, isLoading, error, retry: fetchData };
}

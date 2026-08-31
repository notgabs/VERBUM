import { useState, useEffect } from "react";
import { QuemSouEu, Personagem } from "@/types/game";
import { isPersonagem } from "@/domain/game/catalogContracts";
import { hydrateQuemSouEu } from "@/domain/game/catalogQuemSouEu";

export function useQuemSouEuCatalog() {
  const [data, setData] = useState<QuemSouEu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [personagensRes, quemSouEuRes] = await Promise.all([
        fetch("/data/personagens.json"),
        fetch("/data/quem-sou-eu.json"),
      ]);

      if (!personagensRes.ok || !quemSouEuRes.ok) {
        throw new Error("Falha ao carregar catálogos");
      }

      const personagensRaw = await personagensRes.json();
      const quemSouEuRaw = await quemSouEuRes.json();

      const personagens: Personagem[] = personagensRaw.filter(isPersonagem);
      const hydrated = hydrateQuemSouEu(quemSouEuRaw, personagens);

      setData(hydrated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro desconhecido"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  return { data, isLoading, error, retry: fetchData };
}

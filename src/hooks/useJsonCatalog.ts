"use client";

import { useCallback, useEffect, useState } from "react";

type CatalogState<T> = {
  data: T[];
  isLoading: boolean;
  error: string | null;
};

/** Carregamento client-side resiliente para os catálogos públicos do jogo. */
export function useJsonCatalog<T>(url: string, isValidItem: (value: unknown) => value is T) {
  const [state, setState] = useState<CatalogState<T>>({ data: [], isLoading: true, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    async function load() {
      try {
        await Promise.resolve();
        if (!active) return;
        setState((previous) => ({ ...previous, isLoading: true, error: null }));
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`Catálogo indisponível (${response.status})`);
        const payload: unknown = await response.json();
        if (!Array.isArray(payload) || !payload.every(isValidItem)) {
          throw new Error("O catálogo possui um formato inválido.");
        }
        if (active) setState({ data: payload, isLoading: false, error: null });
      } catch (error) {
        if (!active || (error instanceof DOMException && error.name === "AbortError")) return;
        if (process.env.NODE_ENV === "development") console.error(`Falha ao carregar ${url}`, error);
        setState({ data: [], isLoading: false, error: "Não foi possível carregar o desafio. Tente novamente." });
      }
    }
    void load();
    return () => { active = false; controller.abort(); };
  }, [attempt, isValidItem, url]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  return { ...state, retry };
}

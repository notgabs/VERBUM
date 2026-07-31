"use client";

import { useCallback, useEffect, useRef } from "react";

/** Registra timers de uma tela e garante que nenhum sobreviva ao unmount. */
export function useTimeoutRegistry() {
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      callback();
    }, delay);
    timers.current.add(timer);
    return timer;
  }, []);

  const cancelAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
  }, []);

  useEffect(() => cancelAll, [cancelAll]);
  return { schedule, cancelAll };
}


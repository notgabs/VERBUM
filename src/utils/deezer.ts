/**
 * Busca uma faixa na API pública do Deezer direto do navegador.
 * A API não libera CORS para JSON, mas aceita JSONP (`output=jsonp`), por isso a chamada é feita com <script>.
 * Assim o site funciona 100% estático (GitHub Pages), sem servidor próprio.
 */
export interface DeezerTrack {
  preview: string;
  cover: string | null;
}

let counter = 0;

export function fetchDeezerTrack(id: number, timeoutMs = 12000): Promise<DeezerTrack> {
  return new Promise((resolve, reject) => {
    const callback = `__verbumDeezer${Date.now()}_${counter++}`;
    const script = document.createElement("script");
    const w = window as unknown as Record<string, unknown>;
    const cleanup = () => {
      clearTimeout(timer);
      delete w[callback];
      script.remove();
    };
    const timer = setTimeout(() => { cleanup(); reject(new Error("Deezer demorou para responder")); }, timeoutMs);
    w[callback] = (data: { preview?: string; album?: { cover_big?: string; cover_medium?: string }; error?: unknown }) => {
      cleanup();
      if (!data || data.error || !data.preview) reject(new Error("Faixa sem prévia"));
      else resolve({ preview: data.preview, cover: data.album?.cover_big ?? data.album?.cover_medium ?? null });
    };
    script.onerror = () => { cleanup(); reject(new Error("Falha ao falar com o Deezer")); };
    script.src = `https://api.deezer.com/track/${id}?output=jsonp&callback=${callback}`;
    document.head.appendChild(script);
  });
}

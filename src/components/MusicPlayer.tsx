import { useEffect, useRef } from "react";

interface Props {
  /** Caminho do arquivo audio (ex.: /music/salmo-23.mp3) */
  src: string;
  /** Duração do trecho que deve ser reproduzido, em segundos */
  clipLength: number;
  /** Identificador único da tentativa – utilizado para "resetar" o áudio */
  attemptId: number;
}

/** Reprodutor invisível que toca apenas o intervalo solicitado. */
export const MusicPlayer: React.FC<Props> = ({
  src,
  clipLength,
  attemptId,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const playClip = async () => {
      try {
        audio.currentTime = 0;
        await audio.play();
        const timeout = setTimeout(() => audio.pause(), clipLength * 1000);
        return () => clearTimeout(timeout);
      } catch (_) {
        // falha silenciosa (arquivo inexistente ou autoplay bloqueado)
        return () => {};
      }
    };

    playClip();
  }, [src, clipLength, attemptId]); // reinicia sempre que a tentativa muda

  return <audio ref={audioRef} src={src} preload="metadata" aria-label="Trecho da música" />;
};

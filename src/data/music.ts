/** Interface pública para cada faixa utilizada no modo “Acertar a Música”. */
export interface Music {
  /** Nome completo que o usuário deve digitar (usado também no autocomplete). */
  title: string;
  /** Caminho relativo ao diretório public/. Ex.: /music/salmo-23.mp3 */
  src: string;
  /** Duração total da faixa em segundos (usada para limitar o clip). */
  duration: number;
}

/** Catálogo mínimo para iniciar o modo.  Acrescente novas faixas conforme necessidade. */
export const MUSIC_CATALOG: Music[] = [
  {
    title: "Salmo 23 – O Senhor é o meu Pastor",
    src: "/music/salmo-23.mp3",
    duration: 180,
  },
  {
    title: "Glória ao Pai",
    src: "/music/gloria-ao-pai.mp3",
    duration: 140,
  },
  {
    title: "Ave Maria",
    src: "/music/ave-maria.mp3",
    duration: 120,
  },
];

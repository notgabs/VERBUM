/** Os jogos, na ordem em que a tela de vitória leva o jogador de um para o próximo. */
export type GameKey = "personagem" | "passagem" | "quem-sou-eu" | "musica";

export interface GameInfo {
  href: string;
  title: string;
  description: string;
  /** Fundo do selo do jogo. */
  color: string;
  /** Silhueta usada no menu e no selo. */
  art: string;
  artRatio: number;
}

export const GAME_INFO: Record<GameKey, GameInfo> = {
  personagem: {
    href: "/personagem", title: "Adivinhe o personagem", description: "O personagem bíblico de hoje",
    color: "linear-gradient(150deg,#2f8cff,#1a5fc9)", art: "/menu/silhueta-cruz.webp", artRatio: 314 / 480,
  },
  passagem: {
    href: "/passagem", title: "Acerte a passagem", description: "Livro, capítulo e versículo de hoje",
    color: "linear-gradient(150deg,#ffad33,#f07c00)", art: "/menu/silhueta-livro.webp", artRatio: 640 / 449,
  },
  "quem-sou-eu": {
    href: "/quem-sou-eu", title: "Quem sou eu?", description: "Descubra quem está por trás das pistas",
    color: "linear-gradient(150deg,#3cc4dd,#178fae)", art: "/menu/silhueta-pessoa.webp", artRatio: 520 / 507,
  },
  musica: {
    href: "/musica", title: "Acerte a música", description: "Descubra o louvor em poucos segundos",
    color: "linear-gradient(150deg,#ff5fa2,#d6336c)", art: "/menu/silhueta-nota.webp", artRatio: 1,
  },
};

/** Depois de vencer cada jogo: personagem → passagem → quem sou eu → música → início. */
export const NEXT_GAME: Record<GameKey, GameKey | null> = {
  personagem: "passagem",
  passagem: "quem-sou-eu",
  "quem-sou-eu": "musica",
  musica: null,
};

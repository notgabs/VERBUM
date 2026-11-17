/**
 * Configuração de comportamento do jogo.
 *
 * Para testar um alvo específico durante o desenvolvimento, ligue `developmentMode`
 * e preencha `fixedPassageId`. Em produção, deixe como está: sem alvos fixos.
 */
export const GAME_CONFIG = {
  developmentMode: false,
  fixedCharacterId: undefined as string | undefined,
  fixedPassageId: undefined as string | undefined,
} as const;

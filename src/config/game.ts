/**
 * Configuração de comportamento do jogo.
 *
 * Enquanto o projeto estiver em desenvolvimento, mantenha `developmentMode`
 * ligado para repetir partidas e trocar os alvos de teste sem editar a UI.
 * Para ativar o desafio diário em produção, desligue o modo de desenvolvimento,
 * remova os IDs fixos e ligue `enableDailyChallenge`.
 */
export const GAME_CONFIG = {
  developmentMode: true,
  fixedCharacterId: undefined as string | undefined,
  fixedPassageId: undefined as string | undefined,
  allowReplay: true,
  enableDailyChallenge: false,
} as const;

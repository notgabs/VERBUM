import type { QuemSouEu, RawQuemSouEu, Personagem } from "../../types/game.ts";
import { normalizeForSearch } from "../../utils/text.ts";
import { isRawQuemSouEu } from "./catalogContracts.ts";

export function hydrateQuemSouEu(
  rawData: unknown[],
  personagensCatalogo: Personagem[]
): QuemSouEu[] {
  return rawData
    .filter(isRawQuemSouEu)
    .map((raw) => {
      const item = raw as RawQuemSouEu;

      if (item.personagemId) {
        const baseChar = personagensCatalogo.find((c) => c.id === item.personagemId);
        if (!baseChar) {
          throw new Error(`Personagem base não encontrado para o ID: ${item.personagemId}`);
        }
        return {
          id: item.id,
          personagemId: item.personagemId,
          nome: baseChar.nome,
          imagem: baseChar.imagem,
          aliases: [baseChar.nome], // Adiciona pelo menos o nome como alias
          tipo: item.tipo,
          dicas: item.dicas,
          resumo: item.resumo,
          conhecidoPor: item.conhecidoPor,
        };
      }

      if (!item.nome || !item.aliases) {
        throw new Error(`Entrada inválida sem personagemId deve ter nome e aliases: ${item.id}`);
      }

      const safeImagem = item.imagem && item.imagem.trim() ? item.imagem : undefined;

      return {
        id: item.id,
        nome: item.nome,
        imagem: safeImagem,
        aliases: item.aliases,
        tipo: item.tipo,
        dicas: item.dicas,
        resumo: item.resumo,
        conhecidoPor: item.conhecidoPor,
      };
    });
}

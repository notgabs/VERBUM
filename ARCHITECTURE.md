# Arquitetura do VERBUM

O VERBUM é uma aplicação Next.js estática, com os modos Personagem e Passagem executados no cliente. Dados bíblicos ficam em `public/data`; regras puras ficam em `src/game` e `src/domain`; componentes compartilhados ficam em `src/components`.

## Fluxo dos jogos

1. `useJsonCatalog` busca e valida superficialmente o catálogo, exibindo carregamento ou erro recuperável.
2. `GAME_CONFIG` decide entre alvo fixo de desenvolvimento, seleção diária determinística ou sorteio por carregamento.
3. A lógica em `src/game` compara o palpite.
4. Os componentes exibem o resultado; `useTimeoutRegistry` cancela animações pendentes ao sair da página.

## Configuração de desenvolvimento

Edite `src/config/game.ts`:

- `fixedCharacterId`: personagem de teste atual.
- `fixedPassageId`: passagem fixa opcional.
- `allowReplay`: mostra o botão para reiniciar uma partida.
- `enableDailyChallenge`: prepara o uso de desafio por data.
- `developmentMode`: prioriza os IDs fixos durante o desenvolvimento.

Sem ID fixo e sem desafio diário, Personagem e Passagem sorteiam um novo alvo a cada carregamento da página.

Para ativar o desafio diário futuramente, defina `developmentMode: false`, remova IDs fixos e use `enableDailyChallenge: true`. A função em `src/domain/game/dailyChallenge.ts` sempre entrega o mesmo ID para a mesma data local e catálogo.

## Dados

O catálogo católico está em `src/domain/bible/catalog.ts`, com 73 livros, ordem, divisão e aliases. Todo JSON deve passar por `npm run validate:data` antes de ser enviado.

Código técnico usa inglês; textos visíveis e dados bíblicos usam português brasileiro.

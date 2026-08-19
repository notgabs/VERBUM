# FEATURE INVENTORY - VERBUM

## 1. Modos de Jogo
├── Modo Clássico (Personagem)
│   ├── Status: COMPLETO
│   ├── Localização: `src/app/personagem`, `src/components/CharacterGame.tsx`, `src/game/characterLogic.ts`
│   └── Observações: Funciona plenamente comparando atributos e dando feedback em cores e setas.
├── Modo Passagem (Acerte a Passagem)
│   ├── Status: COMPLETO
│   ├── Localização: `src/app/passagem`, `src/components/PassageGame.tsx`, `src/game/passageLogic.ts`
│   └── Observações: Permite escolher Livro, Capítulo e Versículo com feedback direcional.

## 2. Mecânicas Core
├── Sistema de Dicas Incrementais
│   ├── Status: COMPLETO
│   ├── Localização: Componentes de Jogo (Game components)
│   └── Observações: Desbloqueia dica 1 aos 6 palpites e dica 2 aos 12 palpites.
├── Comparação de Atributos e Lógica Wordle
│   ├── Status: COMPLETO
│   ├── Localização: `src/game/*`
│   └── Observações: Compara categorias, textos, números históricos e datas A.C./D.C.
├── Desafio Diário (Semente baseada em Data)
│   ├── Status: EXPERIMENTAL
│   ├── Localização: `src/domain/game/dailyChallenge.ts`
│   └── Observações: Está configurado no código, mas atualmente inativo (`developmentMode: true` em `config/game.ts`).

## 3. Dados e Conteúdo
├── Banco de Dados de Personagens
│   ├── Status: COMPLETO
│   ├── Localização: `public/data/personagens.json`
│   └── Observações: Possui um grande volume de personagens catalogados.
├── Banco de Dados de Passagens
│   ├── Status: PARCIAL
│   ├── Localização: `public/data/passagens.json`
│   └── Observações: Menor quantidade de dados comparado aos personagens.
├── Validação de Cânon Bíblico (Católico)
│   ├── Status: COMPLETO
│   ├── Localização: `src/domain/bible/catalog.ts`, `src/data/bibleStructure.ts`
│   └── Observações: Contém todos os 73 livros e limites de capítulos, incluindo deuterocanônicos.

## 4. Progresso e UX
├── Estatísticas de Jogador (Local)
│   ├── Status: COMPLETO
│   ├── Localização: `src/hooks/useGameStats.ts`
│   └── Observações: Salva win rate, streaks e médias no `localStorage`.
├── Compartilhamento de Resultado (Texto/Emojis)
│   ├── Status: COMPLETO
│   ├── Localização: Lógica de compartilhamento nos arquivos `Logic.ts`
│   └── Observações: Gera o texto com os quadrados coloridos.
├── Autenticação / Perfis de Usuário
│   ├── Status: NÃO UTILIZADA
│   ├── Localização: -
│   └── Observações: O jogo não tem sistema de login no momento.
├── Progressão Cross-Device / Cloud Save
│   ├── Status: INCOMPLETA
│   ├── Localização: -
│   └── Observações: Totalmente dependente do navegador atual do usuário.

## 5. Ferramentas e Configurações
├── Validador de JSON
│   ├── Status: COMPLETO
│   ├── Localização: `scripts/validate-data.mjs`
│   └── Observações: Garante integridade do banco de dados estático.
├── Testes Unitários
│   ├── Status: PARCIAL
│   ├── Localização: `test/`
│   └── Observações: Testes básicos da lógica diária existem, mas a cobertura do core do jogo não está documentada explicitamente.

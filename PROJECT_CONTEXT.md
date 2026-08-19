# PROJECT CONTEXT - VERBUM

## 1. Objetivo do Jogo
VERBUM é um jogo de dedução diário focado em conhecimento bíblico, inspirado em mecânicas no estilo "Wordle". O jogador deve adivinhar personagens ou passagens bíblicas com base em dicas incrementais e feedback visual (cores e setas) de seus palpites. O objetivo é engajar o usuário com o texto sagrado de forma lúdica.

## 2. Stack Tecnológica
- **Frontend:** React 19 / Next.js 16.2 (App Router)
- **Estilização:** Tailwind CSS 4
- **Linguagem:** TypeScript (Strict mode)
- **Armazenamento:** `localStorage` (Client-side persistency)
- **Hospedagem idealizada:** Vercel ou semelhante (aplicação estática/SPA)

## 3. Arquitetura
A aplicação adota uma arquitetura monolítica e totalmente centrada no cliente (Client-side). 
Não há backend ativo ou banco de dados relacional conectado. Os dados bíblicos são carregados dinamicamente de arquivos JSON estáticos em tempo de execução no navegador. 
- A lógica de regras e comparações (`src/game`, `src/domain`) é separada da camada de UI (`src/components`).
- O estado e o progresso do usuário residem unicamente no navegador via Hooks e `localStorage`.

## 4. Principais Diretórios
- `src/app`: Rotas Next.js (Home, Personagem, Passagem).
- `src/components`: Componentes visuais do jogo (Tabuleiro, Modal de Vitória, Inputs).
- `src/domain`: Lógica de domínio de negócios (Estrutura da Bíblia, Desafio Diário).
- `src/game`: Algoritmos de comparação para os palpites.
- `src/data` & `public/data`: Estruturas de dados estáticos, textos e catálogos JSON.
- `src/hooks`: Gerenciamento de estado (Estatísticas, Timeout, Fetch de JSON).

## 5. Modelo de Dados Principal
- **Personagem:** `{ id, nome, sexo, testamento, divisao, historiaNaBiblia, conhecidoPor, nascimento, ocupacao, dica1, dica2 }`
- **Passagem:** `{ id, texto, livro, capitulo, versiculo, testamento, divisao, contexto, dica1, dica2 }`
- **Estatísticas (GameStats):** `{ jogosRealizados, sequenciaAtual, maiorSequencia, tentativasMedias, dicasUtilizadas, vitorias }`

## 6. Fluxo do Jogador e Game Loop
**Game Loop:**
`Entrar na Home → Escolher Modo (Personagem ou Passagem) → Inserir Palpite → Analisar Feedback (Cor/Seta) → Repetir até acertar → Ver Estatísticas e Contexto Bíblico → Compartilhar resultado`

## 7. Conteúdo Bíblico
- Utiliza o cânon Católico (73 livros).
- A validação de limites de capítulos/versículos está em `src/data/bibleStructure.ts`.
- Os personagens e passagens estão armazenados em arquivos `.json` na pasta `public/data`.
- **Atenção:** As explicações teológicas/contextuais de algumas passagens estão hardcoded em `src/data/passageExplanations.ts`. 

## 8. Decisões Arquiteturais Conhecidas
- **Tudo no cliente:** A escolha de manter tudo estático reduz custos a zero, mas impossibilita progresso cross-device (conta de usuário).
- **Modo Desenvolvimento:** O jogo atualmente pode estar configurado com `developmentMode: true` em `src/config/game.ts`, permitindo replay livre e alvos aleatórios. Para produção, a intenção é ativar o `enableDailyChallenge`.
- **Desafio Diário determinístico:** Baseado na data local do usuário (`getLocalDayKey`), o que significa que o alvo muda à meia-noite no fuso horário do aparelho.

## 9. Áreas Sensíveis (Cuidado ao alterar)
- **`src/game/characterLogic.ts` e `passageLogic.ts`**: Qualquer alteração na lógica de comparação afeta o core do jogo.
- **`public/data/*.json`**: Se o JSON estiver mal formatado ou não bater com o contrato esperado (`catalogContracts.ts`), o jogo falha ao carregar.
- **Mapeamento de Nomes Bíblicos (`src/domain/bible/catalog.ts`)**: O sistema lida com strings complexas, remoção de acentos e aliases. Alterar a lógica de normalização pode quebrar o autocomplete.

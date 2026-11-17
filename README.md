# VERBUM

Jogos diários para conhecer a Bíblia e a fé católica. Cada modo tem um desafio por dia, igual para todos; vencer pelo menos um por dia mantém a sequência de dias.

| Modo | Rota | Como funciona |
|---|---|---|
| Adivinhe o personagem | `/personagem` | Compara gênero, testamento, livros, época etc. com o personagem bíblico secreto. |
| Acerte a passagem | `/passagem` | Lê um trecho e acerta livro, capítulo e versículo (Bíblia Ave-Maria). |
| Quem sou eu? | `/quem-sou-eu` | Seis pistas, da 6 (mais difícil) à 1 (entrega a resposta), sobre santos e papas. 6 tentativas. |
| Acerte a música | `/musica` | Trechos de 0,2 s a 20 s de um louvor; 8 tentativas. Toca a prévia oficial do Deezer. |

## Stack

Next.js 16 (App Router), React 19, Tailwind CSS 4, `motion`, Radix Dialog. Progresso e estatísticas ficam no `localStorage` do navegador; não há banco de dados.

O site é **100% estático** (`npm run build` gera a pasta `out/`). A prévia de 30 s do Deezer é buscada direto do navegador (JSONP), sem servidor próprio.

## Estrutura

- `public/data/` — catálogos: `personagens.json`, `passagens.json`, `quem-sou-eu.json`, `musicas.json`.
- `public/personagens/`, `public/quem-sou-eu/` — imagens (créditos das fotos em `public/quem-sou-eu/CREDITOS.md`).
- `public/sounds/` — efeitos sonoros (CC0, ver `CREDITS.txt`).
- `src/game/`, `src/domain/` — regras puras dos jogos (testadas em `test/`).
- `src/components/` — telas dos jogos e componentes compartilhados.
- `scripts/` — validação de dados e scripts de revisão/montagem dos catálogos.
- `docs/` — relatórios de revisão do conteúdo.

## Comandos

```bash
npm run dev            # servidor local em http://localhost:3000
npm run validate:data  # confere os catálogos
npm run lint
npm run typecheck
npm test
npm run build
```

## Publicação (Cloudflare Pages)

O site é só a pasta `out/` gerada pelo build, então qualquer hospedagem de arquivos estáticos serve. O Cloudflare Pages é grátis e sem limite de tráfego.

1. Envie o projeto para o GitHub, na branch `main`.
2. Em [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages → Create → Pages → Connect to Git** e escolha o repositório.
3. Configure o build:
   - **Framework preset:** None
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
   - **Variáveis de ambiente:** `NODE_VERSION` = `22` e `NEXT_PUBLIC_SITE_URL` = o endereço do site (ex.: `https://verbum.pages.dev`, usado na imagem de compartilhamento).
4. O nome do projeto vira o endereço (`<nome>.pages.dev`). A cada envio para a `main`, o site é publicado de novo.

Domínio próprio (ex.: `verbum.com.br`): em **Custom domains** do projeto. Depois, atualize `NEXT_PUBLIC_SITE_URL`.

Se o site ficar numa subpasta (ex.: GitHub Pages em `/VERBUM`), defina `NEXT_PUBLIC_BASE_PATH=/VERBUM` no build.

## Música e Deezer

As prévias de 30 s vêm direto do Deezer, tocadas na memória do navegador (nenhum áudio é guardado no aparelho nem no site, o que as regras do Deezer proíbem). A tela final dá o crédito ao Deezer e links para ouvir a música completa.

## Contato

Bugs, correções e sugestões: gabrielhss025@gmail.com

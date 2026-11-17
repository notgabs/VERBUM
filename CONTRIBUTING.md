# Contribuindo com o VERBUM

## Comandos

```bash
npm run dev
npm run validate:data
npm run lint
npm run typecheck
npm run test
npm run build
```

## Adicionar um personagem

1. Inclua o registro em `public/data/personagens.json` com todos os campos obrigatórios.
2. Salve a imagem em `public/personagens/`.
3. Prefira declarar `imagem` com o caminho completo quando o nome do arquivo não for igual ao ID.
4. Execute `npm run validate:data`.

## Adicionar uma passagem

1. Inclua ID único, livro, capítulo, versículo, texto, testamento e divisão em `public/data/passagens.json`.
2. Use a grafia do catálogo católico.
3. Execute a validação antes do build.

## Adicionar uma figura no Quem sou eu?

1. Inclua a figura em `scripts/revisao/qse-catolicos.mjs` (6 dicas: a 1 entrega a resposta, a 6 é a mais difícil; confira os fatos em fontes católicas).
2. Baixe a foto com `scripts/revisao/fotos-qse/buscar_fotos_wiki.py` e publique com `publicar_wiki.py` (gera os créditos).
3. Rode `node scripts/revisao/montar-qse.mjs`.

## Adicionar uma música

1. Ache a faixa no Deezer (`https://www.deezer.com/track/<ID>`) e confira se tem prévia.
2. Acrescente uma linha em `MUSICAS` no `scripts/musica/montar-musicas.py`.
3. Rode `python scripts/musica/montar-musicas.py`.

Não altere IDs existentes sem oferecer compatibilidade para dados já armazenados.


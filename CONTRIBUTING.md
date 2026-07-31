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

Não altere IDs existentes sem oferecer compatibilidade para dados já armazenados.


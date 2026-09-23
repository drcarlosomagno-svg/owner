# paper.ai__ · carrosséis

Conteúdo de Instagram da paper.ai__ (biblioteca de prompts de IA para pesquisa médica). Todo o conteúdo é em português do Brasil.

## Comandos

- `npm run render`: gera todos os carrosséis em `exports/` (3:4, 1080×1440).
- `npm run render -- 03`: só os arquivos com "03" no nome.
- `npm run render -- --formato 4x5`: versão 1080×1350 em `exports-4x5/`.
- Fora do ambiente em nuvem: `npx playwright install chromium` uma vez, ou defina `CHROMIUM_PATH`.

## Estrutura

- `carrosseis/*.yaml`: conteúdo. `_modelo.yaml` documenta todos os tipos de slide; arquivos com `_` não são renderizados.
- `scripts/render.mjs`: lê o YAML, monta o HTML, ajusta o texto (`--k`), tira os prints com Playwright e escreve `legenda.txt`, `alt-text.txt`, `meta.json`, `_prancha.jpg` e `exports/README.md`.
- `scripts/lib/slides.mjs`: HTML de cada tipo de slide + alt text. `scripts/lib/markup.mjs`: marcação (`==marca==`, `**negrito**`, `*itálico*`, `[VARIÁVEL]`, `→`).
- `templates/slide.css`: todo o visual. Tamanhos dentro de `.corpo` usam `calc(Npx * var(--k))`.
- `exports/`: saída gerada e versionada (o usuário baixa daqui). Sempre regenere depois de editar um YAML.

## Regras de conteúdo

- Siga `estrategia/playbook-carrosseis.md` e `marca/identidade.md`.
- Nenhum dado sem fonte verificável; prompts sempre com regra de checagem; nunca sugerir colar dados de pacientes na IA.
- Sem superlativos não demonstráveis ("a melhor biblioteca").
- Para criar um carrossel novo, use o skill `/novo-carrossel`.

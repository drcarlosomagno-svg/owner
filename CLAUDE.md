# paper.ai__ · carrosséis

Conteúdo de Instagram da paper.ai__ (biblioteca de prompts de IA para pesquisa médica). Todo o conteúdo é em português do Brasil.

## Comandos

- `npm run render`: gera todos os carrosséis em `exports/` (3:4, 1080×1440).
- `npm run render -- 03`: só os arquivos com "03" no nome.
- `npm run render -- --formato 4x5`: versão 1080×1350 em `exports-4x5/`.
- `npm run render -- --campanha` (ou `--educativos`): só uma das coleções.
- `npm run stories` (ou `npm run stories -- duvidas`): gera os Stories dos destaques em `exports/stories/` (1080×1920) a partir de `stories/destaques.yaml`, com capas, guia de postagem (`exports/stories/README.md`) e prancha.
- `npm run reels` (ou `npm run reels -- 07`): gera os Reels em `exports/reels/` (MP4 9:16, 30 fps). O ffmpeg vem do pacote `@ffmpeg-installer/ffmpeg` (ou defina `FFMPEG_PATH`).
- Fora do ambiente em nuvem: `npx playwright install chromium` uma vez, ou defina `CHROMIUM_PATH`.

## Estrutura

- `carrosseis/*.yaml`: conteúdo. `_modelo.yaml` documenta todos os tipos de slide; arquivos com `_` não são renderizados.
- `scripts/render.mjs`: lê o YAML, monta o HTML, ajusta o texto (`--k`), tira os prints com Playwright e escreve `legenda.txt`, `alt-text.txt`, `meta.json`, `_prancha.jpg` e `exports/README.md`.
- `scripts/lib/slides.mjs`: HTML de cada tipo de slide + alt text. `scripts/lib/markup.mjs`: marcação (`==marca==`, `**negrito**`, `*itálico*`, `[VARIÁVEL]`, `→`).
- `templates/slide.css`: todo o visual, com os tokens do produto (vermelho `#D0112B`, Anton, IBM Plex). Tamanhos dentro de `.corpo` usam `calc(Npx * var(--k))`.
- `marca/catalogo-produto.json`: os onze prompts da Biblioteca de Prompts (P1–P11), extraídos do artefato do produto. `produto: P8` no YAML liga o carrossel a um prompt.
- `exports/`: saída gerada e versionada (o usuário baixa daqui). Sempre regenere depois de editar um YAML.
- `reels/roteiros/*.yaml`: roteiros dos Reels (cenas `gancho`, `texto`, `foto`, `numero`, `limite`, `cta`), com fotos de `campanha/fotos/`. Gerador em `scripts/reels.mjs`, visual em `templates/reels.css`; animação calculada quadro a quadro. Texto só dentro da área segura (longe dos botões e da legenda do Instagram). Vídeo sai sem música: o áudio em alta é escolhido no app.
- Reels de demonstração (`reels/roteiros/demo-*.yaml`): uma pessoa comum, ilustrada em SVG (`scripts/lib/personagem.mjs`), usando a Biblioteca no celular. Cenas `personagem`, `tela` (réplica do layout móvel do artefato em `scripts/lib/biblioteca-ui.mjs`, com toques, teclado e digitação) e `chat` (resposta no formato do prompt, marcada "exemplo resumido"). Animação em `scripts/lib/reels-demo-runtime.js`, visual em `templates/reels-demo.css`. `npm run reels -- demo --previa` gera só uma prancha de quadros em `.build/previa/`. Toda resposta mostrada usa artigos e números conferidos no PubMed (seção no fim de `campanha/estudos-verificados.md`); a conversa é genérica, sem a interface de nenhuma IA.
- `stories/destaques.yaml`: os 6 destaques do perfil (Comece aqui, Como funciona, Os 11 prompts, Na prática, Dúvidas, Acesso). Gerador em `scripts/stories.mjs`, visual em `templates/stories.css`. Texto entre y=330 e y=1590; Stories com seta deixam espaço para o sticker (link, enquete, caixa de perguntas) que se coloca no app. Mesmas regras da página de vendas.
- `landing/index.html`: página de vendas da Biblioteca para a Kiwify (HTML único, tokens do produto, tema claro e escuro). Preço, link do checkout e autor ficam no bloco `CONFIG` no fim do arquivo. Mesmas regras: sem o texto dos prompts, sem depoimento ou número inventado, números só de `campanha/estudos-verificados.md`. Instruções em `landing/README.md`.
- `campanha/`: campanha de crescimento (20 carrosséis com foto). `campanha/carrosseis/*.yaml` → `exports/campanha/` (JPG). Visual em `templates/campanha.css` e `scripts/lib/campanha.mjs`, com três paletas (`escuro`, `vibrante`, `claro`). Fotos em `campanha/fotos/<id>.jpg`; o gerador escreve `campanha/fotos/LISTA.md` com o que falta.

## Regras de conteúdo

- Siga `estrategia/playbook-carrosseis.md` e `marca/identidade.md`. A identidade é a do produto; não invente métodos, nomes ou prompts que não existem no catálogo.
- Nunca publique um prompt do produto na íntegra: mostre o que ele faz e o formato da resposta.
- Nenhum dado sem fonte verificável; prompts sempre com regra de checagem; nunca sugerir colar dados de pacientes na IA.
- Sem superlativos não demonstráveis ("a melhor biblioteca").
- Para criar um carrossel novo, use o skill `/novo-carrossel`.
- Campanha: todo número tem de estar em `campanha/estudos-verificados.md` (conferido no PubMed) e o texto segue `campanha/guia-de-escrita.md` (associação não vira causa, interpretação nossa rotulada, ficha com "O que não dá para dizer", sem travessão nem palavras típicas de IA). Foto só com licença de uso comercial.

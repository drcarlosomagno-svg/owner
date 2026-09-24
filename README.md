# paper.ai__ · carrosséis para o Instagram

Projeto de conteúdo do **@paper.ai__**, o Instagram da [Biblioteca de Prompts](https://claude.ai/artifact/87rA4X3tchY2QFpgAsfbmE) para pesquisa científica. Aqui ficam a pesquisa de tendências, a estratégia, a identidade visual (a mesma do produto), os textos dos carrosséis e um gerador que transforma cada texto em slides PNG prontos para postar.

São duas coleções:

- **12 carrosséis educativos** em [`exports/`](exports/), cada um ligado a um prompt da biblioteca (P1 a P11), com legenda e texto alternativo.
- **20 carrosséis da campanha de crescimento** em [`exports/campanha/`](exports/campanha/README.md): foto na capa, gancho num assunto do momento e um grande estudo contado como história. Veja [`campanha/`](campanha/README.md).
- **10 Reels** (vídeo 9:16) em [`exports/reels/`](exports/reels/README.md), feitos a partir da campanha para alcançar quem ainda não segue. Veja [`reels/`](reels/README.md).

## Por onde começar

| Quero… | Abra |
|---|---|
| Ver os carrosséis prontos | [`exports/README.md`](exports/README.md) (educativos) e [`exports/campanha/README.md`](exports/campanha/README.md) (campanha) |
| Entender a campanha de crescimento e que fotos buscar | [`campanha/README.md`](campanha/README.md) e [`campanha/fotos/LISTA.md`](campanha/fotos/LISTA.md) |
| A avaliação dos posts de crescimento atuais | [`campanha/avaliacao-posts-atuais.md`](campanha/avaliacao-posts-atuais.md) |
| Como escrever com cara de gente e sem inventar | [`campanha/guia-de-escrita.md`](campanha/guia-de-escrita.md) |
| Postar os Reels (calendário, áudio, capa) | [`reels/README.md`](reels/README.md) |
| Entender o que está funcionando no Instagram em 2026 | [`pesquisa/tendencias-instagram-2026.md`](pesquisa/tendencias-instagram-2026.md) |
| Ver concorrentes e como se diferenciar | [`pesquisa/concorrentes-e-referencias.md`](pesquisa/concorrentes-e-referencias.md) |
| As regras para criar um carrossel (ganchos, CTAs, legenda) | [`estrategia/playbook-carrosseis.md`](estrategia/playbook-carrosseis.md) |
| O que postar em cada dia | [`estrategia/calendario.md`](estrategia/calendario.md) |
| Cores, fontes, voz e o produto em uma tela | [`marca/identidade.md`](marca/identidade.md) |
| O que foi revisado para alinhar ao produto | [`estrategia/avaliacao-e-alinhamento.md`](estrategia/avaliacao-e-alinhamento.md) |

## Como postar um carrossel

1. Abra a pasta do carrossel em `exports/` (ex.: `exports/03-p1-motor-de-busca/`).
2. Suba os arquivos `01.png`, `02.png`… **nessa ordem** no Instagram, em formato **3:4**.
3. Cole o texto de `legenda.txt` na legenda.
4. Em *Configurações avançadas → Escrever texto alternativo*, cole o texto de cada slide que está em `alt-text.txt`.
5. Adicione uma música instrumental discreta.

## Como criar ou editar um carrossel

Os textos ficam em [`carrosseis/`](carrosseis/), um arquivo `.yaml` por carrossel. O [`_modelo.yaml`](carrosseis/_modelo.yaml) mostra todos os tipos de slide disponíveis:

`capa` · `texto` · `lista` · `prompt` · `resposta` · `contraste` · `chat` · `numero` · `cta`

Para ligar o carrossel a um prompt da biblioteca, escreva `produto: P8` no topo do arquivo: a capa ganha o código gigante e o cartão do prompt, com nome e descrição tirados de [`marca/catalogo-produto.json`](marca/catalogo-produto.json).

Depois de editar, gere as imagens:

```bash
npm install                       # só na primeira vez
npx playwright install chromium   # só na primeira vez, fora deste ambiente
npm run render                    # gera todos os carrosséis
npm run render -- 03              # gera só os que têm "03" no nome
npm run render -- --formato 4x5   # versão 1080×1350, em exports-4x5/
npm run render -- --campanha      # só a campanha (ou --educativos)
npm run reels                     # gera os Reels (vídeo), em exports/reels/
```

O gerador:

- ajusta o tamanho do texto sozinho e **avisa** se algum slide ficou cheio demais;
- desenha o fio vermelho contínuo entre os slides;
- gera `legenda.txt` (com as hashtags), `alt-text.txt` e uma prancha (`_prancha.jpg`) para revisar tudo de uma vez;
- avisa quando há mais de 5 hashtags ou quando a primeira linha da legenda passa de 125 caracteres.

### Com o Claude Code

Este repositório tem o comando `/novo-carrossel`. Abra o projeto no Claude Code e escreva, por exemplo:

```
/novo-carrossel prompts para escrever o abstract de um artigo
```

O Claude escreve o carrossel seguindo o playbook e a identidade, gera as imagens e revisa o resultado.

## Estrutura

```
campanha/       campanha de crescimento: textos, estudos conferidos, fotos, guia de escrita
reels/          roteiros dos Reels (YAML)
carrosseis/     textos dos carrosséis educativos (YAML)
exports/        slides, legendas e alt text gerados (a campanha fica em exports/campanha/)
templates/      estilo visual dos slides (CSS)
scripts/        gerador (Node + Playwright)
assets/fonts/   fontes do produto: Anton, IBM Plex Sans e IBM Plex Mono (licença OFL)
pesquisa/       tendências do Instagram e concorrentes
estrategia/     playbook e calendário
marca/          identidade visual, voz e catálogo do produto (P1–P11)
```

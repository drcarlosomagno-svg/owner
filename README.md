# paper.ai__ · carrosséis para o Instagram

Projeto de conteúdo do **@paper.ai__**, a biblioteca de prompts de IA para pesquisa médica. Aqui ficam a pesquisa de tendências, a estratégia, a identidade visual, os textos dos carrosséis e um gerador que transforma cada texto em slides PNG prontos para postar.

**Os 12 primeiros carrosséis já estão prontos em [`exports/`](exports/)**, com legenda e texto alternativo.

## Por onde começar

| Quero… | Abra |
|---|---|
| Ver os carrosséis prontos | [`exports/README.md`](exports/README.md) |
| Entender o que está funcionando no Instagram em 2026 | [`pesquisa/tendencias-instagram-2026.md`](pesquisa/tendencias-instagram-2026.md) |
| Ver concorrentes e como se diferenciar | [`pesquisa/concorrentes-e-referencias.md`](pesquisa/concorrentes-e-referencias.md) |
| As regras para criar um carrossel (ganchos, CTAs, legenda) | [`estrategia/playbook-carrosseis.md`](estrategia/playbook-carrosseis.md) |
| O que postar em cada dia | [`estrategia/calendario.md`](estrategia/calendario.md) |
| Cores, fontes, voz e o método P.A.P.E.R. | [`marca/identidade.md`](marca/identidade.md) |

## Como postar um carrossel

1. Abra a pasta do carrossel em `exports/` (ex.: `exports/03-pico-em-30-segundos/`).
2. Suba os arquivos `01.png`, `02.png`… **nessa ordem** no Instagram, em formato **3:4**.
3. Cole o texto de `legenda.txt` na legenda.
4. Em *Configurações avançadas → Escrever texto alternativo*, cole o texto de cada slide que está em `alt-text.txt`.
5. Adicione uma música instrumental discreta.

## Como criar ou editar um carrossel

Os textos ficam em [`carrosseis/`](carrosseis/), um arquivo `.yaml` por carrossel. O [`_modelo.yaml`](carrosseis/_modelo.yaml) mostra todos os tipos de slide disponíveis:

`capa` · `texto` · `lista` · `prompt` · `contraste` · `chat` · `numero` · `cta`

Depois de editar, gere as imagens:

```bash
npm install                       # só na primeira vez
npx playwright install chromium   # só na primeira vez, fora deste ambiente
npm run render                    # gera todos os carrosséis
npm run render -- 03              # gera só os que têm "03" no nome
npm run render -- --formato 4x5   # versão 1080×1350, em exports-4x5/
```

O gerador:

- ajusta o tamanho do texto sozinho e **avisa** se algum slide ficou cheio demais;
- desenha o fio marca-texto contínuo entre os slides;
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
carrosseis/     textos dos carrosséis (YAML)
exports/        PNGs, legendas e alt text gerados
templates/      estilo visual dos slides (CSS)
scripts/        gerador (Node + Playwright)
assets/fonts/   fontes Fraunces, Inter e JetBrains Mono (licença OFL)
pesquisa/       tendências do Instagram e concorrentes
estrategia/     playbook e calendário
marca/          identidade visual e voz
```

# Reels da paper.ai__

Dez vídeos verticais (9:16) feitos a partir da campanha de crescimento. Cada Reel conta em 20 a 30 segundos a mesma história de um carrossel: gancho no primeiro segundo, o estudo, o número, o limite do estudo e um pedido de envio no final.

**Os vídeos prontos estão em [`exports/reels/`](../exports/reels/README.md)**, cada um com `reel.mp4`, `capa.jpg`, `legenda.txt` e `roteiro.txt` (o texto que aparece na tela).

## Para que servem

Reels alcançam quem ainda não segue a página; o carrossel aprofunda e faz salvar. Por isso cada Reel sai **depois** do carrossel do mesmo tema e termina levando para ele ("o estudo inteiro está no carrossel do perfil").

## Calendário

| Quando | Reel | Carrossel do mesmo tema |
|---|---|---|
| Semana 1 · sábado | Sentar e levantar do chão | 02 (terça) |
| Semana 1 · domingo | O que acontece quando você para a caneta | 01 (segunda) |
| Semana 2 · sábado | Deram IA para os médicos | 08 (quarta) |
| Semana 2 · domingo | Por que é tão difícil parar de apostar | 07 (terça) |
| Semana 3 · quarta | A meta de 10 mil passos | 06 (semana 2) |
| Semana 3 · sábado | A palavra ultraprocessado nasceu no Brasil | 11 (segunda) |
| Semana 3 · domingo | 5 minutos de corrida já contavam | 14 (quinta) |
| Semana 4 · quarta | A dose de álcool que menos faz mal | 10 (semana 2) |
| Semana 4 · sábado | O calor assusta, o frio matou mais | 17 (terça) |
| Semana 4 · domingo | 1 minuto, 3 vezes ao dia | 20 (sexta) |

Nos dias em que já sai um carrossel, poste o Reel em outro horário (por exemplo, Reel às 12h e carrossel às 18h30). Depois de duas semanas, olhe em Insights o horário em que seus seguidores mais assistem e ajuste.

## Como postar

1. Abra a pasta do Reel em `exports/reels/`.
2. No Instagram, **+ → Reel**, escolha `reel.mp4`.
3. **Adicione um áudio em alta** pela biblioteca de músicas do app: instrumental, volume baixo (por volta de 20%). O vídeo sai sem música de propósito, porque música com direitos só pode entrar pelo próprio Instagram. Reel com áudio em alta costuma ser mais distribuído.
4. Em **Editar capa**, escolha **Adicionar da galeria** e use `capa.jpg`. A capa foi feita para ficar legível no recorte 3:4 da grade do perfil.
5. Cole o texto de `legenda.txt`.
6. Ative as legendas automáticas, se o app oferecer.
7. Se quiser testar sem arriscar o perfil, use **Reel de teste** (mostra só para quem não segue). Se for bem em 24 a 48 horas, publique no feed.

## Como são feitos

- Os roteiros ficam em [`roteiros/`](roteiros/), um `.yaml` por Reel.
- O gerador ([`scripts/reels.mjs`](../scripts/reels.mjs)) monta cada cena com o visual da campanha ([`templates/reels.css`](../templates/reels.css)), anima quadro a quadro (palavras entrando uma a uma, números contando, zoom lento na foto, grão de filme) e codifica em H.264 com o ffmpeg.
- O tempo de cada cena é calculado pelo tamanho do texto, para dar tempo de ler sem sobrar.
- O texto fica dentro da área segura: longe dos botões do Instagram (direita) e da legenda (embaixo).
- As fotos são as mesmas da campanha, em [`campanha/fotos/`](../campanha/fotos/).

```bash
npm install          # só na primeira vez (instala também o ffmpeg)
npm run reels        # gera todos
npm run reels -- 07  # só os que têm "07" no nome
```

## Criar um Reel novo

Copie um roteiro de [`roteiros/`](roteiros/) e troque o conteúdo:

```yaml
titulo: Nome do Reel
carrossel: 07-bets              # pasta do carrossel do mesmo tema
estudo: Autor et al. (Revista, ano)
paleta: escuro | vibrante | claro
foto: 07-bets                   # foto do gancho, em campanha/fotos/
publicar: Semana 5 · sábado

cenas:
  - tipo: gancho                # sempre a primeira: foto + frase que para o dedo
  - tipo: texto                 # selo, título e texto
  - tipo: foto                  # como texto, mas sobre foto (use foto: e enquadre:)
  - tipo: numero                # número grande que conta até o valor
  - tipo: limite                # "O que não dá para dizer"
  - tipo: cta                   # pedido de envio (destaque: enviar | salvar | seguir)
```

Regras: as mesmas da campanha ([`guia-de-escrita.md`](../campanha/guia-de-escrita.md)). Todo número tem de estar em [`estudos-verificados.md`](../campanha/estudos-verificados.md), o limite do estudo sempre aparece, e a interpretação nossa vem rotulada. Frases curtas: se o gerador avisar que reduziu muito o texto, corte palavras.

# Reels da paper.ai__

Catorze vídeos verticais (9:16):

- **10 Reels de estudo**, feitos a partir da campanha de crescimento. Cada um conta em 20 a 30 segundos a mesma história de um carrossel: gancho no primeiro segundo, o estudo, o número, o limite do estudo e um pedido de envio no final.
- **4 Reels de demonstração** (`demo-*`): uma pessoa comum, desenhada e animada, usando a Biblioteca no celular. Ela escreve o tema, toca nos botões de verdade da Biblioteca, cola o prompt numa conversa com a IA e a resposta chega no formato do prompt. No fim, aponta para a ferramenta: "Biblioteca de Prompts no link da bio".

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

Os de demonstração saem às quintas, um por semana:

| Quando | Reel de demonstração | Prompt | O que a pessoa faz |
|---|---|---|---|
| Semana 1 · quinta | 23h, sessão de artigos às 7h | P1 | Residente, de madrugada, busca os melhores artigos sobre vitamina D e fraturas |
| Semana 2 · quinta | A IA me deu as referências do TCC | P8 | Estudante confere as referências que a IA deu; uma parcial, uma inventada, uma retratada |
| Semana 3 · quinta | O orientador pediu a estratégia de busca | P2 | Estudante monta a busca do TCC para o PubMed |
| Semana 4 · quinta | O paciente chegou com a notícia | P11 | Médico explica ao paciente o estudo do teste de sentar e levantar |

Nos dias em que já sai um carrossel, poste o Reel em outro horário (por exemplo, Reel às 12h e carrossel às 18h30). Depois de duas semanas, olhe em Insights o horário em que seus seguidores mais assistem e ajuste.

## Como postar

1. Abra a pasta do Reel em `exports/reels/`.
2. No Instagram, **+ → Reel**, escolha `reel.mp4`.
3. **Adicione um áudio em alta** pela biblioteca de músicas do app: instrumental, volume baixo (por volta de 20%). O vídeo sai sem música de propósito, porque música com direitos só pode entrar pelo próprio Instagram. Reel com áudio em alta costuma ser mais distribuído.
4. Em **Editar capa**, escolha **Adicionar da galeria** e use `capa.jpg`. A capa foi feita para ficar legível no recorte 3:4 da grade do perfil.
5. Cole o texto de `legenda.txt`.
6. Ative as legendas automáticas, se o app oferecer.
7. Se quiser testar sem arriscar o perfil, use **Reel de teste** (mostra só para quem não segue). Se for bem em 24 a 48 horas, publique no feed.

## Reels de demonstração: o que é real e o que é ilustração

- **A pessoa é uma ilustração**, não uma pessoa real nem uma imagem gerada por IA. Há quatro pessoas diferentes (pele, cabelo, roupa e cenário mudam), para cada público se ver: residente, estudante de TCC, pós-graduanda, médico no consultório.
- **A tela da Biblioteca é a do produto**: textos, campos, botões, dicas de cada IA e o layout de celular vêm do artefato (`marca/catalogo-produto.json`). O texto do prompt nunca aparece.
- **A conversa com a IA é genérica**, sem a interface de nenhuma IA, e leva o aviso "exemplo resumido". A resposta segue o formato de resposta do prompt, resumida, e todo artigo, número e identificador que aparece nela foi conferido no PubMed (seção "Reels de demonstração" em [`estudos-verificados.md`](../campanha/estudos-verificados.md)).
- **As regras continuam**: cada vídeo mostra a checagem (abrir os links, conferir as referências, rodar a busca) e o do consultório lembra que não se cola dado de paciente na IA.

Quer uma versão com você mesmo? Grave o seu rosto reagindo (selfie, 5 a 10 segundos) e sobreponha ao Reel de demonstração num editor com sobreposição de vídeo, como o CapCut. Vídeo de pessoa gerada por IA também é possível, mas custa créditos, costuma parecer artificial e precisa ser rotulado como conteúdo de IA no Instagram.

## Como são feitos

- Os roteiros ficam em [`roteiros/`](roteiros/), um `.yaml` por Reel.
- O gerador ([`scripts/reels.mjs`](../scripts/reels.mjs)) monta cada cena com o visual da campanha ([`templates/reels.css`](../templates/reels.css)), anima quadro a quadro (palavras entrando uma a uma, números contando, zoom lento na foto, grão de filme) e codifica em H.264 com o ffmpeg.
- O tempo de cada cena é calculado pelo tamanho do texto, para dar tempo de ler sem sobrar.
- O texto fica dentro da área segura: longe dos botões do Instagram (direita) e da legenda (embaixo).
- As fotos são as mesmas da campanha, em [`campanha/fotos/`](../campanha/fotos/).

```bash
npm install                      # só na primeira vez (instala também o ffmpeg)
npm run reels                    # gera todos
npm run reels -- 07              # só os que têm "07" no nome
npm run reels -- demo --previa   # só uma prancha de quadros em .build/previa/, sem vídeo (rápido, para revisar)
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

Para um Reel de demonstração, acrescente a pessoa e use as cenas `personagem`, `tela` e `chat` (veja os `demo-*.yaml`):

```yaml
produto: P1                     # prompt do catálogo que o vídeo mostra
cenario: noite | dia | tarde    # padrão: pela paleta (escuro, claro, vibrante)
relogio: "23:08"                # hora no relógio da parede
hora: "23:11"                   # hora na barra do celular
tema: claro | escuro            # tema da Biblioteca no celular
pessoa:
  pele: clara | media | escura
  cabelo: cacheado | longo | coque | curto
  roupa: moletom | jaleco | pijama
  cor: grafite | verde | azul | mostarda | vinho   # cor do moletom
  oculos: true

cenas:
  - tipo: personagem            # a pessoa na mesa, com o celular
    expressao: cansado | preocupado | focado | surpreso | feliz | aliviado
    acao: apontar               # no fim: levanta o braço e aponta para o texto
    marca: true                 # mostra o logo paper.ai__ grande
  - tipo: tela                  # a Biblioteca no celular, com bolha de rosto da pessoa
    pagina: inicio | P1 … P11
    valores: { P1: { TEMA: … } } # campos que já começam preenchidos
    passos:                     # na ordem: tocar, digitar, colar, rolar, ir, esperar
      - tocar: pergunta         # alvos: pergunta, criar, campo-TEMA, ajustes, abrir, copiar, tema, ia-chatgpt…
      - digitar: vitamina D e fraturas em idosos
      - ir: P1
  - tipo: chat                  # a resposta chegando, linha por linha
    reacao: surpreso            # expressão da pessoa quando a resposta começa
    colado: { prompt: P1, valores: { TEMA: … } }
    resposta: |                 # no formato de resposta do prompt; ~~texto~~ sai borrado
      **P1 · Busca de referências** — …
```

Regras: as mesmas da campanha ([`guia-de-escrita.md`](../campanha/guia-de-escrita.md)). Todo número tem de estar em [`estudos-verificados.md`](../campanha/estudos-verificados.md), o limite do estudo sempre aparece, e a interpretação nossa vem rotulada. Frases curtas: se o gerador avisar que reduziu muito o texto, corte palavras.

# Campanha de crescimento · 20 carrosséis

Posts feitos para alcance e envios: gancho num assunto que o Brasil está discutindo, uma história contada slide a slide e um grande estudo científico explicando o fato, sem inventar nada. Cada carrossel termina mostrando o que o estudo **não** permite dizer, que é a mesma regra dos prompts da Biblioteca paper.ai__.

**Os 20 estão prontos em [`exports/campanha/`](../exports/campanha/README.md)**, com slides em JPG (3:4), legenda e texto alternativo. Falta só colocar as fotos (veja abaixo).

## Os 20 carrosséis

| # | Capa | Estudo | Paleta | Quando |
|---|---|---|---|---|
| 01 | O que acontece quando você **para** a caneta | STEP 1 e extensão · NEJM / DOM | escuro | S1 · seg |
| 02 | Sentar no chão e levantar **sem as mãos** | Araújo · Eur J Prev Cardiol 2026 (Rio) | vibrante | S1 · ter |
| 03 | O cafezinho **não é o vilão** que te contaram | Chieng · UK Biobank | claro | S1 · qua |
| 04 | A solidão está ligada a **100 mortes por hora** | Holt-Lunstad · PLoS Med | escuro | S1 · qui |
| 05 | Proibir o celular na escola **não bastou** | SMART Schools · Lancet Reg Health Eur | vibrante | S1 · sex |
| 06 | A meta de 10 mil passos **era nome de produto** | Paluch · Lancet Public Health | claro | S2 · seg |
| 07 | O **quase** ganhar é o que prende | Clark · Neuron (Cambridge) | escuro | S2 · ter |
| 08 | Deram IA para os médicos. **A IA sozinha foi melhor** | Goh · JAMA Netw Open | vibrante | S2 · qua |
| 09 | Seus genes explicam **menos do que você pensa** | Argentieri · Nature Medicine (Oxford) | claro | S2 · qui |
| 10 | A dose de álcool **que menos faz mal** é zero | GBD · Lancet | escuro | S2 · sex |
| 11 | A palavra ultraprocessado **nasceu no Brasil** | Hall · Cell Metabolism (NIH) | vibrante | S3 · seg |
| 12 | A fita na boca **viralizou**. A ciência foi olhar | Rhee · PLoS One | claro | S3 · ter |
| 13 | 3 da manhã. **Você desabafou com um chatbot** | Im e Woo · JMIR Mental Health | escuro | S3 · qua |
| 14 | 70 mil inscritos no Rio. **5 minutos já contavam** | Lee · JACC | vibrante | S3 · qui |
| 15 | O jejum intermitente **empatou com o básico** | Liu · NEJM | claro | S3 · sex |
| 16 | Tem plástico **no cérebro humano** | Nihart · Nature Medicine | escuro | S4 · seg |
| 17 | O calor assusta. **O frio matou mais** | Gasparrini · Lancet (com a FMUSP) | vibrante | S4 · ter |
| 18 | O multivitamínico **não te fez viver mais** | Loftfield · JAMA Netw Open (NCI) | claro | S4 · qua |
| 19 | Seu aperto de mão **prevê mais que a sua pressão** | Leong · Lancet (PURE) | escuro | S4 · qui |
| 20 | 1 minuto, 3 vezes ao dia. **Sem academia** | Stamatakis · Nature Medicine | vibrante | S4 · sex |

Cinco por semana, de segunda a sexta, durante quatro semanas. Os carrosséis educativos da biblioteca (em [`carrosseis/`](../carrosseis/)) podem entrar no sábado.

**Paletas em rodízio:** escuro, vibrante e claro, sempre nessa ordem. Com 3 colunas no perfil, cada coluna da grade fica de uma cor. A paleta de cada post foi escolhida pelo tom do tema: escuro para o que é denso ou tenso, vibrante para impacto, claro para o que alivia ou desfaz um mito.

## Fotos

As fotos não vêm prontas: imagem do Pinterest quase sempre tem dono, e postar sem licença pode derrubar o post ou gerar cobrança. A lista do que buscar, com termos de busca em inglês e o nome de cada arquivo, está em [`fotos/LISTA.md`](fotos/LISTA.md) (20 capas e 2 fotos de meio de carrossel).

1. Procure no Unsplash, no Pexels, num banco pago ou use fotos suas. O Pinterest serve para achar a referência de clima; depois, busque uma foto parecida com licença.
2. Salve em `campanha/fotos/` com o nome da lista (ex.: `07-bets.jpg`).
3. Rode `npm run render -- --campanha`.

O gerador aplica o tratamento de cor da paleta sozinho (cor apagada e sombra funda no escuro, duotone laranja e vermelho no vibrante, quase preto e branco e clareado no claro) e coloca grão de filme por cima. Qualquer foto boa fica com a cara da campanha. Enquanto a foto não chega, a capa sai com um fundo provisório e uma etiqueta "foto pendente" no canto.

## Como postar

1. Abra a pasta do carrossel em `exports/campanha/`.
2. Suba `01.jpg`, `02.jpg`… nessa ordem, em formato **3:4**.
3. Cole `legenda.txt` na legenda e o conteúdo de `alt-text.txt` no texto alternativo de cada slide.
4. Música instrumental discreta.
5. Nas primeiras horas, responda os comentários. Nos posts 04, 07 e 13 (solidão, bets, desabafo com IA), fique atento a quem pedir ajuda: a legenda já traz o CVV (188).

## Documentos da campanha

| Arquivo | O que tem |
|---|---|
| [`avaliacao-posts-atuais.md`](avaliacao-posts-atuais.md) | Avaliação dos 5 posts de crescimento que já estão no perfil, com o que manter e o que mudar |
| [`guia-de-escrita.md`](guia-de-escrita.md) | Estrutura, fórmulas de gancho, regras de rigor, como soar humano, lista de palavras proibidas e checklist |
| [`estudos-verificados.md`](estudos-verificados.md) | Todo número usado nos 20 carrosséis, com o estudo, o limite e o DOI, conferido no PubMed |
| [`carrosseis/`](carrosseis/) | O texto de cada carrossel (YAML) |
| [`fotos/LISTA.md`](fotos/LISTA.md) | Que foto buscar para cada post |

## Criar um carrossel novo da campanha

Copie um arquivo de [`carrosseis/`](carrosseis/) do mesmo tom e troque o conteúdo. Campos do topo:

```yaml
titulo: Nome interno do post
pauta: O assunto do momento que serve de gancho
estudo: Autor et al. (Revista, ano)
paleta: escuro | vibrante | claro
objetivo: envios
publicar: Semana 5 · segunda
foto:
  busca: "termos de busca em inglês"
  descricao: O que a foto precisa mostrar
```

Tipos de slide: `capa`, `texto`, `foto` (fundo com foto no meio do carrossel), `frase`, `numero`, `lista`, `estudo` (a ficha com o limite) e `cta`. Destaque em vermelho com `==palavras==`.

Antes de escrever, confira o estudo no PubMed e acrescente os números em [`estudos-verificados.md`](estudos-verificados.md). Depois, siga o [`guia-de-escrita.md`](guia-de-escrita.md) e gere com `npm run render -- --campanha NN`.

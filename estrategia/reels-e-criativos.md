# Reels e criativos: o sistema

Parte do [plano de alcance](plano-de-alcance.md). Como fazer Reels que chegam a quem não segue, como testar sem queimar o perfil, e o que produzir nas próximas 12 semanas.

## 1. O que faz um Reel ir longe

O Instagram mostra um Reel novo primeiro para um grupo pequeno e amplia se esse grupo assiste até o fim e envia para alguém. Para quem não segue a conta, **tempo de visualização e envios** são os sinais que mais pesam ([Dataslayer](https://www.dataslayer.ai/blog/instagram-algorithm-2025-complete-guide-for-marketers), [Highstyle](https://www.highstyle.ai/insights/instagram-reels-algorithm-2026)). Na prática:

| Momento | O que precisa acontecer | Como fazer |
|---|---|---|
| **0 a 1 s** | A pessoa para de rolar | Texto na tela com até 8 palavras já no primeiro quadro + imagem que não parece anúncio (rosto, manchete, tela real) |
| **1 a 3 s** | Ela entende o que vai ganhar se ficar | Promessa ou tensão: "o estudo diz outra coisa", "vou te mostrar em 20 segundos" |
| **3 s ao fim** | Ela não sai | Uma ideia por corte, cortes de 1 a 2 s, legenda na tela o tempo todo (muita gente assiste sem som) |
| **Fim** | Ela envia, comenta ou segue | Virada + limite do estudo + **um** pedido com destinatário ("manda pro colega que apresenta amanhã") ou palavra-chave ("comenta ESTUDO") |
| **Loop** | Ela assiste de novo | A última frase leva de volta para a primeira |

**Duração.** Ganchos e opiniões: 7 a 20 s. Demonstrações e "estudo por trás da manchete": 20 a 35 s. Acima de 45 s só quando a retenção dos anteriores mostrar que o público aguenta.

**Capa.** Gerada em 3:4 legível na grade (os geradores já fazem). Mesma lógica do gancho: afirmação curta, uma palavra em vermelho.

**Áudio.** Instrumental em alta, escolhido no próprio app, volume baixo (cerca de 20%). Os vídeos saem sem música de propósito.

## 2. Os 6 formatos de Reel da paper.ai__

| Formato | Como é feito | Pilar | Gerador ou câmera |
|---|---|---|---|
| **Estudo por trás da manchete** | Foto + texto animado: gancho, estudo, número, limite, pedido de envio | 1 | `npm run reels` (10 prontos) |
| **Demonstração** | Pessoa ilustrada usando a Biblioteca no celular, resposta chegando | 2 | `npm run reels -- demo` (4 prontos) |
| **Tela gravada com voz** | Gravação real da tela: tema → prompt → resposta, com a sua voz explicando | 2 | Celular ou computador |
| **Manchete da semana** | Você na frente da manchete (efeito tela verde), explicando o estudo e o limite | 3 | Câmera |
| **Pergunta do comentário** | "Responder com Reel" a um comentário real | 3 | Câmera |
| **Bastidor** | 15 a 30 s da rotina de estudo, sem paciente nem hospital identificável | 3 | Câmera |

## 3. Protocolo de teste (Reels de teste)

Os **Reels de teste** vão só para quem não segue a conta; se forem bem, dá para liberar para os seguidores depois. Desde fevereiro de 2026 dá para agendá-los ([Fliki](https://fliki.ai/blog/trial-reels-instagram)). É o jeito de testar gancho sem cansar quem já segue.

1. **Para cada ideia, 2 versões** que mudam **só o gancho** (primeiro quadro e primeira frase). Tudo o resto igual.
2. Publique as duas como Reel de teste no mesmo dia, em horários próximos.
3. Depois de 24 a 48 horas, compare: visualizações, **tempo médio assistido**, **% que assistiu até o fim** e **envios**.
4. A vencedora vai para os seguidores. A perdedora ensina: anote o gancho e o motivo provável na planilha de ganchos.
5. A cada mês, os 3 ganchos vencedores viram fórmula para as próximas ideias.

**Regra de corte:** se as duas versões ficarem abaixo da sua mediana de tempo médio assistido, o problema é o tema, não o gancho. A ideia sai do banco.

## 4. Rotina de produção (4 horas por semana)

| Quando | O quê | Tempo |
|---|---|---|
| Segunda | Ler o painel da semana e escolher: 2 ideias para teste, 1 manchete, 1 pergunta de comentário | 20 min |
| Segunda | Rodar os geradores (`npm run reels`, `npm run render`) ou pedir ao Claude os roteiros novos | 30 min |
| Terça | **Sessão de gravação**: 6 a 10 Reels curtos com o rosto, roteiro em tópicos, não decorado | 60 a 90 min |
| Terça | Edição no app Edits ou no CapCut: cortes, legenda automática revisada, capa | 60 min |
| Diário | Stories (10 min) e responder comentários na primeira hora de cada post (15 min) | 25 min/dia |

## 5. Banco de 30 ideias (12 semanas)

Nas ideias com número, o número tem de estar em [`estudos-verificados.md`](../campanha/estudos-verificados.md) **antes** de gravar. As que dizem "conferir" ainda precisam de estudo verificado no PubMed.

### Estudo por trás da manchete (carrosséis da campanha que ainda não têm Reel)

| # | Gancho (primeiro quadro) | Base | Pedido final |
|---|---|---|---|
| 1 | "O cafezinho não é o vilão" | [03-cafe](../campanha/carrosseis/03-cafe.yaml) | Manda pra quem vive cortando o café |
| 2 | "Solidão e 100 mortes por hora" | [04-solidao](../campanha/carrosseis/04-solidao.yaml) | Manda pra alguém que você não vê faz tempo |
| 3 | "Proibir o celular na escola não bastou" | [05-celular-na-escola](../campanha/carrosseis/05-celular-na-escola.yaml) | Manda pro grupo dos pais |
| 4 | "Seus genes explicam menos do que você pensa" | [09-genes](../campanha/carrosseis/09-genes-vs-estilo-de-vida.yaml) | Manda pra quem diz "é genético" |
| 5 | "A fita na boca que viralizou" | [12-fita-na-boca](../campanha/carrosseis/12-fita-na-boca.yaml) | Manda pra quem já comprou a fita |
| 6 | "3 da manhã. Você desabafou com um chatbot." | [13-chatgpt-terapeuta](../campanha/carrosseis/13-chatgpt-terapeuta.yaml) | Com o CVV 188 no fim |
| 7 | "O jejum intermitente empatou com o básico" | [15-jejum](../campanha/carrosseis/15-jejum-intermitente.yaml) | Manda pra quem está no 16:8 |
| 8 | "Tem plástico no cérebro humano" | [16-microplastico](../campanha/carrosseis/16-microplastico.yaml) | Comenta ESTUDO |
| 9 | "O multivitamínico não te fez viver mais" | [18-multivitaminico](../campanha/carrosseis/18-multivitaminico.yaml) | Manda pra quem toma todo dia |
| 10 | "Seu aperto de mão prevê mais que a sua pressão" | [19-aperto-de-mao](../campanha/carrosseis/19-aperto-de-mao.yaml) | Manda pro seu pai |

### IA na pesquisa (demonstração ou tela gravada)

| # | Gancho | Prompt | Observação |
|---|---|---|---|
| 11 | "Chegaram 10 artigos no grupo. Li 2." | P4 | Semáforo por artigo; usar artigos reais e conferidos |
| 12 | "O título prometeu mais do que o resultado" | P5 | Spin: resultado × conclusão × título; conferir exemplo real |
| 13 | "Os estudos dizem coisas opostas. Quem ganha?" | P6 | Conferir par de estudos real |
| 14 | "Bom demais para ser verdade" | P7 | Gravidade dos achados; conferir exemplo |
| 15 | "Saiu um estudo grande. Mudou a conduta?" | P9 | Estudo + diretriz vigente, conferidos |
| 16 | "25% ou 2,5 pontos?" | P10 | Risco relativo × absoluto, com a conta mostrada |
| 17 | "Pare de correr atrás do que saiu de novo" | P3 | Alerta semanal calibrado |
| 18 | "Pedido comum × pedido da Biblioteca" | P1 | Tela dividida, mesmo tema; carrossel 11 como base |
| 19 | "Essa referência existe?" (quiz de 3 referências, resposta no fim) | P8 | Loop natural: a pessoa volta para conferir |
| 20 | "Me dá um tema nos comentários que eu rodo o P1" | P1 | Série: cada comentário escolhido vira um Reel |

### O médico por trás (câmera)

| # | Gancho | Série |
|---|---|---|
| 21 | "Por que eu criei a paper.ai__" (20 s) | Bastidor, fixar no perfil |
| 22 | "3 coisas que eu nunca colo na IA" | Bastidor (regra de dados de paciente) |
| 23 | "A manchete da semana, lida por um residente" | Manchete da semana (recorrente) |
| 24 | "O erro que eu vejo em todo journal club" | Pergunta do comentário ou bastidor |
| 25 | "Como eu decido se um artigo merece minha leitura" | Bastidor (P4) |
| 26 | "O prompt que eu rodo antes de toda apresentação" | Bastidor (P1) |
| 27 | "Residência e pesquisa: o que eu faço às 23h" | Bastidor |

### Formatos nativos e de tendência

| # | Gancho | Formato |
|---|---|---|
| 28 | "POV: você é R1 e o preceptor pediu o artigo para amanhã" | Texto na tela + áudio em alta |
| 29 | Carrossel da semana mais enviado, em slideshow com música | Reaproveitamento |
| 30 | "Pergunte ao residente" | Caixa de perguntas nos Stories → melhores respostas viram Reel |

## 6. Criativos de feed (carrossel)

As regras estão no [playbook](playbook-carrosseis.md) e no [guia de escrita](../campanha/guia-de-escrita.md). Resumo do que mais pesa no alcance:

- **Slide 1 = gancho; slide 2 = segundo gancho.** Quem não arrasta pode receber o post de novo já no slide 2.
- **Uma ideia por slide; 7 a 10 slides.**
- **Um objetivo por post:** envio (alerta, erro), salvamento (prompt, ferramenta) ou comentário (palavra-chave).
- **Rodízio de paletas** (escuro, vibrante, claro) para a grade não virar um bloco só.
- **Depois de 48 h:** veja em que slide as pessoas param e reordene ou apague slides (dá para fazer sem perder o engajamento).
- **Todo carrossel que for bem vira Reel**, e todo Reel que for bem vira carrossel.

## 7. Stories do dia a dia

Os destaques são o cartão de visita; os Stories diários mantêm quem já segue perto. Sequência de 4 a 7 por dia:

1. **Gancho do dia** (bastidor ou pergunta).
2. **Interação:** enquete, quiz ou caixa de perguntas. Resposta alimenta a pauta.
3. **Prova:** print de uma resposta com link do PubMed, ou um depoimento real.
4. **Pedido:** link da página com o sticker, ou "comenta BIBLIOTECA no último post".

Uma vez por semana, repita no Stories o post que mais foi enviado, com "já viu esse?". Respostas da caixa de perguntas entram no destaque Dúvidas.

## 8. Criativos para anúncio

Quando for anunciar ([engenharia, seção 6](engenharia-de-marketing.md)), use **os Reels orgânicos que venceram**, não peças novas. O público reconhece o formato nativo e o custo costuma ser menor. Para cada campanha:

- 3 Reels vencedores (um de cada pilar: manchete, demonstração, rosto).
- Primeiro quadro com a promessa do produto em texto: "11 prompts que fazem a IA mostrar a fonte".
- Fim com o preço e o pedido: "De R$ 119,90 por R$ 39,90. Link na tela."
- Variação por público: estudante ("TCC"), residente ("sessão de artigos"), médico ("paciente com a manchete").

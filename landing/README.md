# Página de vendas da Biblioteca (Kiwify)

A página está em [`index.html`](index.html): um arquivo só, sem instalação, com os vídeos de demonstração em [`videos/`](videos/) (os 4 Reels de demonstração em versão leve para a web) e a imagem que aparece quando o link é compartilhado (`og.jpg`).

## O que tem na página

| Seção | O que faz |
|---|---|
| Herói | Título, botão de compra e a Biblioteca funcionando sozinha: o tema é digitado, o prompt é copiado e a resposta do P1 chega (exemplo real sobre vitamina D e fraturas, conferido no PubMed). |
| Números | 11 prompts, 4 etapas, 3 IAs e 12.666 caracteres só no P1, contando ao aparecer. |
| Você se reconhece? | Seis situações clicáveis; cada uma aponta o prompt que resolve. Traz o dado de 55% das referências inexistentes, com fonte e limite. |
| Como funciona | Os três passos do produto. |
| Teste grátis | O visitante escreve o tema, vê o prompt "montando" as 9 partes do P1 (só os nomes) e o esqueleto da resposta com o tema dele. |
| A diferença | Pedido comum × pedido da Biblioteca, e um exemplo real de resposta com links do PubMed. |
| Os 11 prompts | Explorador por situação: quando usar, o que entrega e o próximo passo. |
| Veja em uso | Os 4 vídeos de demonstração (P1, P8, P2, P11). |
| Para quem é | Para quem é, para quem não é e os três cuidados. |
| Quem faz | Autor, com nome e CRM do `CONFIG`. |
| Depoimentos | Só aparece quando houver depoimentos reais no `CONFIG`. |
| Oferta | O que a pessoa recebe, preço, contagem regressiva (só com prazo real), formas de pagamento e garantia. |
| Garantia, perguntas e chamada final | Selo de 7 dias, 10 perguntas que respondem às objeções e o último botão. |

Também: barra de compra fixa no celular, barra de progresso de leitura, botão de WhatsApp (se configurado) e repasse de `utm_*` e `src` ao checkout.

## 1. Preencha o CONFIG

No fim de `index.html` há um bloco `CONFIG`. É o único lugar que precisa editar. Enquanto faltar o link do checkout, um aviso amarelo aparece no canto da tela; ele some quando o link estiver preenchido.

Configuração atual: **de R$ 119,90 por R$ 39,90**, com o selo "Preço promocional · 67% de desconto" (a porcentagem é calculada sozinha).

| Campo | O que colocar |
|---|---|
| `checkout` | O link do checkout do produto na Kiwify (`https://pay.kiwify.com.br/...`). |
| `preco` | O preço à vista, como aparece no checkout (ex.: `R$ 97`). |
| `parcelas` | Opcional, ex.: `ou 12x de R$ 9,74`. Copie o valor do checkout. |
| `precoDe` | Opcional: preço anterior riscado. **Só se ele existiu de verdade** (preço "de" inventado é propaganda enganosa pelo CDC). |
| `selo` | Opcional, ex.: `Preço de lançamento`. Só se for verdade. |
| `prazo` | Opcional: fim real da condição, ex.: `2026-10-05T23:59:00-03:00`. Liga a contagem regressiva; ela some sozinha quando o prazo acaba. Não use prazo que reinicia. |
| `faixa` | Opcional: aviso no topo, ex.: `Lançamento: preço especial até 05/10`. |
| `garantiaDias` | A Kiwify exige no mínimo 7. |
| `autor` | Opcional: seu nome, se quiser que apareça em "Quem faz". |
| `foto` | Opcional: uma foto sua (ex.: `autor.jpg`, na pasta `landing`). |
| `whatsapp` | Opcional: número com DDI e DDD, só dígitos. Liga o botão flutuante. |
| `depoimentos` | Depoimentos reais (veja abaixo). |

Confira na Kiwify quais formas de pagamento estão ligadas. A página mostra Pix, cartão de crédito e boleto; se alguma estiver desligada, apague o selo dela (procure `Boleto` no arquivo).

## 2. Depoimentos: só reais

A página não traz depoimentos inventados, e não deve trazer. Depoimento fictício apresentado como real é propaganda enganosa (CDC, art. 37; Código do CONAR), fere as regras de publicidade médica do CFM e, se alguém descobre, derruba justamente a promessa do produto: não inventar.

Como conseguir os primeiros depressa:

1. **Dê acesso gratuito a 10 a 15 pessoas do seu público** (colegas de residência, alunos, preceptores) em troca de uma opinião sincera depois de uma semana de uso.
2. **Peça algo específico:** "Em que situação você usou? O que a resposta trouxe? O que você faria diferente?". Depoimento concreto vende mais que elogio genérico.
3. **Peça autorização por escrito** para publicar nome, função e foto (uma mensagem de WhatsApp dizendo "autorizo" já serve de registro). Guarde o print.
4. **Publique como a pessoa escreveu**, sem mudar o sentido. Pode cortar trechos, não pode acrescentar.
5. Se a pessoa ganhou acesso de graça, diga isso no depoimento ("recebeu acesso antecipado"). É o que a Kiwify, a Hotmart e o CONAR pedem.

Formato no `CONFIG`:

```js
depoimentos: [
  { nome: 'Nome Sobrenome', papel: 'R2 de Clínica Médica · recebeu acesso antecipado', texto: 'O que a pessoa escreveu.', foto: '' },
],
```

A seção aparece sozinha quando houver pelo menos um. Depois das primeiras vendas, a Kiwify permite pedir avaliação aos compradores; prints de mensagens reais (com autorização) também funcionam bem.

## 3. Coloque no ar pela Netlify (ligada ao GitHub)

Assim, toda alteração enviada ao repositório vai para o ar sozinha, em cerca de um minuto.

1. Entre em netlify.com e crie a conta com **Sign up with GitHub** (grátis).
2. **Add new project → Import an existing project → GitHub.** Autorize a Netlify a ver o repositório `drcarlosomagno-svg/owner`.
3. Escolha o repositório `owner` e preencha:
   - **Branch to deploy:** `claude/paper-ai-instagram-carrosels-vbke0t`
   - **Base directory:** `landing`
   - **Build command** e **Publish directory:** deixe em branco (o `landing/netlify.toml` já resolve).
4. Clique em **Deploy**. Em um minuto a página está no ar num endereço aleatório.
5. Em **Project configuration → Change project name**, use `bibliotecapaperai`. O endereço vira `https://bibliotecapaperai.netlify.app`, que é o que a imagem de compartilhamento (`og:image`) já usa. Se o nome estiver ocupado, escolha outro e troque o endereço nas duas linhas `og:` do `index.html`.

Domínio próprio (ex.: `paperai.com.br`): em **Domain management → Add a domain**, depois de comprar o domínio (Registro.br, por exemplo).

Plano B, sem GitHub: arraste a pasta `landing` para app.netlify.com/drop. Funciona, mas cada alteração precisa ser arrastada de novo.

## 4. Ligue à Kiwify e ao Instagram

1. Na Kiwify: **Produtos → Criar produto**, pagamento único, nome `Biblioteca de Prompts paper.ai__`, preço **R$ 39,90**. No campo de site (obrigatório), use `https://bibliotecapaperai.netlify.app`.
2. Configure a entrega (área de membros com o link da Biblioteca) e o checkout, e salve.
3. Na aba **Links** do produto, copie o link de checkout e cole em `CONFIG.checkout` no `index.html` (ou mande para o Claude colocar). Ao enviar para o repositório, a Netlify atualiza a página.
4. No Instagram, use no link da bio `https://bibliotecapaperai.netlify.app/?utm_source=instagram&utm_medium=bio`. A página repassa `utm_*` e `src` ao checkout, e a Kiwify mostra de onde veio cada venda. Nos Stories e Reels, troque `utm_medium` (`stories`, `reels`) para comparar.
5. Pixel da Meta ou Google Analytics: cole o código que eles fornecem antes de `</head>`.

## 5. Entrega

A entrega é feita pela Kiwify. Entregue o acesso à Biblioteca pela área de membros ou pelo e-mail de compra. Um link aberto pode ser repassado por quem compra; a área de membros protege melhor.

## De onde vem cada afirmação da página

| Na página | Fonte |
|---|---|
| Nomes, descrições, "quando usar", "o que entrega" e próximos passos dos 11 prompts | [`marca/catalogo-produto.json`](../marca/catalogo-produto.json), extraído do artefato (o bloco de dados da página é gerado a partir dele) |
| "12.666 caracteres" e as 9 partes do P1 | Tamanho e seções do P1 na versão para o Claude, no próprio artefato |
| 55% e 18% das referências inexistentes | Walters e Wilder, Sci Rep 2023 ([`estudos-verificados.md`](../campanha/estudos-verificados.md)) |
| Exemplo de resposta sobre vitamina D e fraturas | Bolland 2018 e LeBoff 2022, conferidos no PubMed (mesmo arquivo) |
| "Médico e residente da USP, no HC-FMUSP" | [`marca/identidade.md`](../marca/identidade.md) |

## Regras que a página segue (mantenha ao editar)

- O texto dos prompts nunca aparece; o teste mostra só os nomes das partes e o formato da resposta.
- Nenhum depoimento, número de alunos, notificação de "fulano acabou de comprar" ou escassez inventada.
- Sem superlativo que não dá para provar e sem promessa de resultado (aprovação, publicação).
- Os três cuidados ficam na página: conferir as referências, nunca colar dado de paciente, evidência não é conduta.

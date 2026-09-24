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

No fim de `index.html` há um bloco `CONFIG`. É o único lugar que precisa editar. Enquanto faltar o link, o preço ou o autor, um aviso amarelo aparece no canto da tela (só você vê isso enquanto configura; some quando estiver tudo preenchido).

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
| `autor` | Seu nome e CRM, ex.: `Dr. Nome Sobrenome · CRM-SP 000000` (Resolução CFM 2.336/2023). |
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

## 3. Coloque no ar

- **Netlify Drop** (o mais simples): entre em app.netlify.com/drop e arraste a pasta `landing` inteira. Sai um endereço na hora; depois dá para ligar um domínio seu.
- **Vercel** ou **Cloudflare Pages**: crie um projeto apontando para esta pasta.
- **GitHub Pages**: publique a pasta `landing` (em repositório privado, exige plano pago do GitHub).

Depois de publicar, troque `og.jpg` pelo endereço completo na linha `<meta property="og:image" ...>` (ex.: `https://seudominio.com.br/og.jpg`). WhatsApp e Instagram só mostram a imagem com o endereço completo.

## 4. Ligue à Kiwify e ao Instagram

1. Na Kiwify, informe o endereço da página como página de vendas do produto.
2. No Instagram, use o endereço no link da bio com a origem marcada: `https://seudominio.com.br/?utm_source=instagram&utm_medium=bio`. A página repassa `utm_*` e `src` ao checkout, e a Kiwify mostra de onde veio cada venda.
3. Nos Stories e Reels, use outra origem (`utm_medium=stories`, `utm_medium=reels`) para comparar.
4. Pixel da Meta ou Google Analytics: cole o código que eles fornecem antes de `</head>`.

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

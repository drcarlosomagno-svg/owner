# Página de vendas da Biblioteca (Kiwify)

A página está em [`index.html`](index.html), com o vídeo de demonstração (`demo.mp4`, o Reel do P1), a capa do vídeo (`demo-capa.jpg`) e a imagem que aparece quando o link é compartilhado (`og.jpg`). É um arquivo só, sem instalação: dá para hospedar em qualquer lugar que sirva HTML.

## 1. Preencha o CONFIG

No fim de `index.html` há um bloco `CONFIG`. É o único lugar que precisa editar:

| Campo | O que colocar |
|---|---|
| `checkout` | O link do checkout do produto na Kiwify (`https://pay.kiwify.com.br/...`), na página do produto, em links de checkout. |
| `preco` | O preço à vista, como aparece no checkout (ex.: `R$ 97`). |
| `parcelas` | Opcional, ex.: `ou 12x de R$ 9,74`. Copie o valor que o checkout mostra. |
| `precoDe` | Opcional: preço anterior riscado. Use só se ele existiu de verdade (preço "de" inventado é propaganda enganosa pelo CDC). |
| `garantiaDias` | A Kiwify exige no mínimo 7 dias. |
| `autor` | Seu nome e CRM, ex.: `Dr. Nome Sobrenome · CRM-SP 000000`. A Resolução CFM 2.336/2023 pede nome e CRM quando o médico se apresenta como médico. |

Enquanto o link, o preço e o autor não estiverem preenchidos, a página mostra uma faixa amarela no topo avisando. Ela some sozinha.

Confira também na Kiwify quais formas de pagamento estão ligadas. A página diz "Pix, cartão ou boleto"; se alguma estiver desligada, ajuste a frase (procure por "Pix" no arquivo).

## 2. Coloque no ar

Qualquer uma destas serve:

- **Netlify Drop** (o mais simples): entre em app.netlify.com/drop e arraste a pasta `landing` inteira. Sai um endereço na hora; depois dá para trocar por um domínio seu.
- **Vercel** ou **Cloudflare Pages**: crie um projeto apontando para esta pasta.
- **GitHub Pages**: publique a pasta `landing` (em repositório privado, exige plano pago do GitHub).

Depois de publicar, troque `og.jpg` por o endereço completo na linha `<meta property="og:image" ...>` (ex.: `https://seudominio.com.br/og.jpg`). WhatsApp e Instagram só mostram a imagem com o endereço completo.

## 3. Ligue à Kiwify e ao Instagram

1. Na Kiwify, informe o endereço da página como página de vendas do produto.
2. No Instagram, use o endereço no link da bio com a origem marcada, por exemplo `https://seudominio.com.br/?utm_source=instagram&utm_medium=bio`. A página repassa `utm_*` e `src` para o checkout, e a Kiwify mostra de onde veio cada venda.
3. Nos Stories e nos Reels, use outra origem (`utm_medium=stories`, `utm_medium=reels`) para comparar.
4. Pixel da Meta ou Google Analytics: cole o código que eles fornecem antes de `</head>`.

## 4. Entrega

A entrega é feita pela Kiwify. O produto é a Biblioteca (o artefato); entregue o acesso pela área de membros ou pelo e-mail de compra da Kiwify. Um link aberto pode ser repassado por quem compra, então a área de membros protege melhor.

## De onde vem cada afirmação da página

| Na página | Fonte |
|---|---|
| Nomes, descrições, campos e dicas dos 11 prompts | [`marca/catalogo-produto.json`](../marca/catalogo-produto.json), extraído do artefato |
| "12.666 caracteres" | Tamanho do P1 na versão para o Claude, como o próprio artefato mostra em "Ver o prompt" |
| 55% e 18% das referências inexistentes | Walters e Wilder, Sci Rep 2023 ([`estudos-verificados.md`](../campanha/estudos-verificados.md)) |
| Exemplo de resposta sobre vitamina D e fraturas | Bolland 2018 e LeBoff 2022, conferidos no PubMed (mesmo arquivo) |
| "Médico e residente da USP, no HC-FMUSP" | [`marca/identidade.md`](../marca/identidade.md) |

## Regras que a página segue (mantenha ao editar)

- O texto dos prompts nunca aparece; o teste interativo mostra só o formato da resposta.
- Nenhum depoimento, número de alunos ou resultado inventado. Quando houver depoimentos reais, com autorização por escrito, eles podem entrar numa seção antes do preço.
- Sem superlativo que não dá para provar e sem promessa de resultado (aprovação, publicação).
- Os três cuidados ficam na página: conferir as referências, nunca colar dado de paciente, evidência não é conduta.

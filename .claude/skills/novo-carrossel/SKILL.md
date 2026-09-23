---
name: novo-carrossel
description: Cria um novo carrossel da paper.ai__ para o Instagram a partir de um tema (escreve o YAML em carrosseis/, gera os PNGs e revisa). Use quando pedirem um carrossel, post ou conteúdo novo para o Instagram da paper.ai__.
---

# Novo carrossel da paper.ai__

Tema pedido: $ARGUMENTS

## 1. Leia antes de escrever

- `estrategia/playbook-carrosseis.md`: anatomia, arquétipos, ganchos, CTAs, legenda, checklist.
- `marca/identidade.md`: o produto em uma tela, voz, cores, regras inegociáveis.
- `marca/catalogo-produto.json`: os onze prompts (P1–P11), com nome, descrição, quando usar e o que entregam.
- `carrosseis/_modelo.yaml`: todos os tipos de slide e campos.
- Um carrossel pronto do mesmo arquétipo em `carrosseis/`, como referência de tom e densidade.
- `estrategia/calendario.md`: para não repetir tema e escolher o próximo número e a data.

## 2. Decida

- **Qual prompt da biblioteca** o carrossel vende (`produto: P1`…`P11`), ou qual prova da marca ele mostra (contrato de veracidade, marcas, três cuidados).
- **Arquétipo** e **uma** métrica-alvo (salvamentos, envios, comentários ou seguidores).
- **Gancho** do slide 1 (use o banco de ganchos do playbook) e um **slide 2 que funcione sozinho**.
- 7 a 10 slides. Uma ideia por slide.

## 3. Escreva `carrosseis/NN-slug.yaml`

- `NN` = próximo número livre. Nome do arquivo em minúsculas, sem acento.
- Português do Brasil, frases curtas, "você".
- `==destaque==` (vermelho) em 1 a 5 palavras por slide.
- Nome, código e descrição do prompt exatamente como no catálogo.
- Mostre o que o prompt faz com o slide `resposta` (esqueleto do formato de saída, campos entre colchetes). **Nunca** publique o prompt do produto na íntegra.
- Versão curta gratuita, se houver: variáveis em `[MAIÚSCULAS]` e as regras do contrato de veracidade.
- Legenda: primeira linha com a palavra-chave em até 125 caracteres, o que o prompt faz e o que volta, a versão curta gratuita (se houver), uma linha de cuidado, CTA. **No máximo 5 hashtags.**

## 4. Confira os fatos

Todo número, estatística, estudo ou regra citada precisa de fonte verificável. Se houver acesso ao PubMed, confirme autores, ano, revista e DOI; coloque a referência na `fonte:` ou `nota:` do slide e na legenda. Se não conseguir confirmar, **não use o dado**. Nunca sugira colar dados de pacientes na IA.

## 5. Gere e revise

```bash
npm run render -- NN
```

- Corrija qualquer aviso do gerador (texto que não coube, texto reduzido abaixo de 86%, hashtags demais, primeira linha longa).
- Abra `exports/NN-slug/_prancha.jpg` e revise: gancho legível, destaque no lugar certo, nada cortado, CTA claro.
- Rode o checklist da seção 9 do playbook.

## 6. Entregue

Mostre a prancha ao usuário, resuma arquétipo, objetivo e gancho, e sugira o dia no calendário.

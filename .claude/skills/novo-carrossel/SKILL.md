---
name: novo-carrossel
description: Cria um novo carrossel da paper.ai__ para o Instagram a partir de um tema (escreve o YAML em carrosseis/, gera os PNGs e revisa). Use quando pedirem um carrossel, post ou conteúdo novo para o Instagram da paper.ai__.
---

# Novo carrossel da paper.ai__

Tema pedido: $ARGUMENTS

## 1. Leia antes de escrever

- `estrategia/playbook-carrosseis.md`: anatomia, arquétipos, ganchos, CTAs, legenda, checklist.
- `marca/identidade.md`: voz, cores, método P.A.P.E.R., regras inegociáveis.
- `carrosseis/_modelo.yaml`: todos os tipos de slide e campos.
- Um carrossel pronto do mesmo arquétipo em `carrosseis/`, como referência de tom e densidade.
- `estrategia/calendario.md`: para não repetir tema e escolher o próximo número e a data.

## 2. Decida

- **Arquétipo** e **uma** métrica-alvo (salvamentos, envios, comentários ou seguidores).
- **Gancho** do slide 1 (use o banco de ganchos do playbook) e um **slide 2 que funcione sozinho**.
- 7 a 10 slides. Uma ideia por slide.

## 3. Escreva `carrosseis/NN-slug.yaml`

- `NN` = próximo número livre. Nome do arquivo em minúsculas, sem acento.
- Português do Brasil, frases curtas, "você".
- `==marca-texto==` em 1 a 3 palavras por slide.
- Prompts: variáveis em `[MAIÚSCULAS]`, sempre com uma regra de checagem ("cite a seção", "se não constar, escreva 'não consta'", "não invente referências").
- Prompt longo: divida em 2 slides (`parte: 1/2`, `parte: 2/2`) e coloque o prompt completo na legenda.
- Legenda: primeira linha com a palavra-chave em até 125 caracteres, prompt copiável, uma linha de cuidado, CTA. **No máximo 5 hashtags.**

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

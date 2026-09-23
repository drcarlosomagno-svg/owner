# Identidade da paper.ai__

A identidade do Instagram segue a do produto: a **Biblioteca de Prompts** ([artefato](https://claude.ai/artifact/87rA4X3tchY2QFpgAsfbmE)). Cores, fontes, nomes e frases vêm de lá. Se o produto mudar, atualize este arquivo e o [`catalogo-produto.json`](catalogo-produto.json).

## Posicionamento

> **Biblioteca de prompts para pesquisa científica.** Escreva o que você quer saber. A biblioteca monta o prompt que faz a IA buscar no PubMed os melhores artigos do tema, com o nível de evidência, o DOI e o link de cada um.

- **Para quem:** médicos, residentes e pós-graduandos que usam IA para buscar, ler e aplicar evidência. Os prompts são escritos para "um médico que quer a resposta e as referências, sem rodeios".
- **Promessa:** onze prompts, um para cada momento da pesquisa. Buscar, ler, checar e usar. Cada prompt indica o próximo passo.
- **Funciona no Claude, no ChatGPT e no Gemini**, com versão própria para cada um.
- **Quem faz:** médico e residente da USP, no Hospital das Clínicas da FMUSP, o maior complexo hospitalar da América Latina.

## O produto em uma tela

| Etapa | O que é | Prompts |
|---|---|---|
| **Buscar** | Encontrar o que existe sobre o tema | P1 Motor de Busca de Referências · P2 Gerador de Busca Avançada · P3 Vigilância Semanal |
| **Ler** | Decidir o que vale a leitura e ler a fundo | P4 Triagem Rápida · P5 Dissecação de um Artigo · P6 Mesa de Comparação |
| **Checar** | Conferir antes de confiar | P7 Caçador de Vieses · P8 Detector de Referência Falsa · P9 Diretriz vs. Estudo Novo |
| **Usar** | Levar para o consultório e para o público | P10 Tradutor Clínico · P11 Tradutor para Leigos |

Descrições curtas, quando usar e o que cada prompt entrega: [`catalogo-produto.json`](catalogo-produto.json). O gerador lê esse arquivo para montar o cartão do prompt na capa.

## O que torna os prompts diferentes (use como prova em todo conteúdo)

1. **Contrato de veracidade.** Oito regras que valem acima de qualquer pedido: só vale fonte aberta na conversa; PMID e DOI só se lidos; número como publicado; associação não é causa; subgrupo é do subgrupo; divergência aparece; "os estudos não respondem" é resposta; resultado nulo pesa igual.
2. **Marcas fixas na resposta:** `[não verificado]` (dado que a IA não leu na fonte), `[cálculo meu]` (conta da IA, com a conta ao lado) e `[inferência]` (interpretação que o estudo não afirma).
3. **Resposta que começa pelo veredito:** a primeira seção é sempre "Em 30 segundos".
4. **Métodos reconhecidos:** nível de evidência de Oxford (OCEBM 2011), certeza GRADE (⊕⊕⊕◯), risco de viés por domínio, busca no padrão PRISMA-S.
5. **Links verificáveis:** `https://pubmed.gov/PMID`, montado com o PMID lido na página.
6. **Checagem final** antes de responder e **o próximo passo** indicado em cada prompt.

### Os três cuidados (frase do site)

- **Confira as referências.** IA erra citação misturando pedaços reais: título certo, autor errado. O P8 confere uma a uma.
- **Nunca cole dados de paciente.** Nada de nome, prontuário ou documento. Use um perfil genérico.
- **Evidência não é conduta.** Os prompts interpretam estudos. A decisão sobre cada pessoa continua sendo sua.

## Assinatura

**paper.ai__** em Anton: "paper" na cor da tinta e ".ai__" em vermelho. Aparece no topo de todos os slides. O @ é **@paper.ai__**.

## Cores (tokens do produto)

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| Fundo | `#FCFCFB` | `#111214` | Fundo dos slides |
| Cartão | `#FFFFFF` | `#17181B` | Caixa de pergunta, cartão de resposta |
| Painel | `#F5F4F2` | `#1C1D20` | Cartões de prompt, fundo do prompt |
| Linha | `#ECEAE8` | `#27282C` | Divisórias |
| Tinta | `#17181B` | `#EDEBE8` | Texto principal |
| Tinta 2 | `#4A4A50` | `#C4C1BE` | Texto de apoio |
| Cinza | `#726C6E` | `#9C9698` | Etiquetas, códigos, rodapé |
| **Vermelho** | `#D0112B` | `#F0445C` | Destaque, botão "Criar prompt", fio contínuo, fundo do CTA |
| Vermelho suave | `#FCEDEF` | `#3A161B` | Fundo do "pedido comum", etiqueta de código |
| Realce | `#FFF0C7` + texto `#6B4200` | `#4A3A12` + `#FFD27A` | Campos preenchidos e `[VARIÁVEIS]` |
| OK | `#1E7F4F` | `#4CC38A` | "Pedido da biblioteca", checks |

## Tipografia (a mesma do site, licença OFL, em `assets/fonts/`)

| Papel | Fonte | Onde |
|---|---|---|
| Display | **Anton** | Logo, capa, números grandes, CTA |
| Texto | **IBM Plex Sans** (400 a 700) | Títulos internos (600), parágrafos, listas |
| Código | **IBM Plex Mono** | Códigos P1–P11, prompts, contador, rodapé |

## Componentes visuais

- **Caixa de pergunta** (capa): igual à do site, com o tema digitado e o botão vermelho **Criar prompt**.
- **Cartão do prompt** (capa): código, nome e descrição curta, como na home do site. Aparece sozinho quando o carrossel tem `produto:`.
- **Código gigante** (capa): o código do prompt (P1, P8…) ou o número do post, em cinza claro, no canto.
- **Formato da resposta:** um cartão branco mostrando o esqueleto do que o prompt devolve, com os campos em realce.
- **Semáforo** 🟢 🟡 🔴 (P4) e **gravidade** 🔴 🟠 🟡 (P7), como no produto.
- **Fio vermelho contínuo:** atravessa todos os slides, do anel na capa ao ponto final no CTA.
- **CTA** com fundo vermelho e texto branco, como o botão principal do site.
- **Formato:** 3:4 (1080×1440).

## Voz

| É | Não é |
|---|---|
| Direto, frases curtas, "você" | Guru de IA, "revolucionário", "segredo" |
| Veredito primeiro, depois o caminho | Enrolação antes da resposta |
| Honesto sobre os limites da IA | Promessa de resultado (aprovação, publicação) |
| Rigoroso: número com fonte, conta mostrada | Número sem referência |
| Vocabulário do produto: buscar, ler, checar, usar; "Em 30 segundos"; "o próximo passo" | Jargão de marketing |

## Regras inegociáveis

1. Nenhum dado, estatística ou referência sem fonte conferida.
2. Nunca sugerir colar dados identificáveis de pacientes em IA (LGPD).
3. **Não publicar os prompts do produto na íntegra.** O Instagram mostra o que o prompt faz, o formato da resposta e versões curtas gratuitas (como a do contrato de veracidade). O prompt completo é o que se vende.
4. Todo carrossel de produto usa o nome e o código exatos do catálogo.
5. Transparência sobre o uso de IA na produção do conteúdo.
6. Sem persona sintética: quando houver rosto, é o do médico real por trás da marca.
7. Sem superlativos que não dá para provar ("a melhor do Brasil"). Prefira o demonstrável.

## Perfil do Instagram

**Nome** (campo pesquisável, até 30 caracteres): `Prompts para pesquisa médica`

**Bio** (até 150 caracteres):

```
Prompts de IA para pesquisa científica
Buscar · ler · checar · usar evidência
Médico residente HC-FMUSP · CRM [nº/UF]
↓ Lista de espera
```

Pela Resolução CFM 2.336/2023, o médico que se identifica como médico nas redes informa nome e CRM. Como residente, não anuncie especialidade (exige RQE).

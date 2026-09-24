#!/usr/bin/env node
// Gera as imagens dos carrosséis a partir dos arquivos YAML.
// Duas coleções:
//   carrosseis/           educativos, na identidade do produto  → exports/
//   campanha/carrosseis/  campanha de crescimento, com foto      → exports/campanha/
//
//   npm run render                    as duas coleções, formato 3:4 (1080×1440)
//   npm run render -- 03              só os arquivos cujo nome contém "03"
//   npm run render -- --campanha      só a campanha (ou --educativos)
//   npm run render -- --formato 4x5   formato 4:5 (1080×1350), salvo em exports-4x5/

import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { chromium } from 'playwright';
import { escapeHtml, inline, plain } from './lib/markup.mjs';
import { TEMA_PADRAO, TEMAS, TIPOS, altText } from './lib/slides.mjs';
import { PALETAS, TIPOS_CAMPANHA, altCampanha, slideCampanha } from './lib/campanha.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PASTA_FOTOS = path.join(RAIZ, 'campanha', 'fotos');
const PASTA_BUILD = path.join(RAIZ, '.build');
const CATALOGO = JSON.parse(await readFile(path.join(RAIZ, 'marca', 'catalogo-produto.json'), 'utf8'));
const PROMPTS = new Map(CATALOGO.prompts.map((p) => [p.id, p]));
const FORMATOS = { '3x4': { w: 1080, h: 1440 }, '4x5': { w: 1080, h: 1350 } };
const MAX_HASHTAGS = 5;
const MAX_LEGENDA = 2200;
const K_MINIMO = 0.7;
const K_ALERTA = 0.86;
const K_MAXIMO = 1.2;
const OCUPACAO_ALVO = 0.8;

// ---------- argumentos ----------

const args = process.argv.slice(2);
let formato = '3x4';
let so = null;
const filtros = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--formato') formato = args[++i];
  else if (args[i] === '--campanha' || args[i] === '--educativos') so = args[i].slice(2);
  else filtros.push(args[i]);
}
if (!FORMATOS[formato]) {
  console.error(`Formato desconhecido: ${formato}. Use 3x4 ou 4x5.`);
  process.exit(1);
}
const { w: W, h: H } = FORMATOS[formato];
const PASTA_SAIDA_RAIZ = path.join(RAIZ, formato === '3x4' ? 'exports' : `exports-${formato}`);

// ---------- fio vermelho contínuo ----------

// Altura do fio em cada borda entre slides. As bordas compartilham o mesmo y,
// então a linha "continua" quando a pessoa arrasta para o próximo slide.
const ONDAS = [0, -22, 16, -12, 24, -18, 8, -26, 18, -6, 22, -14, 12, -20, 6, -24, 20, -10, 14, -16, 0];

function fio(i, total) {
  const base = H - 150;
  const y0 = base + ONDAS[i % ONDAS.length];
  const y1 = base + ONDAS[(i + 1) % ONDAS.length];
  const x0 = i === 0 ? 96 : 0;
  const x1 = i === total - 1 ? W - 96 : W;
  const xm = (x0 + x1) / 2;
  let svg = `<path d="M${x0} ${y0} C${xm} ${y0} ${xm} ${y1} ${x1} ${y1}"/>`;
  if (i === 0) svg += `<circle class="anel" cx="${x0}" cy="${y0}" r="14"/>`;
  if (i === total - 1) svg += `<circle cx="${x1}" cy="${y1}" r="18"/>`;
  return `<svg class="fio" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${svg}</svg>`;
}

// ---------- montagem do HTML ----------

const LOGO = '<div class="logo">paper<span>.ai__</span></div>';
const SETA = inline('→');

function slideHtml(s, i, total, numero, ctx) {
  const tema = s.tema || TEMA_PADRAO[s.tipo];
  const marca = ctx.produto?.id ?? numero;
  const capaNum = s.tipo === 'capa' && marca ? `<div class="capa-num" aria-hidden="true">${escapeHtml(marca)}</div>` : '';
  const n = String(total).padStart(2, '0');
  const atual = String(i + 1).padStart(2, '0');
  const ultimo = i === total - 1;
  return `
<section class="slide t-${tema} tipo-${s.tipo}" style="--w:${W}px;--h:${H}px">
  <header class="topo">${LOGO}<div class="pag"><b>${atual}</b>/${n}</div></header>
  ${capaNum}
  <main class="corpo">${TIPOS[s.tipo](s, ctx)}</main>
  ${fio(i, total)}
  <footer class="rodape"><span>@paper.ai__</span>${ultimo ? '<span>biblioteca de prompts para pesquisa</span>' : `<span class="arraste">arraste ${SETA}</span>`}</footer>
</section>`;
}

function paginaHtml(titulo, corpo, folha = 'slide.css') {
  const css = pathToFileURL(path.join(RAIZ, 'templates', folha)).href;
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>${escapeHtml(titulo)}</title>
<link rel="stylesheet" href="${css}"></head>
<body>${corpo}</body></html>`;
}

// ---------- validação ----------

function validar(c, arquivo, col) {
  const erros = [];
  const avisos = [];
  if (!Array.isArray(c.slides) || c.slides.length === 0) erros.push('sem slides');
  else if (c.slides.length > 20) erros.push(`${c.slides.length} slides (o Instagram aceita até 20)`);
  (c.slides || []).forEach((s, i) => {
    if (!col.tipos.includes(s.tipo)) erros.push(`slide ${i + 1}: tipo "${s.tipo}" não existe (${col.tipos.join(', ')})`);
    if (s.tema && !TEMAS.includes(s.tema)) erros.push(`slide ${i + 1}: tema "${s.tema}" não existe (${TEMAS.join(', ')})`);
    if (s.paleta && !PALETAS.includes(s.paleta)) erros.push(`slide ${i + 1}: paleta "${s.paleta}" não existe (${PALETAS.join(', ')})`);
  });
  if (col.nome === 'campanha' && !PALETAS.includes(c.paleta)) erros.push(`paleta "${c.paleta}" inválida (${PALETAS.join(', ')})`);
  if (c.produto && !PROMPTS.has(c.produto)) erros.push(`produto "${c.produto}" não existe no catálogo (${[...PROMPTS.keys()].join(', ')})`);
  const tags = c.hashtags || [];
  if (tags.length > MAX_HASHTAGS) avisos.push(`${tags.length} hashtags; o Instagram limita a ${MAX_HASHTAGS}`);
  const primeira = String(c.legenda || '').trim().split('\n')[0];
  if (primeira.length > 125) avisos.push(`1ª linha da legenda tem ${primeira.length} caracteres; o ideal para SEO é até 125`);
  const tamanho = [...legendaCompleta(c)].length;
  if (tamanho > MAX_LEGENDA) avisos.push(`legenda com ${tamanho} caracteres; o Instagram aceita até ${MAX_LEGENDA}`);
  if (erros.length) throw new Error(`${arquivo}:\n  - ${erros.join('\n  - ')}`);
  return avisos;
}

function legendaCompleta(c) {
  const tags = (c.hashtags || []).map((t) => `#${String(t).replace(/^#/, '')}`).join(' ');
  return `${String(c.legenda || '').trim()}\n\n${tags}`.trim() + '\n';
}

// ---------- ajuste de texto na página ----------

// Ajusta --k de cada slide: reduz até o conteúdo caber em .corpo e, em slides
// com pouco texto, aumenta um pouco para ocupar melhor o espaço (menos a capa,
// que tem o texto ancorado embaixo de propósito).
function ajustarTexto({ kMin, kMax, ocupacao }) {
  const medir = (c) => {
    const r = c.getBoundingClientRect();
    let topo = Infinity;
    let base = -Infinity;
    for (const el of c.children) {
      const b = el.getBoundingClientRect();
      topo = Math.min(topo, b.top);
      base = Math.max(base, b.bottom);
    }
    const larguraOk = [...c.querySelectorAll('*')].every(
      (el) => el.scrollWidth <= el.clientWidth + 1 || el.clientWidth === 0 || getComputedStyle(el).textOverflow === 'ellipsis',
    );
    return { cabe: base - topo <= r.height + 1 && larguraOk, fracao: (base - topo) / r.height };
  };
  const aplicar = (c, k) => c.style.setProperty('--k', k);
  const passo = (k, d) => Math.round((k + d) * 100) / 100;
  return [...document.querySelectorAll('.slide')].map((slide) => {
    const c = slide.querySelector('.corpo');
    let k = 1;
    while (!medir(c).cabe && k > kMin) aplicar(c, (k = passo(k, -0.02)));
    if (!slide.classList.contains('tipo-capa')) {
      while (k < kMax && medir(c).fracao < ocupacao) {
        aplicar(c, (k = passo(k, 0.02)));
        if (!medir(c).cabe) {
          aplicar(c, (k = passo(k, -0.02)));
          break;
        }
      }
    }
    return { k, cabe: medir(c).cabe };
  });
}

// ---------- principal ----------

// As duas coleções de carrosséis e como cada uma é montada.
const COLECOES = [
  {
    nome: 'educativos',
    conteudo: path.join(RAIZ, 'carrosseis'),
    saida: PASTA_SAIDA_RAIZ,
    folha: 'slide.css',
    tipos: Object.keys(TIPOS),
    ext: 'png',
    montar: (c, id, s, i, total) =>
      slideHtml(s, i, total, c.numero ?? id.match(/^(\d+)/)?.[1], { produto: PROMPTS.get(c.produto) }),
    alt: altText,
  },
  {
    nome: 'campanha',
    conteudo: path.join(RAIZ, 'campanha', 'carrosseis'),
    saida: path.join(PASTA_SAIDA_RAIZ, 'campanha'),
    folha: 'campanha.css',
    tipos: TIPOS_CAMPANHA,
    ext: 'jpg',
    montar: (c, id, s, i, total) => slideCampanha(s, i, total, { id, paleta: c.paleta, pastaFotos: PASTA_FOTOS, W, H }),
    alt: altCampanha,
  },
];

async function main() {
  await mkdir(PASTA_BUILD, { recursive: true });
  const browser = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  );
  const page = await browser.newPage({ viewport: { width: W + 120, height: H + 80 }, deviceScaleFactor: 1 });
  let problemas = 0;
  let feitos = 0;

  for (const col of COLECOES.filter((x) => !so || x.nome === so)) {
    if (!existsSync(col.conteudo)) continue;
    const arquivos = (await readdir(col.conteudo))
      .filter((f) => /\.ya?ml$/.test(f) && !f.startsWith('_'))
      .filter((f) => filtros.length === 0 || filtros.some((t) => f.includes(t)))
      .sort();
    if (arquivos.length === 0) continue;
    await mkdir(col.saida, { recursive: true });
    console.log(`\n${col.nome}`);
    for (const arquivo of arquivos) {
      problemas += await renderizar(page, col, arquivo);
      feitos++;
    }
    await galeria(col);
    if (col.nome === 'campanha') await listaDeFotos(col);
    console.log(`Arquivos em ${path.relative(RAIZ, col.saida)}/`);
  }

  await browser.close();
  if (feitos === 0) {
    console.error('Nenhum carrossel encontrado para esse filtro.');
    process.exit(1);
  }
  if (problemas) {
    console.error(`\n${problemas} slide(s) com texto que não coube. Corrija antes de postar.`);
    process.exitCode = 1;
  }
}

async function renderizar(page, col, arquivo) {
  {
    const id = arquivo.replace(/\.ya?ml$/, '');
    const c = parseYaml(await readFile(path.join(col.conteudo, arquivo), 'utf8'));
    const avisos = validar(c, arquivo, col);
    const total = c.slides.length;
    const ctx = { produto: PROMPTS.get(c.produto) };

    const htmlPath = path.join(PASTA_BUILD, `${col.nome}-${id}.html`);
    await writeFile(htmlPath, paginaHtml(c.titulo || id, c.slides.map((s, i) => col.montar(c, id, s, i, total)).join('\n'), col.folha));
    await page.goto(pathToFileURL(htmlPath).href);
    await page.evaluate(() => Promise.all([document.fonts.ready, ...[...document.images].map((i) => i.decode().catch(() => {}))]));

    const ajustes = await page.evaluate(ajustarTexto, { kMin: K_MINIMO, kMax: K_MAXIMO, ocupacao: OCUPACAO_ALVO });
    ajustes.forEach(({ k, cabe }, i) => {
      if (!cabe) avisos.push(`slide ${i + 1}: o texto NÃO coube; corte texto ou divida em dois slides`);
      else if (k < K_ALERTA) avisos.push(`slide ${i + 1}: texto reduzido para ${Math.round(k * 100)}%; considere enxugar`);
    });

    const saida = path.join(col.saida, id);
    await rm(saida, { recursive: true, force: true });
    await mkdir(saida, { recursive: true });

    const nomeSlide = (i) => `${String(i + 1).padStart(2, '0')}.${col.ext}`;
    const slides = page.locator('.slide');
    for (let i = 0; i < total; i++) {
      const opcoes = col.ext === 'jpg' ? { type: 'jpeg', quality: 92 } : { type: 'png' };
      await slides.nth(i).screenshot({ path: path.join(saida, nomeSlide(i)), ...opcoes });
    }

    await writeFile(path.join(saida, 'legenda.txt'), legendaCompleta(c));
    await writeFile(
      path.join(saida, 'alt-text.txt'),
      c.slides.map((s, i) => `${nomeSlide(i)}\n${col.alt(s, i, total)}\n`).join('\n'),
    );
    const pendentes = await page.locator('.pendente').count();
    const meta = {
      id,
      titulo: c.titulo || id,
      arquetipo: c.arquetipo || '',
      produto: ctx.produto ? `${ctx.produto.id} · ${ctx.produto.nome}` : '',
      objetivo: c.objetivo || '',
      publicar: c.publicar || '',
      paleta: c.paleta || '',
      pauta: c.pauta || '',
      estudo: c.estudo || '',
      slides: total,
      ext: col.ext,
      fotos_pendentes: pendentes,
      formato,
      gancho: plain(c.slides[0].titulo || ''),
    };
    await writeFile(path.join(saida, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');

    await prancha(page, saida, meta, col);

    if (pendentes) avisos.push(`${pendentes} foto(s) pendente(s) em campanha/fotos/`);
    const status = avisos.length ? `⚠ ${avisos.length} aviso(s)` : 'ok';
    console.log(`✓ ${id}  (${total} slides)  ${status}`);
    avisos.forEach((a) => console.log(`    - ${a}`));
    return ajustes.filter((a) => !a.cabe).length;
  }
}

// Visão geral de todos os slides em uma imagem só (para revisar no celular).
async function prancha(page, saida, meta, col) {
  const colunas = meta.slides <= 5 ? meta.slides : Math.ceil(meta.slides / 2);
  const largura = Math.min(2400, colunas * 360 + (colunas - 1) * 28 + 96);
  const imgs = Array.from({ length: meta.slides }, (_, i) => {
    const src = pathToFileURL(path.join(saida, `${String(i + 1).padStart(2, '0')}.${col.ext}`)).href;
    return `<img src="${src}" alt="">`;
  }).join('');
  const html = paginaHtml(
    meta.titulo,
    `<div class="prancha" style="width:${largura}px;grid-template-columns:repeat(${colunas},1fr)">
      <h1>${escapeHtml(meta.titulo)}<small>${escapeHtml([meta.paleta, meta.arquetipo, meta.objetivo, meta.publicar].filter(Boolean).join(' · '))}</small></h1>${imgs}</div>`,
    col.folha,
  );
  const htmlPath = path.join(PASTA_BUILD, `${col.nome}-${meta.id}-prancha.html`);
  await writeFile(htmlPath, html);
  await page.setViewportSize({ width: largura + 80, height: 1200 });
  await page.goto(pathToFileURL(htmlPath).href);
  await page.evaluate(() => Promise.all([document.fonts.ready, ...[...document.images].map((i) => i.decode())]));
  await page.locator('.prancha').screenshot({ path: path.join(saida, '_prancha.jpg'), type: 'jpeg', quality: 86 });
  await page.setViewportSize({ width: W + 120, height: H + 80 });
}

// README.md de cada coleção: galeria navegável pelo GitHub (inclusive no celular).
async function galeria(col) {
  const pastas = (await readdir(col.saida, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  const metas = [];
  for (const p of pastas) {
    const f = path.join(col.saida, p, 'meta.json');
    if (existsSync(f)) metas.push(JSON.parse(await readFile(f, 'utf8')));
  }
  const campanha = col.nome === 'campanha';
  const linhas = [
    campanha ? '# Campanha de crescimento' : '# Carrosséis prontos',
    '',
    `Gerado por \`npm run render\`. Formato ${formato === '3x4' ? '3:4 (1080×1440)' : '4:5 (1080×1350)'}.`,
    '',
    `Cada pasta tem os slides numerados (\`01.${col.ext}\`, \`02.${col.ext}\`…), a legenda pronta para colar (\`legenda.txt\`) e o texto alternativo de cada slide (\`alt-text.txt\`).`,
    '',
  ];
  if (campanha) {
    linhas.push(
      'Fotos: veja a lista do que buscar em [`campanha/fotos/LISTA.md`](../../campanha/fotos/LISTA.md). Enquanto a foto não é adicionada, a capa sai com um fundo provisório marcado como "foto pendente".',
      '',
      '| # | Carrossel | Pauta | Estudo | Paleta | Quando postar |',
      '|---|---|---|---|---|---|',
      ...metas.map((m) => `| ${m.id.slice(0, 2)} | [${m.titulo}](#${m.id}) | ${m.pauta} | ${m.estudo} | ${m.paleta} | ${m.publicar} |`),
      '',
    );
  } else {
    linhas.push(
      'A campanha de crescimento (posts com foto) está em [`campanha/`](campanha/).',
      '',
      '| # | Carrossel | Prompt da biblioteca | Arquétipo | Objetivo | Quando postar |',
      '|---|---|---|---|---|---|',
      ...metas.map((m) => `| ${m.id.slice(0, 2)} | [${m.titulo}](#${m.id}) | ${m.produto || '—'} | ${m.arquetipo} | ${m.objetivo} | ${m.publicar} |`),
      '',
    );
  }
  for (const m of metas) {
    const cab = campanha
      ? `**${m.paleta}** · ${m.pauta} · ${m.publicar} · ${m.slides} slides${m.fotos_pendentes ? ` · ${m.fotos_pendentes} foto(s) pendente(s)` : ''}`
      : `${m.produto ? `**${m.produto}** · ` : ''}**${m.arquetipo}** · objetivo: ${m.objetivo} · ${m.publicar} · ${m.slides} slides`;
    linhas.push(
      `<a id="${m.id}"></a>`,
      `## ${m.titulo}`,
      '',
      `${cab} · [slides](${m.id}/) · [legenda](${m.id}/legenda.txt) · [alt text](${m.id}/alt-text.txt)`,
      '',
      `![${m.titulo}](${m.id}/_prancha.jpg)`,
      '',
    );
  }
  await writeFile(path.join(col.saida, 'README.md'), linhas.join('\n'));
}

// campanha/fotos/LISTA.md: que foto buscar para cada carrossel, e com que nome salvar.
async function listaDeFotos(col) {
  const arquivos = (await readdir(col.conteudo)).filter((f) => /\.ya?ml$/.test(f) && !f.startsWith('_')).sort();
  const linhas = [
    '# Fotos da campanha',
    '',
    'Salve cada foto nesta pasta com o nome indicado (`.jpg`, `.png` ou `.webp`) e rode `npm run render -- --campanha`. O gerador aplica sozinho o tratamento de cor da paleta.',
    '',
    'Use fotos com licença para uso comercial (Unsplash, Pexels, banco de imagens pago ou fotos suas). Imagem do Pinterest quase sempre pertence a outra pessoa.',
    '',
    '| Arquivo | Paleta | O que buscar | Descrição | Situação |',
    '|---|---|---|---|---|',
  ];
  for (const arquivo of arquivos) {
    const id = arquivo.replace(/\.ya?ml$/, '');
    const c = parseYaml(await readFile(path.join(col.conteudo, arquivo), 'utf8'));
    const pedidos = [];
    if (c.foto) pedidos.push({ nome: id, ...c.foto });
    c.slides.forEach((s, i) => {
      if (s.tipo === 'foto') pedidos.push({ nome: `${id}-${s.foto || i + 1}`, ...(s.foto_brief || {}) });
    });
    for (const p of pedidos) {
      const tem = ['.jpg', '.jpeg', '.png', '.webp'].some((e) => existsSync(path.join(PASTA_FOTOS, `${p.nome}${e}`)));
      linhas.push(`| \`${p.nome}.jpg\` | ${c.paleta} | ${p.busca || ''} | ${p.descricao || ''} | ${tem ? '✅ ok' : '⏳ pendente'} |`);
    }
  }
  await mkdir(PASTA_FOTOS, { recursive: true });
  await writeFile(path.join(PASTA_FOTOS, 'LISTA.md'), linhas.join('\n') + '\n');
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

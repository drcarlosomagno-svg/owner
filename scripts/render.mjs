#!/usr/bin/env node
// Gera os PNGs dos carrosséis a partir dos arquivos YAML em carrosseis/.
//
//   npm run render                 todos os carrosséis, formato 3:4 (1080×1440)
//   npm run render -- 03           só os arquivos cujo nome contém "03"
//   npm run render -- --formato 4x5   formato 4:5 (1080×1350), salvo em exports-4x5/

import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { chromium } from 'playwright';
import { escapeHtml, inline, plain } from './lib/markup.mjs';
import { TEMA_PADRAO, TEMAS, TIPOS, altText } from './lib/slides.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PASTA_CONTEUDO = path.join(RAIZ, 'carrosseis');
const PASTA_BUILD = path.join(RAIZ, '.build');
const FORMATOS = { '3x4': { w: 1080, h: 1440 }, '4x5': { w: 1080, h: 1350 } };
const MAX_HASHTAGS = 5;
const MAX_LEGENDA = 2200;
const K_MINIMO = 0.7;
const K_ALERTA = 0.86;
const K_MAXIMO = 1.18;
const OCUPACAO_ALVO = 0.72;

// ---------- argumentos ----------

const args = process.argv.slice(2);
let formato = '3x4';
const filtros = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--formato') formato = args[++i];
  else filtros.push(args[i]);
}
if (!FORMATOS[formato]) {
  console.error(`Formato desconhecido: ${formato}. Use 3x4 ou 4x5.`);
  process.exit(1);
}
const { w: W, h: H } = FORMATOS[formato];
const PASTA_SAIDA = path.join(RAIZ, formato === '3x4' ? 'exports' : `exports-${formato}`);

// ---------- fio marca-texto contínuo ----------

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

const LOGO = '<div class="logo">paper<span class="ai">.ai</span><span class="cursor">__</span></div>';
const SETA = inline('→');

function slideHtml(s, i, total, numero) {
  const tema = s.tema || TEMA_PADRAO[s.tipo];
  const capaNum = s.tipo === 'capa' && numero ? `<div class="capa-num" aria-hidden="true">${escapeHtml(numero)}</div>` : '';
  const n = String(total).padStart(2, '0');
  const atual = String(i + 1).padStart(2, '0');
  const ultimo = i === total - 1;
  return `
<section class="slide t-${tema} tipo-${s.tipo}" style="--w:${W}px;--h:${H}px">
  <header class="topo">${LOGO}<div class="pag"><b>${atual}</b>/${n}</div></header>
  ${capaNum}
  <main class="corpo">${TIPOS[s.tipo](s)}</main>
  ${fio(i, total)}
  <footer class="rodape"><span>@paper.ai__</span>${ultimo ? '<span>prompts para pesquisa médica</span>' : `<span class="arraste">arraste ${SETA}</span>`}</footer>
</section>`;
}

function paginaHtml(titulo, corpo) {
  const css = pathToFileURL(path.join(RAIZ, 'templates', 'slide.css')).href;
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>${escapeHtml(titulo)}</title>
<link rel="stylesheet" href="${css}"></head>
<body>${corpo}</body></html>`;
}

// ---------- validação ----------

function validar(c, arquivo) {
  const erros = [];
  const avisos = [];
  if (!Array.isArray(c.slides) || c.slides.length === 0) erros.push('sem slides');
  else if (c.slides.length > 20) erros.push(`${c.slides.length} slides (o Instagram aceita até 20)`);
  (c.slides || []).forEach((s, i) => {
    if (!TIPOS[s.tipo]) erros.push(`slide ${i + 1}: tipo "${s.tipo}" não existe (${Object.keys(TIPOS).join(', ')})`);
    if (s.tema && !TEMAS.includes(s.tema)) erros.push(`slide ${i + 1}: tema "${s.tema}" não existe (${TEMAS.join(', ')})`);
  });
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
    const larguraOk = [...c.querySelectorAll('*')].every((el) => el.scrollWidth <= el.clientWidth + 1 || el.clientWidth === 0);
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

async function main() {
  const arquivos = (await readdir(PASTA_CONTEUDO))
    .filter((f) => /\.ya?ml$/.test(f) && !f.startsWith('_'))
    .filter((f) => filtros.length === 0 || filtros.some((t) => f.includes(t)))
    .sort();
  if (arquivos.length === 0) {
    console.error('Nenhum carrossel encontrado em carrosseis/ para esse filtro.');
    process.exit(1);
  }

  await mkdir(PASTA_BUILD, { recursive: true });
  await mkdir(PASTA_SAIDA, { recursive: true });

  const browser = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  );
  const page = await browser.newPage({ viewport: { width: W + 120, height: H + 80 }, deviceScaleFactor: 1 });
  let problemas = 0;

  for (const arquivo of arquivos) {
    const id = arquivo.replace(/\.ya?ml$/, '');
    const c = parseYaml(await readFile(path.join(PASTA_CONTEUDO, arquivo), 'utf8'));
    const avisos = validar(c, arquivo);
    const total = c.slides.length;
    const numero = c.numero ?? id.match(/^(\d+)/)?.[1];

    const htmlPath = path.join(PASTA_BUILD, `${id}.html`);
    await writeFile(htmlPath, paginaHtml(c.titulo || id, c.slides.map((s, i) => slideHtml(s, i, total, numero)).join('\n')));
    await page.goto(pathToFileURL(htmlPath).href);
    await page.evaluate(() => document.fonts.ready);

    const ajustes = await page.evaluate(ajustarTexto, { kMin: K_MINIMO, kMax: K_MAXIMO, ocupacao: OCUPACAO_ALVO });
    ajustes.forEach(({ k, cabe }, i) => {
      if (!cabe) avisos.push(`slide ${i + 1}: o texto NÃO coube; corte texto ou divida em dois slides`);
      else if (k < K_ALERTA) avisos.push(`slide ${i + 1}: texto reduzido para ${Math.round(k * 100)}%; considere enxugar`);
    });

    const saida = path.join(PASTA_SAIDA, id);
    await rm(saida, { recursive: true, force: true });
    await mkdir(saida, { recursive: true });

    const slides = page.locator('.slide');
    for (let i = 0; i < total; i++) {
      await slides.nth(i).screenshot({ path: path.join(saida, `${String(i + 1).padStart(2, '0')}.png`), type: 'png' });
    }

    await writeFile(path.join(saida, 'legenda.txt'), legendaCompleta(c));
    await writeFile(
      path.join(saida, 'alt-text.txt'),
      c.slides.map((s, i) => `${String(i + 1).padStart(2, '0')}.png\n${altText(s, i, total)}\n`).join('\n'),
    );
    const meta = {
      id,
      titulo: c.titulo || id,
      arquetipo: c.arquetipo || '',
      objetivo: c.objetivo || '',
      publicar: c.publicar || '',
      slides: total,
      formato,
      gancho: plain(c.slides[0].titulo || ''),
    };
    await writeFile(path.join(saida, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');

    await prancha(page, saida, meta);

    const status = avisos.length ? `⚠ ${avisos.length} aviso(s)` : 'ok';
    console.log(`✓ ${id}  (${total} slides)  ${status}`);
    avisos.forEach((a) => console.log(`    - ${a}`));
    problemas += ajustes.filter((a) => !a.cabe).length;
  }

  await browser.close();
  await galeria();
  console.log(`\nArquivos em ${path.relative(RAIZ, PASTA_SAIDA)}/`);
  if (problemas) {
    console.error(`\n${problemas} slide(s) com texto que não coube. Corrija antes de postar.`);
    process.exitCode = 1;
  }
}

// Visão geral de todos os slides em uma imagem só (para revisar no celular).
async function prancha(page, saida, meta) {
  const colunas = meta.slides <= 5 ? meta.slides : Math.ceil(meta.slides / 2);
  const largura = Math.min(2400, colunas * 360 + (colunas - 1) * 28 + 96);
  const imgs = Array.from({ length: meta.slides }, (_, i) => {
    const src = pathToFileURL(path.join(saida, `${String(i + 1).padStart(2, '0')}.png`)).href;
    return `<img src="${src}" alt="">`;
  }).join('');
  const html = paginaHtml(
    meta.titulo,
    `<div class="prancha" style="width:${largura}px;grid-template-columns:repeat(${colunas},1fr)">
      <h1>${escapeHtml(meta.titulo)}<small>${escapeHtml([meta.arquetipo, meta.objetivo, meta.publicar].filter(Boolean).join(' · '))}</small></h1>${imgs}</div>`,
  );
  const htmlPath = path.join(PASTA_BUILD, `${meta.id}-prancha.html`);
  await writeFile(htmlPath, html);
  await page.setViewportSize({ width: largura + 80, height: 1200 });
  await page.goto(pathToFileURL(htmlPath).href);
  await page.evaluate(() => Promise.all([document.fonts.ready, ...[...document.images].map((i) => i.decode())]));
  await page.locator('.prancha').screenshot({ path: path.join(saida, '_prancha.jpg'), type: 'jpeg', quality: 86 });
  await page.setViewportSize({ width: W + 120, height: H + 80 });
}

// exports/README.md: galeria navegável pelo GitHub (inclusive no celular).
async function galeria() {
  const pastas = (await readdir(PASTA_SAIDA, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  const metas = [];
  for (const p of pastas) {
    const f = path.join(PASTA_SAIDA, p, 'meta.json');
    if (existsSync(f)) metas.push(JSON.parse(await readFile(f, 'utf8')));
  }
  const linhas = [
    '# Carrosséis prontos',
    '',
    `Gerado por \`npm run render\`. Formato ${formato === '3x4' ? '3:4 (1080×1440)' : '4:5 (1080×1350)'}.`,
    '',
    'Cada pasta tem os slides numerados (`01.png`, `02.png`…), a legenda pronta para colar (`legenda.txt`) e o texto alternativo de cada slide (`alt-text.txt`).',
    '',
    '| # | Carrossel | Arquétipo | Objetivo | Quando postar |',
    '|---|---|---|---|---|',
    ...metas.map((m) => `| ${m.id.slice(0, 2)} | [${m.titulo}](#${m.id}) | ${m.arquetipo} | ${m.objetivo} | ${m.publicar} |`),
    '',
  ];
  for (const m of metas) {
    linhas.push(
      `<a id="${m.id}"></a>`,
      `## ${m.titulo}`,
      '',
      `**${m.arquetipo}** · objetivo: ${m.objetivo} · ${m.publicar} · ${m.slides} slides · [slides](${m.id}/) · [legenda](${m.id}/legenda.txt) · [alt text](${m.id}/alt-text.txt)`,
      '',
      `![${m.titulo}](${m.id}/_prancha.jpg)`,
      '',
    );
  }
  await writeFile(path.join(PASTA_SAIDA, 'README.md'), linhas.join('\n'));
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

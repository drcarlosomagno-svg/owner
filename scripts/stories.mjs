// Gera os Stories dos destaques do Instagram (1080×1920) a partir de stories/destaques.yaml.
//
//   npm run stories            todos os destaques
//   npm run stories -- duvidas só os destaques com "duvidas" no id
//
// Saída em exports/stories/<nn>-<id>/: um JPG por Story (ou o MP4, quando o Story é um vídeo),
// capa.png (a capa do destaque) e, em exports/stories/, o README com a ordem de postagem,
// os stickers de cada Story e os links, e uma prancha para revisar tudo de uma vez.
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { escapeHtml, inline } from './lib/markup.mjs';
import { CATALOGO } from './lib/biblioteca-ui.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SAIDA = path.join(RAIZ, 'exports', 'stories');
const BUILD = path.join(RAIZ, '.build', 'stories');
const W = 1080;
const H = 1920;

// Tipo de Story → fundo padrão (escuro, claro ou vermelho), para alternar o ritmo visual.
const FUNDO = {
  abertura: 'escuro', titulo: 'escuro', numero: 'escuro', enquete: 'vermelho', passo: 'claro',
  resposta: 'escuro', marcas: 'claro', lista: 'claro', pergunta: 'escuro', caixa: 'vermelho',
  recebe: 'escuro', oferta: 'escuro', garantia: 'claro', cta: 'vermelho',
};

const ICONES = {
  play: '<circle cx="12" cy="12" r="9.5"/><path d="M10 8.3v7.4l6-3.7z"/>',
  passos: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.4"/><circle cx="4.5" cy="12" r="1.4"/><circle cx="4.5" cy="18" r="1.4"/>',
  grade: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
  lupa: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M8 11h6M11 8v6"/>',
  pergunta: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v9a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A2.5 2.5 0 0 1 3 14.5z"/><path d="M9.7 8.2a2.4 2.4 0 1 1 3 2.3c-.5.2-.7.6-.7 1.1M12 14h0"/>',
  etiqueta: '<path d="M3 12V4.5A1.5 1.5 0 0 1 4.5 3H12l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  check: '<circle cx="12" cy="12" r="9.5"/><path d="M8 12.5l2.7 2.7L16.5 9.5"/>',
  seta: '<path d="M12 4v15M6 13l6 6 6-6"/>',
};
const icone = (nome, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONES[nome] || ''}</svg>`;

const GRUPOS = { buscar: ['01', 'Buscar'], ler: ['02', 'Ler'], checar: ['03', 'Checar'], usar: ['04', 'Usar'] };

function linkDe(cfg, s) {
  const utm = `utm_source=instagram&utm_medium=stories&utm_content=${encodeURIComponent(s.utm || 'destaque')}`;
  if (s.link === 'checkout') return `${cfg.checkout}?${utm}`;
  return `${cfg.pagina.replace(/\/$/, '')}/?${utm}${s.ancora ? `#${s.ancora}` : ''}`;
}

// ---------- HTML de cada tipo ----------

const titulo = (t, cls = 'titulo') => (t ? `<h2 class="${cls}">${inline(t)}</h2>` : '');
const texto = (t) => (t ? `<p class="texto">${inline(t)}</p>` : '');

function miolo(s, cfg) {
  switch (s.tipo) {
    case 'abertura':
      return `<p class="logo">paper<span>.ai__</span></p>${s.selo ? `<p class="selo">${escapeHtml(s.selo)}</p>` : ''}${titulo(s.titulo, 'titulo grande')}${texto(s.texto)}`;
    case 'titulo': {
      const chips = (s.chips || []).map((c) => `<span>${escapeHtml(c)}</span>`).join('');
      return `${s.rotulo ? `<p class="rotulo">${escapeHtml(s.rotulo)}</p>` : ''}${titulo(s.titulo)}${texto(s.texto)}${chips ? `<p class="chips">${chips}</p>` : ''}`;
    }
    case 'numero':
      return `<p class="numero">${escapeHtml(s.numero)}</p>${titulo(s.titulo, 'titulo medio')}${texto(s.texto)}${s.fonte ? `<p class="fonte">Fonte: ${escapeHtml(s.fonte)}</p>` : ''}`;
    case 'enquete':
    case 'caixa':
      return `${titulo(s.titulo)}${texto(s.texto)}<div class="zona-sticker">${icone('seta', 'ico seta')}</div>`;
    case 'cta':
      return `${titulo(s.titulo, 'titulo grande')}${texto(s.texto)}<div class="zona-sticker zona-link">${icone('seta', 'ico seta')}<span>Toque no link</span></div>`;
    case 'passo':
      return `<p class="passo-n">${escapeHtml(s.n)}</p>${titulo(s.titulo, 'titulo medio')}${texto(s.texto)}${mock(s.mock)}`;
    case 'resposta':
      return `<p class="rotulo">Exemplo resumido · P1</p>${respostaExemplo()}<p class="fonte">Artigos e números conferidos no PubMed. Os links abrem de verdade.</p>`;
    case 'marcas':
      return `<p class="rotulo">Como ler a resposta</p>${titulo('As marcas ==da resposta.==', 'titulo medio')}
        <div class="marcas">
          <div><span class="m">[não verificado]</span><span>dado que a IA não leu na fonte</span></div>
          <div><span class="m">[cálculo meu]</span><span>conta da IA, com a conta ao lado</span></div>
          <div><span class="m">[inferência]</span><span>interpretação que o estudo não afirma</span></div>
          <div><span class="m n">Nível 1 a 5</span><span>nível de evidência de Oxford (2011); 1 é o mais forte</span></div>
        </div>${texto('Assim você sabe o que conferir antes de citar.')}`;
    case 'lista': {
      const [n, nome] = GRUPOS[s.grupo];
      const grupo = CATALOGO.grupos.find((g) => g.id === s.grupo);
      const itens = CATALOGO.prompts.filter((p) => p.grupo === s.grupo)
        .map((p) => `<div class="cartao"><span class="cod">${p.id}</span><b>${escapeHtml(p.nome)}</b><span>${escapeHtml(p.curto)}</span></div>`).join('');
      return `<p class="rotulo">Etapa ${n} de 04</p><h2 class="titulo grande">${escapeHtml(nome)}</h2>${texto(grupo.descricao)}<div class="cartoes">${itens}</div>`;
    }
    case 'pergunta':
      return `<div class="pergunta"><p class="p-rot">Pergunta</p><p class="p-txt">${escapeHtml(s.pergunta)}</p></div><p class="resposta-txt">${inline(s.resposta)}</p>`;
    case 'recebe':
      return `<p class="rotulo">Acesso completo</p>${titulo('Tudo o que ==você recebe.==', 'titulo medio')}
        <ul class="pilha">
          <li>${icone('check')}<span><b>Os 11 prompts, de P1 a P11</b>Buscar, ler, checar e usar.</span></li>
          <li>${icone('check')}<span><b>Versão para Claude, ChatGPT e Gemini</b>Com dica de uso para cada IA.</span></li>
          <li>${icone('check')}<span><b>Campos para preencher</b>O prompt sai pronto, com o seu tema dentro.</span></li>
          <li>${icone('check')}<span><b>Guia para ler a resposta</b>Nível de evidência, GRADE e as marcas de checagem.</span></li>
          <li>${icone('check')}<span><b>O próximo passo em cada prompt</b>Você sabe qual usar depois.</span></li>
        </ul>`;
    case 'oferta': {
      const n = (t) => Number(String(t).replace(/[^\d,]/g, '').replace(',', '.')) || 0;
      const desconto = cfg.precoDe ? Math.round((1 - n(cfg.preco) / n(cfg.precoDe)) * 100) : 0;
      return `<div class="card-preco">
          <p class="selo">Preço promocional${desconto > 0 ? ` · ${desconto}% de desconto` : ''}</p>
          <p class="nome-produto">paper<span>.ai__</span> Biblioteca de Prompts</p>
          ${cfg.precoDe ? `<p class="de">De <s>${escapeHtml(cfg.precoDe)}</s> por</p>` : ''}
          <p class="valor">${escapeHtml(cfg.preco)}</p>
          <p class="pagamento"><span>Pix</span><span>Cartão</span><span>Boleto</span></p>
          <p class="miudo">Pagamento pela Kiwify · 7 dias de garantia</p>
        </div>`;
    }
    case 'garantia':
      return `<svg class="selo-garantia" viewBox="0 0 240 240" aria-hidden="true">
          <defs><path id="circ" d="M120,120 m-86,0 a86,86 0 1,1 172,0 a86,86 0 1,1 -172,0"/></defs>
          <circle cx="120" cy="120" r="116" fill="#D0112B"/>
          <circle cx="120" cy="120" r="102" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="3 6" opacity=".7"/>
          <text font-size="17" letter-spacing="4" fill="#fff" font-family="Anton"><textPath href="#circ" startOffset="3%">GARANTIA INCONDICIONAL · GARANTIA INCONDICIONAL ·</textPath></text>
          <text x="120" y="138" text-anchor="middle" font-size="78" fill="#fff" font-family="Anton">7</text>
          <text x="120" y="170" text-anchor="middle" font-size="22" letter-spacing="3" fill="#fff" font-family="Anton">DIAS</text>
        </svg>${titulo('Use por 7 dias. ==Se não servir, o dinheiro volta.==', 'titulo medio')}${texto('Teste nos seus temas, na IA que você usa. Se não for para você, peça o reembolso pela Kiwify dentro do prazo.')}`;
    default:
      throw new Error(`tipo de Story "${s.tipo}" não existe`);
  }
}

function mock(tipo) {
  if (tipo === 'tema') {
    return `<div class="mock"><p class="m-rot">Tema</p><p class="m-input">vitamina D e fraturas em idosos<i></i></p><p class="m-btn">Criar prompt</p></div>`;
  }
  if (tipo === 'copiado') {
    return `<div class="mock"><p class="m-seg"><span class="on">Claude</span><span>ChatGPT</span><span>Gemini</span></p><p class="m-ok">Copiado. Agora cole numa conversa nova do Claude.</p><p class="m-meta">Versão para Claude · 12.666 caracteres</p></div>`;
  }
  if (tipo === 'resposta') {
    return `<div class="mock resp"><p><b>P1 · Busca de referências</b> — vitamina D e fraturas em idosos</p><p class="r-sec">Em 30 segundos</p><p>Suplementar vitamina D não reduziu fraturas: nem na revisão de 81 ensaios [1], nem no VITAL, com 25.871 adultos [2].</p><p class="r-niv">Nível 1</p><p class="r-meta">Bolland et al. · Lancet Diabetes Endocrinol · 2018</p><p class="r-link">https://pubmed.gov/30293909</p></div>`;
  }
  return '';
}

function respostaExemplo() {
  return `<div class="resp-card">
    <p class="r-tit"><b>P1 · Busca de referências</b> — vitamina D e fraturas em idosos</p>
    <p class="r-sec">Em 30 segundos</p>
    <p>Suplementar vitamina D não reduziu fraturas: nem na revisão de 81 ensaios [1], nem no VITAL, com 25.871 adultos não selecionados por deficiência [2].</p>
    <p class="r-sec">Os melhores artigos</p>
    <p class="r-niv">Nível 1</p>
    <p><b>1. Effects of vitamin D supplementation on musculoskeletal health…</b></p>
    <p class="r-meta">Bolland et al. · Lancet Diabetes Endocrinol · 2018 · sem efeito em fratura total (RR 1,00; IC 95% 0,93–1,07)</p>
    <p class="r-link">https://pubmed.gov/30293909</p>
    <p class="r-niv">Nível 2</p>
    <p><b>2. Supplemental Vitamin D and Incident Fractures in Midlife and Older Adults</b></p>
    <p class="r-meta">LeBoff et al. · N Engl J Med · 2022 · sem diferença em fraturas totais (HR 0,98; IC 95% 0,89–1,08)</p>
    <p class="r-link">https://pubmed.gov/35939577</p>
  </div>`;
}

function storyHtml(s, d, i, cfg) {
  const fundo = s.fundo || FUNDO[s.tipo] || 'escuro';
  return `<section class="story fundo-${fundo} tipo-${s.tipo}" data-i="${i}">
    <header class="cab"><span class="logo-p">paper<span>.ai__</span></span><span class="cab-nome">${escapeHtml(d.nome)}</span></header>
    <main class="conteudo">${miolo(s, cfg)}</main>
  </section>`;
}

function capaHtml(d) {
  return `<section class="story capa" data-capa="${d.id}"><div class="capa-circulo">${icone(d.icone, 'ico capa-ico')}</div></section>`;
}

function paginaHtml(corpo) {
  const css = pathToFileURL(path.join(RAIZ, 'templates', 'stories.css')).href;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><link rel="stylesheet" href="${css}"></head><body>${corpo}</body></html>`;
}

// Diminui o texto de cada Story até caber na área segura; devolve o fator usado.
function ajustar() {
  return [...document.querySelectorAll('.story:not(.capa)')].map((st) => {
    const c = st.querySelector('.conteudo');
    let k = 1;
    while (c.scrollHeight > c.clientHeight + 1 && k > 0.6) {
      k = Math.round((k - 0.02) * 100) / 100;
      c.style.setProperty('--k', k);
    }
    return { i: Number(st.dataset.i), k, cabe: c.scrollHeight <= c.clientHeight + 1 };
  });
}

// ---------- guia ----------

function descricao(s) {
  switch (s.tipo) {
    case 'lista': return `Etapa ${GRUPOS[s.grupo][1]}`;
    case 'numero': return `${s.numero} ${String(s.titulo || '').replace(/==|\*\*/g, '')}`;
    case 'pergunta': return s.pergunta;
    case 'resposta': return 'Exemplo de resposta do P1';
    case 'marcas': return 'As marcas da resposta';
    case 'recebe': return 'O que você recebe';
    case 'oferta': return 'Preço';
    case 'garantia': return 'Garantia de 7 dias';
    case 'video': return s.titulo || 'Vídeo';
    default: return String(s.titulo || '').replace(/==|\*\*/g, '');
  }
}

function acaoNoApp(s, cfg) {
  if (s.tipo === 'cta') return `**Sticker de link** no espaço da seta: \`${linkDe(cfg, s)}\``;
  if (s.tipo === 'enquete' || s.tipo === 'caixa') return `**${s.sticker}** no espaço da seta`;
  if (s.tipo === 'video') return 'Vídeo: poste o MP4 como está';
  return '';
}

async function guia(cfg, destaques) {
  const l = [
    '# Stories dos destaques',
    '',
    'Gerado por `npm run stories` a partir de [`stories/destaques.yaml`](../../stories/destaques.yaml). Cada pasta é um destaque: os Stories na ordem (`01.jpg`, `02.jpg`…), um vídeo quando houver, e a capa do destaque (`capa.png`).',
    '',
    '![Prancha com todos os Stories](_prancha.jpg)',
    '',
    '## Como montar os destaques',
    '',
    '1. Poste os Stories de um destaque, **na ordem dos números**, no mesmo dia (um a cada poucos minutos, ou todos de uma vez).',
    '2. Nos Stories com seta, coloque o sticker indicado (link, enquete ou caixa de perguntas) no espaço livre da seta. A seta fica embaixo do sticker.',
    '3. Depois de postar, abra cada Story e toque em **Destaque**, escolhendo o destaque certo (crie com o nome da tabela). Stories somem em 24 horas; nos destaques ficam.',
    '4. Em **Editar destaque → Editar capa**, use a `capa.png` da pasta.',
    '5. Ordene os destaques no perfil nesta ordem: **Comece aqui, Como funciona, Os 11 prompts, Na prática, Dúvidas, Acesso**. O primeiro é o que mais gente abre.',
    '',
    'Boas práticas que os Stories já seguem: uma ideia por Story, texto grande dentro da área segura (longe da barra de cima e do campo de resposta embaixo), gancho no primeiro Story de cada destaque, prova com número e fonte, e um pedido claro no fim com link. As respostas da caixa de perguntas viram Stories novos, que podem entrar no destaque Dúvidas.',
    '',
    `Links: a página de vendas é \`${cfg.pagina}\` e o checkout é \`${cfg.checkout}\`. Todos os links levam \`utm_source=instagram&utm_medium=stories\` e o nome do destaque em \`utm_content\`, para você ver na Kiwify quantas vendas vieram de cada um. Se a página estiver em outro endereço, troque \`pagina\` no YAML e rode \`npm run stories\` de novo. Enquanto a página não estiver na Netlify, dá para usar o link público da prévia (https://claude.ai/artifact/Ba9iDP11JHwLTNgsKbfctN), sem os \`utm\`.`,
    '',
  ];
  destaques.forEach((d, di) => {
    const pasta = `${String(di + 1).padStart(2, '0')}-${d.id}`;
    l.push(`## ${di + 1}. ${d.nome}`, '', `Pasta [\`${pasta}/\`](${pasta}/) · capa \`${pasta}/capa.png\``, '', '| Story | Arquivo | O que diz | O que colocar no app |', '|---|---|---|---|');
    d.stories.forEach((s, i) => {
      const arq = `${String(i + 1).padStart(2, '0')}.${s.tipo === 'video' ? 'mp4' : 'jpg'}`;
      l.push(`| ${i + 1} | [\`${arq}\`](${pasta}/${arq}) | ${descricao(s).replace(/\|/g, '/')} | ${acaoNoApp(s, cfg)} |`);
    });
    l.push('');
  });
  await writeFile(path.join(SAIDA, 'README.md'), l.join('\n'));
}

// ---------- prancha para revisar ----------

async function prancha(browser, destaques) {
  const blocos = destaques.map((d, di) => {
    const pasta = path.join(SAIDA, `${String(di + 1).padStart(2, '0')}-${d.id}`);
    const imgs = d.stories.map((s, i) => {
      const n = String(i + 1).padStart(2, '0');
      const src = s.tipo === 'video' ? pathToFileURL(path.join(RAIZ, path.dirname(s.arquivo), 'capa.jpg')).href : pathToFileURL(path.join(pasta, `${n}.jpg`)).href;
      return `<figure><img src="${src}"><figcaption>${n}${s.tipo === 'video' ? ' · vídeo' : ''}</figcaption></figure>`;
    }).join('');
    return `<div class="linha"><figure class="capa"><img src="${pathToFileURL(path.join(pasta, 'capa.png')).href}"><figcaption>${escapeHtml(d.nome)}</figcaption></figure>${imgs}</div>`;
  }).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    body{margin:0;padding:16px;background:#1b1b1d;color:#ddd;font:14px sans-serif}
    .linha{display:flex;gap:10px;margin-bottom:18px;align-items:flex-start}
    figure{margin:0;width:180px}img{width:180px;height:320px;object-fit:cover;border-radius:10px;display:block}
    .capa img{width:120px;height:120px;border-radius:50%;object-fit:cover;margin:100px 30px 0}
    .capa{width:180px;text-align:center}figcaption{margin-top:6px;text-align:center}
  </style></head><body>${blocos}</body></html>`;
  const arq = path.join(BUILD, 'prancha.html');
  await writeFile(arq, html);
  const p = await browser.newPage({ viewport: { width: 1860, height: 800 } });
  await p.goto(pathToFileURL(arq).href);
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(SAIDA, '_prancha.jpg'), type: 'jpeg', quality: 80, fullPage: true });
  await p.close();
}

// ---------- principal ----------

async function main() {
  const filtros = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const cfg = parseYaml(await readFile(path.join(RAIZ, 'stories', 'destaques.yaml'), 'utf8'));
  const todos = cfg.destaques;
  await mkdir(SAIDA, { recursive: true });
  await mkdir(BUILD, { recursive: true });
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const avisos = [];
  try {
    for (const [di, d] of todos.entries()) {
      if (filtros.length && !filtros.some((f) => d.id.includes(f))) continue;
      const pasta = path.join(SAIDA, `${String(di + 1).padStart(2, '0')}-${d.id}`);
      await rm(pasta, { recursive: true, force: true });
      await mkdir(pasta, { recursive: true });
      const estaticos = d.stories.map((s, i) => [s, i]).filter(([s]) => s.tipo !== 'video');
      const html = paginaHtml(estaticos.map(([s, i]) => storyHtml(s, d, i, cfg)).join('') + capaHtml(d));
      const arq = path.join(BUILD, `${d.id}.html`);
      await writeFile(arq, html);
      const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
      await page.goto(pathToFileURL(arq).href);
      await page.evaluate(() => document.fonts.ready);
      for (const a of await page.evaluate(ajustar)) {
        if (!a.cabe) avisos.push(`${d.id} story ${a.i + 1}: o texto não coube`);
        else if (a.k < 0.85) avisos.push(`${d.id} story ${a.i + 1}: texto reduzido para ${Math.round(a.k * 100)}%`);
      }
      for (const [s, i] of estaticos) {
        const el = await page.$(`.story[data-i="${i}"]`);
        await el.screenshot({ path: path.join(pasta, `${String(i + 1).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 92 });
      }
      await (await page.$('.capa')).screenshot({ path: path.join(pasta, 'capa.png'), type: 'png' });
      await page.close();
      for (const [i, s] of d.stories.entries()) {
        if (s.tipo !== 'video') continue;
        const origem = path.join(RAIZ, s.arquivo);
        if (!existsSync(origem)) throw new Error(`${d.id}: vídeo não encontrado (${s.arquivo}); rode npm run reels antes`);
        await cp(origem, path.join(pasta, `${String(i + 1).padStart(2, '0')}.mp4`));
      }
      console.log(`✓ ${d.nome}: ${d.stories.length} Stories`);
    }
    await guia(cfg, todos);
    await prancha(browser, todos);
  } finally {
    await browser.close();
  }
  avisos.forEach((a) => console.log(`  ⚠ ${a}`));
  console.log('Stories em exports/stories/');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

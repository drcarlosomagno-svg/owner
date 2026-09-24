// Gera os Reels da paper.ai__ (vídeo 9:16, 1080×1920, 30 fps) a partir de reels/roteiros/*.yaml.
//
//   npm run reels            todos os roteiros
//   npm run reels -- 07      só os que têm "07" no nome (aceita vários: -- 07 08)
//
// Cada cena é montada em HTML com o visual da campanha. A animação (palavras entrando,
// números contando, zoom lento na foto, grão de filme) é calculada quadro a quadro,
// capturada com o Playwright e codificada em H.264 pelo ffmpeg. Saída em exports/reels/<id>/:
// reel.mp4, capa.jpg, legenda.txt e roteiro.txt.
//
// Os Reels de demonstração usam mais três tipos de cena: personagem (uma pessoa comum,
// ilustrada, segurando o celular), tela (a Biblioteca no celular, com toques e digitação) e
// chat (a resposta da IA chegando no formato do prompt). Veja reels/README.md.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { escapeHtml, inline, plain } from './lib/markup.mjs';
import { acharFoto, PALETAS } from './lib/campanha.mjs';
import { CENARIOS, cenarioSvg, defsSvg, rostoSvg } from './lib/personagem.mjs';
import { blocosResposta, CATALOGO, celularHtml, textoCampo } from './lib/biblioteca-ui.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PASTA_ROTEIROS = path.join(RAIZ, 'reels', 'roteiros');
const PASTA_FOTOS = path.join(RAIZ, 'campanha', 'fotos');
const PASTA_SAIDA = path.join(RAIZ, 'exports', 'reels');
const PASTA_BUILD = path.join(RAIZ, '.build');
// Cada vídeo é montado aqui e só vai para exports/reels/ depois de pronto,
// para o repositório nunca ficar com um vídeo pela metade.
const PASTA_MONTAGEM = path.join(PASTA_BUILD, 'reels');
const FPS = 30;
const W = 1080;
const H = 1920;
const TIPOS = ['gancho', 'texto', 'foto', 'numero', 'limite', 'cta', 'personagem', 'tela', 'chat'];
const CENARIO_DA_PALETA = { escuro: 'noite', claro: 'dia', vibrante: 'tarde' };
const EXPRESSOES = ['focado', 'cansado', 'preocupado', 'surpreso', 'feliz', 'aliviado'];

function caminhoFfmpeg() {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  try {
    return createRequire(import.meta.url)('@ffmpeg-installer/ffmpeg').path;
  } catch {
    return 'ffmpeg';
  }
}

// ---------- texto ----------

// Separa o texto em palavras (cada uma entra animada), mantendo os trechos ==marcados== juntos.
function cinetico(texto) {
  return String(texto ?? '')
    .trim()
    .split(/(==.+?==)/g)
    .filter(Boolean)
    .map((parte) => {
      const marcada = /^==.+==$/.test(parte);
      const palavras = (marcada ? parte.slice(2, -2) : parte)
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => `<span class="p">${escapeHtml(w)}</span>`)
        .join(' ');
      return marcada ? `<mark>${palavras}</mark>` : palavras;
    })
    .join(' ');
}

const contarPalavras = (...t) => t.filter(Boolean).join(' ').replace(/==/g, '').split(/\s+/).filter(Boolean).length;

// Tempo de tela de cada cena: o suficiente para ler em voz baixa, sem sobrar.
function duracao(c) {
  if (c.duracao) return Number(c.duracao);
  const n = contarPalavras(c.selo, c.titulo, c.texto);
  const faixa = (min, base, porPalavra, max) => Math.min(max, Math.max(min, base + porPalavra * n));
  switch (c.tipo) {
    case 'tela': return c._fim + 1.0;
    case 'chat': return c._inicio + c._blocos * c._ritmo + 1.9;
    case 'personagem': return c.acao === 'apontar' ? faixa(3.6, 2.8, 0.12, 4.4) : faixa(2.6, 2.0, 0.14, 3.6);
    case 'gancho': return faixa(2.2, 2.0, 0.12, 3.0);
    case 'numero': return faixa(2.6, 1.6, 0.2, 4.2);
    case 'limite': return faixa(2.8, 1.2, 0.24, 5.2);
    case 'cta': return faixa(3.2, 2.6, 0.12, 4.2);
    default: return faixa(2.2, 1.0, 0.24, 4.6);
  }
}

// ---------- HTML ----------

function fotoHtml(nome, enquadre = {}) {
  const url = acharFoto(PASTA_FOTOS, nome);
  if (!url) throw new Error(`foto não encontrada: campanha/fotos/${nome}.jpg`);
  const estilo = [
    enquadre.posicao ? `object-position:${enquadre.posicao}` : '',
    enquadre.desfoque ? `--desfoque:${enquadre.desfoque}` : '',
  ].filter(Boolean).join(';');
  // Zoom mínimo para a foto deslocada continuar cobrindo a tela inteira (a foto tem 104% do
  // tamanho do Reel e o zoom lento começa em 1,04).
  const frac = (v) => Math.abs(parseFloat(v || '0') || 0) / 100;
  const zoomMinimo = Math.max(0.9615 + 2 * frac(enquadre.y), 0.9617 + 2 * frac(enquadre.x)) / 1.04;
  const zoom = Math.max(Number(enquadre.zoom || 1), Math.ceil(zoomMinimo * 100) / 100);
  const dados = `data-zoom="${zoom}" data-x="${escapeHtml(enquadre.x || '0%')}" data-y="${escapeHtml(enquadre.y || '0%')}"`;
  return `<div class="foto"><img src="${url}" alt="" ${dados}${estilo ? ` style="${escapeHtml(estilo)}"` : ''}></div><div class="veu"></div>`;
}

// Configuração da animação das cenas de demonstração (lida por reels-demo-runtime.js).
function demoCfg(c) {
  const cfg = { tipo: c.tipo, expr: c.expressao || (c.tipo === 'personagem' ? 'focado' : 'focado'), acao: c.acao };
  if (c.reacao) {
    cfg.reacao = c.reacao;
    cfg.reacaoEm = Number(c.reacao_em ?? (c.tipo === 'chat' ? c._inicio + 0.25 : 1.2));
  }
  if (c.tipo === 'tela') Object.assign(cfg, { passos: c._passos, paginaInicial: c._paginas[0], acao: c.acao || 'digitar' });
  if (c.tipo === 'chat') Object.assign(cfg, { inicio: c._inicio, ritmo: c._ritmo });
  return ` data-demo="${escapeHtml(JSON.stringify(cfg))}"`;
}

function cenaDemoHtml(c, i, r) {
  const selo = c.selo ? `<div class="selo a">${inline(c.selo)}</div>` : '';
  const titulo = c.titulo ? `<h2 class="titulo">${cinetico(c.titulo)}</h2>` : '';
  const texto = c.texto ? `<p class="texto a d">${inline(c.texto)}</p>` : '';
  const cenario = c.cenario || r.cenario;
  if (c.tipo === 'personagem') {
    const acoes = { salvar: 'Salve', enviar: 'Envie', seguir: 'Siga' };
    const barra = c.destaque
      ? `<div class="acoes a d">${Object.entries(acoes).map(([k, v]) => `<span class="${k === c.destaque ? 'ativa' : ''}">${v}</span>`).join('')}</div>`
      : '';
    const ilustracao = cenarioSvg({ cenario, relogio: c.relogio || r.relogio, pessoa: r.pessoa, pose: c.acao === 'apontar' ? 'apontar' : 'segurar' });
    const marca = c.marca ? '<div class="logo-marca a">paper<span>.ai__</span></div>' : '';
    return `<section class="cena tipo-personagem" data-i="${i}"${demoCfg(c)}>${ilustracao}<div class="grao"></div><main class="conteudo">${marca}${selo}${titulo}${texto}${barra}</main></section>`;
  }
  const hora = c.hora || r.hora;
  const celular = c.tipo === 'chat'
    ? celularHtml({ chat: { colado: c.colado, resposta: c.resposta }, tema: c.tema || r.tema, hora })
    : celularHtml({ paginas: c._paginas, valores: c._valores, ia: c.ia || r.ia, tema: c.tema || r.tema, hora });
  return `<section class="cena tipo-${c.tipo}" data-i="${i}"${demoCfg(c)}><div class="luz"></div>${celular}`
    + `<div class="rosto">${rostoSvg({ cenario, pessoa: r.pessoa })}</div><div class="toque"></div><div class="toque-onda"></div>`
    + `<div class="grao"></div><main class="conteudo">${selo}${titulo}</main></section>`;
}

function cenaHtml(c, i, r) {
  if (['personagem', 'tela', 'chat'].includes(c.tipo)) return cenaDemoHtml(c, i, r);
  const temFoto = c.tipo === 'gancho' || c.tipo === 'foto';
  const fundo = temFoto ? fotoHtml(c.foto || r.foto, c.enquadre || (c.tipo === 'gancho' ? r.enquadre : undefined)) : '<div class="luz"></div>';
  const selo = c.selo ? `<div class="selo a">${inline(c.selo)}</div>` : '';
  const titulo = c.titulo ? `<h2 class="titulo">${cinetico(c.titulo)}</h2>` : '';
  const texto = c.texto ? `<p class="texto a d">${inline(c.texto)}</p>` : '';
  const fonte = c.fonte ? `<p class="fonte a d">${inline(c.fonte)}</p>` : '';
  let miolo;
  switch (c.tipo) {
    case 'numero':
      miolo = `${selo}<div class="numero a" data-numero="${escapeHtml(c.numero)}">${escapeHtml(c.numero)}</div>${titulo}${texto}${fonte}`;
      break;
    case 'limite':
      miolo = `<div class="rotulo a">${escapeHtml(c.rotulo || 'O que não dá para dizer')}</div>${titulo}${texto}${fonte}`;
      break;
    case 'cta': {
      const acoes = { salvar: 'Salve', enviar: 'Envie', seguir: 'Siga' };
      const barra = Object.entries(acoes)
        .map(([k, v]) => `<span class="${k === (c.destaque || 'enviar') ? 'ativa' : ''}">${v}</span>`)
        .join('');
      miolo = `${selo}${titulo}${texto}<div class="acoes a d">${barra}</div>${fonte}`;
      break;
    }
    default:
      miolo = `${selo}${titulo}${texto}${fonte}`;
  }
  return `<section class="cena tipo-${c.tipo}" data-i="${i}">${fundo}<div class="grao"></div><main class="conteudo">${miolo}</main></section>`;
}

function paginaHtml(r) {
  const css = pathToFileURL(path.join(RAIZ, 'templates', 'reels.css')).href;
  const demo = r.cenas.some((c) => ['personagem', 'tela', 'chat'].includes(c.tipo));
  const cssDemo = demo ? `\n<link rel="stylesheet" href="${pathToFileURL(path.join(RAIZ, 'templates', 'reels-demo.css')).href}">` : '';
  const jsDemo = demo ? `\n<script src="${pathToFileURL(path.join(RAIZ, 'scripts', 'lib', 'reels-demo-runtime.js')).href}"></script>` : '';
  const segmentos = r.cenas.map(() => '<span><i></i></span>').join('');
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>${escapeHtml(r.titulo)}</title>
<link rel="stylesheet" href="${css}">${cssDemo}${jsDemo}</head>
<body>${demo ? defsSvg() : ''}<div class="reel c-${r.paleta}">
${r.cenas.map((c, i) => cenaHtml(c, i, r)).join('\n')}
<div class="topo"><div class="barra">${segmentos}</div><div class="assinatura"><span class="marca-circulo">p</span>@paper.ai__</div></div>
</div></body></html>`;
}

// ---------- animação (roda dentro da página) ----------

function prepararPagina(tempos) {
  const cenas = [...document.querySelectorAll('.cena')];
  const barras = [...document.querySelectorAll('.barra i')];
  const grao = [...document.querySelectorAll('.grao')];
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const saida = (p) => 1 - Math.pow(1 - p, 3);
  const expo = (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));

  // Ajusta o texto de cada cena para caber na área segura, em três passos: o título encolhe
  // só o necessário para a palavra mais longa caber na largura, o número grande também, e só
  // então, se a cena ainda passar da altura, tudo diminui junto.
  const ajustes = cenas.map((cena) => {
    cena.classList.add('ativa');
    const conteudo = cena.querySelector('.conteudo');
    const limite = () => conteudo.getBoundingClientRect().right + 2;
    const cabeLargura = (sel) => [...conteudo.querySelectorAll(sel)].every((e) => e.getBoundingClientRect().right <= limite());
    const cabeAltura = () => {
      const r = conteudo.getBoundingClientRect();
      const filhos = [...conteudo.children].map((e) => e.getBoundingClientRect());
      return Math.max(...filhos.map((b) => b.bottom)) - Math.min(...filhos.map((b) => b.top)) <= r.height + 1;
    };
    const reduzir = (variavel, cabe, minimo) => {
      let v = 1;
      while (!cabe() && v > minimo) {
        v = Math.round((v - 0.02) * 100) / 100;
        conteudo.style.setProperty(variavel, v);
      }
      return v;
    };
    // Palavra longa que não cabe na largura: o título inteiro diminui um pouco (raiz da
    // proporção) e só a palavra diminui o resto, para não ficar desproporcional.
    const largura = conteudo.getBoundingClientRect().width;
    const palavrasTitulo = [...conteudo.querySelectorAll('.titulo .p')];
    const menor = Math.min(1, ...palavrasTitulo.map((p) => largura / p.getBoundingClientRect().width));
    if (menor < 1) conteudo.style.setProperty('--kt', Math.max(0.62, Math.round(Math.sqrt(menor) * 100) / 100));
    for (const p of palavrasTitulo) {
      const w = p.getBoundingClientRect().width;
      if (w > largura) p.style.fontSize = `${Math.floor((largura / w) * 98) / 100}em`;
    }
    const kt = reduzir('--kt', () => cabeLargura('.titulo .p'), 0.45) * (Number(conteudo.style.getPropertyValue('--kt')) || 1);
    const kn = reduzir('--kn', () => cabeLargura('.numero'), 0.45);
    const k = reduzir('--k', () => cabeAltura() && cabeLargura('.p, .numero, .selo, .acoes, .logo-marca'), 0.55);
    const cabe = cabeAltura() && cabeLargura('.p, .numero, .selo, .acoes, .logo-marca');
    cena.classList.remove('ativa');
    return { k, kt, kn, cabe };
  });

  // Ordem de entrada: selo, palavras do título uma a uma, depois o resto.
  const roteiro = cenas.map((cena) => {
    const itens = [];
    let t = 0.05;
    for (const el of cena.querySelectorAll('.selo.a, .rotulo.a, .numero.a, .logo-marca.a')) itens.push({ el, t0: el.classList.contains('numero') ? 0.12 : 0 });
    const palavras = [...cena.querySelectorAll('.titulo .p')];
    palavras.forEach((el, j) => itens.push({ el, t0: 0.12 + j * 0.06 }));
    // A tarja do destaque entra junto com a primeira palavra marcada.
    for (const mark of cena.querySelectorAll('.titulo mark')) {
      const j = palavras.indexOf(mark.querySelector('.p'));
      itens.push({ el: mark, t0: 0.12 + Math.max(0, j) * 0.06, soOpacidade: true });
    }
    t = 0.12 + palavras.length * 0.06 + 0.12;
    for (const el of cena.querySelectorAll('.d')) {
      itens.push({ el, t0: t });
      t += 0.18;
    }
    const numero = cena.querySelector('[data-numero]');
    let contar = null;
    if (numero) {
      const m = numero.dataset.numero.match(/^([+\-−]?)(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d+))?(\D*)$/);
      if (m) contar = { el: numero, sinal: m[1], alvo: Number(m[2].replace(/\./g, '') + (m[3] ? '.' + m[3] : '')), casas: m[3] ? m[3].length : 0, resto: m[4] };
    }
    return { itens, contar, img: cena.querySelector('.foto img'), luz: cena.querySelector('.luz'), conteudo: cena.querySelector('.conteudo') };
  });

  const formatar = (v, casas) => v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
  // Cenas de demonstração: personagem, tela do celular e conversa (scripts/lib/reels-demo-runtime.js).
  const demo = window.__demo ? window.__demo.preparar(cenas, tempos) : [];

  window.__quadro = (t, quadro) => {
    cenas.forEach((cena, i) => {
      const { ini, fim } = tempos[i];
      const ativa = t >= ini && (t < fim || i === cenas.length - 1);
      cena.classList.toggle('ativa', ativa);
      barras[i].style.width = `${clamp((t - ini) / (fim - ini)) * 100}%`;
      if (!ativa) return;
      const lt = t - ini;
      const dur = fim - ini;
      const r = roteiro[i];
      // Corte com um leve "soco" de escala na entrada da cena.
      const soco = saida(clamp(lt / 0.3));
      r.conteudo.style.transform = `scale(${1 + 0.04 * (1 - soco)})`;
      if (r.img) {
        const z = Number(r.img.dataset.zoom) * (i % 2 ? 1.12 - 0.08 * (lt / dur) : 1.04 + 0.08 * (lt / dur));
        r.img.style.transform = `translate(${r.img.dataset.x},${r.img.dataset.y}) scale(${z})`;
      }
      if (r.luz) {
        const lado = i % 2 ? -1 : 1;
        r.luz.style.transform = `translate(${lado * (-160 + 320 * (lt / dur))}px, ${-90 + 180 * (lt / dur)}px)`;
      }
      for (const { el, t0, soOpacidade } of r.itens) {
        const p = saida(clamp((lt - t0) / 0.34));
        el.style.opacity = p;
        if (!soOpacidade) el.style.transform = `translateY(${(1 - p) * 34}px)`;
      }
      if (r.contar) {
        const p = expo(clamp((lt - 0.12) / 1.2));
        r.contar.el.textContent = `${r.contar.sinal}${formatar(r.contar.alvo * p, r.contar.casas)}${r.contar.resto}`;
      }
      if (demo[i]) demo[i](lt);
    });
    // Grão de filme que muda a cada quadro, como película.
    const a = Math.sin(quadro * 12.9898) * 43758.5453;
    const b = Math.sin(quadro * 78.233) * 12543.1234;
    const dx = Math.round((a - Math.floor(a)) * 120 - 60);
    const dy = Math.round((b - Math.floor(b)) * 120 - 60);
    grao.forEach((g) => (g.style.transform = `translate(${dx}px,${dy}px)`));
  };
  return ajustes;
}

// ---------- vídeo ----------

function abrirFfmpeg(saida, segundos) {
  const args = [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-f', 'lavfi', '-t', String(segundos), '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(FPS),
    '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', saida,
  ];
  const proc = spawn(caminhoFfmpeg(), args, { stdio: ['pipe', 'inherit', 'inherit'] });
  const fim = new Promise((ok, erro) => proc.on('close', (code) => (code === 0 ? ok() : erro(new Error(`ffmpeg saiu com código ${code}`)))));
  return { entrada: proc.stdin, fim };
}

const escrever = (stream, dados) => new Promise((ok) => (stream.write(dados) ? ok() : stream.once('drain', ok)));

// ---------- roteiro ----------

// Transforma os passos de uma cena de tela (tocar, digitar, colar, rolar, ir, esperar) numa
// linha do tempo, resolvendo em que página e em que campo cada passo acontece.
function prepararPassos(c, i) {
  const erro = (m) => new Error(`cena ${i + 1}: ${m}`);
  let t = Number(c.inicio ?? 0.55);
  let pagina = String(c.pagina || 'inicio');
  const paginas = [pagina];
  const valores = structuredClone(c.valores || {});
  let campo = null;
  let digitadoNaPergunta = null;
  const passos = [];
  for (const bruto of c.passos || []) {
    const [acao, arg] = Object.entries(bruto)[0] || [];
    const s = { acao, t0: Math.round(t * 1000) / 1000, pagina };
    switch (acao) {
      case 'tocar':
        s.alvo = String(arg);
        if (/^(pergunta|campo-)/.test(s.alvo)) campo = s.campo = s.alvo;
        s.t1 = t + 0.55;
        break;
      case 'digitar':
        if (!campo) throw erro('"digitar" precisa de um "tocar" num campo antes');
        s.campo = campo;
        s.texto = String(arg);
        s.t1 = t + Math.min(2.8, 0.3 + s.texto.length * 0.048);
        if (campo === 'pergunta') digitadoNaPergunta = s.texto;
        break;
      case 'colar':
        if (!campo) throw erro('"colar" precisa de um "tocar" num campo antes');
        s.alvo = s.campo = campo;
        s.html = textoCampo(arg);
        s.t1 = t + 1.0;
        break;
      case 'rolar':
        s.alvo = String(arg);
        s.t1 = t + 0.75;
        break;
      case 'ir':
        s.pagina = pagina = String(arg);
        if (pagina !== 'inicio' && !CATALOGO.prompts.some((p) => p.id === pagina)) throw erro(`página "${pagina}" não existe (inicio ou P1–P11)`);
        paginas.push(pagina);
        campo = null;
        // O tema escrito no início chega preenchido na página do prompt, como no produto.
        if (digitadoNaPergunta) valores[pagina] = { TEMA: digitadoNaPergunta, ...(valores[pagina] || {}) };
        s.t1 = t + 0.5;
        break;
      case 'esperar':
        s.t1 = t + Number(arg);
        break;
      default:
        throw erro(`passo "${acao}" não existe (tocar, digitar, colar, rolar, ir, esperar)`);
    }
    passos.push(s);
    t = s.t1 + 0.08;
  }
  c._passos = passos;
  c._paginas = [...new Set(paginas)];
  c._valores = valores;
  c._fim = t;
}

async function lerRoteiro(arquivo) {
  const id = arquivo.replace(/\.ya?ml$/, '');
  const r = parseYaml(await readFile(path.join(PASTA_ROTEIROS, arquivo), 'utf8'));
  r.id = id;
  const erros = [];
  if (!PALETAS.includes(r.paleta)) erros.push(`paleta "${r.paleta}" inválida (${PALETAS.join(', ')})`);
  r.cenario = r.cenario || CENARIO_DA_PALETA[r.paleta];
  if (!CENARIOS.includes(r.cenario)) erros.push(`cenário "${r.cenario}" inválido (${CENARIOS.join(', ')})`);
  r.relogio = r.relogio || '23:14';
  r.hora = r.hora || r.relogio;
  r.tema = r.tema || 'claro';
  r.ia = r.ia || 'claude';
  if (!Array.isArray(r.cenas) || r.cenas.length < 3) erros.push('precisa de pelo menos 3 cenas');
  (r.cenas || []).forEach((c, i) => {
    if (!TIPOS.includes(c.tipo)) erros.push(`cena ${i + 1}: tipo "${c.tipo}" não existe (${TIPOS.join(', ')})`);
    if (c.tipo === 'numero' && !c.numero) erros.push(`cena ${i + 1}: falta o número`);
    for (const e of [c.expressao, c.reacao].filter(Boolean)) {
      if (!EXPRESSOES.includes(e)) erros.push(`cena ${i + 1}: expressão "${e}" não existe (${EXPRESSOES.join(', ')})`);
    }
    try {
      if (c.tipo === 'tela') prepararPassos(c, i);
    } catch (e) {
      erros.push(e.message);
    }
    if (c.tipo === 'chat') {
      if (!c.resposta) erros.push(`cena ${i + 1}: a conversa precisa de "resposta"`);
      c._inicio = Number(c.inicio ?? 1.3);
      c._ritmo = Number(c.ritmo ?? 0.3);
      c._blocos = blocosResposta(c.resposta).length;
    }
  });
  if (!['gancho', 'personagem'].includes(r.cenas?.[0]?.tipo)) erros.push('a primeira cena precisa ser o gancho (ou um personagem)');
  if ((r.hashtags || []).length > 5) erros.push(`${r.hashtags.length} hashtags (máximo 5)`);
  if (erros.length) throw new Error(`${arquivo}: ${erros.join('; ')}`);
  let t = 0;
  r.tempos = r.cenas.map((c) => {
    const ini = t;
    t += duracao(c);
    return { ini, fim: t };
  });
  r.segundos = Math.round(t * 10) / 10;
  return r;
}

// Resumo do que acontece no celular, para o roteiro.txt.
function resumoTela(c) {
  if (c.tipo === 'chat') {
    const primeira = String(c.resposta).split('\n').find((l) => l.trim()) || '';
    return `[conversa com a IA: ${plain(primeira.replace(/\*\*/g, ''))} …]`;
  }
  if (c.tipo !== 'tela') return '';
  const nomes = { tocar: 'toca', digitar: 'digita', colar: 'cola o texto', rolar: 'rola até', ir: 'abre', esperar: '' };
  const botoes = { pergunta: 'o campo do tema', criar: '"Criar prompt"', abrir: '"Copiar e abrir"', copiar: '"Copiar prompt"', ajustes: '"Ajustar opções"', tema: 'o tema escuro' };
  const legivel = (s) => {
    if (botoes[s.alvo]) return botoes[s.alvo];
    const chave = String(s.alvo || '').replace(/^campo-/, '');
    const rotulo = CATALOGO.prompts.find((p) => p.id === s.pagina)?.campos.find((x) => x.chave === chave)?.rotulo;
    return rotulo ? `o campo ${rotulo}` : s.alvo;
  };
  const passo = (s) => {
    if (s.acao === 'digitar') return `digita "${s.texto}"`;
    if (s.acao === 'ir') return `abre ${s.pagina === 'inicio' ? 'o início' : s.pagina}`;
    if (s.acao === 'colar' || s.acao === 'esperar') return nomes[s.acao];
    return `${nomes[s.acao]} ${legivel(s)}`;
  };
  return `[celular: ${c._passos.map(passo).filter(Boolean).join(', ')}]`;
}

function textoNaTela(r) {
  return r.cenas
    .map((c, i) => [`${i + 1}.`, c.selo, c.tipo === 'limite' ? c.rotulo || 'O que não dá para dizer' : '', c.numero, c.titulo, c.texto, c.fonte, resumoTela(c)]
      .filter(Boolean).map((v) => plain(String(v))).join(' · '))
    .join('\n');
}

// Prévia: alguns quadros de cada cena numa prancha, sem gerar o vídeo (npm run reels -- 07 --previa).
async function previa(page, r) {
  const pasta = path.join(PASTA_BUILD, 'previa');
  await mkdir(pasta, { recursive: true });
  const quadros = [];
  // --quadros=1.2,5.5 salva esses instantes em tamanho real, além da prancha.
  const pedidos = (process.argv.find((a) => a.startsWith('--quadros=')) || '').slice(10).split(',').filter(Boolean).map(Number);
  for (const t of pedidos) {
    await page.evaluate(([tt]) => window.__quadro(tt, Math.round(tt * 30)), [t]);
    await page.screenshot({ path: path.join(pasta, `${r.id}-${t.toFixed(1)}s.jpg`), type: 'jpeg', quality: 88 });
  }
  for (const [i, { ini, fim }] of r.tempos.entries()) {
    for (const f of r.cenas[i].tipo === 'chat' || r.cenas[i].tipo === 'tela' ? [0.2, 0.45, 0.7, 0.97] : [0.3, 0.97]) {
      const t = ini + (fim - ini) * f;
      await page.evaluate(([tt]) => window.__quadro(tt, Math.round(tt * 30)), [t]);
      quadros.push({ rotulo: `cena ${i + 1} · ${t.toFixed(1)} s`, img: (await page.screenshot({ type: 'jpeg', quality: 80 })).toString('base64') });
    }
  }
  const html = `<!doctype html><body style="margin:0;background:#222;font:14px sans-serif;color:#ddd;display:grid;grid-template-columns:repeat(6,270px);gap:8px;padding:8px;width:${6 * 278 + 8}px">`
    + quadros.map((q) => `<figure style="margin:0"><img src="data:image/jpeg;base64,${q.img}" width="270" height="480"><figcaption>${q.rotulo}</figcaption></figure>`).join('') + '</body>';
  const folha = await page.context().browser().newPage({ viewport: { width: 6 * 278 + 16, height: 600 } });
  await folha.setContent(html);
  await folha.screenshot({ path: path.join(pasta, `${r.id}.jpg`), type: 'jpeg', quality: 85, fullPage: true });
  await folha.close();
  return path.join(pasta, `${r.id}.jpg`);
}

async function gerar(browser, arquivo, { soPrevia = false } = {}) {
  const r = await lerRoteiro(arquivo);
  const saida = path.join(PASTA_MONTAGEM, r.id);
  await rm(saida, { recursive: true, force: true });
  await mkdir(saida, { recursive: true });
  await mkdir(PASTA_BUILD, { recursive: true });
  const htmlPath = path.join(PASTA_BUILD, `reel-${r.id}.html`);
  await writeFile(htmlPath, paginaHtml(r));

  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href);
  await page.evaluate(() => Promise.all([document.fonts.ready, ...[...document.images].map((i) => i.decode().catch(() => {}))]));
  const ajustes = await page.evaluate(prepararPagina, r.tempos);
  const avisos = [];
  ajustes.forEach(({ k, kt, cabe }, i) => {
    if (!cabe) avisos.push(`cena ${i + 1}: o texto NÃO coube; corte texto`);
    else if (k < 0.85) avisos.push(`cena ${i + 1}: texto demais, tudo reduzido para ${Math.round(k * 100)}%; corte palavras`);
    if (kt < 0.6) avisos.push(`cena ${i + 1}: palavra longa deixou o título em ${Math.round(kt * 100)}%`);
  });

  // Capa: o gancho já completo, sem a barra de progresso.
  const g = r.tempos[0];
  await page.evaluate(([t]) => {
    window.__quadro(t, 0);
    document.querySelector('.barra').style.visibility = 'hidden';
  }, [g.fim - 0.05]);
  await writeFile(path.join(saida, 'capa.jpg'), await page.screenshot({ type: 'jpeg', quality: 92 }));
  await page.evaluate(() => (document.querySelector('.barra').style.visibility = 'visible'));
  if (soPrevia) {
    const arquivoPrevia = await previa(page, r);
    await page.close();
    return { r, avisos, arquivoPrevia };
  }

  const total = Math.round(r.segundos * FPS);
  const video = abrirFfmpeg(path.join(saida, 'reel.mp4'), r.segundos);
  for (let q = 0; q < total; q++) {
    await page.evaluate(([t, quadro]) => window.__quadro(t, quadro), [q / FPS, q]);
    await escrever(video.entrada, await page.screenshot({ type: 'jpeg', quality: 90 }));
  }
  video.entrada.end();
  await video.fim;
  await page.close();

  const hashtags = (r.hashtags || []).map((h) => `#${h}`).join(' ');
  await writeFile(path.join(saida, 'legenda.txt'), `${String(r.legenda || '').trim()}\n\n${hashtags}\n`);
  await writeFile(path.join(saida, 'roteiro.txt'), `${r.titulo}\n\n${textoNaTela(r)}\n`);
  await writeFile(
    path.join(saida, 'meta.json'),
    JSON.stringify({ id: r.id, titulo: r.titulo, paleta: r.paleta, carrossel: r.carrossel, produto: r.produto, estudo: r.estudo, publicar: r.publicar, segundos: r.segundos, cenas: r.cenas.length }, null, 2) + '\n',
  );
  return { r, avisos };
}

async function galeria() {
  const pastas = (await readdir(PASTA_SAIDA, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  const metas = [];
  for (const p of pastas) {
    const f = path.join(PASTA_SAIDA, p, 'meta.json');
    if (existsSync(f)) metas.push(JSON.parse(await readFile(f, 'utf8')));
  }
  const linhas = [
    '# Reels',
    '',
    'Gerado por `npm run reels`. Vídeo vertical 9:16 (1080×1920), 30 fps, H.264, com faixa de áudio em silêncio.',
    '',
    'Cada pasta tem o vídeo (`reel.mp4`), a capa (`capa.jpg`), a legenda pronta para colar (`legenda.txt`) e o texto que aparece na tela (`roteiro.txt`).',
    '',
    '**Antes de publicar, escolha um áudio em alta no próprio Instagram** (instrumental, volume baixo). O vídeo sai sem música de propósito: música com direitos só pode entrar pela biblioteca do app.',
    '',
    '| Reel | Duração | Ligado a | Estudo | Quando postar |',
    '|---|---|---|---|---|',
    ...metas.map((m) => {
      const ligado = [m.produto ? `${m.produto} (demonstração)` : '', m.carrossel ? `[${m.carrossel}](../campanha/${m.carrossel}/)` : ''].filter(Boolean).join(' · ') || '—';
      return `| [${m.titulo}](#${m.id}) | ${m.segundos} s | ${ligado} | ${m.estudo || ''} | ${m.publicar || ''} |`;
    }),
    '',
  ];
  for (const m of metas) {
    linhas.push(`<a id="${m.id}"></a>`, `## ${m.titulo}`, '', `**${m.paleta}** · ${m.segundos} s · ${m.cenas} cenas · ${m.publicar || ''} · [vídeo](${m.id}/reel.mp4) · [legenda](${m.id}/legenda.txt) · [texto na tela](${m.id}/roteiro.txt)`, '', `<img src="${m.id}/capa.jpg" width="270" alt="Capa: ${escapeHtml(m.titulo)}">`, '');
  }
  await writeFile(path.join(PASTA_SAIDA, 'README.md'), linhas.join('\n'));
}

async function main() {
  // Filtros: um ou mais trechos do nome (npm run reels -- 08 10 11).
  const filtros = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const soPrevia = process.argv.includes('--previa');
  if (process.argv.includes('--galeria')) return galeria(); // só refaz exports/reels/README.md
  const arquivos = (await readdir(PASTA_ROTEIROS))
    .filter((f) => /\.ya?ml$/.test(f) && !f.startsWith('_') && (!filtros.length || filtros.some((t) => f.includes(t))))
    .sort();
  if (!arquivos.length) throw new Error('nenhum roteiro encontrado');
  await mkdir(PASTA_SAIDA, { recursive: true });
  let falhas = 0;
  for (const arquivo of arquivos) {
    const inicio = Date.now();
    // Um navegador por Reel: se um cair, os outros seguem.
    const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
    try {
      const { r, avisos, arquivoPrevia } = await gerar(browser, arquivo, { soPrevia });
      if (soPrevia) {
        console.log(`✓ prévia de ${r.id} (${r.segundos} s): ${path.relative(RAIZ, arquivoPrevia)}`);
        avisos.forEach((a) => console.log(`    - ${a}`));
        continue;
      }
      // O vídeo só entra em exports/reels/ depois de pronto.
      await rm(path.join(PASTA_SAIDA, r.id), { recursive: true, force: true });
      await cp(path.join(PASTA_MONTAGEM, r.id), path.join(PASTA_SAIDA, r.id), { recursive: true });
      await galeria();
      console.log(`✓ ${r.id}  (${r.segundos} s, ${r.cenas.length} cenas, ${Math.round((Date.now() - inicio) / 1000)} s para gerar)${avisos.length ? `  ⚠ ${avisos.length} aviso(s)` : ''}`);
      avisos.forEach((a) => console.log(`    - ${a}`));
    } catch (e) {
      falhas++;
      console.error(`✗ ${arquivo}: ${e.message}`);
    } finally {
      await browser.close().catch(() => {});
    }
  }
  if (soPrevia) return;
  await galeria();
  console.log('Vídeos em exports/reels/');
  if (falhas) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

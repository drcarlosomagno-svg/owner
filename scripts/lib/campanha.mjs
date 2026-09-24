// Slides da campanha de crescimento: foto de fundo, título condensado em caixa alta,
// selo com o estudo e barra de progresso, no estilo dos posts virais da @paper.ai__.
// Três paletas, escolhidas pelo tom do conteúdo: escuro (denso, tenso),
// vibrante (impacto) e claro (leve).
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { blocks, escapeHtml, inline, plain } from './markup.mjs';

export const PALETAS = ['escuro', 'vibrante', 'claro'];
const EXTENSOES = ['.jpg', '.jpeg', '.png', '.webp'];

// Procura a foto em campanha/fotos/<nome>.<ext>. Sem foto, usa um fundo
// provisório na paleta e marca o slide como "foto pendente".
export function acharFoto(pastaFotos, nome) {
  for (const ext of EXTENSOES) {
    const f = path.join(pastaFotos, `${nome}${ext}`);
    if (existsSync(f)) return pathToFileURL(f).href;
  }
  return null;
}

// Enquadramento opcional da foto, no slide: enquadre: { posicao: "60% 40%", zoom: 1.3, x: "0%", y: "-10%", desfoque: "6px", inteira: true }.
// inteira mostra a foto toda, sem cortar (bom para foto horizontal com a cena inteira).
// posicao escolhe o recorte (object-position); zoom e x/y aproximam e deslocam a foto
// (percentuais do tamanho do slide). O que sobra na borda cai no véu da paleta.
function estiloEnquadre(e) {
  if (!e) return '';
  const regras = [];
  if (e.inteira) regras.push('object-fit:contain');
  if (e.inteira || e.esmaecer) {
    // Quando a foto não cobre o slide até embaixo, a borda de baixo some num degradê.
    const [de, ate] = (e.esmaecer || '60% 75%').split(' ');
    const mascara = `linear-gradient(to bottom,#000 ${de},transparent ${ate})`;
    regras.push(`-webkit-mask-image:${mascara}`, `mask-image:${mascara}`);
  }
  if (e.posicao) regras.push(`object-position:${e.posicao}`);
  const mover = e.x || e.y ? `translate(${e.x || '0%'},${e.y || '0%'})` : '';
  const zoom = e.zoom && e.zoom !== 1 ? `scale(${Number(e.zoom)})` : '';
  if (mover || zoom) regras.push(`transform:${[mover, zoom].filter(Boolean).join(' ')}`);
  if (e.desfoque) regras.push(`--desfoque:${e.desfoque}`);
  return regras.length ? ` style="${escapeHtml(regras.join(';'))}"` : '';
}

const fundoFoto = (url, nome, enquadre) =>
  url
    ? `<div class="foto"><img src="${url}" alt=""${estiloEnquadre(enquadre)}></div><div class="veu"></div>`
    : `<div class="foto provisoria"></div><div class="veu"></div><div class="pendente">foto pendente · campanha/fotos/${escapeHtml(nome)}.jpg</div>`;

const selo = (t) => (t ? `<div class="selo">${inline(t)}</div>` : '');
const assinatura = '<div class="assinatura"><span class="marca-circulo">p</span>@paper.ai__</div>';

function progresso(i, total) {
  const pct = ((i + 1) / total) * 100;
  return `<div class="progresso"><span style="width:${pct.toFixed(2)}%"></span></div>`;
}

const TIPOS = {
  capa: (s) => `
    ${assinatura}
    ${selo(s.selo)}
    <h1 class="manchete">${inline(s.titulo)}</h1>
    ${s.subtitulo ? `<p class="sub">${inline(s.subtitulo)}</p>` : ''}
    ${s.chamada ? `<div class="chamada">${inline(s.chamada)}</div>` : ''}`,

  texto: (s) => `
    ${selo(s.selo)}
    ${s.titulo ? `<h2 class="titulo">${inline(s.titulo)}</h2>` : ''}
    ${s.texto ? `<div class="texto">${blocks(s.texto)}</div>` : ''}
    ${s.nota ? `<p class="nota">${inline(s.nota)}</p>` : ''}`,

  foto: (s) => `
    ${selo(s.selo)}
    ${s.titulo ? `<h2 class="titulo">${inline(s.titulo)}</h2>` : ''}
    ${s.texto ? `<div class="texto">${blocks(s.texto)}</div>` : ''}`,

  frase: (s) => `
    ${selo(s.selo)}
    <p class="frase">${inline(s.frase)}</p>
    ${s.texto ? `<div class="texto">${blocks(s.texto)}</div>` : ''}`,

  numero: (s) => `
    ${selo(s.selo)}
    <div class="numero">${escapeHtml(s.numero)}</div>
    ${s.titulo ? `<h2 class="titulo">${inline(s.titulo)}</h2>` : ''}
    ${s.texto ? `<div class="texto">${blocks(s.texto)}</div>` : ''}
    ${s.fonte ? `<p class="fonte">${inline(s.fonte)}</p>` : ''}`,

  estudo: (s) => {
    const linhas = [
      ['O estudo', s.revista],
      ['Quem', s.quem],
      ['O que achou', s.achou],
      ['O que não dá para dizer', s.limite],
    ]
      .filter(([, v]) => v)
      .map(([k, v]) => `<div class="linha"><dt>${k}</dt><dd>${inline(v)}</dd></div>`)
      .join('');
    return `${selo(s.selo || 'Os dados')}${s.titulo ? `<h2 class="titulo">${inline(s.titulo)}</h2>` : ''}<dl class="ficha">${linhas}</dl>${s.doi ? `<p class="fonte">DOI ${escapeHtml(s.doi)}</p>` : ''}`;
  },

  lista: (s) => {
    const itens = (s.itens || [])
      .map((it, i) => {
        const item = typeof it === 'string' ? { t: it } : it;
        return `<li><span class="n">${String(i + 1).padStart(2, '0')}</span><div><b>${inline(item.t)}</b>${item.d ? `<span>${inline(item.d)}</span>` : ''}</div></li>`;
      })
      .join('');
    return `${selo(s.selo)}${s.titulo ? `<h2 class="titulo">${inline(s.titulo)}</h2>` : ''}<ol class="lista">${itens}</ol>${s.nota ? `<p class="nota">${inline(s.nota)}</p>` : ''}`;
  },

  cta: (s) => {
    const acoes = { salvar: 'Salve', enviar: 'Envie', seguir: 'Siga' };
    const barra = Object.entries(acoes)
      .map(([k, v]) => `<span class="${k === (s.destaque || 'enviar') ? 'ativa' : ''}">${v}</span>`)
      .join('');
    return `
      ${selo(s.selo)}
      <h2 class="titulo grande">${inline(s.titulo)}</h2>
      ${s.texto ? `<div class="texto">${blocks(s.texto)}</div>` : ''}
      <div class="acoes">${barra}</div>
      <div class="bastidor">${inline(s.bastidor || 'Estudo encontrado e conferido com os prompts da **Biblioteca paper.ai__**. Link na bio.')}</div>
      ${s.fonte ? `<p class="fonte">${inline(s.fonte)}</p>` : ''}`;
  },
};

export const TIPOS_CAMPANHA = Object.keys(TIPOS);

// Monta a <section> inteira de um slide da campanha.
export function slideCampanha(s, i, total, { id, paleta, pastaFotos, W, H }) {
  const tema = s.paleta || paleta;
  const temFoto = s.tipo === 'capa' || s.tipo === 'foto';
  const nomeFoto = s.tipo === 'capa' ? id : `${id}-${s.foto || i + 1}`;
  const fundo = temFoto ? fundoFoto(acharFoto(pastaFotos, nomeFoto), nomeFoto, s.enquadre) : '';
  const pag = `<div class="pag">${String(i + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}</div>`;
  const rodape = s.tipo === 'capa' ? '' : `<div class="rodape"><span>@paper.ai__</span>${i < total - 1 ? '<span>arraste</span>' : '<span>paper.ai__</span>'}</div>`;
  return `
<section class="slide c-${tema} tipo-${s.tipo}${temFoto ? ' com-foto' : ''}" style="--w:${W}px;--h:${H}px">
  ${fundo}
  <div class="grao"></div>
  ${s.tipo === 'capa' ? '' : pag}
  <main class="corpo">${TIPOS[s.tipo](s)}</main>
  ${rodape}
  ${progresso(i, total)}
</section>`;
}

export function altCampanha(s, i, total) {
  const partes = [`Slide ${i + 1} de ${total}.`];
  const add = (v) => v && partes.push(plain(v).replace(/\.?$/, '.'));
  add(s.selo);
  add(s.titulo || s.frase);
  add(s.subtitulo);
  if (s.numero) add(s.numero);
  add(s.texto);
  if (s.tipo === 'estudo') [s.revista, s.quem, s.achou, s.limite].forEach(add);
  if (s.tipo === 'lista') (s.itens || []).forEach((it) => add(typeof it === 'string' ? it : `${it.t}: ${it.d || ''}`));
  add(s.chamada);
  return partes.join(' ');
}

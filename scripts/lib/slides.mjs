import { blocks, escapeHtml, inline, plain, promptText } from './markup.mjs';

// Tema padrão de cada tipo de slide (pode ser trocado com `tema:` no YAML).
export const TEMA_PADRAO = {
  capa: 'escuro',
  texto: 'claro',
  lista: 'claro',
  prompt: 'claro',
  contraste: 'claro',
  chat: 'claro',
  numero: 'claro',
  cta: 'escuro',
};

export const TEMAS = ['claro', 'escuro', 'marca'];

const ICONES = {
  salvar: '<path d="M6 3.5h12v17l-6-4.2-6 4.2z"/>',
  enviar: '<path d="M21 3 10 14"/><path d="M21 3 14.5 21l-4.5-7-7-4.5z"/>',
  comentar: '<path d="M20.5 11.5a8.5 8.5 0 0 1-12.4 7.6L3.5 20.5l1.4-4.4A8.5 8.5 0 1 1 20.5 11.5z"/>',
  seguir: '<circle cx="9.5" cy="8" r="4"/><path d="M2.5 20.5c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/><path d="M19 8v6m-3-3h6"/>',
  check: '<path d="m4.5 12.5 5 5 10-11"/>',
  x: '<path d="m6 6 12 12M18 6 6 18"/>',
  copiar: '<rect x="8.5" y="8.5" width="12" height="12" rx="2"/><path d="M15.5 8.5v-3a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3"/>',
};

export const icone = (nome, cls = '') =>
  `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONES[nome]}</svg>`;

const tag = (t) => (t ? `<div class="tag">${inline(t)}</div>` : '');
const titulo = (t, cls = 'titulo') => (t ? `<h2 class="${cls}">${inline(t)}</h2>` : '');

// Cada função devolve o HTML de dentro de <main class="corpo">.
export const TIPOS = {
  capa: (s) => `
    ${tag(s.tag)}
    <h1 class="titulo-capa">${inline(s.titulo)}</h1>
    ${s.subtitulo ? `<p class="subtitulo">${inline(s.subtitulo)}</p>` : ''}
    ${s.comando ? `<div class="comando"><span class="prompt-sinal">&gt;</span><span>${promptText(s.comando)}</span><span class="cursor-bloco"></span></div>` : ''}`,

  texto: (s) => `
    ${tag(s.tag)}
    ${titulo(s.titulo)}
    ${s.texto ? `<div class="texto">${blocks(s.texto)}</div>` : ''}
    ${s.nota ? `<p class="nota">${inline(s.nota)}</p>` : ''}`,

  lista: (s) => {
    const estilo = s.estilo || 'numerada';
    const itens = (s.itens || [])
      .map((it, i) => {
        const item = typeof it === 'string' ? { t: it } : it;
        let marcador;
        if (item.m) marcador = `<span class="marcador letra">${escapeHtml(item.m)}</span>`;
        else if (estilo === 'check') marcador = `<span class="marcador sim">${icone('check')}</span>`;
        else if (estilo === 'x') marcador = `<span class="marcador nao">${icone('x')}</span>`;
        else marcador = `<span class="marcador num">${String(i + (s.inicio || 1)).padStart(2, '0')}</span>`;
        return `<li>${marcador}<div><div class="item-t">${inline(item.t)}</div>${item.d ? `<div class="item-d">${inline(item.d)}</div>` : ''}</div></li>`;
      })
      .join('');
    const siglas = (s.itens || []).some((it) => typeof it === 'object' && String(it.m || '').length > 1);
    return `${tag(s.tag)}${titulo(s.titulo)}<ol class="lista lista-${estilo}${siglas ? ' siglas' : ''}">${itens}</ol>${s.nota ? `<p class="nota">${inline(s.nota)}</p>` : ''}`;
  },

  prompt: (s) => `
    ${tag(s.tag)}
    ${titulo(s.titulo, 'titulo titulo-menor')}
    <div class="cartao-prompt">
      <div class="cartao-topo"><span>${escapeHtml(s.rotulo || 'PROMPT')}${s.parte ? ` · parte ${escapeHtml(s.parte)}` : ''}</span>${s.copiavel === false ? '' : `<span class="copie">${icone('copiar')}copie e cole</span>`}</div>
      <pre class="prompt-texto">${promptText(s.prompt)}</pre>
    </div>
    ${s.rodape ? `<p class="nota">${inline(s.rodape)}</p>` : ''}`,

  contraste: (s) => {
    const lado = (d, tipo) => `
      <div class="lado lado-${tipo}">
        <div class="lado-rotulo">${icone(tipo === 'ruim' ? 'x' : 'check')}${inline(d.rotulo || (tipo === 'ruim' ? 'Prompt comum' : 'Prompt de pesquisador'))}</div>
        <div class="lado-texto ${s.mono === false ? '' : 'mono'}">${s.mono === false ? inline(d.texto) : promptText(d.texto)}</div>
      </div>`;
    return `${tag(s.tag)}${titulo(s.titulo, 'titulo titulo-menor')}<div class="contraste">${lado(s.ruim, 'ruim')}${lado(s.bom, 'bom')}</div>${s.nota ? `<p class="nota">${inline(s.nota)}</p>` : ''}`;
  },

  chat: (s) => {
    const msgs = (s.mensagens || [])
      .map((m) => {
        const quem = m.de === 'ia' ? 'ia' : 'voce';
        return `<div class="msg msg-${quem}"><div class="msg-quem">${quem === 'ia' ? 'IA' : 'Você'}</div><div class="balao">${inline(m.texto)}</div></div>`;
      })
      .join('');
    return `${tag(s.tag)}${titulo(s.titulo, 'titulo titulo-menor')}<div class="chat">${msgs}</div>${s.nota ? `<p class="nota">${inline(s.nota)}</p>` : ''}`;
  },

  numero: (s) => `
    ${tag(s.tag)}
    <div class="numero-grande"><mark>${escapeHtml(s.numero)}</mark></div>
    ${titulo(s.titulo)}
    ${s.texto ? `<div class="texto">${blocks(s.texto)}</div>` : ''}
    ${s.nota ? `<p class="nota">${inline(s.nota)}</p>` : ''}
    ${s.fonte ? `<p class="fonte">Fonte: ${inline(s.fonte)}</p>` : ''}`,

  cta: (s) => {
    const acoes = ['salvar', 'enviar', 'comentar', 'seguir'];
    const rotulos = { salvar: 'Salve', enviar: 'Envie', comentar: 'Comente', seguir: 'Siga' };
    const destaque = s.destaque || 'salvar';
    const barra = acoes
      .map((a) => `<div class="acao ${a === destaque ? 'ativa' : ''}">${icone(a)}<span>${rotulos[a]}</span></div>`)
      .join('');
    return `
      ${tag(s.tag)}
      <h2 class="titulo-cta">${inline(s.titulo)}</h2>
      ${s.texto ? `<div class="texto">${blocks(s.texto)}</div>` : ''}
      ${s.palavra ? `<div class="palavra">Comente <mark>${escapeHtml(s.palavra)}</mark></div>` : ''}
      <div class="acoes">${barra}</div>
      ${s.extra ? `<p class="extra">${inline(s.extra)}</p>` : ''}`;
  },
};

// Texto alternativo (acessibilidade + SEO) de cada slide.
export function altText(s, i, total) {
  const partes = [`Slide ${i + 1} de ${total}.`];
  const add = (v) => v && partes.push(plain(v).replace(/\.?$/, '.'));
  switch (s.tipo) {
    case 'capa':
      add(s.titulo);
      add(s.subtitulo);
      break;
    case 'lista':
      add(s.titulo);
      (s.itens || []).forEach((it) => add(typeof it === 'string' ? it : [it.t, it.d].filter(Boolean).join(': ')));
      break;
    case 'prompt':
      add(s.titulo);
      partes.push('Prompt para copiar:', plain(s.prompt));
      break;
    case 'contraste':
      add(s.titulo);
      add(`${s.ruim?.rotulo || 'Prompt comum'}: ${s.ruim?.texto}`);
      add(`${s.bom?.rotulo || 'Prompt de pesquisador'}: ${s.bom?.texto}`);
      break;
    case 'chat':
      add(s.titulo);
      (s.mensagens || []).forEach((m) => add(`${m.de === 'ia' ? 'IA' : 'Você'}: ${m.texto}`));
      break;
    case 'numero':
      add(`${s.numero} ${s.titulo || ''}`);
      add(s.texto);
      break;
    case 'cta':
      add(s.titulo);
      add(s.texto);
      if (s.palavra) add(`Comente ${s.palavra}`);
      add(s.extra);
      break;
    default:
      add(s.titulo);
      add(s.texto);
  }
  return partes.join(' ');
}

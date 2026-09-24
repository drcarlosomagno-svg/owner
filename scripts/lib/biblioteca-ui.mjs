// Réplica da Biblioteca de Prompts paper.ai__ na largura de celular, para os Reels de
// demonstração. Segue o layout móvel do artefato (marca/catalogo-produto.json guarda os textos,
// os campos e as dicas de cada IA). Os elementos que a pessoa toca levam data-alvo.
//
// Nunca mostra o texto de um prompt: só a tela de preencher e a resposta no formato do prompt.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { escapeHtml } from './markup.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const CATALOGO = JSON.parse(readFileSync(path.join(RAIZ, 'marca', 'catalogo-produto.json'), 'utf8'));

const ICONE = {
  menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  busca: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  seta: '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
  sol: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  lua: '<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  copiar: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>',
  enviar: '<svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
};

// Texto com trechos ~~borrados~~ (citação inventada que não mostramos) e quebras de linha.
export function textoCampo(t) {
  return escapeHtml(String(t ?? ''))
    .replace(/~~(.+?)~~/g, '<span class="b-borrado">$1</span>')
    .replace(/\n/g, '<br>');
}

// Campo de texto desenhado (não é um <input>): o gerador digita letra por letra nele.
function entrada({ alvo, dica, longo, valor = '' }) {
  return `<div class="b-input${longo ? ' b-area' : ''}${valor ? ' tem-valor' : ''}" data-alvo="${alvo}">`
    + `<span class="b-ph">${escapeHtml(dica)}</span><span class="b-txt">${textoCampo(valor)}</span><i class="b-caret"></i></div>`;
}

function topo(tema) {
  return `<header class="b-topo">
    <span class="b-abre-menu">${ICONE.menu}</span>
    <span class="b-marca">paper<span>.ai__</span></span>
    <span class="b-tema" data-alvo="tema" aria-checked="${tema === 'escuro'}"><span class="b-trilho"><span class="b-botao">${ICONE.sol}${ICONE.lua}</span></span></span>
    <span class="b-abre-paleta">${ICONE.busca}</span>
  </header>`;
}

function paginaInicio(valores) {
  return `<section class="b-heroi">
    <p class="b-olho">${escapeHtml(CATALOGO.olho)}</p>
    <h1>Comece sua <span>pesquisa.</span></h1>
    <p class="b-sub">${escapeHtml(CATALOGO.subtitulo)}</p>
    <div class="b-pergunta">
      ${entrada({ alvo: 'pergunta', dica: 'Ex.: creatina e memória em idosos', valor: valores.TEMA })}
      <span class="b-btn b-btn-prim" data-alvo="criar">Criar prompt</span>
    </div>
    <div class="b-exemplos"><span class="b-ex-rotulo">Experimente:</span><span>creatina e memória</span><span>HIIT após infarto</span><span>vitamina D e fraturas</span></div>
    <p class="b-funciona">Funciona no Claude, no ChatGPT e no Gemini.</p>
  </section>
  <section class="b-bloco"><h2>Comece por aqui</h2>
    <div class="b-passo"><span>01</span><h3>Escreva o tema</h3><p>Em linguagem livre, do jeito que você perguntaria a um colega.</p></div>
    <div class="b-passo"><span>02</span><h3>Copie o prompt</h3><p>Ele sai pronto para a IA que você usa, com o seu tema já dentro.</p></div>
  </section>`;
}

function paginaPrompt(id, valores, ia) {
  const p = CATALOGO.prompts.find((x) => x.id === id);
  if (!p) throw new Error(`prompt ${id} não existe no catálogo`);
  const grupo = CATALOGO.grupos.find((g) => g.id === p.grupo)?.nome || '';
  const campo = (c) => `<div class="b-campo"><label>${escapeHtml(c.rotulo)}</label>${entrada({ alvo: `campo-${c.chave}`, dica: c.dica, longo: c.longo, valor: valores[c.chave] })}</div>`;
  const obr = p.campos.filter((c) => c.obrigatorio);
  const opc = p.campos.filter((c) => !c.obrigatorio);
  const ajustes = opc.length
    ? `<div class="b-ajustes" data-alvo="ajustes"><div class="b-ajustes-cab">${ICONE.seta}Ajustar ${opc.length === 1 ? '1 opção' : `${opc.length} opções`}</div><div class="b-grade">${opc.map(campo).join('')}</div></div>`
    : '';
  const nomes = CATALOGO.nomesIa;
  const seg = CATALOGO.ias.map((nome) => {
    const k = Object.keys(nomes).find((x) => nomes[x] === nome);
    return `<span data-alvo="ia-${k}" aria-pressed="${k === ia}">${escapeHtml(nome)}</span>`;
  }).join('');
  return `<article class="b-pag">
    <span class="b-voltar">← Todos os prompts</span>
    <p class="b-olho"><span class="b-mono">${p.id}</span> · ${escapeHtml(grupo)}</p>
    <h1>${escapeHtml(p.nome)}</h1>
    <p class="b-lead">${escapeHtml(p.quando)}</p>
    <div class="b-compositor">
      ${obr.map(campo).join('')}
      ${ajustes}
      <div class="b-linha-ia"><span class="b-usar">Usar no</span><div class="b-segmento">${seg}</div><p class="b-dica">${escapeHtml(CATALOGO.dicasIa[ia])}</p></div>
      <div class="b-acoes"><span class="b-btn-link" data-alvo="abrir">Copiar e abrir o ${escapeHtml(nomes[ia])} ↗</span></div>
      <p class="b-status" data-alvo="status" data-ok="Copiado. Agora cole numa conversa nova do ${escapeHtml(nomes[ia])}."></p>
    </div>
    <div class="b-abas"><span aria-selected="true">Dicas</span><span>Ver o prompt</span></div>
  </article>`;
}

// Teclado do celular: sobe quando a pessoa toca num campo; a tecla digitada acende.
function teclado() {
  const tecla = (k) => `<span data-k="${k}">${k}</span>`;
  const linha = (letras, cls = '') => `<div class="tec-linha ${cls}">${[...letras].map(tecla).join('')}</div>`;
  return `<div class="teclado" aria-hidden="true">
    <div class="tec-sugestoes"><span></span><span></span><span></span></div>
    ${linha('qwertyuiop')}${linha('asdfghjkl', 'tec-l2')}
    <div class="tec-linha"><span class="tec-esp">⇧</span>${[...'zxcvbnm'].map(tecla).join('')}<span class="tec-esp">⌫</span></div>
    <div class="tec-linha"><span class="tec-esp tec-123">123</span><span class="tec-espaco" data-k=" ">espaço</span><span class="tec-esp tec-ir">ir</span></div>
    <b class="tec-balao"></b>
  </div>`;
}

// ---------- conversa com a IA ----------

// Marcação curta da resposta: **negrito**, `código`, links e os marcadores da biblioteca.
function inlineResposta(t) {
  return escapeHtml(t)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/~~(.+?)~~/g, '<span class="b-borrado">$1</span>')
    .replace(/(https:\/\/[^\s·<]+)/g, '<a>$1</a>')
    .replace(/\[(não verificado|cálculo meu|inferência)\]/g, '<span class="c-marca">[$1]</span>')
    .replace(/(✔|◐|✖|⊘)/g, '<span class="c-simbolo c-s-$1">$1</span>');
}

// Cada linha da resposta vira um bloco que aparece na sua vez.
export function blocosResposta(texto) {
  const linhas = String(texto || '').split('\n');
  const blocos = [];
  let codigo = null;
  let tabela = null;
  const fecharTabela = () => {
    if (!tabela) return;
    const [cab, ...corpo] = tabela;
    const celulas = (row, tag) => row.map((c) => `<${tag}>${inlineResposta(c)}</${tag}>`).join('');
    blocos.push(`<table class="c-bloco c-tabela"><tr>${celulas(cab, 'th')}</tr>${corpo.map((r) => `<tr>${celulas(r, 'td')}</tr>`).join('')}</table>`);
    tabela = null;
  };
  for (const bruta of linhas) {
    const l = bruta.replace(/\s+$/, '');
    if (codigo === null && l.startsWith('|')) {
      if (!/^\|[\s|:-]+\|$/.test(l)) (tabela ||= []).push(l.slice(1, -1).split('|').map((c) => c.trim()));
      continue;
    }
    fecharTabela();
    if (l.startsWith('```')) {
      if (codigo === null) codigo = [];
      else {
        blocos.push(`<pre class="c-bloco c-codigo">${escapeHtml(codigo.join('\n'))}</pre>`);
        codigo = null;
      }
      continue;
    }
    if (codigo !== null) { codigo.push(l); continue; }
    if (!l.trim()) continue;
    let m;
    if ((m = l.match(/^###\s+(.*)/))) {
      const verd = m[1].match(/(VERIFICADA|PARCIAL|INEXISTENTE|RETRATADA)/);
      blocos.push(`<h4 class="c-bloco c-nivel${verd ? ` c-v-${verd[1].toLowerCase()}` : ''}">${inlineResposta(m[1])}</h4>`);
    } else if ((m = l.match(/^##\s+(.*)/))) blocos.push(`<h3 class="c-bloco c-secao">${inlineResposta(m[1])}</h3>`);
    else if ((m = l.match(/^-\s+(.*)/))) blocos.push(`<p class="c-bloco c-item">${inlineResposta(m[1])}</p>`);
    else if (/^(DOI|Link|PMID)\b/.test(l)) blocos.push(`<p class="c-bloco c-ids">${inlineResposta(l)}</p>`);
    else if (!blocos.length) blocos.push(`<p class="c-bloco c-titulo">${inlineResposta(l)}</p>`);
    else blocos.push(`<p class="c-bloco">${inlineResposta(l)}</p>`);
  }
  fecharTabela();
  return blocos;
}

function paginaChat({ colado = {}, resposta = '' }) {
  const p = CATALOGO.prompts.find((x) => x.id === colado.prompt);
  const nome = p ? `${p.id} · ${p.nome}` : colado.titulo || 'Prompt';
  const campos = Object.entries(colado.valores || {})
    .map(([k, v]) => {
      const rotulo = p?.campos.find((c) => c.chave === k)?.rotulo || k;
      return `<span class="c-colado-campo">${escapeHtml(rotulo)}: <mark>${textoCampo(v)}</mark></span>`;
    }).join('');
  return `<div class="c-app">
    <header class="c-topo"><span class="c-voltar">‹</span><b>Nova conversa</b><span class="c-exemplo">exemplo resumido</span></header>
    <div class="c-rolagem"><div class="c-fio">
      <div class="c-eu"><div class="c-colado"><span class="c-colado-rot">Texto colado · prompt da Biblioteca</span><b>${escapeHtml(nome)}</b>${campos}<i class="c-borrao"></i><i class="c-borrao"></i><i class="c-borrao c-curto"></i></div></div>
      <div class="c-digitando"><i></i><i></i><i></i></div>
      <div class="c-ia">${blocosResposta(resposta).join('')}</div>
    </div></div>
    <div class="c-compor"><span>Responder…</span><i>${ICONE.enviar}</i></div>
  </div>`;
}

// ---------- celular ----------

// paginas: lista de ids ("inicio", "P1"...) que a cena usa, na ordem; ou "chat".
export function celularHtml({ paginas = ['inicio'], valores = {}, ia = 'claude', tema = 'claro', hora = '23:16', chat } = {}) {
  const miolo = chat
    ? `<div class="b-pagina ativa" data-pagina="chat">${paginaChat(chat)}</div>`
    : paginas.map((id, i) => {
      const vals = i === 0 ? valores[id] || {} : valores[id] || {};
      const corpo = id === 'inicio' ? paginaInicio(vals) : paginaPrompt(id, vals, ia);
      // No celular, o botão "Copiar prompt" fica numa barra fixa embaixo (layout móvel do artefato).
      const barra = id === 'inicio' ? '' : `<div class="b-barra-movel"><span class="b-btn b-btn-prim" data-alvo="copiar">${ICONE.copiar}Copiar prompt</span></div>`;
      return `<div class="b-pagina${i === 0 ? ' ativa' : ''}" data-pagina="${id}"><div class="b-rolagem">${topo(tema)}<main class="b-main">${corpo}</main></div>${barra}</div>`;
    }).join('');
  return `<div class="celular"><div class="cel-tela b-tema-${tema}">
    <div class="cel-status"><b>${escapeHtml(hora)}</b><span class="cel-ilha"></span><span class="cel-icones"><i class="cel-sinal"></i><i class="cel-wifi"></i><i class="cel-bateria"></i></span></div>
    <div class="b-app">${miolo}</div>
    <div class="b-colar" aria-hidden="true">Colar</div>${chat ? '' : teclado()}
  </div></div>`;
}

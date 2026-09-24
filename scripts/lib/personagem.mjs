// Personagem ilustrado dos Reels de demonstração: uma pessoa comum, de frente, segurando o
// celular. Tudo em SVG com classes, para o gerador animar quadro a quadro (piscar, respirar,
// expressões, gesto de apontar). As cores vêm de variáveis CSS em templates/reels-demo.css.
//
// Coordenadas locais: o centro da cabeça fica em (0, 0); os ombros em y ≈ 205; a mesa cobre
// tudo abaixo de y ≈ 500.

export const PELES = ['clara', 'media', 'escura'];
export const CABELOS = ['cacheado', 'longo', 'coque', 'curto'];
export const ROUPAS = ['moletom', 'jaleco', 'pijama'];
export const CENARIOS = ['noite', 'dia', 'tarde'];

const CABECA = 'M -112 -10 C -112 -95 -65 -135 0 -135 C 65 -135 112 -95 112 -10 C 112 60 70 132 0 132 C -70 132 -112 60 -112 -10 Z';

// ---------- cabelo ----------

function cabeloAtras(estilo) {
  if (estilo === 'longo') {
    return '<path class="p-cabelo" d="M -124 -30 C -150 60 -160 170 -150 250 L 150 250 C 160 170 150 60 124 -30 Z"/>';
  }
  if (estilo === 'coque') {
    return '<circle class="p-cabelo" cx="0" cy="-168" r="52"/><rect class="p-prendedor" x="-30" y="-128" width="60" height="14" rx="7"/>';
  }
  return '';
}

function cabeloFrente(estilo) {
  switch (estilo) {
    case 'cacheado': {
      const cachos = [
        [-100, -52, 42], [-94, -98, 48], [-62, -132, 52], [-14, -148, 56], [36, -144, 54], [78, -120, 50],
        [104, -80, 44], [112, -42, 32], [-112, -22, 28], [-34, -112, 54], [26, -106, 50], [0, -128, 56],
        [-70, -86, 38], [66, -84, 38],
      ];
      return cachos.map(([x, y, r]) => `<circle class="p-cabelo" cx="${x}" cy="${y}" r="${r}"/>`).join('')
        + '<path class="p-cabelo-luz" d="M -40 -168 Q 10 -182 52 -164" />';
    }
    case 'longo':
      return '<path class="p-cabelo" d="M -120 -8 C -128 -112 -46 -150 12 -146 C 88 -142 130 -92 122 -4 C 110 -54 76 -88 26 -96 C -12 -74 -64 -64 -120 -8 Z"/>'
        + '<path class="p-cabelo" d="M -120 -12 C -132 40 -130 110 -112 160 L -92 150 C -104 100 -108 40 -100 -6 Z"/>'
        + '<path class="p-cabelo" d="M 122 -8 C 132 40 130 110 112 160 L 92 150 C 104 100 108 40 100 -4 Z"/>'
        + '<path class="p-cabelo-luz" d="M -30 -136 Q 20 -146 60 -126" />';
    case 'coque':
      return '<path class="p-cabelo" d="M -114 -26 C -120 -112 -62 -142 0 -142 C 62 -142 120 -112 114 -26 C 92 -84 46 -100 0 -100 C -46 -100 -92 -84 -114 -26 Z"/>'
        + '<path class="p-cabelo-luz" d="M -50 -128 Q 0 -140 50 -128" />';
    default: // curto
      return '<path class="p-cabelo" d="M -116 -14 C -124 -110 -52 -150 14 -146 C 86 -142 126 -100 116 -14 C 110 -56 96 -80 62 -92 C 22 -78 -38 -94 -80 -70 C -100 -56 -110 -40 -116 -14 Z"/>'
        + '<path class="p-cabelo-luz" d="M -40 -134 Q 10 -146 56 -128" />';
  }
}

// ---------- roupa ----------

function roupa(estilo) {
  const tronco = 'M -250 330 C -250 250 -190 215 -120 205 L 120 205 C 190 215 250 250 250 330 L 262 760 L -262 760 Z';
  const pescoco = '<path class="p-pele-sombra" d="M -40 80 L -42 200 Q 0 224 42 200 L 40 80 Z"/>';
  switch (estilo) {
    case 'jaleco':
      return `<path class="p-roupa-2" d="${tronco}"/>`
        + pescoco
        + '<path class="p-roupa-2" d="M -64 200 L 0 300 L 64 200 L 120 205 L 0 330 L -120 205 Z"/>'
        + '<path class="p-jaleco" d="M -250 330 C -250 250 -190 215 -120 205 L -62 205 L 0 330 L -30 760 L -262 760 Z"/>'
        + '<path class="p-jaleco" d="M 250 330 C 250 250 190 215 120 205 L 62 205 L 0 330 L 30 760 L 262 760 Z"/>'
        + '<path class="p-jaleco-sombra" d="M -62 205 L -120 205 L -150 250 L -44 420 L 0 330 Z"/>'
        + '<path class="p-jaleco-sombra" d="M 62 205 L 120 205 L 150 250 L 44 420 L 0 330 Z"/>'
        + '<path class="p-esteto" d="M -70 212 C -120 300 -96 370 -40 392 M 70 212 C 112 290 100 350 60 380"/>'
        + '<circle class="p-esteto-peca" cx="60" cy="392" r="20"/>'
        + '<rect class="p-cracha" x="-205" y="360" width="86" height="58" rx="8"/><rect class="p-cracha-faixa" x="-205" y="360" width="86" height="16" rx="6"/>';
    case 'pijama':
      return `<path class="p-roupa" d="${tronco}"/>`
        + pescoco
        + '<path class="p-pele-sombra" d="M -58 200 L 0 292 L 58 200 Z"/>'
        + '<path class="p-gola" d="M -60 200 L 0 294 L 60 200"/>'
        + '<path class="p-roupa-sombra" d="M 250 330 C 250 250 190 215 150 208 C 190 260 205 400 200 760 L 262 760 Z"/>'
        + '<rect class="p-bolso" x="80" y="330" width="96" height="70" rx="10"/>';
    default: // moletom
      return '<ellipse class="p-roupa-sombra" cx="0" cy="214" rx="152" ry="48"/>'
        + `<path class="p-roupa" d="${tronco}"/>`
        + '<path class="p-roupa-sombra" d="M 250 330 C 250 250 190 215 150 208 C 190 260 205 400 200 760 L 262 760 Z"/>'
        + pescoco
        + '<path class="p-gola" d="M -66 202 Q 0 248 66 202"/>'
        + '<path class="p-cordao" d="M -30 236 L -38 336 M 30 236 L 38 336"/>';
  }
}

// ---------- rosto ----------

function rosto(oculos) {
  const olho = (x) => `<g class="p-olho">
      <ellipse class="p-iris" cx="${x}" cy="-14" rx="11.5" ry="14.5"/><circle class="p-brilho" cx="${x + 4}" cy="-19" r="3.6"/></g>`;
  const palpebra = (x) => `<path class="p-palpebra" d="M ${x - 16} -12 Q ${x} -24 ${x + 16} -12 L ${x + 16} -34 L ${x - 16} -34 Z"/><path class="p-palpebra-linha" d="M ${x - 16} -12 Q ${x} -19 ${x + 16} -12"/>`;
  const oculosSvg = oculos
    ? `<g class="p-oculos">
        <rect x="-88" y="-44" width="78" height="60" rx="18"/><rect x="10" y="-44" width="78" height="60" rx="18"/>
        <path d="M -10 -22 Q 0 -30 10 -22 M -88 -28 L -110 -20 M 88 -28 L 110 -20"/>
        <path class="p-reflexo" d="M -70 -30 L -52 -40 M -76 -14 L -46 -32 M 28 -30 L 46 -40 M 22 -14 L 52 -32"/></g>`
    : '';
  return `
    <g class="p-sobrancelha p-sob-e"><path d="M -78 -54 Q -50 -66 -22 -56"/></g>
    <g class="p-sobrancelha p-sob-d"><path d="M 22 -56 Q 50 -66 78 -54"/></g>
    <g class="p-olhos">${olho(-48)}${olho(48)}</g>
    <g class="p-olhos-felizes"><path d="M -62 -12 Q -48 -28 -34 -12"/><path d="M 34 -12 Q 48 -28 62 -12"/></g>
    <g class="p-cansaco">${palpebra(-48)}${palpebra(48)}<path class="p-olheira" d="M -62 8 Q -48 14 -34 8 M 34 8 Q 48 14 62 8"/></g>
    <path class="p-nariz" d="M -4 8 Q -16 36 0 40 Q 8 41 12 36"/>
    <g class="p-boca">
      <path class="p-boca-neutra" d="M -22 76 Q 0 82 22 76"/>
      <path class="p-boca-cansada" d="M -22 82 Q 0 72 22 82"/>
      <g class="p-boca-sorriso"><path class="p-boca-dentro" d="M -38 66 Q 0 116 38 66 Q 0 78 -38 66 Z"/><path class="p-dentes" d="M -30 70 Q 0 80 30 70 L 27 78 Q 0 88 -27 78 Z"/></g>
      <ellipse class="p-boca-o p-boca-dentro" cx="0" cy="82" rx="15" ry="19"/>
    </g>
    <ellipse class="p-bochecha" cx="-80" cy="40" rx="21" ry="12"/><ellipse class="p-bochecha" cx="80" cy="40" rx="21" ry="12"/>
    ${oculosSvg}`;
}

// ---------- mãos e celular ----------

function celularNaMao() {
  return `<g class="p-celular">
      <rect class="p-cel-corpo" x="-78" y="-150" width="156" height="300" rx="26"/>
      <rect class="p-cel-camera" x="-62" y="-134" width="54" height="54" rx="15"/>
      <circle class="p-cel-lente" cx="-46" cy="-118" r="9"/><circle class="p-cel-lente" cx="-24" cy="-96" r="9"/>
      <circle class="p-cel-selo" cx="0" cy="18" r="36"/>
      <text class="p-cel-letra" x="0" y="31" text-anchor="middle">p</text>
    </g>`;
}

function mao(lado) {
  // lado -1: mão à esquerda de quem assiste; 1: à direita
  const s = lado;
  const dedos = [0, 1, 2].map((i) => `<rect class="p-pele p-dedo" x="${s < 0 ? -92 : 42}" y="${-40 + i * 24}" width="50" height="21" rx="10.5"/>`).join('');
  return `<g class="p-mao p-mao-${s < 0 ? 'e' : 'd'}">
      <path class="p-manga" d="M ${s * 250} 330 Q ${s * 205} 180 ${s * 96} 70"/>
      <ellipse class="p-pele" cx="${s * 86}" cy="42" rx="38" ry="50"/>${dedos}</g>`;
}

function bracoApontando() {
  // Gira em torno do ombro (190, 250). No quadro inicial está abaixado, atrás da mesa.
  return `<g class="p-braco" transform="rotate(115 190 250)">
      <path class="p-manga" d="M 190 250 L 300 96 L 256 -96"/>
      <circle class="p-pele" cx="252" cy="-118" r="36"/>
      <rect class="p-pele" x="238" y="-214" width="26" height="84" rx="13"/>
      <rect class="p-pele" x="210" y="-138" width="22" height="42" rx="11" transform="rotate(-30 221 -117)"/>
    </g>`;
}

// ---------- pessoa ----------

export function pessoaSvg(pessoa = {}, { pose = 'segurar' } = {}) {
  const p = { pele: 'media', cabelo: 'curto', roupa: 'moletom', oculos: false, ...pessoa };
  const apontar = pose === 'apontar';
  return `<g class="pessoa pele-${p.pele} cabelo-${p.cabelo} roupa-${p.roupa}${p.cor ? ` roupa-cor-${p.cor}` : ''}">
    <g class="p-tronco">${cabeloAtras(p.cabelo === 'longo' ? 'longo' : '')}${roupa(p.roupa)}</g>
    <g class="p-cabeca">
      ${p.cabelo === 'coque' ? cabeloAtras('coque') : ''}
      <ellipse class="p-pele-sombra" cx="-110" cy="6" rx="20" ry="30"/><ellipse class="p-pele-sombra" cx="110" cy="6" rx="20" ry="30"/>
      <path class="p-pele" d="${CABECA}"/>
      <path class="p-luz-tela" d="${CABECA}"/>
      ${cabeloFrente(p.cabelo)}
      ${rosto(p.oculos)}
    </g>
    ${apontar ? bracoApontando() : ''}
    <g class="p-maos" transform="translate(0 400)">
      <g class="p-segura" transform="${apontar ? 'translate(-40 6) rotate(-6)' : 'rotate(-3)'}">
        ${celularNaMao()}${mao(-1)}${apontar ? '' : mao(1)}
      </g>
    </g>
  </g>`;
}

// ---------- cenário ----------

function relogioSvg(hora = '23:14') {
  const [h, m] = String(hora).split(':').map(Number);
  const marcas = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    const r1 = i % 3 ? 60 : 54;
    return `<line x1="${(Math.sin(a) * r1).toFixed(1)}" y1="${(-Math.cos(a) * r1).toFixed(1)}" x2="${(Math.sin(a) * 66).toFixed(1)}" y2="${(-Math.cos(a) * 66).toFixed(1)}"/>`;
  }).join('');
  return `<g class="relogio" transform="translate(215 960)" data-hora="${h}" data-minuto="${m}">
      <circle class="rl-aro" r="80"/><circle class="rl-face" r="70"/><g class="rl-marcas">${marcas}</g>
      <line class="rl-hora" x1="0" y1="8" x2="0" y2="-36"/><line class="rl-minuto" x1="0" y1="10" x2="0" y2="-56"/>
      <circle class="rl-centro" r="7"/></g>`;
}

function janelaSvg(cenario) {
  const estrelas = cenario === 'noite'
    ? [[760, 880], [812, 940], [850, 870], [990, 1000], [772, 1010], [906, 1040], [960, 870]]
      .map(([x, y], i) => `<circle class="estrela" data-i="${i}" cx="${x}" cy="${y}" r="${i % 2 ? 2.6 : 3.4}"/>`).join('')
    : '';
  const astro = cenario === 'noite'
    ? '<circle class="lua-c" cx="930" cy="905" r="34"/><circle class="lua-sombra" cx="946" cy="896" r="30"/>'
    : cenario === 'tarde'
      ? '<circle class="sol-c" cx="900" cy="1080" r="58"/>'
      : '<g class="nuvem"><ellipse cx="830" cy="930" rx="60" ry="22"/><ellipse cx="866" cy="914" rx="38" ry="26"/><ellipse cx="800" cy="920" rx="30" ry="18"/></g>';
  const predios = [[720, 1110, 70], [790, 1060, 60], [850, 1130, 50], [900, 1080, 56], [956, 1040, 60]]
    .map(([x, y, w]) => {
      let janelas = '';
      for (let yy = y + 18; yy < 1230; yy += 34) {
        for (let xx = x + 12; xx < x + w - 14; xx += 22) {
          if ((xx * 7 + yy * 3) % 5 < 2) janelas += `<rect class="predio-luz" x="${xx}" y="${yy}" width="10" height="14"/>`;
        }
      }
      return `<rect class="predio" x="${x}" y="${y}" width="${w}" height="${1250 - y}"/>${janelas}`;
    }).join('');
  return `<g class="janela">
      <clipPath id="clip-janela-${cenario}"><rect x="700" y="830" width="310" height="420" rx="10"/></clipPath>
      <g clip-path="url(#clip-janela-${cenario})"><rect class="ceu" x="700" y="830" width="310" height="420"/>${estrelas}${astro}${predios}</g>
      <rect class="janela-moldura" x="700" y="830" width="310" height="420" rx="10"/>
      <path class="janela-cruz" d="M 855 830 L 855 1250 M 700 1040 L 1010 1040"/>
      <rect class="janela-peitoril" x="684" y="1244" width="342" height="20" rx="6"/></g>`;
}

function estanteSvg() {
  const livros = [[96, 60, 'a'], [128, 74, 'b'], [158, 66, 'c'], [186, 80, 'd'], [220, 56, 'b'], [248, 70, 'a']]
    .map(([x, h, c]) => `<rect class="livro livro-${c}" x="${x}" y="${1180 - h}" width="${c === 'd' ? 32 : 26}" height="${h}" rx="3"/>`).join('');
  return `<g class="estante">${livros}
      <path class="planta-folha" d="M 322 1130 C 300 1080 312 1060 330 1050 C 338 1080 334 1110 322 1130 Z M 330 1130 C 350 1086 372 1080 386 1084 C 376 1110 352 1126 330 1130 Z M 326 1132 C 318 1100 290 1092 276 1096 C 284 1120 306 1130 326 1132 Z"/>
      <path class="vaso" d="M 300 1130 L 352 1130 L 346 1180 L 306 1180 Z"/>
      <rect class="prateleira" x="80" y="1180" width="310" height="14" rx="4"/></g>`;
}

function mesaSvg() {
  return `<g class="mesa">
      <rect class="mesa-tampo" x="0" y="1560" width="1080" height="360"/>
      <rect class="mesa-borda" x="0" y="1560" width="1080" height="16"/>
      <g class="luminaria"><path class="lum-braco" d="M 150 1560 L 190 1400 L 110 1300"/><path class="lum-cupula" d="M 70 1270 L 170 1300 L 130 1350 Z"/><rect class="lum-base" x="110" y="1548" width="84" height="16" rx="6"/></g>
      <path class="lum-luz" d="M 120 1330 L 20 1560 L 330 1560 Z"/>
      <g class="caneca"><path class="caneca-corpo" d="M 858 1478 L 948 1478 L 940 1566 L 866 1566 Z"/><path class="caneca-alca" d="M 946 1496 C 986 1496 986 1546 942 1546"/><rect class="caneca-faixa" x="862" y="1500" width="82" height="14"/>
        <path class="vapor" data-i="0" d="M 886 1460 C 876 1440 896 1426 886 1406"/><path class="vapor" data-i="1" d="M 906 1460 C 896 1440 916 1426 906 1406"/><path class="vapor" data-i="2" d="M 926 1460 C 916 1440 936 1426 926 1406"/></g>
      <g class="papeis"><rect class="papel" x="600" y="1540" width="190" height="26" rx="3" transform="rotate(-4 695 1553)"/><rect class="papel papel-2" x="610" y="1530" width="180" height="24" rx="3" transform="rotate(3 700 1542)"/></g></g>`;
}

// Cena completa (1080×1920): parede, janela, relógio, estante, a pessoa e a mesa.
export function cenarioSvg({ cenario = 'noite', relogio = '23:14', pessoa = {}, pose = 'segurar' } = {}) {
  return `<svg class="ilustracao cenario-${cenario}" viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect class="parede" x="0" y="0" width="1080" height="1920"/>
    <rect class="parede-luz" x="0" y="0" width="1080" height="1920"/>
    ${janelaSvg(cenario)}${relogioSvg(relogio)}${estanteSvg()}
    <g class="camera-pessoa"><g transform="translate(540 1060)">${pessoaSvg(pessoa, { pose })}</g></g>
    ${mesaSvg()}
  </svg>`;
}

// Só a pessoa, enquadrada do peito para cima, para a bolha de rosto das cenas de tela.
export function rostoSvg({ cenario = 'noite', pessoa = {} } = {}) {
  return `<svg class="rosto-svg cenario-${cenario}" viewBox="-230 -222 460 460" aria-hidden="true">
    <rect class="parede" x="-230" y="-222" width="460" height="460"/>
    <rect class="parede-luz" x="-230" y="-222" width="460" height="460"/>
    ${pessoaSvg(pessoa, { pose: 'segurar' })}
  </svg>`;
}

// Gradientes usados pelos desenhos (uma vez por página).
export function defsSvg() {
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <radialGradient id="g-luz-tela" cx="50%" cy="100%" r="80%"><stop offset="0" stop-color="#e8f0ff" stop-opacity=".55"/><stop offset="1" stop-color="#e8f0ff" stop-opacity="0"/></radialGradient>
    <linearGradient id="g-ceu-noite" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1430"/><stop offset="1" stop-color="#26345e"/></linearGradient>
    <linearGradient id="g-ceu-dia" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9cbe6"/><stop offset="1" stop-color="#e3eef6"/></linearGradient>
    <linearGradient id="g-ceu-tarde" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3a25b"/><stop offset="1" stop-color="#ffd9a0"/></linearGradient>
    <linearGradient id="g-luz-lum" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd58a" stop-opacity=".34"/><stop offset="1" stop-color="#ffd58a" stop-opacity="0"/></linearGradient>
    <radialGradient id="g-parede-noite" cx="50%" cy="58%" r="70%"><stop offset="0" stop-color="#2a2d36" stop-opacity=".9"/><stop offset="1" stop-color="#2a2d36" stop-opacity="0"/></radialGradient>
    <radialGradient id="g-parede-dia" cx="50%" cy="58%" r="70%"><stop offset="0" stop-color="#ffffff" stop-opacity=".7"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
    <radialGradient id="g-parede-tarde" cx="50%" cy="58%" r="70%"><stop offset="0" stop-color="#ff9a6a" stop-opacity=".55"/><stop offset="1" stop-color="#ff9a6a" stop-opacity="0"/></radialGradient>
  </defs></svg>`;
}

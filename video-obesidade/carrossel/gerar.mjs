// Carrossel de awareness "Não é falta de disciplina" (Dr. Carlos Magno).
// Gera os slides em 3:4 (1080x1440) e 4:5 (1080x1350) com Playwright.
// Uso: node video-obesidade/carrossel/gerar.mjs
import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const FONTES = path.resolve(DIR, '../public/fonts');
// imagens e fontes embutidas (setContent não carrega file://)
const b64 = (p) => fs.readFileSync(p).toString('base64');
const FOTO = (n) => `data:image/jpeg;base64,${b64(path.join(DIR, 'frames', n + '.jpg'))}`;
const FONTE = (w) => `data:font/woff2;base64,${b64(path.join(FONTES, `montserrat-latin-${w}-normal.woff2`))}`;
const AUTOR = 'Dr. Carlos Magno';
const CRM = ''; // preencha, ex.: 'CRM-SP 000000' (exigido pela Resolução CFM 2.336/2023)
const TOTAL = 10;

const css = (H) => `
@font-face{font-family:M;font-weight:700;src:url(${FONTE(700)})}
@font-face{font-family:M;font-weight:800;src:url(${FONTE(800)})}
@font-face{font-family:M;font-weight:900;src:url(${FONTE(900)})}
:root{--navy:#14304A;--teal:#1AA5B8;--gold:#C9A227;--off:#F5F3EE;--ink:#0B1B2A}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:${H}px;font-family:M,sans-serif;overflow:hidden}
.s{position:relative;width:1080px;height:${H}px;overflow:hidden;padding:110px 90px 120px;display:flex;flex-direction:column}
.navy{background:var(--navy);color:#fff}.off{background:var(--off);color:var(--navy)}
.num{position:absolute;top:44px;right:60px;font-weight:800;font-size:24px;letter-spacing:3px;opacity:.55}
.rod{position:absolute;bottom:44px;left:90px;font-weight:800;font-size:24px;letter-spacing:1px;opacity:.7}
.seta{position:absolute;bottom:34px;right:60px;font-weight:900;font-size:44px;color:var(--gold)}
.tag{display:inline-block;font-weight:800;font-size:26px;letter-spacing:4px;text-transform:uppercase;color:var(--teal);margin-bottom:26px}
h1{font-weight:900;font-size:96px;line-height:1.0;letter-spacing:-2px}
h2{font-weight:900;font-size:72px;line-height:1.04;letter-spacing:-1.5px}
p{font-weight:700;font-size:42px;line-height:1.28}
.meio{justify-content:center}
.ouro{color:var(--gold)}.teal{color:var(--teal)}
.marca{background:linear-gradient(transparent 58%, rgba(201,162,39,.55) 58%)}
.fonte{font-weight:700;font-size:23px;line-height:1.35;opacity:.75;margin-top:auto}
.foto{position:absolute;inset:0;background-size:cover;background-position:50% 22%}
.grao{position:absolute;inset:0;opacity:.06;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>")}
.card{border-radius:34px;padding:40px 44px}
.ck{display:flex;align-items:center;gap:28px;font-weight:800;font-size:40px;margin:14px 0}
.ck i{flex:0 0 64px;height:64px;border-radius:16px;background:var(--teal);display:flex;align-items:center;justify-content:center}
`;

const ico = {
  check: '<svg width="44" height="44" viewBox="0 0 120 120"><path d="M20 62 L48 90 L100 30" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  x: '<svg width="90" height="90" viewBox="0 0 120 120"><path d="M28 28 L92 92 M92 28 L28 92" stroke="#E0565B" stroke-width="12" stroke-linecap="round"/></svg>',
  ok: '<svg width="90" height="90" viewBox="0 0 120 120"><path d="M20 62 L48 90 L100 30" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  alerta: '<svg width="96" height="96" viewBox="0 0 120 120"><path d="M60 14 L108 100 L12 100Z M60 46 L60 72" fill="none" stroke="#C9A227" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/><circle cx="60" cy="86" r="5" fill="#C9A227"/></svg>',
};
const pilar = (nome, svg, cor = 'var(--teal)') =>
  `<div style="display:flex;flex-direction:column;align-items:center;gap:14px;width:190px"><div style="width:150px;height:150px;border-radius:75px;background:${cor};display:flex;align-items:center;justify-content:center">${svg}</div><div style="font-weight:800;font-size:26px;text-align:center">${nome}</div></div>`;
const tr = (d) => `<svg width="90" height="90" viewBox="0 0 120 120"><path d="${d}" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const mostrador = (titulo, ang, cor, seta) => {
  const r = (ang * Math.PI) / 180;
  return `<div style="display:flex;flex-direction:column;align-items:center"><svg width="380" height="230" viewBox="0 0 280 165"><path d="M20 150 A120 120 0 0 1 260 150" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="20" stroke-linecap="round"/><path d="M20 150 A120 120 0 0 1 260 150" fill="none" stroke="${cor}" stroke-width="20" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${1 - (ang + 90) / 180}"/><line x1="140" y1="150" x2="${140 + 100 * Math.sin(r)}" y2="${150 - 100 * Math.cos(r)}" stroke="#fff" stroke-width="9" stroke-linecap="round"/><circle cx="140" cy="150" r="13" fill="#fff"/></svg><div style="font-weight:900;font-size:40px;margin-top:6px">${titulo} <span style="color:${cor}">${seta}</span></div></div>`;
};

// ---------- slides ----------
const S = [];

// 1 · capa
S.push(() => `
<div class="s navy" style="justify-content:flex-end;padding-bottom:150px">
  <div class="foto" style="background-image:url(${FOTO('capa')});background-position:50% 78%"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,48,74,0) 44%,rgba(20,48,74,.85) 60%,#14304A 72%)"></div>
  <div class="grao"></div>
  <div style="position:relative">
    <span class="tag" style="color:var(--gold)">Obesidade, explicada</span>
    <h1>O peso voltou?<br>Não é falta de <span class="marca">disciplina</span>.</h1>
    <p style="margin-top:30px;opacity:.92">O que acontece no corpo depois de emagrecer, e onde entram os remédios.</p>
  </div>
  <div class="seta">arraste →</div>
</div>`);

// 2 · identificação
S.push(() => `
<div class="s meio off">
  <span class="tag">Você já passou por isso?</span>
  <h2>Emagreceu.<br>Tentou manter os hábitos.<br><span class="teal">E o peso voltou.</span></h2>
  <svg viewBox="0 0 900 430" style="width:100%;margin-top:60px">
    <path d="M40 20 L40 380 L880 380" fill="none" stroke="rgba(20,48,74,.3)" stroke-width="4"/>
    <path d="M60 70 C 200 120, 260 300, 420 330" fill="none" stroke="#1AA5B8" stroke-width="14" stroke-linecap="round"/>
    <path d="M420 330 C 560 340, 640 160, 860 80" fill="none" stroke="#C9A227" stroke-width="14" stroke-linecap="round"/>
    <circle cx="420" cy="330" r="16" fill="#14304A"/>
    <text x="60" y="420" font-family="M" font-weight="800" font-size="26" fill="#14304A" opacity=".6">peso ao longo do tempo (esquema ilustrativo)</text>
    <text x="300" y="300" font-family="M" font-weight="800" font-size="30" fill="#14304A">emagreceu</text>
    <text x="640" y="250" font-family="M" font-weight="800" font-size="30" fill="#C9A227">voltou</text>
  </svg>
  <p style="margin-top:40px">Isso é frequente e tem explicação biológica. Não é culpa sua.</p>
</div>`);

// 3 · mito × realidade
S.push(() => `
<div class="s meio off">
  <span class="tag">Mito × realidade</span>
  <div class="card" style="background:var(--navy);color:#fff;display:flex;gap:30px;align-items:center">${ico.x}<div><div style="font-weight:800;font-size:26px;letter-spacing:3px;opacity:.6">MITO</div><div style="font-weight:900;font-size:60px;line-height:1.05;text-decoration:line-through;text-decoration-color:var(--gold);text-decoration-thickness:7px">“É só ter força de vontade.”</div></div></div>
  <div class="card" style="background:var(--teal);color:#fff;display:flex;gap:30px;align-items:center;margin-top:34px">${ico.ok}<div><div style="font-weight:800;font-size:26px;letter-spacing:3px;opacity:.8">REALIDADE</div><div style="font-weight:900;font-size:48px;line-height:1.08">O peso também é regulado por hormônios que controlam a fome, a saciedade e o gasto de energia.</div></div></div>
  <p style="margin-top:48px">Comportamento importa. Mas a biologia joga junto, o tempo todo.</p>
</div>`);

// 4 · o corpo reage
S.push(() => `
<div class="s meio navy">
  <span class="tag">Quando você perde peso</span>
  <h2>O corpo reage para <span class="ouro">recuperar</span> o que perdeu.</h2>
  <div style="display:flex;justify-content:space-between;margin-top:60px">
    ${mostrador('Fome', 55, '#C9A227', '▲')}
    ${mostrador('Gasto de energia', -55, '#1AA5B8', '▼')}
  </div>
  <div class="card" style="background:rgba(255,255,255,.08);margin-top:56px">
    <p style="font-size:34px">Em um estudo com 50 pessoas, <b class="ouro">1 ano</b> depois de emagrecer, os hormônios do apetite ainda não tinham voltado ao normal, e a fome continuava maior.</p>
  </div>
  <div class="fonte">Sumithran P et al. N Engl J Med. 2011;365:1597-604. Estudo com dieta de muito baixa caloria; mostra associação ao longo do tempo, não o que acontece com cada pessoa.</div>
</div>`);

// 5 · onde entram os medicamentos
S.push(() => `
<div class="s meio off">
  <span class="tag">Onde entram os medicamentos</span>
  <h2>Eles atuam nessas mesmas vias hormonais.</h2>
  <div style="display:flex;flex-direction:column;gap:22px;margin-top:50px">
    <div class="card" style="background:var(--navy);color:#fff;font-weight:900;font-size:62px;letter-spacing:-1px">SEMAGLUTIDA</div>
    <div class="card" style="background:var(--teal);color:#fff;font-weight:900;font-size:62px;letter-spacing:-1px">TIRZEPATIDA</div>
  </div>
  <p style="margin-top:50px">Podem ajudar a sentir <b>menos fome</b>, a <b>controlar melhor</b> a ingestão de alimentos e a <b>perder peso</b>.</p>
  <div class="fonte" style="font-size:26px;opacity:.85">Uso somente com prescrição e acompanhamento médico.</div>
</div>`);

// 6 · não é só a dose (foto)
S.push(() => `
<div class="s navy" style="padding:0">
  <div style="position:relative;height:46%">
    <div class="foto" style="background-image:url(${FOTO('avalio')});background-position:50% 40%"></div>
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 60%,#14304A)"></div><div class="grao"></div>
  </div>
  <div style="padding:30px 90px 120px;flex:1;display:flex;flex-direction:column">
    <h2 style="font-size:60px">Prescrever não é só escolher <span class="ouro">a dose</span>.</h2>
    <p style="font-size:30px;margin:18px 0 14px;opacity:.85">Antes, o médico avalia:</p>
    ${['Se existe indicação clínica', 'Benefícios esperados', 'Possíveis efeitos adversos', 'Outras doenças que você tem', 'Remédios que você já usa'].map((t) => `<div class="ck" style="font-size:34px;margin:8px 0"><i style="flex-basis:52px;height:52px">${ico.check}</i>${t}</div>`).join('')}
  </div>
</div>`);

// 7 · doença crônica + dados
S.push(() => `
<div class="s off">
  <span class="tag">Por que isso importa</span>
  <h2>Obesidade é uma <span class="marca">doença crônica</span>.</h2>
  <p style="margin-top:22px;font-size:34px">Nos estudos, quem interrompeu o remédio recuperou boa parte do peso perdido.</p>
  <div style="display:flex;gap:26px;margin-top:40px">
    <div class="card" style="flex:1;background:var(--navy);color:#fff;padding:36px">
      <div style="font-weight:900;font-size:92px;color:var(--gold);line-height:1">2/3</div>
      <div style="font-weight:800;font-size:29px;line-height:1.25;margin-top:12px">do peso perdido voltou 1 ano após parar a semaglutida</div>
      <div style="font-weight:700;font-size:19px;opacity:.7;margin-top:16px">STEP 1, extensão. Wilding JPH et al. Diabetes Obes Metab. 2022 (327 pessoas; o programa de estilo de vida também foi encerrado)</div>
    </div>
    <div class="card" style="flex:1;background:var(--teal);color:#fff;padding:36px">
      <div style="font-weight:900;font-size:92px;line-height:1">+14%</div>
      <div style="font-weight:800;font-size:29px;line-height:1.25;margin-top:12px">de peso em 1 ano em quem trocou a tirzepatida por placebo. Quem continuou: −5,5%</div>
      <div style="font-weight:700;font-size:19px;opacity:.85;margin-top:16px">SURMOUNT-4. Aronne LJ et al. JAMA. 2024 (670 pessoas)</div>
    </div>
  </div>
  <div class="fonte" style="font-size:25px;opacity:.9"><b>O que não dá para dizer:</b> que todo tratamento é igual ou que precisa ser para sempre. Cada caso é avaliado e decidido junto com o médico.</div>
</div>`);

// 8 · não é falta de disciplina (foto)
S.push(() => `
<div class="s navy" style="justify-content:flex-end;padding-bottom:150px">
  <div class="foto" style="background-image:url(${FOTO('disciplina')});background-position:50% 78%"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,48,74,0) 46%,rgba(20,48,74,.85) 62%,#14304A 74%)"></div>
  <div class="grao"></div>
  <div style="position:relative">
    <h2 style="font-size:80px">Se o peso voltou, isso <span class="marca">não é falta de disciplina</span>.</h2>
    <p style="margin-top:26px;font-size:40px">Pode ser só o corpo <span class="ouro">respondendo</span> do jeito que ele foi feito para responder.</p>
  </div>
</div>`);

// 9 · pilares
S.push(() => `
<div class="s navy">
  <span class="tag">Tratamento de verdade</span>
  <h2>Nenhuma peça resolve sozinha.</h2>
  <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:34px 30px;margin-top:56px">
    ${pilar('Medicamento, se indicado', tr('M30 80 L80 30 Q95 15 105 30 Q115 45 100 58 L50 108 Q35 120 22 105 Q10 92 30 80Z M55 55 L80 80'), 'var(--gold)')}
    ${pilar('Alimentação', tr('M60 22 A40 40 0 1 0 60.1 22Z M60 42 A20 20 0 1 0 60.1 42Z'))}
    ${pilar('Exercício', tr('M20 60 L100 60 M30 40 L30 80 M90 40 L90 80 M15 50 L15 70 M105 50 L105 70'))}
    ${pilar('Sono', tr('M78 20 A42 42 0 1 0 100 78 A34 34 0 1 1 78 20Z'))}
    ${pilar('Acompanhamento médico', tr('M35 20 L35 55 Q35 80 60 80 Q85 80 85 55 L85 20 M60 80 L60 95 Q60 110 78 108'))}
  </div>
  <div class="card" style="background:rgba(201,162,39,.14);border:3px solid var(--gold);display:flex;gap:26px;align-items:center;margin-top:auto">${ico.alerta}<div style="font-weight:900;font-size:42px;line-height:1.1">Nenhum medicamento deve ser usado por conta própria.</div></div>
</div>`);

// 10 · CTA (foto)
S.push(() => `
<div class="s navy" style="justify-content:flex-end;padding-bottom:110px">
  <div class="foto" style="background-image:url(${FOTO('cta')});background-position:50% 86%"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,48,74,0) 36%,rgba(20,48,74,.88) 52%,#14304A 62%)"></div>
  <div class="grao"></div>
  <div style="position:relative">
    <h2 style="font-size:66px">Tratar obesidade vai muito além do <span class="ouro">número na balança</span>.</h2>
    <div class="card" style="background:var(--gold);color:var(--navy);margin-top:34px;display:flex;gap:24px;align-items:center;padding:30px 36px">
      <svg width="70" height="70" viewBox="0 0 120 120"><path d="M10 58 L108 16 L80 104 L56 70Z M56 70 L108 16" fill="none" stroke="#14304A" stroke-width="9" stroke-linejoin="round"/></svg>
      <div style="font-weight:900;font-size:36px;line-height:1.12">Envie para quem está usando algum remédio para obesidade.</div>
    </div>
    <p style="margin-top:26px;font-size:30px;opacity:.9">Salve para reler antes da próxima consulta.</p>
    <div style="margin-top:34px;font-weight:900;font-size:34px">${AUTOR}</div>
    <div style="font-weight:800;font-size:26px;color:var(--teal)">Médico${CRM ? ' · ' + CRM : ''}</div>
  </div>
</div>`);

// ---------- render ----------
const ALT = [
  'Capa: foto do Dr. Carlos Magno falando para a câmera. Texto: O peso voltou? Não é falta de disciplina.',
  'Gráfico ilustrativo do peso caindo e voltando a subir. Texto: Emagreceu, tentou manter os hábitos e o peso voltou.',
  'Mito: é só ter força de vontade. Realidade: o peso também é regulado por hormônios da fome, saciedade e gasto de energia.',
  'Dois mostradores: fome subindo e gasto de energia caindo. Estudo de 2011 mostrou hormônios do apetite alterados 1 ano após emagrecer.',
  'Semaglutida e tirzepatida atuam em vias hormonais do apetite e da saciedade. Uso só com prescrição.',
  'Foto do médico e lista do que é avaliado antes de prescrever: indicação, benefícios, efeitos adversos, outras doenças e remédios em uso.',
  'Obesidade é doença crônica. Dados de dois estudos sobre recuperação de peso após interromper semaglutida e tirzepatida.',
  'Foto do médico. Texto: se o peso voltou, isso não é falta de disciplina; pode ser o corpo respondendo.',
  'Cinco pilares do tratamento: medicamento se indicado, alimentação, exercício, sono e acompanhamento médico. Nenhum medicamento por conta própria.',
  'Foto do médico. Texto: tratar obesidade vai muito além do número na balança. Envie para quem usa remédio para obesidade.',
];

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? {executablePath: process.env.CHROMIUM_PATH} : {});
for (const [fmt, H] of [['3x4', 1440], ['4x5', 1350]]) {
  const out = path.join(DIR, 'export', fmt);
  fs.mkdirSync(out, {recursive: true});
  const page = await browser.newPage({viewport: {width: 1080, height: H}});
  for (let i = 0; i < S.length; i++) {
    const n = String(i + 1).padStart(2, '0');
    const extra = i === 0 ? '' : `<div class="num">${n}/${TOTAL}</div>` + (i < S.length - 1 ? `<div class="rod">${AUTOR}</div><div class="seta">→</div>` : '');
    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${css(H)}</style></head><body>${S[i]().replace(/<\/div>\s*$/, extra + '</div>')}</body></html>`;
    await page.setContent(html, {waitUntil: 'load'});
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({path: path.join(out, `${n}.jpg`), type: 'jpeg', quality: 93});
  }
  await page.close();
}
await browser.close();
fs.writeFileSync(path.join(DIR, 'export', 'alt-text.txt'), ALT.map((a, i) => `${String(i + 1).padStart(2, '0')}: ${a}`).join('\n') + '\n');
console.log('ok', S.length, 'slides');

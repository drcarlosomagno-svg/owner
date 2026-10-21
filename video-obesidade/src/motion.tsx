import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {Beat, C, FONT, W, fr} from './theme';

type P = {beat: Beat; h: number; bg?: string};
const rel = (beat: Beat, abs: number) => abs - fr(beat.t_in);
const useSpring = (at: number, damping = 12, stiffness = 180) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - at, fps, config: {damping, stiffness}});
};
const dur = (b: Beat) => fr(b.t_out) - fr(b.t_in);
const txt = (size: number, color: string, weight = 900): React.CSSProperties => ({
  fontFamily: FONT, fontWeight: weight, fontSize: size, color, letterSpacing: -0.5, lineHeight: 1.05,
});
const Selo: React.FC<{texto: string; cor?: string}> = ({texto, cor = 'rgba(255,255,255,0.7)'}) => (
  <div style={{position: 'absolute', right: 170, top: 70, ...txt(26, cor, 700), letterSpacing: 2, textTransform: 'uppercase'}}>{texto}</div>
);

// ---------- ícones simples (traço) ----------
export const Icone: React.FC<{nome: string; size?: number; cor?: string}> = ({nome, size = 120, cor = C.white}) => {
  const s = {fill: 'none', stroke: cor, strokeWidth: 7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const g: Record<string, React.ReactNode> = {
    fome: <><path d="M30 40 Q20 90 50 100 Q85 108 90 70 Q95 40 70 35 Q55 33 50 45 Q45 30 30 40Z" {...s} /><path d="M50 20 L50 35" {...s} /></>,
    saciedade: <><circle cx="60" cy="65" r="38" {...s} /><path d="M42 66 L56 80 L80 52" {...s} /></>,
    energia: <path d="M62 12 C80 40 92 52 88 78 C84 100 66 110 60 110 C42 110 28 96 30 76 C32 60 44 54 46 40 C56 52 58 60 56 70 C66 60 66 36 62 12Z" {...s} />,
    remedio: <><rect x="22" y="44" width="76" height="34" rx="17" {...s} transform="rotate(-35 60 61)" /><path d="M48 44 L72 78" {...s} /></>,
    prato: <><circle cx="60" cy="62" r="40" {...s} /><circle cx="60" cy="62" r="22" {...s} /></>,
    peso: <><path d="M30 100 L40 50 L80 50 L90 100Z" {...s} /><circle cx="60" cy="38" r="12" {...s} /></>,
    sono: <path d="M78 20 A42 42 0 1 0 100 78 A34 34 0 1 1 78 20Z" {...s} />,
    medico: <><path d="M35 20 L35 55 Q35 80 60 80 Q85 80 85 55 L85 20" {...s} /><path d="M60 80 L60 95 Q60 110 78 108" {...s} /><circle cx="86" cy="104" r="8" {...s} /></>,
    cadeado: <><rect x="28" y="54" width="64" height="52" rx="10" {...s} /><path d="M40 54 L40 38 Q40 18 60 18 Q80 18 80 38 L80 54" {...s} /></>,
    aberto: <><rect x="28" y="54" width="64" height="52" rx="10" {...s} /><path d="M40 54 L40 38 Q40 18 60 18 Q80 18 80 30" {...s} /></>,
    alerta: <><path d="M60 14 L108 100 L12 100Z" {...s} /><path d="M60 46 L60 72" {...s} /><circle cx="60" cy="86" r="3" {...s} /></>,
    aviao: <><path d="M10 58 L108 16 L80 104 L56 70Z" {...s} /><path d="M56 70 L108 16" {...s} /></>,
    check: <path d="M20 62 L48 90 L100 30" {...s} />,
    x: <><path d="M28 28 L92 92" {...s} /><path d="M92 28 L28 92" {...s} /></>,
    pessoa: <><circle cx="60" cy="30" r="16" {...s} /><path d="M30 108 Q30 58 60 58 Q90 58 90 108" {...s} /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 120 120">{g[nome]}</svg>;
};

// ---------- gráfico de peso esquemático ----------
const PONTOS = {
  desce: [[0, 0.2], [0.25, 0.32], [0.5, 0.55], [0.75, 0.72], [1, 0.8]],
  sanfona: [[0, 0.2], [0.3, 0.6], [0.5, 0.78], [0.7, 0.55], [1, 0.22]],
  pausa: [[0, 0.2], [0.3, 0.5], [0.55, 0.76], [0.6, 0.78]],
  volta: [[0, 0.2], [0.3, 0.5], [0.55, 0.76], [0.6, 0.78], [0.8, 0.5], [1, 0.3]],
};
export const Grafico: React.FC<P> = ({beat, h}) => {
  const f = useCurrentFrame();
  const modo = beat.render.modo as keyof typeof PONTOS;
  const pts = PONTOS[modo];
  const x0 = 120, x1 = W - 170, y0 = 170, y1 = h - 140;
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x0 + x * (x1 - x0)} ${y0 + y * (y1 - y0)}`).join(' ');
  const jaDesenhado = modo === 'sanfona' ? 0.5 : modo === 'volta' ? 0.6 : 0;
  const p = interpolate(f, [0, Math.min(dur(beat) - 6, 50)], [jaDesenhado, 1], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const pausaX = x0 + 0.6 * (x1 - x0);
  const marca = beat.render.marca_f ? rel(beat, beat.render.marca_f[0]) : 0;
  const sp = useSpring(modo === 'volta' ? -10 : marca);
  const pausa = modo === 'pausa' || modo === 'volta' ? sp : 0;
  const sobe = modo === 'sanfona' || modo === 'volta';
  return (
    <AbsoluteFill style={{background: C.navy}}>
      <svg width={W} height={h}>
        <defs>
          <linearGradient id="lg" x1="0" x2="1">
            <stop offset="0" stopColor={C.teal} />
            <stop offset={sobe ? 0.55 : 1} stopColor={C.teal} />
            <stop offset={sobe ? 0.62 : 1} stopColor={C.gold} />
          </linearGradient>
        </defs>
        <path d={`M${x0} ${y0 - 40} L${x0} ${y1} L${x1 + 30} ${y1}`} stroke="rgba(255,255,255,0.35)" strokeWidth={4} fill="none" />
        <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} stroke="url(#lg)" strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {pausa > 0.01 ? (
          <g transform={`translate(${pausaX} ${y0 - 10}) scale(${pausa})`}>
            <line x1={0} y1={0} x2={0} y2={y1 - y0 + 10} stroke={C.gold} strokeWidth={4} strokeDasharray="14 12" />
            <rect x={-34} y={-70} width={24} height={56} rx={6} fill={C.gold} />
            <rect x={10} y={-70} width={24} height={56} rx={6} fill={C.gold} />
          </g>
        ) : null}
      </svg>
      <div style={{position: 'absolute', left: x0 - 10, top: y0 - 110, ...txt(34, C.white, 800)}}>peso</div>
      <div style={{position: 'absolute', left: x1 - 80, top: y1 + 18, ...txt(34, C.white, 800)}}>tempo</div>
      {pausa > 0.01 ? <div style={{position: 'absolute', left: pausaX - 160, top: y0 - 150, width: 320, textAlign: 'center', ...txt(32, C.gold, 800), opacity: pausa}}>interrupção</div> : null}
      <Selo texto="esquema ilustrativo" />
    </AbsoluteFill>
  );
};

// ---------- mito × realidade ----------
export const Mito: React.FC<P> = ({beat, h}) => {
  const f = useCurrentFrame();
  const a = useSpring(0);
  const b = useSpring(10);
  const risco = interpolate(f, [8, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const card = (lado: 'e' | 'd', s: number): React.CSSProperties => ({
    position: 'absolute', top: 70, height: h - 140, width: 430, left: lado === 'e' ? 90 : 560,
    borderRadius: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28,
    padding: 30, textAlign: 'center', transform: `translateY(${(1 - s) * 120}px) scale(${0.9 + 0.1 * s})`, opacity: s,
  });
  return (
    <AbsoluteFill style={{background: C.off}}>
      <div style={{...card('e', a), background: C.navy}}>
        <Icone nome="x" size={110} cor="#E0565B" />
        <div style={{...txt(52, C.white), position: 'relative'}}>
          {beat.render.mito}
          <div style={{position: 'absolute', left: -10, right: -10, top: '50%', height: 9, background: C.gold, transform: `scaleX(${risco})`, transformOrigin: 'left'}} />
        </div>
      </div>
      <div style={{...card('d', b), background: C.teal}}>
        <Icone nome="check" size={110} cor={C.white} />
        <div style={txt(52, C.white)}>{beat.render.verdade}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- cérebro (perfil esquemático) ----------
export const Cerebro: React.FC<P> = ({beat, h}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, dur(beat)], [1, 1.35]);
  const pulso = (k: number) => 0.5 + 0.5 * Math.sin((f - k * 8) / 5);
  return (
    <AbsoluteFill style={{background: C.navy, alignItems: 'center', justifyContent: 'center'}}>
      <svg width={900} height={900} viewBox="0 0 400 400" style={{transform: `scale(${z})`, transformOrigin: '48% 48%'}}>
        <path d="M120 330 L120 280 Q70 250 80 180 Q90 80 200 70 Q300 70 320 160 Q330 200 300 220 L320 260 L295 268 L300 300 Q290 320 250 315 L240 340" fill="none" stroke={C.teal} strokeWidth={5} strokeLinecap="round" />
        <path d="M130 170 Q140 110 200 105 Q270 105 285 165 Q290 210 230 215 Q170 220 140 205 Q125 195 130 170Z" fill="rgba(26,165,184,0.12)" stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
        {[0, 1, 2].map((k) => (
          <circle key={k} cx={205} cy={200} r={10 + 40 * pulso(k)} fill="none" stroke={C.gold} strokeWidth={3} opacity={1 - pulso(k)} />
        ))}
        <circle cx={205} cy={200} r={11} fill={C.gold} />
      </svg>
      <div style={{position: 'absolute', top: 330, ...txt(48, C.white, 800), opacity: 0.9}}>mecanismos biológicos</div>
    </AbsoluteFill>
  );
};

// ---------- três ícones ----------
export const Icones: React.FC<P> = ({beat}) => {
  const m = (beat.render.marca_f as number[]).map((x) => rel(beat, x));
  const itens: [string, string][] = [['fome', 'Fome'], ['saciedade', 'Saciedade'], ['energia', 'Gasto de energia']];
  const s = [useSpring(m[0]), useSpring(m[1]), useSpring(m[2])];
  return (
    <AbsoluteFill style={{background: C.navy, alignItems: 'center', paddingTop: 260, gap: 60}}>
      {itens.map(([ic, nome], i) => (
        <div key={ic} style={{display: 'flex', alignItems: 'center', gap: 40, width: 760, transform: `scale(${s[i]})`, opacity: Math.min(1, s[i] * 1.5)}}>
          <div style={{width: 190, height: 190, borderRadius: 95, background: i === 2 ? C.gold : C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Icone nome={ic} size={130} />
          </div>
          <div style={txt(64, C.white)}>{nome}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ---------- mostradores (sem escala numérica) ----------
const Mostrador: React.FC<{titulo: string; de: number; para: number; at: number; cor: string; seta: string}> = ({titulo, de, para, at, cor, seta}) => {
  const s = useSpring(at, 9, 120);
  const ang = de + (para - de) * s;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
      <svg width={560} height={330} viewBox="0 0 280 165">
        <path d="M20 150 A120 120 0 0 1 260 150" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={18} strokeLinecap="round" />
        <path d="M20 150 A120 120 0 0 1 260 150" fill="none" stroke={cor} strokeWidth={18} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - (ang + 90) / 180} />
        <line x1={140} y1={150} x2={140 + 100 * Math.sin((ang * Math.PI) / 180)} y2={150 - 100 * Math.cos((ang * Math.PI) / 180)} stroke={C.white} strokeWidth={8} strokeLinecap="round" />
        <circle cx={140} cy={150} r={12} fill={C.white} />
      </svg>
      <div style={txt(56, C.white)}>{titulo} <span style={{color: cor}}>{seta}</span></div>
    </div>
  );
};
export const Mostradores: React.FC<P> = ({beat}) => {
  const m = (beat.render.marca_f as number[]).map((x) => rel(beat, x));
  return (
    <AbsoluteFill style={{background: C.navy, alignItems: 'center', paddingTop: 200, gap: 70}}>
      <Mostrador titulo="Fome" de={-30} para={60} at={m[0]} cor={C.gold} seta="▲" />
      <Mostrador titulo="Gasto energético" de={30} para={-60} at={m[1]} cor={C.teal} seta="▼" />
    </AbsoluteFill>
  );
};

// ---------- nomes dos princípios ativos ----------
export const Nomes: React.FC<P> = ({beat}) => {
  const m = (beat.render.marca_f as number[]).map((x) => rel(beat, x));
  const s = [useSpring(m[0] - 3), useSpring(m[1] - 3)];
  return (
    <AbsoluteFill style={{background: C.off, alignItems: 'center', justifyContent: 'center', gap: 40, paddingBottom: 380}}>
      <div style={{...txt(34, C.navy, 800), letterSpacing: 4, textTransform: 'uppercase', opacity: 0.7}}>princípios ativos</div>
      {['SEMAGLUTIDA', 'TIRZEPATIDA'].map((n, i) => (
        <div key={n} style={{background: i ? C.teal : C.navy, borderRadius: 30, padding: '34px 60px', transform: `translateX(${(1 - s[i]) * (i ? 900 : -900)}px) rotate(${(1 - s[i]) * 8}deg)`}}>
          <div style={txt(92, C.white)}>{n}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ---------- sinal hormonal intestino → cérebro ----------
export const Hormonios: React.FC<P> = ({beat}) => {
  const f = useCurrentFrame();
  const corpo = beat.render.corpo;
  const path = 'M540 1180 C 380 1000, 700 760, 540 560';
  return (
    <AbsoluteFill style={{background: C.navy}}>
      <svg width={W} height={1920}>
        {corpo ? (
          <path d="M540 300 m-110 0 a110 110 0 1 0 220 0 a110 110 0 1 0 -220 0 M380 1500 L400 700 Q410 480 540 470 Q670 480 680 700 L700 1500" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={8} />
        ) : null}
        <circle cx={540} cy={corpo ? 300 : 480} r={corpo ? 95 : 120} fill="rgba(26,165,184,0.18)" stroke={C.teal} strokeWidth={6} />
        <path d="M430 1180 Q440 1080 540 1090 Q650 1080 650 1180 Q660 1300 540 1290 Q420 1300 430 1180Z" fill="rgba(201,162,39,0.2)" stroke={C.gold} strokeWidth={6} />
        <path d={corpo ? 'M540 1180 C 380 1000, 700 600, 540 320' : path} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={4} strokeDasharray="10 14" />
        {new Array(9).fill(0).map((_, k) => {
          const t = ((f + k * 7) % 45) / 45;
          // ponto ao longo da curva de Bézier
          const [x0, y0, x1, y1, x2, y2, x3, y3] = corpo ? [540, 1180, 380, 1000, 700, 600, 540, 320] : [540, 1180, 380, 1000, 700, 760, 540, 560];
          const u = 1 - t;
          const x = u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3;
          const y = u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3;
          return <circle key={k} cx={x} cy={y} r={12} fill={k % 2 ? C.teal : C.gold} opacity={Math.sin(t * Math.PI)} />;
        })}
      </svg>
      <div style={{position: 'absolute', left: 700, top: 1160, ...txt(40, C.gold, 800)}}>intestino</div>
      <div style={{position: 'absolute', left: 700, top: corpo ? 280 : 460, ...txt(40, C.teal, 800)}}>cérebro</div>
      <div style={{position: 'absolute', width: W, top: corpo ? 1560 : 1420, textAlign: 'center', ...txt(42, C.white, 800), opacity: 0.85}}>
        {corpo ? 'o corpo responde' : 'apetite · saciedade'}
      </div>
    </AbsoluteFill>
  );
};

// ---------- checklist ----------
export const Checklist: React.FC<P> = ({beat, h}) => {
  const f = useCurrentFrame();
  const itens = beat.render.itens as string[];
  const m = (beat.render.marca_f as number[]).map((x) => rel(beat, x));
  const {fps} = useVideoConfig();
  const top = beat.render.pip ? 170 : 110;
  const gap = Math.min(150, (h - top - (beat.render.pip ? 820 : 80)) / itens.length);
  return (
    <AbsoluteFill style={{background: C.off}}>
      <div style={{position: 'absolute', left: 90, top: top - 10, ...txt(34, C.navy, 800), letterSpacing: 4, textTransform: 'uppercase', opacity: 0.6}}>
        {beat.render.pip && itens.length === 3 ? 'o que pode ajudar' : 'o que eu avalio'}
      </div>
      {itens.map((it, i) => {
        const ok = spring({frame: f - m[i], fps, config: {damping: 11, stiffness: 260}});
        const visivel = m[i] < 10 ** 5;
        return (
          <div key={it} style={{position: 'absolute', left: 90, top: top + 60 + i * gap, display: 'flex', alignItems: 'center', gap: 30, opacity: visivel ? 1 : 0.35}}>
            <div style={{width: 84, height: 84, borderRadius: 20, border: `6px solid ${C.navy}`, background: ok > 0.05 ? C.teal : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{transform: `scale(${ok})`}}><Icone nome="check" size={70} /></div>
            </div>
            <div style={txt(56, C.navy, 800)}>{it}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- linha do tempo ----------
export const LinhaTempo: React.FC<P> = ({beat}) => {
  const f = useCurrentFrame();
  const cont = beat.render.continua;
  const p = cont ? 1 : interpolate(f, [0, dur(beat) - 10], [0, 1], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const ext = cont ? interpolate(f, [0, dur(beat)], [0, 1]) : 0;
  const y = cont ? 620 : 860;
  const pts = [0.08, 0.3, 0.52, 0.74, 0.92];
  return (
    <AbsoluteFill style={{background: cont ? C.off : C.navy}}>
      <svg width={W} height={1920}>
        <line x1={90} y1={y} x2={90 + (W - 240) * p} y2={y} stroke={C.teal} strokeWidth={12} strokeLinecap="round" />
        {pts.map((x, i) => (p >= x ? <circle key={i} cx={90 + (W - 240) * x} cy={y} r={26} fill={i % 2 ? C.gold : C.teal} stroke={cont ? C.off : C.navy} strokeWidth={8} /> : null))}
        {cont ? <line x1={90} y1={y + 120} x2={90 + (W - 240) * ext} y2={y + 120} stroke={C.gold} strokeWidth={10} strokeDasharray="2 22" strokeLinecap="round" /> : null}
      </svg>
      <div style={{position: 'absolute', left: 90, top: y - 150, ...txt(40, cont ? C.navy : C.white, 800)}}>acompanhamento</div>
      <div style={{position: 'absolute', right: 170, top: y + 60, ...txt(36, cont ? C.navy : C.white, 700), opacity: 0.7}}>ao longo do tempo →</div>
    </AbsoluteFill>
  );
};

// ---------- texto grande ----------
export const TextoGrande: React.FC<{texto: string}> = ({texto}) => {
  const s = useSpring(2, 9, 200);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 300}}>
      <div style={{...txt(150, C.gold), textAlign: 'center', transform: `scale(${0.6 + 0.4 * s})`, textShadow: '0 10px 40px rgba(0,0,0,0.6)', WebkitTextStroke: '6px #071420', paintOrder: 'stroke fill'}}>
        {texto.split(' ').map((w) => <div key={w}>{w}</div>)}
      </div>
    </AbsoluteFill>
  );
};

// ---------- peças que se encaixam ----------
export const Pecas: React.FC<P> = ({beat}) => {
  const itens: [string, string][] = [['remedio', 'Medicamento'], ['prato', 'Alimentação'], ['peso', 'Exercício'], ['sono', 'Sono'], ['medico', 'Acompanhamento']];
  const fim = dur(beat) - 24;
  return (
    <AbsoluteFill style={{background: C.navy}}>
      {itens.map(([ic, nome], i) => {
        const s = useSpring(i * 6, 13, 150);
        const ang = (i / itens.length) * Math.PI * 2 - Math.PI / 2;
        const R = 330 + (1 - s) * 500;
        const x = 540 + Math.cos(ang) * R, y = 760 + Math.sin(ang) * R;
        return (
          <div key={ic} style={{position: 'absolute', left: x - 120, top: y - 120, width: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: s}}>
            <div style={{width: 170, height: 170, borderRadius: 85, background: i === 0 ? C.gold : C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icone nome={ic} size={110} /></div>
            <div style={txt(32, C.white, 800)}>{nome}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 340, top: 700, width: 400, textAlign: 'center', ...txt(40, C.gold, 900), opacity: useSpring(fim)}}>complementares</div>
    </AbsoluteFill>
  );
};

// ---------- silhuetas diferentes, caminhos diferentes ----------
export const Silhuetas: React.FC<P> = ({h}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.navy}}>
      <svg width={W} height={h}>
        {new Array(5).fill(0).map((_, i) => {
          const x = 150 + i * 190;
          const esc = 0.8 + random(`s${i}`) * 0.5;
          const p = interpolate(f, [i * 4, i * 4 + 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const caminho = `M${x} ${h - 420} q ${(random(`a${i}`) - 0.5) * 160} 120 ${(random(`b${i}`) - 0.5) * 120} 300`;
          return (
            <g key={i}>
              <g transform={`translate(${x - 60 * esc} ${h - 700}) scale(${esc})`}><circle cx={60} cy={60} r={42} fill="rgba(255,255,255,0.85)" /><path d="M5 260 Q5 120 60 120 Q115 120 115 260Z" fill="rgba(255,255,255,0.85)" /></g>
              <path d={caminho} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} stroke={i % 2 ? C.gold : C.teal} strokeWidth={10} fill="none" strokeLinecap="round" />
            </g>
          );
        })}
      </svg>
      <Selo texto="ilustrativo" />
    </AbsoluteFill>
  );
};

// ---------- balança com dígitos girando (nenhum número legível) ----------
export const Balanca: React.FC<P> = ({beat}) => {
  const f = useCurrentFrame();
  const m = rel(beat, (beat.render.marca_f as number[])[0]);
  const z = interpolate(f, [m - 4, m + 14], [1.6, 0.55], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const pessoa = interpolate(f, [m, m + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.off, alignItems: 'center', justifyContent: 'center', paddingBottom: 300}}>
      <div style={{position: 'absolute', top: 260, opacity: pessoa, transform: `scale(${0.8 + 0.2 * pessoa})`}}><Icone nome="pessoa" size={520} cor={C.navy} /></div>
      <div style={{transform: `scale(${z}) translateY(${interpolate(z, [0.55, 1.6], [520, 0])}px)`}}>
        <div style={{width: 640, height: 260, borderRadius: 40, background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'}}>
          {/* visor sem número legível: segmentos piscando */}
          <div style={{display: 'flex', gap: 34}}>
            {[0, 1, 2].map((k) => (
              <div key={k} style={{width: 120, height: 22, borderRadius: 11, background: C.teal, opacity: 0.35 + 0.65 * random(`d${Math.floor(f / 3)}${k}`)}} />
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- overlays ----------
export const Risco: React.FC<{beat: Beat}> = ({beat}) => {
  const f = useCurrentFrame();
  const m = rel(beat, (beat.render.marca_f as number[])[0]);
  const s = useSpring(0, 10, 200);
  const r = interpolate(f, [m, m + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', top: 300, width: W, display: 'flex', justifyContent: 'center', transform: `scale(${s})`}}>
      <div style={{position: 'relative', background: C.navy, padding: '20px 40px', borderRadius: 24, ...txt(64, C.white)}}>
        {beat.render.texto}
        <div style={{position: 'absolute', left: 20, right: 20, top: '50%', height: 10, background: C.gold, transform: `scaleX(${r}) rotate(-3deg)`, transformOrigin: 'left'}} />
      </div>
    </div>
  );
};

export const Interrogacao: React.FC = () => {
  const s = useSpring(3, 6, 220);
  return <div style={{position: 'absolute', right: 190, top: 330, ...txt(260, C.gold), transform: `scale(${s}) rotate(${(1 - s) * -30}deg)`, textShadow: '0 10px 30px rgba(0,0,0,0.5)'}}>?</div>;
};

export const Alerta: React.FC = () => {
  const s = useSpring(2, 8, 220);
  return <div style={{position: 'absolute', left: 440, top: 260, transform: `scale(${s})`}}><Icone nome="alerta" size={200} cor={C.gold} /></div>;
};

export const LowerThird: React.FC = () => {
  const s = useSpring(0, 14, 160);
  return (
    <div style={{position: 'absolute', left: 90, top: 1480, transform: `translateX(${(1 - s) * -700}px)`, display: 'flex', alignItems: 'stretch'}}>
      <div style={{width: 12, background: C.gold, borderRadius: 6}} />
      <div style={{background: 'rgba(20,48,74,0.92)', padding: '16px 28px', borderRadius: '0 18px 18px 0'}}>
        <div style={txt(46, C.white)}>Dr. Carlos Magno</div>
        <div style={txt(30, C.teal, 800)}>Médico</div>
      </div>
    </div>
  );
};

// Cadeado do open loop: fica no canto até a resposta, depois abre
export const LoopCadeado: React.FC<{abre: number}> = ({abre}) => {
  const f = useCurrentFrame();
  const s = useSpring(0, 10, 200);
  const aberto = f >= abre;
  const sai = interpolate(f, [abre + 6, abre + 20], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pulso = 1 + 0.06 * Math.sin(f / 6);
  return (
    <div style={{position: 'absolute', left: 90, top: 150, opacity: sai, transform: `scale(${s * (aberto ? 1.25 : pulso)})`, display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(20,48,74,0.88)', borderRadius: 30, padding: '12px 26px 12px 16px', border: `3px solid ${aberto ? C.gold : C.teal}`}}>
      <Icone nome={aberto ? 'aberto' : 'cadeado'} size={74} cor={aberto ? C.gold : C.white} />
      <div style={txt(36, C.white, 800)}>medicamentos{aberto ? '' : ' ?'}</div>
    </div>
  );
};

export const CTA: React.FC<{texto: string}> = ({texto}) => {
  const f = useCurrentFrame();
  const s = useSpring(0, 12, 170);
  const pulso = 1 + 0.08 * Math.max(0, Math.sin(f / 5));
  return (
    <div style={{position: 'absolute', left: 90, width: 840, top: 170, transform: `translateY(${(1 - s) * -300}px)`, opacity: s, display: 'flex', alignItems: 'center', gap: 24, background: C.gold, borderRadius: 30, padding: '24px 30px', boxShadow: '0 16px 40px rgba(0,0,0,0.35)'}}>
      <div style={{transform: `scale(${pulso})`}}><Icone nome="aviao" size={96} cor={C.navy} /></div>
      <div style={txt(42, C.navy, 900)}>{texto}</div>
    </div>
  );
};

import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, Easing} from 'remotion';
import {C, H, W} from './theme';

const ease = Easing.bezier(0.2, 0.9, 0.25, 1.15); // leve overshoot

// Entrada de cada beat (quadros relativos ao início do beat)
export const Entrada: React.FC<{tipo: string; children: React.ReactNode}> = ({tipo, children}) => {
  const f = useCurrentFrame();
  let style: React.CSSProperties = {};
  if (tipo === 'whip') {
    const p = interpolate(f, [0, 8], [1, 0], {extrapolateRight: 'clamp', easing: ease});
    style = {transform: `translateX(${p * 420}px)`, filter: `blur(${p * 28}px)`};
  } else if (tipo === 'zoom') {
    const p = interpolate(f, [0, 10], [1, 0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
    style = {transform: `scale(${1 + p * 0.7})`, filter: `blur(${p * 18}px)`, opacity: 1 - p * 0.3};
  } else if (tipo === 'mask') {
    const r = interpolate(f, [0, 10], [0, 120], {extrapolateRight: 'clamp', easing: ease});
    style = {clipPath: `circle(${r}% at 50% 45%)`};
  } else if (tipo === 'glitch' && f < 3) {
    style = {transform: `translateX(${(random(`g${f}`) - 0.5) * 60}px)`, filter: 'hue-rotate(90deg) saturate(2)'};
  }
  return (
    <AbsoluteFill style={style}>
      {children}
      {tipo === 'glitch' && f < 3 ? <Glitch seed={f} /> : null}
    </AbsoluteFill>
  );
};

export const Glitch: React.FC<{seed: number}> = ({seed}) => (
  <AbsoluteFill style={{mixBlendMode: 'screen'}}>
    {new Array(7).fill(0).map((_, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: 0,
          width: W,
          top: random(`y${seed}${i}`) * H,
          height: 20 + random(`h${seed}${i}`) * 90,
          background: i % 2 ? 'rgba(255,0,60,0.55)' : 'rgba(0,230,255,0.55)',
          transform: `translateX(${(random(`x${seed}${i}`) - 0.5) * 200}px)`,
        }}
      />
    ))}
  </AbsoluteFill>
);

// Flash branco de 2 quadros com queda rápida, a partir de `em` (quadro relativo)
export const Flash: React.FC<{em: number}> = ({em}) => {
  const f = useCurrentFrame() - em;
  if (f < 0 || f > 6) return null;
  const o = f < 2 ? 1 : interpolate(f, [2, 6], [1, 0]);
  return <AbsoluteFill style={{background: 'white', opacity: o}} />;
};

export const GlitchEm: React.FC<{em: number}> = ({em}) => {
  const f = useCurrentFrame() - em;
  if (f < 0 || f > 2) return null;
  return <Glitch seed={em + f} />;
};

// Light leak suave nas cenas de história
export const Leak: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 4, 18], [0, 0.7, 0], {extrapolateRight: 'clamp'});
  const x = interpolate(f, [0, 18], [20, 80]);
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: 'screen',
        opacity: o,
        background: `radial-gradient(circle at ${x}% 30%, rgba(255,170,80,0.95), rgba(255,90,40,0.4) 35%, transparent 65%)`,
      }}
    />
  );
};

// Camada global: grão 5%, vinheta e grading leve (teal nas sombras)
export const Acabamento: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: C.teal, mixBlendMode: 'soft-light', opacity: 0.1}} />
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 62%, rgba(5,15,25,0.32) 100%)'}}
      />
      <svg width={W} height={H} style={{position: 'absolute', opacity: 0.05, mixBlendMode: 'overlay'}}>
        <filter id="grao">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 30} />
        </filter>
        <rect width={W} height={H} filter="url(#grao)" />
      </svg>
    </AbsoluteFill>
  );
};

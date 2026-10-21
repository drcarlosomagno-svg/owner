import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Beat, C, EDL, FONT, HALF_Y, LEGENDA, SAFE, SPLIT_Y} from './theme';

// Altura da legenda conforme o layout do beat (no split, fica na divisória)
const yDoLayout = (b: Beat) => {
  if (b.layout === 'SPLIT_TOP_BROLL') return SPLIT_Y;
  if (b.layout === 'SPLIT_50_50') return HALF_Y;
  if (b.layout === 'PIP') return 1060;
  return 1300;
};

export const Legenda: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const i = LEGENDA.findIndex(
    (b, k) => frame >= b.f_in && (k + 1 >= LEGENDA.length || frame < LEGENDA[k + 1].f_in)
  );
  if (i < 0) return null;
  const bloco = LEGENDA[i];
  const ultimo = bloco.palavras[bloco.palavras.length - 1];
  if (frame > ultimo.f_out + 12) return null; // some nas pausas longas
  const beat = EDL.beats[bloco.palavras[0].beat];
  const y = yDoLayout(beat);
  const entra = spring({frame: frame - bloco.f_in, fps, config: {damping: 14, stiffness: 220}});
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.left,
        width: SAFE.right - SAFE.left,
        top: y,
        transform: `translateY(-50%) scale(${0.85 + 0.15 * entra})`,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 80,
        lineHeight: 1.08,
        letterSpacing: -1,
        textAlign: 'center',
      }}
    >
      {bloco.palavras.map((p, k) => {
        const ativa = frame >= p.f_in && frame < Math.max(p.f_out, p.f_in + 4);
        const pop = ativa ? spring({frame: frame - p.f_in, fps, config: {damping: 10, stiffness: 300}}) : 0;
        const cor = p.enfase ? C.gold : ativa ? C.teal : C.white;
        return (
          <span
            key={k}
            style={{
              color: cor,
              display: 'inline-block',
              margin: '0 22px',
              transform: `scale(${ativa ? 1 + 0.1 * pop : 1})`,
              WebkitTextStroke: '10px #071420',
              paintOrder: 'stroke fill',
              textShadow: '0 6px 18px rgba(0,0,0,0.55)',
            }}
          >
            {p.w}
          </span>
        );
      })}
    </div>
  );
};

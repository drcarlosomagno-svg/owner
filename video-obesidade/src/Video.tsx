import React from 'react';
import {AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Beat, broll, C, EDL, EYES, FONT, fontesCss, fr, H, HALF_Y, SPLIT_Y, temArquivo, W} from './theme';
import {Acabamento, Entrada, Flash, GlitchEm, Leak} from './fx';
import {Legenda} from './captions';
import * as M from './motion';

// Minha imagem: vídeo-base no ponto certo, com zoom centrado nos olhos.
// `caixa` é a área visível; o vídeo é posicionado para os olhos caírem no centro dela.
const Fala: React.FC<{beat: Beat; top: number; h: number; desfoque?: boolean}> = ({beat, top, h, desfoque}) => {
  const f = useCurrentFrame();
  const r = beat.render;
  const n = fr(beat.t_out) - fr(beat.t_in);
  let z = r.zoom ? interpolate(f, [0, n], r.zoom) : 1;
  if (r.degrau_f !== undefined && f >= r.degrau_f - fr(beat.t_in)) z = r.degrau;
  const eyeY = EYES.y * H;
  const dy = top + h / 2 - eyeY; // desloca o vídeo para os olhos ficarem no centro da caixa
  const ini = beat.id === 0 ? fr(EDL.cold_open[0]) : fr(beat.t_in - EDL.off);
  return (
    <div style={{position: 'absolute', left: 0, top, width: W, height: h, overflow: 'hidden', background: C.ink}}>
      <div style={{position: 'absolute', left: 0, top: dy - top, width: W, height: H, transform: `scale(${z})`, transformOrigin: `${EYES.x * 100}% ${EYES.y * 100}%`}}>
        <OffthreadVideo
          src={staticFile('base.mp4')}
          startFrom={ini}
          muted
          style={{width: W, height: H, filter: `contrast(1.06) saturate(1.04) brightness(1.02)${desfoque ? ' blur(16px) brightness(0.55)' : ''}`}}
        />
      </div>
    </div>
  );
};

// B-roll gerado (imagem): Ken Burns lento. Se o arquivo não chegou, mostra o nome do arquivo esperado.
const Broll: React.FC<{nome: string; beat: Beat; top?: number; h?: number; desde?: number; ate?: number}> = ({nome, beat, top = 0, h = H, desde = 0, ate}) => {
  const f = useCurrentFrame();
  const n = (ate ?? fr(beat.t_out) - fr(beat.t_in)) - desde;
  const p = interpolate(f - desde, [0, n], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const z = 1.06 + 0.1 * p;
  return (
    <div style={{position: 'absolute', left: 0, top, width: W, height: h, overflow: 'hidden', background: C.navy}}>
      {temArquivo(nome) ? (
        <Img src={broll(nome)} style={{width: W, height: (W * 16) / 9, objectFit: 'cover', position: 'absolute', top: (h - (W * 16) / 9) / 2, transform: `scale(${z}) translateY(${(0.5 - p) * 30}px)`, filter: 'contrast(1.04)'}} />
      ) : (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', border: `8px dashed ${C.gold}`}}>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 44, color: C.gold, textAlign: 'center', padding: 60}}>
            B-roll pendente<br />public/broll/{nome}
          </div>
        </AbsoluteFill>
      )}
      <div style={{position: 'absolute', left: 90, top: top === 0 && h === H ? 1600 : h - 60, fontFamily: FONT, fontWeight: 700, fontSize: 24, color: 'rgba(255,255,255,0.75)', letterSpacing: 1}}>
        imagem ilustrativa · gerada por IA
      </div>
    </div>
  );
};

const MOTION: Record<string, React.FC<{beat: Beat; h: number}>> = {
  grafico: M.Grafico, mito: M.Mito, cerebro: M.Cerebro, icones: M.Icones, mostradores: M.Mostradores,
  nomes: M.Nomes, hormonios: M.Hormonios, checklist: M.Checklist, linha_tempo: M.LinhaTempo,
  pecas: M.Pecas, silhuetas: M.Silhuetas, balanca: M.Balanca,
};

const Grafismo: React.FC<{beat: Beat; top: number; h: number}> = ({beat, top, h}) => {
  const r = beat.render;
  const Comp = MOTION[r.motion];
  return (
    <div style={{position: 'absolute', left: 0, top, width: W, height: h, overflow: 'hidden'}}>
      {r.broll ? <Broll nome={r.broll} beat={beat} h={h} /> : Comp ? <Comp beat={beat} h={h} /> : null}
    </div>
  );
};

const Montagem: React.FC<{beat: Beat}> = ({beat}) => {
  const f = useCurrentFrame();
  const ini = fr(beat.t_in);
  const m = (beat.render.marca_f as number[]).map((x) => x - ini - 3);
  const k = f >= m[2] ? 2 : f >= m[1] ? 1 : 0;
  const nomes = beat.render.montagem as string[];
  return <Broll key={k} nome={nomes[k]} beat={beat} desde={k ? m[k] : 0} ate={k < 2 ? m[k + 1] : undefined} />;
};

const BeatView: React.FC<{beat: Beat}> = ({beat}) => {
  const r = beat.render;
  const ini = fr(beat.t_in);
  const relf = (abs: number) => abs - ini;
  let corpo: React.ReactNode;
  switch (beat.layout) {
    case 'FULL_TALK':
      corpo = <Fala beat={beat} top={0} h={H} />;
      break;
    case 'SPLIT_TOP_BROLL':
      corpo = (
        <>
          <Fala beat={beat} top={SPLIT_Y} h={H - SPLIT_Y} />
          <Entrada tipo={r.trans === 'split' ? 'split' : 'none'}>
            <SplitSlide ativo={r.trans === 'split'}><Grafismo beat={beat} top={0} h={SPLIT_Y} /></SplitSlide>
          </Entrada>
          <div style={{position: 'absolute', top: SPLIT_Y - 4, width: W, height: 8, background: C.gold}} />
        </>
      );
      break;
    case 'SPLIT_50_50':
      corpo = (
        <>
          <Fala beat={beat} top={0} h={HALF_Y} />
          <Grafismo beat={beat} top={HALF_Y} h={H - HALF_Y} />
          <div style={{position: 'absolute', top: HALF_Y - 4, width: W, height: 8, background: C.gold}} />
        </>
      );
      break;
    case 'FULL_BROLL':
      corpo = r.montagem ? <Montagem beat={beat} /> : <Broll nome={r.broll} beat={beat} />;
      break;
    case 'PIP':
      corpo = (
        <>
          <Grafismo beat={beat} top={0} h={H} />
          <PipCirculo beat={beat} />
        </>
      );
      break;
    case 'FULL_MOTION':
      corpo = r.motion === 'texto_grande' ? (
        <>
          <Fala beat={beat} top={0} h={H} desfoque />
          <M.TextoGrande texto={r.texto} />
        </>
      ) : (
        <Grafismo beat={beat} top={0} h={H} />
      );
      break;
  }
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Entrada tipo={beat.layout === 'SPLIT_TOP_BROLL' ? 'none' : r.trans}>{corpo}</Entrada>
      {r.motion === 'risco' ? <M.Risco beat={beat} /> : null}
      {r.interrogacao ? <M.Interrogacao /> : null}
      {r.alerta ? <M.Alerta /> : null}
      {r.terco ? <M.LowerThird /> : null}
      {r.trans === 'leak' ? <Leak /> : null}
      {r.trans === 'flash' ? <Flash em={0} /> : null}
      {r.flash_f !== undefined ? <Flash em={relf(r.flash_f)} /> : null}
      {r.glitch_f !== undefined ? <GlitchEm em={relf(r.glitch_f)} /> : null}
      {beat.id === 0 && r.marca_f ? <GlitchEm em={relf(r.marca_f[0])} /> : null}
    </AbsoluteFill>
  );
};

// B-roll empurra minha imagem: entra de cima em 9 quadros
const SplitSlide: React.FC<{ativo: boolean; children: React.ReactNode}> = ({ativo, children}) => {
  const f = useCurrentFrame();
  const y = ativo ? interpolate(f, [0, 9], [-SPLIT_Y, 0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}) : 0;
  return <div style={{position: 'absolute', left: 0, top: 0, width: W, height: SPLIT_Y, transform: `translateY(${y}px)`}}>{children}</div>;
};

const PipCirculo: React.FC<{beat: Beat}> = ({beat}) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 10], [2.2, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.4))});
  const D = 420;
  return (
    <div style={{position: 'absolute', left: 90, top: 1180, width: D, height: D, borderRadius: D / 2, overflow: 'hidden', border: `8px solid ${C.teal}`, transform: `scale(${s})`, transformOrigin: '0% 100%', boxShadow: '0 16px 40px rgba(0,0,0,0.35)'}}>
      <div style={{position: 'absolute', left: -(W - D) / 2, top: -(EYES.y * H - D / 2) * 1 - 40, width: W, height: H, transform: 'scale(0.75)', transformOrigin: `${EYES.x * 100}% ${EYES.y * 100}%`}}>
        <OffthreadVideo src={staticFile('base.mp4')} startFrom={fr(beat.t_in - EDL.off)} muted style={{width: W, height: H}} />
      </div>
    </div>
  );
};

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <style>{fontesCss}</style>
      {EDL.beats.map((b) => (
        <Sequence key={b.id} from={fr(b.t_in)} durationInFrames={fr(b.t_out) - fr(b.t_in)} name={`beat ${b.id} ${b.layout}`}>
          <BeatView beat={b} />
        </Sequence>
      ))}
      <Sequence from={EDL.loop.f_in} durationInFrames={EDL.loop.f_out - EDL.loop.f_in + 24} name="open loop">
        <M.LoopCadeado abre={EDL.loop.f_out - EDL.loop.f_in} />
      </Sequence>
      <Sequence from={EDL.cta.f_in} name="CTA">
        <M.CTA texto={EDL.cta.texto} />
      </Sequence>
      <Acabamento />
      <Legenda />
    </AbsoluteFill>
  );
};

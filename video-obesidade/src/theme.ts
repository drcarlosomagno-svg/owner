import {staticFile} from 'remotion';
import edlJson from './edl.json';
import legendaJson from './legenda.json';

export const C = {
  navy: '#14304A',
  teal: '#1AA5B8',
  gold: '#C9A227',
  off: '#F5F3EE',
  ink: '#0B1B2A',
  white: '#FFFFFF',
};
export const W = 1080;
export const H = 1920;
export const FONT = 'Montserrat, "Inter", Arial, sans-serif';

// área segura do Instagram: 90 px nas laterais, 150 px à direita (ícones), 250 px embaixo
export const SAFE = {left: 90, right: W - 150, bottom: H - 250};
// divisória do split 60/40 e do 50/50
export const SPLIT_Y = 1152;
export const HALF_Y = 960;
// olhos no vídeo-base (fração da altura), calibrado nos quadros de checagem
export const EYES = {x: 0.5, y: 0.45};

export type Render = Record<string, any>;
export type Beat = {
  id: number;
  t_in: number;
  t_out: number;
  src_in: number;
  src_out: number;
  fala: string;
  layout: 'FULL_TALK' | 'SPLIT_TOP_BROLL' | 'SPLIT_50_50' | 'FULL_BROLL' | 'FULL_MOTION' | 'PIP';
  enfase: string[];
  render: Render;
};
export type Palavra = {w: string; f_in: number; f_out: number; beat: number; enfase: boolean};
export type Bloco = {f_in: number; palavras: Palavra[]};

export const EDL = edlJson as unknown as {
  fps: number;
  duracao: number;
  off: number;
  co_quadros: number;
  cold_open: [number, number];
  cta: {texto: string; f_in: number};
  loop: {f_in: number; f_out: number};
  beats: Beat[];
};
export const LEGENDA = legendaJson as unknown as Bloco[];

export const fr = (t: number) => Math.round(t * EDL.fps);

// B-roll e SFX ficam em public/; um arquivo ausente vira placeholder nomeado
import disponiveis from './disponiveis.json';
export const temArquivo = (nome: string) => (disponiveis as string[]).includes(nome);
export const broll = (nome: string) => staticFile(`broll/${nome}`);

export const fontesCss = `
@font-face{font-family:Montserrat;font-weight:700;src:url(${staticFile('fonts/montserrat-latin-700-normal.woff2')}) format('woff2');}
@font-face{font-family:Montserrat;font-weight:800;src:url(${staticFile('fonts/montserrat-latin-800-normal.woff2')}) format('woff2');}
@font-face{font-family:Montserrat;font-weight:900;src:url(${staticFile('fonts/montserrat-latin-900-normal.woff2')}) format('woff2');}
@font-face{font-family:Montserrat;font-weight:800;src:url(${staticFile('fonts/montserrat-latin-ext-800-normal.woff2')}) format('woff2');unicode-range:U+0100-02AF,U+1E00-1EFF;}
@font-face{font-family:Montserrat;font-weight:900;src:url(${staticFile('fonts/montserrat-latin-ext-900-normal.woff2')}) format('woff2');unicode-range:U+0100-02AF,U+1E00-1EFF;}
`;

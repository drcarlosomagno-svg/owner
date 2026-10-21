import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import {EDL, H, W} from './theme';

export const Root: React.FC = () => (
  <Composition id="Video" component={Video} durationInFrames={Math.round(EDL.duracao * EDL.fps)} fps={EDL.fps} width={W} height={H} />
);

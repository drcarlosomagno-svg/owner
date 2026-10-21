# Vídeo · Obesidade e tratamento (Reels 9:16)

Pipeline reproduzível: transcrição → cortes → EDL → assets → Remotion → mix/masterização.
Tudo é dirigido por `edl.json`: edite `BEATS`/`RENDER` em `scripts/edl.py`, rode de novo e o vídeo se refaz.

| Fase | Comando | Saída |
|---|---|---|
| 1. Transcrição | `python3 -I scripts/transcrever.py /caminho/dos/modelos` | `work/transcript.json` (bruto) |
| 1. Cortes + voz | `python3 -I scripts/cortar.py` | `transcript.json`, `cuts.json`, `work/base.mp4` |
| 2. EDL | `python3 -I scripts/edl.py && cp edl.json src/` | `edl.json`, `edl.md`, `src/legenda.json` |
| 3. Assets | `scripts/baixar_runway.sh` (Runway) · `scripts/sfx_sintetico.sh` | `public/broll/`, `public/sfx/` |
| 4. Composição | `cp work/base.mp4 public/ && npx remotion render src/index.ts Video out/video_render.mp4 --crf=18 --muted` | vídeo sem áudio |
| 5. Mix + entrega | `scripts/finalizar.sh` | `out/video_final.mp4`, `out/contact_sheet.jpg`, quadros de checagem |

- Prévia ao vivo: `npm run studio`.
- `raw/`, `work/`, `public/base.mp4` e `out/` ficam fora do git (pesados). O vídeo final e a contact sheet entregues ficam em `entrega/`.
- Modelos (sherpa-onnx, baixados do GitHub): Whisper large-v3 int8 para o texto, Parakeet-TDT 0.6b v3 int8 para o tempo de cada palavra, Silero VAD.
- Pausas medidas na energia do áudio (acima de 0,35 s viram ~0,19 s); crossfade de áudio de 3 quadros em cada corte.
- Voz: high-pass 80 Hz, de-esser, compressão 3:1. Mix final: loudnorm em 2 passadas (−14 LUFS, −1 dBTP).
- Música: coloque `public/musica.mp3` e rode `scripts/finalizar.sh`; o mix aplica ducking de −15 dB sob a voz e o drop de 0,4 s antes de "Nenhum medicamento…".
- B-roll que não está em `public/broll/` aparece como quadro "B-roll pendente" com o nome do arquivo esperado.

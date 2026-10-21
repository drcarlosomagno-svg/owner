# Vídeo · Obesidade e tratamento (Reels 9:16)

Pipeline reproduzível: transcrição → cortes → EDL → (assets) → Remotion → masterização.

| Fase | Comando | Saída |
|---|---|---|
| 1. Transcrição | `python3 -I scripts/transcrever.py /caminho/dos/modelos` | `work/transcript.json` (bruto) |
| 1. Cortes + voz | `python3 -I scripts/cortar.py` | `transcript.json`, `cuts.json`, `work/base.mp4`, `previa_cortes.mp4` |
| 2. EDL | `python3 -I scripts/edl.py` | `edl.json`, `edl.md` |

- O vídeo bruto fica em `raw/bruto.mp4` e os intermediários em `work/` (fora do git).
- Modelos (sherpa-onnx, baixados do GitHub): Whisper large-v3 int8 para o texto, Parakeet-TDT 0.6b v3 int8 para o tempo de cada palavra, Silero VAD.
- Pausas medidas na energia do áudio: acima de 0,35 s viram 0,19 s; crossfade de áudio de 3 quadros em cada corte.
- Voz: high-pass 80 Hz, de-esser, compressão 3:1, loudnorm em 2 passadas (−14 LUFS, −1 dBTP).
- Para mudar o vídeo, edite `BEATS` em `scripts/edl.py` e rode de novo.

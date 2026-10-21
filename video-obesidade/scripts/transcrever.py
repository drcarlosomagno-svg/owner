"""Fase 1: transcrição com timestamps por palavra.

Whisper large-v3 (sherpa-onnx) dá o texto; Parakeet-TDT v3 dá os tempos por
token. Os dois são alinhados palavra a palavra. Saída: work/transcript.json
"""
import difflib, json, re, sys, time
import numpy as np, soundfile as sf, sherpa_onnx

M = sys.argv[1] if len(sys.argv) > 1 else "/tmp/claude-0/models"
audio, sr = sf.read("work/voz16k.wav", dtype="float32")

vad_cfg = sherpa_onnx.VadModelConfig()
vad_cfg.silero_vad.model = f"{M}/silero_vad.onnx"
vad_cfg.silero_vad.min_silence_duration = 0.12
vad_cfg.silero_vad.min_speech_duration = 0.15
vad_cfg.silero_vad.max_speech_duration = 25
vad_cfg.silero_vad.threshold = 0.45
vad_cfg.sample_rate = sr
vad = sherpa_onnx.VoiceActivityDetector(vad_cfg, buffer_size_in_seconds=200)
win = vad_cfg.silero_vad.window_size
segs = []
for i in range(0, len(audio), win):
    vad.accept_waveform(audio[i:i + win])
    while not vad.empty():
        segs.append((vad.front.start, len(vad.front.samples))); vad.pop()
vad.flush()
while not vad.empty():
    segs.append((vad.front.start, len(vad.front.samples))); vad.pop()
# junta trechos finos em blocos de até 20 s (o Whisper só aceita < 30 s)
blocos = []
for st, n in segs:
    if blocos and (st + n - blocos[-1][0]) / sr <= 20:
        blocos[-1][1] = st + n - blocos[-1][0]
    else:
        blocos.append([st, n])
segs = [tuple(b) for b in blocos]
print(f"{len(segs)} blocos de fala", file=sys.stderr)

W = f"{M}/sherpa-onnx-whisper-large-v3"
whisper = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=f"{W}/large-v3-encoder.int8.onnx", decoder=f"{W}/large-v3-decoder.int8.onnx",
    tokens=f"{W}/large-v3-tokens.txt", language="pt", task="transcribe", num_threads=4)
P = f"{M}/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8"
parakeet = sherpa_onnx.OfflineRecognizer.from_transducer(
    encoder=f"{P}/encoder.int8.onnx", decoder=f"{P}/decoder.int8.onnx", joiner=f"{P}/joiner.int8.onnx",
    tokens=f"{P}/tokens.txt", model_type="nemo_transducer", num_threads=4)

def run(rec, x):
    s = rec.create_stream(); s.accept_waveform(sr, x); rec.decode_stream(s); return s.result

norm = lambda w: re.sub(r"[^\wà-ú]", "", w.lower())

def palavras_parakeet(pr, off):
    pw = []
    toks, ts = list(pr.tokens), list(pr.timestamps)
    durs = list(getattr(pr, "durations", []) or [])
    for k, (tok, t0) in enumerate(zip(toks, ts)):
        end = t0 + (durs[k] if k < len(durs) and durs[k] > 0 else 0.08)
        if tok.startswith(" ") or tok.startswith("▁") or not pw:
            pw.append({"w": tok.replace("▁", " ").strip(), "s": off + t0, "e": off + end})
        else:
            pw[-1]["w"] += tok; pw[-1]["e"] = off + end
    pw = [p for p in pw if p["w"]]
    for k in range(len(pw) - 1):   # fim da palavra não passa do início da próxima
        pw[k]["e"] = min(max(pw[k]["e"], pw[k]["s"] + 0.06), pw[k + 1]["s"])
    return pw

def partir(pw, lim=18.0):
    """Corta a lista de palavras no maior intervalo entre elas até cada pedaço ter <= lim s."""
    if pw[-1]["e"] - pw[0]["s"] <= lim or len(pw) < 4:
        return [pw]
    gaps = [(pw[k + 1]["s"] - pw[k]["e"], k) for k in range(1, len(pw) - 2)]
    _, k = max(gaps)
    return partir(pw[:k + 1], lim) + partir(pw[k + 1:], lim)

out = []
pad = int(0.1 * sr)
for start, n in segs:
    a0 = max(0, start - pad)
    pw_all = palavras_parakeet(run(parakeet, audio[a0:start + n + pad]), a0 / sr)
    for pw in partir(pw_all):
        c0 = max(0.0, pw[0]["s"] - 0.15); c1 = min(len(audio) / sr, pw[-1]["e"] + 0.25)
        t = time.time(); wt = run(whisper, audio[int(c0 * sr):int(c1 * sr)]).text.strip()
        ww = wt.split()
        sm = difflib.SequenceMatcher(a=[norm(w) for w in ww], b=[norm(p["w"]) for p in pw], autojunk=False)
        words = [None] * len(ww)
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag == "equal":
                for d in range(i2 - i1): words[i1 + d] = (pw[j1 + d]["s"], pw[j1 + d]["e"], "ok")
            elif tag == "replace":
                s0, e0 = pw[j1]["s"], pw[j2 - 1]["e"]; L = i2 - i1
                for d in range(L): words[i1 + d] = (s0 + (e0 - s0) * d / L, s0 + (e0 - s0) * (d + 1) / L, "interp")
        for i in range(len(ww)):   # palavras sem par: entre as vizinhas
            if words[i] is None:
                prev = next((words[j][1] for j in range(i - 1, -1, -1) if words[j]), c0)
                nxt = next((words[j][0] for j in range(i + 1, len(ww)) if words[j]), c1)
                words[i] = (prev, max(prev + 0.05, min(nxt, prev + 0.3)), "interp")
        out.append({"start": round(c0, 3), "end": round(c1, 3), "text": wt,
                    "parakeet": " ".join(p["w"] for p in pw),
                    "words": [{"w": w, "start": round(a, 3), "end": round(b, 3), "fonte": f}
                              for w, (a, b, f) in zip(ww, words)]})
        print(f"[{c0:6.2f}-{c1:6.2f}] ({time.time()-t:.1f}s) {wt}", file=sys.stderr)

json.dump({"modelo_texto": "whisper large-v3 (int8, sherpa-onnx)",
           "modelo_tempos": "parakeet-tdt-0.6b-v3 (int8, sherpa-onnx)",
           "duracao": len(audio) / sr, "segmentos": out}, open("work/transcript.json", "w"),
          ensure_ascii=False, indent=1)

"""Fase 1 (3–4): limpa a transcrição, decide os cortes e gera o vídeo-base.

Entrada: work/transcript.json (bruto). Saídas:
  transcript.json  palavras corrigidas, com tempos no bruto e no vídeo cortado
  cuts.json        trechos mantidos (tempos do bruto, alinhados a quadro)
  work/base.mp4    vídeo cortado, 1080x1920, voz tratada (-14 LUFS / -1 dBTP)
"""
import json, re, subprocess, sys
import numpy as np, soundfile as sf

FPS = 30
PAUSA_MAX = 0.35          # pausas maiores que isso são encurtadas
MARGEM_FIM, MARGEM_INI = 0.12, 0.07  # respiro mantido depois da fala / antes da fala seguinte
CAUDA = 0.30             # fim do vídeo: não comer o "s" final de "pessoas"
XF = 3 / FPS              # crossfade de áudio em cada corte (3 quadros)

# Correções de termo técnico/ortografia (transcrição -> texto da legenda)
CORRIGE = {"tirsepatida,": "tirzepatida,", "pra": "para"}
# Falsos começos e tropeços: intervalos do bruto removidos de propósito
TROPECOS = [
    (39.45, 40.20, "falso começo depois de 'tirzepatida' ('a turma, a'): conferir no áudio"),
]

d = json.load(open("work/transcript.json"))
segs = d["segmentos"]
norm = lambda w: re.sub(r"[^\wà-ú]", "", w.lower())
words = []
for i, s in enumerate(segs):
    ws = [dict(w) for w in s["words"]]
    nxt = segs[i + 1]["words"] if i + 1 < len(segs) else []
    # o Whisper repete no fim do bloco a 1ª palavra do bloco seguinte ("Como...", "ao...")
    if ws and ws[-1]["w"].endswith("...") and nxt and norm(ws[-1]["w"]) == norm(nxt[0]["w"]):
        ws.pop()
    if ws and ws[-1]["w"].endswith("...") and nxt and ws[-1]["start"] >= nxt[0]["start"] - 0.05:
        ws.pop()
    for w in ws:
        w["w"] = CORRIGE.get(w["w"], w["w"]).replace("...", "")
    words += ws
# "porque que" -> "por que" (explicar por que) ; "Por que" do início fica
for a, b in zip(words, words[1:]):
    if a["w"] == "porque" and b["w"] == "que":
        a["w"], b["w"] = "por", "que"
words = [w for w in words if not any(t0 <= (w["start"] + w["end"]) / 2 <= t1 for t0, t1, _ in TROPECOS)]

snap = lambda t: round(t * FPS) / FPS
# pausas medidas na energia do áudio (janela de 10 ms, limiar 20 dB abaixo do p90 da fala);
# os tempos do Parakeet vêm em passos de 80 ms e não servem para achar respiros
au, sr = sf.read("work/voz16k.wav", dtype="float32")
fr = au[:len(au) // 160 * 160].reshape(-1, 160)
db = np.convolve(20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-9), np.ones(3) / 3, "same")
quieto = db < np.percentile(db, 90) - 20
remover = []
i = 0
while i < len(quieto):
    if quieto[i]:
        j = i
        while j < len(quieto) and quieto[j]: j += 1
        t0, t1 = i * 0.01, j * 0.01
        if t1 - t0 > PAUSA_MAX:
            remover.append((t0 + (0 if t0 == 0 else (CAUDA if j == len(quieto) else MARGEM_FIM)),
                            t1 - (0 if j == len(quieto) else MARGEM_INI)))
        i = j
    else:
        i += 1
remover += [(a, b) for a, b, _ in TROPECOS]
remover.sort()
keep, cur = [], 0.0
for a, b in remover:
    if a > cur: keep.append([cur, a])
    cur = max(cur, b)
if cur < d["duracao"]: keep.append([cur, d["duracao"]])
keep = [[snap(a), snap(b)] for a, b in keep if snap(b) - snap(a) >= 2 / FPS]
# tempo no vídeo cortado
acc, mapa = 0.0, []
for a, b in keep:
    mapa.append((a, b, acc)); acc += b - a
def cortado(t):
    for a, b, off in mapa:
        if a - 0.2 <= t <= b + 0.2:
            return round(off + min(max(t, a), b) - a, 3)
    return None
for w in words:
    w["t_in"], w["t_out"] = cortado(w["start"]), cortado(w["end"])

json.dump({"fonte": d["modelo_texto"] + " + tempos " + d["modelo_tempos"], "duracao_cortada": round(acc, 3),
           "palavras": words}, open("transcript.json", "w"), ensure_ascii=False, indent=1)
json.dump({"fps": FPS, "pausa_max": PAUSA_MAX, "crossfade_audio_s": round(XF, 3),
           "tropecos_removidos": [{"in": a, "out": b, "nota": n} for a, b, n in TROPECOS],
           "mantidos": [{"in": a, "out": b, "t_cortado": round(o, 3)} for a, b, o in mapa]},
          open("cuts.json", "w"), ensure_ascii=False, indent=1)
print(f"{len(keep)} trechos, {len(keep)-1} cortes: {d['duracao']:.1f}s -> {acc:.1f}s", file=sys.stderr)

# filtro: vídeo em corte seco; áudio com 1,5 quadro de sobra de cada lado e crossfade de 3 quadros
h = XF / 2
fc, vl, al = [], [], []
for i, (a, b) in enumerate(keep):
    fc.append(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS[v{i}]")
    aa = a - h if i > 0 else a                     # sem sobra nas pontas: áudio = vídeo
    bb = b + h if i < len(keep) - 1 else b
    fc.append(f"[0:a]atrim={aa}:{bb},asetpts=PTS-STARTPTS[a{i}]")
    vl.append(f"[v{i}]")
fc.append("".join(vl) + f"concat=n={len(keep)}:v=1:a=0,scale=1080:1920:flags=lanczos,unsharp=5:5:0.6,fps={FPS}[vout]")
prev = "a0"
for i in range(1, len(keep)):
    fc.append(f"[{prev}][a{i}]acrossfade=d={XF:.4f}:c1=tri:c2=tri[x{i}]"); prev = f"x{i}"
voz = "highpass=f=80,deesser=i=0.35,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2"
fc.append(f"[{prev}]{voz}[vz]")
open("work/cortes.ffscript", "w").write(";\n".join(fc))

def run(args):
    return subprocess.run(args, check=True, capture_output=True, text=True)
# loudnorm em 2 passadas na voz
base_fc = open("work/cortes.ffscript").read()
open("work/medir.ffscript", "w").write(base_fc + ";\n[vz]loudnorm=I=-14:TP=-1:LRA=7:print_format=json[med]")
r = run(["ffmpeg", "-hide_banner", "-i", "raw/bruto.mp4", "-filter_complex_script", "work/medir.ffscript",
         "-map", "[vout]", "-map", "[med]", "-f", "null", "-"])
m = json.loads(r.stderr[r.stderr.rindex("{"):])
ln = (f"loudnorm=I=-14:TP=-1:LRA=7:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
      f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
open("work/cortes.ffscript", "a").write(f";\n[vz]{ln},aresample=48000[aout]")
run(["ffmpeg", "-hide_banner", "-y", "-i", "raw/bruto.mp4", "-filter_complex_script", "work/cortes.ffscript",
     "-map", "[vout]", "-map", "[aout]", "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p",
     "-c:a", "aac", "-b:a", "320k", "work/base.mp4"])
run(["ffmpeg", "-y", "-i", "work/base.mp4", "-vn", "-c:a", "pcm_s16le", "work/voz_tratada.wav"])
print("ok: work/base.mp4", file=sys.stderr)

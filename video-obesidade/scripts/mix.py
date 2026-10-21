"""Fase 5: mix de áudio a partir da edl.json.

voz (cold open + vídeo-base) + SFX no quadro exato de cada beat + ambiências
(se existirem) + música opcional (public/musica.mp3) com ducking sob a voz e
drop de silêncio antes do beat marcado. Saída: work/mix.wav, masterizado em
-14 LUFS / -1 dBTP (loudnorm em 2 passadas).

SFX: usa public/sfx/runway/<nome>.mp3 se existir; senão public/sfx/synth/<nome>.wav.
"""
import json, os, re, subprocess, sys
import numpy as np, soundfile as sf

SR = 48000
FPS = 30
E = json.load(open("edl.json"))

def carregar(path):
    if not path.endswith(".wav") or True:
        tmp = "work/_tmp.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-ar", str(SR), "-ac", "2", tmp], check=True)
        path = tmp
    x, _ = sf.read(path, dtype="float32", always_2d=True)
    return x

def sfx(nome):
    for p in (f"public/sfx/runway/{nome}.mp3", f"public/sfx/runway/sfx_{nome}.mp3", f"public/sfx/synth/{nome}.wav"):
        if os.path.exists(p):
            return p, "runway" if "runway" in p else "synth"
    return None, None

# rótulo da EDL -> (arquivo, ganho dB)
REGRAS = [
    (r"whoosh reverso", "whoosh_reverso", -12), (r"zoom", "zoom", -13), (r"whoosh", "whoosh", -11),
    (r"pop", "pop", -15), (r"tick ascendente", "tick_sobe", -16), (r"tick descendente", "tick_desce", -16),
    (r"tick", "tick", -17), (r"click", "click", -18), (r"impact", "impact", -9), (r"hit", "hit_leve", -13),
    (r"glitch", "glitch", -16), (r"buzzer", "buzzer", -19), (r"ding", "ding", -15), (r"riser", "riser", -17),
]
AMB = {"cozinha": "amb_cozinha", "consultório": "amb_consultorio", "parque": "amb_parque"}

voz_base = carregar("work/base.mp4")
co = E["cold_open"]
a, b = int(co[0] * SR), int(co[1] * SR)
cold = voz_base[a:b].copy()
fade = int(0.012 * SR)
cold[:fade] *= np.linspace(0, 1, fade)[:, None]; cold[-fade:] *= np.linspace(1, 0, fade)[:, None]
voz = np.concatenate([cold, voz_base])
N = int(round(E["duracao"] * SR))
voz = np.pad(voz, ((0, max(0, N - len(voz))), (0, 0)))[:N]
fx = np.zeros_like(voz)
log, faltando = [], set()

def colocar(x, ini, ganho_db, dur=None):
    if dur:
        x = x[: int(dur * SR)].copy()
        r = min(len(x), int(0.05 * SR)); x[-r:] *= np.linspace(1, 0, r)[:, None]
    i0 = int(ini)
    if i0 >= N: return
    x = x[: N - i0]
    fx[i0:i0 + len(x)] += x * 10 ** (ganho_db / 20)

for bt in E["beats"]:
    fim_beat = round(bt["t_out"] * FPS)
    for ev in bt["sfx"]:
        som, quadro = ev["som"], ev["frame"]
        if "música" in som:
            continue
        if som.startswith("ambiência"):
            nome = next((v for k, v in AMB.items() if k in som), None)
            p, fonte = sfx(nome) if nome else (None, None)
            if not p:
                faltando.add(nome); continue
            x = carregar(p)
            n = (fim_beat - quadro) / FPS
            x = np.tile(x, (int(n * SR / len(x)) + 2, 1))
            colocar(x, quadro / FPS * SR, -26, n)
            log.append((quadro, nome, fonte)); continue
        regra = next(((f, g) for pat, f, g in REGRAS if re.search(pat, som)), None)
        if not regra:
            print("sem regra:", som, file=sys.stderr); continue
        nome, g = regra
        p, fonte = sfx(nome)
        x = carregar(p)
        dur = None
        if nome == "riser":   # riser termina no alvo: duração vem do rótulo ("riser 1,5 s")
            m = re.search(r"(\d+(?:,\d+)?)\s*s", som)
            dur = float(m.group(1).replace(",", ".")) if m else 1.0
            x = x[-int(dur * SR):]   # pega o fim do riser (parte mais intensa)
        colocar(x, quadro / FPS * SR, g, dur)
        log.append((quadro, nome, fonte))

mix = voz + fx
musica = "public/musica.mp3"
if os.path.exists(musica):
    m = carregar(musica)
    m = np.tile(m, (N // len(m) + 1, 1))[:N]
    # ducking: envelope da voz (10 ms), -15 dB sob a fala, ataque 40 ms, release 300 ms
    env = np.sqrt(np.convolve((voz ** 2).mean(1), np.ones(480) / 480, "same"))
    alvo = np.where(env > 10 ** (-40 / 20), 10 ** (-15 / 20), 1.0)
    g = np.empty_like(alvo); g[0] = alvo[0]
    at, rl = np.exp(-1 / (0.04 * SR)), np.exp(-1 / (0.3 * SR))
    for i in range(1, N):
        c = at if alvo[i] < g[i - 1] else rl
        g[i] = c * g[i - 1] + (1 - c) * alvo[i]
    # drop de silêncio de 0,4 s antes do beat "Nenhum medicamento..."
    alvo_beat = next(b for b in E["beats"] if b["fala"].startswith("Nenhum medicamento"))
    t = int(alvo_beat["t_in"] * SR)
    g[t - int(0.4 * SR):t] = 0
    mix += m * g[:, None] * 10 ** (-10 / 20)
    log.append((0, "musica", "usuário"))

sf.write("work/mix_pre.wav", mix, SR, subtype="FLOAT")
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", "work/mix_pre.wav", "-af", "loudnorm=I=-14:TP=-1:LRA=9:print_format=json",
                    "-f", "null", "-"], capture_output=True, text=True)
mm = json.loads(r.stderr[r.stderr.rindex("{"):])
ln = (f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={mm['input_i']}:measured_TP={mm['input_tp']}:measured_LRA={mm['input_lra']}:"
      f"measured_thresh={mm['input_thresh']}:offset={mm['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "work/mix_pre.wav", "-af", f"{ln},aresample={SR}", "-c:a", "pcm_s24le", "work/mix.wav"], check=True)
json.dump({"eventos": [{"quadro": q, "som": n, "fonte": f} for q, n, f in sorted(log)],
           "faltando": sorted(x for x in faltando if x), "musica": os.path.exists(musica)},
          open("work/mix_log.json", "w"), ensure_ascii=False, indent=1)
print(f"{len(log)} eventos de som; ambiências faltando: {sorted(x for x in faltando if x)}; música: {os.path.exists(musica)}")

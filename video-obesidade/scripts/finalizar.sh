#!/usr/bin/env bash
# Fase 5: junta o vídeo do Remotion com o mix masterizado e gera os arquivos de revisão.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 -I scripts/mix.py
ffmpeg -v error -y -i out/video_render.mp4 -i work/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k \
  -movflags +faststart -shortest out/video_final.mp4
# cópia de entrega (cabe no GitHub e no limite de upload do Instagram): ~6 Mbps
mkdir -p entrega
ffmpeg -v error -y -i out/video_final.mp4 -c:v libx264 -preset slow -crf 19 -maxrate 6M -bufsize 12M -pix_fmt yuv420p \
  -c:a copy -movflags +faststart entrega/video_final.mp4
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/video_final.mp4)
# 3 quadros de checagem (início, meio, fim) e contact sheet de 1 quadro/segundo
ffmpeg -v error -y -ss 0 -i out/video_final.mp4 -frames:v 1 out/check_00_inicio.jpg
ffmpeg -v error -y -ss "$(python3 -c "print($D/2)")" -i out/video_final.mp4 -frames:v 1 out/check_01_meio.jpg
ffmpeg -v error -y -sseof -0.05 -i out/video_final.mp4 -frames:v 1 -update 1 out/check_02_fim.jpg
N=$(python3 -c "import math; print(math.ceil($D))")
ffmpeg -v error -y -i out/video_final.mp4 -vf "fps=1,scale=180:320,drawtext=text='%{eif\:t\:d}s':x=6:y=6:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6,tile=12x$(( (N+11)/12 )):padding=4:color=0x14304A" -frames:v 1 -q:v 3 out/contact_sheet.jpg
cp out/contact_sheet.jpg out/check_0*.jpg entrega/
ffmpeg -hide_banner -nostats -i out/video_final.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -A12 Summary | grep -E " I:|Peak:"
echo "duração: $D s"

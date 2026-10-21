#!/usr/bin/env bash
# Baixa os assets do Runway listados em work/runway_urls.tsv para public/.
# Precisa do host dnznrvs05pmza.cloudfront.net liberado na rede do ambiente.
cd "$(dirname "$0")/.."
mkdir -p public/broll public/sfx/runway
while IFS=$'\t' read -r destino url; do
  [ -f "public/$destino" ] && continue
  curl -sSLf -o "public/$destino" "$url" && echo "ok  $destino" || echo "ERRO $destino"
done < work/runway_urls.tsv
ls public/broll | python3 -c "import sys,json; print(json.dumps([l.strip() for l in sys.stdin if l.strip().endswith('.png')]))" > src/disponiveis.json

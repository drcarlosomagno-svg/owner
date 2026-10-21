#!/usr/bin/env bash
# SFX sintetizados com ffmpeg (autoria própria, sem licença de terceiros).
# Se existir um arquivo de mesmo nome em public/sfx/runway/ (.mp3), o mix usa ele.
set -euo pipefail
cd "$(dirname "$0")/../public/sfx/synth"
A="-ar 48000 -ac 2"
g(){ ffmpeg -v error -y "$@"; }
g -f lavfi -i "anoisesrc=c=pink:d=0.6:a=0.8" -af "highpass=f=300,lowpass=f=4500,afade=t=in:d=0.28:curve=exp,afade=t=out:st=0.28:d=0.32,volume=0.9" $A whoosh.wav
g -i whoosh.wav -af "areverse,afade=t=out:st=0.55:d=0.05" $A whoosh_reverso.wav
g -f lavfi -i "anoisesrc=c=brown:d=0.8:a=0.6" -f lavfi -i "aevalsrc='0.7*sin(2*PI*(90-50*t)*t)*exp(-2.5*t)':d=0.8" -filter_complex "[0]lowpass=f=1800,afade=t=in:d=0.3,afade=t=out:st=0.35:d=0.45[n];[n][1]amix=inputs=2:normalize=0" $A zoom.wav
g -f lavfi -i "aevalsrc='0.8*sin(2*PI*(500+1400*exp(-35*t))*t)*exp(-28*t)':d=0.18" $A pop.wav
g -f lavfi -i "aevalsrc='0.7*sin(2*PI*2300*t)*exp(-140*t)':d=0.06" $A tick.wav
g -f lavfi -i "aevalsrc='0.7*sin(2*PI*3000*t)*exp(-140*t)':d=0.06" $A tick_sobe.wav
g -f lavfi -i "aevalsrc='0.7*sin(2*PI*1500*t)*exp(-140*t)':d=0.06" $A tick_desce.wav
g -f lavfi -i "anoisesrc=c=white:d=0.03:a=0.9" -f lavfi -i "aevalsrc='0.5*sin(2*PI*1800*t)*exp(-200*t)':d=0.03" -filter_complex "[0]highpass=f=2500,afade=t=out:d=0.03[n];[n][1]amix=inputs=2:normalize=0" $A click.wav
g -f lavfi -i "aevalsrc='0.95*sin(2*PI*(48+70*exp(-9*t))*t)*exp(-3.2*t)':d=1.3" -f lavfi -i "anoisesrc=c=brown:d=0.25:a=0.7" -filter_complex "[1]lowpass=f=900,afade=t=out:d=0.25[n];[0][n]amix=inputs=2:normalize=0,alimiter=limit=0.95" $A impact.wav
g -f lavfi -i "aevalsrc='0.9*sin(2*PI*(60+150*exp(-28*t))*t)*exp(-9*t)':d=0.45" $A hit_leve.wav
g -f lavfi -i "aevalsrc='0.35*sgn(sin(2*PI*(220+660*mod(floor(t*45),3))*t))*mod(floor(t*70),2)':d=0.14" -af "lowpass=f=6000" $A glitch.wav
g -f lavfi -i "aevalsrc='0.3*sgn(sin(2*PI*130*t))+0.2*sgn(sin(2*PI*137*t))':d=0.4" -af "lowpass=f=1600,afade=t=in:d=0.01,afade=t=out:st=0.3:d=0.1" $A buzzer.wav
g -f lavfi -i "aevalsrc='(0.5*sin(2*PI*1318*t)+0.25*sin(2*PI*2637*t)+0.12*sin(2*PI*3955*t))*exp(-4.5*t)':d=1.1" $A ding.wav
g -f lavfi -i "aevalsrc='0.35*sin(2*PI*(180*t+260*t*t))*(t/2)^1.5':d=2" -f lavfi -i "anoisesrc=c=white:d=2:a=0.5" -filter_complex "[1]highpass=f=1500,volume='(t/2)^2':eval=frame[n];[0][n]amix=inputs=2:normalize=0" $A riser.wav
ls

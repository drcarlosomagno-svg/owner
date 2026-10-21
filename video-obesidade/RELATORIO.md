# Relatório · Reels "Obesidade e tratamento"

## Números
| | |
|---|---|
| Duração final | **117,4 s** (bruto: 126,9 s) |
| Cortes na fala | 17 (16 pausas/respiros + 1 tropeço depois de "tirzepatida"), crossfade de áudio de 3 quadros |
| Cold open | "Isso não significa falta de disciplina." (1,9 s, trazido de 74 s) |
| Beats / trocas visuais | 41 beats, **20,4 trocas por minuto** (mais punch-ins, checks e pops dentro dos beats) |
| Maior trecho sem estímulo novo | 3,07 s (beat 31, com push-in contínuo) |
| B-rolls | 9 imagens geradas no Runway para 7 beats (veja "Pendências") |
| Motion graphics | 22 beats com gráfico, checklist, linha do tempo, ícones ou texto cinético |
| Sons | 69 eventos sincronizados no quadro da EDL |
| Áudio | **−14,0 LUFS integrado, −1,0 dBTP** (medido no arquivo de entrega) |
| Vídeo | 1080×1920, 30 fps, H.264 ~3,6 Mbps, AAC 256–320 kbps |

## Checklist de QA
- [x] Hook com movimento + legenda no frame 0 (punch-in 120→123%, legenda e "FALTA DE DISCIPLINA" já no quadro 0)
- [x] Nenhum trecho > 3 s sem mudança visual (máximo 3,07 s, com movimento de câmera contínuo)
- [x] Legendas fora das safe zones (90 px laterais, 150 px à direita, nada nos 250 px de baixo) e termos conferidos (semaglutida, tirzepatida)
- [x] Grão 5%, vinheta e grading com teal nas sombras aplicados igual em todo o vídeo
- [x] Voz inteligível; mix em −14 LUFS / −1 dBTP
- [x] SFX no quadro exato da EDL (posicionados por amostra, ±0 quadro)
- [x] CTA presente desde 112,8 s, junto com o payoff; final em corte seco no mesmo enquadramento do quadro 0 (loop)
- [x] `CREDITS.md` com origem e licença de tudo
- [x] Conformidade médica: sem promessa de resultado, sem antes-e-depois, sem paciente identificável, só nomes de princípio ativo (sem marca), nenhum número na tela que não foi dito (os selos de estudo opcionais ficaram de fora), imagens de IA marcadas "imagem ilustrativa · gerada por IA"
- [ ] **CRM na tela**: o lower third mostra "Dr. Carlos Magno · Médico". A Resolução CFM 2.336/2023 pede o CRM (e o RQE, se houver). Me passe o número que eu incluo.
- [ ] **B-roll do Runway**: as 9 imagens existem na sua conta, mas o ambiente bloqueia o domínio onde ficam (`dnznrvs05pmza.cloudfront.net`). Nesta versão, esses 7 beats usam sua própria imagem com punch-in.
- [ ] **Música**: o plano Free do Runway não gera música. O vídeo sai sem trilha (escolha o áudio no app do Instagram) ou coloque `public/musica.mp3` e rode `scripts/finalizar.sh`.

## Pendências e como resolver
1. **B-roll**: libere `dnznrvs05pmza.cloudfront.net` em Network access do ambiente e rode `scripts/baixar_runway.sh`, depois render + `scripts/finalizar.sh`. Ou baixe as imagens na biblioteca do Runway e salve com os nomes de `assets/runway.json` em `public/broll/`.
2. **Trecho a conferir** (98–104 s): os dois modelos de transcrição ouviram "um tratamento que seja **positivo** durante o tempo". Se a fala foi outra, me diga o texto certo.

## Música sugerida (se for colocar trilha)
- 0–30 s: pulso mínimo e curioso, ~100 BPM, synth + percussão leve.
- 30–65 s: mesma base, mais aberta (pluck, informativa).
- 65–84 s: tensão crescendo; **corte seco de 0,4 s** antes de "Nenhum medicamento…" (já automatizado no mix).
- 84–117 s: esperançosa, sobe nas cenas finais. Ducking de −15 dB sob a voz já está no `mix.py`.

## 3 hooks para testar em A/B
| | Texto de capa | Primeira frase (já está na sua fala) |
|---|---|---|
| A (atual) | NÃO É FALTA DE DISCIPLINA | "Isso não significa falta de disciplina." |
| B | PAROU O REMÉDIO E O PESO VOLTOU? | "Em muitos casos, interromper o tratamento pode favorecer o retorno da fome." |
| C | REMÉDIO PARA OBESIDADE NÃO É SÓ A DOSE | "Prescrever medicamento não é apenas escolher uma dose." |

Para trocar o cold open: mude `COLD_OPEN` em `scripts/edl.py` (B = 68,27–72,19; C = 44,30–47,73 no vídeo-base) e rode o pipeline de novo.

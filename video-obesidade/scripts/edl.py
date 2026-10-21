"""Fase 2: gera edl.json e edl.md a partir da tabela de beats abaixo.

Os tempos dos beats estão no vídeo-base cortado (work/base.mp4). O cold open
entra antes de tudo; o script desloca o resto e calcula t_in/t_out finais e o
quadro exato de cada SFX. Para mudar o vídeo, edite BEATS e rode de novo.
"""
import json

FPS = 30
COLD_OPEN = (74.37, 76.25)        # "Isso não significa falta de disciplina."
OFF = round(COLD_OPEN[1] - COLD_OPEN[0], 3)
DUR_BASE = json.load(open("transcript.json"))["duracao_cortada"]

ESTILO = ("vertical 9:16, 5 s, shot on ARRI Alexa Mini LF, 35mm lens, soft natural window light, "
          "warm preserved skin tones, teal shadows, slightly lifted blacks, shallow depth of field, "
          "subtle 35mm film grain, slow dolly-in, Brazilian setting, generic non-identifiable adult, "
          "no logos, no brand names, no on-screen text")

# (src_in, fala, layout, visual, tipo_visual, [prompt_ia,] transicao, sfx[(t_base|'in', som)], enfase, motivo)
BEATS = [
 ("CO", "Isso não significa falta de disciplina.", "FULL_TALK",
  "Cold open: eu em punch-in 120% (centro nos olhos), legenda já no frame 0; 'FALTA DE DISCIPLINA' riscada com traço dourado que se desenha.",
  "texto_cinético", "", "nenhuma (frame 0 já em movimento: punch-in 120→123% contínuo)",
  [("in", "impact grave curto"), (75.30, "glitch 2 quadros em 'falta'")], ["falta", "disciplina"],
  "Frase mais contraintuitiva do vídeo; abre um loop ('isso' o quê?) que só fecha aos 76 s."),
 (0.00, "Por que algumas pessoas emagrecem,", "SPLIT_TOP_BROLL",
  "Em cima: gráfico de peso esquemático (sem números) cuja linha desce. Embaixo: eu.",
  "motion_graphic", "", "split slide (B-roll empurra minha imagem para baixo, 9 quadros)",
  [("in", "whoosh"), (1.00, "tick")], ["emagrecem"],
  "Corte de padrão logo após o cold open; o gráfico vira o 'personagem' da pergunta."),
 (1.88, "mas depois voltam a ganhar peso,", "SPLIT_TOP_BROLL",
  "Mesma linha faz a curva e sobe de novo (efeito sanfona). Selo 'ilustrativo' pequeno.",
  "motion_graphic", "", "corte seco",
  [(2.36, "whoosh reverso (rewind)")], ["voltam", "ganhar", "peso"],
  "A virada da linha encena a frustração que o público conhece."),
 (3.72, "mesmo tentando manter os hábitos que elas aprenderam?", "FULL_BROLL",
  "Adulto de ~45 anos montando um prato saudável na cozinha, depois olhando a balança com cara de dúvida. Minha voz em off.",
  "ai_realista",
  "Medium shot of a generic Brazilian man in his mid-40s in a bright home kitchen, carefully plating grilled chicken and salad, then glancing down at a bathroom scale with a quietly puzzled expression, " + ESTILO,
  "light leak suave (8 quadros)", [("in", "ambiência cozinha baixa")], ["hábitos"],
  "Identificação: o público se vê na cena antes de ouvir a explicação."),
 (6.28, "E onde entram os medicamentos nesse processo?", "FULL_TALK",
  "Punch-in 112%. Abre o OPEN LOOP: ícone de cápsula com cadeado + '?' animado no canto superior, que fica na tela até 27,8 s (base).",
  "texto_cinético", "", "whip pan (8 quadros)",
  [("in", "whoosh"), (7.32, "pop (ícone)"), (8.20, "riser curto 1 s, sem impacto")], ["medicamentos"],
  "Promessa explícita; o cadeado segura a resposta por ~20 s."),
 (8.80, "O peso corporal não depende apenas de força de vontade,", "SPLIT_50_50",
  "Mito × evidência: esquerda 'só força de vontade' (riscado, glitch); direita 'biologia + comportamento' (teal).",
  "motion_graphic", "", "glitch/RGB split 3 quadros",
  [("in", "buzzer curto"), (10.96, "click")], ["apenas", "força", "vontade"],
  "Contraste direto com a crença do público."),
 (11.92, "ele também vai ser regulado por mecanismos biológicos", "FULL_MOTION",
  "Zoom-through na cabeça de um perfil esquemático até o hipotálamo (SVG, traço teal), sinais pulsando.",
  "motion_graphic", "", "zoom-through (10 quadros)",
  [("in", "whoosh de zoom"), (13.44, "tick")], ["mecanismos", "biológicos"],
  "Aprofunda: entra 'dentro' do corpo no momento em que a fala vira mecanismo."),
 (14.88, "que influenciam a fome, a saciedade e o gasto de energia.", "FULL_MOTION",
  "Três ícones entram em sincronia com as palavras: fome (estômago), saciedade (prato com check), gasto de energia (chama).",
  "motion_graphic", "", "corte seco",
  [(15.76, "pop"), (16.24, "pop"), (16.96, "pop")], ["fome", "saciedade", "energia"],
  "Três estímulos em 2 s; cada palavra-chave vira imagem."),
 (17.90, "Quando uma pessoa perde peso,", "SPLIT_TOP_BROLL",
  "Em cima: pessoa genérica apertando o cinto num furo a mais (sem rosto).",
  "ai_realista",
  "Close-up of a generic adult's hands tightening a leather belt one notch further on casual trousers, no face visible, morning light in a bedroom, " + ESTILO,
  "split slide", [("in", "whoosh")], ["perde", "peso"],
  "Imagem concreta, sem antes-e-depois de paciente."),
 (19.75, "o organismo pode responder aumentando a fome e reduzindo o gasto energético.", "FULL_MOTION",
  "Dois mostradores: 'fome' com ponteiro subindo (dourado), 'gasto energético' descendo (teal). Sem escala numérica. "
  "[OPCIONAL, só se você aprovar] selo de fonte: Sumithran et al., NEJM 2011.",
  "dado/gráfico", "", "mask reveal circular",
  [(21.03, "tick ascendente"), (22.15, "tick descendente")], ["aumentando", "fome", "reduzindo"],
  "Mecanismo central do vídeo, mostrado como 'o corpo reagindo'."),
 (23.59, "Isso ajuda a explicar por que manter o peso perdido pode ser tão difícil para muita gente.", "FULL_TALK",
  "Plano normal 100% e, em 'difícil', punch-in seco para 120%.",
  "texto_cinético", "", "corte seco",
  [(26.55, "hit leve no punch-in")], ["manter", "difícil"],
  "Volta ao rosto para gerar empatia; o punch-in quebra os 3,8 s."),
 (27.77, "É nesse contexto que entram alguns medicamentos para obesidade.", "FULL_TALK",
  "FECHA o open loop: cadeado abre, cápsula vai para o centro. Punch-in 108%.",
  "texto_cinético", "flash branco 2 quadros em 'entram'",
  [(28.57, "ding (cadeado abrindo)")], ["medicamentos"],
  "Recompensa da promessa feita aos 6 s."),
 (30.89, "Medicamentos como a semaglutida, a tirzepatida,", "FULL_MOTION",
  "Cartões tipográficos empilhando 'SEMAGLUTIDA' e 'TIRZEPATIDA' (só o nome do princípio ativo, sem marca, sem caneta de marca).",
  "texto_cinético", "", "corte seco",
  [(31.93, "click"), (32.97, "click")], ["semaglutida", "tirzepatida"],
  "Nomes que o público já ouviu, escritos corretamente."),
 (33.20, "atuam em vias hormonais envolvidas na regulação do apetite e da saciedade.", "FULL_MOTION",
  "Esquema intestino → cérebro: partículas hormonais saem do intestino e chegam ao hipotálamo (reaproveita o SVG do beat 6). "
  "[OPCIONAL] rótulos GLP-1 / GIP.",
  "motion_graphic", "", "zoom-through",
  [("in", "whoosh"), (35.44, "tick")], ["hormonais", "apetite", "saciedade"],
  "Mesma linguagem visual do mecanismo, para o público ligar uma coisa à outra."),
 (37.33, "Eles podem ajudar a pessoa a sentir menos fome,", "SPLIT_TOP_BROLL",
  "Em cima: adulto genérico termina o almoço com tranquilidade e afasta o prato.",
  "ai_realista",
  "Medium shot of a generic Brazilian woman in her early 50s at a sunlit dining table calmly finishing a modest home-cooked meal and gently pushing the plate aside, relaxed expression, " + ESTILO,
  "split slide", [("in", "whoosh")], ["menos", "fome"],
  "Cena de cotidiano, sem promessa de resultado."),
 (39.35, "controlar melhor a ingestão de alimentos e perder peso.", "PIP",
  "Eu em círculo no canto inferior esquerdo sobre fundo off-white com 2 itens que recebem check: 'controle da ingestão', 'perda de peso'.",
  "motion_graphic", "", "mask reveal circular (eu encolho para o círculo)",
  [(39.75, "pop"), (41.27, "pop")], ["controlar", "perder"],
  "Mudança de escala da minha imagem; lista organiza a informação."),
 (42.20, "Mas existe um ponto bem importante.", "FULL_TALK",
  "Punch-in forte 125%.", "texto_cinético", "whip pan",
  [("in", "whoosh"), (42.80, "riser 1,5 s até 'Prescrever'")], ["importante"],
  "Virada do vídeo; o 'mas' pede o enquadramento mais fechado."),
 (44.30, "Prescrever medicamento não é apenas escolher uma dose.", "SPLIT_50_50",
  "Esquerda: dial de dose genérico (riscado). Direita: estetoscópio + prancheta (teal). Sem marca.",
  "motion_graphic", "glitch 2 quadros em 'não é apenas'",
  [(44.30, "impact (fim do riser)"), (46.04, "glitch")], ["não", "apenas", "dose"],
  "Mito × verdade sobre o próprio ato médico."),
 (47.86, "Como médico, eu preciso avaliar se existe indicação clínica,", "FULL_TALK",
  "108%. Lower third 'Dr. Carlos Magno · médico · CRM [preencher]'. Checklist abre com item 1 'Indicação clínica'.",
  "texto_cinético", "corte seco",
  [("in", "click (lower third)"), (49.93, "tick + check")], ["indicação", "clínica"],
  "Autoridade sem exagero; identificação exigida pelo CFM."),
 (50.91, "quais são os benefícios esperados, os possíveis efeitos adversos,", "PIP",
  "Eu em círculo; checklist ocupa a tela: itens 2 'Benefícios esperados' e 3 'Efeitos adversos'.",
  "motion_graphic", "mask reveal",
  [(51.69, "tick + check"), (53.61, "tick + check")], ["benefícios", "adversos"],
  "Cada item falado vira um check, no ritmo da fala."),
 (54.72, "as outras doenças que a pessoa já tem e os medicamentos que ela já utiliza.", "SPLIT_TOP_BROLL",
  "Em cima: checklist itens 4 'Outras doenças' e 5 'Medicamentos em uso'. Embaixo: eu.",
  "motion_graphic", "split slide",
  [(55.36, "tick + check"), (57.12, "tick + check")], ["doenças", "medicamentos"],
  "Troca de layout no meio da lista para não passar de 3 s parado."),
 (58.57, "Também é preciso acompanhar a resposta do tratamento e decidir junto com o paciente", "FULL_BROLL",
  "Consultório: médico e paciente genéricos conversando, mãos sobre a mesa, tablet com gráfico simples. Rostos fora de foco/de costas.",
  "ai_realista",
  "Over-the-shoulder shot in a calm modern Brazilian medical office, a doctor and an adult patient talking across a wooden desk, faces out of focus or turned away, hands and a tablet showing a simple line chart in focus, slow lateral dolly, " + ESTILO,
  "light leak suave", [("in", "ambiência consultório"), (59.78, "whoosh leve (mudança de plano)")], ["acompanhar", "junto"],
  "Mostra o processo, sem paciente identificável (CFM)."),
 (61.94, "como que vai conduzir isso ao longo do tempo.", "FULL_MOTION",
  "Linha do tempo que se desenha da esquerda para a direita com pontos de consulta (sem datas).",
  "motion_graphic", "corte seco",
  [("in", "whoosh"), (63.22, "tick"), (64.58, "tick")], ["longo", "tempo"],
  "Prepara a ideia de doença crônica."),
 (65.40, "E por que isso importa?", "FULL_TALK",
  "Punch-in 120% + '?' com micro-bounce.", "texto_cinético", "whip pan",
  [("in", "whoosh"), (65.79, "riser 0,6 s")], ["importa"],
  "Pergunta curta; segura a resposta por menos de 1 s."),
 (66.35, "Porque a obesidade é uma doença crônica.", "FULL_MOTION",
  "'DOENÇA CRÔNICA' em tipografia grande dourada sobre minha imagem desfocada.",
  "texto_cinético", "flash branco 2 quadros",
  [(66.35, "impact grave")], ["doença", "crônica"],
  "Tese central do vídeo; peso visual máximo."),
 (68.27, "Em muitos casos, interromper o tratamento", "SPLIT_TOP_BROLL",
  "Em cima: linha de peso descendo; marcador 'pausa' aparece em 'interromper'.",
  "dado/gráfico", "corte seco",
  [(69.15, "click (pausa)")], ["interromper"],
  "Continuidade com o gráfico do início (beats 1–2)."),
 (70.51, "pode favorecer o retorno da fome e a recuperação daquele peso que foi perdido.", "SPLIT_TOP_BROLL",
  "A linha volta a subir depois do marcador; selo 'ilustrativo'. "
  "[OPCIONAL, só se você aprovar] selo de fonte: STEP 1 extensão, Wilding et al., 2022 / SURMOUNT-4, Aronne et al., 2024.",
  "dado/gráfico", "corte seco",
  [(71.39, "whoosh reverso"), (72.43, "tick")], ["retorno", "fome", "recuperação"],
  "Fecha o arco do gráfico e responde à pergunta do início."),
 (74.37, "Isso não significa falta de disciplina.", "SPLIT_50_50",
  "Callback do cold open: esquerda 'falta de disciplina' riscado; direita 'o corpo reagindo'.",
  "texto_cinético", "glitch 2 quadros",
  [("in", "buzzer"), (75.30, "glitch")], ["falta", "disciplina"],
  "Fecha o loop aberto no frame 0; quem chegou até aqui recebe o contexto."),
 (76.42, "Pode ser só que o corpo respondeu dessa maneira.", "FULL_MOTION",
  "Silhueta corporal esquemática com os mesmos pulsos hormonais dos beats 6 e 13.",
  "motion_graphic", "corte seco",
  [(77.38, "tick")], ["corpo", "respondeu"],
  "Reforça a explicação biológica sem culpa."),
 (78.97, "E a alimentação, o exercício e o sono", "FULL_BROLL",
  "Montagem rápida de 3 planos em sincronia com as palavras: comida de verdade, treino de força de adulto 40+, quarto escuro/sono.",
  "stock",
  "", "corte seco no beat da música",
  [(79.30, "tick"), (80.02, "tick"), (80.66, "tick")], ["alimentação", "exercício", "sono"],
  "Aceleração: 3 cortes em 2 s."),
 (81.23, "e o acompanhamento médico vão ter papéis complementares.", "FULL_MOTION",
  "Cinco ícones (medicamento, alimentação, exercício, sono, acompanhamento) se encaixam como peças.",
  "motion_graphic", "corte seco",
  [(81.49, "pop"), (83.33, "click de encaixe")], ["complementares"],
  "Mostra 'complementar' como encaixe, não como hierarquia."),
 (84.13, "Nenhum medicamento deve ser usado por conta própria", "FULL_TALK",
  "DROP DE SILÊNCIO de 0,4 s na música antes deste beat. Punch-in 125%, ícone de alerta dourado.",
  "texto_cinético", "corte seco",
  [("in", "impact grave (sobre o silêncio)")], ["nenhum", "conta", "própria"],
  "Frase mais importante para o público do CTA (quem já usa remédio)."),
 (87.17, "e nem existe uma estratégia única adequada para todo mundo.", "SPLIT_TOP_BROLL",
  "Em cima: fileira de silhuetas diversas, cada uma com um caminho diferente se desenhando.",
  "motion_graphic", "split slide",
  [("in", "whoosh"), (88.61, "pop")], ["única", "todo", "mundo"],
  "Individualização; contra a receita pronta."),
 (90.40, "Tratar a obesidade vai muito além de fazer o número na balança diminuir", "FULL_MOTION",
  "Visor de balança com dígitos girando sem parar (sem número legível); em 'muito além' a câmera recua e a balança vira um detalhe pequeno.",
  "motion_graphic", "zoom-through invertido",
  [(91.88, "whoosh de zoom-out"), (93.48, "ticks rápidos dos dígitos")], ["muito", "além"],
  "Muda o foco do número para a pessoa."),
 (95.00, "e precisa ser entendido como uma doença, avaliar cada pessoa", "FULL_TALK",
  "108%.", "texto_cinético", "corte seco",
  [(96.44, "click")], ["doença", "cada", "pessoa"],
  "Respiro de rosto antes do bloco final."),
 (98.20, "construir um tratamento que seja positivo durante o tempo", "PIP",
  "Eu em círculo sobre a linha do tempo do beat 23, que continua estável. [CONFERIR transcrição: 'positivo durante o tempo']",
  "motion_graphic", "mask reveal",
  [(98.84, "tick"), (101.00, "whoosh leve (linha avança)")], ["tratamento"],
  "Reaproveita a linha do tempo: continuidade visual."),
 (101.88, "e sustentável assim que o paciente precisa.", "FULL_TALK",
  "Punch-in 115% em 'sustentável'.", "texto_cinético", "corte seco",
  [(102.12, "hit leve")], ["sustentável"],
  "Palavra-chave do tratamento crônico."),
 (105.11, "Então é necessário que a gente tenha mais saúde", "FULL_BROLL",
  "Adulto de ~50 anos subindo uma escada ao ar livre com folga, luz de fim de tarde.",
  "ai_realista",
  "Wide tracking shot of a generic Brazilian man around 50 in simple sportswear climbing outdoor stone steps in a park at golden hour, steady breathing, content expression, " + ESTILO,
  "light leak", [("in", "ambiência parque"), ("in", "música sobe +3 dB")], ["saúde"],
  "Começa a aceleração final com imagem de vida, não de balança."),
 (107.83, "para que a gente consiga viver aquilo que mais importa.", "FULL_BROLL",
  "Mesmo personagem brincando com crianças no gramado (genérico, ilustrativo).",
  "ai_realista",
  "Medium shot of the same generic Brazilian man around 50 playing with two young children on a park lawn at golden hour, laughter, natural movement, " + ESTILO,
  "corte seco", [(109.52, "whoosh leve")], ["importa"],
  "Momento emocional; luz quente fecha o arco."),
 (110.24, "E para isso, o tratamento de obesidade entra como", "FULL_TALK",
  "108%. Entra o CTA: card 'Mande este vídeo para quem está usando algum remédio para obesidade' com ícone de avião de papel.",
  "texto_cinético", "corte seco",
  [("in", "riser 2 s até 'pilar'"), (110.96, "pop (CTA)")], ["tratamento"],
  "CTA entra junto com o payoff, não depois."),
 (112.64, "um pilar fundamental na qualidade de vida das pessoas.", "FULL_TALK",
  "Punch-in 120% (mesmo enquadramento do frame 0, para o loop). CTA fixo com pulso no ícone. Corte seco no último quadro.",
  "texto_cinético", "flash branco 2 quadros em 'pilar'",
  [(112.72, "impact"), (113.84, "ding")], ["pilar", "fundamental", "qualidade", "vida"],
  "Payoff + CTA; o último quadro casa com o primeiro."),
]

# Parâmetros de render por beat (id = posição em BEATS). Chaves terminadas em _t são
# tempos do vídeo-base e viram quadros absolutos (_f). zoom = [inicio, fim] ou degrau.
RENDER = {
 0: dict(zoom=[1.20, 1.23], trans="none", motion="risco", texto="FALTA DE DISCIPLINA", marca_t=[75.30]),
 1: dict(motion="grafico", modo="desce", trans="split"),
 2: dict(motion="grafico", modo="sanfona", trans="cut"),
 3: dict(broll="b03_cozinha.png", trans="leak"),
 4: dict(zoom=[1.12, 1.14], trans="whip"),
 5: dict(motion="mito", mito="Só força de vontade", verdade="Biologia + comportamento", trans="glitch"),
 6: dict(motion="cerebro", trans="zoom"),
 7: dict(motion="icones", marca_t=[15.76, 16.24, 16.96], trans="cut"),
 8: dict(broll="b08_cinto.png", trans="split"),
 9: dict(motion="mostradores", marca_t=[21.03, 22.15], trans="mask"),
 10: dict(zoom=[1.0, 1.02], degrau_t=26.55, degrau=1.20, trans="cut"),
 11: dict(zoom=[1.08, 1.10], flash_t=28.57, trans="cut"),
 12: dict(motion="nomes", marca_t=[31.93, 32.97], trans="cut"),
 13: dict(motion="hormonios", trans="zoom"),
 14: dict(broll="b14_refeicao.png", trans="split"),
 15: dict(motion="checklist", itens=["Menos fome", "Controle da ingestão", "Perda de peso"], marca_t=[37.40, 39.75, 41.27], trans="mask", pip=True),
 16: dict(zoom=[1.25, 1.27], trans="whip"),
 17: dict(motion="mito", mito="Só escolher a dose", verdade="Avaliar a pessoa", glitch_t=46.04, trans="cut"),
 18: dict(zoom=[1.08, 1.10], terco=True, trans="cut"),
 19: dict(motion="checklist", itens=["Indicação clínica", "Benefícios esperados", "Efeitos adversos", "Outras doenças", "Medicamentos em uso"], marca_t=[49.93, 51.69, 53.61, 99999, 99999], trans="mask", pip=True),
 20: dict(motion="checklist", itens=["Indicação clínica", "Benefícios esperados", "Efeitos adversos", "Outras doenças", "Medicamentos em uso"], marca_t=[49.93, 51.69, 53.61, 55.36, 57.12], trans="split"),
 21: dict(broll="b21_consultorio.png", trans="leak"),
 22: dict(motion="linha_tempo", marca_t=[63.22, 64.58], trans="cut"),
 23: dict(zoom=[1.20, 1.22], trans="whip", interrogacao=True),
 24: dict(motion="texto_grande", texto="DOENÇA CRÔNICA", trans="flash"),
 25: dict(motion="grafico", modo="pausa", marca_t=[69.15], trans="cut"),
 26: dict(motion="grafico", modo="volta", trans="cut"),
 27: dict(motion="mito", mito="Falta de disciplina", verdade="O corpo reagindo", glitch_t=75.30, trans="glitch"),
 28: dict(motion="hormonios", corpo=True, trans="cut"),
 29: dict(montagem=["b29a_comida.png", "b29b_treino.png", "b29c_sono.png"], marca_t=[79.30, 80.02, 80.66], trans="cut"),
 30: dict(motion="pecas", trans="cut"),
 31: dict(zoom=[1.25, 1.27], alerta=True, trans="cut"),
 32: dict(motion="silhuetas", trans="split"),
 33: dict(motion="balanca", marca_t=[91.88], trans="zoom"),
 34: dict(zoom=[1.08, 1.10], trans="cut"),
 35: dict(motion="linha_tempo", continua=True, marca_t=[98.84, 101.00], trans="mask", pip=True),
 36: dict(zoom=[1.0, 1.02], degrau_t=102.12, degrau=1.15, trans="cut"),
 37: dict(broll="b37_escada.png", trans="leak"),
 38: dict(broll="b38_familia.png", trans="cut"),
 39: dict(zoom=[1.08, 1.10], trans="cut"),
 40: dict(zoom=[1.20, 1.23], flash_t=112.72, trans="flash_t"),
}
SPLIT_LAYOUTS = {"SPLIT_TOP_BROLL"}
CTA = dict(texto="Mande este vídeo para quem está usando algum remédio para obesidade", inicio_t=110.96)
LOOP = dict(inicio_t=7.32, fim_t=28.57)   # cadeado do open loop

f = lambda t: round(t * FPS)          # tempo -> quadro
beats = []
for i, b in enumerate(BEATS):
    if len(b) == 9:                   # beats sem IA podem omitir o prompt
        b = b[:5] + ("",) + b[5:]
    src, fala, layout, visual, tipo, prompt, trans, sfx, enf, motivo = b
    if src == "CO":
        s_in, s_out, t_in = COLD_OPEN[0], COLD_OPEN[1], 0.0
        t_out = OFF
        shift = -COLD_OPEN[0]
    else:
        s_in = 0.0 if src == 0.00 else src
        nxt = BEATS[i + 1][0] if i + 1 < len(BEATS) else None
        s_out = nxt if nxt is not None else DUR_BASE
        t_in, t_out = s_in + OFF, s_out + OFF
        shift = OFF
    fr_in = f(t_in)
    sfx_out = [{"som": som, "frame": fr_in if t == "in" else f(t + shift)} for t, som in sfx]
    rp = {}
    for k, v in RENDER.get(i, {}).items():
        if k.endswith("_t"):
            conv = lambda t: f(t + shift) if t < 9999 else 10 ** 6
            rp[k[:-2] + "_f"] = [conv(x) for x in v] if isinstance(v, list) else conv(v)
        else:
            rp[k] = v
    beats.append({"render": rp, "id": i, "t_in": round(f(t_in) / FPS, 3), "t_out": round(f(t_out) / FPS, 3),
                  "src_in": s_in, "src_out": s_out, "fala": fala, "layout": layout, "visual": visual,
                  "tipo_visual": tipo, "prompt_ia": prompt, "transicao_entrada": trans,
                  "sfx": sfx_out, "enfase": enf, "motivo": motivo})

# legenda: palavras em quadros absolutos, em blocos de até 3 palavras (quebra em pontuação e beat)
import re
norm = lambda w: re.sub(r"[^\wà-úç]", "", w.lower())
pal = json.load(open("transcript.json"))["palavras"]
co_words = [w for w in pal if COLD_OPEN[0] - 0.05 <= w["t_in"] < COLD_OPEN[1] - 0.05]
seq = [(w, w["t_in"] - COLD_OPEN[0], w["t_out"] - COLD_OPEN[0]) for w in co_words]
seq += [(w, w["t_in"] + OFF, w["t_out"] + OFF) for w in pal]
legenda, bloco = [], []
def beat_de(fr):
    return next(b for b in reversed(beats) if f(b["t_in"]) <= fr)
for w, a, b in seq:
    fa, fb = f(a), f(b)
    bt = beat_de(fa)
    if bloco and (len(bloco) >= 3 or bloco[-1]["beat"] != bt["id"] or bloco[-1]["w"][-1] in ".?!,:"):
        legenda.append(bloco); bloco = []
    txt = w["w"].replace("positivo.", "positivo").replace("saúde.", "saúde,")
    bloco.append({"w": txt, "f_in": fa, "f_out": fb, "beat": bt["id"],
                  "enfase": norm(txt) in {norm(e) for e in bt["enfase"]}})
legenda.append(bloco)
json.dump([{"f_in": bl[0]["f_in"], "palavras": bl} for bl in legenda], open("src/legenda.json", "w"), ensure_ascii=False)

json.dump({"fps": FPS, "largura": 1080, "altura": 1920, "fonte_video": "work/base.mp4",
           "off": OFF, "co_quadros": f(OFF), "cta": {"texto": CTA["texto"], "f_in": f(CTA["inicio_t"] + OFF)},
           "loop": {"f_in": f(LOOP["inicio_t"] + OFF), "f_out": f(LOOP["fim_t"] + OFF)},
           "duracao": round(f(DUR_BASE + OFF) / FPS, 3), "cold_open": list(COLD_OPEN),
           "beats": beats}, open("edl.json", "w"), ensure_ascii=False, indent=1)

esc = lambda s: str(s).replace("|", "/")
L = ["# EDL · Obesidade e tratamento (v1, para aprovação)", "",
     f"Duração: **{beats[-1]['t_out']:.1f} s** (cold open {OFF:.2f} s + fala cortada {DUR_BASE:.1f} s) · "
     f"**{len(beats)} beats** · média {beats[-1]['t_out']/len(beats):.1f} s por beat. "
     "Tempos no vídeo final; SFX em quadro (30 fps). Prompts completos de IA em `prompts_ia.md` (gerado na Fase 3).", "",
     "| # | t_in–t_out | fala | layout | visual | tipo | transição | sfx (quadro) | ênfase | motivo |",
     "|---|---|---|---|---|---|---|---|---|---|"]
for b in beats:
    sfx = "; ".join(f"{s['som']} @{s['frame']}" for s in b["sfx"])
    L.append(f"| {b['id']} | {b['t_in']:.2f}–{b['t_out']:.2f} | {esc(b['fala'])} | `{b['layout']}` | {esc(b['visual'])} | "
             f"{b['tipo_visual']} | {esc(b['transicao_entrada'])} | {esc(sfx)} | {', '.join(b['enfase'])} | {esc(b['motivo'])} |")
L += ["", "## Prompts de IA (ai_realista)", ""]
for b in beats:
    if b["prompt_ia"]:
        L.append(f"- **Beat {b['id']}** ({b['t_out']-b['t_in']:.1f} s): {b['prompt_ia']}")
open("edl.md", "w").write("\n".join(L) + "\n")
from collections import Counter
print(len(beats), "beats;", Counter(b["layout"] for b in beats), Counter(b["tipo_visual"] for b in beats))
print("maior beat:", max((round(b["t_out"] - b["t_in"], 2), b["id"]) for b in beats))

// Animação das cenas de demonstração (personagem, tela do celular e conversa com a IA).
// Roda dentro da página do Reel; scripts/reels.mjs chama window.__demo.preparar() e depois,
// a cada quadro, a função devolvida para a cena ativa. Tudo depende só do tempo da cena, para
// o vídeo sair igual toda vez.
(() => {
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const saida = (p) => 1 - Math.pow(1 - p, 3);
  const suave = (p) => p * p * (3 - 2 * p);
  const LIMITE_VISIVEL = 1330; // abaixo disso a legenda do Instagram cobre a tela
  const CENTRO_VISIVEL = 1010;
  const CENTRO_TECLADO = 1200; // campo em foco: fica logo acima do teclado

  function caixa(el) {
    const r = el.getBoundingClientRect();
    const b = document.querySelector('.reel').getBoundingClientRect();
    return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height, cx: r.left - b.left + r.width / 2, cy: r.top - b.top + r.height / 2, fundo: r.bottom - b.top };
  }
  const zoomDe = (el) => parseFloat(getComputedStyle(el).zoom) || 1;

  // ---------- pessoa ----------

  function animadorPessoa(pessoa, { expr = 'focado', reacao, reacaoEm = 0, acao, semente = 0 }) {
    const cabeca = pessoa.querySelector('.p-cabeca');
    const tronco = pessoa.querySelector('.p-tronco');
    const maos = pessoa.querySelector('.p-maos');
    const olhos = [...pessoa.querySelectorAll('.p-olhos, .p-olhos-felizes')];
    const braco = pessoa.querySelector('.p-braco');
    let atual = null;
    return (lt) => {
      const e = reacao && lt >= reacaoEm ? reacao : expr;
      if (e !== atual) {
        if (atual) pessoa.classList.remove(`expr-${atual}`);
        pessoa.classList.add(`expr-${e}`);
        atual = e;
      }
      // Piscar a cada ~3 s (e logo depois da reação).
      const fase = (lt + semente * 0.83) % 2.9;
      const pisc = fase < 0.14 ? 1 - Math.sin((fase / 0.14) * Math.PI) * 0.92 : 1;
      olhos.forEach((o) => (o.style.transform = `scaleY(${pisc.toFixed(3)})`));
      const respira = Math.sin(lt * 2.1 + semente) * 2.5;
      let tranco = 0;
      if (reacao && lt >= reacaoEm) {
        const d = lt - reacaoEm;
        tranco = -16 * Math.exp(-d * 5) * Math.cos(d * 16);
      }
      const cansado = e === 'cansado';
      const inclina = Math.sin(lt * 1.3 + semente) * 1.8 + (cansado ? 4 : 0);
      cabeca.setAttribute('transform', `translate(0 ${(respira + tranco + (cansado ? 6 : 0)).toFixed(2)}) rotate(${inclina.toFixed(2)} 0 120)`);
      tronco.setAttribute('transform', `translate(0 ${respira.toFixed(2)})`);
      if (maos) {
        const tecla = acao === 'digitar' ? Math.abs(Math.sin(lt * 13)) * 4 : 0;
        maos.setAttribute('transform', `translate(0 ${(400 + respira + tecla).toFixed(2)})`);
      }
      if (braco) {
        const p = saida(clamp((lt - 0.15) / 0.5));
        const aceno = lt > 0.65 ? Math.sin((lt - 0.65) * 7) * 5 : 0;
        braco.setAttribute('transform', `rotate(${(115 * (1 - p) + aceno).toFixed(2)} 190 250)`);
      }
    };
  }

  // ---------- cenário (relógio, vapor, estrelas, câmera) ----------

  function animadorCenario(svg, dur) {
    const camera = svg.querySelector('.camera-pessoa');
    const relogio = svg.querySelector('.relogio');
    const h = Number(relogio.dataset.hora);
    const m = Number(relogio.dataset.minuto);
    const ponteiroH = relogio.querySelector('.rl-hora');
    const ponteiroM = relogio.querySelector('.rl-minuto');
    const vapores = [...svg.querySelectorAll('.vapor')];
    const estrelas = [...svg.querySelectorAll('.estrela')];
    return (lt) => {
      const z = 1 + 0.035 * (lt / dur);
      camera.setAttribute('transform', `translate(540 1180) scale(${z.toFixed(4)}) translate(-540 -1180)`);
      const minutos = m + lt / 2;
      ponteiroM.setAttribute('transform', `rotate(${(minutos * 6).toFixed(2)})`);
      ponteiroH.setAttribute('transform', `rotate(${(((h % 12) + minutos / 60) * 30).toFixed(2)})`);
      vapores.forEach((v, i) => {
        const c = (lt * 0.55 + i * 0.33) % 1;
        v.setAttribute('transform', `translate(${(Math.sin(c * 6 + i) * 5).toFixed(2)} ${(-c * 64).toFixed(2)})`);
        v.style.opacity = Math.sin(c * Math.PI).toFixed(3);
      });
      estrelas.forEach((s, i) => (s.style.opacity = (0.55 + 0.45 * Math.sin(lt * 2.4 + i * 1.7)).toFixed(3)));
    };
  }

  // ---------- tela do celular ----------

  function animadorTela(cena, cfg) {
    const tela = cena.querySelector('.cel-tela');
    const paginas = Object.fromEntries([...cena.querySelectorAll('.b-pagina')].map((p) => [p.dataset.pagina, p]));
    const toque = cena.querySelector('.toque');
    const onda = cena.querySelector('.toque-onda');
    const colar = cena.querySelector('.b-colar');
    const teclado = cena.querySelector('.teclado');
    const balao = teclado && teclado.querySelector('.tec-balao');
    const teclas = teclado ? Object.fromEntries([...teclado.querySelectorAll('[data-k]')].map((k) => [k.dataset.k, k])) : {};
    const passos = cfg.passos || [];
    const temaInicial = tela.classList.contains('b-tema-escuro') ? 'escuro' : 'claro';
    const inputs = [...cena.querySelectorAll('.b-input')];
    const inicial = new Map(inputs.map((el) => [el, el.querySelector('.b-txt').innerHTML]));
    const rolagens = {};
    const alvoEm = (pagina, nome) => (paginas[pagina] && paginas[pagina].querySelector(`[data-alvo="${nome}"]`)) || null;

    function aplicarRolagem(pagina, s) {
      const r = paginas[pagina] && paginas[pagina].querySelector('.b-rolagem');
      if (r) r.style.transform = `translateY(${(-s).toFixed(2)}px)`;
    }

    return (lt) => {
      // Página visível (com a transição de "ir").
      let pagina = cfg.paginaInicial;
      let anterior = null;
      let pTrans = 1;
      for (const s of passos) {
        if (s.acao === 'ir' && lt >= s.t0) {
          anterior = pagina;
          pagina = s.pagina;
          pTrans = suave(clamp((lt - s.t0) / 0.42));
        }
      }
      for (const [id, el] of Object.entries(paginas)) {
        const visivel = id === pagina || (id === anterior && pTrans < 1);
        el.classList.toggle('ativa', visivel);
        el.style.zIndex = id === pagina ? 2 : 1;
        if (id === pagina) {
          el.style.transform = `translateX(${((1 - pTrans) * 100).toFixed(2)}%)`;
          el.style.opacity = 1;
        } else if (visivel) {
          el.style.transform = `translateX(${(-30 * pTrans).toFixed(2)}%)`;
          el.style.opacity = (1 - 0.4 * pTrans).toFixed(3);
        }
      }

      // Tema do app (o botão de tema escuro pode ser tocado).
      let tema = temaInicial;
      for (const s of passos) if (s.acao === 'tocar' && s.alvo === 'tema' && lt >= s.t0 + 0.2) tema = tema === 'escuro' ? 'claro' : 'escuro';
      tela.classList.toggle('b-tema-escuro', tema === 'escuro');
      tela.classList.toggle('b-tema-claro', tema !== 'escuro');
      cena.querySelectorAll('.b-tema').forEach((b) => b.setAttribute('aria-checked', String(tema === 'escuro')));

      // Campos: texto digitado ou colado até agora, foco e cursor piscando.
      let foco = null;
      let digitando = false;
      const texto = new Map();
      for (const s of passos) {
        if (lt < s.t0) break;
        if ((s.acao === 'tocar' || s.acao === 'colar') && s.campo) foco = { pagina: s.pagina, alvo: s.campo };
        if (s.acao === 'ir') foco = null;
        if (s.acao === 'digitar') {
          const n = Math.floor(clamp((lt - s.t0) / Math.max(0.1, s.t1 - s.t0 - 0.15)) * s.texto.length);
          texto.set(`${s.pagina}|${s.campo}`, { tipo: 'txt', v: s.texto.slice(0, n) });
          if (lt < s.t1) digitando = true;
        }
        if (s.acao === 'colar' && lt >= s.t0 + 0.72) texto.set(`${s.pagina}|${s.campo}`, { tipo: 'html', v: s.html });
      }
      for (const el of inputs) {
        const pag = el.closest('.b-pagina').dataset.pagina;
        const chave = `${pag}|${el.dataset.alvo}`;
        const txt = el.querySelector('.b-txt');
        const novo = texto.get(chave);
        const html = novo ? (novo.tipo === 'html' ? novo.v : null) : inicial.get(el);
        if (novo && novo.tipo === 'txt') {
          if (txt.textContent !== novo.v) txt.textContent = novo.v;
        } else if (txt.innerHTML !== html) txt.innerHTML = html;
        el.classList.toggle('tem-valor', txt.textContent.length > 0);
        const focado = !!foco && foco.pagina === pag && foco.alvo === el.dataset.alvo;
        el.classList.toggle('foco', focado);
        el.classList.toggle('caret-off', focado && !digitando && (lt * 1.8) % 1 > 0.5);
        const pergunta = el.closest('.b-pergunta');
        if (pergunta) pergunta.classList.toggle('foco', focado);
        // Campo de uma linha: o texto anda para a esquerda quando passa da largura.
        if (!el.classList.contains('b-area')) {
          const est = getComputedStyle(el);
          const livre = el.clientWidth - parseFloat(est.paddingLeft) - parseFloat(est.paddingRight) - 4;
          const sobra = Math.max(0, txt.scrollWidth - livre);
          txt.style.transform = sobra ? `translateX(${-sobra}px)` : '';
        }
      }

      // Botões pressionados, opções abertas e o aviso de "Copiado".
      cena.querySelectorAll('.pressionado').forEach((el) => el.classList.remove('pressionado'));
      cena.querySelectorAll('.b-ajustes').forEach((el) => el.classList.remove('aberto'));
      cena.querySelectorAll('.b-status').forEach((el) => { el.textContent = ''; el.className = 'b-status'; });
      for (const s of passos) {
        if (s.acao !== 'tocar' || lt < s.t0) continue;
        const el = alvoEm(s.pagina, s.alvo);
        if (!el) continue;
        if (lt >= s.t0 + 0.14 && lt < s.t0 + 0.42) el.classList.add('pressionado');
        if (s.alvo === 'ajustes' && lt >= s.t0 + 0.2) el.classList.add('aberto');
        if ((s.alvo === 'abrir' || s.alvo === 'copiar') && lt >= s.t0 + 0.3) {
          const st = alvoEm(s.pagina, 'status');
          if (st) { st.textContent = st.dataset.ok; st.className = 'b-status ok'; }
        }
        if (s.alvo.startsWith('ia-') && lt >= s.t0 + 0.2) {
          el.parentElement.querySelectorAll('[aria-pressed]').forEach((b) => b.setAttribute('aria-pressed', String(b === el)));
        }
      }

      // Rolagem: "rolar" leva o alvo para o meio da parte visível; tocar num campo sobe a
      // página até o campo ficar logo acima do teclado, como no celular.
      const rol = {};
      for (const s of passos) {
        const noCampo = (s.acao === 'tocar' || s.acao === 'colar') && s.campo;
        if (s.acao !== 'rolar' && !noCampo) continue;
        const ini = noCampo ? s.t0 + 0.12 : s.t0;
        const fim = noCampo ? s.t0 + 0.5 : s.t1;
        if (lt < ini) continue;
        const atual = rol[s.pagina] || 0;
        if (s.destino === undefined) {
          aplicarRolagem(s.pagina, atual);
          const el = alvoEm(s.pagina, s.alvo);
          const z = zoomDe(paginas[s.pagina]);
          const centro = noCampo ? CENTRO_TECLADO : CENTRO_VISIVEL;
          const c = el ? caixa(el) : null;
          const y = c ? (el.classList.contains('b-area') ? c.y + 90 : c.cy) : centro;
          s.destino = noCampo ? Math.max(atual, atual + (y - centro) / z) : Math.max(0, atual + (y - centro) / z);
        }
        rol[s.pagina] = atual + (s.destino - atual) * suave(clamp((lt - ini) / (fim - ini)));
      }
      for (const id of Object.keys(paginas)) aplicarRolagem(id, rol[id] || 0);

      // Teclado: sobe ao tocar num campo, desce ao tocar num botão ou trocar de página.
      if (teclado) {
        let desde = null;
        let aberto = false;
        for (const s of passos) {
          if (lt < s.t0) break;
          const noCampo = (s.acao === 'tocar' || s.acao === 'colar') && s.campo;
          if (noCampo && !aberto) { aberto = true; desde = s.t0 + 0.12; }
          else if (((s.acao === 'tocar' && !s.campo) || s.acao === 'ir') && aberto) { aberto = false; desde = s.t0 + (s.acao === 'ir' ? 0 : 0.3); }
        }
        let p = 0;
        if (desde !== null) p = aberto ? saida(clamp((lt - desde) / 0.28)) : 1 - saida(clamp((lt - desde) / 0.25));
        teclado.style.transform = `translateY(${((1 - p) * 100).toFixed(2)}%)`;
        Object.values(teclas).forEach((k) => k.classList.remove('acesa'));
        balao.style.opacity = 0;
        const d = passos.find((s) => s.acao === 'digitar' && lt >= s.t0 && lt < s.t1 - 0.15);
        if (d && p > 0.9) {
          const n = Math.floor(clamp((lt - d.t0) / Math.max(0.1, d.t1 - d.t0 - 0.15)) * d.texto.length);
          const letra = (d.texto[Math.max(0, n - 1)] || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
          const k = teclas[letra];
          if (k && n > 0) {
            k.classList.add('acesa');
            if (letra !== ' ') {
              balao.textContent = letra;
              balao.style.opacity = 1;
              balao.style.left = `${k.offsetLeft + k.offsetWidth / 2}px`;
              balao.style.top = `${k.offsetTop}px`;
            }
          }
        }
      }

      // O dedo: um círculo que aparece no ponto tocado, com uma onda no toque.
      toque.style.opacity = 0;
      onda.style.opacity = 0;
      colar.style.opacity = 0;
      for (const s of passos) {
        if ((s.acao !== 'tocar' && s.acao !== 'colar') || lt < s.t0 || lt > s.t1 + 0.05) continue;
        const el = alvoEm(s.pagina, s.alvo);
        if (!el) continue;
        const c = caixa(el);
        let x = el.classList.contains('b-input') ? c.x + Math.min(c.w * 0.3, 150) : c.cx;
        let y = el.classList.contains('b-area') ? c.y + 60 : c.cy;
        let t = lt - s.t0;
        let fim = 0.4;
        let comOnda = true;
        if (s.acao === 'colar') {
          // Toque longo no campo, aparece "Colar" em cima dele, toque no "Colar".
          const tc = caixa(tela);
          const px = x - tc.x - 82;
          const py = y - tc.y - 150;
          colar.style.left = `${px.toFixed(1)}px`;
          colar.style.top = `${py.toFixed(1)}px`;
          const pc = saida(clamp((t - 0.3) / 0.12)) * (1 - clamp((t - 0.76) / 0.1));
          colar.style.opacity = pc.toFixed(3);
          colar.style.transform = `scale(${(0.85 + 0.15 * pc).toFixed(3)})`;
          if (t < 0.5) {
            fim = 0.36;
            comOnda = false;
          } else {
            x = tc.x + px + 82;
            y = tc.y + py + 39;
            t -= 0.5;
            fim = 0.3;
          }
        }
        const entra = saida(clamp(t / 0.12));
        const sai = 1 - clamp((t - fim) / 0.14);
        toque.style.opacity = (entra * sai).toFixed(3);
        toque.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${(0.7 + 0.3 * entra).toFixed(3)})`;
        const po = clamp((t - 0.14) / 0.36);
        if (comOnda && po > 0 && po < 1) {
          onda.style.opacity = (0.9 * (1 - po)).toFixed(3);
          onda.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${(1 + 1.2 * saida(po)).toFixed(3)})`;
        }
      }
    };
  }

  // ---------- conversa com a IA ----------

  function animadorChat(cena, cfg) {
    const eu = cena.querySelector('.c-eu');
    const digitando = cena.querySelector('.c-digitando');
    const pontos = [...digitando.querySelectorAll('i')];
    const blocos = [...cena.querySelectorAll('.c-bloco')];
    const fio = cena.querySelector('.c-fio');
    const rolagem = cena.querySelector('.c-rolagem');
    const z = zoomDe(cena.querySelector('.b-pagina'));
    const topo = caixa(rolagem).y;
    const visivel = (LIMITE_VISIVEL - topo) / z;
    // O "digitando" some quando a resposta começa: mede com ele recolhido.
    digitando.style.display = 'none';
    const fundos = blocos.map((b) => (caixa(b).fundo - topo) / z);
    const destino = (k) => (k < 0 ? 0 : Math.max(0, fundos[k] - visivel));
    const { inicio, ritmo } = cfg;
    return (lt) => {
      const pe = saida(clamp((lt - 0.1) / 0.35));
      eu.style.opacity = pe.toFixed(3);
      eu.style.transform = `translateY(${((1 - pe) * 24).toFixed(2)}px)`;
      const mostraDig = lt >= 0.55 && lt < inicio;
      digitando.style.display = mostraDig ? 'flex' : 'none';
      pontos.forEach((p, i) => (p.style.transform = `translateY(${(-5 * Math.max(0, Math.sin(lt * 9 - i * 0.9))).toFixed(2)}px)`));
      blocos.forEach((b, k) => {
        const p = saida(clamp((lt - (inicio + k * ritmo)) / 0.3));
        b.style.opacity = p.toFixed(3);
        b.style.transform = `translateY(${((1 - p) * 10).toFixed(2)}px)`;
      });
      const k = Math.min(blocos.length - 1, Math.floor((lt - inicio) / ritmo));
      const tk = inicio + Math.max(0, k) * ritmo;
      const s = destino(k - 1) + (destino(k) - destino(k - 1)) * suave(clamp((lt - tk) / 0.4));
      fio.style.transform = `translateY(${(-s).toFixed(2)}px)`;
    };
  }

  window.__demo = {
    preparar(cenas, tempos) {
      return cenas.map((cena, i) => {
        if (!cena.dataset.demo) return null;
        const cfg = JSON.parse(cena.dataset.demo);
        const dur = tempos[i].fim - tempos[i].ini;
        cena.classList.add('ativa');
        const partes = [];
        const svg = cena.querySelector('.ilustracao');
        if (svg) partes.push(animadorCenario(svg, dur));
        cena.querySelectorAll('.pessoa').forEach((p) => partes.push(animadorPessoa(p, { ...cfg, semente: i })));
        if (cfg.tipo === 'tela') partes.push(animadorTela(cena, cfg));
        if (cfg.tipo === 'chat') partes.push(animadorChat(cena, cfg));
        cena.classList.remove('ativa');
        return (lt) => partes.forEach((f) => f(lt));
      });
    },
  };
})();

/**
 * Roleta numérica: arrastável (com inércia), digitável e circular.
 * Passou do máximo, volta ao 0 (e ao descer abaixo de 0, vai ao máximo).
 *
 * Uso:
 *   const r = Componentes.Roleta(elementoHospedeiro, {
 *     id: "n-input",        // id do campo de texto (para o <label for>)
 *     max: 500,             // o valor vai de 0 a max
 *     value: 300,           // valor inicial
 *     item: 48,             // (opcional) altura de cada número, em px
 *     width: 110,           // (opcional) largura, em px
 *     format: v => String(v),   // (opcional) como o valor é exibido
 *     parse: texto => índice,   // (opcional) como o texto digitado vira valor
 *     onChange: v => { ... }    // chamado quando o valor muda
 *   });
 *   r.value; r.set(v); r.setMax(m);
 */
(function (raiz) {
  "use strict";
  const C = (raiz.Componentes = raiz.Componentes || {});

  C.Roleta = function (host, opts) {
    const ITEM = opts.item || 48;          // altura de cada número
    const H = ITEM * 4;                    // altura total da roleta
    const CY = H / 2;                      // centro vertical
    const OFFS = 3;                        // quantos números aparecem acima/abaixo do central
    const fmt = opts.format || String;     // como o valor é exibido (ex.: 0 -> "–")
    const TAU = 0.9;                       // constante de tempo do atrito da inércia (s)
    const SNAP_V = 2.5;                    // abaixo disso (unid/s) a roleta assenta no inteiro

    let max = opts.max;
    let pos = opts.value;                  // posição contínua (pode ser fracionária durante o giro)
    let lastVal = opts.value;
    let gain = 1;                          // quanto 1 px de arrasto vale em unidades
    let dragging = false, mode = "none", raf = 0, lastT = 0, vel = 0;
    let samples = [], startY = 0, lastY = 0, startT = 0;

    // ---- monta o DOM ----
    const wrap = document.createElement("div");
    wrap.className = "wheel-wrap";
    wrap.style.setProperty("--item", ITEM + "px");
    wrap.style.setProperty("--h", H + "px");
    wrap.style.setProperty("--fs", Math.round(ITEM * 0.875) + "px");
    if (opts.width) wrap.style.width = opts.width + "px";
    const wheel = document.createElement("div");
    wheel.className = "wheel";
    const rows = [];
    for (let o = -OFFS; o <= OFFS; o++) {
      const r = document.createElement("div");
      r.className = "row";
      r.setAttribute("aria-hidden", "true");
      wheel.appendChild(r);
      rows.push(r);
    }
    const input = document.createElement("input");
    input.type = "text";
    input.id = opts.id;
    input.inputMode = "numeric";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("role", "spinbutton");
    input.setAttribute("aria-valuemin", "0");
    wheel.appendChild(input);
    wrap.appendChild(wheel);
    host.appendChild(wrap);

    // ---- valor atual ----
    function mod(x) { const m = max + 1; return ((x % m) + m) % m; }   // dá a volta: max + 1 -> 0
    function value() { return mod(Math.round(pos)); }
    function setGain() { gain = Math.max(1, Math.sqrt(max) / 8); }     // faixas grandes giram mais rápido

    // ---- desenho ----
    function render() {
      const base = Math.round(pos);
      const idle = !dragging && mode === "none";
      for (let o = -OFFS; o <= OFFS; o++) {
        const idx = base + o, d = Math.abs(idx - pos), row = rows[o + OFFS], v = mod(idx);
        if (row._v !== v) { row.textContent = fmt(v); row._v = v; }
        const s = 1 - 0.14 * Math.min(d, 2.5);
        row.style.transform = "translateY(" + (CY - ITEM / 2 + (idx - pos) * ITEM) + "px) scale(" + s.toFixed(3) + ")";
        let op = Math.max(0, 1 - d * 0.38);
        if (max === 0 && o !== 0) op = 0;
        if (o === 0 && idle) op = 0;        // parada: o campo de texto ocupa o centro
        row.style.opacity = op;
      }
      input.style.opacity = idle ? 1 : 0;
      input.setAttribute("aria-valuemax", max);
      input.setAttribute("aria-valuenow", value());
      input.setAttribute("aria-valuetext", fmt(value()));
      if (document.activeElement !== input) input.value = fmt(value());
    }

    function emit() {
      const v = value();
      if (v !== lastVal) { lastVal = v; opts.onChange(v); }
    }

    // ---- animação (inércia e assentamento no inteiro) ----
    function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; mode = "none"; }

    function frame(t) {
      const dt = Math.min((t - lastT) / 1000, 0.05);
      lastT = t;
      if (mode === "inertia") {
        pos += vel * dt;
        vel *= Math.exp(-dt / TAU);          // atrito: a velocidade decai exponencialmente
        if (Math.abs(vel) < SNAP_V) mode = "snap";
      } else if (mode === "snap") {
        const alvo = Math.round(pos);
        pos += (alvo - pos) * (1 - Math.exp(-dt / 0.07));
        if (Math.abs(alvo - pos) < 0.002) { pos = alvo; mode = "none"; }
      }
      render();
      emit();
      raf = mode === "none" ? 0 : requestAnimationFrame(frame);
    }
    function start(m) {
      mode = m;
      lastT = performance.now();
      if (!raf) raf = requestAnimationFrame(frame);
    }

    function commitTo(v, silent) {
      stop();
      pos = Math.max(0, Math.min(max, v));
      render();
      if (!silent) emit(); else lastVal = value();
    }

    // ---- arrastar ----
    wheel.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      stop();
      dragging = true;
      startY = lastY = e.clientY;
      startT = performance.now();
      samples = [{ t: startT, p: pos }];
      wheel.classList.add("grabbing");
      try { wheel.setPointerCapture(e.pointerId); } catch (err) { /* ignora */ }
      render();
    });

    wheel.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      const dy = e.clientY - lastY;
      lastY = e.clientY;
      if (max > 0) pos += (-dy / ITEM) * gain;   // arrastar para cima aumenta o valor
      const t = performance.now();
      samples.push({ t, p: pos });               // guarda as últimas posições para medir a velocidade
      while (samples.length > 2 && t - samples[0].t > 100) samples.shift();
      render();
      emit();
    });

    function release(e) {
      if (!dragging) return;
      dragging = false;
      wheel.classList.remove("grabbing");
      try { wheel.releasePointerCapture(e.pointerId); } catch (err) { /* ignora */ }
      const agora = performance.now();
      const toque = Math.abs(e.clientY - startY) < 5 && agora - startT < 400;
      if (toque || max === 0) {                  // clique sem arrastar: abre a digitação
        pos = Math.round(pos);
        render();
        emit();
        input.focus();
        return;
      }
      // velocidade ao soltar = deslocamento / tempo nas últimas amostras
      let v = 0;
      const a = samples[0], b = samples[samples.length - 1];
      if (samples.length >= 2 && agora - b.t < 80 && b.t > a.t) v = (b.p - a.p) / ((b.t - a.t) / 1000);
      const limite = 150 * gain;
      v = Math.max(-limite, Math.min(limite, v));
      vel = v;
      start(Math.abs(v) < SNAP_V ? "snap" : "inertia");
    }
    wheel.addEventListener("pointerup", release);
    wheel.addEventListener("pointercancel", release);

    // ---- digitar ----
    input.addEventListener("focus", function () { input.select(); });
    input.addEventListener("input", function () {
      if (opts.parse) {                          // entrada personalizada
        let pv = opts.parse(input.value);
        if (pv === null) return;                 // texto incompleto
        pv = Math.max(0, Math.min(max, pv));
        stop(); pos = pv; render(); emit();
        return;
      }
      const digitos = input.value.replace(/\D/g, "");
      if (digitos === "") { input.value = ""; return; }
      let v = parseInt(digitos, 10);
      if (v > max) v = max;
      input.value = fmt(v);
      stop(); pos = v; render(); emit();
    });
    input.addEventListener("blur", function () { input.value = fmt(value()); });
    input.addEventListener("keydown", function (e) {
      let passo = 0;
      if (e.key === "ArrowUp") passo = 1;
      else if (e.key === "ArrowDown") passo = -1;
      else if (e.key === "PageUp") passo = 10;
      else if (e.key === "PageDown") passo = -10;
      else if (e.key === "Enter") { input.blur(); return; }
      if (!passo) return;
      e.preventDefault();
      stop(); pos = Math.round(pos) + passo; render(); emit();
      input.value = fmt(value());
      input.select();
    });

    setGain();
    render();

    return {
      get value() { return value(); },
      set(v) { commitTo(v); },
      setMax(m) {
        const atual = value();               // lê o valor ANTES de mudar o máximo
        max = Math.max(0, m);
        setGain();
        pos = Math.min(atual, max);          // se ficou acima do novo máximo, fica no teto
        render();
        emit();
      }
    };
  };
})(window);

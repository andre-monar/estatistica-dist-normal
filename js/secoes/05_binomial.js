/**
 * Seção 5: lei binomial P(X = k) para n ensaios, com p vindo do critério de sucesso.
 */
(function (raiz) {
  "use strict";
  const { $, criarSvg: svg, formula, ajustarLargura } = raiz.Componentes;
  const E = raiz.Estatistica;
  const { nf, inteiro: nInt, tc, probTex, pctTexto, combTex } = E.fmt;
  const S = (raiz.Secoes = raiz.Secoes || {});
  const FONTE = "EB Garamond, serif";

  /** Gráfico de barras de P(X = i). Mostra só o trecho onde há probabilidade relevante. */
  function desenharGrafico(n, k, p) {
    const svgEl = $("chart");
    const W = 640, H = 230, Lm = 48, Rm = 12, T = 12, B = 40, iw = W - Lm - Rm, ih = H - T - B;
    const lp = E.logPmf(n, p);
    let maxLp = -Infinity;
    for (let i = 0; i <= n; i++) if (lp[i] > maxLp) maxLp = lp[i];
    const maxP = Math.exp(maxLp);

    // trecho visível: todo o intervalo se n <= 60; senão, onde P >= 0,1% do pico
    let lo = 0, hi = n;
    if (n > 60) {
      const corte = Math.log(maxP * 1e-3);
      lo = n; hi = 0;
      for (let i = 0; i <= n; i++) if (lp[i] >= corte) { if (i < lo) lo = i; if (i > hi) hi = i; }
      lo = Math.max(0, lo - 1);
      hi = Math.min(n, hi + 1);
      if (hi - lo < 10) hi = Math.min(n, lo + 10);
    }
    const qtd = hi - lo + 1;
    const ymax = Math.min(1, Math.ceil(maxP * 1.15 * 20) / 20) || 1;
    svgEl.textContent = "";

    // eixo y
    const marcas = 4;
    for (let i = 0; i <= marcas; i++) {
      const v = (ymax * i) / marcas, y = T + ih - (v / ymax) * ih;
      svgEl.appendChild(svg("line", { x1: Lm, x2: W - Rm, y1: y, y2: y, stroke: i === 0 ? "#111" : "#e4e4e4", "stroke-width": i === 0 ? 1.2 : 1 }));
      svgEl.appendChild(svg("text", { x: Lm - 8, y: y + 4, "text-anchor": "end", "font-size": 14, fill: "#6b6b6b", "font-family": FONTE }, nf(2).format(v)));
    }

    // barras (a de k em preto)
    const fatia = iw / qtd, larguraBarra = Math.max(1, fatia * 0.72), kVisivel = k >= lo && k <= hi;
    for (let i = lo; i <= hi; i++) {
      const h = (Math.exp(lp[i]) / ymax) * ih, x = Lm + fatia * (i - lo) + (fatia - larguraBarra) / 2;
      svgEl.appendChild(svg("rect", { x, y: T + ih - h, width: larguraBarra, height: Math.max(h, 0), fill: i === k ? "#111" : "#c9c9c9" }));
    }

    // rótulos do eixo x com passo "bonito" (1, 2, 5, 10, 20, 50...)
    const bruto = qtd / 7, base = [1, 2, 5];
    let passo = 1, mag = 1;
    achou: for (;;) {
      for (let s = 0; s < 3; s++) if (base[s] * mag >= bruto) { passo = base[s] * mag; break achou; }
      mag *= 10;
    }
    const rotulos = {};
    for (let j = Math.ceil(lo / passo) * passo; j <= hi; j += passo) rotulos[j] = true;
    if (kVisivel) rotulos[k] = true;
    Object.keys(rotulos).forEach(function (chave) {
      const j = +chave;
      if (kVisivel && j !== k && Math.abs(j - k) * fatia < 30) return;   // evita sobrepor o rótulo de k
      svgEl.appendChild(svg("text", {
        x: Lm + fatia * (j - lo) + fatia / 2, y: T + ih + 18, "text-anchor": "middle", "font-size": 14,
        fill: j === k ? "#111" : "#6b6b6b", "font-weight": j === k ? 600 : 400, "font-family": FONTE
      }, String(j)));
    });
    svgEl.appendChild(svg("text", { x: Lm + iw / 2, y: H - 4, "text-anchor": "middle", "font-size": 16, "font-style": "italic", fill: "#111", "font-family": FONTE }, "k (número de sucessos)"));

    let legenda = "Distribuição de X para n = " + nInt.format(n) + " e p = " + nf(4).format(p) + ". ";
    if (n > 60 && qtd < n + 1) legenda += "Exibindo k de " + nInt.format(lo) + " a " + nInt.format(hi) + ". ";
    legenda += kVisivel
      ? "A barra escura marca k = " + nInt.format(k) + "."
      : "k = " + nInt.format(k) + " fica fora do trecho exibido (probabilidade desprezível).";
    $("chart-title").textContent = legenda;
  }

  S.binomial = {
    /** p e q vêm da seção do critério (proporção de sucessos para o limite L). */
    desenhar(ctx, L, p, q) {
      const n = ctx.estado.n;
      const k = Math.min(ctx.estado.k, n);

      $("k-hint").textContent = "de 0 a " + nInt.format(n);
      $("vigente").textContent = "Com G > R$ " + nInt.format(L) + ": p = " + nf(4).format(p) + " e q = " + nf(4).format(q) + ".";
      $("msg").textContent = "";

      const lp = E.logBinomial(n, k, p);                 // log de P(X = k)
      const pT = tc(nf(4).format(p)), qT = tc(nf(4).format(q));
      formula($("steps"),
        "\\begin{gathered}P(X=" + k + ")=\\binom{" + n + "}{" + k + "}\\,(" + pT + ")^{" + k + "}\\,(" + qT + ")^{" + (n - k) + "}\\\\[4pt]" +
        "\\text{com }\\tbinom{" + n + "}{" + k + "}=" + combTex(n, k) + "\\end{gathered}", true);
      ajustarLargura($("steps"), 23);

      formula($("res"), "P(X=" + k + ")=" + probTex(lp), false);
      ajustarLargura($("res"), window.innerWidth < 520 ? 38 : 56);
      $("pct").textContent = pctTexto(lp) + " de chance de exatamente " + nInt.format(k) + " de " + nInt.format(n) +
        " clientes gastarem mais de R$ " + nInt.format(L) + ",00.";

      desenharGrafico(n, k, p);
    }
  };
})(window);

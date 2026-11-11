/**
 * Seção 6: Teorema do Limite Central e erro padrão da média.
 *  - curva de um cliente (tracejada) x curva das médias de n clientes (sólida)
 *  - P(x̄ > a) com Z = (a - mu) / (sigma / raiz(n))
 *  - sorteio de grupos: histograma das médias de grupos reais
 */
(function (raiz) {
  "use strict";
  const { $, criarSvg: svg, formula, ajustarLargura } = raiz.Componentes;
  const E = raiz.Estatistica;
  const { nf, inteiro: nInt, tc, r2, r4, f4, pct2, probTex, pctTexto } = E.fmt;
  const S = (raiz.Secoes = raiz.Secoes || {});
  const FONTE = "EB Garamond, serif";
  const QTD_GRUPOS = 2000;

  // estado do sorteio: as médias sorteadas e o n com que foram sorteadas
  let medias = null, tamanhoSorteado = 0;

  /** Passo "bonito" (1, 2, 5 x 10^k) para os rótulos do eixo. */
  function passoBonito(bruto) {
    const mag = Math.pow(10, Math.floor(Math.log10(bruto))), m = bruto / mag;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * mag;
  }

  function desenharCurvas(ctx, n, a, erro, cauda) {
    const { mu, sigma } = ctx;
    const svgEl = $("tlc-chart");
    const W = 640, H = 250, Lm = 16, Rm = 16, T = 40, Bm = 44, iw = W - Lm - Rm, ih = H - T - Bm;
    const sx = (v) => Lm + (v / 500) * iw;
    const ymax = E.densidade(mu, mu, erro) * 1.1;          // a escala acompanha o pico da curva das médias
    const sy = (d) => T + ih - (d / ymax) * ih;
    const passo = Math.min(2.5, erro / 6);                 // amostragem mais fina quando a curva é estreita
    svgEl.textContent = "";

    // área P(x̄ > a)
    let caudaPath = "M" + sx(a).toFixed(1) + " " + sy(0);
    for (let x = a; x < 500; x += passo) caudaPath += "L" + sx(x).toFixed(1) + " " + sy(E.densidade(x, mu, erro)).toFixed(1);
    caudaPath += "L" + sx(500).toFixed(1) + " " + sy(E.densidade(500, mu, erro)).toFixed(1) + "L" + sx(500).toFixed(1) + " " + sy(0) + "Z";
    svgEl.appendChild(svg("path", { d: caudaPath, fill: "#c4c4c4" }));

    let dUm = "", dMedias = "";
    for (let x = 0; x <= 500.0001; x += 2.5) dUm += (x === 0 ? "M" : "L") + sx(x).toFixed(1) + " " + sy(E.densidade(x, mu, sigma)).toFixed(1);
    for (let x = 0; x <= 500.0001; x += passo) dMedias += (x === 0 ? "M" : "L") + sx(x).toFixed(1) + " " + sy(E.densidade(x, mu, erro)).toFixed(1);
    svgEl.appendChild(svg("path", { d: dUm, fill: "none", stroke: "#6b6b6b", "stroke-width": 1.6, "stroke-dasharray": "5 4" }));
    svgEl.appendChild(svg("path", { d: dMedias, fill: "none", stroke: "#111", "stroke-width": 1.9, "stroke-linejoin": "round" }));
    svgEl.appendChild(svg("line", { x1: Lm, x2: W - Rm, y1: sy(0), y2: sy(0), stroke: "#111", "stroke-width": 1.2 }));
    for (let x = 0; x <= 500; x += 100) {
      svgEl.appendChild(svg("line", { x1: sx(x), x2: sx(x), y1: sy(0), y2: sy(0) + 5, stroke: "#111" }));
      svgEl.appendChild(svg("text", { x: sx(x), y: sy(0) + 22, "text-anchor": "middle", "font-size": 14, fill: "#6b6b6b", "font-family": FONTE }, String(x)));
    }
    svgEl.appendChild(svg("text", { x: W / 2, y: H - 4, "text-anchor": "middle", "font-size": 16, "font-style": "italic", fill: "#111", "font-family": FONTE }, "gasto mensal (R$)"));
    svgEl.appendChild(svg("line", { x1: sx(mu), x2: sx(mu), y1: T - 6, y2: sy(0), stroke: "#6b6b6b", "stroke-width": 1, "stroke-dasharray": "2 4" }));
    svgEl.appendChild(svg("line", { x1: sx(a), x2: sx(a), y1: T - 6, y2: sy(0), stroke: "#111", "stroke-width": 2 }));

    const texto = "a = " + nInt.format(a), largura = 8.5 * texto.length;
    let lado = a >= mu ? 1 : -1;
    if (lado === 1 && sx(a) + 6 + largura > W - 4) lado = -1;
    else if (lado === -1 && sx(a) - 6 - largura < 4) lado = 1;
    svgEl.appendChild(svg("text", { x: sx(a) + lado * 6, y: T - 12, "text-anchor": lado === 1 ? "start" : "end", "font-size": 15, "font-style": "italic", "font-weight": 600, fill: "#111", "font-family": FONTE }, texto));

    $("tlc-cap").textContent = "Curva sólida: médias de grupos de " + nInt.format(n) + " (μ = " + nf(2).format(mu) + ", erro padrão R$ " + nf(2).format(erro) +
      "). Curva tracejada: um cliente (σ = R$ " + nf(2).format(sigma) + "). A área cinza é P(x̄ > a).";
  }

  function desenharHistograma(ctx, n, a, erro, textoTeorico) {
    const { mu } = ctx;
    const svgEl = $("tlc-hist");
    const W = 640, H = 250, Lm = 16, Rm = 16, T = 40, Bm = 44, iw = W - Lm - Rm, ih = H - T - Bm;
    svgEl.textContent = "";

    if (!medias || tamanhoSorteado !== n) {
      svgEl.appendChild(svg("text", { x: W / 2, y: H / 2, "text-anchor": "middle", "font-size": 18, "font-style": "italic", fill: "#6b6b6b", "font-family": FONTE }, "clique em “sortear grupos” para esse tamanho de grupo"));
      $("tlc-hist-cap").textContent = "";
      $("tlc-sim-txt").textContent = "";
      return;
    }

    // histograma em 32 faixas de mu - 4 erros a mu + 4 erros
    const lo = mu - 4 * erro, hi = mu + 4 * erro, faixas = 32, largFaixa = (hi - lo) / faixas;
    const cont = new Array(faixas).fill(0);
    let soma = 0, acima = 0;
    for (let i = 0; i < QTD_GRUPOS; i++) {
      const m = medias[i];
      soma += m;
      if (m > a) acima++;
      const f = Math.floor((m - lo) / largFaixa);
      if (f >= 0 && f < faixas) cont[f]++;
    }
    const mediaDasMedias = soma / QTD_GRUPOS;
    let sq = 0;
    for (let i = 0; i < QTD_GRUPOS; i++) sq += (medias[i] - mediaDasMedias) ** 2;
    const dpDasMedias = Math.sqrt(sq / (QTD_GRUPOS - 1));

    // escala: densidade = contagem / (total x largura da faixa), comparável com a curva
    let maxD = E.densidade(mu, mu, erro);
    for (let i = 0; i < faixas; i++) maxD = Math.max(maxD, cont[i] / (QTD_GRUPOS * largFaixa));
    const hy = maxD * 1.12;
    const sx = (v) => Lm + ((v - lo) / (hi - lo)) * iw;
    const sy = (d) => T + ih - (d / hy) * ih;

    for (let i = 0; i < faixas; i++) {
      const d = cont[i] / (QTD_GRUPOS * largFaixa), x0 = sx(lo + i * largFaixa), x1 = sx(lo + (i + 1) * largFaixa);
      svgEl.appendChild(svg("rect", { x: x0 + 0.5, y: sy(d), width: Math.max(1, x1 - x0 - 1), height: Math.max(0, sy(0) - sy(d)), fill: "#c9c9c9" }));
    }
    let curva = "";
    for (let x = lo; x <= hi + 1e-9; x += (hi - lo) / 160) curva += (x === lo ? "M" : "L") + sx(x).toFixed(1) + " " + sy(E.densidade(x, mu, erro)).toFixed(1);
    svgEl.appendChild(svg("path", { d: curva, fill: "none", stroke: "#111", "stroke-width": 1.9, "stroke-linejoin": "round" }));
    svgEl.appendChild(svg("line", { x1: Lm, x2: W - Rm, y1: sy(0), y2: sy(0), stroke: "#111", "stroke-width": 1.2 }));

    const passo = passoBonito((hi - lo) / 7), casas = passo < 1 ? 1 : 0;
    for (let x = Math.ceil(lo / passo) * passo; x <= hi; x += passo) {
      svgEl.appendChild(svg("line", { x1: sx(x), x2: sx(x), y1: sy(0), y2: sy(0) + 5, stroke: "#111" }));
      svgEl.appendChild(svg("text", { x: sx(x), y: sy(0) + 22, "text-anchor": "middle", "font-size": 14, fill: "#6b6b6b", "font-family": FONTE }, nf(casas).format(x)));
    }
    svgEl.appendChild(svg("text", { x: W / 2, y: H - 4, "text-anchor": "middle", "font-size": 16, "font-style": "italic", fill: "#111", "font-family": FONTE }, "média do grupo (R$)"));
    if (a >= lo && a <= hi) {
      svgEl.appendChild(svg("line", { x1: sx(a), x2: sx(a), y1: T - 6, y2: sy(0), stroke: "#111", "stroke-width": 2 }));
      svgEl.appendChild(svg("text", { x: sx(a) + 6, y: T - 12, "font-size": 15, "font-style": "italic", "font-weight": 600, fill: "#111", "font-family": FONTE }, "a = " + nInt.format(a)));
    }

    $("tlc-hist-cap").textContent = "Histograma das médias de " + nInt.format(QTD_GRUPOS) + " grupos de " + nInt.format(n) +
      " clientes sorteados dos dados reais. A curva é a normal teórica com média μ e erro padrão σ/√n.";
    $("tlc-sim-txt").innerHTML =
      "<span class=\"ln\">Média das " + nInt.format(QTD_GRUPOS) + " médias: R$ " + nf(2).format(mediaDasMedias) + " (μ = R$ " + nf(2).format(mu) + ").</span>" +
      "<span class=\"ln\">Desvio padrão das médias: R$ " + nf(2).format(dpDasMedias) + " (erro padrão teórico: R$ " + nf(2).format(erro) + ").</span>" +
      "<span class=\"ln\">Grupos com média acima de R$ " + nInt.format(a) + ": " + pct2(acima / QTD_GRUPOS) + " (teórico: " + textoTeorico + ").</span>";
  }

  S.tlc = {
    /** Sorteia os grupos e pede um novo desenho (aoTerminar). */
    sortear(ctx, aoTerminar) {
      medias = E.sortearMedias(ctx.dados, ctx.estado.ng, QTD_GRUPOS);
      tamanhoSorteado = ctx.estado.ng;
      aoTerminar();
    },

    /** Descarta o sorteio (quando o tamanho do grupo muda). */
    invalidar() { medias = null; },

    desenhar(ctx) {
      const { mu, sigma } = ctx;
      const n = ctx.estado.ng, a = ctx.estado.ag;
      const erro = E.erroPadrao(sigma, n);
      const muT = tc(nf(2).format(mu)), sT = tc(nf(2).format(sigma)), erroT = tc(nf(2).format(erro));

      // erro padrão
      formula($("tlc-formula"), "\\sigma_{\\bar{x}}=\\frac{\\sigma}{\\sqrt{n}}=\\frac{" + sT + "}{\\sqrt{" + n + "}}=" + erroT, true);
      ajustarLargura($("tlc-formula"), 23);

      // P(x̄ > a): Z com o erro padrão no lugar de sigma
      const z = r2(E.escoreZ(a, mu, erro));
      const pa = r4(E.Phi(z));
      const cauda = E.probMaior(z);
      const conta = cauda >= 1e-4
        ? "=1-" + f4(pa) + "=" + f4(r4(1 - pa))
        : "\\approx " + probTex(Math.log(cauda));         // muito pequena: notação científica
      formula($("tlc-res"),
        "\\begin{gathered}Z=\\frac{\\bar{x}-\\mu}{\\sigma_{\\bar{x}}}=\\frac{" + a + "-" + muT + "}{" + erroT + "}=" + tc(nf(2).format(z)) +
        "\\\\[6pt]P(\\bar{x}>" + a + ")=1-\\Phi(" + tc(nf(2).format(z)) + ")" + conta + "\\end{gathered}", true);
      ajustarLargura($("tlc-res"), 23);

      const textoTeorico = cauda > 0 ? pctTexto(Math.log(cauda)) : "0%";
      const umCliente = E.probMaior(E.escoreZ(a, mu, sigma));
      $("tlc-txt").innerHTML =
        "<span class=\"ln\">Para a média de " + nInt.format(n) + (n === 1 ? " cliente" : " clientes") + ": P(x̄ &gt; R$ " + nInt.format(a) + ") = " + textoTeorico + ".</span>" +
        "<span class=\"ln\">Para um cliente isolado: P(X &gt; R$ " + nInt.format(a) + ") = " + pct2(umCliente) + ".</span>";

      desenharCurvas(ctx, n, a, erro, cauda);
      desenharHistograma(ctx, n, a, erro, textoTeorico);
    }
  };
})(window);

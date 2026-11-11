/**
 * Seção 3 (curva normal): curva do gasto mensal, limite L, intervalos
 * mu ± k·sigma e o escore Z do limite.
 */
(function (raiz) {
  "use strict";
  const { $, criarSvg: svg, formula, ajustarLargura } = raiz.Componentes;
  const E = raiz.Estatistica;
  const { nf, inteiro: nInt, tc } = E.fmt;
  const S = (raiz.Secoes = raiz.Secoes || {});
  const FONTE = "EB Garamond, serif";

  /** Curva normal em R$ 0..500, com a média, o limite L e (opcional) a faixa mu ± ks·sigma. */
  function desenharCurva(ctx, L, ks) {
    const { mu, sigma } = ctx;
    const svgEl = $("normal");
    const W = 640, H = 304, Lm = 16, Rm = 16, T = 54, B = 84;
    const iw = W - Lm - Rm, ih = H - T - B;
    const X0 = 0, X1 = 500;
    const sx = (x) => Lm + ((x - X0) / (X1 - X0)) * iw;                  // R$ -> pixel
    const ymax = E.densidade(mu, mu, sigma) * 1.08;
    const sy = (d) => T + ih - (d / ymax) * ih;                          // densidade -> pixel
    svgEl.textContent = "";

    // curva e área sob ela
    let linha = "";
    for (let x = X0; x <= X1; x += 2.5) linha += (x === X0 ? "M" : "L") + sx(x).toFixed(1) + " " + sy(E.densidade(x, mu, sigma)).toFixed(1);
    const area = linha + "L" + sx(X1).toFixed(1) + " " + sy(0) + "L" + sx(X0).toFixed(1) + " " + sy(0) + "Z";
    svgEl.appendChild(svg("path", { d: area, fill: "#ececec" }));

    // faixa mu ± ks·sigma
    const a = mu - ks * sigma, b = mu + ks * sigma;
    if (ks > 0) {
      let faixa = "M" + sx(a).toFixed(1) + " " + sy(0);
      for (let x = a; x < b; x += 2.5) faixa += "L" + sx(x).toFixed(1) + " " + sy(E.densidade(x, mu, sigma)).toFixed(1);
      faixa += "L" + sx(b).toFixed(1) + " " + sy(E.densidade(b, mu, sigma)).toFixed(1) + "L" + sx(b).toFixed(1) + " " + sy(0) + "Z";
      svgEl.appendChild(svg("path", { d: faixa, fill: "#c4c4c4" }));
    }
    svgEl.appendChild(svg("path", { d: linha, fill: "none", stroke: "#111", "stroke-width": 1.8, "stroke-linejoin": "round" }));
    svgEl.appendChild(svg("line", { x1: Lm, x2: W - Rm, y1: sy(0), y2: sy(0), stroke: "#111", "stroke-width": 1.2 }));

    // eixo em R$
    for (let x = 0; x <= 500; x += 100) {
      svgEl.appendChild(svg("line", { x1: sx(x), x2: sx(x), y1: sy(0), y2: sy(0) + 5, stroke: "#111" }));
      svgEl.appendChild(svg("text", { x: sx(x), y: sy(0) + 22, "text-anchor": "middle", "font-size": 14, fill: "#6b6b6b", "font-family": FONTE }, String(x)));
    }
    // segunda linha: escore Z de cada ponto (mu + Z·sigma)
    for (let kz = -4; kz <= 5; kz++) {
      const xz = mu + kz * sigma;
      if (xz < X0 || xz > X1) continue;
      svgEl.appendChild(svg("text", { x: sx(xz), y: sy(0) + 42, "text-anchor": "middle", "font-size": 14, "font-style": "italic", fill: "#6b6b6b", "font-family": FONTE },
        (kz < 0 ? "−" : "") + Math.abs(kz)));
    }
    svgEl.appendChild(svg("text", { x: W - Rm, y: sy(0) + 42, "text-anchor": "end", "font-size": 14, "font-style": "italic", fill: "#111", "font-family": FONTE }, "Z"));
    svgEl.appendChild(svg("text", { x: W / 2, y: H - 4, "text-anchor": "middle", "font-size": 16, "font-style": "italic", fill: "#111", "font-family": FONTE }, "gasto mensal x (R$)"));

    // limites da faixa
    if (ks > 0) {
      [[a, "μ − " + ks + "σ"], [b, "μ + " + ks + "σ"]].forEach(function (e) {
        svgEl.appendChild(svg("line", { x1: sx(e[0]), x2: sx(e[0]), y1: sy(E.densidade(e[0], mu, sigma)), y2: sy(0) + 28, stroke: "#111", "stroke-width": 1 }));
        svgEl.appendChild(svg("text", { x: sx(e[0]), y: sy(0) + 66, "text-anchor": "middle", "font-size": 15, fill: "#111", "font-family": FONTE },
          e[1] + " = " + nf(2).format(e[0])));
      });
    }

    // média (tracejada) e limite L (sólida)
    svgEl.appendChild(svg("line", { x1: sx(mu), x2: sx(mu), y1: T - 6, y2: sy(0), stroke: "#6b6b6b", "stroke-width": 1.2, "stroke-dasharray": "4 4" }));
    svgEl.appendChild(svg("line", { x1: sx(L), x2: sx(L), y1: T - 6, y2: sy(0), stroke: "#111", "stroke-width": 2 }));
    const direita = L >= mu;
    svgEl.appendChild(svg("text", { x: sx(mu) + (direita ? -6 : 6), y: T - 12, "text-anchor": direita ? "end" : "start", "font-size": 15, "font-style": "italic", fill: "#6b6b6b", "font-family": FONTE }, "μ = " + nf(2).format(mu)));

    // rótulo de L com o seu Z; vai para o outro lado da linha se não couber
    const zL = E.escoreZ(L, mu, sigma);
    const txtL = "L = " + nInt.format(L), txtZ = "Z = " + nf(2).format(zL).replace("-", "−");
    const largura = 8.5 * Math.max(txtL.length, txtZ.length), xL = sx(L);
    let lado = direita ? 1 : -1;
    if (lado === 1 && xL + 6 + largura > W - 4) lado = -1;
    else if (lado === -1 && xL - 6 - largura < 4) lado = 1;
    [[txtL, T - 30], [txtZ, T - 12]].forEach(function (r) {
      svgEl.appendChild(svg("text", { x: xL + lado * 6, y: r[1], "text-anchor": lado === 1 ? "start" : "end", "font-size": 15, "font-style": "italic", fill: "#111", "font-weight": 600, "font-family": FONTE }, r[0]));
    });

    $("normal-cap").textContent = "Curva normal com μ = R$ " + nf(2).format(mu) + " e σ = R$ " + nf(2).format(sigma) +
      ". A linha tracejada marca a média e a linha escura marca o limite L = R$ " + nInt.format(L) +
      ". A linha de números em itálico sob o eixo é o escore Z: quantos desvios padrão cada ponto está da média.";

    $("sigma-txt").textContent = ks === 0
      ? "Gire o seletor para destacar o intervalo de 1, 2 ou 3 desvios padrão em torno da média."
      : "O intervalo μ ± " + ks + "σ vai de R$ " + nf(2).format(a) + " a R$ " + nf(2).format(b) +
        " e abrange cerca de " + nf(2).format(E.areaIntervalo(ks) * 100) + "% da área sob a curva.";
  }

  /** Escore Z do limite L: fórmula com os valores e frase "x desvios padrão acima/abaixo". */
  function desenharZ(ctx, L) {
    const { mu, sigma } = ctx;
    const z = E.escoreZ(L, mu, sigma), dif = L - mu;
    const zT = tc(nf(2).format(z)), muT = tc(nf(2).format(mu)), sT = tc(nf(2).format(sigma));
    formula($("z-formula"), "Z=\\frac{L-\\mu}{\\sigma}=\\frac{" + L + "-" + muT + "}{" + sT + "}=" + zT, true);
    ajustarLargura($("z-formula"), 23);

    const az = nf(2).format(Math.abs(z)), el = $("z-txt");
    if (Math.abs(z) < 0.005) {
      el.innerHTML = "O limite <em>L</em> = R$ " + nInt.format(L) + " coincide com a média.";
      return;
    }
    const plural = az === "1,00" ? "desvio padrão" : "desvios padrão";
    el.innerHTML = "O limite <em>L</em> = R$ " + nInt.format(L) + " está <strong>" + az + " " + plural + " " +
      (z > 0 ? "acima" : "abaixo") + "</strong> da média, ou seja, R$ " + nf(2).format(Math.abs(dif)) +
      (z > 0 ? " acima" : " abaixo") + " de <em>μ</em>.";
  }

  S.normal = { desenharCurva, desenharZ };
})(window);

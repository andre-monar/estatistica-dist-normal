/**
 * Seção 4: área acumulada Φ(z). a e b são gastos em R$, convertidos para Z.
 *   P(X > a)     = 1 - Φ(Z_a)
 *   P(a < X < b) = Φ(Z_b) - Φ(Z_a)
 */
(function (raiz) {
  "use strict";
  const { $, criarSvg: svg, formula, ajustarLargura } = raiz.Componentes;
  const E = raiz.Estatistica;
  const { nf, inteiro: nInt, tc, r2, f4, pct2, sinal } = E.fmt;
  const S = (raiz.Secoes = raiz.Secoes || {});
  const FONTE = "EB Garamond, serif";

  S.phi = {
    /** pObs = proporção observada nos dados (para a comparação final). */
    desenhar(ctx, L, pObs) {
      const { mu, sigma } = ctx;
      const { a, b } = ctx.estado;
      const temIntervalo = b > a;

      // reais -> Z (arredondado a 2 casas, como numa tabela) -> probabilidades
      const zA = r2(E.escoreZ(a, mu, sigma)), zB = r2(E.escoreZ(b, mu, sigma));
      const pa = E.Phi(zA), pb = E.Phi(zB);              // Φ(Z_a) e Φ(Z_b), só para mostrar nas contas
      const cauda = E.probMaior(zA);                     // P(X > a)     = 1 - Φ(Z_a)
      const inter = temIntervalo ? E.probEntre(zA, zB) : null;   // P(a < X < b) = Φ(Z_b) - Φ(Z_a)

      // ---- gráfico: curva normal padrão, com linhas de Z e de R$ sob o eixo ----
      const svgEl = $("phi-chart");
      const W = 640, H = 270, Lm = 40, Rm = 16, T = 54, Bm = 70, iw = W - Lm - Rm, ih = H - T - Bm;
      const ZLO = -5.25, ZHI = 5.25;
      const sx = (z) => Lm + ((z - ZLO) / (ZHI - ZLO)) * iw;
      const ymax = E.densidadePadrao(0) * 1.1;
      const sy = (d) => T + ih - (d / ymax) * ih;
      const zlA = E.escoreZ(a, mu, sigma), zlB = E.escoreZ(b, mu, sigma);
      svgEl.textContent = "";

      function regiao(x0, x1, cor) {
        if (x1 <= x0) return;
        let d = "M" + sx(x0).toFixed(1) + " " + sy(0);
        for (let x = x0; x < x1; x += 0.02) d += "L" + sx(x).toFixed(1) + " " + sy(E.densidadePadrao(x)).toFixed(1);
        d += "L" + sx(x1).toFixed(1) + " " + sy(E.densidadePadrao(x1)).toFixed(1) + "L" + sx(x1).toFixed(1) + " " + sy(0) + "Z";
        svgEl.appendChild(svg("path", { d, fill: cor }));
      }
      regiao(zlA, ZHI, "#e0e0e0");                       // cauda: X > a
      if (temIntervalo) regiao(zlA, zlB, "#a6a6a6");     // intervalo: a < X < b

      let linha = "";
      for (let x = ZLO; x <= ZHI + 0.0001; x += 0.02) linha += (x === ZLO ? "M" : "L") + sx(x).toFixed(1) + " " + sy(E.densidadePadrao(x)).toFixed(1);
      svgEl.appendChild(svg("path", { d: linha, fill: "none", stroke: "#111", "stroke-width": 1.8, "stroke-linejoin": "round" }));
      svgEl.appendChild(svg("line", { x1: Lm, x2: W - Rm, y1: sy(0), y2: sy(0), stroke: "#111", "stroke-width": 1.2 }));

      for (let t = -5; t <= 5; t++) {
        svgEl.appendChild(svg("line", { x1: sx(t), x2: sx(t), y1: sy(0), y2: sy(0) + 5, stroke: "#111" }));
        svgEl.appendChild(svg("text", { x: sx(t), y: sy(0) + 22, "text-anchor": "middle", "font-size": 14, "font-style": "italic", fill: "#6b6b6b", "font-family": FONTE }, (t < 0 ? "−" : "") + Math.abs(t)));
        svgEl.appendChild(svg("text", { x: sx(t), y: sy(0) + 42, "text-anchor": "middle", "font-size": 14, fill: "#6b6b6b", "font-family": FONTE }, String(Math.max(0, Math.round(mu + t * sigma)))));
      }
      svgEl.appendChild(svg("text", { x: Lm - 8, y: sy(0) + 22, "text-anchor": "end", "font-size": 14, "font-style": "italic", fill: "#111", "font-family": FONTE }, "Z"));
      svgEl.appendChild(svg("text", { x: Lm - 8, y: sy(0) + 42, "text-anchor": "end", "font-size": 14, "font-style": "italic", fill: "#111", "font-family": FONTE }, "R$"));

      // marcas de a e b, com o gasto em R$ e o Z; trocam de lado se não couberem
      function rotulo(z, l1, l2, lado) {
        const xp = sx(z), largura = 8.5 * Math.max(l1.length, l2.length);
        if (lado === 1 && xp + 6 + largura > W - 4) lado = -1;
        else if (lado === -1 && xp - 6 - largura < 4) lado = 1;
        svgEl.appendChild(svg("line", { x1: xp, x2: xp, y1: T - 38, y2: sy(0), stroke: "#111", "stroke-width": 1.6 }));
        [[l1, T - 30], [l2, T - 12]].forEach(function (r) {
          svgEl.appendChild(svg("text", { x: xp + lado * 6, y: r[1], "text-anchor": lado === 1 ? "start" : "end", "font-size": 15, "font-style": "italic", fill: "#111", "font-family": FONTE }, r[0]));
        });
      }
      const aEsq = b >= a;                                // a à esquerda da sua linha, b à direita
      rotulo(zlA, "a = R$ " + nInt.format(a), "Z = " + sinal(zA), aEsq ? -1 : 1);
      rotulo(zlB, "b = R$ " + nInt.format(b), "Z = " + sinal(zB), aEsq ? 1 : -1);
      $("phi-cap").textContent = "Curva normal padrão (μ = 0, σ = 1). A linha Z mostra o escore e a linha R$ mostra o gasto correspondente (μ + Z·σ). Cinza claro: X > a. Cinza escuro: a < X < b.";

      // ---- contas ----
      const muT = tc(nf(2).format(mu)), sT = tc(nf(2).format(sigma));
      const zaT = tc(nf(2).format(zA)), zbT = tc(nf(2).format(zB));
      const linhas = [
        "Z_a=\\frac{" + a + "-" + muT + "}{" + sT + "}=" + zaT + "\\qquad Z_b=\\frac{" + b + "-" + muT + "}{" + sT + "}=" + zbT,
        "P(X>" + a + ")=1-\\Phi(" + zaT + ")=1-" + f4(pa) + "=" + f4(cauda),
        temIntervalo
          ? "P(" + a + "<X<" + b + ")=\\Phi(" + zbT + ")-\\Phi(" + zaT + ")=" + f4(pb) + "-" + f4(pa) + "=" + f4(inter)
          : "P(a<X<b)\\;\\text{exige } b>a"
      ];
      formula($("phi-res"), "\\begin{gathered}" + linhas.join("\\\\[6pt]") + "\\end{gathered}", true);
      ajustarLargura($("phi-res"), 23);

      $("phi-txt").innerHTML =
        "<span class=\"ln\">P(X &gt; R$ " + nInt.format(a) + ") = " + pct2(cauda) + " da área.</span>" +
        "<span class=\"ln\">" + (temIntervalo
          ? "P(R$ " + nInt.format(a) + " &lt; X &lt; R$ " + nInt.format(b) + ") = " + pct2(inter) + " da área."
          : "Para a probabilidade entre a e b, escolha b maior que a.") + "</span>";

      const zL = E.escoreZ(L, mu, sigma);
      $("phi-ref").textContent = "Comparação com os dados: o Z do limite L = R$ " + nInt.format(L) + " é " + nf(2).format(zL) +
        ", e 1 − Φ(" + nf(2).format(zL) + ") = " + pct2(E.probMaior(zL)) +
        ". A proporção observada de clientes com gasto acima de L é p = " + pct2(pObs) + ".";
    }
  };
})(window);

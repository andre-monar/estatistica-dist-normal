/**
 * Formatação de números e textos (pt-BR e notação TeX).
 * Funções puras (sem DOM). Fica em Estatistica.fmt.
 */
(function (raiz) {
  "use strict";
  const E = (raiz.Estatistica = raiz.Estatistica || {});
  const F = (E.fmt = {});
  const LN10 = Math.LN10;
  const LN_1EM4 = Math.log(1e-4);

  const cache = {};
  /** Formatador com d casas decimais, no padrão brasileiro (vírgula decimal). */
  F.nf = function (d) {
    return cache[d] || (cache[d] = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }));
  };
  /** Formatador de inteiros com separador de milhar. */
  F.inteiro = new Intl.NumberFormat("pt-BR");

  /** Troca a vírgula decimal por {,}, que o TeX não trata como separador de lista. */
  F.tc = function (s) { return s.replace(/,/g, "{,}"); };

  F.r2 = function (x) { return Math.round(x * 100) / 100; };
  F.r4 = function (x) { return Math.round(x * 10000) / 10000; };
  F.f4 = function (x) { return F.tc(F.nf(4).format(x)); };
  F.pct2 = function (x) { return F.nf(2).format(x * 100) + "%"; };
  /** Número com 2 casas e sinal de menos tipográfico. */
  F.sinal = function (z) { return F.nf(2).format(z).replace("-", "−"); };

  /** Notação científica em TeX a partir do log10 do valor: 3,2 x 10^-5. */
  F.sciDeLog10 = function (l10, d) {
    let e = Math.floor(l10);
    const m = Math.pow(10, l10 - e);
    let s = m.toFixed(d);
    if (parseFloat(s) >= 10) { e += 1; s = (m / 10).toFixed(d); }
    return s.replace(".", "{,}") + "\\times 10^{" + e + "}";
  };

  const SUP = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  /** Expoente em caracteres sobrescritos (para texto comum, não TeX). */
  F.sup = function (e) { return String(e).split("").map((c) => SUP[c]).join(""); };

  /** Probabilidade (dado o seu log) em TeX: decimal, ou científica se for muito pequena. */
  F.probTex = function (lp) {
    if (lp === -Infinity) return "0";
    if (lp > LN_1EM4) return F.tc(F.nf(6).format(Math.exp(lp)));
    return F.sciDeLog10(lp / LN10, 3);
  };

  /** Probabilidade (dado o seu log) como texto percentual. */
  F.pctTexto = function (lp) {
    if (lp === -Infinity) return "0%";
    if (lp > LN_1EM4) return F.nf(2).format(Math.exp(lp) * 100) + "%";
    const l = lp / LN10 + 2;
    let e = Math.floor(l);
    const m = Math.pow(10, l - e);
    let s = m.toFixed(2);
    if (parseFloat(s) >= 10) { e += 1; s = (m / 10).toFixed(2); }
    return s.replace(".", ",") + " × 10" + F.sup(e) + "%";
  };

  /** Coeficiente binomial C(n, k) em TeX: exato se pequeno, científico se grande. */
  F.combTex = function (n, k) {
    const lc = E.logComb(n, k);
    if (lc < 33) return String(Math.round(Math.exp(lc)));   // pequeno: desfaz o log e arredonda para o inteiro
    return F.sciDeLog10(lc / LN10, 3);
  };
})(typeof window !== "undefined" ? window : globalThis);

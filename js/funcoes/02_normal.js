/**
 * Distribuição normal: densidade f(x; mu, sigma) e área acumulada Φ(z).
 * Funções puras (sem DOM).
 *
 * O JavaScript não tem a função erro (erf) pronta, então ela é calculada aqui:
 * série de Taylor para |x| pequeno e fração contínua nas caudas.
 */
(function (raiz) {
  "use strict";
  const E = (raiz.Estatistica = raiz.Estatistica || {});

  /** erf(x) pela série de Taylor (boa para |x| < 2,5). */
  function erfSerie(x) {
    const x2 = x * x;
    let termo = x, soma = x;
    for (let n = 1; n < 200; n++) {
      termo *= -x2 / n;
      const d = termo / (2 * n + 1);
      soma += d;
      if (Math.abs(d) < 1e-17 * Math.abs(soma)) break;
    }
    return (2 / Math.sqrt(Math.PI)) * soma;
  }

  /** erfc(x) por fração contínua (precisa nas caudas, x >= 2,5). */
  function erfcFracao(x) {
    let t = x;
    for (let k = 60; k >= 1; k--) t = x + k / 2 / t;
    return Math.exp(-x * x) / (Math.sqrt(Math.PI) * t);
  }

  /** erfc(x) = 1 - erf(x). */
  E.erfc = function (x) {
    if (x >= 2.5) return erfcFracao(x);
    if (x <= -2.5) return 2 - erfcFracao(-x);
    return 1 - erfSerie(x);
  };

  /** Φ(z): área acumulada da normal padrão de -infinito até z, P(Z <= z). */
  E.Phi = function (z) {
    return 0.5 * E.erfc(-z / Math.SQRT2);
  };

  /**
   * Densidade normal:
   * f(x; mu, sigma) = 1 / (sigma * raiz(2*pi)) * exp(-1/2 * ((x - mu) / sigma)^2)
   * O termo antes do exp é a constante de normalização (área total = 1).
   */
  E.densidade = function (x, mu, sigma) {
    const z = (x - mu) / sigma;
    return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
  };

  /** Densidade da normal padrão (mu = 0, sigma = 1). */
  E.densidadePadrao = function (z) {
    return E.densidade(z, 0, 1);
  };

  /** P(Z > z) = 1 - Φ(z). Calculada como Φ(-z) para não perder precisão nas caudas. */
  E.probMaior = function (z) {
    return E.Phi(-z);
  };

  /** P(a < Z < b) = Φ(b) - Φ(a). */
  E.probEntre = function (a, b) {
    return E.Phi(b) - E.Phi(a);
  };

  /** Área da normal em mu ± k·sigma (regra 68-95-99,7): 2·Φ(k) - 1. */
  E.areaIntervalo = function (k) {
    return 2 * E.Phi(k) - 1;
  };
})(typeof window !== "undefined" ? window : globalThis);

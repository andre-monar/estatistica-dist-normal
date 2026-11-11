/**
 * Estatística descritiva: média, desvio padrão, escore Z e erro padrão.
 * Funções puras: não tocam na página (sem DOM), então rodam também no Node.
 * Espelha 04_media_desvio.py.
 */
(function (raiz) {
  "use strict";
  const E = (raiz.Estatistica = raiz.Estatistica || {});

  /** Média aritmética: soma dos valores dividida por n. */
  E.media = function (valores) {
    let soma = 0;
    for (const v of valores) soma += v;
    return soma / valores.length;
  };

  /**
   * Desvio padrão.
   * amostral = true  -> divide por (n - 1)  (padrão)
   * amostral = false -> divide por n        (populacional)
   */
  E.desvioPadrao = function (valores, amostral = true) {
    const n = valores.length;
    const m = E.media(valores);
    let somaQuadrados = 0;
    for (const v of valores) somaQuadrados += (v - m) ** 2;
    return Math.sqrt(somaQuadrados / (amostral ? n - 1 : n));
  };

  /** Z = (x - mu) / sigma: quantos desvios padrão x está da média. */
  E.escoreZ = function (x, mu, sigma) {
    return (x - mu) / sigma;
  };

  /** Erro padrão da média amostral: sigma / raiz(n). */
  E.erroPadrao = function (sigma, n) {
    return sigma / Math.sqrt(n);
  };

  /** Critério de sucesso "valor > limite": conta quantos valores são maiores que o limite. */
  E.contarAcima = function (valores, limite) {
    let sucessos = 0;
    for (const v of valores) if (v > limite) sucessos++;
    return sucessos;
  };
})(typeof window !== "undefined" ? window : globalThis);

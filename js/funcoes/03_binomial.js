/**
 * Lei binomial: P(X = k) = n! / (k! (n-k)!) * p^k * (1-p)^(n-k)
 * Funções puras (sem DOM). Espelha 02_binomial.py.
 *
 * Tudo é calculado em logaritmo (log de P) para n grande não estourar:
 * 10000! não cabe em um número, mas o seu logaritmo cabe.
 */
(function (raiz) {
  "use strict";
  const E = (raiz.Estatistica = raiz.Estatistica || {});

  /** log do coeficiente binomial C(n, k), somando logaritmos de fatores. */
  E.logComb = function (n, k) {
    k = Math.min(k, n - k);
    let soma = 0;
    for (let i = 1; i <= k; i++) soma += Math.log(n - k + i) - Math.log(i);
    return soma;
  };

  /** log de P(X = k). Devolve -Infinity quando a probabilidade é 0. */
  E.logBinomial = function (n, k, p) {
    if (p <= 0) return k === 0 ? 0 : -Infinity;
    if (p >= 1) return k === n ? 0 : -Infinity;
    return E.logComb(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p);
  };

  /** P(X = k). */
  E.binomial = function (n, k, p) {
    return Math.exp(E.logBinomial(n, k, p));
  };

  /**
   * log de P(X = i) para todo i de 0 a n de uma vez, por recorrência:
   * P(i+1) / P(i) = (n - i) / (i + 1) * p / (1 - p)
   * Custa O(n), em vez de O(n^2) se calculássemos um por um.
   */
  E.logPmf = function (n, p) {
    const lp = new Float64Array(n + 1);
    if (p <= 0) { for (let i = 0; i <= n; i++) lp[i] = i === 0 ? 0 : -Infinity; return lp; }
    if (p >= 1) { for (let i = 0; i <= n; i++) lp[i] = i === n ? 0 : -Infinity; return lp; }
    const razao = Math.log(p / (1 - p));
    lp[0] = n * Math.log(1 - p);
    for (let i = 0; i < n; i++) lp[i + 1] = lp[i] + Math.log((n - i) / (i + 1)) + razao;
    return lp;
  };
})(typeof window !== "undefined" ? window : globalThis);

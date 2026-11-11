/**
 * Amostragem: sorteio de grupos para ilustrar o Teorema do Limite Central.
 * Função pura (sem DOM).
 */
(function (raiz) {
  "use strict";
  const E = (raiz.Estatistica = raiz.Estatistica || {});

  /**
   * Sorteia `quantidade` grupos de `n` clientes, COM reposição (cada sorteio é
   * independente: o mesmo cliente pode aparecer duas vezes no grupo), e devolve
   * a média de cada grupo.
   */
  E.sortearMedias = function (valores, n, quantidade) {
    const medias = new Float64Array(quantidade);
    const total = valores.length;
    for (let i = 0; i < quantidade; i++) {
      let soma = 0;
      for (let j = 0; j < n; j++) soma += valores[(Math.random() * total) | 0];
      medias[i] = soma / n;
    }
    return medias;
  };
})(typeof window !== "undefined" ? window : globalThis);

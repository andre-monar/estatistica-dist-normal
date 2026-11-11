/**
 * Seção 1: base de dados (média e desvio padrão do gasto mensal).
 */
(function (raiz) {
  "use strict";
  const { $ } = raiz.Componentes;
  const { nf } = raiz.Estatistica.fmt;
  const S = (raiz.Secoes = raiz.Secoes || {});

  S.base = {
    preencher(ctx) {
      $("f-mu").textContent = "R$ " + nf(2).format(ctx.mu);
      $("f-sigma").textContent = "R$ " + nf(2).format(ctx.sigma);
    }
  };
})(window);

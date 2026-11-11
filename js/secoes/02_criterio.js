/**
 * Seções 2 e 3 (tabela): critério de sucesso "gasto > L" e contagem de
 * sucessos e fracassos.
 */
(function (raiz) {
  "use strict";
  const { $, formula } = raiz.Componentes;
  const E = raiz.Estatistica;
  const { nf, inteiro: nInt } = E.fmt;
  const S = (raiz.Secoes = raiz.Secoes || {});

  S.criterio = {
    /** Desenha o critério e a tabela. Devolve { sucessos, fracassos, p, q } para as outras seções. */
    desenhar(ctx, L) {
      const sucessos = E.contarAcima(ctx.dados, L);
      const fracassos = ctx.N - sucessos;
      const p = sucessos / ctx.N;
      const q = 1 - p;

      formula($("criterio"), "\\text{sucesso: } G>" + L + " \\qquad\\qquad \\text{fracasso: } G\\le " + L, true);

      $("t-s").textContent = nInt.format(sucessos);
      $("t-f").textContent = nInt.format(fracassos);
      $("t-n").textContent = nInt.format(ctx.N);
      $("t-ps").textContent = nf(4).format(p) + " = " + nf(2).format(p * 100) + "%";
      $("t-pf").textContent = nf(4).format(q) + " = " + nf(2).format(q * 100) + "%";

      return { sucessos, fracassos, p, q };
    }
  };
})(window);

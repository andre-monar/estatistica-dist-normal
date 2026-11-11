/**
 * Fórmulas na página (KaTeX) e ajuste de tamanho para caber na largura.
 */
(function (raiz) {
  "use strict";
  const C = (raiz.Componentes = raiz.Componentes || {});

  /** Desenha uma fórmula TeX dentro do elemento. Se o KaTeX não carregou, mostra o texto cru. */
  C.formula = function (el, tex, emBloco) {
    if (raiz.katex) {
      try {
        raiz.katex.render(tex, el, { displayMode: !!emBloco, throwOnError: false });
        return;
      } catch (e) { /* cai no texto cru */ }
    }
    el.textContent = tex;
  };

  /** Encolhe o texto (em px) até caber na largura do elemento, sem barra de rolagem. */
  C.ajustarLargura = function (el, tamanhoBasePx) {
    el.style.fontSize = tamanhoBasePx + "px";
    const disponivel = el.clientWidth;
    const necessario = el.scrollWidth;
    if (disponivel > 0 && necessario > disponivel) {
      el.style.fontSize = Math.max(11, Math.floor((tamanhoBasePx * disponivel) / necessario * 0.97)) + "px";
    }
  };
})(window);

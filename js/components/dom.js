/**
 * Utilitários de DOM usados por todos os outros arquivos da tela.
 */
(function (raiz) {
  "use strict";
  const C = (raiz.Componentes = raiz.Componentes || {});

  /** Atalho para document.getElementById. */
  C.$ = function (id) {
    return document.getElementById(id);
  };

  /** Cria um elemento SVG com os atributos (e texto) indicados. */
  C.criarSvg = function (tag, atributos, texto) {
    const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const nome in atributos) e.setAttribute(nome, atributos[nome]);
    if (texto != null) e.textContent = texto;
    return e;
  };
})(window);

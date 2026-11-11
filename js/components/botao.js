/**
 * Botões da página.
 */
(function (raiz) {
  "use strict";
  const C = (raiz.Componentes = raiz.Componentes || {});

  /** Botão que executa uma ação ao ser clicado. */
  C.botaoAcao = function (botao, aoClicar) {
    botao.addEventListener("click", aoClicar);
  };

  /**
   * Botão que abre e fecha um bloco (por exemplo, as contas).
   * Atualiza o texto do botão e o atributo aria-expanded (para leitores de tela).
   */
  C.botaoAlternar = function ({ botao, alvo, textoAberto, textoFechado, aoAbrir }) {
    botao.addEventListener("click", function () {
      const abrir = botao.getAttribute("aria-expanded") !== "true";
      botao.setAttribute("aria-expanded", String(abrir));
      botao.textContent = abrir ? textoAberto : textoFechado;
      alvo.hidden = !abrir;
      if (abrir && aoAbrir) aoAbrir();
    });
  };
})(window);

/**
 * Fórmulas fixas da página (não dependem das roletas).
 */
(function (raiz) {
  "use strict";
  const { $, formula } = raiz.Componentes;
  const S = (raiz.Secoes = raiz.Secoes || {});
  

  S.formulas = {
    renderizar() {
      formula($("hero-math"), "P(X=k)=\\binom{n}{k}\\,p^{k}(1-p)^{n-k}", false);
      formula($("formula"), "P(X=k)=\\frac{n!}{k!\\,(n-k)!}\\;p^{k}\\,(1-p)^{n-k}", true);
      formula($("phi-def"), "\\Phi(z)=P(Z\\le z)=\\int_{-\\infty}^{z}\\frac{1}{\\sqrt{2\\pi}}\\,e^{-t^{2}/2}\\,dt", true);
      formula($("phi-forms"),
        "\\begin{gathered}Z_a=\\frac{a-\\mu}{\\sigma}\\qquad Z_b=\\frac{b-\\mu}{\\sigma}\\\\[8pt]" +
        "P(X>a)=1-\\Phi(Z_a)\\\\[6pt]P(a<X<b)=\\Phi(Z_b)-\\Phi(Z_a)\\end{gathered}", true);
      formula($("normal-formula"),
        "f(x;\\mu,\\sigma)=\\underbrace{\\frac{1}{\\sigma\\sqrt{2\\pi}}}_{\\text{constante de normalização}}" +
        "\\;e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^{2}}", true);
      formula($("tlc-def"), "\\bar{X}\\sim N\\!\\left(\\mu,\\ \\sigma_{\\bar{x}}\\right)", true);
    }
  };
})(window);

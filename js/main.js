/**
 * Ponto de entrada: junta os dados, o estado das roletas e as seções.
 *
 *   js/funcoes/     cálculos puros (média, normal, binomial...), sem tela
 *   js/components/  roleta, botões, fórmulas (peças reutilizáveis da tela)
 *   js/secoes/      desenho de cada seção da página
 *   js/main.js      este arquivo: liga tudo
 */
(function () {
  "use strict";
  const { $, Roleta, botaoAcao, botaoAlternar } = window.Componentes;
  const E = window.Estatistica;
  const S = window.Secoes;

  // ---- dados (data/gastos.js, gerado a partir do CSV) ----
  const dados = window.GASTOS || [];
  if (!dados.length) {
    const aviso = document.createElement("div");
    aviso.className = "erro";
    aviso.innerHTML = "Não encontrei <code>data/gastos.js</code>. Confira se a pasta <code>data</code> está junto do <code>index.html</code> e recarregue a página.";
    document.querySelector("main").insertBefore(aviso, document.querySelector("header").nextSibling);
    return;
  }

  // ---- contexto compartilhado pelas seções ----
  const ctx = {
    dados,
    N: dados.length,
    mu: E.media(dados),
    sigma: E.desvioPadrao(dados),          // amostral (n - 1)
    estado: {
      L: 300,          // limite de sucesso (R$)
      n: 20, k: 3,     // binomial: ensaios e sucessos
      s: 0,            // intervalo mu ± s·sigma (0 = nenhum)
      a: 300, b: 350,  // limites de Φ (R$)
      ng: 30, ag: 260  // TLC: tamanho do grupo e valor da média (R$)
    }
  };
  const est = ctx.estado;

  // ---- redesenho: várias roletas mudando ao mesmo tempo viram um só desenho por quadro ----
  let agendado = false;
  function agendar() {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(function () { agendado = false; atualizar(); });
  }

  function atualizar() {
    const { p, q } = S.criterio.desenhar(ctx, est.L);
    S.normal.desenharCurva(ctx, est.L, est.s);
    S.normal.desenharZ(ctx, est.L);
    S.phi.desenhar(ctx, est.L, p);
    S.tlc.desenhar(ctx);
    S.binomial.desenhar(ctx, est.L, p, q);
  }

  // ---- textos fixos ----
  S.formulas.renderizar();
  S.base.preencher(ctx);

  // ---- roletas ----
  Roleta($("w-limite"), { id: "limite-input", max: 500, value: est.L, onChange: (v) => { est.L = v; agendar(); } });

  let roletaK;
  Roleta($("w-n"), { id: "n-input", max: 10000, value: est.n, onChange: (v) => {
    est.n = v;
    if (roletaK) roletaK.setMax(v);        // k nunca passa de n
    agendar();
  } });
  roletaK = Roleta($("w-k"), { id: "k-input", max: est.n, value: est.k, onChange: (v) => { est.k = v; agendar(); } });

  Roleta($("w-sigma"), {
    id: "sigma-input", max: 3, value: est.s, item: 36, width: 100,
    format: (v) => (v === 0 ? "–" : String(v)),
    onChange: (v) => { est.s = v; agendar(); }
  });

  const roletaA = Roleta($("w-a"), { id: "a-input", max: 500, value: est.a, item: 36, width: 110, onChange: (v) => { est.a = v; agendar(); } });
  Roleta($("w-b"), { id: "b-input", max: 500, value: est.b, item: 36, width: 110, onChange: (v) => { est.b = v; agendar(); } });

  // tamanho do grupo: 1 a N (a roleta guarda o índice 0..N-1)
  Roleta($("w-ng"), {
    id: "ng-input", max: ctx.N - 1, value: est.ng - 1, item: 36, width: 110,
    format: (v) => String(v + 1),
    parse: (texto) => {
      const s = texto.trim();
      if (!/^\d+$/.test(s)) return null;
      const v = parseInt(s, 10);
      return v < 1 ? null : Math.min(v, ctx.N) - 1;
    },
    onChange: (v) => { est.ng = v + 1; S.tlc.invalidar(); agendar(); }
  });
  Roleta($("w-ag"), { id: "ag-input", max: 500, value: est.ag, item: 36, width: 110, onChange: (v) => { est.ag = v; agendar(); } });

  // ---- botões ----
  botaoAcao($("usar-z"), () => roletaA.set(est.L));
  botaoAcao($("sortear"), () => S.tlc.sortear(ctx, agendar));
  botaoAlternar({
    botao: $("toggle-contas"), alvo: $("phi-res"),
    textoAberto: "ocultar as contas", textoFechado: "mostrar as contas",
    aoAbrir: agendar                       // reajusta o tamanho da fórmula ao reabrir
  });

  // ---- primeiro desenho ----
  S.tlc.sortear(ctx, agendar);
  atualizar();
  window.addEventListener("load", agendar);
  window.addEventListener("resize", agendar);
})();

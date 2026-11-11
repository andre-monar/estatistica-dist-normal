/**
 * Teste de fumaça da página: carrega os scripts na ordem do index.html com um
 * DOM de mentira e desenha cada seção em vários estados, procurando erros de
 * referência e valores NaN/undefined/Infinity nos textos e atributos gerados.
 * Uso: node tests/smoke_pagina.js
 */
const path = require("path");
const raiz = path.join(__dirname, "..");

// ---- DOM de mentira ----
const todos = [];
function criarEl(id) {
  const t = { id, style: { setProperty() {} }, classList: { add() {}, remove() {} }, clientWidth: 600, scrollWidth: 300,
    textContent: "", innerHTML: "", value: "", hidden: false, attrs: {}, filhos: [], nome: id };
  const el = new Proxy(t, {
    get(o, p) {
      if (p in o) return o[p];
      if (p === "setAttribute") return (k, v) => { o.attrs[k] = v; };
      if (p === "getAttribute") return (k) => o.attrs[k];
      if (p === "appendChild") return (f) => { o.filhos.push(f); return f; };
      return () => {};
    },
    set(o, p, v) { o[p] = v; return true; }
  });
  todos.push(t);
  return el;
}
const porId = {};
global.window = global;
global.document = {
  getElementById: (id) => porId[id] || (porId[id] = criarEl(id)),
  createElement: () => criarEl("(novo)"),
  createElementNS: () => criarEl("(svg)"),
  querySelector: () => criarEl("(qs)"),
  activeElement: null
};
global.innerWidth = 1000;
const fila = [];
global.requestAnimationFrame = (cb) => { fila.push(cb); return fila.length; };
global.cancelAnimationFrame = () => {};
global.addEventListener = () => {};

["data/gastos.js",
 "js/funcoes/01_descritiva.js", "js/funcoes/02_normal.js", "js/funcoes/03_binomial.js", "js/funcoes/04_amostragem.js", "js/funcoes/05_formatacao.js",
 "js/components/dom.js", "js/components/formula.js", "js/components/roleta.js", "js/components/botao.js",
 "js/secoes/00_formulas.js", "js/secoes/01_base.js", "js/secoes/02_criterio.js", "js/secoes/03_normal.js",
 "js/secoes/04_phi.js", "js/secoes/05_binomial.js", "js/secoes/06_tlc.js"
].forEach((f) => require(path.join(raiz, f)));

// ---- carrega o main.js (primeiro desenho) ----
require(path.join(raiz, "js/main.js"));
while (fila.length) fila.shift()(0);

// ---- desenha as seções em vários estados ----
const E = window.Estatistica, S = window.Secoes;
const dados = window.GASTOS;
function ctxCom(est) {
  return { dados, N: dados.length, mu: E.media(dados), sigma: E.desvioPadrao(dados), estado: Object.assign({ L: 300, n: 20, k: 3, s: 0, a: 300, b: 350, ng: 30, ag: 260 }, est) };
}
const casos = [
  {}, { L: 0 }, { L: 500 }, { L: 247 }, { L: 150 }, { s: 1 }, { s: 2 }, { s: 3 },
  { n: 0, k: 0 }, { n: 1, k: 1 }, { n: 10000, k: 5000 }, { n: 100, k: 100 }, { n: 20, k: 20 },
  { a: 0, b: 500 }, { a: 500, b: 0 }, { a: 300, b: 300 }, { a: 100, b: 400 },
  { ng: 1, ag: 300 }, { ng: 1200, ag: 250 }, { ng: 100, ag: 0 }, { ng: 30, ag: 500 }, { ng: 20, ag: 300 }
];
let total = 0;
for (const est of casos) {
  const ctx = ctxCom(est);
  S.tlc.sortear(ctx, () => {});
  const { p, q } = S.criterio.desenhar(ctx, ctx.estado.L);
  S.normal.desenharCurva(ctx, ctx.estado.L, ctx.estado.s);
  S.normal.desenharZ(ctx, ctx.estado.L);
  S.phi.desenhar(ctx, ctx.estado.L, p);
  S.tlc.desenhar(ctx);
  S.binomial.desenhar(ctx, ctx.estado.L, p, q);
  total++;
}

// ---- procura valores quebrados ----
const ruim = /NaN|undefined|Infinity/;
const problemas = [];
for (const t of todos) {
  for (const campo of ["textContent", "innerHTML"]) {
    if (typeof t[campo] === "string" && ruim.test(t[campo])) problemas.push(`${t.nome}.${campo}: ${t[campo].slice(0, 120)}`);
  }
  for (const k in t.attrs) if (ruim.test(String(t.attrs[k]))) problemas.push(`${t.nome}[${k}]=${t.attrs[k]}`);
}
if (problemas.length) {
  console.log("PROBLEMAS:\n" + [...new Set(problemas)].slice(0, 15).join("\n"));
  process.exit(1);
}
console.log(`página: main.js carregou e ${total} estados desenharam sem erro nem NaN/undefined`);

/**
 * Testa as funções puras (js/funcoes) contra os valores calculados em Python.
 * Uso: node tests/funcoes.test.js
 */
const assert = require("assert");
const path = require("path");

globalThis.window = globalThis;               // data/gastos.js escreve em window.GASTOS
const raiz = path.join(__dirname, "..");
require(path.join(raiz, "data/gastos.js"));
["01_descritiva", "02_normal", "03_binomial", "04_amostragem", "05_formatacao"].forEach((f) =>
  require(path.join(raiz, "js/funcoes", f + ".js")));

const E = globalThis.Estatistica;
const dados = globalThis.GASTOS;
let ok = 0;
function perto(nome, obtido, esperado, tol) {
  assert.ok(Math.abs(obtido - esperado) <= tol, `${nome}: obtido ${obtido}, esperado ${esperado}`);
  ok++;
}

// 04_media_desvio.py
assert.strictEqual(dados.length, 1200); ok++;
perto("média", E.media(dados), 247.2942, 1e-4);
perto("desvio amostral", E.desvioPadrao(dados), 49.3737, 1e-4);
perto("desvio populacional", E.desvioPadrao(dados, false), 49.3531, 1e-4);
perto("Z de 300", E.escoreZ(300, E.media(dados), E.desvioPadrao(dados)), 1.0675, 1e-4);
perto("erro padrão n=20", E.erroPadrao(E.desvioPadrao(dados), 20), 11.0403, 1e-4);
perto("erro padrão n=30", E.erroPadrao(E.desvioPadrao(dados), 30), 9.0144, 1e-4);
perto("erro padrão n=1200", E.erroPadrao(E.desvioPadrao(dados), 1200), 1.4253, 1e-4);

// 01_gasto_sucesso.py
assert.strictEqual(E.contarAcima(dados, 300), 175); ok++;

// normal
perto("Φ(0)", E.Phi(0), 0.5, 1e-15);
perto("Φ(1,07)", E.Phi(1.07), 0.8577, 5e-5);
perto("P(Z>1,07)", E.probMaior(1.07), 0.1423, 5e-5);
perto("Φ(2)", E.Phi(2), 0.9772498680518208, 1e-12);
perto("Φ(-3)", E.Phi(-3), 0.0013498980316301, 1e-12);
perto("Φ(-4)", E.Phi(-4), 3.167124183311992e-5, 1e-12);
perto("Φ(4)", E.Phi(4), 0.9999683287581669, 1e-12);
perto("área 1σ", E.areaIntervalo(1), 0.6826894921370859, 1e-12);
perto("área 2σ", E.areaIntervalo(2), 0.9544997361036416, 1e-12);
perto("área 3σ", E.areaIntervalo(3), 0.9973002039367398, 1e-12);
perto("densidade no pico", E.densidade(247.2942, 247.2942, 49.3737), 0.008080, 1e-6);
perto("P(1,07<Z<2)", E.probEntre(1.07, 2), 0.1196, 5e-5);

// binomial (02_binomial.py)
const p = 175 / 1200;
perto("binomial(10,2)", E.binomial(10, 2, p), 0.271186, 1e-6);
perto("binomial(10,0)", E.binomial(10, 0, p), 0.206741, 1e-6);
perto("binomial(20,3)", E.binomial(20, 3, p), 0.242493, 1e-6);
perto("binomial(20,20)", E.binomial(20, 20, p), 1.9e-17, 1e-18);
for (const n of [10, 20, 200]) {
  const lp = E.logPmf(n, p);
  let soma = 0;
  for (let i = 0; i <= n; i++) soma += Math.exp(lp[i]);
  perto(`soma da pmf n=${n}`, soma, 1, 1e-12);
}
assert.strictEqual(E.binomial(5, 0, 0), 1); assert.strictEqual(E.binomial(5, 5, 1), 1); ok += 2;

// amostragem: a média das médias fica perto de mu
const medias = E.sortearMedias(dados, 30, 2000);
perto("média das médias", E.media(medias), E.media(dados), 1.5);
perto("desvio das médias", E.desvioPadrao(medias), E.erroPadrao(E.desvioPadrao(dados), 30), 1.0);

// formatação
const F = E.fmt;
assert.strictEqual(F.nf(2).format(247.2942), "247,29"); ok++;
assert.strictEqual(F.tc("0,1458"), "0{,}1458"); ok++;
assert.strictEqual(F.combTex(20, 3), "1140"); ok++;
assert.strictEqual(F.combTex(10, 2), "45"); ok++;
assert.strictEqual(F.combTex(30, 10), "30045015"); ok++;
assert.strictEqual(F.combTex(50, 25), "126410606437752"); ok++;   // ~1,3e14, perto do limite de 33 no log
assert.ok(F.combTex(100, 50).includes("10^{"), "C(100,50) deve sair em notação científica"); ok++;
assert.strictEqual(F.pctTexto(Math.log(0.2425)), "24,25%"); ok++;

console.log(`${ok} verificações das funções: OK`);

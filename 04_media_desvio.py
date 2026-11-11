"""Média (mi) e desvio padrão (sigma) do gasto mensal.

São os parâmetros da distribuição normal:
    f(x; mi, sigma) = 1 / (sigma * sqrt(2*pi)) * exp(-1/2 * ((x - mi) / sigma) ** 2)

Uso: python 04_media_desvio.py
"""
import csv
import statistics
from math import erf, exp, pi, sqrt


def media(valores):
    """Média aritmética: soma dos valores dividida por n."""
    return sum(valores) / len(valores)


def desvio_padrao(valores, amostral=True):
    """Desvio padrão.

    amostral=True  -> divide por (n - 1)  (desvio padrão amostral, s)
    amostral=False -> divide por n        (desvio padrão populacional, sigma)
    """
    n = len(valores)
    m = media(valores)
    soma_quadrados = sum((x - m) ** 2 for x in valores)
    return sqrt(soma_quadrados / (n - 1 if amostral else n))


def densidade_normal(x, mi, sigma):
    """f(x; mi, sigma) = 1 / (sigma * sqrt(2*pi)) * exp(-1/2 * ((x - mi) / sigma) ** 2)

    A parte antes do exp é a constante de normalização: garante que a área
    total sob a curva seja 1.
    """
    constante = 1 / (sigma * sqrt(2 * pi))
    return constante * exp(-0.5 * ((x - mi) / sigma) ** 2)


def escore_z(x, mi, sigma):
    """Z = (x - mi) / sigma: quantos desvios padrão x está acima (+) ou abaixo (-) da média."""
    return (x - mi) / sigma


def phi(z):
    """Φ(z): área acumulada da normal padrão até z, P(Z <= z) = (1 + erf(z / sqrt(2))) / 2."""
    return 0.5 * (1 + erf(z / sqrt(2)))


def prob_maior(a):
    """P(Z > a) = 1 - Φ(a)."""
    return 1 - phi(a)


def prob_entre(a, b):
    """P(a < Z < b) = Φ(b) - Φ(a)."""
    return phi(b) - phi(a)


def erro_padrao(sigma, n):
    """Erro padrão da média amostral: sigma / sqrt(n) (Teorema do Limite Central)."""
    return sigma / sqrt(n)


def area_intervalo(k):
    """Área sob a curva normal em mi ± k·sigma (independe de mi e sigma): erf(k / sqrt(2))."""
    return erf(k / sqrt(2))


def carregar_gastos(arquivo="01_cafeterias.csv"):
    with open(arquivo, encoding="utf-8-sig", newline="") as f:
        return [float(l["gasto_mensal"]) for l in csv.DictReader(f)]


if __name__ == "__main__":
    gastos = carregar_gastos()
    mi = media(gastos)
    s = desvio_padrao(gastos, amostral=True)
    sigma = desvio_padrao(gastos, amostral=False)

    print(f"n                          : {len(gastos)}")
    print(f"media (mi)                 : {mi:.4f}")
    print(f"desvio padrao amostral  (n-1): {s:.4f}")
    print(f"desvio padrao populacional (n): {sigma:.4f}")

    # conferência com a biblioteca padrão
    assert abs(mi - statistics.mean(gastos)) < 1e-9
    assert abs(s - statistics.stdev(gastos)) < 1e-9
    assert abs(sigma - statistics.pstdev(gastos)) < 1e-9
    print("conferido com o modulo statistics: OK")

    print(f"densidade no pico f(mi)    : {densidade_normal(mi, mi, s):.6f}")
    # a área sob a curva (soma de Riemann em mi +- 6 sigma) deve dar ~1
    passo = s / 100
    area = sum(densidade_normal(mi + (i + 0.5) * passo, mi, s) * passo for i in range(-600, 600))
    print(f"area sob a curva           : {area:.6f}")

    print(f"Z do limite R$ 300      : {escore_z(300, mi, s):.4f}")

    z = escore_z(300, mi, s)
    print(f"Phi({z:.2f})                  : {phi(round(z, 2)):.4f}")
    print(f"P(Z > {z:.2f})               : {prob_maior(round(z, 2)):.4f}")
    print(f"P({z:.2f} < Z < 2,00)        : {prob_entre(round(z, 2), 2):.4f}")

    for n in (20, 30, 100, 1200):
        print(f"erro padrao (n={n:>4})       : {erro_padrao(s, n):.4f}")
    ep = erro_padrao(s, 30)
    print(f"P(x_barra > 260 | n=30)    : {prob_maior(round(escore_z(260, mi, ep), 2)):.4f}")

    for k in (1, 2, 3):
        print(f"mi +/- {k}sigma = [{mi - k * s:.2f}, {mi + k * s:.2f}]  area = {area_intervalo(k):.4%}")

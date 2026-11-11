"""Lei binomial aplicada ao gasto mensal (sucesso: gasto_mensal > R$ 300,00).

P(X = k) = n! / (k! (n-k)!) * p^k * (1-p)^(n-k)

Uso: python 02_binomial.py [n] [k]      (padrão: n=10, k=2)
"""
import csv
import sys
from math import factorial

LIMITE = 300.00
ARQUIVO = "01_cafeterias.csv"


def calcular_p(arquivo=ARQUIVO, limite=LIMITE):
    """Proporção de clientes com gasto_mensal > limite."""
    with open(arquivo, encoding="utf-8-sig", newline="") as f:
        gasto = [float(l["gasto_mensal"]) for l in csv.DictReader(f)]
    return sum(g > limite for g in gasto) / len(gasto)


def binomial(n, k, p):
    """P(X = k) para n ensaios independentes com probabilidade de sucesso p."""
    if not (isinstance(n, int) and isinstance(k, int)) or n < 0 or not 0 <= k <= n:
        raise ValueError("n e k devem ser inteiros com 0 <= k <= n")
    if not 0 <= p <= 1:
        raise ValueError("p deve estar entre 0 e 1")
    combinacoes = factorial(n) // (factorial(k) * factorial(n - k))
    return combinacoes * p**k * (1 - p) ** (n - k)


if __name__ == "__main__":
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    k = int(sys.argv[2]) if len(sys.argv) > 2 else 2
    p = calcular_p()
    prob = binomial(n, k, p)
    print(f"p = {p:.4f}  q = {1 - p:.4f}")
    print(f"n = {n}, k = {k}")
    print(f"P(X = {k}) = {prob:.6f} ({prob:.2%})")
    # conferência: a soma de P(X=0..n) deve ser 1
    print(f"soma P(X=0..{n}) = {sum(binomial(n, i, p) for i in range(n + 1)):.6f}")

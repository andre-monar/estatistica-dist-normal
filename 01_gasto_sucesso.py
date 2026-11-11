"""Gasto mensal: critério de sucesso (gasto_mensal > R$ 300,00).

Calcula a quantidade de sucessos e fracassos e as proporções p e q.
Usa só a biblioteca padrão. Uso: python 01_gasto_sucesso.py
"""
import csv

LIMITE = 300.00

with open("01_cafeterias.csv", encoding="utf-8", newline="") as f:
    gasto = [float(l["gasto_mensal"]) for l in csv.DictReader(f)]

n = len(gasto)
sucessos = sum(g > LIMITE for g in gasto)
fracassos = n - sucessos  # complementar: gasto <= 300
exatamente_300 = sum(g == LIMITE for g in gasto)

print(f"n (clientes)            : {n}")
print(f"gasto minimo / maximo   : {min(gasto):.2f} / {max(gasto):.2f}")
print(f"gasto == 300 exato      : {exatamente_300}")
print(f"sucessos  (gasto > 300) : {sucessos}  -> p = {sucessos / n:.4f} ({sucessos / n:.2%})")
print(f"fracassos (gasto <= 300): {fracassos}  -> q = {fracassos / n:.4f} ({fracassos / n:.2%})")

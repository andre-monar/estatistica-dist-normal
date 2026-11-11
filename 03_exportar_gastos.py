"""Exporta a coluna gasto_mensal do CSV para gastos.js (usado pelo index.html).

Com os valores no navegador, o limite de sucesso pode ser escolhido pelo
usuário e p = (qtd com gasto > limite) / n é recalculado na hora.

Uso: python 03_exportar_gastos.py
"""
import csv

with open("01_cafeterias.csv", encoding="utf-8-sig", newline="") as f:
    gastos = [float(l["gasto_mensal"]) for l in csv.DictReader(f)]

with open("gastos.js", "w", encoding="utf-8") as f:
    f.write("// Gerado por 03_exportar_gastos.py a partir de 01_cafeterias.csv (gasto_mensal, R$)\n")
    f.write("window.GASTOS = [" + ",".join(f"{g:.2f}" for g in gastos) + "];\n")

print(f"{len(gastos)} valores exportados para gastos.js")
